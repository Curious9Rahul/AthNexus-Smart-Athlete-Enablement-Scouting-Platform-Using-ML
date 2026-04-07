import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, type UserProfile } from '@/context/AuthContext';
import { CheckCircle2, User, Trophy, Activity, Zap } from 'lucide-react';

interface ProfileFormProps {
    onComplete: () => void;
    onBack?: () => void;
}

const ProfileForm = ({ onComplete, onBack }: ProfileFormProps) => {
    const { user, updateProfile, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // Form state initialized with prior data if it exists
    const [formData, setFormData] = useState<UserProfile>(() => {
        if (user?.profile) {
            return {
                ...user.profile,
                name: (user as any).name || user.profile.name || '',
                profileImage: (user as any).profilePicture || user.profile.profileImage || '',
            };
        }
        return {
            name: (user as any)?.name || '',
            profileImage: (user as any)?.profilePicture || '',
            gender: '',
            age: '',
            height_cm: '',
            weight_kg: '',
            bmi: '',
            department: '',
            year: '',
            sport: '',
            position: '',
            experienceYears: '',
            competitionLevel: '',
            tournamentsPlayed: '',
            matchesWon: '',
            medalsWon: '',
            activeStatus: '',
            perceivedSkill: '',
            achievementScore: '',
            participationScore: '',
            activityScore: '',
            fitnessIndex: '',
            talentScore: '',
            sprint_100m: '',
            pushups: '',
            plank_sec: '',
            run_1km: '',
            verificationStatus: 'PENDING'
        };
    });

    // Auto-calculate BMI
    useEffect(() => {
        if (formData.height_cm && formData.weight_kg) {
            const heightM = Number(formData.height_cm) / 100;
            const bmi = Number(formData.weight_kg) / (heightM * heightM);
            setFormData(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
        }
    }, [formData.height_cm, formData.weight_kg]);

    // Populate data when user context updates (fixes placeholders issue)
    useEffect(() => {
        if (user?.profile) {
            setFormData(prev => ({
                ...user.profile!,
                name: (user as any).name || user.profile!.name || prev.name,
                profileImage: (user as any).profilePicture || user.profile!.profileImage || prev.profileImage,
            }));
        } else if (user) {
            // New user case: just ensure name and image from Google are filled
            setFormData(prev => ({
                ...prev,
                name: (user as any).name || prev.name,
                profileImage: (user as any).profilePicture || prev.profileImage,
            }));
        }
    }, [user]);

    const handleChange = (field: keyof UserProfile, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(formData);
        onComplete();
    };

    const steps = [
        { number: 1, title: 'Personal Info', icon: User },
        { number: 2, title: 'Sport Details', icon: Trophy },
        { number: 3, title: 'Performance', icon: Activity },
        { number: 4, title: 'Fitness Metrics', icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {user?.profile ? 'Update Your Profile' : 'Build Your Athlete Profile'}
                    </h1>
                    <p className="text-gray-400">
                        {user?.profile ? 'Keep your details up-to-date for better AI performance insights' : 'Complete your profile to unlock AI-powered performance insights'}
                    </p>

                    {/* Back/Cancel Button */}
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to cancel? You will be logged out and your current progress will be lost.')) {
                                if (onBack) {
                                    onBack();
                                } else {
                                    logout();
                                }
                            }
                        }}
                        className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                    >
                        <span>← Cancel</span>
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isComplete = currentStep > step.number;

                            return (
                                <div key={step.number} className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isComplete
                                        ? 'bg-lime-400 text-[#0f172a]'
                                        : isActive
                                            ? 'bg-lime-400/20 border-2 border-lime-400 text-lime-400'
                                            : 'bg-white/5 border-2 border-white/10 text-gray-400'
                                        }`}>
                                        {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                    </div>
                                    <span className={`text-xs font-medium ${isActive || isComplete ? 'text-white' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-lime-400 h-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="glass-dark rounded-2xl p-6 md:p-8 border border-white/10">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-lime-400" />
                                    Personal Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name" className="text-white mb-2 block">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="profileImage" className="text-white mb-2 block">Profile Image URL (Optional)</Label>
                                        <Input
                                            id="profileImage"
                                            value={formData.profileImage || ''}
                                            onChange={(e) => handleChange('profileImage', e.target.value)}
                                            placeholder="Enter image URL or leave blank for default avatar"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="gender" className="text-white mb-2 block">Gender *</Label>
                                        <select
                                            id="gender"
                                            value={formData.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="w-full h-10 bg-white/5 border border-white/10 rounded-md text-white px-3"
                                            required
                                        >
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="age" className="text-white mb-2 block">Age *</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            min="10"
                                            max="100"
                                            value={formData.age}
                                            onChange={(e) => handleChange('age', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="height" className="text-white mb-2 block">Height (cm) *</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            min="100"
                                            max="250"
                                            step="0.1"
                                            value={formData.height_cm}
                                            onChange={(e) => handleChange('height_cm', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="weight" className="text-white mb-2 block">Weight (kg) *</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            min="20"
                                            max="300"
                                            step="0.1"
                                            value={formData.weight_kg}
                                            onChange={(e) => handleChange('weight_kg', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="bmi" className="text-white mb-2 block">BMI (Auto-calculated)</Label>
                                        <Input
                                            id="bmi"
                                            type="number"
                                            value={formData.bmi}
                                            readOnly
                                            className="bg-white/5 border-white/10 text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="department" className="text-white mb-2 block">Department *</Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="year" className="text-white mb-2 block">Year *</Label>
                                        <Input
                                            id="year"
                                            value={formData.year}
                                            onChange={(e) => handleChange('year', e.target.value)}
                                            placeholder="e.g., Sophomore, 2nd Year"
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Sport Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-lime-400" />
                                    Sport Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="sport" className="text-white mb-2 block">Sport *</Label>
                                        <Input
                                            id="sport"
                                            value={formData.sport}
                                            onChange={(e) => handleChange('sport', e.target.value)}
                                            placeholder="e.g., Basketball, Soccer"
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="position" className="text-white mb-2 block">Position *</Label>
                                        <Input
                                            id="position"
                                            value={formData.position}
                                            onChange={(e) => handleChange('position', e.target.value)}
                                            placeholder="e.g., Forward, Midfielder"
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="experience" className="text-white mb-2 block">Experience (Years) *</Label>
                                        <Input
                                            id="experience"
                                            type="number"
                                            min="0"
                                            max="80"
                                            value={formData.experienceYears}
                                            onChange={(e) => handleChange('experienceYears', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="competitionLevel" className="text-white mb-2 block">Competition Level *</Label>
                                        <select
                                            id="competitionLevel"
                                            value={formData.competitionLevel}
                                            onChange={(e) => handleChange('competitionLevel', e.target.value)}
                                            className="w-full h-10 bg-white/5 border border-white/10 rounded-md text-white px-3"
                                            required
                                        >
                                            <option value="">Select...</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Professional">Professional</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="tournaments" className="text-white mb-2 block">Tournaments Played</Label>
                                        <Input
                                            id="tournaments"
                                            type="number"
                                            min="0"
                                            max="10000"
                                            value={formData.tournamentsPlayed}
                                            onChange={(e) => handleChange('tournamentsPlayed', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="matches" className="text-white mb-2 block">Matches Won</Label>
                                        <Input
                                            id="matches"
                                            type="number"
                                            min="0"
                                            max="10000"
                                            value={formData.matchesWon}
                                            onChange={(e) => handleChange('matchesWon', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="medals" className="text-white mb-2 block">Medals Won</Label>
                                        <Input
                                            id="medals"
                                            type="number"
                                            min="0"
                                            max="1000"
                                            value={formData.medalsWon}
                                            onChange={(e) => handleChange('medalsWon', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="activeStatus" className="text-white mb-2 block">Active Status *</Label>
                                        <select
                                            id="activeStatus"
                                            value={formData.activeStatus}
                                            onChange={(e) => handleChange('activeStatus', e.target.value)}
                                            className="w-full h-10 bg-white/5 border border-white/10 rounded-md text-white px-3"
                                            required
                                        >
                                            <option value="">Select...</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="skill" className="text-white mb-2 block">Perceived Skill (1-10) *</Label>
                                        <Input
                                            id="skill"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.perceivedSkill}
                                            onChange={(e) => handleChange('perceivedSkill', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Performance Scores */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-lime-400" />
                                    Performance Scores
                                </h2>
                                <p className="text-gray-400 text-sm mb-4">
                                    Rate yourself on a scale of 0-100 for each category
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="achievement" className="text-white mb-2 block">Achievement Score</Label>
                                        <Input
                                            id="achievement"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.achievementScore}
                                            onChange={(e) => handleChange('achievementScore', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="participation" className="text-white mb-2 block">Participation Score</Label>
                                        <Input
                                            id="participation"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.participationScore}
                                            onChange={(e) => handleChange('participationScore', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="activity" className="text-white mb-2 block">Activity Score</Label>
                                        <Input
                                            id="activity"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.activityScore}
                                            onChange={(e) => handleChange('activityScore', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fitness" className="text-white mb-2 block">Fitness Index</Label>
                                        <Input
                                            id="fitness"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.fitnessIndex}
                                            onChange={(e) => handleChange('fitnessIndex', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="talent" className="text-white mb-2 block">Talent Score</Label>
                                        <Input
                                            id="talent"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.talentScore}
                                            onChange={(e) => handleChange('talentScore', e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Fitness Metrics */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-lime-400" />
                                    Fitness Metrics
                                </h2>
                                <p className="text-gray-400 text-sm mb-4">
                                    Enter your best recorded performance for each metric
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="sprint" className="text-white mb-2 block">100m Sprint (seconds)</Label>
                                        <Input
                                            id="sprint"
                                            type="number"
                                            min="5"
                                            max="30"
                                            step="0.01"
                                            value={formData.sprint_100m}
                                            onChange={(e) => handleChange('sprint_100m', e.target.value)}
                                            placeholder="e.g., 12.5"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pushups" className="text-white mb-2 block">Pushups (count)</Label>
                                        <Input
                                            id="pushups"
                                            type="number"
                                            min="0"
                                            max="500"
                                            value={formData.pushups}
                                            onChange={(e) => handleChange('pushups', e.target.value)}
                                            placeholder="e.g., 50"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="plank" className="text-white mb-2 block">Plank (seconds)</Label>
                                        <Input
                                            id="plank"
                                            type="number"
                                            min="0"
                                            max="3600"
                                            value={formData.plank_sec}
                                            onChange={(e) => handleChange('plank_sec', e.target.value)}
                                            placeholder="e.g., 120"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="run" className="text-white mb-2 block">1km Run (minutes)</Label>
                                        <Input
                                            id="run"
                                            type="number"
                                            min="2"
                                            max="15"
                                            step="0.01"
                                            value={formData.run_1km}
                                            onChange={(e) => handleChange('run_1km', e.target.value)}
                                            placeholder="e.g., 4.5"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-8">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    onClick={handlePrev}
                                    variant="outline"
                                    className="flex-1 border-white/20 text-white hover:bg-white/5"
                                >
                                    Previous
                                </Button>
                            )}

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                                >
                                    Next Step
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1 bg-lime-400 hover:bg-lime-500 text-[#0f172a] font-semibold"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {user?.profile ? 'Update Profile' : 'Complete Profile'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;

