import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, Sparkles, Crown } from 'lucide-react';
import onboardingImg from '../assets/images/onboarding.png';

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to CrownCare',
        subtitle: 'Your science-backed hair growth companion',
    },
    {
        id: 'name',
        title: 'What should we call you?',
        type: 'text',
        field: 'name',
        placeholder: 'Your name',
    },
    {
        id: 'concern',
        title: 'What brings you here?',
        type: 'choice',
        field: 'concern',
        options: [
            { value: 'thinning', label: '🌿 General Thinning', desc: 'Noticing overall thinner hair' },
            { value: 'shedding', label: '🍂 Excessive Shedding', desc: 'Losing more hair than usual' },
            { value: 'edges', label: '✨ Edges / Hairline', desc: 'Receding hairline or thinning edges' },
            { value: 'postpartum', label: '🤱 Post-Partum', desc: 'Hair loss after pregnancy' },
            { value: 'medical', label: '🏥 Medical / PCOS', desc: 'Hormonal or medical condition' },
            { value: 'maintenance', label: '💪 Growth & Maintenance', desc: 'Want longer, healthier hair' },
        ],
    },
    {
        id: 'porosity',
        title: 'Let\'s check your hair porosity',
        subtitle: 'This determines how your hair absorbs moisture, which affects product recommendations.',
        type: 'choice',
        field: 'porosity',
        options: [
            { value: 'low', label: '🧊 Low Porosity', desc: 'Hair takes long to get wet, products sit on top, slow to dry' },
            { value: 'normal', label: '💧 Normal Porosity', desc: 'Hair absorbs moisture well, holds styles, average dry time' },
            { value: 'high', label: '🧽 High Porosity', desc: 'Hair dries fast, gets frizzy, absorbs products quickly' },
            { value: 'unsure', label: '🤔 Not Sure', desc: 'I\'ll try the float test or get recommendations for all types' },
        ],
    },
    {
        id: 'hairtype',
        title: 'What\'s your hair texture?',
        type: 'choice',
        field: 'hairType',
        options: [
            { value: 'straight', label: '1️⃣ Straight' },
            { value: 'wavy', label: '2️⃣ Wavy' },
            { value: 'curly', label: '3️⃣ Curly' },
            { value: 'coily', label: '4️⃣ Coily / Kinky' },
        ],
    },
    {
        id: 'treatments',
        title: 'Are you using any treatments?',
        type: 'multi',
        field: 'currentTreatments',
        options: [
            { value: 'minoxidil', label: 'Minoxidil' },
            { value: 'prp', label: 'PRP Therapy' },
            { value: 'supplements', label: 'Hair Supplements' },
            { value: 'oils', label: 'Natural Oils' },
            { value: 'ricewater', label: 'Rice Water' },
            { value: 'microneedling', label: 'Microneedling' },
            { value: 'none', label: 'None yet' },
        ],
    },
    {
        id: 'results',
        title: 'Your personalized profile is ready!',
        type: 'results',
    },
];

const POROSITY_RECS = {
    low: {
        title: 'Low Porosity Hair',
        tips: [
            'Use lightweight, water-based products — heavy oils will sit on top',
            'Clarifying shampoo monthly to remove buildup',
            'Apply products to damp (not soaked) hair',
            'Use heat (warm water, steamer) to open cuticles for deep conditioning',
            'Avoid protein-heavy products — low porosity hair is often protein-sensitive',
        ],
    },
    normal: {
        title: 'Normal Porosity Hair',
        tips: [
            'Your hair absorbs and retains moisture well — maintain with balanced products',
            'Occasional deep conditioning to keep hair strong',
            'Most product types will work for you',
            'Focus on protecting ends and reducing heat damage',
        ],
    },
    high: {
        title: 'High Porosity Hair',
        tips: [
            'Deep conditioning masks weekly are essential',
            'Use cool or cold water rinses to close cuticles and seal moisture',
            'Layer: leave-in conditioner → cream → oil (LOC or LCO method)',
            'Protein treatments help fill gaps in the cuticle layer',
            'Avoid excessive heat styling — it raises porosity further',
        ],
    },
    unsure: {
        title: 'General Recommendations',
        tips: [
            'Try the float test: drop a clean hair in water — sinks fast = high porosity, floats = low',
            'Start with balanced products and adjust based on how your hair responds',
            'If products sit on your hair, try lighter ones (may be low porosity)',
            'If hair dries quickly and gets frizzy, try richer products (may be high porosity)',
        ],
    },
};

