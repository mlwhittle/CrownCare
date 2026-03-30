import React from 'react';
import { useApp } from '../context/AppContext';
import Upgrade from './Upgrade';
import { Capacitor } from '@capacitor/core';

export default function PremiumGate({ children }) {
    const { isPremium } = useApp();

    if (!isPremium && !Capacitor.isNativePlatform()) {
        return <div style={{ minHeight: '100%', display: 'flex' }}><Upgrade onClose={() => { }} /></div>;
    }

    return <>{children}</>;
}
