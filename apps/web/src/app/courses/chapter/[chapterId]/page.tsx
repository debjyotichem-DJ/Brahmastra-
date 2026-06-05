"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { formatDuration } from "@/lib/utils";

export default function ChapterTopicsPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["topics", chapterId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/courses/chapters/${chapterId}/topics`);
      return data.data; // { chapter, topics }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  const { chapter, topics } = data || {};

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <PlayCircle className="w-5 h-5" />;
      case "PDF": return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={() => router.push(`/courses/${chapter?.subjectId}`)}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Chapters
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">{chapter?.name}</h1>
        <p className="text-muted mt-1">{t("courses.topics", "Topics")} & Lessons</p>
      </div>

      <div className="space-y-6">
        {topics?.map((topic: any, tIndex: number) => (
          <div key={topic.id} className="card overflow-hidden">
            <div className="bg-surface-2 p-4 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold text-sm">
                {tIndex + 1}
              </div>
              <h2 className="text-xl font-bold font-heading">{topic.name}</h2>
            </div>
            
            <div className="divide-y divide-border">
              {topic.lessons?.map((lesson: any) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="flex items-center p-4 hover:bg-surface-2/50 transition-colors group cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${lesson.isFree ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted'}`}>
                    {getLessonIcon(lesson.type)}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="bg-surface-2 px-2 py-0.5 rounded font-medium">
                        {lesson.type}
                      </span>
                      {lesson.duration && (
                        <span>{formatDuration(lesson.duration / 60)}</span>
                      )}
                      {lesson.isFree && (
                        <span className="text-success font-medium">Free Preview</span>
                      )}
                    </div>
                  </div>

                  {/* Actions/Status */}
                  <div className="ml-4 shrink-0 flex items-center">
                    {/* Placeholder for progress checkmark */}
                    {false && <CheckCircle2 className="w-5 h-5 text-success mr-2" />}
                    
                    {!lesson.isFree ? (
                       // Assuming we don't have enrollment check here yet, we just show a subtle lock for paid ones
                      <Lock className="w-4 h-4 text-muted/50" />
                    ) : null}
                  </div>
                </Link>
              ))}
              
              {topic.lessons?.length === 0 && (
                <div className="p-6 text-center text-muted text-sm">
                  No lessons added to this topic yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
