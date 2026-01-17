import {
  DeviceFarmClient,
  ListProjectsCommand,
  CreateProjectCommand,
  ListDevicePoolsCommand,
  ListDevicesCommand,
  CreateUploadCommand,
  GetUploadCommand,
  ListUploadsCommand,
  ScheduleRunCommand,
  GetRunCommand,
  ListRunsCommand,
  StopRunCommand,
  DeleteRunCommand,
  ListArtifactsCommand,
  CreateDevicePoolCommand,
  UpdateDevicePoolCommand,
  DeleteDevicePoolCommand,
} from "@aws-sdk/client-device-farm";

const client = new DeviceFarmClient({
  region: process.env.AWS_REGION || "us-west-2",
  endpoint: `https://devicefarm.${process.env.AWS_REGION || "us-west-2"}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Projects
export async function listProjects() {
  try {
    const command = new ListProjectsCommand({});
    return await client.send(command);
  } catch (error) {
    console.error("Error in listProjects:", error);
    throw error;
  }
}

export async function createProject(name: string) {
  try {
    const command = new CreateProjectCommand({ name });
    return await client.send(command);
  } catch (error) {
    console.error("Error in createProject:", error);
    throw error;
  }
}

export async function deleteProject(arn: string) {
  try {
    const { DeleteProjectCommand } = await import("@aws-sdk/client-device-farm");

    // 1. Force stop all remote sessions first
    try {
      const activeSessions = await listRemoteAccessSessions(arn);
      if (activeSessions?.remoteAccessSessions) {
        await Promise.all(
          activeSessions.remoteAccessSessions.map(async (session) => {
            if (session.arn && session.status !== "COMPLETED") {
              console.log(`Stopping active session: ${session.arn}`);
              await stopRemoteAccessSession(session.arn);
            }
          })
        );
        // Wait a small bit for AWS to process stops
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (cleanupError) {
      console.warn("Error cleaning up sessions, trying to delete anyway:", cleanupError);
    }

    const command = new DeleteProjectCommand({ arn });
    return await client.send(command);
  } catch (error) {
    console.error("Error in deleteProject:", error);
    throw error;
  }
}

// Device Pools
export async function listDevicePools(projectArn: string) {
  try {
    const command = new ListDevicePoolsCommand({ arn: projectArn });
    return await client.send(command);
  } catch (error) {
    console.error("Error in listDevicePools:", error);
    throw error;
  }
}

export async function createDevicePool(projectArn: string, name: string, rules: any[]) {
  try {
    const command = new CreateDevicePoolCommand({
      projectArn,
      name,
      rules,
    });
    return await client.send(command);
  } catch (error) {
    console.error("Error in createDevicePool:", error);
    throw error;
  }
}

export async function updateDevicePool(arn: string, name?: string, rules?: any[]) {
  try {
    const command = new UpdateDevicePoolCommand({
      arn,
      name,
      rules,
    });
    return await client.send(command);
  } catch (error) {
    console.error("Error in updateDevicePool:", error);
    throw error;
  }
}

export async function deleteDevicePool(arn: string) {
  try {
    const command = new DeleteDevicePoolCommand({ arn });
    return await client.send(command);
  } catch (error) {
    console.error("Error in deleteDevicePool:", error);
    throw error;
  }
}

// Devices

// ...

// Devices
export async function listDevices(filters?: any[]) {
  try {
    const command = new ListDevicesCommand({ filters });
    return await client.send(command);
  } catch (error) {
    console.error("Error in listDevices:", error);
    throw error;
  }
}

// Uploads
export async function createUpload(
  projectArn: string,
  name: string,
  type:
    | "ANDROID_APP"
    | "IOS_APP"
    | "WEB_APP"
    | "EXTERNAL_DATA"
    | "APPIUM_JAVA_JUNIT_TEST_PACKAGE"
    | "APPIUM_JAVA_TESTNG_TEST_PACKAGE"
    | "APPIUM_PYTHON_TEST_PACKAGE"
    | "APPIUM_NODE_TEST_PACKAGE"
    | "APPIUM_RUBY_TEST_PACKAGE"
    | "APPIUM_WEB_JAVA_JUNIT_TEST_PACKAGE"
    | "APPIUM_WEB_JAVA_TESTNG_TEST_PACKAGE"
    | "APPIUM_WEB_PYTHON_TEST_PACKAGE"
    | "APPIUM_WEB_NODE_TEST_PACKAGE"
    | "APPIUM_WEB_RUBY_TEST_PACKAGE"
    | "CALABASH_TEST_PACKAGE"
    | "INSTRUMENTATION_TEST_PACKAGE"
    | "UIAUTOMATION_TEST_PACKAGE"
    | "UIAUTOMATOR_TEST_PACKAGE"
    | "XCTEST_TEST_PACKAGE"
    | "XCTEST_UI_TEST_PACKAGE"
    | "APPIUM_JAVA_JUNIT_TEST_SPEC"
    | "APPIUM_JAVA_TESTNG_TEST_SPEC"
    | "APPIUM_PYTHON_TEST_SPEC"
    | "APPIUM_NODE_TEST_SPEC"
    | "APPIUM_RUBY_TEST_SPEC"
    | "APPIUM_WEB_JAVA_JUNIT_TEST_SPEC"
    | "APPIUM_WEB_JAVA_TESTNG_TEST_SPEC"
    | "APPIUM_WEB_PYTHON_TEST_SPEC"
    | "APPIUM_WEB_NODE_TEST_SPEC"
    | "APPIUM_WEB_RUBY_TEST_SPEC"
    | "INSTRUMENTATION_TEST_SPEC"
    | "XCTEST_UI_TEST_SPEC"
) {
  const command = new CreateUploadCommand({
    projectArn,
    name,
    type,
  });
  return await client.send(command);
}

export async function getUploadStatus(arn: string) {
  const command = new GetUploadCommand({ arn });
  return await client.send(command);
}

export async function listUploads(
  projectArn: string,
  type?:
    | "ANDROID_APP"
    | "IOS_APP"
    | "WEB_APP"
    | "EXTERNAL_DATA"
    | "APPIUM_JAVA_JUNIT_TEST_PACKAGE"
    | "APPIUM_JAVA_TESTNG_TEST_PACKAGE"
    | "APPIUM_PYTHON_TEST_PACKAGE"
    | "APPIUM_NODE_TEST_PACKAGE"
    | "APPIUM_RUBY_TEST_PACKAGE"
    | "APPIUM_WEB_JAVA_JUNIT_TEST_PACKAGE"
    | "APPIUM_WEB_JAVA_TESTNG_TEST_PACKAGE"
    | "APPIUM_WEB_PYTHON_TEST_PACKAGE"
    | "APPIUM_WEB_NODE_TEST_PACKAGE"
    | "APPIUM_WEB_RUBY_TEST_PACKAGE"
    | "CALABASH_TEST_PACKAGE"
    | "INSTRUMENTATION_TEST_PACKAGE"
    | "UIAUTOMATION_TEST_PACKAGE"
    | "UIAUTOMATOR_TEST_PACKAGE"
    | "XCTEST_TEST_PACKAGE"
    | "XCTEST_UI_TEST_PACKAGE"
    | "APPIUM_JAVA_JUNIT_TEST_SPEC"
    | "APPIUM_JAVA_TESTNG_TEST_SPEC"
    | "APPIUM_PYTHON_TEST_SPEC"
    | "APPIUM_NODE_TEST_SPEC"
    | "APPIUM_RUBY_TEST_SPEC"
    | "APPIUM_WEB_JAVA_JUNIT_TEST_SPEC"
    | "APPIUM_WEB_JAVA_TESTNG_TEST_SPEC"
    | "APPIUM_WEB_PYTHON_TEST_SPEC"
    | "APPIUM_WEB_NODE_TEST_SPEC"
    | "APPIUM_WEB_RUBY_TEST_SPEC"
    | "INSTRUMENTATION_TEST_SPEC"
    | "XCTEST_UI_TEST_SPEC"
) {
  const command = new ListUploadsCommand({
    arn: projectArn,
    type,
  });
  return await client.send(command);
}

export async function uploadToPresignedUrl(url: string, file: File | Buffer) {
  const response = await fetch(url, {
    method: "PUT",
    body: file as any, // File and Buffer are valid BodyInit types
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response;
}

// Runs
export async function scheduleRun(
  projectArn: string,
  appArn: string,
  devicePoolArn: string,
  name: string,
  test?: any
) {
  const command = new ScheduleRunCommand({
    projectArn,
    appArn,
    devicePoolArn,
    name,
    test: test || {
      type: "BUILTIN_FUZZ",
    },
  });
  return await client.send(command);
}

export async function getRunStatus(arn: string) {
  const command = new GetRunCommand({ arn });
  return await client.send(command);
}

export async function listRuns(projectArn: string) {
  const command = new ListRunsCommand({ arn: projectArn });
  return await client.send(command);
}

export async function stopRun(arn: string) {
  const command = new StopRunCommand({ arn });
  return await client.send(command);
}

export async function deleteRun(arn: string) {
  const command = new DeleteRunCommand({ arn });
  return await client.send(command);
}

// Artifacts
export async function listArtifacts(arn: string, type: "SCREENSHOT" | "FILE" | "LOG") {
  const command = new ListArtifactsCommand({
    arn,
    type,
  });
  return await client.send(command);
}

// Remote Access Sessions
export async function createRemoteAccessSession(
  projectArn: string,
  deviceArn: string,
  name?: string
) {
  try {
    const { CreateRemoteAccessSessionCommand } = await import("@aws-sdk/client-device-farm");
    const command = new CreateRemoteAccessSessionCommand({
      projectArn,
      deviceArn,
      name: name || `Session-${Date.now()}`,
      configuration: {
        billingMethod: "METERED",
      },
    });
    return await client.send(command);
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function getRemoteAccessSession(arn: string) {
  const { GetRemoteAccessSessionCommand } = await import("@aws-sdk/client-device-farm");
  const command = new GetRemoteAccessSessionCommand({ arn });
  return await client.send(command);
}

export const deviceFarmClient = client;

// Helper to list active sessions for cleanup
export async function listRemoteAccessSessions(projectArn: string) {
  try {
    const { ListRemoteAccessSessionsCommand } = await import("@aws-sdk/client-device-farm");
    const command = new ListRemoteAccessSessionsCommand({ arn: projectArn });
    return await client.send(command);
  } catch (error) {
    console.error("Error listing sessions:", error);
    return { remoteAccessSessions: [] };
  }
}

// Helper to stop a session
export async function stopRemoteAccessSession(arn: string) {
  try {
    const { StopRemoteAccessSessionCommand } = await import("@aws-sdk/client-device-farm");
    const command = new StopRemoteAccessSessionCommand({ arn });
    return await client.send(command);
  } catch (error) {
    console.error("Error stopping session:", error);
    // Ignore error if session is already stopped
  }
}
