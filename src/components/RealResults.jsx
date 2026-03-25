import { ArrowLeft, Sparkles, Calendar, Droplets } from 'lucide-react';
import beforeImg from '../assets/images/before.png';
import afterImg from '../assets/images/after.png';
import './RealResults.css';

export default function RealResults({ setCurrentView }) {
    return (
        <div className="real-results-container">
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <button 
                    onClick={() => setCurrentView('home')} 
                    style={{ background: 'none', border: 'none', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </div>

            <div className="real-results-header">
                <h2>Clinical Results</h2>
                <p>Real women. Science-backed routines. See what consistency can do for your crown.</p>
            </div>

            <div className="case-study-card">
                <div className="case-study-images">
                    <div className="case-image-wrapper">
                        <img src={beforeImg} alt="Before treatment - Month 1" />
                        <span className="image-label">Month 1</span>
                    </div>
                    <div className="case-image-wrapper">
                        <img src={afterImg} alt="After treatment - Month 6" />
                        <span className="image-label">Month 6</span>
                    </div>
                </div>

                <div className="case-study-details">
                    <h3 className="case-study-title">Traction Alopecia Recovery</h3>
                    
                    <div className="case-study-timeline">
                        <Calendar size={14} /> 6 Months Consistent Tracking
                    </div>

                    <p className="case-study-quote">
                        "I thought my edges were gone forever. CrownCare helped me realize I wasn't watering my hair from the inside out. Tracking my hydration and scalp massages changed everything."
                    </p>

                    <div className="case-study-regimen">
                        <h4><Droplets size={16} color="var(--brand-500)" /> The Winning Regimen</h4>
                        <div className="regimen-tags">
                            <span className="regimen-tag">Rosemary Oil Massages</span>
                            <span className="regimen-tag">Minoxidil 5%</span>
                            <span className="regimen-tag">64oz Daily Water</span>
                            <span className="regimen-tag">Silk Bonnet Nightly</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="results-cta">
                <h3>Ready for Your Transition?</h3>
                <p>Start logging your treatments, nutrition, and daily routine to build your custom clinical profile.</p>
                <button 
                    className="btn-luxury"
                    onClick={() => setCurrentView('diary')}>
                    <Sparkles size={18} /> Take My Baseline Photo
                </button>
            </div>
        </div>
    );
}
