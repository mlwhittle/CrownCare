import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Normalizes JSON-stringified cc_* payloads from user_data into a unified client object.
 */
export function normalizeClientRecord(uid, basicData, rawData) {
    const parse = (key, fallback) => {
        try { return rawData[key] ? JSON.parse(rawData[key]) : fallback; }
        catch { return fallback; }
    };

    const onboarding = parse('cc_onboarding', {});
    const photos = parse('cc_photos', []);
    const treatments = parse('cc_treatments', []);
    const nutrition = parse('cc_nutrition', []);
    const routines = parse('cc_routines', []);
    const journal = parse('cc_journal', []);
    
    // New fields
    const sharedAudits = parse('cc_shared_audits', []);
    const productScans = parse('cc_product_scans', []);
    const consentStatus = parse('cc_consent_status', false);

    // Build unified Activity Timeline
    const activity = [
        ...treatments.map(t => ({ ...t, type: 'treatment', description: t.name, date: t.date })),
        ...routines.map(r => ({ ...r, type: 'routine', description: r.name || r.type, date: r.date })),
        ...journal.map(j => ({ ...j, type: 'journal', description: j.text || 'Journal Entry', date: j.date }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    let score = 50;
    const todayMs = new Date().getTime();
    let maxDays = 1;

    if (onboarding.startDate) {
        maxDays = Math.floor((todayMs - new Date(onboarding.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const totalActivityDays = new Set([
            ...treatments.map(t => t.date && t.date.split('T')[0]),
            ...nutrition.map(n => n.date && n.date.split('T')[0]),
            ...routines.map(r => r.date && r.date.split('T')[0])
        ].filter(Boolean)).size;

        const activityRatio = totalActivityDays / maxDays;
        
        score += (activityRatio * 50);

        const latestActivity = Math.max(
            ...treatments.map(t => new Date(t.date || 0).getTime()),
            ...nutrition.map(n => new Date(n.date || 0).getTime()),
            ...routines.map(r => new Date(r.date || 0).getTime()),
            new Date(onboarding.startDate).getTime() || 0
        );

        if (latestActivity > 0) {
            const daysSinceLastActivity = Math.floor((todayMs - latestActivity) / (1000 * 60 * 60 * 24));
            if (daysSinceLastActivity >= 3) {
                score -= (15 * Math.floor(daysSinceLastActivity / 3));
            }
        }
    }

    const consistencyScore = Math.max(0, Math.min(100, Math.round(score)));
    let tier = 'Royal Growth';
    if (consistencyScore <= 30) tier = 'Seedling';
    else if (consistencyScore <= 70) tier = 'Sprout';

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const dayStr = day.toISOString().split('T')[0];
        const hasActivity = treatments.some(t => t.date && t.date.startsWith(dayStr)) ||
            nutrition.some(n => n.date && n.date.startsWith(dayStr)) ||
            routines.some(r => r.date && r.date.startsWith(dayStr));
        if (hasActivity) {
            currentStreak++;
        } else if (i > 0) {
            break;
        }
    }

    const treatmentCompliance = treatments.length > 0 
        ? Math.round((treatments.filter(t => t.done).length / treatments.length) * 100)
        : 0;
        
    const routineCompliance = Math.min(100, Math.round((routines.length / maxDays) * 100));

    const clinicalAnalytics = {
        totalTrackingDays: maxDays,
        currentStreak,
        routineCompliance,
        recentTreatments: treatments.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 3),
        latestNutritionLog: nutrition.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0] || null,
        latestJournalEntry: journal.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0] || null,
        progressPhotoVideoEngagement: photos.length
    };

    const photoZones = [...new Set(photos.map(p => p.zone || 'overall'))];

    const baseIdentity = {
        id: uid,
        name: onboarding.name || 'Anonymous Client',
        hairType: onboarding.hairType ? onboarding.hairType.join(', ') : 'Unknown',
        porosity: onboarding.porosity || 'Unknown',
        concern: onboarding.goals ? onboarding.goals.join(', ') : 'Unknown',
        tier,
        consistencyScore,
        lastSeen: basicData.lastSeen || new Date().toISOString(),
        consentStatus
    };

    if (!consentStatus) {
        return {
            ...baseIdentity,
            visualDiary: [],
            photoZones: [],
            aiScans: [],
            productScans: [],
            treatments: [],
            treatmentCompliance: 0,
            routines: [],
            routineStreak: 0,
            routineCompliance: 0,
            nutritionLogs: [],
            journalEntries: [],
            clinicalAnalytics: null,
            activity: []
        };
    }

    return {
        ...baseIdentity,
        visualDiary: photos,
        photoZones,
        aiScans: sharedAudits,
        productScans,
        treatments,
        treatmentCompliance,
        routines,
        routineStreak: currentStreak,
        routineCompliance,
        nutritionLogs: nutrition,
        journalEntries: journal,
        clinicalAnalytics,
        activity
    };
}

/**
 * Fetches all linked clients for a specific stylist and normalizes their data payloads.
 */
export async function fetchLinkedClients(stylistCode) {
    if (!stylistCode) return [];
    
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referredBy_StylistId', '==', stylistCode.toUpperCase()));
        const snapshot = await getDocs(q);
        
        const clients = [];
        
        for (const userDoc of snapshot.docs) {
            const uid = userDoc.id;
            const basicData = userDoc.data();
            
            const userDataRef = doc(db, 'user_data', uid);
            const dataSnap = await getDoc(userDataRef);
            
            if (dataSnap.exists()) {
                const rawData = dataSnap.data();
                clients.push(normalizeClientRecord(uid, basicData, rawData));
            } else {
                // If they have no user_data synced yet, return a sterile profile
                clients.push(normalizeClientRecord(uid, basicData, {}));
            }
        }
        
        return clients;
    } catch (error) {
        console.error("Error fetching linked clients:", error);
        return [];
    }
}
