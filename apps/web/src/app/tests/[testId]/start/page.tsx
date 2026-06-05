"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft, Clock, Award, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function TestStartPage() {
  const { testId } = useParams();
  const router = useRouter();

  const { data: test, isLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tests/${testId}`);
      return data.data;
    },
  });

  const startTestMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/tests/${testId}/attempt`);
      return data.data; // returns the attempt
    },
    onSuccess: (attempt) => {
      // Enter full screen ideally here, but browsers require user interaction exactly on click
      router.push(`/tests/attempt/${attempt.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start test");
    }
  });

  const handleStartTest = () => {
    // Attempt fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request denied", err);
      });
    }
    startTestMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  if (!test) {
    return <div className="text-center p-8 text-error">Test not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tests
      </button>

      <div className="card p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
        <h1 className="text-3xl font-heading font-bold text-foreground mt-4 mb-2">{test.title}</h1>
        <p className="text-muted mb-8">{test.description}</p>

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
          <div className="bg-surface-2 p-4 rounded-xl flex flex-col items-center">
            <Clock className="w-6 h-6 text-primary mb-2" />
            <span className="text-xl font-bold">{test.duration}</span>
            <span className="text-xs text-muted">Minutes</span>
          </div>
          <div className="bg-surface-2 p-4 rounded-xl flex flex-col items-center">
            <FileText className="w-6 h-6 text-primary mb-2" />
            <span className="text-xl font-bold">{test._count?.questions || test.questions?.length || 0}</span>
            <span className="text-xs text-muted">Questions</span>
          </div>
          <div className="bg-surface-2 p-4 rounded-xl flex flex-col items-center">
            <Award className="w-6 h-6 text-accent mb-2" />
            <span className="text-xl font-bold">{test.totalMarks}</span>
            <span className="text-xs text-muted">Total Marks</span>
          </div>
        </div>

        <div className="text-left bg-warning/10 border border-warning/20 p-4 rounded-xl mb-8 flex gap-3 text-warning">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <strong>Important Instructions:</strong>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Do not refresh the page or press the back button once the test starts.</li>
              <li>Ensure you have a stable internet connection.</li>
              <li>The test will automatically submit when the timer reaches zero.</li>
              <li>Try to take the test in full-screen mode for the best experience.</li>
            </ul>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full sm:w-auto px-12 text-lg h-14"
          onClick={handleStartTest}
          disabled={startTestMutation.isPending}
        >
          {startTestMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "I am ready to begin"}
        </Button>
      </div>
    </div>
  );
}
