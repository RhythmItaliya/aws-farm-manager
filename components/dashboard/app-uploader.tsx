"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AppUploaderProps {
  projectId: string;
  projectArn: string;
}

export function AppUploader({ projectId, projectArn }: AppUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [appType, setAppType] = useState<"android" | "ios">("android");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setProgress("Requesting upload URL...");

    try {
      // 1. Get Presigned URL
      const awsType = appType === "android" ? "ANDROID_APP" : "IOS_APP";
      const urlResponse = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_upload_url",
          projectArn,
          name: file.name,
          type: awsType,
        }),
      });

      if (!urlResponse.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, uploadArn } = await urlResponse.json();

      if (!uploadUrl) throw new Error("No upload URL returned");

      // 2. Upload File to AWS S3
      setProgress(`Uploading to AWS (${(file.size / 1024 / 1024).toFixed(1)} MB)...`);
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file to AWS");

      // 3. Confirm & Create DB Record
      setProgress("Finalizing...");
      const dbResponse = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: file.name,
          appType: appType, // Use lowercase as defined in Prisma schema
          fileName: file.name,
          fileSize: file.size,
          awsUploadArn: uploadArn,
        }),
      });

      if (!dbResponse.ok) throw new Error("Failed to save app record");

      setProgress("Upload complete!");
      toast.success("App uploaded successfully");
      setFile(null);
      setProgress("");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setProgress("");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Upload App</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>App Type</Label>
          <Select value={appType} onValueChange={(v) => setAppType(v as typeof appType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="android">Android (.apk)</SelectItem>
              <SelectItem value="ios">iOS (.ipa)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>App File</Label>
          <Input
            type="file"
            accept={appType === "android" ? ".apk" : ".ipa"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {progress && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {progress.includes("complete") ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {progress}
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload
        </Button>
      </CardContent>
    </Card>
  );
}
