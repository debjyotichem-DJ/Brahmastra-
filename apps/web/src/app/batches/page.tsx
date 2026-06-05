"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Users, Tag, Lock, Unlock, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function BatchesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data } = await apiClient.get("/batches");
      return data.data; // Array of batches including user enrollment status
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (batchId: string) => {
      // In a real app, this might redirect to Razorpay if it's paid
      const { data } = await apiClient.post(`/batches/${batchId}/enroll`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Successfully enrolled in batch!");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      toast.error("Failed to enroll. You might need to purchase this batch.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary-dark flex items-center justify-center">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Batches</h1>
          <p className="text-muted mt-1">Enroll in specialized groups for structured learning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches?.map((batch: any) => {
          const isEnrolled = batch.enrollments?.length > 0;

          return (
            <div key={batch.id} className={`card overflow-hidden flex flex-col relative ${isEnrolled ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
              {/* Header Image Area */}
              <div className={`h-32 p-6 flex flex-col justify-end relative overflow-hidden ${isEnrolled ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-surface-2 border-b border-border'}`}>
                {isEnrolled && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>}
                <div className="absolute top-4 right-4">
                  {batch.price === 0 ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isEnrolled ? 'bg-white/20 text-white' : 'bg-success/10 text-success'}`}>Free</span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isEnrolled ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'}`}>₹{batch.price}</span>
                  )}
                </div>
                <h3 className={`text-2xl font-heading font-bold relative z-10 ${isEnrolled ? 'text-white' : 'text-foreground'}`}>
                  {batch.name}
                </h3>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-muted text-sm mb-6 flex-1 line-clamp-3">
                  {batch.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-surface-2 px-3 py-1.5 rounded-lg">
                    <Tag className="w-4 h-4 text-primary" /> {batch.board}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-surface-2 px-3 py-1.5 rounded-lg">
                    <Users className="w-4 h-4 text-primary" /> {batch._count?.enrollments || 0} Students
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-sm text-muted">
                    {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                  </div>
                  
                  {isEnrolled ? (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-success">
                      <Unlock className="w-4 h-4" /> Enrolled
                    </span>
                  ) : (
                    <Button 
                      onClick={() => enrollMutation.mutate(batch.id)}
                      disabled={enrollMutation.isPending}
                      className="group"
                    >
                      Enroll Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {batches?.length === 0 && (
          <div className="col-span-full card p-12 text-center border-dashed">
             <Users className="w-12 h-12 mx-auto mb-4 text-muted/50" />
             <h3 className="text-lg font-medium text-foreground">No batches available</h3>
             <p className="text-muted mt-1">Check back later for new enrollments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
