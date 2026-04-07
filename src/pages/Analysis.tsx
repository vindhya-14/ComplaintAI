import { useEffect, useMemo, useState } from "react";
import { IssueTable } from "../components/IssueTable";
import { Filter, Download } from "lucide-react";

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

export default function Analysis() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState("All");
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

  const filteredIssues = useMemo(() => {
    if (filter === "All") {
      return issues;
    }

    return issues.filter((i) => i.priorityLevel === filter);
  }, [issues, filter]);

  const exportCsv = () => {
    if (filteredIssues.length === 0) {
      return;
    }

    const headers = [
      "Issue",
      "Category",
      "Sentiment",
      "Severity",
      "Frequency",
      "PriorityScore",
      "PriorityLevel",
      "Label",
    ];
    const rows = filteredIssues.map((item) => [
      item.issue,
      item.category,
      item.sentiment,
      item.severity,
      item.frequency,
      item.priorityScore,
      item.priorityLevel,
      item.label,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "complaint-analysis.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="surface h-56 flex items-center justify-center text-slate-500 font-medium">
        Loading analysis...
      </div>
    );
  }

  return (
    <div className="space-y-6 appear-up">
      <div className="surface p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold page-title tracking-tight">
            Clustered Issues
          </h2>
          <p className="text-sm text-slate-600">
            Explore issue clusters and export filtered results for stakeholder
            reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
            <Filter className="w-4 h-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="All">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-strong)] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <IssueTable issues={filteredIssues} />
    </div>
  );
}
