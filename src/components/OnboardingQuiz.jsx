import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, Sparkles, Crown } from 'lucide-react';
import onboardingImg from '../assets/images/onboarding.png';
import { HAIR_TYPES } from '../constants/hairTypes';

const getSteps = (userType) => {
    const isPro = userType === 'stylist';
    return [
        {
            id: 'welcome',
            title: 'Welcome to CrownCare',
            subtitle: 'Your holistic hair wellness and regrowth tracker',
        },
        {
            id: 'account_type',
            title: 'How will you use CrownCare?',
            type: 'choice',
            field: 'userType',
            options: [
                { value: 'solo', label: '👤 Personal Tracker', desc: 'I am tracking my own personal hair journey.' },
                { value: 'stylist', label: '✂️ Licensed Professional', desc: 'I am a stylist building my business and managing clients.' }
            ]
        },
        {
            id: 'name',
            title: isPro ? 'What is your Stylist or Salon name?' : 'What should we call you?',
            type: 'text',
            field: 'name',
            placeholder: isPro ? 'Salon name' : 'Your name',
        },
        {
            id: 'concern',
            title: isPro ? "What is your salon's primary focus?" : 'What brings you here?',
            type: 'choice',
            field: 'concern',
            options: [
                { value: 'thinning', label: '🌿 General Thinning', desc: isPro ? 'Specializing in density recovery' : 'Noticing overall thinner hair' },
                { value: 'shedding', label: '🍂 Excessive Shedding', desc: isPro ? 'Treating high shedding/breakage' : 'Losing more hair than usual' },
                { value: 'edges', label: '✨ Edges / Hairline', desc: isPro ? 'Traction alopecia & edge care' : 'Receding hairline or traction alopecia' },
                { value: 'postpartum', label: '🤱 Post-Partum', desc: isPro ? 'Post-partum recovery treatments' : 'Shedding after pregnancy' },
                { value: 'medical', label: '🏥 Alopecia / PCOS', desc: isPro ? 'Clinical/Hormonal loss remediation' : 'Clinical shedding or hormonal loss' },
                { value: 'maintenance', label: '💪 Growth & Porosity', desc: isPro ? 'General retention & styling' : 'Want longer, healthier textured hair' },
                ...(isPro ? [
                    { value: 'all', label: '🌎 All of the Above', desc: 'We handle comprehensive clinical hair health cases' },
                    { value: 'full_service', label: '🏢 Full Service Salon', desc: 'We provide styling, cutting, color, and clinical care' }
                ] : [])
            ],
        },
        {
            id: 'porosity',
            title: isPro ? "Let's check your salon's porosity specialty." : "Let's check your hair porosity",
            subtitle: isPro ? "This determines the foundational product logic we provide to your clients." : "This determines how your hair absorbs moisture, which affects product recommendations.",
            type: 'choice',
            field: 'porosity',
            options: [
                { value: 'low', label: '🧊 Low Porosity', desc: 'Hair takes long to get wet, products sit on top, slow to dry' },
                { value: 'normal', label: '💧 Normal Porosity', desc: 'Hair absorbs moisture well, holds styles, average dry time' },
                { value: 'high', label: '🧽 High Porosity', desc: 'Hair dries fast, gets frizzy, absorbs products quickly' },
                { value: 'unsure', label: '🤔 Not Sure / All Types', desc: isPro ? 'We treat a wide variety of porosities in the chair' : "I'll try the float test or get recommendations for all types" },
            ],
        },
        {
            id: 'hairtype',
            title: isPro ? 'Identify The Crowns In Your Chair' : 'Identify Your Crown',
            subtitle: isPro ? 'Select all the primary textures you service within your salon or chair.' : 'Select your primary and secondary textures if you have multiple.',
            type: 'multi',
            field: 'hairType',
            options: HAIR_TYPES,
        },
        ...(!isPro ? [{
            id: 'stylist_visitation',
            title: 'How often do you see your stylist?',
            subtitle: 'This helps us understand your salon maintenance routine.',
            type: 'choice',
            field: 'stylistVisits',
            options: [
                { value: 'weekly', label: '✂️ Once a week', desc: 'I am in the salon every week' },
                { value: 'biweekly', label: '📆 Twice a month', desc: 'I visit the salon every 2 weeks' },
                { value: 'monthly', label: '📅 Once a month', desc: 'Monthly maintenance or trim' },
                { value: 'rarely', label: '🏠 Rarely / DIY', desc: 'I handle my own hair at home' }
            ]
        }] : []),
        {
            id: 'treatments',
            title: isPro ? 'What treatments do you typically offer or recommend?' : 'Are you using any treatments?',
            type: 'multi',
            field: 'currentTreatments',
            options: [
                { value: 'minoxidil', label: 'Hair Drops or Topical Meds' },
                { value: 'prp', label: 'PRP / Scalp Therapy' },
                { value: 'supplements', label: 'Hair Supplements' },
                { value: 'oils', label: 'Natural Oils & Serums' },
                { value: 'ricewater', label: 'Rice Water / Fermented' },
                { value: 'microneedling', label: 'Microneedling' },
                { value: 'styling', label: 'Hair Styling Services' },
                { value: 'none', label: isPro ? 'Basic styling only' : 'None yet' },
            ],
        },
        {
            id: 'results',
            title: isPro ? 'Your Professional Profile is Ready!' : 'Your personalized profile is ready!',
            type: 'results',
        },
    ];
};

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
        userType: '',
        name: '',
        concern: '',
        porosity: '',
        hairType: [],
        stylistVisits: '',
        currentTreatments: [],
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const STEPS = getSteps(answers.userType);
    const current = STEPS[step];
    const isPro = answers.userType === 'stylist';

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
        <div className="auth-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowY: 'auto', padding: 'max(40px, env(safe-area-inset-top)) 20px max(80px, env(safe-area-inset-bottom)) 20px', display: 'flex', justifyContent: 'center' }}>
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
                                We'll personalize your experience based on your specific hair goals. This takes about 1 minute.
                            </p>
                            <button className="btn btn-primary btn-lg" onClick={handleNext} style={{ width: '100%' }}>
                                START MY JOURNEY <ChevronRight size={18} />
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
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', color: answers[current.field] === opt.value ? 'var(--blue-700)' : 'var(--text-primary)' }}>
                                            {opt.label}
                                        </div>
                                        {opt.desc && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{opt.desc}</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Multi-select */}
                    {current.type === 'multi' && (
                        <div>
                            <h2 style={{ marginBottom: 'var(--space-sm)', textAlign: 'center' }}>{current.title}</h2>
                            {current.subtitle && (
                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                                    {current.subtitle}
                                </p>
                            )}
                            <div style={{ display: 'flex', flexDirection: current.field === 'hairType' ? 'column' : 'row', flexWrap: current.field === 'hairType' ? 'nowrap' : 'wrap', gap: 'var(--space-md)', justifyContent: 'center' }}>
                                {current.options.map(opt => {
                                    const selected = (answers[current.field] || []).includes(opt.value);

                                    if (current.field === 'hairType') {
                                        return (
                                            <button
                                                key={opt.value}
                                                className={`quiz-option ${selected ? 'quiz-option-selected' : ''}`}
                                                onClick={() => handleMulti(current.field, opt.value)}
                                                style={{
                                                    padding: 'var(--space-lg)',
                                                    borderRadius: 'var(--radius-xl)',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-fast)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 'var(--space-sm)',
                                                }}
                                            >
                                                <div className="quiz-option-label" style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                                                    {opt.label}
                                                </div>
                                                {opt.desc && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>The Look:</strong> {opt.desc.look}
                                                        </div>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>The Feel:</strong> {opt.desc.feel}
                                                        </div>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>The Crown Tip:</strong> {opt.desc.tip}
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={opt.value}
                                            className={`quiz-option ${selected ? 'quiz-option-selected' : ''}`}
                                            onClick={() => handleMulti(current.field, opt.value)}
                                            style={{
                                                padding: 'var(--space-sm) var(--space-lg)',
                                                borderRadius: 'var(--radius-full)',
                                                fontWeight: 600,
                                                fontSize: 'var(--font-size-sm)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
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
                            <Sparkles size={48} style={{ color: 'var(--sky-500)', margin: '0 auto var(--space-lg)' }} />
                            <h2 className="gradient-text-hero" style={{ marginBottom: 'var(--space-md)' }}>
                                {current.title}
                            </h2>
                            <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-xl)' }}>
                                Hey {answers.name}! Here are some key intelligence points for your profile:
                            </p>

                            <div style={{
                                textAlign: 'left', background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)'
                            }}>
                                {isPro ? (
                                    <>
                                        <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--blue-600)' }}>
                                            Business Profile Summary
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                            <div><strong style={{ color: 'var(--text-primary)' }}>Focus:</strong> {answers.concern || 'General Repair'}</div>
                                            <div><strong style={{ color: 'var(--text-primary)' }}>Porosity Specialty:</strong> {answers.porosity || 'All Types'}</div>
                                            <div><strong style={{ color: 'var(--text-primary)' }}>Crowns Serviced:</strong> {Array.isArray(answers.hairType) ? answers.hairType.length : 0} texture types</div>
                                            <div><strong style={{ color: 'var(--text-primary)' }}>Treatments:</strong> {(answers.currentTreatments || []).length} active therapies</div>
                                            <div style={{ marginTop: 'var(--space-sm)', color: 'var(--text-primary)', fontStyle: 'italic', fontSize: 'var(--font-size-xs)' }}>
                                                Your stylist dashboard is being configured based on these selections.
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: 'var(--space-xl)', textAlign: 'left', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <input 
                                    type="checkbox" 
                                    id="medical-disclaimer" 
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <label htmlFor="medical-disclaimer" style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                                    <strong>Medical & Liability Disclaimer:</strong> I understand that CrownCare is designed strictly for cosmetic tracking and educational purposes. It is not a substitute for professional medical advice, diagnosis, or treatment. 
                                </label>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleComplete}
                                disabled={!acceptedTerms}
                                style={{ width: '100%', opacity: acceptedTerms ? 1 : 0.5 }}
                            >
                                <Crown size={18} /> ACTIVATE ACCOUNT
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
