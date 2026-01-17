import { z } from "zod";
import { RunStatus } from "@prisma/client";

export const createRunSchema = z.object({
  projectId: z.string().cuid(),
  appId: z.string().cuid().optional(),
  name: z.string().min(1, "Run name is required").max(100),
  devicePoolArn: z.string().optional(),
  awsRunArn: z.string().optional(),
});

export const updateRunSchema = z.object({
  status: z.nativeEnum(RunStatus).optional(),
  result: z.any().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type CreateRunInput = z.infer<typeof createRunSchema>;
export type UpdateRunInput = z.infer<typeof updateRunSchema>;
