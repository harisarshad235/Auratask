import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Trash2, Edit3, MoreHorizontal, Sparkles, X, Moon, Sun,
  ListFilter, Kanban, Tag, Flame, BarChart3, Bell, Play, Pause,
  RotateCcw, Star, LogIn, LogOut, Download, SlidersHorizontal, AlertCircle,
  BookOpen, ChevronRight, CheckSquare, Zap, Shield, ArrowRight, ArrowLeft,
  ChevronDown, Filter, Flag, Layers, Award, Target, Eye, EyeOff, User,
  Mail, Lock, Sparkle, RefreshCw, Menu, HelpCircle, CheckCircle, GripVertical
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import TaskModal from './TaskModal';
import ProPlanModal from './ProPlanModal';
import LandingPage from './LandingPage';

// --- LOGO: ISOMETRIC PRO DELTA ---
export const AuraLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="auraNavy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="auraCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="36" height="36" rx="12" fill="url(#auraNavy)" />
    <path d="M14 24L21 31L35 15" stroke="url(#auraCrimson)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="34" cy="33" r="2.5" fill="#ef4444" />
  </svg>
);

// --- SEED TASKS FOR PRO FIRST-RUN DEMO ---
const INITIAL_SEED_TASKS = [
  {
    id: 'seed-1',
    title: 'Review production launch checklist with engineering lead',
    description: 'Ensure SSL certificates, database read-replicas, and Sentry alerts are live.',
    section: 'todo',
    priority: 'P1',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '11:00',
    tags: ['#Engineering', '#Launch'],
    is_focus: true,
    focused_minutes: 25,
    subtasks: [
      { id: 'st-1', text: 'Verify Cloudflare DNS records', completed: true },
      { id: 'st-2', text: 'Validate database backup snapshots', completed: true },
      { id: 'st-3', text: 'Run smoke test on staging cluster', completed: false }
    ],
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'seed-2',
    title: 'Design high-converting onboarding flow for users',
    description: 'Create high-fidelity wireframes in Figma with modern light accents.',
    section: 'in_progress',
    priority: 'P1',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '15:30',
    tags: ['#Design', '#UX'],
    is_focus: true,
    focused_minutes: 50,
    subtasks: [
      { id: 'st-4', text: 'Component token library setup', completed: true },
      { id: 'st-5', text: 'Keyboard shortcuts modal prototype', completed: false }
    ],
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'seed-3',
    title: 'Weekly sync with marketing team on product positioning',
    description: 'Align copy and assets for newsletter broadcast and socials.',
    section: 'in_review',
    priority: 'P2',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    due_time: '14:00',
    tags: ['#Marketing'],
    is_focus: false,
    focused_minutes: 0,
    subtasks: [],
    created_at: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'seed-4',
    title: 'Completed database index optimization on user queries',
    description: 'Reduced average latency from 180ms down to 14ms across endpoints.',
    section: 'completed',
    priority: 'P2',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '09:00',
    tags: ['#Performance'],
    is_focus: false,
    focused_minutes: 45,
    subtasks: [
      { id: 'st-6', text: 'Analyze slow query log', completed: true },
      { id: 'st-7', text: 'Create composite index on tasks table', completed: true }
    ],
    created_at: new Date(Date.now() - 14400000).toISOString()
  }
];

