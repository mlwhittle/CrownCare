import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, X, Check, Trash2, Image, Clock, Calendar, ArrowLeftRight } from 'lucide-react';
import beforeImg from '../assets/images/before.png';
import afterImg from '../assets/images/after.png';
import './VisualDiary.css';

const ZONES = ['All', 'Part Line', 'Hairline', 'Crown', 'Edges', 'Nape', 'Overall'];

export default function VisualDiary() {
    const { photos, addPhoto, deletePhoto } = useApp();
    const [zone, setZone] = useState('All');
    const [cameraActive, setCameraActive] = useState(false);
    const [captured, setCaptured] = useState(null);
    const [photoZone, setPhotoZone] = useState('Part Line');
    const [notes, setNotes] = useState('');
    const [compare, setCompare] = useState(false);
    const [compA, setCompA] = useState(null);
    const [compB, setCompB] = useState(null);
    const [camError, setCamError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = useCallback(async () => {
        setCamError('');
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
            setCameraActive(true);
        } catch (err) {
            setCamError(err.name === 'NotAllowedError' ? 'Camera permission denied. Please allow in browser settings.' : err.message);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraActive(false);
    }, []);

    const takePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current, c = canvasRef.current;
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0);
        setCaptured(c.toDataURL('image/jpeg', 0.85));
        stopCamera();
    }, [stopCamera]);

    const save = () => {
        if (!captured) return;
        addPhoto({ imageData: captured, zone: photoZone, notes: notes.trim() });
        setCaptured(null); setNotes('');
    };

    const cancel = () => { setCaptured(null); setNotes(''); stopCamera(); };

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
            <h2 className="gradient-text">Visual Hair Diary</h2>
            <p className="text-muted text-sm mb-lg">Track your hair growth with consistent photos. Hair typically grows ~1 cm/month — check back in 3–6 months for visible change.</p>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="zone-bar">{ZONES.map(z => <button key={z} className={`zone-btn ${zone === z ? 'active' : ''}`} onClick={() => setZone(z)}>{z}</button>)}</div>

            <div className="cam-section">
                {!cameraActive && !captured && (
                    <div className="cam-prompt">
                        <button className="cam-big" onClick={startCamera}><Camera size={36} /></button>
                        <h3>Take a Progress Photo</h3>
                        <p className="text-muted text-sm">Opens your camera for a guided scalp photo</p>
                        <div className="cam-tips"><span>💡 Same spot</span><span>💡 Same light</span><span>💡 Same angle</span></div>
                        {camError && <div className="cam-error">⚠️ {camError}</div>}
                    </div>
                )}
                {cameraActive && !captured && (
                    <div className="cam-live">
                        <div className="vf-wrap"><video ref={videoRef} autoPlay playsInline muted className="vf-video" /><div className="vf-overlay"><div className="vfc tl" /><div className="vfc tr" /><div className="vfc bl" /><div className="vfc br" /></div></div>
                        <div className="vf-controls">
                            <button className="vfb" onClick={cancel}><X size={20} /></button>
                            <button className="vfb capture" onClick={takePhoto}><Camera size={28} /></button>
                            <div style={{ width: 48 }} />
                        </div>
                        <p className="text-muted text-xs text-center mt-md">Position your scalp area and tap to capture</p>
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
                            <input className="form-input" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <div className="cam-actions">
                            <button className="btn btn-secondary" onClick={() => { setCaptured(null); startCamera(); }}><Camera size={16} /> Retake</button>
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
                <div className="tl-list">
                    {dates.map(dk => (
                        <div key={dk} className="tl-day">
                            <div className="tl-date"><div className="tl-dot" /><span className="tl-date-text">{fmt(dk + 'T00:00')}</span><span className="tl-ago">{daysAgo(dk + 'T00:00')}</span></div>
                            <div className="tl-grid">
                                {grouped[dk].map(p => (
                                    <div key={p.id} className={`tl-card ${compare ? 'sel' : ''} ${compA?.id === p.id || compB?.id === p.id ? 'picked' : ''}`} onClick={() => onSelect(p)}>
                                        <div className="tl-img"><img src={p.imageData} alt={p.zone} /><button className="tl-del" onClick={e => { e.stopPropagation(); deletePhoto(p.id); }}><Trash2 size={14} /></button></div>
                                        <div className="tl-meta"><span className="tl-zone">{p.zone}</span><span className="tl-time"><Clock size={11} />{fmtTime(p.date)}</span>{p.notes && <span className="tl-note">{p.notes}</span>}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
        </div>
    );
}
