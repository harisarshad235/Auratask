import React, { useState, useEffect } from 'react';
import {
  X, Check, ChevronUp, ChevronDown, MoreHorizontal, Inbox, Calendar,
  Flag, Tag, Clock, Paperclip, Send, Trash2, CheckCircle2, Circle,
  FileText, Sparkles, Star, Lock, CornerDownLeft, Plus, MessageSquare, AlertCircle
} from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  task,
  onSaveTask,
  onDeleteTask,
  allTasks = [],
  onSelectTask,
  defaultSection = 'todo',
  darkMode = false
}) {
  const isEditing = Boolean(task && task.id);

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
  const [reminder, setReminder] = useState('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [isCompleted, setIsCompleted] = useState(false);

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
      setDescription(task.description || '');
      setSection(task.section || defaultSection);
      setPriority(task.priority || 'P4');
      setDueDate(task.due_date || '');
      setDueTime(task.due_time || '');
      setDeadlineTime(task.deadline || '');
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setSubtasks(Array.isArray(task.subtasks) ? task.subtasks : []);
      setComments(Array.isArray(task.comments) ? task.comments : []);
      setReminder(task.reminder || 'none');
      setEstimatedMinutes(task.focused_minutes || 25);
      setIsCompleted(task.section === 'completed');
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
      setEstimatedMinutes(25);
      setIsCompleted(false);
    }
  }, [task, defaultSection, isOpen]);

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

  // Add Comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const commentObj = {
      id: 'comm-' + Date.now(),
      author: 'You',
      text: newCommentText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setComments([...comments, commentObj]);
    setNewCommentText('');
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

    const taskPayload = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      section: isCompleted ? 'completed' : section,
      priority,
      due_date: dueDate,
      due_time: dueTime,
      deadline: deadlineTime,
      tags,
      subtasks,
      comments,
      reminder,
      focused_minutes: estimatedMinutes,
      created_at: task?.created_at || new Date().toISOString()
    };

    onSaveTask(taskPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0e1422] border border-slate-200/90 dark:border-[#22304e] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- MODAL HEADER (Matching Screenshot 2) --- */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-[#22304e] flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#0e1422]/50">
          {/* Breadcrumb / Project Selector */}
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-100 dark:bg-[#151d30] text-slate-500 dark:text-[#8899b5]">
              <Inbox className="w-3.5 h-3.5" />
            </span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 dark:text-[#f1f5f9] focus:outline-none cursor-pointer"
            >
              <option value="todo" className="dark:bg-[#0e1422]">Inbox / To Do</option>
              <option value="in_progress" className="dark:bg-[#0e1422]">In Progress</option>
              <option value="in_review" className="dark:bg-[#0e1422]">In Review</option>
              <option value="completed" className="dark:bg-[#0e1422]">Completed</option>
            </select>
          </div>

          {/* Quick Controls: Up/Down nav, 3 dots, close */}
          <div className="flex items-center gap-1.5">
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handlePrevTask}
                  disabled={!hasPrev}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] disabled:opacity-25 rounded-md hover:bg-slate-100 dark:hover:bg-[#151d30] transition-colors"
                  title="Previous Task"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTask}
                  disabled={!hasNext}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] disabled:opacity-25 rounded-md hover:bg-slate-100 dark:hover:bg-[#151d30] transition-colors"
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
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] rounded-md hover:bg-slate-100 dark:hover:bg-[#151d30] transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-xl shadow-xl py-1 text-xs">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTask(task.id);
                        onClose();
                      }}
                      className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#451010]/40 flex items-center gap-2"
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
                    className="w-full px-3 py-2 text-left text-slate-700 dark:text-[#8899b5] hover:bg-slate-100 dark:hover:bg-[#1d2740] flex items-center gap-2"
                  >
                    Duplicate Task
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] rounded-md hover:bg-slate-100 dark:hover:bg-[#151d30] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- MAIN 2-COLUMN MODAL BODY --- */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-[#22304e]">
          {/* LEFT CONTENT COLUMN (~65%) */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Task Title Row with Checkbox */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsCompleted(!isCompleted)}
                className="mt-1 text-slate-300 dark:text-[#475569] hover:text-emerald-500 transition-colors shrink-0"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-[#063820]" />
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
                  className={`w-full text-base sm:text-lg font-bold bg-transparent border-0 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-[#475569] ${
                    isCompleted ? 'line-through text-slate-400 dark:text-[#475569]' : 'text-slate-900 dark:text-[#f1f5f9]'
                  }`}
                />
              </div>
            </div>

            {/* Description Row (≡ Description) */}
            <div className="space-y-1.5 pl-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-[#8899b5]">
                <FileText className="w-3.5 h-3.5" />
                <span>Description</span>
              </div>
              <textarea
                placeholder="Add context, acceptance criteria, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm bg-slate-50/60 dark:bg-[#151d30]/60 border border-slate-200/80 dark:border-[#22304e] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-red-500/30 text-slate-800 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569] leading-relaxed resize-y"
              />
            </div>

            {/* Subtasks Section (+ Add sub-task) */}
            <div className="space-y-3 pl-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-[#8899b5]">
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
                      className="group flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#151d30]/40 border border-slate-200/60 dark:border-[#22304e]/60"
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleSubtask(st.id)}
                          className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
                        />
                        <span className={`text-xs ${st.completed ? 'line-through text-slate-400 dark:text-[#475569]' : 'text-slate-800 dark:text-[#f1f5f9]'}`}>
                          {st.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity"
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
                    className="flex-1 text-xs bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-[#f1f5f9] focus:outline-none focus:ring-1 focus:ring-red-500/30"
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
                    className="text-xs text-slate-400 hover:text-slate-600 dark:text-[#8899b5]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Comments & Activity Section (From Screenshot 2) */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#22304e] pl-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#8899b5]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments & Activity</span>
              </div>

              {/* Comment Thread List */}
              {comments.length > 0 && (
                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                  {comments.map((comm) => (
                    <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-[#451010] text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {comm.author[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-[#151d30]/50 border border-slate-200/60 dark:border-[#22304e]/60 rounded-xl p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 dark:text-[#f1f5f9]">{comm.author}</span>
                          <span className="text-[10px] text-slate-400 dark:text-[#475569]">{comm.timestamp}</span>
                        </div>
                        <p className="text-slate-600 dark:text-[#8899b5] leading-relaxed">{comm.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pill-shaped Comment Input (Screenshot 2 exact style) */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-[#1d2740] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-[#f1f5f9] shrink-0">
                  U
                </div>
                <div className="flex-1 flex items-center bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-full px-3 py-1.5 focus-within:border-red-500/50">
                  <input
                    type="text"
                    placeholder="Comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    className="flex-1 text-xs bg-transparent border-0 focus:outline-none text-slate-800 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-[#475569]"
                  />
                  <div className="flex items-center gap-1.5 ml-2 text-slate-400 dark:text-[#8899b5]">
                    <button
                      type="button"
                      className="p-1 hover:text-slate-600 dark:hover:text-[#f1f5f9]"
                      title="Attach file"
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
          <div className="w-full md:w-72 p-5 bg-slate-50/50 dark:bg-[#0e1422] space-y-4 shrink-0 text-xs">
            {/* Project / Stage */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#475569]">Project</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e]">
                <Inbox className="w-4 h-4 text-slate-500 dark:text-[#8899b5]" />
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-[#f1f5f9] focus:outline-none w-full cursor-pointer"
                >
                  <option value="todo" className="dark:bg-[#0e1422]">Inbox / To Do</option>
                  <option value="in_progress" className="dark:bg-[#0e1422]">In Progress</option>
                  <option value="in_review" className="dark:bg-[#0e1422]">In Review</option>
                  <option value="completed" className="dark:bg-[#0e1422]">Completed</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#475569]">Date</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e]">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-[#8899b5]" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-[#f1f5f9] focus:outline-none w-full text-xs"
                />
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-[#1d2740] text-slate-700 dark:text-[#8899b5] hover:text-slate-900 dark:hover:text-[#f1f5f9]"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                    setDueDate(tom);
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-[#1d2740] text-slate-700 dark:text-[#8899b5] hover:text-slate-900 dark:hover:text-[#f1f5f9]"
                >
                  Tomorrow
                </button>
              </div>
            </div>

            {/* Deadline (With Pro star badge like Screenshot 2) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 dark:text-[#475569]">Deadline</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-[#452405] text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-current" /> PRO
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e]">
                <Clock className="w-4 h-4 text-amber-500" />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-[#f1f5f9] focus:outline-none w-full text-xs"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#475569]">Priority</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'P1', label: 'P1', color: 'text-red-600 dark:text-red-400', active: 'bg-red-50 dark:bg-[#451010] border-red-500/50' },
                  { key: 'P2', label: 'P2', color: 'text-amber-600 dark:text-amber-400', active: 'bg-amber-50 dark:bg-[#452405] border-amber-500/50' },
                  { key: 'P3', label: 'P3', color: 'text-blue-600 dark:text-blue-400', active: 'bg-blue-50 dark:bg-[#151d30] border-blue-500/50' },
                  { key: 'P4', label: 'P4', color: 'text-slate-400 dark:text-[#8899b5]', active: 'bg-slate-100 dark:bg-[#151d30] border-slate-400' }
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold flex items-center justify-center gap-1 transition-all ${
                      priority === p.key
                        ? `${p.active} ring-1 ring-red-500/30`
                        : 'border-slate-200 dark:border-[#22304e] bg-white dark:bg-[#151d30]/50 hover:bg-slate-100 dark:hover:bg-[#1d2740]'
                    }`}
                  >
                    <Flag className={`w-3 h-3 ${p.color}`} />
                    <span className={p.color}>{p.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Labels / Tags */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 dark:text-[#475569]">Labels</span>
                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-[#8899b5] dark:hover:text-[#f1f5f9]"
                >
                  + Add
                </button>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-[#1d2740] text-slate-700 dark:text-[#8899b5] border border-transparent dark:border-[#22304e]"
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
                      className="flex-1 text-xs px-2 py-1 bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e] rounded-md text-slate-800 dark:text-[#f1f5f9] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newTagInput)}
                      className="px-2 py-1 bg-slate-800 dark:bg-[#f1f5f9] text-white dark:text-[#080c14] font-semibold text-[10px] rounded-md"
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
                        className="text-[10px] text-slate-400 hover:text-slate-700 dark:text-[#8899b5] underline"
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
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#475569]">Reminders</span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#22304e]">
                <Clock className="w-4 h-4 text-slate-400 dark:text-[#8899b5]" />
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-[#f1f5f9] focus:outline-none w-full text-xs cursor-pointer"
                >
                  <option value="none" className="dark:bg-[#0e1422]">No reminder</option>
                  <option value="at_time" className="dark:bg-[#0e1422]">At time of due date</option>
                  <option value="15m" className="dark:bg-[#0e1422]">15 minutes before</option>
                  <option value="1h" className="dark:bg-[#0e1422]">1 hour before</option>
                  <option value="1d" className="dark:bg-[#0e1422]">1 day before</option>
                </select>
              </div>
            </div>

            {/* Focus Session Block (Pomodoro Value-Add) */}
            <div className="p-3 rounded-xl bg-red-50/50 dark:bg-[#451010]/30 border border-red-200/50 dark:border-red-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-red-700 dark:text-red-400">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Focus Session</span>
                <span>{estimatedMinutes}m</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 dark:text-[#8899b5]">Estimate deep work sprint for this task</span>
            </div>
          </div>
        </form>

        {/* --- MODAL FOOTER --- */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-[#22304e] flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-[#0e1422]">
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-red-600 dark:text-[#8899b5] dark:hover:text-red-400 flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-[#451010]/40 transition-colors"
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
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-[#8899b5] hover:bg-slate-200/60 dark:hover:bg-[#151d30] transition-colors"
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
