import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Sparkles, ArrowRight, ShieldCheck, Mail, User } from 'lucide-react';

export default function FoundersProgram({ setCurrentView }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        try {
            // Save lead to Firestore
            await addDoc(collection(db, 'founders_leads'), {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                timestamp: new Date().toISOString(),
                status: 'interested'
            });

            // Navigate to main offer
            setCurrentView('founders-offer');
        } catch (err) {
            console.error("Error saving lead:", err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
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
                maxWidth: '550px', 
                width: '100%', 
                padding: 'var(--space-2xl)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--bg-secondary)'
            }}>
                {/* Visual Top Accent Line */}
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
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '6px 16px', 
                        background: 'rgba(212, 175, 55, 0.1)', 
                        border: '1px solid var(--gold-primary)', 
                        borderRadius: '100px', 
                        color: 'var(--gold-primary)', 
                        fontWeight: 'bold', 
                        fontSize: 'var(--font-size-xs)', 
                        marginBottom: 'var(--space-md)' 
                    }}>
                        <Sparkles size={14} /> EXCLUSIVE INVITATION
                    </div>
                    <h1 className="gradient-text-hero" style={{ 
                        fontSize: 'var(--font-size-3xl)', 
                        fontWeight: 800,
                        fontFamily: 'var(--font-serif)',
                        marginBottom: 'var(--space-sm)',
                        color: 'var(--brand-primary)'
                    }}>
                        Founders Program
                    </h1>
                    <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: 'var(--font-size-sm)',
                        lineHeight: 1.6,
                        marginTop: '8px'
                    }}>
                        Be part of our exclusive inner circle. Secure lifetime discounts, preview upcoming AI models before the public release, and directly influence our product roadmap.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ 
                                position: 'absolute', 
                                left: '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--text-tertiary)' 
                            }} />
                            <input 
                                type="text" 
                                placeholder="Your Name" 
                                className="form-input" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                style={{ paddingLeft: '45px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Email Address *</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ 
                                position: 'absolute', 
                                left: '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--text-tertiary)' 
                            }} />
                            <input 
                                type="email" 
                                required
                                placeholder="name@email.com" 
                                className="form-input" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                style={{ paddingLeft: '45px' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <p style={{ 
                            color: 'var(--error)', 
                            fontSize: 'var(--font-size-sm)', 
                            fontWeight: 'bold', 
                            textAlign: 'center', 
                            marginTop: '-8px' 
                        }}>
                            {error}
                        </p>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-primary btn-lg" 
                        style={{ 
                            width: '100%', 
                            height: '56px',
                            background: 'var(--gradient-warm)', 
                            color: '#FFFFFF',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'bold',
                            border: 'none',
                            marginTop: '8px'
                        }}
                    >
                        {isLoading ? 'Reserving Your Spot...' : 'Get Instant Access & Unlock Main Offer'} 
                        <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                    </button>
                </form>

                <div style={{ 
                    marginTop: 'var(--space-xl)', 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: 'var(--space-md)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-tertiary)',
                    fontSize: '11px'
                }}>
                    <ShieldCheck size={14} style={{ color: 'var(--success)' }} /> We respect your privacy. Opt out anytime.
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
                Back to Home
            </button>
        </div>
    );
}
