import React from 'react';

export const TaktLogo = ({
  className = "h-8 w-auto",
  subtitle,
  onClick,
  href = "/",
  collapsed = false,
  showPro = false
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Takt Emblem */}
      <svg
        viewBox="0 0 32 32"
        className="h-full w-auto aspect-square shrink-0 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="taktEmblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="taktEmblemBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="taktCadenceAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Outer Precision Plate */}
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="7.5"
          fill="url(#taktEmblemBg)"
          stroke="url(#taktEmblemBorder)"
          strokeWidth="1.2"
        />

        {/* Architectural T - Top Crossbar */}
        <rect
          x="7"
          y="8"
          width="18"
          height="3"
          rx="1.5"
          fill="#f8fafc"
        />

        {/* Architectural T - Cadence Stem */}
        <rect
          x="14.5"
          y="8"
          width="3"
          height="8.5"
          rx="1.5"
          fill="#94a3b8"
        />

        {/* Dynamic Cadence Velocity Check / Tempo Vector */}
        <path
          d="M12.5 16.5L16.5 21.5L24.5 11.5"
          stroke="url(#taktCadenceAccent)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Typography & Subtitle */}
      {!collapsed && (
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-baseline font-sans">
            <span className="font-extrabold tracking-[-0.04em] text-lg text-slate-900 dark:text-white leading-none">
              Takt
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5 mb-0.5 inline-block shrink-0"></span>
          </div>

          {showPro && (
            <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded leading-none shrink-0">
              Pro
            </span>
          )}

          {subtitle && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#151d30] border border-slate-200/80 dark:border-[#22304e] px-2 py-0.5 rounded-md leading-none truncate max-w-[130px] shrink-0">
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
        className="inline-flex items-center group cursor-pointer focus:outline-none min-w-0"
      >
        {content}
      </a>
    );
  }

  return content;
};

export const Logo = TaktLogo;
export default TaktLogo;
