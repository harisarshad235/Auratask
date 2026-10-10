import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Sparkles, ArrowRight, Star, Shield, Flame, Kanban, ListFilter,
  Play, Award, ChevronRight, Zap, Target, Layers, FileText, CheckSquare,
  MessageSquare, ExternalLink, Moon, Sun, Laptop, Smartphone, Users
} from 'lucide-react';
import { AuraLogo } from './App';

export default function LandingPage({
  onStartForFree,
  onTryDemo,
  onOpenLogin,
  darkMode,
  setDarkMode,
  onOpenProModal
}) {
  const [activeTemplateTab, setActiveTemplateTab] = useState('All');

  const templates = [
    { title: 'Engineering Sprint & Backlog', category: 'Work', tasks: 12, icon: '💻', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
    { title: 'Product Launch & GTM Plan', category: 'Work', tasks: 18, icon: '🚀', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
    { title: 'Personal Habit & Goal Tracker', category: 'Personal', tasks: 7, icon: '🌱', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { title: 'Weekly Deep Work & Time Boxing', category: 'Personal', tasks: 5, icon: '⏱️', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
    { title: 'Design System & Component Sprint', category: 'Work', tasks: 14, icon: '🎨', color: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400' },
    { title: 'Daily Shutdown & Evening Ritual', category: 'Personal', tasks: 4, icon: '🌙', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' }
  ];

  const filteredTemplates = activeTemplateTab === 'All'
    ? templates
    : templates.filter(t => t.category === activeTemplateTab);

  return (
    <div className={`min-h-screen selection:bg-red-500 selection:text-white ${darkMode ? 'dark bg-[#080c14] text-[#f1f5f9]' : 'bg-[#fffdfa] text-slate-900'}`}>
      
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Matching Screenshot 3)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-[#22304e] bg-[#fffdfa]/80 dark:bg-[#080c14]/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <AuraLogo className="w-8 h-8" />
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-[#f1f5f9]">
                Aura<span className="text-red-600">Task</span>
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-[#8899b5]">
              <a href="#features" className="hover:text-slate-900 dark:hover:text-[#f1f5f9] transition-colors">Features</a>
              <a href="#templates" className="hover:text-slate-900 dark:hover:text-[#f1f5f9] transition-colors">Templates</a>
              <a href="#aura-assist" className="hover:text-slate-900 dark:hover:text-[#f1f5f9] transition-colors">Aura Assist AI</a>
              <button onClick={onOpenProModal} className="hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 font-bold">
                <span>Pro Plan</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-red-100 dark:bg-[#451010] text-red-600 dark:text-red-400 rounded-full font-mono">NEW</span>
              </button>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] hover:bg-slate-200/50 dark:hover:bg-[#151d30] transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#8899b5] hover:text-slate-900 dark:hover:text-[#f1f5f9] transition-colors"
            >
              Log in
            </button>

            <button
              onClick={onStartForFree}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20 active:scale-[0.98] transition-all"
            >
              Start for free
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION: "Clarity, finally." (Matching Screenshot 3)
         ========================================================================= */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-red-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-[#451010]/50 border border-red-200/60 dark:border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Task Management with Midnight Precision</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-[#f1f5f9] leading-[1.08] mb-6">
            Clarity, finally.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-[#8899b5] max-w-2xl mx-auto mb-9 font-normal leading-relaxed">
            Organize tasks, projects, and high-velocity sprints. Designed with tactile swimlanes, Pomodoro flow timers, and low-eyestrain midnight depth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={onStartForFree}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>Start for free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] hover:bg-slate-50 dark:hover:bg-[#1d2740] text-slate-800 dark:text-[#f1f5f9] font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Try Live Interactive Demo</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-[#475569] mt-3">
            Free forever • No credit card required • Offline-first local sync
          </p>

          {/* =========================================================================
              HERO APP MOCKUP PREVIEW (Screenshot 3 Style)
             ========================================================================= */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/60 dark:from-[#22304e]/60 to-transparent shadow-2xl border border-slate-200 dark:border-[#22304e]">
            <div className="bg-white dark:bg-[#0e1422] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#22304e] text-left">
              {/* Simulated Window Top Bar */}
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#151d30] border-b border-slate-200/70 dark:border-[#22304e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-[#8899b5]">AuraTask Workspace — Today & Inbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-[#063820] dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                    Live Demo Ready
                  </span>
                </div>
              </div>

              {/* Simulated Kanban & List Preview Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-[#080c14]">
                {/* Stage 1: To Do */}
                <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-[#f1f5f9]">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> To Do</span>
                    <span className="text-[11px] font-mono text-slate-400">2</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200/80 dark:border-[#22304e] rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#f1f5f9]">
                      <Circle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Review API architecture for v2</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-[#451010] text-red-600 dark:text-red-400">P1</span>
                      <span className="text-[9px] text-slate-400">#Engineering</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200/80 dark:border-[#22304e] rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#f1f5f9]">
                      <Circle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Prepare release notes copy</span>
                    </div>
                  </div>
                </div>

                {/* Stage 2: In Progress */}
                <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> In Progress</span>
                    <span className="text-[11px] font-mono text-slate-400">1</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#151d30] border border-amber-300 dark:border-amber-500/30 rounded-lg shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#f1f5f9]">
                      <Circle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Design tactile Linear midnight theme</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-[#452405] text-amber-600 dark:text-amber-400">P2</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> 25m Focus
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Completed */}
                <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                    <span className="text-[11px] font-mono text-slate-400">1</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200/80 dark:border-[#22304e] rounded-lg opacity-80">
                    <div className="flex items-center gap-2 text-xs font-semibold line-through text-slate-400 dark:text-[#475569]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 dark:fill-[#063820]" />
                      <span>Automated SSL certificates deployment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURE 1: "Capture tasks at the speed of thought" (Screenshot 3)
         ========================================================================= */}
      <section id="features" className="py-20 border-t border-slate-200/60 dark:border-[#22304e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Fast Capture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#f1f5f9]">
                Capture tasks at the speed of thought
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#8899b5] leading-relaxed">
                Add tasks in seconds using keyboard shortcuts, natural dates, and priority flags. The rich 2-column task detail modal gives you full control over subtasks, file attachments, and activity discussions.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Instant modal with subtasks & comment thread',
                  'P1 to P4 flag priorities with midnight luminous badges',
                  'Custom tags with automatic task categorization'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#f1f5f9]">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual representation */}
            <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#22304e]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#f1f5f9]">
                  <Inbox className="w-4 h-4 text-red-600" />
                  <span>Inbox / Quick Add</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Ctrl + N</span>
              </div>
              <div className="py-4 space-y-3">
                <input
                  type="text"
                  readOnly
                  value="Launch marketing newsletter tomorrow at 10am #Marketing"
                  className="w-full text-sm font-bold bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-xl p-3 text-slate-800 dark:text-[#f1f5f9]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-[#063820] dark:text-emerald-400">
                    📅 Tomorrow, 10:00 AM
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-[#451010] dark:text-red-400">
                    🚩 P1 Urgent
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-[#1d2740] dark:text-[#8899b5]">
                    #Marketing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURE 2: "Stay organized and focused" (Screenshot 3)
         ========================================================================= */}
      <section className="py-20 bg-slate-50/60 dark:bg-[#0e1422]/50 border-t border-slate-200/60 dark:border-[#22304e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual preview of Structured List View */}
            <div className="order-2 lg:order-1 bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#22304e]">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#f1f5f9]">Inbox</h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-[#8899b5] flex items-center gap-1">
                  <ListFilter className="w-3.5 h-3.5" /> Display
                </span>
              </div>

              {/* Collapsible Section 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-[#f1f5f9]">
                  <span className="flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
                    <span>In progress</span>
                    <span className="text-[11px] font-mono text-slate-400">2</span>
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  <div className="flex items-center gap-2.5 py-1 text-xs text-slate-800 dark:text-[#f1f5f9] border-b border-slate-100 dark:border-[#22304e]/60 pb-2">
                    <Circle className="w-4 h-4 text-slate-300 dark:text-[#475569]" />
                    <span>Complete mobile responsive review</span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1 text-xs text-slate-800 dark:text-[#f1f5f9] border-b border-slate-100 dark:border-[#22304e]/60 pb-2">
                    <Circle className="w-4 h-4 text-slate-300 dark:text-[#475569]" />
                    <span>Deploy PostgreSQL database migrations</span>
                  </div>
                  <button className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 pt-1 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add task
                  </button>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Structure & Clarity
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#f1f5f9]">
                Stay organized and focused
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#8899b5] leading-relaxed">
                Tackle high workloads without anxiety. Toggle effortlessly between clean, collapsible structured list views and drag-and-drop Kanban swimlanes.
              </p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={onTryDemo}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-[#f1f5f9] text-white dark:text-[#080c14] text-xs font-bold rounded-xl"
                >
                  Explore Both Views
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURE 3: "Aura Assist — Smart features that feel magical" (Screenshot 3)
         ========================================================================= */}
      <section id="aura-assist" className="py-20 border-t border-slate-200/60 dark:border-[#22304e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Intelligent Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#f1f5f9] mt-2 mb-4">
              Aura Assist — Smart features that feel magical
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#8899b5]">
              Everything you need to sustain peak performance without mental fatigue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-[#451010] text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#f1f5f9] mb-2">Pomodoro Flow Timer</h3>
              <p className="text-xs text-slate-600 dark:text-[#8899b5] leading-relaxed">
                Start 25-minute laser focus intervals directly on any task with automatic minute tracking and karma rewards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-[#452405] text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#f1f5f9] mb-2">Daily Shutdown Ritual</h3>
              <p className="text-xs text-slate-600 dark:text-[#8899b5] leading-relaxed">
                Review completed goals, celebrate your wins with confetti, and disconnect cleanly for the evening.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#063820] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#f1f5f9] mb-2">Karma & Streak Engine</h3>
              <p className="text-xs text-slate-600 dark:text-[#8899b5] leading-relaxed">
                Gamify your productivity with daily streak tracking, goal completion tiers, and achievement levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TEMPLATES SHOWCASE (Screenshot 3)
         ========================================================================= */}
      <section id="templates" className="py-20 bg-slate-50/50 dark:bg-[#0e1422]/40 border-t border-slate-200/60 dark:border-[#22304e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#f1f5f9] mb-3">
              Kickstart your next project with templates
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#8899b5]">
              Pre-built project layouts for high performers, startups, and creative thinkers.
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {['All', 'Work', 'Personal'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTemplateTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTemplateTab === tab
                      ? 'bg-slate-900 text-white dark:bg-[#f1f5f9] dark:text-[#080c14]'
                      : 'bg-white dark:bg-[#151d30] text-slate-600 dark:text-[#8899b5] border border-slate-200 dark:border-[#22304e]'
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
                className="group p-5 bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-[#22304e] rounded-2xl hover:border-red-500/50 dark:hover:border-red-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">{tmpl.icon}</div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-[#f1f5f9] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#8899b5] mt-1">
                    {tmpl.tasks} pre-configured tasks & swimlanes
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#22304e] flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                  <span>Use template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. PRO PLAN SHOWCASE (Screenshot 1 & 3 integration)
         ========================================================================= */}
      <section className="py-20 border-t border-slate-200/60 dark:border-[#22304e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fdfbf7] dark:bg-[#0e1422] border border-amber-900/10 dark:border-[#22304e] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                AuraTask Pro
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f1f5f9] mt-1 mb-4">
                Get more done with the Pro plan
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8899b5] mb-6 leading-relaxed">
                Supercharge your workflow with unlimited projects, custom deadlines, Pomodoro analytics, and 150 filter views.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs font-medium text-slate-700 dark:text-[#f1f5f9]">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" /> 300 projects</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" /> Unlimited Ramble sessions</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" /> Custom reminders & deadlines</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" /> 150 filter views</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" /> Calendar & time-blocking</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" /> Aura Assist AI tools</div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={onOpenProModal}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20"
                >
                  View Pro Features
                </button>
                <button
                  onClick={onTryDemo}
                  className="text-xs font-semibold text-slate-600 dark:text-[#8899b5] hover:underline"
                >
                  Continue with Free Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CALL TO ACTION FOOTER BANNER
         ========================================================================= */}
      <section className="py-20 text-center relative overflow-hidden border-t border-slate-200/60 dark:border-[#22304e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-[#f1f5f9] mb-4">
            Gain clarity today.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#8899b5] mb-8">
            Start organizing your work and life with the most tactile, low-eyestrain planner.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onStartForFree}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-red-600/25 active:scale-[0.99] transition-all"
            >
              Start for free
            </button>
            <button
              onClick={onTryDemo}
              className="px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-[#151d30] text-slate-800 dark:text-[#f1f5f9] font-bold text-sm hover:bg-slate-200 dark:hover:bg-[#1d2740] transition-all"
            >
              Launch Live App
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER (Screenshot 3 style)
         ========================================================================= */}
      <footer className="border-t border-slate-200/60 dark:border-[#22304e] py-12 text-xs text-slate-500 dark:text-[#8899b5] bg-white dark:bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AuraLogo className="w-5 h-5" />
            <span className="font-extrabold text-sm text-slate-800 dark:text-[#f1f5f9]">AuraTask</span>
            <span className="text-slate-400 dark:text-[#475569]">© {new Date().getFullYear()} AuraTask by Haris Arshad</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-[#f1f5f9]">Features</a>
            <a href="#templates" className="hover:text-slate-900 dark:hover:text-[#f1f5f9]">Templates</a>
            <button onClick={onOpenProModal} className="hover:text-slate-900 dark:hover:text-[#f1f5f9]">Pro Plan</button>
            <button onClick={onTryDemo} className="hover:text-slate-900 dark:hover:text-[#f1f5f9]">Live Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
