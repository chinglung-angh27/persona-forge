import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyMission, HabitItem, ReflectionEntry } from '../../types';
import { JournalView } from '../JournalView';

describe('JournalView date filtering', () => {
  const today = new Date(2026, 8, 15, 12);
  const selectedDateKey = '2026-09-15';
  const habit: HabitItem = {
    id: 'h-historical',
    name: 'Historical Habit',
    streak: 1,
    targetPerWeek: 1,
    days: [false, false, false, false, false, false, false],
    completedDates: [selectedDateKey],
    icon: 'checklist',
    category: 'Focus',
  };
  const otherHabit: HabitItem = {
    ...habit,
    id: 'h-other',
    name: 'Other Habit',
    completedDates: ['2026-09-14'],
  };
  const reflection: ReflectionEntry = {
    id: 'r-historical',
    date: selectedDateKey,
    prompt: 'Historical Reflection',
    content: 'Reviewed the day.',
    sentiment: 'constructive',
    tags: [],
  };
  const otherReflection: ReflectionEntry = {
    ...reflection,
    id: 'r-other',
    date: '2026-09-14',
    prompt: 'Other Reflection',
  };
  const mission: DailyMission = {
    id: 'm-historical',
    title: 'Historical Mission',
    description: 'Completed yesterday.',
    status: 'completed',
    category: 'Focus',
    xp: 100,
    date: selectedDateKey,
  };
  const otherMission: DailyMission = {
    ...mission,
    id: 'm-other',
    title: 'Other Mission',
    date: '2026-09-14',
  };

  beforeEach(() => vi.setSystemTime(today));
  afterEach(() => vi.useRealTimers());

  it('renders markers and filters date-aware sections to the selected date', () => {
    const html = renderToStaticMarkup(
      React.createElement(JournalView, {
        habits: [habit, otherHabit],
        onToggleHabitDay: vi.fn(),
        onAddHabit: vi.fn(),
        reflections: [reflection, otherReflection],
        onAddReflection: vi.fn(),
        evolutionItems: [],
        onAddEvolution: vi.fn(),
        missions: [mission, otherMission],
        onToggleMission: vi.fn(),
      })
    );

    expect(html).toContain('data-marker="habit"');
    expect(html).toContain('data-marker="reflection"');
    expect(html).toContain('data-marker="mission"');
    expect(html).toContain('Historical Habit');
    expect(html).toContain('Historical Reflection');
    expect(html).toContain('Historical Mission');
    expect(html).not.toContain('Other Habit');
    expect(html).not.toContain('Other Reflection');
    expect(html).not.toContain('Other Mission');
    expect(html).not.toContain('This Week');
  });
});
