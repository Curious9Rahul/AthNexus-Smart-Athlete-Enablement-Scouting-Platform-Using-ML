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
import { Toaster, toast } from 'sonner';
import { AthNexusChat } from './components/AthNexusChat';
import UserManagementPage from './pages/verifier/UserManagementPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, hasProfile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    toast.error('Access Denied', { description: 'You do not have permission to view this page' });
    return <Navigate to="/" replace />;
  }

  // Redirect to profile form if authenticated but no profile (for players)
  if (user?.role === 'player' && !hasProfile && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <main>
        <Hero />
        <ProblemStatement />
        <SolutionOverview />
        <AthleteShowcase />
        <ExplainableAI />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function MainContent() {
  const { isAuthenticated, user, hasProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect after login/signup
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/auth') {
      if (user?.role === 'verifier') {
        navigate('/verifier/event-approval', { replace: true });
      } else if (user?.role === 'player') {
        if (hasProfile) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/profile-setup', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, hasProfile, location, navigate]);

  return (
    <>
      <Navigation onSignInClick={() => navigate('/auth')} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
      
      <Route path="/auth" element={
        <AuthPage 
          onSuccess={() => {}} 
          onCancel={() => navigate('/')} 
        />
      } />

      <Route path="/profile-setup" element={
        <ProtectedRoute allowedRoles={['player']}>
          <ProfileForm 
            onComplete={() => navigate('/dashboard')} 
            onBack={() => {
              logout();
            }} 
          />
        </ProtectedRoute>
      } />

      {/* ATHLETE ROUTES */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['player', 'verifier']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Overview onNavigate={() => {}} />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="my-events" element={<MyEventsPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="create-event" element={<CreateEventPageAthlete />} />
        <Route path="events/:id" element={<EventDetailPage />} />
      </Route>

      {/* VERIFIER ROUTES */}
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
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* Global Toast */}
      <BrowserRouter>
        <Toaster position="top-right" richColors theme="dark" />
        <MainContent />
      </BrowserRouter>
      {/* Floating AI chatbot */}
      <AthNexusChat />
    </AuthProvider>
  );
}

export default App;
