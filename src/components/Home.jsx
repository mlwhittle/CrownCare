import { useApp } from '../context/AppContext';
import { Crown, Camera, Salad, Pill, Moon, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import heroImg from '../assets/images/hero.png';
import './Home.css';

export default function Home({ setCurrentView, openAI }) {
    const { onboarding, getDaysTracking, getStreak, treatments, nutritionLogs, photos } = useApp();

    const days = getDaysTracking();
    const streak = getStreak();
    const name = onboarding?.name || 'Queen';

    const quickActions = [
        { id: 'diary', label: 'Take Photo', icon: Camera, color: 'var(--blue-500)', desc: 'Document progress' },
        { id: 'nutrition', label: 'Log Nutrition', icon: Salad, color: 'var(--gold-500)', desc: 'Track nutrients' },
        { id: 'treatments', label: 'Log Treatment', icon: Pill, color: 'var(--sky-500)', desc: 'Clinical & natural' },
        { id: 'routines', label: 'Night Routine', icon: Moon, color: 'var(--warm-500)', desc: 'Protect your hair' },
    ];

    return (
        <div className="home">
            {/* Hero */}
            <div className="home-hero">
                <img src="/hero.png" alt="Healthy beautiful hair" className="hero-bg" />
                <div className="home-hero-content">
                    <div className="hero-greeting">
                        <h1 style={{ color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>Hey, {name} <span className="wave">👑</span></h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>Your crown deserves care. Let's keep growing.</p>
                    </div>
                </div>
            </div>

            <div className="card hero-stats-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <span className="stat-value">{days}</span>
                        <span className="stat-label">Days</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat">
                        <span className="stat-value">{streak}🔥</span>
                        <span className="stat-label">Streak</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat">
                        <span className="stat-value">{photos.length}</span>
                        <span className="stat-label">Photos</span>
                    </div>
                </div>
            </div>

            {/* Educational Text */}
            <div className="home-intro-text">
                <p>
                    Taking care of your hair is harder than it looks because each strand grows from a tiny root under your skin, and that root is affected by things like stress, diet, hormones, age, and even how you style your hair. Healthy hair is important because it can show what’s going on inside your body and it also affects how confident and comfortable you feel about yourself. Many women don’t know how to fix hair problems because there is so much confusing information online, and without understanding how hair grows and what really causes damage or thinning, they end up treating the outside instead of solving the real problem.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="actions-grid">
                {quickActions.map(a => (
                    <button key={a.id} className="action-card" onClick={() => setCurrentView(a.id)}>
                        <div className="action-icon" style={{ background: a.color }}>
                            <a.icon size={22} color="white" />
                        </div>
                        <div className="action-label">{a.label}</div>
                        <div className="action-desc">{a.desc}</div>
                    </button>
                ))}
            </div>

            {/* AI CTA */}
            <div className="ai-cta" onClick={openAI}>
                <Sparkles size={24} />
                <div>
                    <strong>Ask the AI Hair Coach</strong>
                    <p>Get instant answers about treatments, nutrition, and scalp health</p>
                </div>
            </div>

            {/* Porosity tips */}
            {onboarding?.recommendations && (
                <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <TrendingUp size={18} /> Your Profile Tips
                    </h3>
                    <ul style={{ paddingLeft: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {onboarding.recommendations.tips.slice(0, 3).map((tip, i) => (
                            <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Today's activity */}
            <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Today's Activity</h3>
                {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayTreatments = treatments.filter(t => t.date.startsWith(today));
                    const todayNutrition = nutritionLogs.find(n => n.date.startsWith(today));

                    if (!todayTreatments.length && !todayNutrition) {
                        return <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>No activity logged today. Start tracking!</p>;
                    }

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {todayNutrition && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>
                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Nutrition logged
                                </div>
                            )}
                            {todayTreatments.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>
                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> {t.name}
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
