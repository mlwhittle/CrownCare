require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

async function testStripe() {
    try {
        const customer = await stripe.customers.create({
            email: "test@example.com",
            name: "Test User",
        });

        const schedule = await stripe.subscriptionSchedules.create({
            customer: customer.id,
            start_date: 'now',
            end_behavior: 'release',
            phases: [
                {
                    items: [{ price: "price_1Tk4BfIunC29aUxh6vLkhZNe" }],
                    iterations: 3
                },
                {
                    items: [{ price: "price_1Tk4BgIunC29aUxhYBWMKRH7" }],
                    iterations: 12
                },
                {
                    items: [{ price: "price_1Tk4BhIunC29aUxhK0SXVRLK" }]
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
                description: `CrownCare Subscription Setup`
            }
        });
        
        console.log("Session URL:", session.url);
    } catch(err) {
        console.error("STRIPE ERROR:", err.message);
    }
}
testStripe();
