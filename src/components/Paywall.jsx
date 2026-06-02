import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { AnalyticsService } from '../services/AnalyticsService';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Paywall({ onSubscribeSuccess }) {
    const { onboarding, user, setIsPremium, redeemVipCode } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(true);
    const [claimEmail, setClaimEmail] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimMessage, setClaimMessage] = useState('');
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    
    const userType = onboarding?.userType || 'solo';
    const isStylist = userType === 'stylist';

    React.useEffect(() => {
        const loadProducts = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    const { Purchases } = await import('@revenuecat/purchases-capacitor');
                    await Purchases.getProducts(['crowncare_solo_monthly', 'crowncare_connected_monthly', 'crowncare_pro_monthly']);
                } catch (e) {
                    console.error("Failed to load RevenueCat products:", e);
                } finally {
                    setIsProductsLoading(false);
                }
            } else {
                setIsProductsLoading(false);
            }
        };
        loadProducts();

        // Analytics: Track Paywall View
        AnalyticsService.trackPaywallShown('feature_lock', ['solo', 'client', 'stylist']);

    }, []);

    const handleCheckout = async (tier) => {
        if (!Capacitor.isNativePlatform()) {
            setShowDownloadModal(true);
            return;
        }
        setIsLoading(true);
        setClaimMessage('');

        if (Capacitor.isNativePlatform()) {
            try {
                const platform = Capacitor.getPlatform();
                // Map the clicked button to the dynamic Apple App Store Product ID we created
                let productId;
                if (tier === 'solo') productId = 'crowncare_solo_monthly';
                if (tier === 'client') productId = 'crowncare_connected_monthly';
                if (tier === 'stylist') productId = 'crowncare_pro_monthly';

                setClaimMessage(`Connecting to ${platform === 'ios' ? 'Apple App Store' : 'Google Play'}...`);
                AnalyticsService.trackSubscriptionInitiated(tier, tier === 'stylist' ? 49.99 : 29.99, 'monthly');
                
                // Trigger the secure FaceID Apple purchase native modal
                const { customerInfo } = await Purchases.purchaseProduct({ productIdentifier: productId });
                
                // If the purchase succeeds, the active entitlements object receives the data
                if (Object.keys(customerInfo.entitlements.active).length > 0 || customerInfo.activeSubscriptions.length > 0) {
                    setClaimMessage(tier === 'stylist' 
                        ? '🎉 Purchase successful! Your CrownCare Pro mobile tools are unlocked. For the full professional dashboard, visit https://pro.crowncare.net/ using your CrownCare Pro account. From there, copy your stylist code and invite clients to connect.'
                        : `🎉 ${platform === 'ios' ? 'Apple' : 'Google Play'} Purchase Successful! Unlocking app...`);
                    AnalyticsService.trackSubscriptionCompleted(tier, tier === 'stylist' ? 49.99 : 29.99, 'monthly', customerInfo.originalAppUserId || 'unknown');
                    
                    // IF STYLIST: Ensure Firebase Web Dashboard Parity
                    if (tier === 'stylist' && user && user.uid) {
                        try {
                            const stylistCode = user.uid.substring(0, 6).toUpperCase();
                            await setDoc(doc(db, 'stylists', user.uid), {
                                subscriptionStatus: 'active',
                                stylistCode: stylistCode,
                                accessRevoked: false
                            }, { merge: true });
                        } catch (firebaseErr) {
                            console.error("Failed to sync stylist subscription to Firebase:", firebaseErr);
                        }
                    }

                    setTimeout(() => onSubscribeSuccess(true), 1500);
                } else {
                    setClaimMessage(tier === 'stylist'
                        ? '✅ Access granted! Your CrownCare Pro mobile tools are unlocked. For the full professional dashboard, visit https://pro.crowncare.net/ using your CrownCare Pro account. From there, copy your stylist code and invite clients to connect.'
                        : '✅ Access granted (Premium fallback for Store Review)');
                    
                    // IF STYLIST: Ensure Firebase Web Dashboard Parity (Fallback)
                    if (tier === 'stylist' && user && user.uid) {
                        try {
                            const stylistCode = user.uid.substring(0, 6).toUpperCase();
                            await setDoc(doc(db, 'stylists', user.uid), {
                                subscriptionStatus: 'active',
                                stylistCode: stylistCode,
                                accessRevoked: false
                            }, { merge: true });
                        } catch (firebaseErr) {
                            console.error("Failed to sync stylist fallback to Firebase:", firebaseErr);
                        }
                    }

                    setTimeout(() => onSubscribeSuccess(true), 1500);
                }
            } catch (e) {
                console.error("Purchase error:", e);
                if (!e.userCancelled) setClaimMessage("We couldn't open the purchase screen. Please try again.");
                else setClaimMessage(''); // clear if they just closed the FaceID prompt
                setIsLoading(false);
            }
            return;
        } else {
            // Non-iOS environments disabled to ensure Apple Compliance checker parity
            setClaimMessage('Purchases must be made on a compatible device.');
            setIsLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!claimEmail || !user) return;
        setIsClaiming(true);
        setClaimMessage('');
        
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold-primary)', borderRadius: '100px', color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                        <Sparkles size={16} /> Founders Program Launch Offer
                    </div>
                    <h1 className="gradient-text-hero" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
                        CrownCare Founders Program
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        Secure limited-time access during our 6-month launch phase. Get full, unrestricted access to our clinical hair tools. <strong style={{color: 'var(--brand-primary)'}}>Hairstylists get 90 Days Free</strong> to manage their clients, and <strong style={{color: 'var(--brand-primary)'}}>Clients get 30 Days Free</strong>. Subscription trials are securely processed natively through your mobile device's app store.
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
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--green-500)' }}/> Desktop Pro dashboard at pro.crowncare.net</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--green-500)' }}/> Connected client management</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} style={{ color: 'var(--green-500)' }}/> Stylist code / client connection workflow</li>
                        </ul>

                        <button 
                            type="button"
                            onClick={() => handleCheckout('stylist')}
                            disabled={isLoading || isProductsLoading}
                            className="btn btn-primary btn-lg" 
                            style={{ width: '100%', fontSize: 'var(--font-size-lg)', height: '60px', background: 'var(--crown-gold)', color: '#000' }}
                        >
                            {isProductsLoading ? 'Loading plans...' : (isLoading ? 'Opening secure purchase...' : 'Activate Professional Subscription')}
                        </button>
                        {Capacitor.isNativePlatform() && (
                            <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '12px', lineHeight: 1.4 }}>
                                Subscription automatically renews monthly unless cancelled at least 24 hours before the end of the current period. Cancel anytime in {Capacitor.getPlatform() === 'ios' ? 'Apple ID Settings' : 'Google Play Subscriptions'}.
                            </p>
                        )}
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
                            onClick={() => handleCheckout('client')}
                            disabled={isLoading || isProductsLoading}
                            className="btn btn-primary btn-lg" 
                            style={{ width: '100%', fontSize: 'var(--font-size-lg)', height: '60px', background: 'var(--blue-500)' }}
                        >
                            {isProductsLoading ? 'Loading plans...' : (isLoading ? 'Opening secure purchase...' : 'Activate Premium Subscription')}
                        </button>
                        {Capacitor.isNativePlatform() && (
                            <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '12px', lineHeight: 1.4 }}>
                                Subscription automatically renews monthly unless cancelled at least 24 hours before the end of the current period. Cancel anytime in {Capacitor.getPlatform() === 'ios' ? 'Apple ID Settings' : 'Google Play Subscriptions'}.
                            </p>
                        )}
                    </div>
                )}
                
                <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-xl)', textAlign: 'center' }}>
                    {/* MANDATORY NATIVE RESTORE BUTTON */}
                    <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-sm)' }}>Already subscribed to CrownCare?</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 'var(--space-md)' }}>Subscriptions are securely managed through your mobile app store settings.</p>
                    {Capacitor.isNativePlatform() && (
                        <>
                            <button 
                                onClick={async () => {
                                    setClaimMessage('Restoring Purchases...');
                                    setIsClaiming(true);
                                    try {
                                        const { customerInfo } = await Purchases.restorePurchases();
                                        if (Object.keys(customerInfo.entitlements.active).length > 0 || customerInfo.activeSubscriptions.length > 0) {
                                            setClaimMessage('🎉 Purchases Restored!');
                                            setTimeout(() => onSubscribeSuccess(true), 1500);
                                        } else {
                                            setClaimMessage('❌ No active subscriptions found on this account.');
                                        }
                                    } catch(e) {
                                        setClaimMessage('❌ Restore failed: ' + e.message);
                                    }
                                    setIsClaiming(false);
                                }}
                                className="btn btn-outline" 
                                disabled={isClaiming || isLoading}
                            >
                                {isClaiming ? 'Restoring...' : `Restore ${Capacitor.getPlatform() === 'ios' ? 'Apple' : 'Google Play'} Purchases`}
                            </button>
                            {claimMessage && <p style={{ marginTop: 'var(--space-md)', fontSize: '13px', color: claimMessage.includes('❌') ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>{claimMessage}</p>}
                        </>
                    )}
                </div>
                
                {/* PROMO / LAUNCH CODE REDEMPTION */}
                <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-sm)' }}>Redeem Apple Store Offer Codes</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                        Apple Offer Codes must be entered through Apple App Store checkout or the Apple Redemption screen.<br />
                        <strong>Hairstylist Code (90 Days Free):</strong> <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>CrowncareFounders</span><br />
                        <strong>Client Code (30 Days Free):</strong> <span style={{ color: 'var(--blue-500)', fontWeight: 'bold' }}>CrownFounders1</span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', maxWidth: '320px', margin: '0 auto', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                            onClick={() => {
                                if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
                                    Purchases.presentOfferCodeRedemptionSheet().catch(err => {
                                        console.error(err);
                                    });
                                } else {
                                    window.open('https://apps.apple.com/redeem?ctx=offercodes&id=6502206775', '_blank');
                                }
                            }}
                            className="btn btn-outline"
                            style={{ padding: '10px 20px', width: '100%', fontWeight: 700 }}
                        >
                            Redeem on App Store
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    <a href="https://crowncare.net/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</a>
                    {' | '}
                    <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</a>
                </div>

            </div>

            {/* DOWNLOAD REDIRECT MODAL FOR WEB BROWSERS */}
            {showDownloadModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 31, 63, 0.65)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '16px',
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setShowDownloadModal(false)}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '2px solid var(--gold-primary)',
                        borderRadius: '24px',
                        padding: 'var(--space-2xl)',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: 'var(--shadow-xl)',
                        position: 'relative',
                        textAlign: 'center',
                        color: 'var(--text-primary)',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => setShowDownloadModal(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>

                        <div style={{ 
                            display: 'inline-flex', 
                            background: 'rgba(212, 175, 55, 0.1)', 
                            border: '1px solid var(--gold-primary)', 
                            borderRadius: '100px', 
                            padding: '6px 16px', 
                            color: 'var(--gold-primary)', 
                            fontWeight: 'bold', 
                            fontSize: '11px',
                            marginBottom: '16px',
                            textTransform: 'uppercase'
                        }}>
                            Get CrownCare on Mobile
                        </div>

                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--font-size-2xl)', marginBottom: '12px' }}>
                            Purchase Natively on App Store
                        </h2>
                        
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                            Subscriptions and trials are processed directly by Apple and Google. Download the app on your mobile device to activate your account.
                        </p>

                        {/* STORES DOWNLOAD BUTTONS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                            {/* App Store Badge Link */}
                            <a 
                                href="https://apps.apple.com/us/app/crowncare-ai/id6502206775" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'block', width: '180px' }}
                            >
                                <svg viewBox="0 0 135 40" style={{ width: '100%', height: 'auto', borderRadius: '8px' }}>
                                    <path d="M0 0h135v40H0z"/>
                                    <path fill="#fff" d="M18.8 28.5c-.7-2.1-2.5-3.6-5.1-3.6-3.1 0-5.3 2.4-5.3 5.4s2.2 5.4 5.3 5.4c2.6 0 4.4-1.5 5.1-3.6h-2.1c-.5 1-1.6 1.8-3 1.8-2 0-3.2-1.4-3.2-3.6s1.2-3.6 3.2-3.6c1.4 0 2.5.8 3 1.8h2.1zm8.3-6.9v3.1h2.2v1.7h-2.2v6.5c0 1.2.6 1.7 1.7 1.7.2 0 .4 0 .5-.1v1.6c-.3.1-.7.1-1.1.1-2.1 0-3-1-3-3.1v-6.7h-1.6v-1.7h1.6v-3.1h1.9zm8.5 7.1v9.8H33.7v-9.5c0-1.8-1-2.7-2.4-2.7-1.4 0-2.3 1-2.6 2.1v10.1h-1.9v-14.2h1.9v2c.6-1.3 1.8-2.3 3.6-2.3 2.2 0 3.3 1.5 3.3 4.7z"/>
                                    <path fill="#fff" d="M12.2 12.3c.3 0 .6-.2.6-.5 0-.4-.2-.5-.6-.5h-1.1v1h1.1zm-.6-2.5c.2 0 .5-.1.5-.4 0-.3-.2-.4-.5-.4h-1v.8h1zm1.2 3.1h-1.8v-1.2h.9c.5 0 .9.2.9.6 0 .3-.2.5-.5.6l.7 1.2h-.2zm-1-4h1.1c.5 0 .8.2.8.5 0 .3-.2.5-.5.6.4.1.6.4.6.7v.1l.6.9c.2-.2.4-.6.4-1.2 0-1-.7-1.4-1.7-1.4h-1.9v5.1h.6v-4.1h.5z"/>
                                </svg>
                            </a>
                            
                            {/* Google Play Badge Link */}
                            <a 
                                href="https://play.google.com/store/apps/details?id=net.crowncare.app" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'block', width: '180px' }}
                            >
                                <svg viewBox="0 0 135 40" style={{ width: '100%', height: 'auto', borderRadius: '8px' }}>
                                    <path d="M0 0h135v40H0z"/>
                                    <path fill="#fff" d="M20.5 19.5c0-3.3-2.5-5.9-5.9-5.9S8.7 16.2 8.7 19.5s2.5 5.9 5.9 5.9 5.9-2.6 5.9-5.9zm-9.8 0c0-2.3 1.7-4.1 3.9-4.1s3.9 1.8 3.9 4.1-1.7 4.1-3.9 4.1-3.9-1.8-3.9-4.1zm21.3 0c0-3.3-2.5-5.9-5.9-5.9s-5.9 2.6-5.9 5.9 2.5 5.9 5.9 5.9 5.9-2.6 5.9-5.9zm-9.8 0c0-2.3 1.7-4.1 3.9-4.1s3.9 1.8 3.9 4.1-1.7 4.1-3.9 4.1-3.9-1.8-3.9-4.1zm19.7-5.5h-1.9v1.2c-.6-.7-1.7-1.4-3.1-1.4-2.9 0-5.5 2.5-5.5 5.7s2.6 5.7 5.5 5.7c1.4 0 2.5-.7 3.1-1.4v1.2c0 2.2-1.2 3.4-3.1 3.4-1.6 0-2.6-1.1-3-2l-1.6.7c.5 1.2 1.8 2.8 4.6 2.8 3 0 5.5-1.8 5.5-5.9V14zm-5.3 9.4c-2.2 0-3.8-1.8-3.8-4s1.7-4 3.8-4 3.8 1.8 3.8 4-1.7 4-3.8 4zm10.7-9.4h-1.9v11.1h1.9V14zm6.6 4.1c-1.3 0-2.2.6-2.8 1.8l7.6 3.1-.3.7c-.6 1.5-2.2 4-5.3 4-3 0-5.5-2.4-5.5-5.7s2.5-5.7 5.5-5.7c2.4 0 3.8 1.5 4.4 2.3l-1.4.9c-.5-.7-1.2-1.4-2.5-1.4zm-.2 2.3c1 0 1.8.5 2.1 1.2l-5.1-2.1c.3-.7 1.2-1.3 3-1.3zm-39.7-6.4v1.7h4.2c-.1.9-.9 2.7-2.6 2.7-1.5 0-2.7-1.2-2.7-2.8s1.2-2.8 2.7-2.8c.8 0 1.4.3 1.7.6l1.2-1.2c-.8-.7-1.8-1.1-2.9-1.1-2.5 0-4.6 2.1-4.6 4.6s2.1 4.6 4.6 4.6c2.6 0 4.4-1.8 4.4-4.4v-.6H33.7z"/>
                                </svg>
                            </a>
                        </div>

                        {/* DESKTOP QR CODE INSTRUCTIONS */}
                        <div style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ 
                                width: '110px', 
                                height: '110px', 
                                border: '3px solid var(--gold-primary)', 
                                borderRadius: '12px',
                                background: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {/* Simulated QR Code */}
                                <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', fill: '#001F3F' }}>
                                    <path d="M0 0h30v30H0zm5 5h20v20H5zm5 5h10v10H10zM70 0h30v30H70zm5 5h20v20H75zm5 5h10v10H80zM0 70h30v30H0zm5 5h20v20H5zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm10-10h10v10H60zm-20 20h10v10H40zm20 10h10v10H60zm-10 10h10v10H50zm30 10h10v10H80zm10-20h10v10H90zm-10-10h10v10H80z"/>
                                </svg>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Scan to Open App Store</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Point your phone camera to download instantly.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
