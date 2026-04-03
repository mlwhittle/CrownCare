import React from 'react';
import { useApp } from '../context/AppContext';
import Paywall from './Paywall';
import { Capacitor } from '@capacitor/core';

export default function PremiumGate({ children }) {
    const { isPremium } = useApp();

    if (!isPremium && !Capacitor.isNativePlatform()) {
        return <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}><Paywall onSubscribeSuccess={() => window.location.reload()} /></div>;
    }

    return <>{children}</>;
}
