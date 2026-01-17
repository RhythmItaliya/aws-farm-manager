"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, CreateProjectInput } from "@/lib/validations/project";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface Project {
  id: string;
  name: string;
  description: string | null;
  awsProjectArn: string | null;
  createdAt: string;
}

interface ProjectListProps {
  onSelectProject: (project: Project | null) => void;
  selectedProject: Project | null;
}

export function ProjectList({ onSelectProject, selectedProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: CreateProjectInput) {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create project");

      toast.success("Project created successfully");
      form.reset();
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      toast.error("Failed to create project");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between pb-2">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={fetchProjects} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {showForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-start">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder="Project name"
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </form>
          </Form>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FolderOpen className="mx-auto mb-2 h-8 w-8" />
            <p>No projects yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(selectedProject?.id === project.id ? null : project)}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${selectedProject?.id === project.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{project.name}</span>
                  {project.awsProjectArn && (
                    <div className={`h-2 w-2 rounded-full ${selectedProject?.id === project.id ? "bg-white" : "bg-green-500"}`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
