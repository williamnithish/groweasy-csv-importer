"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportButtonProps {
  onClick: () => void;
  loading: boolean;
  rowCount: number;
}

export function ImportButton({ onClick, loading, rowCount }: ImportButtonProps) {
  return (
    <Button size="lg" onClick={onClick} disabled={loading} className="w-full sm:w-auto">
      <Sparkles className="h-4 w-4" />
      {loading
        ? "Mapping rows to CRM schema…"
        : `Confirm import · ${rowCount.toLocaleString()} rows`}
    </Button>
  );
}
