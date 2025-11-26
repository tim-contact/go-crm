import React from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "danger";

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantClassNames: Record<AlertVariant, string> = {
  info: "bg-blue-50 text-blue-800 border-blue-200",
  success: "bg-green-50 text-green-800 border-green-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  danger: "bg-red-50 text-red-800 border-red-200",
};

export const Alert: React.FC<AlertProps> = ({
  className,
  children,
  variant = "info",
  ...props
}) => (
  <div
    className={cn(
      "rounded-lg border px-4 py-3 text-sm",
      variantClassNames[variant],
      className
    )}
    role="alert"
    {...props}
  >
    {children}
  </div>
);
