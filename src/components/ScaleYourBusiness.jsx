import { X, Briefcase, Users, FileText, Zap, DollarSign, Sparkles } from 'lucide-react';
import './Settings.css';

export default function ScaleYourBusiness({ onClose }) {
    return (
        <div className="settings" style={{ paddingBottom: '100px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2 className="gradient-text" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px' }}>
                    <Briefcase size={22} /> Grow Your Business
                </h2>
                <button className="btn btn-outline" style={{ padding: '8px', border: 'none' }} onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            {/* TikTok & Instagram Content Kit CTA */}
            <div className="card mb-lg" style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                border: '2px solid #d4af37',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-xl)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 'var(--space-xl)'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, #d4af37, #f5e6a3, #d4af37)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-md)' }}>
                    <Sparkles size={22} color="#d4af37" />
                    <h3 style={{ margin: 0, color: '#f5e6a3', fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>
                        TikTok & Instagram Content Kit
                    </h3>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                    Done-for-you social media templates, captions, hashtags, and viral content strategies designed specifically for hair stylists. Start posting like a pro today.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <div>
                        <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#d4af37' }}>$69.99</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>one-time</span>
                    </div>
                    <button
                        onClick={() => window.open('https://buy.stripe.com/8x228sfZl2Ci4Kn07kfUQ09', '_blank')}
                        style={{
                            background: 'linear-gradient(135deg, #d4af37, #f5e6a3)',
                            color: '#1a1a2e',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.4)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
                    >
                        Get the Kit →
                    </button>
                </div>
            </div>

            <div className="card mb-lg" style={{ border: '2px solid var(--brand-400)', background: 'var(--bg-tertiary)' }}>
                <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', lineHeight: 1.6 }}>
                    As a CrownCare Partner, you have access to the B2B Stylist Portal. This dashboard is your advanced client management and retention tool.
                </p>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        <Users size={18} style={{ color: 'var(--brand-500)' }} /> 1. Inviting Clients & Stylists
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                        Inside your portal, you have a unique QR Code. Show this code to all your clients. When they sign up for CrownCare, they are permanently linked to your profile allowing you to track their progress and securely monitor their hair retention.
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Check your email inbox or log into the Stylist Web Portal on your computer to view your advanced partner benefits, VIP resources, and community perks.
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        <FileText size={18} style={{ color: 'var(--success)' }} /> 2. The Client Rolodex
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Navigate to your Stylist Dashboard to view a list of all your linked clients. Next to each client's name, you will see a Consistency Score (0-100) and an Adherence Tier (Seedling, Sprout, Royal Growth).
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', fontStyle: 'italic', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                        <strong>Tip:</strong> If a client's score drops below 40, they aren't following your routine at home. Bring this up at their next salon visit!
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        <Zap size={18} style={{ color: 'var(--gold-500)' }} /> 3. Prescribing Custom Protocols
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Instead of writing down instructions on a sticky note when your client leaves the chair, type their exact routine directly into their CrownCare profile. It immediately alerts their phone. They log their activity daily, and you can see a read-out of exactly what they did (or didn't do) before they sit back in your chair 6 weeks later.
                    </p>
                </div>
            </div>
        </div>
    );
}
