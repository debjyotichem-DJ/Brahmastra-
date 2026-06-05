"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CoursesPage() {
  const { t } = useTranslation();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await apiClient.get("/courses/subjects");
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary-dark flex items-center justify-center">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">{t("courses.subjects", "Subjects")}</h1>
          <p className="text-muted mt-1">Select a subject to start learning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject: any) => (
          <Link 
            key={subject.id} 
            href={`/courses/${subject.id}`}
            className="card group overflow-hidden flex flex-col"
          >
            {/* Subject Header */}
            <div className="h-32 bg-gradient-to-br from-primary to-primary-dark p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
              <h2 className="text-2xl font-bold text-white relative z-10 font-heading">{subject.name}</h2>
            </div>
            
            {/* Subject Body */}
            <div className="p-6 flex-1 flex flex-col bg-surface">
              <p className="text-muted text-sm flex-1 line-clamp-2 mb-6">
                {subject.description || `Master the concepts of ${subject.name} with structured chapters and topics.`}
              </p>
              
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {subject.chapterCount} {t("courses.chapters", "Chapters")}
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
