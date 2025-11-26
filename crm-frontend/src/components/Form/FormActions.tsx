import React from "react";
import { cn } from "@/lib/cn";

type FormActionsProps = React.HTMLAttributes<HTMLDivElement>;

export const FormActions: React.FC<FormActionsProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-gray-100 pt-4 mt-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
