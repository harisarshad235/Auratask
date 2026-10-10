import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Sparkles, ArrowRight, Star, Shield, Flame, Kanban, ListFilter,
  Play, Award, ChevronRight, Zap, Target, Layers, FileText, CheckSquare,
  MessageSquare, ExternalLink, Moon, Sun, Laptop, Smartphone, Users, Download,
  Mail, CalendarDays, Lock, Edit3, Heading, List, Code, Quote, Divide, RefreshCw, Eye,
  FastForward, BarChart3, Upload, Square
} from 'lucide-react';
import { AuraLogo } from './App';
import Logo from './components/brand/Logo';

export default function LandingPage({
  onStartForFree,
  onTryDemo,
  onOpenLogin,
  darkMode,
  setDarkMode
}) {
  const [activeTemplateTab, setActiveTemplateTab] = useState('All');

  const templates = [
    { title: 'Engineering Sprint & Backlog', category: 'Work', tasks: 12, icon: '💻', color: 'bg-neutral-100 text-neutral-800 dark:bg-[#121214] dark:text-[#ededed]' },
    { title: 'Product Launch & GTM Plan', category: 'Work', tasks: 18, icon: '🚀', color: 'bg-neutral-100 text-neutral-800 dark:bg-[#121214] dark:text-[#ededed]' },
    { title: 'Personal Habit & Goal Tracker', category: 'Personal', tasks: 7, icon: '🌱', color: 'bg-neutral-100 text-neutral-800 dark:bg-[#121214] dark:text-[#ededed]' },
    { title: 'Weekly Deep Work & Time Boxing', category: 'Personal', tasks: 5, icon: '⏱️', color: 'bg-neutral-100 text-neutral-800 dark:bg-[#121214] dark:text-[#ededed]' },
    { title: 'Design System & Component Sprint', category: 'Work', tasks: 14, icon: '🎨', color: 'bg-neutral-100 text-neutral-800 dark:bg-[#121214] dark:text-[#ededed]' },
    { title: 'Daily Shutdown & Evening Ritual', category: 'Personal', tasks: 4, icon: '🌙', color: 'bg-neutral-100 text-neutral-800 dark:bg-[#121214] dark:text-[#ededed]' }
  ];

  const filteredTemplates = activeTemplateTab === 'All'
    ? templates
    : templates.filter(t => t.category === activeTemplateTab);

  return (
    <div className={`min-h-screen selection:bg-red-500 selection:text-white ${darkMode ? 'dark bg-[#000000] text-[#ededed]' : 'bg-[#fafafa] text-neutral-900'}`}>
      
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Fey Obsidian Aesthetic)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-[#222225] bg-[#fafafa]/80 dark:bg-[#000000]/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Logo onClick={onTryDemo} href="/" />

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600 dark:text-[#a1a1aa]">
              <a href="#features" className="hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors">Features</a>
              <a href="#scratchpad" className="hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors">Meeting Scratchpad</a>
              <a href="#calendar-view" className="hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors">7-Day Horizon</a>
              <a href="#workflow-suite" className="hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors">Workflow Tools</a>
              <a href="#templates" className="hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors">Templates</a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:text-[#a1a1aa] dark:hover:text-[#ededed] hover:bg-neutral-200/50 dark:hover:bg-[#121214] transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-[#a1a1aa] hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors"
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
          2. HERO SECTION: "Clarity, finally." (Fey Obsidian Style)
         ========================================================================= */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-neutral-800/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225] text-neutral-700 dark:text-[#a1a1aa] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Tactile Task Management & Day-Wise Calendar Planning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-[#ededed] leading-[1.08] mb-6">
            Clarity, finally.
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 dark:text-[#a1a1aa] max-w-2xl mx-auto mb-9 font-normal leading-relaxed">
            Organize tasks, projects, and high-velocity daily sprints. Designed with obsidian depth, tactile Kanban swimlanes, and built-in Pomodoro flow sessions.
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-[#121214] border border-neutral-200 dark:border-[#222225] hover:bg-neutral-50 dark:hover:bg-[#1c1c20] text-neutral-800 dark:text-[#ededed] font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Try Live Interactive Demo</span>
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 dark:text-[#52525b] mt-3">
            100% Free forever • Daily local & cloud backup • Full features included
          </p>

          {/* =========================================================================
              HERO APP MOCKUP PREVIEW (Fey Dark Style)
             ========================================================================= */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-neutral-200/60 dark:from-[#222225] to-transparent shadow-2xl border border-neutral-200 dark:border-[#222225]">
            <div className="bg-white dark:bg-[#09090b] rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-[#222225] text-left">
              {/* Simulated Window Top Bar */}
              <div className="px-4 py-2.5 bg-neutral-50 dark:bg-[#121214] border-b border-neutral-200/70 dark:border-[#222225] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neutral-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-neutral-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-neutral-400/80"></div>
                  <span className="ml-2 text-xs font-semibold text-neutral-500 dark:text-[#a1a1aa]">AuraTask Workspace — Day-Wise Inbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-[#0d261a] dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                    Live Demo Ready
                  </span>
                </div>
              </div>

              {/* Simulated Kanban & List Preview Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50/50 dark:bg-[#000000]">
                {/* Stage 1: To Do */}
                <div className="bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-[#ededed]">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-neutral-400" /> To Do</span>
                    <span className="text-[11px] font-mono text-neutral-400">2</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-[#121214] border border-neutral-200/80 dark:border-[#222225] rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-[#ededed]">
                      <Circle className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Review API architecture & database indexes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-[#2a1215] text-red-600 dark:text-red-400">P1</span>
                      <span className="text-[9px] text-neutral-400">#Engineering</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-[#121214] border border-neutral-200/80 dark:border-[#222225] rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-[#ededed]">
                      <Circle className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Prepare release changelog notes</span>
                    </div>
                  </div>
                </div>

                {/* Stage 2: In Progress */}
                <div className="bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> In Progress</span>
                    <span className="text-[11px] font-mono text-neutral-400">1</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-[#121214] border border-amber-300 dark:border-amber-500/30 rounded-lg shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-[#ededed]">
                      <Circle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Design tactile Obsidian dark theme</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-[#281a0b] text-amber-600 dark:text-amber-400">P2</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> 25m Focus
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Completed */}
                <div className="bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                    <span className="text-[11px] font-mono text-neutral-400">1</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-[#121214] border border-neutral-200/80 dark:border-[#22304e] rounded-lg opacity-80">
                    <div className="flex items-center gap-2 text-xs font-semibold line-through text-neutral-400 dark:text-[#52525b]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 dark:fill-[#0d261a]" />
                      <span>Automated daily database backup snapshots</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURE 1: "Capture tasks at the speed of thought"
         ========================================================================= */}
      <section id="features" className="py-20 border-t border-neutral-200/60 dark:border-[#222225]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Fast Capture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#ededed]">
                Capture tasks at the speed of thought
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Add tasks in seconds using keyboard shortcuts, natural dates, and priority flags. The rich 2-column task detail modal gives you full control over subtasks, activity discussions, and target deadlines.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Instant modal with subtasks & comment thread',
                  'P1 to P4 flag priorities with clean monochrome obsidian contrast',
                  'Custom tags and sections with automatic task categorization'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-[#ededed]">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual representation */}
            <div className="bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-[#222225]">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-[#ededed]">
                  <Inbox className="w-4 h-4 text-red-600" />
                  <span>Inbox / Quick Add</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Ctrl + N</span>
              </div>
              <div className="py-4 space-y-3">
                <input
                  type="text"
                  readOnly
                  value="Launch marketing newsletter tomorrow at 10am #Marketing"
                  className="w-full text-sm font-bold bg-neutral-50 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225] rounded-xl p-3 text-neutral-800 dark:text-[#ededed]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-[#0d261a] dark:text-emerald-400">
                    📅 Tomorrow, 10:00 AM
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-[#2a1215] dark:text-red-400">
                    🚩 P1 Urgent
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-[#1c1c20] dark:text-[#a1a1aa]">
                    #Marketing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. NEW FEATURE: MEETING SCRATCHPAD & RICH LIVE NOTES
         ========================================================================= */}
      <section id="scratchpad" className="py-20 border-t border-neutral-200/60 dark:border-[#222225] bg-neutral-50/50 dark:bg-[#09090b]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> High-Velocity Note Taking
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#ededed]">
                Meeting Scratchpad. Capture minutes without losing focus.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Take tactical meeting notes, standup minutes, and sprint agendas directly within your workspace. Format in seconds with a rich markdown toolbar, toggle instant preview, and export to Markdown or let AuraTask auto-save to your encrypted database partition.
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
                      <span className="font-bold text-neutral-900 dark:text-[#ededed]">{item.title}: </span>
                      <span className="text-neutral-600 dark:text-[#a1a1aa]">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onTryDemo}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Test Scratchpad in Demo
                </button>
              </div>
            </div>

            {/* Simulated Scratchpad UI Mockup */}
            <div className="bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] rounded-3xl p-5 shadow-2xl space-y-3">
              {/* Toolbar Simulation */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-[#222225]">
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#121214] p-1 rounded-xl border border-neutral-200/80 dark:border-[#222225]">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-[#ededed] bg-white dark:bg-[#1c1c20] rounded-md shadow-xs">Write</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:text-[#a1a1aa]">Preview</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-600 dark:text-[#a1a1aa]">
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225]">• Bullet</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225]">☑ Task</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225]">H2</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225]">B</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121214] border border-neutral-200 dark:border-[#222225]">&lt;/&gt;</span>
                </div>
              </div>

              {/* Note Content Simulation */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-[#121214] border border-neutral-200/80 dark:border-[#222225] font-sans text-xs space-y-2.5">
                <div className="font-bold text-sm text-neutral-900 dark:text-[#ededed] flex items-center justify-between">
                  <span>Product Sprint & Architecture Review</span>
                  <span className="text-[10px] font-mono font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Auto-Saved to Cloud
                  </span>
                </div>
                <div className="text-[11px] text-neutral-700 dark:text-[#ededed] space-y-1 font-mono">
                  <p className="text-red-600 dark:text-red-400 font-bold">### Standup Sync</p>
                  <p className="text-neutral-700 dark:text-[#ededed]">• Resolved multi-tenant isolation; zero cross-user visibility.</p>
                  <p className="text-neutral-700 dark:text-[#ededed]">• 7-day rolling calendar horizon with 1-click reschedule active.</p>
                  <p className="text-red-600 dark:text-red-400 font-bold pt-1">### Action Items</p>
                  <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Deploy release v3.4 to production
                  </p>
                  <p className="text-neutral-500 dark:text-[#a1a1aa] flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-neutral-400" /> Share meeting summary with team
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#a1a1aa] px-1">
                <span>124 words • Markdown Formatted</span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
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
      <section id="calendar-view" className="py-20 bg-neutral-50/60 dark:bg-[#09090b]/50 border-t border-neutral-200/60 dark:border-[#222225]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual preview of 7-Day Horizon Strip & Reschedule */}
            <div className="order-2 lg:order-1 bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#222225]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-red-600" />
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed]">7-Day Calendar Horizon</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-[#2a1215] text-red-600 dark:text-red-400">
                  Rolling Week
                </span>
              </div>

              {/* 7-Day Quick Strip */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
                {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div
                    key={day}
                    className={`p-2 rounded-xl border text-[11px] font-bold ${
                      i === 0
                        ? 'bg-red-50 dark:bg-[#2a1215] border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400'
                        : i === 1
                        ? 'bg-neutral-100 dark:bg-[#121214] border-neutral-300 dark:border-[#222225] text-neutral-800 dark:text-[#ededed]'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    <div>{day}</div>
                    <div className="text-[10px] font-normal text-neutral-400 mt-0.5">{i === 0 ? '4 tasks' : i === 1 ? '2 tasks' : '0'}</div>
                  </div>
                ))}
              </div>

              {/* Task with 1-Click "Tomorrow" Reschedule */}
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-neutral-50 dark:bg-[#121214] border border-neutral-200/80 dark:border-[#222225] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Circle className="w-4 h-4 text-neutral-400" />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-[#ededed]">Finalize sprint retro documentation</div>
                      <div className="text-[10px] text-red-500 font-medium">Due Today • P1 Urgent</div>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white dark:bg-[#1c1c20] border border-neutral-200 dark:border-[#222225] text-neutral-700 dark:text-[#ededed] hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 shadow-xs">
                    <FastForward className="w-3 h-3 text-red-600" />
                    <span>Tomorrow</span>
                  </button>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-[#121214] border border-neutral-200/80 dark:border-[#222225] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-bold line-through text-neutral-400">Deploy isolated tenant schema migrations</div>
                      <div className="text-[10px] text-emerald-500 font-medium">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Effortless Rescheduling
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#ededed]">
                Plan today. Postpone to tomorrow with 1-click.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Tackle high workloads without anxiety. If tasks roll over, never spend time clicking date pickers. The dedicated 1-click <strong className="text-neutral-900 dark:text-[#ededed]">"⏩ Tomorrow"</strong> button moves overdue or unfinished tasks forward instantly.
              </p>
              <div className="space-y-2 pt-1 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-[#ededed]">
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
                  className="px-4 py-2.5 bg-neutral-900 dark:bg-[#ededed] text-white dark:text-[#000000] text-xs font-bold rounded-xl"
                >
                  Explore Calendar Horizon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. NEW FEATURE: ADVANCED WORKFLOW TOOLS (SCREENSHOT 1 SUITE)
         ========================================================================= */}
      <section id="workflow-suite" className="py-20 border-t border-neutral-200/60 dark:border-[#222225]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Power User Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#ededed] mt-2 mb-4">
              Advanced workflows that adapt to your exact stack
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-[#a1a1aa]">
              Everything power users demand: calendar feeds, dynamic swimlanes, email ingestion, and spreadsheet portability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#0d261a] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Inbox Calendar Feed (iCal)</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Subscribe to your AuraTask tasks directly inside Apple Calendar, Google Calendar, or Outlook with live webcal feed sync.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-[#2a1215] text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Email Tasks to Inbox</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Forward messages from your email client to your private inbox address to convert important emails into actionable tasks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#0e2138] text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Dynamic Custom Sections</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Create custom stages like "Client Review", "Blocked", or "Backlog" with 1-click and drag tasks freely across columns.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-[#201538] text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Audit Log & CSV Tools</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Audit every change with timestamped activity history. Full data export and import via CSV for complete data freedom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FEATURE: AURA ASSIST & STRICT MULTI-TENANT PRIVACY
         ========================================================================= */}
      <section id="aura-assist" className="py-20 border-t border-neutral-200/60 dark:border-[#222225] bg-neutral-50/40 dark:bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Intelligent Flow & Privacy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#ededed] mt-2 mb-4">
              Aura Assist — Focus tools and guaranteed privacy
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-[#a1a1aa]">
              Engineered for absolute privacy and peak focus with zero bloat or advertisements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-[#2a1215] text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Pomodoro Flow Timer</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Start 25-minute laser focus intervals directly on any task with automatic minute tracking and karma rewards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-[#281a0b] text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Daily Shutdown Ritual</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Review completed goals, celebrate your wins with confetti, and disconnect cleanly for the evening.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#0e2138] text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Zero Cross-User Leakage</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Strict multi-tenant isolation. Your tasks and meeting scratchpad are visible only to you. Isolated sandbox for guests.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-neutral-200 dark:border-[#222225] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#0d261a] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-[#ededed] mb-2">Daily Auto-Backup & Snapshots</h3>
              <p className="text-xs text-neutral-600 dark:text-[#a1a1aa] leading-relaxed">
                Never lose a task. Real-time persistent local backup snapshots, cloud database synchronization, and CSV export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TEMPLATES SHOWCASE
         ========================================================================= */}
      <section id="templates" className="py-20 bg-neutral-50/50 dark:bg-[#09090b]/40 border-t border-neutral-200/60 dark:border-[#222225]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#ededed] mb-3">
              Kickstart your next project with templates
            </h2>
            <p className="text-sm text-neutral-600 dark:text-[#a1a1aa]">
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
                      ? 'bg-neutral-900 text-white dark:bg-[#ededed] dark:text-[#000000]'
                      : 'bg-white dark:bg-[#121214] text-neutral-600 dark:text-[#a1a1aa] border border-neutral-200 dark:border-[#222225]'
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
                className="group p-5 bg-white dark:bg-[#09090b] border border-neutral-200/80 dark:border-[#222225] rounded-2xl hover:border-red-500/50 dark:hover:border-red-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">{tmpl.icon}</div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-[#ededed] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-[#a1a1aa] mt-1">
                    {tmpl.tasks} pre-configured tasks & swimlanes
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#222225] flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                  <span>Use template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CALL TO ACTION FOOTER BANNER
         ========================================================================= */}
      <section className="py-20 text-center relative overflow-hidden border-t border-neutral-200/60 dark:border-[#222225]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-[#ededed] mb-4">
            Gain clarity today.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-[#a1a1aa] mb-8">
            Start organizing your work and life with the most tactile, low-eyestrain obsidian workspace.
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
              className="px-6 py-3.5 rounded-xl bg-neutral-100 dark:bg-[#121214] text-neutral-800 dark:text-[#ededed] font-bold text-sm hover:bg-neutral-200 dark:hover:bg-[#1c1c20] transition-all"
            >
              Launch Live App
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
         ========================================================================= */}
      <footer className="border-t border-neutral-200/60 dark:border-[#222225] py-12 text-xs text-neutral-500 dark:text-[#a1a1aa] bg-white dark:bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo onClick={onTryDemo} href="/" />
            <span className="text-neutral-400 dark:text-[#52525b] border-l border-neutral-200 dark:border-[#222225] pl-3">© {new Date().getFullYear()} AuraTask by Haris Arshad</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <a href="#features" className="hover:text-neutral-900 dark:hover:text-[#ededed]">Features</a>
            <a href="#templates" className="hover:text-neutral-900 dark:hover:text-[#ededed]">Templates</a>
            <button onClick={onTryDemo} className="hover:text-neutral-900 dark:hover:text-[#ededed]">Live Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
