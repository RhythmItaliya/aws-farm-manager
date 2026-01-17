import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { listDevices } from "@/lib/aws/device-farm";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    const filters = platform
      ? [
          {
            attribute: "PLATFORM",
            operator: "EQUALS",
            values: [platform.toUpperCase()],
          },
        ]
      : undefined;

    const result = await listDevices(filters);
    return NextResponse.json(result.devices || []);
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}
