import React from 'react';
import { Reorder } from 'framer-motion';
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
} from 'lucide-react';

/**
 * BoardTaskCard
 * Interactive drag-to-reorder card for Kanban swimlanes powered by Framer Motion Reorder.Item.
 * Features tactile elevation, subtle spring physics, grab affordance, and full touch/pointer responsiveness.
 */
export function BoardTaskCard({
  task,
  todayDateStr,
  toggleTaskCompleted,
  handleOpenTaskModal,
  handlePostponeToTomorrow,
  handleUpdateTask,
  moveTaskSection,
  onCardDragEnd,
}) {
  const isTaskCompleted = task.section === 'completed';
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      whileDrag={{
        scale: 1.03,
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        zIndex: 50,
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
      className={`group bg-white dark:bg-[#101626] border rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing select-none relative ${
        isTaskCompleted
          ? 'border-slate-200/60 dark:border-[#1e2638]/70 opacity-75'
          : 'border-slate-200/90 dark:border-[#1e2638] hover:border-slate-300 dark:hover:border-slate-700/80 dark:hover:bg-[#141b2e]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Tactile Drag Handle Affordance */}
        <div
          className="text-slate-300 dark:text-[#52525b] group-hover:text-slate-500 dark:group-hover:text-[#a1a1aa] shrink-0 mt-0.5 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1e2638] transition-colors"
          title="Drag to reorder card"
          onPointerDown={(e) => {
            // Allow drag to initiate naturally
          }}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Completion Checkbox Toggle (stops pointerDown propagation to prevent accidental drag) */}
        <button
          type="button"
          onClick={() => toggleTaskCompleted(task)}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-0.5 text-slate-300 dark:text-[#52525b] hover:text-emerald-500 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          title={isTaskCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isTaskCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-[#0d261a]" />
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
            className={`text-xs font-bold leading-snug break-words ${
              isTaskCompleted
                ? 'line-through text-slate-400 dark:text-[#52525b]'
                : 'text-slate-900 dark:text-[#ededed]'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-[#a1a1aa] mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                task.priority === 'P1'
                  ? 'bg-rose-500/10 dark:bg-[#2a1215] text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30'
                  : task.priority === 'P2'
                  ? 'bg-amber-500/10 dark:bg-[#281a0b] text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
                  : 'bg-slate-500/10 dark:bg-[#121724] text-slate-500 dark:text-[#a1a1aa] border border-slate-500/20 dark:border-[#22304e]'
              }`}
            >
              <Flag className="w-2.5 h-2.5" />
              <span>{task.priority}</span>
            </span>

            {task.due_date && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-100 dark:bg-[#151d30] border border-slate-200/60 dark:border-[#22304e] text-slate-500 dark:text-[#a1a1aa]">
                <Clock className="w-2.5 h-2.5" />
                <span>{task.due_date === todayDateStr ? 'Today' : task.due_date}</span>
              </span>
            )}

            {subtasks.length > 0 && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-100 dark:bg-[#151d30] border border-slate-200/60 dark:border-[#22304e] text-slate-500 dark:text-[#a1a1aa]"
                title={`${completedSubtasks} of ${subtasks.length} subtasks completed`}
              >
                <CheckSquare className="w-2.5 h-2.5 text-slate-400" />
                <span>
                  {completedSubtasks}/{subtasks.length}
                </span>
              </span>
            )}

            {task.comments && task.comments.length > 0 && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-100 dark:bg-[#151d30] border border-slate-200/60 dark:border-[#22304e] text-slate-500 dark:text-[#a1a1aa]"
                title={`${task.comments.length} comments`}
              >
                <MessageSquare className="w-2.5 h-2.5 text-slate-400" />
                <span>{task.comments.length}</span>
              </span>
            )}

            {task.tags &&
              task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold text-slate-500 dark:text-[#a1a1aa] bg-slate-100 dark:bg-[#151d30] border border-slate-200/60 dark:border-[#22304e] px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Quick Actions */}
      <div
        className="mt-3 pt-2 border-t border-slate-100 dark:border-[#1e2638] flex items-center justify-between"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => moveTaskSection(task.id, 'prev')}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#151d30] text-slate-400 dark:text-[#52525b] hover:text-slate-700 dark:hover:text-[#ededed] transition-colors"
            title="Previous section"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => moveTaskSection(task.id, 'next')}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#151d30] text-slate-400 dark:text-[#52525b] hover:text-slate-700 dark:hover:text-[#ededed] transition-colors"
            title="Next section"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => handlePostponeToTomorrow(task.id, e)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#151d30] text-slate-400 dark:text-[#a1a1aa] hover:text-amber-500 transition-colors"
            title="Postpone to Tomorrow (⏩)"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateTask(task.id, { is_focus: !task.is_focus })}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#151d30] transition-colors ${
              task.is_focus
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-300 dark:text-[#52525b] hover:text-amber-400'
            }`}
            title="Pin to Big 3"
          >
            <Star className={`w-3.5 h-3.5 ${task.is_focus ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default BoardTaskCard;
