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
      className={`group bg-white dark:bg-[#121622] border rounded-xl p-3 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.07)] dark:hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.4)] transition-all flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none relative ${
        isTaskCompleted
          ? 'border-slate-200/60 dark:border-white/[0.06] opacity-60 bg-slate-50/40 dark:bg-[#10141f]'
          : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Tactile Drag Handle Affordance (reveals on hover) */}
        <div
          className="text-slate-300 dark:text-zinc-500 opacity-30 group-hover:opacity-100 group-hover:text-slate-500 dark:group-hover:text-zinc-300 shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all"
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
          className="text-slate-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all hover:scale-110 active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
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
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[13.5px] font-semibold leading-snug tracking-tight ${
                isTaskCompleted
                  ? 'line-through text-slate-400 dark:text-zinc-500'
                  : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {task.title}
            </span>
            {task.tags &&
              task.tags.map((rawTag) => {
                const cleanTag =
                  typeof rawTag === 'string'
                    ? rawTag.replace(/^#+/, '').trim()
                    : String(rawTag).trim();
                if (!cleanTag) return null;
                return (
                  <span
                    key={cleanTag}
                    className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] px-1.5 py-0.2 rounded"
                  >
                    #{cleanTag}
                  </span>
                );
              })}
          </div>
          {task.description && (
            <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 font-normal">
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
          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
            task.priority === 'P1'
              ? 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
              : task.priority === 'P2'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
              : task.priority === 'P3'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50'
              : 'bg-slate-50 text-slate-600 border border-slate-200/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60'
          }`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-300 hidden sm:inline tabular-nums">
            {task.due_date === todayDateStr ? 'Today' : task.due_date}
          </span>
        )}

        {/* ETA / Effort Duration Pill */}
        {(task.duration || task.estimated_minutes || task.focused_minutes) && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
            title={`Estimated effort / ETA: ${formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}`}
          >
            <Hourglass className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
            <span>{formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}</span>
          </span>
        )}

        {/* Quick Postpone Button */}
        <button
          type="button"
          onClick={(e) => handlePostponeToTomorrow(task.id, e)}
          className="text-[10px] font-medium text-slate-500 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-white px-2 py-0.5 rounded border border-slate-200/70 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors hidden md:inline-flex items-center gap-1"
          title="Postpone to Tomorrow"
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Tomorrow</span>
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
