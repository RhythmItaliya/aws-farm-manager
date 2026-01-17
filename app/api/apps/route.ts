import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getAppsByProjectId, createApp } from "@/lib/db/apps";
import { uploadAppSchema } from "@/lib/validations/app";

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

    const apps = await getAppsByProjectId(projectId, session.user.id);
    return NextResponse.json(apps);
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a request for a presigned URL
    if (body.action === "get_upload_url") {
      const { projectArn, name, type } = body;

      if (!projectArn || !name || !type) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Import strictly needed here to avoid circular deps if any
      const { createUpload } = await import("@/lib/aws/device-farm");

      const uploadResponse = await createUpload(projectArn, name, type);

      return NextResponse.json({
        uploadUrl: uploadResponse.upload?.url,
        uploadArn: uploadResponse.upload?.arn,
        status: uploadResponse.upload?.status
      });
    }

    // Otherwise, standard app creation (confirmation)
    const validatedData = uploadAppSchema.parse(body);

    const app = await createApp(session.user.id, validatedData);
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Error processing app request:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
