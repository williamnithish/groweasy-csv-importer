import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring flex h-9 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-faint",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
