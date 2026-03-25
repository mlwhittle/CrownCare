import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera as CameraIcon, X, Check, Trash2, Image, Clock, Calendar, ArrowLeftRight, Pill, Moon, Sparkles, Upload, ScanSearch } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import beforeImg from '../assets/images/before.png';
import afterImg from '../assets/images/after.png';
import diaryImg from '../assets/images/diary.png';
import Upgrade from './Upgrade';
import PWAGhostCamera from './PWAGhostCamera';
import { loadApiKey, analyzeScalpPhotoWithGemini } from '../services/GeminiService';
import './VisualDiary.css';

const ZONES = ['All', 'Part Line', 'Hairline', 'Crown', 'Edges', 'Nape', 'Overall'];

export default function VisualDiary({ setCurrentView, openAI }) {
    const { photos, addPhoto, deletePhoto, isPremium, shareAuditWithStylist } = useApp();
    const [zone, setZone] = useState('All');
    const [showNextSteps, setShowNextSteps] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [captured, setCaptured] = useState(null);
    const [photoZone, setPhotoZone] = useState('Part Line');
    const [notes, setNotes] = useState('');
    const [oilLevel, setOilLevel] = useState(3);
    const [hydrationLevel, setHydrationLevel] = useState(3);
    const [flakeLevel, setFlakeLevel] = useState(1);
    const [compare, setCompare] = useState(false);
    const [compA, setCompA] = useState(null);
    const [compB, setCompB] = useState(null);
    const [showGhostCamera, setShowGhostCamera] = useState(false);
    
    // AI Scalp Audit State
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditResult, setAuditResult] = useState(null);
    const [auditPhoto, setAuditPhoto] = useState(null);

    const runScalpAudit = async (photo) => {
        setAuditLoading(true);
        setAuditPhoto(photo);
        setAuditResult(null);
        const apiKey = loadApiKey();
        const result = await analyzeScalpPhotoWithGemini(apiKey, photo.imageData);
        setAuditResult(result);
        setAuditLoading(false);
    };

    const handleCapture = async (source = CameraSource.Prompt) => {
        try {
            const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: source,
                width: 800 // Capacitor safely resizes natively avoiding QuotaExceeded errors
            });
            setCaptured(image.dataUrl);
            setPhotoZone('Part Line');
            setNotes('');
            setOilLevel(3);
            setHydrationLevel(3);
            setFlakeLevel(1);
        } catch (error) {
            console.error("Camera capture failed:", error);
            // Ignore user cancellation errors
        }
    };

    const save = () => {
        if (!captured) return;
        addPhoto({ 
            imageData: captured, 
            zone: photoZone, 
            notes: notes.trim(),
            diagnostics: { oil: oilLevel, hydration: hydrationLevel, flakes: flakeLevel }
        });
        setCaptured(null); setNotes('');
        setOilLevel(3); setHydrationLevel(3); setFlakeLevel(1);
        setShowNextSteps(true);
    };

    const cancel = () => { setCaptured(null); setNotes(''); setOilLevel(3); setHydrationLevel(3); setFlakeLevel(1); };

    const filtered = zone === 'All' ? photos : photos.filter(p => p.zone === zone);
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const daysAgo = (d) => { const n = Math.floor((Date.now() - new Date(d)) / 864e5); return n === 0 ? 'Today' : n === 1 ? 'Yesterday' : `${n} days ago`; };

    const onSelect = (p) => {
        if (!compare) return;
        if (!compA) setCompA(p);
        else if (!compB) setCompB(p);
        else { setCompA(p); setCompB(null); }
    };

    const grouped = {};
    filtered.forEach(p => { const k = p.date.split('T')[0]; (grouped[k] = grouped[k] || []).push(p); });
    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="diary">
            <img src={diaryImg} alt="Hair Follicle Tracker" className="page-header-img" style={{ marginTop: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '1px', color: '#FCD34D', textTransform: 'uppercase', marginBottom: '1.5rem', marginTop: '1rem' }}>Visual Hair Diary</h2>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)', overflowX: 'auto', paddingBottom: 'var(--space-sm)', scrollSnapType: 'x mandatory' }}>
                <button className="btn btn-primary" onClick={() => setCurrentView('treatments')} style={{ flex: '0 0 auto', scrollSnapAlign: 'start', whiteSpace: 'nowrap', padding: 'var(--space-sm) var(--space-md)' }}>
                    <Pill size={16} style={{ marginRight: '6px' }} /> Log Treatment
                </button>
                <button className="btn btn-secondary" onClick={() => setCurrentView('routines')} style={{ flex: '0 0 auto', scrollSnapAlign: 'start', whiteSpace: 'nowrap', padding: 'var(--space-sm) var(--space-md)' }}>
                    <Moon size={16} style={{ marginRight: '6px' }} /> Plan Routine
                </button>
                <button className="btn" onClick={openAI} style={{ flex: '0 0 auto', scrollSnapAlign: 'start', whiteSpace: 'nowrap', padding: 'var(--space-sm) var(--space-md)', border: '1px solid var(--border-color)' }}>
                    <Sparkles size={16} style={{ marginRight: '6px' }} /> Ask AI Coach
                </button>
            </div>

            {photos.length === 0 && (
                <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center', padding: '0 var(--space-sm)' }}>
                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>Your Journey Starts Here</h3>
                    <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                        You've taken the hardest step: starting. Regrowing hair requires consistency, science, and patience. You are not alone. Whether you need to log your daily treatments, build a nighttime protection routine, or ask the AI Coach to break down the science behind your products, CrownCare is here to guide you every single day.
                    </p>
                </div>
            )}

            <div className="card" style={{ marginBottom: 'var(--space-2xl)', background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-tertiary))', border: '1px solid var(--border-color)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <Sparkles size={18} color="var(--primary)" />
                    Why Visual Tracking is Essential
                </h4>
                <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                    Hair regrowth is a slow, microscopic process. Because we look at ourselves in the mirror every single day, our brains naturally filter out the tiny new hairs blooming at the root.
                </p>
                <div style={{ padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <p className="text-sm" style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Consistent visual documentation is the <strong>only clinically proven way</strong> to accurately verify if your routine is successfully reversing follicle miniaturization.
                    </p>
                </div>
                <p className="text-muted text-sm" style={{ marginTop: 'var(--space-md)', marginBottom: 0, lineHeight: 1.5, borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                    <strong>Clinical Timeline:</strong> Hair typically grows at a rate of just ~1cm per month. Commit to <strong>3 to 6 months</strong> of consistent logging to see true, measurable density improvements.
                </p>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-2xl)', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--brand-400)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                    <Image size={18} color="var(--brand-400)" />
                    {photos.length > 0 ? "Congratulations, here's your Progress Report" : "Progress Report"}
                </h4>
                {(!photos || photos.length === 0) ? (
                    <p className="text-muted text-sm" style={{ margin: 0 }}>
                        Take your first photo today. Hair typically grows ~1 cm/month — tracking visually is the only way to see true clinical progress.
                    </p>
                ) : (
                    <p className="text-muted text-sm" style={{ margin: 0 }}>
                        You have securely logged <strong>{photos.length}</strong> photo{photos.length > 1 ? 's' : ''}. Your last capture was on <strong>{fmtShort(photos[0].date)}</strong>. Return in 30 days to take additional photos to compare and measure your growth!
                    </p>
                )}
            </div>

            <div className="zone-bar">{ZONES.map(z => <button key={z} className={`zone-btn ${zone === z ? 'active' : ''}`} onClick={() => setZone(z)}>{z}</button>)}</div>

            <div className="cam-section">
                {!captured && (
                    <div className="cam-prompt">
                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', border: '2px solid var(--gold-primary)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.1)' }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Sparkles size={18} color="var(--gold-primary)" /> Powered by Ghost Overlay™
                            </div>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                                We mathematically overlay your previous photo on the live camera so you can match your angles perfectly.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginBottom: 'var(--space-sm)' }}>
                            <button className="cam-big" onClick={() => setShowGhostCamera(true)} style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #B45309 100%)', boxShadow: '0 4px 20px rgba(252, 211, 77, 0.4)' }}>
                                <CameraIcon size={36} color="#050508" />
                            </button>
                            <button className="cam-big" onClick={() => handleCapture(CameraSource.Photos)} style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #B45309 100%)', boxShadow: '0 4px 20px rgba(252, 211, 77, 0.4)' }}>
                                <Upload size={36} color="#050508" />
                            </button>
                        </div>
                        <h3>Log Progress Photo</h3>
                        <p className="text-muted text-sm" style={{ marginBottom: 0 }}>Take a new photo or securely upload from your gallery</p>
                    </div>
                )}
                {captured && (
                    <>
                        <div className="cam-preview">
                            <img src={captured} alt="Captured" />
                            <div className="cam-stamp"><Calendar size={14} />{fmt(new Date().toISOString())} • <Clock size={14} />{fmtTime(new Date().toISOString())}</div>
                        </div>
                        <div style={{ maxWidth: 400, margin: 'var(--space-lg) auto 0' }}>
                            <label className="form-label">Scalp Zone</label>
                            <select className="form-select" value={photoZone} onChange={e => setPhotoZone(e.target.value)} style={{ marginBottom: 'var(--space-md)' }}>
                                {ZONES.filter(z => z !== 'All').map(z => <option key={z} value={z}>{z}</option>)}
                            </select>

                            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} color="var(--gold-500)"/> Scalp Condition Diagnostics</h4>
                                
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                        <span style={{color: 'var(--text-secondary)'}}>Sebum/Oil Balance</span>
                                        <span style={{fontWeight: 'bold', color: oilLevel > 3 ? 'var(--brand-500)' : oilLevel < 3 ? 'var(--sky-500)' : 'var(--success)'}}>{oilLevel < 3 ? 'Dry' : oilLevel > 3 ? 'Oily' : 'Balanced'}</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={oilLevel} onChange={(e) => setOilLevel(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--gold-500)' }} />
                                </div>
                                
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                        <span style={{color: 'var(--text-secondary)'}}>Hydration/Moisture</span>
                                        <span style={{fontWeight: 'bold', color: hydrationLevel > 3 ? 'var(--success)' : hydrationLevel < 3 ? 'var(--brand-500)' : 'var(--text-primary)'}}>{hydrationLevel < 3 ? 'Dehydrated' : hydrationLevel > 3 ? 'Hydrated' : 'Normal'}</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={hydrationLevel} onChange={(e) => setHydrationLevel(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--sky-500)' }} />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                        <span style={{color: 'var(--text-secondary)'}}>Flake/Build-up Control</span>
                                        <span style={{fontWeight: 'bold', color: flakeLevel > 1 ? 'var(--error)' : 'var(--success)'}}>{flakeLevel === 1 ? 'Clear' : flakeLevel < 3 ? 'Mild' : flakeLevel < 5 ? 'Moderate' : 'Severe'}</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={flakeLevel} onChange={(e) => setFlakeLevel(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--error)' }} />
                                </div>
                            </div>

                            <input className="form-input" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <div className="cam-actions">
                            <button className="btn btn-secondary" onClick={() => setCaptured(null)}><CameraIcon size={16} /> Retake</button>
                            <button className="btn btn-primary" onClick={save}><Check size={16} /> Save Photo</button>
                        </div>
                    </>
                )}
            </div>

            {/* Timeline */}
            <div className="tl-header">
                <h3>{zone === 'All' ? 'Timeline' : `${zone} Timeline`} <span className="text-muted text-sm" style={{ fontWeight: 400 }}>({filtered.length})</span></h3>
                {filtered.length >= 2 && <button className={`btn btn-sm ${compare ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setCompare(!compare); setCompA(null); setCompB(null); }}><ArrowLeftRight size={14} />{compare ? 'Exit' : 'Compare'}</button>}
            </div>

            {filtered.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--space-2xl)' }}><Image size={40} style={{ opacity: 0.3, marginBottom: 'var(--space-sm)' }} /><p className="text-muted">No photos yet. Take your first progress photo!</p></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '2rem' }}>
                    {filtered.map((p, i) => {
                        let daysElapsed = 0;
                        if (photos && photos.length > 0) {
                            const firstPhotoDate = new Date(photos[photos.length - 1].date);
                            const thisDate = new Date(p.date);
                            daysElapsed = Math.floor((thisDate - firstPhotoDate) / (1000 * 60 * 60 * 24));
                        }

                        return (
                            <div key={p.id} onClick={() => onSelect(p)} style={{ 
                                position: 'relative', 
                                borderRadius: '16px', 
                                overflow: 'hidden', 
                                aspectRatio: '3/4',
                                border: (compA?.id === p.id || compB?.id === p.id) ? '2px solid #FCD34D' : '1px solid rgba(255,255,255,0.1)',
                                cursor: compare ? 'pointer' : 'default',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                background: '#0A0A0F'
                            }}>
                                <img src={p.imageData} alt={p.zone} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                
                                {/* Gradient Overlay */}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(5,5,8,0.95) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
                                
                                {/* Top Right Tag (Days) */}
                                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(252, 211, 77, 0.95)', color: '#050508', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                    {daysElapsed === 0 ? 'DAY 1' : `${daysElapsed} DAYS`}
                                </div>

                                {/* Top Left (Delete) */}
                                <button onClick={e => { e.stopPropagation(); deletePhoto(p.id); }} style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                                    <Trash2 size={12} />
                                </button>
                                
                                {/* Top Left (AI Audit) */}
                                <button onClick={e => { e.stopPropagation(); runScalpAudit(p); }} style={{ position: 'absolute', top: '8px', left: '42px', background: 'rgba(252, 211, 77, 0.95)', border: 'none', color: '#050508', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                                    <ScanSearch size={12} /> AI Scan
                                </button>
                                
                                {/* Bottom Floating Tags & Meta */}
                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                            {p.zone.toUpperCase()}
                                        </span>
                                        {i % 2 === 0 && (
                                            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                SHINE
                                            </span>
                                        )}
                                        {i % 3 === 0 && (
                                            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                DENSITY
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                        <Calendar size={10} /> {fmtShort(p.date)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {compare && (
                <div className="cmp-section" style={{ marginTop: 'var(--space-2xl)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}><ArrowLeftRight size={18} /> Side-by-Side</h3>
                    <div className="cmp-grid">
                        <div className="cmp-panel">
                            <img src={compA ? compA.imageData : beforeImg} alt="Before" />
                            <div className="cmp-info">
                                <strong>{compA ? compA.zone : 'Example Before'}</strong>
                                <span>{compA ? fmtShort(compA.date) : 'Short Hair'}</span>
                            </div>
                        </div>
                        <div className="cmp-panel">
                            <img src={compB ? compB.imageData : afterImg} alt="After" />
                            <div className="cmp-info">
                                <strong>{compB ? compB.zone : 'Example After'}</strong>
                                <span>{compB ? fmtShort(compB.date) : 'Long & Healthy'}</span>
                            </div>
                        </div>
                    </div>
                    {compA && compB && (
                        <div className="cmp-diff"><Calendar size={14} />{Math.abs(Math.floor((new Date(compB.date) - new Date(compA.date)) / 864e5))} days between photos</div>
                    )}
                </div>
            )}

            {showNextSteps && (
                <div className="ai-overlay" style={{ zIndex: 999 }}>
                    <div className="card" style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
                        <div style={{ background: 'var(--success-light)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)' }}>
                            <Check size={32} color="var(--success)" />
                        </div>
                        <h3>Photo Saved!</h3>
                        <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>Great job tracking your journey. Consistency is key to regrowth. What would you like to do next?</p>

                        <button className="btn btn-primary" onClick={() => { setShowNextSteps(false); setCurrentView('treatments'); }} style={{ width: '100%', marginBottom: 'var(--space-sm)' }}>
                            <Pill size={18} /> Log Today's Treatment
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setShowNextSteps(false); setCurrentView('routines'); }} style={{ width: '100%', marginBottom: 'var(--space-sm)' }}>
                            <Moon size={18} /> Plan Night Routine
                        </button>
                        <button className="btn" onClick={() => { setShowNextSteps(false); if (isPremium) { openAI(); } else { setShowUpgrade(true); } }} style={{ width: '100%', marginBottom: 'var(--space-md)', border: '1px solid var(--border-color)' }}>
                            <Sparkles size={18} /> Ask AI Coach
                        </button>

                        <button className="btn" onClick={() => { setShowNextSteps(false); handleCapture(); }} style={{ width: '100%', marginBottom: 'var(--space-xl)', border: '1px solid var(--border-color)' }}>
                            <CameraIcon size={18} /> Take Another Photo
                        </button>

                        <button className="btn" onClick={() => setShowNextSteps(false)} style={{ width: '100%', border: 'none', color: 'var(--text-tertiary)', background: 'transparent' }}>
                            Just view my timeline
                        </button>
                    </div>
                </div>
            )}

            {showUpgrade && <Upgrade onClose={() => setShowUpgrade(false)} />}
            
            {showGhostCamera && (
                <PWAGhostCamera 
                    ghostImage={filtered.length > 0 ? filtered[0].imageData : (photos.length > 0 ? photos[0].imageData : null)}
                    onClose={() => setShowGhostCamera(false)}
                    onCapture={(dataUrl) => {
                        setCaptured(dataUrl);
                        setShowGhostCamera(false);
                        setPhotoZone(zone === 'All' ? 'Part Line' : zone);
                        setNotes('');
                    }}
                />
            )}

            {/* AI Scalp Audit Modal */}
            {auditPhoto && (
                <div className="ai-overlay" style={{ zIndex: 1000, padding: '20px', alignItems: 'center' }}>
                    <div className="card" style={{ maxWidth: '400px', margin: 'auto', background: 'var(--bg-secondary)', position: 'relative', border: '1px solid var(--brand-400)', width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                        <button onClick={() => { setAuditPhoto(null); setAuditResult(null); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#FCD34D' }}>
                            <ScanSearch size={22} />
                            <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>AI Scalp Audit™</h3>
                        </div>

                        <img src={auditPhoto.imageData} alt="Audit Target" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', opacity: auditLoading ? 0.3 : 1, transition: 'opacity 0.3s ease' }} />
                        
                        {auditLoading && (
                            <div style={{ padding: '20px', textAlign: 'center', position: 'absolute', top: '120px', left: 0, right: 0 }}>
                                <div style={{ width: 40, height: 40, border: '3px solid rgba(252,211,77,0.2)', borderTop: '3px solid #FCD34D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
                                <p style={{ color: '#FCD34D', fontSize: '13px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>Gemini Vision AI is scanning 800+ follicles...</p>
                            </div>
                        )}

                        {!auditLoading && auditResult && (
                            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', maxHeight: '45vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: auditResult.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FCD34D">$1</strong>') }} />
                            </div>
                        )}
                        {!auditLoading && auditResult && (
                            <div style={{ marginTop: '16px' }}>
                                <button className="btn btn-primary" onClick={() => {
                                    shareAuditWithStylist(auditResult, auditPhoto.imageData);
                                    alert("Securely dispatched to your Stylist's B2B Portal!");
                                    setAuditPhoto(null);
                                    setAuditResult(null);
                                }} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Sparkles size={16} /> Send to My Stylist
                                </button>
                            </div>
                        )}
                        {!auditLoading && auditResult && (
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '16px', textAlign: 'center', lineHeight: 1.4 }}>*CrownCare AI Audits are non-medical estimates. Share this photo with your certified Stylist for clinical diagnosis.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
