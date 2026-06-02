const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Pulling the Stripe key securely from Firebase Environment Variables to pass GitHub Security Scans
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

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
                refresh_url: `https://crowncare-116e4.web.app/portal?setup=refresh`,
                return_url: `https://crowncare-116e4.web.app/portal?setup=success`,
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
            const allowedVips = ['mlwhittle@gmail.com', 'admin@crowncare.net'];

            let isActive = false;
            if (allowedVips.includes(normalizedEmail)) {
                isActive = true;
            } else {
                const subDoc = await admin.firestore().collection('web_subscriptions').doc(normalizedEmail).get();
                if (subDoc.exists && subDoc.data().active === true) {
                    isActive = true;
                }
            }

            if (!isActive) {
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

// ==========================================
// INTERNAL AI MARKETING ENGINE (CrownCare & PastorWhittle)
// ==========================================
const aiMarketing = require('./aiMarketing');
exports.dailyMarketingSync = aiMarketing.dailyMarketingSync;
exports.triggerMarketingSync = aiMarketing.triggerMarketingSync;

// ==========================================
// AI COMMAND CENTER: LEAD GEN TRACKING
// ==========================================

// 1x1 Transparent GIF Buffer for the Tracking Pixel
const transparentGif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

exports.trackEmailOpen = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { uid, campaign } = req.query;
            if (uid) {
                const standardizedUid = uid.toLowerCase().trim();
                const trackingRef = admin.firestore().collection('email_tracking').doc(standardizedUid);
                
                await trackingRef.set({
                    openCount: admin.firestore.FieldValue.increment(1),
                    lastOpenedAt: admin.firestore.FieldValue.serverTimestamp(),
                    campaignsOpened: admin.firestore.FieldValue.arrayUnion(campaign || 'unknown')
                }, { merge: true });
                
                logger.info(`Email Opened by: ${standardizedUid} for campaign ${campaign}`);
            }
        } catch (error) {
            logger.error('Pixel Tracking Error:', error);
        }

        // Always return the invisible 1x1 image so the email client doesn't show a broken image box
        res.set('Content-Type', 'image/gif');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.status(200).send(transparentGif);
    });
});

exports.trackEmailClick = onRequest((req, res) => {
    cors(req, res, async () => {
        const { uid, url, campaign } = req.query;
        const targetUrl = url ? decodeURIComponent(url) : 'https://crowncare-marketing-116e4.web.app';

        try {
            if (uid) {
                const standardizedUid = uid.toLowerCase().trim();
                const trackingRef = admin.firestore().collection('email_tracking').doc(standardizedUid);
                
                await trackingRef.set({
                    clickCount: admin.firestore.FieldValue.increment(1),
                    lastClickedAt: admin.firestore.FieldValue.serverTimestamp(),
                    campaignLinksClicked: admin.firestore.FieldValue.arrayUnion({
                        url: targetUrl,
                        campaign: campaign || 'unknown',
                        timestamp: new Date().toISOString()
                    })
                }, { merge: true });
                
                logger.info(`Link Clicked by: ${standardizedUid} to ${targetUrl}`);
            }
        } catch (error) {
            logger.error('Click Tracking Error:', error);
        }

        // Redirect the user immediately to the destination they clicked
        res.redirect(302, targetUrl);
    });
});

// ==========================================
// GEMINI AI BACKEND FUNCTIONS
// ==========================================
const gemini = require('./gemini');
exports.askGemini = gemini.askGemini;
exports.generateMonthlyNarrative = gemini.generateMonthlyNarrative;
exports.scanIngredientsWithGemini = gemini.scanIngredientsWithGemini;
exports.matchProductLabelWithGemini = gemini.matchProductLabelWithGemini;
exports.analyzeScalpPhotoWithGemini = gemini.analyzeScalpPhotoWithGemini;
exports.scanMealWithGemini = gemini.scanMealWithGemini;
exports.generateEmpatheticResponse = gemini.generateEmpatheticResponse;
exports.generateTikTokScripts = gemini.generateTikTokScripts;
exports.generateSEOBlog = gemini.generateSEOBlog;
exports.generateNewsletter = gemini.generateNewsletter;
exports.marketingAssistantChat = gemini.marketingAssistantChat;
// ==========================================
// AUTO-NOTIFICATION FOR NEW FOUNDER LEADS
// ==========================================
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");

