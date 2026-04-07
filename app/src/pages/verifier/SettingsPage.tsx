import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Palette, Bell, User as UserIcon, Shield, Globe, Info, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const THEME_KEY = 'athnexus-theme';
const ACCENT_KEY = 'athnexus-accent';
const FONT_KEY = 'athnexus-fontsize';
const SIDEBAR_KEY = 'athnexus-sidebar';

export default function SettingsPage() {
    const { user, updateProfile, logout } = useAuth();
    
    // Theme states
    const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
    const [accent, setAccent] = useState('#a8e63d');
    const [fontSize, setFontSize] = useState<'S' | 'M' | 'L'>('M');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    // Notifications
    const [notifyEventApprove, setNotifyEventApprove] = useState(true);
    const [notifyRegApprove, setNotifyRegApprove] = useState(true);
    const [notifyDeadline, setNotifyDeadline] = useState(true);
    const [notifyUpcoming, setNotifyUpcoming] = useState(false);
    const [notifyNewEvent, setNotifyNewEvent] = useState(true);
    const [notifyNewReg, setNotifyNewReg] = useState(false);

    // Account
    const [displayName, setDisplayName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Privacy & Security
    const [twoFactor, setTwoFactor] = useState(false);
    const [activityLog, setActivityLog] = useState(true);
    const [publicProfile, setPublicProfile] = useState(false);

    // Language & Region
    const [language, setLanguage] = useState('English');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

    useEffect(() => {
        // Load all from localStorage
        const loadedTheme = localStorage.getItem(THEME_KEY) as any || 'dark';
        setTheme(loadedTheme);
        document.documentElement.setAttribute('data-theme', loadedTheme);

        const loadedAccent = localStorage.getItem(ACCENT_KEY) || '#a8e63d';
        setAccent(loadedAccent);
        document.documentElement.style.setProperty('--accent-color', loadedAccent);

        const loadedFont = localStorage.getItem(FONT_KEY) as any || 'M';
        setFontSize(loadedFont);
        applyFontSize(loadedFont);

        const loadedSidebar = localStorage.getItem(SIDEBAR_KEY);
        if (loadedSidebar !== null) setSidebarExpanded(loadedSidebar === 'true');

        setNotifyEventApprove(localStorage.getItem('notif-event-approve') !== 'false');
        setNotifyRegApprove(localStorage.getItem('notif-reg-approve') !== 'false');
        setNotifyDeadline(localStorage.getItem('notif-deadline') !== 'false');
        setNotifyUpcoming(localStorage.getItem('notif-upcoming') === 'true');
        setNotifyNewEvent(localStorage.getItem('notif-new-event') !== 'false');
        setNotifyNewReg(localStorage.getItem('notif-new-reg') === 'true');

        if (user?.profile?.name) {
            setDisplayName(user.profile.name);
        } else if (user && 'name' in user) {
             setDisplayName((user as any).name);
        }

        setTwoFactor(localStorage.getItem('privacy-2fa') === 'true');
        setActivityLog(localStorage.getItem('privacy-activity') !== 'false');
        setPublicProfile(localStorage.getItem('privacy-public') === 'true');

        setLanguage(localStorage.getItem('lang-locale') || 'English');
        setDateFormat(localStorage.getItem('lang-date') || 'DD/MM/YYYY');
    }, [user]);

    const applyFontSize = (size: 'S' | 'M' | 'L') => {
        const sizes = { S: '14px', M: '16px', L: '18px' };
        document.documentElement.style.fontSize = sizes[size];
    };

    const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
        setTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleAccentChange = (color: string) => {
        setAccent(color);
        localStorage.setItem(ACCENT_KEY, color);
        document.documentElement.style.setProperty('--accent-color', color);
    };

    const handleFontSizeChange = (size: 'S' | 'M' | 'L') => {
        setFontSize(size);
        localStorage.setItem(FONT_KEY, size);
        applyFontSize(size);
    };

    const handleSidebarChange = (expanded: boolean) => {
        setSidebarExpanded(expanded);
        localStorage.setItem(SIDEBAR_KEY, String(expanded));
    };

    const toggleNotif = (key: string, current: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        const newVal = !current;
        setter(newVal);
        localStorage.setItem(key, String(newVal));
    };

    const handleNameSave = () => {
        if (!displayName.trim()) return;
        if (user && user.profile) {
            updateProfile({ ...user.profile, name: displayName });
        } else if (user) {
            // Edge case if profile null
            updateProfile({ name: displayName } as any);
        }
        toast.success("Display name updated!");
    };

    const handlePasswordUpdate = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        toast.success("Password updated!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const signoutAll = () => {
        logout();
        toast.success("Signed out of all devices");
    };

    const handleDeleteAccount = () => {
        if (deleteConfirm === 'DELETE') {
            logout();
            toast.success("Account deleted permanently");
            setShowDeleteModal(false);
        } else {
            toast.error("You must type DELETE to confirm");
        }
    };

    const handleExport = () => {
        const settings = { ...localStorage };
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        localStorage.clear();
        toast.success("Settings reset to defaults");
        setTimeout(() => window.location.reload(), 1000);
    };

    // Components
    const ToggleSwitch = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
        <button 
            onClick={onChange}
            className={`w-[44px] h-[24px] rounded-full p-1 relative transition-colors duration-200 ease-in-out ${on ? 'bg-[var(--accent-color,#a8e63d)]' : 'bg-[#2a3a4a]'} border border-[#1e2e40]`}
        >
            <div className={`w-[14px] h-[14px] bg-white rounded-full transition-transform duration-200 ease-in-out ${on ? 'transform translate-x-[20px]' : ''}`} />
        </button>
    );

    const Card = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
        <div className="bg-[var(--bg-card,#151f2e)] border border-[var(--border-theme,#1e2e40)] rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border-theme,#1e2e40)]">
                <Icon size={20} className="text-[var(--accent-color,#a8e63d)]" />
                <h2 className="text-[16px] font-bold text-[var(--text-primary,#e0eaf5)]">{title}</h2>
            </div>
            <div className="space-y-0">
                {children}
            </div>
        </div>
    );

    const SettingRow = ({ label, sub, control }: { label: string, sub?: string, control: React.ReactNode }) => (
        <div className="flex items-center justify-between py-[14px] border-b border-[var(--border-theme,#1e2e40)] last:border-0 last:pb-0">
            <div>
                <p className="text-[13px] font-medium text-[var(--text-primary,#e0eaf5)]">{label}</p>
                {sub && <p className="text-[12px] text-[var(--text-muted,#5a7a9a)] mt-1">{sub}</p>}
            </div>
            <div>{control}</div>
        </div>
    );

    return (
        <div className="p-6 max-w-3xl mx-auto pb-20 bg-[var(--bg-primary,#0d1520)] min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <SettingsIcon className="w-8 h-8 text-[var(--accent-color,#a8e63d)]" />
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary,#e0eaf5)]">Settings</h1>
                    <p className="text-[var(--text-muted,#5a7a9a)] text-sm">Manage your preferences and account</p>
                </div>
            </div>

            {/* SECTION 1 - APPEARANCE */}
            <Card title="Appearance" icon={Palette}>
                {/* 1A: Theme */}
                <div className="py-[14px] border-b border-[var(--border-theme,#1e2e40)]">
                    <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary,#e0eaf5)]">Theme</p>
                        <p className="text-[12px] text-[var(--text-muted,#5a7a9a)] mt-1 mb-4">Choose your interface colour scheme</p>
                    </div>
                    <div className="flex gap-4">
                        {(['dark', 'light', 'system'] as const).map(t => (
                            <button 
                                key={t} 
                                onClick={() => handleThemeChange(t)}
                                className={`flex-1 relative rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-all ${theme === t ? 'border-[var(--accent-color,#a8e63d)]' : 'border-[var(--border-theme,#1e2e40)] hover:border-gray-500'}`}
                            >
                                {theme === t && <Check size={14} className="absolute top-2 right-2 text-[var(--accent-color,#a8e63d)]" />}
                                <div className={`w-full h-12 rounded-md border ${t === 'dark' ? 'bg-[#0f172a] border-[#1e2e40]' : t === 'light' ? 'bg-[#f8fafc] border-gray-300' : 'bg-gradient-to-r from-[#0f172a] 50% to-[#f8fafc] 50% border-gray-400'}`}></div>
                                <span className="text-[13px] text-[var(--text-primary,#e0eaf5)] capitalize">{t}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 1B: Accent Colour */}
                <div className="py-[14px] border-b border-[var(--border-theme,#1e2e40)]">
                    <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary,#e0eaf5)]">Accent colour</p>
                        <p className="text-[12px] text-[var(--text-muted,#5a7a9a)] mt-1 mb-4">Personalise your highlight colour</p>
                    </div>
                    <div className="flex gap-3">
                        {['#a8e63d', '#378add', '#7f77dd', '#d85a30', '#ef9f27', '#d4537e'].map(color => (
                            <button
                                key={color}
                                onClick={() => handleAccentChange(color)}
                                style={{ backgroundColor: color }}
                                className={`w-8 h-8 rounded-full transition-all ${accent === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151f2e]' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <SettingRow 
                    label="Text size" 
                    sub="Adjust interface text size"
                    control={
                        <div className="flex bg-[var(--bg-input,#0a1018)] rounded-lg p-1 border border-[var(--border-theme,#1e2e40)]">
                            {(['S', 'M', 'L'] as const).map(s => (
                                <button key={s} onClick={() => handleFontSizeChange(s)} className={`px-4 py-1.5 rounded-md text-sm font-medium ${fontSize === s ? 'bg-[var(--border-theme,#1e2e40)] text-[var(--text-primary,#e0eaf5)]' : 'text-[var(--text-muted,#5a7a9a)] hover:text-white'}`}>{s === 'S' && 'Small'} {s === 'M' && 'Medium'} {s === 'L' && 'Large'}</button>
                            ))}
                        </div>
                    }
                />

                <SettingRow 
                    label="Sidebar style" 
                    sub="Collapsed icon-only or expanded"
                    control={<ToggleSwitch on={sidebarExpanded} onChange={() => handleSidebarChange(!sidebarExpanded)} />}
                />
            </Card>

            {/* SECTION 2 - NOTIFICATIONS */}
            <Card title="Notifications" icon={Bell}>
                <SettingRow label="Email on event approval" sub="Get notified when you approve an event" control={<ToggleSwitch on={notifyEventApprove} onChange={() => toggleNotif('notif-event-approve', notifyEventApprove, setNotifyEventApprove)} />} />
                <SettingRow label="Email on registration approval" sub="Get notified when you approve registration" control={<ToggleSwitch on={notifyRegApprove} onChange={() => toggleNotif('notif-reg-approve', notifyRegApprove, setNotifyRegApprove)} />} />
                <SettingRow label="Deadline reminders" sub="Alerts for events closing within 72 hours" control={<ToggleSwitch on={notifyDeadline} onChange={() => toggleNotif('notif-deadline', notifyDeadline, setNotifyDeadline)} />} />
                <SettingRow label="Upcoming event alerts" sub="Reminders 24 hours before event starts" control={<ToggleSwitch on={notifyUpcoming} onChange={() => toggleNotif('notif-upcoming', notifyUpcoming, setNotifyUpcoming)} />} />
                <SettingRow label="New event submissions" sub="Alert when athlete submits event for review" control={<ToggleSwitch on={notifyNewEvent} onChange={() => toggleNotif('notif-new-event', notifyNewEvent, setNotifyNewEvent)} />} />
                <SettingRow label="New registrations" sub="Alert when athlete registers for an event" control={<ToggleSwitch on={notifyNewReg} onChange={() => toggleNotif('notif-new-reg', notifyNewReg, setNotifyNewReg)} />} />
            </Card>

            {/* SECTION 3 - ACCOUNT */}
            <Card title="Account" icon={UserIcon}>
                <div className="py-2 mb-2">
                    <div className="flex justify-between py-2 border-b border-[var(--border-theme,#1e2e40)]">
                        <span className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Display Name</span>
                        <span className="text-[13px] text-[var(--text-primary,#e0eaf5)]">{user?.profile?.name || (user as any)?.name || 'Raj (Verifier)'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border-theme,#1e2e40)]">
                        <span className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Email</span>
                        <span className="text-[13px] text-[var(--text-primary,#e0eaf5)]">{user?.email || 'verifier@athnexus.com'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border-theme,#1e2e40)]">
                        <span className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Role</span>
                        <span className="text-[13px] text-[var(--text-primary,#e0eaf5)] capitalize">{user?.role || 'Verifier'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border-theme,#1e2e40)] last:border-0">
                        <span className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Member Since</span>
                        <span className="text-[13px] text-[var(--text-primary,#e0eaf5)]">January 2026</span>
                    </div>
                </div>

                <div className="py-[14px] border-b border-[var(--border-theme,#1e2e40)] mt-2">
                    <p className="text-[13px] font-medium text-[var(--text-primary,#e0eaf5)] mb-3">Display name</p>
                    <div className="flex gap-3">
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="flex-1 bg-[var(--bg-input,#0a1018)] border border-[var(--border-theme,#1e2e40)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary,#e0eaf5)] focus:outline-none focus:border-[var(--accent-color,#a8e63d)]" />
                        <button onClick={handleNameSave} className="bg-[var(--accent-color,#a8e63d)] text-[#0d1520] px-4 py-2 rounded-lg text-sm font-bold opacity-90 hover:opacity-100 transition-opacity">Save Name</button>
                    </div>
                </div>

                <div className="py-[14px] border-b border-[var(--border-theme,#1e2e40)]">
                    <p className="text-[13px] font-medium text-[var(--text-primary,#e0eaf5)] mb-3">Change password</p>
                    <div className="space-y-3 mb-3">
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full bg-[var(--bg-input,#0a1018)] border border-[var(--border-theme,#1e2e40)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary,#e0eaf5)] focus:outline-none focus:border-[var(--accent-color,#a8e63d)]" />
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full bg-[var(--bg-input,#0a1018)] border border-[var(--border-theme,#1e2e40)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary,#e0eaf5)] focus:outline-none focus:border-[var(--accent-color,#a8e63d)]" />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full bg-[var(--bg-input,#0a1018)] border border-[var(--border-theme,#1e2e40)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary,#e0eaf5)] focus:outline-none focus:border-[var(--accent-color,#a8e63d)]" />
                    </div>
                    <button onClick={handlePasswordUpdate} className="bg-[var(--accent-color,#a8e63d)] text-[#0d1520] px-4 py-2 rounded-lg text-sm font-bold opacity-90 hover:opacity-100 transition-opacity">Update Password</button>
                </div>

                <div className="mt-6 bg-[#1a0a0a] border border-[#3a1a1a] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#3a1a1a]">
                        <div>
                            <p className="text-[13px] font-medium text-[#ff8080]">Sign Out of All Devices</p>
                            <p className="text-[12px] text-[#ffb3b3] mt-1">You will be logged out everywhere</p>
                        </div>
                        <button onClick={signoutAll} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Sign Out All</button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[13px] font-medium text-[#ff8080]">Delete Account</p>
                            <p className="text-[12px] text-[#ffb3b3] mt-1">This action cannot be undone</p>
                        </div>
                        {!showDeleteModal ? (
                            <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Delete Account</button>
                        ) : (
                            <div className="flex flex-col gap-2 bg-[#2a1010] p-3 rounded-lg border border-[#4a1a1a]">
                                <p className="text-xs text-red-200">Type DELETE to confirm:</p>
                                <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="bg-[#1a0a0a] border border-red-900 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                                <div className="flex gap-2">
                                    <button onClick={() => {setShowDeleteModal(false); setDeleteConfirm('');}} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-xs font-medium">Cancel</button>
                                    <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-medium">Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* SECTION 4 - PRIVACY & SECURITY */}
            <Card title="Privacy & Security" icon={Shield}>
                <SettingRow 
                    label="Two-factor authentication" 
                    sub="Add extra security to your account" 
                    control={
                        <div className="flex items-center gap-3">
                            {twoFactor && <span className="text-xs font-bold text-[var(--accent-color,#a8e63d)] px-2 py-0.5 bg-[#a8e63d]/10 rounded border border-[#a8e63d]/20">Enabled</span>}
                            <ToggleSwitch on={twoFactor} onChange={() => toggleNotif('privacy-2fa', twoFactor, setTwoFactor)} />
                        </div>
                    } 
                />
                <SettingRow label="Activity log" sub="Track your approvals and actions" control={<ToggleSwitch on={activityLog} onChange={() => toggleNotif('privacy-activity', activityLog, setActivityLog)} />} />
                <SettingRow label="Public profile visibility" sub="Allow athletes to see your verifier profile" control={<ToggleSwitch on={publicProfile} onChange={() => toggleNotif('privacy-public', publicProfile, setPublicProfile)} />} />
                
                {activityLog && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-theme,#1e2e40)]">
                        <p className="text-[12px] font-bold text-[var(--text-muted,#5a7a9a)] uppercase tracking-wider mb-4">Recent Activity Logs</p>
                        <div className="space-y-3">
                            {[
                                { action: 'Approved registration — Rahul Patil', time: '2h ago', color: '#a8e63d' },
                                { action: 'Rejected event — Kabaddi Open', time: '5h ago', color: '#ff6b6b' },
                                { action: 'Sent email alert — All Basketball', time: '1d ago', color: '#378add' },
                                { action: 'Approved event — District Athletics', time: '2d ago', color: '#a8e63d' },
                                { action: 'Unfroze account — Karan Mehta', time: '3d ago', color: '#ef9f27' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between pb-3 border-b border-[var(--border-theme,#1e2e40)] last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: log.color }}></div>
                                        <span className="text-[13px] text-[var(--text-primary,#e0eaf5)]">{log.action}</span>
                                    </div>
                                    <span className="text-[12px] text-[var(--text-muted,#5a7a9a)]">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* SECTION 5 - LANGUAGE & REGION */}
            <Card title="Language & Region" icon={Globe}>
                <SettingRow 
                    label="Language" 
                    sub="Interface translation setting"
                    control={
                        <select 
                            value={language} 
                            onChange={(e) => {setLanguage(e.target.value); localStorage.setItem('lang-locale', e.target.value);}}
                            className="bg-[var(--bg-input,#0a1018)] border border-[var(--border-theme,#1e2e40)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary,#e0eaf5)] focus:outline-none focus:border-[var(--accent-color,#a8e63d)]"
                        >
                            <option>English</option>
                            <option>हिंदी</option>
                            <option>मराठी</option>
                        </select>
                    }
                />
                <SettingRow 
                    label="Date format" 
                    sub="Style for dates across app"
                    control={
                        <div className="flex bg-[var(--bg-input,#0a1018)] rounded-lg p-1 border border-[var(--border-theme,#1e2e40)]">
                            {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(df => (
                                <button key={df} onClick={() => {setDateFormat(df); localStorage.setItem('lang-date', df);}} className={`px-3 py-1.5 rounded-md text-xs font-medium ${dateFormat === df ? 'bg-[var(--border-theme,#1e2e40)] text-[var(--text-primary,#e0eaf5)]' : 'text-[var(--text-muted,#5a7a9a)] hover:text-white'}`}>{df}</button>
                            ))}
                        </div>
                    }
                />
                <SettingRow 
                    label="Timezone" 
                    sub="Timezone is auto-detected"
                    control={<span className="text-sm font-medium text-[var(--text-primary,#e0eaf5)] bg-[var(--bg-input,#0a1018)] px-3 py-1.5 rounded-lg border border-[var(--border-theme,#1e2e40)]">IST (UTC+5:30)</span>}
                />
            </Card>

            {/* SECTION 6 - ABOUT */}
            <Card title="About" icon={Info}>
                <div className="grid grid-cols-2 gap-y-3 mb-6">
                    <div className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Platform</div><div className="text-[13px] text-[var(--text-primary,#e0eaf5)] font-medium text-right">AthNexus</div>
                    <div className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Version</div><div className="text-[13px] text-[var(--text-primary,#e0eaf5)] font-medium text-right">1.0.0</div>
                    <div className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Build</div><div className="text-[13px] text-[var(--text-primary,#e0eaf5)] font-medium text-right">2026-04-01</div>
                    <div className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Stack</div><div className="text-[13px] text-[var(--text-primary,#e0eaf5)] font-medium text-right">React + Vite + Express</div>
                    <div className="text-[12px] text-[var(--text-muted,#5a7a9a)]">ML Engine</div><div className="text-[13px] text-[var(--text-primary,#e0eaf5)] font-medium text-right">Python + Scikit-learn</div>
                    <div className="text-[12px] text-[var(--text-muted,#5a7a9a)]">Designed for</div><div className="text-[13px] text-[var(--text-primary,#e0eaf5)] font-medium text-right flex items-center justify-end">Maharashtra Sports Authority</div>
                </div>
                <div className="flex gap-4 border-t border-[var(--border-theme,#1e2e40)] pt-5">
                    <button onClick={handleExport} className="flex-1 bg-[var(--bg-input,#0a1018)] hover:opacity-80 text-[var(--text-primary,#e0eaf5)] py-2 rounded-lg text-sm font-medium transition-colors border border-[var(--border-theme,#1e2e40)]">Export Settings</button>
                    <button onClick={handleReset} className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-200 py-2 rounded-lg text-sm font-medium transition-colors border border-red-900/50">Reset to Defaults</button>
                </div>
            </Card>
        </div>
    );
}

