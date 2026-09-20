import { describe, expect, it } from 'vitest';
import { DailyMission, HabitItem, ReflectionEntry } from '../../types';
import {
  getHabitCompletionDates,
  getJournalMarkers,
  getJournalItemsForDate,
  getMissionDateKey,
  normalizeMissionDate,
  isHabitCompletedOnDate,
  normalizeHabitDates,
  toggleHabitCompletion,
  toDateKey,
} from '../journalDates';

describe('journal date helpers', () => {
  const today = new Date(2026, 8, 16, 12);

  it('maps legacy weekday completions to the current week dates', () => {
    const habit: HabitItem = {
      id: 'h1',
      name: 'Planning',
      streak: 1,
      targetPerWeek: 7,
      days: [false, true, false, false, false, false, false],
      icon: 'checklist',
      category: 'Focus',
    };

    expect(getHabitCompletionDates(habit, today)).toEqual(['2026-09-15']);
  });

  it('tracks historical completions by date without changing the weekly schedule', () => {
    const habit: HabitItem = {
      id: 'h1',
      name: 'Planning',
      streak: 9,
      targetPerWeek: 7,
      days: [false, false, false, false, false, false, false],
      icon: 'checklist',
      category: 'Focus',
    };
    const date = new Date(2026, 8, 12, 9);

    const completed = toggleHabitCompletion(habit, date, today);

    expect(completed.completedDates).toEqual(['2026-09-12']);
    expect(completed.days).toEqual(habit.days);
    expect(completed.streak).toBe(habit.streak);
    expect(isHabitCompletedOnDate(completed, date, today)).toBe(true);
  });

  it('keeps current-week toggles synchronized with the weekday grid', () => {
    const habit: HabitItem = {
      id: 'h1',
      name: 'Planning',
      streak: 1,
      targetPerWeek: 7,
      days: [false, false, false, false, false, false, false],
      icon: 'checklist',
      category: 'Focus',
    };

    const completed = toggleHabitCompletion(habit, new Date(2026, 8, 16, 9), today);

    expect(completed.days[2]).toBe(true);
    expect(completed.streak).toBe(2);
    expect(completed.completedDates).toContain(toDateKey(today));
  });

  it('normalizes legacy journal dates without dropping existing history', () => {
    const habit: HabitItem = {
      id: 'h1',
      name: 'Planning',
      streak: 2,
      targetPerWeek: 7,
      days: [false, true, false, false, false, false, false],
      completedDates: ['2026-09-10'],
      icon: 'checklist',
      category: 'Focus',
    };
    const mission: DailyMission = {
      id: 'm1',
      title: 'Plan',
      description: '',
      status: 'pending',
      category: 'Focus',
      xp: 100,
    };

    expect(normalizeHabitDates(habit, today)).toEqual({
      ...habit,
      completedDates: ['2026-09-10', '2026-09-15'],
    });
    expect(normalizeHabitDates(habit, today).days).toBe(habit.days);
    expect(normalizeMissionDate(mission, today)).toEqual({ ...mission, date: '2026-09-16' });
  });

  it('aggregates distinct habit, reflection, and mission markers by date', () => {
    const habit: HabitItem = {
      id: 'h1',
      name: 'Planning',
      streak: 1,
      targetPerWeek: 7,
      days: [false, true, false, false, false, false, false],
      icon: 'checklist',
      category: 'Focus',
    };
    const reflection: ReflectionEntry = {
      id: 'r1',
      date: '2026-09-15',
      prompt: 'What changed?',
      content: 'I planned earlier.',
      sentiment: 'constructive',
      tags: [],
    };
    const mission: DailyMission = {
      id: 'm1',
      title: 'Plan early',
      description: '',
      status: 'completed',
      category: 'Focus',
      xp: 100,
      date: '2026-09-15',
    };

    expect(getJournalMarkers([habit], [reflection], [mission], today)).toEqual([
      { date: '2026-09-15', type: 'habit', label: 'Habit completed: Planning' },
      { date: '2026-09-15', type: 'reflection', label: 'Reflection: What changed?' },
      { date: '2026-09-15', type: 'mission', label: 'Mission: Plan early' },
    ]);
  });

  it('filters all date-aware journal sections to the selected date', () => {
    const habit: HabitItem = {
      id: 'h1',
      name: 'Planning',
      streak: 1,
      targetPerWeek: 7,
      days: [false, true, false, false, false, false, false],
      icon: 'checklist',
      category: 'Focus',
    };
    const reflection: ReflectionEntry = {
      id: 'r1',
      date: '2026-09-15',
      prompt: 'What changed?',
      content: 'I planned earlier.',
      sentiment: 'constructive',
      tags: [],
    };
    const mission: DailyMission = {
      id: 'm1',
      title: 'Plan early',
      description: '',
      status: 'completed',
      category: 'Focus',
      xp: 100,
      date: '2026-09-15',
    };

    expect(getJournalItemsForDate([habit], [reflection], [mission], new Date(2026, 8, 15), today)).toEqual({
      habits: [habit],
      reflections: [reflection],
      missions: [mission],
    });
  });

  it('uses today for legacy missions without a date', () => {
    expect(getMissionDateKey({ date: undefined }, today)).toBe('2026-09-16');
    expect(getMissionDateKey({ date: '2026-09-14' }, today)).toBe('2026-09-14');
  });
});
