import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { getTodayDateStr } from '../utils/dateUtils';

/**
 * Custom hook for automatic daily rollover of uncompleted tasks.
 *
 * Criteria for Rollover:
 * - The task is incomplete (`completed === false` and `section !== 'completed'`).
 * - The task has a scheduled/due date strictly in the past (before today's local date `YYYY-MM-DD`).
 * - The task is not archived or soft-deleted.
 *
 * When triggered:
 * 1. Batch updates Supabase `tasks` table with new due_date = todayLocalDate.
 * 2. Updates local React state immediately so rolled-over tasks appear in "Today".
 * 3. Shows a discreet toast notification informing user of the rollover.
 * 4. Schedules a midnight timer to auto-rollover tasks if the tab remains open past midnight.
 *
 * @param {Object} params
 * @param {Array} params.tasks - The current tasks list.
 * @param {Function} params.setTasks - State setter for tasks.
 * @param {Object|null} params.session - Active Supabase session.
 * @param {Function} [params.showToast] - Toast notification function.
 * @param {Function} [params.isTaskDeleted] - Soft deletion check.
 */
export function useTaskRollover({
  tasks,
  setTasks,
  session,
  showToast,
  isTaskDeleted
}) {
  const isRollingOverRef = useRef(false);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const performRollover = useCallback(async () => {
    if (isRollingOverRef.current) return;
    const currentTasks = tasksRef.current;
    if (!Array.isArray(currentTasks) || currentTasks.length === 0) return;

    const todayLocalDate = getTodayDateStr(); // Local YYYY-MM-DD
    const currentUserId = session?.user?.id;

    // 1. Identify rollover-eligible tasks
    const eligibleTasks = currentTasks.filter(task => {
      if (!task || !task.id) return false;

      // Incomplete check
      const isCompleted = task.section === 'completed' || task.status === 'completed' || Boolean(task.completed);
      if (isCompleted) return false;

      // Archived or soft-deleted check
      if (task.is_deleted || task.deleted_at) return false;
      if (isTaskDeleted && isTaskDeleted(task.id, currentUserId, task.title)) return false;

      // Date check: strictly in the past
      const taskDate = task.due_date || task.scheduled_date;
      if (!taskDate || typeof taskDate !== 'string') return false;

      // If scheduled date is strictly before today's local date
      return taskDate < todayLocalDate;
    });

    if (eligibleTasks.length === 0) return;

    isRollingOverRef.current = true;

    try {
      const eligibleIds = eligibleTasks.map(t => t.id);
      const eligibleIdSet = new Set(eligibleIds);
      const nowIso = new Date().toISOString();

      // a) Immediate React state update
      setTasks(prev => {
        const updated = prev.map(t => {
          if (eligibleIdSet.has(t.id)) {
            return {
              ...t,
              due_date: todayLocalDate,
              scheduled_date: todayLocalDate,
              updated_at: nowIso
            };
          }
          return t;
        });

        // Persist to local cache
        try {
          const key = currentUserId ? `takt_tasks_u_${currentUserId}` : 'takt_guest_tasks';
          const backupKey = currentUserId ? `takt_tasks_backup_u_${currentUserId}` : 'takt_guest_tasks_backup';
          const jsonStr = JSON.stringify(updated);
          localStorage.setItem(key, jsonStr);
          localStorage.setItem(backupKey, jsonStr);
        } catch {}

        return updated;
      });

      // b) Supabase batch update for authenticated user tasks
      if (currentUserId) {
        const cloudEligibleIds = eligibleIds.filter(id => {
          return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        });

        if (cloudEligibleIds.length > 0) {
          const { error } = await supabase
            .from('tasks')
            .update({
              due_date: todayLocalDate,
              updated_at: nowIso
            })
            .in('id', cloudEligibleIds);

          if (error) {
            console.warn('Supabase batch rollover notice:', error.message);
          }
        }
      }

      // c) Discreet toast notification
      if (showToast) {
        const count = eligibleTasks.length;
        showToast(`Rolled over ${count} incomplete task${count > 1 ? 's' : ''} to today 🌅`);
      }
    } catch (err) {
      console.error('Task rollover failed:', err);
    } finally {
      isRollingOverRef.current = false;
    }
  }, [session?.user?.id, setTasks, showToast, isTaskDeleted]);

  // Initial rollover check once tasks are loaded
  useEffect(() => {
    if (Array.isArray(tasks) && tasks.length > 0) {
      performRollover();
    }
  }, [tasks?.length, performRollover]);

  // Midnight Auto-Rollover Timer
  useEffect(() => {
    let timerId = null;

    const scheduleNextMidnight = () => {
      const now = new Date();
      // Calculate next local midnight plus 2 seconds buffer
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 2
      );
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

      timerId = setTimeout(async () => {
        await performRollover();
        scheduleNextMidnight(); // Reschedule for next night
      }, msUntilMidnight);
    };

    scheduleNextMidnight();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [performRollover]);

  return { performRollover };
}
