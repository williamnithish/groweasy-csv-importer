import { CheckCircle2, XCircle, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportResult } from "@/types/crm";

interface SummaryCardsProps {
  result: ImportResult;
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const total = result.totalImported + result.totalSkipped;
  const successRate = total === 0 ? 0 : Math.round((result.totalImported / total) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Imported</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-signal-green" />
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-semibold text-ink">
            {result.totalImported.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-muted">records mapped to the CRM schema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Skipped</CardTitle>
          <XCircle className="h-4 w-4 text-signal-red" />
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-semibold text-ink">
            {result.totalSkipped.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-muted">missing both email and mobile</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Success rate</CardTitle>
          <Percent className="h-4 w-4 text-amber" />
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-semibold text-ink">{successRate}%</p>
          <p className="mt-1 text-xs text-ink-muted">of {total.toLocaleString()} total rows</p>
        </CardContent>
      </Card>
    </div>
  );
}
