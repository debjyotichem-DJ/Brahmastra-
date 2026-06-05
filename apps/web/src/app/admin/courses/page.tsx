"use client";

import { useState } from "react";
import { Plus, Search, Video, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function AdminCoursesPage() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Content Management</h1>
          <p className="text-muted mt-1">Manage courses, upload video lectures, and PDF notes.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add New Content</>}
        </Button>
      </div>

      {isAdding && (
        <div className="card p-6 border-primary/30 shadow-glow animate-slide-down">
          <h2 className="text-xl font-bold font-heading mb-6">Upload New Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Content Title</label>
                <Input placeholder="e.g. Thermodynamics Part 1" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Select Course / Subject</label>
                <select className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm">
                  <option>JEE Physical Chemistry</option>
                  <option>NEET Organic Chemistry</option>
                  <option>Class 12 Board Prep</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Content Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" defaultChecked className="accent-primary" /> Video Lecture
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" className="accent-primary" /> PDF Notes
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 bg-surface-2 hover:bg-surface-2/80 transition-colors cursor-pointer" onClick={() => toast.success("File picker opened")}>
              <Upload className="w-10 h-10 text-primary mb-4" />
              <p className="font-bold text-foreground">Click to upload file</p>
              <p className="text-xs text-muted mt-1">MP4 or PDF up to 2GB (S3 direct upload)</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => toast.success("Content processing and uploading...")}>Start Upload</Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search content..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 border-b border-border text-muted">
            <tr>
              <th className="p-4 font-bold">Title</th>
              <th className="p-4 font-bold">Course</th>
              <th className="p-4 font-bold">Type</th>
              <th className="p-4 font-bold">Views</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                <td className="p-4 font-bold text-foreground">Organic Reactions Mechanism {i}</td>
                <td className="p-4 text-muted">NEET Organic Chemistry</td>
                <td className="p-4">
                  {i % 2 === 0 ? (
                    <span className="flex items-center gap-1.5 text-error text-xs font-bold bg-error/10 px-2 py-1 rounded w-fit">
                      <FileText className="w-3 h-3" /> PDF
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded w-fit">
                      <Video className="w-3 h-3" /> Video
                    </span>
                  )}
                </td>
                <td className="p-4 text-muted">{120 * i}</td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  <Button variant="danger" size="sm">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
