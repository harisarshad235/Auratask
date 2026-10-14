import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Sparkles, Keyboard } from 'lucide-react';

const SHORTCUT_GROUPS = [
  {
    title: 'Essential Commands',
    shortcuts: [
      { keys: ['N'], desc: 'Quick capture new task modal' },
      { keys: ['Space'], desc: 'Start / Pause active Pomodoro flow timer' },
      { keys: ['⌘ / Ctrl', 'K'], desc: 'Focus global search & filter bar' },
      { keys: ['?'], desc: 'Open this keyboard shortcuts reference' },
      { keys: ['Esc'], desc: 'Close open modal, drawer, or search' }
    ]
  },
  {
    title: 'Workspace Views & Cadence',
    shortcuts: [
      { keys: ['1'], desc: 'Switch to Kanban Swimlanes view' },
      { keys: ['2'], desc: 'Switch to 7-Day Horizon calendar' },
      { keys: ['3'], desc: 'Switch to List / Table view' },
      { keys: ['4'], desc: 'Open Analytics & Performance report' },
      { keys: ['M'], desc: 'Toggle Meeting Scratchpad' }
    ]
  },
  {
    title: 'Task Actions & Rescheduling',
    shortcuts: [
      { keys: ['P', '1-4'], desc: 'Set priority flag (P1 Urgent to P4 Low)' },
      { keys: ['T'], desc: 'Roll task to Tomorrow (1-click reschedule)' },
      { keys: ['D'], desc: 'Mark selected task as Done / Completed' },
      { keys: ['⌘ / Ctrl', 'Enter'], desc: 'Save task in detail modal' }
    ]
  }
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="relative w-full max-w-2xl bg-[#ffffff] dark:bg-[#0e121d] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-900 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-neutral-100 dark:border-white/[0.08] flex items-center justify-between bg-neutral-50/70 dark:bg-[#131926]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Keyboard Navigation Shortcuts</h3>
                  <p className="text-[11px] text-neutral-500 dark:text-zinc-400">High-velocity tactile shortcuts for uninterrupted flow</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {SHORTCUT_GROUPS.map((group, idx) => (
                <div key={idx} className="space-y-2.5">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400">
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {group.shortcuts.map((sc, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.03] border border-neutral-200/60 dark:border-white/[0.05]"
                      >
                        <span className="text-xs font-medium text-neutral-700 dark:text-zinc-300">
                          {sc.desc}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {sc.keys.map((k, kIdx) => (
                            <kbd
                              key={kIdx}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2133] border border-neutral-300 dark:border-white/10 text-[11px] font-mono font-semibold text-neutral-800 dark:text-zinc-200 shadow-2xs"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-neutral-100 dark:border-white/[0.08] bg-neutral-50/50 dark:bg-[#0c0e15] flex items-center justify-between text-xs text-neutral-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Press <kbd className="px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-white/10 font-mono text-[10px]">?</kbd> anywhere in workspace to open</span>
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-zinc-950 font-medium text-xs hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
