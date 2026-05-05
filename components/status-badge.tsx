import { Badge, badgeTone } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";

export function StatusBadge({ value }: { value: string | number }) {
  const text = String(value);
  return <Badge tone={badgeTone(text)}>{titleCase(text)}</Badge>;
}
