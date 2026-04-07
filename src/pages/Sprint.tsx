import { useEffect, useState } from "react";
import { SprintBoard } from "../components/SprintBoard";
import { Plus, Rocket } from "lucide-react";

export default function Sprint() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sprint")
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setTasks([]);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="surface h-56 flex items-center justify-center text-slate-500 font-medium">
        Loading sprint board...
      </div>
    );

  return (
    <div className="space-y-8 appear-up">
      <div className="surface p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold page-title tracking-tight">
            Sprint Backlog
          </h2>
          <p className="text-sm text-slate-600">
            AI-generated user stories and sprint-ready tasks from customer
            feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Plus className="w-4 h-4" />
            Custom Task
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-strong)] transition-colors shadow-sm">
            <Rocket className="w-4 h-4" />
            Start Sprint
          </button>
        </div>
      </div>

      <SprintBoard tasks={tasks} />
    </div>
  );
}
