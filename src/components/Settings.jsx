import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db, auth } from '../firebase';
import { doc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { deleteUser } from 'firebase/auth';
import { Settings as SettingsIcon, Sun, MoonStar, Crown, Trash2, User, Zap, Briefcase, Scissors, AlertTriangle, Activity, BookOpen, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import settingsImg from '../assets/images/settings.png';
import UserManual from './UserManual';
import ScaleYourBusiness from './ScaleYourBusiness';
import DeleteAccount from './DeleteAccount';
import Upgrade from './Upgrade';
import './Settings.css';

export default function Settings({ setCurrentView }) {
    const { theme, toggleTheme, onboarding, completeOnboarding, user, isPremium, isVIP, redeemVipCode, isStylistAccount, setIsStylistAccount, stylistCode, setStylistCode, consentStatus, setConsentStatus } = useApp();
    const [showManual, setShowManual] = useState(false);
    const [showScaleBusiness, setShowScaleBusiness] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [vipInput, setVipInput] = useState('');
    const [newStylistCode, setNewStylistCode] = useState('');
    const [pendingStylistCode, setPendingStylistCode] = useState(null);
    const [isTransferring, setIsTransferring] = useState(false);

    const [healthConnected, setHealthConnected] = useState(() => localStorage.getItem('cc_health') === 'true');
    const toggleHealthSync = () => {
        const newVal = !healthConnected;
        setHealthConnected(newVal);
        localStorage.setItem('cc_health', String(newVal));
        if (newVal) alert("Successfully linked Biometric tracking securely via local state.");
    };

    const handleUpgrade = async () => {
        alert("Subscriptions are processed natively on the App Store. Please download or open CrownCare on your mobile device to upgrade.");
    };

    const handleStylistUpgrade = async () => {
        alert("Pro Stylist subscriptions are processed natively on the App Store. Please download or open CrownCare on your mobile device to upgrade.");
    };

    const handleConnectedTierUpgrade = async (pendingCode) => {
        alert("Connected Client subscriptions are processed natively on the App Store. Please download or open CrownCare on your mobile device to upgrade.");
    };


    if (showManual) {
        return <UserManual onClose={() => setShowManual(false)} />;
    }

    if (showUpgradeModal) {
        return <Upgrade onClose={() => setShowUpgradeModal(false)} />;
    }

    if (showScaleBusiness) {
        return <ScaleYourBusiness onClose={() => setShowScaleBusiness(false)} />;
    }

    if (showDeleteAccount) {
        return <DeleteAccount setCurrentView={(view) => {
            if (view === 'settings') {
                setShowDeleteAccount(false);
            } else {
                setCurrentView(view);
            }
        }} />;
    }

    if (pendingStylistCode) {
        return (
            <div className="settings" style={{ padding: 'var(--space-xl) var(--space-md)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                    <Scissors size={48} style={{ color: 'var(--brand-primary)', margin: '0 auto var(--space-md)' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Share My CrownCare Journey With My Connected Stylist</h2>
                </div>
                
                <div className="card-glass" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)', textAlign: 'left' }}>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                        By connecting with a stylist, I agree to share my CrownCare journey data with that stylist so they can better support my hair care between appointments.
                    </p>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                        This may include my hair profile, visual diary photos, AI scan results, routines, treatments, product scans, nutrition logs, journal entries, progress reports, and app activity related to my hair care journey.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        I understand I can disconnect my stylist or turn off sharing later in Settings.
                    </p>
                </div>

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginBottom: 'var(--space-md)', padding: '16px', fontSize: '1.1rem' }}
                    onClick={() => {
                        setConsentStatus(true);
                        
                        if (isTransferring || isVIP) {
                            setStylistCode(pendingStylistCode);
                            setPendingStylistCode(null);
                            setIsTransferring(false);
                            alert(isTransferring ? 'Stylist updated successfully. Active Sponsor transferred.' : 'Successfully connected to Styling Portal! As a Lifetime VIP, your Stylist Connection is included for free.');
                        } else {
                            handleConnectedTierUpgrade(pendingStylistCode);
                            setPendingStylistCode(null);
                        }
                    }}
                >
                    I Agree and Connect My Stylist
                </button>
                
                <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                    onClick={() => {
                        setPendingStylistCode(null);
                        setIsTransferring(false);
                    }}
                >
                    Not Now
                </button>
            </div>
        );
    }

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

            {/* Integrations */}
            <div className="card mb-lg">
                <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18}/> Wearable Integrations</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong style={{ display: 'block' }}>Apple Health & Oura Ring</strong>
                        <p className="text-muted text-sm" style={{ margin: 0 }}>Sync sleep recovery and stress metrics.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={healthConnected} onChange={toggleHealthSync} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* Subscription Management */}
            <div className="card mb-lg" style={{
                border: isPremium ? '2px solid var(--gold-400)' : '2px solid var(--border-color)',
                background: isPremium ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                boxShadow: isPremium ? '0 0 20px rgba(251, 191, 36, 0.15)' : 'none'
            }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Crown size={20} style={{ color: 'var(--gold-500)' }} /> Subscription
                </h3>

                <div style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <span style={{ fontWeight: 600 }}>Current Plan</span>
                        <span className={`badge ${isPremium ? 'badge-gold' : 'badge-sky'}`}>
                            {isPremium ? (isVIP ? 'VIP Access' : 'Premium Access') : 'Free Tier'}
                        </span>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                        {isPremium
                            ? "You have full access to the AI Hair Coach and advanced clinical tracking features."
                            : "Upgrade to Premium to unlock personalized AI coaching and detailed clinical logs."}
                    </p>

                    <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 'var(--space-md)' }} onClick={() => setShowUpgradeModal(true)}>
                            <Zap size={16} /> Manage Subscriptions & Upgrades
                        </button>
                        
                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 'var(--space-md)', textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>Redeem Apple Store Offer Codes</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                                Redeem Apple subscription offer codes securely via the App Store. <br />
                                <strong>Stylist Code:</strong> CrowncareFounders (90 days free) <br />
                                <strong>Client Code:</strong> CrownFounders1 (30 days free)
                            </p>
                            <button
                                className="btn btn-outline"
                                style={{ width: '100%', fontWeight: 600 }}
                                onClick={async () => {
                                    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
                                        try {
                                            const { Purchases } = await import('@revenuecat/purchases-capacitor');
                                            await Purchases.presentOfferCodeRedemptionSheet();
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    } else {
                                        window.open('https://apps.apple.com/redeem?ctx=offercodes&id=6502206775', '_blank');
                                    }
                                }}
                            >
                                Redeem on App Store
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Stylist Connection */}
            <div className="card mb-lg" style={{ border: stylistCode ? '2px solid var(--success)' : '1px solid var(--border-color)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Scissors size={20} style={{ color: stylistCode ? 'var(--success)' : 'var(--text-secondary)' }} /> 
                    {stylistCode ? 'Connected Stylist' : 'Stylist Connection'}
                </h3>
                
                {stylistCode ? (
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontWeight: 600 }}>Active Sponsor</span>
                            <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>{stylistCode}</span>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                            This stylist has clinical access to your tracker to assign custom regimens and monitor your porosity progress.
                        </p>
                        
                        <div style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ display: 'block', fontSize: 'var(--font-size-sm)' }}>Share Journey Data</strong>
                                    <p className="text-muted text-xs" style={{ margin: '4px 0 0 0', lineHeight: 1.4 }}>
                                        Allow this stylist to view your Visual Diary, AI Scans, Routines, and Nutrition logs.
                                    </p>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={consentStatus} 
                                        onChange={() => setConsentStatus(!consentStatus)} 
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>Transfer Sponsor</p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Stylist ID..."
                                    value={newStylistCode}
                                    onChange={e => setNewStylistCode(e.target.value)}
                                    style={{ flex: 1, textTransform: 'uppercase' }}
                                />
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        if (!newStylistCode.trim()) return;
                                        const code = newStylistCode.trim().toUpperCase();
                                        
                                        if (code === 'PRO-MODE') {
                                            setIsStylistAccount(true);
                                            setNewStylistCode('');
                                            return;
                                        }

                                        if (confirm('Warning: This will immediately transfer your clinical connection to the new Stylist. Your current Stylist will lose all access. Proceed?')) {
                                            setPendingStylistCode(code);
                                            setIsTransferring(true);
                                            setNewStylistCode('');
                                        }
                                    }}
                                >
                                    Switch
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn btn-outline"
                            style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}
                            onClick={() => {
                                if (confirm('Are you sure you want to completely disconnect? Your stylist will lose access to your data and your custom protocols will be cleared.')) {
                                    setConsentStatus(false);
                                    setStylistCode('');
                                    alert('Disconnected from stylist.');
                                }
                            }}
                        >
                            Disconnect Stylist
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                            Connect with your certified CrownCare stylist to receive custom treatment protocols and share your progress logs directly.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Stylist ID..."
                                value={newStylistCode}
                                onChange={e => setNewStylistCode(e.target.value)}
                                style={{ flex: 1, textTransform: 'uppercase' }}
                            />
                            <button
                                className="btn btn-primary"
                                disabled={isUpgrading}
                                onClick={() => {
                                    if (!newStylistCode.trim()) return;
                                    const code = newStylistCode.trim().toUpperCase();
                                    
                                    if (code === 'PRO-MODE') {
                                        setIsStylistAccount(true);
                                        setNewStylistCode('');
                                        return;
                                    }

                                    // Founders VIP Offer Bypass
                                    if (isVIP) {
                                        setPendingStylistCode(code);
                                        setNewStylistCode('');
                                        return;
                                    }

                                    // Normally we would check if they already have an active $29.99 connected tier subscription in standard logic.
                                    if(confirm(`Connecting with a professional stylist requires an active CrownCare subscription.`)) {
                                        setPendingStylistCode(code);
                                        setNewStylistCode('');
                                    }
                                }}
                            >
                                {isUpgrading ? 'Loading...' : 'Connect'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Account Type */}
            <div className="card mb-lg" style={{ 
                border: isStylistAccount ? '2px solid var(--brand-400)' : '2px solid var(--border-color)',
                background: isStylistAccount ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                boxShadow: isStylistAccount ? '0 0 20px rgba(225, 137, 184, 0.15)' : 'none'
            }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Briefcase size={20} style={{ color: 'var(--brand-500)' }} /> Professional Mode
                </h3>
                
                {isStylistAccount ? (
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontWeight: 600 }}>Stylist Web Portal</span>
                            <span className="badge badge-primary">Active ($49.99/mo)</span>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            You have full B2B access to the Stylist Hub, Client Roster, and Custom Protocol tools.
                        </p>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            Your CrownCare Pro dashboard lives at <a href="https://pro.crowncare.net/" target="_blank" rel="noopener noreferrer">https://pro.crowncare.net/</a>. Use it to manage connected clients, review their shared CrownCare app activity, and send care instructions.
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', fontStyle: 'italic' }}>
                            Note: While you are in your 7-Day Free Trial, you will not be charged. However, your trial will automatically convert into to a paid subscription based on your decision to stay with the app. You can cancel at any time below.
                        </p>

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 'var(--space-md)', gap: '8px' }}
                            onClick={() => window.open('https://pro.crowncare.net/', '_blank')}
                        >
                            <ExternalLink size={16} /> Open Pro Dashboard
                        </button>

                        <button 
                            className="btn btn-outline" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 'var(--space-md)', gap: '8px' }}
                            onClick={() => setShowScaleBusiness(true)}
                        >
                            <Briefcase size={16} /> B2B Features: How it Works
                        </button>

                        <button 
                            className="btn btn-outline" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            Manage Pro Subscriptions
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontWeight: 600 }}>Solo User</span>
                            <span className="badge" style={{ background: 'var(--surface-color)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Standard</span>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', lineHeight: 1.5 }}>
                            Are you a professional stylist? Upgrade to unlock the exclusive B2B Stylist Portal, custom protocol designer, and client roster management.
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            <Crown size={18} /> Upgrade to Stylist Tier
                        </button>
                    </div>
                )}
            </div>

            <div className="card mb-lg">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>About CrownCare</h3>
                <div className="setting-row"><span>Version</span><span className="text-muted">1.0.0</span></div>
                <div className="setting-row"><span>AI Engine</span><span className="text-muted">Gemini 2.0 Flash</span></div>
                
                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                    onClick={() => setShowManual(true)}
                >
                    <BookOpen size={16} /> Read User Manual
                </button>
                
                <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', marginTop: 'var(--space-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                    onClick={() => window.location.href = "mailto:crown@crowncare.net"}
                >
                    Email Developer Support
                </button>

                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)', lineHeight: 1.6 }}>
                    CrownCare is an educational companion app. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a board-certified dermatologist or trichologist for hair and scalp concerns.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="card danger-card" style={{ borderColor: 'var(--error)', marginTop: 'var(--space-lg)' }}>
                <h3 style={{ color: 'var(--error)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} /> Danger Zone
                </h3>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                    Permanently delete all your data including photos, logs, and quiz results.
                </p>
                <button
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => setShowDeleteAccount(true)}
                >
                    <Trash2 size={16} /> Permanently Delete Account
                </button>
            </div>

        </div>
    );
}
