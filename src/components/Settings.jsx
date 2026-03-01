import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Sun, MoonStar, Crown, Trash2, User } from 'lucide-react';
import settingsImg from '../assets/images/settings.png';
import './Settings.css';

export default function Settings() {
    const { theme, toggleTheme, onboarding, completeOnboarding } = useApp();

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
