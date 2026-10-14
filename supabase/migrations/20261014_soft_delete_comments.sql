-- ==============================================================================
-- 20261014_soft_delete_comments.sql
-- Adds soft deletion support to task_comments table for auditing & data retention
-- ==============================================================================

-- 1. Add soft-deletion tracking columns if not already present
ALTER TABLE public.task_comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.task_comments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Index to accelerate filtering of active comments per task
CREATE INDEX IF NOT EXISTS idx_task_comments_active 
ON public.task_comments(task_id, created_at) 
WHERE deleted_at IS NULL;

-- 3. Update RLS policies so both comment creators and task owners can perform soft-deletion (UPDATE)
DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;
DROP POLICY IF EXISTS "Users can update comments on their tasks" ON public.task_comments;

CREATE POLICY "Users can update comments on their tasks"
ON public.task_comments FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE public.tasks.id = public.task_comments.task_id 
        AND public.tasks.user_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE public.tasks.id = public.task_comments.task_id 
        AND public.tasks.user_id = auth.uid()
    )
);
