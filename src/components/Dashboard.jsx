import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Camera, Salad, Pill, Moon, Sparkles, TrendingUp, CheckCircle2, User, Users, ArrowRight, Award, ShieldCheck, Clock, Activity, BookOpen, BarChart3 } from 'lucide-react';
import BadgeModal from './BadgeModal';
import InviteClientModal from './InviteClientModal';
import reportsImg from '../assets/images/reports.png';
import './Home.css';

export default function Dashboard({ setCurrentView, openAI }) {
    const { onboarding, getDaysTracking, getStreak, treatments, nutritionLogs, photos, getConsistencyScore, getConsistencyTier, runBadgeEvaluation, unlockedBadges, appointments, stylistContact, isStylistAccount, stylistCode } = useApp();

    const days = getDaysTracking();
    const streak = getStreak();
    const score = getConsistencyScore();
    const tier = getConsistencyTier(score);
    const name = onboarding?.name || 'Queen';

    const [showConsistencyModal, setShowConsistencyModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [activeBadge, setActiveBadge] = useState(null);
    const healthConnected = localStorage.getItem('cc_health') === 'true';

    useEffect(() => {
        const previousCount = localStorage.getItem('cc_badge_count') || 0;
        runBadgeEvaluation();
        
        if (unlockedBadges.length > parseInt(previousCount)) {
            const latestBadgeId = unlockedBadges[unlockedBadges.length - 1];
            setActiveBadge(latestBadgeId);
            localStorage.setItem('cc_badge_count', unlockedBadges.length);
        }
    }, [treatments, nutritionLogs, photos, unlockedBadges]);

    useEffect(() => {
        if (streak >= 7) {
            const hasSeen = localStorage.getItem('cc_seen_7day');
            if (!hasSeen) {
                setShowConsistencyModal(true);
            }
        }
    }, [streak]);

    const handleCloseModal = () => {
        localStorage.setItem('cc_seen_7day', 'true');
        setShowConsistencyModal(false);
    };

    return (
        <div className="home" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '1rem', color: 'var(--text-primary)', paddingBottom: '100px' }}>
             <img src={reportsImg} alt="Monthly Growth Dashboard" className="page-header-img" style={{ marginTop: '1rem' }} />
             {/* Application Header-styled Top Bar */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
                 <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--brand-primary)', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-serif)' }}>Monthly Growth Report</h1>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>June 2024</span>
                 </div>
                 <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <User size={20} color="var(--brand-primary)" />
                 </div>
             </div>

            {/* VIRAL LOOP REFERRAL BANNERS */}
            {!isStylistAccount ? (
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Users size={24} color="#60A5FA" />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--brand-primary)', fontWeight: 700 }}>Connect Your Stylist</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Tell your stylist to visit <strong style={{color:'#60A5FA'}}>Crowncare.net/professionals</strong> to download the B2B portal so they can oversee your hair data.
                        </p>
                    </div>
                </div>
            ) : (
                <div 
                    onClick={() => setShowInviteModal(true)}
                    style={{ background: 'var(--gold-light)', border: '1px solid var(--gold-primary)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--brand-primary)', padding: '10px', borderRadius: '50%' }}>
                            <Users size={24} color="var(--gold-primary)" />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--brand-primary)', fontWeight: 700 }}>Invite a Client</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Show your QR code to connect their account.</p>
                        </div>
                    </div>
                    <div style={{ background: 'var(--brand-primary)', color: 'var(--gold-primary)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Scan <ArrowRight size={16} />
                    </div>
                </div>
            )}

            {/* Appointment Notification Banner */}
            <div className="card" style={{ 
                marginBottom: '1.5rem', 
                background: appointments && appointments.length > 0 ? 'var(--gradient-warm)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: appointments && appointments.length > 0 ? '#FFFFFF' : 'var(--brand-primary)' }}>
                        <Clock size={20} color={appointments && appointments.length > 0 ? "#FFFFFF" : "var(--text-tertiary)"} />
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
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <p className="text-sm text-muted" style={{ margin: 0 }}>No appointments scheduled.</p>
                            <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px' }} onClick={() => alert("Appointment request sent to your stylist!")}>
                                {isStylistAccount ? "Invite Clients" : (!stylistCode ? "Connect Stylist" : "Request")} <span style={{ fontSize: '14px' }}>→</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

             {/* Summary Section */}
             <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--brand-primary)' }}>
                    SUMMARY: <span style={{ color: 'var(--success)' }}>+1.68 cm</span>
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Length Gain</div>
                        <div style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', fontWeight: 600 }}>1.68 cm</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Retention Rate</div>
                        <div style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', fontWeight: 600 }}>96.2%</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg. Growth</div>
                        <div style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', fontWeight: 600 }}>+1.2 <span style={{fontSize: '0.75rem', color: 'var(--success)'}}>cm/Mo. ↑</span></div>
                    </div>
                </div>
             </div>

             {/* Monthly Growth Overview Bar Chart (CSS-based) */}
             <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                 <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Monthly Growth Overview</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monthly Length Growth</div>
                 </div>
                 
                 <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', paddingLeft: '30px', paddingBottom: '20px' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)', right: 0 }}>
                        {[2.0, 1.5, 1.0, 0.5, 0.0].map(v => (
                            <div key={v} style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '2px', width: '100%' }}><span style={{position:'absolute', left: 0}}>{v.toFixed(1)}cm</span></div>
                        ))}
                    </div>

                    {/* Bars */}
                    {[
                        { month: 'Jan', val: '0.9cm', height: '45%' },
                        { month: 'Feb', val: '1.1cm', height: '55%' },
                        { month: 'Mar', val: '1.4cm', height: '70%' },
                        { month: 'Apr', val: '1.3cm', height: '65%' },
                        { month: 'May', val: '1.5cm', height: '75%' },
                        { month: 'June', val: '1.68cm', height: '90%', active: true }
                    ].map((data, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14%', zIndex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                            <div style={{ fontSize: '0.7rem', color: data.active ? 'var(--brand-primary)' : 'var(--text-tertiary)', position: 'absolute', top: `calc(100% - ${data.height} - 20px)`, fontWeight: data.active ? 600 : 400 }}>{data.val}</div>
                            <div style={{ 
                                width: '100%', 
                                maxWidth: '28px',
                                height: data.height, 
                                background: data.active ? 'var(--gold-primary)' : 'var(--bg-tertiary)', 
                                border: '1px solid',
                                borderColor: data.active ? 'var(--gold-dark)' : 'transparent',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s ease',
                            }}></div>
                            <div style={{ fontSize: '0.75rem', color: data.active ? 'var(--brand-primary)' : 'var(--text-tertiary)', position: 'absolute', bottom: '-20px', fontWeight: data.active ? 600 : 400 }}>{data.month}</div>
                        </div>
                    ))}
                 </div>
             </div>

             {/* Key Insights (3 horizontal metrics) */}
             <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' }}>
                 <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Key Insights</h3>
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <TrendingUp size={16} color="var(--gold-primary)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hair Retention</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>96.2%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '2px', fontWeight: 600 }}>▲ +0.8%</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <ShieldCheck size={16} color="var(--gold-primary)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Health Score</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>94%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '2px', fontWeight: 600 }}>Optimal</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Salad size={16} color="var(--gold-primary)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tip Quality</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-primary)' }}>Strong</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Maintained</div>
                    </div>
                 </div>
             </div>

             {/* Length Retention Track (Line Graph mockup via CSS styling) */}
             <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                 <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Length Retention Track</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monthly Net Gain (cm)</div>
                 </div>
                 <div style={{ height: '80px', position: 'relative', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                     {/* Fake SVG line representing the chart */}
                     <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40" style={{ position: 'absolute', bottom: 10, left: 0, overflow: 'visible' }}>
                        <path d="M 0 35 Q 20 30, 40 25 T 80 10 Q 90 5, 100 0" fill="none" stroke="url(#navyGrad)" strokeWidth="3" strokeLinecap="round"/>
                        <circle cx="100" cy="0" r="4" fill="var(--gold-primary)" stroke="white" strokeWidth="2" />
                        <defs>
                            <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--bg-tertiary)" />
                                <stop offset="100%" stopColor="var(--brand-primary)" />
                            </linearGradient>
                        </defs>
                     </svg>
                     <div style={{ position: 'absolute', right: 0, top: '-25px', textAlign: 'center' }}>
                         <div style={{ color: 'var(--brand-primary)', fontSize: '0.9rem', fontWeight: 700 }}>1.68 cm</div>
                         <div style={{ color: 'var(--success)', fontSize: '0.65rem' }}>+0.18 cm vs May</div>
                     </div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                     <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span style={{color: 'var(--brand-primary)', fontWeight: 600}}>June</span>
                 </div>
                 <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}><span style={{color: 'var(--text-secondary)', width: '100px'}}>Starting Length:</span> <span style={{fontWeight: 600, color: 'var(--brand-primary)'}}>45.2 cm</span></div>
                     <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}><span style={{color: 'var(--text-secondary)', width: '100px'}}>End Length:</span> <span style={{fontWeight: 600, color: 'var(--brand-primary)'}}>46.88 cm</span></div>
                     <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}><span style={{color: 'var(--text-secondary)', width: '100px'}}>Overall Gain:</span> <span style={{fontWeight: 600, color: 'var(--success)'}}>1.68 cm</span></div>
                 </div>
             </div>

            <BadgeModal badgeId={activeBadge} onClose={() => setActiveBadge(null)} />
            <InviteClientModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
        </div>
    );
}
