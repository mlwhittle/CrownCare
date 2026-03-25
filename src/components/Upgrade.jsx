import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, X, Crown, Users, Stethoscope, Calendar, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Upgrade.css';

export default function Upgrade({ onClose }) {
    const { user, isVIP } = useApp();

    const handleSelectTier = (tierName, price) => {
        alert(`Stripe Checkout Integration: \n\nYou have selected the ${tierName} tier for ${price}/month. \n\nIn the production environment, this button will immediately route the user to the Stripe Checkout portal for this specific pricing tier.`);
        onClose();
    };

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
                        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleSelectTier('Solo Client', '$19.99')}>Select Plan</button>
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
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleSelectTier('Connected Client', '$29.99')}>Select Plan</button>
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
                        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleSelectTier('Stylist Pro', '$49.99')}>Select Plan</button>
                    </div>

                </div>

                <div className="upgrade-footer" style={{ textAlign: 'center', background: 'transparent', border: 'none', paddingTop: 0 }}>
                    <p className="secure-badge" style={{ justifyContent: 'center' }}>
                        <ShieldCheck size={14} /> Secure recurring billing powered by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
}
