import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { stopRun } from "@/lib/aws/device-farm";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get run ARN from database
    const run = await prisma.deviceFarmRun.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!run || !run.awsRunArn) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    await stopRun(run.awsRunArn);

    // Update status in database
    await prisma.deviceFarmRun.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error stopping run:", error);
    return NextResponse.json({ error: "Failed to stop run" }, { status: 500 });
  }
}
