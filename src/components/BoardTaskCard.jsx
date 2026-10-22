import React from 'react';
import { motion } from 'framer-motion';
import {
  GripVertical,
  CheckCircle2,
  Circle,
  Flag,
  Clock,
  CheckSquare,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Star,
  Hourglass
} from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

/**
 * BoardTaskCard
 * High-performance, visible drag-and-drop card for Kanban swimlanes.
 * Uses native HTML5 DnD for zero-latency, cross-swimlane floating card preview,
 * paired with Framer Motion layout spring transitions, tactile affordances,
 * and precise relative insertion drop indicators.
 */
export function BoardTaskCard({
  task,
  todayDateStr,
  toggleTaskCompleted,
  handleOpenTaskModal,
  handlePostponeToTomorrow,
  handleUpdateTask,
  moveTaskSection,
  isDragging,
  dragOverPosition, // 'before' | 'after' | null
  onCardDragStart,
  onCardDragEnd,
  onCardDragOver,
  onCardDrop,
}) {
  const isTaskCompleted = task.section === 'completed';
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;

  return (
    <motion.div
      layout
      layoutId={`board-card-${task.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.35 : 1,
        scale: isDragging ? 0.98 : 1,
        y: 0,
      }}
      whileHover={{ y: isDragging ? 0 : -2, transition: { duration: 0.16, ease: 'easeOut' } }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{
        layout: { type: 'spring', stiffness: 350, damping: 28 },
        opacity: { duration: 0.15 },
      }}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        if (onCardDragStart) onCardDragStart(task);
      }}
      onDragEnd={(e) => {
        if (onCardDragEnd) onCardDragEnd(task);
      }}
      onDragOver={(e) => {
        if (onCardDragOver) onCardDragOver(e, task);
      }}
      onDrop={(e) => {
        if (onCardDrop) onCardDrop(e, task);
      }}
      className={`group bg-white dark:bg-[#151c2d] border rounded-xl p-3.5 shadow-2xs dark:shadow-md dark:shadow-black/20 hover:shadow-xs transition-all duration-200 cursor-grab active:cursor-grabbing select-none relative ${
        isDragging
          ? 'border-dashed border-2 border-slate-400 dark:border-zinc-500 bg-slate-50/50 dark:bg-white/[0.03] shadow-none'
          : isTaskCompleted
          ? 'border-slate-200/60 dark:border-white/[0.06] opacity-65'
          : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] dark:hover:bg-[#182136]'
      }`}
    >
      {/* Relative Drop Indicator Line */}
      {dragOverPosition === 'before' && (
        <div className="absolute -top-1.5 left-2 right-2 h-1 bg-slate-900 dark:bg-white rounded-full shadow-md z-30 pointer-events-none ring-2 ring-white dark:ring-[#090b11]" />
      )}
      {dragOverPosition === 'after' && (
        <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-slate-900 dark:bg-white rounded-full shadow-md z-30 pointer-events-none ring-2 ring-white dark:ring-[#090b11]" />
      )}

      <div className="flex items-start gap-2.5">
        {/* Tactile Drag Handle Affordance */}
        <div
          className="text-slate-300 dark:text-zinc-500 group-hover:text-slate-500 dark:group-hover:text-zinc-300 shrink-0 mt-0.5 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
          title="Drag card across swimlanes or reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Completion Checkbox Toggle (stops pointerDown propagation to prevent accidental drag) */}
        <button
          type="button"
          onClick={() => toggleTaskCompleted(task)}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-0.5 text-slate-300 dark:text-zinc-500 hover:text-emerald-500 hover:dark:text-emerald-400 transition-all hover:scale-105 active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          title={isTaskCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isTaskCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
          ) : (
            <Circle className="w-4 h-4 hover:stroke-emerald-500" />
          )}
        </button>

        {/* Card Body (opens task modal on click) */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => handleOpenTaskModal(task)}
        >
          <h4
            className={`text-[13px] font-semibold leading-snug break-words tracking-tight ${
              isTaskCompleted
                ? 'line-through text-slate-400 dark:text-zinc-500'
                : 'text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-normal">
              {task.description}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
                task.priority === 'P1'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
                  : task.priority === 'P2'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                  : task.priority === 'P3'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60'
              }`}
            >
              <Flag className="w-2.5 h-2.5" />
              <span>{task.priority}</span>
            </span>

            {task.due_date && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300">
                <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
                <span>{task.due_date === todayDateStr ? 'Today' : task.due_date}</span>
              </span>
            )}

            {/* ETA / Effort Duration Badge */}
            {(task.duration || task.estimated_minutes || task.focused_minutes) && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
                title={`Estimated effort / ETA: ${formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}`}
              >
                <Hourglass className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
                <span>{formatDuration(task.duration || task.estimated_minutes || task.focused_minutes)}</span>
              </span>
            )}

            {subtasks.length > 0 && (
              <span
                className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
                title={`${completedSubtasks} of ${subtasks.length} subtasks completed`}
              >
                <CheckSquare className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
                <span>
                  {completedSubtasks}/{subtasks.length}
                </span>
              </span>
            )}

            {task.comments && task.comments.filter(c => !c.deleted_at && !c.is_deleted && (!c.task_id || !task.id || c.task_id === task.id)).length > 0 && (
              <span
                className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
                title={`${task.comments.filter(c => !c.deleted_at && !c.is_deleted && (!c.task_id || !task.id || c.task_id === task.id)).length} comments`}
              >
                <MessageSquare className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
                <span>{task.comments.filter(c => !c.deleted_at && !c.is_deleted && (!c.task_id || !task.id || c.task_id === task.id)).length}</span>
              </span>
            )}

            {task.tags &&
              task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-slate-600 dark:text-zinc-300 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Quick Actions */}
      <div
        className="mt-3 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => moveTaskSection(task.id, 'prev')}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            title="Previous section"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => moveTaskSection(task.id, 'next')}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            title="Next section"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => handlePostponeToTomorrow(task.id, e)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
            title="Postpone to Tomorrow"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateTask(task.id, { is_focus: !task.is_focus })}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors ${
              task.is_focus
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-300 dark:text-zinc-500 hover:text-amber-400'
            }`}
            title="Pin to Big 3"
          >
            <Star className={`w-3.5 h-3.5 ${task.is_focus ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default BoardTaskCard;
