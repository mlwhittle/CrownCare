import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Debounce timers keyed by uid+key
const debounceTimers = {};

/**
 * Debounced cloud sync — saves a single key/value to Firestore user_data/{uid}.
 * Debounced by 2 seconds to avoid excessive writes.
 */
export function syncToCloud(uid, key, value) {
    if (!uid || !key) return;

    const timerKey = `${uid}_${key}`;
    if (debounceTimers[timerKey]) {
        clearTimeout(debounceTimers[timerKey]);
    }

    debounceTimers[timerKey] = setTimeout(async () => {
        try {
            const userDataRef = doc(db, 'user_data', uid);
            await setDoc(userDataRef, { [key]: JSON.stringify(value) }, { merge: true });
        } catch (error) {
            console.error(`SyncService - syncToCloud error for key "${key}":`, error);
        }
    }, 2000);
}

/**
 * Restores all data from Firestore user_data/{uid} back into localStorage.
 */
export async function restoreFromCloud(uid) {
    if (!uid) return;

    try {
        const userDataRef = doc(db, 'user_data', uid);
        const snapshot = await getDoc(userDataRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            Object.keys(data).forEach((key) => {
                try {
                    // The value was stored as a JSON string, write it directly
                    localStorage.setItem(key, data[key]);
                } catch (e) {
                    console.error(`SyncService - restoreFromCloud error for key "${key}":`, e);
                }
            });
        }
    } catch (error) {
        console.error('SyncService - restoreFromCloud error:', error);
    }
}

/**
 * Pushes ALL cc_* keys from localStorage to Firestore in a single write.
 */
export async function pushAllToCloud(uid) {
    if (!uid) return;

    try {
        const payload = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cc_')) {
                payload[key] = localStorage.getItem(key);
            }
        }

        if (Object.keys(payload).length > 0) {
            const userDataRef = doc(db, 'user_data', uid);
            await setDoc(userDataRef, payload, { merge: true });
        }
    } catch (error) {
        console.error('SyncService - pushAllToCloud error:', error);
    }
}
