import { useState } from "react";
import { ComplaintInputForm } from "../components/ComplaintInputForm";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function Upload() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Analyzing, 3: Complete
  const navigate = useNavigate();

  const handleAnalyze = async (complaints: string[]) => {
    setIsAnalyzing(true);
    setStep(2);
    try {
      // Save complaints
      await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaints }),
      });

      // Run analysis
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaints }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      setStep(3);
      setTimeout(() => {
        navigate("/analysis");
      }, 1500);
    } catch (err) {
      console.error(err);
      setStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 md:py-8 appear-up">
      {step === 1 && (
        <div className="space-y-8">
          <div className="surface p-6 md:p-8 text-center space-y-2">
            <h2 className="text-3xl font-bold page-title tracking-tight">
              Ingest Complaints
            </h2>
            <p className="text-slate-600">
              Paste raw customer feedback or upload a dataset to begin your
              Mistral-powered analysis pipeline.
            </p>
          </div>
          <ComplaintInputForm
            onSubmit={handleAnalyze}
            isLoading={isAnalyzing}
          />
        </div>
      )}

      {step === 2 && (
        <div className="surface flex flex-col items-center justify-center space-y-8 py-20">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-spin border-t-[var(--primary)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              Running Mistral Insight Pipeline
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-slate-600 animate-pulse">
                Clustering issues and calculating priority...
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-1 bg-blue-100 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-[var(--primary)] animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="surface flex flex-col items-center justify-center space-y-6 py-20">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Analysis Complete
            </h2>
            <p className="text-slate-600">
              Redirecting to results dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