// SMTP Transporter configuration using SendGrid
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
        user: 'apikey', // This must be the exact literal string 'apikey'
        pass: process.env.SENDGRID_API_KEY
    }
});

exports.onFoundersLeadCreated = onDocumentCreated("founders_leads/{leadId}", async (event) => {
    const snap = event.data;
    if (!snap) {
        logger.error("No snapshot data found for trigger event");
        return;
    }
    
    const lead = snap.data();
    const { name, email, salon } = lead;

    logger.info(`Processing new lead document: ${email} (${name})`);

    // 1. Send Alert Email to Admin (crowncare@crowncare.net)
    const adminMailOptions = {
        from: '"CrownCare Lead Alerts" <crowncare@crowncare.net>',
        to: 'crowncare@crowncare.net',
        subject: `New Stylist Lead: ${name} (${salon})`,
        text: `A new stylist has registered for the Founders Program!\n\nName: ${name}\nEmail: ${email}\nSalon: ${salon}\nTimestamp: ${new Date().toISOString()}`
    };

    // 2. Send Welcome Email & Guide to the Stylist
    const welcomeMailOptions = {
        from: '"Melvin Whittle | CrownCare Pro" <crowncare@crowncare.net>',
        to: email,
        subject: 'Welcome to the CrownCare Pro Stylist Founders Program!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
                <h2 style="color: #001F3F; font-family: Georgia, serif;">Welcome to the Family, ${name}!</h2>
                <p>We are thrilled to welcome you and <strong>${salon}</strong> to our exclusive 2026 Founders Program launch cohort.</p>
                
                <p>Here are the details to activate your 90-day free partnership and access your free B2B resources:</p>
                
                <div style="background-color: #f7fafc; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #001F3F;">Your 90-Day Activation Code:</p>
                    <p style="margin: 5px 0 0 0; font-size: 20px; font-family: monospace; font-weight: bold; color: #D4AF37; letter-spacing: 2px;">STYLIST-FOUNDERS</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Enter this code during checkout inside the mobile app to activate your trial.</p>
                </div>

                <h3 style="color: #001F3F; font-family: Georgia, serif;">Next Steps:</h3>
                <ol>
                    <li>
                        <strong>Download the Mobile App:</strong>
                        <br>
                        <a href="https://apps.apple.com/us/app/crowncare-ai/id6502206775" target="_blank" style="color: #003366; text-decoration: underline;">Download for iPhone</a> | 
                        <a href="https://play.google.com/store/apps/details?id=net.crowncare.app" target="_blank" style="color: #003366; text-decoration: underline;">Download for Android</a>
                    </li>
                    <li style="margin-top: 10px;">
                        <strong>Access Your Pro Web Dashboard:</strong>
                        <br>
                        Visit <a href="https://pro.crowncare.net" target="_blank" style="color: #003366; text-decoration: underline;">pro.crowncare.net</a> from your desktop computer using your login credentials.
                    </li>
                    <li style="margin-top: 10px;">
                        <strong>Read Your Free Playbook:</strong>
                        <br>
                        Review your guide on increasing ticket prices by 25% using porosity tracking:
                        <a href="https://crowncare-116e4.web.app/clinical_hair_guide.html" target="_blank" style="color: #D4AF37; font-weight: bold; text-decoration: underline;">Open My Business Guide</a>
                    </li>
                </ol>

                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 13px; color: #666; margin-bottom: 0;">
                    If you have any questions or need onboarding support, contact us directly at <a href="mailto:crowncare@crowncare.net" style="color: #003366;">crowncare@crowncare.net</a>.
                </p>
            </div>
        `
    };

    try {
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(welcomeMailOptions)
        ]);
        logger.info(`Emails successfully sent for lead: ${email}`);
    } catch (err) {
        logger.error(`Error sending emails for lead ${email}:`, err);
    }
});

