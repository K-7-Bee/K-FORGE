import {
  BookOpen,
  Bot,
  CalendarDays,
  ClipboardCheck,
  Crown,
  FlaskConical,
  LayoutDashboard,
  Library,
  type LucideIcon,
  MessageSquareText,
  RotateCcw,
  Route,
  UserRound,
  Wrench,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/path', label: 'Learning Path', short: 'Path', icon: Route },
  { to: '/courses', label: 'Courses', short: 'Courses', icon: BookOpen },
  { to: '/lab', label: 'Engineering Lab', short: 'Lab', icon: FlaskConical },
  { to: '/tests', label: 'Test Center', short: 'Tests', icon: ClipboardCheck },
  { to: '/rank', label: 'Rank Arena', short: 'Rank', icon: Crown },
  { to: '/projects', label: 'Projects', short: 'Projects', icon: Bot },
  { to: '/tools', label: 'Engineering Tools', short: 'Tools', icon: Wrench },
  { to: '/revision', label: 'Revision Center', short: 'Revise', icon: RotateCcw },
  { to: '/resources', label: 'Resource Library', short: 'Library', icon: Library },
  { to: '/planner', label: 'Study Planner', short: 'Planner', icon: CalendarDays },
  { to: '/mentor', label: 'AI Mentor', short: 'Mentor', icon: MessageSquareText },
  { to: '/profile', label: 'Profile & Achievements', short: 'Profile', icon: UserRound },
];

export const MOBILE_PRIMARY = ['/', '/courses', '/lab', '/tests'];
