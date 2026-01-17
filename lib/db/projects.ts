import prisma from "@/lib/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project";

export async function getProjectsByUserId(userId: string) {
  return await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string, userId: string) {
  return await prisma.project.findFirst({
    where: { id, userId },
    include: {
      deviceFarmApps: {
        orderBy: { uploadedAt: "desc" },
      },
      deviceFarmRuns: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function createProject(userId: string, data: CreateProjectInput) {
  return await prisma.project.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateProject(id: string, userId: string, data: UpdateProjectInput) {
  return await prisma.project.update({
    where: { id, userId },
    data,
  });
}

export async function deleteProject(id: string, userId: string) {
  return await prisma.project.delete({
    where: { id, userId },
  });
}
