import React from "react";
import { cn } from "@/lib/cn";

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement>;

export const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => (
  <div
    className={cn(
      "h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600",
      className
    )}
    {...props}
  />
);
