import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateMonthlyNarrative, loadApiKey } from '../services/GeminiService';
import { Download, Crosshair, ChevronRight, Share, Sparkles, AlertCircle, Archive, Save, ArrowLeft } from 'lucide-react';
import beforeImg from '../assets/images/before.png';
import afterImg from '../assets/images/after.png';
import narrativeImg from '../assets/images/journal.png';
import './MonthlyNarrative.css';

export default function MonthlyNarrative({ setCurrentView, isStylistView, mockedClientData }) {
    const { onboarding, treatments, nutritionLogs, getDaysTracking, getConsistencyScore, photos, archivedNarratives, saveNarrativeArchive } = useApp();
    const apiKey = loadApiKey();
    
    const [sliderPos, setSliderPos] = useState(50);
    const [narrative, setNarrative] = useState('');
    const [loadingAI, setLoadingAI] = useState(true);
    const [viewMode, setViewMode] = useState('current'); // 'current', 'archives', 'view-archive'
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const score = getConsistencyScore();

    // Trigger Gemini to write the custom "Magazine" article for the CURRENT view
    useEffect(() => {
        const fetchNarrative = async () => {
            if (!apiKey) {
                setNarrative("Please connect your Gemini API key in the CrownCare Concierge to generate your personalized Monthly Narrative.");
                setLoadingAI(false);
                return;
            }

            const recentActivesRaw = treatments.filter(t => t.type === 'actives').slice(0, 5).map(t => t.name).join(', ');
            const latestPhoto = photos.length > 0 ? photos[0] : null;

            const userData = {
                name: isStylistView && mockedClientData ? mockedClientData.name : (onboarding?.name || 'Queen'),
                days: isStylistView && mockedClientData ? Math.floor(mockedClientData.consistencyScore / 2) : getDaysTracking(),
                score: isStylistView && mockedClientData ? mockedClientData.consistencyScore : score,
                recentTreatments: isStylistView && mockedClientData && mockedClientData.activity ? 
                    mockedClientData.activity.filter(a => a.type === 'treatment').slice(0, 5).map(t => t.description).join(', ') : 
                    treatments.slice(0, 5).map(t => t.name).join(', '),
                recentActives: recentActivesRaw || 'None',
                latestDiagnostics: latestPhoto?.diagnostics ? 
                    `Sebum: ${latestPhoto.diagnostics.oil}/5, Hydration: ${latestPhoto.diagnostics.hydration}/5, Flakes: ${latestPhoto.diagnostics.flakes}/5` : 
                    'No condition data',
                nutritionCount: isStylistView && mockedClientData ? Math.floor(mockedClientData.consistencyScore * 1.5) : nutritionLogs.length
            };

            const result = await generateMonthlyNarrative(apiKey, userData);
            setNarrative(result);
            setLoadingAI(false);
        };

        if (viewMode === 'current') {
            fetchNarrative();
        }
    }, [apiKey, onboarding, treatments, nutritionLogs, score, viewMode]);

    const handleSaveArchive = () => {
        if (!narrative || isSaving) return;
        setIsSaving(true);
        setTimeout(() => {
            const monthLabel = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });
            saveNarrativeArchive(
                narrative, 
                score, 
                monthLabel, 
                [beforeImg, afterImg]
            );
            setIsSaving(false);
            alert(`Snapshot properly locked! Saved as ${monthLabel}.`);
        }, 800);
    };

    const handleExportPDF = () => {
        alert("The PDF Synthesis Engine would generate a highly stylized document off this view for your records.");
    };

    if (viewMode === 'archives') {
        return (
            <div className="narrative-screen fade-in">
                <header className="narrative-header" style={{ marginBottom: 'var(--space-md)' }}>
                    <h1>Report Archives</h1>
                    <p>Access your past clinical records.</p>
                </header>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                    <button className="btn btn-outline" onClick={() => setViewMode('current')} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
                        <ArrowLeft size={16} /> Back to Live Report
                    </button>
                </div>

                {archivedNarratives.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
                        <Archive size={40} style={{ opacity: 0.3, margin: '0 auto var(--space-sm)', color: 'var(--brand-300)' }} />
                        <p className="text-muted">No reports saved yet. Save a snapshot from your Current Report.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: '600px', margin: '0 auto' }}>
                        {archivedNarratives.map((arc, index) => (
                            <div key={arc.id} className="card archive-card" onClick={() => { setSelectedArchive(arc); setViewMode('view-archive'); }} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', padding: '16px' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-400)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                        {arc.targetMonth}
                                        {index === archivedNarratives.length - 1 && <span style={{fontSize: '0.65rem', background: 'var(--brand-800)', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold'}}>Baseline</span>}
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Generated: {new Date(arc.dateGenerated).toLocaleDateString()}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-500)' }}>{arc.score}%</div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Score</div>
                                    </div>
                                    <ChevronRight size={20} color="var(--text-tertiary)" />
                                </div>
                            </div>
                        ))}
                        <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px', padding: '0 16px', lineHeight: '1.5'}}>
                            *To optimize app performance, CrownCare permanently locks your Baseline (first) report, and keeps a rolling log of your 11 most recent monthly reports.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Whether 'current' or 'view-archive', render the report view
    const displayNarrative = viewMode === 'view-archive' ? selectedArchive.text : narrative;
    const isLoading = viewMode === 'current' ? loadingAI : false;
    const isArchivedView = viewMode === 'view-archive';

    return (
        <div className="narrative-screen fade-in">
            {isArchivedView && (
                <div style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10, padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setViewMode('archives'); setSelectedArchive(null); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowLeft size={16} /> Back to Archives
                    </button>
                    <span style={{ fontWeight: 700, color: 'var(--brand-600)', fontSize: '0.9rem' }}>{selectedArchive.targetMonth} Archive</span>
                </div>
            )}

            <header className="narrative-header">
                <img src={narrativeImg} alt="Monthly Narrative Report" className="page-header-img" style={{ marginTop: '1rem' }} />
                <h1>{isArchivedView ? `Archive: ${selectedArchive.targetMonth}` : (isStylistView ? 'Client Narrative' : 'The Monthly Narrative')}</h1>
                <p>{isArchivedView ? `Historical record generated on ${new Date(selectedArchive.dateGenerated).toLocaleDateString()}` : (isStylistView ? `Review ${mockedClientData?.name.split(' ')[0]}'s 30-Day Comprehensive Crown Report` : 'Volume 1 • Your 30-Day Comprehensive Crown Report')}</p>
                
                {/* Archive Toggle Buttons */}
                {!isArchivedView && !isStylistView && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button className="btn" style={{ background: 'var(--brand-800)', color: 'white', border: 'none', borderRadius: '24px', padding: '8px 20px', fontSize: '0.85rem' }}>Current Report</button>
                        <button className="btn btn-outline" style={{ borderRadius: '24px', padding: '8px 20px', fontSize: '0.85rem', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} onClick={() => setViewMode('archives')}>
                            <Archive size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> Historical Archives ({archivedNarratives.length})
                        </button>
                    </div>
                )}

                <div className="narrative-info-card">
                    <h4><Sparkles size={16} /> Care Plan Intelligence</h4>
                    <p>
                        This personalized report aggregates your daily tracking, treatments, and visual logs into an actionable 30-day timeline. 
                        <strong style={{color: 'var(--text-primary)'}}> For you</strong>, it reveals what's working so you stay consistent. 
                        <strong style={{color: 'var(--text-primary)'}}> For your Hair Care Professional</strong>, it provides the precise tracking data necessary to issue highly customized care routines and identify lifestyle patterns.
                    </p>
                    <p>
                        <strong style={{color: 'var(--text-primary)'}}>Why Export PDF?</strong> The export button generates a beautiful, printable document of this entire narrative—including your before/after photos—that you can hand directly to your stylist at your next appointment!
                    </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                    <button className="btn-export" onClick={handleExportPDF}>
                        <Download size={16} /> Export clinical pdf
                    </button>
                    {!isArchivedView && !isStylistView && (
                        <button className="btn-export" onClick={handleSaveArchive} disabled={isSaving || loadingAI} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Snapshot'}
                        </button>
                    )}
                </div>
            </header>

            {/* 1. Interactive Slider Component */}
            <section className="narrative-section">
                <div className="section-title">
                    <Sparkles size={18} className="icon-gold" />
                    <h2>Follicular Transition</h2>
                </div>
                <p className="section-desc">Drag the slider to physically see your density and hydration retention over the last 30 days.</p>
                
                <div className="diff-slider-container">
                    <img src={isArchivedView && selectedArchive.images[1] ? selectedArchive.images[1] : afterImg} alt="Current Hair" className="diff-image after-img" />
                    <div 
                        className="diff-image before-container" 
                        style={{ width: `${sliderPos}%` }}
                    >
                        <img src={isArchivedView && selectedArchive.images[0] ? selectedArchive.images[0] : beforeImg} alt="Baseline Hair" className="before-img" />
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderPos}
                        onChange={(e) => setSliderPos(e.target.value)}
                        className="diff-slider"
                    />
                    <div className="slider-label left">Day 1</div>
                    <div className="slider-label right">Day 30</div>
                </div>
            </section>

            {/* 2. Nutrition Correlation Mock Chart */}
            <section className="narrative-section">
                <div className="section-title">
                    <Crosshair size={18} className="icon-gold" />
                    <h2>Nutrition-to-Follicle Correlation</h2>
                </div>
                <div className="correlation-card">
                    <div className="corr-insight">
                        <AlertCircle size={16} color="var(--brand-500)" />
                        <p><strong>Clinical Insight:</strong> Weeks where you hit &gt;80% protein goals correlated with a 20% drop in reported breakage during Sunday wash days.</p>
                    </div>
                    
                    {/* CSS Pseudo-Chart */}
                    <div className="pseudo-chart">
                        <div className="chart-bar"><div className="fill protein" style={{height: '60%'}}></div><span>Wk 1</span></div>
                        <div className="chart-bar"><div className="fill protein" style={{height: '85%'}}></div><span>Wk 2</span></div>
                        <div className="chart-bar"><div className="fill protein highlight" style={{height: '95%'}}></div><span>Wk 3</span></div>
                        <div className="chart-bar"><div className="fill protein" style={{height: '70%'}}></div><span>Wk 4</span></div>
                    </div>
                </div>
            </section>

            {/* 3. The Legacy Milestone Forecast (Gemini Integration) */}
            <section className="narrative-section custom-bg">
                <div className="section-title">
                    <h2>Legacy Milestone Forecast</h2>
                </div>
                <div className="narrative-ai-content">
                    {isLoading ? (
                        <div className="ai-loading">
                            <span className="shimmer-text">Synthesizing 30-Day Clinical Data...</span>
                        </div>
                    ) : (
                        <div className="ai-response">
                            {(displayNarrative || '').split('\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Subscriptions / Retention Hook - Only show to User, not Stylist, not Archive */}
            {!isStylistView && !isArchivedView && (
                <div className="retention-hook">
                    <h3>Ready to accelerate your growth?</h3>
                    <p>Your follicle cycle is responding to discipline. Lock in your next goal.</p>
                    <button 
                        className="btn btn-primary btn-large hook-btn"
                        onClick={() => {
                            alert("Goal Registered! Welcome to Month 2 of CrownCare.");
                            setCurrentView('home');
                        }}
                    >
                        Commit to Next Month's Mission <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
