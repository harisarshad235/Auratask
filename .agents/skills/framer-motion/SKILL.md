---
name: framer-motion
description: "Production-grade Framer Motion animations, micro-interactions, layout transitions, and gesture orchestration for React. Covers motion primitives, variants, AnimatePresence, layout animations, shared layout (layoutId), scroll-driven animations (useScroll, useTransform), spring physics, gesture handling (hover, tap, drag), accessible animations (prefers-reduced-motion), and performance optimization (GPU acceleration, will-change, LayoutGroup)."
---

# Framer Motion Skill

Production patterns, micro-interactions, physics-based springs, and layout animation techniques for React and Framer Motion.

## Table of Contents
1. [Core Principles & Animation Philosophy](#core-principles--animation-philosophy)
2. [Motion Primitives & Basic Transitions](#motion-primitives--basic-transitions)
3. [Variants & Orchestration](#variants--orchestration)
4. [AnimatePresence & Lifecycle Transitions](#animatepresence--lifecycle-transitions)
5. [Layout Animations & Shared Layout (`layoutId`)](#layout-animations--shared-layout-layoutid)
6. [Gestures & Micro-Interactions](#gestures--micro-interactions)
7. [Scroll-Driven Animations (`useScroll`, `useTransform`)](#scroll-driven-animations-usescroll-usetransform)
8. [Accessibility & Reduced Motion](#accessibility--reduced-motion)
9. [Performance Optimization](#performance-optimization)

---

## 1. Core Principles & Animation Philosophy

- **Subtlety Over Flash**: Animations should clarify spatial relationships, confirm actions, and guide attention. They must never delay user intent or feel sluggish.
- **Physics-Based Over Durations**: Prefer `type: "spring"` with curated `stiffness` and `damping` over linear or harsh ease-in-out curves.
- **Standard Spring Presets**:
  - **Snappy / UI Feedback**: `{ type: "spring", stiffness: 400, damping: 30 }`
  - **Smooth / Modal Entrance**: `{ type: "spring", stiffness: 260, damping: 25 }`
  - **Gentle / Background Shift**: `{ type: "spring", stiffness: 120, damping: 20 }`

---

## 2. Motion Primitives & Basic Transitions

Replace HTML elements with `motion` components:

```tsx
import { motion } from "framer-motion";

export const FadeInCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 24,
    }}
    className="rounded-xl border bg-card p-6 shadow-sm"
  >
    {children}
  </motion.div>
);
```

---

## 3. Variants & Orchestration

Use `variants` to keep components clean and coordinate staggered child animations without prop drilling:

```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

export const TaskList = ({ tasks }: { tasks: Array<{ id: string; title: string }> }) => (
  <motion.ul
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-2"
  >
    {tasks.map((task) => (
      <motion.li
        key={task.id}
        variants={itemVariants}
        className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
      >
        {task.title}
      </motion.li>
    ))}
  </motion.ul>
);
```

---

## 4. AnimatePresence & Lifecycle Transitions

Use `AnimatePresence` for unmounting transitions (modals, toasts, conditional tabs, drawers):

```tsx
import { AnimatePresence, motion } from "framer-motion";

export const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
        >
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
```

> **Crucial Rule**: Every direct child of `AnimatePresence` must have a unique, stable `key`.

---

## 5. Layout Animations & Shared Layout (`layoutId`)

Framer Motion calculates bounding client rects and performs FLIP (First, Last, Invert, Play) transforms using CSS transforms.

### Active Tab Pill Indicator (`layoutId`)
```tsx
import { useState } from "react";
import { motion } from "framer-motion";

const tabs = ["All Tasks", "Active", "Completed"];

export const AnimatedTabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-zinc-700"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
};
```

### Auto-Reordering Lists (`layout`)
Add the `layout` prop to list items:
```tsx
<motion.li layout transition={{ type: "spring", stiffness: 350, damping: 30 }}>
  {item.name}
</motion.li>
```

---

## 6. Gestures & Micro-Interactions

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
  className="rounded-lg bg-primary px-4 py-2 font-medium text-white"
>
  Click Me
</motion.button>
```

---

## 7. Scroll-Driven Animations (`useScroll`, `useTransform`)

```tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ScrollParallax = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1, 0.4]);

  return (
    <div ref={ref} className="h-96 overflow-hidden">
      <motion.div style={{ y, opacity }}>
        <h3>Smooth Parallax Content</h3>
      </motion.div>
    </div>
  );
};
```

---

## 8. Accessibility & Reduced Motion

Honor the user's OS accessibility preferences for reduced motion:

```tsx
import { useReducedMotion, motion } from "framer-motion";

export const AccessibleCard = () => {
  const shouldReduceMotion = useReducedMotion();

  const animation = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };

  const initial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 20 };

  return (
    <motion.div initial={initial} animate={animation}>
      Accessible Animated Card
    </motion.div>
  );
};
```

---

## 9. Performance Optimization Checklist

1. **Transform & Opacity Only**: Animate `x`, `y`, `scale`, `rotate`, and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` directly (use `layout` instead).
2. **GPU Acceleration**: Framer Motion automatically promotes `x`/`y`/`scale` to GPU composite layers (`transform: translate3d(...)`).
3. **Hardware Hints**: For complex animations, apply `style={{ willChange: "transform, opacity" }}`.
4. **LayoutGroup**: Wrap multiple isolated lists in `<LayoutGroup id="...">` to prevent unintended cross-component layout interference.
