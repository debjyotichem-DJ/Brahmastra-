"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Award, Target, Clock, CheckCircle2, XCircle, Share2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function TestResultPage() {
  const { attemptId } = useParams();
  const router = useRouter();

  const { data: resultData, isLoading } = useQuery({
    queryKey: ["testResult", attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tests/attempt/${attemptId}/result`);
      return data.data; // { attempt, test, rank, percentile }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  if (!resultData) return <div className="text-center p-8 text-error">Result not found.</div>;

  const { attempt, test, rank, percentile } = resultData;
  const accuracy = attempt.questionsAttempted > 0 
    ? Math.round((attempt.correctAnswers / attempt.questionsAttempted) * 100) 
    : 0;

  const chartData = [
    { name: "Correct", value: attempt.correctAnswers, color: "#22c55e" },
    { name: "Incorrect", value: attempt.incorrectAnswers, color: "#ef4444" },
    { name: "Skipped", value: test._count.questions - attempt.questionsAttempted, color: "#94a3b8" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <button 
        onClick={() => router.push("/tests")}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tests
      </button>

      {/* Hero Score Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 text-white shadow-card-hover relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-heading font-bold mb-2">{test.title}</h1>
          <p className="text-white/80 font-medium text-lg">Test Completed Successfully! 🎉</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
             <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[120px] text-center">
               <div className="text-sm text-white/80 mb-1">Your Score</div>
               <div className="text-3xl font-bold font-mono">{attempt.score} <span className="text-lg font-normal text-white/60">/ {test.totalMarks}</span></div>
             </div>
             {rank && (
               <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[120px] text-center">
                 <div className="text-sm text-white/80 mb-1">Rank</div>
                 <div className="text-3xl font-bold font-mono">#{rank}</div>
               </div>
             )}
             {percentile && (
               <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[120px] text-center">
                 <div className="text-sm text-white/80 mb-1">Percentile</div>
                 <div className="text-3xl font-bold font-mono">{percentile.toFixed(1)}%</div>
               </div>
             )}
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Share2 className="w-4 h-4 mr-2" /> Share Result Card
          </Button>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Chart */}
        <div className="card p-6 flex flex-col items-center justify-center col-span-1 md:col-span-1">
          <h3 className="font-heading font-bold text-foreground mb-4 w-full text-left">Accuracy Breakdown</h3>
          <div className="w-[200px] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
             <div>
               <div className="w-3 h-3 rounded-full bg-success mx-auto mb-1"></div>
               <div className="text-xl font-bold">{attempt.correctAnswers}</div>
               <div className="text-xs text-muted">Correct</div>
             </div>
             <div>
               <div className="w-3 h-3 rounded-full bg-error mx-auto mb-1"></div>
               <div className="text-xl font-bold">{attempt.incorrectAnswers}</div>
               <div className="text-xs text-muted">Wrong</div>
             </div>
             <div>
               <div className="w-3 h-3 rounded-full bg-slate-400 mx-auto mb-1"></div>
               <div className="text-xl font-bold">{test._count.questions - attempt.questionsAttempted}</div>
               <div className="text-xs text-muted">Skipped</div>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <div className="card p-6 flex flex-col justify-center bg-surface-2 border-transparent">
            <Target className="w-8 h-8 text-primary mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground">{accuracy}%</div>
            <div className="text-sm font-medium text-muted mt-1">Accuracy Rate</div>
          </div>
          <div className="card p-6 flex flex-col justify-center bg-surface-2 border-transparent">
            <Clock className="w-8 h-8 text-accent mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground">
              {Math.round(attempt.timeTaken / 60)} <span className="text-lg">m</span> {attempt.timeTaken % 60} <span className="text-lg">s</span>
            </div>
            <div className="text-sm font-medium text-muted mt-1">Total Time Taken</div>
          </div>
          <div className="card p-6 flex flex-col justify-center bg-surface-2 border-transparent">
            <CheckCircle2 className="w-8 h-8 text-success mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground">+{attempt.correctAnswers * 4 /* Assuming +4 for demo */}</div>
            <div className="text-sm font-medium text-muted mt-1">Positive Marks</div>
          </div>
          <div className="card p-6 flex flex-col justify-center bg-surface-2 border-transparent">
            <XCircle className="w-8 h-8 text-error mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground">-{attempt.incorrectAnswers * 1 /* Assuming -1 for demo */}</div>
            <div className="text-sm font-medium text-muted mt-1">Negative Marks</div>
          </div>
        </div>
      </div>

      <div className="card p-8 text-center mt-8">
        <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-heading font-bold mb-2">Detailed Solutions Available</h3>
        <p className="text-muted mb-6">Review your answers and learn from detailed step-by-step solutions for every question.</p>
        <Button size="lg" className="px-8">Review Answers</Button>
      </div>
    </div>
  );
}
