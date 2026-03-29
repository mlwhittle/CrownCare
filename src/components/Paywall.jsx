import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

const STRIPE_LINKS = {
    solo: "https://buy.stripe.com/eVq3cwbJ5b8O7WzbQ2fUQ04",
    connected: "https://buy.stripe.com/14A8wQfZlgt8a4HdYafUQ05",
    stylist: "https://buy.stripe.com/aFa00kcN97WCgt5g6ifUQ06",
    founders: "https://buy.stripe.com/8x228sfZl2Ci4Kn07kfUQ09"
};

export default function Paywall({ onSubscribeSuccess }) {
    const { onboarding, user, setIsPremium } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [claimEmail, setClaimEmail] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimMessage, setClaimMessage] = useState('');
    
    const userType = onboarding?.userType || 'solo';
    const isStylist = userType === 'stylist';

    const handleCheckout = async (link, tier) => {
        setIsLoading(true);
        setClaimMessage('');
        
        if (import.meta.env.DEV && !Capacitor.isNativePlatform()) {
            setTimeout(() => { setIsLoading(false); onSubscribeSuccess(true); }, 1500);
            return;
        }

        if (Capacitor.isNativePlatform()) {
            try {
                const offerings = await Purchases.getOfferings();
                
                if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
                    const packageToBuy = tier === 'stylist' 
                        ? offerings.current.availablePackages.find(p => p.identifier.includes('pro')) || offerings.current.availablePackages[0]
                        : offerings.current.availablePackages.find(p => p.identifier.includes('connected')) || offerings.current.availablePackages[0];
                    
                    if (packageToBuy) {
                        const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
                        // Just check if ANY entitlement was explicitly granted by Apple/Google
                        if (Object.keys(customerInfo.entitlements.active).length > 0) {
                            onSubscribeSuccess(true);
                        } else {
                            setClaimMessage('❌ Subscription processed but no access granted. Contact support.');
                        }
                    } else {
                         setClaimMessage('❌ Error: Product ID mismatch in RevenueCat.');
                    }
                } else {
                    setClaimMessage('❌ Error: RevenueCat Offerings not configured properly.');
                }
            } catch (e) {
                if (!e.userCancelled) setClaimMessage('❌ App Store Error: ' + e.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            // In production web, force a hard redirect to the live Stripe Payment URL
            window.location.href = link;
        }
    };

    const handleClaim = async () => {
        if (!claimEmail || !user) return;
        setIsClaiming(true);
        setClaimMessage('');
        
        // --- MASTER ADMIN DEMO BYPASS ---
        if (claimEmail.trim().toLowerCase() === 'admin') {
            setClaimMessage('👑 Admin Override Accepted. Unlocking app...');
            setTimeout(() => {
                onSubscribeSuccess(true);
            }, 1500);
            return;
        }

        try {
            const apiEndpoint = 'https://claimwebsubscription-6tvsh2cpua-uc.a.run.app';

            const req = await fetch(apiEndpoint, {
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
                            type="button"
                            onClick={() => handleCheckout(STRIPE_LINKS.stylist, 'stylist')}
                            disabled={isLoading}
                            className="btn btn-primary btn-lg" 
                            style={{ width: '100%', fontSize: 'var(--font-size-lg)', height: '60px', background: 'var(--crown-gold)', color: '#000' }}
                        >
                            {isLoading ? 'Processing...' : 'Activate Professional Subscription'}
                        </button>
                    </div>

                ) : (
                    /* CLIENT USER PAYWALL */
                    <div style={{ background: 'var(--bg-secondary)', border: '2px solid var(--blue-500)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-2xl)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--blue-500)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
                            <div>
                                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Client Companion</h2>
                                <span style={{ color: 'var(--text-tertiary)' }}>CrownCare Premium Access</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--text-primary)' }}>$29.99<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span></div>
                            </div>
                        </div>

                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--blue-500)' }}/> AI Trichologist Hair Coach</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--blue-500)' }}/> Live Web-Sync to your Hairstylist</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--blue-500)' }}/> Visual Hair Diary & Progress Tracking</li>
                        </ul>

                        <button 
                            type="button"
                            onClick={() => handleCheckout(STRIPE_LINKS.connected, 'client')}
                            disabled={isLoading}
                            className="btn btn-primary btn-lg" 
                            style={{ width: '100%', fontSize: 'var(--font-size-lg)', height: '60px', background: 'var(--blue-500)' }}
                        >
                            {isLoading ? 'Processing...' : 'Activate Premium Subscription'}
                        </button>
                    </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'var(--space-xl)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    <ShieldAlert size={14} /> Secure AES-256 Stripe Encrypted Checkout
                </div>

                <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-xl)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-sm)' }}>Already purchased on Crowncare.app?</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 'var(--space-md)' }}>Enter the email address you used to purchase to instantly unlock the app.</p>
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleClaim(); }}
                        style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' }}
                    >
                        <input type="email" placeholder="client@email.com" className="form-input" value={claimEmail} onChange={e => setClaimEmail(e.target.value)} style={{ flex: 1 }} />
                        <button type="submit" className="btn btn-outline" disabled={isClaiming || !claimEmail}>
                            {isClaiming ? 'Restoring...' : 'Restore'}
                        </button>
                    </form>
                    {claimMessage && <p style={{ marginTop: 'var(--space-md)', fontSize: '13px', color: claimMessage.includes('❌') ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>{claimMessage}</p>}
                </div>

            </div>
        </div>
    );
}
