"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Zap, FileText, TestTube } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Zap className="h-5 w-5" />
            Device Farm Hub
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/api-docs">
              <Button variant={pathname === "/api-docs" ? "secondary" : "ghost"} size="sm">
                <FileText className="mr-2 h-4 w-4" />
                API Docs
              </Button>
            </Link>
            <Link href="/api-test">
              <Button variant={pathname === "/api-test" ? "secondary" : "ghost"} size="sm">
                <TestTube className="mr-2 h-4 w-4" />
                API Test
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.user && (
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
          )}
          <ThemeToggle />
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
