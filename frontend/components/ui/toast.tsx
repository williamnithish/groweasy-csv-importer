"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((toast: Omit<ToastItem, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() + Math.random() }]);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={5000}
            onOpenChange={(open) => {
              if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }}
            className={cn(
              "font-sans data-[state=open]:animate-fade-up flex items-start gap-3 rounded-card border px-4 py-3 shadow-lg",
              t.variant === "success"
                ? "border-signal-green/30 bg-surface-raised"
                : "border-signal-red/30 bg-surface-raised"
            )}
          >
            {t.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-green" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-red" />
            )}
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-medium text-ink">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-ink-muted">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="focus-ring text-ink-faint hover:text-ink">
              <X className="h-3.5 w-3.5" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
