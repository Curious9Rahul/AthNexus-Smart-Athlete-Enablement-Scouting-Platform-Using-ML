import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthPageProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const AuthPage = ({ onSuccess, onCancel }: AuthPageProps) => {
    const { login, signup } = useAuth();
    const [searchParams] = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Capture OAuth URL Errors
    useEffect(() => {
        const errType = searchParams.get('error');
        const reason = searchParams.get('reason');
        
        let msg = '';
        if (errType === 'account_frozen') msg = 'Your account is currently frozen. Contact support.';
        else if (errType === 'account_banned') msg = 'Your account has been restricted pending investigation.';
        else if (errType) msg = 'Authentication failed.';
        
        if (msg) {
            if (reason) msg += ` Reason: "${reason}"`;
            setError(msg);
        }
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isSignUp) {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
            const success = signup(email, password);
            if (success) {
                onSuccess();
            } else {
                setError('Signup failed. Please try again.');
            }
        } else {
            const success = login(email, password);
            if (success) {
                onSuccess();
            } else {
                setError('Invalid email or password');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0f172a] z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 via-transparent to-lime-400/5 pointer-events-none" />

            {/* Auth Card */}
            <div className="relative w-full max-w-md">
                <div className="glass-dark rounded-2xl p-8 shadow-2xl border border-white/10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center">
                                <span className="text-[#0f172a] font-bold text-xl">S</span>
                            </div>
                            <span className="text-white font-bold text-2xl tracking-tight">
                                Ath<span className="text-lime-400">Nexus</span>
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isSignUp
                                ? 'Sign up to start building your athlete profile'
                                : 'Sign in to access your dashboard'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => {
                                setIsSignUp(false);
                                setError('');
                            }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isSignUp
                                ? 'bg-lime-400 text-[#0f172a]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => {
                                setIsSignUp(true);
                                setError('');
                            }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isSignUp
                                ? 'bg-lime-400 text-[#0f172a]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <Button 
                            type="button"
                            onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                            className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-6 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            Continue with Google
                        </Button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0f172a] px-2 text-gray-500">Or continue with demo email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                            <Label htmlFor="email" className="text-white mb-2 block">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-white mb-2 block">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div>
                                <Label htmlFor="confirmPassword" className="text-white mb-2 block">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {!isSignUp && (
                            <div className="space-y-4 mb-6">
                                <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-4">
                                    <p className="text-lime-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                                        <span>🎮</span> Demo Accounts (Password: player123)
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-white text-xs font-mono">player1@athnexus.com - Alex (Basketball)</p>
                                        <p className="text-white text-xs font-mono">player2@athnexus.com - Sarah (Football)</p>
                                        <p className="text-white text-xs font-mono">player3@athnexus.com - Michael (Cricket)</p>
                                    </div>
                                </div>

                                <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
                                    <p className="text-blue-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" /> Verifier Account (Password: verify123)
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-white text-xs font-mono">verifier@athnexus.com - Raj (Verifier)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold py-6"
                        >
                            {isSignUp ? (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create Account
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign In
                                </>
                            )}
                        </Button>
                        </form>
                    </div>

                    {/* Cancel */}
                    <button
                        onClick={onCancel}
                        className="w-full mt-4 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

