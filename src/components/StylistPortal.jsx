import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, DollarSign, Activity, ClipboardList, PenTool, TrendingUp, CheckCircle2, ChevronRight, AlertCircle, Sparkles, Calendar, FileText, ArrowLeft, Pill, BarChart3, ExternalLink, Camera } from 'lucide-react';
import Reports from './Reports';
import MonthlyGrowthReport from './MonthlyGrowthReport';
import MonthlyNarrative from './MonthlyNarrative';
import StripeService from '../services/StripeService';
import InviteClientModal from './InviteClientModal';
import { Capacitor } from '@capacitor/core';

export default function StylistPortal() {
    const { stylistDashboardData, updateStylistDashboard, linkedClients, isStylistAccount, addAppointment, appointments, stylistContact, setStylistContact, clientContacts, updateClientContact, sharedAudits } = useApp();
    const [tab, setTab] = useState('hub'); // hub, roster, pad, calendar
    const [profileTab, setProfileTab] = useState('activity'); // activity, reports, narrative
    const [selectedClient, setSelectedClient] = useState('');
    const [rxProduct, setRxProduct] = useState('');
    const [rxFrequency, setRxFrequency] = useState('');
    const [rxNotes, setRxNotes] = useState('');
    
    // Appointment State
    const [apptDate, setApptDate] = useState('');
    const [apptTime, setApptTime] = useState('');
    const [apptNotes, setApptNotes] = useState('');
    
    const [isStripeLoading, setIsStripeLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    if (!isStylistAccount) {
        return (
            <div className="card text-center" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
                <h3>Professional Access Only</h3>
                <p className="text-muted mb-md">You must enable Stylist B2B Mode in Settings to view this portal.</p>
            </div>
        );
    }

    const handleSendProtocol = () => {
        if (!selectedClient || !rxProduct) return;
        alert(`Protocol explicitly sent to client ID: ${selectedClient}! They will see this in their Stylist Protocol tab immediately.`);
        setRxProduct('');
        setRxFrequency('');
        setRxNotes('');
        setSelectedClient('');
        setTab('roster');
    };

    const handleSetAppointment = () => {
        if (!selectedClient || !apptDate || !apptTime) return;
        
        const linkedClient = linkedClients.find(c => c.id === selectedClient);
        
        // Save the appointment to context so it appears on the client's home/dashboard
        addAppointment({
            date: `${apptDate}T${apptTime}`,
            stylistName: 'Your CrownCare Stylist', // In a real app, this would be the logged in stylist's name
            notes: apptNotes,
            clientId: selectedClient,
            clientName: linkedClient ? linkedClient.name : 'Unknown Client'
        });
        
        alert(`Appointment successfully set for client ID: ${selectedClient} on ${apptDate} at ${apptTime}!`);
        setApptDate('');
        setApptTime('');
        setApptNotes('');
        setProfileTab('activity');
    };

    const handleStripeOnboard = async () => {
        try {
            setIsStripeLoading(true);
            let accountId = stylistDashboardData.stripeAccountId;
            
            if (!accountId) {
                accountId = await StripeService.createConnectAccount();
                updateStylistDashboard({ stripeAccountId: accountId });
            }

            const url = await StripeService.createOnboardingLink(accountId);
            // In a real app we redirect to actual stripe URL:
            // window.location.href = url;
            
            // For safety in this environment, open in new tab or mock. 
            // The Firebase emulator returns an https://connect.stripe.com/setup/s/ URL.
            if (!Capacitor.isNativePlatform()) {
                window.open(url, '_blank'); 
            }
            
            // Mocking success locally so the banner goes away
            setTimeout(() => {
                updateStylistDashboard({ isStripeOnboarded: true });
            }, 3000);
            
        } catch (error) {
            console.error(error);
            alert("Failed to connect to payment system. Please try again.");
        } finally {
            setIsStripeLoading(false);
        }
    };

    const renderHub = () => (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
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
                    Scan QR <ChevronRight size={16} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div className="card-glass text-center" style={{ padding: 'var(--space-md)', border: '1px solid var(--border-color)', borderRadius: '24px', background: 'var(--bg-secondary)' }}>
                    <Calendar size={24} style={{ color: 'var(--brand-primary)', margin: '0 auto var(--space-xs)' }} />
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{appointments.length}</h2>
                    <p className="text-xs text-muted" style={{ fontWeight: 600 }}>Appointments</p>
                </div>
                <div className="card-glass text-center" style={{ padding: 'var(--space-md)', border: '1px solid var(--border-color)', borderRadius: '24px', background: 'var(--bg-secondary)' }}>
                    <Users size={24} style={{ color: 'var(--brand-500)', margin: '0 auto var(--space-xs)' }} />
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{linkedClients.length}</h2>
                    <p className="text-xs text-muted" style={{ fontWeight: 600 }}>Active Clients</p>
                </div>
            </div>

            {/* Stripe Onboarding UI Removed Entirely */}

            <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>Client Facing Profile</h3>
            <div className="card mb-lg">
                <p className="text-sm text-muted mb-md">This contact information will appear on your clients' appointment reminders.</p>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Display Name / Salon Name</label>
                    <input className="form-input" placeholder="e.g. Sarah at Studio 54" value={stylistContact.name} onChange={e => setStylistContact({...stylistContact, name: e.target.value})} />
                </div>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Business Phone</label>
                    <input className="form-input" placeholder="(555) 123-4567" value={stylistContact.phone} onChange={e => setStylistContact({...stylistContact, phone: e.target.value})} />
                </div>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Business Email</label>
                    <input className="form-input" type="email" placeholder="sarah@studio54.com" value={stylistContact.email} onChange={e => setStylistContact({...stylistContact, email: e.target.value})} />
                </div>
                <button className="btn btn-sm btn-outline" style={{ marginTop: '8px' }} onClick={() => alert("Profile updated!")}>Save Profile</button>
            </div>

            <h3 style={{ marginBottom: 'var(--space-md)' }}>Recent Activity</h3>
            <div className="card-glass" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
                {linkedClients.slice(0,3).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px var(--space-lg)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                        <div>
                            <strong style={{ display: 'block', fontSize: 'var(--font-size-sm)' }}>{c.name}</strong>
                            <span className="text-xs text-muted" style={{ display: 'block', marginTop: '4px' }}>Logged a treatment</span>
                        </div>
                        <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Today</span>
                    </div>
                ))}
            </div>

            <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>Today's Appointments</h3>
            <div className="card-glass" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
                {(() => {
                    const todayStr = new Date().toDateString();
                    const todaysAppts = appointments.filter(appt => new Date(appt.date).toDateString() === todayStr);
                    
                    if (todaysAppts.length === 0) {
                        return <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled for today.</div>;
                    }

                    return todaysAppts.map((appt, idx) => (
                        <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px var(--space-lg)', borderBottom: idx !== todaysAppts.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center' }}>
                            <div>
                                <button className="btn btn-outline" style={{ display: 'block', fontSize: 'var(--font-size-sm)', background: 'transparent', border: 'none', padding: 0, margin: 0, color: 'var(--brand-primary)', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left', fontWeight: 700 }} onClick={() => {
                                    if(appt.clientId) {
                                        setSelectedClient(appt.clientId);
                                        setTab('profile');
                                    }
                                }}>{appt.clientName || 'Unknown Client'}</button>
                                <span className="text-xs text-muted" style={{ display: 'block', marginTop: '4px' }}>{appt.notes || 'CrownCare Consultation'}</span>
                            </div>
                            <span style={{ fontWeight: 800, background: 'var(--gold-50)', color: 'var(--gold-primary)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px' }}>
                                {new Date(appt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    ));
                })()}
            </div>
        </div>
    );

    const renderRoster = () => (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h3>My Clients ({linkedClients.length})</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {linkedClients.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                        <Users size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-sm)' }} />
                        <p className="text-muted">No clients connected yet. Invite a client with your CrownCare code to begin.</p>
                    </div>
                ) : (
                    linkedClients.map((client) => (
                        <div key={client.id} className="card-glass" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{client.name}</strong>
                                    {client.consistencyScore < 50 && <AlertCircle size={14} style={{ color: 'var(--error)' }} />}
                                </div>
                                <span className={`badge ${client.tier === 'Royal Growth' ? 'badge-gold' : client.tier === 'Sprout' ? 'badge-sky' : 'badge-danger'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                                    {client.tier} (Score: {client.consistencyScore})
                                </span>
                                
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success-light)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        <Activity size={10} /> BIO SYNC
                                    </div>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212, 175, 55, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                        <Sparkles size={10} /> AUDIT: 86
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)', borderRadius: '12px', fontWeight: 700 }} onClick={() => {
                                setSelectedClient(client.id);
                                setTab('profile');
                            }}>
                                Profile <ChevronRight size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderClientProfile = () => {
        const client = linkedClients.find(c => c.id === selectedClient);
        if (!client) return null;

        return (
            <div style={{ animation: 'fadeIn 0.2s ease-out', maxWidth: '100%' }}>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-md)', padding: '6px 12px', border: 'none', background: 'transparent' }} onClick={() => setTab('roster')}>
                    <ArrowLeft size={16} /> Back to Roster
                </button>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <div>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {client.name}
                            <span className={`badge ${client.tier === 'Royal Growth' ? 'badge-gold' : client.tier === 'Sprout' ? 'badge-sky' : 'badge-danger'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                {client.tier} (Score: {client.consistencyScore})
                            </span>
                        </h2>
                        {client.hairType && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Hair Type: {client.hairType}</span>
                                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Porosity: {client.porosity}</span>
                                <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--gold-400)', border: '1px solid var(--gold-600)' }}>Concern: {client.concern}</span>
                            </div>
                        )}
                    </div>
                </div>

                {client.consentStatus ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                            <div className="card-glass" style={{ padding: '8px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-primary)' }}>{client.clinicalAnalytics?.totalTrackingDays || 0}d</div>
                            </div>
                            <div className="card-glass" style={{ padding: '8px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Streak</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-primary)' }}>{client.clinicalAnalytics?.currentStreak || 0}</div>
                            </div>
                            <div className="card-glass" style={{ padding: '8px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Routine</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-primary)' }}>{client.clinicalAnalytics?.routineCompliance || 0}%</div>
                            </div>
                            <div className="card-glass" style={{ padding: '8px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visuals</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-primary)' }}>{client.clinicalAnalytics?.progressPhotoVideoEngagement || 0}</div>
                            </div>
                            <div className="card-glass" style={{ padding: '12px', borderRadius: '12px', gridColumn: '1 / -1', textAlign: 'left', marginTop: '4px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Recent Engagement</div>
                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Recent Treatments</span>
                                        <strong>{client.clinicalAnalytics?.recentTreatments?.length || 0} logged</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Latest Nutrition</span>
                                        <strong>{client.clinicalAnalytics?.latestNutritionLog ? new Date(client.clinicalAnalytics.latestNutritionLog.date).toLocaleDateString() : 'None'}</strong>
                                    </div>
                                    {client.consentStatus && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Latest Journal</span>
                                        <strong>{client.clinicalAnalytics?.latestJournalEntry ? new Date(client.clinicalAnalytics.latestJournalEntry.date).toLocaleDateString() : 'None'}</strong>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)', paddingBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <ChevronRight size={10} /> Swipe tabs to explore
                        </div>

                        <div className="tracker-tabs" style={{ width: '100%', display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: '4px', marginBottom: 'var(--space-lg)', marginTop: 'var(--space-xs)', paddingBottom: '4px' }}>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'activity' ? 'active' : ''}`} onClick={() => setProfileTab('activity')}>Activity</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'visuals' ? 'active' : ''}`} onClick={() => setProfileTab('visuals')}><Camera size={14} style={{ marginRight: '4px' }}/> Visuals</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'audits' ? 'active' : ''}`} onClick={() => setProfileTab('audits')}><Sparkles size={14} style={{ marginRight: '4px' }}/> Scans</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'products' ? 'active' : ''}`} onClick={() => setProfileTab('products')}>Products</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'routines' ? 'active' : ''}`} onClick={() => setProfileTab('routines')}>Routines</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'nutrition' ? 'active' : ''}`} onClick={() => setProfileTab('nutrition')}>Nutrition</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'journal' ? 'active' : ''}`} onClick={() => setProfileTab('journal')}>Journal</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'reports' ? 'active' : ''}`} onClick={() => setProfileTab('reports')}>Reports</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'narrative' ? 'active' : ''}`} onClick={() => setProfileTab('narrative')}>Narrative</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'appointment' ? 'active' : ''}`} onClick={() => setProfileTab('appointment')}><Calendar size={14} style={{ marginRight: '4px' }}/> Appt</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'contact' ? 'active' : ''}`} onClick={() => setProfileTab('contact')}><ClipboardList size={14} style={{ marginRight: '4px' }}/> Rolodex</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${tab === 'pad' ? 'active' : ''}`} onClick={() => setTab('pad')}><PenTool size={14} style={{ marginRight: '4px' }}/> Protocol</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="card-glass" style={{ padding: 'var(--space-lg)', textAlign: 'center', marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Client Journey is Private</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                This client has not granted permission to share their CrownCare journey data. 
                                You can still view basic connection or appointment information that does not expose private journey details.
                            </p>
                        </div>
                        <div className="tracker-tabs" style={{ width: '100%', display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: '4px', marginBottom: 'var(--space-lg)' }}>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'appointment' ? 'active' : ''}`} onClick={() => setProfileTab('appointment')}><Calendar size={14} style={{ marginRight: '4px' }}/> Appt</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${profileTab === 'contact' ? 'active' : ''}`} onClick={() => setProfileTab('contact')}><ClipboardList size={14} style={{ marginRight: '4px' }}/> Rolodex</button>
                            <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '10px 16px' }} className={`tt ${tab === 'pad' ? 'active' : ''}`} onClick={() => setTab('pad')}><PenTool size={14} style={{ marginRight: '4px' }}/> Protocol</button>
                        </div>
                    </>
                )}

                {profileTab === 'activity' && (
                    <div className="card-glass" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
                        {client.activity && client.activity.length > 0 ? (
                            client.activity.map((item, idx) => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px var(--space-lg)', borderBottom: idx !== client.activity.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                    <div style={{ 
                                        background: item.type === 'treatment' ? 'var(--brand-50)' : item.type === 'journal' ? 'var(--bg-secondary)' : 'var(--gold-50)', 
                                        padding: '8px', borderRadius: '50%', color: item.type === 'treatment' ? 'var(--brand-500)' : item.type === 'journal' ? 'var(--text-secondary)' : 'var(--gold-600)' 
                                    }}>
                                        {item.type === 'treatment' && <Pill size={16} />}
                                        {item.type === 'routine' && <CheckCircle2 size={16} />}
                                        {item.type === 'journal' && <FileText size={16} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.description}</div>
                                        {item.tags && item.tags.length > 0 && (
                                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                                {item.tags.map(tag => (
                                                    <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', border: '1px solid var(--error)', borderRadius: '4px', fontWeight: 600 }}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                            <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity.</div>
                        )}
                    </div>
                )}

                {profileTab === 'reports' && (
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <MonthlyGrowthReport clientName={client.name} />
                    </div>
                )}

                {profileTab === 'visuals' && (
                    <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Visual Clinical Diary</h3>
                        {client.recentPhotos && client.recentPhotos.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
                                {client.recentPhotos.map(photo => (
                                    <div key={photo.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1/1', border: '1px solid var(--border-color)' }}>
                                        <img src={photo.imageData} alt="Client Log" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '16px 8px 6px', fontSize: '11px', color: 'white', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                            <span>{photo.zone}</span>
                                            <span style={{ color: 'var(--gold-400)' }}>{new Date(photo.date).toLocaleDateString()}</span>
                                        </div>
                                        {(photo.notes || photo.linkedAiResult) && (
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px', fontSize: '10px', color: 'white' }}>
                                                {photo.notes && <div style={{ marginBottom: '2px', fontStyle: 'italic' }}>{photo.notes}</div>}
                                                {photo.linkedAiResult && <div style={{ color: 'var(--gold-400)', fontWeight: 'bold' }}>✦ AI Scanned</div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No clinical imagery uploaded yet.</div>
                        )}
                    </div>
                )}
                
                {profileTab === 'audits' && (
                    <div style={{ marginTop: 'var(--space-lg)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>AI Scalp Scans</h3>
                        {(() => {
                            const audits = sharedAudits.filter(a => a.clientId === client.id);
                            if (audits.length === 0) return <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No AI audits manually shared by client yet.</div>;
                            return audits.map(audit => (
                                <div key={audit.id} className="card" style={{ marginBottom: 'var(--space-md)', border: '1px solid var(--gold-600)', background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.05), transparent)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FCD34D', fontWeight: 'bold' }}><Sparkles size={16} /> Shared Vision Audit</div>
                                        <div style={{ fontSize: '11px', color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>{new Date(audit.date).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        <img src={audit.photoData} style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} alt="Client Scalp" />
                                        <div style={{ flex: 1, minWidth: '200px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: audit.result.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FCD34D">$1</strong>') }} />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                {profileTab === 'narrative' && client.consentStatus && (
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <MonthlyNarrative isStylistView={true} mockedClientData={client} />
                    </div>
                )}

                {profileTab === 'products' && client.consentStatus && (
                    <div style={{ marginTop: 'var(--space-lg)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Product Label Scans</h3>
                        {client.productScans && client.productScans.length > 0 ? (
                            client.productScans.map(scan => (
                                <div key={scan.id} className="card-glass" style={{ padding: '16px', marginBottom: '12px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                                    <div style={{ fontWeight: 700 }}>{scan.productName || 'Unknown Product'}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(scan.date).toLocaleDateString()}</div>
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{scan.analysisResult || 'No analysis available.'}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No product label scans have been saved yet.</div>
                        )}
                    </div>
                )}

                {profileTab === 'routines' && client.consentStatus && (
                    <div style={{ marginTop: 'var(--space-lg)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Routine Logs</h3>
                        {client.routines && client.routines.length > 0 ? (
                            client.routines.map(routine => (
                                <div key={routine.id} className="card-glass" style={{ padding: '16px', marginBottom: '12px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 700 }}>{routine.name || routine.type || 'Routine Log'}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 700 }}>{new Date(routine.date).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {routine.greenhouseEffect && <span className="badge" style={{ fontSize: '10px', background: 'var(--success-light)', color: 'var(--success)' }}>Greenhouse Effect</span>}
                                        {routine.inversionMethod && <span className="badge" style={{ fontSize: '10px', background: 'var(--brand-50)', color: 'var(--brand-600)' }}>Inversion Method</span>}
                                        {routine.bedtimeRoutine && <span className="badge" style={{ fontSize: '10px', background: 'var(--gold-50)', color: 'var(--gold-600)' }}>Bedtime Prep</span>}
                                        {routine.scalpMassage && <span className="badge" style={{ fontSize: '10px', background: '#F3E8FF', color: '#7E22CE' }}>Scalp Massage</span>}
                                    </div>
                                    {routine.notes && (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{routine.notes}"</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No routine logs available.</div>
                        )}
                    </div>
                )}

                {profileTab === 'nutrition' && client.consentStatus && (
                    <div style={{ marginTop: 'var(--space-lg)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Nutrition Logs</h3>
                        {client.nutritionLogs && client.nutritionLogs.length > 0 ? (
                            client.nutritionLogs.map(log => (
                                <div key={log.id} className="card-glass" style={{ padding: '16px', marginBottom: '12px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 700 }}>Daily Intake Log</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Protein:</span> <strong>{log.protein || 0}g</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Water:</span> <strong>{log.water || 0}oz</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Biotin:</span> <strong>{log.biotin ? 'Yes' : 'No'}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Omegas:</span> <strong>{log.omegas ? 'Yes' : 'No'}</strong></div>
                                    </div>
                                    {log.notes && (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Notes: {log.notes}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No nutrition logs available.</div>
                        )}
                    </div>
                )}

                {profileTab === 'journal' && client.consentStatus && (
                    <div style={{ marginTop: 'var(--space-lg)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Journal Entries</h3>
                        {client.journalEntries && client.journalEntries.length > 0 ? (
                            client.journalEntries.map(entry => (
                                <div key={entry.id} className="card-glass" style={{ padding: '16px', marginBottom: '12px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{new Date(entry.date).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>"{entry.text}"</div>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                            {entry.tags.map(tag => (
                                                <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '4px' }}>#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No journal entries available.</div>
                        )}
                    </div>
                )}

                {profileTab === 'appointment' && (
                    <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Schedule Appointment</h3>
                        <p className="text-muted text-sm mb-lg">Set an appointment date and time. This will notify the client on their dashboard.</p>
                        
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Date</label>
                            <input type="date" className="form-input" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} value={apptDate} onChange={e => setApptDate(e.target.value)} />
                        </div>
                        
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Time</label>
                            <input type="time" className="form-input" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} value={apptTime} onChange={e => setApptTime(e.target.value)} />
                        </div>
                        
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Notes (Optional)</label>
                            <textarea className="form-input" rows="2" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} placeholder="e.g. Silk press and trim" value={apptNotes} onChange={e => setApptNotes(e.target.value)}></textarea>
                        </div>
                        
                        <button className="btn btn-primary" style={{ width: '100%', maxWidth: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxSizing: 'border-box' }} onClick={handleSetAppointment} disabled={!apptDate || !apptTime}>
                            <Calendar size={16} /> Confirm Appointment
                        </button>
                    </div>
                )}

                {profileTab === 'contact' && (
                    <div className="card" style={{ marginTop: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: 'var(--error)', color: 'white', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', borderBottomLeftRadius: 'var(--radius-md)', opacity: 0.8 }}>Private</div>
                        <h3 style={{ marginBottom: '4px' }}>Private Rolodex</h3>
                        <p className="text-muted text-sm mb-lg" style={{ paddingRight: '40px' }}>This information is saved locally to your device and is completely hidden from the client's app.</p>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Phone Number</label>
                            <input type="tel" className="form-input" placeholder="(555) 123-4567" value={clientContacts?.[client.id]?.phone || ''} onChange={e => updateClientContact(client.id, { phone: e.target.value })} />
                        </div>
                        
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Email Address</label>
                            <input type="email" className="form-input" placeholder="client@email.com" value={clientContacts?.[client.id]?.email || ''} onChange={e => updateClientContact(client.id, { email: e.target.value })} />
                        </div>
                        
                        <div style={{ marginBottom: 'var(--space-sm)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Stylist Notes</label>
                            <textarea className="form-input" rows="4" placeholder="e.g. Always 15 minutes late, prefers green tea, allergic to coconut oil." value={clientContacts?.[client.id]?.notes || ''} onChange={e => updateClientContact(client.id, { notes: e.target.value })}></textarea>
                        </div>
                        <div className="text-xs text-muted" style={{ marginBottom: 'var(--space-lg)', textAlign: 'right' }}>
                            ✓ Auto-saves to your local portal cache
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPad = () => (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {selectedClient && (
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-md)', padding: '6px 12px', border: 'none', background: 'transparent' }} onClick={() => setTab('profile')}>
                    <ArrowLeft size={16} /> Back to {linkedClients.find(c => c.id === selectedClient)?.name.split(' ')[0]}'s Profile
                </button>
            )}

            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Digital Protocol Pad</h3>
            <p className="text-muted text-sm mb-lg">Send targeted regimens directly to your client's app. They will see it in their 'Stylist Protocol' tab.</p>

            <div className="card">
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Select Client</label>
                    <select className="form-input" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                        <option value="">-- Choose Client --</option>
                        {linkedClients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Action & Product</label>
                    <input className="form-input" placeholder="e.g. Protein Treatment - Aphogee Two-Step" value={rxProduct} onChange={e => setRxProduct(e.target.value)} />
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Frequency</label>
                    <input className="form-input" placeholder="e.g. Every 6 weeks" value={rxFrequency} onChange={e => setRxFrequency(e.target.value)} />
                </div>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Stylist Notes</label>
                    <textarea className="form-input" rows="3" placeholder="e.g. Sit under a warm dryer for 15 minutes before rinsing!" value={rxNotes} onChange={e => setRxNotes(e.target.value)}></textarea>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={handleSendProtocol} disabled={!selectedClient || !rxProduct}>
                    <Sparkles size={16} /> Send to Client App
                </button>
            </div>
        </div>
    );

    const renderCalendar = () => (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>My Schedule</h3>
            
            {appointments && appointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {appointments.map(appt => (
                        <div key={appt.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: 'var(--space-md)' }}>
                            <div style={{ background: 'var(--gold-50)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--gold-600)', textAlign: 'center', minWidth: '60px' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{new Date(appt.date).getDate()}</div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>{new Date(appt.date).toLocaleDateString(undefined, { month: 'short' })}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '1.1rem' }}>Client Appointment</strong>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} /> 
                                    {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'long' })} at {new Date(appt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </div>
                                {appt.notes && (
                                    <div style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontStyle: 'italic', borderLeft: '2px solid var(--border-color)' }}>
                                        "{appt.notes}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                    <Calendar size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-sm)' }} />
                    <p className="text-muted">No appointments scheduled.</p>
                </div>
            )}
        </div>
    );

    const renderGlobalReports = () => {
        // Aggregation logic
        let clientsImproved = 0;
        let clientsAtRisk = 0;
        let totalCompliance = 0;
        let totalTrackingDays = 0;
        let highestStreak = 0;
        
        let rebookingOpps = [];
        let productOpps = [];
        let aiScanAlerts = [];

        linkedClients.forEach(client => {
            const score = client.consistencyScore || 0;
            if (score > 70) clientsImproved++;
            else if (score < 40) clientsAtRisk++;

            totalCompliance += score;
            
            const activity = client.activity || [];
            totalTrackingDays += activity.length;
            
            // Calculate a mock streak based on recent activity frequency
            const currentStreak = Math.floor(score / 10);
            if (currentStreak > highestStreak) highestStreak = currentStreak;

            // Rebooking Opportunity: No activity in last 14 days
            if (activity.length === 0) {
                rebookingOpps.push(client);
            } else {
                const lastDate = new Date(activity[0].date);
                const diffDays = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
                if (diffDays > 14) rebookingOpps.push(client);
            }

            // Product Opportunity: Routines high, but no products tracked
            const hasProducts = activity.some(a => a.type === 'product');
            const hasRoutines = activity.some(a => a.type === 'routine');
            if (hasRoutines && !hasProducts) productOpps.push(client);

            // AI Scan Alerts: High Shedding or specific tags
            if (client.consentStatus !== false) {
                const scans = activity.filter(a => a.type === 'audit');
                scans.forEach(scan => {
                    if (scan.score < 60) {
                        aiScanAlerts.push({ client, scan });
                    }
                });
            }
        });

        const avgCompliance = linkedClients.length > 0 ? Math.round(totalCompliance / linkedClients.length) : 0;

        return (
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Global Practice Reports</h3>
                
                {/* Top Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                    <div className="card-glass" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                        <TrendingUp size={24} style={{ color: 'var(--success)', margin: '0 auto var(--space-xs)' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{clientsImproved}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clients Improved</div>
                    </div>
                    <div className="card-glass" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                        <AlertCircle size={24} style={{ color: 'var(--error)', margin: '0 auto var(--space-xs)' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{clientsAtRisk}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clients At Risk</div>
                    </div>
                    <div className="card-glass" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                        <CheckCircle2 size={24} style={{ color: 'var(--brand-primary)', margin: '0 auto var(--space-xs)' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{avgCompliance}%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Compliance</div>
                    </div>
                    <div className="card-glass" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                        <Activity size={24} style={{ color: 'var(--gold-primary)', margin: '0 auto var(--space-xs)' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalTrackingDays}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Tracking Days</div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)', color: 'var(--gold-700)' }}>
                        <AlertCircle size={18} /> Rebooking Opportunities
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                        Clients whose last tracked activity was over 14 days ago. Perfect time for a check-in!
                    </p>
                    {rebookingOpps.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {rebookingOpps.map(c => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                    <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                                    <button className="btn btn-sm btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedClient(c.id); setTab('profile'); }}>View Profile</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '8px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>All clients are highly engaged!</div>
                    )}
                </div>

                <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)', color: 'var(--brand-600)' }}>
                        <Sparkles size={18} /> Product Opportunities
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                        Clients logging routines but missing product tracking. Great opportunity to prescribe salon products via Protocol Pad.
                    </p>
                    {productOpps.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {productOpps.map(c => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                    <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                                    <button className="btn btn-sm btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedClient(c.id); setTab('pad'); setRxProduct('Recommended Product'); }}>Prescribe</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '8px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No current product opportunities.</div>
                    )}
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)', color: 'var(--error)' }}>
                        <Activity size={18} /> AI Scan Alerts
                    </h4>
                    {aiScanAlerts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {aiScanAlerts.map((alert, idx) => (
                                <div key={idx} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <strong style={{ fontSize: '0.9rem' }}>{alert.client.name}</strong>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--error)' }}>Score: {alert.scan.score}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{alert.scan.description}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '8px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No critical clinical alerts across roster.</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="stylist-portal" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <h2 className="gradient-text mb-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={24} style={{ color: 'var(--brand-500)' }} /> Stylist Hub
            </h2>
            <p className="text-muted text-sm mb-lg">Manage your client business and bespoke protocols.</p>

            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', paddingBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <ChevronRight size={10} /> Swipe tabs to explore
            </div>

            <div className="tracker-tabs" style={{ width: '100%', display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: '4px', marginBottom: 'var(--space-lg)', paddingBottom: '4px' }}>
                <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '12px 16px' }} className={`tt ${tab === 'hub' ? 'active' : ''}`} onClick={() => setTab('hub')}><Activity size={16} /> Hub</button>
                <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '12px 16px' }} className={`tt ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}><Calendar size={16} /> Calendar</button>
                <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '12px 16px' }} className={`tt ${tab === 'roster' ? 'active' : ''}`} onClick={() => setTab('roster')}><Users size={16} /> Client Roster</button>
                <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '12px 16px' }} className={`tt ${tab === 'pad' ? 'active' : ''}`} onClick={() => setTab('pad')}><PenTool size={16} /> Protocol Pad</button>
                <button style={{ flex: '1 0 auto', minWidth: 'max-content', padding: '12px 16px' }} className={`tt ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}><BarChart3 size={16} /> Reports</button>
            </div>

            {tab === 'hub' && renderHub()}
            {tab === 'calendar' && renderCalendar()}
            {tab === 'roster' && renderRoster()}
            {tab === 'profile' && renderClientProfile()}
            {tab === 'pad' && renderPad()}
            {tab === 'reports' && renderGlobalReports()}
            <InviteClientModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
        </div>
    );
}
