"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudOff, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [awsStatus, setAwsStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [awsError, setAwsError] = useState<string | null>(null);

  useEffect(() => {
    checkConnections();
  }, []);

  async function checkConnections() {
    // Check backend connection
    try {
      const response = await fetch("/api/projects");
      setBackendStatus(response.ok || response.status === 401 ? "connected" : "disconnected");
    } catch {
      setBackendStatus("disconnected");
    }

    // Check AWS connection
    try {
      const response = await fetch("/api/status/aws");
      const data = await response.json();

      if (data.status === "connected") {
        setAwsStatus("connected");
        setAwsError(null);
      } else {
        setAwsStatus("disconnected");
        setAwsError(data.error);
      }
    } catch {
      setAwsStatus("disconnected");
      setAwsError("Failed to reach server");
    }
  }

  const getStatusBadge = (status: "checking" | "connected" | "disconnected", error?: string | null) => {
    if (status === "checking") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking
        </Badge>
      );
    }
    if (status === "connected") {
      return (
        <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700">
          <Cloud className="h-3 w-3" />
          Connected
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1" title={error || "Connection failed"}>
        <CloudOff className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="flex flex-wrap gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Backend:</span>
          {getStatusBadge(backendStatus)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">AWS Device Farm:</span>
          {getStatusBadge(awsStatus, awsError)}
        </div>
        <a
          href="https://console.aws.amazon.com/devicefarm"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
        >
          Open AWS Console →
        </a>
      </CardContent>
    </Card>
  );
}
