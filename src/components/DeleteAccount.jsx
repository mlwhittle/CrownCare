import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
    EmailAuthProvider, 
    GoogleAuthProvider, 
    reauthenticateWithCredential, 
    reauthenticateWithPopup, 
    deleteUser as fbDeleteUser 
} from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { AlertTriangle, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

function DeleteAccount({ setCurrentView }) {
    const { user } = useApp();
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [needsReauth, setNeedsReauth] = useState(false);
    const [password, setPassword] = useState('');

    const handleReauthAndRetry = async () => {
        if (!auth.currentUser) return;
        setIsDeleting(true);
        try {
            const isGoogle = auth.currentUser.providerData.some(p => p.providerId === 'google.com');

            if (isGoogle) {
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(auth.currentUser, provider);
            } else {
                if (!password) {
                    alert("Please enter your password first.");
                    setIsDeleting(false);
                    return;
                }
                const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
                await reauthenticateWithCredential(auth.currentUser, credential);
            }
            // If re-auth is successful, hide the re-auth prompt and try deleting again
            setNeedsReauth(false);
            await processDeletion();
        } catch (error) {
            console.error("Re-Auth Failed:", error);
            alert(`Authentication failed: ${error.message}`);
            setIsDeleting(false);
        }
    };

    const processDeletion = async () => {
        if (!auth.currentUser) return;

        try {
            const uid = auth.currentUser.uid;
            
            // Delete checkout_sessions subcollection first
            try {
                const sessionsSnapshot = await getDocs(collection(db, 'users', uid, 'checkout_sessions'));
                const batch = writeBatch(db);
                sessionsSnapshot.docs.forEach((d) => batch.delete(d.ref));
                await batch.commit();
            } catch (e) {
                console.warn("Failed to clean up checkout_sessions", e);
            }

            // Clean up Stripe customers subscriptions and payments
            try {
                const subsSnapshot = await getDocs(collection(db, 'customers', uid, 'subscriptions'));
                const paySnapshot = await getDocs(collection(db, 'customers', uid, 'payments'));
                const batch = writeBatch(db);
                subsSnapshot.docs.forEach((d) => batch.delete(d.ref));
                paySnapshot.docs.forEach((d) => batch.delete(d.ref));
                await batch.commit();
                await deleteDoc(doc(db, 'customers', uid));
            } catch (e) {
                console.warn("Failed to clean up customers data", e);
            }

            // Delete root synced user_data where logs and photos are mapped
            try {
                await deleteDoc(doc(db, 'user_data', uid));
            } catch (e) {
                console.warn("Failed to clean up user_data", e);
            }

            // Delete main user document
            await deleteDoc(doc(db, 'users', uid));

            // Wipe Auth Profile via Firebase Auth
            await fbDeleteUser(auth.currentUser);

            // Clear Subscription Hooks (Apple StoreKit logic)
            if (Capacitor.isNativePlatform()) {
                const { Purchases } = await import('@revenuecat/purchases-capacitor');
                await Purchases.logOut();
            }

            // Local Storage and Redirects
            localStorage.clear();
            window.location.href = '/'; // Hard reload sends them cleanly back to App.jsx onboarding
            
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                setNeedsReauth(true);
            } else {
                alert(`Failed to delete account: ${error.message}`);
            }
            setIsDeleting(false);
        }
    };

    const handleDeleteClick = async () => {
        if (confirmText !== 'DELETE') {
            return alert("Please type DELETE exactly in all caps to confirm.");
        }
        setIsDeleting(true);
        // Start the process
        await processDeletion();
    };

    if (needsReauth) {
        const isGoogle = auth.currentUser?.providerData.some(p => p.providerId === 'google.com');

        return (
            <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: '600px', margin: '0 auto' }}>
                <div className="card danger-card">
                    <h2 style={{ color: 'var(--error)', marginBottom: 'var(--space-md)' }}>Security Verification Required</h2>
                    <p style={{ marginBottom: 'var(--space-lg)' }}>
                        For security reasons, Firebase requires you to verify your identity to permanently delete your account because your session has been active for a long time.
                    </p>

                    {isGoogle ? (
                        <button className="btn btn-primary" onClick={handleReauthAndRetry} disabled={isDeleting} style={{ width: '100%' }}>
                            {isDeleting ? "Verifying..." : "Verify with Google"}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your current password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleReauthAndRetry} disabled={isDeleting}>
                                {isDeleting ? "Verifying..." : "Verify Password & Delete"}
                            </button>
                        </div>
                    )}
                    
                    <button 
                        className="btn btn-outline" 
                        style={{ width: '100%', marginTop: 'var(--space-md)' }} 
                        onClick={() => { setNeedsReauth(false); setIsDeleting(false); }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <button 
                className="btn btn-outline" 
                style={{ position: 'absolute', top: 'var(--space-md)', left: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setCurrentView('settings')}
            >
                <ArrowLeft size={16} /> Back
            </button>
            
            <AlertTriangle size={48} style={{ color: 'var(--error)', margin: '0 auto', marginBottom: 'var(--space-md)' }} />
            <h1 style={{ color: 'var(--error)', marginBottom: 'var(--space-sm)' }}>Delete Account</h1>

            <div className="card danger-card" style={{ textAlign: 'left', marginTop: 'var(--space-lg)' }}>
                <h3 style={{ color: 'var(--error)', marginBottom: 'var(--space-sm)' }}>Warning: This action is permanent.</h3>
                <p style={{ marginBottom: 'var(--space-md)' }}>
                    Deleting your account will immediately and permanently erase all of your data, including:
                </p>
                <ul style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>All symptom logs, clinical tracking data, and visual diary photos.</li>
                    <li>Your personal protocols and routine history.</li>
                    <li>All Stylist and Portal connections.</li>
                    <li>Any active Subscription records (will be terminated immediately).</li>
                </ul>

                <p style={{ marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>To confirm your deletion, type DELETE below:</p>
                <input
                    type="text"
                    className="form-input"
                    placeholder="DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    style={{ textTransform: 'uppercase', marginBottom: 'var(--space-lg)', borderColor: confirmText === 'DELETE' ? 'var(--error)' : 'var(--border-color)' }}
                />

                <button
                    className="btn btn-danger"
                    onClick={handleDeleteClick}
                    disabled={isDeleting || confirmText !== 'DELETE'}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Permanently Delete My Account'}
                </button>
            </div>
        </div>
    );
}

export default DeleteAccount;
