import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  listDevicePools,
  createDevicePool,
  updateDevicePool,
  deleteDevicePool,
} from "@/lib/aws/device-farm";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectArn = searchParams.get("projectArn");

    if (!projectArn) {
      return NextResponse.json({ error: "Project ARN is required" }, { status: 400 });
    }

    const result = await listDevicePools(projectArn);
    return NextResponse.json(result.devicePools || []);
  } catch (error) {
    console.error("Error fetching device pools:", error);
    return NextResponse.json({ error: "Failed to fetch device pools" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectArn, name, rules } = body;

    if (!projectArn || !name) {
      return NextResponse.json({ error: "Project ARN and name are required" }, { status: 400 });
    }

    const result = await createDevicePool(projectArn, name, rules || []);
    return NextResponse.json(result.devicePool, { status: 201 });
  } catch (error) {
    console.error("Error creating device pool:", error);
    return NextResponse.json({ error: "Failed to create device pool" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { arn, name, rules } = body;

    if (!arn) {
      return NextResponse.json({ error: "Device pool ARN is required" }, { status: 400 });
    }

    const result = await updateDevicePool(arn, name, rules);
    return NextResponse.json(result.devicePool);
  } catch (error) {
    console.error("Error updating device pool:", error);
    return NextResponse.json({ error: "Failed to update device pool" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const arn = searchParams.get("arn");

    if (!arn) {
      return NextResponse.json({ error: "Device pool ARN is required" }, { status: 400 });
    }

    await deleteDevicePool(arn);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting device pool:", error);
    return NextResponse.json({ error: "Failed to delete device pool" }, { status: 500 });
  }
}
