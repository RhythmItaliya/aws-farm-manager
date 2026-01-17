"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Run {
  id: string;
  name: string;
  status: string;
  awsRunArn: string | null;
  createdAt: string;
  result: unknown;
  app?: {
    name: string;
    appType: string;
  } | null;
}

interface RunMonitorProps {
  projectId: string;
}

export function RunMonitor({ projectId }: RunMonitorProps) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
  }, [projectId]);

  async function fetchRuns() {
    setLoading(true);
    try {
      const response = await fetch(`/api/runs?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch runs");

      const data = await response.json();
      setRuns(data);
    } catch (error) {
      toast.error("Failed to load test runs");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      running: "default",
      completed: "secondary",
      failed: "destructive",
      cancelled: "destructive",
    };
    const colors: Record<string, string> = {
      pending: "bg-yellow-600",
      running: "bg-blue-600",
      completed: "bg-emerald-600",
    };

    return (
      <Badge variant={variants[status] || "secondary"} className={colors[status] || ""}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Test Runs</CardTitle>
        <Button size="sm" variant="ghost" onClick={fetchRuns} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : runs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Play className="mx-auto mb-2 h-8 w-8" />
            <p>No test runs yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{run.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(run.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(run.status)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
