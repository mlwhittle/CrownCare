import { useApp } from '../context/AppContext';
import { Crown, Camera, Salad, Pill, Moon, BarChart3, Settings, Sun, MoonStar, Sparkles } from 'lucide-react';
import './Header.css';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Crown },
    { id: 'diary', label: 'Diary', icon: Camera },
    { id: 'nutrition', label: 'Nutrition', icon: Salad },
    { id: 'treatments', label: 'Treatments', icon: Pill },
    { id: 'routines', label: 'Routines', icon: Moon },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Header({ currentView, setCurrentView }) {
    const { theme, toggleTheme, onboarding } = useApp();

    return (
        <>
            {/* Desktop header */}
            <header className="desktop-header">
                <div className="header-brand" onClick={() => setCurrentView('home')}>
                    <Crown size={28} className="brand-icon" />
                    <span className="brand-name">CrownCare</span>
                </div>

                <nav className="header-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    {onboarding?.name && (
                        <span className="header-greeting">Hey, {onboarding.name} ✨</span>
                    )}
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'light' ? <MoonStar size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        className={`nav-link btn-sm ${currentView === 'settings' ? 'active' : ''}`}
                        onClick={() => setCurrentView('settings')}
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </header>

            {/* Mobile bottom tabs */}
            <nav className="mobile-tabs">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`mobile-tab ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentView(item.id)}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </>
    );
}
