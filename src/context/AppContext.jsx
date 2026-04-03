import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const STORAGE_KEYS = {
    theme: 'cc_theme',
    profile: 'cc_profile',
    photos: 'cc_photos',
    nutrition: 'cc_nutrition',
    treatments: 'cc_treatments',
    routines: 'cc_routines',
    onboarding: 'cc_onboarding',
    journal: 'cc_journal',
    badges: 'cc_badges',
    last_interaction: 'cc_last_int',
    appointments: 'cc_appointments',
};

const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
};

const save = (key, val) => {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.error("Storage Error:", e);
        if (key === STORAGE_KEYS.photos) {
            alert("App storage limit reached! Your phone's local storage is full. Please delete some older progress photos to save new ones.");
        }
    }
};

export const AppProvider = ({ children }) => {
    // Firebase Auth & Premium State
    const [user, setUser] = useState(null);
    const [isVIP, setIsVIP] = useState(() => load('cc_vip', false));
    const [isPremium, setIsPremium] = useState(false); // Defaults to false
    const [isTrialExpired, setIsTrialExpired] = useState(false); // 168-hour lock
    const [authLoading, setAuthLoading] = useState(true);
    
    // Cross-Component Routing State
    const [customEvaluationPrompt, setCustomEvaluationPrompt] = useState('');

    // Stylist Code & Prescriptions (B2B Integration)
    const [stylistCode, setStylistCode] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref') || params.get('stylist');
            if (ref) {
                save('cc_stylist', ref.toUpperCase());
                return ref.toUpperCase();
            }
        }
        return load('cc_stylist', '');
    });
    useEffect(() => { save('cc_stylist', stylistCode); }, [stylistCode]);

    // Stylist Private Client Rolodex
    const [clientContacts, setClientContacts] = useState(() => load('cc_client_contacts', {}));
    useEffect(() => { save('cc_client_contacts', clientContacts); }, [clientContacts]);

    const updateClientContact = (clientId, contactData) => {
        setClientContacts(prev => ({
            ...(prev || {}),
            [clientId]: {
                ...(prev?.[clientId] || {}),
                ...contactData
            }
        }));
    };

    // Narrative Archives
    const [archivedNarratives, setArchivedNarratives] = useState(() => load('cc_archives', []));
    useEffect(() => { save('cc_archives', archivedNarratives); }, [archivedNarratives]);
    
    const saveNarrativeArchive = (text, score, targetMonth, images) => {
        const newArchive = {
            id: Date.now().toString(),
            dateGenerated: new Date().toISOString(),
            targetMonth,
            text,
            score,
            images: images || []
        };
        setArchivedNarratives(prev => {
            const arr = [newArchive, ...prev];
            if (arr.length <= 12) return arr;
            
            // Limit hit: keep the newest 11, plus the permanent baseline (the very last item)
            const newest11 = arr.slice(0, 11);
            const baseline = arr[arr.length - 1];
            return [...newest11, baseline];
        });
        return true;
    };

    const [prescribedTreatments, setPrescribedTreatments] = useState(() => load('cc_prescriptions', []));
    useEffect(() => { save('cc_prescriptions', prescribedTreatments); }, [prescribedTreatments]);

    // B2B AI Audits
    const [sharedAudits, setSharedAudits] = useState(() => load('cc_shared_audits', []));
    useEffect(() => { save('cc_shared_audits', sharedAudits); }, [sharedAudits]);

    const shareAuditWithStylist = (auditResult, photoData) => {
        const newAudit = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            result: auditResult,
            photoData: photoData,
            clientId: 'c1' // Hardcoded to Alisha Washington for the interactive demo
        };
        setSharedAudits(prev => [newAudit, ...prev]);
        return true;
    };

    // Mock an instant fetch when the specific "Sarah" code is entered
    useEffect(() => {
        if (stylistCode && stylistCode.toUpperCase() === 'STYLIST-SARAH20') {
            setPrescribedTreatments([
                {
                    id: 'mock-rx-1',
                    name: "Protein Treatment - Aphogee Two-Step",
                    frequency: "Every 6 weeks",
                    notes: "Make sure you sit under a hooded dryer for at least 15 minutes with the protein treatment. Do not comb through until it is rinsed!",
                    prescribedBy: "Sarah at Studio 54"
                }
            ]);
        } else {
            setPrescribedTreatments([]);
        }
    }, [stylistCode]);

    useEffect(() => {
        // If they have the VIP flag, grant instant premium
        if (isVIP) setIsPremium(true);
    }, [isVIP]);

    const redeemVipCode = (code) => {
        const validCodes = ['FAMILY-VIP', 'FOUNDERS-CLUB'];
        if (code && validCodes.includes(code.trim().toUpperCase())) {
            setIsVIP(true);
            save('cc_vip', true);
            return true;
        }
        return false;
    };

    useEffect(() => {
        // Sign in anonymously if no user is present, to ensure a sterile profile
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setAuthLoading(false);

                // Ensure the user document exists and permanently attach any affiliate referrals
                const userRef = doc(db, 'users', currentUser.uid);
                const currentStylist = load('cc_stylist', null);
                setDoc(userRef, { 
                    lastSeen: new Date().toISOString(),
                    referredBy_StylistId: currentStylist || null
                }, { merge: true });

                // STRIPE INTEGRATION: Listen for active apps subscriptions AND web bridge upgrades
                let hasAppSubscription = false;
                let hasWebSubscription = false;

                const evaluatePremium = () => {
                    const isUserVIP = load('cc_vip', false);
                    if (isUserVIP || hasAppSubscription || hasWebSubscription) {
                        setIsPremium(true);
                    } else {
                        setIsPremium(false);
                    }
                };

                const subsRef = collection(db, `customers/${currentUser.uid}/subscriptions`);
                const q = query(subsRef, where('status', 'in', ['trialing', 'active']));
                const unsubscribeSubs = onSnapshot(q, (snapshot) => {
                    hasAppSubscription = !snapshot.empty;
                    evaluatePremium();
                }, (error) => {
                    console.error("Subscription listener error:", error);
                });

                const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
                    const data = docSnap.data();
                    
                    if (data && !data.trialStartedAt) {
                        // Natively stamp the exact ms they registered
                        setDoc(userRef, { trialStartedAt: Date.now() }, { merge: true });
                    }
                    if (data && data.trialStartedAt) {
                        // 30 Days mathematically evaluated for Cardless Free Trial
                        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
                        setIsTrialExpired(Date.now() - data.trialStartedAt > THIRTY_DAYS_MS);
                    }

                    hasWebSubscription = data?.hasActiveWebSubscription === true;
                    evaluatePremium();
                });

                return () => {
                    unsubscribeSubs();
                    unsubscribeUser();
                };
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Firebase Anonymous Auth failed", error);
                    setAuthLoading(false);
                }
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Theme forced to Clinical Luxury Light Mode
    const theme = 'light';
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(STORAGE_KEYS.theme, 'light');
    }, []);
    const toggleTheme = () => { console.log('Dark mode deprecated for Clinical Luxury.'); };

    // Onboarding / Profile
    const [onboarding, setOnboarding] = useState(() => load(STORAGE_KEYS.onboarding, null));
    useEffect(() => { if (onboarding) save(STORAGE_KEYS.onboarding, onboarding); }, [onboarding]);

    const completeOnboarding = (data) => {
        setOnboarding(data);
        setIsStylistAccount(data.userType === 'stylist');
    };

    // Photos
    const [photos, setPhotos] = useState(() => load(STORAGE_KEYS.photos, []));
    useEffect(() => { save(STORAGE_KEYS.photos, photos); }, [photos]);

    const addPhoto = (photo) => {
        setPhotos(prev => [{ id: Date.now().toString(), date: new Date().toISOString(), ...photo }, ...prev]);
    };
    const deletePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

    // Nutrition logs (daily)
    const [nutritionLogs, setNutritionLogs] = useState(() => load(STORAGE_KEYS.nutrition, []));
    useEffect(() => { save(STORAGE_KEYS.nutrition, nutritionLogs); }, [nutritionLogs]);

    const getTodayNutrition = () => {
        const today = new Date().toISOString().split('T')[0];
        return nutritionLogs.find(n => n.date.startsWith(today)) || null;
    };

    const saveNutrition = (entry) => {
        const today = new Date().toISOString().split('T')[0];
        setNutritionLogs(prev => {
            const existing = prev.findIndex(n => n.date.startsWith(today));
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { ...entry, date: new Date().toISOString(), id: updated[existing].id };
                return updated;
            }
            return [{ id: Date.now().toString(), date: new Date().toISOString(), ...entry }, ...prev];
        });
    };

    // Treatment logs
    const [treatments, setTreatments] = useState(() => load(STORAGE_KEYS.treatments, []));
    useEffect(() => { save(STORAGE_KEYS.treatments, treatments); }, [treatments]);

    const addTreatment = (t) => {
        setTreatments(prev => [{ id: Date.now().toString(), date: new Date().toISOString(), ...t }, ...prev]);
    };
    const deleteTreatment = (id) => setTreatments(prev => prev.filter(t => t.id !== id));
    const toggleTreatmentDone = (id) => {
        setTreatments(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    // Routine logs
    const [routineLogs, setRoutineLogs] = useState(() => load(STORAGE_KEYS.routines, []));
    useEffect(() => { save(STORAGE_KEYS.routines, routineLogs); }, [routineLogs]);

    const logRoutine = (routine) => {
        setRoutineLogs(prev => [{ id: Date.now().toString(), date: new Date().toISOString(), ...routine }, ...prev]);
    };

    const getTodayRoutines = () => {
        const today = new Date().toISOString().split('T')[0];
        return routineLogs.filter(r => r.date.startsWith(today));
    };

    // Computed helpers
    const getDaysTracking = () => {
        if (!onboarding?.startDate) return 0;
        return Math.floor((Date.now() - new Date(onboarding.startDate).getTime()) / (1000 * 60 * 60 * 24));
    };

    const getStreak = () => {
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const day = new Date(today);
            day.setDate(day.getDate() - i);
            const dayStr = day.toISOString().split('T')[0];
            const hasActivity = treatments.some(t => t.date.startsWith(dayStr)) ||
                nutritionLogs.some(n => n.date.startsWith(dayStr)) ||
                routineLogs.some(r => r.date.startsWith(dayStr));
            if (hasActivity) streak++;
            else break;
        }
        return streak;
    };

    // --- Badge Evaluators ---
    const [unlockedBadges, setUnlockedBadges] = useState(() => load(STORAGE_KEYS.badges, []));
    useEffect(() => { save(STORAGE_KEYS.badges, unlockedBadges); }, [unlockedBadges]);

    const unlockBadge = (badgeId) => {
        if (!unlockedBadges.includes(badgeId)) {
            setUnlockedBadges(prev => [...prev, badgeId]);
            return true; // Indicates a new unlock
        }
        return false;
    };

    const evaluateHydrationHero = () => {
        // Needs 4 consecutive Sundays of moisture treatments
        let sundayCount = 0;
        const today = new Date();
        for (let i = 0; i < 28; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            if (d.getDay() === 0) { // Sunday
                const dayStr = d.toISOString().split('T')[0];
                const hasMoisture = treatments.some(t => t.date.startsWith(dayStr) && t.name.toLowerCase().includes('moisture'));
                if (hasMoisture) sundayCount++;
                else break; // Break consecutive chain
            }
        }
        if (sundayCount >= 4) return unlockBadge('hydration_hero');
        return false;
    };

    const evaluateInternalArchitect = () => {
        // Hitting 90% goals for 14 days (Approximated here as logging macros for 14 straight days)
        let dayCount = 0;
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            const logged = nutritionLogs.some(n => n.date.startsWith(dayStr) && Object.keys(n.checks || {}).length > 2);
            if (logged) dayCount++;
            else break;
        }
        if (dayCount === 14) return unlockBadge('internal_architect');
        return false;
    };

    const evaluateScientificSentry = () => {
        // Uploading a photo every week for a month
        let weekCount = 0;
        const today = new Date();
        for (let i = 0; i < 4; i++) {
            const end = new Date(today);
            end.setDate(end.getDate() - (i * 7));
            const start = new Date(today);
            start.setDate(start.getDate() - ((i + 1) * 7));
            
            const hasPhotoInWeek = photos.some(p => {
                const pDate = new Date(p.date).getTime();
                return pDate <= end.getTime() && pDate > start.getTime();
            });
            if (hasPhotoInWeek) weekCount++;
            else break;
        }
        if (weekCount === 4) return unlockBadge('scientific_sentry');
        return false;
    };

    // Global Evaluator
    const runBadgeEvaluation = () => {
        const h = evaluateHydrationHero();
        const i = evaluateInternalArchitect();
        const s = evaluateScientificSentry();
        return h || i || s; // Return true if ANY new badge was unlocked
    };

    // --- Consistency Score (0-100) ---
    // Logic: Starts at 50. Increases +2 for activity, decays -5 for 3 days of no activity.
    const getConsistencyScore = () => {
        if (!onboarding?.startDate) return 0;
        let score = 50; 
        
        // Simple heuristic based on current streak vs days tracking
        const totalActivityDays = new Set([
            ...treatments.map(t => t.date.split('T')[0]),
            ...nutritionLogs.map(n => n.date.split('T')[0]),
            ...routineLogs.map(r => r.date.split('T')[0])
        ]).size;

        const maxDays = getDaysTracking() || 1;
        const activityRatio = totalActivityDays / maxDays;
        
        score += (activityRatio * 50); // Up to 100 based on overall history

        // Decay logic: 3+ days of no activity drops score by 15 points
        const today = new Date().getTime();
        const latestActivity = Math.max(
            ...treatments.map(t => new Date(t.date).getTime()),
            ...nutritionLogs.map(n => new Date(n.date).getTime()),
            ...routineLogs.map(r => new Date(r.date).getTime()),
            new Date(onboarding.startDate).getTime() // fallback
        );

        const daysSinceLastActivity = Math.floor((today - latestActivity) / (1000 * 60 * 60 * 24));
        if (daysSinceLastActivity >= 3) {
            score -= (15 * Math.floor(daysSinceLastActivity / 3));
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    };

    const getConsistencyTier = (score) => {
        if (score <= 30) return 'Seedling';
        if (score <= 70) return 'Sprout';
        return 'Royal Growth';
    };

    // Journal Logs
    const [journalLogs, setJournalLogs] = useState(() => load(STORAGE_KEYS.journal, []));
    useEffect(() => { save(STORAGE_KEYS.journal, journalLogs); }, [journalLogs]);

    const addJournalEntry = (text, tags = []) => {
        setJournalLogs(prev => [{ id: Date.now().toString(), date: new Date().toISOString(), text, tags }, ...prev]);
    };

    const deleteJournalEntry = (id) => setJournalLogs(prev => prev.filter(j => j.id !== id));

    // Appointments (Client View)
    const [appointments, setAppointments] = useState(() => load(STORAGE_KEYS.appointments, []));
    useEffect(() => { save(STORAGE_KEYS.appointments, appointments); }, [appointments]);

    const addAppointment = (appt) => {
        setAppointments(prev => [{ id: Date.now().toString(), dateAdded: new Date().toISOString(), ...appt }, ...prev]);
    };

    // Stylist Contact Info
    const [stylistContact, setStylistContact] = useState(() => {
        const saved = load('cc_stylist_contact', null);
        if (saved && saved.name) return saved;
        return { name: 'Sarah at Studio 54', phone: '(555) 123-4567', email: 'sarah@studio54.com' };
    });
    useEffect(() => { save('cc_stylist_contact', stylistContact); }, [stylistContact]);

    const [isStylistAccount, setIsStylistAccount] = useState(() => {
        try {
            const saved = localStorage.getItem('cc_is_stylist');
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('cc_is_stylist', JSON.stringify(isStylistAccount));
    }, [isStylistAccount]);

    const [stylistDashboardData, setStylistDashboardData] = useState(() => {
        const saved = load('cc_stylist_dashboard', null);
        if (saved) return saved;
        return {
            affiliateCode: 'STUDIO54-SARAH',
            monthlyEst: 120.00,
            unpaidEarnings: 45.00,
            stripeAccountId: null,
            isStripeOnboarded: false
        };
    });

    useEffect(() => {
        save('cc_stylist_dashboard', stylistDashboardData);
    }, [stylistDashboardData]);

    const updateStylistDashboard = (updates) => {
        setStylistDashboardData(prev => ({ ...prev, ...updates }));
    };
    const linkedClients = [
        { 
            id: 'c1', name: 'Alisha Washington', consistencyScore: 85, lastActive: '2026-03-15', tier: 'Royal Growth',
            hairType: '4C', porosity: 'Low', concern: 'Postpartum Shedding',
            activity: [
                { id: 'a1', date: '2026-03-15', type: 'treatment', description: 'Logged Clinical Routine: Rosewater Hydration Mist' },
                { id: 'a2', date: '2026-03-14', type: 'routine', description: 'Completed Nightly Wrap Routine' },
                { id: 'a3', date: '2026-03-12', type: 'journal', description: 'Journal Entry: Experiencing a lot of shedding today.', tags: ['High Stress', 'Hormonal Shift'] }
            ],
            recentPhotos: [
                { id: 'p1', date: '2026-03-15', zone: 'Part Line', imageData: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
                { id: 'p2', date: '2026-03-01', zone: 'Part Line', imageData: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
            ],
            recentNutrition: {
                waterGlasses: 6,
                checks: { protein: true, iron: true, vitaminD: false }
            },
            appointments: [
                { id: 'appt1', date: '2026-03-25T14:30:00', stylistName: 'Sarah at Studio 54', notes: 'Protein treatment follow-up and trim.' }
            ]
        },
        { 
            id: 'c2', name: 'Jasmine Carter', consistencyScore: 42, lastActive: '2026-03-10', tier: 'Seedling',
            hairType: '3B', porosity: 'High', concern: 'Color Damage / Breakage',
            activity: [
                { id: 'a4', date: '2026-03-10', type: 'treatment', description: 'Logged Custom Product: Mielle Organics Rosemary Mint Oil' },
                { id: 'a5', date: '2026-03-02', type: 'treatment', description: 'Logged Clinical Routine: Clarifying Shampoo' }
            ]
        },
        { 
            id: 'c3', name: 'Monique Davis', consistencyScore: 92, lastActive: '2026-03-16', tier: 'Royal Growth',
            activity: [
                { id: 'a6', date: '2026-03-16', type: 'routine', description: 'Completed Morning Moisture Routine' },
                { id: 'a7', date: '2026-03-15', type: 'treatment', description: 'Logged Natural Treatment: Aloe Vera Mask' },
                { id: 'a8', date: '2026-03-14', type: 'routine', description: 'Completed Nightly Wrap Routine' }
            ],
            recentPhotos: [
                { id: 'p3', date: '2026-03-16', zone: 'Crown', imageData: 'https://images.unsplash.com/photo-1579895914389-42b77227eb04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
            ],
            recentNutrition: {
                waterGlasses: 8,
                checks: { protein: true, iron: true, vitaminD: true }
            }
        },
        { 
            id: 'c4', name: 'Kiesha Jenkins', consistencyScore: 68, lastActive: '2026-03-14', tier: 'Sprout',
            activity: [
                { id: 'a9', date: '2026-03-14', type: 'treatment', description: 'Logged Clinical Routine: Moisture Retention' }
            ]
        },
        { 
            id: 'c5', name: 'LaToya Smith', consistencyScore: 30, lastActive: '2026-03-01', tier: 'Seedling',
            activity: [
                { id: 'a10', date: '2026-03-01', type: 'treatment', description: 'Logged Custom Product' }
            ]
        },
    ];

    return (
        <AppContext.Provider value={{
            user, isPremium, isVIP, isTrialExpired, redeemVipCode, authLoading,
            theme, toggleTheme,
            onboarding, completeOnboarding,
            photos, addPhoto, deletePhoto,
            nutritionLogs, getTodayNutrition, saveNutrition,
            treatments, addTreatment, deleteTreatment, toggleTreatmentDone,
            routineLogs, logRoutine, getTodayRoutines,
            journalLogs, addJournalEntry, deleteJournalEntry,
            getDaysTracking, getStreak,
            unlockedBadges, runBadgeEvaluation, getConsistencyScore, getConsistencyTier,
            customEvaluationPrompt, setCustomEvaluationPrompt,
            stylistCode, setStylistCode,
            clientContacts, updateClientContact,
            appointments, addAppointment,
            stylistContact, setStylistContact,
            isStylistAccount, setIsStylistAccount,
            stylistDashboardData, updateStylistDashboard, linkedClients,
            archivedNarratives, saveNarrativeArchive,
            sharedAudits, shareAuditWithStylist
        }}>
            {children}
        </AppContext.Provider>
    );
};
