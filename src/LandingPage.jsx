import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Sparkles, ArrowRight, Star, Shield, Flame, Kanban, ListFilter,
  Play, Award, ChevronRight, Zap, Target, Layers, FileText, CheckSquare,
  MessageSquare, ExternalLink, Moon, Sun, Laptop, Smartphone, Users, Download,
  Mail, CalendarDays, Lock, Edit3, Heading, List, Code, Quote, Divide, RefreshCw, Eye,
  FastForward, BarChart3, Upload, Square, CheckCircle, Activity, Command, Timer
} from 'lucide-react';
import Logo from './components/brand/Logo';

export default function LandingPage({
  onStartForFree,
  onTryDemo,
  onOpenLogin,
  onOpenApp,
  onOpenPrivacy,
  onOpenTerms,
  hasActiveSession = false,
  darkMode,
  setDarkMode
}) {
  const [activeTemplateTab, setActiveTemplateTab] = useState('All');

  const templates = [
    { title: 'Engineering Sprint & Backlog', category: 'Work', tasks: 12, icon: '💻' },
    { title: 'Product Launch & GTM Plan', category: 'Work', tasks: 18, icon: '🚀' },
    { title: 'Personal Habit & Goal Tracker', category: 'Personal', tasks: 7, icon: '🌱' },
    { title: 'Weekly Deep Work & Time Boxing', category: 'Personal', tasks: 5, icon: '⏱️' },
    { title: 'Design System & Component Sprint', category: 'Work', tasks: 14, icon: '🎨' },
    { title: 'Daily Shutdown & Evening Ritual', category: 'Personal', tasks: 4, icon: '🌙' }
  ];

  const filteredTemplates = activeTemplateTab === 'All'
    ? templates
    : templates.filter(t => t.category === activeTemplateTab);

  return (
    <div className={`min-h-screen selection:bg-rose-500 selection:text-white ${darkMode ? 'dark bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-neutral-900'}`}>
      
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Obsidian High-Contrast Aesthetic)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-white/[0.08] bg-[#fafafa]/80 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Logo onClick={hasActiveSession && onOpenApp ? onOpenApp : onTryDemo} href="/" />

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600 dark:text-zinc-400">
              <a href="#purpose" className="hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors">App Purpose</a>
              <a href="#features" className="hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors">Features</a>
              <a href="#scratchpad" className="hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors">Meeting Scratchpad</a>
              <a href="#calendar-view" className="hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors">7-Day Horizon</a>
              <a
                href="/privacy"
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline transition-colors flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  if (onOpenTerms) {
                    e.preventDefault();
                    onOpenTerms();
                  }
                }}
                className="hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {hasActiveSession ? (
              <button
                onClick={onOpenApp}
                className="px-4 py-2 text-xs font-medium rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Log in
                </button>

                <button
                  onClick={onStartForFree}
                  className="px-4 py-2 text-xs font-medium rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm transition-all active:scale-[0.98]"
                >
                  Start for free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION: "Clarity, finally." (Elevated Art Direction & Hierarchy)
         ========================================================================= */}
      <section className="relative pt-24 pb-24 sm:pt-36 sm:pb-40 overflow-hidden">
        {/* Engineering Dot Matrix Texture & Atmospheric Gradient Falloff */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Ambient Specular Light Aura */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-rose-500/10 rounded-full blur-[140px] pointer-events-none opacity-90 dark:opacity-70" />
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow Micro-Pill with Breathing Live Indicator */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-neutral-200/90 dark:border-white/10 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] mb-8 transition-transform duration-200 hover:scale-[1.02] cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300 border border-indigo-500/20">
              TAKT 2.4
            </span>
            <span className="text-neutral-300 dark:text-zinc-700">|</span>
            <span className="text-xs font-medium text-neutral-700 dark:text-zinc-200">
              Tactile Task Cadence &amp; 7-Day Horizon
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-500" />
          </div>

          {/* Master Headline: High-Contrast Display Typography */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] leading-[1.02] text-neutral-950 dark:text-white mb-6">
            <span className="inline-block bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-700 dark:from-white dark:via-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              Clarity, finally.
            </span>
            <span className="block mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-neutral-500 dark:text-zinc-400">
              The tactile workspace for uninterrupted momentum.
            </span>
          </h1>

          {/* Refined Subhead / Value Proposition */}
          <p className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-zinc-400 max-w-[62ch] mx-auto mb-10 font-normal leading-relaxed tracking-[-0.012em]">
            Organize tasks, map day-wise calendar horizons, and lock into deep Pomodoro flow. Designed with obsidian tactile depth, instant keyboard navigation, and zero-latency cloud sync.
          </p>

          {/* Elevated CTAs: Tactile Bevel Button + Frosted Interactive Demo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
            {hasActiveSession ? (
              <button
                onClick={onOpenApp}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-sm shadow-[0_12px_28px_-6px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_12px_28px_-6px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>Enter Your Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={onStartForFree}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-sm shadow-[0_12px_28px_-6px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_12px_28px_-6px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <span>Start for free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={onTryDemo}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/80 dark:bg-white/[0.04] backdrop-blur-md border border-neutral-200/90 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-neutral-50 dark:hover:bg-white/[0.08] text-neutral-800 dark:text-zinc-200 font-medium text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 fill-indigo-500/20" />
                  <span>Try Live Interactive Demo</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-zinc-400 border border-neutral-200/60 dark:border-white/10">
                    Instant
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Trust & Guarantee Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 mt-6 pt-2">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span><strong className="text-neutral-800 dark:text-zinc-200">100% Free</strong> forever</span>
            </span>
            <span className="text-neutral-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span><strong className="text-neutral-800 dark:text-zinc-200">Offline-first</strong> zero latency</span>
            </span>
            <span className="text-neutral-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span><strong className="text-neutral-800 dark:text-zinc-200">Multi-device</strong> encrypted sync</span>
            </span>
            <span className="text-neutral-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span><strong className="text-neutral-800 dark:text-zinc-200">Zero</strong> ads or trackers</span>
            </span>
          </div>

          {/* =========================================================================
              HERO APP MOCKUP PREVIEW: Studio-Grade Obsidian Command Center
             ========================================================================= */}
          <div className="relative mt-16 sm:mt-24 max-w-5xl mx-auto rounded-[2rem] p-2.5 sm:p-4 bg-gradient-to-b from-neutral-200/80 via-neutral-200/30 to-transparent dark:from-white/12 dark:via-white/[0.03] dark:to-transparent border border-neutral-200/90 dark:border-white/[0.08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.18),0_0_80px_-20px_rgba(99,102,241,0.15)] dark:shadow-[0_35px_100px_-25px_rgba(0,0,0,0.85),0_0_100px_-25px_rgba(99,102,241,0.2)]">
            {/* Top Specular Hairline Highlight */}
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/50 to-transparent pointer-events-none" />

            <div className="bg-white dark:bg-[#0c0d12] rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-white/[0.08] text-left backdrop-blur-xl">
              {/* Window Navigation & Command Bar */}
              <div className="px-4 py-3 bg-neutral-50/90 dark:bg-[#12141c]/90 border-b border-neutral-200/70 dark:border-white/[0.08] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 dark:bg-rose-500/70 shadow-xs"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 dark:bg-amber-500/70 shadow-xs"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 dark:bg-emerald-500/70 shadow-xs"></div>
                  </div>
                  <div className="h-4 w-px bg-neutral-200 dark:bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="hidden sm:inline">Takt Command Center</span>
                    <span className="text-neutral-400 dark:text-zinc-500 font-normal">/ Q4 High-Velocity Sprint</span>
                  </div>
                </div>

                {/* Simulated Quick Search / ⌘K Bar */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/[0.08] text-xs text-neutral-400 dark:text-zinc-500 w-64 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-500" />
                  <span className="truncate flex-1">Quick capture or search...</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-zinc-400">⌘K</span>
                </div>

                {/* Right Status Badge */}
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Synced</span>
                  </span>
                </div>
              </div>

              {/* View Selector Rail */}
              <div className="px-4 py-2 bg-neutral-100/50 dark:bg-[#0e1017] border-b border-neutral-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-1 rounded-md font-semibold bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-2xs flex items-center gap-1.5">
                    <Kanban className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Kanban Swimlanes</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>7-Day Horizon</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors hidden sm:flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Pomodoro Cadence</span>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400 dark:text-zinc-500 hidden sm:block">
                  Today: 4/5 Tasks Done (80%)
                </div>
              </div>

              {/* Three-Column Tactile Kanban Preview */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50/50 dark:bg-[#090b11]">
                {/* Stage 1: To Do */}
                <div className="bg-white dark:bg-[#121520] border border-neutral-200 dark:border-white/[0.08] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-zinc-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Backlog &amp; Up Next</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-zinc-400">2</span>
                  </div>

                  {/* Card 1 */}
                  <div className="p-3 bg-neutral-50/80 dark:bg-[#181c2b]/90 border border-neutral-200/80 dark:border-white/[0.08] rounded-lg hover:border-neutral-300 dark:hover:border-white/20 transition-colors">
                    <div className="flex items-start gap-2 text-xs font-medium text-neutral-900 dark:text-zinc-200">
                      <Circle className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                      <span>Design fluid typography scale &amp; obsidian tokens</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-neutral-200/50 dark:border-white/[0.05]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">P1</span>
                        <span className="text-[9px] text-neutral-400 dark:text-zinc-500 font-mono">#Design</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 35m
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3 bg-neutral-50/80 dark:bg-[#181c2b]/90 border border-neutral-200/80 dark:border-white/[0.08] rounded-lg hover:border-neutral-300 dark:hover:border-white/20 transition-colors">
                    <div className="flex items-start gap-2 text-xs font-medium text-neutral-900 dark:text-zinc-200">
                      <Circle className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                      <span>Audit edge API endpoints &amp; CORS access guards</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-neutral-200/50 dark:border-white/[0.05]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">P2</span>
                        <span className="text-[9px] text-neutral-400 dark:text-zinc-500 font-mono">#Security</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 20m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 2: In Progress (Spotlight Deep Work Card) */}
                <div className="bg-white dark:bg-[#121520] border border-indigo-200/70 dark:border-indigo-500/30 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Active Flow Session</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">1</span>
                  </div>

                  {/* Featured Spotlight Active Card */}
                  <div className="p-3.5 bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-950/25 dark:to-[#181c2b] border border-indigo-300 dark:border-indigo-500/40 rounded-lg shadow-[0_4px_20px_-4px_rgba(99,102,241,0.2)]">
                    <div className="flex items-start gap-2 text-xs font-medium text-neutral-900 dark:text-zinc-100">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 flex items-center justify-center mt-0.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                      </div>
                      <span>Elevate landing hero with high-contrast art direction</span>
                    </div>

                    {/* Integrated Flow Timer Progress */}
                    <div className="mt-3 p-2 rounded-md bg-white/80 dark:bg-[#0c0d12]/80 border border-indigo-200/60 dark:border-indigo-500/20">
                      <div className="flex items-center justify-between text-[11px] font-mono font-medium text-indigo-700 dark:text-indigo-300 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
                          <span>24:18 remaining</span>
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-zinc-500">Pomodoro 2/4</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full w-[72%]"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">P1</span>
                        <span className="text-[9px] text-neutral-400 dark:text-zinc-500 font-mono">#Frontend</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Focus Locked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Completed */}
                <div className="bg-white dark:bg-[#121520] border border-neutral-200 dark:border-white/[0.08] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pb-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Completed &amp; Shipped</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">2</span>
                  </div>

                  {/* Card 1 */}
                  <div className="p-3 bg-neutral-50/80 dark:bg-[#181c2b]/90 border border-neutral-200/80 dark:border-white/[0.08] rounded-lg opacity-80">
                    <div className="flex items-start gap-2 text-xs font-medium line-through text-neutral-400 dark:text-zinc-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40 mt-0.5 shrink-0" />
                      <span>Automated daily backup &amp; sync tombstones</span>
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 dark:text-zinc-500 mt-2 pl-5.5">
                      Finished at 10:45 AM · Saved to cloud
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3 bg-neutral-50/80 dark:bg-[#181c2b]/90 border border-neutral-200/80 dark:border-white/[0.08] rounded-lg opacity-80">
                    <div className="flex items-start gap-2 text-xs font-medium line-through text-neutral-400 dark:text-zinc-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40 mt-0.5 shrink-0" />
                      <span>Deploy Edge CDN &amp; Cloudflare Pages</span>
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 dark:text-zinc-500 mt-2 pl-5.5">
                      Finished at 09:12 AM · Zero latency
                    </div>
                  </div>

                  {/* Daily Momentum Summary */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Daily Velocity: 100% Met</span>
                    </span>
                    <span className="font-mono font-bold">+520 XP</span>
                  </div>
                </div>
              </div>

              {/* Bottom Tactile Keyboard & Flow Toolbar */}
              <div className="px-4 py-2.5 bg-neutral-100/70 dark:bg-[#10121a] border-t border-neutral-200/70 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-neutral-500 dark:text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-neutral-300 dark:border-white/10 text-[10px] text-neutral-700 dark:text-zinc-300 font-semibold shadow-2xs">N</kbd>
                    <span>New Task</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-neutral-300 dark:border-white/10 text-[10px] text-neutral-700 dark:text-zinc-300 font-semibold shadow-2xs">Space</kbd>
                    <span>Toggle Timer</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-neutral-300 dark:border-white/10 text-[10px] text-neutral-700 dark:text-zinc-300 font-semibold shadow-2xs inline-flex items-center gap-0.5">
                      <Command className="w-2.5 h-2.5" />K
                    </kbd>
                    <span>Command Bar</span>
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                  <span>Engineered with Obsidian Tactile Precision</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2.5 APPLICATION PURPOSE & GOOGLE DATA TRANSPARENCY (Google OAuth Compliance)
         ========================================================================= */}
      <section id="purpose" className="py-20 border-t border-neutral-200/60 dark:border-white/[0.08] bg-neutral-50/70 dark:bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified App Purpose &amp; Privacy Transparency</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100 mb-4">
              Application Purpose &amp; Google Data Transparency
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed">
              Takt is an open, privacy-first workspace engineered by <strong>Haris Arshad</strong>. We believe in complete transparency regarding what our application does, why we request sign-in, and how your data is protected.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
            {/* Column 1: Application Purpose & Core Functionality */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200/80 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-zinc-100">
                      Application Purpose &amp; Functionality
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-500">
                      What Takt is and what it allows you to accomplish
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed mb-5">
                  <strong>Takt</strong> (<a href="https://takt.harisarshad.site/" className="text-rose-600 dark:text-rose-400 font-semibold underline">https://takt.harisarshad.site/</a>) is a high-velocity productivity command center, Kanban cadence workspace, and personal focus manager. Its primary purpose is to help knowledge workers, developers, and teams plan and execute work with zero cognitive overload.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Tactile Task & Sprint Management',
                      desc: 'Capture, organize, and categorize tasks with keyboard shortcuts, priority flags (P1–P4), custom tags, checklists, and duration ETAs.'
                    },
                    {
                      title: 'Kanban Flow & Swimlanes',
                      desc: 'Track tasks through visual lifecycle stages (To Do, In Progress, Review, Completed) with smooth drag-and-drop.'
                    },
                    {
                      title: '7-Day Calendar Horizon',
                      desc: 'Plan daily commitments across a rolling week, with a 1-click "⏩ Tomorrow" button to roll unfinished tasks forward without guilt.'
                    },
                    {
                      title: 'Meeting Scratchpad',
                      desc: 'Capture tactical standup minutes, 1-on-1 notes, and meeting agendas with rich Markdown and instant action-item checkboxes.'
                    },
                    {
                      title: 'Pomodoro Focus Cadence',
                      desc: 'Run 25-minute deep work intervals directly on tasks to maintain unbroken flow state.'
                    }
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-neutral-900 dark:text-zinc-200 font-semibold">{f.title}: </strong>
                        <span>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-zinc-500">Publicly accessible with zero login barriers</span>
                <button
                  onClick={onTryDemo}
                  className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>Explore Demo Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column 2: Why Takt Requests Google User Data & Compliance */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200/80 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-zinc-100">
                      Why Takt Requests Google User Data
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-500">
                      Transparent explanation of Google OAuth 2.0 integration
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed mb-4">
                  When you sign in using Google Single Sign-On (SSO), we request access exclusively to basic profile identity. We request this data solely to authenticate your session and sync your personal tasks securely across devices.
                </p>

                {/* Scope Table */}
                <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-white/[0.08] mb-4 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 dark:bg-white/[0.04] text-neutral-700 dark:text-zinc-200 font-semibold">
                      <tr>
                        <th className="p-2.5 border-b border-neutral-200 dark:border-white/[0.08]">Scope</th>
                        <th className="p-2.5 border-b border-neutral-200 dark:border-white/[0.08]">Data Received</th>
                        <th className="p-2.5 border-b border-neutral-200 dark:border-white/[0.08]">Purpose in Takt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.08] text-neutral-600 dark:text-zinc-400">
                      <tr>
                        <td className="p-2.5 font-mono text-[11px] text-neutral-800 dark:text-zinc-300">openid</td>
                        <td className="p-2.5">User ID</td>
                        <td className="p-2.5">Unique cryptographic key to isolate tasks via Postgres Row Level Security.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-[11px] text-neutral-800 dark:text-zinc-300">userinfo.email</td>
                        <td className="p-2.5">Email address</td>
                        <td className="p-2.5">To verify your account, ensure multi-device sync, and send security alerts.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-[11px] text-neutral-800 dark:text-zinc-300">userinfo.profile</td>
                        <td className="p-2.5">Name &amp; Avatar</td>
                        <td className="p-2.5">To display your identity in the workspace and attribute task comments.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Non-access Callout */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/[0.08] text-xs space-y-1.5">
                  <div className="font-semibold text-neutral-900 dark:text-zinc-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-500" />
                    <span>Zero Access to Sensitive Google Data</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-zinc-400">
                    Takt does <strong>NOT</strong> request, access, read, or store your Gmail messages, Google Drive documents, Calendar entries, or contacts.
                  </p>
                </div>
              </div>

              {/* Limited Use Box */}
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-white/[0.08] text-[11px] text-neutral-500 dark:text-zinc-500 space-y-1">
                <p>
                  <strong>Google Limited Use Compliance:</strong> Takt’s use and transfer to any other app of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
                </p>
                <p>We do not sell user data, serve advertisements, or train AI models on your information.</p>
              </div>
            </div>
          </div>

          {/* Banner with Links to Privacy Policy & Data Deletion */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200/80 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-base font-semibold text-neutral-900 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Your Data Ownership &amp; Right to Deletion</span>
              </h4>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-2xl">
                You retain 100% ownership of your tasks and notes. You can delete items at any time in-app, revoke Google access via your Google Account settings, or request permanent cloud account deletion by emailing <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 font-semibold underline">harisengr73@gmail.com</a> (processed within 7 business days).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/privacy"
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Read Full Privacy Policy</span>
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  if (onOpenTerms) {
                    e.preventDefault();
                    onOpenTerms();
                  }
                }}
                className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-zinc-300 hover:bg-neutral-200 dark:hover:bg-white/[0.1] font-medium text-xs border border-neutral-200 dark:border-white/[0.08] transition-all"
              >
                <span>Terms of Service</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURE 1: "Capture tasks at the speed of thought"
         ========================================================================= */}
      <section id="features" className="py-20 border-t border-neutral-200/60 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Fast Capture
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
                Capture tasks at the speed of thought
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Add tasks in seconds using keyboard shortcuts, natural dates, and priority flags. The rich 2-column task detail modal gives you full control over subtasks, activity discussions, and target deadlines.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Instant modal with subtasks & comment thread',
                  'P1 to P4 flag priorities with clean monochrome obsidian contrast',
                  'Custom tags and sections with automatic task categorization'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual representation */}
            <div className="bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)]">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-zinc-200">
                  <Inbox className="w-4 h-4 text-rose-500" />
                  <span>Inbox / Quick Add</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-zinc-500">Ctrl + N</span>
              </div>
              <div className="py-4 space-y-3">
                <input
                  type="text"
                  readOnly
                  value="Launch marketing newsletter tomorrow at 10am #Marketing"
                  className="w-full text-sm font-semibold bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-white/[0.08] rounded-xl p-3 text-neutral-800 dark:text-zinc-200"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                    📅 Tomorrow, 10:00 AM
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-transparent dark:border-red-500/20">
                    🚩 P1 Urgent
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-white/[0.06] dark:text-zinc-400 border border-transparent dark:border-white/[0.08]">
                    #Marketing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURE: MEETING SCRATCHPAD & RICH LIVE NOTES
         ========================================================================= */}
      <section id="scratchpad" className="py-20 border-t border-neutral-200/60 dark:border-white/[0.08] bg-neutral-50/50 dark:bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> High-Velocity Note Taking
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
                Meeting Scratchpad. Capture minutes without losing focus.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Take tactical meeting notes, standup minutes, and sprint agendas directly within your workspace. Format in seconds with a rich markdown toolbar, toggle instant preview, and export to Markdown or let Takt auto-save to your encrypted database partition.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: 'Tactile Formatting Toolbar', desc: 'Bullets (•), interactive task checklists (- [ ]), H2/H3 headings, bold, italic, quotes, code blocks, and divider rules.' },
                  { title: 'Write & Live Preview Toggle', desc: 'Real-time Markdown rendering with checkable interactive checkboxes and syntax styling.' },
                  { title: 'Multi-Note Archive & Search', desc: 'Search and switch between client meetings, 1-on-1s, and project retro notes instantly.' },
                  { title: 'Zero Cross-User Visibility', desc: 'Strictly encrypted and isolated to your account. Guests operate in a standalone demo sandbox.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-zinc-200">{item.title}: </span>
                      <span className="text-neutral-600 dark:text-zinc-400">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onTryDemo}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-medium rounded-full shadow-sm transition-all"
                >
                  Test Scratchpad in Demo
                </button>
              </div>
            </div>

            {/* Simulated Scratchpad UI Mockup */}
            <div className="bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] space-y-3">
              {/* Toolbar Simulation */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/[0.04] p-1 rounded-xl border border-neutral-200/80 dark:border-white/[0.08]">
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:text-zinc-200 bg-white dark:bg-white/[0.08] rounded-md shadow-xs">Write</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-zinc-400">Preview</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-600 dark:text-zinc-400">
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">• Bullet</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">☑ Task</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">H2</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">B</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]">&lt;/&gt;</span>
                </div>
              </div>

              {/* Note Content Simulation */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-[#18181b]/80 border border-neutral-200/80 dark:border-white/[0.08] font-sans text-xs space-y-2.5">
                <div className="font-semibold text-sm text-neutral-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>Product Sprint &amp; Architecture Review</span>
                  <span className="text-[10px] font-mono font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Auto-Saved to Cloud
                  </span>
                </div>
                <div className="text-[11px] text-neutral-700 dark:text-zinc-300 space-y-1 font-mono">
                  <p className="text-rose-600 dark:text-rose-400 font-semibold">### Standup Sync</p>
                  <p className="text-neutral-700 dark:text-zinc-300">• Resolved multi-tenant isolation; zero cross-user visibility.</p>
                  <p className="text-neutral-700 dark:text-zinc-300">• 7-day rolling calendar horizon with 1-click reschedule active.</p>
                  <p className="text-rose-600 dark:text-rose-400 font-semibold pt-1">### Action Items</p>
                  <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Deploy release v3.4 to production
                  </p>
                  <p className="text-neutral-500 dark:text-zinc-500 flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-600" /> Share meeting summary with team
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-zinc-400 px-1">
                <span>124 words • Markdown Formatted</span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                  <Download className="w-3.5 h-3.5" /> Export as .md
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURE: 7-DAY CALENDAR HORIZON & 1-CLICK RESCHEDULE
         ========================================================================= */}
      <section id="calendar-view" className="py-20 bg-neutral-50/60 dark:bg-[#09090b] border-t border-neutral-200/60 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual preview of 7-Day Horizon Strip & Reschedule */}
            <div className="order-2 lg:order-1 bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-rose-500" />
                  <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100">7-Day Calendar Horizon</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-transparent dark:border-rose-500/20">
                  Rolling Week
                </span>
              </div>

              {/* 7-Day Quick Strip */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
                {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div
                    key={day}
                    className={`p-2 rounded-xl border text-[11px] font-semibold ${
                      i === 0
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400'
                        : i === 1
                        ? 'bg-neutral-100 dark:bg-white/[0.04] border-neutral-300 dark:border-white/[0.08] text-neutral-800 dark:text-zinc-200'
                        : 'border-transparent text-neutral-400 dark:text-zinc-500'
                    }`}
                  >
                    <div>{day}</div>
                    <div className="text-[10px] font-normal text-neutral-400 dark:text-zinc-500 mt-0.5">{i === 0 ? '4 tasks' : i === 1 ? '2 tasks' : '0'}</div>
                  </div>
                ))}
              </div>

              {/* Task with 1-Click "Tomorrow" Reschedule */}
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-neutral-50 dark:bg-[#18181b]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Circle className="w-4 h-4 text-neutral-400 dark:text-zinc-500" />
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-zinc-200">Finalize sprint retro documentation</div>
                      <div className="text-[10px] text-rose-500 font-medium">Due Today • P1 Urgent</div>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white dark:bg-white/[0.08] border border-neutral-200 dark:border-white/[0.08] text-neutral-700 dark:text-zinc-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 shadow-xs">
                    <FastForward className="w-3 h-3 text-rose-500" />
                    <span>Tomorrow</span>
                  </button>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-[#18181b]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-semibold line-through text-neutral-400 dark:text-zinc-500">Deploy isolated tenant schema migrations</div>
                      <div className="text-[10px] text-emerald-500 font-medium">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Effortless Rescheduling
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
                Plan today. Postpone to tomorrow with 1-click.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Tackle high workloads without anxiety. If tasks roll over, never spend time clicking date pickers. The dedicated 1-click <strong className="text-neutral-900 dark:text-zinc-100">"⏩ Tomorrow"</strong> button moves overdue or unfinished tasks forward instantly.
              </p>
              <div className="space-y-2 pt-1 text-xs sm:text-sm font-medium text-neutral-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Rolling 7-day timeline view of upcoming commitments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>1-click quick-action button on every task card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Seamless sync with external calendar clients via iCal</span>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={onTryDemo}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-medium rounded-full shadow-sm transition-all"
                >
                  Explore Calendar Horizon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. ADVANCED WORKFLOW TOOLS
         ========================================================================= */}
      <section id="workflow-suite" className="py-20 border-t border-neutral-200/60 dark:border-white/[0.08] bg-neutral-50/50 dark:bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Power User Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100 mt-2 mb-4">
              Advanced workflows that adapt to your exact stack
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400">
              Everything power users demand: calendar feeds, dynamic swimlanes, email ingestion, and spreadsheet portability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Inbox Calendar Feed (iCal)</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Subscribe to your Takt tasks directly inside Apple Calendar, Google Calendar, or Outlook with live webcal feed sync.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Email Tasks to Inbox</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Forward messages from your email client to your private inbox address to convert important emails into actionable tasks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Dynamic Custom Sections</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Create custom stages like "Client Review", "Blocked", or "Backlog" with 1-click and drag tasks freely across columns.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Audit Log &amp; CSV Tools</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Audit every change with timestamped activity history. Full data export and import via CSV for complete data freedom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FEATURE: TAKT CADENCE & STRICT MULTI-TENANT PRIVACY
         ========================================================================= */}
      <section id="takt-assist" className="py-20 border-t border-neutral-200/60 dark:border-white/[0.08] bg-neutral-50/40 dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Intelligent Flow &amp; Privacy
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100 mt-2 mb-4">
              Takt Cadence — Focus tools and guaranteed privacy
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400">
              Engineered for absolute privacy and peak focus with zero bloat or advertisements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Pomodoro Flow Timer</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Start 25-minute laser focus intervals directly on any task with automatic minute tracking and karma rewards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Daily Shutdown Ritual</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Review completed goals, celebrate your wins with confetti, and disconnect cleanly for the evening.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Zero Cross-User Leakage</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Strict multi-tenant isolation. Your tasks and meeting scratchpad are visible only to you. Isolated sandbox for guests.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-neutral-200 dark:border-white/[0.08] shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-zinc-100 mb-2">Daily Auto-Backup &amp; Snapshots</h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Never lose a task. Real-time persistent local backup snapshots, cloud database synchronization, and CSV export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TEMPLATES SHOWCASE
         ========================================================================= */}
      <section id="templates" className="py-20 bg-neutral-50/50 dark:bg-[#0c0c0e] border-t border-neutral-200/60 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100 mb-3">
              Kickstart your next project with templates
            </h2>
            <p className="text-sm text-neutral-600 dark:text-zinc-400">
              Pre-built project layouts for high performers, startups, and creative thinkers.
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {['All', 'Work', 'Personal'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTemplateTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTemplateTab === tab
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                      : 'bg-white dark:bg-white/[0.04] text-neutral-600 dark:text-zinc-400 border border-neutral-200 dark:border-white/[0.08] hover:text-neutral-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={onTryDemo}
                className="group p-5 bg-white dark:bg-[#121216] border border-neutral-200/80 dark:border-white/[0.08] rounded-2xl hover:border-white/20 dark:hover:border-white/25 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">{tmpl.icon}</div>
                  <h4 className="font-semibold text-sm text-neutral-900 dark:text-zinc-100 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-1">
                    {tmpl.tasks} pre-configured tasks &amp; swimlanes
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <span>Use template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. CALL TO ACTION FOOTER BANNER
         ========================================================================= */}
      <section className="py-24 text-center relative overflow-hidden border-t border-neutral-200/60 dark:border-white/[0.08] bg-white dark:bg-[#09090b]">
        {/* Subtle Bottom Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-zinc-100 mb-4">
            Gain clarity today.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Start organizing your work and life with the most tactile, low-eyestrain obsidian workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartForFree}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium text-sm shadow-sm active:scale-[0.99] transition-all"
            >
              Start for free
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-800 dark:text-zinc-300 font-medium text-sm transition-all"
            >
              Launch Live App
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
         ========================================================================= */}
      <footer className="border-t border-neutral-200/60 dark:border-white/[0.08] py-12 text-xs text-neutral-500 dark:text-zinc-500 bg-white dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo onClick={onTryDemo} href="/" />
            <span className="text-neutral-400 dark:text-zinc-500 border-l border-neutral-200 dark:border-white/[0.08] pl-3">© {new Date().getFullYear()} Takt by Haris Arshad</span>
          </div>

          <div className="flex items-center gap-6 text-xs flex-wrap">
            <a href="#purpose" className="hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors">App Purpose</a>
            <a href="#features" className="hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors">Features</a>
            <a href="#templates" className="hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors">Templates</a>
            <a
              href="/privacy"
              onClick={(e) => {
                if (onOpenPrivacy) {
                  e.preventDefault();
                  onOpenPrivacy();
                }
              }}
              className="text-rose-600 dark:text-rose-400 font-semibold hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                if (onOpenTerms) {
                  e.preventDefault();
                  onOpenTerms();
                }
              }}
              className="hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors"
            >
              Terms of Service
            </a>
            <a href="mailto:harisengr73@gmail.com" className="hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors">Support &amp; Data Deletion</a>
            <button onClick={onTryDemo} className="hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors">Live Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
