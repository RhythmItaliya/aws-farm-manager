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

    const project = await createProject(session.user.id, validatedData);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
