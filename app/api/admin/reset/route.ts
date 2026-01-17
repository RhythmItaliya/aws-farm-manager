import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { listProjects, deleteProject } from "@/lib/aws/device-farm";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Clean up AWS Device Farm (Delete ALL projects)
    try {
      console.log("Starting AWS cleanup...");
      const { projects } = await listProjects();

      if (projects && projects.length > 0) {
        // Delete in parallel for speed
        await Promise.all(
          projects.map(async (p) => {
            if (p.arn) {
              console.log(`Deleting AWS Project: ${p.name} (${p.arn})`);
              try {
                await deleteProject(p.arn);
              } catch (e) {
                console.error(`Failed to delete AWS project ${p.name}:`, e);
              }
            }
          })
        );
      }
      console.log("AWS cleanup complete.");
    } catch (awsError) {
      console.error("Error cleaning up AWS:", awsError);
      return NextResponse.json({ error: "Failed to cleanup AWS resources" }, { status: 500 });
    }

    // 2. Clean up Local Database (Cascade delete user's data)
    try {
      console.log("Starting local DB cleanup...");

      // Delete all projects for the user (Cascade will delete apps, runs, sessions)
      await prisma.project.deleteMany({
        where: { userId: session.user.id },
      });

      console.log("Local DB cleanup complete.");
    } catch (dbError) {
      console.error("Error cleaning up database:", dbError);
      return NextResponse.json({ error: "Failed to cleanup database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "System completely reset" });
  } catch (error) {
    console.error("System reset failed:", error);
    return NextResponse.json({ error: "System reset failed" }, { status: 500 });
  }
}
