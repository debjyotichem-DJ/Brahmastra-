"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { HlsPlayer } from "@/components/video/HlsPlayer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LessonViewerPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const [progressMarked, setProgressMarked] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/courses/lessons/${lessonId}`);
      return data.data;
    },
  });

  const progressMutation = useMutation({
    mutationFn: async ({ timeWatched, completed }: { timeWatched: number, completed: boolean }) => {
      await apiClient.post(`/courses/lessons/${lessonId}/progress`, {
        timeWatched,
        completed
      });
    },
    onSuccess: (_, variables) => {
      if (variables.completed && !progressMarked) {
        setProgressMarked(true);
        toast.success("Lesson marked as completed! 🎉");
      }
    }
  });

  // Track progress periodically if it's a PDF or article
  useEffect(() => {
    if (lesson && lesson.type !== "VIDEO" && !progressMarked) {
      const timer = setTimeout(() => {
        progressMutation.mutate({ timeWatched: 60, completed: true });
      }, 5000); // Mark complete after 5 seconds of viewing non-video content
      return () => clearTimeout(timer);
    }
  }, [lesson, progressMarked]);

  const handleVideoProgress = (current: number, total: number) => {
    // Save progress every 30 seconds
    if (Math.floor(current) % 30 === 0 && current > 0) {
      progressMutation.mutate({ timeWatched: current, completed: false });
    }
    // Mark complete if 90% watched
    if (total > 0 && current / total > 0.9 && !progressMarked) {
      progressMutation.mutate({ timeWatched: current, completed: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center p-8">Lesson not found or you don't have access.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </button>
        
        {progressMarked && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </span>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{lesson.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="bg-surface-2 px-2.5 py-0.5 rounded-md font-medium text-foreground">
            {lesson.type}
          </span>
          {lesson.topic?.name && <span>Topic: {lesson.topic.name}</span>}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {lesson.type === "VIDEO" && lesson.contentUrl ? (
          <HlsPlayer 
            src={lesson.contentUrl} 
            poster={lesson.thumbnailUrl}
            onProgress={handleVideoProgress}
            onEnded={() => {
              if (!progressMarked) {
                progressMutation.mutate({ timeWatched: lesson.duration || 0, completed: true });
              }
            }}
          />
        ) : lesson.type === "PDF" && lesson.contentUrl ? (
          <div className="aspect-[1/1.4] w-full bg-surface-2 relative">
            <iframe 
              src={`${lesson.contentUrl}#toolbar=0`} 
              className="w-full h-full border-0"
              title={lesson.title}
            />
          </div>
        ) : (
          <div className="p-8 prose dark:prose-invert max-w-none">
            {lesson.content || "Content goes here"}
          </div>
        )}
      </div>

      {lesson.description && (
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-2">About this lesson</h3>
          <p className="text-muted whitespace-pre-wrap">{lesson.description}</p>
        </div>
      )}
    </div>
  );
}
