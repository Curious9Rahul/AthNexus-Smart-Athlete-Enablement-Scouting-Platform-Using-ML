import { useState } from 'react';
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

// Main content component that uses auth context
function MainContent() {
  const { isAuthenticated, hasProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'profile'>('landing');

  // Handle auth state changes
  const handleSignInClick = () => {
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    setCurrentView('profile');
  };

  const handleAuthCancel = () => {
    setCurrentView('landing');
  };

  const handleProfileComplete = () => {
    // Reset view to allow the dashboard to show
    setCurrentView('landing');
  };

  // Show auth page if user clicked sign in
  if (currentView === 'auth' && !isAuthenticated) {
    return <AuthPage onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />;
  }

  // Show dashboard if authenticated with profile
  if (isAuthenticated && hasProfile) {
    return <Dashboard />;
  }

  // Show profile form if authenticated but no profile
  if (isAuthenticated && !hasProfile) {
    return <ProfileForm onComplete={handleProfileComplete} />;
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Top Navigation Bar */}
      <Navigation onSignInClick={handleSignInClick} />

      {/* Main Content Sections */}
      <main>
        <Hero />               {/* Landing area with key value prop */}
        <ProblemStatement />   {/* Why this solution is needed */}
        <SolutionOverview />   {/* High-level features */}
        <AthleteShowcase />    {/* Example profiles */}
        <ExplainableAI />      {/* AI transparency features */}
        <HowItWorks />         {/* Step-by-step process */}
        <CTA />                {/* Call to action */}
      </main>

      {/* Footer with links and copyright */}
      <Footer />
    </div>
  );
}

// Main Application Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;

