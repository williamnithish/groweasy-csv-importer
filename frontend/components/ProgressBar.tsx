"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  label: string;
  value: number;
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="font-mono text-amber-soft">{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
