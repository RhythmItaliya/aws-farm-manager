
import { getRemoteAccessSession } from "@/lib/aws/device-farm";

async function checkEndpoint() {
    const arn = "arn:aws:devicefarm:us-west-2:281414549138:session:85e67e66-7136-4b25-afa6-28dc4d6dde52/753a42d1-22a4-4f56-a51b-ec775846fe23/00000";

    try {
        console.log("Fetching session...");
        const result = await getRemoteAccessSession(arn);
        const endpoint = result.remoteAccessSession?.endpoint;

        if (!endpoint) {
            console.log("No endpoint found (session might be stopped)");
            return;
        }

        console.log("Endpoint URL:", endpoint);

        console.log("Checking headers...");
        const response = await fetch(endpoint, { method: 'HEAD' });
        console.log("--- HEADERS ---");
        console.log("X-Frame-Options:", response.headers.get("x-frame-options"));
        console.log("Content-Security-Policy:", response.headers.get("content-security-policy"));
        console.log("----------------");

    } catch (error) {
        console.error("Error:", error);
    }
}

checkEndpoint();
