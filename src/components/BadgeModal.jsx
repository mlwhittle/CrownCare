import { X, Share2, Award, Zap, Camera } from 'lucide-react';
import './BadgeModal.css';

const BADGE_MAP = {
    hydration_hero: {
        title: 'Hydration Hero',
        icon: Droplets,
        desc: '4 straight Sundays of deep moisture. Your follicles are primed for growth.',
        color: 'var(--sky-500)',
        glow: 'rgba(14, 165, 233, 0.4)'
    },
    internal_architect: {
        title: 'Internal Architect',
        icon: Zap,
        desc: '14 days of hitting your nutrition goals. You are building from the inside out.',
        color: 'var(--gold-500)',
        glow: 'rgba(229, 168, 75, 0.4)'
    },
    scientific_sentry: {
        title: 'Scientific Sentry',
        icon: Camera,
        desc: '4 weeks of clinical data logged. The AI has everything it needs.',
        color: 'var(--brand-500)',
        glow: 'rgba(183, 110, 121, 0.4)'
    }
};

// Re-using the icon map since we can't dynamically import Droplets inside the constant map easily without circular dep logic
import { Droplets } from 'lucide-react';

export default function BadgeModal({ badgeId, onClose }) {
    if (!badgeId || !BADGE_MAP[badgeId]) return null;

    const badge = BADGE_MAP[badgeId];
    const Icon = badge.icon;

    const handleShare = async () => {
        const shareData = {
            title: `I unlocked the ${badge.title} badge!`,
            text: `I'm tracking my hair restoration journey with CrownCare and just hit a major consistency milestone: ${badge.desc}`,
            url: 'https://crowncare.app',
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            alert("Sharing is not supported on this browser context yet.");
        }
    };

    return (
        <div className="badge-modal-overlay">
            <div className="badge-modal-glass" style={{ '--glow-color': badge.glow }}>
                <button className="badge-close" onClick={onClose}>
                    <X size={24} color="white" />
                </button>

                <div className="badge-crown">👑</div>
                
                <div className="badge-icon-container" style={{ color: badge.color }}>
                    <div className="badge-glow-ring"></div>
                    <Icon size={48} />
                </div>

                <div className="badge-content">
                    <span className="badge-eyebrow">You unlocked a new milestone</span>
                    <h2>{badge.title}</h2>
                    <p>{badge.desc}</p>
                </div>

                <button className="btn-share-story" onClick={handleShare}>
                    <Share2 size={18} /> Show the world your routine
                </button>
            </div>
        </div>
    );
}
