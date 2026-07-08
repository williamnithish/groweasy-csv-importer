import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  title: string;
  subtitle?: string;
}

export function LoadingOverlay({ title, subtitle }: LoadingOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-border bg-surface px-8 py-14 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-amber" />
      <p className="font-display text-sm font-medium text-ink">{title}</p>
      {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
    </div>
  );
}
