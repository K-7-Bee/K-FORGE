import { describe, expect, it } from 'vitest';
import { mergeStates } from '../src/store/merge';
import { defaultState } from '../src/store/persistence';
import type { AppState } from '../src/store/types';

function device(patch: (s: AppState) => void, updatedAt: string): AppState {
  const s = defaultState();
  patch(s);
  s.updatedAt = updatedAt;
  return s;
}

describe('mergeStates', () => {
  const laptop = device((s) => {
    s.xp.push({ key: 'lesson:ohms-law', kind: 'lesson', amount: 10, label: 'L', at: '2026-11-01T10:00:00Z' });
    s.lessons['ohms-law'] = { completedAt: '2026-11-01T10:00:00Z', bestCheck: 67 };
    s.exercises['lab-c-swap'] = { attempts: 2, hintsUsed: 1, evidence: ['ev-a'] };
    s.settings.weeklyHours = 9;
    s.notes.push({ id: 'n1', title: 'old', body: 'x', tags: [], updatedAt: '2026-11-01T00:00:00Z' });
  }, '2026-11-01T12:00:00Z');

  const phone = device((s) => {
    s.xp.push({ key: 'lesson:ohms-law', kind: 'lesson', amount: 10, label: 'L', at: '2026-11-02T10:00:00Z' });
    s.xp.push({ key: 'ex:lab-c-swap', kind: 'code', amount: 20, label: 'E', at: '2026-11-02T11:00:00Z' });
    s.lessons['ohms-law'] = { completedAt: '2026-11-02T10:00:00Z', bestCheck: 100 };
    s.exercises['lab-c-swap'] = { attempts: 1, hintsUsed: 0, solvedAt: '2026-11-02T11:00:00Z', verification: 'compiled', evidence: ['ev-b'] };
    s.settings.weeklyHours = 21;
    s.notes.push({ id: 'n1', title: 'new', body: 'y', tags: [], updatedAt: '2026-11-02T00:00:00Z' });
  }, '2026-11-02T12:00:00Z');

  const m = mergeStates(laptop, phone);

  it('awards each XP key once, keeping the earliest', () => {
    expect(m.xp.filter((t) => t.key === 'lesson:ohms-law')).toHaveLength(1);
    expect(m.xp.find((t) => t.key === 'lesson:ohms-law')!.at).toBe('2026-11-01T10:00:00Z');
    expect(m.xp.some((t) => t.key === 'ex:lab-c-swap')).toBe(true);
  });

  it('keeps earliest completion and best score', () => {
    expect(m.lessons['ohms-law']).toMatchObject({ completedAt: '2026-11-01T10:00:00Z', bestCheck: 100 });
  });

  it('keeps solved exercises solved and unions evidence and hint usage', () => {
    expect(m.exercises['lab-c-swap']).toMatchObject({ solvedAt: '2026-11-02T11:00:00Z', verification: 'compiled', hintsUsed: 1, attempts: 2 });
    expect(m.exercises['lab-c-swap'].evidence.sort()).toEqual(['ev-a', 'ev-b']);
  });

  it('takes preferences from the more recently edited state and the newest note version', () => {
    expect(m.settings.weeklyHours).toBe(21);
    expect(m.notes.find((n) => n.id === 'n1')!.title).toBe('new');
  });

  it('is symmetric for earned progress', () => {
    const r = mergeStates(phone, laptop);
    expect(r.xp.map((t) => t.key).sort()).toEqual(m.xp.map((t) => t.key).sort());
    expect(r.lessons).toEqual(m.lessons);
  });
});
