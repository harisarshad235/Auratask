import React, { useState, useEffect } from 'react';
import {
  X, Check, ChevronUp, ChevronDown, MoreHorizontal, Inbox, Calendar,
  Flag, Tag, Clock, Paperclip, Send, Trash2, CheckCircle2, Circle,
  FileText, Sparkles, CornerDownLeft, Plus, MessageSquare, AlertCircle,
  Hourglass, Timer, Star, Loader2
} from 'lucide-react';
import { formatDuration, parseDurationMinutes } from './utils/formatDuration';
import { supabase } from './supabaseClient';

const TAKT_META_REGEX = /<!--takt:meta\s+({[\s\S]*?})-->/;

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

export default function TaskModal({
  isOpen,
  onClose,
  task,
  onSaveTask,
  onDeleteTask,
  allTasks = [],
  onSelectTask,
  defaultSection = 'todo',
  sections = [
    { key: 'todo', label: 'Inbox / To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'in_review', label: 'In Review' },
    { key: 'completed', label: 'Completed' }
  ],
  darkMode = false,
  session = null
}) {
  const isEditing = Boolean(task && task.id);
  const currentUserId = session?.user?.id;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState(defaultSection);
  const [priority, setPriority] = useState('P4');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [tags, setTags] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [reminder, setReminder] = useState('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [duration, setDuration] = useState('30m');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // New subtask & comment inputs
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Quick tag suggestions
  const SUGGESTED_TAGS = ['#Engineering', '#Design', '#Marketing', '#Product', '#Personal', '#Urgent'];

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      const rawDesc = task.description || '';
      setDescription(rawDesc.replace(TAKT_META_REGEX, '').trim());
      setSection(task.section || defaultSection);
      setPriority(task.priority || 'P4');
      setDueDate(task.due_date || '');
      setDueTime(task.due_time || '');
      setDeadlineTime(task.deadline || '');
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setSubtasks(Array.isArray(task.subtasks) ? task.subtasks : []);
      setComments(Array.isArray(task.comments) ? task.comments : []);
      setReminder(task.reminder || 'none');
      const effDuration = task.duration || task.eta || (task.estimated_minutes ? formatDuration(task.estimated_minutes) : '');
      const effMins = task.estimated_minutes || (effDuration ? parseDurationMinutes(effDuration) : (task.focused_minutes || 30));
      setEstimatedMinutes(effMins);
      setDuration(effDuration || '30m');
      setIsCompleted(task.section === 'completed');
      setIsFocus(Boolean(task.is_focus));
    } else {
      setTitle('');
      setDescription('');
      setSection(defaultSection);
      setPriority('P4');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('');
      setDeadlineTime('');
      setTags(['#Work']);
      setSubtasks([]);
      setComments([]);
      setReminder('none');
      setEstimatedMinutes(30);
      setDuration('30m');
      setIsCompleted(false);
      setIsFocus(false);
    }
  }, [task, defaultSection, isOpen]);

  // Phase 3: Fetch latest task and comments directly from Supabase on mount
  useEffect(() => {
    if (!isOpen || !task?.id || !isValidUUID(task.id)) return;

    let isMounted = true;

    const fetchLiveTaskAndComments = async () => {
      // 1. Fetch live task data to avoid stale parent props
      try {
        const { data: liveTask, error: taskErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', task.id)
          .single();

        if (taskErr) {
          console.warn("Supabase fetch live task notice:", taskErr.message);
        } else if (liveTask && isMounted) {
          if (liveTask.title) setTitle(liveTask.title);
          if (liveTask.description) {
            setDescription(liveTask.description.replace(TAKT_META_REGEX, '').trim());
          }
          if (liveTask.section) setSection(liveTask.section);
          if (liveTask.priority) setPriority(liveTask.priority);
          if (liveTask.due_date) setDueDate(liveTask.due_date);
          if (liveTask.due_time) setDueTime(liveTask.due_time);
          if (liveTask.deadline) setDeadlineTime(liveTask.deadline);
          if (liveTask.duration || liveTask.eta) {
            const dur = liveTask.duration || liveTask.eta;
            setDuration(dur);
            setEstimatedMinutes(parseDurationMinutes(dur));
          } else if (liveTask.estimated_minutes) {
            setEstimatedMinutes(liveTask.estimated_minutes);
            setDuration(formatDuration(liveTask.estimated_minutes));
          }
          if (liveTask.is_focus !== undefined) setIsFocus(Boolean(liveTask.is_focus));
        }
      } catch (err) {
        console.warn("Exception fetching live task details:", err);
      }

      // 2. Fetch live relational comments from task_comments table
      setLoadingComments(true);
      try {
        const { data: dbComments, error: commentsErr } = await supabase
          .from('task_comments')
          .select('*')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true });

        if (commentsErr) {
          if (commentsErr.code === 'PGRST205' || commentsErr.message?.includes('schema cache')) {
            console.info("Notice: task_comments table pending migration. Using task metadata comments.");
          } else {
            console.error("Supabase task_comments query failed:", commentsErr);
          }
        } else if (Array.isArray(dbComments) && isMounted) {
          const formatted = dbComments.map(c => ({
            id: c.id,
            author: c.user_id === currentUserId ? 'You' : 'Team Member',
            text: c.content,
            timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: c.created_at,
            user_id: c.user_id,
            task_id: c.task_id
          }));
          setComments(formatted);
        }
      } catch (err) {
        console.error("Exception fetching task comments:", err);
      } finally {
        if (isMounted) setLoadingComments(false);
      }
    };

    fetchLiveTaskAndComments();

    // 3. Supabase Realtime subscription for incoming comments on this task
    const commentsChannel = supabase
      .channel(`task-comments-${task.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${task.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            setComments(prev => {
              if (prev.some(c => c.id === row.id)) return prev;
              return [...prev, {
                id: row.id,
                author: row.user_id === currentUserId ? 'You' : 'Team Member',
                text: row.content,
                timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                created_at: row.created_at,
                user_id: row.user_id,
                task_id: row.task_id
              }];
            });
          } else if (payload.eventType === 'DELETE') {
            const delId = payload.old?.id;
            if (delId) {
              setComments(prev => prev.filter(c => c.id !== delId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(commentsChannel);
    };
  }, [isOpen, task?.id, currentUserId]);

  if (!isOpen) return null;

  // Previous & Next Task navigation
  const currentIndex = allTasks.findIndex(t => t.id === task?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allTasks.length - 1;

  const handlePrevTask = () => {
    if (hasPrev && onSelectTask) {
      onSelectTask(allTasks[currentIndex - 1]);
    }
  };

  const handleNextTask = () => {
    if (hasNext && onSelectTask) {
      onSelectTask(allTasks[currentIndex + 1]);
    }
  };

  // Add subtask
  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSt = {
      id: 'st-' + Date.now(),
      text: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskText('');
    setShowSubtaskInput(false);
  };

  const toggleSubtask = (stId) => {
    setSubtasks(subtasks.map(st => st.id === stId ? { ...st, completed: !st.completed } : st));
  };

  const deleteSubtask = (stId) => {
    setSubtasks(subtasks.filter(st => st.id !== stId));
  };

  // Add Comment (Persisting to both Supabase task_comments and task metadata)
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    const commentText = newCommentText.trim();
    const commentId = generateUUID();
    const nowIso = new Date().toISOString();

    const commentObj = {
      id: commentId,
      author: 'You',
      text: commentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: nowIso,
      user_id: currentUserId,
      task_id: task?.id
    };

    const updatedComments = [...comments, commentObj];
    setComments(updatedComments);
    setNewCommentText('');

    // If authenticated and task exists in Supabase, insert directly to task_comments table
    if (currentUserId && task?.id && isValidUUID(task.id)) {
      try {
        const { error } = await supabase.from('task_comments').insert({
          id: commentId,
          task_id: task.id,
          user_id: currentUserId,
          content: commentText,
          created_at: nowIso
        });

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            console.info("task_comments table not yet provisioned; comment is preserved via task metadata.");
          } else {
            console.error("Supabase operation failed on insert task_comments:", error);
          }
        }
      } catch (err) {
        console.error("Exception writing comment to Supabase:", err);
      }
    }

    // Immediately propagate to parent task so client-side state & metadata envelope stay in sync
    if (task && onSaveTask) {
      onSaveTask({
        ...task,
        comments: updatedComments
      });
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    const updated = comments.filter(c => c.id !== commentId);
    setComments(updated);

    if (currentUserId && isValidUUID(commentId)) {
      try {
        const { error } = await supabase
          .from('task_comments')
          .delete()
          .eq('id', commentId);

        if (error) {
          console.error("Supabase operation failed on delete task_comments:", error);
        }
      } catch (err) {
        console.error("Exception deleting comment from Supabase:", err);
      }
    }

    if (task && onSaveTask) {
      onSaveTask({
        ...task,
        comments: updated
      });
    }
  };

  // Add Tag
  const handleAddTag = (tagToAdd) => {
    const formatted = tagToAdd.startsWith('#') ? tagToAdd : `#${tagToAdd}`;
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Save changes
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const finalDuration = duration ? duration.trim() : (estimatedMinutes ? formatDuration(estimatedMinutes) : '');
    const cleanDescription = (description || '').replace(TAKT_META_REGEX, '').trim();

    const taskPayload = {
      id: task?.id || generateUUID(),
      title: title.trim(),
      description: cleanDescription,
      section: isCompleted ? 'completed' : section,
      status: isCompleted ? 'completed' : section,
      priority,
      due_date: dueDate,
      due_time: dueTime,
      deadline: deadlineTime,
      duration: finalDuration,
      eta: finalDuration,
      estimated_minutes: estimatedMinutes || (finalDuration ? parseDurationMinutes(finalDuration) : 0),
      focused_minutes: task?.focused_minutes || 0,
      is_focus: isFocus,
      tags,
      subtasks,
      comments,
      reminder,
      created_at: task?.created_at || new Date().toISOString()
    };

    onSaveTask(taskPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0e121b] border border-neutral-200 dark:border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- MODAL HEADER (Matching Screenshot 2) --- */}
        <div className="px-5 py-3 border-b border-neutral-100 dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#121622]">
          {/* Breadcrumb / Project Selector & ETA Indicator */}
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-neutral-100 dark:bg-white/[0.08] text-neutral-500 dark:text-zinc-300">
              <Inbox className="w-3.5 h-3.5" />
            </span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="text-xs font-semibold bg-transparent text-neutral-800 dark:text-white focus:outline-none cursor-pointer"
            >
              {sections.map(s => (
                <option key={s.key} value={s.key} className="dark:bg-[#0e121b] dark:text-white">
                  {s.label}
                </option>
              ))}
            </select>

            {/* Header ETA / Duration Pill */}
            {(duration || estimatedMinutes) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-300">
                <Hourglass className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>ETA: {duration || formatDuration(estimatedMinutes)}</span>
              </span>
            )}
          </div>

          {/* Quick Controls: Up/Down nav, 3 dots, close */}
          <div className="flex items-center gap-1.5">
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handlePrevTask}
                  disabled={!hasPrev}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-white disabled:opacity-25 rounded-md hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                  title="Previous Task"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTask}
                  disabled={!hasNext}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-white disabled:opacity-25 rounded-md hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                  title="Next Task"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.12] rounded-xl shadow-xl py-1 text-xs">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTask(task.id);
                        onClose();
                      }}
                      className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Task
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(prev => `Copy of ${prev}`);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-neutral-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-white/[0.08] flex items-center gap-2"
                  >
                    Duplicate Task
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- MAIN 2-COLUMN MODAL BODY --- */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-white/[0.08]">
          {/* LEFT CONTENT COLUMN (~65%) */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Task Title Row with Checkbox */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsCompleted(!isCompleted)}
                className="mt-1 text-neutral-300 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shrink-0"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/60" />
                ) : (
                  <Circle className="w-5 h-5 hover:stroke-emerald-500" />
                )}
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Task name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  className={`w-full text-base sm:text-lg font-bold bg-transparent border-0 focus:outline-none placeholder:text-neutral-400 dark:placeholder:text-zinc-500 ${
                    isCompleted ? 'line-through text-neutral-400 dark:text-zinc-500' : 'text-neutral-900 dark:text-white'
                  }`}
                />
              </div>
            </div>

            {/* Description Row (≡ Description) */}
            <div className="space-y-1.5 pl-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 dark:text-zinc-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Description</span>
              </div>
              <textarea
                placeholder="Add context, acceptance criteria, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm bg-neutral-50/60 dark:bg-[#161c2b] border border-neutral-200/80 dark:border-white/[0.1] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-red-500/30 text-neutral-800 dark:text-zinc-200 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 leading-relaxed resize-y"
              />
            </div>

            {/* Subtasks Section (+ Add sub-task) */}
            <div className="space-y-3 pl-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                  Sub-tasks {subtasks.length > 0 && `(${subtasks.filter(s => s.completed).length}/${subtasks.length})`}
                </span>
                {!showSubtaskInput && (
                  <button
                    type="button"
                    onClick={() => setShowSubtaskInput(true)}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add sub-task
                  </button>
                )}
              </div>

              {/* Subtasks List */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-[#161c2b] border border-neutral-200/60 dark:border-white/[0.08]"
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleSubtask(st.id)}
                          className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
                        />
                        <span className={`text-xs ${st.completed ? 'line-through text-neutral-400 dark:text-zinc-500' : 'text-neutral-800 dark:text-zinc-200'}`}>
                          {st.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-1 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Subtask Input */}
              {showSubtaskInput && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Sub-task name..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      } else if (e.key === 'Escape') {
                        setShowSubtaskInput(false);
                      }
                    }}
                    autoFocus
                    className="flex-1 text-xs bg-neutral-50 dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1] rounded-lg px-2.5 py-1.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500/30 placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubtaskInput(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Comments & Activity Section (From Screenshot 2) */}
            <div className="pt-4 border-t border-neutral-100 dark:border-white/[0.08] pl-8 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments & Activity</span>
                </div>
                {loadingComments && (
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-normal">
                    <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                    <span>Syncing cloud...</span>
                  </span>
                )}
              </div>

              {/* Comment Thread List */}
              {comments.length > 0 ? (
                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                  {comments.map((comm) => {
                    const authorName = comm.author || (comm.user_id === currentUserId ? 'You' : 'User');
                    const initial = (authorName.trim()[0] || 'U').toUpperCase();
                    const canDelete = !comm.user_id || comm.user_id === currentUserId;
                    return (
                      <div key={comm.id} className="group flex items-start gap-2.5 text-xs">
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-rose-950/60 text-red-600 dark:text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-transparent dark:border-rose-500/30">
                          {initial}
                        </div>
                        <div className="flex-1 bg-neutral-50 dark:bg-[#161c2b] border border-neutral-200/60 dark:border-white/[0.08] rounded-xl p-2.5 relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-neutral-800 dark:text-white">{authorName}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-neutral-400 dark:text-zinc-400">{comm.timestamp}</span>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comm.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 transition-opacity"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-neutral-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{comm.text || comm.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !loadingComments && (
                  <p className="text-[11px] text-neutral-400 dark:text-zinc-400 italic">No comments yet. Leave a note or update below.</p>
                )
              )}

              {/* Pill-shaped Comment Input (Screenshot 2 exact style) */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-rose-950/60 text-red-600 dark:text-rose-300 flex items-center justify-center text-xs font-bold shrink-0 border border-transparent dark:border-rose-500/30">
                  {session?.user?.email ? session.user.email[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 flex items-center bg-neutral-50 dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1] rounded-full px-3 py-1.5 focus-within:border-red-500/50">
                  <input
                    type="text"
                    placeholder="Leave a comment or task update..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    className="flex-1 text-xs bg-transparent border-0 focus:outline-none text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500"
                  />
                  <div className="flex items-center gap-1.5 ml-2 text-neutral-400 dark:text-zinc-400">
                    <button
                      type="button"
                      className="p-1 hover:text-neutral-600 dark:hover:text-white"
                      title="Attach note or reference"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!newCommentText.trim()}
                      className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 disabled:opacity-30"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT METADATA SIDEBAR (~35%) (Matching Screenshot 2) */}
          <div className="w-full md:w-72 p-5 bg-neutral-50/50 dark:bg-[#0c0f17] space-y-4 shrink-0 text-xs">
            {/* Project / Stage */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Section</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1]">
                <Inbox className="w-4 h-4 text-neutral-500 dark:text-zinc-300" />
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="bg-transparent font-medium text-neutral-800 dark:text-white focus:outline-none w-full cursor-pointer"
                >
                  {sections.map(s => (
                    <option key={s.key} value={s.key} className="dark:bg-[#161c2b] dark:text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Scheduled Date</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1]">
                <Calendar className="w-4 h-4 text-neutral-400 dark:text-zinc-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent font-medium text-neutral-800 dark:text-white focus:outline-none w-full text-xs"
                />
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-white/[0.08] text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-white"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                    setDueDate(tom);
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-white/[0.08] text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-white"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextW = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                    setDueDate(nextW);
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-white/[0.08] text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 dark:hover:text-white"
                >
                  Next Week
                </button>
              </div>
            </div>

            {/* Strict Deadline */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Target Deadline Time</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1]">
                <Clock className="w-4 h-4 text-amber-500" />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="bg-transparent font-medium text-neutral-800 dark:text-white focus:outline-none w-full text-xs"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Priority</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'P1', label: 'P1', color: 'text-red-500 dark:text-red-400', active: 'bg-red-50 dark:bg-red-950/60 border-red-500/50' },
                  { key: 'P2', label: 'P2', color: 'text-amber-500 dark:text-amber-400', active: 'bg-amber-50 dark:bg-amber-950/60 border-amber-500/50' },
                  { key: 'P3', label: 'P3', color: 'text-blue-500 dark:text-blue-400', active: 'bg-blue-50 dark:bg-blue-950/60 border-blue-500/50' },
                  { key: 'P4', label: 'P4', color: 'text-neutral-400 dark:text-zinc-300', active: 'bg-neutral-100 dark:bg-white/[0.1] border-neutral-400 dark:border-white/[0.2]' }
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold flex items-center justify-center gap-1 transition-all ${
                      priority === p.key
                        ? `${p.active} ring-1 ring-red-500/30`
                        : 'border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#161c2b] hover:bg-neutral-100 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <Flag className={`w-3 h-3 ${p.color}`} />
                    <span className={p.color}>{p.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Big 3 Spotlight Pin */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Today's Priority Spotlight</span>
              <button
                type="button"
                onClick={() => setIsFocus(!isFocus)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                  isFocus
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'bg-white dark:bg-[#161c2b] border-neutral-200 dark:border-white/[0.1] text-neutral-600 dark:text-zinc-300 hover:border-neutral-300 dark:hover:border-white/[0.2]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className={`w-3.5 h-3.5 ${isFocus ? 'text-amber-500 fill-amber-500' : 'text-neutral-400 dark:text-zinc-400'}`} />
                  <span>{isFocus ? "Pinned to Today's Big 3" : "Pin to Today's Big 3 Spotlight"}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isFocus ? 'bg-amber-200/60 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200' : 'bg-neutral-100 dark:bg-white/[0.08] text-neutral-400 dark:text-zinc-400'}`}>
                  {isFocus ? 'PINNED' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Labels / Tags */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Labels & Tags</span>
                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-white"
                >
                  + Add
                </button>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-white/[0.08] text-neutral-700 dark:text-zinc-200 border border-transparent dark:border-white/[0.08]"
                  >
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Inline Add Tag */}
              {showTagInput && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. #Design"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(newTagInput);
                        }
                      }}
                      className="flex-1 text-xs px-2 py-1 bg-white dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1] rounded-md text-neutral-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newTagInput)}
                      className="px-2 py-1 bg-neutral-800 dark:bg-white text-white dark:text-black font-semibold text-[10px] rounded-md"
                    >
                      Add
                    </button>
                  </div>
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TAGS.filter(st => !tags.includes(st)).slice(0, 3).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleAddTag(st)}
                        className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:text-zinc-400 underline"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reminders */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-zinc-400">Reminders</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#161c2b] border border-neutral-200 dark:border-white/[0.1]">
                <Clock className="w-4 h-4 text-neutral-400 dark:text-zinc-400" />
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="bg-transparent font-medium text-neutral-800 dark:text-white focus:outline-none w-full text-xs cursor-pointer"
                >
                  <option value="none" className="dark:bg-[#161c2b]">No reminder</option>
                  <option value="at_time" className="dark:bg-[#161c2b]">At time of due date</option>
                  <option value="15m" className="dark:bg-[#161c2b]">15 minutes before</option>
                  <option value="1h" className="dark:bg-[#161c2b]">1 hour before</option>
                  <option value="1d" className="dark:bg-[#161c2b]">1 day before</option>
                </select>
              </div>
            </div>

            {/* ETA / Effort Duration Widget */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-white">
                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                  <Hourglass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>ETA / Effort Duration</span>
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/60 text-indigo-600 dark:text-indigo-300 shadow-2xs">
                  {duration || formatDuration(estimatedMinutes)}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: '15m', mins: 15 },
                  { label: '30m', mins: 30 },
                  { label: '45m', mins: 45 },
                  { label: '1h', mins: 60 },
                  { label: '1.5h', mins: 90 },
                  { label: '2h', mins: 120 },
                  { label: '3h', mins: 180 },
                  { label: '4h', mins: 240 },
                  { label: '1d', mins: 480 },
                ].map(preset => {
                  const isSelected = duration === preset.label || (estimatedMinutes === preset.mins && !duration);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setDuration(preset.label);
                        setEstimatedMinutes(preset.mins);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-white/[0.08] text-slate-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-white/[0.12] border border-slate-200/60 dark:border-white/[0.08]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div className="pt-0.5">
                <input
                  type="text"
                  placeholder="Custom e.g. 1h 45m"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#161c2b] border border-indigo-200/80 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Minute Slider */}
              <div className="pt-0.5">
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={estimatedMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEstimatedMinutes(val);
                    setDuration(formatDuration(val));
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-zinc-400 font-mono">
                  <span>15m</span>
                  <span>1h</span>
                  <span>2h</span>
                  <span>4h</span>
                </div>
              </div>

              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block leading-tight">
                Allocates expected effort on card and board horizon
              </span>
            </div>
          </div>
        </form>

        {/* --- MODAL FOOTER --- */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-neutral-50/80 dark:bg-[#121622]">
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
                className="text-xs font-semibold text-neutral-400 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-neutral-600 dark:text-zinc-300 hover:bg-neutral-200/60 dark:hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 shadow-sm shadow-red-600/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Add Task'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
