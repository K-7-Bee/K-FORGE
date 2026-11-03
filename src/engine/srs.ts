// Spaced repetition based on SM-2. Difficult cards return sooner; well-known cards return later.
import type { SrsCard } from '../store/types';
import { addDays, dayKey, daysBetween } from './dates';

export type Grade = 0 | 3 | 4 | 5; // again, hard, good, easy
export const GRADE_LABEL: Record<Grade, string> = { 0: 'Again', 3: 'Hard', 4: 'Good', 5: 'Easy' };

export function newCard(
  id: string,
  kind: SrsCard['kind'],
  refId: string,
  topic: string,
  source: SrsCard['source'],
  today = dayKey(),
): SrsCard {
  return { id, kind, refId, topic, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: today, addedAt: new Date().toISOString(), source };
}

export function review(card: SrsCard, grade: Grade, today = dayKey()): SrsCard {
  let { ease, interval, reps, lapses } = card;
  if (grade < 3) {
    reps = 0;
    lapses += 1;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = grade === 5 ? 3 : 1;
    else if (reps === 2) interval = grade === 3 ? 3 : 6;
    else interval = Math.round(interval * ease * (grade === 3 ? 0.8 : grade === 5 ? 1.3 : 1));
    interval = Math.max(1, interval);
  }
  // SM-2 ease update, clamped to [1.3, 3.0]
  ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  ease = Math.min(3.0, Math.max(1.3, ease));
  return { ...card, ease, interval, reps, lapses, due: addDays(today, interval), lastReviewed: new Date().toISOString() };
}

export function isDue(card: SrsCard, today = dayKey()): boolean {
  return card.due <= today;
}

/**
 * Estimated probability of recall now, using an exponential forgetting curve whose
 * stability grows with the scheduled interval. 1 = fresh, below ~0.7 = becoming weak.
 */
export function retention(card: SrsCard, today = dayKey()): number {
  if (!card.lastReviewed) return card.reps === 0 ? 0.5 : 1;
  const elapsed = Math.max(0, daysBetween(dayKey(new Date(card.lastReviewed)), today));
  const stability = Math.max(1, card.interval) / Math.log(1 / 0.85); // R = 0.85 at the due date
  return Math.exp(-elapsed / stability);
}

export function dueQueue(cards: SrsCard[], today = dayKey(), limit = 30): SrsCard[] {
  return cards
    .filter((c) => isDue(c, today))
    .sort((a, b) => (a.due === b.due ? retention(a, today) - retention(b, today) : a.due < b.due ? -1 : 1))
    .slice(0, limit);
}
