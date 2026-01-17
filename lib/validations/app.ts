import { z } from "zod";
import { AppType } from "@prisma/client";

export const uploadAppSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1, "App name is required").max(100),
  appType: z.nativeEnum(AppType),
  fileName: z.string().optional(),
  fileSize: z.number().positive().optional(),
  awsUploadArn: z.string().optional(),
});

export type UploadAppInput = z.infer<typeof uploadAppSchema>;
