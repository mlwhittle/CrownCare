import React from 'react';
import { Camera, Salad, Pill, Moon, Sparkles, BookOpen, BarChart3, User, LayoutGrid, TrendingUp, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Home.css';

export default function Menu({ setCurrentView }) {
    const { isStylistAccount } = useApp();

    const quickActions = [
        { id: 'settings', label: 'Profile', icon: User, color: 'var(--brand-primary)', desc: 'Account & Subscriptions' },
        ...(isStylistAccount ? [{ id: 'stylist-portal', label: 'Pro Portal', icon: Briefcase, color: 'var(--sky-600)', desc: 'B2B Client Dashboard' }] : []),
        { id: 'diary', label: 'Visual Diary', icon: Camera, color: 'var(--brand-500)', desc: 'Scan and track growth' },
        { id: 'nutrition', label: 'Nutrition', icon: Salad, color: 'var(--gold-primary)', desc: 'AI Plate Scanner' },
        { id: 'journal', label: 'Voice Journal', icon: BookOpen, color: '#A78BFA', desc: 'AI Therapist' },
        { id: 'routines', label: 'Routines', icon: Moon, color: 'var(--success)', desc: 'Protect your hair' },
        { id: 'treatments', label: 'Treatments', icon: Pill, color: '#34D399', desc: 'Smart Protocols' },
        { id: 'narrative', label: 'Narrative', icon: Sparkles, color: 'var(--warning)', desc: 'Monthly AI Report' },
        { id: 'reports', label: 'Reports', icon: BarChart3, color: '#F87171', desc: 'Stats & Trends' },
        { id: 'dashboard', label: 'Growth Report', icon: TrendingUp, color: 'var(--brand-secondary)', desc: 'Length & Retention' }
    ];

    // Using ES Module import above instead of require

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '1rem', color: 'var(--text-primary)', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', paddingTop: '1rem', paddingLeft: 'var(--space-sm)' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <LayoutGrid size={28} color="var(--brand-primary)" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>Quick List</h1>
                    <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>All your CrownCare tools in one place.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '0 var(--space-sm)' }}>
                {quickActions.map(action => (
                    <div key={action.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '1.25rem', cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)'} }} onClick={() => setCurrentView(action.id)}>
                        <div style={{ marginBottom: '0.75rem', background: 'var(--bg-primary)', padding: '10px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                            <action.icon size={24} color={action.color} />
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{action.label}</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{action.desc}</p>
                    </div>
                ))}
             </div>
        </div>
    );
}
