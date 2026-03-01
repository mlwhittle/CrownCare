import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pill, Leaf, Plus, Trash2, CheckCircle2, Circle, Calendar, Clock } from 'lucide-react';
import treatmentImg from '../assets/images/treatment.png';
import './TreatmentTracker.css';

const CLINICAL = [
    { value: 'minoxidil', label: 'Minoxidil (Topical)', schedule: 'Twice daily', desc: 'A common topical treatment to stimulate hair follicles.', routine: 'Apply 1ml to dry scalp twice daily. Massage gently and let dry.', ingredients: 'Minoxidil (2% or 5%), Alcohol, Propylene Glycol, Purified Water' },
    { value: 'prp', label: 'PRP Therapy', schedule: 'Every 4-6 weeks', desc: 'Platelet-Rich Plasma therapy uses your own blood platelets to stimulate hair growth.', routine: 'Administered in-clinic by a professional via scalp injections.', ingredients: 'Your own concentrated blood platelets' },
    { value: 'microneedling', label: 'Microneedling', schedule: 'Weekly (1-1.5mm)', desc: 'Creates micro-punctures in the scalp to increase blood flow and collagen production.', routine: 'Use a derma roller or stamp on a clean scalp once a week. Do not apply harsh topicals immediately after.', ingredients: 'N/A (Physical treatment)' },
    { value: 'finasteride', label: 'Finasteride (Rx)', schedule: 'Daily', desc: 'A prescription oral medication that blocks DHT production.', routine: 'Take one pill daily with or without food as prescribed by your doctor.', ingredients: 'Finasteride 1mg (active ingredient)' },
    { value: 'spironolactone', label: 'Spironolactone (Rx)', schedule: 'Daily', desc: 'An anti-androgen medication often prescribed off-label for female pattern hair loss.', routine: 'Take orally daily as directed by your healthcare provider.', ingredients: 'Spironolactone (active ingredient)' },
    { value: 'lllt', label: 'Low-Level Laser Therapy', schedule: '3x per week', desc: 'Uses red light lasers to stimulate cellular activity in hair follicles.', routine: 'Wear the laser cap or use the comb for 15-30 minutes, 3 times a week on dry hair.', ingredients: 'N/A (Light therapy device)' },
];

const NATURAL = [
    { value: 'ricewater', label: 'Fermented Rice Water Rinse', schedule: '1-2x per week', desc: 'Contains inositol — improves elasticity, reduces friction', routine: 'After shampooing, pour fermented rice water over hair. Leave for 15-20 minutes, then rinse.', ingredients: 'Rice, water, optional citrus peels (fermented for 24-48 hours)' },
    { value: 'hotolive', label: 'Hot Oil Treatment (Sesame/Coconut)', schedule: 'Weekly, 30-45 min', desc: 'Warm oil penetrates the cuticle for deep conditioning', routine: 'Warm the oil slightly. Massage into scalp and hair. Cover with a plastic cap for 30-45 minutes before washing.', ingredients: 'Sesame oil, coconut oil, or olive oil' },
    { value: 'rosemary', label: 'Rosemary Oil Scalp Massage', schedule: 'Twice daily', desc: '2015 trial showed equal to 2% Minoxidil at 6 months', routine: 'Dilute a few drops of rosemary essential oil in a carrier oil. Massage into scalp for 5 minutes.', ingredients: 'Rosemary essential oil, Carrier oil (like jojoba or argan)' },
    { value: 'chebe', label: 'Chebe Powder Treatment', schedule: 'Weekly', desc: 'Apply to hair SHAFT only — never on the scalp', routine: 'Mix powder with an oil/butter. Apply to damp hair shaft section by section. Braid hair and leave in for a few days before washing.', ingredients: 'Chebe seeds (Croton zambesicus), Mahllaba soubiane seeds, Missic stone to scent, Cloves, Samour resin' },
    { value: 'peppermint', label: 'Peppermint Oil Scalp Treatment', schedule: '2-3x per week', desc: 'Increases blood flow to follicles', routine: 'Mix with a carrier oil. Massage gently into the scalp for 5 minutes before washing hair.', ingredients: 'Peppermint essential oil, Carrier oil (like almond or jojoba)' },
    { value: 'castor', label: 'Castor Oil (JBCO)', schedule: '2-3x per week', desc: 'Jamaican Black Castor Oil — applied to edges and thin areas', routine: 'Apply a small amount to edges or thinning areas and massage in. Best used on slightly damp hair.', ingredients: '100% Jamaican Black Castor Oil' },
];

