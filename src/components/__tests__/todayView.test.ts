import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyMission } from '../../types';
import { TodayView } from '../TodayView';

describe('TodayView mission dates', () => {
  const today = new Date(2026, 8, 15, 12);
  const todayMission: DailyMission = {
    id: 'm-today',
    title: 'Today Mission',
    description: 'Focus for today.',
    status: 'pending',
    category: 'Focus',
    xp: 100,
    date: '2026-09-15',
  };
  const historicalMission: DailyMission = {
    ...todayMission,
    id: 'm-historical',
    title: 'Historical Mission',
    date: '2026-09-14',
  };

  beforeEach(() => vi.setSystemTime(today));
  afterEach(() => vi.useRealTimers());

  it('shows missions dated today instead of historical missions', () => {
    const html = renderToStaticMarkup(
      React.createElement(TodayView, {
        userName: 'user@example.com',
        personaArchetype: 'ARCHETYPE',
        consistencyScore: 50,
        predictiveInsights: false,
        dailyMissions: [historicalMission, todayMission],
        onNavigate: vi.fn(),
        onToggleMission: vi.fn(),
      })
    );

    expect(html).toContain('Today Mission');
    expect(html).not.toContain('Historical Mission');
  });
});
