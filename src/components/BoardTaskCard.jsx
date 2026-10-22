import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Flag,
  Clock,
  CheckSquare,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Star,
  Hourglass,
  Calendar,
} from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

/**
 * BoardTaskCard
 * High-performance, visible drag-and-drop card for Kanban swimlanes.
 * Uses native HTML5 DnD with refined Linear/Raycast executive aesthetics,
 * multi-layered shadows, smooth spring transitions, clean typography,
 * and elegant contextual actions on hover.
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

  const validComments =
    task.comments &&
    task.comments.filter(
      (c) =>
        !c.deleted_at &&
        !c.is_deleted &&
        (!c.task_id || !task.id || c.task_id === task.id)
    );
  const commentCount = validComments ? validComments.length : 0;

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
      whileHover={{
        y: isDragging ? 0 : -2,
        transition: { duration: 0.16, ease: 'easeOut' },
      }}
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
      className={`group bg-white dark:bg-[#121622] border rounded-xl p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_24px_-4px_rgba(15,23,42,0.08),0_4px_8px_-2px_rgba(15,23,42,0.04)] dark:hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-grab active:cursor-grabbing select-none relative ${
        isDragging
          ? 'border-dashed border-2 border-slate-400 dark:border-zinc-500 bg-slate-50/50 dark:bg-white/[0.03] shadow-none'
          : isTaskCompleted
          ? 'border-slate-200/60 dark:border-white/[0.06] opacity-65 bg-slate-50/40 dark:bg-[#10141f]'
          : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
      }`}
    >
      {/* Relative Drop Indicator Line */}
      {dragOverPosition === 'before' && (
        <div className="absolute -top-1.5 left-2 right-2 h-1 bg-slate-900 dark:bg-white rounded-full shadow-md z-30 pointer-events-none ring-2 ring-white dark:ring-[#090b11]" />
      )}
      {dragOverPosition === 'after' && (
        <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-slate-900 dark:bg-white rounded-full shadow-md z-30 pointer-events-none ring-2 ring-white dark:ring-[#090b11]" />
      )}

      {/* Top Header: Completion Checkbox, Title, and Hover Quick Actions */}
      <div className="flex items-start gap-2.5">
        {/* Completion Checkbox Toggle */}
        <button
          type="button"
          onClick={() => toggleTaskCompleted(task)}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-0.5 text-slate-300 dark:text-zinc-600 hover:text-emerald-500 hover:dark:text-emerald-400 transition-all hover:scale-110 active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
          title={isTaskCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isTaskCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
          ) : (
            <Circle className="w-4 h-4 hover:stroke-emerald-500" />
          )}
        </button>

        {/* Task Title (Clickable to open modal) */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => handleOpenTaskModal(task)}
        >
          <h4
            className={`text-[13.5px] font-semibold leading-snug break-words tracking-tight ${
              isTaskCompleted
                ? 'line-through text-slate-400 dark:text-zinc-500'
                : 'text-slate-900 dark:text-zinc-100 hover:text-slate-700 dark:hover:text-white transition-colors'
            }`}
          >
            {task.title}
          </h4>
        </div>

        {/* Top-Right Action Area: Persistent Star (if pinned) or Hover Micro-Toolbar */}
        <div
          className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-0.5"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Subtle Hover Action Toolbar */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 bg-slate-100/90 dark:bg-zinc-800/90 backdrop-blur-xs px-1 py-0.5 rounded-md border border-slate-200/60 dark:border-white/[0.08] shadow-2xs">
            {moveTaskSection && (
              <>
                <button
                  type="button"
                  onClick={() => moveTaskSection(task.id, 'prev')}
                  className="p-1 rounded hover:bg-white dark:hover:bg-white/[0.1] text-slate-400 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  title="Move to previous swimlane"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveTaskSection(task.id, 'next')}
                  className="p-1 rounded hover:bg-white dark:hover:bg-white/[0.1] text-slate-400 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  title="Move to next swimlane"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}

            {handlePostponeToTomorrow && (
              <button
                type="button"
                onClick={(e) => handlePostponeToTomorrow(task.id, e)}
                className="p-1 rounded hover:bg-white dark:hover:bg-white/[0.1] text-slate-400 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
                title="Postpone to tomorrow"
              >
                <Clock className="w-3 h-3" />
              </button>
            )}

            {handleUpdateTask && (
              <button
                type="button"
                onClick={() =>
                  handleUpdateTask(task.id, { is_focus: !task.is_focus })
                }
                className={`p-1 rounded hover:bg-white dark:hover:bg-white/[0.1] transition-colors ${
                  task.is_focus
                    ? 'text-amber-500'
                    : 'text-slate-400 dark:text-zinc-400 hover:text-amber-500'
                }`}
                title={
                  task.is_focus
                    ? "Remove from Today's Big 3"
                    : "Pin to Today's Big 3 Spotlight"
                }
              >
                <Star
                  className={`w-3 h-3 ${task.is_focus ? 'fill-current' : ''}`}
                />
              </button>
            )}
          </div>

          {/* Persistent Star Icon if pinned and not hovered */}
          {task.is_focus && (
            <div
              className="group-hover:hidden pl-1"
              title="Pinned to Today's Big 3 Spotlight"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
          )}
        </div>
      </div>

      {/* Task Description (indented to align with title) */}
      {task.description && (
        <p
          className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1.5 pl-[26px] line-clamp-2 leading-relaxed font-normal cursor-pointer"
          onClick={() => handleOpenTaskModal(task)}
        >
          {task.description}
        </p>
      )}

      {/* Metadata Badges Row */}
      <div
        className="flex flex-wrap items-center gap-1.5 mt-2.5 pl-[26px] cursor-pointer"
        onClick={() => handleOpenTaskModal(task)}
      >
        {/* Priority Badge */}
        <span
          className={`text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
            task.priority === 'P1'
              ? 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
              : task.priority === 'P2'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
              : task.priority === 'P3'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50'
              : 'bg-slate-100/80 text-slate-600 border border-slate-200/60 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60'
          }`}
        >
          <Flag className="w-2.5 h-2.5" />
          <span>{task.priority || 'P4'}</span>
        </span>

        {/* Due Date Badge */}
        {task.due_date && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 border ${
              task.due_date === todayDateStr
                ? 'bg-amber-50/80 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40'
                : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300'
            }`}
          >
            <Calendar className="w-2.5 h-2.5 opacity-70" />
            <span>{task.due_date === todayDateStr ? 'Today' : task.due_date}</span>
          </span>
        )}

        {/* Duration / Effort Badge */}
        {(task.duration || task.estimated_minutes || task.focused_minutes) && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
            title={`Estimated effort / ETA: ${formatDuration(
              task.duration || task.estimated_minutes || task.focused_minutes
            )}`}
          >
            <Hourglass className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
            <span>
              {formatDuration(
                task.duration || task.estimated_minutes || task.focused_minutes
              )}
            </span>
          </span>
        )}

        {/* Subtasks Progress */}
        {subtasks.length > 0 && (
          <span
            className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
            title={`${completedSubtasks} of ${subtasks.length} subtasks completed`}
          >
            <CheckSquare className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
            <span>
              {completedSubtasks}/{subtasks.length}
            </span>
          </span>
        )}

        {/* Comments Count */}
        {commentCount > 0 && (
          <span
            className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300"
            title={`${commentCount} comment${commentCount > 1 ? 's' : ''}`}
          >
            <MessageSquare className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-400" />
            <span>{commentCount}</span>
          </span>
        )}

        {/* Clean Normalized Tags (no double ##) */}
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
                className="text-[10px] font-medium text-slate-600 dark:text-zinc-300 bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] px-1.5 py-0.5 rounded-md"
              >
                #{cleanTag}
              </span>
            );
          })}
      </div>
    </motion.div>
  );
}

export default BoardTaskCard;

