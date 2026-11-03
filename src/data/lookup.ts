import { EXERCISES } from './lab';
import { getQuestion } from './questions';
import type { Question } from './types';

const labQuestions = new Map<string, Question>();
for (const e of EXERCISES) if (e.kind === 'question') labQuestions.set(e.question.id, e.question);

/** Finds a question in the main bank or inside an auto-graded lab exercise. */
export function findAnyQuestion(id: string): Question | undefined {
  return getQuestion(id) ?? labQuestions.get(id);
}
