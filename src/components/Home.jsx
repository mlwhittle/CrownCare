import { useApp } from '../context/AppContext';
import { Camera, Salad, Pill, Moon, Sparkles, TrendingUp, CheckCircle2, Clock, User, ArrowRight, Award, BookOpen, BarChart3, Settings, LayoutGrid, Droplets } from 'lucide-react';
import './Home.css';
import inclusiveLuxuryHeroImg from '../assets/images/crowncare_hero_v4.png';
import { useTranslation } from 'react-i18next';

export default function Home({ setCurrentView, openAI }) {
    const { t } = useTranslation();
    const { onboarding, getDaysTracking, getStreak, treatments, nutritionLogs, photos, appointments, stylistContact } = useApp();

    const days = getDaysTracking();
    const streak = getStreak();
    const name = onboarding?.name || 'Queen';

    // Calculate Microbiome Status based on recent Actives usage
    const recentActives = treatments?.filter(t => t.type === 'actives' && (new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24) <= 7) || [];
    const microbiomeScore = recentActives.length >= 3 ? 'Optimal' : recentActives.length > 0 ? 'Improving' : 'Unbalanced';

    const quickActions = [
        { id: 'settings', label: t('quick_actions.profile'), icon: User, color: 'var(--brand-primary)', desc: 'Account Details' },
        { id: 'nutrition', label: t('quick_actions.nutrition'), icon: Salad, color: 'var(--gold-primary)', desc: 'AI Plate Scanner' },
        { id: 'journal', label: t('quick_actions.journal'), icon: BookOpen, color: '#A78BFA', desc: 'AI Therapist' },
        { id: 'routines', label: t('quick_actions.routines'), icon: Moon, color: 'var(--success)', desc: 'Protect your hair' },
        { id: 'treatments', label: t('quick_actions.treatments'), icon: Pill, color: '#34D399', desc: 'Smart Protocols' },
        { id: 'narrative', label: t('quick_actions.narrative'), icon: Sparkles, color: 'var(--warning)', desc: 'Monthly AI Report' },
        { id: 'dashboard', label: t('quick_actions.dashboard'), icon: TrendingUp, color: 'var(--brand-secondary)', desc: 'Length Tracking' },
        { id: 'reports', label: t('quick_actions.reports'), icon: BarChart3, color: '#F87171', desc: 'Legacy Stats' }
    ];

    return (
        <div className="home" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '1rem', color: 'var(--text-primary)', paddingBottom: '100px' }}>
            {/* Header / Top Nav area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--brand-primary)', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-serif)' }}>{t('overview')}</h1>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('welcome_back')}, {name}</span>
                </div>
            </div>

            {/* RESTORED LAYER: The Hero Image & Founder's Story */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '24px', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                 <img src={inclusiveLuxuryHeroImg} alt="Clinical Luxury CrownCare" style={{ width: '100%', height: 'auto', display: 'block' }} />
                 <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', marginBottom: '12px', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>{t('mission_title')}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                        Welcome to CrownCare. My name is Melvin Whittle, and alongside my wife Lucy Whittle, we created this platform to bridge the gap between premium clinical care and daily holistic maintenance. From our family to yours, we believe that your crown deserves reverence, transparency, and scientific tracking.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        This tool is built to empower you to take control of your retention journey without the guesswork. Whether it's analyzing a label or comparing your monthly visual progress, CrownCare is your dedicated digital companion.
                    </p>
                 </div>
            </div>

            {/* RESTORED LAYER: User Profile Snapshot */}
            {onboarding && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Your Hair Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Texture</span>
                            <span style={{ fontWeight: 600, color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)' }}>{onboarding.texture || '4C Coily'}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Porosity</span>
                            <span style={{ fontWeight: 600, color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)' }}>{onboarding.porosity || 'Low Porosity'}</span>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Primary Goal</span>
                            <span style={{ fontWeight: 600, color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)', display: 'inline-flex', padding: '4px 10px', background: 'var(--gold-light)', borderRadius: '20px' }}>
                                {onboarding.goals && onboarding.goals.length > 0 ? onboarding.goals[0] : 'Health & Growth'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. TOP LAYER: Daily Progress Score & Microbiome */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                        <TrendingUp size={14} color="var(--brand-primary)" /> Daily Progress
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>85%</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.2 }}>Sleep sync & nutrition.</p>
                </div>

                <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.02))', border: '1px solid var(--gold-200)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }} onClick={() => setCurrentView('treatments')}>
                    <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gold-600)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                        <Droplets size={14} color="var(--gold-500)" /> Microbiome Status
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '1.65rem', fontWeight: 700, lineHeight: 1, color: 'var(--gold-600)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>{microbiomeScore}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--gold-700)', lineHeight: 1.2 }}>Based on Scalp Actives.</p>
                </div>
            </div>

            {/* 2. MIDDLE LAYER: The Ghost Overlay Entry (Visual Diary) */}
            <button 
                onClick={() => setCurrentView('diary')}
                style={{ 
                    width: '100%', 
                    marginBottom: '1.5rem', 
                    padding: '2rem 1.5rem', 
                    background: 'var(--gradient-primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: 'var(--shadow-md)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '16px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
            >
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '18px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Camera size={42} color="var(--gold-primary)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px 0', fontFamily: 'var(--font-serif)', color: 'white', letterSpacing: '0.5px' }}>Visual Hair Diary</h2>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.2px' }}>Launch Ghost Overlay Scanner</p>
                </div>
            </button>

            {/* 3. BOTTOM LAYER: AI Insights Feed */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-primary)', margin: '0 0 1.25rem 0', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <Sparkles size={20} color="var(--gold-primary)" /> Gemini Insights
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '16px', background: 'var(--success-light)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>Scalp Audit: Excellent</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Your latest visual scan shows a 12% reduction in inflammation along the crown.</p>
                    </div>

                    <div style={{ padding: '16px', background: 'var(--warning-light)', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>Ingredient Warning</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>The 'Heavy Cream' you scanned yesterday contains Silicones currently incompatible with your Low Porosity profile.</p>
                    </div>
                </div>
            </div>

            {/* 4. RESTORED LAYER: Quick Actions Directory */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-primary)', margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <LayoutGrid size={20} color="var(--brand-primary)" /> Quick Tools Directory
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {quickActions.map(action => (
                        <div key={action.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '1.25rem', cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }} onClick={() => setCurrentView(action.id)}>
                            <div style={{ marginBottom: '0.75rem', background: 'var(--bg-primary)', padding: '10px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                                <action.icon size={24} color={action.color} />
                            </div>
                            <h3 style={{ fontSize: '0.90rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{action.label}</h3>
                            <p style={{ margin: 0, fontSize: '0.70rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{action.desc}</p>
                        </div>
                    ))}
                 </div>
            </div>

        </div>
    );
}
