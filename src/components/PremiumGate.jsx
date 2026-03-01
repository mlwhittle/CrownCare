import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { Sparkles, CheckCircle2, Lock } from 'lucide-react';

export default function PremiumGate({ children, featureName = "this feature" }) {
    const { isPremium, authLoading, user } = useApp();
    const [isSimulatingUpgrade, setIsSimulatingUpgrade] = useState(false);

    const handleUpgradeMock = async () => {
        if (!user) return alert("Please log in first.");
        setIsSimulatingUpgrade(true);

        try {
            // Create a checkout session document for the Stripe Firebase Extension
            const checkoutSessionRef = await addDoc(
                collection(db, 'users', user.uid, 'checkout_sessions'),
                {
                    price: 'price_1QynkCIunC29aUXhm4gRveiZ', // FuelFlow Premium $9.99/mo
                    success_url: window.location.origin,
                    cancel_url: window.location.origin,
                }
            );

            // Listen for the extension to attach the Stripe Checkout URL
            onSnapshot(checkoutSessionRef, (snap) => {
                const data = snap.data();
                if (data?.error) {
                    alert(`An error occurred: ${data.error.message}`);
                    setIsSimulatingUpgrade(false);
                }
                if (data?.url) {
                    // Redirect to the Stripe Hosted Checkout page!
                    window.location.assign(data.url);
                }
            });
        } catch (error) {
            console.error(error);
            alert("Failed to start checkout. Please make sure the Stripe Extension is configured.");
            setIsSimulatingUpgrade(false);
        }
    };

    if (authLoading) {
        return (
            <div className="card text-center" style={{ padding: 'var(--space-2xl)' }}>
                <div style={{ animation: 'fabPulse 2s infinite', color: 'var(--blue-400)' }}>
                    <Sparkles size={32} />
                </div>
                <p className="mt-md text-muted">Loading...</p>
            </div>
        );
    }

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="card premium-paywall text-center" style={{ overflow: 'hidden', position: 'relative' }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                background: 'var(--gradient-hero)'
            }} />

            <div style={{ padding: 'var(--space-lg) 0' }}>
                <div style={{
                    display: 'inline-flex', padding: '16px', borderRadius: '50%',
                    background: 'var(--gold-100)', color: 'var(--gold-600)', marginBottom: 'var(--space-md)'
                }}>
                    <Lock size={32} />
                </div>

                <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-xs)' }}>
                    Unlock <span style={{ color: 'var(--gold-600)' }}>{featureName}</span>
                </h2>
                <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                    Upgrade to CrownCare Premium to access personalized AI coaching and advanced clinical tracking.
                </p>

                <div className="premium-features" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)', background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <CheckCircle2 size={20} style={{ color: 'var(--blue-500)' }} />
                        <span style={{ fontWeight: 500 }}>AI Hair Loss Coach (Unlimited)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <CheckCircle2 size={20} style={{ color: 'var(--blue-500)' }} />
                        <span style={{ fontWeight: 500 }}>Advanced Clinical Treament Logs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <CheckCircle2 size={20} style={{ color: 'var(--blue-500)' }} />
                        <span style={{ fontWeight: 500 }}>Priority Support & Insights</span>
                    </div>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>$9.99</span>
                    <span className="text-muted"> / month</span>
                </div>

                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: 'var(--space-sm)' }}
                    onClick={handleUpgradeMock}
                    disabled={isSimulatingUpgrade}
                >
                    {isSimulatingUpgrade ? 'Processing...' : 'Upgrade Now'}
                </button>

                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    Cancel anytime. No lock-in contracts.
                </p>
            </div>
        </div>
    );
}
