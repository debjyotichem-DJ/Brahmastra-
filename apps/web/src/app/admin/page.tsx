"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Users, BookOpen, CreditCard, Activity, ArrowUpRight } from "lucide-react";

export default function AdminOverviewPage() {
  // In a real app, we'd fetch this from /admin/analytics
  const stats = [
    { label: "Total Students", value: "1,248", icon: Users, trend: "+12% this month" },
    { label: "Active Courses", value: "24", icon: BookOpen, trend: "3 new this week" },
    { label: "Monthly Revenue", value: "₹1,45,000", icon: CreditCard, trend: "+8% this month" },
    { label: "Test Attempts", value: "8,942", icon: Activity, trend: "+24% this week" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted mt-1">Welcome back, Admin. Here is what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary-dark flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="flex items-center text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                  {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold font-heading text-foreground">{stat.value}</h3>
                <p className="text-sm font-medium text-muted mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6 h-96 flex flex-col">
          <h3 className="text-lg font-bold font-heading mb-4">Revenue Overview</h3>
          <div className="flex-1 bg-surface-2 rounded-xl border border-dashed border-border flex items-center justify-center text-muted">
            [Chart Integration Placeholder]
          </div>
        </div>
        
        <div className="card p-6 h-96 flex flex-col">
          <h3 className="text-lg font-bold font-heading mb-4">Recent Enrollments</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-dark font-bold text-sm">
                  S{i}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">Student {i}</p>
                  <p className="text-xs text-muted truncate">Enrolled in: Target JEE {2024 + i}</p>
                </div>
                <div className="text-xs font-bold text-success">Paid</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
