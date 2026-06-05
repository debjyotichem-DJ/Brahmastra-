"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Calendar, Video, Clock, Users, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDuration, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LiveClassesPage() {
  const { t } = useTranslation();

  const { data: classes, isLoading } = useQuery({
    queryKey: ["live-classes"],
    queryFn: async () => {
      const { data } = await apiClient.get("/live-classes");
      return data.data; // array of live classes
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  const upcomingClasses = classes?.filter((c: any) => c.status === "SCHEDULED" || c.status === "LIVE") || [];
  const pastClasses = classes?.filter((c: any) => c.status === "COMPLETED") || [];

  const handleJoinClass = (liveClass: any) => {
    if (liveClass.meetingLink) {
      window.open(liveClass.meetingLink, "_blank");
    } else {
      // In a real app, route to the Agora embedded video room
      alert("Redirecting to internal live classroom...");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center">
          <Calendar className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{t("nav.live", "Live Classes")}</h1>
          <p className="text-muted mt-1">Join interactive live sessions with your instructors</p>
        </div>
      </div>

      {/* Upcoming & Live */}
      <section>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
          Upcoming & Live Now
        </h2>
        
        {upcomingClasses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingClasses.map((c: any) => {
              const isLive = c.status === "LIVE";
              const date = new Date(c.scheduledAt);
              
              return (
                <div key={c.id} className={`card p-6 border-2 transition-all ${isLive ? 'border-error shadow-glow relative overflow-hidden' : 'border-transparent hover:border-primary/30'}`}>
                  {isLive && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span> Live Now
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-2 flex flex-col items-center justify-center shrink-0 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold text-foreground">{date.getDate()}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{c.title}</h3>
                      <p className="text-sm text-primary font-medium mb-4">{c.batch?.name || "General Batch"}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted mb-6">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDuration(c.duration)})
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          Interactive
                        </div>
                      </div>

                      <Button 
                        className="w-full sm:w-auto"
                        variant={isLive ? "danger" : "default"}
                        onClick={() => handleJoinClass(c)}
                      >
                        {isLive ? (
                          <><Video className="w-4 h-4 mr-2" /> Join Class Now</>
                        ) : (
                          "Set Reminder"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center border-dashed">
             <Calendar className="w-12 h-12 mx-auto mb-4 text-muted/50" />
             <h3 className="text-lg font-medium text-foreground">No upcoming classes</h3>
             <p className="text-muted mt-1">Check back later or view past recordings below.</p>
          </div>
        )}
      </section>

      {/* Past Recordings */}
      {pastClasses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-heading font-bold mb-4">Past Recordings</h2>
          <div className="card divide-y divide-border">
            {pastClasses.map((c: any) => (
              <div key={c.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:bg-surface-2/50 transition-colors">
                <div>
                  <h4 className="font-bold text-foreground text-lg">{c.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted mt-1">
                    <span>{formatDate(c.scheduledAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>{c.batch?.name}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="shrink-0" onClick={() => {
                  if (c.recordingUrl) {
                    window.open(c.recordingUrl, "_blank");
                  } else {
                     alert("Recording is still processing. Please check back later.");
                  }
                }}>
                  <PlayCircle className="w-4 h-4 mr-2" /> Watch Recording
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
