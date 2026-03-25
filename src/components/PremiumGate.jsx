import React from 'react';
import { useApp } from '../context/AppContext';
import Upgrade from './Upgrade';

export default function PremiumGate({ children }) {
    const { isPremium } = useApp();

    if (!isPremium) {
        return <div style={{ minHeight: '100%', display: 'flex' }}><Upgrade onClose={() => { }} /></div>;
    }

    return <>{children}</>;
}
