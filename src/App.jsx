import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Trash2, Edit3, MoreHorizontal, Sparkles, X, Moon, Sun,
  ListFilter, Kanban, Tag, Flame, BarChart3, Bell, Play, Pause,
  RotateCcw, Star, LogIn, LogOut, Download, Upload, SlidersHorizontal, AlertCircle,
  BookOpen, ChevronRight, CheckSquare, Zap, Shield, ArrowRight, ArrowLeft,
  ChevronDown, Filter, Flag, Layers, Award, Target, Eye, EyeOff, User,
  Mail, Lock, Sparkle, RefreshCw, Menu, HelpCircle, CheckCircle, GripVertical,
  CalendarDays, Share2, FileText, Copy, HardDriveDownload, Archive, MessageSquare,
  FolderKanban
} from 'lucide-react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import TaskModal from './TaskModal';
import LandingPage from './LandingPage';
import MeetingScratchpad from './MeetingScratchpad';
import TaktLogo, { Logo } from './components/brand/TaktLogo';
import CollapsibleWidget from './components/CollapsibleWidget';
import BoardTaskCard from './components/BoardTaskCard';
import ListTaskCard from './components/ListTaskCard';

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

// Standard RFC4122 v4 UUID helpers for Supabase PostgreSQL schema compatibility
const isValidUUID = (str) => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  const [isAuthResolving, setIsAuthResolving] = useState(() => {
    // If returning from Google OAuth or session token is stored in localStorage, resolve before deciding route
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('access_token') || hash.includes('refresh_token') || search.includes('code=')) {
        return true;
      }
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            const val = localStorage.getItem(key);
            if (val && JSON.parse(val)?.user) return true;
          }
        }
      } catch {}
    }
    return false;
  });
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [rememberMe, setRememberMe] = useState(() => (localStorage.getItem('takt_remember_me') || localStorage.getItem('auratask_remember_me')) !== 'false');
  const [authEmail, setAuthEmail] = useState(() => localStorage.getItem('takt_remembered_email') || localStorage.getItem('auratask_remembered_email') || '');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Authenticated user identity labels
  const userFullName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name;
  const userEmail = session?.user?.email;
  const displayName = userFullName || (userEmail ? userEmail.split('@')[0] : 'Workspace User');

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
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('access_token') || hash.includes('refresh_token') || search.includes('code=')) {
        return false;
      }
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            const val = localStorage.getItem(key);
            if (val && JSON.parse(val)?.user) return false;
          }
        }
      } catch {}
    }
    return true;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [modalDefaultSection, setModalDefaultSection] = useState('todo');
  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('takt_collapsed_sections');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Collapsible Sidebar Widgets State (Productivity & Tools, Projects, Tags, and sub-sections)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('takt_sidebar_collapsed_widgets');
      return saved ? JSON.parse(saved) : {
        productivity: false,
        'productivity-rituals': false,
        projects: false,
        'projects-sub': false,
        tags: false,
      };
    } catch {
      return {
        productivity: false,
        'productivity-rituals': false,
        projects: false,
        'projects-sub': false,
        tags: false,
      };
    }
  });

  const toggleSidebarWidget = (key) => {
    setSidebarCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('takt_sidebar_collapsed_widgets', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

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
    const finalPayload = {
      ...taskPayload,
      id: isValidUUID(taskPayload.id) ? taskPayload.id : generateUUID()
    };
    const existingIndex = tasks.findIndex(t => t.id === finalPayload.id || (taskPayload.id && t.id === taskPayload.id));
    let updatedTasks = [];
    if (existingIndex !== -1) {
      updatedTasks = tasks.map((t, idx) => idx === existingIndex ? { ...t, ...finalPayload } : t);
      showToast('Task updated');
      recordActivity(`Updated task "${finalPayload.title.slice(0, 28)}..."`, 'edit');
    } else {
      updatedTasks = [finalPayload, ...tasks];
      showToast('Task created');
      recordActivity(`Created task "${finalPayload.title.slice(0, 28)}..."`, 'plus');
    }
    setTasks(updatedTasks);

    if (session?.user) {
      try {
        const cloudTask = sanitizeTaskForCloud(finalPayload, session.user.id);
        const { error } = await supabase.from('tasks').upsert(cloudTask);
        if (error) console.warn("Supabase upsert notice:", error);
      } catch (err) {
        console.warn("Supabase upsert notice:", err);
      }
    }

    if (finalPayload.section === 'completed' && (!modalTask || modalTask.section !== 'completed')) {
      triggerCelebration();
    }
  };

  const handleDeleteTaskModal = async (taskId) => {
    handleDeleteTask(taskId);
  };

  const toggleSectionCollapse = (sectionKey) => {
    setCollapsedSections(prev => {
      const next = {
        ...prev,
        [sectionKey]: !prev[sectionKey]
      };
      try {
        localStorage.setItem('takt_collapsed_sections', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
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
    setIsAuthResolving(false);
    localStorage.removeItem('takt_guest_mode');
    localStorage.removeItem('auratask_guest_mode');
    if (userSession?.user?.id) {
      const uId = userSession.user.id;
      const userCached = loadScopedWorkspaceData(uId);

      // If user has cached tasks, populate workspace
      if (userCached.tasks && userCached.tasks.length > 0) {
        setTasks(userCached.tasks);
      } else {
        // Cross-profile / guest migration safeguard:
        // If local user cache is empty on this device/profile, check if user had created tasks in session
        setTasks(prev => {
          const nonDemo = prev.filter(t => !t.id.startsWith('guest-'));
          if (nonDemo.length > 0) {
            const migrated = nonDemo.map(t => ({
              ...t,
              id: isValidUUID(t.id) ? t.id : generateUUID(),
              user_id: uId
            }));
            try {
              localStorage.setItem(`takt_tasks_u_${uId}`, JSON.stringify(migrated));
            } catch {}
            return migrated;
          }
          return [];
        });
      }

      setMeetingNotes(userCached.notes);
      setCustomSections(userCached.sections);
      setActivityLogs(userCached.activity);
    }
  };

  // Reset workspace completely on sign out
  const handleUserSignedOut = () => {
    setSession(null);
    setIsGuest(false);
    setIsAuthResolving(false);
    setShowLandingPage(true);
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
    let isMounted = true;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      if (existingSession) {
        handleUserSessionEstablished(existingSession);
      } else {
        const hasOAuthParams = typeof window !== 'undefined' && (
          window.location.hash.includes('access_token') ||
          window.location.hash.includes('refresh_token') ||
          window.location.search.includes('code=')
        );
        if (!hasOAuthParams) {
          setIsAuthResolving(false);
        }
      }
    }).catch(err => {
      console.warn("Supabase auth session check notice:", err);
      if (isMounted) setIsAuthResolving(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!isMounted) return;
      if (s) {
        handleUserSessionEstablished(s);
        // Clean URL OAuth tokens if present without triggering page reload
        if (typeof window !== 'undefined' && (
          window.location.hash.includes('access_token') ||
          window.location.hash.includes('refresh_token') ||
          window.location.search.includes('code=')
        )) {
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
        }
      } else if (event === 'SIGNED_OUT') {
        handleUserSignedOut();
      } else {
        setIsAuthResolving(false);
      }
    });

    // Safety fallback: never remain stuck in resolving screen longer than 3.5 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setIsAuthResolving(false);
    }, 3500);

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(fallbackTimer);
    };
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

          const normalizedCloudTasks = regularTasks.map(item => ({
            ...item,
            id: isValidUUID(item.id) ? item.id : generateUUID(),
            section: item.section || 'todo',
            priority: item.priority || 'P2',
            tags: Array.isArray(item.tags) ? item.tags : ['#Work'],
            subtasks: Array.isArray(item.subtasks) ? item.subtasks : []
          }));

          // Merge with any local tasks for this user that were created offline or before cloud sync
          setTasks(prevTasks => {
            const cloudIds = new Set(normalizedCloudTasks.map(t => t.id));
            const unsyncedLocal = prevTasks.filter(t =>
              !t.id.startsWith('guest-') &&
              !cloudIds.has(t.id) &&
              !normalizedCloudTasks.some(ct => ct.title === t.title && ct.created_at === t.created_at)
            );

            let merged = normalizedCloudTasks;
            if (unsyncedLocal.length > 0) {
              const toUpload = unsyncedLocal.map(t => sanitizeTaskForCloud(t, currentUserId));
              supabase.from('tasks').upsert(toUpload).then(({ error: upsertErr }) => {
                if (upsertErr) console.warn("Sync local tasks to cloud notice:", upsertErr);
              });
              merged = [...normalizedCloudTasks, ...unsyncedLocal];
            }

            try {
              localStorage.setItem(`takt_tasks_u_${currentUserId}`, JSON.stringify(merged));
            } catch {}
            return merged;
          });

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
      id: generateUUID(),
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
        const cloudTask = sanitizeTaskForCloud(taskObj, session.user.id);
        const { error } = await supabase
          .from('tasks')
          .insert([cloudTask]);
        if (error) console.warn("Background cloud sync note:", error);
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

  // Universal Framer Motion Card Reorder Handler with Automatic Persistence
  const handleReorderTasks = (newOrderedSubset) => {
    if (!newOrderedSubset || newOrderedSubset.length === 0) return;
    setTasks(prevTasks => {
      const subsetIds = new Set(newOrderedSubset.map(t => t.id));
      let orderIndex = 0;
      const nextTasks = prevTasks.map(t => {
        if (subsetIds.has(t.id)) {
          const replacement = newOrderedSubset[orderIndex];
          orderIndex++;
          return replacement || t;
        }
        return t;
      });
      return nextTasks;
    });
  };

  // Cross-column drop detection when releasing a board card over another column
  const handleBoardCardDragEnd = (task, currentColumnKey, info) => {
    if (!info || !info.point) return;
    try {
      const elements = document.elementsFromPoint(info.point.x, info.point.y);
      const targetColEl = elements.find(el => el.getAttribute && el.getAttribute('data-column-key'));
      const targetColumn = targetColEl ? targetColEl.getAttribute('data-column-key') : null;
      if (targetColumn && targetColumn !== currentColumnKey) {
        handleDropTask(task.id, targetColumn);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cross-section drop detection when releasing a list card over another section
  const handleListTaskDragEnd = (task, currentSecKey, info) => {
    if (!info || !info.point) return;
    try {
      const elements = document.elementsFromPoint(info.point.x, info.point.y);
      const targetSecEl = elements.find(el => el.getAttribute && el.getAttribute('data-section-key'));
      const targetSec = targetSecEl ? targetSecEl.getAttribute('data-section-key') : null;
      if (targetSec && targetSec !== currentSecKey) {
        handleDropTask(task.id, targetSec);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Memoized unique tags from tasks and standard presets
  const allAvailableTags = useMemo(() => {
    const set = new Set(['#Engineering', '#Design', '#Launch', '#Marketing', '#UX', '#Performance']);
    tasks.forEach(t => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach(tag => {
          if (tag) set.add(tag);
        });
      }
    });
    return Array.from(set);
  }, [tasks]);

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
      localStorage.removeItem('takt_guest_mode');
      localStorage.removeItem('auratask_guest_mode');
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
  // 0. AUTH RESOLUTION SCREEN (OAuth Handshake / Token Validation)
  // =========================================================================
  if (isAuthResolving) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'dark bg-[#090d16] text-[#ededed]' : 'bg-[#fffdfa] text-slate-900'}`}>
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <Logo href="" />
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121a2b] border border-slate-200 dark:border-[#22304e] shadow-xl">
            <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Verifying session... Redirecting to workspace
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. FULLSCREEN LANDING PAGE & PRODUCT SHOWCASE (IF LOGGED OUT)
  // =========================================================================
  if (!isAuthResolving && ((!session && !isGuest) || showLandingPage)) {
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
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-6 text-center">
                  <Logo className="h-8 w-auto mb-2" href="" />
                  <p className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                    Precision task command center & cadence workspace
                  </p>
                </div>

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
                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#ff4b55] via-[#ec4899] to-[#6366f1] hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
    <div className={`h-screen w-full flex overflow-hidden selection:bg-rose-500 selection:text-white ${darkMode ? 'dark bg-[#090d16] text-[#f8fafc]' : 'bg-[#f8fafc] text-slate-900'}`}>

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-[#1e293b] flex flex-col p-4 transition-transform duration-300 lg:static lg:translate-x-0 shrink-0 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand & Theme / Signout */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100 dark:border-[#1e293b]">
          <Logo
            subtitle={
              isGuest
                ? 'Guest Sandbox'
                : `Signed in as ${displayName}`
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

        {/* PROMINENT USER IDENTITY DISPLAY (Signed in as...) */}
        {session?.user ? (
          <div className="mb-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#151d30]/70 border border-slate-200/80 dark:border-[#22304e] flex items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                {session.user.user_metadata?.avatar_url ? (
                  <img
                    src={session.user.user_metadata.avatar_url}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                    {displayName.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0f172a]" title="Signed in & Cloud Synced"></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Signed in as
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={displayName}>
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        ) : isGuest ? (
          <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Guest Sandbox</span>
              </div>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                Local only • Sign in to sync across profiles
              </p>
            </div>
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="px-2 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shrink-0 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : null}

        {/* Global Quick Add Action */}
        <button
          onClick={() => handleOpenTaskModal(null, activeTab === 'inbox' ? 'todo' : 'todo')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold text-xs shadow-xs dark:shadow-sm dark:shadow-rose-600/20 mb-4 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add task</span>
          <span className="ml-auto text-[10px] bg-white/20 dark:bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">⌘N</span>
        </button>

        {/* Primary Views Navigation */}
        <nav className="space-y-1 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('inbox'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
              activeTab === 'inbox' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-[#1a243a] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className={`w-4 h-4 transition-colors ${activeTab === 'inbox' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span>Inbox</span>
            </div>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'inbox' && !selectedTag
                ? 'bg-slate-800 text-slate-300 dark:bg-white/10 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              {tasks.filter(t => t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('today'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
              activeTab === 'today' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-[#1a243a] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className={`w-4 h-4 transition-colors ${activeTab === 'today' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span>Today</span>
            </div>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === 'today' && !selectedTag
                ? 'bg-rose-500 text-white'
                : todayDueCount > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
            }`}>
              {todayDueCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('upcoming'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
              activeTab === 'upcoming' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-[#1a243a] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 transition-colors ${activeTab === 'upcoming' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span>Upcoming</span>
            </div>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'upcoming' && !selectedTag
                ? 'bg-slate-800 text-slate-300 dark:bg-white/10 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              {tasks.filter(t => t.due_date > todayDateStr && t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('completed'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
              activeTab === 'completed' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-[#1a243a] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 transition-colors ${activeTab === 'completed' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span>Completed</span>
            </div>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'completed' && !selectedTag
                ? 'bg-slate-800 text-slate-300 dark:bg-white/10 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              {completedCount}
            </span>
          </button>
        </nav>

        {/* =========================================================================
            COLLAPSIBLE SIDEBAR WIDGETS (ui-ux-pro-max & Framer Motion Accordion)
           ========================================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#222225] space-y-2">
          {/* 1. Productivity & Tools Collapsible Section */}
          <CollapsibleWidget
            id="productivity"
            title="Productivity & Tools"
            icon={Sparkles}
            isOpen={!sidebarCollapsed['productivity']}
            onToggle={() => toggleSidebarWidget('productivity')}
            badge={
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-[#281a0b] text-amber-700 dark:text-amber-400 border border-transparent dark:border-amber-500/30">
                4d 🔥
              </span>
            }
          >
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowKarmaModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Karma & Streaks</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-[#281a0b] text-amber-700 dark:text-amber-400 border border-transparent dark:border-amber-500/30">
                  Level 3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowActivityModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>Activity History</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{activityLogs.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed] transition-colors"
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
                type="button"
                onClick={() => setShowLandingPage(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] dark:hover:text-[#ededed] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Feature Tour</span>
                </div>
                <span className="text-[10px] text-slate-400">View</span>
              </button>

              {/* Nested Sub-Section: Daily Rituals & Focus Habits */}
              <div className="pt-1.5 mt-1 border-t border-slate-100/70 dark:border-[#222225]/70">
                <CollapsibleWidget
                  id="productivity-rituals"
                  title="Rituals & Habits"
                  isSubSection={true}
                  isOpen={!sidebarCollapsed['productivity-rituals']}
                  onToggle={() => toggleSidebarWidget('productivity-rituals')}
                >
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setShowShutdownModal(true)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-[#0d261a]/70 hover:bg-emerald-100/70 dark:hover:bg-[#0d261a] border border-emerald-200/50 dark:border-emerald-600/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Daily Shutdown Ritual</span>
                      </div>
                    </button>
                  </div>
                </CollapsibleWidget>
              </div>
            </div>
          </CollapsibleWidget>

          {/* 2. Projects & Stages Collapsible Section */}
          <CollapsibleWidget
            id="projects"
            title="Projects & Stages"
            icon={FolderKanban}
            isOpen={!sidebarCollapsed['projects']}
            onToggle={() => toggleSidebarWidget('projects')}
            badge={
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#151d30] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-[#22304e]">
                {customSections.length}
              </span>
            }
          >
            <div className="space-y-1">
              {customSections.map(sec => {
                const count = tasks.filter(t => t.section === sec.key).length;
                const secColor = sec.key === 'todo' ? '#38bdf8' : sec.key === 'in_progress' ? '#f59e0b' : sec.key === 'in_review' ? '#a855f7' : sec.key === 'completed' ? '#10b981' : '#64748b';
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => {
                      if (viewMode !== 'board') setViewMode('board');
                      setBoardGrouping('stage');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-[#121214] hover:text-slate-900 dark:hover:text-[#ededed] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: secColor }} />
                      <span className="capitalize">{sec.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#52525b]">
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Nested Sub-Section: View / Grouping Options */}
              <div className="pt-1.5 mt-1 border-t border-slate-100/70 dark:border-[#222225]/70">
                <CollapsibleWidget
                  id="projects-sub"
                  title="Board Grouping"
                  isSubSection={true}
                  isOpen={!sidebarCollapsed['projects-sub']}
                  onToggle={() => toggleSidebarWidget('projects-sub')}
                >
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setBoardGrouping('stage')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                        boardGrouping === 'stage'
                          ? 'bg-slate-900 text-white dark:bg-white/10 dark:text-white'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      Workflow Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoardGrouping('priority')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                        boardGrouping === 'priority'
                          ? 'bg-slate-900 text-white dark:bg-white/10 dark:text-white'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      Priority (P1-P4)
                    </button>
                  </div>
                </CollapsibleWidget>
              </div>
            </div>
          </CollapsibleWidget>

          {/* 3. Tags Collapsible Section */}
          <CollapsibleWidget
            id="tags"
            title="Tags"
            icon={Tag}
            isOpen={!sidebarCollapsed['tags']}
            onToggle={() => toggleSidebarWidget('tags')}
            badge={
              selectedTag ? (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-[#2a1215] text-rose-600 dark:text-rose-400 border border-rose-200/40 dark:border-rose-500/30">
                  {selectedTag}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#151d30] text-slate-500 dark:text-slate-400">
                  {allAvailableTags.length}
                </span>
              )
            }
            actions={
              selectedTag ? (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline px-1 py-0.5"
                >
                  Clear
                </button>
              ) : null
            }
          >
            <div className="space-y-1">
              {allAvailableTags.map(tag => {
                const count = tasks.filter(t => t.tags && t.tags.includes(tag)).length;
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-[#2a1215] text-rose-600 dark:text-rose-400 font-bold border border-rose-200/40 dark:border-rose-500/30'
                        : 'text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#ededed] hover:bg-slate-100 dark:hover:bg-[#121214]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 opacity-60" />
                      <span>{tag}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#52525b]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CollapsibleWidget>
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
        <header className="h-16 border-b border-slate-200/80 dark:border-[#1e293b] bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white lg:hidden rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold capitalize text-slate-900 dark:text-white flex items-center gap-2">
                <span>{selectedTag ? `Tag: ${selectedTag}` : activeTab}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] text-slate-500 dark:text-slate-400 font-mono">
                  {filteredTasks.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search */}
            <div className="relative hidden sm:block w-48 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks (⌘K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 dark:bg-[#121a2b] text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/60 dark:border-[#22304e] focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-[#151f33] focus:outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* View Mode Switcher: Board, List, Calendar */}
            <div className="flex items-center bg-slate-100 dark:bg-[#121a2b] p-0.5 rounded-xl border border-slate-200/80 dark:border-[#22304e]">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="List View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'board' ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
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

            {/* Header User Identity Badge */}
            {session?.user ? (
              <div
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#121a2b] border border-slate-200/80 dark:border-[#22304e]"
                title={`Signed in as ${displayName} (${userEmail})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Logged in as</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
                  {displayName}
                </span>
              </div>
            ) : isGuest ? (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] font-bold text-amber-700 dark:text-amber-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Guest Mode</span>
              </div>
            ) : null}

            {/* Quick Add Button Header */}
            <button
              onClick={() => handleOpenTaskModal(null, activeTab === 'inbox' ? 'todo' : 'todo')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add task</span>
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
              VIEW 1: STRUCTURED COLLAPSIBLE LIST VIEW (ui-ux-pro-max + Framer Motion)
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

                return (
                  <div
                    key={sec.key}
                    data-section-key={sec.key}
                    className="space-y-1.5 rounded-2xl p-2 transition-all"
                  >
                    {/* Section Header with Accessible Trigger & Rotating Chevron */}
                    <div className="flex items-center justify-between py-1.5 px-1">
                      <button
                        type="button"
                        id={`list-sec-btn-${sec.key}`}
                        aria-expanded={!isCollapsed}
                        aria-controls={`list-sec-content-${sec.key}`}
                        onClick={() => toggleSectionCollapse(sec.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSectionCollapse(sec.key);
                          }
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-[#ededed] hover:text-slate-950 dark:hover:text-white transition-colors group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg px-1.5 py-0.5"
                      >
                        <motion.span
                          animate={{ rotate: isCollapsed ? -180 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex items-center justify-center shrink-0"
                          aria-hidden="true"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </motion.span>
                        <span className="capitalize">{sec.label}</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-normal">
                          {secTasks.length}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTaskModal(null, sec.key)}
                          className="p-1 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                          title="Add task in section"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Animated Collapsible Body with Framer Motion AnimatePresence */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          id={`list-sec-content-${sec.key}`}
                          role="region"
                          aria-labelledby={`list-sec-btn-${sec.key}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                              height: { type: 'spring', stiffness: 300, damping: 25 },
                              opacity: { duration: 0.18, ease: 'easeOut' },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
                              opacity: { duration: 0.15 },
                            },
                          }}
                          style={{ overflow: 'hidden' }}
                        >
                          {/* Drag-and-Drop Reorder Group with tactile spring physics */}
                          <Reorder.Group
                            axis="y"
                            values={secTasks}
                            onReorder={(newOrder) => handleReorderTasks(newOrder)}
                            className="space-y-1.5 pl-1 pt-1"
                          >
                            {secTasks.map(task => (
                              <ListTaskCard
                                key={task.id}
                                task={task}
                                todayDateStr={todayDateStr}
                                toggleTaskCompleted={toggleTaskCompleted}
                                handleOpenTaskModal={handleOpenTaskModal}
                                handlePostponeToTomorrow={handlePostponeToTomorrow}
                                handleDeleteTask={handleDeleteTask}
                                setActiveTimerTask={setActiveTimerTask}
                                setTimerSeconds={setTimerSeconds}
                                setIsTimerRunning={setIsTimerRunning}
                                onCardDragEnd={(t, info) => handleListTaskDragEnd(t, sec.key, info)}
                              />
                            ))}
                          </Reorder.Group>

                          {/* Inline + Add task Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenTaskModal(null, sec.key)}
                            className="group w-full text-left py-2 px-3 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors mt-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                            <span>Add task</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-14 px-4 bg-white/70 dark:bg-[#0e1422]/60 border border-slate-200/80 dark:border-[#22304e]/70 rounded-2xl max-w-md mx-auto my-6 shadow-2xs">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
                    <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">All clear in {selectedTag ? `tag #${selectedTag}` : activeTab}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">No active tasks in this view. Press <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">⌘N</kbd> or click below to add one.</p>
                  <button
                    onClick={() => handleOpenTaskModal(null, 'todo')}
                    className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create task</span>
                  </button>
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

                // Dynamic column status dot color (from 21st.dev Kanban pattern)
                const columnColor = boardGrouping === 'stage'
                  ? (column.key === 'todo' ? '#38bdf8' : column.key === 'in_progress' ? '#f59e0b' : column.key === 'in_review' ? '#a855f7' : column.key === 'completed' ? '#10b981' : '#64748b')
                  : (column.key === 'P1' ? '#f43f5e' : column.key === 'P2' ? '#f59e0b' : column.key === 'P3' ? '#3b82f6' : '#94a3b8');

                return (
                  <div
                    key={column.key}
                    data-column-key={column.key}
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
                    className={`w-80 shrink-0 flex flex-col bg-slate-100/70 dark:bg-[#0c101c]/70 backdrop-blur-md border rounded-2xl p-3.5 max-h-full transition-all duration-200 ${
                      isOver
                        ? 'ring-2 ring-rose-500/50 border-rose-400 dark:border-rose-500/60 bg-rose-50/40 dark:bg-[#1a1020]/50 shadow-lg'
                        : 'border-slate-200/80 dark:border-[#1e2638] shadow-2xs'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 px-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-2 ring-white/60 dark:ring-black/40"
                          style={{ backgroundColor: columnColor }}
                        />
                        <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-[#ededed]">
                          {column.label}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#151d30] border border-slate-200/80 dark:border-[#22304e] text-slate-600 dark:text-[#a1a1aa] shadow-2xs">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddComposer(true);
                          if (boardGrouping === 'stage') setComposerSection(column.key);
                          else setNewPriority(column.key);
                        }}
                        className="p-1 hover:bg-white dark:hover:bg-[#151d30] rounded-lg text-slate-400 dark:text-[#a1a1aa] hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title={`Add task to ${column.label}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Column Task Cards with Framer Motion Reorder.Group */}
                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px]">
                      {isOver && draggingTaskId && (
                        <div className="border-2 border-dashed border-rose-400 dark:border-rose-500/80 rounded-xl p-3.5 text-center text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-50/60 dark:bg-[#20121d]/40 animate-pulse flex items-center justify-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Drop task into {column.label}</span>
                        </div>
                      )}

                      <Reorder.Group
                        axis="y"
                        values={columnTasks}
                        onReorder={(newOrder) => handleReorderTasks(newOrder)}
                        className="space-y-3 min-h-[40px]"
                      >
                        {columnTasks.map(task => (
                          <BoardTaskCard
                            key={task.id}
                            task={task}
                            todayDateStr={todayDateStr}
                            toggleTaskCompleted={toggleTaskCompleted}
                            handleOpenTaskModal={handleOpenTaskModal}
                            handlePostponeToTomorrow={handlePostponeToTomorrow}
                            handleUpdateTask={handleUpdateTask}
                            moveTaskSection={moveTaskSection}
                            onCardDragEnd={(t, info) => handleBoardCardDragEnd(t, column.key, info)}
                          />
                        ))}
                      </Reorder.Group>

                      {columnTasks.length === 0 && !isOver && (
                        <div className="border border-dashed border-slate-200 dark:border-[#1e2638] rounded-xl p-6 text-center text-xs text-slate-400 dark:text-[#52525b] bg-slate-50/40 dark:bg-[#0e1424]/40">
                          <span>No tasks in {column.label}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenTaskModal(null, column.key)}
                        className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 dark:text-[#a1a1aa] hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center gap-1.5 hover:bg-slate-200/50 dark:hover:bg-[#151d30] rounded-xl transition-colors"
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