import { buildBreakdown } from "@/lib/pricing";
import type { Holiday } from "@/content/types";
import { formatGBP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PriceBreakdown({ holiday, travellers }: { holiday: Holiday; travellers: number }) {
  const b = buildBreakdown(holiday, travellers);

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <tbody>
          {b.lines.map((line, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="px-4 py-3 align-top">
                <div className="font-medium">{line.label}</div>
                {line.detail && <div className="text-xs text-muted-foreground">{line.detail}</div>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right align-top font-medium tabular-nums">
                {line.amount != null ? (
                  formatGBP(line.amount)
                ) : (
                  <span className="text-xs font-normal text-muted-foreground">to confirm</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/60">
            <td className="px-4 py-3 font-semibold">
              {b.complete ? "Total" : "Total so far"}
              {!b.complete && (
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                  Pending: {b.pending.join(", ")}
                </div>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">
              {formatGBP(b.knownTotal)}
            </td>
          </tr>
          {b.perPerson != null && (
            <tr className="bg-muted/60 border-t">
              <td className="px-4 py-2.5 text-sm text-muted-foreground">
                Per person <span className="opacity-70">({travellers} adults)</span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm font-semibold tabular-nums">
                {formatGBP(b.perPerson)}
                {!b.complete && <span className="ml-1 text-xs font-normal text-muted-foreground">so far</span>}
              </td>
            </tr>
          )}
        </tfoot>
      </table>
      {!b.complete && (
        <div className="border-t bg-background px-4 py-2">
          <Badge variant="warning">Partial estimate — add flights &amp; car hire for the full total</Badge>
        </div>
      )}
    </div>
  );
}
