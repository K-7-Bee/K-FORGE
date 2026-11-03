// Compact builders for authoring full lessons and their knowledge-check questions.
import type { Difficulty, Flashcard, Lesson, Question } from '../types';

type LessonInput = Omit<Lesson, 'status' | 'minutes' | 'mistakes' | 'flashcards'> & {
  minutes?: number;
  mistakes: [string, string][];
  cards?: [string, string, Flashcard['kind']][];
};

export function L(x: LessonInput): Lesson {
  const { cards, mistakes, minutes, ...rest } = x;
  return {
    ...rest,
    status: 'full',
    minutes: minutes ?? 14,
    mistakes: mistakes.map(([mistake, fix]) => ({ mistake, fix })),
    flashcards: cards?.map(([front, back, kind], i) => ({ id: `fc-${x.id}-${i}`, front, back, kind, topic: x.topic })),
  };
}

type D = Difficulty;
export const sc = (id: string, topic: string, difficulty: D, prompt: string, options: string[], answer: number, explanation: string, extra: Partial<Question> = {}): Question =>
  ({ id, type: 'single', topic, difficulty, prompt, options, answer, explanation, ...extra }) as Question;
export const mc = (id: string, topic: string, difficulty: D, prompt: string, options: string[], answers: number[], explanation: string): Question =>
  ({ id, type: 'multi', topic, difficulty, prompt, options, answers, explanation });
export const tf = (id: string, topic: string, difficulty: D, prompt: string, answer: boolean, explanation: string): Question =>
  ({ id, type: 'truefalse', topic, difficulty, prompt, answer, explanation });
export const num = (id: string, topic: string, difficulty: D, prompt: string, answer: number, unit: string | undefined, explanation: string, tolerance?: number): Question =>
  ({ id, type: 'numeric', topic, difficulty, prompt, answer, unit, explanation, tolerance });
export const out = (id: string, topic: string, difficulty: D, prompt: string, code: string, accepted: string[], explanation: string): Question =>
  ({ id, type: 'output', topic, difficulty, prompt, code, accepted, explanation });
