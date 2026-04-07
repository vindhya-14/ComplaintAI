import { CheckCircle2, Circle, Clock, MoreVertical, Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SprintTask {
  _id: string;
  userStory: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  selectedForSprint: boolean;
  issueId: {
    issue: string;
    category: string;
    priorityLevel: string;
  };
}

interface SprintBoardProps {
  tasks: SprintTask[];
}

export function SprintBoard({ tasks }: SprintBoardProps) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeTasks.map((task) => (
        <div
          key={task._id}
          className="group relative surface p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                "p-2 rounded-lg",
                task.issueId?.priorityLevel === "High"
                  ? "bg-red-50 text-red-600"
                  : task.issueId?.priorityLevel === "Medium"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600",
              )}
            >
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" />
                {task.storyPoints} pts
              </span>
              <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 mb-3 leading-relaxed">
            {task.userStory}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Acceptance Criteria
            </div>
            {task.acceptanceCriteria.slice(0, 3).map((criteria, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-slate-600"
              >
                <div className="mt-0.5">
                  <Circle className="w-2.5 h-2.5 text-[var(--primary)]" />
                </div>
                <span className="line-clamp-2">{criteria}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-[var(--primary)] border border-blue-200">
                AI
              </div>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                {task.issueId?.category}
              </span>
            </div>
            <button
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all",
                task.selectedForSprint
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)] shadow-sm",
              )}
            >
              {task.selectedForSprint ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : null}
              {task.selectedForSprint ? "Selected" : "Add to Sprint"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
