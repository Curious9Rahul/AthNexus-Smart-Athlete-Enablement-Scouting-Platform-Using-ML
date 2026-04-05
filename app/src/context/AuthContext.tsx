import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Role type definition
export type Role = 'player' | 'verifier' | 'admin';

export interface UserProfile {
    name: string;
    profileImage?: string;
    gender: 'Male' | 'Female' | 'Other' | '';
    age: number | '';
    height_cm: number | '';
    weight_kg: number | '';
    bmi: number | '';
    department: string;
    year: string;
    sport: string;
    position: string;
    experienceYears: number | '';
    competitionLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' | '';
    tournamentsPlayed: number | '';
    matchesWon: number | '';
    medalsWon: number | '';
    activeStatus: 'Active' | 'Inactive' | '';
    perceivedSkill: number | '';
    achievementScore: number | '';
    participationScore: number | '';
    activityScore: number | '';
    fitnessIndex: number | '';
    talentScore: number | '';
    sprint_100m: number | '';
    pushups: number | '';
    plank_sec: number | '';
    run_1km: number | ''; // minutes
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
}

interface User {
    _id: string;
    email: string;
    name: string;
    role: Role;
    profilePicture?: string;
    profile: UserProfile | null;
}

// Dummy credentials for testing (4 different users)
const DUMMY_CREDENTIALS: { email: string; password: string; name: string; sport?: string; role: Role }[] = [
    {
        email: 'player1@athnexus.com',
        password: 'player123',
        name: 'Alex Johnson',
        sport: 'Basketball',
        role: 'player'
    },
    {
        email: 'player2@athnexus.com',
        password: 'player123',
        name: 'Sarah Martinez',
        sport: 'Football',
        role: 'player'
    },
    {
        email: 'player3@athnexus.com',
        password: 'player123',
        name: 'Michael Chen',
        sport: 'Cricket',
        role: 'player'
    },
    {
        email: 'verifier@athnexus.com',
        password: 'verify123',
        name: 'Raj',
        role: 'verifier'
    },
    {
        email: 'prasad@athnexus.com',
        password: 'prasad123',
        name: 'Prasad Rane',
        role: 'verifier'
    }
];

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasProfile: boolean;
    login: (email: string, password: string) => boolean; // Kept for demo/legacy support
    signup: (email: string, password: string) => boolean; // Kept for demo/legacy support
    logout: () => void;
    updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify Session (JWT Cookie) on Load
    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    credentials: 'include' // Important to send cookies cross-origin
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.isAuthenticated) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Session verification failed", error);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    // Placeholder local login function so the UI doesn't break
    const login = (email: string, password: string): boolean => {
        if (email === 'verifier@athnexus.com' && password === 'verify123') {
            setUser({ _id: '1', email, name: 'Raj', role: 'verifier', profile: null });
            return true;
        }
        if (email.startsWith('player') && password === 'player123') {
            setUser({ _id: '2', email, name: 'Demo Player', role: 'player', profile: null });
            return true;
        }
        return false;
    };

    const signup = (email: string, password: string): boolean => {
        if (email && password.length >= 6) {
            setUser({ _id: Date.now().toString(), email, name: 'New User', role: 'player', profile: null });
            return true;
        }
        return false;
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const updateProfile = async (profile: UserProfile) => {
        if (user) {
            setUser({ ...user, profile });
            try {
                await fetch(`${API_URL}/api/auth/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile),
                    credentials: 'include'
                });
            } catch (error) {
                console.error("Failed to save profile to database", error);
            }
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        hasProfile: !!(user?.profile),
        login,
        signup,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
