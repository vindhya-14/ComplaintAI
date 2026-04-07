import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Issue {
  _id: string;
  issue: string;
  label: string;
  priorityLevel: string;
}

interface InsightCardsProps {
  issues: Issue[];
}

export function InsightCards({ issues }: InsightCardsProps) {
  const safeIssues = Array.isArray(issues) ? issues : [];
  const critical = safeIssues.filter(
    (i) => i.label === "Critical & Widespread",
  )[0];
  const silent = safeIssues.filter((i) => i.label === "Silent but Frequent")[0];
  const loud = safeIssues.filter((i) => i.label === "Loud but Rare")[0];

  const cards = [
    {
      title: "Critical & Widespread",
      issue: critical?.issue || "No critical issues detected",
      icon: AlertCircle,
      color: "text-[var(--danger)]",
      bg: "bg-rose-50",
      border: "border-rose-100",
      description: "High impact, high frequency. Immediate action required.",
    },
    {
      title: "Silent but Frequent",
      issue: silent?.issue || "No silent issues detected",
      icon: TrendingUp,
      color: "text-[var(--primary)]",
      bg: "bg-blue-50",
      border: "border-blue-100",
      description: "Steady volume, low severity. Potential churn risk.",
    },
    {
      title: "Loud but Rare",
      issue: loud?.issue || "No loud issues detected",
      icon: Zap,
      color: "text-[var(--warning)]",
      bg: "bg-amber-50",
      border: "border-amber-100",
      description: "Extreme frustration, low volume. PR/Brand risk.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            "p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg surface",
            card.bg,
            card.border,
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn("p-2 rounded-xl bg-white shadow-sm", card.color)}
            >
              <card.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Insight
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            {card.title}
          </h3>
          <p className="text-sm font-medium text-slate-700 mb-4 line-clamp-2 min-h-[2.5rem]">
            {card.issue}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
