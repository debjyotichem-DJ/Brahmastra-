"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { FlaskConical, Clock, Award, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function TestsPage() {
  const { t } = useTranslation();

  const { data: tests, isLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const { data } = await apiClient.get("/tests");
      return data.data; // array of tests with attempt info
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-error/20 text-error flex items-center justify-center">
          <FlaskConical className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{t("tests.allTests", "All Tests")}</h1>
          <p className="text-muted mt-1">Take practice and mock tests to assess your preparation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests?.map((test: any) => {
          const isAttempted = test.testAttempts && test.testAttempts.length > 0;
          const bestAttempt = isAttempted 
            ? test.testAttempts.reduce((prev: any, curr: any) => (prev.score > curr.score ? prev : curr))
            : null;

          return (
            <div key={test.id} className="card p-6 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-2 py-1 rounded bg-surface-2 text-muted uppercase tracking-wider">
                  {test.type}
                </span>
                {isAttempted && (
                  <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Attempted
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                {test.title}
              </h3>
              <p className="text-sm text-muted line-clamp-2 mb-6 flex-1">
                {test.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-muted bg-surface-2 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {test.duration} mins
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  {test.totalMarks} marks
                </div>
              </div>

              {isAttempted ? (
                <div className="flex items-center justify-between mt-auto border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted">Best Score</p>
                    <p className="text-lg font-bold text-foreground">{bestAttempt?.score} / {test.totalMarks}</p>
                  </div>
                  <Link 
                    href={`/tests/result/${bestAttempt?.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View Result <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <Link 
                  href={`/tests/${test.id}/start`}
                  className="mt-auto w-full inline-flex items-center justify-center bg-primary text-white py-2.5 rounded-button font-medium hover:bg-primary-dark transition-colors"
                >
                  {t("tests.startTest", "Start Test")}
                </Link>
              )}
            </div>
          );
        })}
        
        {tests?.length === 0 && (
          <div className="col-span-full card p-12 text-center border-dashed">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted/50" />
            <h3 className="text-lg font-medium text-foreground">No tests available</h3>
            <p className="text-muted mt-1">Check back later for new mock tests and practice papers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
