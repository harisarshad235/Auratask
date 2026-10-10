import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Trash2, Edit3, MoreHorizontal, Sparkles, X, Moon, Sun,
  ListFilter, Kanban, Tag, Flame, BarChart3, Bell, Play, Pause,
  RotateCcw, Star, LogIn, LogOut, Download, Upload, SlidersHorizontal, AlertCircle,
  BookOpen, ChevronRight, CheckSquare, Zap, Shield, ArrowRight, ArrowLeft,
  ChevronDown, Filter, Flag, Layers, Award, Target, Eye, EyeOff, User,
  Mail, Lock, Sparkle, RefreshCw, Menu, HelpCircle, CheckCircle, GripVertical,
  CalendarDays, Share2, FileText, Copy, HardDriveDownload, Archive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import TaskModal from './TaskModal';
import LandingPage from './LandingPage';
import MeetingScratchpad from './MeetingScratchpad';
import TaktLogo, { Logo } from './components/brand/TaktLogo';

// --- BRAND LOGO ---
export const AuraLogo = TaktLogo;

// --- DEFAULT WORKFLOW SECTIONS ---
const DEFAULT_SECTIONS = [
  { key: 'todo', label: 'To Do', icon: Layers },
  { key: 'in_progress', label: 'In progress', icon: Flame },
  { key: 'in_review', label: 'In review', icon: Eye },
  { key: 'completed', label: 'completed', icon: CheckCircle2 }
];

