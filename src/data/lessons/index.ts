// Aggregates the full interactive lessons and their knowledge-check questions for every module.
import type { Lesson, Question } from '../types';
import * as electronics from './m-electronics';
import * as digital from './m-digital';
import * as c from './m-c';
import * as cpp from './m-cpp';
import * as arch from './m-arch';
import * as arduino from './m-arduino';
import * as esp32 from './m-esp32';
import * as stm32 from './m-stm32';
import * as rtos from './m-rtos';
import * as control from './m-control';
import * as python from './m-python';
import * as career from './m-career';

const modules: Record<string, unknown>[] = [electronics, digital, c, cpp, arch, arduino, esp32, stm32, rtos, control, python, career];

export const UPGRADED_LESSONS: Lesson[] = modules.flatMap((m) => Object.values(m).filter((v): v is Lesson => typeof v === 'object' && v !== null && 'status' in v && (v as Lesson).status === 'full'));

export const LESSON_QUESTIONS: Question[] = modules.flatMap((m) => Object.values(m).filter(Array.isArray).flat() as Question[]);
