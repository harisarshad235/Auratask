import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X, Plus, Trash2, Copy, Download, Save, Check, Clock, Search,
  Bold, Italic, List, ListOrdered, CheckSquare, Heading, Heading1, Heading2,
  Quote, Code, Minus, BookOpen, Eye, Edit3, Sparkles, Cloud, CloudCheck, HardDrive
} from 'lucide-react';

export default function MeetingScratchpad({
  isOpen,
  onClose,
  notes,
  onSaveNote,
  onDeleteNote,
  onCreateNote,
  session,
  darkMode
}) {
  const [activeNoteId, setActiveNoteId] = useState(() => notes[0]?.id || null);
  const [activeViewMode, setActiveViewMode] = useState('write'); // 'write' or 'preview'
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved' | 'idle'
  const textareaRef = useRef(null);

  // Synchronize active note if current note was deleted or if notes change
  useEffect(() => {
    if (!notes.find(n => n.id === activeNoteId)) {
      setActiveNoteId(notes[0]?.id || null);
    }
  }, [notes, activeNoteId]);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  // Update local inputs when activeNote changes
  useEffect(() => {
    if (activeNote) {
      setTitleInput(activeNote.title || '');
      setContentInput(activeNote.content || '');
      setSaveStatus('saved');
    }
  }, [activeNote?.id]);

  // Debounced auto-save
  useEffect(() => {
    if (!activeNote) return;
    if (titleInput === activeNote.title && contentInput === activeNote.content) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      onSaveNote({
        ...activeNote,
        title: titleInput || 'Untitled Meeting Note',
        content: contentInput,
        updated_at: new Date().toISOString()
      });
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [titleInput, contentInput, activeNote, onSaveNote]);

  if (!isOpen) return null;

  // --- TEXT FORMATTING ACTIONS ---
  const insertFormatting = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = contentInput;
    const selected = text.substring(start, end);

    let replacement = '';
    let newCursorPos = start;

    switch (type) {
      case 'bullet':
        if (selected) {
          replacement = selected.split('\n').map(line => `• ${line}`).join('\n');
        } else {
          replacement = '• ';
        }
        break;
      case 'checklist':
        if (selected) {
          replacement = selected.split('\n').map(line => `- [ ] ${line}`).join('\n');
        } else {
          replacement = '- [ ] ';
        }
        break;
      case 'number':
        if (selected) {
          replacement = selected.split('\n').map((line, idx) => `${idx + 1}. ${line}`).join('\n');
        } else {
          replacement = '1. ';
        }
        break;
      case 'bold':
        replacement = selected ? `**${selected}**` : '**bold text**';
        break;
      case 'italic':
        replacement = selected ? `*${selected}*` : '*italic text*';
        break;
      case 'h1':
        replacement = selected ? `# ${selected}` : '# Meeting Title\n';
        break;
      case 'h2':
        replacement = selected ? `## ${selected}` : '## Agenda Item\n';
        break;
      case 'h3':
        replacement = selected ? `### ${selected}` : '### Action Items\n';
        break;
      case 'quote':
        replacement = selected ? `> ${selected}` : '> Key takeaway or quote\n';
        break;
      case 'code':
        replacement = selected ? `\`${selected}\`` : '```\ncode or payload\n```';
        break;
      case 'divider':
        replacement = '\n---\n';
        break;
      default:
        break;
    }

    const updated = text.substring(0, start) + replacement + text.substring(end);
    setContentInput(updated);
    newCursorPos = start + replacement.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 1-Click Copy Markdown
  const handleCopyNote = () => {
    const fullText = `# ${titleInput}\n\n${contentInput}`;
    navigator.clipboard.writeText(fullText);
  };

  // Download Note as .md file
  const handleDownloadNote = () => {
    const fullText = `# ${titleInput}\n\n${contentInput}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(titleInput || 'meeting-notes').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter notes by search
  const filteredNotesList = notes.filter(n => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl h-screen bg-white dark:bg-[#0e121b] border-l border-slate-200 dark:border-white/[0.1] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER BAR --- */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#121622] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Meeting Scratchpad</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-zinc-200">
                  {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-400">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-amber-500 font-semibold animate-pulse">
                    <Clock className="w-3 h-3" /> Saving to database...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <Check className="w-3 h-3 stroke-[3]" /> {session ? 'Saved to Cloud Database' : 'Saved to Local Cache'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreateNote}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
              title="Close Scratchpad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- MAIN SPLIT BODY (NOTES SIDEBAR + EDITOR) --- */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* 1. LEFT NOTES ARCHIVE LIST */}
          <div className="w-64 border-r border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#0c0f17] flex flex-col shrink-0">
            {/* Search filter */}
            <div className="p-3 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#161c2b] text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] focus:outline-none focus:border-red-500 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Note items scroll area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredNotesList.map(note => {
                const isSelected = note.id === activeNoteId;
                const dateLabel = note.updated_at
                    ? new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Today';

                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer border text-left group ${
                      isSelected
                        ? 'bg-white dark:bg-[#161c2b] border-red-500/50 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-xs font-bold truncate max-w-[140px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {note.title || 'Untitled Note'}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-400 shrink-0">
                        {dateLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {note.content || 'Empty note...'}
                    </p>
                  </div>
                );
              })}

              {filteredNotesList.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
                  No notes found
                </div>
              )}
            </div>
          </div>

          {/* 2. RIGHT NOTE EDITOR / VIEWER */}
          {activeNote ? (
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0e121b]">
              
              {/* Note Action Toolbar */}
              <div className="p-3 border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-[#121622]">
                {/* Title Input */}
                <input
                  type="text"
                  placeholder="Meeting Title (e.g. Q4 Sprint Planning)..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="flex-1 min-w-[200px] bg-transparent text-sm font-extrabold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />

                {/* Top Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-white/[0.08] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.1]">
                    <button
                      onClick={() => setActiveViewMode('write')}
                      className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${activeViewMode === 'write' ? 'bg-white dark:bg-[#161c2b] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-zinc-400'}`}
                      title="Edit mode"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="hidden sm:inline">Write</span>
                    </button>
                    <button
                      onClick={() => setActiveViewMode('preview')}
                      className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${activeViewMode === 'preview' ? 'bg-white dark:bg-[#161c2b] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-zinc-400'}`}
                      title="Formatted Preview"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyNote}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                    title="Copy Markdown"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleDownloadNote}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                    title="Download .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {notes.length > 1 && (
                    <button
                      onClick={() => onDeleteNote(activeNote.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* RICH TEXT FORMATTING TOOLBAR */}
              {activeViewMode === 'write' && (
                <div className="px-3 py-2 border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center gap-1 bg-slate-50/70 dark:bg-[#0c0f17]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 mr-1.5">Format:</span>
                  
                  {/* Bullets */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('bullet')}
                    className="px-2 py-1 text-xs font-semibold rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200 flex items-center gap-1 border border-transparent hover:border-slate-300 dark:hover:border-white/[0.12]"
                    title="Bullet Point (•)"
                  >
                    <List className="w-3.5 h-3.5 text-red-500" />
                    <span>Bullet</span>
                  </button>

                  {/* Checklist */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('checklist')}
                    className="px-2 py-1 text-xs font-semibold rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200 flex items-center gap-1 border border-transparent hover:border-slate-300 dark:hover:border-white/[0.12]"
                    title="Action Item Checkbox (- [ ])"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Task</span>
                  </button>

                  {/* Numbered */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('number')}
                    className="px-2 py-1 text-xs font-semibold rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200 flex items-center gap-1 border border-transparent hover:border-slate-300 dark:hover:border-white/[0.12]"
                    title="Numbered List (1.)"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-blue-500" />
                    <span>1. 2. 3.</span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:border-white/[0.1] mx-1"></div>

                  {/* Headings */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('h2')}
                    className="px-1.5 py-1 text-xs font-bold rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Heading (##)"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('h3')}
                    className="px-1.5 py-1 text-xs font-bold rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Sub-heading (###)"
                  >
                    H3
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:border-white/[0.1] mx-1"></div>

                  {/* Bold */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('bold')}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('italic')}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  {/* Quote */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('quote')}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Quote (> quote)"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>

                  {/* Code */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('code')}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Code snippet (`code`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>

                  {/* Divider */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('divider')}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-200"
                    title="Horizontal divider"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* EDITOR / PREVIEW CANVAS */}
              <div className="flex-1 p-4 overflow-y-auto">
                {activeViewMode === 'write' ? (
                  <textarea
                    ref={textareaRef}
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder="Type meeting minutes, agenda items, or takeaways...&#10;&#10;• Click 'Bullet' above to add bullet points&#10;• Click 'Task' to add action item checkboxes&#10;• All changes save automatically to your cloud database"
                    className="w-full h-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed font-mono"
                  />
                ) : (
                  /* Formatted Preview Render */
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-3 leading-relaxed text-slate-800 dark:text-zinc-200">
                    {contentInput.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-3 pt-2 border-t border-slate-100 dark:border-white/[0.08]">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white mt-4">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-4">{line.replace('# ', '')}</h1>;
                      }
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex items-start gap-2 pl-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{line.replace(/^[•\-]\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('- [ ] ') || line.startsWith('[ ] ')) {
                        return (
                          <div key={idx} className="flex items-center gap-2 pl-2 text-slate-700 dark:text-zinc-200">
                            <div className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-white/[0.2] bg-slate-50 dark:bg-[#161c2b]"></div>
                            <span>{line.replace(/^(- \[ \]|\[ \])\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('- [x] ') || line.startsWith('[x] ')) {
                        return (
                          <div key={idx} className="flex items-center gap-2 pl-2 line-through text-slate-400 dark:text-zinc-500">
                            <div className="w-3.5 h-3.5 rounded bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</div>
                            <span>{line.replace(/^(- \[x\]|\[x\])\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="border-l-2 border-amber-500 pl-3 py-1 my-1 italic text-slate-600 dark:text-zinc-300 bg-amber-50/30 dark:bg-amber-950/40 rounded-r">
                            {line.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      if (line === '---') {
                        return <hr key={idx} className="border-slate-200 dark:border-white/[0.08] my-3" />;
                      }
                      if (!line.trim()) {
                        return <div key={idx} className="h-2" />;
                      }
                      return <p key={idx} className="my-1">{line}</p>;
                    })}
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#121622] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {session ? `Synced to Supabase Cloud Account (${session.user.email})` : 'Stored locally (sign in to sync across devices)'}
                  </span>
                </div>
                <span className="font-mono text-[10px]">
                  {contentInput.length} chars • {contentInput.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-400 dark:text-zinc-400">
              No note selected. Click "+ New Note" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
