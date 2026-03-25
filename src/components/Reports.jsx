import { BarChart3, TrendingUp, Sparkles, Droplets, Camera, Salad, Activity, Pill, CheckCircle2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Reports.css';
import reportsImg from '../assets/images/reports.png';

export default function Reports({ isStylistView, mockedClientData }) {
    const { getDaysTracking, getStreak, photos, treatments, nutritionLogs, journalLogs, isStylistAccount, stylistCode, isPremium } = useApp();

    // Data Aggregation
    let days, streak, totalPhotos, totalTreatments, totalNutrition, complianceRate;
    let recentPhotos = [];
    let recentTreatments = [];
    let recentNutrition = null;
    let recentJournal = null;

    if (isStylistView && mockedClientData) {
        // Calculate derived stats for the stylist view based on the mock client data
        const activity = mockedClientData.activity || [];
        totalTreatments = activity.filter(a => a.type === 'treatment' || a.type === 'routine').length;
        totalNutrition = activity.length * 2; // Mock a higher number for visuals
        totalPhotos = Math.floor(activity.length / 2);
        
        // Use their defined consistency score to mock streak and days
        complianceRate = mockedClientData.consistencyScore;
        streak = Math.floor(complianceRate / 10);
        days = Math.floor(complianceRate / 2);
        
        recentPhotos = mockedClientData.recentPhotos || [];
        recentTreatments = activity.filter(a => a.type === 'treatment').slice(0, 3);
        recentNutrition = mockedClientData.recentNutrition || null;
        
        // Find the most recent journal entry from activity feed for stylist mock view
        const journalActivities = activity.filter(a => a.type === 'journal');
        if (journalActivities.length > 0) {
            recentJournal = journalActivities[0];
            // Clean up the description string if it has the "Journal Entry: " prefix
            if (recentJournal.description && recentJournal.description.startsWith('Journal Entry: ')) {
                recentJournal.text = recentJournal.description.replace('Journal Entry: ', '');
            }
        }
    } else {
        // Standard user view using global context
        days = getDaysTracking();
        streak = getStreak();
        totalPhotos = photos.length;
        totalTreatments = treatments.length;
        totalNutrition = nutritionLogs.length;
        complianceRate = days > 0 ? Math.min(Math.round(((totalTreatments + totalNutrition) / (days * 2)) * 100), 100) : 0;
        
        recentPhotos = photos.slice(0, 3);
        recentTreatments = treatments.slice(0, 3);
        
        // Find most recent log with some data
        if (nutritionLogs.length > 0) {
            recentNutrition = nutritionLogs[0];
            // Normalize shape to match mock data if needed
            if (!recentNutrition.waterGlasses) recentNutrition.waterGlasses = recentNutrition.water || 0;
        }
        
        // Find most recent journal log for standard view
        if (journalLogs && journalLogs.length > 0) {
            recentJournal = journalLogs[0];
        }
    }

    return (
        <div className="reports-container">
            <img src={reportsImg} alt="Clinical Analytics" className="page-header-img" style={{ marginTop: '1rem' }} />
            <div className="reports-header">
                <h2>{isStylistView ? `${mockedClientData?.name.split(' ')[0]}'s Analytics` : 'Clinical Analytics'}</h2>
                <p>{isStylistView ? `Monitoring client consistency and follicular data.` : `Track your consistency and monitor your follicular environment.`}</p>
            </div>

            {/* B2B VIRAL UPSELL BANNER */}
            {!isStylistView && !isStylistAccount && !stylistCode && (
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left', marginBottom: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Users size={24} color="#60A5FA" />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Maximize Your Results</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            This analytics data takes your hair care to a new level when tracked by a professional. Tell your stylist to visit <strong style={{color:'#60A5FA'}}>Crowncare.net/professionals</strong> to connect to your journal, or upgrade to the Stylist-Connected tier!
                        </p>
                    </div>
                </div>
            )}

            {/* High Level Stats */}
            <div className="report-stats-grid">
                <div className="report-stat-card">
                    <div className="stat-icon-wrapper" style={{background: 'var(--brand-100)', color: 'var(--brand-700)'}}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <span className="stat-value">{days} Days</span>
                        <span className="stat-label">Total Tracking</span>
                    </div>
                </div>
                <div className="report-stat-card">
                    <div className="stat-icon-wrapper" style={{background: 'var(--gold-100)', color: 'var(--gold-700)'}}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className="stat-value">{streak} Days</span>
                        <span className="stat-label">Current Streak</span>
                    </div>
                </div>
                <div className="report-stat-card">
                    <div className="stat-icon-wrapper" style={{background: 'var(--success-light)', color: 'var(--success)'}}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <span className="stat-value">{complianceRate}%</span>
                        <span className="stat-label">Routine Compliance</span>
                    </div>
                </div>
            </div>

            {/* Module Breakdowns */}
            <div className="report-breakdown">
                <h3 style={{ marginBottom: '16px' }}><BarChart3 size={18} /> Module Engagement</h3>
                
                <div className="breakdown-item card" style={{ padding: 'var(--space-lg)' }}>
                    <div className="breakdown-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Camera size={20} color="var(--blue-500)" />
                            <h4 style={{ margin: 0 }}>Visual Progress ({totalPhotos})</h4>
                        </div>
                    </div>
                    <div className="breakdown-content" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {recentPhotos.length > 0 ? (
                            recentPhotos.map((photo, i) => (
                                <div key={photo.id || i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                                    <img src={photo.imageData} alt="Progress" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px', textAlign: 'center' }}>
                                        {photo.zone || 'Global'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-sm" style={{ fontStyle: 'italic' }}>No baseline photos captured.</p>
                        )}
                    </div>
                </div>

                <div className="breakdown-item card" style={{ padding: 'var(--space-lg)' }}>
                    <div className="breakdown-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Pill size={20} color="var(--sky-500)" />
                            <h4 style={{ margin: 0 }}>Recent Treatments</h4>
                        </div>
                        <span className="text-muted text-xs">{totalTreatments} total</span>
                    </div>
                    <div className="breakdown-content">
                        {recentTreatments.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentTreatments.map((t, i) => (
                                    <li key={t.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <div>
                                            <span style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{t.name || t.description}</span>
                                            {t.date && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(t.date).toLocaleDateString()}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted text-sm" style={{ fontStyle: 'italic' }}>No treatments logged yet.</p>
                        )}
                    </div>
                </div>

                <div className="breakdown-item card" style={{ padding: 'var(--space-lg)' }}>
                    <div className="breakdown-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Salad size={20} color="var(--gold-500)" />
                            <h4 style={{ margin: 0 }}>Latest Nutrition Log</h4>
                        </div>
                        <span className="text-muted text-xs">{totalNutrition} total sessions</span>
                    </div>
                    <div className="breakdown-content">
                        {recentNutrition ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                    <Droplets size={16} color="#3b82f6" />
                                    <strong style={{ fontSize: '14px' }}>{recentNutrition.waterGlasses || 0} Glasses of Water</strong>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {recentNutrition.checks && Object.entries(recentNutrition.checks).map(([key, val]) => {
                                        if (!val) return null;
                                        // Format the key to readable string
                                        let label = key;
                                        if (key === 'vitaminD') label = 'Vitamin D';
                                        if (key === 'iron') label = 'Iron';
                                        if (key === 'protein') label = 'Protein';
                                        if (key === 'collagen') label = 'Collagen';
                                        
                                        return (
                                            <span key={key} className="badge" style={{ background: 'var(--gold-50)', color: 'var(--gold-800)', border: '1px solid var(--gold-200)', fontSize: '11px' }}>
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted text-sm" style={{ fontStyle: 'italic' }}>No nutrition log data available.</p>
                        )}
                    </div>
                </div>

                <div className="breakdown-item card" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--primary)' }}>
                    <div className="breakdown-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>📝</span>
                            <h4 style={{ margin: 0 }}>Latest Journal Entry</h4>
                        </div>
                    </div>
                    <div className="breakdown-content">
                        {recentJournal ? (
                            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic' }}>
                                "{recentJournal.text || recentJournal.description}"
                                {recentJournal.date && <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'normal' }}>{new Date(recentJournal.date).toLocaleDateString()}</div>}
                            </div>
                        ) : (
                            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                <p className="text-muted text-sm mb-sm" style={{ fontStyle: 'italic' }}>No journal entries yet.</p>
                                <p className="text-muted text-xs">Logging your daily experiences helps your stylist tailor your care.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
