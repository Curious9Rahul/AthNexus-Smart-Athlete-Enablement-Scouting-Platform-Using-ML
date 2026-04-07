import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import ProblemStatement from './sections/ProblemStatement';
import SolutionOverview from './sections/SolutionOverview';
import AthleteShowcase from './sections/AthleteShowcase';
import ExplainableAI from './sections/ExplainableAI';
import HowItWorks from './sections/HowItWorks';
import CTA from './sections/CTA';
import AuthPage from './pages/AuthPage';
import ProfileForm from './pages/ProfileForm';

// Layouts
import DashboardLayout from './components/DashboardLayout';
import VerifierLayout from './components/VerifierLayout';

// Athlete Pages
import Overview from './pages/dashboard/Overview';
import EventsPage from './pages/dashboard/EventsPage';
import MyEventsPage from './pages/dashboard/MyEventsPage';
import Analytics from './pages/dashboard/Analytics';
import CreateEventPageAthlete from './pages/dashboard/CreateEventPage';
import EventDetailPage from './pages/dashboard/EventDetailPage';

// Verifier Pages
import VerifierEventsPage from './pages/verifier/EventsPage';
import EventApprovalPage from './pages/verifier/EventApprovalPage';
import RegistrationApprovalPage from './pages/verifier/RegistrationApprovalPage';
import EmailAlertsPage from './pages/verifier/EmailAlertsPage';
import CreateEventPageVerifier from './pages/verifier/CreateEventPage';
import SettingsPage from './pages/verifier/SettingsPage';
import EventPlayerSelectionPage from './pages/verifier/EventPlayerSelectionPage';
import { Toaster, toast } from 'sonner';
import { AthNexusChat } from './components/AthNexusChat';
import UserManagementPage from './pages/verifier/UserManagementPage';
import SmartRankingPage from './pages/verifier/SmartRankingPage';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, hasProfile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const userObj = user as any;

  if (allowedRoles && userObj && userObj.role && !allowedRoles.includes(userObj.role)) {
    toast.error('Access Denied', { description: 'You do not have permission to view this page' });
    return <Navigate to="/" replace />;
  }

  if (userObj?.role === 'player' && !hasProfile && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

// Pages that should render the landing-page-specific footer
function LandingContent() {
  return (
    <main>
      <Hero />
      <ProblemStatement />
      <SolutionOverview />
      <AthleteShowcase />
      <ExplainableAI />
      <HowItWorks />
      <CTA />
    </main>
  );
}

function MainContent() {
  const { isAuthenticated, user, hasProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide footer & show plain bg on inner app pages
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/auth') {
      const userObj = user as any;
      if (userObj?.role === 'verifier') {
        navigate('/verifier/event-approval', { replace: true });
      } else {
        if (hasProfile) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/profile-setup', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, hasProfile, location, navigate]);

  return (
    <div className={isLanding ? 'bg-[#0f172a]' : 'bg-[#0f172a] min-h-screen'}>
      {/* ── Global Navigation — visible on ALL pages ─────────────────────── */}
      {!isAuthPage && (
        <Navigation onSignInClick={() => navigate('/auth')} />
      )}

      <Routes>
        {/* ── Landing ────────────────────────────────────────────────────── */}
        <Route path="/" element={
          <>
            <LandingContent />
            <Footer />
          </>
        } />

        {/* ── Auth ───────────────────────────────────────────────────────── */}
        <Route path="/auth" element={
          <AuthPage
            onSuccess={() => {}}
            onCancel={() => navigate('/')}
          />
        } />

        {/* ── Profile Setup ──────────────────────────────────────────────── */}
        <Route path="/profile-setup" element={
          <ProtectedRoute allowedRoles={['player']}>
            <div className="pt-16 lg:pt-20">
              <ProfileForm
                onComplete={() => navigate('/dashboard')}
                onBack={() => {
                  if (hasProfile) {
                    navigate('/dashboard');
                  } else {
                    logout();
                  }
                }}
              />
            </div>
          </ProtectedRoute>
        } />

        {/* ── Athlete Dashboard ──────────────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['player', 'verifier']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="my-events" element={<MyEventsPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="create-event" element={<CreateEventPageAthlete />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ── Verifier Dashboard ─────────────────────────────────────────── */}
        <Route path="/verifier" element={
          <ProtectedRoute allowedRoles={['verifier']}>
            <VerifierLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/verifier/events" replace />} />
          <Route path="events" element={<VerifierEventsPage />} />
          <Route path="event-approval" element={<EventApprovalPage />} />
          <Route path="registration-approval" element={<RegistrationApprovalPage />} />
          <Route path="email-alerts" element={<EmailAlertsPage />} />
          <Route path="create-event" element={<CreateEventPageVerifier />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="smart-ranking" element={<SmartRankingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ── Event Player Selection ─────────────────────────────────────── */}
        <Route path="/events/:eventId/select-players" element={
          <ProtectedRoute allowedRoles={['verifier']}>
            <EventPlayerSelectionPage />
          </ProtectedRoute>
        } />

        {/* ── Fallback ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors theme="dark" />
        <MainContent />
        <AthNexusChat />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
