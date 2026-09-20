import { DailyMission, HabitItem, ReflectionEntry } from '../types';

const pad = (value: number): string => String(value).padStart(2, '0');

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date): Date {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
  return monday;
}

function dateInWeek(date: Date, weekStart: Date): boolean {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return target >= weekStart && target < weekEnd;
}

export function getHabitCompletionDates(habit: HabitItem, today: Date): string[] {
  const dates = new Set(habit.completedDates ?? []);
  const weekStart = startOfWeek(today);

  habit.days.forEach((completed, dayIndex) => {
    if (!completed) return;
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    dates.add(toDateKey(date));
  });

  return [...dates].sort();
}

export function isHabitCompletedOnDate(habit: HabitItem, date: Date, today: Date): boolean {
  return getHabitCompletionDates(habit, today).includes(toDateKey(date));
}

export function toggleHabitCompletion(
  habit: HabitItem,
  date: Date,
  today: Date
): HabitItem {
  const dateKey = toDateKey(date);
  const weekStart = startOfWeek(today);
  const completionDates = new Set(getHabitCompletionDates(habit, today));
  const completed = completionDates.has(dateKey);
  const days = [...habit.days];
  let streak = habit.streak;

  if (dateInWeek(date, weekStart)) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const normalizedWeekStart = new Date(weekStart);
    normalizedWeekStart.setHours(0, 0, 0, 0);
    const index = Math.round(
      (normalizedDate.getTime() - normalizedWeekStart.getTime()) / 86_400_000
    );

    if (index >= 0 && index < days.length) {
      days[index] = !completed;
      streak = completed ? Math.max(0, habit.streak - 1) : habit.streak + 1;
    }
  }

  if (completed) {
    completionDates.delete(dateKey);
  } else {
    completionDates.add(dateKey);
  }

  return { ...habit, days, streak, completedDates: [...completionDates].sort() };
}

export function getMissionDateKey(
  mission: Pick<DailyMission, 'date'>,
  today: Date
): string {
  return mission.date ?? toDateKey(today);
}

export function normalizeHabitDates(habit: HabitItem, today: Date): HabitItem {
  return { ...habit, completedDates: getHabitCompletionDates(habit, today) };
}

export function normalizeMissionDate(mission: DailyMission, today: Date): DailyMission {
  return mission.date ? mission : { ...mission, date: toDateKey(today) };
}

export function normalizeJournalDates(
  habits: HabitItem[],
  missions: DailyMission[],
  today: Date
): { habits: HabitItem[]; missions: DailyMission[] } {
  return {
    habits: habits.map((habit) => normalizeHabitDates(habit, today)),
    missions: missions.map((mission) => normalizeMissionDate(mission, today)),
  };
}

export type JournalMarkerType = 'habit' | 'reflection' | 'mission';

export interface JournalMarker {
  date: string;
  type: JournalMarkerType;
  label: string;
}

const markerOrder: Record<JournalMarkerType, number> = {
  habit: 0,
  reflection: 1,
  mission: 2,
};

export function getJournalMarkers(
  habits: HabitItem[],
  reflections: ReflectionEntry[],
  missions: DailyMission[],
  today: Date
): JournalMarker[] {
  const markers: JournalMarker[] = [];

  habits.forEach((habit) => {
    getHabitCompletionDates(habit, today).forEach((date) => {
      markers.push({ date, type: 'habit', label: `Habit completed: ${habit.name}` });
    });
  });

  reflections.forEach((reflection) => {
    markers.push({
      date: reflection.date,
      type: 'reflection',
      label: `Reflection: ${reflection.prompt}`,
    });
  });

  missions.forEach((mission) => {
    markers.push({
      date: getMissionDateKey(mission, today),
      type: 'mission',
      label: `Mission: ${mission.title}`,
    });
  });

  return markers.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    return byDate || markerOrder[a.type] - markerOrder[b.type];
  });
}

export function getJournalItemsForDate(
  habits: HabitItem[],
  reflections: ReflectionEntry[],
  missions: DailyMission[],
  selectedDate: Date,
  today: Date
): { habits: HabitItem[]; reflections: ReflectionEntry[]; missions: DailyMission[] } {
  const dateKey = toDateKey(selectedDate);

  return {
    habits: habits.filter((habit) => isHabitCompletedOnDate(habit, selectedDate, today)),
    reflections: reflections.filter((reflection) => reflection.date === dateKey),
    missions: missions.filter((mission) => getMissionDateKey(mission, today) === dateKey),
  };
}
