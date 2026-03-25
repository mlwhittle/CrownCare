import { useApp } from '../context/AppContext';
import { Crown, Camera, Salad, Pill, Moon, BarChart3, Settings, Sun, MoonStar, Sparkles, BookOpen, Briefcase, LayoutGrid } from 'lucide-react';
import './Header.css';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Crown },
    { id: 'diary', label: 'Visual Diary', icon: Camera },
    { id: 'treatments', label: 'Treatments', icon: Pill },
    { id: 'menu', label: 'Menu', icon: LayoutGrid }
];

export default function Header({ currentView, setCurrentView, openAI }) {
    const { theme, toggleTheme, onboarding, isStylistAccount } = useApp();

    const ACTIVE_NAV_ITEMS = (() => {
        if (currentView === 'stylist-portal') {
            return [
                { id: 'dashboard', label: 'Return to App', icon: Crown }
            ];
        }
        if (isStylistAccount) {
            return [...NAV_ITEMS, { id: 'stylist-portal', label: 'Pro', icon: Briefcase }];
        }
        return NAV_ITEMS;
    })();

    return (
        <>
            {/* Desktop header */}
            <header className="desktop-header">
                <div className="header-brand" onClick={() => setCurrentView('home')}>
                    <Crown size={28} className="brand-icon" />
                    <span className="brand-name">CrownCare</span>
                </div>

                <nav className="header-nav">
                    {ACTIVE_NAV_ITEMS.slice(0, 2).map(item => (
                        <button key={item.id} className={`nav-link ${currentView === item.id ? 'active' : ''}`} onClick={() => setCurrentView(item.id)}>
                            <item.icon size={16} /> {item.label}
                        </button>
                    ))}
                    
                    {/* Glowing AI Hub Action */}
                    <button className="nav-ai-button desktop-ai" onClick={openAI} style={{ margin: '0 16px' }}>
                        <Sparkles size={20} /> <span style={{fontSize: '14px', fontWeight: 'bold', marginLeft: '6px', color: '#12100C'}}>AI Hub</span>
                    </button>
                    
                    {ACTIVE_NAV_ITEMS.slice(2).map(item => (
                        <button key={item.id} className={`nav-link ${currentView === item.id ? 'active' : ''}`} onClick={() => setCurrentView(item.id)}>
                            <item.icon size={16} /> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    {onboarding?.name && <span className="header-greeting">Hey, {onboarding.name}</span>}
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'light' ? <MoonStar size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </header>

            {/* Mobile bottom capsule */}
            <nav className="mobile-tabs">
                <button className={`mobile-tab ${currentView === 'home' || currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('home')}>
                    <Crown size={22} />
                    <span>Home</span>
                </button>
                
                {isStylistAccount ? (
                    <button className={`mobile-tab ${currentView === 'stylist-portal' ? 'active' : ''}`} onClick={() => setCurrentView('stylist-portal')}>
                        <Briefcase size={22} />
                        <span>Portal</span>
                    </button>
                ) : (
                    <button className={`mobile-tab ${currentView === 'diary' ? 'active' : ''}`} onClick={() => setCurrentView('diary')}>
                        <Camera size={22} />
                        <span>Diary</span>
                    </button>
                )}
                
                {/* Floating AI Action Hub Hub */}
                <button className="nav-ai-button" onClick={openAI}>
                    <Sparkles size={24} />
                </button>
                
                <button className={`mobile-tab ${currentView === 'treatments' ? 'active' : ''}`} onClick={() => setCurrentView('treatments')}>
                    <Pill size={22} />
                    <span>Treatments</span>
                </button>
                
                <button className={`mobile-tab ${currentView === 'menu' ? 'active' : ''}`} onClick={() => setCurrentView('menu')}>
                    <LayoutGrid size={22} />
                    <span>Menu</span>
                </button>
            </nav>
        </>
    );
}
