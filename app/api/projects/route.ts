import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getProjectsByUserId, createProject } from "@/lib/db/projects";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await getProjectsByUserId(session.user.id);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Create AWS Device Farm project first
    let awsProjectArn: string | undefined;
    try {
      const { createProject: createAwsProject } = await import("@/lib/aws/device-farm");
      const awsResponse = await createAwsProject(validatedData.name);
      awsProjectArn = awsResponse.project?.arn;
    } catch (awsError) {
      console.error("Failed to create AWS project:", awsError);
      // Continue without AWS sync - user can sync later
    }

    // Create local project with AWS ARN if available
    const project = await createProject(session.user.id, {
      ...validatedData,
      awsProjectArn,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
