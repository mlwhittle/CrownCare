import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import AICoach from './components/AICoach';
import NutritionPlanner from './components/NutritionPlanner';
import TreatmentTracker from './components/TreatmentTracker';
import LifestyleRoutines from './components/LifestyleRoutines';
import Settings from './components/Settings';
import OnboardingQuiz from './components/OnboardingQuiz';
import Paywall from './components/Paywall';
import PrivacyPolicy from './components/PrivacyPolicy';
import DeleteAccount from './components/DeleteAccount';
import Journal from './components/Journal';
import RealResults from './components/RealResults';
import Reports from './components/Reports';
import MonthlyNarrative from './components/MonthlyNarrative';
import StylistPortal from './components/StylistPortal';
import VisualDiary from './components/VisualDiary';
import Menu from './components/Menu';
import AuthModal from './components/AuthModal';
import { Sparkles } from 'lucide-react';

const MAIN_TABS = ['home', 'treatments', 'diary', 'nutrition', 'routines', 'stylist-portal', 'reports', 'settings'];

function AppInner() {
    const { onboarding, completeOnboarding, isPremium, isTrialExpired, redeemVipCode, user } = useApp();
    const [showAuthModal, setShowAuthModal] = useState(true);

    // Initialize RevenueCat for iOS Apple App Store native payments
    useEffect(() => {
        const initRC = async () => {
            if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
            try {
                // Note: The owner must paste the Public App-Specific API Key in from their RevenueCat Dashboard
                await Purchases.configure({ apiKey: 'appl_rmJkhAccGqKfBficXZljJwWggOD' });
            } catch (error) {
                console.error("Failed to initialize RevenueCat:", error);
            }
        };
        initRC();
    }, []);

    // Auto-Reset Legacy Saves: If the onboarding save doesn't have the new 'userType', wipe it so they see the new flow.
    if (onboarding && !onboarding.userType) {
        localStorage.removeItem('cc_onboarding');
        localStorage.removeItem('cc_vip');
        window.location.reload();
    }

    if (window.location.search.includes('reset=true')) {
        localStorage.clear();
        window.location.href = '/';
        return null;
    }

    const [currentView, setCurrentView] = useState('home');
    const [showAI, setShowAI] = useState(false);
    const [direction, setDirection] = useState(0); // 1 for right-to-left, -1 for left-to-right

    // Wrapper for setCurrentView that calculates animation direction
    const navigateTo = (newView) => {
        if (newView === currentView) return;
        const currentIndex = MAIN_TABS.indexOf(currentView);
        const newIndex = MAIN_TABS.indexOf(newView);
        
        // If both are in the main tab array, calculate direction
        if (currentIndex !== -1 && newIndex !== -1) {
            setDirection(newIndex > currentIndex ? 1 : -1);
        } else {
            setDirection(0); // Fade instead of slide for sub-pages
        }
        setCurrentView(newView);
    };

    // If no onboarding, show quiz
    if (!onboarding) {
        return <OnboardingQuiz onComplete={completeOnboarding} />;
    }

    // 30-DAY FREE TRIAL LOGIC: Only strictly enforce the Paywall if their 30 days have mathematically expired.
    if (!isPremium && isTrialExpired && !Capacitor.isNativePlatform()) {
        return <Paywall onSubscribeSuccess={() => redeemVipCode('FAMILY-VIP')} />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'home': return <Home setCurrentView={navigateTo} openAI={() => setShowAI(true)} />;
            case 'dashboard': return <Dashboard setCurrentView={navigateTo} openAI={() => setShowAI(true)} />;
            case 'diary': return <VisualDiary setCurrentView={navigateTo} openAI={() => setShowAI(true)} />;
            case 'nutrition': return <NutritionPlanner />;
            case 'treatments': return <TreatmentTracker openAI={() => setShowAI(true)} />;
            case 'routines': return <LifestyleRoutines />;
            case 'settings': return <Settings setCurrentView={navigateTo} />;
            case 'menu': return <Menu setCurrentView={navigateTo} />;
            case 'journal': return <Journal />;
            case 'reports': return <Reports />;
            case 'narrative': return <MonthlyNarrative setCurrentView={navigateTo} />;
            case 'results': return <RealResults setCurrentView={navigateTo} />;
            case 'stylist-portal': return <StylistPortal />;
            case 'privacy': return <PrivacyPolicy setCurrentView={navigateTo} />;
            case 'delete-account': return <DeleteAccount setCurrentView={navigateTo} />;
            default: return <Home setCurrentView={navigateTo} openAI={() => setShowAI(true)} />;
        }
    };

    // --- SWIPE GESTURE DETECTOR --- 
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
        // Ignore swipe if they are interacting with an inner horizontal scroll area (like treatment rows)
        if (e.target.closest('.scroll-container') || e.target.closest('input') || e.target.closest('button')) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (!touchStartX) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchStartX - touchEndX;
        const deltaY = touchStartY - touchEndY;

        // If it's a pronounced horizontal swipe and NOT a vertical scroll
        if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 40) {
             const currentIndex = MAIN_TABS.indexOf(currentView);
             if (currentIndex !== -1) {
                 if (deltaX > 0 && currentIndex < MAIN_TABS.length - 1) {
                     // Swiped Left -> Go to next tab
                     navigateTo(MAIN_TABS[currentIndex + 1]);
                 } else if (deltaX < 0 && currentIndex > 0) {
                     // Swiped Right -> Go to prev tab
                     navigateTo(MAIN_TABS[currentIndex - 1]);
                 }
             }
        }
        touchStartX = 0;
    };

    return (
        <div className="app" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {user && user.isAnonymous === true && showAuthModal && (
                <AuthModal onComplete={() => setShowAuthModal(false)} userName={onboarding?.name} />
            )}
            <Header currentView={currentView} setCurrentView={navigateTo} openAI={() => setShowAI(true)} />
            <main className="main-content" style={{ position: 'relative', overflowX: 'hidden' }}>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={currentView}
                        initial={{ x: direction * 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -50, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* AI Overlay */}
            {showAI && (
                <AICoach isOverlay onClose={() => setShowAI(false)} />
            )}

            <footer className="footer" style={{ padding: 'var(--space-md) var(--space-xl)', paddingBottom: '100px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>CrownCare v1.0.0 — Your holistic alopecia and edge regrowth tracker</p>
                <p>
                    <strong>Medical Disclaimer:</strong> We are not giving medical advice. Users of this site must talk to their doctor or a hair care professional before starting any treatment.
                </p>
                <div style={{ marginTop: '16px' }}>
                    <button
                        onClick={() => setCurrentView('privacy')}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                    >
                        Privacy Policy
                    </button>
                </div>
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
