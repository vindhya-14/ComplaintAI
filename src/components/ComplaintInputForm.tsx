import React, { useState } from "react";
import { Upload, Send, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ComplaintInputFormProps {
  onSubmit: (complaints: string[]) => Promise<void>;
  isLoading: boolean;
}

export function ComplaintInputForm({
  onSubmit,
  isLoading,
}: ComplaintInputFormProps) {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const complaints = text.split("\n").filter((c) => c.trim().length > 0);
    await onSubmit(complaints);
    setText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          const complaints = Array.isArray(json) ? json : [json];
          onSubmit(complaints.map((c) => (typeof c === "string" ? c : c.text)));
        } else {
          setText(content);
        }
      } catch (err) {
        console.error("File upload error:", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={cn(
            "relative group border-2 border-dashed rounded-2xl p-5 md:p-7 transition-all duration-200 surface",
            isDragging
              ? "border-[var(--primary)] bg-blue-50"
              : "border-slate-200 hover:border-[var(--primary)]",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false); /* handle drop */
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste customer complaints here (one per line)..."
            className="w-full h-56 bg-transparent border-none focus:ring-0 resize-none text-slate-700 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <label
              className="cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Upload .txt or .json"
            >
              <Upload className="w-5 h-5 text-slate-500" />
              <input
                type="file"
                className="hidden"
                accept=".txt,.json"
                onChange={handleFileUpload}
              />
            </label>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-medium hover:bg-[var(--primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Analyze
            </button>
          </div>
        </div>
      </form>
      <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        Tip: Upload a JSON array, or paste one complaint per line for quick
        analysis.
      </div>
    </div>
  );
}
