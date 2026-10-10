import React from 'react';

export const Logo = ({ collapsed = false, className = '', subtitle, onClick, href = '/' }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
    >
      {/* Icon Mark */}
      <div className="relative w-8 h-8 rounded-lg bg-neutral-900 dark:bg-[#0D1A24] border border-neutral-800 dark:border-[#173142] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
        <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="10"
            stroke="currentColor"
            className="text-rose-500 dark:text-cyan-400"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="42 16"
          />
          <path
            d="M11.5 16.5L15 20L21 13"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="10" r="1.5" className="fill-rose-400 dark:fill-cyan-300" />
        </svg>
      </div>

      {/* Typography Lockup (Hidden if collapsed) */}
      {!collapsed && (
        <div className="flex flex-col text-left">
          <span className="text-[17px] font-bold tracking-tight text-neutral-900 dark:text-[#E6F3F8] leading-none">
            Aura<span className="text-rose-600 dark:text-[#2DD4BF] font-semibold">Task</span>
          </span>
          {subtitle && (
            <span className="text-[11px] font-normal text-neutral-500 dark:text-[#7D9BAA] mt-0.5 leading-none">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </a>
  );
};

export default Logo;
