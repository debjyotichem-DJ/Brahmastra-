import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, FileText, Settings, Video } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-2">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold font-heading text-primary-dark">Admin Panel</h2>
          <p className="text-xs text-muted mt-1">D-Chemistry Control Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-surface-2 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-surface-2 transition-colors">
            <Users className="w-5 h-5 text-primary" />
            Students
          </Link>
          <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-surface-2 transition-colors">
            <BookOpen className="w-5 h-5 text-primary" />
            Courses & Content
          </Link>
          <Link href="/admin/live" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-surface-2 transition-colors">
            <Video className="w-5 h-5 text-primary" />
            Live Classes
          </Link>
          <Link href="/admin/tests" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-surface-2 transition-colors">
            <FileText className="w-5 h-5 text-primary" />
            Mock Tests
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground font-medium hover:bg-surface-2 transition-colors">
            <Settings className="w-5 h-5 text-muted" />
            Platform Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