export default function TreatmentTracker() {
    const { treatments, addTreatment, deleteTreatment, toggleTreatmentDone } = useApp();
    const [tab, setTab] = useState('clinical');
    const [showAdd, setShowAdd] = useState(false);
    const [newType, setNewType] = useState('');
    const [customName, setCustomName] = useState('');
    const [customNotes, setCustomNotes] = useState('');
    const [selectedDetail, setSelectedDetail] = useState(null);

    const handleAdd = () => {
        const catalog = tab === 'clinical' ? CLINICAL : NATURAL;
        const item = catalog.find(c => c.value === newType);
        addTreatment({
            name: item?.label || customName || 'Treatment',
            type: tab,
            category: newType || 'custom',
            notes: customNotes.trim(),
            done: false,
        });
        setShowAdd(false); setNewType(''); setCustomName(''); setCustomNotes(''); setSelectedDetail(null);
    };

    const today = new Date().toISOString().split('T')[0];
    const todayItems = treatments.filter(t => t.date.startsWith(today));
    const pastItems = treatments.filter(t => !t.date.startsWith(today));

    return (
        <div className="tracker">
            <img src={treatmentImg} alt="Hair Treatment" className="page-header-img" />
            <h2 className="gradient-text">Treatment Tracker</h2>
            <p className="text-muted text-sm mb-lg">Track your clinical and natural hair treatments for consistency.</p>

            <div className="tracker-tabs">
                <button className={`tt ${tab === 'clinical' ? 'active' : ''}`} onClick={() => setTab('clinical')}><Pill size={16} /> Clinical</button>
                <button className={`tt ${tab === 'natural' ? 'active' : ''}`} onClick={() => setTab('natural')}><Leaf size={16} /> Natural</button>
            </div>

            <button className="btn btn-primary mb-lg" onClick={() => setShowAdd(!showAdd)} style={{ width: '100%' }}>
                <Plus size={16} /> Log {tab === 'clinical' ? 'Clinical' : 'Natural'} Treatment
            </button>

            {showAdd && (
                <div className="card mb-lg add-form">
                    {selectedDetail ? (
                        <div className="treatment-detail-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                            <button className="btn btn-sm mb-md" onClick={() => { setSelectedDetail(null); setNewType(''); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                ← Back to options
                            </button>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>{selectedDetail.label}</h3>
                            <span className="badge badge-sky" style={{ marginBottom: 'var(--space-md)' }}>{selectedDetail.schedule}</span>

                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <p><strong>What it is:</strong> {selectedDetail.desc}</p>
                                <p><strong>Routine:</strong> {selectedDetail.routine}</p>
                                <p><strong>Ingredients:</strong> {selectedDetail.ingredients}</p>
                            </div>

                            <input className="form-input" placeholder="Notes (optional)" value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} style={{ marginTop: 'var(--space-md)' }} />
                            <button className="btn btn-primary mt-md" onClick={() => { setNewType(selectedDetail.value); setTimeout(handleAdd, 0); }} style={{ width: '100%' }}>
                                Save Treatment Log
                            </button>
                        </div>
                    ) : (
                        <>
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Select Treatment</h4>
                            <div className="treatment-options">
                                {(tab === 'clinical' ? CLINICAL : NATURAL).map(t => (
                                    <button
                                        key={t.value}
                                        className={`t-opt ${newType === t.value ? 'active' : ''}`}
                                        onClick={() => { setSelectedDetail(t); setNewType(t.value); setCustomNotes(''); }}
                                    >
                                        <strong>{t.label}</strong>
                                        <span className="text-xs text-muted">{t.schedule}</span>
                                        {t.desc && <span className="text-xs" style={{ color: 'var(--gold-500)', marginTop: 2 }}>{t.desc.split(' — ')[0]}</span>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Today's treatments */}
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Today's Log</h3>
            {todayItems.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                    <p className="text-muted">No treatments logged today</p>
                </div>
            ) : (
                <div className="treatment-list mb-lg">
                    {todayItems.map(t => (
                        <div key={t.id} className={`treatment-item ${t.done ? 'completed' : ''}`}>
                            <button className="t-check" onClick={() => toggleTreatmentDone(t.id)}>
                                {t.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                            <div className="t-info">
                                <strong>{t.name}</strong>
                                <span className={`badge ${t.type === 'clinical' ? 'badge-sky' : 'badge-success'}`}>{t.type}</span>
                                {t.notes && <span className="text-xs text-muted" style={{ display: 'block', marginTop: 2 }}>{t.notes}</span>}
                            </div>
                            <div className="t-time"><Clock size={12} />{new Date(t.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                            <button className="t-delete" onClick={() => deleteTreatment(t.id)}><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Past treatments */}
            {pastItems.length > 0 && (
                <>
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>Recent History</h3>
                    <div className="treatment-list">
                        {pastItems.slice(0, 20).map(t => (
                            <div key={t.id} className={`treatment-item past ${t.done ? 'completed' : ''}`}>
                                <div className="t-check" style={{ color: t.done ? 'var(--success)' : 'var(--gray-300)' }}>
                                    {t.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <div className="t-info">
                                    <strong>{t.name}</strong>
                                    <span className="text-xs text-muted">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <button className="t-delete" onClick={() => deleteTreatment(t.id)}><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
