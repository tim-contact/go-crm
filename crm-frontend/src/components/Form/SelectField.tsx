import React from "react";
import { Select, type SelectProps } from "@/components/UI/Select";
import { FormField, type FormFieldProps } from "./FormField";

type SelectFieldProps = Omit<FormFieldProps, "children"> &
  Omit<SelectProps, "id"> & {
    id: string;
  };

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { id, label, requiredMark, description, error, className, children, ...selectProps },
    ref
  ) => (
    <FormField
      label={label}
      htmlFor={id}
      requiredMark={requiredMark}
      description={description}
      error={error}
      className={className}
    >
      <Select id={id} ref={ref} error={error} {...selectProps}>
        {children}
      </Select>
    </FormField>
  )
);

SelectField.displayName = "SelectField";
