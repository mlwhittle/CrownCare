import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { scanIngredientsWithGemini, loadApiKey, matchProductLabelWithGemini } from '../services/GeminiService';
import { Pill, Leaf, Plus, Trash2, CheckCircle2, Circle, Clock, Edit3, Sparkles, Camera as CameraIcon, ClipboardList, Users, Crown, X, Droplets } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import treatmentImg from '../assets/images/treatment.png';
import './TreatmentTracker.css';

const CLINICAL = [
    { value: 'minoxidil', label: 'Minoxidil (Topical)', schedule: 'Twice daily', desc: 'A common topical treatment to stimulate hair follicles.', routine: 'Apply 1ml to dry scalp twice daily. Massage gently and let dry.', ingredients: 'Minoxidil (2% or 5%), Alcohol, Propylene Glycol, Purified Water' },
    { value: 'prp', label: 'PRP Therapy', schedule: 'Every 4-6 weeks', desc: 'Platelet-Rich Plasma therapy uses your own blood platelets to stimulate hair growth.', routine: 'Administered in-clinic by a professional via scalp injections.', ingredients: 'Your own concentrated blood platelets' },
    { value: 'microneedling', label: 'Microneedling', schedule: 'Weekly (1-1.5mm)', desc: 'Creates micro-punctures in the scalp to increase blood flow and collagen production.', routine: 'Use a derma roller or stamp on a clean scalp once a week. Do not apply harsh topicals immediately after.', ingredients: 'N/A (Physical treatment)' },
    { value: 'finasteride', label: 'Finasteride (Medical Referral)', schedule: 'Daily', desc: 'An oral medication that requires a licensed dermatologist referral.', routine: 'Administered strictly under the guidance of a licensed medical doctor.', ingredients: 'Finasteride 1mg (active ingredient)' },
    { value: 'spironolactone', label: 'Spironolactone (Medical Referral)', schedule: 'Daily', desc: 'An anti-androgen medication that requires a licensed dermatologist referral.', routine: 'Administered strictly under the guidance of a licensed medical doctor.', ingredients: 'Spironolactone (active ingredient)' },
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

const SCALP_ACTIVES = [
    { value: 'niacinamide', label: 'Niacinamide (Vitamin B3)', schedule: 'Daily or Every Wash', desc: 'Balances sebum/oil production and reduces scalp inflammation.', routine: 'Apply serum directly to scalp. Massage gently. Do not rinse.', ingredients: 'Niacinamide (2-5%)' },
    { value: 'salicylic', label: 'Salicylic Acid (BHA)', schedule: '1-2x per week', desc: 'Chemical exfoliant that dissolves scalp buildup and dead skin cells.', routine: 'Use as a pre-wash scalp treatment. Leave on for 10-15 mins before shampooing.', ingredients: 'Salicylic Acid (1-2%)' },
    { value: 'hyaluronic', label: 'Hyaluronic Acid', schedule: 'After Wash (Damp Scalp)', desc: 'Hydrates a dry, tight scalp without adding heavy oils.', routine: 'Apply to a damp scalp immediately after washing to lock in moisture.', ingredients: 'Hyaluronic Acid' },
    { value: 'peptides', label: 'Peptide Complex', schedule: 'Daily', desc: 'Strengthens the skin barrier of the scalp to support thicker follicle growth.', routine: 'Apply drops to targeted thinning areas daily.', ingredients: 'Peptides, Ceramides' },
    { value: 'probiotics', label: 'Microbiome Probiotics', schedule: '2-3x per week', desc: 'Rebalances the natural bacterial flora of the scalp.', routine: 'Apply serum to the scalp after washing.', ingredients: 'Lactobacillus Ferment' },
];

export default function TreatmentTracker({ openAI }) {
    const { treatments, addTreatment, deleteTreatment, toggleTreatmentDone, setCustomEvaluationPrompt, stylistCode, setStylistCode, prescribedTreatments, appointments, stylistContact, onboarding, isStylistAccount } = useApp();
    const [tab, setTab] = useState('clinical');
    const [showAdd, setShowAdd] = useState(false);
    const [newType, setNewType] = useState('');
    const [customName, setCustomName] = useState('');
    const [customProducts, setCustomProducts] = useState(['']); // Start with one empty product input
    const [customFrequency, setCustomFrequency] = useState('');
    const [customNotes, setCustomNotes] = useState('');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isScanning, setIsScanning] = useState({}); // Track scanning state per index
    const [tempCode, setTempCode] = useState('');

    // Product Matcher State
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchResult, setMatchResult] = useState(null);

    const handleProductMatchScan = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 60, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Prompt, width: 800
            });
            setMatchLoading(true);
            setMatchResult(null); // Clear previous
            const apiKey = loadApiKey();
            if (!apiKey) {
                alert('Please connect your Gemini API key in Settings first.');
                setMatchLoading(false);
                return;
            }

            const profileMap = {
                hairType: onboarding?.hairType?.join(', ') || 'Unknown',
                porosity: onboarding?.porosity || 'Unknown'
            };

            const result = await matchProductLabelWithGemini(apiKey, image.dataUrl, profileMap);
            if (result && result.matchScore !== undefined) {
                setMatchResult(result);
            } else {
                alert("The AI couldn't read the ingredient label clearly. Please try again with better lighting.");
            }
        } catch (error) {
            console.error("Match Scan Cancelled/Failed:", error);
        } finally {
            setMatchLoading(false);
        }
    };

    const isRecommended = (tValue) => {
        if (!onboarding) return false;
        const p = onboarding.porosity;
        const ht = (onboarding.hairType || []).join(',');
        
        // Basic AI Logic Rules based on profile
        if (p === 'high' && (tValue === 'castor' || tValue === 'chebe')) return true; // High porosity needs heavy seals
        if (p === 'low' && tValue === 'hotolive') return true; // Low porosity needs heat/warmth to penetrate
        if ((ht.includes('1') || ht.includes('2')) && tValue === 'rosemary') return true; // Lightweight oil for straight/wavy
        if (tValue === 'lllt' || tValue === 'peppermint') return true; // Universally recommended for blood flow
        
        return false;
    };

    const handleImageScan = async (file, idx) => {
        if (!file) return;

        setIsScanning(prev => ({ ...prev, [idx]: true }));

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result;
                const apiKey = loadApiKey();
                
                if (!apiKey) {
                    alert('Please connect your Gemini API key in Settings first.');
                    setIsScanning(prev => ({ ...prev, [idx]: false }));
                    return;
                }

                const extractedIngredients = await scanIngredientsWithGemini(apiKey, base64data, file.type);
                
                // Update the specific input box with the scanned ingredients
                const newProds = [...customProducts];
                newProds[idx] = extractedIngredients;
                setCustomProducts(newProds);
                setIsScanning(prev => ({ ...prev, [idx]: false }));
            };
        } catch (error) {
            console.error("Image processing error:", error);
            setIsScanning(prev => ({ ...prev, [idx]: false }));
            alert("Failed to scan image. Please try again.");
        }
    };

    const handleEvaluate = () => {
        const validProducts = customProducts.filter(p => p.trim() !== '');
        const productString = validProducts.length > 0 ? validProducts.join(', ') : 'Unknown Product';
        
        // Save the treatment first
        addTreatment({
            name: customName || 'Custom Treatment',
            type: 'custom',
            category: 'custom',
            desc: productString ? `${productString} — ${customFrequency}` : customFrequency,
            notes: customNotes.trim(),
            done: false,
        });
        
        // Trigger AI Evaluation routing
        const prompt = `I just logged a new custom hair treatment: "${customName}". I applied the following specific ingredients to my hair: [${productString}], with a frequency of ${customFrequency}. \n\nCan you evaluate this specific chemical formulation and routine? Tell me if it's a safe and effective direction for my hair goals, what it does mechanically to the hair/scalp, or if I should choose something else.`;
        
        if (setCustomEvaluationPrompt) setCustomEvaluationPrompt(prompt); // Guard for Context injection
        
        setShowAdd(false); setNewType(''); setCustomName(''); setCustomNotes(''); setCustomProducts(['']); setCustomFrequency(''); setSelectedDetail(null);
        
        // Send them to the AI Coach
        if (openAI) openAI();
    };

    const handleAdd = () => {
        if (tab === 'custom') {
            const validProducts = customProducts.filter(p => p.trim() !== '');
            const productString = validProducts.length > 0 ? validProducts.join(', ') : '';
            addTreatment({
                name: customName || 'Custom Treatment',
                type: 'custom',
                category: 'custom',
                desc: productString ? `${productString} — ${customFrequency}` : customFrequency,
                notes: customNotes.trim(),
                done: false,
            });
        } else {
            const catalog = tab === 'clinical' ? CLINICAL : tab === 'actives' ? SCALP_ACTIVES : NATURAL;
            const item = catalog.find(c => c.value === newType);
            addTreatment({
                name: item?.label || customName || 'Treatment',
                type: tab,
                category: newType || 'custom',
                desc: item ? item.desc.split(' — ')[0] : '', // Extract the primary description
                notes: customNotes.trim(),
                done: false,
            });
        }
        setShowAdd(false); setNewType(''); setCustomName(''); setCustomNotes(''); setCustomProducts(['']); setCustomFrequency(''); setSelectedDetail(null);
    };

    const today = new Date().toISOString().split('T')[0];
    const todayItems = treatments.filter(t => t.date.startsWith(today));
    const pastItems = treatments.filter(t => !t.date.startsWith(today));

    return (
        <div className="tracker">
            <img src={treatmentImg} alt="Hair Treatment" className="page-header-img" />
            <h2 className="gradient-text">Treatment Tracker</h2>
            <p className="text-muted text-sm mb-lg">Track your clinical and natural hair treatments for consistency.</p>

            {/* Smart Sephora Label Matcher */}
            <div className="card-glass mb-lg" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02))', border: '1px solid var(--gold-200)', borderRadius: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)', color: 'var(--gold-600)' }}>
                    <Sparkles size={20} /> Smart Label Match
                </h3>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                    Before you buy or log a product, scan the ingredient label. CrownCare AI will cross-reference the chemicals against your <strong>{onboarding?.porosity || 'recorded'} porosity</strong> hair profile to assign a Compatibility Score.
                </p>
                <button className="btn btn-outline" onClick={handleProductMatchScan} style={{ width: '100%', borderColor: 'var(--gold-400)', color: 'var(--gold-700)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <CameraIcon size={16} /> Scan Product Label
                </button>
                
                {matchLoading && (
                    <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', textAlign: 'center', background: 'rgba(252, 211, 77, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(252, 211, 77, 0.2)' }}>
                        <div style={{ width: 24, height: 24, border: '3px solid rgba(252,211,77,0.2)', borderTop: '3px solid #FCD34D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }}></div>
                        <p style={{ color: '#FCD34D', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1.5s infinite', margin: 0 }}>Cross-referencing ingredients...</p>
                    </div>
                )}
                
                {matchResult && (
                    <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-lg)', position: 'relative', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', borderTop: `4px solid ${matchResult.matchScore >= 80 ? 'var(--success)' : matchResult.matchScore >= 50 ? 'var(--gold-500)' : 'var(--error)'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <button onClick={() => setMatchResult(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={16}/></button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: matchResult.matchScore >= 80 ? 'var(--success)' : matchResult.matchScore >= 50 ? 'var(--gold-500)' : 'var(--error)' }}>
                                {matchResult.matchScore}%
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{matchResult.verdict}</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Profile Match Score</span>
                            </div>
                        </div>
                        
                        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                            {matchResult.analysis}
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Notification Banner */}
            <div className="card-glass" style={{ 
                marginBottom: '1.5rem', 
                background: appointments && appointments.length > 0 ? 'linear-gradient(to right, rgba(146, 64, 14, 0.4), rgba(77, 28, 9, 0.8))' : 'rgba(255, 255, 255, 0.05)',
                border: appointments && appointments.length > 0 ? '1px solid #FCD34D' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRadius: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: appointments && appointments.length > 0 ? '#FDE68A' : 'var(--text-primary)' }}>
                        <Clock size={20} color={appointments && appointments.length > 0 ? "#FCD34D" : "var(--text-muted)"} />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Upcoming Stylist Appointment</h3>
                    </div>
                </div>
                
                {appointments && appointments.length > 0 ? (
                    <>
                        <div style={{ color: 'white', fontSize: '0.9rem' }}>
                            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px', fontWeight: 600 }}>
                                {appointments[0].stylistName || stylistContact?.name || 'Your Stylist'}
                            </strong>
                            {new Date(appointments[0].date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})} at {new Date(appointments[0].date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </div>
                        {appointments[0].notes && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#FDE68A', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid #FCD34D' }}>
                                "{appointments[0].notes}"
                            </div>
                        )}
                        {(stylistContact?.phone || stylistContact?.email) && (
                            <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid rgba(253, 230, 138, 0.2)', fontSize: '0.85rem', color: '#FDE68A', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {stylistContact.phone && <div>📞 {stylistContact.phone}</div>}
                                {stylistContact.email && <div>✉️ {stylistContact.email}</div>}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <p className="text-sm text-muted" style={{ margin: 0 }}>No appointments scheduled.</p>
                            <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px' }} onClick={() => {
                                if (!stylistCode && !isStylistAccount) {
                                    alert("Please connect your stylist using the 'Stylist Protocol' tab below, or tell them to get the app at Crowncare.net/professionals!");
                                    setTab('prescribed');
                                } else if (isStylistAccount) {
                                    alert("Invite your clients to book appointments with you through the CrownCare portal!");
                                } else {
                                    alert("Appointment request sent to your stylist!");
                                }
                            }}>
                                {isStylistAccount ? "Invite Clients" : (!stylistCode ? "Connect Stylist" : "Request")} <span style={{ fontSize: '14px' }}>→</span>
                            </button>
                        </div>
                        {(stylistContact?.name || stylistContact?.phone || stylistContact?.email) && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {stylistContact.name && <div>👤 {stylistContact.name}</div>}
                                {stylistContact.phone && <div>📞 {stylistContact.phone}</div>}
                                {stylistContact.email && <div>✉️ {stylistContact.email}</div>}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="tracker-tabs" style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-md)' }}>
                <button style={{ flex: '1 1 auto' }} className={`tt ${tab === 'clinical' ? 'active' : ''}`} onClick={() => setTab('clinical')}><Pill size={16} /> Clinical</button>
                <button style={{ flex: '1 1 auto' }} className={`tt ${tab === 'actives' ? 'active' : ''}`} onClick={() => setTab('actives')}><Droplets size={16} /> Scalp Actives</button>
                <button style={{ flex: '1 1 auto' }} className={`tt ${tab === 'natural' ? 'active' : ''}`} onClick={() => setTab('natural')}><Leaf size={16} /> Natural</button>
                <button style={{ flex: '1 1 auto' }} className={`tt ${tab === 'custom' ? 'active' : ''}`} onClick={() => setTab('custom')}><Edit3 size={16} /> Custom</button>
                <button style={{ flex: '1 1 auto' }} className={`tt ${tab === 'prescribed' ? 'active' : ''}`} onClick={() => setTab('prescribed')}><ClipboardList size={16} /> Stylist Protocol</button>
            </div>

            {tab !== 'prescribed' && (
                <button className="btn btn-primary mb-lg" onClick={() => setShowAdd(!showAdd)} style={{ width: '100%' }}>
                    <Plus size={16} /> Log {tab === 'clinical' ? 'Clinical' : tab === 'actives' ? 'Active' : tab === 'natural' ? 'Natural' : 'Custom'} Treatment
                </button>
            )}

            {tab === 'prescribed' && (
                <div className="card mb-lg prescribed-section" style={{ animation: 'fadeIn 0.2s ease-out', border: '1px solid var(--brand-200)', background: 'var(--brand-50)' }}>
                    {!stylistCode ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <ClipboardList size={32} style={{ color: 'var(--brand-400)', marginBottom: 'var(--space-sm)' }} />
                            <h4 style={{ color: 'var(--brand-800)', marginBottom: 'var(--space-xs)' }}>Link Your Stylist's Protocol</h4>
                            <p className="text-muted text-sm mb-md">If your stylist gave you a code, enter it below to pull their prescribed routine into your portal.</p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                                <input 
                                    className="form-input" 
                                    placeholder="e.g. STYLIST-SARAH20" 
                                    value={tempCode} 
                                    onChange={e => setTempCode(e.target.value)} 
                                    style={{ flex: 1, textTransform: 'uppercase' }}
                                />
                                <button className="btn btn-primary" onClick={() => { if(tempCode) setStylistCode(tempCode.toUpperCase()); }}>Link Account</button>
                            </div>

                            {/* VIRAL LOOP REFERRAL BANNERS */}
                            {isStylistAccount ? (
                                <div style={{ background: 'linear-gradient(to right, rgba(212, 175, 55, 0.15), rgba(146, 64, 14, 0.4))', border: '1px solid var(--crown-gold)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                                    <div style={{ background: 'rgba(212, 175, 55, 0.2)', padding: '8px', borderRadius: '50%' }}>
                                        <Crown size={24} color="var(--crown-gold)" />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--brand-900)', fontWeight: 700 }}>Scale Your Income</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--brand-800)', lineHeight: 1.5 }}>
                                            Invite your clients to securely sync their hair diary to your portal so you can track their progress and build your business.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                                        <Users size={24} color="#2563EB" />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1E3A8A', fontWeight: 800 }}>Don't have a code? Connect Your Stylist</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.5, fontWeight: 500 }}>
                                            Tell your stylist to visit <strong style={{color:'#2563EB'}}>Crowncare.net/professionals</strong> to download the B2B portal so they can oversee your hair data and issue your protocol.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <h4 style={{ color: 'var(--brand-800)', margin: 0 }}>Your Recommended Regimen</h4>
                                    <p className="text-xs" style={{ color: 'var(--brand-600)', margin: 0 }}>Recommended by: {prescribedTreatments[0]?.prescribedBy || "Your Stylist"}</p>
                                </div>
                                <button 
                                    onClick={() => { setStylistCode(''); setTempCode(''); }} 
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Unlink
                                </button>
                            </div>

                            {prescribedTreatments.length === 0 ? (
                                <p className="text-muted text-sm text-center">Your stylist hasn't assigned any active treatments yet.</p>
                            ) : (
                                prescribedTreatments.map(rx => (
                                    <div key={rx.id} style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: 'var(--space-sm)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <strong style={{ display: 'block', marginBottom: '4px' }}>{rx.name}</strong>
                                                <span className="badge badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>{rx.frequency}</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--brand-50)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid var(--brand-400)', marginBottom: '12px' }}>
                                            <p className="text-xs" style={{ margin: 0, color: 'var(--brand-800)', lineHeight: '1.4' }}><strong>Stylist Notes:</strong> {rx.notes}</p>
                                        </div>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                            onClick={() => {
                                                addTreatment({
                                                    name: rx.name,
                                                    type: 'prescribed',
                                                    category: 'prescribed',
                                                    desc: `Stylist protocol by ${rx.prescribedBy}`,
                                                    notes: '',
                                                    done: true
                                                });
                                                alert("Treatment logged! Your stylist will see this in your adherence report.");
                                            }}
                                        >
                                            <CheckCircle2 size={16} /> Mark Complete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {showAdd && tab !== 'prescribed' && (
                <div className="card mb-lg add-form">
                    {tab === 'custom' ? (
                        <div className="treatment-detail-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Add Custom Treatment</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <input className="form-input" placeholder="Treatment Focus (e.g. Wash Day Routine)" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                                
                                <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>PRODUCTS USED (OPTIONAL)</label>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.4 }}>
                                            Type the ingredients or use the <strong>camera icon</strong> to take a picture of the ingredients side of the product for the purpose of evaluation.
                                        </p>
                                    </div>
                                    {customProducts.map((prod, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <input 
                                                    className="form-input" 
                                                    placeholder={`Product ${idx + 1} (e.g. Mielle Rosemary Oil)`} 
                                                    value={prod} 
                                                    onChange={(e) => {
                                                        const newProds = [...customProducts];
                                                        newProds[idx] = e.target.value;
                                                        setCustomProducts(newProds);
                                                    }}
                                                    style={{ paddingRight: '40px' }}
                                                    disabled={isScanning[idx]}
                                                />
                                                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        id={`scan-${idx}`} 
                                                        style={{ display: 'none' }} 
                                                        onChange={(e) => handleImageScan(e.target.files[0], idx)}
                                                    />
                                                    <label htmlFor={`scan-${idx}`} style={{ cursor: 'pointer', color: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)' }}>
                                                        {isScanning[idx] ? (
                                                            <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid var(--brand-200)', borderTopColor: 'var(--brand-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                                        ) : (
                                                            <CameraIcon size={14} />
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                            {customProducts.length > 1 && (
                                                <button 
                                                    onClick={() => setCustomProducts(customProducts.filter((_, i) => i !== idx))}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0 8px' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => setCustomProducts([...customProducts, ''])}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--blue-500)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Plus size={14} /> Add Another Product
                                    </button>
                                </div>

                                <input className="form-input" placeholder="Frequency (e.g. Twice Daily)" value={customFrequency} onChange={(e) => setCustomFrequency(e.target.value)} />
                                <input className="form-input" placeholder="Additional Notes (optional)" value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                <button className="btn btn-primary" onClick={handleAdd} style={{ flex: 1 }} disabled={!customName}>
                                    Save Custom Treatment
                                </button>
                                <button className="btn btn-outline" onClick={handleEvaluate} style={{ flex: 1, borderColor: 'var(--brand-300)', color: 'var(--brand-700)', background: 'var(--brand-50)' }} disabled={!customName}>
                                    <Sparkles size={16} style={{ color: 'var(--brand-500)' }} /> Evaluate with AI
                                </button>
                            </div>
                        </div>
                    ) : selectedDetail ? (
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
                            {isStylistAccount ? (
                                <div style={{ background: 'var(--brand-50)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderTop: '3px solid var(--brand-500)', marginBottom: 'var(--space-lg)' }}>
                                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-800)', marginBottom: '8px' }}>
                                        <ClipboardList size={16} /> Stylist Instructions
                                    </h5>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--brand-700)', margin: 0, lineHeight: 1.5 }}>
                                        You are currently logged in as a <strong>Master Stylist</strong>. While your clients receive AI recommendations based on their biological profile below, you should override these by assigning a custom protocol through their Client Profile.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ background: 'var(--sky-50)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderTop: '3px solid var(--sky-500)', marginBottom: 'var(--space-lg)', animation: 'fadeIn 0.4s ease-out' }}>
                                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sky-800)', marginBottom: '8px' }}>
                                        <Sparkles size={16} /> AI Coach Recommendations
                                    </h5>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--sky-900)', margin: 0, lineHeight: 1.5 }}>
                                        Because you do not currently have an active Stylist protocol, the <strong>CrownCare AI</strong> has highlighted treatments below that scientifically match your <strong>{onboarding?.porosity || 'recorded'} porosity</strong> and hair type. Look for the <Sparkles size={12}/> badge!
                                    </p>
                                </div>
                            )}
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Select Treatment</h4>
                            <div className="treatment-options">
                                {(tab === 'clinical' ? CLINICAL : tab === 'actives' ? SCALP_ACTIVES : NATURAL).map(t => (
                                    <button
                                        key={t.value}
                                        className={`t-opt ${newType === t.value ? 'active' : ''}`}
                                        onClick={() => { setSelectedDetail(t); setNewType(t.value); setCustomNotes(''); setCustomProducts(['']); }}
                                        style={{ position: 'relative' }}
                                    >
                                        {isRecommended(t.value) && (
                                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--sky-500)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 2 }}>
                                                <Sparkles size={10} /> AI Pick
                                            </div>
                                        )}
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
                                <span className={`badge ${t.type === 'clinical' ? 'badge-sky' : t.type === 'natural' ? 'badge-success' : 'badge-gold'}`}>{t.type}</span>
                                {t.desc && <span className="text-sm" style={{ display: 'block', marginTop: 4, color: 'var(--text-secondary)' }}><em>{t.desc}</em></span>}
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
                                    {t.desc && <span className="text-xs" style={{ display: 'block', color: 'var(--text-tertiary)', marginTop: 2, marginBottom: 2 }}><em>{t.desc}</em></span>}
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
