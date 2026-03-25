import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

const STRIPE_LINKS = {
    solo: "https://buy.stripe.com/test_solo_1999",
    connected: "https://buy.stripe.com/test_connected_2999",
    stylist: "https://buy.stripe.com/test_stylist_4999"
};

export default function Paywall({ onSubscribeSuccess }) {
    const { onboarding, user, setIsPremium } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [claimEmail, setClaimEmail] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimMessage, setClaimMessage] = useState('');
    
    const userType = onboarding?.userType || 'solo';
    const isStylist = userType === 'stylist';

    // Mocking the Stripe Redirect
    const handleCheckout = (link) => {
        setIsLoading(true);
        // In production, this redirects to window.location.href = link;
        // For local testing, we simulate a successful 7-day trial activation after 1.5 seconds.
        setTimeout(() => {
            setIsLoading(false);
            onSubscribeSuccess(true);
        }, 1500);
    };

    const handleClaim = async () => {
        if (!claimEmail || !user) return;
        setIsClaiming(true);
        setClaimMessage('');
        
        try {
            const req = await fetch('http://127.0.0.1:5001/crowncare-116e4/us-central1/claimWebSubscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: claimEmail, uid: user.uid })
            });
            const res = await req.json();
            
            if (res.success) {
                setClaimMessage('🎉 ' + res.message);
                setTimeout(() => {
                    onSubscribeSuccess(true);
                }, 1500);
            } else {
                setClaimMessage('❌ ' + (res.message || 'Verification failed.'));
            }
        } catch (error) {
            setClaimMessage('❌ Network error. Ensure cloud functions are running.');
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="auth-page" style={{ background: 'var(--bg-primary)', padding: 'var(--space-2xl) var(--space-md)' }}>
            <div style={{ maxWidth: isStylist ? '600px' : '900px', margin: '0 auto', width: '100%' }}>
                
                {/* Global Trial Messaging */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--crown-gold)', borderRadius: '100px', color: 'var(--crown-gold)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                        <Sparkles size={16} /> 7-Day Free Trial
                    </div>
                    <h1 className="gradient-text-hero" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
                        Select Your Plan
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        You will have <strong style={{color: 'var(--text-primary)'}}>full, unrestricted use of the entire app</strong> for the 7-day period. An upfront payment method is required, but you will not be charged today. <strong style={{ color: 'var(--crown-gold)' }}>Remember to cancel before the 7 days are up</strong> if you do not see the need for the app. We will send you an email reminder 1 day before your trial ends!
                    </p>
                </div>

                {isStylist ? (
                    /* STYLIST PAYWALL */
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-2xl)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--gradient-gold)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
                            <div>
                                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Professional Portal</h2>
                                <span style={{ color: 'var(--text-tertiary)' }}>For Licensed Cosmetologists</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--text-primary)' }}>$49.99<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span></div>
                            </div>
                        </div>

                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--green-500)' }}/> Full Client Management System (CMS)</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--green-500)' }}/> Access to all client visual hair diaries</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--green-500)' }}/> In-app Booking & Calendar Sync</li>
                        </ul>

                        <button 
                            onClick={() => handleCheckout(STRIPE_LINKS.stylist)}
                            disabled={isLoading}
                            className="btn btn-primary btn-lg" 
                            style={{ width: '100%', fontSize: 'var(--font-size-lg)', height: '60px' }}
                        >
                            {isLoading ? 'Processing...' : 'Start 7-Day Free Trial'}
                        </button>
                    </div>

                ) : (
                    /* SOLO USER PAYWALL */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                        
                        {/* Tier 1: Solo */}
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Solo Tracker</h2>
                            <span style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }}>For personal hair tracking</span>
                            
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 'var(--space-xl)' }}>$19.99<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span></div>
                            
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)', flexGrow: 1 }}>
                                <li style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ color: 'var(--blue-500)', flexShrink: 0, marginTop: '2px' }}/> AI Trichologist Coach</li>
                                <li style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ color: 'var(--blue-500)', flexShrink: 0, marginTop: '2px' }}/> Visual Hair Diary</li>
                                <li style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ color: 'var(--blue-500)', flexShrink: 0, marginTop: '2px' }}/> Nutrition & Routine Planners</li>
                            </ul>

                            <button onClick={() => handleCheckout(STRIPE_LINKS.solo)} disabled={isLoading} style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', fontWeight: 'bold' }}>
                                Start Solo Trial
                            </button>
                        </div>

                        {/* Tier 2: Connected */}
                        <div style={{ background: 'var(--bg-secondary)', border: '2px solid var(--crown-gold)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-xl)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(212, 175, 55, 0.1)' }}>
                            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-gold)', color: 'var(--gray-900)', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Recommended
                            </div>
                            
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Stylist-Connected</h2>
                            <span style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }}>Sync data directly to your stylist</span>
                            
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 'var(--space-xl)' }}>$29.99<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span></div>
                            
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)', flexGrow: 1 }}>
                                <li style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ color: 'var(--crown-gold)', flexShrink: 0, marginTop: '2px' }}/> Everything in Solo</li>
                                <li style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ color: 'var(--crown-gold)', flexShrink: 0, marginTop: '2px' }}/> Live Sync to Stylist Portal</li>
                                <li style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} style={{ color: 'var(--crown-gold)', flexShrink: 0, marginTop: '2px' }}/> Real-time product recommendations from your cosmetologist</li>
                            </ul>

                            <button onClick={() => handleCheckout(STRIPE_LINKS.connected)} disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: 'var(--space-md)' }}>
                                {isLoading ? 'Processing...' : 'Start Connected Trial'}
                            </button>
                        </div>

                    </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'var(--space-xl)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    <ShieldAlert size={14} /> Secure AES-256 Stripe Encrypted Checkout
                </div>

                <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-xl)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-sm)' }}>Already purchased on Crowncare.app?</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 'var(--space-md)' }}>Enter the email address you used to purchase to instantly unlock the app.</p>
                    <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
                        <input type="email" placeholder="client@email.com" className="form-input" value={claimEmail} onChange={e => setClaimEmail(e.target.value)} style={{ flex: 1 }} />
                        <button className="btn btn-outline" onClick={handleClaim} disabled={isClaiming || !claimEmail}>
                            {isClaiming ? 'Restoring...' : 'Restore'}
                        </button>
                    </div>
                    {claimMessage && <p style={{ marginTop: 'var(--space-md)', fontSize: '13px', color: claimMessage.includes('❌') ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>{claimMessage}</p>}
                </div>

            </div>
        </div>
    );
}
