"use client";

import { useState, useEffect } from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { ApiTester } from "@/components/dashboard/api-tester";
import { ProjectList } from "@/components/dashboard/project-list";
import { AppUploader } from "@/components/dashboard/app-uploader";
import { RunMonitor } from "@/components/dashboard/run-monitor";
import { DeviceList } from "@/components/dashboard/device-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  awsProjectArn: string | null;
  createdAt: string;
}

// Session Interface
interface Session {
  status: string;
  endpoint?: string;
  arn: string;
}

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Session State
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionDeviceName, setSessionDeviceName] = useState<string>("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  // Poll Active Session
  useEffect(() => {
    if (!activeSession || activeSession.endpoint || activeSession.status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions?arn=${encodeURIComponent(activeSession.arn)}`);
        if (!res.ok) return;
        const data = await res.json();

        console.log("Session status:", data.status, data);

        if (data.status === "RUNNING") {
          setActiveSession((prev) =>
            prev ? { ...prev, status: "RUNNING", endpoint: data.endpoint } : null
          );
          setSessionLoading(false);
          toast.success("Device is ready!");
        } else if (
          data.status === "FAILED" ||
          data.status === "ERRORED" ||
          data.status === "COMPLETED"
        ) {
          setActiveSession((prev) => (prev ? { ...prev, status: data.status } : null));
          setSessionLoading(false);
          toast.error(`Session ${data.status.toLowerCase()}`);
        } else {
          // Update status to show progress
          setActiveSession((prev) => (prev ? { ...prev, status: data.status } : null));
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSession]);

  async function handleConnectRequest({
    deviceArn,
    deviceName,
  }: {
    deviceArn: string;
    deviceName: string;
  }) {
    if (!selectedProject?.awsProjectArn) return;

    setConnectingDeviceId(deviceArn);
    setSessionDeviceName(deviceName);
    setSessionLoading(true);

    // Create Session
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectArn: selectedProject.awsProjectArn,
          deviceArn: deviceArn,
          name: `Session-${deviceName.replace(/\s+/g, "-")}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to start session");
      const session = await response.json();

      setActiveSession({
        arn: session.arn,
        status: session.status || "PENDING",
        endpoint: session.endpoint,
      });
    } catch (err) {
      console.error(err);
      setSessionLoading(false); // Reset on error
      // Could show toast
    } finally {
      setConnectingDeviceId(null);
    }
  }

  function closeSession() {
    setActiveSession(null);
    setSessionDeviceName("");
    // Ideally API call to stop session
  }

  // We'll use this layout:
  // [ Projects (20%) | Main Content (50%) | Tools/Details (30%) ]

  return (
    <main className="h-full w-full bg-background text-foreground">
      <Allotment defaultSizes={[20, 50, 30]}>
        {/* PANEL 1: PROJECT LIST & NAVIGATION */}
        <Allotment.Pane minSize={200} maxSize={400}>
          <div className="flex h-full flex-col border-r border-border bg-sidebar">
            <ScrollArea className="flex-1">
              <div className="p-4">
                <ProjectList
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border">
              <ConnectionStatus />
            </div>
          </div>
        </Allotment.Pane>

        {/* PANEL 2: MAIN CONTENT AREA */}
        <Allotment.Pane minSize={400}>
          <div className="flex h-full flex-col bg-background">
            {/* ACTIVE SESSION VIEW (Priority) */}
            {activeSession ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-border p-4 bg-muted/20 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      Remote Control: {sessionDeviceName}
                    </h2>
                    <p className="text-xs text-muted-foreground">{activeSession.status}</p>
                  </div>
                  <button
                    onClick={closeSession}
                    className="text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-1 rounded-md transition-colors"
                  >
                    End Session
                  </button>
                </div>

                <div className="flex-1 bg-black relative">
                  {activeSession.status === "RUNNING" ? (
                    <div className="flex flex-col items-center justify-center h-full text-white space-y-6 bg-zinc-900 rounded-lg border border-zinc-800">
                      <div className="text-center space-y-2">
                        <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8"
                          >
                            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                            <path d="M12 18h.01" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold">Device is Ready!</h3>
                        <p className="text-zinc-400 max-w-md">
                          The remote session has been established successfully. Due to AWS security
                          policies, the interactive video stream must be viewed in the AWS Console.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <a
                          href={(() => {
                            // Construct AWS Console URL
                            const arnParts = activeSession.arn.split(":");
                            const region = arnParts[3] || "us-west-2";
                            const projectId = arnParts[6].split("/")[0];
                            const sessionId = arnParts[6].split("/")[1];
                            return `https://${region}.console.aws.amazon.com/devicefarm/home?region=${region}#/mobile/projects/${projectId}/sessions/${sessionId}`;
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Open Remote Control
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                      <p>Provisioning Device...</p>
                      <p className="text-sm text-gray-400 mt-2">This usually takes 1-2 minutes.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedProject ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-border p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">{selectedProject.name}</h1>
                      <p className="text-muted-foreground">
                        {selectedProject.description || "No description provided"}
                      </p>
                    </div>
                    {selectedProject.awsProjectArn && (
                      <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                        AWS Synced
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    {selectedProject.awsProjectArn ? (
                      <div className="space-y-8">
                        {sessionLoading && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center gap-3 mb-6">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <p className="text-sm font-medium">
                              Initializing session for {sessionDeviceName}...
                            </p>
                          </div>
                        )}
                        <section>
                          <h3 className="text-lg font-semibold mb-4 mx-1">Application Uploads</h3>
                          <AppUploader
                            projectId={selectedProject.id}
                            projectArn={selectedProject.awsProjectArn}
                          />
                        </section>

                        <Separator />

                        <section>
                          <h3 className="text-lg font-semibold mb-4 mx-1">Test Runs</h3>
                          <RunMonitor projectId={selectedProject.id} />
                        </section>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-border rounded-xl bg-muted/10 m-4">
                        <h3 className="text-lg font-medium">AWS Setup Required</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                          This project needs to be synced with AWS Device Farm before you can upload
                          apps or run tests.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-8 bg-muted/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">No Project Selected</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Select a project from the sidebar to view its details, manage uploads, and monitor
                  test executions.
                </p>
              </div>
            )}
          </div>
        </Allotment.Pane>

        {/* PANEL 3: TOOLS & LOGS */}
        <Allotment.Pane minSize={300} visible>
          <div className="flex h-full flex-col border-l border-border bg-card">
            <div className="p-2 border-b border-border bg-muted/30">
              <Tabs defaultValue="devices" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="devices">Devices</TabsTrigger>
                  <TabsTrigger value="api">API Tester</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden mt-2">
                  <TabsContent value="devices" className="m-0 h-[calc(100vh-100px)]">
                    <div className="p-4 h-full">
                      <DeviceList
                        projectArn={selectedProject?.awsProjectArn}
                        onConnectRequest={(device) =>
                          handleConnectRequest({ deviceArn: device.arn, deviceName: device.name })
                        }
                        connectingDeviceId={connectingDeviceId}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="api" className="m-0 h-[calc(100vh-100px)]">
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        <ApiTester />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="logs" className="m-0">
                    <div className="p-8 text-center text-muted-foreground">
                      <p>System logs will appear here.</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </Allotment.Pane>
      </Allotment>
    </main>
  );
}
