// CrownCare — Email & Google Sign-In Modal
// Appears after onboarding completes to permanently secure the user's data
// Replaces anonymous auth with a real account so data is never lost

import { useState } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    linkWithCredential,
    EmailAuthProvider,
    linkWithPopup
} from 'firebase/auth';
import { Crown, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function AuthModal({ onComplete, userName }) {
    const [mode, setMode] = useState('choice'); // choice, email, signin
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Links the anonymous account to a real account — preserving all existing data
    const linkAnonymousToEmail = async () => {
        if (!email || !password) return;
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        setIsLoading(true);
        setError('');

        try {
            const currentUser = auth.currentUser;

            if (currentUser?.isAnonymous) {
                // Link anonymous account to email — data is preserved
                const credential = EmailAuthProvider.credential(email, password);
                await linkWithCredential(currentUser, credential);
            } else {
                // Create fresh account
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onComplete();
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                // Account exists — sign them in instead
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    onComplete();
                } catch (signInErr) {
                    setError('Incorrect password for that email. Please try again.');
                }
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const linkAnonymousToGoogle = async () => {
        setIsLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const currentUser = auth.currentUser;

            if (currentUser?.isAnonymous) {
                // Link anonymous account to Google — data is preserved
                await linkWithPopup(currentUser, provider);
            } else {
                await signInWithPopup(auth, provider);
            }
            onComplete();
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                setError('');
            } else if (err.code === 'auth/credential-already-in-use') {
                // Google account already exists — sign in
                try {
                    const provider = new GoogleAuthProvider();
                    await signInWithPopup(auth, provider);
                    onComplete();
                } catch {
                    setError('Could not sign in with Google. Please try email instead.');
                }
            } else {
                setError('Google sign-in failed. Please try email instead.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const skipForNow = () => {
        // User can skip — anonymous auth continues but data may not survive reinstall
        onComplete();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-secondary)', borderRadius: '24px',
                padding: '32px', maxWidth: '420px', width: '100%',
                border: '1px solid var(--border-color)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 64, height: 64, background: 'var(--gradient-gold)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <Crown size={32} color="#000" />
                    </div>
                    <h2 style={{
                        fontSize: '1.4rem', fontWeight: 700, color: 'var(--brand-primary)',
                        fontFamily: 'var(--font-serif)', marginBottom: '8px'
                    }}>
                        Secure Your Crown, {userName || 'Queen'}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Create a free account to make sure your progress photos, treatments, and journal entries are always safe — even if you get a new phone.
                    </p>
                </div>

                {/* Choice Mode */}
                {mode === 'choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* Google Button */}
                        <button
                            onClick={linkAnonymousToGoogle}
                            disabled={isLoading}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px',
                                border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                                color: 'var(--text-primary)', transition: 'all 0.2s'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>or</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                        </div>

                        {/* Email Button */}
                        <button
                            onClick={() => setMode('email')}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px',
                                background: 'var(--gradient-primary)', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 700,
                                color: 'white', transition: 'all 0.2s'
                            }}
                        >
                            <Mail size={20} /> Continue with Email
                        </button>

                        {/* Skip */}
                        <button
                            onClick={skipForNow}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-tertiary)',
                                fontSize: '13px', cursor: 'pointer', padding: '8px',
                                textDecoration: 'underline', marginTop: '4px'
                            }}
                        >
                            Skip for now (data may not survive reinstall)
                        </button>

                        {error && (
                            <p style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center' }}>{error}</p>
                        )}
                    </div>
                )}

                {/* Email Mode */}
                {mode === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                EMAIL ADDRESS
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 14px 12px 40px',
                                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                        borderRadius: '10px', color: 'var(--text-primary)',
                                        fontSize: '14px', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                PASSWORD (min 6 characters)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 40px 12px 40px',
                                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                        borderRadius: '10px', color: 'var(--text-primary)',
                                        fontSize: '14px', outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p style={{ color: 'var(--error)', fontSize: '13px' }}>{error}</p>
                        )}

                        <button
                            onClick={linkAnonymousToEmail}
                            disabled={isLoading || !email || !password}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px',
                                background: 'var(--gradient-primary)', border: 'none',
                                fontSize: '15px', fontWeight: 700, color: 'white',
                                cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
                                opacity: isLoading || !email || !password ? 0.6 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? 'Securing your account...' : '🔒 Secure My Data'}
                        </button>

                        <button
                            onClick={() => { setMode('choice'); setError(''); }}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-tertiary)',
                                fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Privacy note */}
                <p style={{
                    fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center',
                    marginTop: '20px', lineHeight: 1.5
                }}>
                    <Sparkles size={10} style={{ display: 'inline', marginRight: 4 }} />
                    Your data is encrypted and never sold. Only you and your connected stylist can see your hair journey.
                </p>
            </div>
        </div>
    );
}