export default function App() {
  // --- AUTH STATE ---
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('auratask_guest_mode') === 'true');
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // --- TASKS STATE ---
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('auratask_v3_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SEED_TASKS;
    } catch {
      return INITIAL_SEED_TASKS;
    }
  });

  // --- UI NAVIGATION & VIEW MODES ---
  const [activeTab, setActiveTab] = useState('today'); // 'inbox', 'today', 'upcoming', 'completed', 'tag-...'
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('auratask_theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- DRAG AND DROP & SWIMLANES STATE ---
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [boardGrouping, setBoardGrouping] = useState('stage'); // 'stage' or 'priority'

  // --- TOAST NOTIFICATIONS ---
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- INLINE TASK CREATOR ---
  const [showAddComposer, setShowAddComposer] = useState(false);
  const [composerSection, setComposerSection] = useState('todo');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('P2');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('');
  const [newTag, setNewTag] = useState('#Work');

  // --- POMODORO FLOW TIMER ---
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // --- PRO MODALS ---
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState(() => localStorage.getItem('auratask_notes') || '');
  const [expandedTaskSubtasks, setExpandedTaskSubtasks] = useState({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});

  // --- LANDING PAGE & MODALS STATE ---
  const [showLandingPage, setShowLandingPage] = useState(!session && !isGuest);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [modalDefaultSection, setModalDefaultSection] = useState('todo');
  const [showProPlanModal, setShowProPlanModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const handleOpenTaskModal = (taskToEdit = null, defaultSec = 'todo') => {
    setModalTask(taskToEdit);
    setModalDefaultSection(defaultSec || 'todo');
    setIsTaskModalOpen(true);
  };

  const handleSaveTaskModal = async (taskPayload) => {
    const existingIndex = tasks.findIndex(t => t.id === taskPayload.id);
    let updatedTasks = [];
    if (existingIndex !== -1) {
      updatedTasks = tasks.map(t => t.id === taskPayload.id ? { ...t, ...taskPayload } : t);
      showToast('Task updated');
    } else {
      updatedTasks = [taskPayload, ...tasks];
      showToast('Task created');
    }
    setTasks(updatedTasks);

    if (session?.user) {
      try {
        await supabase.from('tasks').upsert({
          ...taskPayload,
          user_id: session.user.id
        });
      } catch (err) {
        console.warn("Supabase upsert notice:", err);
      }
    }

    if (taskPayload.section === 'completed' && (!modalTask || modalTask.section !== 'completed')) {
      triggerCelebration();
    }
  };

  const handleDeleteTaskModal = async (taskId) => {
    handleDeleteTask(taskId);
  };

  const toggleSectionCollapse = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Sync dark mode class to <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('auratask_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('auratask_theme', 'light');
    }
  }, [darkMode]);

  // Sync tasks to localStorage continuously
  useEffect(() => {
    localStorage.setItem('auratask_v3_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // 1. Initial Session Check & Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setIsGuest(false);
      }
    }).catch(err => {
      console.warn("Supabase auth session check notice:", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setIsGuest(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // 2. Fetch Tasks from Supabase if logged in
  useEffect(() => {
    if (!session?.user) return;

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Normalize column names
          const normalized = data.map(item => ({
            ...item,
            section: item.section || 'todo',
            priority: item.priority || 'P2',
            tags: item.tags || ['#Work'],
            subtasks: Array.isArray(item.subtasks) ? item.subtasks : []
          }));
          setTasks(normalized);
        }
      } catch (err) {
        console.warn('Supabase fetch notice (using local offline cache):', err);
      }
    };

    fetchTasks();
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
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch {}
      showToast('🎉 Focus session complete! Take a well-deserved 5-minute break.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, activeTimerTask]);

  // --- CELEBRATION EFFECT ---
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
      });
    } catch {}
  };

  // --- BULLETPROOF TASK CRUD OPERATIONS ---
  const handleCreateTask = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newTitle.trim()) return;

    const taskObj = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      section: composerSection || 'todo',
      priority: newPriority || 'P2',
      due_date: newDueDate || new Date().toISOString().split('T')[0],
      due_time: newDueTime || '',
      tags: [newTag || '#Work'],
      is_focus: false,
      focused_minutes: 0,
      subtasks: [],
      created_at: new Date().toISOString()
    };

    // Optimistic Update immediately in UI
    setTasks(prev => [taskObj, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setNewDueTime('');
    setShowAddComposer(false);
    showToast('Task created successfully!');

    // Background Sync to Supabase if logged in
    if (session?.user) {
      try {
        await supabase
          .from('tasks')
          .insert([{ ...taskObj, user_id: session.user.id }]);
      } catch (err) {
        console.warn("Background cloud sync note:", err);
      }
    }
  };

  const handleUpdateTask = async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    if (session?.user) {
      try {
        await supabase.from('tasks').update(updates).eq('id', id);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task removed');

    if (session?.user) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }
  };

  const toggleTaskCompleted = (task) => {
    const isCompleted = task.section === 'completed';
    const nextSection = isCompleted ? 'todo' : 'completed';
    handleUpdateTask(task.id, { section: nextSection });

    if (!isCompleted) {
      triggerCelebration();
      showToast('Task completed! Keep the momentum going 🔥');
    }
  };

  const moveTaskSection = (taskId, direction) => {
    const sections = ['todo', 'in_progress', 'in_review', 'completed'];
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    let currentIndex = sections.indexOf(currentTask.section);
    if (currentIndex === -1) currentIndex = 0;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < sections.length) {
      const nextSection = sections[targetIndex];
      handleUpdateTask(taskId, { section: nextSection });
      if (nextSection === 'completed') triggerCelebration();
    }
  };

  // --- DRAG AND DROP DROP HANDLER ---
  const handleDropTask = (taskId, targetKey) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (boardGrouping === 'stage') {
      if (task.section === targetKey) return;
      handleUpdateTask(taskId, { section: targetKey });
      if (targetKey === 'completed') {
        triggerCelebration();
        showToast('Task completed! Keep the momentum going 🔥');
      } else {
        const labels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', completed: 'Completed' };
        showToast(`Moved to ${labels[targetKey] || targetKey}`);
      }
    } else {
      if (task.priority === targetKey) return;
      handleUpdateTask(taskId, { priority: targetKey });
      showToast(`Priority updated to ${targetKey}`);
    }
  };

  // --- SUBTASKS CHECKLIST HANDLERS ---
  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        handleUpdateTask(taskId, { subtasks: updatedSubtasks });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const handleAddSubtask = (taskId) => {
    const text = newSubtaskInputs[taskId];
    if (!text || !text.trim()) return;

    const newSubtask = {
      id: `st-${Date.now()}`,
      text: text.trim(),
      completed: false
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = [...(t.subtasks || []), newSubtask];
        handleUpdateTask(taskId, { subtasks: updated });
        return { ...t, subtasks: updated };
      }
      return t;
    }));

    setNewSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
  };

  // --- AUTH HANDLERS ---
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err) {
      console.warn("Google OAuth notice:", err);
      setAuthError(
        'Google Sign-In is connecting. You can sign in instantly using Email or "Explore as Guest" below!'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authFullName || authEmail.split('@')[0] }
          }
        });
        if (error) throw error;

        if (data?.session) {
          setSession(data.session);
          setIsGuest(false);
          setShowLandingPage(false);
          setShowAuthModal(false);
          showToast(`Welcome to AuraTask, ${authFullName || 'friend'}!`);
        } else {
          setAuthSuccessMsg('Account created successfully! Check your email to verify, or sign in.');
          setAuthMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;

        if (data?.session) {
          setSession(data.session);
          setIsGuest(false);
          setShowLandingPage(false);
          setShowAuthModal(false);
          showToast('Signed in successfully!');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check credentials or try Guest Mode.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    localStorage.setItem('auratask_guest_mode', 'true');
    setShowLandingPage(false);
    setShowAuthModal(false);
    showToast('Entered Guest Pro Mode. All features active!');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('auratask_guest_mode');
    setShowLandingPage(true);
    showToast('Signed out successfully.');
  };

  // --- FILTERED TASKS ENGINE ---
  const todayDateStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description && t.description.toLowerCase().includes(q);
        const matchTag = t.tags && t.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      // Tag Filter
      if (selectedTag && (!t.tags || !t.tags.includes(selectedTag))) {
        return false;
      }

      // Active Tab
      if (activeTab === 'inbox') {
        return t.section !== 'completed';
      }
      if (activeTab === 'today') {
        return (t.due_date === todayDateStr || t.is_focus) && t.section !== 'completed';
      }
      if (activeTab === 'upcoming') {
        return t.due_date > todayDateStr && t.section !== 'completed';
      }
      if (activeTab === 'completed') {
        return t.section === 'completed';
      }

      return true;
    });
  }, [tasks, searchQuery, selectedTag, activeTab, todayDateStr]);

  // Productivity Metrics
  const completedCount = useMemo(() => tasks.filter(t => t.section === 'completed').length, [tasks]);
  const todayDueCount = useMemo(() => tasks.filter(t => t.due_date === todayDateStr && t.section !== 'completed').length, [tasks, todayDateStr]);
  const big3Tasks = useMemo(() => tasks.filter(t => t.is_focus && t.section !== 'completed'), [tasks]);

  // =========================================================================
  // 1. FULLSCREEN LANDING PAGE & PRODUCT SHOWCASE (IF EXPLORING OR LOGGED OUT)
  // =========================================================================
  if ((!session && !isGuest) || showLandingPage) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-[#080c14] text-[#f1f5f9]' : 'bg-[#fffdfa] text-slate-900'}`}>
        <LandingPage
          onStartForFree={() => { setAuthMode('register'); setShowAuthModal(true); }}
          onTryDemo={handleGuestLogin}
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenProModal={() => setShowProPlanModal(true)}
        />

        {/* --- AUTH MODAL DIALOG OVERLAY --- */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-slate-900/60 backdrop-blur-md transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Clean Modern Auth Card */}
              <div className="bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-[#22304e] rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white dark:bg-[#1d2740] text-slate-900 dark:text-[#f1f5f9] shadow-xs' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]'}`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-[#1d2740] text-slate-900 dark:text-[#f1f5f9] shadow-xs' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]'}`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-[#22304e] bg-white dark:bg-[#151d30] hover:bg-slate-50 dark:hover:bg-[#1d2740] text-slate-800 dark:text-[#f1f5f9] font-semibold text-sm flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-5 flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-[#22304e] w-full"></div>
                  <span className="bg-white dark:bg-[#0e1422] px-3 text-[11px] font-medium text-slate-400 dark:text-[#8899b5] absolute">
                    or continue with email
                  </span>
                </div>

                {/* Error / Success Notifications */}
                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-[#451010]/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{authError}</span>
                  </div>
                )}
                {authSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-[#063820]/70 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{authSuccessMsg}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#8899b5] mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-[#475569]" />
                        <input
                          type="text"
                          required
                          placeholder="Alex Rivera"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#8899b5] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-[#475569]" />
                      <input
                        type="email"
                        required
                        placeholder="alex@acme.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#8899b5] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-[#475569]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 dark:text-[#8899b5] hover:text-slate-600 dark:hover:text-[#f1f5f9]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{authMode === 'register' ? 'Sign Up for Free' : 'Sign In to Workspace'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Guest / Demo Mode Button */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#22304e] text-center">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#8899b5] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explore as Guest (No Sign Up Needed)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRO PLAN MODAL */}
        <ProPlanModal
          isOpen={showProPlanModal}
          onClose={() => setShowProPlanModal(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN APPLICATION WORKSPACE (LOGGED IN / GUEST DEMO MODE)
  // =========================================================================
  return (
    <div className={`min-h-screen flex selection:bg-red-500 selection:text-white ${darkMode ? 'dark bg-[#080c14] text-[#f1f5f9]' : 'bg-[#fafafa] text-slate-800'}`}>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-[#151d30] dark:text-[#f1f5f9] dark:border dark:border-[#22304e] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE DRAWER BACKDROP */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0e1422] border-r border-slate-200/80 dark:border-[#22304e] flex flex-col p-4 transition-transform duration-300 lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand & Workspace */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-[#22304e]">
          <div className="flex items-center gap-2.5">
            <AuraLogo className="w-7 h-7" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-[#f1f5f9]">
                  Aura<span className="text-red-600">Task</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowProPlanModal(true)}
                  className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-red-100 text-red-600 dark:bg-[#451010] dark:text-red-400 border border-transparent dark:border-red-500/20 hover:scale-105 transition-transform"
                  title="AuraTask Pro Features"
                >
                  PRO
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-[#8899b5] truncate max-w-[130px]">
                {session?.user?.user_metadata?.full_name || session?.user?.email || (isGuest ? 'Guest Explorer' : 'Personal')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] rounded-lg hover:bg-slate-100 dark:hover:bg-[#151d30]"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-[#451010]/50"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Quick Add Action */}
        <button
          onClick={() => handleOpenTaskModal(null, activeTab === 'inbox' ? 'todo' : 'todo')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-sm shadow-red-500/20 mb-4 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add task</span>
          <span className="ml-auto text-[10px] bg-red-700/60 px-1.5 py-0.5 rounded font-mono font-normal">⌘N</span>
        </button>

        {/* Primary Views */}
        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('inbox'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'inbox' && !selectedTag ? 'bg-red-50 dark:bg-[#451010]/50 text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]'}`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-blue-500" />
              <span>Inbox</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#8899b5]">
              {tasks.filter(t => t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('today'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'today' && !selectedTag ? 'bg-red-50 dark:bg-[#451010]/50 text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]'}`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Today</span>
            </div>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-[#451010] dark:text-red-400 border border-transparent dark:border-red-500/30 font-mono">
              {todayDueCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('upcoming'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'upcoming' && !selectedTag ? 'bg-red-50 dark:bg-[#451010]/50 text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]'}`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Upcoming</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#8899b5]">
              {tasks.filter(t => t.due_date > todayDateStr && t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('completed'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'completed' && !selectedTag ? 'bg-red-50 dark:bg-[#451010]/50 text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]'}`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Completed</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#8899b5]">
              {completedCount}
            </span>
          </button>
        </nav>

        {/* Productivity & Pro Features Section */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#22304e] space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-[#475569]">
            Pro Features
          </div>

          <button
            onClick={() => setShowKarmaModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Karma & Streaks</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-[#452405] text-amber-700 dark:text-amber-400 border border-transparent dark:border-amber-500/30">
              4 Days 🔥
            </span>
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Meeting Scratchpad</span>
            </div>
          </button>

          <button
            onClick={() => setShowShutdownModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-[#063820]/70 hover:bg-emerald-100/70 dark:hover:bg-[#063820] border border-emerald-200/50 dark:border-emerald-600/30"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" />
              <span>Daily Shutdown Ritual</span>
            </div>
          </button>

          <button
            onClick={() => setShowProPlanModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-[#452405]/30 hover:bg-amber-100/70 dark:hover:bg-[#452405]/50 border border-amber-200/50 dark:border-amber-500/30"
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>AuraTask Pro Plan</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900/60 font-mono">PRO</span>
          </button>

          <button
            onClick={() => setShowLandingPage(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#151d30] dark:hover:text-[#f1f5f9]"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Landing Page / Tour</span>
            </div>
            <span className="text-[10px] text-slate-400">View</span>
          </button>
        </div>

        {/* Tags / Projects Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#22304e]">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-[#475569] flex items-center justify-between">
            <span>Tags & Projects</span>
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)} className="text-[10px] text-red-500 hover:underline">
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {['#Engineering', '#Design', '#Launch', '#Marketing', '#UX', '#Performance'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTag === tag ? 'bg-red-50 dark:bg-[#451010]/50 text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9] hover:bg-slate-100 dark:hover:bg-[#151d30]'}`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 opacity-60" />
                  <span>{tag}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-[#475569]">
                  {tasks.filter(t => t.tags && t.tags.includes(tag)).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Focus Flow Timer Widget */}
        {activeTimerTask && (
          <div className="mt-auto pt-3">
            <div className="p-3 bg-red-50 dark:bg-[#0e1422] border border-red-200 dark:border-[#22304e] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Flow Session</span>
                <button onClick={() => setActiveTimerTask(null)}><X className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-[#f1f5f9] truncate mb-2">{activeTimerTask.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono tracking-tight text-red-600 dark:text-red-400">
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-2xs"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }}
                    className="p-1.5 bg-slate-200 dark:bg-[#151d30] border border-transparent dark:border-[#22304e] text-slate-700 dark:text-[#8899b5] rounded-lg"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Status Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#22304e] flex items-center justify-between text-[11px] text-slate-400 dark:text-[#475569]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{session ? 'Cloud Sync Active' : 'Offline Cache Active'}</span>
          </span>
          <span className="font-mono">v2.4 Pro</span>
        </div>
      </aside>

      {/* --- MAIN CONTENT CANVAS --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-200/80 dark:border-[#22304e] bg-white/80 dark:bg-[#0e1422]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] lg:hidden rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold capitalize text-slate-900 dark:text-[#f1f5f9] flex items-center gap-2">
                <span>{selectedTag ? `Tag: ${selectedTag}` : activeTab}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] text-slate-500 dark:text-[#8899b5]">
                  {filteredTasks.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden sm:block w-52 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#475569]" />
              <input
                type="text"
                placeholder="Search tasks or #tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-[#151d30] text-xs pl-9 pr-3 py-2 rounded-xl border border-transparent dark:border-[#22304e] focus:border-red-500 focus:bg-white dark:focus:bg-[#1d2740] focus:outline-none text-slate-900 dark:text-[#f1f5f9] transition-all placeholder:text-slate-400 dark:placeholder:text-[#475569]"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-[#151d30] p-0.5 rounded-xl border border-slate-200 dark:border-[#22304e]">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'board' ? 'bg-white dark:bg-[#1d2740] text-slate-900 dark:text-[#f1f5f9] shadow-2xs' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]'}`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#1d2740] text-slate-900 dark:text-[#f1f5f9] shadow-2xs' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]'}`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Swimlanes / Group By Toggle (Only visible on Board view) */}
            {viewMode === 'board' && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#151d30] p-0.5 rounded-xl border border-slate-200 dark:border-[#22304e] text-xs font-bold">
                <button
                  onClick={() => setBoardGrouping('stage')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${boardGrouping === 'stage' ? 'bg-white dark:bg-[#1d2740] text-slate-900 dark:text-[#f1f5f9] shadow-2xs' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]'}`}
                  title="Group lanes by Workflow Stages"
                >
                  Stages
                </button>
                <button
                  onClick={() => setBoardGrouping('priority')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${boardGrouping === 'priority' ? 'bg-white dark:bg-[#1d2740] text-slate-900 dark:text-[#f1f5f9] shadow-2xs' : 'text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]'}`}
                  title="Group into Priority Swimlanes"
                >
                  Priority Swimlanes
                </button>
              </div>
            )}

            {/* Quick Add Button Header */}
            <button
              onClick={() => handleOpenTaskModal(null, activeTab === 'inbox' ? 'todo' : 'todo')}
              className="p-2 sm:px-3 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-red-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE SCROLL AREA */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">

          {/* TODAY'S BIG 3 SPOTLIGHT STRIP */}
          {big3Tasks.length > 0 && activeTab === 'today' && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#452405]/30 dark:to-[#151d30]/60 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-400">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Today's Big 3 Priority Spotlight</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {big3Tasks.length} non-negotiables
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {big3Tasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-[#151d30] border border-amber-200/70 dark:border-[#22304e] p-3 rounded-xl shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-[#f1f5f9] truncate">{task.title}</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{task.priority} Priority</span>
                    </div>
                    <button
                      onClick={() => toggleTaskCompleted(task)}
                      className="p-1 rounded-lg text-slate-300 dark:text-[#475569] hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-[#063820]/50"
                    >
                      <Circle className="w-4 h-4 hover:fill-emerald-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INLINE EXPANDABLE ADD COMPOSER */}
          {showAddComposer && (
            <div className="mb-6 bg-white dark:bg-[#151d30] border border-red-300 dark:border-[#22304e] rounded-2xl p-4 shadow-lg shadow-red-500/5 transition-all">
              <form onSubmit={handleCreateTask}>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Task name, e.g. 'Deploy Redis caching cluster'..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:outline-none mb-2"
                />
                <textarea
                  rows={2}
                  placeholder="Description, markdown notes, or checklist specs..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-600 dark:text-[#8899b5] placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:outline-none resize-none mb-3"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-[#22304e]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Due Date Presets */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0e1422] border border-transparent dark:border-[#22304e] px-2 py-1 rounded-lg text-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-[#f1f5f9]"
                      />
                    </div>

                    {/* Priority Selector */}
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="bg-slate-100 dark:bg-[#0e1422] border border-transparent dark:border-[#22304e] text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-[#f1f5f9]"
                    >
                      <option value="P1">🚩 P1 (Urgent)</option>
                      <option value="P2">🔶 P2 (High)</option>
                      <option value="P3">🔷 P3 (Medium)</option>
                      <option value="P4">⚪ P4 (Low)</option>
                    </select>

                    {/* Stage Column Selector */}
                    <select
                      value={composerSection}
                      onChange={(e) => setComposerSection(e.target.value)}
                      className="bg-slate-100 dark:bg-[#0e1422] border border-transparent dark:border-[#22304e] text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-[#f1f5f9]"
                    >
                      <option value="todo">📋 To Do</option>
                      <option value="in_progress">⚡ In Progress</option>
                      <option value="in_review">👀 In Review</option>
                      <option value="completed">✅ Completed</option>
                    </select>

                    {/* Tag Selector */}
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-slate-100 dark:bg-[#0e1422] border border-transparent dark:border-[#22304e] text-xs font-bold px-2 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-[#f1f5f9]"
                    >
                      <option value="#Engineering">#Engineering</option>
                      <option value="#Design">#Design</option>
                      <option value="#Launch">#Launch</option>
                      <option value="#Marketing">#Marketing</option>
                      <option value="#UX">#UX</option>
                      <option value="#Performance">#Performance</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddComposer(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#1d2740] dark:hover:text-[#f1f5f9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    >
                      Add task
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* --- VIEW MODE 1: KANBAN BOARD VIEW (WITH DRAG & DROP SWIMLANES) --- */}
          {viewMode === 'board' ? (
            <div className="flex gap-5 pb-6 overflow-x-auto min-h-[550px] items-start">
              {(boardGrouping === 'stage' ? [
                { key: 'todo', label: 'To Do', icon: Layers, accent: 'border-slate-300 dark:border-[#22304e]' },
                { key: 'in_progress', label: 'In Progress', icon: Flame, accent: 'border-amber-400 dark:border-amber-600' },
                { key: 'in_review', label: 'In Review', icon: Eye, accent: 'border-blue-400 dark:border-blue-600' },
                { key: 'completed', label: 'Completed', icon: CheckCircle2, accent: 'border-emerald-400 dark:border-emerald-600' }
              ] : [
                { key: 'P1', label: 'P1 (Urgent)', icon: Flag, accent: 'border-red-400 dark:border-red-600' },
                { key: 'P2', label: 'P2 (High)', icon: Flag, accent: 'border-amber-400 dark:border-amber-600' },
                { key: 'P3', label: 'P3 (Medium)', icon: Flag, accent: 'border-blue-400 dark:border-blue-600' },
                { key: 'P4', label: 'P4 (Low)', icon: Flag, accent: 'border-slate-400 dark:border-[#22304e]' }
              ]).map(column => {
                const columnTasks = filteredTasks.filter(t =>
                  boardGrouping === 'stage' ? t.section === column.key : t.priority === column.key
                );
                const isOver = dragOverColumn === column.key;

                return (
                  <div
                    key={column.key}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverColumn !== column.key) setDragOverColumn(column.key);
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget)) return;
                      setDragOverColumn(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                      if (taskId) handleDropTask(taskId, column.key);
                      setDragOverColumn(null);
                      setDraggingTaskId(null);
                    }}
                    className={`w-80 shrink-0 flex flex-col bg-slate-100/80 dark:bg-[#0e1422]/70 border rounded-2xl p-3 max-h-full transition-all duration-200 ${
                      isOver
                        ? 'ring-2 ring-red-500/70 border-red-400 dark:border-red-600/70 bg-red-50/40 dark:bg-[#151d30] shadow-md'
                        : 'border-slate-200/80 dark:border-[#22304e]'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-[#f1f5f9]">
                          {column.label}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] text-slate-600 dark:text-[#8899b5]">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddComposer(true);
                          if (boardGrouping === 'stage') setComposerSection(column.key);
                          else setNewPriority(column.key);
                        }}
                        className="p-1 hover:bg-white dark:hover:bg-[#151d30] rounded-lg text-slate-400 dark:text-[#8899b5] hover:text-red-600 dark:hover:text-red-400"
                        title={`Add task to ${column.label}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Column Task Cards & Drop Zone */}
                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px]">
                      {/* Active Drop Placeholder Indicator */}
                      {isOver && draggingTaskId && (
                        <div className="border-2 border-dashed border-red-400 dark:border-red-500/80 rounded-xl p-3.5 text-center text-xs font-bold text-red-500 dark:text-red-400 bg-red-50/60 dark:bg-[#451010]/40 animate-pulse flex items-center justify-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Drop task into {column.label}</span>
                        </div>
                      )}

                      {columnTasks.map(task => {
                        const isTaskCompleted = task.section === 'completed';
                        const subtasks = task.subtasks || [];
                        const completedSubtasks = subtasks.filter(st => st.completed).length;
                        const isSubtasksExpanded = expandedTaskSubtasks[task.id];
                        const isBeingDragged = draggingTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggingTaskId(task.id);
                            }}
                            onDragEnd={() => {
                              setDraggingTaskId(null);
                              setDragOverColumn(null);
                            }}
                            className={`group bg-white dark:bg-[#151d30] border rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged
                                ? 'opacity-30 scale-95 border-dashed border-red-500 shadow-xl'
                                : isTaskCompleted
                                  ? 'border-slate-200/60 dark:border-[#22304e]/70 opacity-80 dark:bg-[#151d30]/70'
                                  : 'border-slate-200/90 dark:border-[#22304e] hover:border-slate-300 dark:hover:border-[#2f426c] dark:hover:bg-[#1d2740]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Drag Grip Handle */}
                              <div className="text-slate-300 dark:text-[#475569] group-hover:text-slate-400 dark:group-hover:text-[#8899b5] shrink-0 mt-0.5 cursor-grab">
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>

                              {/* Circular Checkbox */}
                              <button
                                onClick={() => toggleTaskCompleted(task)}
                                className="mt-0.5 text-slate-300 dark:text-[#475569] hover:text-emerald-500 transition-colors shrink-0"
                              >
                                {isTaskCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-[#063820]" />
                                ) : (
                                  <Circle className="w-4 h-4 hover:stroke-emerald-500" />
                                )}
                              </button>

                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleOpenTaskModal(task)}
                              >
                                <h4 className={`text-xs font-bold leading-snug break-words ${isTaskCompleted ? 'line-through text-slate-400 dark:text-[#475569]' : 'text-slate-900 dark:text-[#f1f5f9]'}`}>
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-[11px] text-slate-500 dark:text-[#8899b5] mt-1 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Metadata Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                  {/* Priority Flag */}
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                    task.priority === 'P1'
                                      ? 'bg-red-500/10 dark:bg-[#451010] text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
                                      : task.priority === 'P2'
                                        ? 'bg-amber-500/10 dark:bg-[#452405] text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
                                        : task.priority === 'P3'
                                          ? 'bg-blue-500/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30'
                                          : 'bg-slate-500/10 dark:bg-[#151d30] text-slate-500 dark:text-[#8899b5] border border-slate-500/20 dark:border-[#22304e]'
                                  }`}>
                                    <Flag className="w-2.5 h-2.5" />
                                    <span>{task.priority}</span>
                                  </span>

                                  {/* Due Date */}
                                  {task.due_date && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                      task.due_date === todayDateStr
                                        ? 'bg-emerald-500/10 dark:bg-[#063820] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30'
                                        : 'bg-slate-100 dark:bg-[#1d2740] text-slate-500 dark:text-[#8899b5] border border-transparent dark:border-[#22304e]'
                                    }`}>
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>{task.due_date === todayDateStr ? 'Today' : task.due_date}</span>
                                    </span>
                                  )}

                                  {/* Tags */}
                                  {task.tags && task.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-semibold text-slate-500 dark:text-[#8899b5] bg-slate-100 dark:bg-[#1d2740] border border-transparent dark:border-[#22304e] px-1.5 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}

                                  {/* Focus Minutes Badge */}
                                  {task.focused_minutes > 0 && (
                                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5">
                                      <Flame className="w-3 h-3" /> {task.focused_minutes}m
                                    </span>
                                  )}
                                </div>

                                {/* Subtasks Progress Bar & Toggle */}
                                {subtasks.length > 0 && (
                                  <div className="mt-2.5">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTaskSubtasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                                      className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-[#8899b5] hover:text-slate-800 dark:hover:text-[#f1f5f9]"
                                    >
                                      <CheckSquare className="w-3 h-3" />
                                      <span>Subtasks ({completedSubtasks}/{subtasks.length})</span>
                                      <ChevronDown className={`w-3 h-3 transition-transform ${isSubtasksExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Expanded Subtasks List */}
                                    {isSubtasksExpanded && (
                                      <div className="mt-2 pl-2 space-y-1.5 border-l-2 border-slate-200 dark:border-[#22304e]">
                                        {subtasks.map(st => (
                                          <div key={st.id} className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={st.completed}
                                              onChange={() => handleToggleSubtask(task.id, st.id)}
                                              className="w-3 h-3 accent-red-600 rounded cursor-pointer"
                                            />
                                            <span className={`text-[11px] ${st.completed ? 'line-through text-slate-400 dark:text-[#475569]' : 'text-slate-700 dark:text-[#8899b5]'}`}>
                                              {st.text}
                                            </span>
                                          </div>
                                        ))}

                                        {/* Inline Add Subtask */}
                                        <div className="flex items-center gap-1.5 pt-1">
                                          <input
                                            type="text"
                                            placeholder="+ add subtask..."
                                            value={newSubtaskInputs[task.id] || ''}
                                            onChange={(e) => setNewSubtaskInputs({ ...newSubtaskInputs, [task.id]: e.target.value })}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(task.id); }}
                                            className="bg-transparent text-[10px] text-slate-700 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:outline-none border-b border-slate-200 dark:border-[#22304e] pb-0.5 flex-1"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card Footer: Quick Actions */}
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#22304e] flex items-center justify-between">
                              {/* 1-Click Move Column Arrows */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveTaskSection(task.id, 'prev')}
                                  disabled={column.key === 'todo'}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740] text-slate-400 dark:text-[#475569] hover:text-slate-700 dark:hover:text-[#f1f5f9] disabled:opacity-20"
                                  title="Move to previous stage"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => moveTaskSection(task.id, 'next')}
                                  disabled={column.key === 'completed'}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740] text-slate-400 dark:text-[#475569] hover:text-slate-700 dark:hover:text-[#f1f5f9] disabled:opacity-20"
                                  title="Move to next stage"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Star / Big 3 Pin */}
                                <button
                                  onClick={() => handleUpdateTask(task.id, { is_focus: !task.is_focus })}
                                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740] ${task.is_focus ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-[#475569] hover:text-amber-400'}`}
                                  title={task.is_focus ? "Unpin from Big 3" : "Pin to Big 3 Spotlight"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${task.is_focus ? 'fill-current' : ''}`} />
                                </button>

                                {/* Launch Flow Timer */}
                                <button
                                  onClick={() => { setActiveTimerTask(task); setTimerSeconds(25 * 60); setIsTimerRunning(true); showToast(`Flow Timer started for "${task.title.slice(0, 24)}..."`); }}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740] text-slate-300 dark:text-[#475569] hover:text-red-500 dark:hover:text-red-400"
                                  title="Start 25m Focus Session"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740] text-slate-300 dark:text-[#475569] hover:text-red-500 dark:hover:text-red-400"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Empty Column Placeholder */}
                      {columnTasks.length === 0 && !isOver && (
                        <div className="border border-dashed border-slate-200 dark:border-[#22304e] rounded-xl p-6 text-center text-xs text-slate-400 dark:text-[#475569]">
                          <span>No tasks in {column.label}</span>
                        </div>
                      )}

                      {/* Add task button in column */}
                      <button
                        type="button"
                        onClick={() => handleOpenTaskModal(null, column.key)}
                        className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 dark:text-[#8899b5] hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-1.5 hover:bg-slate-200/50 dark:hover:bg-[#151d30] rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add task</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- VIEW MODE 2: STRUCTURED COLLAPSIBLE SECTIONS LIST VIEW (Screenshot 4) --- */
            <div className="max-w-4xl space-y-6">
              {/* List View Controls Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#22304e]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-[#8899b5]">
                  <span>Grouping: {boardGrouping === 'stage' ? 'Workflow Sections' : 'Priority Swimlanes'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBoardGrouping(boardGrouping === 'stage' ? 'priority' : 'stage')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] hover:bg-slate-200/60 dark:hover:bg-[#1d2740] text-slate-700 dark:text-[#f1f5f9] flex items-center gap-1.5 transition-colors"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Display</span>
                </button>
              </div>

              {(boardGrouping === 'stage' ? [
                { key: 'todo', label: 'To Do', icon: Layers },
                { key: 'in_progress', label: 'In progress', icon: Flame },
                { key: 'in_review', label: 'In review', icon: Eye },
                { key: 'completed', label: 'completed', icon: CheckCircle2 }
              ] : [
                { key: 'P1', label: 'P1 (Urgent)', icon: Flag },
                { key: 'P2', label: 'P2 (High)', icon: Flag },
                { key: 'P3', label: 'P3 (Medium)', icon: Flag },
                { key: 'P4', label: 'P4 (Low)', icon: Flag }
              ]).map(sec => {
                const secTasks = filteredTasks.filter(t =>
                  boardGrouping === 'stage' ? t.section === sec.key : t.priority === sec.key
                );
                const isCollapsed = Boolean(collapsedSections[sec.key]);

                return (
                  <div key={sec.key} className="space-y-1.5">
                    {/* Section Header (Screenshot 4 exact layout) */}
                    <div className="flex items-center justify-between py-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse(sec.key)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-[#f1f5f9] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                        <span className="capitalize">{sec.label}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">{secTasks.length}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTaskModal(null, sec.key)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:text-[#8899b5] dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#151d30]"
                          title="Add task in section"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] rounded hover:bg-slate-100 dark:hover:bg-[#151d30]"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Tasks List */}
                    {!isCollapsed && (
                      <div className="space-y-1 pl-1">
                        {secTasks.map(task => {
                          const isTaskCompleted = task.section === 'completed';

                          return (
                            <div
                              key={task.id}
                              onClick={() => handleOpenTaskModal(task)}
                              className="group bg-white dark:bg-[#151d30] border border-slate-200/90 dark:border-[#22304e] hover:border-slate-300 dark:hover:border-[#2f426c] dark:hover:bg-[#1d2740] rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskCompleted(task);
                                  }}
                                  className="text-slate-300 dark:text-[#475569] hover:text-emerald-500 transition-colors shrink-0"
                                >
                                  {isTaskCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-[#063820]" />
                                  ) : (
                                    <Circle className="w-4 h-4 hover:stroke-emerald-500" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <span className={`text-xs font-semibold ${isTaskCompleted ? 'line-through text-slate-400 dark:text-[#475569]' : 'text-slate-900 dark:text-[#f1f5f9]'}`}>
                                    {task.title}
                                  </span>
                                  {task.description && (
                                    <p className="text-[11px] text-slate-400 dark:text-[#8899b5] truncate mt-0.5">{task.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {/* Priority Flag Pill */}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  task.priority === 'P1'
                                    ? 'bg-red-500/10 dark:bg-[#451010] text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
                                    : task.priority === 'P2'
                                      ? 'bg-amber-500/10 dark:bg-[#452405] text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
                                      : 'bg-slate-500/10 dark:bg-[#151d30] text-slate-500 dark:text-[#8899b5] border border-slate-500/20 dark:border-[#22304e]'
                                }`}>
                                  {task.priority}
                                </span>

                                {task.due_date && (
                                  <span className="text-[10px] text-slate-400 dark:text-[#8899b5] hidden sm:inline">
                                    {task.due_date}
                                  </span>
                                )}

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => { setActiveTimerTask(task); setTimerSeconds(25 * 60); setIsTimerRunning(true); }}
                                    className="p-1 text-slate-400 dark:text-[#8899b5] hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740]"
                                    title="Start Focus Timer"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1 text-slate-400 dark:text-[#8899b5] hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#1d2740]"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Inline + Add task Button (Screenshot 4 style) */}
                        <button
                          type="button"
                          onClick={() => handleOpenTaskModal(null, sec.key)}
                          className="w-full text-left py-2 px-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-2 rounded-xl hover:bg-red-50/50 dark:hover:bg-[#451010]/30 transition-colors"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add task</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-[#0e1422] border border-dashed border-slate-200 dark:border-[#22304e] rounded-2xl">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-[#f1f5f9]">No tasks in view</h3>
                  <p className="text-xs text-slate-400 dark:text-[#8899b5] mt-1">Add a new task or adjust your search filters.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* --- FLOATING MEETING SCRATCHPAD DRAWER --- */}
      {showScratchpad && (
        <div className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-[#0e1422] border-l border-slate-200 dark:border-[#22304e] p-5 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-[#f1f5f9]">Quick Scratchpad</span>
            </div>
            <button onClick={() => setShowScratchpad(false)} className="text-slate-400 dark:text-[#8899b5] hover:text-slate-600 dark:hover:text-[#f1f5f9]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#8899b5] mb-3">
            Auto-saves locally. Perfect for meeting takeaways and raw brainstorms.
          </p>
          <textarea
            value={scratchpadText}
            onChange={(e) => {
              setScratchpadText(e.target.value);
              localStorage.setItem('auratask_notes', e.target.value);
            }}
            placeholder="• Discuss backlog priorities with client&#10;• Need API schema by Thursday&#10;• Refactor authentication middleware..."
            className="flex-1 w-full bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569] rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none font-mono"
          />
        </div>
      )}

      {/* --- PRO KARMA & PRODUCTIVITY MODAL --- */}
      {showKarmaModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#f1f5f9]">Productivity & Karma</h3>
              </div>
              <button onClick={() => setShowKarmaModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-[#8899b5]" /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#452405]/40 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">Karma Score</span>
                  <p className="text-2xl font-black text-amber-800 dark:text-amber-300">1,840 pts</p>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Level: Master Achiever</span>
                </div>
                <Award className="w-10 h-10 text-amber-500" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151d30] border border-slate-200/80 dark:border-[#22304e] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-[#f1f5f9]">
                  <span>Daily Goal Progress</span>
                  <span>{completedCount} / 5 tasks</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1d2740] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (completedCount / 5) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-[#8899b5]">Complete 5 tasks daily to maintain your 4-day streak.</p>
              </div>
            </div>

            <button
              onClick={() => setShowKarmaModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-[#f1f5f9] text-white dark:text-[#080c14] font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- DAILY SHUTDOWN RITUAL MODAL --- */}
      {showShutdownModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-[#22304e] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-[#063820] text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-[#f1f5f9] mb-1">Daily Shutdown Ritual</h3>
            <p className="text-xs text-slate-500 dark:text-[#8899b5] mb-5 leading-relaxed">
              You crushed <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount} tasks</span> today. Disconnect cleanly, recharge, and return tomorrow with clarity.
            </p>

            <button
              onClick={() => {
                triggerCelebration();
                showToast('🎉 Workspace locked. Have a fantastic evening!');
                setShowShutdownModal(false);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
            >
              Complete My Day & Sign Off
            </button>
          </div>
        </div>
      )}

      {/* --- TASK DETAIL & CREATION MODAL (Screenshot 2) --- */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={modalTask}
        onSaveTask={handleSaveTaskModal}
        onDeleteTask={handleDeleteTaskModal}
        allTasks={filteredTasks}
        onSelectTask={(t) => setModalTask(t)}
        defaultSection={modalDefaultSection}
        darkMode={darkMode}
      />

      {/* --- PRO PLAN MODAL (Screenshot 1) --- */}
      <ProPlanModal
        isOpen={showProPlanModal}
        onClose={() => setShowProPlanModal(false)}
      />

    </div>
  );
}