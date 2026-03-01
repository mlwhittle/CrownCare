import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Settings as SettingsIcon, Sun, MoonStar, Crown, Trash2, User, Zap } from 'lucide-react';
import settingsImg from '../assets/images/settings.png';
import './Settings.css';

export default function Settings() {
    const { theme, toggleTheme, onboarding, completeOnboarding, user, isPremium } = useApp();
    const [isCanceling, setIsCanceling] = useState(false);

    const clearAll = () => {
        if (confirm('This will delete ALL your data — photos, logs, everything. Are you sure?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="settings">
            <img src={settingsImg} alt="Settings" className="page-header-img" />
            <h2 className="gradient-text">Settings</h2>

            {/* Profile */}
            <div className="card mb-lg">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                    <User size={18} /> Profile
                </h3>
                <div className="setting-row">
                    <span>Name</span>
                    <span style={{ fontWeight: 600 }}>{onboarding?.name || 'Not set'}</span>
                </div>
                <div className="setting-row">
                    <span>Hair Type</span>
                    <span className="badge badge-blue">{onboarding?.hairType || '—'}</span>
                </div>
                <div className="setting-row">
                    <span>Porosity</span>
                    <span className="badge badge-gold">{onboarding?.porosity || '—'}</span>
                </div>
                <div className="setting-row">
                    <span>Primary Concern</span>
                    <span className="badge badge-sky">{onboarding?.concern || '—'}</span>
                </div>
                <div className="setting-row">
                    <span>Tracking Since</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {onboarding?.startDate ? new Date(onboarding.startDate).toLocaleDateString() : '—'}
                    </span>
                </div>
            </div>

            {/* Appearance */}
            <div className="card mb-lg">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Appearance</h3>
                <div className="setting-row" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
                    <span>Theme</span>
                    <div className="theme-pill">
                        {theme === 'light' ? <Sun size={16} /> : <MoonStar size={16} />}
                        {theme === 'light' ? 'Light' : 'Dark'}
                    </div>
                </div>
            </div>

            {/* Subscription Management */}
            <div className="card mb-lg" style={{
                border: isPremium ? '2px solid var(--gold-400)' : '2px solid var(--border-color)',
                background: isPremium ? 'var(--gold-50)' : 'var(--bg-secondary)'
            }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Crown size={20} style={{ color: 'var(--gold-500)' }} /> Subscription
                </h3>

                <div style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <span style={{ fontWeight: 600 }}>Current Plan</span>
                        <span className={`badge ${isPremium ? 'badge-gold' : 'badge-sky'}`}>
                            {isPremium ? 'Premium ($9.99/mo)' : 'Free Tier'}
                        </span>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                        {isPremium
                            ? "You have full access to the AI Hair Coach and advanced clinical tracking features."
                            : "Upgrade to Premium to unlock personalized AI coaching and detailed clinical logs."}
                    </p>

                    {isPremium ? (
                        <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
                                You can cancel anytime. If you cancel, you will keep access until the end of your billing cycle.
                            </p>
                            <button
                                className="btn btn-outline"
                                style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}
                                disabled={isCanceling}
                                onClick={async () => {
                                    if (confirm("Are you sure you want to cancel your Premium subscription?")) {
                                        setIsCanceling(true);
                                        try {
                                            if (user) {
                                                const userRef = doc(db, 'users', user.uid);
                                                await updateDoc(userRef, { isPremium: false });
                                                alert("Your subscription has been cancelled successfully.");
                                            }
                                        } catch (e) {
                                            alert("Failed to cancel subscription.");
                                        } finally {
                                            setIsCanceling(false);
                                        }
                                    }
                                }}
                            >
                                {isCanceling ? "Canceling..." : "Cancel Subscription"}
                            </button>
                        </div>
                    ) : (
                        <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                                // Simulate opening the paywall manually from settings
                                if (user) {
                                    const userRef = doc(db, 'users', user.uid);
                                    updateDoc(userRef, { isPremium: true });
                                    alert("Upgraded to Premium (Mock Developer Mode)!");
                                }
                            }}>
                                <Zap size={16} /> Upgrade to Premium
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* About */}
            <div className="card mb-lg">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>About CrownCare</h3>
                <div className="setting-row"><span>Version</span><span className="text-muted">1.0.0 (Beta)</span></div>
                <div className="setting-row"><span>AI Engine</span><span className="text-muted">Gemini 2.0 Flash</span></div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)', lineHeight: 1.6 }}>
                    CrownCare is an educational companion app. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a board-certified dermatologist or trichologist for hair and scalp concerns.
                </p>
            </div>

            {/* Danger zone */}
            <div className="card danger-card">
                <h3 style={{ color: 'var(--error)', marginBottom: 'var(--space-md)' }}>Danger Zone</h3>
                <p className="text-sm text-muted mb-md">Permanently delete all your data including photos, logs, and quiz results.</p>
                <button className="btn btn-danger" onClick={clearAll}>
                    <Trash2 size={16} /> Clear All Data
                </button>
            </div>
        </div>
    );
}
