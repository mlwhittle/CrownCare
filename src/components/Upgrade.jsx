import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, X, Crown, Users, Stethoscope, Calendar, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Capacitor } from '@capacitor/core';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StoreKitPaywall } from 'capacitor-storekit-paywall';
import './Upgrade.css';

export default function Upgrade({ onClose }) {
    const { user, isVIP } = useApp();
    const [purchaseStatus, setPurchaseStatus] = useState('');
    const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(true);

    const STRIPE_LINKS = {
        'Solo Client': 'https://buy.stripe.com/eVq3cwbJ5b8O7WzbQ2fUQ04',
        'Connected Client': 'https://buy.stripe.com/14A8wQfZlgt8a4HdYafUQ05',
        'Stylist Pro': 'https://buy.stripe.com/aFa00kcN97WCgt5g6ifUQ06',
    };

    const REVENUECAT_PRODUCTS = {
        'Solo Client': 'crowncare_solo_monthly',
        'Connected Client': 'crowncare_connected_monthly',
        'Stylist Pro': 'crowncare_pro_monthly',
    };

    React.useEffect(() => {
        const loadProducts = async () => {
            if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
                try {
                    const { Purchases } = await import('@revenuecat/purchases-capacitor');
                    await Purchases.getProducts(Object.values(REVENUECAT_PRODUCTS));
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
    }, []);

    const openNativePaywall = async () => {
        setIsPurchaseLoading(true);
        try {
            await StoreKitPaywall.presentPaywall();
            
            // Sync with RevenueCat/Firebase after native Apple view closes
            const { Purchases } = await import('@revenuecat/purchases-capacitor');
            const { customerInfo } = await Purchases.getCustomerInfo();
            const activeEntitlements = customerInfo?.entitlements?.active || {};
            
            let activeTier = null;
            if (activeEntitlements['pro']) activeTier = 'pro';
            else if (activeEntitlements['connected']) activeTier = 'connected';
            else if (activeEntitlements['solo']) activeTier = 'solo';

            if (activeTier || customerInfo.activeSubscriptions.length > 0) {
                if (user) {
                    try {
                        await setDoc(doc(db, 'users', user.uid), {
                            hasActiveAppSubscription: true,
                            subscriptionTier: activeTier || 'solo'
                        }, { merge: true });
                    } catch (err) {
                        console.error("Firebase sync failed:", err);
                    }
                }
                setPurchaseStatus('🎉 Purchase successful! Unlocking app...');
                setTimeout(() => onClose(), 1500);
            } else {
                onClose();
            }
        } catch (e) {
            console.error("StoreKitPaywall Error:", e);
            setPurchaseStatus("Error: " + (e.message || e.toString()));
        } finally {
            setIsPurchaseLoading(false);
        }
    };

    const handleSelectTier = async (tierName, price) => {
        // Web / Android: open Stripe payment link
        const stripeUrl = STRIPE_LINKS[tierName];
        if (stripeUrl && !Capacitor.isNativePlatform()) {
            window.open(stripeUrl, '_blank');
        }
        onClose();
    };

    // --- NATIVE IOS STOREKIT 2 PAYWALL RENDER ---
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        return (
            <div className="upgrade-modal-overlay">
                <div className="upgrade-modal" style={{ maxWidth: '500px', width: '95%', textAlign: 'center' }}>
                    <button className="upgrade-close-btn" onClick={onClose}><X size={24} /></button>
                    
                    <div className="upgrade-header" style={{ marginBottom: 'var(--space-xl)' }}>
                        <div className="upgrade-icon-wrap" style={{ margin: '0 auto', marginBottom: 'var(--space-sm)' }}>
                            <Crown size={32} color="var(--brand-500)" />
                        </div>
                        <h2>CrownCare Subscriptions</h2>
                        <p className="text-muted">Choose the plan that fits your hair journey via secure Apple subscriptions.</p>
                    </div>

                    <div style={{ padding: '0 var(--space-md)' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: 'var(--space-md)' }} 
                            onClick={openNativePaywall} 
                            disabled={isPurchaseLoading}
                        >
                            {isPurchaseLoading ? 'Opening App Store...' : 'Select Plan'}
                        </button>
                    </div>

                    {purchaseStatus && (
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)', color: purchaseStatus.includes('successful') ? 'var(--success)' : 'var(--error)' }}>
                            {purchaseStatus}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- WEB / ANDROID STRIPE RENDER ---
    return (
        <div className="upgrade-modal-overlay">
            <div className="upgrade-modal" style={{ maxWidth: '900px', width: '95%' }}>
                <button className="upgrade-close-btn" onClick={onClose}><X size={24} /></button>

                <div className="upgrade-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="upgrade-icon-wrap" style={{ margin: '0 auto', marginBottom: 'var(--space-sm)' }}>
                        <Crown size={32} color="var(--brand-500)" />
                    </div>
                    <h2>Choose Your CrownCare Plan</h2>
                    <p className="text-muted">Select the tier that fits your clinical hair health journey.</p>
                </div>

                <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    
                    {/* Tier 1: Solo Client */}
                    <div className="pricing-card" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Solo Client</h3>
                        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>Full feature access for independent users.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-600)', marginBottom: 'var(--space-lg)' }}>
                            $19.99<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, marginBottom: 'var(--space-lg)' }}>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Check size={16} color="var(--success)" /> CrownCare AI Coach</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Check size={16} color="var(--success)" /> Visual Diary Tracking</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Check size={16} color="var(--success)" /> Basic Product Analysis</li>
                        </ul>
                        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleSelectTier('Solo Client', '$19.99')}>
                            Select Plan
                        </button>
                    </div>

                    {/* Tier 2: Connected Client */}
                    <div className="pricing-card" style={{ border: '2px solid var(--brand-400)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', background: 'var(--brand-50)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-500)', color: 'white', fontSize: '10px', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>MOST POPULAR</div>
                        <h3 style={{ margin: 0, color: 'var(--brand-800)' }}>Connected Client</h3>
                        <p className="text-sm text-muted" style={{ color: 'var(--brand-700)', marginBottom: 'var(--space-md)' }}>Link directly with a licensed Stylist.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-600)', marginBottom: 'var(--space-lg)' }}>
                            $29.99<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, marginBottom: 'var(--space-lg)' }}>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--brand-900)' }}><Check size={16} color="var(--brand-500)" /> <strong>Everything in Solo</strong></li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--brand-900)' }}><Stethoscope size={16} color="var(--brand-500)" /> 24/7 Stylist Monitoring</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--brand-900)' }}><Check size={16} color="var(--brand-500)" /> Custom Clinical Protocols</li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleSelectTier('Connected Client', '$29.99')}>
                            Select Plan
                        </button>
                    </div>

                    {/* Tier 3: Stylist Pro */}
                    <div className="pricing-card" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Stylist Pro</h3>
                        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>For licensed cosmetologists.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 'var(--space-lg)' }}>
                            $49.99<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, marginBottom: 'var(--space-lg)' }}>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Users size={16} color="var(--gray-500)" /> Unlimited Client Roster</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Database size={16} color="var(--gray-500)" /> Client Management System</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Calendar size={16} color="var(--gray-500)" /> Appointment Calendar</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Check size={16} color="var(--gray-500)" /> Issue Clinical Protocols</li>
                            <li style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}><Check size={16} color="var(--gray-500)" /> <strong>Manage Client Connections</strong></li>
                        </ul>
                        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleSelectTier('Stylist Pro', '$49.99')}>
                            Select Plan
                        </button>
                    </div>

                </div>

                <div className="upgrade-footer" style={{ textAlign: 'center', background: 'transparent', border: 'none', paddingTop: 0, paddingBottom: 'var(--space-md)' }}>
                    <p className="secure-badge" style={{ justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
                        <ShieldCheck size={14} /> Secure recurring billing
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        <a href="https://crowncare.app/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</a>
                        {' | '}
                        <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
