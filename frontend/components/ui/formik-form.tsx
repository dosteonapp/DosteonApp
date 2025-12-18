"use client";

import React from "react";
import { ErrorMessage } from "formik";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// FormItem component for grouping form elements
const FormikFormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("form-item space-y-2", className)}
      {...props}
    />
  );
});
FormikFormItem.displayName = "FormikFormItem";

// FormLabel component with consistent styling
const FormikFormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn(
        "form-label text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
FormikFormLabel.displayName = "FormikFormLabel";

// FormControl wrapper for input elements
const FormikFormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("form-control", className)} {...props}>
      {children}
    </div>
  );
});
FormikFormControl.displayName = "FormikFormControl";

// FormMessage component for error messages
interface FormikFormMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

const FormikFormMessage = React.forwardRef<
  HTMLDivElement,
  FormikFormMessageProps
>(({ className, name, ...props }, ref) => {
  return (
    <ErrorMessage name={name}>
      {(msg) => (
        <div
          ref={ref}
          className={cn(
            "form-message text-sm font-medium text-destructive",
            className
          )}
          {...props}
        >
          {msg}
        </div>
      )}
    </ErrorMessage>
  );
});
FormikFormMessage.displayName = "FormikFormMessage";

// FormDescription component for additional help text
const FormikFormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "form-description text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
FormikFormDescription.displayName = "FormikFormDescription";

export {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
  FormikFormDescription,
};
