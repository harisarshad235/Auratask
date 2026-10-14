import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BarChart3, Search, Clock, CheckCircle2, Flame, Trash2,
  Edit3, Plus, Calendar, Download, Upload, Layers,
  Filter, Check, AlertCircle, RefreshCw, Sparkles, FileJson,
  FileSpreadsheet, ShieldCheck, ArrowUpDown, ChevronDown
} from 'lucide-react';

/**
 * Resolves high-fidelity Date from any activity log entry.
 * Backwards compatible with legacy logs (derives from epoch in id 'act-172...').
 */
export function parseActivityDate(log) {
  if (!log) return new Date();

  // 1. Direct timestamp string
  if (log.timestamp) {
    const d = new Date(log.timestamp);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Direct created_at string
  if (log.created_at) {
    const d = new Date(log.created_at);
    if (!isNaN(d.getTime())) return d;
  }

  // 3. Fallback: Parse epoch from id like 'act-1728912345678'
  if (typeof log.id === 'string') {
    const match = log.id.match(/^act-(\d{10,13})/);
    if (match) {
      let epoch = parseInt(match[1], 10);
      if (epoch < 1e11) epoch *= 1000; // seconds to ms
      const d = new Date(epoch);
      if (!isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2030) {
        return d;
      }
    }
  }

  return new Date();
}

/**
 * Format relative time dynamically (e.g. "Just now", "45s ago", "3m ago", "2h ago")
 */
export function formatRelativeTime(date, now = new Date()) {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Format high-precision exact local time (e.g. "05:07:43 PM · Oct 14, 2026")
 */
export function formatExactTime(date) {
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `${timeStr} · ${dateStr}`;
}

/**
 * Full ISO + Timezone string for native hover tooltip
 */
export function formatFullTooltip(date) {
  return `${date.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })} (${date.toISOString()})`;
}

/**
 * Determine activity category & styling
 */
function resolveLogMetadata(log) {
  const text = (log.text || '').toLowerCase();
  const icon = log.icon || '';

  if (icon === 'trash' || text.includes('deleted') || text.includes('removed')) {
    return {
      category: 'delete',
      badge: 'DELETED',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20',
      Icon: Trash2
    };
  }
  if (icon === 'flame' || text.includes('focus') || text.includes('pomodoro') || text.includes('timer')) {
    return {
      category: 'focus',
      badge: 'FOCUS FLOW',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20',
      Icon: Flame
    };
  }
  if (icon === 'check' || text.includes('completed') || text.includes('marked') || text.includes('done')) {
    return {
      category: 'complete',
      badge: 'COMPLETED',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
      Icon: CheckCircle2
    };
  }
  if (icon === 'edit' || text.includes('updated') || text.includes('edited')) {
    return {
      category: 'update',
      badge: 'UPDATED',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
      Icon: Edit3
    };
  }
  if (icon === 'plus' || text.includes('created') || text.includes('added')) {
    return {
      category: 'create',
      badge: 'CREATED',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
      Icon: Plus
    };
  }
  if (icon === 'calendar' || text.includes('rescheduled') || text.includes('tomorrow')) {
    return {
      category: 'schedule',
      badge: 'RESCHEDULED',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      iconBg: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20',
      Icon: Calendar
    };
  }
  if (icon === 'download' || text.includes('export')) {
    return {
      category: 'data',
      badge: 'EXPORTED',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20',
      Icon: Download
    };
  }
  if (icon === 'upload' || text.includes('import')) {
    return {
      category: 'data',
      badge: 'IMPORTED',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      iconBg: 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/20',
      Icon: Upload
    };
  }
  if (text.includes('section')) {
    return {
      category: 'section',
      badge: 'SECTION',
      badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      iconBg: 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20',
      Icon: Layers
    };
  }

  // Default event
  return {
    category: 'general',
    badge: 'ACTIVITY',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    iconBg: 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/20',
    Icon: BarChart3
  };
}

/**
 * Format date group key (Today, Yesterday, Earlier)
 */
function getDateGroupKey(date, now = new Date()) {
  const dYear = date.getFullYear();
  const dMonth = date.getMonth();
  const dDate = date.getDate();

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const nowDate = now.getDate();

  if (dYear === nowYear && dMonth === nowMonth && dDate === nowDate) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dYear === yesterday.getFullYear() && dMonth === yesterday.getMonth() && dDate === yesterday.getDate()) {
    return 'Yesterday';
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return 'This Week';
  }
  if (diffDays < 30) {
    return 'This Month';
  }
  return 'Earlier';
}

export default function ActivityHistoryModal({
  isOpen,
  onClose,
  activityLogs = [],
  onClearLogs,
  session
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'tasks', 'completions', 'focus', 'data'
  const [timeDisplayMode, setTimeDisplayMode] = useState(() => {
    return localStorage.getItem('takt_audit_time_mode') || 'relative'; // 'relative' or 'exact'
  });
  const [now, setNow] = useState(() => new Date());
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        if (confirmClearOpen) {
          setConfirmClearOpen(false);
        } else {
          onClose();
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, confirmClearOpen]);

  // Live timer tick: Updates relative time every 10 seconds while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleTimeMode = () => {
    const nextMode = timeDisplayMode === 'relative' ? 'exact' : 'relative';
    setTimeDisplayMode(nextMode);
    localStorage.setItem('takt_audit_time_mode', nextMode);
  };

  // Process and decorate all logs with accurate parsed dates and metadata
  const processedLogs = useMemo(() => {
    if (!Array.isArray(activityLogs)) return [];

    return activityLogs.map((log, index) => {
      const date = parseActivityDate(log);
      const meta = resolveLogMetadata(log);
      const relativeTime = formatRelativeTime(date, now);
      const exactTime = formatExactTime(date);
      const fullTooltip = formatFullTooltip(date);
      const groupKey = getDateGroupKey(date, now);

      return {
        ...log,
        _date: date,
        _timeMs: date.getTime(),
        _relativeTime: relativeTime,
        _exactTime: exactTime,
        _fullTooltip: fullTooltip,
        _groupKey: groupKey,
        _meta: meta
      };
    });
  }, [activityLogs, now]);

  // Summary Metrics Strip
  const stats = useMemo(() => {
    const total = processedLogs.length;
    let createdCount = 0;
    let completedCount = 0;
    let focusCount = 0;

    processedLogs.forEach(l => {
      if (l._meta.category === 'create' || l._meta.category === 'update') createdCount++;
      if (l._meta.category === 'complete') completedCount++;
      if (l._meta.category === 'focus') focusCount++;
    });

    return { total, createdCount, completedCount, focusCount };
  }, [processedLogs]);

  // Filter and search
  const filteredLogs = useMemo(() => {
    let result = processedLogs;

    // Filter pill
    if (selectedFilter === 'tasks') {
      result = result.filter(l => ['create', 'update', 'delete', 'schedule'].includes(l._meta.category));
    } else if (selectedFilter === 'completions') {
      result = result.filter(l => l._meta.category === 'complete');
    } else if (selectedFilter === 'focus') {
      result = result.filter(l => l._meta.category === 'focus');
    } else if (selectedFilter === 'data') {
      result = result.filter(l => ['data', 'section', 'general'].includes(l._meta.category));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l => {
        const text = (l.text || '').toLowerCase();
        const badge = (l._meta.badge || '').toLowerCase();
        const exact = l._exactTime.toLowerCase();
        return text.includes(q) || badge.includes(q) || exact.includes(q);
      });
    }

    return result;
  }, [processedLogs, selectedFilter, searchQuery]);

  // Group by day for visual timeline
  const groupedLogs = useMemo(() => {
    const groups = {};
    const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];

    filteredLogs.forEach(log => {
      const key = log._groupKey;
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });

    return order
      .filter(key => groups[key] && groups[key].length > 0)
      .map(key => ({ group: key, items: groups[key] }));
  }, [filteredLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Event ID', 'Timestamp (ISO)', 'Local Time', 'Category', 'Action Text', 'Actor'];
      const rows = processedLogs.map(l => [
        `"${l.id}"`,
        `"${l._date.toISOString()}"`,
        `"${l._exactTime}"`,
        `"${l._meta.badge}"`,
        `"${(l.text || '').replace(/"/g, '""')}"`,
        `"${session?.user?.email || 'Workspace User'}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `takt-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          workspace: 'Takt Workspace',
          account: session?.user?.email || 'Guest',
          total_events: processedLogs.length,
          events: processedLogs.map(l => ({
            id: l.id,
            timestamp: l._date.toISOString(),
            local_time: l._exactTime,
            category: l._meta.badge,
            text: l.text,
            actor: session?.user?.email || 'Workspace User'
          }))
        },
        null,
        2
      );

      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `takt-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export JSON', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#121622] rounded-3xl border border-slate-200 dark:border-white/[0.12] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 pb-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight truncate">
                    Activity History & Audit Log
                  </h3>
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live recording
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                  Real-time timeline of completed tasks, Pomodoro sessions, and modifications.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.015] grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-[#161c2b] border border-slate-200/60 dark:border-white/[0.06] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Total Events</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{stats.total}</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#161c2b] border border-slate-200/60 dark:border-white/[0.06] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Task Actions</div>
              <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">{stats.createdCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#161c2b] border border-slate-200/60 dark:border-white/[0.06] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Completed</div>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{stats.completedCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#161c2b] border border-slate-200/60 dark:border-white/[0.06] shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Focus Sprints</div>
              <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">{stats.focusCount}</div>
            </div>
          </div>

          {/* Controls Bar: Search, Category Filters, Time Switch, and Export */}
          <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search activity by task, action, or date..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-white/[0.1] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Time Mode Switch */}
              <button
                onClick={toggleTimeMode}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#161c2b] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors shrink-0"
                title="Switch time presentation between relative and exact time"
              >
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Format:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[11px]">
                  {timeDisplayMode === 'relative' ? 'Relative' : 'Exact Real Time'}
                </span>
              </button>

              {/* Export Dropdown / Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#161c2b] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                  title="Export audit report as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#161c2b] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                  title="Export audit report as JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">JSON</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'All Activities' },
                { id: 'tasks', label: 'Tasks' },
                { id: 'completions', label: 'Completed' },
                { id: 'focus', label: 'Focus Sprints' },
                { id: 'data', label: 'System & Data' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedFilter === f.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Feed Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[50vh] min-h-[220px]">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">No activity records found</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                  {searchQuery ? `No events matched your search query "${searchQuery}".` : 'Your workspace activity timeline will populate as tasks are created and updated.'}
                </p>
              </div>
            ) : (
              groupedLogs.map(group => (
                <div key={group.group} className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-400 font-mono">
                      {group.group}
                    </span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/[0.08]" />
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>

                  {/* Timeline Stream */}
                  <div className="relative pl-6 space-y-2.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/[0.08]">
                    {group.items.map(log => {
                      const { Icon, badge, badgeColor, iconBg } = log._meta;

                      return (
                        <div
                          key={log.id}
                          className="relative group p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#161c2b] border border-slate-200/70 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          {/* Timeline Node Icon */}
                          <div
                            className={`absolute -left-[27px] top-3.5 w-5 h-5 rounded-full border-2 border-white dark:border-[#121622] flex items-center justify-center shadow-xs ${iconBg}`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                          </div>

                          {/* Event Body */}
                          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border shrink-0 ${badgeColor}`}>
                              {badge}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 leading-snug break-words">
                              {log.text}
                            </span>
                          </div>

                          {/* Real Time Presentation */}
                          <div
                            className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono cursor-default"
                            title={log._fullTooltip}
                          >
                            {timeDisplayMode === 'relative' ? (
                              <div className="text-right">
                                <div className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                                  {log._relativeTime}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                  {log._exactTime}
                                </div>
                              </div>
                            ) : (
                              <div className="text-right">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {log._exactTime}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                  {log._relativeTime}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {confirmClearOpen ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">Clear all audit events?</span>
                  <button
                    onClick={() => {
                      if (onClearLogs) onClearLogs();
                      setConfirmClearOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={processedLogs.length === 0}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
