import prisma from "@/lib/prisma";
import type { CreateRunInput, UpdateRunInput } from "@/lib/validations/run";

export async function getRunsByProjectId(projectId: string, userId: string) {
  return await prisma.deviceFarmRun.findMany({
    where: { projectId, userId },
    include: {
      app: {
        select: {
          name: true,
          appType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRunById(id: string, userId: string) {
  return await prisma.deviceFarmRun.findFirst({
    where: { id, userId },
    include: {
      app: true,
      project: true,
      sessions: true,
    },
  });
}

export async function createRun(userId: string, data: CreateRunInput) {
  return await prisma.deviceFarmRun.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateRun(id: string, userId: string, data: UpdateRunInput) {
  return await prisma.deviceFarmRun.update({
    where: { id, userId },
    data,
  });
}

export async function deleteRun(id: string, userId: string) {
  return await prisma.deviceFarmRun.delete({
    where: { id, userId },
  });
}
