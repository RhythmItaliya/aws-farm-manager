import prisma from "@/lib/prisma";
import type { UploadAppInput } from "@/lib/validations/app";

export async function getAppsByProjectId(projectId: string, userId: string) {
  return await prisma.deviceFarmApp.findMany({
    where: { projectId, userId },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getAppById(id: string, userId: string) {
  return await prisma.deviceFarmApp.findFirst({
    where: { id, userId },
  });
}

export async function createApp(userId: string, data: UploadAppInput) {
  return await prisma.deviceFarmApp.create({
    data: {
      ...data,
      userId,
      fileSize: data.fileSize ? BigInt(data.fileSize) : null,
    },
  });
}

export async function deleteApp(id: string, userId: string) {
  return await prisma.deviceFarmApp.delete({
    where: { id, userId },
  });
}
