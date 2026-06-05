"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DoubtThreadPage() {
  const { doubtId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");

  const { data: doubt, isLoading } = useQuery({
    queryKey: ["doubt", doubtId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/doubts/${doubtId}`);
      return data.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/doubts/${doubtId}/reply`, {
        content: replyText,
      });
      return data.data;
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["doubt", doubtId] });
      toast.success("Reply added!");
    },
    onError: () => toast.error("Failed to add reply"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  if (!doubt) return <div className="text-center p-8">Doubt not found.</div>;

  const isResolved = doubt.status === "RESOLVED";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <button 
        onClick={() => router.push("/doubts")}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Doubts
      </button>

      {/* Main Doubt Post */}
      <div className="card p-6 md:p-8 relative overflow-hidden">
        {isResolved && (
          <div className="absolute top-0 right-0 bg-success text-white text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> RESOLVED
          </div>
        )}
        <h1 className="text-2xl font-bold font-heading mb-4 pr-16">{doubt.title}</h1>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center font-bold">
            {doubt.user?.profile?.name?.charAt(0) || "S"}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{doubt.user?.profile?.name || "Student"}</p>
            <p className="text-xs text-muted">{formatDate(doubt.createdAt)}</p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-foreground bg-surface-2 p-4 rounded-xl">
          <p className="whitespace-pre-wrap leading-relaxed">{doubt.description}</p>
        </div>
      </div>

      {/* Replies Section */}
      <div className="space-y-4 ml-4 md:ml-12 border-l-2 border-border pl-4 md:pl-8">
        <h3 className="font-heading font-bold text-lg mb-6">Replies ({doubt.replies?.length || 0})</h3>
        
        {doubt.replies?.map((reply: any) => {
          const isTeacher = reply.user?.role === "TEACHER" || reply.user?.role === "ADMIN";
          
          return (
            <div key={reply.id} className={`card p-5 ${isTeacher ? 'border-primary/50 bg-primary/5' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTeacher ? 'bg-primary text-white' : 'bg-surface-2 text-foreground'}`}>
                  {reply.user?.profile?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    {reply.user?.profile?.name || "User"}
                    {isTeacher && <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide">Teacher</span>}
                  </p>
                  <p className="text-xs text-muted">{formatDate(reply.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap text-foreground pl-11">{reply.content}</p>
            </div>
          );
        })}

        {/* Reply Box */}
        {!isResolved ? (
          <div className="card p-4 mt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.profile?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[80px] resize-y mb-3"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => replyMutation.mutate()}
                    disabled={!replyText.trim() || replyMutation.isPending}
                  >
                    {replyMutation.isPending ? "Posting..." : <><Send className="w-4 h-4 mr-2" /> Post Reply</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-2 p-4 rounded-xl text-center text-sm text-muted">
            This doubt has been marked as resolved. You cannot add new replies.
          </div>
        )}
      </div>
    </div>
  );
}
