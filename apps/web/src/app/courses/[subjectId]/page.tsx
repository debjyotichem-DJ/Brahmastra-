"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft, BookOpen, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function SubjectChaptersPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/courses/subjects/${subjectId}/chapters`);
      return data.data; // { subject, chapters }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  const { subject, chapters } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb / Back button */}
      <button 
        onClick={() => router.push("/courses")}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{subject?.name}</h1>
          <p className="text-muted mt-1">{t("courses.chapters", "Chapters")}</p>
        </div>
      </div>

      <div className="space-y-4">
        {chapters?.map((chapter: any, index: number) => (
          <Link 
            key={chapter.id} 
            href={`/courses/chapter/${chapter.id}`}
            className="card p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group cursor-pointer hover:border-primary/50"
          >
            <div className="flex items-start sm:items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-foreground font-bold shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {chapter.name}
                </h3>
                <p className="text-sm text-muted mt-1 line-clamp-1">{chapter.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-border sm:border-none">
              <div className="flex items-center gap-2 text-sm text-muted font-medium">
                <Layers className="w-4 h-4 text-primary" />
                {chapter.topicCount} {t("courses.topics", "Topics")}
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
        
        {chapters?.length === 0 && (
          <div className="card p-12 text-center border-dashed">
            <p className="text-muted">No chapters available for this subject yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
