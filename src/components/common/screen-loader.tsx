"use client";

import { LoaderCircle } from "lucide-react";

export function ScreenLoader() {
  return (
    <div className="flex flex-col items-center gap-6 justify-center fixed inset-0 z-50 transition-opacity duration-700 ease-in-out">
      <img
        className="lg:w-56 w-36 md:w-40 h-auto max-w-full"
        src="/assets/images/widyatama-logo.png"
        alt="Universitas Widyatama"
      />
      <div className="flex items-center gap-2">
        <div role="status">
          <LoaderCircle className="w-5 h-5 text-primary animate-spin" />
        </div>
        <div className="text-muted-foreground font-medium text-sm">
          Loading...
        </div>
      </div>
    </div>
  );
}
