"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { MessageCircleQuestion, Plus, Search, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DoubtsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAsking, setIsAsking] = useState(false);
  const [newDoubtTitle, setNewDoubtTitle] = useState("");
  const [newDoubtDesc, setNewDoubtDesc] = useState("");

  const { data: doubts, isLoading } = useQuery({
    queryKey: ["doubts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/doubts");
      return data.data; // array of doubts
    },
  });

  const askDoubtMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/doubts", {
        title: newDoubtTitle,
        description: newDoubtDesc,
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success("Doubt posted successfully!");
      setIsAsking(false);
      setNewDoubtTitle("");
      setNewDoubtDesc("");
      queryClient.invalidateQueries({ queryKey: ["doubts"] });
    },
    onError: () => {
      toast.error("Failed to post doubt.");
    }
  });

  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtTitle.trim() || !newDoubtDesc.trim()) return;
    askDoubtMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="atom-spinner"><div className="nucleus"></div><div className="orbit"></div><div className="orbit"></div><div className="orbit"></div></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary-dark flex items-center justify-center">
            <MessageCircleQuestion className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{t("nav.doubts", "Doubts")}</h1>
            <p className="text-muted mt-1">Get your questions answered by experts</p>
          </div>
        </div>
        
        <Button onClick={() => setIsAsking(!isAsking)}>
          {isAsking ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Ask a Doubt</>}
        </Button>
      </div>

      {isAsking && (
        <div className="card p-6 mb-8 animate-slide-down border-primary/50 shadow-glow">
          <h2 className="text-xl font-bold mb-4 font-heading">Post a new Doubt</h2>
          <form onSubmit={handlePostDoubt} className="space-y-4">
            <div>
              <Input 
                placeholder="Question title (e.g. How to balance this redox reaction?)" 
                value={newDoubtTitle}
                onChange={(e) => setNewDoubtTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div>
              <textarea
                className="w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[120px] resize-y"
                placeholder="Describe your doubt in detail..."
                value={newDoubtDesc}
                onChange={(e) => setNewDoubtDesc(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" className="text-muted">
                <ImageIcon className="w-4 h-4 mr-2" /> Attach Image
              </Button>
              <Button type="submit" isLoading={askDoubtMutation.isPending}>
                Post Doubt
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search doubts..." className="pl-9 bg-surface-2" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20">All</Button>
          <Button variant="outline" size="sm">Resolved</Button>
          <Button variant="outline" size="sm">Open</Button>
        </div>
      </div>

      <div className="space-y-4">
        {doubts?.map((doubt: any) => (
          <Link key={doubt.id} href={`/doubts/${doubt.id}`} className="block">
            <div className="card p-5 hover:border-primary/40 transition-colors flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center font-bold shrink-0">
                {doubt.user?.profile?.name?.charAt(0) || "S"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <h3 className="text-lg font-bold text-foreground truncate">{doubt.title}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${doubt.status === 'RESOLVED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {doubt.status}
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2 mb-3">{doubt.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-muted">
                  <span>{doubt.user?.profile?.name || "Student"}</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>{formatDate(doubt.createdAt)}</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {doubt._count?.replies || 0} Replies
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {doubts?.length === 0 && !isAsking && (
          <div className="card p-12 text-center border-dashed">
            <MessageCircleQuestion className="w-12 h-12 mx-auto mb-4 text-muted/50" />
            <h3 className="text-lg font-medium text-foreground">No doubts yet</h3>
            <p className="text-muted mt-1">Have a question? Feel free to ask!</p>
          </div>
        )}
      </div>
    </div>
  );
}
