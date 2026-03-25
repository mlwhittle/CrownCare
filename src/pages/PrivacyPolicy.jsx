import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-50 pb-24">
            <div className="bg-primary/5 pt-12 pb-8 px-6 text-center border-b border-primary/10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Privacy Policy</h1>
                <p className="text-neutral-500 max-w-lg mx-auto">
                    Last updated: March 1, 2026
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 prose prose-primary max-w-none"
                >
                    <h3>1. Introduction</h3>
                    <p>
                        Welcome to CrownCare ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your information when you use our mobile application (the "App").
                    </p>
                    <p>
                        By using CrownCare, you agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>

                    <h3>2. Information We Collect</h3>
                    <p>We collect information that you voluntarily provide to us when you register for the App:</p>
                    <ul>
                        <li><strong>Personal Information:</strong> When you create an account, we may collect your name, email address, password, and profile picture.</li>
                        <li><strong>Health and Wellness Data:</strong> As part of the App's core functionality, you may input personal health, wellness, and routine data. This data is rigorously associated with your account to provide personalized insights and is never sold to third-party marketing agencies.</li>
                        <li><strong>Payment Information:</strong> If you subscribe to CrownCare Premium, your payment information (such as credit card details) is collected and processed securely by our third-party payment processor, Stripe. We do not directly store your full credit card information on our servers.</li>
                    </ul>

                    <h3>3. How We Use Your Information</h3>
                    <p>We use the information we collect or receive:</p>
                    <ul>
                        <li><strong>To Facilitate Account Creation:</strong> We use Firebase Authentication to securely manage user sign-ups and logins securely.</li>
                        <li><strong>To Provide and Manage our Services:</strong> To run the personalized tools such as tracking routines and generating insights.</li>
                        <li><strong>To Process Payments:</strong> To manage subscriptions and process payments via Stripe.</li>
                    </ul>

                    <h3>4. How We Share Your Information</h3>
                    <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We share data strictly with the following infrastructure providers:</p>
                    <ul>
                        <li><strong>Firebase (Google):</strong> For secure user authentication, database storage, and app analytics.</li>
                        <li><strong>Stripe:</strong> For secure payment processing and subscription management.</li>
                        <li><strong>OpenAI:</strong> To power the AI Coach feature. (Note: Only necessary context is shared with the AI to generate helpful responses; personal identifiable information is heavily minimized).</li>
                    </ul>

                    <h3>5. Security of Your Information</h3>
                    <p>
                        We use administrative, technical, and physical security measures, including Google Firebase's secure infrastructure, to help protect your personal information. While we have taken robust required steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfectly impenetrable.
                    </p>

                    <h3>6. Your Data Rights</h3>
                    <p>
                        Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it entirely. You manage your account data and permanently delete your profile directly within the CrownCare App settings.
                    </p>

                    <h3>7. Contact Us</h3>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact our support team.
                    </p>

                    <div className="mt-8 pt-8 border-t border-neutral-100 text-center">
                        <Link to="/" className="text-primary hover:text-primary-dark font-medium underline">
                            Return to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
