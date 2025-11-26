import React from "react";
import { Input, type InputProps } from "@/components/UI/Input";
import { FormField, type FormFieldProps } from "./FormField";

type TextFieldProps = Omit<FormFieldProps, "children"> &
  Omit<InputProps, "id"> & {
    id: string;
  };

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, requiredMark, description, error, className, ...inputProps }, ref) => (
    <FormField
      label={label}
      htmlFor={id}
      requiredMark={requiredMark}
      description={description}
      error={error}
      className={className}
    >
      <Input id={id} ref={ref} error={error} {...inputProps} />
    </FormField>
  )
);

TextField.displayName = "TextField";
