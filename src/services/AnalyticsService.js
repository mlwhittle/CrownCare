import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Capacitor } from '@capacitor/core';

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

class AnalyticsServiceImpl {
    constructor() {
        this.sessionId = generateUUID();
        this.userId = this.loadOrCreateUserId();
        this.sessionStartTime = Date.now();
        this.eventQueue = [];
        this.isProcessingQueue = false;
        this.appVersion = '1.0.0'; // We could pull from Capacitor App info, keeping it hardcoded for speed and safety
        this.platform = Capacitor.getPlatform();
    }

    loadOrCreateUserId() {
        let savedUserId = localStorage.getItem('crowncare_anon_user_id');
        if (!savedUserId) {
            savedUserId = generateUUID();
            localStorage.setItem('crowncare_anon_user_id', savedUserId);
        }
        return savedUserId;
    }

    setIdentifiedUserId(uid) {
        if (uid) {
            this.userId = uid;
            localStorage.setItem('crowncare_anon_user_id', uid);
        }
    }

    async logEvent(eventType, properties = {}) {
        const timestamp = Date.now();
        const dateObj = new Date(timestamp);
        const timestampISO = dateObj.toISOString();
        const dateString = timestampISO.split('T')[0];
        
        const eventId = generateUUID();
        
        const eventData = {
            event_id: eventId,
            event_type: eventType,
            user_id: this.userId,
            platform: this.platform,
            app_version: this.appVersion,
            session_id: this.sessionId,
            timestamp: timestamp,
            timestamp_iso: timestampISO,
            properties: properties
        };

        // Attempt to write to Firestore: analytics_events -> yyyy-mm-dd -> eventId
        try {
            // Using a flat structure with a date string to easily query
            const docRef = doc(db, 'analytics_events', `${dateString}_${eventId}`);
            await setDoc(docRef, eventData);
        } catch (error) {
            console.error("AnalyticsService: Failed to write event", error);
            // In a production environment, we would push to eventQueue and retry on reconnection.
        }
    }

    trackAppOpen() {
        const lastOpen = localStorage.getItem('crowncare_last_app_open');
        const isReturningUser = !!lastOpen;
        
        let daysSinceLastOpen = 0;
        if (lastOpen) {
            const msSinceLast = Date.now() - parseInt(lastOpen, 10);
            daysSinceLastOpen = Math.floor(msSinceLast / (1000 * 60 * 60 * 24));
        }

        this.logEvent('app_open', {
            session_duration_ms: 0,
            is_returning_user: isReturningUser,
            days_since_last_open: daysSinceLastOpen
        });

        localStorage.setItem('crowncare_last_app_open', Date.now().toString());
    }

    trackFeatureView(featureName, category = null) {
        const properties = { feature_name: featureName, time_spent_seconds: 0 };
        if (category) properties.category = category;
        this.logEvent('feature_view', properties);
    }

    trackPaywallShown(location, tiersShown) {
        this.logEvent('paywall_shown', { location, tiers_shown: tiersShown });
    }

    trackSubscriptionInitiated(tier, priceUsd, billingPeriod) {
        this.logEvent('subscription_initiated', {
            tier,
            tier_price_usd: priceUsd,
            billing_period: billingPeriod
        });
    }

    trackSubscriptionCompleted(tier, priceUsd, billingPeriod, transactionId) {
        this.logEvent('subscription_completed', {
            tier,
            tier_price_usd: priceUsd,
            billing_period: billingPeriod,
            transaction_id: transactionId,
            converted_from_trial: false,
            days_to_conversion: 0
        });
    }

    trackFeatureInteraction(featureName, action, success = true, errorMessage = null) {
        const properties = { feature_name: featureName, action, success };
        if (errorMessage) properties.error_message = errorMessage;
        this.logEvent('feature_interaction', properties);
    }
}

export const AnalyticsService = new AnalyticsServiceImpl();
