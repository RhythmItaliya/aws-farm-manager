"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Play } from "lucide-react";

interface ApiTest {
  name: string;
  endpoint: string;
  method: string;
  status: "idle" | "testing" | "success" | "error";
  message?: string;
}

const initialTests: ApiTest[] = [
  { name: "List Projects", endpoint: "/api/projects", method: "GET", status: "idle" },
  { name: "List Apps", endpoint: "/api/apps?projectId=test", method: "GET", status: "idle" },
  { name: "List Runs", endpoint: "/api/runs?projectId=test", method: "GET", status: "idle" },
];

export function ApiTester() {
  const [tests, setTests] = useState<ApiTest[]>(initialTests);
  const [isRunning, setIsRunning] = useState(false);

  async function runTest(index: number) {
    const test = tests[index];

    setTests((prev) => prev.map((t, i) => (i === index ? { ...t, status: "testing" } : t)));

    try {
      const response = await fetch(test.endpoint, {
        method: test.method,
      });

      const isSuccess = response.ok || response.status === 401; // 401 = auth required (API works)

      setTests((prev) =>
        prev.map((t, i) =>
          i === index
            ? {
                ...t,
                status: isSuccess ? "success" : "error",
                message: isSuccess ? `OK (${response.status})` : `Error (${response.status})`,
              }
            : t
        )
      );
    } catch (err) {
      setTests((prev) =>
        prev.map((t, i) => (i === index ? { ...t, status: "error", message: "Network error" } : t))
      );
    }
  }

  async function runAllTests() {
    setIsRunning(true);
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      await new Promise((r) => setTimeout(r, 300));
    }
    setIsRunning(false);
  }

  const getStatusIcon = (status: ApiTest["status"]) => {
    switch (status) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <div className="h-4 w-4 rounded-full border border-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">API Health Check</CardTitle>
        <Button size="sm" onClick={runAllTests} disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Test All
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {tests.map((test, index) => (
          <div
            key={test.name}
            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(test.status)}
              <div>
                <p className="text-sm font-medium">{test.name}</p>
                <p className="text-xs text-muted-foreground">
                  {test.method} {test.endpoint}
                </p>
              </div>
            </div>
            {test.message && (
              <Badge variant={test.status === "success" ? "secondary" : "destructive"}>
                {test.message}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
