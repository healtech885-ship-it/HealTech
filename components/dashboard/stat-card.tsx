import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StatusTone } from "@/types/app.types";

export function StatCard({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  tone?: StatusTone | string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">{label}</p>
          <p className="mt-2 table-numeric text-3xl font-bold tracking-normal text-[var(--on-surface)]">{value}</p>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{helper}</p>
        </div>
        <Badge tone={tone as StatusTone}>
          <Activity className="h-3.5 w-3.5" />
        </Badge>
      </CardContent>
    </Card>
  );
}
