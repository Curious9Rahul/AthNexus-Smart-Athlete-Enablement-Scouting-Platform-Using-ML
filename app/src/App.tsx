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
import Dashboard from './pages/Dashboard';

import { Toaster, toast } from 'sonner';

/**
 * Cleaned up App.tsx to remove missing Git stash imports
 * and map /dashboard correctly to Dashboard.tsx
 */

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, hasProfile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Typecast bypass for older typescript structures
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

function LandingPage({ onSignInClick }: { onSignInClick: () => void }) {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation onSignInClick={onSignInClick} />
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

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/auth') {
      const userObj = user as any;
      if (userObj?.role === 'verifier') {
        navigate('/verifier', { replace: true });
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
    <Routes>
      <Route path="/" element={<LandingPage onSignInClick={() => navigate('/auth')} />} />
      
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
              if (hasProfile) {
                navigate('/dashboard');
              } else {
                logout();
              }
            }} 
          />
        </ProtectedRoute>
      } />

      {/* ATHLETE & VERIFIER ROUTES */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute allowedRoles={['player', 'verifier']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/verifier/*" element={
        <ProtectedRoute allowedRoles={['verifier']}>
            <div className="text-white p-8 text-center mt-20">
                <h1 className="text-3xl font-bold">Verifier Dashboard</h1>
                <p className="text-gray-400 mt-4">Welcome! This section is currently under construction pending layout restoration.</p>
                <div className="mt-8">
                  <button onClick={() => { logout(); navigate('/'); }} className="bg-lime-400 text-[#0f172a] px-6 py-2 rounded-lg font-bold">Logout</button>
                </div>
            </div>
        </ProtectedRoute>
      } />

      {/* Global Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors theme="dark" />
        <MainContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
