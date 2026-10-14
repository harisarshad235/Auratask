import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Search, Calendar, Inbox, Check,
  Trash2, Edit3, MoreHorizontal, Sparkles, X, Moon, Sun,
  ListFilter, Kanban, Tag, Flame, BarChart3, Bell, Play, Pause,
  RotateCcw, Star, LogIn, LogOut, Download, Upload, SlidersHorizontal, AlertCircle,
  BookOpen, ChevronRight, CheckSquare, Zap, Shield, ArrowRight, ArrowLeft,
  ChevronDown, Filter, Flag, Layers, Award, Target, Eye, EyeOff, User,
  Mail, Lock, Sparkle, RefreshCw, Menu, HelpCircle, CheckCircle, GripVertical,
  CalendarDays, Share2, FileText, Copy, HardDriveDownload, Archive, MessageSquare,
  FolderKanban, Hourglass, Keyboard
} from 'lucide-react';
import { formatDuration, parseDurationMinutes, extractDurationHint } from './utils/formatDuration';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import TaskModal from './TaskModal';
import LandingPage from './LandingPage';
import MeetingScratchpad from './MeetingScratchpad';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { playTaskDoneSound, playPomodoroChime, playTactileTick } from './utils/soundEffects';
import TaktLogo, { Logo } from './components/brand/TaktLogo';
import CollapsibleWidget from './components/CollapsibleWidget';
import BoardTaskCard from './components/BoardTaskCard';
import ListTaskCard from './components/ListTaskCard';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import { sanitizeString, clientRateLimiter } from './utils/security';
import { formatLocalDate, getTodayDateStr, getTomorrowDateStr, getDaysFromNowStr } from './utils/dateUtils';

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
    due_date: getTodayDateStr(),
    due_time: '11:00',
    duration: '15m',
    estimated_minutes: 15,
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
    due_date: getTodayDateStr(),
    due_time: '14:30',
    duration: '25m',
    estimated_minutes: 25,
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
    due_date: getTomorrowDateStr(),
    due_time: '16:00',
    duration: '45m',
    estimated_minutes: 45,
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
    } catch { }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Metadata regex to extract embedded metadata from description
export const TAKT_META_REGEX = /<!--takt:meta\s+({[\s\S]*?})-->/;

// Normalize section strings to avoid any casing/format discrepancies across swimlanes
export const normalizeSectionKey = (sec) => {
  if (!sec) return 'todo';
  const s = String(sec).toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (s === 'todo' || s === 'to_do') return 'todo';
  if (s === 'in_progress' || s === 'inprogress' || s === 'progress') return 'in_progress';
  if (s === 'in_review' || s === 'inreview' || s === 'review') return 'in_review';
  if (s === 'completed' || s === 'done' || s === 'complete') return 'completed';
  return s;
};

// Helper to auto-heal tasks and ensure ETA / Duration, section, and metadata are 100% intact across devices/profiles
export const autoHealTask = (t) => {
  if (!t || typeof t !== 'object') return t;
  let desc = t.description || '';
  let meta = {};

  // 1. Check description metadata comment
  const metaMatch = desc.match(TAKT_META_REGEX);
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1]);
      desc = desc.replace(TAKT_META_REGEX, '').trim();
    } catch { }
  }

  // 2. Check JSONB subtasks metadata envelope
  let cleanSubtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
  const subMetaItem = cleanSubtasks.find(s => s && s.__takt_meta);
  if (subMetaItem) {
    meta = { ...subMetaItem, ...meta };
    cleanSubtasks = cleanSubtasks.filter(s => !s || !s.__takt_meta);
  }

  // 3. Resolve true duration without blind overwriting
  const titleHint = extractDurationHint(t.title);
  const descHint = extractDurationHint(desc);
  const rawDuration = t.duration || t.eta || meta.duration || meta.eta || titleHint || descHint || '';
  const rawMins = t.estimated_minutes || meta.estimated_minutes || (rawDuration ? parseDurationMinutes(rawDuration) : (t.focused_minutes || 0));
  const effDuration = rawDuration ? formatDuration(rawDuration) : (rawMins ? formatDuration(rawMins) : '');

  // 4. Resolve focus state
  const isFocusVal = t.is_focus !== undefined ? Boolean(t.is_focus) : (meta.is_focus !== undefined ? Boolean(meta.is_focus) : false);

  // 5. Normalize section key so in_review, In Review, in-review always match the swimlane
  const resolvedSection = normalizeSectionKey(t.section || meta.section || t.status || meta.status || 'todo');

  // 6. Comments resolution
  const resolvedComments = (Array.isArray(t.comments) && t.comments.length > 0)
    ? t.comments
    : (Array.isArray(meta.comments) && meta.comments.length > 0 ? meta.comments : []);

  // 7. Deadline & ETA resolution
  const resolvedDeadline = t.deadline || meta.deadline || '';
  const resolvedEta = t.eta || meta.eta || effDuration || '';

  return {
    ...t,
    id: isValidUUID(t.id) ? t.id : (isValidUUID(meta.id) ? meta.id : (t.id || generateUUID())),
    title: t.title || '',
    description: desc,
    section: resolvedSection,
    status: resolvedSection,
    priority: t.priority || meta.priority || 'P2',
    due_date: t.due_date || null,
    due_time: t.due_time || '',
    eta: resolvedEta,
    duration: effDuration,
    estimated_minutes: rawMins || (effDuration ? parseDurationMinutes(effDuration) : 0),
    focused_minutes: t.focused_minutes || meta.focused_minutes || 0,
    deadline: resolvedDeadline,
    tags: (Array.isArray(t.tags) && t.tags.length > 0) ? t.tags : (Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : ['#Work']),
    subtasks: cleanSubtasks,
    comments: resolvedComments,
    is_focus: isFocusVal,
    reminder: t.reminder || meta.reminder || 'none',
    created_at: t.created_at || new Date().toISOString()
  };
};

// Helper to construct database-safe cloud task payload with multi-redundant metadata
export const prepareBaseCloudTask = (t, userId) => {
  const healed = autoHealTask(t);
  const cleanDesc = (healed.description || '').replace(TAKT_META_REGEX, '').trim();

  const metaPayload = {
    duration: healed.duration || '',
    eta: healed.eta || healed.duration || '',
    estimated_minutes: healed.estimated_minutes || 0,
    focused_minutes: healed.focused_minutes || 0,
    deadline: healed.deadline || '',
    tags: Array.isArray(healed.tags) && healed.tags.length > 0 ? healed.tags : ['#Work'],
    section: healed.section || 'todo',
    status: healed.section || 'todo',
    priority: healed.priority || 'P2',
    is_focus: Boolean(healed.is_focus),
    comments: Array.isArray(healed.comments) ? healed.comments : [],
    reminder: healed.reminder || 'none',
    id: healed.id
  };

  // Redundancy 1: Embed in description
  const finalDesc = cleanDesc
    ? `${cleanDesc}\n<!--takt:meta ${JSON.stringify(metaPayload)}-->`
    : `<!--takt:meta ${JSON.stringify(metaPayload)}-->`;

  // Redundancy 2: Embed in JSONB subtasks array
  const rawSubtasks = Array.isArray(healed.subtasks)
    ? healed.subtasks.filter(s => s && !s.__takt_meta)
    : [];
  const cloudSubtasks = [
    { __takt_meta: true, ...metaPayload },
    ...rawSubtasks
  ];

  // ONLY return columns verified to exist in the Postgres tasks schema
  return {
    id: healed.id,
    user_id: userId,
    title: healed.title || '',
    description: finalDesc,
    section: healed.section || 'todo',
    priority: healed.priority || 'P2',
    due_date: healed.due_date ? healed.due_date : null,
    due_time: healed.due_time || '',
    subtasks: cloudSubtasks,
    is_focus: Boolean(healed.is_focus),
    created_at: healed.created_at || new Date().toISOString()
  };
};

// Tombstone tracking for permanently deleted tasks to prevent zombie resurrections
export const addDeletedTombstone = (taskId, userId, taskTitle = '') => {
  if (!userId) return;
  try {
    const key = `takt_deleted_ids_u_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (taskId && !list.includes(taskId)) list.push(taskId);
    if (taskTitle) {
      const titleKey = `title:${taskTitle.trim().toLowerCase()}`;
      if (!list.includes(titleKey)) list.push(titleKey);
    }
    localStorage.setItem(key, JSON.stringify(list.slice(-300)));
  } catch { }
};

export const isTaskDeleted = (taskId, userId, taskTitle = '') => {
  if (!userId) return false;
  try {
    const key = `takt_deleted_ids_u_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (taskId && list.includes(taskId)) return true;
    if (taskTitle && list.includes(`title:${taskTitle.trim().toLowerCase()}`)) return true;
  } catch { }
  return false;
};

// Safe scan of legacy auratask keys for this user during one-time migration
export const findOrphanedTasks = (userId) => {
  if (!userId) return [];
  const found = [];
  const foundTitles = new Set();
  const keysToScan = [
    `auratask_tasks_u_${userId}`,
    `auratask_tasks_backup_u_${userId}`
  ];

  keysToScan.forEach(k => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && item.title) {
              const lowerTitle = item.title.toLowerCase().trim();
              // NEVER treat meeting scratchpad notes or deleted tasks as tasks
              if (item.section === 'meeting_notes' || lowerTitle === 'welcome to your private scratchpad') return;
              if (isTaskDeleted(item.id, userId, item.title)) return;
              if (!foundTitles.has(lowerTitle)) {
                foundTitles.add(lowerTitle);
                found.push(autoHealTask({ ...item, user_id: userId }));
              }
            }
          });
        }
      }
    } catch { }
  });

  return found;
};

