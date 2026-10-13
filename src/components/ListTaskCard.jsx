import React from 'react';
import { Reorder } from 'framer-motion';
import {
  GripVertical,
  CheckCircle2,
  Circle,
  Play,
  Trash2,
  Hourglass,
  Clock,
  Star,
} from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

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
  handleUpdateTask,
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
      className={`group bg-white dark:bg-[#161c2b] border rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none relative ${
        isTaskCompleted
          ? 'border-slate-200/60 dark:border-white/[0.06] opacity-60'
          : 'border-slate-200/90 dark:border-white/[0.12] hover:border-slate-300 dark:hover:border-white/[0.25] dark:hover:bg-[#1c2438]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Tactile Drag Handle Affordance */}
        <div
          className="text-slate-300 dark:text-zinc-500 group-hover:text-slate-500 dark:group-hover:text-zinc-300 shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
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
          className="text-slate-300 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          title={isTaskCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isTaskCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/60" />
          ) : (
            <Circle className="w-4 h-4 hover:stroke-emerald-500" />
          )}
        </button>

        {/* Task Title & Details */}
        <div className="min-w-0 flex-1">
          <span
            className={`text-xs font-bold ${
              isTaskCompleted
                ? 'line-through text-slate-400 dark:text-zinc-500'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-300 truncate mt-0.5 font-normal">
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
              ? 'bg-red-500/10 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-500/20 dark:border-red-500/40'
              : task.priority === 'P2'
              ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/40'
              : 'bg-slate-500/10 dark:bg-white/[0.08] text-slate-600 dark:text-zinc-200 border border-slate-500/20 dark:border-white/[0.12]'
          }`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-[10px] text-slate-400 dark:text-zinc-300 hidden sm:inline font-mono font-medium">
            {task.due_date === todayDateStr ? 'Today' : task.due_date}
          </span>
        )}

        {/* ETA / Effort Duration Pill */}
        {(task.duration || task.estimated_minutes || task.focused_minutes) && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-300"
            title={`Estimated effort / ETA: ${formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}`}
          >
            <Hourglass className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
            <span>{formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}</span>
          </span>
        )}

        {/* Quick Postpone Button */}
        <button
          type="button"
          onClick={(e) => handlePostponeToTomorrow(task.id, e)}
          className="text-[10px] font-semibold text-slate-400 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors hidden md:inline-flex items-center gap-1"
          title="Postpone to Tomorrow"
        >
          <span>⏩ Tomorrow</span>
        </button>

        {/* Pin to Big 3 Button */}
        {handleUpdateTask && (
          <button
            type="button"
            onClick={() => handleUpdateTask(task.id, { is_focus: !task.is_focus })}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors ${
              task.is_focus
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-300 dark:text-zinc-400 hover:text-amber-400'
            }`}
            title={task.is_focus ? "Remove from Today's Big 3" : "Pin to Today's Big 3 Spotlight"}
          >
            <Star className={`w-3.5 h-3.5 ${task.is_focus ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Hover Actions: Start Timer, Delete */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              setActiveTimerTask(task);
              setTimerSeconds(25 * 60);
              setIsTimerRunning(true);
            }}
            className="p-1 text-slate-400 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            title="Start Focus Timer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 text-slate-400 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08]"
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
