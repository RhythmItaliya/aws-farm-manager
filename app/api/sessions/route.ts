import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createRemoteAccessSession, getRemoteAccessSession } from "@/lib/aws/device-farm";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { projectArn, deviceArn, name } = body;

        if (!projectArn || !deviceArn) {
            return NextResponse.json(
                { error: "Project ARN and Device ARN are required" },
                { status: 400 }
            );
        }

        const response = await createRemoteAccessSession(projectArn, deviceArn, name);
        return NextResponse.json(response.remoteAccessSession, { status: 201 });
    } catch (error: any) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create session" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const arn = searchParams.get("arn");

        if (!arn) {
            return NextResponse.json({ error: "Session ARN (arn) is required" }, { status: 400 });
        }

        const response = await getRemoteAccessSession(arn);
        return NextResponse.json(response.remoteAccessSession);
    } catch (error: any) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch session" },
            { status: 500 }
        );
    }
}
