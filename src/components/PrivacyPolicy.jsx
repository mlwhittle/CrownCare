import React from 'react';

function PrivacyPolicy({ setCurrentView }) {
    return (
        <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            <h1 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Privacy Policy</h1>
            <p style={{ marginBottom: 'var(--space-xl)' }}>Last updated: March 1, 2026</p>

            <section style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>1. Introduction</h3>
                <p>
                    Welcome to CrownCare ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your information when you use our mobile application (the "App").
                </p>
            </section>

            <section style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>2. Information We Collect</h3>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                    <li style={{ marginBottom: '8px' }}><strong>Personal Information:</strong> We may collect your name, email address, password, and profile picture.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Health Data:</strong> We securely process health routines to provide personalized insights. We never sell your data.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Payment Information:</strong> Processed securely by Stripe. We do not store full credit card details.</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>3. How We Share Your Information</h3>
                <p>We share data strictly with infrastructure providers to operate the application:</p>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                    <li style={{ marginBottom: '8px' }}><strong>Firebase:</strong> For secure authentication and data storage.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Stripe:</strong> For subscription management.</li>
                    <li style={{ marginBottom: '8px' }}><strong>OpenAI:</strong> To power the AI Coach (PII is minimized).</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>4. Your Data Rights</h3>
                <p>
                    You manage your account data and can permanently delete your profile and all associated data directly within the CrownCare App settings.
                </p>
            </section>

            <button
                className="button secondary"
                style={{ marginTop: 'var(--space-md)' }}
                onClick={() => setCurrentView('home')}
            >
                Return to App
            </button>
        </div>
    );
}

export default PrivacyPolicy;
