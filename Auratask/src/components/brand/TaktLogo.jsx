import React from 'react';

export const TaktLogo = ({
  className = "h-7 w-auto",
  subtitle,
  onClick,
  href = "/",
  collapsed = false
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-auto aspect-square shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="taktGraphite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="taktCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
        {/* Background Plate / T-Stem structure */}
        <rect
          x="4"
          y="4"
          width="32"
          height="32"
          rx="8"
          fill="url(#taktGraphite)"
          stroke="#334155"
          strokeWidth="1"
        />
        {/* Precision T Crossbar */}
        <path
          d="M11 13H29"
          stroke="#f8fafc"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* T Stem transitioning into Crimson Cadence Vector */}
        <path
          d="M20 13V27"
          stroke="#94a3b8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M19 23L24 28L31 16"
          stroke="url(#taktCrimson)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!collapsed && (
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-bold tracking-tight text-xl leading-none">
            <span className="text-slate-900 dark:text-white">Takt</span>
            <span className="ml-1.5 text-[10px] tracking-widest uppercase font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
              Pro
            </span>
          </div>
          {subtitle && (
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1 leading-none truncate max-w-[170px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (onClick || href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="inline-flex items-center group cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return content;
};

export const Logo = TaktLogo;
export default TaktLogo;
