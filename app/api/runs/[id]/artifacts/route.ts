import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { listArtifacts } from "@/lib/aws/device-farm";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "FILE") as "SCREENSHOT" | "FILE" | "LOG";

    // Get run ARN from database
    const run = await prisma.deviceFarmRun.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!run || !run.awsRunArn) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const result = await listArtifacts(run.awsRunArn, type);
    return NextResponse.json(result.artifacts || []);
  } catch (error) {
    console.error("Error fetching artifacts:", error);
    return NextResponse.json({ error: "Failed to fetch artifacts" }, { status: 500 });
  }
}
