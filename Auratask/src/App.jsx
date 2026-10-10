import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Trash2, Edit3, MoreHorizontal, Sparkles, X, Moon, Sun,
  ListFilter, Kanban, Tag, Flame, BarChart3, Bell, Play, Pause,
  RotateCcw, Star, LogIn, LogOut, Download, SlidersHorizontal, AlertCircle,
  BookOpen, ChevronRight, CheckSquare, Zap, Shield
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- LOGO: MINIMALIST ISOMETRIC DELTA ---
export const AuraLogo = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="auraNavy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="auraCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#auraNavy)" />
    <path d="M14 24L21 31L35 15" stroke="url(#auraCrimson)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="34" cy="33" r="2.5" fill="#ef4444" />
  </svg>
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [viewMode, setViewMode] = useState('board');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth state
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState(null);

  // Focus Timer
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Quick Add
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSection, setQuickSection] = useState('inbox');
  const [quickPriority, setQuickPriority] = useState('P2');
  const [quickDueTime, setQuickDueTime] = useState('');

  // Daily Shutdown Ritual Modal
  const [showShutdownModal, setShowShutdownModal] = useState(false);

  // Scratchpad
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState(() => localStorage.getItem('auratask_notes') || '');

  // 1. Initial Session Check & Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) setUserProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Tasks & Subscribe to Realtime Updates
  useEffect(() => {
    if (!session?.user) {
      // Local fallback for guest
      const local = localStorage.getItem('auratask_local_tasks');
      if (local) setTasks(JSON.parse(local));
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setTasks(data);
      setLoading(false);
    };

    fetchTasks();

    // Supabase Realtime channel
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [payload.new, ...prev.filter(t => t.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (activeTimerTask) {
        handleUpdateTask(activeTimerTask.id, {
          focused_minutes: (activeTimerTask.focused_minutes || 0) + 25
        });
      }
      alert('Focus cycle finished! Take a 5-minute break.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, activeTimerTask]);

  // 3. Database CRUD Operations
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask = {
      title: quickTitle.trim(),
      description: '',
      section: quickSection,
      priority: quickPriority,
      due_date: new Date().toISOString().split('T')[0],
      due_time: quickDueTime || '12:00',
      subtasks: [],
      is_focus: false,
      focused_minutes: 0,
    };

    if (session?.user) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, user_id: session.user.id }])
        .select();
      if (!error && data) setTasks(prev => [data[0], ...prev]);
    } else {
      const localTask = { ...newTask, id: `local-${Date.now()}` };
      const updated = [localTask, ...tasks];
      setTasks(updated);
      localStorage.setItem('auratask_local_tasks', JSON.stringify(updated));
    }
    setQuickTitle('');
    setQuickDueTime('');
  };

  const handleUpdateTask = async (id, updates) => {
    if (session?.user) {
      await supabase.from('tasks').update(updates).eq('id', id);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = async (id) => {
    if (session?.user) {
      await supabase.from('tasks').delete().eq('id', id);
    }
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    if (!session?.user) localStorage.setItem('auratask_local_tasks', JSON.stringify(updated));
  };

  const toggleTaskStatus = (task) => {
    const nextSection = task.section === 'completed' ? 'in_progress' : 'completed';
    handleUpdateTask(task.id, { section: nextSection });
  };

  // Auth Submit
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'register') {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: { data: { full_name: authFullName } }
      });
      if (error) setAuthError(error.message);
      else {
        alert('Registration successful! Please check your email to verify your account.');
        setShowAuthModal(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) setAuthError(error.message);
      else setShowAuthModal(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTasks([]);
  };

  // Filter Tasks
  const todayDateStr = new Date().toISOString().split('T')[0];
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (activeTab === 'today') return t.due_date === todayDateStr || t.is_focus;
      if (activeTab === 'upcoming') return t.due_date && t.due_date > todayDateStr;
      return true;
    });
  }, [tasks, searchQuery, activeTab, todayDateStr]);

  const big3Tasks = useMemo(() => tasks.filter(t => t.is_focus && t.section !== 'completed'), [tasks]);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-4 select-none shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <AuraLogo className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight flex items-center gap-1">
                Aura<span className="text-red-600">Task</span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold px-1 rounded">PRO</span>
              </h1>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                {session ? (userProfile?.user_metadata?.full_name || userProfile?.email) : 'Guest Mode'}
              </p>
            </div>
          </div>
          {session ? (
            <button onClick={handleSignOut} title="Sign Out" className="p-1.5 text-slate-400 hover:text-red-600">
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} title="Sign In" className="p-1.5 text-slate-400 hover:text-red-600">
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-sm pl-9 pr-3 py-1.5 rounded-lg border border-transparent focus:border-red-500 focus:outline-none dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Nav Links */}
        <nav className="space-y-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${activeTab === 'inbox' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">{tasks.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('today')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${activeTab === 'today' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>Today</span>
            </div>
            <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded-full">
              {tasks.filter(t => t.due_date === todayDateStr || t.is_focus).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${activeTab === 'upcoming' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Upcoming</span>
            </div>
          </button>
        </nav>

        {/* Scratchpad Trigger */}
        <button
          onClick={() => setShowScratchpad(!showScratchpad)}
          className="mt-4 w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Scratchpad</span>
        </button>

        {/* Focus Timer Widget */}
        {activeTimerTask && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
            <div className="flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Flow Timer</span>
              <button onClick={() => setActiveTimerTask(null)}><X className="w-3.5 h-3.5" /></button>
            </div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mb-2">{activeTimerTask.title}</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono tracking-tight text-red-600 dark:text-red-400">
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Shutdown Ritual Button */}
        <div className="mt-auto pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowShutdownModal(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/60"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Complete My Day</span>
          </button>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">Supabase Sync</span>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold capitalize text-slate-900 dark:text-white">{activeTab}</h2>
            <span className="text-xs text-slate-400">{filteredTasks.length} tasks</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${viewMode === 'board' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </header>

        {/* TODAY'S BIG 3 SPOTLIGHT STRIP */}
        {big3Tasks.length > 0 && (
          <div className="px-6 pt-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Today's Big 3 Non-Negotiables</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {big3Tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-medium truncate flex-1">{task.title}</span>
                    <button onClick={() => toggleTaskStatus(task)} className="ml-2 text-slate-400 hover:text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QUICK ADD BAR */}
        <div className="p-6 pb-2">
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              placeholder="+ Add task title..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
            />
            <select
              value={quickSection}
              onChange={(e) => setQuickSection(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium"
            >
              <option value="inbox">Inbox</option>
              <option value="backlog">Backlog</option>
              <option value="in_progress">In-Progress</option>
            </select>
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-medium"
            >
              <option value="P1">P1 (Urgent)</option>
              <option value="P2">P2 (High)</option>
              <option value="P3">P3 (Medium)</option>
              <option value="P4">P4 (Low)</option>
            </select>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors shadow-sm">
              Add Task
            </button>
          </form>
        </div>

        {/* TASKS VIEW */}
        <div className="flex-1 overflow-auto p-6 pt-2">
          {viewMode === 'board' ? (
            /* KANBAN BOARD */
            <div className="flex gap-6 h-full items-start">
              {['backlog', 'in_progress', 'completed'].map(colKey => {
                const colTasks = filteredTasks.filter(t => t.section === colKey);
                const colLabel = colKey === 'in_progress' ? 'In-Progress' : colKey.charAt(0).toUpperCase() + colKey.slice(1);

                return (
                  <div key={colKey} className="w-80 shrink-0 flex flex-col max-h-full bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-3">
                    <div className="flex items-center justify-between pb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{colLabel}</span>
                        <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {colTasks.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5">
                      {colTasks.map(task => (
                        <div key={task.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all">
                          <div className="flex items-start gap-2.5">
                            <button onClick={() => toggleTaskStatus(task)} className="mt-0.5 text-slate-400 hover:text-red-500">
                              {task.section === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.section === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>

                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'P1' ? 'bg-red-100 dark:bg-red-950 text-red-600' :
                                  task.priority === 'P2' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                  {task.priority}
                                </span>
                                {task.focused_minutes > 0 && (
                                  <span className="text-[10px] text-red-600 flex items-center gap-0.5 font-semibold">
                                    <Flame className="w-3 h-3" /> {task.focused_minutes}m
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button onClick={() => handleUpdateTask(task.id, { is_focus: !task.is_focus })} className={`p-1 ${task.is_focus ? 'text-amber-500' : 'text-slate-400'}`}>
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <button onClick={() => { setActiveTimerTask(task); setTimerSeconds(25 * 60); setIsTimerRunning(true); }} className="p-1 text-slate-400 hover:text-red-500">
                                <Play className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="max-w-4xl space-y-2">
              {filteredTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTaskStatus(task)} className="text-slate-400 hover:text-red-500">
                      {task.section === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <span className={`text-sm ${task.section === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* SCRATCHPAD DRAWER */}
      {showScratchpad && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shadow-xl flex flex-col z-40">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm">Meeting & Scratchpad</span>
            <button onClick={() => setShowScratchpad(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <textarea
            value={scratchpadText}
            onChange={(e) => { setScratchpadText(e.target.value); localStorage.setItem('auratask_notes', e.target.value); }}
            placeholder="Jot down quick bullets or ideas here..."
            className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs leading-relaxed focus:outline-none"
          />
        </div>
      )}

      {/* SHUTDOWN RITUAL MODAL */}
      {showShutdownModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <h3 className="font-bold text-lg mb-2">Daily Shutdown Ritual</h3>
            <p className="text-xs text-slate-500 mb-4">
              You completed {tasks.filter(t => t.section === 'completed').length} tasks today. Wrap up unfinished items and disconnect cleanly.
            </p>
            <button
              onClick={() => {
                alert('Workspace closed. Have a restful evening!');
                setShowShutdownModal(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl"
            >
              Sign Off & Lock Workspace
            </button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <AuraLogo className="w-6 h-6" />
                <h3 className="font-bold text-base">{authMode === 'login' ? 'Sign In' : 'Create Account'}</h3>
              </div>
              <button onClick={() => setShowAuthModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            {authError && <div className="p-2 mb-3 bg-red-50 text-red-600 text-xs rounded-lg">{authError}</div>}

            <form onSubmit={handleAuth} className="space-y-3">
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={authFullName}
                  onChange={(e) => setAuthFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border focus:outline-none"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border focus:outline-none"
              />
              <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg">
                {authMode === 'login' ? 'Sign In with Supabase' : 'Sign Up'}
              </button>
            </form>

            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="mt-4 text-xs text-red-600 w-full text-center hover:underline"
            >
              {authMode === 'login' ? "Need an account? Register" : 'Already registered? Log In'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}