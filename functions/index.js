const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Pulling the Stripe key securely from Firebase Environment Variables to pass GitHub Security Scans
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createStripeAccount = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            // Create a Stripe Express account for the Stylist Affiliate
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
            });

            logger.info('Created new Stripe Express connected account:', account.id);
            res.json({ accountId: account.id });
        } catch (error) {
            logger.error('Error creating Stripe connected account', error);
            res.status(500).json({ error: error.message });
        }
    });
});

exports.createOnboardingLink = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { accountId } = req.body;
            
            if (!accountId) {
                return res.status(400).json({ error: 'accountId is required in request body.' });
            }

            // Generating link for the Stripe-hosted onboarding flow
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `http://localhost:5173/portal?setup=refresh`,
                return_url: `http://localhost:5173/portal?setup=success`,
                type: 'account_onboarding',
            });

            logger.info('Generated onboarding link for account:', accountId);
            res.json({ url: accountLink.url });
        } catch (error) {
            logger.error('Error creating Stripe onboarding link', error);
            res.status(500).json({ error: error.message });
        }
    });
});

// WEBHOOK: Listens for successful out-of-app web payments
exports.stripeWebhook = onRequest((req, res) => {
    cors(req, res, async () => {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            // Verify payload origin using the raw body buffer
            event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
        } catch (err) {
            logger.error(`Webhook signature verification failed:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const email = session.customer_details?.email || session.customer_email;
                if (email) {
                    logger.info(`Web purchase completed for ${email}. Approving in database.`);
                    const normalizedEmail = email.toLowerCase().trim();
                    await admin.firestore().collection('web_subscriptions').doc(normalizedEmail).set({
                        active: true,
                        stripeCustomerId: session.customer,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            } else if (event.type === 'customer.subscription.deleted') {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                
                // Find the email associated with this customer
                const customer = await stripe.customers.retrieve(customerId);
                if (customer && customer.email) {
                    const normalizedEmail = customer.email.toLowerCase().trim();
                    logger.info(`Subscription canceled for ${normalizedEmail}. Revoking access.`);
                    
                    // Mark subscription inactive
                    await admin.firestore().collection('web_subscriptions').doc(normalizedEmail).set({
                        active: false,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    // Revoke from any linked mobile app accounts
                    const usersRef = admin.firestore().collection('users');
                    const snapshot = await usersRef.where('webEmail', '==', normalizedEmail).get();
                    snapshot.forEach(doc => {
                        doc.ref.set({ hasActiveWebSubscription: false }, { merge: true });
                    });
                }
            }
            res.json({ received: true });
        } catch (error) {
            logger.error('Webhook processing failed:', error);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    });
});

// API: Called by the mobile app to securely claim a web purchase via email
exports.claimWebSubscription = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { email, uid } = req.body;
            if (!email || !uid) {
                return res.status(400).json({ error: 'email and uid are required.' });
            }

            const normalizedEmail = email.toLowerCase().trim();
            const subDoc = await admin.firestore().collection('web_subscriptions').doc(normalizedEmail).get();

            if (!subDoc.exists || subDoc.data().active !== true) {
                return res.json({ success: false, message: 'No active subscription found for this email. Check for typos or purchase on the website first!' });
            }

            // Valid subscription exists! Link it to the mobile user.
            await admin.firestore().collection('users').doc(uid).set({
                hasActiveWebSubscription: true,
                webEmail: normalizedEmail
            }, { merge: true });

            logger.info(`Successfully linked web subscription for ${normalizedEmail} to UID: ${uid}`);
            res.json({ success: true, message: 'Web purchase successfully restored! Welcome to Premium.' });
            
        } catch (error) {
            logger.error('Claim Web Subscription Error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