// --- GUEST DEMO TASKS (ISOLATED SANDBOX ONLY) ---
const GUEST_DEMO_TASKS = [
  {
    id: 'guest-task-1',
    title: 'Explore Takt Kanban swimlanes (Guest Sandbox)',
    description: 'This is a sample task in guest mode. Changes here are saved in your local guest sandbox only.',
    section: 'todo',
    priority: 'P1',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '11:00',
    tags: ['#Demo'],
    is_focus: true,
    focused_minutes: 0,
    subtasks: [
      { id: 'dst-1', text: 'Drag this card to another lane', completed: false },
      { id: 'dst-2', text: 'Click to open task detail modal', completed: false }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'guest-task-2',
    title: 'Try the 25m Focus Flow Pomodoro timer',
    description: 'Click the Play button on this card or in the modal to launch focus timer.',
    section: 'in_progress',
    priority: 'P2',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '14:30',
    tags: ['#Focus'],
    is_focus: false,
    focused_minutes: 25,
    subtasks: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'guest-task-3',
    title: 'Test 7-Day Day-Wise Calendar Horizon',
    description: 'Switch view mode in top header to Calendar to plan days visually.',
    section: 'in_review',
    priority: 'P3',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    due_time: '16:00',
    tags: ['#Planning'],
    is_focus: false,
    focused_minutes: 0,
    subtasks: [],
    created_at: new Date().toISOString()
  }
];

// --- GUEST DEMO NOTES (ISOLATED SANDBOX ONLY) ---
const GUEST_DEMO_NOTES = [
  {
    id: 'guest-note-1',
    title: 'Guest Sandbox Meeting Notes',
    content: `### Welcome to Guest Sandbox
• This is an isolated demo scratchpad.
• Your private notes are never visible to guests or other users.
• Sign up or log in to automatically save your private meeting notes to your encrypted cloud database account.

### Action Items
- [ ] Try formatting buttons: Bullet, Task checkbox, H2/H3
- [ ] Create a free account to sync across devices`,
    updated_at: new Date().toISOString()
  }
];

// Helper to safely load isolated user or guest data
const loadScopedWorkspaceData = (userId = null) => {
  if (userId) {
    try {
      const savedTasks = localStorage.getItem(`takt_tasks_u_${userId}`) || localStorage.getItem(`auratask_tasks_u_${userId}`);
      const savedNotes = localStorage.getItem(`takt_notes_u_${userId}`) || localStorage.getItem(`auratask_notes_u_${userId}`);
      const savedSections = localStorage.getItem(`takt_sections_u_${userId}`) || localStorage.getItem(`auratask_sections_u_${userId}`);
      const savedLogs = localStorage.getItem(`takt_activity_u_${userId}`) || localStorage.getItem(`auratask_activity_u_${userId}`);
      return {
        tasks: savedTasks ? JSON.parse(savedTasks) : [],
        notes: savedNotes ? JSON.parse(savedNotes) : [
          {
            id: `note-${Date.now()}`,
            title: 'Welcome to your Private Scratchpad',
            content: '### My Private Meeting Notes\n• Only visible to your account\n• Auto-saved to your personal cloud database\n\n### Action Items\n- [ ] Add your first task',
            updated_at: new Date().toISOString()
          }
        ],
        sections: savedSections ? JSON.parse(savedSections) : DEFAULT_SECTIONS,
        activity: savedLogs ? JSON.parse(savedLogs) : []
      };
    } catch {
      return { tasks: [], notes: [], sections: DEFAULT_SECTIONS, activity: [] };
    }
  } else {
    try {
      const guestTasks = localStorage.getItem('takt_guest_tasks') || localStorage.getItem('auratask_guest_tasks');
      const guestNotes = localStorage.getItem('takt_guest_notes') || localStorage.getItem('auratask_guest_notes');
      const guestSections = localStorage.getItem('takt_guest_sections') || localStorage.getItem('auratask_guest_sections');
      const guestLogs = localStorage.getItem('takt_guest_activity') || localStorage.getItem('auratask_guest_activity');

      // Strict User Restriction: Filter out any objects that belong to a real user account
      let parsedTasks = guestTasks ? JSON.parse(guestTasks) : GUEST_DEMO_TASKS;
      if (Array.isArray(parsedTasks)) {
        parsedTasks = parsedTasks.filter(t => !t.user_id || t.id.startsWith('guest-'));
        if (parsedTasks.length === 0) parsedTasks = GUEST_DEMO_TASKS;
      } else {
        parsedTasks = GUEST_DEMO_TASKS;
      }

      let parsedNotes = guestNotes ? JSON.parse(guestNotes) : GUEST_DEMO_NOTES;
      if (Array.isArray(parsedNotes)) {
        parsedNotes = parsedNotes.filter(n => !n.user_id || n.id.startsWith('guest-'));
        if (parsedNotes.length === 0) parsedNotes = GUEST_DEMO_NOTES;
      } else {
        parsedNotes = GUEST_DEMO_NOTES;
      }

      return {
        tasks: parsedTasks,
        notes: parsedNotes,
        sections: guestSections ? JSON.parse(guestSections) : DEFAULT_SECTIONS,
        activity: guestLogs ? JSON.parse(guestLogs) : [
          { id: 'act-demo-1', text: 'Started Guest Sandbox session', time: 'Just now', icon: 'sparkle' }
        ]
      };
    } catch {
      return { tasks: GUEST_DEMO_TASKS, notes: GUEST_DEMO_NOTES, sections: DEFAULT_SECTIONS, activity: [] };
    }
  }
};

export default function App() {
  // --- AUTH STATE ---
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(() => (localStorage.getItem('takt_guest_mode') || localStorage.getItem('auratask_guest_mode')) === 'true');
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [rememberMe, setRememberMe] = useState(() => (localStorage.getItem('takt_remember_me') || localStorage.getItem('auratask_remember_me')) !== 'false');
  const [authEmail, setAuthEmail] = useState(() => localStorage.getItem('takt_remembered_email') || localStorage.getItem('auratask_remembered_email') || '');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Initialize workspace data based on guest mode or initial session
  const initialData = useMemo(() => {
    try {
      const authStr = localStorage.getItem('sb-zamtslutoccexvqjepqz-auth-token');
      if (authStr) {
        const parsed = JSON.parse(authStr);
        if (parsed?.user?.id) return loadScopedWorkspaceData(parsed.user.id);
      }
    } catch {}
    return loadScopedWorkspaceData(null);
  }, []);

  // --- WORKSPACE STATES ---
  const [tasks, setTasks] = useState(() => initialData.tasks);
  const [customSections, setCustomSections] = useState(() => initialData.sections);
  const [meetingNotes, setMeetingNotes] = useState(() => initialData.notes);
  const [activityLogs, setActivityLogs] = useState(() => initialData.activity);

  // --- UI NAVIGATION & VIEW MODES ---
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'today', 'upcoming', 'completed', 'tag-...'
  const [viewMode, setViewMode] = useState('list'); // 'board' | 'list' | 'calendar'
  const [darkMode, setDarkMode] = useState(() => (localStorage.getItem('takt_theme') || localStorage.getItem('auratask_theme')) === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- SCREENSHOT 1 HEADER "..." DROPDOWN MENU STATE ---
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // --- MODALS FOR ACTIONS ---
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showEmailInboxModal, setShowEmailInboxModal] = useState(false);
  const [showCalendarFeedModal, setShowCalendarFeedModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const csvFileInputRef = useRef(null);

  const recordActivity = (text, icon = 'check') => {
    const newEntry = {
      id: `act-${Date.now()}`,
      text,
      time: 'Just now',
      icon,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  // --- DRAG AND DROP & SWIMLANES STATE ---
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);
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

  // --- PRODUCTIVITY MODALS ---
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [expandedTaskSubtasks, setExpandedTaskSubtasks] = useState({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});

  // Helper to sanitize task object for Supabase schema
  const sanitizeTaskForCloud = (t, userId) => ({
    id: t.id,
    title: t.title || '',
    description: t.description || '',
    section: t.section || 'todo',
    priority: t.priority || 'P2',
    due_date: t.due_date || null,
    due_time: t.due_time || '',
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
    created_at: t.created_at || new Date().toISOString(),
    user_id: userId
  });

  // --- MEETING SCRATCHPAD HANDLERS ---
  const handleSaveMeetingNote = async (updatedNote) => {
    setMeetingNotes(prev => {
      const exists = prev.some(n => n.id === updatedNote.id);
      if (exists) {
        return prev.map(n => n.id === updatedNote.id ? updatedNote : n);
      }
      return [updatedNote, ...prev];
    });

    if (session?.user?.id) {
      try {
        await supabase.from('tasks').upsert({
          id: updatedNote.id,
          title: updatedNote.title || 'Untitled Meeting Note',
          description: updatedNote.content || '',
          section: 'meeting_notes',
          priority: 'P2',
          due_date: new Date().toISOString().split('T')[0],
          due_time: '',
          subtasks: [],
          created_at: updatedNote.updated_at || new Date().toISOString(),
          user_id: session.user.id
        });
      } catch (err) {
        console.warn("Supabase meeting note sync error:", err);
      }
    }
  };

  const handleDeleteMeetingNote = async (noteId) => {
    setMeetingNotes(prev => prev.filter(n => n.id !== noteId));
    showToast('Note deleted');
    if (session?.user?.id) {
      try {
        await supabase.from('tasks').delete().eq('id', noteId).eq('user_id', session.user.id);
      } catch (err) {
        console.warn("Supabase note delete error:", err);
      }
    }
  };

  const handleCreateMeetingNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'New Meeting Note',
      content: '### Agenda\n• \n\n### Action Items\n- [ ] ',
      updated_at: new Date().toISOString()
    };
    setMeetingNotes(prev => [newNote, ...prev]);
    handleSaveMeetingNote(newNote);
    showToast('New note created');
  };

  // --- LANDING PAGE & TASK MODALS STATE ---
  const [showLandingPage, setShowLandingPage] = useState(() => {
    if ((localStorage.getItem('takt_guest_mode') || localStorage.getItem('auratask_guest_mode')) === 'true') return false;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const val = localStorage.getItem(key);
          if (val && JSON.parse(val)?.user) return false;
        }
      }
    } catch {}
    return true;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [modalDefaultSection, setModalDefaultSection] = useState('todo');
  const [collapsedSections, setCollapsedSections] = useState({});

  // Close header "..." menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setIsHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // --- STRICT MULTI-TENANT ISOLATED LOCAL STORAGE SYNC & BACKUPS ---
  useEffect(() => {
    const uId = session?.user?.id;
    const taskKey = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
    const legacyKey = uId ? `auratask_tasks_u_${uId}` : 'auratask_guest_tasks';
    try {
      const dataStr = JSON.stringify(tasks);
      localStorage.setItem(taskKey, dataStr);
      localStorage.setItem(legacyKey, dataStr);
      
      // Scoped Day-wise snapshot rolling backup
      const todayStr = new Date().toISOString().split('T')[0];
      const backupKey = uId ? `takt_backup_${uId}_${todayStr}` : `takt_guest_backup_${todayStr}`;
      localStorage.setItem(backupKey, JSON.stringify({
        date: todayStr,
        userId: uId || 'guest_sandbox',
        saved_at: new Date().toISOString(),
        tasks_count: tasks.length,
        tasks
      }));

      // Scoped backup manifest
      const manifestKey = uId ? `takt_backup_manifest_${uId}` : 'takt_guest_backup_manifest';
      const manifestStr = localStorage.getItem(manifestKey) || '[]';
      const manifest = JSON.parse(manifestStr);
      if (!manifest.includes(todayStr)) {
        manifest.unshift(todayStr);
        localStorage.setItem(manifestKey, JSON.stringify(manifest.slice(0, 30)));
      }
    } catch (e) {
      console.warn("Storage snapshot notice:", e);
    }
  }, [tasks, session?.user?.id]);

  // Sync Meeting Notes scoped to user
  useEffect(() => {
    const uId = session?.user?.id;
    const noteKey = uId ? `takt_notes_u_${uId}` : 'takt_guest_notes';
    const legacyKey = uId ? `auratask_notes_u_${uId}` : 'auratask_guest_notes';
    try {
      const dataStr = JSON.stringify(meetingNotes);
      localStorage.setItem(noteKey, dataStr);
      localStorage.setItem(legacyKey, dataStr);
    } catch (e) {
      console.warn("Meeting notes storage sync notice:", e);
    }
  }, [meetingNotes, session?.user?.id]);

  // Sync Sections scoped to user
  useEffect(() => {
    const uId = session?.user?.id;
    const secKey = uId ? `takt_sections_u_${uId}` : 'takt_guest_sections';
    try {
      const dataStr = JSON.stringify(customSections);
      localStorage.setItem(secKey, dataStr);
      localStorage.setItem(uId ? `auratask_sections_u_${uId}` : 'auratask_guest_sections', dataStr);
    } catch {}
  }, [customSections, session?.user?.id]);

  // Sync Activity Logs scoped to user
  useEffect(() => {
    const uId = session?.user?.id;
    const actKey = uId ? `takt_activity_u_${uId}` : 'takt_guest_activity';
    try {
      const dataStr = JSON.stringify(activityLogs);
      localStorage.setItem(actKey, dataStr);
      localStorage.setItem(uId ? `auratask_activity_u_${uId}` : 'auratask_guest_activity', dataStr);
    } catch {}
  }, [activityLogs, session?.user?.id]);

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
      recordActivity(`Updated task "${taskPayload.title.slice(0, 28)}..."`, 'edit');
    } else {
      updatedTasks = [taskPayload, ...tasks];
      showToast('Task created');
      recordActivity(`Created task "${taskPayload.title.slice(0, 28)}..."`, 'plus');
    }
    setTasks(updatedTasks);

    if (session?.user) {
      try {
        await supabase.from('tasks').upsert(sanitizeTaskForCloud(taskPayload, session.user.id));
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
      localStorage.setItem('takt_theme', 'dark');
      localStorage.setItem('auratask_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('takt_theme', 'light');
      localStorage.setItem('auratask_theme', 'light');
    }
  }, [darkMode]);

  // Switch workspace to authenticated user
  const handleUserSessionEstablished = (userSession) => {
    setSession(userSession);
    setIsGuest(false);
    setShowLandingPage(false);
    setShowAuthModal(false);
    localStorage.removeItem('takt_guest_mode');
    localStorage.removeItem('auratask_guest_mode');
    if (userSession?.user?.id) {
      const uId = userSession.user.id;
      const userCached = loadScopedWorkspaceData(uId);
      setTasks(userCached.tasks);
      setMeetingNotes(userCached.notes);
      setCustomSections(userCached.sections);
      setActivityLogs(userCached.activity);
    }
  };

  // Reset workspace completely on sign out
  const handleUserSignedOut = () => {
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('takt_guest_mode');
    localStorage.removeItem('auratask_guest_mode');
    const guestData = loadScopedWorkspaceData(null);
    setTasks(guestData.tasks);
    setMeetingNotes(guestData.notes);
    setCustomSections(guestData.sections);
    setActivityLogs(guestData.activity);
  };

  // Initial Session Check & Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleUserSessionEstablished(session);
      }
    }).catch(err => {
      console.warn("Supabase auth session check notice:", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (s) {
        handleUserSessionEstablished(s);
      } else if (event === 'SIGNED_OUT') {
        handleUserSignedOut();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Fetch Tasks from Supabase strictly scoped to user_id (Zero Cross-User Bleed)
  useEffect(() => {
    if (!session?.user?.id) return;
    const currentUserId = session.user.id;

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const regularTasks = data.filter(item => item.section !== 'meeting_notes');
          const cloudNotes = data.filter(item => item.section === 'meeting_notes');

          if (regularTasks.length > 0) {
            const normalized = regularTasks.map(item => ({
              ...item,
              section: item.section || 'todo',
              priority: item.priority || 'P2',
              tags: item.tags || ['#Work'],
              subtasks: Array.isArray(item.subtasks) ? item.subtasks : []
            }));
            setTasks(normalized);
          }

          if (cloudNotes.length > 0) {
            setMeetingNotes(cloudNotes.map(item => ({
              id: item.id,
              title: item.title,
              content: item.description,
              updated_at: item.created_at
            })));
          }
        }
      } catch (err) {
        console.warn('Supabase fetch notice (using scoped local cache):', err);
      }
    };

    fetchTasks();
  }, [session?.user?.id]);

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
        recordActivity(`Completed 25m Focus Flow for "${activeTimerTask.title.slice(0, 24)}"`, 'flame');
      }
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch {}
      showToast('🎉 Focus session complete! Take a well-deserved 5-minute break.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, activeTimerTask]);

  // Celebration Effect
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

  // Bulleproof Task CRUD Operations
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

    setTasks(prev => [taskObj, ...prev]);
    recordActivity(`Added task "${taskObj.title.slice(0, 28)}"`, 'plus');
    setNewTitle('');
    setNewDesc('');
    setNewDueTime('');
    setShowAddComposer(false);
    showToast('Task created successfully!');

    if (session?.user) {
      try {
        await supabase
          .from('tasks')
          .insert([sanitizeTaskForCloud(taskObj, session.user.id)]);
      } catch (err) {
        console.warn("Background cloud sync note:", err);
      }
    }
  };

  const handleUpdateTask = async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    if (session?.user?.id) {
      try {
        const allowedKeys = ['title', 'description', 'section', 'priority', 'due_date', 'due_time', 'subtasks'];
        const cloudUpdates = {};
        for (const k of allowedKeys) {
          if (updates[k] !== undefined) cloudUpdates[k] = updates[k];
        }
        if (Object.keys(cloudUpdates).length > 0) {
          await supabase
            .from('tasks')
            .update(cloudUpdates)
            .eq('id', id)
            .eq('user_id', session.user.id);
        }
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
      recordActivity(`Deleted task "${taskToDelete.title.slice(0, 24)}"`, 'trash');
    }
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task removed');

    if (session?.user?.id) {
      try {
        await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id);
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
      recordActivity(`Marked "${task.title.slice(0, 28)}" completed`, 'check');
      showToast('Task completed! Keep the momentum going 🔥');
    }
  };

  // Postpone / Reschedule Task to Tomorrow with 1 click
  const handlePostponeToTomorrow = (taskId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    handleUpdateTask(taskId, { due_date: tomorrowStr });
    recordActivity(`Rescheduled task to Tomorrow (${tomorrowStr})`, 'calendar');
    showToast('Task moved to Tomorrow ⏩');
  };

  const moveTaskSection = (taskId, direction) => {
    const sectionKeys = customSections.map(s => s.key);
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    let currentIndex = sectionKeys.indexOf(currentTask.section);
    if (currentIndex === -1) currentIndex = 0;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < sectionKeys.length) {
      const nextSection = sectionKeys[targetIndex];
      handleUpdateTask(taskId, { section: nextSection });
      if (nextSection === 'completed') triggerCelebration();
    }
  };

  // Drag and Drop Handler
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
        const secObj = customSections.find(s => s.key === targetKey);
        showToast(`Moved to ${secObj ? secObj.label : targetKey}`);
      }
    } else {
      if (task.priority === targetKey) return;
      handleUpdateTask(taskId, { priority: targetKey });
      showToast(`Priority updated to ${targetKey}`);
    }
  };

  // List View Task-to-Task Reorder Handler
  const handleReorderTaskInList = (draggedId, targetId, targetSectionKey) => {
    if (!draggedId || draggedId === targetId) return;

    setTasks(prevTasks => {
      const draggedIndex = prevTasks.findIndex(t => t.id === draggedId);
      const targetIndex = prevTasks.findIndex(t => t.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prevTasks;

      const draggedTask = { ...prevTasks[draggedIndex] };
      let sectionUpdated = false;

      if (boardGrouping === 'stage') {
        if (draggedTask.section !== targetSectionKey) {
          draggedTask.section = targetSectionKey;
          sectionUpdated = true;
          if (targetSectionKey === 'completed') triggerCelebration();
        }
      } else {
        if (draggedTask.priority !== targetSectionKey) {
          draggedTask.priority = targetSectionKey;
          sectionUpdated = true;
        }
      }

      const nextTasks = [...prevTasks];
      nextTasks.splice(draggedIndex, 1);
      const newTargetIndex = nextTasks.findIndex(t => t.id === targetId);
      nextTasks.splice(newTargetIndex, 0, draggedTask);

      if (sectionUpdated && session?.user?.id) {
        supabase
          .from('tasks')
          .update(boardGrouping === 'stage' ? { section: targetSectionKey } : { priority: targetSectionKey })
          .eq('id', draggedId)
          .eq('user_id', session.user.id)
          .then();
      }

      return nextTasks;
    });

    recordActivity(`Reordered task in list view`, 'edit');
    showToast('Task position updated');
  };

  // Subtasks Checklist Handlers
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

  // --- SCREENSHOT 1 MENU ACTIONS ---
  // 1. Copy link to Inbox
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard (Ctrl+C)');
    } catch {
      showToast('Link: ' + window.location.href);
    }
    setIsHeaderMenuOpen(false);
  };

  // 2. Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Title', 'Description', 'Section', 'Priority', 'Due Date', 'Due Time', 'Tags', 'Created At'];
      const rows = tasks.map(t => [
        t.id,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.section,
        t.priority,
        t.due_date || '',
        t.due_time || '',
        `"${(t.tags || []).join(';')}"`,
        t.created_at || ''
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `takt_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Tasks exported to CSV successfully!');
      recordActivity('Exported tasks to CSV', 'download');
    } catch (e) {
      showToast('Failed to export CSV: ' + e.message);
    }
    setIsHeaderMenuOpen(false);
  };

  // 3. Import from CSV
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          showToast('CSV is empty or invalid');
          return;
        }

        // skip header
        const newTasks = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2 && cols[1]) {
            newTasks.push({
              id: `csv-${Date.now()}-${i}`,
              title: cols[1],
              description: cols[2] || '',
              section: cols[3] || 'todo',
              priority: cols[4] || 'P2',
              due_date: cols[5] || new Date().toISOString().split('T')[0],
              due_time: cols[6] || '',
              tags: cols[7] ? cols[7].split(';') : ['#Imported'],
              is_focus: false,
              focused_minutes: 0,
              subtasks: [],
              created_at: new Date().toISOString()
            });
          }
        }

        if (newTasks.length > 0) {
          setTasks(prev => [...newTasks, ...prev]);
          showToast(`Successfully imported ${newTasks.length} tasks from CSV!`);
          recordActivity(`Imported ${newTasks.length} tasks from CSV`, 'upload');
        } else {
          showToast('Could not parse valid tasks from CSV.');
        }
      } catch (err) {
        showToast('CSV Import Error: ' + err.message);
      }
    };
    reader.readAsText(file);
    setIsHeaderMenuOpen(false);
  };

  // 4. Add Dynamic Section
  const handleAddSectionSubmit = (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    const key = `sec_${Date.now()}`;
    const newSec = {
      key,
      label: newSectionTitle.trim(),
      icon: Layers
    };

    setCustomSections(prev => [...prev, newSec]);
    setNewSectionTitle('');
    setShowAddSectionModal(false);
    showToast(`Section "${newSec.label}" created!`);
    recordActivity(`Created section "${newSec.label}"`, 'plus');
  };

  // Auth Handlers
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
      if (rememberMe) {
        localStorage.setItem('takt_remember_me', 'true');
        localStorage.setItem('takt_remembered_email', authEmail.trim());
        localStorage.setItem('auratask_remember_me', 'true');
        localStorage.setItem('auratask_remembered_email', authEmail.trim());
      } else {
        localStorage.setItem('takt_remember_me', 'false');
        localStorage.removeItem('takt_remembered_email');
        localStorage.setItem('auratask_remember_me', 'false');
        localStorage.removeItem('auratask_remembered_email');
      }

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
          handleUserSessionEstablished(data.session);
          setShowLandingPage(false);
          setShowAuthModal(false);
          showToast(`Welcome to Takt, ${authFullName || 'friend'}!`);
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
          handleUserSessionEstablished(data.session);
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
    setSession(null);
    localStorage.setItem('takt_guest_mode', 'true');
    localStorage.setItem('auratask_guest_mode', 'true');
    // Strict isolation: Load fresh guest sandbox state so no user notes or tasks are ever visible
    const guestData = loadScopedWorkspaceData(null);
    setTasks(guestData.tasks);
    setMeetingNotes(guestData.notes);
    setCustomSections(guestData.sections);
    setActivityLogs(guestData.activity);
    setShowLandingPage(false);
    setShowAuthModal(false);
    showToast('Entered Guest Sandbox. All features active!');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    handleUserSignedOut();
    setShowLandingPage(true);
    showToast('Signed out successfully.');
  };

  // Filtered Tasks Engine
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

  // Rolling 7-day calendar horizon dates
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        dateStr,
        weekday,
        dayMonth,
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    return days;
  }, []);

  // =========================================================================
  // 1. FULLSCREEN LANDING PAGE & PRODUCT SHOWCASE (IF LOGGED OUT)
  // =========================================================================
  if ((!session && !isGuest) || showLandingPage) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-[#000000] text-[#ededed]' : 'bg-[#fffdfa] text-slate-900'}`}>
        <LandingPage
          onStartForFree={() => { setAuthMode('register'); setShowAuthModal(true); }}
          onTryDemo={handleGuestLogin}
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onOpenApp={() => setShowLandingPage(false)}
          hasActiveSession={Boolean(session || isGuest)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* AUTH MODAL DIALOG OVERLAY */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-neutral-900/80 backdrop-blur-md transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-[#222225] rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-[#ededed] shadow-xs' : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed]'}`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-[#ededed] shadow-xs' : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed]'}`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-[#222225] bg-white dark:bg-[#09090b] hover:bg-slate-50 dark:hover:bg-[#1c1c20] text-slate-800 dark:text-[#ededed] font-semibold text-sm flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99]"
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
                  <div className="border-t border-slate-200 dark:border-[#222225] w-full"></div>
                  <span className="bg-white dark:bg-[#121214] px-3 text-[11px] font-medium text-slate-400 dark:text-[#a1a1aa] absolute">
                    or continue with email
                  </span>
                </div>

                {/* Notifications */}
                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-[#2a1215] border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{authError}</span>
                  </div>
                )}
                {authSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-[#0d261a] border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{authSuccessMsg}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#a1a1aa] mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-[#52525b]" />
                        <input
                          type="text"
                          required
                          placeholder="Alex Rivera"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-[#ededed] placeholder:text-slate-400 dark:placeholder:text-[#52525b]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#a1a1aa] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-[#52525b]" />
                      <input
                        type="email"
                        required
                        placeholder="alex@acme.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-[#ededed] placeholder:text-slate-400 dark:placeholder:text-[#52525b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#a1a1aa] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-[#52525b]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-[#ededed] placeholder:text-slate-400 dark:placeholder:text-[#52525b]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 dark:text-[#a1a1aa] hover:text-slate-600 dark:hover:text-[#ededed]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* REMEMBER ME CHECKBOX */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-[#38383e] text-red-600 focus:ring-red-500/30 accent-red-600 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#ededed] transition-colors">
                        Remember me
                      </span>
                    </label>
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

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#222225] text-center">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explore as Guest (No Sign Up Needed)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN APPLICATION WORKSPACE (TAKT MIDNIGHT NAVY / SLATE PALETTE)
  // =========================================================================
  return (
    <div className={`h-screen w-full flex overflow-hidden selection:bg-red-500 selection:text-white ${darkMode ? 'dark bg-[#080c14] text-[#f1f5f9]' : 'bg-slate-50 text-slate-800'}`}>

      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={csvFileInputRef}
        onChange={handleCSVFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* TOAST NOTIFICATION */}
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      {/* --- SIDEBAR NAVIGATION (PERMANENTLY PINNED, NEVER MOVES WITH SCROLL) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-white dark:bg-[#0e1422] border-r border-slate-200/80 dark:border-[#22304e] flex flex-col p-4 transition-transform duration-300 lg:static lg:translate-x-0 shrink-0 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand & User Profile */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-[#22304e]">
          <Logo
            subtitle={
              isGuest
                ? 'Guest Sandbox'
                : (session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Personal Workspace')
            }
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('inbox');
            }}
          />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#a1a1aa] dark:hover:text-[#ededed] rounded-lg hover:bg-slate-100 dark:hover:bg-[#121214]"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-[#2a1215]"
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

        {/* Primary Views Navigation */}
        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('inbox'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'inbox' && !selectedTag ? 'bg-red-50 dark:bg-[#2a1215] text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]'}`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-blue-500" />
              <span>Inbox</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#a1a1aa]">
              {tasks.filter(t => t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('today'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'today' && !selectedTag ? 'bg-red-50 dark:bg-[#2a1215] text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]'}`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Today</span>
            </div>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-[#2a1215] dark:text-red-400 border border-transparent dark:border-red-500/30 font-mono">
              {todayDueCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('upcoming'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'upcoming' && !selectedTag ? 'bg-red-50 dark:bg-[#2a1215] text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]'}`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Upcoming</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#a1a1aa]">
              {tasks.filter(t => t.due_date > todayDateStr && t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('completed'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'completed' && !selectedTag ? 'bg-red-50 dark:bg-[#2a1215] text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]'}`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Completed</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#a1a1aa]">
              {completedCount}
            </span>
          </button>
        </nav>

        {/* Productivity & Tools Section */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#222225] space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-[#52525b]">
            Productivity & Tools
          </div>

          <button
            onClick={() => setShowKarmaModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Karma & Streaks</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-[#281a0b] text-amber-700 dark:text-amber-400 border border-transparent dark:border-amber-500/30">
              4 Days 🔥
            </span>
          </button>

          <button
            onClick={() => setShowActivityModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Activity History</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{activityLogs.length}</span>
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Meeting Scratchpad</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-transparent dark:border-indigo-500/20 font-mono">
              {meetingNotes.length}
            </span>
          </button>

          <button
            onClick={() => setShowShutdownModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-[#0d261a]/70 hover:bg-emerald-100/70 dark:hover:bg-[#0d261a] border border-emerald-200/50 dark:border-emerald-600/30"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" />
              <span>Daily Shutdown Ritual</span>
            </div>
          </button>

          <button
            onClick={() => setShowLandingPage(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed]"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Landing Page / Tour</span>
            </div>
            <span className="text-[10px] text-slate-400">View</span>
          </button>
        </div>

        {/* Tags & Projects Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#222225]">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-[#52525b] flex items-center justify-between">
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
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTag === tag ? 'bg-red-50 dark:bg-[#2a1215] text-red-600 dark:text-red-400 font-bold border border-red-200/40 dark:border-red-500/30' : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#121214]'}`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 opacity-60" />
                  <span>{tag}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-[#52525b]">
                  {tasks.filter(t => t.tags && t.tags.includes(tag)).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Flow Session Mini Player */}
        {activeTimerTask && (
          <div className="mt-auto pt-3">
            <div className="p-3 bg-red-50 dark:bg-[#121214] border border-red-200 dark:border-[#222225] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Flow Session</span>
                <button onClick={() => setActiveTimerTask(null)}><X className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-[#ededed] truncate mb-2">{activeTimerTask.title}</p>
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
                    className="p-1.5 bg-slate-200 dark:bg-[#1c1c20] border border-transparent dark:border-[#222225] text-slate-700 dark:text-[#a1a1aa] rounded-lg"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync & Backup Status Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center justify-between text-[11px] text-slate-400 dark:text-[#52525b]">
          <span className="flex items-center gap-1.5" title="Continuously backed up day-wise in local storage & cloud">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{session ? 'Cloud Sync & Backup Active' : 'Daily Local Backup Active'}</span>
          </span>
          <span className="font-mono">v2.4</span>
        </div>
      </aside>

      {/* --- MAIN CONTENT CANVAS (FIXED HEADER, SCROLLABLE TASK VIEW) --- */}
      <main className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER: PERMANENTLY FIXED AT TOP, NEVER MOVES WITH SCROLL */}
        <header className="h-16 border-b border-slate-200/80 dark:border-[#222225] bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-[#a1a1aa] dark:hover:text-[#ededed] lg:hidden rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold capitalize text-slate-900 dark:text-[#ededed] flex items-center gap-2">
                <span>{selectedTag ? `Tag: ${selectedTag}` : activeTab}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#121214] border border-slate-200 dark:border-[#222225] text-slate-500 dark:text-[#a1a1aa]">
                  {filteredTasks.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search */}
            <div className="relative hidden sm:block w-48 md:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#52525b]" />
              <input
                type="text"
                placeholder="Search tasks or #tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-[#121214] text-xs pl-9 pr-3 py-2 rounded-xl border border-transparent dark:border-[#222225] focus:border-red-500 focus:bg-white dark:focus:bg-[#1c1c20] focus:outline-none text-slate-900 dark:text-[#ededed] transition-all placeholder:text-slate-400 dark:placeholder:text-[#52525b]"
              />
            </div>

            {/* View Mode Switcher: Board, List, Calendar */}
            <div className="flex items-center bg-slate-100 dark:bg-[#121214] p-0.5 rounded-xl border border-slate-200 dark:border-[#222225]">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-[#ededed] shadow-2xs' : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed]'}`}
                title="List View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'board' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-[#ededed] shadow-2xs' : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed]'}`}
                title="Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-[#ededed] shadow-2xs' : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed]'}`}
                title="Day-wise Calendar Horizon"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>

            {/* Display / Group By Switcher */}
            <button
              onClick={() => setBoardGrouping(boardGrouping === 'stage' ? 'priority' : 'stage')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#121214] border border-slate-200 dark:border-[#222225] text-slate-700 dark:text-[#ededed] hover:bg-slate-200/70 dark:hover:bg-[#1c1c20] transition-colors"
              title="Toggle Grouping"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Display</span>
            </button>

            {/* SCREENSHOT 1: HEADER "..." MORE ACTIONS DROPDOWN */}
            <div className="relative" ref={headerMenuRef}>
              <button
                onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                className={`p-2 rounded-xl border transition-all ${isHeaderMenuOpen ? 'bg-slate-200 dark:bg-[#1c1c20] border-slate-300 dark:border-[#222225] text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-[#121214] border-slate-200 dark:border-[#222225] text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-white'}`}
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Exact Screenshot 1 Dropdown Menu */}
              {isHeaderMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {/* + Add section */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowAddSectionModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                    <span>Add section</span>
                  </button>

                  {/* Copy link to Inbox */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center justify-between font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                      <span>Copy link to {activeTab === 'inbox' ? 'Inbox' : activeTab}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#52525b]">Ctrl C</span>
                  </button>

                  {/* View activity */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowActivityModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                    <span>View activity</span>
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-[#222225]"></div>

                  {/* Import from CSV */}
                  <button
                    onClick={() => csvFileInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Upload className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                    <span>Import from CSV</span>
                  </button>

                  {/* Export to CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                    <span>Export to CSV</span>
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-[#222225]"></div>

                  {/* Email tasks to Inbox */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowEmailInboxModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                    <span>Email tasks to Inbox</span>
                  </button>

                  {/* Inbox calendar feed */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowCalendarFeedModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
                    <span>Inbox calendar feed</span>
                  </button>
                </div>
              )}
            </div>

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

        {/* WORKSPACE SCROLL AREA (ONLY TASKS SCROLL, NAV BARS REMAIN PINNED) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">

          {/* TODAY'S BIG 3 SPOTLIGHT STRIP */}
          {big3Tasks.length > 0 && activeTab === 'today' && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#281a0b]/40 dark:to-[#121214]/60 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 shadow-2xs">
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
                    className="bg-white dark:bg-[#121214] border border-amber-200/70 dark:border-[#222225] p-3 rounded-xl shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-[#ededed] truncate">{task.title}</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{task.priority} Priority</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handlePostponeToTomorrow(task.id, e)}
                        className="p-1 rounded text-slate-400 dark:text-[#a1a1aa] hover:text-amber-500"
                        title="Postpone to Tomorrow"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleTaskCompleted(task)}
                        className="p-1 rounded-lg text-slate-300 dark:text-[#52525b] hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-[#0d261a]"
                      >
                        <Circle className="w-4 h-4 hover:fill-emerald-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INLINE EXPANDABLE ADD COMPOSER */}
          {showAddComposer && (
            <div className="mb-6 bg-white dark:bg-[#121214] border border-red-300 dark:border-[#222225] rounded-2xl p-4 shadow-lg shadow-red-500/5 transition-all">
              <form onSubmit={handleCreateTask}>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Task name, e.g. 'Deploy Redis caching cluster'..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-[#ededed] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none mb-2"
                />
                <textarea
                  rows={2}
                  placeholder="Description, markdown notes, or checklist specs..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-600 dark:text-[#a1a1aa] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none resize-none mb-3"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-[#222225]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Due Date */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#09090b] border border-transparent dark:border-[#222225] px-2 py-1 rounded-lg text-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-[#ededed]"
                      />
                    </div>

                    {/* Priority */}
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="bg-slate-100 dark:bg-[#09090b] border border-transparent dark:border-[#222225] text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-[#ededed]"
                    >
                      <option value="P1">🚩 P1 (Urgent)</option>
                      <option value="P2">🔶 P2 (High)</option>
                      <option value="P3">🔷 P3 (Medium)</option>
                      <option value="P4">⚪ P4 (Low)</option>
                    </select>

                    {/* Section Selector */}
                    <select
                      value={composerSection}
                      onChange={(e) => setComposerSection(e.target.value)}
                      className="bg-slate-100 dark:bg-[#09090b] border border-transparent dark:border-[#222225] text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-[#ededed]"
                    >
                      {customSections.map(sec => (
                        <option key={sec.key} value={sec.key}>{sec.label}</option>
                      ))}
                    </select>

                    {/* Tag Selector */}
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-slate-100 dark:bg-[#09090b] border border-transparent dark:border-[#222225] text-xs font-bold px-2 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-[#ededed]"
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#1c1c20] dark:hover:text-[#ededed]"
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

          {/* =========================================================================
              VIEW 1: STRUCTURED COLLAPSIBLE LIST VIEW (SCREENSHOT 1 & 4)
             ========================================================================= */}
          {viewMode === 'list' && (
            <div className="max-w-4xl space-y-6">
              {(boardGrouping === 'stage' ? customSections : [
                { key: 'P1', label: 'P1 (Urgent)', icon: Flag },
                { key: 'P2', label: 'P2 (High)', icon: Flag },
                { key: 'P3', label: 'P3 (Medium)', icon: Flag },
                { key: 'P4', label: 'P4 (Low)', icon: Flag }
              ]).map(sec => {
                const secTasks = filteredTasks.filter(t =>
                  boardGrouping === 'stage' ? t.section === sec.key : t.priority === sec.key
                );
                const isCollapsed = Boolean(collapsedSections[sec.key]);
                const isSectionOver = dragOverColumn === sec.key;

                return (
                  <div
                    key={sec.key}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverColumn !== sec.key) setDragOverColumn(sec.key);
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget)) return;
                      if (dragOverColumn === sec.key) setDragOverColumn(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                      if (taskId) handleDropTask(taskId, sec.key);
                      setDragOverColumn(null);
                      setDraggingTaskId(null);
                      setDragOverTaskId(null);
                    }}
                    className={`space-y-1.5 rounded-2xl p-2 transition-all ${
                      isSectionOver && draggingTaskId
                        ? 'bg-red-50/50 dark:bg-[#151214] ring-2 ring-red-500/60 dark:ring-red-500/50'
                        : ''
                    }`}
                  >
                    {/* Section Header (Screenshot 1 & 4 exact layout) */}
                    <div className="flex items-center justify-between py-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse(sec.key)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-[#ededed] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                        <span className="capitalize">{sec.label}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">{secTasks.length}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTaskModal(null, sec.key)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:text-[#a1a1aa] dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#121214]"
                          title="Add task in section"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Tasks List */}
                    {!isCollapsed && (
                      <div className="space-y-1 pl-1">
                        {isSectionOver && draggingTaskId && (
                          <div className="border-2 border-dashed border-red-400 dark:border-red-500/80 rounded-xl p-2.5 text-center text-xs font-bold text-red-500 dark:text-red-400 bg-red-50/60 dark:bg-[#2a1215]/40 animate-pulse flex items-center justify-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Drop task into {sec.label}</span>
                          </div>
                        )}

                        {secTasks.map(task => {
                          const isTaskCompleted = task.section === 'completed';
                          const isBeingDragged = draggingTaskId === task.id;
                          const isTargetOver = dragOverTaskId === task.id && !isBeingDragged;

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
                                setDragOverTaskId(null);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverTaskId !== task.id) {
                                  setDragOverTaskId(task.id);
                                }
                              }}
                              onDragLeave={(e) => {
                                e.stopPropagation();
                                if (e.currentTarget.contains(e.relatedTarget)) return;
                                if (dragOverTaskId === task.id) setDragOverTaskId(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const draggedId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                                if (draggedId && draggedId !== task.id) {
                                  handleReorderTaskInList(draggedId, task.id, sec.key);
                                }
                                setDragOverColumn(null);
                                setDraggingTaskId(null);
                                setDragOverTaskId(null);
                              }}
                              onClick={() => handleOpenTaskModal(task)}
                              className={`group bg-white dark:bg-[#121214] border rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer select-none ${
                                isBeingDragged
                                  ? 'opacity-30 border-dashed border-red-500 scale-[0.98]'
                                  : isTargetOver
                                    ? 'ring-2 ring-red-500 border-red-400 dark:border-red-500 bg-red-50/40 dark:bg-[#1c1c20]'
                                    : 'border-slate-200/90 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#38383e] dark:hover:bg-[#1c1c20]'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className="text-slate-300 dark:text-[#52525b] group-hover:text-slate-500 dark:group-hover:text-[#a1a1aa] shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] transition-colors"
                                  title="Drag to reorder or move section"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskCompleted(task);
                                  }}
                                  className="text-slate-300 dark:text-[#52525b] hover:text-emerald-500 transition-colors shrink-0"
                                >
                                  {isTaskCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-[#0d261a]" />
                                  ) : (
                                    <Circle className="w-4 h-4 hover:stroke-emerald-500" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <span className={`text-xs font-semibold ${isTaskCompleted ? 'line-through text-slate-400 dark:text-[#52525b]' : 'text-slate-900 dark:text-[#ededed]'}`}>
                                    {task.title}
                                  </span>
                                  {task.description && (
                                    <p className="text-[11px] text-slate-400 dark:text-[#a1a1aa] truncate mt-0.5">{task.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {/* Priority Flag Pill */}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  task.priority === 'P1'
                                    ? 'bg-red-500/10 dark:bg-[#2a1215] text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
                                    : task.priority === 'P2'
                                      ? 'bg-amber-500/10 dark:bg-[#281a0b] text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
                                      : 'bg-slate-500/10 dark:bg-[#121214] text-slate-500 dark:text-[#a1a1aa] border border-slate-500/20 dark:border-[#222225]'
                                }`}>
                                  {task.priority}
                                </span>

                                {task.due_date && (
                                  <span className="text-[10px] text-slate-400 dark:text-[#a1a1aa] hidden sm:inline">
                                    {task.due_date === todayDateStr ? 'Today' : task.due_date}
                                  </span>
                                )}

                                {/* Quick "Postpone to Tomorrow" 1-click button */}
                                <button
                                  onClick={(e) => handlePostponeToTomorrow(task.id, e)}
                                  className="text-[10px] font-semibold text-slate-400 dark:text-[#a1a1aa] hover:text-amber-500 dark:hover:text-amber-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] transition-colors hidden md:inline-flex items-center gap-1"
                                  title="Postpone to Tomorrow"
                                >
                                  <span>⏩ Tomorrow</span>
                                </button>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => { setActiveTimerTask(task); setTimerSeconds(25 * 60); setIsTimerRunning(true); }}
                                    className="p-1 text-slate-400 dark:text-[#a1a1aa] hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20]"
                                    title="Start Focus Timer"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1 text-slate-400 dark:text-[#a1a1aa] hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20]"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Inline + Add task Button (Screenshot 1 & 4 style) */}
                        <button
                          type="button"
                          onClick={() => handleOpenTaskModal(null, sec.key)}
                          className="w-full text-left py-2 px-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-2 rounded-xl hover:bg-red-50/50 dark:hover:bg-[#2a1215]/50 transition-colors"
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
                <div className="text-center py-16 bg-white dark:bg-[#09090b] border border-dashed border-slate-200 dark:border-[#222225] rounded-2xl">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-[#ededed]">No tasks in view</h3>
                  <p className="text-xs text-slate-400 dark:text-[#a1a1aa] mt-1">Add a new task or adjust your search filters.</p>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 2: KANBAN SWIMLANES BOARD VIEW
             ========================================================================= */}
          {viewMode === 'board' && (
            <div className="flex gap-5 pb-6 overflow-x-auto min-h-[550px] items-start">
              {(boardGrouping === 'stage' ? customSections : [
                { key: 'P1', label: 'P1 (Urgent)', icon: Flag },
                { key: 'P2', label: 'P2 (High)', icon: Flag },
                { key: 'P3', label: 'P3 (Medium)', icon: Flag },
                { key: 'P4', label: 'P4 (Low)', icon: Flag }
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
                    className={`w-80 shrink-0 flex flex-col bg-slate-100/80 dark:bg-[#09090b]/80 border rounded-2xl p-3 max-h-full transition-all duration-200 ${
                      isOver
                        ? 'ring-2 ring-red-500/70 border-red-400 dark:border-red-600/70 bg-red-50/40 dark:bg-[#121214] shadow-md'
                        : 'border-slate-200/80 dark:border-[#222225]'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-[#ededed]">
                          {column.label}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] text-slate-600 dark:text-[#a1a1aa]">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddComposer(true);
                          if (boardGrouping === 'stage') setComposerSection(column.key);
                          else setNewPriority(column.key);
                        }}
                        className="p-1 hover:bg-white dark:hover:bg-[#121214] rounded-lg text-slate-400 dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400"
                        title={`Add task to ${column.label}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Column Task Cards */}
                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px]">
                      {isOver && draggingTaskId && (
                        <div className="border-2 border-dashed border-red-400 dark:border-red-500/80 rounded-xl p-3.5 text-center text-xs font-bold text-red-500 dark:text-red-400 bg-red-50/60 dark:bg-[#2a1215]/40 animate-pulse flex items-center justify-center gap-2">
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
                            className={`group bg-white dark:bg-[#121214] border rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged
                                ? 'opacity-30 scale-95 border-dashed border-red-500 shadow-xl'
                                : isTaskCompleted
                                  ? 'border-slate-200/60 dark:border-[#222225]/70 opacity-80'
                                  : 'border-slate-200/90 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#38383e] dark:hover:bg-[#1c1c20]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="text-slate-300 dark:text-[#52525b] group-hover:text-slate-400 dark:group-hover:text-[#a1a1aa] shrink-0 mt-0.5 cursor-grab">
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>

                              <button
                                onClick={() => toggleTaskCompleted(task)}
                                className="mt-0.5 text-slate-300 dark:text-[#52525b] hover:text-emerald-500 transition-colors shrink-0"
                              >
                                {isTaskCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-[#0d261a]" />
                                ) : (
                                  <Circle className="w-4 h-4 hover:stroke-emerald-500" />
                                )}
                              </button>

                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleOpenTaskModal(task)}
                              >
                                <h4 className={`text-xs font-bold leading-snug break-words ${isTaskCompleted ? 'line-through text-slate-400 dark:text-[#52525b]' : 'text-slate-900 dark:text-[#ededed]'}`}>
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-[11px] text-slate-500 dark:text-[#a1a1aa] mt-1 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Metadata Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                    task.priority === 'P1'
                                      ? 'bg-red-500/10 dark:bg-[#2a1215] text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
                                      : task.priority === 'P2'
                                        ? 'bg-amber-500/10 dark:bg-[#281a0b] text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
                                        : 'bg-slate-500/10 dark:bg-[#121214] text-slate-500 dark:text-[#a1a1aa] border border-slate-500/20 dark:border-[#222225]'
                                  }`}>
                                    <Flag className="w-2.5 h-2.5" />
                                    <span>{task.priority}</span>
                                  </span>

                                  {task.due_date && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-100 dark:bg-[#1c1c20] text-slate-500 dark:text-[#a1a1aa]">
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>{task.due_date === todayDateStr ? 'Today' : task.due_date}</span>
                                    </span>
                                  )}

                                  {task.tags && task.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-semibold text-slate-500 dark:text-[#a1a1aa] bg-slate-100 dark:bg-[#1c1c20] px-1.5 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Card Footer: Quick Actions */}
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#222225] flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveTaskSection(task.id, 'prev')}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] text-slate-400 dark:text-[#52525b] hover:text-slate-700 dark:hover:text-[#ededed]"
                                  title="Previous section"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => moveTaskSection(task.id, 'next')}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] text-slate-400 dark:text-[#52525b] hover:text-slate-700 dark:hover:text-[#ededed]"
                                  title="Next section"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handlePostponeToTomorrow(task.id, e)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] text-slate-400 dark:text-[#a1a1aa] hover:text-amber-500"
                                  title="Postpone to Tomorrow (⏩)"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateTask(task.id, { is_focus: !task.is_focus })}
                                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] ${task.is_focus ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-[#52525b] hover:text-amber-400'}`}
                                  title="Pin to Big 3"
                                >
                                  <Star className={`w-3.5 h-3.5 ${task.is_focus ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => { setActiveTimerTask(task); setTimerSeconds(25 * 60); setIsTimerRunning(true); }}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] text-slate-300 dark:text-[#52525b] hover:text-red-500 dark:hover:text-red-400"
                                  title="Focus Flow Timer"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] text-slate-300 dark:text-[#52525b] hover:text-red-500 dark:hover:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {columnTasks.length === 0 && !isOver && (
                        <div className="border border-dashed border-slate-200 dark:border-[#222225] rounded-xl p-6 text-center text-xs text-slate-400 dark:text-[#52525b]">
                          <span>No tasks in {column.label}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenTaskModal(null, column.key)}
                        className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-1.5 hover:bg-slate-200/50 dark:hover:bg-[#121214] rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add task</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              VIEW 3: DAY-WISE CALENDAR HORIZON VIEW (7-DAY PLANNING & BACKUP HORIZON)
             ========================================================================= */}
          {viewMode === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#222225]">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#ededed] flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-red-500" />
                    <span>7-Day Day-Wise Horizon Planner</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-[#a1a1aa]">
                    Drag tasks across days or click ⏩ Tomorrow to reschedule instantly. All days are backed up automatically.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[500px]">
                {calendarDays.map(day => {
                  const dayTasks = tasks.filter(t => t.due_date === day.dateStr && t.section !== 'completed');

                  return (
                    <div
                      key={day.dateStr}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                        if (taskId) {
                          handleUpdateTask(taskId, { due_date: day.dateStr });
                          showToast(`Rescheduled to ${day.weekday} (${day.dayMonth})`);
                        }
                      }}
                      className={`flex flex-col rounded-2xl p-3 border transition-all ${
                        day.isToday
                          ? 'bg-red-50/30 dark:bg-[#121214] border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20'
                          : 'bg-white dark:bg-[#09090b] border-slate-200/80 dark:border-[#222225]'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="pb-3 border-b border-slate-100 dark:border-[#222225] flex items-center justify-between">
                        <div>
                          <span className={`text-xs font-black block ${day.isToday ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-[#ededed]'}`}>
                            {day.weekday}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-[#52525b] font-mono">
                            {day.dayMonth}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1c1c20] text-slate-600 dark:text-[#a1a1aa]">
                          {dayTasks.length}
                        </span>
                      </div>

                      {/* Day Tasks List */}
                      <div className="flex-1 overflow-y-auto space-y-2 pt-3 min-h-[140px]">
                        {dayTasks.map(task => (
                          <div
                            key={task.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', task.id);
                              setDraggingTaskId(task.id);
                            }}
                            onClick={() => handleOpenTaskModal(task)}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#38383e] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <p className="text-xs font-bold text-slate-800 dark:text-[#ededed] truncate">{task.title}</p>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-[#222225]/60 text-[10px]">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">{task.priority}</span>
                              <button
                                onClick={(e) => handlePostponeToTomorrow(task.id, e)}
                                className="text-slate-400 hover:text-amber-500 font-medium opacity-80 group-hover:opacity-100"
                                title="Push to Next Day"
                              >
                                ⏩ +1d
                              </button>
                            </div>
                          </div>
                        ))}

                        {dayTasks.length === 0 && (
                          <div className="h-full flex items-center justify-center p-3 text-center text-[11px] text-slate-300 dark:text-[#52525b]">
                            No tasks
                          </div>
                        )}
                      </div>

                      {/* Quick Add for this Day */}
                      <button
                        onClick={() => {
                          setNewDueDate(day.dateStr);
                          handleOpenTaskModal(null, 'todo');
                        }}
                        className="mt-2 w-full py-1.5 text-[11px] font-semibold text-slate-500 dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1c20] flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- RICH FORMATTED MEETING SCRATCHPAD DRAWER & CLOUD ARCHIVE --- */}
      <MeetingScratchpad
        isOpen={showScratchpad}
        onClose={() => setShowScratchpad(false)}
        notes={meetingNotes}
        onSaveNote={handleSaveMeetingNote}
        onDeleteNote={handleDeleteMeetingNote}
        onCreateNote={handleCreateMeetingNote}
        session={session}
        darkMode={darkMode}
      />

      {/* --- ACTIVITY HISTORY MODAL (SCREENSHOT 1 ACTION) --- */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#ededed]">Activity History & Audit Log</h3>
              </div>
              <button onClick={() => setShowActivityModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-[#a1a1aa]" /></button>
            </div>
            <p className="text-xs text-slate-400 dark:text-[#a1a1aa] mb-4">
              Full timeline of completed tasks, Pomodoro sessions, and modifications.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {activityLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-100 dark:border-[#222225] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-[#ededed]">{log.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{log.time}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowActivityModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- ADD CUSTOM SECTION MODAL (SCREENSHOT 1 ACTION) --- */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#ededed]">Add New Section</h3>
              <button onClick={() => setShowAddSectionModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#a1a1aa] mb-1">Section Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Backlog, Client Review, t 4..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] text-xs font-semibold text-slate-900 dark:text-[#ededed] focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 dark:text-[#a1a1aa] rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1c20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EMAIL TASKS TO INBOX MODAL (SCREENSHOT 1 ACTION) --- */}
      {showEmailInboxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#ededed]">Email tasks to Inbox</h3>
              </div>
              <button onClick={() => setShowEmailInboxModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mb-4 leading-relaxed">
              Forward any email to your private Takt address. The subject will become the task title and the email body will be saved as description.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] flex items-center justify-between gap-2 mb-4">
              <code className="text-xs font-mono text-red-600 dark:text-red-400 truncate">
                inbox+{session?.user?.id?.slice(0, 8) || 'guest'}@takt.harisarshad.site
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`inbox+${session?.user?.id?.slice(0, 8) || 'guest'}@takt.harisarshad.site`);
                  showToast('Copied email address!');
                }}
                className="px-2 py-1 rounded bg-slate-200 dark:bg-[#1c1c20] text-[10px] font-bold text-slate-700 dark:text-[#ededed] shrink-0"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowEmailInboxModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --- INBOX CALENDAR FEED MODAL (SCREENSHOT 1 ACTION) --- */}
      {showCalendarFeedModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#ededed]">Inbox Calendar Feed (iCal)</h3>
              </div>
              <button onClick={() => setShowCalendarFeedModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mb-4 leading-relaxed">
              Subscribe to your Takt tasks in Apple Calendar, Google Calendar, or Outlook to view scheduled tasks day-by-day.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#222225] flex items-center justify-between gap-2 mb-4">
              <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">
                webcal://takt.harisarshad.site/feed.ics
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('webcal://takt.harisarshad.site/feed.ics');
                  showToast('Copied feed URL!');
                }}
                className="px-2 py-1 rounded bg-slate-200 dark:bg-[#1c1c20] text-[10px] font-bold text-slate-700 dark:text-[#ededed] shrink-0"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowCalendarFeedModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --- KARMA & PRODUCTIVITY MODAL --- */}
      {showKarmaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#ededed]">Productivity & Karma</h3>
              </div>
              <button onClick={() => setShowKarmaModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-[#a1a1aa]" /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#281a0b]/50 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">Karma Score</span>
                  <p className="text-2xl font-black text-amber-800 dark:text-amber-300">1,840 pts</p>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Level: Master Achiever</span>
                </div>
                <Award className="w-10 h-10 text-amber-500" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200/80 dark:border-[#222225] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-[#ededed]">
                  <span>Daily Goal Progress</span>
                  <span>{completedCount} / 5 tasks</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1c1c20] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (completedCount / 5) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-[#a1a1aa]">Complete 5 tasks daily to maintain your 4-day streak.</p>
              </div>
            </div>

            <button
              onClick={() => setShowKarmaModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- DAILY SHUTDOWN RITUAL MODAL --- */}
      {showShutdownModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-[#0d261a] text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-[#ededed] mb-1">Daily Shutdown Ritual</h3>
            <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mb-5 leading-relaxed">
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

      {/* --- TASK DETAIL & CREATION MODAL --- */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={modalTask}
        onSaveTask={handleSaveTaskModal}
        onDeleteTask={handleDeleteTaskModal}
        allTasks={filteredTasks}
        onSelectTask={(t) => setModalTask(t)}
        defaultSection={modalDefaultSection}
        sections={customSections}
        darkMode={darkMode}
      />

    </div>
  );
}