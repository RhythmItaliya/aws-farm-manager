import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, CreateProjectInput } from "@/lib/validations/project";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  async function handleSystemReset() {
    setIsConfirmingReset(true);
    try {
      const response = await fetch("/api/admin/reset", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to reset system");

      const data = await response.json();
      toast.success(data.message || "System reset successfully");

      onSelectProject(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset system");
    } finally {
      setIsConfirmingReset(false);
      setIsResetting(false);
    }
  }

  async function handleDeleteProject() {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");

      toast.success("Project deleted successfully");

      // If the deleted project was selected, deselect it
      if (selectedProject?.id === projectToDelete.id) {
        onSelectProject(null);
      }

      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
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
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsResetting(true)}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
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
              <div
                key={project.id}
                className={`group flex items-center justify-between w-full rounded-md px-3 py-2 transition-colors cursor-pointer ${
                  selectedProject?.id === project.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => onSelectProject(selectedProject?.id === project.id ? null : project)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-medium text-sm truncate">{project.name}</span>
                  {project.awsProjectArn && (
                    <div
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${selectedProject?.id === project.id ? "bg-white" : "bg-green-500"}`}
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                    selectedProject?.id === project.id
                      ? "text-primary-foreground hover:bg-primary-foreground/20"
                      : "text-muted-foreground hover:text-destructive"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectToDelete(project);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This searching will permanently delete <strong>{projectToDelete?.name}</strong>. It
              will verify and remove the project from AWS Device Farm, including all associated apps
              and runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProject();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetting} onOpenChange={setIsResetting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ NUCLEAR OPTION: Delete Everything?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-muted-foreground text-sm">
                This will permanently delete <strong>ALL PROJECTS</strong> from:
                <ul className="list-disc list-inside mt-2">
                  <li>Your AWS Device Farm account (including all apps and runs)</li>
                  <li>Your local database</li>
                </ul>
                <br />
                <strong>This action cannot be undone.</strong> Are you sure you want to proceed?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmingReset}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleSystemReset();
              }}
              disabled={isConfirmingReset}
            >
              {isConfirmingReset ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "DELETE EVERYTHING"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
