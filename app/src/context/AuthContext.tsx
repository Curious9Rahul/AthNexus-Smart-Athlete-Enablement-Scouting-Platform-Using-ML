import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Dummy credentials for testing (3 different users)
const DUMMY_CREDENTIALS = [
    {
        email: 'player1@athnexus.com',
        password: 'player123',
        name: 'Alex Johnson',
        sport: 'Basketball',
    },
    {
        email: 'player2@athnexus.com',
        password: 'player123',
        name: 'Sarah Martinez',
        sport: 'Football',
    },
    {
        email: 'player3@athnexus.com',
        password: 'player123',
        name: 'Michael Chen',
        sport: 'Cricket',
    },
];

// User profile interface
export interface UserProfile {
    // Personal Information
    name: string;
    gender: 'Male' | 'Female' | 'Other' | '';
    age: number | '';
    height_cm: number | '';
    weight_kg: number | '';
    bmi: number | '';

    // Academic/Organizational
    department: string;
    year: string;

    // Sport Specific
    sport: string;
    position: string;
    experienceYears: number | '';
    competitionLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' | '';
    tournamentsPlayed: number | '';
    matchesWon: number | '';
    medalsWon: number | '';
    activeStatus: 'Active' | 'Inactive' | '';
    perceivedSkill: number | ''; // 1-10 scale

    // Performance Scores
    achievementScore: number | '';
    participationScore: number | '';
    activityScore: number | '';
    fitnessIndex: number | '';
    talentScore: number | '';

    // Fitness Metrics
    sprint_100m: number | ''; // seconds
    pushups: number | '';
    plank_sec: number | '';
    run_1km: number | ''; // minutes
}

interface User {
    email: string;
    profile: UserProfile | null;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    hasProfile: boolean;
    login: (email: string, password: string) => boolean;
    signup: (email: string, password: string) => boolean;
    logout: () => void;
    updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Load user from localStorage on mount
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('athnexus_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('athnexus_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('athnexus_user');
        }
    }, [user]);

    const login = (email: string, password: string): boolean => {
        // Check if credentials match any of the dummy accounts
        const matchedUser = DUMMY_CREDENTIALS.find(
            (cred) => cred.email === email && cred.password === password
        );

        if (matchedUser) {
            // Check if user already has saved profile in localStorage
            const savedUser = localStorage.getItem('athnexus_user');
            const savedData = savedUser ? JSON.parse(savedUser) : null;

            // If saved user exists and email matches, restore their profile
            if (savedData && savedData.email === matchedUser.email) {
                setUser(savedData);
            } else {
                // New login, create user with no profile
                setUser({ email: matchedUser.email, profile: null });
            }
            return true;
        }
        return false;
    };

    const signup = (email: string, password: string): boolean => {
        // For now, any signup succeeds
        if (email && password.length >= 6) {
            setUser({
                email,
                profile: null,
            });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const updateProfile = (profile: UserProfile) => {
        if (user) {
            setUser({
                ...user,
                profile,
            });
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
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
