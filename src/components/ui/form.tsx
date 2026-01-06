"use client"

import * as React from "react"
import {
  useFormContext,
  FormProvider,
  type UseFormReturn,
  type FieldValues,
} from "react-hook-form"
import { cn } from "@/lib/utils/cn"

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void | Promise<void>
  children: React.ReactNode
  className?: string
}

function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  )
}

interface FormFieldProps {
  name: string
  children: (props: {
    field: {
      value: any
      onChange: (value: any) => void
      onBlur: () => void
      name: string
      ref: React.Ref<any>
    }
    fieldState: {
      error?: { message?: string }
    }
  }) => React.ReactNode
}

function FormField({ name, children }: FormFieldProps) {
  const form = useFormContext()
  const fieldState = form.formState.errors[name]

  return (
    <>
      {children({
        field: {
          value: form.watch(name),
          onChange: (value) => form.setValue(name, value, { shouldValidate: true }),
          onBlur: () => form.trigger(name),
          name,
          ref: form.register(name).ref,
        },
        fieldState: {
          error: fieldState as { message?: string },
        },
      })}
    </>
  )
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormItem({ className, ...props }: FormItemProps) {
  return <div className={cn("space-y-2", className)} {...props} />
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormMessage({ className, children, ...props }: FormMessageProps) {
  if (!children) return null
  return (
    <p className={cn("text-sm font-medium text-red-600", className)} {...props}>
      {children}
    </p>
  )
}

export { Form, FormField, FormItem, FormLabel, FormMessage }


