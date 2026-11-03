import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getModule } from '../data/curriculum';
import { getExercise } from '../data/lab';
import { dayKey } from '../engine/dates';
import { activeDays } from '../engine/progress';
import { getState, trackMinute } from '../store/store';
import { reportActivity } from './push';
import type { Subject } from '../store/types';

const MODULE_SUBJECT: Record<string, Subject | undefined> = {
  'm-electronics': 'electronics',
  'm-digital': 'electronics',
  'm-c': 'programming',
  'm-cpp': 'programming',
  'm-python': 'programming',
  'm-arch': 'embedded',
  'm-arduino': 'embedded',
  'm-esp32': 'embedded',
  'm-stm32': 'embedded',
  'm-rtos': 'embedded',
  'm-control': 'robotics',
  'm-capstone': 'robotics',
  'm-german': 'german',
};

/** Which subject (if any) the current page counts toward. Dashboards and settings don't count as study. */
export function subjectForPath(path: string): Subject | undefined {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'courses' && parts[1]) return MODULE_SUBJECT[parts[1]];
  if (parts[0] === 'lab' && parts[1]) return MODULE_SUBJECT[getExercise(parts[1])?.moduleId ?? ''];
  if (parts[0] === 'lab' || parts[0] === 'tests' || parts[0] === 'revision' || parts[0] === 'mentor') return 'programming';
  if (parts[0] === 'tools') return parts[1] && ['pid', 'motor-speed', 'feedback-loop', 'encoder'].includes(parts[1]) ? 'robotics' : parts[1] && ['ohms-law', 'voltage-divider', 'resistor-color', 'series-parallel', 'power', 'circuit-builder'].includes(parts[1]) ? 'electronics' : 'embedded';
  if (parts[0] === 'projects') return 'robotics';
  return undefined;
}

export function moduleSubject(moduleId: string): Subject | undefined {
  return MODULE_SUBJECT[getModule(moduleId)?.id ?? ''];
}

/**
 * Counts one study minute for each minute the learner is actively using a learning page:
 * the tab is visible and there was keyboard/mouse/touch input in the last two minutes.
 */
export function useAutoStudyTracker() {
  const location = useLocation();
  const lastInput = useRef(Date.now());
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    const mark = () => (lastInput.current = Date.now());
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const t = setInterval(() => {
      if (!getState().settings.autoTrack) return;
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastInput.current > 120_000) return;
      const subject = subjectForPath(pathRef.current);
      if (subject) trackMinute(subject);
    }, 60_000);
    return () => {
      clearInterval(t);
      events.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);
}

/**
 * In-app reminders via the Notification API (while K-FORGE is open), plus reporting "studied today"
 * to the server so background push reminders are skipped on days the learner already studied.
 */
export function useReminders() {
  useEffect(() => {
    const report = () => {
      const s = getState();
      if (!s.settings.reminders.push) return;
      const day = dayKey();
      const key = `kforge-push-active-${day}`;
      try {
        if (!activeDays(s).has(day) || localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
      } catch {
        return;
      }
      reportActivity(day);
    };
    report();
    const r = setInterval(report, 60_000);
    return () => clearInterval(r);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const s = getState();
      if (!s.settings.reminders.enabled || s.settings.reminders.push) return; // push reminders replace in-app ones
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const key = `kforge-reminded-${dayKey()}`;
      if (hhmm < s.settings.reminders.time) return;
      try {
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
      } catch {
        return;
      }
      if (activeDays(s).has(dayKey())) return; // already studied today
      new Notification('K-FORGE', { body: s.settings.examMode ? 'Exam period: a 15-minute review keeps your knowledge fresh.' : 'Time for today\'s study session — your daily missions are waiting.', icon: '/icon.svg' });
    }, 60_000);
    return () => clearInterval(t);
  }, []);
}
