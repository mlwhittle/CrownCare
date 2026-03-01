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
};

const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
};

const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const AppProvider = ({ children }) => {
    // Firebase Auth & Premium State
    const [user, setUser] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Sign in anonymously if no user is present, to ensure a sterile profile
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setAuthLoading(false);

                // Ensure the user document exists
                const userRef = doc(db, 'users', currentUser.uid);
                setDoc(userRef, { lastSeen: new Date().toISOString() }, { merge: true });

                // Listen to the 'subscriptions' subcollection created by the Stripe Extension
                const subsRef = collection(db, 'users', currentUser.uid, 'subscriptions');
                const q = query(subsRef, where('status', 'in', ['trialing', 'active']));
                const unsubscribeSubs = onSnapshot(q, (snapshot) => {
                    // If there is any active subscription document, the user is Premium
                    setIsPremium(!snapshot.empty);
                });
                return () => unsubscribeSubs();
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

    // Theme
    const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'light');
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    }, [theme]);
    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    // Onboarding / Profile
    const [onboarding, setOnboarding] = useState(() => load(STORAGE_KEYS.onboarding, null));
    useEffect(() => { if (onboarding) save(STORAGE_KEYS.onboarding, onboarding); }, [onboarding]);

    const completeOnboarding = (data) => {
        setOnboarding(data);
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

    return (
        <AppContext.Provider value={{
            user, isPremium, authLoading,
            theme, toggleTheme,
            onboarding, completeOnboarding,
            photos, addPhoto, deletePhoto,
            nutritionLogs, getTodayNutrition, saveNutrition,
            treatments, addTreatment, deleteTreatment, toggleTreatmentDone,
            routineLogs, logRoutine, getTodayRoutines,
            getDaysTracking, getStreak,
        }}>
            {children}
        </AppContext.Provider>
    );
};
