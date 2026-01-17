"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Complete API reference for AWS Device Farm Hub
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <SwaggerUI url="/openapi.json" />
        </div>
      </div>
    </div>
  );
}
