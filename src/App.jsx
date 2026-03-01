import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Home from './components/Home';
import AICoach from './components/AICoach';
import VisualDiary from './components/VisualDiary';
import NutritionPlanner from './components/NutritionPlanner';
import TreatmentTracker from './components/TreatmentTracker';
import LifestyleRoutines from './components/LifestyleRoutines';
import Settings from './components/Settings';
import OnboardingQuiz from './components/OnboardingQuiz';
import { Sparkles } from 'lucide-react';

function AppInner() {
    const { onboarding, completeOnboarding } = useApp();
    const [currentView, setCurrentView] = useState('home');
    const [showAI, setShowAI] = useState(false);

    // If no onboarding, show quiz
    if (!onboarding) {
        return <OnboardingQuiz onComplete={completeOnboarding} />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'home': return <Home setCurrentView={setCurrentView} openAI={() => setShowAI(true)} />;
            case 'diary': return <VisualDiary />;
            case 'nutrition': return <NutritionPlanner />;
            case 'treatments': return <TreatmentTracker />;
            case 'routines': return <LifestyleRoutines />;
            case 'settings': return <Settings />;
            default: return <Home setCurrentView={setCurrentView} openAI={() => setShowAI(true)} />;
        }
    };

    return (
        <div className="app">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            <main className="main-content">
                {renderView()}
            </main>

            {/* Floating AI Button */}
            <button className="fab" onClick={() => setShowAI(true)} title="Ask AI Hair Coach">
                <Sparkles size={24} />
            </button>

            {/* AI Overlay */}
            {showAI && (
                <AICoach isOverlay onClose={() => setShowAI(false)} />
            )}

            <footer className="footer" style={{ padding: 'var(--space-md) var(--space-xl)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>CrownCare v1.0.0 — Your science-backed hair growth companion</p>
                <p>
                    <strong>Medical Disclaimer:</strong> We are not giving medical advice. Users of this site must talk to their doctor or a hair care professional before starting any treatment.
                </p>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AppInner />
        </AppProvider>
    );
}
