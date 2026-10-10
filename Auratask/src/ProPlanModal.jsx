import React from 'react';
import { X, Check, Info, Sparkles, ArrowRight } from 'lucide-react';

export default function ProPlanModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-sm bg-[#fdfbf7] dark:bg-[#0e1422] border border-amber-900/10 dark:border-[#22304e] rounded-3xl p-7 shadow-2xl relative text-slate-800 dark:text-[#f1f5f9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 dark:text-[#8899b5] dark:hover:text-[#f1f5f9] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header (Screenshot 1 exact style) */}
        <h3 className="text-xl font-bold text-[#342e27] dark:text-[#f1f5f9] mb-5 pr-6">
          Get more with the Pro plan
        </h3>

        {/* Feature List (Exact bullets from Screenshot 1) */}
        <ul className="space-y-3.5 text-sm text-[#473e35] dark:text-[#8899b5]">
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">300 projects</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">Unlimited Focus & Flow sessions</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">Custom reminders & task deadlines</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">Calendar layouts & time-blocking</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">150 filter views</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">Unlimited activity history</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="font-medium text-slate-700 dark:text-[#f1f5f9]">Aura Assist AI tools</span>
          </li>
        </ul>

        {/* Learn More & CTA */}
        <div className="mt-6 pt-4 border-t border-amber-900/10 dark:border-[#22304e] space-y-3">
          <button
            onClick={() => {
              alert('AuraTask Pro features unlocked in demo preview!');
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Unlock AuraTask Pro</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#786b5e] dark:text-[#8899b5] cursor-pointer hover:underline">
            <Info className="w-3.5 h-3.5" />
            <span>Learn more about Pro features</span>
          </div>
        </div>
      </div>
    </div>
  );
}
