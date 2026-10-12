import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * CollapsibleWidget
 * Accessible, keyboard-navigable animated collapsible accordion section.
 * Complies with WAI-ARIA Accordion pattern & ui-ux-pro-max standards.
 */
export function CollapsibleWidget({
  id,
  title,
  icon: Icon,
  badge,
  actions,
  isOpen = true,
  onToggle,
  children,
  className = '',
  contentClassName = '',
  isSubSection = false,
}) {
  const triggerId = `collapsible-trigger-${id}`;
  const contentId = `collapsible-content-${id}`;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onToggle) onToggle();
    }
  };

  return (
    <div className={`collapsible-widget ${className}`}>
      {/* Interactive Accordion Trigger Header */}
      <div
        className={`flex items-center justify-between rounded-xl transition-all ${
          isSubSection
            ? 'py-1.5 px-2 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
            : 'py-2 px-2.5 hover:bg-slate-100/70 dark:hover:bg-white/[0.05]'
        }`}
      >
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          className="flex-1 flex items-center justify-between text-left group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg pr-1"
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <Icon
                className={`${
                  isSubSection ? 'w-3.5 h-3.5' : 'w-4 h-4'
                } text-slate-400 dark:text-[#71717a] group-hover:text-slate-700 dark:group-hover:text-[#e4e4e7] transition-colors shrink-0`}
              />
            )}
            <span
              className={`font-bold tracking-wider uppercase truncate transition-colors ${
                isSubSection
                  ? 'text-[10px] text-slate-400 dark:text-[#71717a] group-hover:text-slate-700 dark:group-hover:text-[#ededed]'
                  : 'text-[11px] text-slate-500 dark:text-[#a1a1aa] group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
            >
              {title}
            </span>
            {badge && (
              <span className="shrink-0 inline-flex items-center">
                {badge}
              </span>
            )}
          </div>

          {/* Rotating Chevron (Smooth 180° rotation on toggle) */}
          <motion.span
            animate={{ rotate: isOpen ? 0 : -180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-slate-400 dark:text-[#71717a] group-hover:text-slate-700 dark:group-hover:text-[#ededed] shrink-0 ml-1.5 p-0.5 rounded flex items-center justify-center"
            aria-hidden="true"
          >
            <ChevronDown className={isSubSection ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </motion.span>
        </button>

        {/* Optional Action Controls (e.g. Clear button, Add button) */}
        {actions && (
          <div
            className="shrink-0 flex items-center pl-1.5"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Smooth Animated Collapsible Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 25 },
                opacity: { duration: 0.18, ease: 'easeOut' },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
                opacity: { duration: 0.15 },
              },
            }}
            style={{ overflow: 'hidden' }}
            className={contentClassName}
          >
            <div className={isSubSection ? 'pt-1 pb-1.5 pl-2' : 'pt-1.5 pb-2'}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollapsibleWidget;
