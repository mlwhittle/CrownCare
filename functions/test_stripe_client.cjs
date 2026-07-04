require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

async function testStripeClient() {
    try {
        const customer = await stripe.customers.create({
            email: "client_test@example.com",
            name: "Test Client",
        });

        // trial_end logic exactly like index.js
        const trialEnd = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

        const schedule = await stripe.subscriptionSchedules.create({
            customer: customer.id,
            start_date: 'now',
            end_behavior: 'release',
            phases: [
                {
                    items: [{ price: "price_1Tk4BiIunC29aUxhQJ6zrCzJ" }],
                    iterations: 3,
                    trial_end: trialEnd
                },
                {
                    items: [{ price: "price_1Tk4BjIunC29aUxhep9gWFN2" }]
                }
            ]
        });

        console.log("Schedule ID:", schedule.id);
        
        const session = await stripe.checkout.sessions.create({
            mode: 'setup',
            currency: 'usd',
            customer: customer.id,
            success_url: `https://crowncare-marketing-116e4.web.app/success.html`,
            cancel_url: `https://crowncare-marketing-116e4.web.app/pricing.html`,
            setup_intent_data: {
                description: `CrownCare Client Subscription Setup`
            }
        });
        
        console.log("Session URL:", session.url);
    } catch(err) {
        console.error("STRIPE ERROR:", err.message);
    }
}
testStripeClient();
