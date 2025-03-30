
import React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, message, ...props }, ref) => {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className={cn("animate-spin", className)}
          {...props}
          ref={ref}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    );
  }
);

Loader.displayName = "Loader";
