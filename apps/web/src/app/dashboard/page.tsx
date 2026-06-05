"use client";

import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Flame, PlayCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard");
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  const { streak, subjectProgress, upcomingClasses, quoteOfTheDay, recentScores } = dashboardData || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Hey {user?.profile?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted mt-1">Let's continue learning chemistry today.</p>
        </div>
        
        {/* Streak card */}
        <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm shrink-0">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-dark">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Day Streak 🔥</div>
            <div className="text-xl font-bold text-foreground">{streak || 0}</div>
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <h3 className="font-heading text-lg opacity-90 mb-2">Quote of the Day</h3>
        <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-3xl">"{quoteOfTheDay}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress */}
          <section>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Your Progress
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectProgress?.map((subject: any) => (
                <div key={subject.subjectId} className="card p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-foreground">{subject.subjectName}</h3>
                    <span className="text-sm font-bold text-primary">{subject.percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-2 mb-3">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted">
                    {subject.completedLessons} of {subject.totalLessons} lessons completed
                  </p>
                </div>
              ))}
              
              {(!subjectProgress || subjectProgress.length === 0) && (
                <div className="col-span-full card p-8 text-center border-dashed bg-transparent">
                  <p className="text-muted mb-4">You haven't enrolled in any batches yet.</p>
                  <button className="text-primary font-medium hover:underline">Browse Batches</button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Tests */}
          {recentScores?.length > 0 && (
             <section>
               <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-success" /> Recent Tests
               </h2>
               <div className="card divide-y divide-border">
                 {recentScores.slice(0, 3).map((score: any) => (
                   <div key={score.testId} className="p-4 flex items-center justify-between hover:bg-surface-2/50 transition-colors">
                     <div>
                       <h4 className="font-medium text-sm text-foreground">{score.testTitle}</h4>
                       <p className="text-xs text-muted mt-1">{new Date(score.date).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                       <div className="text-lg font-bold text-foreground">
                         {score.score} <span className="text-sm text-muted font-normal">/ {score.totalMarks}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
          )}
        </div>

        {/* Right Column (Sidebar content) */}
        <div className="space-y-6">
          
          {/* Upcoming Classes */}
          <section className="card overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-2/30 flex justify-between items-center">
              <h2 className="font-heading font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" /> Upcoming Live
              </h2>
            </div>
            <div className="p-0">
              {upcomingClasses?.length > 0 ? (
                <div className="divide-y divide-border">
                  {upcomingClasses.map((liveClass: any) => (
                    <div key={liveClass.id} className="p-4 hover:bg-surface-2/50 transition-colors group">
                      <div className="text-xs font-medium text-primary mb-1">
                        {new Date(liveClass.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {formatDuration(liveClass.duration)}
                      </div>
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {liveClass.title}
                      </h4>
                      <p className="text-xs text-muted mt-1 line-clamp-1">{liveClass.batch.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted">
                  <PlayCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming live classes scheduled.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
