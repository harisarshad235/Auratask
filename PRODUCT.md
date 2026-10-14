# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary users are knowledge workers, solo founders, and software engineers seeking high-velocity execution, deep-work Pomodoro cadence, and unified daily planning without heavyweight project management bloat.

## Product Purpose
Takt exists to provide a razor-sharp, zero-friction task command center that merges tactile Kanban workflow, Pomodoro time-blocking cadence, 7-day horizon planning, and meeting notes capture into a unified, high-focus system. Success means users stay locked in flow, eliminate administrative task friction, and finish deep work on time.

## Positioning
A high-velocity, precision task command center contrasting against slow, bloated enterprise issue trackers. It combines an Obsidian-inspired high-contrast aesthetic with local-first instant response times, fluid keyboard-first operations, and real-time cloud sync.

## Operating Context
Daily planning rituals, deep-work sprint execution, meeting debriefs and scratchpads, fast keyboard navigation, and continuous focus intervals across desktop and mobile browsers.

## Capabilities and Constraints
- Tactile Kanban swimlanes (Todo, In Progress, In Review, Done, Backlog).
- Deep focus Pomodoro cadence with customizable focus/break intervals and audio cues.
- 7-Day Horizon calendar view for day-wise time blocking and scheduling.
- Meeting Scratchpad for unstructured notes with instant task conversion.
- Supabase-backed authentication and cloud synchronization with local resilience.
- Keyboard shortcuts and quick-entry modals for minimal friction.
- Non-negotiable technical constraints: React 18, Tailwind CSS v4, Framer Motion animations, Supabase JS, Lucide icons.

## Brand Commitments
- Name: Takt
- Aesthetic: Obsidian high-contrast aesthetic (deep zinc/neutral darks with vibrant focused accents like rose/emerald, clean typography via Plus Jakarta Sans and JetBrains Mono).
- Tone: Focused, disciplined, tactile, architectural, and razor-sharp.
- Assets: Logo mark and wordmark under `src/components/brand/`, dark/light theme switching.

## Evidence on Hand
- Canonical deployment: `https://takt.harisarshad.site/`
- Full functional frontend codebase in `src/` (`App.jsx`, `LandingPage.jsx`, `TaskModal.jsx`, `MeetingScratchpad.jsx`, `src/components/brand/`).
- Author: Haris Arshad.

## Product Principles
1. **Cadence Over Chaos**: Every task moves with precision rhythm; prioritize focused execution over endless backlog grooming.
2. **Instant & Tactile**: Low-latency interactions, fluid drag-and-drop, and crisp feedback make task management tactile rather than bureaucratic.
3. **Deep Work by Design**: Built-in Pomodoro flow and distraction-free modes shield focus time from interruption.
4. **Context Continuity**: Seamlessly transition from raw meeting notes to actionable Kanban items and 7-day scheduled horizons without tool-switching.

## Accessibility & Inclusion
- High-contrast visual modes conforming to WCAG AA color contrast.
- Full keyboard navigation and visible focus rings across interactive elements.
- Semantic HTML and ARIA labels for modal dialogues and drag-and-drop swimlanes.
