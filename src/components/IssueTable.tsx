import { PriorityBadge } from "./PriorityBadge";
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

interface IssueTableProps {
  issues: Issue[];
}

export function IssueTable({ issues }: IssueTableProps) {
  const safeIssues = Array.isArray(issues) ? issues : [];
  return (
    <div className="overflow-x-auto rounded-2xl surface">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-bottom border-slate-200">
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Issue
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Severity
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Freq
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Label
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {safeIssues.map((item) => (
            <tr
              key={item._id}
              className="hover:bg-slate-50/60 transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900 group-hover:text-[var(--primary)] transition-colors">
                  {item.issue}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.sentiment}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        item.severity > 7
                          ? "bg-red-500"
                          : item.severity > 4
                            ? "bg-amber-500"
                            : "bg-emerald-500",
                      )}
                      style={{ width: `${item.severity * 10}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {item.severity}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center text-sm text-slate-600 font-medium">
                {item.frequency}
              </td>
              <td className="px-6 py-4">
                <PriorityBadge level={item.priorityLevel} />
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded border",
                    item.label === "Critical & Widespread"
                      ? "text-red-600 border-red-200 bg-red-50"
                      : item.label === "Silent but Frequent"
                        ? "text-indigo-600 border-indigo-200 bg-indigo-50"
                        : "text-amber-600 border-amber-200 bg-amber-50",
                  )}
                >
                  {item.label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
