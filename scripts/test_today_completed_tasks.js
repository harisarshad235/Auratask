import assert from 'node:assert';
import {
  formatLocalDate,
  getTodayDateStr,
  getTomorrowDateStr,
  getDaysFromNowStr,
  getLocalDateFromTimestamp,
  normalizeSectionKey,
  isTaskCompletedToday
} from '../src/utils/dateUtils.js';

console.log('🧪 RUNNING TESTS: Today Completed Tasks Filtering & Rollover\n');

const todayStr = getTodayDateStr();
const yesterdayStr = getDaysFromNowStr(-1);
const dayBeforeYesterdayStr = getDaysFromNowStr(-2);
const tomorrowStr = getTomorrowDateStr();

console.log(`Current dates:
  Day Before Yesterday: ${dayBeforeYesterdayStr}
  Yesterday:            ${yesterdayStr}
  Today:                ${todayStr}
  Tomorrow:             ${tomorrowStr}\n`);

// TEST 1: Task completed today with explicit completed_at
const taskCompletedToday = {
  id: 'task-1',
  title: 'Fix issue today',
  section: 'completed',
  completed_at: new Date().toISOString(),
  due_date: todayStr
};
assert.strictEqual(
  isTaskCompletedToday(taskCompletedToday, todayStr),
  true,
  'Task completed today with explicit completed_at must return true for today'
);
console.log('✅ PASS: Task completed today with explicit completed_at is detected as completed today.');

// TEST 2: Task completed yesterday with explicit completed_at
const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const taskCompletedYesterday = {
  id: 'task-2',
  title: 'Task completed yesterday',
  section: 'completed',
  completed_at: yesterdayDate.toISOString(),
  due_date: todayStr, // Even if due_date was today!
  is_focus: true // Even if is_focus was true!
};
assert.strictEqual(
  isTaskCompletedToday(taskCompletedYesterday, todayStr),
  false,
  'Task completed yesterday MUST NOT appear in today completed tasks'
);
console.log('✅ PASS: Task completed yesterday does NOT appear in today completed tasks.');

// TEST 3: Task completed 2 days ago with explicit completed_at
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const taskCompletedTwoDaysAgo = {
  id: 'task-3',
  title: 'Task completed 2 days ago',
  section: 'completed',
  completed_at: twoDaysAgo.toISOString(),
  due_date: dayBeforeYesterdayStr
};
assert.strictEqual(
  isTaskCompletedToday(taskCompletedTwoDaysAgo, todayStr),
  false,
  'Task completed 2 days ago MUST NOT appear in today completed tasks'
);
console.log('✅ PASS: Task completed 2 days ago does NOT appear in today completed tasks.');

// TEST 4: Legacy task without completed_at, but updated_at was yesterday
const taskLegacyYesterday = {
  id: 'task-4',
  title: 'Legacy task completed yesterday without completed_at',
  section: 'completed',
  updated_at: yesterdayDate.toISOString(),
  due_date: todayStr
};
assert.strictEqual(
  isTaskCompletedToday(taskLegacyYesterday, todayStr),
  false,
  'Legacy task with yesterday updated_at MUST NOT appear in today completed tasks'
);
console.log('✅ PASS: Legacy task completed yesterday does NOT appear in today completed tasks.');

// TEST 5: Legacy task completed today without completed_at (updated_at is today)
const taskLegacyToday = {
  id: 'task-5',
  title: 'Legacy task completed today without completed_at',
  section: 'completed',
  updated_at: new Date().toISOString(),
  due_date: todayStr
};
assert.strictEqual(
  isTaskCompletedToday(taskLegacyToday, todayStr),
  true,
  'Legacy task completed today with today updated_at MUST appear in today completed tasks'
);
console.log('✅ PASS: Legacy task completed today appears in today completed tasks.');

// TEST 6: When day passes (midnight), today task should NOT appear tomorrow!
assert.strictEqual(
  isTaskCompletedToday(taskCompletedToday, tomorrowStr),
  false,
  'When day passes, task completed on previous day MUST NOT appear in tomorrow completed tasks'
);
console.log('✅ PASS: When day passes to tomorrow, today completed task no longer appears.');

// TEST 7: Incomplete task should NEVER be detected as completed today
const activeTask = {
  id: 'task-7',
  title: 'Active in-progress task',
  section: 'in_progress',
  due_date: todayStr
};
assert.strictEqual(
  isTaskCompletedToday(activeTask, todayStr),
  false,
  'Active incomplete task must not be treated as completed today'
);
console.log('✅ PASS: Active incomplete task is not treated as completed today.');

// TEST 8: Verify Today Tab filter logic
const allSampleTasks = [
  // 1. Incomplete task due today -> SHOULD appear in Today
  { id: 't1', title: 'Due today todo', section: 'todo', due_date: todayStr },
  // 2. Incomplete task with is_focus -> SHOULD appear in Today
  { id: 't2', title: 'Focus todo', section: 'in_progress', is_focus: true, due_date: tomorrowStr },
  // 3. Task completed TODAY -> SHOULD appear in Today (in Completed column)
  { id: 't3', title: 'Done today', section: 'completed', completed_at: new Date().toISOString(), due_date: todayStr },
  // 4. Task completed YESTERDAY -> MUST NOT appear in Today!
  { id: 't4', title: 'Done yesterday', section: 'completed', completed_at: yesterdayDate.toISOString(), due_date: todayStr, is_focus: true },
  // 5. Task completed 2 days ago -> MUST NOT appear in Today!
  { id: 't5', title: 'Done 2 days ago', section: 'completed', completed_at: twoDaysAgo.toISOString(), due_date: dayBeforeYesterdayStr }
];

function filterTodayTasks(tasks, currentDateStr) {
  return tasks.filter(t => {
    const isCompleted = normalizeSectionKey(t.section) === 'completed';
    if (isCompleted) {
      return isTaskCompletedToday(t, currentDateStr);
    }
    return t.due_date === currentDateStr || Boolean(t.is_focus);
  });
}

const todayFiltered = filterTodayTasks(allSampleTasks, todayStr);
const todayFilteredIds = todayFiltered.map(t => t.id);

assert.deepStrictEqual(
  todayFilteredIds,
  ['t1', 't2', 't3'],
  'Today tab must include active tasks (t1, t2) and task completed today (t3), but exclude yesterday (t4) and 2-days-ago (t5)'
);
console.log('✅ PASS: Today filter correctly includes t1, t2, t3 and excludes t4, t5.');

// When day passes to tomorrow:
const tomorrowFiltered = filterTodayTasks(allSampleTasks, tomorrowStr);
const tomorrowFilteredIds = tomorrowFiltered.map(t => t.id);
assert.ok(!tomorrowFilteredIds.includes('t3'), 't3 completed today must NOT appear tomorrow');
assert.ok(!tomorrowFilteredIds.includes('t4'), 't4 completed yesterday must NOT appear tomorrow');
console.log('✅ PASS: When day passes, previous completed tasks vanish from tomorrow.');

console.log('\n🎉 ALL 8 TESTS PASSED SUCCESSFULLY!\n');
