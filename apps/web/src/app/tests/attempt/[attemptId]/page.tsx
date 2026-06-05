"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import { Clock, LayoutGrid, AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // IMPORTANT: requires katex installed

type AnswerStatus = "ANSWERED" | "NOT_ANSWERED" | "MARKED_REVIEW" | "NOT_VISITED";

export default function TestAttemptPage() {
  const { attemptId } = useParams();
  const router = useRouter();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answerText: string, status: AnswerStatus }>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Test Data
  const { data: attemptData, isLoading } = useQuery({
    queryKey: ["testAttempt", attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tests/attempt/${attemptId}`);
      return data.data; // { attempt, test }
    },
    refetchOnWindowFocus: false,
  });

  const test = attemptData?.test;
  const questions = test?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize Timer and Status
  useEffect(() => {
    if (attemptData && timeLeft === null) {
      const startTime = new Date(attemptData.attempt.startTime).getTime();
      const now = new Date().getTime();
      const elapsedMs = now - startTime;
      const durationMs = test.duration * 60 * 1000;
      const remainingMs = durationMs - elapsedMs;
      
      setTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));

      // Initialize answers state from existing attempt data if it was partially saved
      const initialAnswers: Record<string, { answerText: string, status: AnswerStatus }> = {};
      questions.forEach((q: any) => {
        initialAnswers[q.id] = { answerText: "", status: "NOT_VISITED" };
      });
      // Mark first as not answered instead of not visited
      if (questions.length > 0) {
        initialAnswers[questions[0].id].status = "NOT_ANSWERED";
      }
      setAnswers(initialAnswers);
    }
  }, [attemptData, timeLeft, test, questions]);

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: { answers: any[] }) => {
      const { data } = await apiClient.post(`/tests/attempt/${attemptId}/submit`, payload);
      return data.data;
    },
    onSuccess: () => {
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
      toast.success("Test submitted successfully!");
      router.replace(`/tests/result/${attemptId}`);
    },
    onError: () => {
      toast.error("Failed to submit test. Please try again.");
      setIsSubmitting(false);
    }
  });

  const handleSubmitTest = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Format answers for API
    const formattedAnswers = Object.entries(answers)
      .filter(([_, val]) => val.answerText !== "")
      .map(([questionId, val]) => ({
        questionId,
        answerText: val.answerText
      }));

    submitMutation.mutate({ answers: formattedAnswers });
  }, [answers, submitMutation, isSubmitting]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft === null || isSubmitting) return;

    if (timeLeft <= 0) {
      toast.error("Time is up! Auto-submitting test.");
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev! - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, handleSubmitTest]);

  // Handlers
  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        answerText: optionId,
        status: "ANSWERED"
      }
    }));
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        answerText: "",
        status: prev[currentQuestion.id].status === "MARKED_REVIEW" ? "MARKED_REVIEW" : "NOT_ANSWERED"
      }
    }));
  };

  const handleMarkReview = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: "MARKED_REVIEW"
      }
    }));
    handleNext();
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextId = questions[currentQuestionIndex + 1].id;
      setAnswers(prev => {
        const nextStatus = prev[nextId].status;
        return {
          ...prev,
          [nextId]: {
            ...prev[nextId],
            status: nextStatus === "NOT_VISITED" ? "NOT_ANSWERED" : nextStatus
          }
        };
      });
      setCurrentQuestionIndex(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(curr => curr - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    const qId = questions[index].id;
    setAnswers(prev => {
      const qStatus = prev[qId].status;
      return {
        ...prev,
        [qId]: {
          ...prev[qId],
          status: qStatus === "NOT_VISITED" ? "NOT_ANSWERED" : qStatus
        }
      };
    });
    setCurrentQuestionIndex(index);
  };

  if (isLoading || !test) {
    return (
      <div className="fixed inset-0 bg-bg z-50 flex items-center justify-center">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  // Format time HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stats for the side panel
  const stats = {
    answered: Object.values(answers).filter(a => a.status === "ANSWERED").length,
    notAnswered: Object.values(answers).filter(a => a.status === "NOT_ANSWERED").length,
    marked: Object.values(answers).filter(a => a.status === "MARKED_REVIEW").length,
    notVisited: Object.values(answers).filter(a => a.status === "NOT_VISITED").length,
  };

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col md:flex-row overflow-hidden font-sans text-foreground">
      
      {/* Left Area: Main Question Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <h1 className="font-heading font-bold text-lg truncate pr-4">{test.title}</h1>
          <div className="flex items-center gap-2 bg-surface-2 px-4 py-1.5 rounded-full shrink-0">
            <Clock className={cn("w-4 h-4", timeLeft && timeLeft < 300 ? "text-error animate-pulse" : "text-primary")} />
            <span className={cn("font-mono font-bold text-lg", timeLeft && timeLeft < 300 && "text-error")}>
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-primary">Question {currentQuestionIndex + 1}</h2>
              <div className="text-sm font-medium text-muted bg-surface-2 px-3 py-1 rounded-md">
                + {currentQuestion.marks} Marks | - {currentQuestion.negativeMarks} Marks
              </div>
            </div>

            {/* Render Question with KaTeX support */}
            <div className="prose dark:prose-invert max-w-none mb-8 text-lg font-medium leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {currentQuestion.text}
              </ReactMarkdown>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option: any, idx: number) => {
                const isSelected = answers[currentQuestion.id]?.answerText === option.id;
                const labels = ["A", "B", "C", "D", "E", "F"];
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border bg-surface hover:border-primary/50 hover:bg-surface-2"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                      isSelected ? "bg-primary text-white" : "bg-surface-2 text-muted border border-border"
                    )}>
                      {labels[idx]}
                    </div>
                    <div className="flex-1 prose dark:prose-invert prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {option.text}
                      </ReactMarkdown>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="h-20 bg-surface border-t border-border flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleMarkReview}>
              Mark for Review
            </Button>
            <Button variant="ghost" onClick={handleClearResponse} className="text-muted hover:text-error">
              Clear Response
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1} className="w-32">
              Save & Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Area: Navigation Panel */}
      <div className="w-full md:w-[320px] bg-surface border-l border-border flex flex-col shrink-0 h-64 md:h-full">
        <div className="p-4 border-b border-border bg-surface-2/50 flex items-center gap-2 font-heading font-bold text-foreground">
          <LayoutGrid className="w-5 h-5 text-primary" /> Question Palette
        </div>
        
        {/* Status Legend */}
        <div className="grid grid-cols-2 gap-2 p-4 text-xs font-medium border-b border-border bg-bg">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-success text-white flex items-center justify-center">{stats.answered}</span> Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-error text-white flex items-center justify-center">{stats.notAnswered}</span> Not Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">{stats.marked}</span> Marked Review
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-surface border border-border text-muted flex items-center justify-center">{stats.notVisited}</span> Not Visited
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q: any, idx: number) => {
              const status = answers[q.id]?.status || "NOT_VISITED";
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={cn(
                    "h-10 text-sm font-bold transition-all",
                    status === "ANSWERED" && "bg-success text-white rounded-t-md rounded-b-xl", // Custom shape for answered
                    status === "NOT_ANSWERED" && "bg-error text-white rounded-b-md rounded-t-xl",
                    status === "MARKED_REVIEW" && "bg-accent text-white rounded-full",
                    status === "NOT_VISITED" && "bg-surface border border-border text-foreground hover:bg-surface-2 rounded-md",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-bg shadow-lg scale-110 z-10"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-border bg-surface shrink-0">
          <Button 
            className="w-full bg-success hover:bg-success/90 text-white font-bold h-12 text-lg shadow-card-hover"
            onClick={() => {
              if (window.confirm("Are you sure you want to submit the test? You cannot change answers after submitting.")) {
                handleSubmitTest();
              }
            }}
            isLoading={isSubmitting}
          >
            Submit Test
          </Button>
        </div>
      </div>
    </div>
  );
}
