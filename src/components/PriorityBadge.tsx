import { cn } from "@/src/lib/utils";

interface PriorityBadgeProps {
  level: string;
  className?: string;
}

export function PriorityBadge({ level, className }: PriorityBadgeProps) {
  const colors = {
    High: "bg-rose-100 text-[var(--danger)] border-rose-200",
    Medium: "bg-amber-100 text-[var(--warning)] border-amber-200",
    Low: "bg-emerald-100 text-[var(--success)] border-emerald-200",
  };

  const colorClass =
    colors[level as keyof typeof colors] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className,
      )}
    >
      {level}
    </span>
  );
}
