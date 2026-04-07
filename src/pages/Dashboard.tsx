import { useEffect, useState } from "react";
import { InsightCards } from "../components/InsightCards";
import { IssueTable } from "../components/IssueTable";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Radar,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Issue {
  _id: string;
  issue: string;
  category: string;
  sentiment: string;
  severity: number;
  frequency: number;
  priorityScore: number;
  priorityLevel: string;
  label: string;
}

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIssues([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="surface h-56 flex items-center justify-center text-slate-500 font-medium">
        Loading intelligence...
      </div>
    );
  }

  const safeIssues = Array.isArray(issues) ? issues : [];

  const stats = [
    {
      label: "Total Issues",
      value: safeIssues.length,
      icon: MessageSquare,
      color: "text-[var(--primary)]",
      bg: "bg-blue-50",
    },
    {
      label: "Critical",
      value: safeIssues.filter((i) => i.priorityLevel === "High").length,
      icon: AlertTriangle,
      color: "text-[var(--danger)]",
      bg: "bg-rose-50",
    },
    {
      label: "Ready Stories",
      value: safeIssues.filter((i) => i.label).length,
      icon: CheckCircle2,
      color: "text-[var(--success)]",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 appear-up">
      <section className="surface p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-slate-500">
            Executive Overview
          </p>
          <h2 className="page-title text-2xl md:text-3xl mt-1">
            Complaint Signals At A Glance
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Monitor issue volume, urgency, and sprint readiness from one
            dashboard.
          </p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-slate-900 text-white flex items-center gap-2 text-sm">
          <Radar className="w-4 h-4" />
          Live analysis feed
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="surface p-5 md:p-6 flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Signal Classification
          </h2>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mistral analysis
          </span>
        </div>
        <InsightCards issues={safeIssues} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Priority Queue</h2>
        </div>
        <IssueTable issues={safeIssues.slice(0, 5)} />
      </section>
    </div>
  );
}
