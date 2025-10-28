import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";
import { FormFieldContext, FormItemContext, useFormField } from "./form-context";

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <LabelPrimitive.Root ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

export { FormField, FormLabel, useFormField, FormItemContext };