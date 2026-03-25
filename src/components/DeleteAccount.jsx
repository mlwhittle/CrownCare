import React from 'react';

function DeleteAccount({ setCurrentView }) {
    return (
        <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Account Deletion Request</h1>

            <div style={{ background: 'var(--surface-color)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: 'var(--space-lg)' }}>
                <p style={{ marginBottom: 'var(--space-md)' }}>
                    To permanently delete your CrownCare account and all associated data, you have two options:
                </p>

                <div style={{ textAlign: 'left', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>Option 1: In-App (Fastest)</h3>
                    <p>Open the CrownCare app, navigate to <strong>Settings</strong> at the bottom of the screen, and click <strong>"Delete Account"</strong>. Your data will be wiped immediately.</p>
                </div>

                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>Option 2: Email Support</h3>
                    <p>Send an email to our support team from the email address associated with your account requesting deletion.</p>
                    <a href="mailto:support@crowncare.app?subject=Account Deletion Request" className="button primary" style={{ display: 'inline-block', marginTop: 'var(--space-sm)', textDecoration: 'none' }}>
                        Email Support
                    </a>
                </div>
            </div>

            <button
                className="button secondary"
                style={{ marginTop: 'var(--space-xl)' }}
                onClick={() => setCurrentView('home')}
            >
                Return to App
            </button>
        </div>
    );
}

export default DeleteAccount;
