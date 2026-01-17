import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <Navbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </SessionProvider>
  );
}
