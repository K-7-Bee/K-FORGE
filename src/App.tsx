import { Component, lazy, type ReactNode, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Onboarding } from './components/Onboarding';
import { Button, EmptyState, LinkButton, Spinner } from './components/ui';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const Courses = lazy(() => import('./pages/Courses'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const Lab = lazy(() => import('./pages/Lab'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const TestCenter = lazy(() => import('./pages/TestCenter'));
const TestRun = lazy(() => import('./pages/TestRun').then((m) => ({ default: m.TestRun })));
const PracticalExamPage = lazy(() => import('./pages/TestRun').then((m) => ({ default: m.PracticalExamPage })));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const CustomProjectPage = lazy(() => import('./pages/CustomProjectPage'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const ToolsIndex = lazy(() => import('./pages/Tools').then((m) => ({ default: m.ToolsIndex })));
const ToolPage = lazy(() => import('./pages/Tools').then((m) => ({ default: m.ToolPage })));
const Revision = lazy(() => import('./pages/Revision'));
const Resources = lazy(() => import('./pages/Resources'));
const Planner = lazy(() => import('./pages/Planner'));
const Mentor = lazy(() => import('./pages/Mentor'));
const Profile = lazy(() => import('./pages/Profile'));
const RankArena = lazy(() => import('./pages/RankArena'));
const RankTest = lazy(() => import('./pages/RankArena').then((m) => ({ default: m.RankTest })));
const AchievementsPage = lazy(() => import('./pages/Profile').then((m) => ({ default: m.AchievementsPage })));

class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('K-FORGE page error:', error);
  }
  render() {
    if (this.state.error) {
      return (
        <EmptyState title="Something went wrong on this page" action={<Button onClick={() => { this.setState({ error: undefined }); location.reload(); }}>Reload</Button>}>
          Your progress is saved. Details: {this.state.error.message}
        </EmptyState>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ErrorBoundary>
          <Suspense fallback={<div className="grid min-h-[40vh] place-items-center"><Spinner /></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/path" element={<LearningPath />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:moduleId" element={<ModulePage />} />
              <Route path="/courses/:moduleId/:lessonId" element={<LessonPage />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/lab/:exerciseId" element={<ExercisePage />} />
              <Route path="/tests" element={<TestCenter />} />
              <Route path="/tests/run" element={<TestRun />} />
              <Route path="/tests/practical/:examId" element={<PracticalExamPage />} />
              <Route path="/rank" element={<RankArena />} />
              <Route path="/rank/test" element={<RankTest />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/custom/:id" element={<CustomProjectPage />} />
              <Route path="/projects/:projectId" element={<ProjectPage />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/tools" element={<ToolsIndex />} />
              <Route path="/tools/:toolId" element={<ToolPage />} />
              <Route path="/revision" element={<Revision />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/mentor" element={<Mentor />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="*" element={<EmptyState title="Page not found" action={<LinkButton to="/">Go to dashboard</LinkButton>} />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Onboarding />
      </AppShell>
    </BrowserRouter>
  );
}
