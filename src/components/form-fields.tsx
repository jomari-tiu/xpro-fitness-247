"use client"

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Thin wrappers around react-hook-form's Controller + shadcn Field so every form
// renders labels, descriptions and zod errors the same way.

interface BaseProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: React.ReactNode
  className?: string
  disabled?: boolean
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  type = "text",
  placeholder,
  autoComplete,
  min,
  max,
}: BaseProps<T> & {
  type?: "text" | "email" | "tel" | "password" | "date" | "time"
  placeholder?: string
  autoComplete?: string
  min?: string
  max?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            value={field.value ?? ""}
            id={field.name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            min={min}
            max={max}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  placeholder,
  step,
  nullable,
}: BaseProps<T> & { placeholder?: string; step?: string; nullable?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            id={field.name}
            type="number"
            inputMode="decimal"
            step={step ?? "any"}
            placeholder={placeholder}
            disabled={disabled}
            value={typeof field.value === "number" && Number.isFinite(field.value) ? field.value : ""}
            onChange={(e) =>
              field.onChange(e.target.value === "" ? (nullable ? null : Number.NaN) : e.target.valueAsNumber)
            }
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  placeholder,
  rows = 3,
}: BaseProps<T> & { placeholder?: string; rows?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Textarea
            {...field}
            value={field.value ?? ""}
            id={field.name}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

const NONE = "__none__"

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  options,
  placeholder = "Select…",
  noneLabel,
}: BaseProps<T> & {
  options: { value: string; label: string }[]
  placeholder?: string
  /** When set, adds an option that maps to an empty string */
  noneLabel?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            name={field.name}
            value={field.value === "" ? (noneLabel ? NONE : "") : field.value}
            onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
            disabled={disabled}
          >
            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} onBlur={field.onBlur} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {noneLabel && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid} className={className}>
          <FieldContent>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
          <Switch
            id={field.name}
            name={field.name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
        </Field>
      )}
    />
  )
}

export function CheckboxGroupField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  options,
  columns = 2,
}: BaseProps<T> & { options: { value: string; label: string; hint?: string }[]; columns?: 1 | 2 | 3 }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string[] = field.value ?? []
        const toggle = (v: string, checked: boolean) =>
          field.onChange(checked ? [...value, v] : value.filter((x) => x !== v))
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <div
              className={cn(
                "grid gap-2",
                columns === 2 && "sm:grid-cols-2",
                columns === 3 && "sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {options.map((o) => {
                const id = `${field.name}-${o.value}`
                return (
                  <label
                    key={o.value}
                    htmlFor={id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
                  >
                    <Checkbox
                      id={id}
                      checked={value.includes(o.value)}
                      onCheckedChange={(c) => toggle(o.value, c === true)}
                      className="mt-0.5"
                    />
                    <span className="flex flex-col">
                      <span className="font-medium">{o.label}</span>
                      {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
                    </span>
                  </label>
                )
              })}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}
