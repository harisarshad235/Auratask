import React from 'react';
import { Reorder } from 'framer-motion';
import {
  GripVertical,
  CheckCircle2,
  Circle,
  Play,
  Trash2,
} from 'lucide-react';

/**
 * ListTaskCard
 * Interactive drag-to-reorder row item for List View powered by Framer Motion Reorder.Item.
 * Features tactile lift, spring physics, grab affordance, and full touch/pointer responsiveness.
 */
export function ListTaskCard({
  task,
  todayDateStr,
  toggleTaskCompleted,
  handleOpenTaskModal,
  handlePostponeToTomorrow,
  handleDeleteTask,
  setActiveTimerTask,
  setTimerSeconds,
  setIsTimerRunning,
  onCardDragEnd,
}) {
  const isTaskCompleted = task.section === 'completed';

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      whileDrag={{
        scale: 1.02,
        boxShadow:
          '0 14px 20px -4px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        zIndex: 40,
        cursor: 'grabbing',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      onDragEnd={(event, info) => {
        if (onCardDragEnd) onCardDragEnd(task, info);
      }}
      onClick={() => handleOpenTaskModal(task)}
      className={`group bg-white dark:bg-[#121214] border rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none relative ${
        isTaskCompleted
          ? 'border-slate-200/60 dark:border-[#222225]/70 opacity-70'
          : 'border-slate-200/90 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#38383e] dark:hover:bg-[#1c1c20]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Tactile Drag Handle Affordance */}
        <div
          className="text-slate-300 dark:text-[#52525b] group-hover:text-slate-500 dark:group-hover:text-[#a1a1aa] shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] transition-colors"
          title="Drag to reorder task"
          onPointerDown={(e) => {
            // Natural drag handle
          }}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Checkbox Complete Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskCompleted(task);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-slate-300 dark:text-[#52525b] hover:text-emerald-500 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          title={isTaskCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isTaskCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-[#0d261a]" />
          ) : (
            <Circle className="w-4 h-4 hover:stroke-emerald-500" />
          )}
        </button>

        {/* Task Title & Details */}
        <div className="min-w-0 flex-1">
          <span
            className={`text-xs font-semibold ${
              isTaskCompleted
                ? 'line-through text-slate-400 dark:text-[#52525b]'
                : 'text-slate-900 dark:text-[#ededed]'
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <p className="text-[11px] text-slate-400 dark:text-[#a1a1aa] truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions & Metadata */}
      <div
        className="flex items-center gap-2.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Priority Flag Pill */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            task.priority === 'P1'
              ? 'bg-red-500/10 dark:bg-[#2a1215] text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
              : task.priority === 'P2'
              ? 'bg-amber-500/10 dark:bg-[#281a0b] text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
              : 'bg-slate-500/10 dark:bg-[#121214] text-slate-500 dark:text-[#a1a1aa] border border-slate-500/20 dark:border-[#222225]'
          }`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-[10px] text-slate-400 dark:text-[#a1a1aa] hidden sm:inline font-mono">
            {task.due_date === todayDateStr ? 'Today' : task.due_date}
          </span>
        )}

        {/* Quick Postpone Button */}
        <button
          type="button"
          onClick={(e) => handlePostponeToTomorrow(task.id, e)}
          className="text-[10px] font-semibold text-slate-400 dark:text-[#a1a1aa] hover:text-amber-500 dark:hover:text-amber-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20] transition-colors hidden md:inline-flex items-center gap-1"
          title="Postpone to Tomorrow"
        >
          <span>⏩ Tomorrow</span>
        </button>

        {/* Hover Actions: Start Timer, Delete */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              setActiveTimerTask(task);
              setTimerSeconds(25 * 60);
              setIsTimerRunning(true);
            }}
            className="p-1 text-slate-400 dark:text-[#a1a1aa] hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20]"
            title="Start Focus Timer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 text-slate-400 dark:text-[#a1a1aa] hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-[#1c1c20]"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default ListTaskCard;
