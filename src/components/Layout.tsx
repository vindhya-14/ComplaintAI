import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Kanban,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Upload", path: "/upload", icon: UploadCloud },
    { name: "Analysis", path: "/analysis", icon: BarChart3 },
    { name: "Sprint", path: "/sprint", icon: Kanban },
  ];

  return (
    <div className="min-h-screen flex p-4 md:p-6 gap-4 md:gap-6">
      <aside className="w-[84px] md:w-72 surface subtle-grid flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-200">
          <div className="w-11 h-11 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-300/50">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <span className="font-bold text-slate-900 tracking-tight block">
              ComplaintAI
            </span>
            <span className="text-xs text-slate-500">
              Experience Intelligence
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 md:px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                location.pathname === item.path
                  ? "bg-[color-mix(in_srgb,var(--primary)_10%,white_90%)] text-[var(--primary)] shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  location.pathname === item.path
                    ? "text-[var(--primary)]"
                    : "text-slate-400",
                )}
              />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="m-3 md:m-4 p-4 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest opacity-85">
              Model
            </p>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="mt-2 text-sm font-semibold">Mistral Pipeline Active</p>
          <div className="mt-3 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-white h-full w-[86%]" />
          </div>
          <p className="mt-2 text-[11px] text-white/80 hidden md:block">
            Ready for intake and synthesis
          </p>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="surface h-20 px-4 md:px-8 flex items-center justify-between sticky top-4 z-10">
          <h1 className="text-lg md:text-2xl font-bold page-title text-slate-900">
            {navItems.find((i) => i.path === location.pathname)?.name ||
              "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img
                src="https://picsum.photos/seed/engineer/100/100"
                alt="Avatar"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