export default function OnboardingQuiz({ onComplete }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        name: '',
        concern: '',
        porosity: '',
        hairType: '',
        currentTreatments: [],
    });

    const current = STEPS[step];

    const handleNext = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
    };

    const handleChoice = (field, value) => {
        setAnswers(prev => ({ ...prev, [field]: value }));
        setTimeout(handleNext, 300);
    };

    const handleMulti = (field, value) => {
        setAnswers(prev => {
            const arr = prev[field] || [];
            if (value === 'none') return { ...prev, [field]: ['none'] };
            const filtered = arr.filter(v => v !== 'none');
            if (filtered.includes(value)) return { ...prev, [field]: filtered.filter(v => v !== value) };
            return { ...prev, [field]: [...filtered, value] };
        });
    };

    const handleComplete = () => {
        onComplete({
            ...answers,
            startDate: new Date().toISOString(),
            recommendations: POROSITY_RECS[answers.porosity] || POROSITY_RECS.unsure,
        });
    };

    const canProceed = () => {
        if (!current.field) return true;
        if (current.type === 'text') return answers[current.field]?.trim().length > 0;
        if (current.type === 'multi') return (answers[current.field] || []).length > 0;
        return !!answers[current.field];
    };

    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="auth-page" style={{ background: 'var(--bg-primary)' }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>
                {/* Progress bar */}
                <div style={{
                    height: 4, background: 'var(--gray-200)', borderRadius: 'var(--radius-full)',
                    marginBottom: 'var(--space-xl)', overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%', width: `${progress}%`, background: 'var(--gradient-primary)',
                        borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease'
                    }} />
                </div>

                <div className="auth-card" style={{ maxWidth: '100%' }}>
                    {/* Welcome */}
                    {current.id === 'welcome' && (
                        <div style={{ textAlign: 'center' }}>
                            <img src={onboardingImg} alt="Welcome to CrownCare" className="page-header-img" style={{ marginBottom: 'var(--space-lg)' }} />
                            <h2 className="gradient-text-hero" style={{ marginBottom: 'var(--space-sm)' }}>
                                {current.title}
                            </h2>
                            <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-xl)' }}>
                                {current.subtitle}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2xl)', lineHeight: 1.7 }}>
                                We'll personalize your experience based on your hair type, porosity, and goals. This takes about 1 minute.
                            </p>
                            <button className="btn btn-primary btn-lg" onClick={handleNext} style={{ width: '100%' }}>
                                Let's Get Started <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Text input */}
                    {current.type === 'text' && (
                        <div>
                            <h2 style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>{current.title}</h2>
                            <input
                                className="form-input"
                                type="text"
                                placeholder={current.placeholder}
                                value={answers[current.field]}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [current.field]: e.target.value }))}
                                autoFocus
                                style={{ textAlign: 'center', fontSize: 'var(--font-size-lg)' }}
                            />
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                style={{ width: '100%', marginTop: 'var(--space-xl)' }}
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Single choice */}
                    {current.type === 'choice' && (
                        <div>
                            <h2 style={{ marginBottom: 'var(--space-sm)', textAlign: 'center' }}>{current.title}</h2>
                            {current.subtitle && (
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                                    {current.subtitle}
                                </p>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {current.options.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChoice(current.field, opt.value)}
                                        style={{
                                            padding: 'var(--space-md) var(--space-lg)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: `2px solid ${answers[current.field] === opt.value ? 'var(--blue-500)' : 'var(--border-color)'}`,
                                            background: answers[current.field] === opt.value ? 'var(--blue-50)' : 'var(--bg-secondary)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                    >
                                        <div style={{ fontWeight: 600 }}>{opt.label}</div>
                                        {opt.desc && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{opt.desc}</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Multi-select */}
                    {current.type === 'multi' && (
                        <div>
                            <h2 style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>{current.title}</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                                {current.options.map(opt => {
                                    const selected = (answers[current.field] || []).includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleMulti(current.field, opt.value)}
                                            style={{
                                                padding: 'var(--space-sm) var(--space-lg)',
                                                borderRadius: 'var(--radius-full)',
                                                border: `2px solid ${selected ? 'var(--blue-500)' : 'var(--border-color)'}`,
                                                background: selected ? 'var(--blue-50)' : 'var(--bg-secondary)',
                                                fontWeight: 600,
                                                fontSize: 'var(--font-size-sm)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
                                                color: selected ? 'var(--blue-700)' : 'var(--text-secondary)',
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                style={{ width: '100%', marginTop: 'var(--space-xl)' }}
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {current.type === 'results' && (
                        <div style={{ textAlign: 'center' }}>
                            <Sparkles size={48} style={{ color: 'var(--sky-500)', marginBottom: 'var(--space-lg)' }} />
                            <h2 className="gradient-text-hero" style={{ marginBottom: 'var(--space-md)' }}>
                                {current.title}
                            </h2>
                            <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-xl)' }}>
                                Hey {answers.name}! Here are your personalized tips:
                            </p>

                            <div style={{
                                textAlign: 'left', background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)'
                            }}>
                                <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--blue-600)' }}>
                                    {POROSITY_RECS[answers.porosity]?.title || 'General Recommendations'}
                                </h4>
                                <ul style={{ paddingLeft: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                    {(POROSITY_RECS[answers.porosity]?.tips || POROSITY_RECS.unsure.tips).map((tip, i) => (
                                        <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleComplete}
                                style={{ width: '100%' }}
                            >
                                <Crown size={18} /> Enter CrownCare
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