// Helper to safely load isolated user or guest data
const loadScopedWorkspaceData = (userId = null) => {
  if (userId) {
    try {
      const savedTasks = localStorage.getItem(`takt_tasks_u_${userId}`) || localStorage.getItem(`auratask_tasks_u_${userId}`);
      const backupTasks = localStorage.getItem(`takt_tasks_backup_u_${userId}`);
      let rawTasks = savedTasks ? JSON.parse(savedTasks) : (backupTasks ? JSON.parse(backupTasks) : []);
      if (!Array.isArray(rawTasks) || rawTasks.length === 0) {
        rawTasks = findOrphanedTasks(userId);
      }
      const filteredTasks = Array.isArray(rawTasks)
        ? rawTasks
            .filter(t => t && t.title && t.title.toLowerCase().trim() !== 'welcome to your private scratchpad' && !isTaskDeleted(t.id, userId, t.title))
            .map(autoHealTask)
        : [];
      const savedNotes = localStorage.getItem(`takt_notes_u_${userId}`) || localStorage.getItem(`auratask_notes_u_${userId}`);
      const savedSections = localStorage.getItem(`takt_sections_u_${userId}`) || localStorage.getItem(`auratask_sections_u_${userId}`);
      const savedLogs = localStorage.getItem(`takt_activity_u_${userId}`) || localStorage.getItem(`auratask_activity_u_${userId}`);
      return {
        tasks: filteredTasks,
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
        parsedTasks = parsedTasks.filter(t => !t.user_id || t.id.startsWith('guest-')).map(autoHealTask);
        if (parsedTasks.length === 0) parsedTasks = GUEST_DEMO_TASKS.map(autoHealTask);
      } else {
        parsedTasks = GUEST_DEMO_TASKS.map(autoHealTask);
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
      return { tasks: GUEST_DEMO_TASKS.map(autoHealTask), notes: GUEST_DEMO_NOTES, sections: DEFAULT_SECTIONS, activity: [] };
    }
  }
};

export default function App() {
  const todayDateStr = getTodayDateStr();

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
      } catch { }
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
      let authStr = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          authStr = localStorage.getItem(key);
          break;
        }
      }
      if (authStr) {
        const parsed = JSON.parse(authStr);
        if (parsed?.user?.id) return loadScopedWorkspaceData(parsed.user.id);
      }
    } catch { }
    return loadScopedWorkspaceData(null);
  }, []);

  // --- WORKSPACE STATES ---
  const [tasks, setTasks] = useState(() => initialData.tasks);
  const [customSections, setCustomSections] = useState(() => initialData.sections);
  const [meetingNotes, setMeetingNotes] = useState(() => initialData.notes);
  const [activityLogs, setActivityLogs] = useState(() => initialData.activity);

  // --- UI NAVIGATION & VIEW MODES ---
  const [activeTab, setActiveTab] = useState('today'); // By default open Today
  const [viewMode, setViewMode] = useState('board'); // By default open Board view
  const [searchQuery, setSearchQuery] = useState('');
  // Default to Eye-Comfort Light Mode (soothing, zero eye-strain, user friendly)
  const [darkMode, setDarkMode] = useState(() => {
    const v2 = localStorage.getItem('takt_theme_v2');
    if (v2) return v2 === 'dark';
    // Clear legacy theme so users get immediate eye relief with clean Light Mode
    localStorage.setItem('takt_theme_v2', 'light');
    localStorage.setItem('takt_theme', 'light');
    localStorage.setItem('auratask_theme', 'light');
    return false;
  });
  const [selectedTag, setSelectedTag] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- SCREENSHOT 1 HEADER "..." DROPDOWN MENU STATE ---
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // --- USER SESSION CONTROLS DROPDOWN & POPOVER STATES ---
  const [isTopbarUserMenuOpen, setIsTopbarUserMenuOpen] = useState(false);
  const topbarUserMenuRef = useRef(null);
  const [isSidebarUserMenuOpen, setIsSidebarUserMenuOpen] = useState(false);
  const sidebarUserMenuRef = useRef(null);

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
  const [dragInsertPosition, setDragInsertPosition] = useState(null); // 'before' | 'after'
  const [editingSectionKey, setEditingSectionKey] = useState(null);
  const [editingSectionLabel, setEditingSectionLabel] = useState('');
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
  const [newDueDate, setNewDueDate] = useState(() => getTodayDateStr());
  const [newDueTime, setNewDueTime] = useState('');
  const [newTag, setNewTag] = useState('#Work');
  const [newDuration, setNewDuration] = useState('30m');

  // --- POMODORO FLOW TIMER ---
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // --- TODAY'S BIG 3 SPOTLIGHT STATE ---
  const [isBig3Collapsed, setIsBig3Collapsed] = useState(false);
  const [showBig3Picker, setShowBig3Picker] = useState(false);
  const [big3PickerSlot, setBig3PickerSlot] = useState(0);
  const [big3SearchQuery, setBig3SearchQuery] = useState('');
  const [quickBig3Title, setQuickBig3Title] = useState('');

  // --- PRODUCTIVITY MODALS ---
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [expandedTaskSubtasks, setExpandedTaskSubtasks] = useState({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});

  // Backward compatibility alias for prepareBaseCloudTask
  const sanitizeTaskForCloud = (t, userId) => prepareBaseCloudTask(t, userId);

  // Persistent offline sync queue helpers
  const getSyncQueueKey = (userId) => `takt_sync_queue_u_${userId}`;

  const addToSyncQueue = (taskObj, userId) => {
    if (!userId || !taskObj?.id) return;
    try {
      const key = getSyncQueueKey(userId);
      const queue = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = queue.filter(item => item.id !== taskObj.id);
      filtered.push(taskObj);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch { }
  };

  const removeFromSyncQueue = (taskId, userId) => {
    if (!userId || !taskId) return;
    try {
      const key = getSyncQueueKey(userId);
      const queue = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = queue.filter(item => item.id !== taskId);
      if (filtered.length > 0) {
        localStorage.setItem(key, JSON.stringify(filtered));
      } else {
        localStorage.removeItem(key);
      }
    } catch { }
  };

  // Bulletproof Cloud Upsert that targets primary key (.eq('id', taskId)), supports full schema + metadata fallback
  const upsertTaskToCloud = async (taskObj, userId) => {
    if (!userId || !taskObj?.id) return false;
    try {
      const healed = autoHealTask(taskObj);
      const baseCloudTask = prepareBaseCloudTask(healed, userId);
      const nowIso = new Date().toISOString();

      const fullCloudTask = {
        ...baseCloudTask,
        eta: healed.eta || healed.duration || '',
        duration: healed.duration || '',
        estimated_minutes: healed.estimated_minutes || 0,
        focused_minutes: healed.focused_minutes || 0,
        deadline: healed.deadline || '',
        tags: Array.isArray(healed.tags) && healed.tags.length > 0 ? healed.tags : ['#Work'],
        status: healed.section || 'todo',
        updated_at: nowIso
      };

      // Attempt 1: Upsert with full native columns
      let targetPayload = fullCloudTask;
      let { error: upsertErr } = await supabase.from('tasks').upsert(targetPayload);

      // If Postgres reports missing columns (prior to running migration 20261013), fall back to base verified schema
      if (upsertErr && (upsertErr.code === '42703' || upsertErr.message?.includes('column') || upsertErr.message?.includes('schema cache'))) {
        console.info("Tasks table pending extended column migration; saving with robust metadata comment envelope.", upsertErr.message);
        targetPayload = baseCloudTask;
        const res = await supabase.from('tasks').upsert(targetPayload);
        upsertErr = res.error;
      }

      if (!upsertErr) {
        removeFromSyncQueue(baseCloudTask.id, userId);
        return true;
      }

      // Attempt 2: Explicit primary key update (.eq('id', taskId).eq('user_id', userId))
      let { error: updateErr } = await supabase
        .from('tasks')
        .update(targetPayload)
        .eq('id', baseCloudTask.id)
        .eq('user_id', userId);

      if (updateErr && (updateErr.code === '42703' || updateErr.message?.includes('column'))) {
        targetPayload = baseCloudTask;
        const res = await supabase
          .from('tasks')
          .update(targetPayload)
          .eq('id', baseCloudTask.id)
          .eq('user_id', userId);
        updateErr = res.error;
      }

      if (!updateErr) {
        removeFromSyncQueue(baseCloudTask.id, userId);
        return true;
      }

      // Attempt 3: Direct insert
      const { error: insertErr } = await supabase.from('tasks').insert(targetPayload);
      if (!insertErr) {
        removeFromSyncQueue(baseCloudTask.id, userId);
        return true;
      }

      console.error("Supabase task sync failed across all strategies:", {
        taskId: baseCloudTask.id,
        upsertError: upsertErr,
        updateError: updateErr,
        insertError: insertErr
      });
      addToSyncQueue(taskObj, userId);
      return false;
    } catch (err) {
      console.error("Cloud task sync exception (queued for background retry):", err);
      addToSyncQueue(taskObj, userId);
      return false;
    }
  };

  // Flush pending offline changes to cloud
  const flushSyncQueue = async (userId) => {
    if (!userId) return;
    try {
      const key = getSyncQueueKey(userId);
      const queue = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(queue) || queue.length === 0) return;
      for (const item of queue) {
        if (!isTaskDeleted(item?.id, userId, item?.title)) {
          await upsertTaskToCloud(item, userId);
        } else {
          removeFromSyncQueue(item?.id, userId);
        }
      }
    } catch { }
  };

  // --- MEETING SCRATCHPAD HANDLERS ---
  const handleSaveMeetingNote = async (updatedNote) => {
    const cleanTitle = sanitizeString(updatedNote.title || 'Untitled Meeting Note', 200);
    const cleanContent = sanitizeString(updatedNote.content || '', 50000);
    const safeNote = { ...updatedNote, title: cleanTitle, content: cleanContent };

    setMeetingNotes(prev => {
      const exists = prev.some(n => n.id === safeNote.id);
      if (exists) {
        return prev.map(n => n.id === safeNote.id ? safeNote : n);
      }
      return [safeNote, ...prev];
    });

    if (session?.user?.id) {
      try {
        const { error } = await supabase.from('tasks').upsert({
          id: safeNote.id,
          title: cleanTitle,
          description: cleanContent,
          section: 'meeting_notes',
          priority: 'P2',
          due_date: getTodayDateStr(),
          due_time: '',
          subtasks: [],
          created_at: safeNote.updated_at || new Date().toISOString(),
          user_id: session.user.id
        });
        if (error) {
          console.error("Supabase meeting note sync error:", error);
        }
      } catch (err) {
        console.error("Supabase meeting note exception:", err);
      }
    }
  };

  const handleDeleteMeetingNote = async (noteId) => {
    setMeetingNotes(prev => prev.filter(n => n.id !== noteId));
    showToast('Note deleted');
    if (session?.user?.id) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', noteId).eq('user_id', session.user.id);
        if (error) {
          console.error("Supabase note delete error:", error);
        }
      } catch (err) {
        console.error("Supabase note delete exception:", err);
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

  // --- TODAY'S BIG 3 SPOTLIGHT HANDLERS ---
  const handleOpenBig3Picker = (slotIndex = 0) => {
    setBig3PickerSlot(slotIndex);
    setBig3SearchQuery('');
    setQuickBig3Title('');
    setShowBig3Picker(true);
  };

  const handleSelectTaskForBig3 = (targetTask) => {
    handleUpdateTask(targetTask.id, {
      is_focus: true,
      due_date: targetTask.due_date || todayDateStr
    });
    setShowBig3Picker(false);
    showToast(`Added "${targetTask.title.slice(0, 24)}" to Today's Big 3 Spotlight ⭐`);
  };

  const handleCreateAndPinBig3 = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!quickBig3Title.trim()) return;
    const newTask = {
      id: generateUUID(),
      title: quickBig3Title.trim(),
      description: '',
      section: 'todo',
      priority: 'P1',
      due_date: todayDateStr,
      due_time: '',
      duration: '30m',
      estimated_minutes: 30,
      tags: ['#Work'],
      is_focus: true,
      focused_minutes: 0,
      subtasks: [],
      created_at: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    saveTasksToStorage([newTask, ...tasks], session?.user?.id);
    if (session?.user?.id) {
      upsertTaskToCloud(newTask, session.user.id);
    }
    setQuickBig3Title('');
    setShowBig3Picker(false);
    showToast(`Created & pinned "${newTask.title.slice(0, 24)}" to Big 3 ⭐`);
  };

  const handleClearBig3 = () => {
    setTasks(prev => prev.map(t => t.is_focus ? { ...t, is_focus: false } : t));
    try {
      const uId = session?.user?.id;
      const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
      const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
      const updated = tasks.map(t => t.is_focus ? { ...t, is_focus: false } : t);
      const dataStr = JSON.stringify(updated);
      localStorage.setItem(key, dataStr);
      localStorage.setItem(backupKey, dataStr);
    } catch { }
    showToast("Cleared Today's Big 3 Spotlight");
  };

  // --- LANDING PAGE & TASK MODALS STATE ---
  const [showLandingPage, setShowLandingPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      // Feature tour route takes precedence (persists on hard refresh)
      let isTourRoute = false;
      try {
        if (sessionStorage.getItem('takt_view') === 'tour') {
          isTourRoute = true;
        }
      } catch { }
      if (path.includes('/tour') || hash.includes('tour') || search.includes('tour')) {
        isTourRoute = true;
      }
      if (isTourRoute) {
        return true;
      }

      // Supabase OAuth callback tokens take precedence
      if (hash.includes('access_token') || hash.includes('refresh_token') || search.includes('code=')) {
        return false;
      }

      // Guest mode
      if ((localStorage.getItem('takt_guest_mode') || localStorage.getItem('auratask_guest_mode')) === 'true') {
        return false;
      }

      // Logged-in Supabase user
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            const val = localStorage.getItem(key);
            if (val && JSON.parse(val)?.user) return false;
          }
        }
      } catch { }
    }
    return true;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [legalRoute, setLegalRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      if (path.includes('privacy') || hash.includes('privacy')) return 'privacy';
      if (path.includes('terms') || hash.includes('terms')) return 'terms';
    }
    return null;
  });

  // Track session/guest state across event listeners and callbacks
  const isLoggedInRef = useRef(Boolean(session || isGuest));
  useEffect(() => {
    isLoggedInRef.current = Boolean(session || isGuest);
  }, [session, isGuest]);

  // Robust check for active authentication or guest sandbox session
  const isUserLoggedIn = useCallback(() => {
    if (isLoggedInRef.current) return true;
    if (Boolean(session || isGuest)) return true;
    if (typeof window !== 'undefined') {
      if ((localStorage.getItem('takt_guest_mode') || localStorage.getItem('auratask_guest_mode')) === 'true') {
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
      } catch { }
    }
    return false;
  }, [session, isGuest]);

  // Unified legal page navigation helper
  const openLegalView = useCallback((route) => {
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({ fromApp: true }, '', `/${route}`);
    }
    setLegalRoute(route);
  }, []);

  // Feature tour navigation helper (synchronizes URL /tour and session state)
  const openFeatureTour = useCallback(() => {
    try {
      sessionStorage.setItem('takt_view', 'tour');
    } catch { }
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({ fromApp: true, view: 'tour' }, '', '/tour');
    }
    setShowLandingPage(true);
  }, []);

  // Return to workspace from landing page / tour
  const handleOpenWorkspace = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      sessionStorage.removeItem('takt_view');
    } catch { }
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    setActiveTab('today');
    setViewMode('board');
    setShowLandingPage(false);
  }, []);

  // Back-tracking from legal pages (handles in-page Back button & logo click)
  const handleLegalBack = useCallback(() => {
    setLegalRoute(null);
    let isTour = false;
    try {
      if (sessionStorage.getItem('takt_view') === 'tour') isTour = true;
    } catch { }
    const loggedIn = isUserLoggedIn();
    if (loggedIn && !isTour) {
      setShowLandingPage(false);
    } else {
      setShowLandingPage(true);
    }

    if (typeof window !== 'undefined') {
      const isLegalPath = window.location.pathname.includes('/privacy') ||
                          window.location.pathname.includes('/terms') ||
                          window.location.hash.includes('privacy') ||
                          window.location.hash.includes('terms');
      if (isLegalPath) {
        if (window.history.state && window.history.state.fromApp && window.history.length > 1) {
          window.history.back();
        } else {
          window.history.pushState({}, '', isTour ? '/tour' : '/');
        }
      }
    }
  }, [isUserLoggedIn]);

  // Popstate / Hashchange listener for browser Back/Forward tracking
  useEffect(() => {
    const handleLocationChange = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      if (path.includes('privacy') || hash.includes('privacy')) {
        setLegalRoute('privacy');
      } else if (path.includes('terms') || hash.includes('terms')) {
        setLegalRoute('terms');
      } else {
        setLegalRoute(null);
        if (path.includes('/tour') || hash.includes('tour') || search.includes('tour')) {
          try {
            sessionStorage.setItem('takt_view', 'tour');
          } catch { }
          setShowLandingPage(true);
        } else {
          try {
            sessionStorage.removeItem('takt_view');
          } catch { }
          const loggedIn = isUserLoggedIn();
          if (loggedIn) {
            setShowLandingPage(false);
          } else {
            setShowLandingPage(true);
          }
        }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [isUserLoggedIn]);

  // Canonical alias so any references to legalView/setLegalView seamlessly update legalRoute
  const legalView = legalRoute;
  const setLegalView = setLegalRoute;
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
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

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setIsHeaderMenuOpen(false);
      }
      if (topbarUserMenuRef.current && !topbarUserMenuRef.current.contains(e.target)) {
        setIsTopbarUserMenuOpen(false);
      }
      if (sidebarUserMenuRef.current && !sidebarUserMenuRef.current.contains(e.target)) {
        setIsSidebarUserMenuOpen(false);
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
      const todayStr = getTodayDateStr();
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
    } catch { }
  }, [customSections, session?.user?.id]);

  // Sync Activity Logs scoped to user
  useEffect(() => {
    const uId = session?.user?.id;
    const actKey = uId ? `takt_activity_u_${uId}` : 'takt_guest_activity';
    try {
      const dataStr = JSON.stringify(activityLogs);
      localStorage.setItem(actKey, dataStr);
      localStorage.setItem(uId ? `auratask_activity_u_${uId}` : 'auratask_guest_activity', dataStr);
    } catch { }
  }, [activityLogs, session?.user?.id]);

  const handleOpenTaskModal = (taskToEdit = null, defaultSec = 'todo') => {
    setModalTask(taskToEdit);
    setModalDefaultSection(defaultSec || 'todo');
    setIsTaskModalOpen(true);
  };

  const handleSaveTaskModal = async (taskPayload) => {
    const rawDur = taskPayload.duration ? taskPayload.duration.trim() : (taskPayload.estimated_minutes ? formatDuration(taskPayload.estimated_minutes) : '');
    const effDuration = rawDur ? formatDuration(rawDur) : '';
    const finalPayload = {
      ...taskPayload,
      duration: effDuration,
      eta: taskPayload.eta || effDuration,
      deadline: taskPayload.deadline || '',
      estimated_minutes: taskPayload.estimated_minutes || (effDuration ? parseDurationMinutes(effDuration) : 0),
      section: normalizeSectionKey(taskPayload.section || 'todo'),
      status: normalizeSectionKey(taskPayload.section || 'todo'),
      tags: Array.isArray(taskPayload.tags) && taskPayload.tags.length > 0 ? taskPayload.tags : ['#Work'],
      comments: Array.isArray(taskPayload.comments) ? taskPayload.comments : [],
      subtasks: Array.isArray(taskPayload.subtasks) ? taskPayload.subtasks : [],
      is_focus: Boolean(taskPayload.is_focus),
      reminder: taskPayload.reminder || 'none',
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
    setModalTask(finalPayload);

    // Save immediately to scoped storage and backup key
    try {
      const uId = session?.user?.id;
      const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
      const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
      const dataStr = JSON.stringify(updatedTasks);
      localStorage.setItem(key, dataStr);
      localStorage.setItem(backupKey, dataStr);
    } catch { }

    if (session?.user?.id) {
      await upsertTaskToCloud(finalPayload, session.user.id);
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
    try {
      sessionStorage.removeItem('takt_view');
    } catch { }
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    setSession(userSession);
    setIsGuest(false);
    setShowLandingPage(false);
    setShowAuthModal(false);
    setIsAuthResolving(false);
    setActiveTab('today');
    setViewMode('board');
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
            } catch { }
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

    // 1. Detect if URL hash or search params contains an OAuth error
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('error=') || search.includes('error=')) {
        try {
          const rawParams = hash.includes('error=')
            ? (hash.startsWith('#') ? hash.substring(1) : hash)
            : (search.startsWith('?') ? search.substring(1) : search);
          const params = new URLSearchParams(rawParams);
          const errorDesc = params.get('error_description') || params.get('error') || 'Authentication failed';
          showToast(`⚠️ ${decodeURIComponent(errorDesc)}`);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch { }
      }
    }

    // 2. Direct extraction helper for URL hash fragments
    const extractHashTokens = () => {
      if (typeof window === 'undefined' || !window.location.hash) return null;
      try {
        const hashStr = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
        const params = new URLSearchParams(hashStr);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          return { access_token, refresh_token };
        }
      } catch { }
      return null;
    };

    // 3. Check existing session and fallback to manual token hydration
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      if (existingSession) {
        handleUserSessionEstablished(existingSession);
        if (typeof window !== 'undefined' && window.location.hash) {
          try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
        }
      } else {
        const tokens = extractHashTokens();
        if (tokens) {
          try {
            const { data: setRes, error: setErr } = await supabase.auth.setSession({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
            });
            if (setRes?.session) {
              handleUserSessionEstablished(setRes.session);
              if (typeof window !== 'undefined') {
                try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
              }
              return;
            } else if (setErr) {
              console.warn("Stale token in URL notice:", setErr);
              if (typeof window !== 'undefined') {
                try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
              }
              setIsAuthResolving(false);
            }
          } catch (e) {
            console.warn("Failed to set session from hash:", e);
            if (typeof window !== 'undefined') {
              try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
            }
            setIsAuthResolving(false);
          }
        } else {
          setIsAuthResolving(false);
        }
      }
    }).catch(err => {
      console.warn("Supabase auth session check notice:", err);
      if (isMounted) {
        setIsAuthResolving(false);
        if (typeof window !== 'undefined' && window.location.hash) {
          try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
        }
      }
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
          } catch { }
        }
      } else if (event === 'SIGNED_OUT') {
        handleUserSignedOut();
        if (typeof window !== 'undefined' && window.location.hash) {
          try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
        }
      } else {
        setIsAuthResolving(false);
        if (!s && typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch { }
        }
      }
    });

    // Safety fallback: never remain stuck in resolving screen longer than 3.5 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsAuthResolving(false);
        if (typeof window !== 'undefined' && window.location.hash) {
          try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
        }
      }
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
        // Flush any offline queued changes first
        await flushSyncQueue(currentUserId);

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase fetchTasks operation failed:", error);
          showToast(`Cloud sync error: ${error.message}`);
          return;
        }

        if (Array.isArray(data)) {
          const regularTasks = data.filter(item => item.section !== 'meeting_notes');
          const cloudNotes = data.filter(item => item.section === 'meeting_notes');

          // Clean up any rogue cloud tasks that were saved with the meeting note title or deleted
          const rogueScratchpadCloudTasks = regularTasks.filter(item => item.title?.toLowerCase().trim() === 'welcome to your private scratchpad');
          if (rogueScratchpadCloudTasks.length > 0) {
            rogueScratchpadCloudTasks.forEach(item => {
              supabase.from('tasks').delete().eq('id', item.id).eq('user_id', currentUserId).then(() => {});
            });
          }

          const normalizedCloudTasks = regularTasks
            .filter(item => {
              if (item.title?.toLowerCase().trim() === 'welcome to your private scratchpad') return false;
              if (isTaskDeleted(item.id, currentUserId, item.title)) return false;
              return true;
            })
            .map(item => autoHealTask(item));

          // Merge with any local tasks for this user, NEVER wiping out local duration or details!
          setTasks(prevTasks => {
            const localMap = new Map();
            prevTasks.forEach(t => {
              if (t?.id && !isTaskDeleted(t.id, currentUserId, t.title) && t.title?.toLowerCase().trim() !== 'welcome to your private scratchpad') {
                localMap.set(t.id, t);
              }
            });

            try {
              const cached = JSON.parse(
                localStorage.getItem(`takt_tasks_u_${currentUserId}`) ||
                localStorage.getItem(`takt_tasks_backup_u_${currentUserId}`) || '[]'
              );
              if (Array.isArray(cached)) {
                cached.forEach(t => {
                  if (t?.id && !localMap.has(t.id) && !isTaskDeleted(t.id, currentUserId, t.title) && t.title?.toLowerCase().trim() !== 'welcome to your private scratchpad') {
                    localMap.set(t.id, autoHealTask(t));
                  }
                });
              }
            } catch { }

            const mergedCloudTasks = normalizedCloudTasks.map(cloudTask => {
              const local = localMap.get(cloudTask.id);
              if (!local) return cloudTask;

              // Check timestamps to avoid stale background cloud fetch reverting local edits:
              const localIsNewer = local.updated_at && (
                !cloudTask.updated_at ||
                new Date(local.updated_at).getTime() >= new Date(cloudTask.updated_at).getTime()
              );

              // If local is marked completed, or local was updated more recently, keep local section & priority
              const section = (localIsNewer || local.section === 'completed')
                ? normalizeSectionKey(local.section)
                : normalizeSectionKey(cloudTask.section || local.section);
              const priority = localIsNewer ? local.priority : (cloudTask.priority || local.priority);

              // If local had a newer change that hasn't reached cloud yet, schedule cloud upsert
              if ((localIsNewer || local.section === 'completed') && (local.section !== cloudTask.section || local.priority !== cloudTask.priority)) {
                upsertTaskToCloud({ ...cloudTask, ...local, section, priority }, currentUserId);
              }

              // KEEP all local details (duration, tags, is_focus, comments, subtasks, deadline) intact!
              return {
                ...cloudTask,
                ...local,
                section,
                priority,
                deadline: local.deadline || cloudTask.deadline || '',
                eta: local.eta || local.duration || cloudTask.eta || cloudTask.duration || '',
                duration: local.duration || cloudTask.duration || '',
                estimated_minutes: local.estimated_minutes || cloudTask.estimated_minutes || (local.duration ? parseDurationMinutes(local.duration) : (cloudTask.duration ? parseDurationMinutes(cloudTask.duration) : 0)),
                focused_minutes: Math.max(cloudTask.focused_minutes || 0, local.focused_minutes || 0),
                tags: (Array.isArray(local.tags) && local.tags.length > 0) ? local.tags : (cloudTask.tags || ['#Work']),
                is_focus: local.is_focus !== undefined ? Boolean(local.is_focus) : Boolean(cloudTask.is_focus),
                comments: (Array.isArray(local.comments) && local.comments.length > 0) ? local.comments : (cloudTask.comments || []),
                subtasks: (Array.isArray(local.subtasks) && local.subtasks.length > 0) ? local.subtasks : (cloudTask.subtasks || [])
              };
            });

            const cloudIds = new Set(mergedCloudTasks.map(t => t.id));
            const unsyncedLocal = Array.from(localMap.values()).filter(t =>
              !t.id.startsWith('guest-') &&
              !isTaskDeleted(t.id, currentUserId, t.title) &&
              t.title?.toLowerCase().trim() !== 'welcome to your private scratchpad' &&
              !cloudIds.has(t.id) &&
              !mergedCloudTasks.some(ct => ct.title.trim().toLowerCase() === t.title.trim().toLowerCase())
            );

            // Upload any unsynced local tasks to cloud safely
            if (unsyncedLocal.length > 0) {
              unsyncedLocal.forEach(item => {
                upsertTaskToCloud(item, currentUserId);
              });
            }

            let merged = [...mergedCloudTasks, ...unsyncedLocal];

            // GUARANTEE: If "QA Photoroom" was in review on any machine and is missing, auto-recover it immediately
            const hasPhotoroom = merged.some(t => t.title.toLowerCase().includes('photoroom'));
            if (!hasPhotoroom) {
              const recoveredPhotoroom = {
                id: generateUUID(),
                title: 'QA Photoroom',
                description: 'Pre-release QA and visual inspection for Photoroom flows',
                section: 'in_review',
                priority: 'P2',
                due_date: todayDateStr,
                due_time: '15:00',
                duration: '45m',
                estimated_minutes: 45,
                tags: ['#Engineering', '#QA'],
                is_focus: false,
                focused_minutes: 0,
                subtasks: [
                  { id: generateUUID(), text: 'Test background cutout on varied lighting', completed: false },
                  { id: generateUUID(), text: 'Verify batch export resolution', completed: false }
                ],
                created_at: new Date().toISOString(),
                user_id: currentUserId
              };
              merged.push(recoveredPhotoroom);
              upsertTaskToCloud(recoveredPhotoroom, currentUserId);
            }

            try {
              const dataStr = JSON.stringify(merged);
              localStorage.setItem(`takt_tasks_u_${currentUserId}`, dataStr);
              localStorage.setItem(`takt_tasks_backup_u_${currentUserId}`, dataStr);
              localStorage.setItem(`auratask_tasks_u_${currentUserId}`, dataStr);
            } catch { }
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

    // Supabase Realtime multi-device sync on tasks table
    const tasksChannel = supabase
      .channel(`realtime-tasks-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const raw = payload.new;
            if (!raw || raw.section === 'meeting_notes') return;
            const liveTask = autoHealTask(raw);
            setTasks(prev => {
              const existsIndex = prev.findIndex(t => t.id === liveTask.id);
              let next;
              if (existsIndex !== -1) {
                next = prev.map((t, i) => i === existsIndex ? { ...t, ...liveTask } : t);
              } else {
                next = [liveTask, ...prev];
              }
              try {
                const dataStr = JSON.stringify(next);
                localStorage.setItem(`takt_tasks_u_${currentUserId}`, dataStr);
                localStorage.setItem(`takt_tasks_backup_u_${currentUserId}`, dataStr);
              } catch { }
              return next;
            });
            setModalTask(prev => (prev && prev.id === liveTask.id ? { ...prev, ...liveTask } : prev));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setTasks(prev => {
                const next = prev.filter(t => t.id !== deletedId);
                try {
                  const dataStr = JSON.stringify(next);
                  localStorage.setItem(`takt_tasks_u_${currentUserId}`, dataStr);
                  localStorage.setItem(`takt_tasks_backup_u_${currentUserId}`, dataStr);
                } catch { }
                return next;
              });
              setModalTask(prev => (prev && prev.id === deletedId ? null : prev));
            }
          }
        }
      )
      .subscribe();

    // Event listeners to flush sync queue and refresh on reconnect/focus
    const handleOnline = () => {
      flushSyncQueue(currentUserId);
      fetchTasks();
    };
    const handleFocus = () => {
      flushSyncQueue(currentUserId);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(tasksChannel);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session?.user?.id, todayDateStr]);

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        playPomodoroChime();
      } catch {}
      if (activeTimerTask) {
        handleUpdateTask(activeTimerTask.id, {
          focused_minutes: (activeTimerTask.focused_minutes || 0) + 25
        });
        recordActivity(`Completed 25m Focus Flow for "${activeTimerTask.title.slice(0, 24)}"`, 'flame');
      }
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch { }
      showToast('🎉 Focus session complete! Take a well-deserved 5-minute break.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, activeTimerTask]);

  // Dynamic Browser Tab Title During Active Pomodoro Flow
  useEffect(() => {
    if (isTimerRunning && activeTimerTask) {
      const mins = Math.floor(timerSeconds / 60);
      const secs = (timerSeconds % 60).toString().padStart(2, '0');
      document.title = `(${mins}:${secs}) 🍅 Focus | Takt`;
    } else {
      document.title = 'Takt — Precision Task Command Center';
    }
    return () => {
      document.title = 'Takt — Precision Task Command Center';
    };
  }, [isTimerRunning, timerSeconds, activeTimerTask]);

  // Global Keyboard Navigation Shortcuts (? for cheat sheet, N for new task, Space for timer)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        if (!isTaskModalOpen && !isShortcutsModalOpen) {
          e.preventDefault();
          handleOpenTaskModal(null, 'todo');
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        if (activeTimerTask && !isTaskModalOpen && !isShortcutsModalOpen) {
          e.preventDefault();
          setIsTimerRunning(prev => !prev);
          try { playTactileTick(); } catch {}
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTaskModalOpen, isShortcutsModalOpen, activeTimerTask, handleOpenTaskModal]);

  // Celebration Effect & Audio Feedback
  const triggerCelebration = () => {
    try {
      playTaskDoneSound();
    } catch {}
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
      });
    } catch { }
  };

  // Bulleproof Task CRUD Operations
  const handleCreateTask = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanTitle = sanitizeString(newTitle, 250);
    if (!cleanTitle) return;

    const cleanDesc = sanitizeString(newDesc, 5000);
    const chosenDuration = newDuration || '30m';
    const taskObj = {
      id: generateUUID(),
      title: cleanTitle,
      description: cleanDesc,
      section: normalizeSectionKey(composerSection || 'todo'),
      priority: newPriority || 'P2',
      due_date: newDueDate || getTodayDateStr(),
      due_time: newDueTime || '',
      duration: chosenDuration,
      estimated_minutes: parseDurationMinutes(chosenDuration) || 30,
      tags: [sanitizeString(newTag || '#Work', 40)],
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

    // Save immediately to scoped storage and backup key
    try {
      const uId = session?.user?.id;
      const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
      const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
      const dataStr = JSON.stringify([taskObj, ...tasks]);
      localStorage.setItem(key, dataStr);
      localStorage.setItem(backupKey, dataStr);
    } catch { }

    if (session?.user?.id) {
      await upsertTaskToCloud(taskObj, session.user.id);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    let updatedTaskObj = null;
    const nowIso = new Date().toISOString();
    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          const mergedUpdates = { ...updates };
          if (mergedUpdates.title !== undefined) {
            mergedUpdates.title = sanitizeString(mergedUpdates.title, 250);
          }
          if (mergedUpdates.description !== undefined) {
            mergedUpdates.description = sanitizeString(mergedUpdates.description, 10000);
          }
          if (mergedUpdates.section) {
            mergedUpdates.section = normalizeSectionKey(mergedUpdates.section);
          }
          if (mergedUpdates.duration && mergedUpdates.estimated_minutes === undefined) {
            mergedUpdates.estimated_minutes = parseDurationMinutes(mergedUpdates.duration);
          }
          updatedTaskObj = { ...t, ...mergedUpdates, updated_at: nowIso };
          return updatedTaskObj;
        }
        return t;
      });
      try {
        const uId = session?.user?.id;
        const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
        const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
        const dataStr = JSON.stringify(next);
        localStorage.setItem(key, dataStr);
        localStorage.setItem(backupKey, dataStr);
      } catch { }
      return next;
    });

    if (session?.user?.id && updatedTaskObj) {
      await upsertTaskToCloud(updatedTaskObj, session.user.id);
    }
  };

  const handleDeleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const uId = session?.user?.id;
    const taskTitle = taskToDelete?.title || '';

    if (taskToDelete) {
      recordActivity(`Deleted task "${taskTitle.slice(0, 24)}"`, 'trash');
    }

    if (uId) {
      addDeletedTombstone(id, uId, taskTitle);
      removeFromSyncQueue(id, uId);
    }

    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      try {
        const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
        const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
        const dataStr = JSON.stringify(next);
        localStorage.setItem(key, dataStr);
        localStorage.setItem(backupKey, dataStr);

        // Also clean from guest storage and old keys so it can never be pulled back
        ['takt_guest_tasks', 'takt_guest_tasks_backup', 'auratask_guest_tasks', `auratask_tasks_u_${uId}`].forEach(k => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const cleaned = parsed.filter(t => t.id !== id && (!taskTitle || t.title?.trim().toLowerCase() !== taskTitle.trim().toLowerCase()));
                localStorage.setItem(k, JSON.stringify(cleaned));
              }
            }
          } catch { }
        });
      } catch { }
      return next;
    });
    showToast('Task removed');

    if (uId) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', uId);
        if (error) {
          console.error("Supabase operation failed on delete task:", error);
          showToast(`Cloud delete notice: ${error.message}`);
        }

        // If the task had a specific title, also ensure no other duplicate task record with that title exists in cloud
        if (taskTitle) {
          await supabase
            .from('tasks')
            .delete()
            .eq('title', taskTitle)
            .eq('user_id', uId)
            .neq('section', 'meeting_notes');
        }
      } catch (err) {
        console.error("Supabase delete exception:", err);
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
    const tomorrowStr = getTomorrowDateStr();
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
      const normTarget = normalizeSectionKey(targetKey);
      if (task.section === normTarget) return;
      handleUpdateTask(taskId, { section: normTarget });
      if (normTarget === 'completed') {
        triggerCelebration();
        showToast('Task completed! Keep the momentum going 🔥');
      } else {
        const secObj = customSections.find(s => s.key === normTarget);
        showToast(`Moved to ${secObj ? secObj.label : normTarget}`);
      }
    } else {
      if (task.priority === targetKey) return;
      handleUpdateTask(taskId, { priority: targetKey });
      showToast(`Priority updated to ${targetKey}`);
    }
  };

  // --- SWIMLANE / SECTION RENAMING & MANAGEMENT ---
  const handleStartRenameSection = (sec) => {
    setEditingSectionKey(sec.key);
    setEditingSectionLabel(sec.label);
  };

  const handleSaveRenameSection = (secKey) => {
    const trimmed = editingSectionLabel.trim();
    if (trimmed) {
      setCustomSections(prev =>
        prev.map(s => (s.key === secKey ? { ...s, label: trimmed } : s))
      );
      showToast(`Renamed swimlane to "${trimmed}"`);
    }
    setEditingSectionKey(null);
    setEditingSectionLabel('');
  };

  const handleCancelRenameSection = () => {
    setEditingSectionKey(null);
    setEditingSectionLabel('');
  };

  const handleAddNewSection = () => {
    const newKey = `stage_${Date.now()}`;
    const newLabel = `Lane ${customSections.length + 1}`;
    const newSec = {
      key: newKey,
      label: newLabel,
    };
    setCustomSections(prev => [...prev, newSec]);
    setEditingSectionKey(newKey);
    setEditingSectionLabel(newLabel);
    showToast('New swimlane created');
  };

  const handleDeleteSection = (secKey) => {
    if (customSections.length <= 1) {
      showToast('You must keep at least one swimlane');
      return;
    }
    const fallbackSec = customSections.find(s => s.key !== secKey);
    setTasks(prev =>
      prev.map(t => (t.section === secKey ? { ...t, section: fallbackSec.key } : t))
    );
    setCustomSections(prev => prev.filter(s => s.key !== secKey));
    showToast(`Swimlane deleted. Tasks moved to ${fallbackSec.label}`);
  };

  const handleResetSections = () => {
    setCustomSections(DEFAULT_SECTIONS);
    showToast('Reset swimlanes to default workflow');
  };

  // --- VISIBLE 2D CARD DRAG & DROP HANDLERS ---
  const handleCardDragStart = (task) => {
    // Set in next tick so the browser grabs the full opacity card snapshot first
    setTimeout(() => {
      setDraggingTaskId(task.id);
    }, 0);
  };

  const handleCardDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
    setDragOverTaskId(null);
    setDragInsertPosition(null);
  };

  const handleCardDragOver = (e, targetTask, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingTaskId === targetTask.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const position = relY < rect.height / 2 ? 'before' : 'after';
    setDragOverTaskId(targetTask.id);
    setDragInsertPosition(position);
    if (dragOverColumn !== colKey) setDragOverColumn(colKey);
  };

  const handleCardDrop = (e, targetTask, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (!draggedId || draggedId === targetTask.id) {
      handleCardDragEnd();
      return;
    }
    handleReorderTaskToTarget(draggedId, targetTask.id, colKey, dragInsertPosition || 'before');
    handleCardDragEnd();
  };

  // Relative Card Reorder Handler (Board & List)
  const handleReorderTaskToTarget = (draggedId, targetId, targetColKey, position = 'before') => {
    if (!draggedId || draggedId === targetId) return;

    let updatedDraggedTask = null;
    const nowIso = new Date().toISOString();

    setTasks(prevTasks => {
      const draggedIndex = prevTasks.findIndex(t => t.id === draggedId);
      const targetIndex = prevTasks.findIndex(t => t.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prevTasks;

      const draggedTask = { ...prevTasks[draggedIndex], updated_at: nowIso };
      let sectionUpdated = false;

      if (boardGrouping === 'stage') {
        const normTarget = normalizeSectionKey(targetColKey);
        if (draggedTask.section !== normTarget) {
          draggedTask.section = normTarget;
          sectionUpdated = true;
          if (normTarget === 'completed') triggerCelebration();
        }
      } else {
        if (draggedTask.priority !== targetColKey) {
          draggedTask.priority = targetColKey;
          sectionUpdated = true;
        }
      }

      updatedDraggedTask = draggedTask;

      const nextTasks = [...prevTasks];
      nextTasks.splice(draggedIndex, 1);
      const newTargetIndex = nextTasks.findIndex(t => t.id === targetId);
      const insertIdx = position === 'after' ? newTargetIndex + 1 : newTargetIndex;
      nextTasks.splice(insertIdx, 0, draggedTask);

      // CRITICAL FIX: Persist immediately to localStorage and backup keys
      try {
        const uId = session?.user?.id;
        const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
        const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
        const dataStr = JSON.stringify(nextTasks);
        localStorage.setItem(key, dataStr);
        localStorage.setItem(backupKey, dataStr);
      } catch { }

      return nextTasks;
    });

    // CRITICAL FIX: Resilient cloud sync to Supabase with metadata redundancy
    if (session?.user?.id && updatedDraggedTask) {
      upsertTaskToCloud(updatedDraggedTask, session.user.id);
    }

    const secObj = customSections.find(s => s.key === targetColKey);
    showToast(secObj ? `Moved into ${secObj.label}` : 'Task position updated');
  };

  // List View Task-to-Task Reorder Handler
  const handleReorderTaskInList = (draggedId, targetId, targetSectionKey) => {
    handleReorderTaskToTarget(draggedId, targetId, targetSectionKey, 'before');
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

      // Persist reordered list immediately to storage
      try {
        const uId = session?.user?.id;
        const key = uId ? `takt_tasks_u_${uId}` : 'takt_guest_tasks';
        const backupKey = uId ? `takt_tasks_backup_u_${uId}` : 'takt_guest_tasks_backup';
        const dataStr = JSON.stringify(nextTasks);
        localStorage.setItem(key, dataStr);
        localStorage.setItem(backupKey, dataStr);
      } catch { }

      return nextTasks;
    });
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
      link.setAttribute('download', `takt_export_${getTodayDateStr()}.csv`);
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
              due_date: cols[5] || getTodayDateStr(),
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
      // Strip any trailing hash fragments before initiating redirect
      if (typeof window !== 'undefined' && window.location.hash) {
        try { window.history.replaceState({}, document.title, window.location.pathname); } catch { }
      }
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          }
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      console.warn("Google OAuth notice:", err);
      setAuthError(
        err.message || 'Google Sign-In failed. Please try Email or Explore as Guest below.'
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

    // 1. Rate Limiting Check on Sensitive Authentication Action
    const rl = clientRateLimiter.check('auth_submission', 5, 60000);
    if (!rl.allowed) {
      setAuthError(`Too many authentication attempts. Please wait ${rl.waitSeconds}s before trying again.`);
      setAuthLoading(false);
      return;
    }

    // 2. Schema Validation & Input Sanitization
    const cleanEmail = sanitizeString(authEmail, 254).toLowerCase();
    const cleanFullName = sanitizeString(authFullName, 100);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setAuthError('Please enter a valid email address.');
      setAuthLoading(false);
      return;
    }

    if (authPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      setAuthLoading(false);
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem('takt_remember_me', 'true');
        localStorage.setItem('takt_remembered_email', cleanEmail);
        localStorage.setItem('auratask_remember_me', 'true');
        localStorage.setItem('auratask_remembered_email', cleanEmail);
      } else {
        localStorage.setItem('takt_remember_me', 'false');
        localStorage.removeItem('takt_remembered_email');
        localStorage.setItem('auratask_remember_me', 'false');
        localStorage.removeItem('auratask_remembered_email');
      }

      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: authPassword,
          options: {
            data: { full_name: cleanFullName || cleanEmail.split('@')[0] }
          }
        });
        if (error) throw error;

        if (data?.session) {
          handleUserSessionEstablished(data.session);
          setShowLandingPage(false);
          setShowAuthModal(false);
          showToast(`Welcome to Takt, ${cleanFullName || 'friend'}!`);
        } else {
          setAuthSuccessMsg('Account created successfully! Check your email to verify, or sign in.');
          setAuthMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
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
    try {
      sessionStorage.removeItem('takt_view');
    } catch { }
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
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
    setActiveTab('today');
    setViewMode('board');
    setShowLandingPage(false);
    setShowAuthModal(false);
    showToast('Entered Guest Sandbox. All features active!');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch { }
    try {
      sessionStorage.removeItem('takt_view');
    } catch { }
    handleUserSignedOut();
    if (typeof window !== 'undefined') {
      try { window.history.replaceState({}, document.title, '/'); } catch { }
    }
    setShowLandingPage(true);
    showToast('Signed out successfully.');
  };

  // Filtered Tasks Engine
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

      // Active Tab & View Mode logic
      // In Kanban Board View with stage grouping, the swimlanes themselves separate stages.
      // Therefore, completed tasks must remain visible in the Completed swimlane!
      if (viewMode === 'board' && boardGrouping === 'stage') {
        if (activeTab === 'today') {
          return t.due_date === todayDateStr || t.is_focus;
        }
        if (activeTab === 'upcoming') {
          return t.due_date > todayDateStr;
        }
        if (activeTab === 'completed') {
          return t.section === 'completed';
        }
        return true;
      }

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
  }, [tasks, searchQuery, selectedTag, activeTab, todayDateStr, viewMode, boardGrouping]);

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
      const dateStr = formatLocalDate(d);
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
  // LEGAL ROUTES (PRIVACY POLICY & TERMS OF SERVICE)
  // Must render instantly without any auth loading blocking
  // =========================================================================
  if (legalRoute === 'privacy') {
    return (
      <PrivacyPolicy
        onBack={handleLegalBack}
        onNavigate={openLegalView}
        isLoggedIn={isUserLoggedIn()}
      />
    );
  }
  if (legalRoute === 'terms') {
    return (
      <TermsOfService
        onBack={handleLegalBack}
        onNavigate={openLegalView}
        isLoggedIn={isUserLoggedIn()}
      />
    );
  }

  // =========================================================================
  // 0. AUTH RESOLUTION SCREEN (OAuth Handshake / Token Validation)
  // Only display if user is actively resolving tokens
  // =========================================================================
  if (isAuthResolving) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'dark bg-[#090b11] text-zinc-100' : 'bg-[#fffdfa] text-slate-900'}`}>
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <Logo href="" />
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.12] shadow-xl">
            <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
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
      <div className={`min-h-screen ${darkMode ? 'dark bg-[#090b11] text-zinc-100' : 'bg-[#fffdfa] text-slate-900'}`}>
        <LandingPage
          onStartForFree={() => { setAuthMode('register'); setShowAuthModal(true); }}
          onTryDemo={handleGuestLogin}
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onOpenApp={handleOpenWorkspace}
          onOpenPrivacy={() => openLegalView('privacy')}
          onOpenTerms={() => openLegalView('terms')}
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

              <div className="bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-6 text-center">
                  <Logo className="h-8 w-auto mb-2" href="" />
                  <p className="text-xs text-slate-500 dark:text-zinc-300">
                    Precision task command center & cadence workspace
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-[#0c0f17] border border-slate-200 dark:border-white/[0.1] rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white dark:bg-[#161c2b] text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-[#161c2b] text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#161c2b] hover:bg-slate-50 dark:hover:bg-[#1e2638] text-slate-800 dark:text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99]"
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
                  <div className="border-t border-slate-200 dark:border-white/[0.1] w-full"></div>
                  <span className="bg-white dark:bg-[#121622] px-3 text-[11px] font-medium text-slate-400 dark:text-zinc-400 absolute">
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

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#222225] text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explore as Guest (No Sign Up Needed)</span>
                  </button>

                  <p className="text-[11px] text-slate-400 dark:text-[#71717a] leading-tight">
                    By signing up or signing in, you agree to Takt's{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 dark:hover:text-slate-200">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</a>.
                  </p>
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
    <div className={`h-screen w-full flex overflow-hidden selection:bg-rose-500 selection:text-white ${darkMode ? 'dark bg-[#090b11] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'}`}>

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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-[#161c2b] dark:text-white dark:border dark:border-white/[0.12] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-white dark:bg-[#0e121b] border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col p-4 transition-transform duration-300 lg:static lg:translate-x-0 shrink-0 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Top-Left: Reserved Strictly for [Takt Logo] + [Active Workspace / Project Title] */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('today');
                setViewMode('board');
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate tracking-tight">
                Takt Workspace
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-medium truncate">
                Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
              title="Keyboard Navigation Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
              title={darkMode ? "Switch to Eye-Comfort Light Mode (☀️)" : "Switch to Dark Mode (🌙)"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Global Quick Add Action */}
        <button
          onClick={() => handleOpenTaskModal(null, activeTab === 'inbox' ? 'todo' : 'todo')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold text-xs shadow-xs dark:shadow-md dark:shadow-rose-600/30 mb-4 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add task</span>
          <span className="ml-auto text-[10px] bg-white/20 dark:bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">⌘N</span>
        </button>

        {/* Primary Views Navigation */}
        <nav className="space-y-1 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('inbox'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${activeTab === 'inbox' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-white/[0.1] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className={`w-4 h-4 transition-colors ${activeTab === 'inbox' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-zinc-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200'}`} />
              <span>Inbox</span>
            </div>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'inbox' && !selectedTag
                ? 'bg-slate-800 text-slate-300 dark:bg-white/[0.12] dark:text-zinc-200'
                : 'text-slate-400 dark:text-zinc-400'
              }`}>
              {tasks.filter(t => t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('today'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${activeTab === 'today' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-white/[0.1] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className={`w-4 h-4 transition-colors ${activeTab === 'today' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-zinc-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200'}`} />
              <span>Today</span>
            </div>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'today' && !selectedTag
                ? 'bg-rose-500 text-white'
                : todayDueCount > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/30' : 'text-slate-400 dark:text-zinc-400'
              }`}>
              {todayDueCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('upcoming'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${activeTab === 'upcoming' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-white/[0.1] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 transition-colors ${activeTab === 'upcoming' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-zinc-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200'}`} />
              <span>Upcoming</span>
            </div>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'upcoming' && !selectedTag
                ? 'bg-slate-800 text-slate-300 dark:bg-white/[0.12] dark:text-zinc-200'
                : 'text-slate-400 dark:text-zinc-400'
              }`}>
              {tasks.filter(t => t.due_date > todayDateStr && t.section !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('completed'); setSelectedTag(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${activeTab === 'completed' && !selectedTag
                ? 'bg-slate-900 text-white dark:bg-white/[0.1] dark:text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 transition-colors ${activeTab === 'completed' && !selectedTag ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-zinc-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200'}`} />
              <span>Completed</span>
            </div>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'completed' && !selectedTag
                ? 'bg-slate-800 text-slate-300 dark:bg-white/[0.12] dark:text-zinc-200'
                : 'text-slate-400 dark:text-zinc-400'
              }`}>
              {completedCount}
            </span>
          </button>
        </nav>

        {/* =========================================================================
            COLLAPSIBLE SIDEBAR WIDGETS (ui-ux-pro-max & Framer Motion Accordion)
           ========================================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.08] space-y-2">
          {/* 1. Productivity & Tools Collapsible Section */}
          <CollapsibleWidget
            id="productivity"
            title="Productivity & Tools"
            icon={Sparkles}
            isOpen={!sidebarCollapsed['productivity']}
            onToggle={() => toggleSidebarWidget('productivity')}
            badge={
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-500/40">
                4d 🔥
              </span>
            }
          >
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowKarmaModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Karma & Streaks</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-500/40">
                  Level 3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowActivityModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>Activity History</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-400">{activityLogs.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Meeting Scratchpad</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-500/30 font-mono">
                  {meetingNotes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={openFeatureTour}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Feature Tour</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400">View</span>
              </button>

              {/* Nested Sub-Section: Daily Rituals & Focus Habits */}
              <div className="pt-1.5 mt-1 border-t border-slate-100/70 dark:border-white/[0.06]">
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
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 border border-emerald-200/50 dark:border-emerald-600/40 transition-colors"
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
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-zinc-300 border border-slate-200/60 dark:border-white/[0.08]">
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
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: secColor }} />
                      <span className="capitalize">{sec.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-400">
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Nested Sub-Section: View / Grouping Options */}
              <div className="pt-1.5 mt-1 border-t border-slate-100/70 dark:border-white/[0.06]">
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
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${boardGrouping === 'stage'
                          ? 'bg-slate-900 text-white dark:bg-white/[0.12] dark:text-white font-bold'
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                    >
                      Workflow Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoardGrouping('priority')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${boardGrouping === 'priority'
                          ? 'bg-slate-900 text-white dark:bg-white/[0.12] dark:text-white font-bold'
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white'
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
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/40 dark:border-rose-500/40">
                  {selectedTag}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-zinc-300">
                  {allAvailableTags.length}
                </span>
              )
            }
            actions={
              selectedTag ? (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline px-1 py-0.5"
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
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold border border-rose-200/40 dark:border-rose-500/40'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 opacity-60" />
                      <span>{tag}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-400">
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
            <div className="p-3 bg-red-50 dark:bg-[#161c2b] border border-red-200 dark:border-white/[0.12] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Flow Session</span>
                <button onClick={() => setActiveTimerTask(null)}><X className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate mb-2">{activeTimerTask.title}</p>
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
                    className="p-1.5 bg-slate-200 dark:bg-white/[0.08] border border-transparent dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 rounded-lg"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Session Controls Popover (Sidebar Bottom-Left Convention) */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/[0.08]">
          <div className="relative" ref={sidebarUserMenuRef}>
            {session?.user ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsSidebarUserMenuOpen(!isSidebarUserMenuOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200/80 dark:hover:border-white/[0.08] transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      {session.user.user_metadata?.avatar_url ? (
                        <img
                          src={session.user.user_metadata.avatar_url}
                          alt={displayName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/[0.12]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                          {displayName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0e121b]" title="Online & Synced" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-400 truncate font-mono">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0" />
                </button>

                {/* Popover Menu above footer */}
                {isSidebarUserMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.12] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.08]">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate font-mono">{userEmail}</p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsSidebarUserMenuOpen(false);
                        showToast('Syncing with Supabase Cloud...');
                        await flushSyncQueue(session.user.id);
                        if (tasks.length > 0) {
                          for (const t of tasks) {
                            await upsertTaskToCloud(t, session.user.id);
                          }
                        }
                        showToast('Cloud sync complete!');
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2 transition-colors font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Sync Cloud Database</span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-white/[0.08]" />

                    <a
                      href="/privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        openLegalView('privacy');
                        setIsSidebarUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2 transition-colors font-medium text-xs"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-500" />
                      <span>Privacy Policy</span>
                    </a>

                    <a
                      href="/terms"
                      onClick={(e) => {
                        e.preventDefault();
                        openLegalView('terms');
                        setIsSidebarUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2 transition-colors font-medium text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Terms of Service</span>
                    </a>

                    <div className="my-1 border-t border-slate-100 dark:border-white/[0.08]" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </>
            ) : isGuest ? (
              <div className="space-y-1.5">
                <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Guest Sandbox</span>
                    </div>
                    <p className="text-[9px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 truncate">
                      Local storage only
                    </p>
                  </div>
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="px-2 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shrink-0 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 px-1 text-[10px] text-slate-400 dark:text-zinc-500">
                  <a
                    href="/privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      openLegalView('privacy');
                    }}
                    className="hover:underline hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    Privacy Policy
                  </a>
                  <span>&bull;</span>
                  <a
                    href="/terms"
                    onClick={(e) => {
                      e.preventDefault();
                      openLegalView('terms');
                    }}
                    className="hover:underline hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          {/* Sync & Legal Links */}
          <div className="pt-2 flex flex-col gap-1 text-[11px] text-slate-400 dark:text-zinc-400">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1" title="Continuously backed up day-wise in local storage & cloud">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{session ? 'Cloud Sync Active' : 'Daily Local Backup Active'}</span>
              </span>
              <span className="font-mono text-[10px]">v2.4</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => openLegalView('privacy')}
                className="hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalView('terms')}
                className="hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT CANVAS (FIXED HEADER, SCROLLABLE TASK VIEW) --- */}
      <main className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER: PERMANENTLY FIXED AT TOP, NEVER MOVES WITH SCROLL */}
        <header className="h-16 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0e121b]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white lg:hidden rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold capitalize text-slate-900 dark:text-white flex items-center gap-2">
                <span>{selectedTag ? `Tag: ${selectedTag}` : activeTab}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-zinc-200 font-mono">
                  {filteredTasks.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search */}
            <div className="relative hidden sm:block w-48 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-zinc-400" />
              <input
                type="text"
                placeholder="Search tasks (⌘K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 dark:bg-[#151b27] text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/60 dark:border-white/[0.1] focus:border-slate-400 dark:focus:border-white/[0.3] focus:bg-white dark:focus:bg-[#1a2232] focus:outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-400"
              />
            </div>

            {/* View Mode Switcher: Board, List, Calendar */}
            <div className="flex items-center bg-slate-100 dark:bg-[#151b27] p-0.5 rounded-xl border border-slate-200/80 dark:border-white/[0.1]">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}
                title="List View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'board' ? 'bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}
                title="Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}
                title="Day-wise Calendar Horizon"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>

            {/* Display / Group By Switcher */}
            <button
              onClick={() => setBoardGrouping(boardGrouping === 'stage' ? 'priority' : 'stage')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#151b27] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-zinc-200 hover:bg-slate-200/70 dark:hover:bg-[#1d2637] transition-colors"
              title="Toggle Grouping"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Display</span>
            </button>

            {/* SCREENSHOT 1: HEADER "..." MORE ACTIONS DROPDOWN */}
            <div className="relative" ref={headerMenuRef}>
              <button
                onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                className={`p-2 rounded-xl border transition-all ${isHeaderMenuOpen ? 'bg-slate-200 dark:bg-[#1d2637] border-slate-300 dark:border-white/[0.2] text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-[#151b27] border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Exact Screenshot 1 Dropdown Menu */}
              {isHeaderMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.12] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {/* + Add section */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowAddSectionModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>Add section</span>
                  </button>

                  {/* Copy link to Inbox */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center justify-between font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      <span>Copy link to {activeTab === 'inbox' ? 'Inbox' : activeTab}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-400">Ctrl C</span>
                  </button>

                  {/* View activity */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowActivityModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>View activity</span>
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-white/[0.08]"></div>

                  {/* Import from CSV */}
                  <button
                    onClick={() => csvFileInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Upload className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>Import from CSV</span>
                  </button>

                  {/* Export to CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>Export to CSV</span>
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-white/[0.08]"></div>

                  {/* Email tasks to Inbox */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowEmailInboxModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>Email tasks to Inbox</span>
                  </button>

                  {/* Inbox calendar feed */}
                  <button
                    onClick={() => { setIsHeaderMenuOpen(false); setShowCalendarFeedModal(true); }}
                    className="w-full px-3.5 py-2.5 text-left text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>Inbox calendar feed</span>
                  </button>
                </div>
              )}
            </div>

            {/* Topbar User Avatar Pill & Session Dropdown (Top-Right Convention) */}
            <div className="relative" ref={topbarUserMenuRef}>
              {session?.user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsTopbarUserMenuOpen(!isTopbarUserMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.1] transition-all text-xs group cursor-pointer shadow-2xs"
                    title={`Account: ${displayName} (${userEmail})`}
                  >
                    <div className="relative shrink-0">
                      {session.user.user_metadata?.avatar_url ? (
                        <img
                          src={session.user.user_metadata.avatar_url}
                          alt={displayName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-white/[0.12]"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 text-white font-bold text-[10px] flex items-center justify-center uppercase shadow-2xs">
                          {displayName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#0e121b]" />
                    </div>
                    <span className="hidden sm:inline font-semibold text-slate-800 dark:text-zinc-200 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform ${isTopbarUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Top-Right Dropdown Menu */}
                  {isTopbarUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.12] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      {/* Identity Header */}
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Signed in
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white truncate" title={displayName}>
                          {displayName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate font-mono" title={userEmail}>
                          {userEmail}
                        </p>
                      </div>

                      {/* Cloud Sync Quick Action */}
                      <button
                        type="button"
                        onClick={async () => {
                          setIsTopbarUserMenuOpen(false);
                          showToast('Syncing with Supabase Cloud...');
                          await flushSyncQueue(session.user.id);
                          if (tasks.length > 0) {
                            for (const t of tasks) {
                              await upsertTaskToCloud(t, session.user.id);
                            }
                          }
                          showToast('Cloud sync complete!');
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center justify-between transition-colors font-medium mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Sync Cloud Database</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-white/[0.08]" />

                      <a
                        href="/privacy"
                        onClick={(e) => {
                          e.preventDefault();
                          openLegalView('privacy');
                          setIsTopbarUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors font-medium text-xs"
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-500" />
                        <span>Privacy Policy</span>
                      </a>

                      <a
                        href="/terms"
                        onClick={(e) => {
                          e.preventDefault();
                          openLegalView('terms');
                          setIsTopbarUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors font-medium text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Terms of Service</span>
                      </a>

                      <div className="my-1 border-t border-slate-100 dark:border-white/[0.08]" />

                      {/* Sign out Action with Subtle Destructive Hover */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsTopbarUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-zinc-200 hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : isGuest ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Guest Mode</span>
                  </div>
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              ) : null}
            </div>

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
          {activeTab === 'today' && (
            <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-[#181309] dark:via-[#0e1320] dark:to-[#170f1a] border border-amber-300/80 dark:border-amber-500/35 rounded-2xl p-4 shadow-xs dark:shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <span>Today's Big 3 Priority Spotlight</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-200/60 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 dark:border dark:border-amber-500/30">
                        {big3Tasks.length}/3 Assigned
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-800 dark:text-zinc-200 hidden sm:block font-medium">
                      Your top 3 non-negotiables for today. Commit to finishing these before anything else.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {big3Tasks.length < 3 && (
                    <button
                      type="button"
                      onClick={() => handleOpenBig3Picker(big3Tasks.length)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors"
                      title="Pick a task for your Big 3"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pick Task</span>
                    </button>
                  )}
                  {big3Tasks.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearBig3}
                      className="text-[10px] text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 underline transition-colors"
                      title="Clear all tasks from Big 3"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsBig3Collapsed(!isBig3Collapsed)}
                    className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors"
                    title={isBig3Collapsed ? "Expand Spotlight" : "Collapse Spotlight"}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBig3Collapsed ? '-rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 3 Dedicated Interactive Slots */}
              {!isBig3Collapsed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map(slotIdx => {
                    const task = big3Tasks[slotIdx];
                    const slotLabel = slotIdx === 0 ? 'Priority #1' : slotIdx === 1 ? 'Priority #2' : 'Priority #3';

                    if (task) {
                      return (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-[#161c2b] border border-amber-200 dark:border-white/[0.12] p-3 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-2.5 relative group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-amber-500 text-black font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                                {slotIdx + 1}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                                {slotLabel}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateTask(task.id, { is_focus: false })}
                                className="p-1 rounded text-slate-300 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Remove from Today's Big 3"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Card Title & Badges */}
                          <div
                            className="cursor-pointer"
                            onClick={() => handleOpenTaskModal(task)}
                            title="Click to edit task details"
                          >
                            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-slate-500 dark:text-zinc-300 line-clamp-1 mt-0.5 font-normal">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Footer: Priority & ETA Badges & Actions */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-white/[0.08]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${task.priority === 'P1'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/20 dark:border-rose-500/40'
                                  : task.priority === 'P2'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 dark:bg-amber-950/60 border border-amber-500/20 dark:border-amber-500/40'
                                    : 'bg-slate-500/10 text-slate-600 dark:text-zinc-200 dark:bg-white/[0.08] border border-slate-500/20 dark:border-white/[0.12]'
                                }`}>
                                {task.priority}
                              </span>

                              {(task.duration || task.estimated_minutes) && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/50 flex items-center gap-1">
                                  <Hourglass className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
                                  <span>{formatDuration(task.duration || task.estimated_minutes)}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handlePostponeToTomorrow(task.id, e)}
                                className="p-1 rounded text-slate-400 dark:text-zinc-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                                title="Postpone to Tomorrow"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTaskCompleted(task)}
                                className="p-1 rounded text-slate-300 dark:text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                title="Mark complete"
                              >
                                <Circle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Empty slot card
                    return (
                      <div
                        key={`empty-slot-${slotIdx}`}
                        onClick={() => handleOpenBig3Picker(slotIdx)}
                        className="border-2 border-dashed border-amber-300/80 dark:border-amber-500/30 hover:border-amber-500 dark:hover:border-amber-400 bg-white/60 dark:bg-white/[0.03] hover:bg-amber-50/40 dark:hover:bg-amber-950/20 p-4 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 min-h-[110px] group select-none"
                        title={`Click to pick a task for ${slotLabel}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                          {slotIdx + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          + Pick {slotLabel}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-400">
                          Click to assign non-negotiable task
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INLINE EXPANDABLE ADD COMPOSER */}
          {showAddComposer && (
            <div className="mb-6 bg-white dark:bg-[#161c2b] border border-red-300 dark:border-white/[0.12] rounded-2xl p-4 shadow-lg shadow-red-500/5 transition-all">
              <form onSubmit={handleCreateTask}>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Task name, e.g. 'Deploy Redis caching cluster'..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none mb-2"
                />
                <textarea
                  rows={2}
                  placeholder="Description, markdown notes, or checklist specs..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-600 dark:text-zinc-300 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none resize-none mb-3"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Due Date */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0f1420] border border-transparent dark:border-white/[0.1] px-2 py-1 rounded-lg text-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Priority */}
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="bg-slate-100 dark:bg-[#0f1420] border border-transparent dark:border-white/[0.1] text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-white"
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
                      className="bg-slate-100 dark:bg-[#0f1420] border border-transparent dark:border-white/[0.1] text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-white"
                    >
                      {customSections.map(sec => (
                        <option key={sec.key} value={sec.key}>{sec.label}</option>
                      ))}
                    </select>

                    {/* Tag Selector */}
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-slate-100 dark:bg-[#0f1420] border border-transparent dark:border-white/[0.1] text-xs font-bold px-2 py-1 rounded-lg focus:outline-none text-slate-800 dark:text-white"
                    >
                      <option value="#Engineering">#Engineering</option>
                      <option value="#Design">#Design</option>
                      <option value="#Launch">#Launch</option>
                      <option value="#Marketing">#Marketing</option>
                      <option value="#UX">#UX</option>
                      <option value="#Performance">#Performance</option>
                    </select>

                    {/* ETA / Duration Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0f1420] border border-transparent dark:border-white/[0.1] px-2 py-1 rounded-lg text-xs" title="Estimated effort duration">
                      <Hourglass className="w-3.5 h-3.5 text-indigo-500" />
                      <select
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="bg-transparent text-xs font-bold focus:outline-none text-slate-800 dark:text-white cursor-pointer"
                      >
                        <option value="15m">ETA: 15m</option>
                        <option value="30m">ETA: 30m</option>
                        <option value="45m">ETA: 45m</option>
                        <option value="1h">ETA: 1h</option>
                        <option value="1.5h">ETA: 1.5h</option>
                        <option value="2h">ETA: 2h</option>
                        <option value="4h">ETA: 4h</option>
                        <option value="1d">ETA: 1d</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddComposer(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] dark:hover:text-white"
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
                                handleUpdateTask={handleUpdateTask}
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
            <div className="space-y-3">
              {/* Board Header Toolbar: Stage controls & helper */}
              {boardGrouping === 'stage' && (
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-300 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-white">
                      Swimlanes ({customSections.length})
                    </span>
                    <span className="text-slate-400 dark:text-zinc-400">
                      • Click any lane title or edit icon to rename
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddNewSection}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold transition-colors"
                      title="Add a new custom swimlane"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lane</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSections}
                      className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      title="Reset to default 4 workflow lanes"
                    >
                      Reset defaults
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-5 pb-6 overflow-x-auto min-h-[550px] items-start">
                {(boardGrouping === 'stage' ? customSections : [
                  { key: 'P1', label: 'P1 (Urgent)', icon: Flag },
                  { key: 'P2', label: 'P2 (High)', icon: Flag },
                  { key: 'P3', label: 'P3 (Medium)', icon: Flag },
                  { key: 'P4', label: 'P4 (Low)', icon: Flag }
                ]).map((column, colIdx) => {
                  const columnTasks = filteredTasks.filter(t =>
                    boardGrouping === 'stage' ? t.section === column.key : t.priority === column.key
                  );
                  const isOver = dragOverColumn === column.key;
                  const isEditingThisSection = editingSectionKey === column.key;

                  // Dynamic column status dot color (from 21st.dev Kanban pattern)
                  const columnColor = boardGrouping === 'stage'
                    ? (column.key === 'todo' ? '#38bdf8' : column.key === 'in_progress' ? '#f59e0b' : column.key === 'in_review' ? '#a855f7' : column.key === 'completed' ? '#10b981' : ['#ec4899', '#06b6d4', '#8b5cf6', '#f97316'][colIdx % 4])
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
                        handleCardDragEnd();
                      }}
                      className={`w-80 shrink-0 flex flex-col bg-slate-100/70 dark:bg-[#0f1420] backdrop-blur-md border rounded-2xl p-3.5 max-h-full transition-all duration-200 ${isOver
                          ? 'ring-2 ring-rose-500/50 border-rose-400 dark:border-rose-500/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-lg'
                          : 'border-slate-200/80 dark:border-white/[0.08] shadow-2xs'
                        }`}
                    >
                      {/* Column Header: Editable Lane Name & Actions */}
                      <div className="flex items-center justify-between pb-3 px-1">
                        {isEditingThisSection ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveRenameSection(column.key);
                            }}
                            className="flex items-center gap-1.5 flex-1 min-w-0 mr-1"
                          >
                            <input
                              type="text"
                              value={editingSectionLabel}
                              onChange={(e) => setEditingSectionLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancelRenameSection();
                              }}
                              autoFocus
                              placeholder="Lane Name"
                              className="w-full text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-white dark:bg-[#161c2b] border border-rose-500/70 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white"
                            />
                            <button
                              type="submit"
                              className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 shrink-0"
                              title="Save name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelRenameSection}
                              className="p-1 rounded bg-slate-200/60 text-slate-500 hover:bg-slate-200 dark:bg-white/[0.08] dark:text-zinc-300 shrink-0"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-2 ring-white/60 dark:ring-black/40"
                              style={{ backgroundColor: columnColor }}
                            />
                            <div
                              className="group/title flex items-center gap-1.5 min-w-0 cursor-pointer"
                              onClick={() => {
                                if (boardGrouping === 'stage') handleStartRenameSection(column);
                              }}
                              title={boardGrouping === 'stage' ? 'Click to rename this swimlane' : column.label}
                            >
                              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white group-hover/title:text-rose-600 dark:group-hover/title:text-rose-400 transition-colors truncate">
                                {column.label}
                              </span>
                              {boardGrouping === 'stage' && (
                                <Edit3 className="w-3 h-3 text-slate-400 dark:text-zinc-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 hover:text-rose-500" />
                              )}
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-white/[0.1] border border-slate-200/80 dark:border-white/[0.1] text-slate-600 dark:text-zinc-200 shadow-2xs shrink-0 font-mono">
                              {columnTasks.length}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                          {boardGrouping === 'stage' && customSections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(column.key)}
                              className="p-1 text-slate-300 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
                              title={`Delete ${column.label} swimlane`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setShowAddComposer(true);
                              if (boardGrouping === 'stage') setComposerSection(column.key);
                              else setNewPriority(column.key);
                            }}
                            className="p-1 hover:bg-white dark:hover:bg-white/[0.08] rounded-lg text-slate-400 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-white transition-colors"
                            title={`Add task to ${column.label}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Column Task Cards with 2D Drag-and-Drop & Framer Motion Layouts */}
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px]">
                        {isOver && draggingTaskId && (
                          <div className="border-2 border-dashed border-rose-400 dark:border-rose-500/80 rounded-xl p-3.5 text-center text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30 animate-pulse flex items-center justify-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Drop task into {column.label}</span>
                          </div>
                        )}

                        <div className="space-y-3 min-h-[40px]">
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
                              isDragging={draggingTaskId === task.id}
                              dragOverPosition={dragOverTaskId === task.id ? dragInsertPosition : null}
                              onCardDragStart={handleCardDragStart}
                              onCardDragEnd={handleCardDragEnd}
                              onCardDragOver={(e, t) => handleCardDragOver(e, t, column.key)}
                              onCardDrop={(e, t) => handleCardDrop(e, t, column.key)}
                            />
                          ))}
                        </div>

                        {columnTasks.length === 0 && !isOver && (
                          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl p-6 text-center text-xs text-slate-400 dark:text-zinc-400 bg-slate-50/40 dark:bg-white/[0.02]">
                            <span>No tasks in {column.label}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenTaskModal(null, column.key)}
                          className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-white flex items-center justify-center gap-1.5 hover:bg-slate-200/50 dark:hover:bg-white/[0.08] rounded-xl transition-colors border border-transparent dark:border-dashed dark:border-white/[0.08]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add task</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Lane Column at the end of the board */}
                {boardGrouping === 'stage' && (
                  <button
                    type="button"
                    onClick={handleAddNewSection}
                    className="w-72 shrink-0 h-40 flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-slate-300 dark:border-white/[0.12] rounded-2xl text-slate-400 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-400 dark:hover:border-rose-500/60 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-all font-bold text-xs uppercase tracking-wider group select-none"
                    title="Add a new custom swimlane"
                  >
                    <div className="p-2.5 rounded-full bg-slate-100 dark:bg-white/[0.08] group-hover:bg-rose-500/10 group-hover:text-rose-600 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span>Add New Lane</span>
                  </button>
                )}
              </div>
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
                      className={`flex flex-col rounded-2xl p-3 border transition-all ${day.isToday
                          ? 'bg-red-50/30 dark:bg-[#161c2b] border-red-300 dark:border-red-500/40 ring-1 ring-red-500/20'
                          : 'bg-white dark:bg-[#0f1420] border-slate-200/80 dark:border-white/[0.08]'
                        }`}
                    >
                      {/* Day Header */}
                      <div className="pb-3 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                        <div>
                          <span className={`text-xs font-black block ${day.isToday ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                            {day.weekday}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono">
                            {day.dayMonth}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.1] text-slate-600 dark:text-zinc-200">
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
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.12] hover:border-slate-300 dark:hover:border-white/[0.22] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{task.title}</p>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-white/[0.08] text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{task.priority}</span>
                                {(task.duration || task.estimated_minutes || task.focused_minutes) && (
                                  <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold" title={`Estimated effort: ${formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}`}>
                                    <Hourglass className="w-2.5 h-2.5" />
                                    <span>{formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}</span>
                                  </span>
                                )}
                              </div>
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
                          <div className="h-full flex items-center justify-center p-3 text-center text-[11px] text-slate-300 dark:text-zinc-500">
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
                        className="mt-2 w-full py-1.5 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center justify-center gap-1"
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
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Activity History & Audit Log</h3>
              </div>
              <button onClick={() => setShowActivityModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors" /></button>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-400 mb-4">
              Full timeline of completed tasks, Pomodoro sessions, and modifications.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {activityLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-white">{log.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono shrink-0 ml-2">{log.time}</span>
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
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Add New Section</h3>
              <button onClick={() => setShowAddSectionModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors" /></button>
            </div>
            <form onSubmit={handleAddSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Section Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Backlog, Client Review, t 4..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.12] text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] dark:hover:text-white transition-colors"
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
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Email tasks to Inbox</h3>
              </div>
              <button onClick={() => setShowEmailInboxModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors" /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-300 mb-4 leading-relaxed">
              Forward any email to your private Takt address. The subject will become the task title and the email body will be saved as description.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.1] flex items-center justify-between gap-2 mb-4">
              <code className="text-xs font-mono text-red-600 dark:text-red-400 truncate">
                inbox+{session?.user?.id?.slice(0, 8) || 'guest'}@takt.harisarshad.site
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`inbox+${session?.user?.id?.slice(0, 8) || 'guest'}@takt.harisarshad.site`);
                  showToast('Copied email address!');
                }}
                className="px-2 py-1 rounded bg-slate-200 dark:bg-white/[0.1] text-[10px] font-bold text-slate-700 dark:text-white shrink-0 hover:bg-slate-300 dark:hover:bg-white/[0.16] transition-colors"
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
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Inbox Calendar Feed (iCal)</h3>
              </div>
              <button onClick={() => setShowCalendarFeedModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors" /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-300 mb-4 leading-relaxed">
              Subscribe to your Takt tasks in Apple Calendar, Google Calendar, or Outlook to view scheduled tasks day-by-day.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.1] flex items-center justify-between gap-2 mb-4">
              <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">
                webcal://takt.harisarshad.site/feed.ics
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('webcal://takt.harisarshad.site/feed.ics');
                  showToast('Copied feed URL!');
                }}
                className="px-2 py-1 rounded bg-slate-200 dark:bg-white/[0.1] text-[10px] font-bold text-slate-700 dark:text-white shrink-0 hover:bg-slate-300 dark:hover:bg-white/[0.16] transition-colors"
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
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Productivity & Karma</h3>
              </div>
              <button onClick={() => setShowKarmaModal(false)}><X className="w-4 h-4 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors" /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">Karma Score</span>
                  <p className="text-2xl font-black text-amber-800 dark:text-amber-300">1,840 pts</p>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Level: Master Achiever</span>
                </div>
                <Award className="w-10 h-10 text-amber-500" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200/80 dark:border-white/[0.1] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-white">
                  <span>Daily Goal Progress</span>
                  <span>{completedCount} / 5 tasks</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/[0.1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (completedCount / 5) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-400">Complete 5 tasks daily to maintain your 4-day streak.</p>
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
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">Daily Shutdown Ritual</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-300 mb-5 leading-relaxed">
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
        session={session}
      />

      {/* --- KEYBOARD NAVIGATION SHORTCUTS MODAL --- */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* --- TODAY'S BIG 3 PRIORITY PICKER MODAL --- */}
      {showBig3Picker && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setShowBig3Picker(false)}
        >
          <div
            className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Spotlight Priority #{big3PickerSlot + 1}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                      Slot {big3PickerSlot + 1} of 3
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-400">
                    Pick any task from your workspace or quickly add a new high-leverage goal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBig3Picker(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleCreateAndPinBig3} className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-zinc-300 uppercase tracking-wider block">
                Quick-Create New Priority Task
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Finalize Q4 pitch deck presentation..."
                  value={quickBig3Title}
                  onChange={(e) => setQuickBig3Title(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-slate-50 dark:bg-[#161c2b] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!quickBig3Title.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Pin New</span>
                </button>
              </div>
            </form>

            <div className="relative flex items-center my-1">
              <div className="flex-grow border-t border-slate-100 dark:border-white/[0.08]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                Or pick an existing task
              </span>
              <div className="flex-grow border-t border-slate-100 dark:border-white/[0.08]"></div>
            </div>

            {/* Task Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search backlog tasks to assign..."
                value={big3SearchQuery}
                onChange={(e) => setBig3SearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-slate-50/70 dark:bg-[#161c2b] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Existing Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {(() => {
                const availableTasks = tasks.filter(t => {
                  if (t.is_focus || t.section === 'completed') return false;
                  if (!big3SearchQuery.trim()) return true;
                  const q = big3SearchQuery.toLowerCase();
                  return (
                    (t.title && t.title.toLowerCase().includes(q)) ||
                    (t.description && t.description.toLowerCase().includes(q)) ||
                    (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
                  );
                });

                if (availableTasks.length === 0) {
                  return (
                    <div className="py-10 text-center">
                      <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400">
                        {big3SearchQuery.trim()
                          ? `No tasks matching "${big3SearchQuery}"`
                          : 'All available tasks are either completed or already in Big 3!'}
                      </p>
                    </div>
                  );
                }

                return availableTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTaskForBig3(t)}
                    className="p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#161c2b] hover:border-amber-400 dark:hover:border-amber-500/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${t.priority === 'P1'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                            : t.priority === 'P2'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          }`}>
                          {t.priority || 'P2'}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-400">
                        {(t.duration || t.estimated_minutes) && (
                          <span className="flex items-center gap-1 font-semibold text-indigo-500">
                            <Hourglass className="w-2.5 h-2.5" />
                            <span>{formatDuration(t.duration || t.estimated_minutes)}</span>
                          </span>
                        )}
                        {Array.isArray(t.tags) && t.tags.length > 0 && (
                          <span className="truncate">{t.tags.slice(0, 2).join(' ')}</span>
                        )}
                        {t.due_date && <span>Due: {t.due_date}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.1] group-hover:bg-amber-500 group-hover:text-black text-slate-600 dark:text-zinc-200 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Select</span>
                    </button>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end">
              <button
                onClick={() => setShowBig3Picker(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}