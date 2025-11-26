import React from "react";
import { cn } from "@/lib/cn";

export type FormFieldProps = {
  label: string;
  htmlFor?: string;
  requiredMark?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  requiredMark,
  description,
  error,
  children,
  className,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-800"
    >
      {label}
      {requiredMark && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);
