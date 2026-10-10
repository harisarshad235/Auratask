import React from 'react';

export const TaktLogo = ({
  className = "h-7 w-auto",
  subtitle,
  onClick,
  href = "/",
  collapsed = false,
  showPro = false
}) => {
  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox={showPro ? "8 5 116 25" : "8 5 87 25"}
        className={`h-full w-auto shrink-0 ${showPro ? 'aspect-[116/25]' : 'aspect-[87/25]'}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft three-dimensional overlay gradients */}
          <linearGradient id="gRed" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4b55" />
            <stop offset="100%" stopColor="#c51c24" />
          </linearGradient>
          <linearGradient id="gPink" x1="25" y1="0" x2="65" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="gPurple" x1="55" y1="0" x2="105" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="gIndigo" x1="90" y1="0" x2="145" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>

          {/* Subtle shading filter for folding overlaps */}
          <filter id="shadow" x="-5%" y="-5%" width="120%" height="120%">
            <feDropShadow dx="-0.8" dy="1.2" stdDeviation="0.8" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* lowercase "t" */}
        <path
          d="M26 13h-7v4c0 3.5 0.5 5 2.5 5h3.5v4h-5C16 26 14 24 14 18.5V17H10v-4h4V9h5v4h7v4z"
          fill="url(#gRed)"
        />
        <path
          d="M26.5 14.5c-4 0-7.5 1-9.5 3"
          stroke="#ff4b55"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* lowercase "a" */}
        <path
          d="M50 25c-0.5-0.5-0.8-1.5-0.8-2.5V21c0-4.5-3.5-7-7.2-7-5 0-8 3-8 7.5s3.5 7.5 8.2 7.5c2.2 0 4.3-0.8 5.4-2.1L48.2 28h4v-3H50zm-7.3 1c-2.8 0-4.8-1.8-4.8-4.5s1.9-4.5 4.8-4.5c2.6 0 4.6 1.8 4.6 4.5s-2 4.5-4.6 4.5z"
          fill="url(#gPink)"
          filter="url(#shadow)"
        />

        {/* lowercase "k" */}
        <path
          d="M62 6v19c1.5-1.5 3.5-2.8 5.8-2.8 3.5 0 5.2 2 5.2 5.2V28H68v-3.5c0-1.8-1-2.5-2.5-2.5s-2.8 1-3.5 2V28h-5V6h5z"
          fill="url(#gPurple)"
          filter="url(#shadow)"
        />

        {/* lowercase "t" (Rhythm exit fold) */}
        <path
          d="M93 15h-6v3c0 2.5 0.3 3.5 1.8 3.5h3.2v3H88c-4.2 0-5.8-1.8-5.8-5.8v-3.7H79v-3h3.2V11h4.2v3h6.6v3z"
          fill="url(#gIndigo)"
          filter="url(#shadow)"
        />

        {/* PRO Tag - Inline */}
        {showPro && (
          <g>
            <rect x="100" y="11" width="22" height="11" rx="2.5" stroke="#ef4444" strokeWidth="1" opacity="0.8" />
            <text x="111" y="19" fill="#ef4444" fontSize="7" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.3">PRO</text>
          </g>
        )}
      </svg>

      {!collapsed && subtitle && (
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-none truncate max-w-[170px] border-l border-slate-200 dark:border-slate-800 pl-2.5 py-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );

  if (onClick || href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="inline-flex items-center group cursor-pointer focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
};

export const Logo = TaktLogo;
export default TaktLogo;
