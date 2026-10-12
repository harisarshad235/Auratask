-- ============================================================================
-- TAKT / AURATASK SUPABASE PRODUCTION MIGRATION
-- Fixes Multi-Device Sync, Relational Task Comments, ETAs, Deadlines, and RLS
-- ============================================================================

-- 1. Ensure tasks table has all required columns
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    section TEXT NOT NULL DEFAULT 'todo',
    status TEXT DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'P2',
    due_date DATE,
    due_time TEXT DEFAULT '',
    eta TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    estimated_minutes INTEGER DEFAULT 0,
    focused_minutes INTEGER DEFAULT 0,
    deadline TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY['#Work']::TEXT[],
    subtasks JSONB DEFAULT '[]'::JSONB,
    is_focus BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns to existing tasks table if it already exists
DO $$
BEGIN
    -- eta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='eta') THEN
        ALTER TABLE public.tasks ADD COLUMN eta TEXT DEFAULT '';
    END IF;
    -- duration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='duration') THEN
        ALTER TABLE public.tasks ADD COLUMN duration TEXT DEFAULT '';
    END IF;
    -- estimated_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='estimated_minutes') THEN
        ALTER TABLE public.tasks ADD COLUMN estimated_minutes INTEGER DEFAULT 0;
    END IF;
    -- focused_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='focused_minutes') THEN
        ALTER TABLE public.tasks ADD COLUMN focused_minutes INTEGER DEFAULT 0;
    END IF;
    -- deadline
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='deadline') THEN
        ALTER TABLE public.tasks ADD COLUMN deadline TEXT DEFAULT '';
    END IF;
    -- status (alias/sync with section)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='status') THEN
        ALTER TABLE public.tasks ADD COLUMN status TEXT DEFAULT 'todo';
    END IF;
    -- section
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='section') THEN
        ALTER TABLE public.tasks ADD COLUMN section TEXT DEFAULT 'todo';
    END IF;
    -- tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='tags') THEN
        ALTER TABLE public.tasks ADD COLUMN tags TEXT[] DEFAULT ARRAY['#Work']::TEXT[];
    END IF;
    -- is_focus
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='is_focus') THEN
        ALTER TABLE public.tasks ADD COLUMN is_focus BOOLEAN DEFAULT FALSE;
    END IF;
    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='updated_at') THEN
        ALTER TABLE public.tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Create relational task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-performance comment retrieval per task
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_section ON public.tasks(section);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing broken/conflicting policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Tasks full access" ON public.tasks;

DROP POLICY IF EXISTS "Users can view comments on their tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can insert comments on their tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.task_comments;
DROP POLICY IF EXISTS "Task comments full access" ON public.task_comments;

-- 5. Create bulletproof RLS policies for tasks
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Create bulletproof RLS policies for task_comments
CREATE POLICY "Users can view comments on their tasks"
ON public.task_comments FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE public.tasks.id = public.task_comments.task_id 
        AND public.tasks.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert comments on their tasks"
ON public.task_comments FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.tasks
        WHERE public.tasks.id = public.task_comments.task_id
        AND public.tasks.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own comments"
ON public.task_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.task_comments FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE public.tasks.id = public.task_comments.task_id 
        AND public.tasks.user_id = auth.uid()
    )
);

-- 7. Enable Supabase Realtime broadcast on tasks and task_comments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
