"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  category: string;
  params?: { name: string; type: string; required: boolean }[];
  body?: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Projects
  { method: "GET", path: "/api/projects", description: "List all projects", category: "Projects" },
  {
    method: "POST",
    path: "/api/projects",
    description: "Create project",
    category: "Projects",
    body: '{"name": "My Project", "description": "Test project"}',
  },
  {
    method: "GET",
    path: "/api/projects/{id}",
    description: "Get project by ID",
    category: "Projects",
    params: [{ name: "id", type: "string", required: true }],
  },
  {
    method: "PATCH",
    path: "/api/projects/{id}",
    description: "Update project",
    category: "Projects",
    params: [{ name: "id", type: "string", required: true }],
    body: '{"name": "Updated Name"}',
  },
  {
    method: "DELETE",
    path: "/api/projects/{id}",
    description: "Delete project",
    category: "Projects",
    params: [{ name: "id", type: "string", required: true }],
  },

  // Device Pools
  {
    method: "GET",
    path: "/api/device-pools?projectArn={arn}",
    description: "List device pools",
    category: "Device Pools",
    params: [{ name: "projectArn", type: "string", required: true }],
  },
  {
    method: "POST",
    path: "/api/device-pools",
    description: "Create device pool",
    category: "Device Pools",
    body: '{"projectArn": "arn:...", "name": "My Pool", "rules": []}',
  },

  // Devices
  { method: "GET", path: "/api/devices", description: "List all devices", category: "Devices" },
  {
    method: "GET",
    path: "/api/devices?platform=android",
    description: "List Android devices",
    category: "Devices",
  },
  {
    method: "GET",
    path: "/api/devices?platform=ios",
    description: "List iOS devices",
    category: "Devices",
  },

  // Apps
  {
    method: "GET",
    path: "/api/apps?projectId={id}",
    description: "List apps",
    category: "Apps",
    params: [{ name: "projectId", type: "string", required: true }],
  },
  {
    method: "POST",
    path: "/api/apps",
    description: "Upload app",
    category: "Apps",
    body: '{"projectId": "xxx", "name": "app.apk", "appType": "android"}',
  },

  // Runs
  {
    method: "GET",
    path: "/api/runs?projectId={id}",
    description: "List runs",
    category: "Runs",
    params: [{ name: "projectId", type: "string", required: true }],
  },
  {
    method: "POST",
    path: "/api/runs",
    description: "Schedule run",
    category: "Runs",
    body: '{"projectId": "xxx", "name": "Test Run", "appId": "yyy"}',
  },
  {
    method: "POST",
    path: "/api/runs/{id}/stop",
    description: "Stop run",
    category: "Runs",
    params: [{ name: "id", type: "string", required: true }],
  },
  {
    method: "GET",
    path: "/api/runs/{id}/artifacts",
    description: "Get artifacts",
    category: "Runs",
    params: [{ name: "id", type: "string", required: true }],
  },
];

const ENV_VARS = [
  { name: "DATABASE_URL", description: "PostgreSQL connection string", required: true },
  { name: "NEXTAUTH_SECRET", description: "NextAuth secret key", required: true },
  { name: "NEXTAUTH_URL", description: "Application URL", required: true },
  { name: "AWS_ACCESS_KEY_ID", description: "AWS access key", required: true },
  { name: "AWS_SECRET_ACCESS_KEY", description: "AWS secret key", required: true },
  { name: "AWS_REGION", description: "AWS region (default: us-west-2)", required: false },
];

export default function ApiTestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function testEndpoint(endpoint: ApiEndpoint) {
    setLoading(true);
    setStatus("idle");
    setResponse(null);

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.body && (endpoint.method === "POST" || endpoint.method === "PATCH")) {
        options.body = requestBody || endpoint.body;
      }

      const res = await fetch(endpoint.path.replace(/\{[^}]+\}/g, "test-id"), options);
      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });

      setStatus(res.ok ? "success" : "error");
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : "Unknown error",
      });
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  const categories = Array.from(new Set(API_ENDPOINTS.map((e) => e.category)));

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Testing Console</h1>
        <p className="text-muted-foreground mt-2">Test all AWS Device Farm Hub API endpoints</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Environment Variables */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Required configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {ENV_VARS.map((env) => (
                  <div key={env.name} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">{env.name}</code>
                      {env.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{env.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Middle: API Endpoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Click to test an endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={categories[0]}>
              <TabsList className="grid w-full grid-cols-5">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {API_ENDPOINTS.filter((e) => e.category === category).map((endpoint, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedEndpoint(endpoint);
                            setRequestBody(endpoint.body || "");
                            setResponse(null);
                            setStatus("idle");
                          }}
                          className={`w-full text-left rounded-lg border p-3 transition-colors ${
                            selectedEndpoint === endpoint
                              ? "border-primary bg-primary/10"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                endpoint.method === "GET"
                                  ? "secondary"
                                  : endpoint.method === "POST"
                                    ? "default"
                                    : endpoint.method === "DELETE"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Test Panel */}
      {selectedEndpoint && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedEndpoint.method === "GET"
                        ? "secondary"
                        : selectedEndpoint.method === "POST"
                          ? "default"
                          : selectedEndpoint.method === "DELETE"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="font-mono">{selectedEndpoint.path}</code>
                </CardTitle>
                <CardDescription className="mt-1">{selectedEndpoint.description}</CardDescription>
              </div>
              <Button onClick={() => testEndpoint(selectedEndpoint)} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Test
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEndpoint.body && (
              <div className="space-y-2">
                <Label>Request Body</Label>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="font-mono text-sm"
                  rows={5}
                />
              </div>
            )}

            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Response</Label>
                  <div className="flex items-center gap-2">
                    {status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <Badge variant={status === "success" ? "secondary" : "destructive"}>
                      {response.status} {response.statusText}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <pre className="rounded-lg bg-muted p-4 overflow-auto max-h-96">
                  <code className="text-sm">{JSON.stringify(response, null, 2)}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
