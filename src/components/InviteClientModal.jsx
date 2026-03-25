import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Copy, Check, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function InviteClientModal({ isOpen, onClose }) {
    const { onboarding, user } = useApp();
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // Use specific Rewardful ID if configured, otherwise fallback to their cleaned name or Firebase UID
    const safeName = (onboarding?.name || 'stylist').toLowerCase().replace(/\s+/g, '');
    const affiliateId = onboarding?.rewardfulId || safeName || user?.uid;
    
    // Generates the web link so they bypass App Store fees
    const referralUrl = `https://crowncare.app/?via=${affiliateId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '24px',
                width: '100%', maxWidth: '400px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(212, 175, 55, 0.15)', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                        <Users size={28} color="var(--gold-primary)" />
                    </div>
                    
                    <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)', fontWeight: 600 }}>Invite Your Client</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                        Have your client scan this code with their camera to link their CrownCare account directly to your stylist dashboard.
                    </p>

                    <div style={{ 
                        background: '#FFFFFF', 
                        padding: '24px',
                        borderRadius: '16px',
                        display: 'inline-block',
                        marginBottom: '24px',
                        boxShadow: '0 4px 12px -1px rgba(0, 0, 0, 0.15)',
                        border: '2px solid rgba(15, 23, 42, 0.05)'
                    }}>
                        <QRCode 
                            value={referralUrl}
                            size={200}
                            bgColor="#FFFFFF"
                            fgColor="#0F172A"
                            level="Q"
                        />
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'left', flex: 1 }}>
                            {referralUrl}
                        </div>
                        <button 
                            onClick={handleCopy}
                            style={{ 
                                background: copied ? 'var(--success)' : 'var(--brand-primary)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '0.85rem', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
