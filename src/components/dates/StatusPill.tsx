import { DateStatus } from "@/types/alphabet";

function StatusPill({ status }: { status: DateStatus | null }) {
  if (!status)
    return (
      <span className="rounded-full border border-navy/15 px-2.5 py-0.5 font-hand text-sm text-muted-foreground">
        blank
      </span>
    );
  if (status === "completed")
    return (
      <span className="rounded-full border border-navy/40 bg-navy px-2.5 py-0.5 font-hand text-sm text-cream">
        completed
      </span>
    );
  return (
    <span className="rounded-full border border-burgundy/50 bg-burgundy/10 px-2.5 py-0.5 font-hand text-sm text-burgundy">
      planned
    </span>
  );
}

export default StatusPill;
