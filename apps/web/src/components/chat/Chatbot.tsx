"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Add welcome message if empty
      if (messages.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: t("chat.welcome", "Hi! I'm your D-Chemistry AI tutor. 🧪 Ask me any chemistry question!"),
          },
        ]);
      }
    }
  }, [isOpen, messages.length, t]);

  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiClient.post("/chat/message", {
        message: messageText,
        conversationId,
        context: "academic"
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConversationId(data.data.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: data.data.message.id,
          role: "assistant",
          content: data.data.response,
        },
      ]);
      scrollToBottom();
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
      scrollToBottom();
    }
  });

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMessage },
    ]);
    
    chatMutation.mutate(userMessage);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-card-hover z-50 hover:scale-105 transition-transform flex items-center justify-center",
          isOpen && "hidden"
        )}
        aria-label="Open AI Tutor"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-surface border border-border rounded-xl shadow-card-hover z-50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t("chat.title", "D-Chemistry AI")}</h3>
                <p className="text-xs text-white/80">{t("chat.subtitle", "Your AI Tutor")}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === "user" ? "bg-accent/20 text-accent-dark" : "bg-primary/20 text-primary-dark"
                )}>
                  {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-2xl text-sm prose prose-sm dark:prose-invert max-w-none",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-surface border border-border text-foreground rounded-tl-sm shadow-sm"
                  )}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start gap-2 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border rounded-tl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-surface border-t border-border">
            {messages.length === 1 && !chatMutation.isPending && (
              <div className="flex flex-wrap gap-2 mb-3">
                {t("chat.suggestions", { returnObjects: true })?.map?.((suggestion: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => { setInput(suggestion); handleSend(); }}
                    className="text-xs bg-surface-2 hover:bg-border border border-border px-2 py-1.5 rounded-chip text-muted transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat.placeholder", "Ask a question...")}
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || chatMutation.isPending}
                className="flex-shrink-0"
              >
                {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
            <div className="text-[10px] text-center text-muted mt-2">
              D-Chemistry AI can make mistakes. Always verify with your teachers.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
