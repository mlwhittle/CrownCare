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
    const [errorMessage, setErrorMessage] = useState('');

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
            setErrorMessage('');
            await processDeletion();
        } catch (error) {
            console.error("Re-Auth Failed:", error);
            setErrorMessage(`Authentication failed: ${error.message}`);
            setIsDeleting(false);
        }
    };

    const processDeletion = async () => {
        if (!auth.currentUser) return;
        setErrorMessage('');

        try {
            const uid = auth.currentUser.uid;
            
            const tryDelete = async (action) => {
                try {
                    await action();
                } catch (e) {
                    console.warn('Cleanup step skipped due to permissions/error:', e);
                }
            };

            // Delete checkout_sessions subcollection first
            await tryDelete(async () => {
                const checkoutSnap = await getDocs(collection(db, 'users', uid, 'checkout_sessions'));
                const batch1 = writeBatch(db);
                checkoutSnap.forEach(d => batch1.delete(d.ref));
                await batch1.commit();
            });

            // Delete customers/{uid}/subscriptions
            await tryDelete(async () => {
                const subsSnap = await getDocs(collection(db, 'customers', uid, 'subscriptions'));
                const batch2 = writeBatch(db);
                subsSnap.forEach(d => batch2.delete(d.ref));
                await batch2.commit();
            });

            // Delete customers/{uid}/payments
            await tryDelete(async () => {
                const paymentsSnap = await getDocs(collection(db, 'customers', uid, 'payments'));
                const batch3 = writeBatch(db);
                paymentsSnap.forEach(d => batch3.delete(d.ref));
                await batch3.commit();
            });

            // Delete customers/{uid} parent doc
            await tryDelete(() => deleteDoc(doc(db, 'customers', uid)));

            // Delete user_data/{uid}
            await tryDelete(() => deleteDoc(doc(db, 'user_data', uid)));

            // Delete users/{uid}
            await tryDelete(() => deleteDoc(doc(db, 'users', uid)));

            // Logout RevenueCat on iOS
            if (Capacitor.isNativePlatform()) {
                try {
                    const { Purchases } = await import('@revenuecat/purchases-capacitor');
                    await Purchases.logOut();
                } catch (e) {
                    console.warn('RevenueCat logOut skipped:', e);
                }
            }

            // Delete Firebase Auth account
            await fbDeleteUser(auth.currentUser);

            // Clear local storage and redirect
            localStorage.clear();
            setCurrentView('onboarding');

        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                setNeedsReauth(true);
            } else {
                setErrorMessage(`Deletion failed: ${error.message}`);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div style={{ padding: 'var(--space-lg)', maxWidth: '480px', margin: '0 auto' }}>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                <ArrowLeft size={18} /> Back to Settings
            </button>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                <AlertTriangle size={48} color="var(--error)" />
                <h2 style={{ color: 'var(--error)', marginTop: 'var(--space-sm)' }}>Delete Account</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
                    This will permanently delete your account, all photos, logs, routines, and subscription data. This action cannot be undone.
                </p>
            </div>

            {errorMessage && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '8px', color: 'var(--error)', marginBottom: '16px', fontSize: '0.875rem' }}>
                    {errorMessage}
                </div>
            )}

            {needsReauth ? (
                <div className="card" style={{ borderColor: 'var(--error)' }}>
                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>Re-authenticate to Continue</h3>
                    {auth.currentUser?.providerData.some(p => p.providerId === 'google.com') ? (
                        <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleReauthAndRetry} disabled={isDeleting}>
                            Re-authenticate with Google
                        </button>
                    ) : (
                        <>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: 'var(--space-sm)', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                            <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleReauthAndRetry} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="card" style={{ borderColor: 'var(--error)' }}>
                    <p style={{ marginBottom: 'var(--space-sm)', fontWeight: 600 }}>Type <strong>DELETE</strong> to confirm:</p>
                    <input
                        type="text"
                        placeholder="Type DELETE"
                        value={confirmText}
                        onChange={e => setConfirmText(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: 'var(--space-md)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                    <button
                        className="btn btn-danger"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={processDeletion}
                        disabled={confirmText !== 'DELETE' || isDeleting}
                    >
                        <Trash2 size={16} />
                        {isDeleting ? 'Deleting your account...' : 'Permanently Delete My Account'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default DeleteAccount;