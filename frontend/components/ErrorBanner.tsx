import { AlertTriangle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-signal-red/30 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="focus-ring shrink-0 text-signal-red/70 hover:text-signal-red">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
