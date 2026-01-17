import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getRunsByProjectId, createRun } from "@/lib/db/runs";
import { createRunSchema } from "@/lib/validations/run";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const runs = await getRunsByProjectId(projectId, session.user.id);
    return NextResponse.json(runs);
  } catch (error) {
    console.error("Error fetching runs:", error);
    return NextResponse.json({ error: "Failed to fetch runs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRunSchema.parse(body);

    // 1. Fetch Project and App to get ARNs
    const { getProjectById } = await import("@/lib/db/projects");
    const { getAppById } = await import("@/lib/db/apps");
    const { scheduleRun } = await import("@/lib/aws/device-farm");

    const project = await getProjectById(validatedData.projectId, session.user.id);
    if (!project || !project.awsProjectArn) {
      return NextResponse.json({ error: "Project not found or not synced" }, { status: 404 });
    }

    let appArn: string | undefined;
    if (validatedData.appId) {
      const app = await getAppById(validatedData.appId, session.user.id);
      if (app?.awsUploadArn) {
        appArn = app.awsUploadArn;
      }
    }

    // 2. Schedule Run on AWS
    // For now, if no devicePoolArn is provided, we can maybe query one or let AWS use default?
    // AWS SDK usually requires devicePoolArn.
    // If user didn't select one, we might need a default.
    // Let's assume for now the frontend MUST provide it or we pick the first available "TOP_DEVICES" pool.
    // But since we don't have pool selection UI yet, let's try to list pools and pick one if missing.

    let devicePoolArn = validatedData.devicePoolArn;
    if (!devicePoolArn) {
      // Fallback: list pools and pick first curated
      const { listDevicePools } = await import("@/lib/aws/device-farm");
      const poolsOutput = await listDevicePools(project.awsProjectArn);
      const pool = poolsOutput.devicePools?.[0]; // Just pick the first one
      if (pool?.arn) {
        devicePoolArn = pool.arn;
      } else {
        return NextResponse.json({ error: "No Device Pool available" }, { status: 400 });
      }
    }

    if (!devicePoolArn || !appArn) {
      // If still missing essential ARNs
      return NextResponse.json({ error: "Missing App ARN or Device Pool ARN" }, { status: 400 });
    }

    const runOutput = await scheduleRun(
      project.awsProjectArn,
      appArn,
      devicePoolArn,
      validatedData.name
    );

    // 3. Create DB Record with AWS ARN
    const run = await createRun(session.user.id, {
      ...validatedData,
      devicePoolArn,
      awsRunArn: runOutput.run?.arn,
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error("Error creating run:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create run" }, { status: 500 });
  }
}
