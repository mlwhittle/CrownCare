import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crown, CheckCircle2, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

export default function FoundersOffer({ setCurrentView }) {
    const { redeemVipCode } = useApp();
    const [promoApplied, setPromoApplied] = useState(false);
    const [message, setMessage] = useState('');

    const handleApplyOffer = () => {
        const success = redeemVipCode('FOUNDERS-CLUB');
        if (success) {
            setPromoApplied(true);
            setMessage('🎉 Founders Club membership activated! You now have 90 days of free Premium & Pro access.');
            setTimeout(() => {
                setCurrentView('home');
            }, 3000);
        } else {
            setMessage('❌ Unable to apply coupon. Please try again.');
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-primary)', 
            padding: 'var(--space-3xl) var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="card" style={{ 
                maxWidth: '600px', 
                width: '100%', 
                padding: 'var(--space-2xl)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--bg-secondary)',
                border: '2px solid var(--gold-primary)'
            }}>
                {/* Visual Gold Gradient Top Bar */}
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '6px', 
                    background: 'var(--gradient-warm)' 
                }}></div>

                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        background: 'rgba(212, 175, 55, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto var(--space-md) auto',
                        border: '1px solid var(--gold-primary)'
                    }}>
                        <Crown size={30} style={{ color: 'var(--gold-primary)' }} />
                    </div>
                    <h1 className="gradient-text-hero" style={{ 
                        fontSize: 'var(--font-size-3xl)', 
                        fontWeight: 800,
                        fontFamily: 'var(--font-serif)',
                        marginBottom: 'var(--space-sm)',
                        color: 'var(--brand-primary)'
                    }}>
                        Your Founders Offer
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '8px' }}>
                        Thank you for registering. You have unlocked our exclusive **Founders Club Program**.
                    </p>
                </div>

                <div style={{ 
                    background: 'var(--bg-primary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 'var(--space-lg)', 
                    marginBottom: 'var(--space-xl)',
                    textAlign: 'center'
                }}>
                    <div style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 'bold', letterSpacing: '1px' }}>
                        Special Pro Invitation
                    </div>
                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--brand-primary)', margin: '8px 0' }}>
                        90 Days Free Access
                    </div>
                    <p style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>
                        Full access to App & CrownCare Pro Dashboard
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                        What is included:
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', listStyle: 'none', padding: 0 }}>
                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <span><strong>Full App Access:</strong> Unlock the AI Trichologist Hair Coach, Visual Hair Diary, and Smart Routines.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <span><strong>CrownCare Pro Dashboard:</strong> Lifetime tools, client management, and detailed progress logs.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <span><strong>Offer Clients 30 Days Free:</strong> Share exclusive 30-day free access codes with your clients to build loyalty.</span>
                        </li>
                    </ul>
                </div>

                {message && (
                    <div style={{ 
                        padding: '12px', 
                        background: 'rgba(76, 175, 130, 0.1)', 
                        border: '1px solid var(--success)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--success)',
                        fontWeight: 'bold',
                        fontSize: 'var(--font-size-sm)',
                        textAlign: 'center',
                        marginBottom: 'var(--space-md)'
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--gold-primary)' }}>Stylist Pro Offer:</strong>
                        <div style={{ fontSize: '13px', margin: '4px 0' }}>Code: <strong>CrowncareFounders</strong> (90 Days Free)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Auto-renews at $49.99/mo. Redeem on App Store.</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--blue-500)' }}>Client Premium Offer:</strong>
                        <div style={{ fontSize: '13px', margin: '4px 0' }}>Code: <strong>CrownFounders1</strong> (30 Days Free)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Auto-renews at $29.99/mo. Redeem on App Store.</div>
                    </div>
                </div>

                <button 
                    onClick={async () => {
                        setMessage('Opening App Store redemption...');
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
                    className="btn btn-primary btn-lg" 
                    style={{ 
                        width: '100%', 
                        height: '56px',
                        background: 'var(--gradient-primary)', 
                        color: '#FFFFFF',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'bold',
                        border: 'none',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <Ticket size={20} style={{ marginRight: '8px' }} />
                    Redeem on App Store
                    <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                </button>

                <div style={{ 
                    marginTop: 'var(--space-lg)', 
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)'
                }}>
                    These codes must be entered through Apple App Store checkout or the Apple redemption URL.
                </div>
            </div>

            <button 
                onClick={() => setCurrentView('home')} 
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-tertiary)', 
                    textDecoration: 'underline', 
                    cursor: 'pointer', 
                    fontSize: 'var(--font-size-sm)',
                    marginTop: '20px'
                }}
            >
                Skip & Go to Dashboard
            </button>
        </div>
    );
}
