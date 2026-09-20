import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JournalMarker } from '../../lib/journalDates';
import { CalendarPicker } from '../ui/calendar';

describe('CalendarPicker journal markers', () => {
  it('renders distinct accessible markers and a visible legend', () => {
    const date = '2026-09-15';
    const markers: JournalMarker[] = [
      { date, type: 'habit', label: 'Habit completed: Planning' },
      { date, type: 'reflection', label: 'Reflection: What changed?' },
      { date, type: 'mission', label: 'Mission: Plan early' },
    ];

    const html = renderToStaticMarkup(
      React.createElement(CalendarPicker, { mode: 'single', markers, showOutsideDays: false })
    );

    expect(html).toContain('data-marker="habit"');
    expect(html).toContain('data-marker="reflection"');
    expect(html).toContain('data-marker="mission"');
    expect(html).toContain('Habit completed: Planning');
    expect(html).toContain('Reflection: What changed?');
    expect(html).toContain('Mission: Plan early');
    expect(html).toContain('Habit');
    expect(html).toContain('Reflection');
    expect(html).toContain('Mission');
  });
});
