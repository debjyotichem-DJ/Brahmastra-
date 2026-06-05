"use client";

import { useAuth } from "@/contexts/auth-context";
import { BookOpen, Calendar, FlaskConical, LayoutDashboard, LogOut, MessageCircleQuestion, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Live Classes", href: "/live", icon: Calendar },
    { name: "Tests", href: "/tests", icon: FlaskConical },
    { name: "Doubts", href: "/doubts", icon: MessageCircleQuestion },
  ];

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[var(--sidebar-width)] bg-surface border-r border-border hidden md:flex flex-col">
        {/* Logo */}
        <div className="h-[var(--header-height)] flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold font-heading">
              D
            </div>
            <span className="font-heading font-bold text-xl text-foreground tracking-tight">D-Chemistry</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary-dark dark:text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User profile & Actions */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center font-bold text-sm">
              {user?.profile?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.profile?.name || "Student"}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <ThemeToggle />
            <button 
              onClick={logout}
              className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header - simple version */}
        <header className="h-[var(--header-height)] md:hidden bg-surface border-b border-border flex items-center justify-between px-4">
          <span className="font-heading font-bold text-lg">D-Chemistry</span>
          <ThemeToggle />
        </header>

        {/* Top bar desktop */}
        <header className="h-[var(--header-height)] hidden md:flex bg-surface border-b border-border items-center justify-end px-6 gap-4 shrink-0">
           <button className="p-2 text-muted hover:bg-surface-2 rounded-full relative">
             <Bell className="w-5 h-5" />
             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
           </button>
           <button className="p-2 text-muted hover:bg-surface-2 rounded-full">
             <Settings className="w-5 h-5" />
           </button>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
