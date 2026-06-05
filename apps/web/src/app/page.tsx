"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Sparkles, Target, Users, PlayCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg selection:bg-primary/30 selection:text-primary-dark">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground tracking-tight">D-Chemistry</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Success Stories</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Batches</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
              Log In
            </Link>
            <Link href="/login">
              <Button className="shadow-glow hover:scale-105 transition-transform duration-300 rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-error animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">New: AI Tutor Gemini 2.0 Integration</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto animate-slide-down">
            Master Chemistry for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">JEE & NEET</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            The ultimate learning platform designed by Debajyoti Haldar. Featuring NTA-style mock tests, 24/7 AI doubt resolution, and interactive live classes in English & Bengali.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-glow group">
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 hover:bg-surface-2">
                <PlayCircle className="w-5 h-5 mr-2" /> Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 pt-10 border-t border-border/50 animate-fade-in flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-heading font-bold text-xl"><Target className="text-primary"/> JEE Advanced</div>
            <div className="flex items-center gap-2 font-heading font-bold text-xl"><BookOpen className="text-accent"/> NEET UG</div>
            <div className="flex items-center gap-2 font-heading font-bold text-xl"><ShieldCheck className="text-success"/> ISC / ICSE</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-surface relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">Everything you need to excel</h2>
            <p className="text-muted max-w-2xl mx-auto">Built specifically for science students aiming for top ranks in competitive examinations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-bg border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-foreground">NTA-Style Mock Tests</h3>
              <p className="text-muted leading-relaxed">Exact replica of the real exam interface. Includes advanced analytics, accuracy breakdown, and time management stats.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-bg border border-border hover:border-accent/50 hover:shadow-[0_0_30px_rgba(245,166,35,0.15)] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-foreground">24/7 AI Tutor</h3>
              <p className="text-muted leading-relaxed">Stuck on a tricky organic reaction? Ask our Gemini-powered AI chatbot for instant, context-aware explanations.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-bg border border-border hover:border-success/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-foreground">Live Interactive Classes</h3>
              <p className="text-muted leading-relaxed">Join high-quality live sessions. Ask doubts in real-time, participate in polls, and watch recordings later.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Teaser */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Learn anywhere, anytime.</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-md">
              Download the D-Chemistry mobile app for iOS and Android. Download lectures for offline viewing, get push notifications for live classes, and practice on the go.
            </p>
            <div className="flex gap-4">
              <Button variant="secondary" size="lg" className="rounded-xl h-14 px-6 font-bold bg-white text-primary hover:bg-surface">
                Get on Android
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl h-14 px-6 font-bold border-white/30 text-white hover:bg-white/10">
                Get on iOS
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
             {/* Abstract Phone Mockup */}
             <div className="w-64 h-[500px] bg-white rounded-[3rem] shadow-2xl mx-auto border-8 border-white/20 p-2 relative">
               <div className="absolute top-0 inset-x-0 h-6 bg-white/20 rounded-t-[2.5rem]"></div>
               <div className="w-full h-full bg-surface rounded-[2rem] overflow-hidden">
                 <div className="h-1/3 bg-primary/20"></div>
                 <div className="p-4 space-y-4">
                   <div className="h-4 bg-border rounded-full w-3/4"></div>
                   <div className="h-4 bg-border rounded-full w-1/2"></div>
                   <div className="h-20 bg-white rounded-xl shadow-sm mt-8"></div>
                   <div className="h-20 bg-white rounded-xl shadow-sm"></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 text-center bg-bg border-t border-border">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Ready to crack your exams?</h2>
        <Link href="/login">
          <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-glow hover:scale-105 transition-transform duration-300">
            Create Free Account
          </Button>
        </Link>
        <p className="text-sm text-muted mt-10">© 2026 D-Chemistry. All rights reserved.</p>
      </footer>
    </div>
  );
}
