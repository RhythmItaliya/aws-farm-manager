import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { listProjects } from "@/lib/aws/device-farm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try a lightweight call to check connectivity
    await listProjects();

    return NextResponse.json({ status: "connected" });
  } catch (error: any) {
    console.error("AWS Status Check Failed:", error);

    // Check for specific AWS errors if possible, otherwise generic error
    const errorMessage =
      error.name === "CredentialsError"
        ? "Invalid Credentials"
        : error.message || "Connection Failed";

    return NextResponse.json(
      {
        status: "disconnected",
        error: errorMessage,
      },
      { status: 200 }
    ); // Return 200 so frontend can handle it easily without throw
  }
}
