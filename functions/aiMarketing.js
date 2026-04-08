const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');

// Shared dependencies and environment configurations
// Since we are moving to multi-profile, Leonardo key varies by profile.
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY; 

// The mocked "Shared DB/Registry" for profiles
const PROFILES_REGISTRY = [
    {
        id: 'crowncare',
        name: 'CrownCare Mobile',
        type: 'Clinical Luxury Haircare & Alopecia Solutions',
        autoPostDaily: true,
        leonardoKey: process.env.LEONARDO_KEY_CROWNCARE,
        fbPageId: process.env.CROWNCARE_FB_PAGE_ID,
        defaultPlatforms: ['instagram', 'tiktok']
    },
    {
        id: 'selma-church',
        name: 'Selma Church Ops',
        type: 'Church Ministry & Faith Community',
        autoPostDaily: true,
        leonardoKey: process.env.LEONARDO_KEY_CHURCH,
        fbPageId: process.env.CHURCH_FB_PAGE_ID || process.env.FACEBOOK_PAGE_ID,
        defaultPlatforms: ['facebook', 'youtube']
    },
    {
        id: 'fuelflow',
        name: 'FuelFlow Blueprint',
        type: 'Christian Fitness & Health Coaching',
        autoPostDaily: false,
        leonardoKey: process.env.LEONARDO_KEY_FUELFLOW,
        fbPageId: process.env.FUELFLOW_FB_PAGE_ID,
        defaultPlatforms: ['tiktok', 'instagram']
    }
];

/**
 * 1. AI SCRIPT GENERATOR
 */
async function generateDailyConcept(accountType) {
    try {
        if (!GEMINI_API_KEY) {
            return {
                caption: `Discover the ultimate in ${accountType}! 🚀 Link in bio.`,
                imagePrompt: `A beautiful hyper-realistic 8k resolution cinematic photo representing ${accountType}, extremely high quality, masterpiece.`
            };
        }

        const prompt = `You are the world-class marketing manager for a brand focused on: "${accountType}". 
        Write a 2-sentence highly engaging Instagram caption ending with "Hit the link in the bio!". 
        Then, on a new line, write a detailed 1-sentence comma-separated prompt for an AI Image Generator to create a striking, realistic companion image for this post.
        Format EXACTLY like this:
        CAPTION: [your caption]
        IMAGE: [your image prompt]`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        let caption = `Discover the ultimate in ${accountType}! 🚀 Hit the link in the bio!`;
        let imagePrompt = `A stunning high-fashion, ultra-realistic portrait representing ${accountType}, cinematic lighting, 8k resolution.`;

        if (rawText.includes("CAPTION:") && rawText.includes("IMAGE:")) {
            caption = rawText.split("IMAGE:")[0].replace("CAPTION:", "").trim();
            imagePrompt = rawText.split("IMAGE:")[1].trim();
        }

        return { caption, imagePrompt };
    } catch (error) {
        logger.error(`Error generating concept for ${accountType}:`, error);
        throw error;
    }
}

/**
 * 2. MEDIA GENERATOR
 */
async function renderImage(imagePrompt, key) {
    if (!key) throw new Error("No Leonardo Key provided for this profile.");
    
    try {
        logger.info(`Sending Prompt to Leonardo AI: ${imagePrompt}`);
        
        // 1. Init Generation
        const initRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${key}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                alchemy: true, height: 1024, width: 1024, num_images: 1,
                prompt: imagePrompt, modelId: "e316348f-7773-490e-adcd-46757c738eb7", presetStyle: "CINEMATIC"
            })
        });

        const generationData = await initRes.json();
        if(!generationData.sdGenerationJob) {
             throw new Error("Failed to initialize Leonardo: " + JSON.stringify(generationData));
        }
        
        const generationId = generationData.sdGenerationJob.generationId;
        logger.info(`Leonardo Job Started: ${generationId}. Polling...`);

        // 2. Poll for completion
        let imageUrl = null;
        for(let i=0; i<15; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const resultRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                method: 'GET', headers: { 'accept': 'application/json', 'authorization': `Bearer ${key}` }
            });
            const resultData = await resultRes.json();
            const url = resultData?.generations_by_pk?.generated_images?.[0]?.url;
            if (url) {
                imageUrl = url;
                break;
            }
        }

        if (!imageUrl) throw new Error("Leonardo AI failed to return a valid Image URL after polling.");
        return imageUrl;

    } catch (error) {
        logger.error('Error generating Leonardo Image:', error);
        throw error;
    }
}

/**
 * 3. SOCIAL PUBLISHER
 */
async function publishToFacebook(pageId, imageUrl, caption) {
    try {
        const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
        if (!PAGE_ACCESS_TOKEN || !pageId) {
            logger.warn(`Skipping actual FB publishing for ${pageId} - Missing Meta Tokens!`);
            return null;
        }

        logger.info(`Publishing to FB Page: ${pageId}...`);
        const url = `https://graph.facebook.com/v19.0/${pageId}/photos`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl, message: caption, access_token: PAGE_ACCESS_TOKEN })
        });
        const data = await res.json();
        
        if (data.error) throw new Error(`Meta Graph API Error: ${JSON.stringify(data.error)}`);
        logger.info(`✅ Successfully published Post ID: ${data.id}`);
        return data.id;

    } catch (error) {
        logger.error('Error publishing to Facebook Page:', error);
        throw error;
    }
}

/**
 * THE MASTER CRON JOB (MULTI-PROFILE OMNICHANNEL)
 * Wakes up once a day at 9:00 AM to process all opted-in profiles
 */
exports.dailyMarketingSync = onSchedule("0 9 * * *", async (event) => {
    logger.info("Initializing Daily Autonomous Multi-Profile Marketing Engine...");

    for (const profile of PROFILES_REGISTRY) {
        if (!profile.autoPostDaily) {
            logger.info(`[SKIP] Account ${profile.name} is opted out of daily auto-posts.`);
            continue;
        }

        logger.info(`Processing Account: ${profile.name} (${profile.type})`);
        
        try {
            // Step 1: Brainstorm Script & Prompt
            const { caption, imagePrompt } = await generateDailyConcept(profile.type);
            logger.info(`Generated Caption: ${caption}`);
            
            // Step 2: Render Media via Profile-Specific Leonardo AI Key
            const imageUrl = await renderImage(imagePrompt, profile.leonardoKey);
            logger.info(`Rendered Image URL: ${imageUrl}`);
            
            // Step 3: Publish omnichannel payload (Focus on Facebook via Meta Graph)
            if (profile.defaultPlatforms.includes('facebook') && profile.fbPageId) {
                await publishToFacebook(profile.fbPageId, imageUrl, caption);
            }
            logger.info(`✅ Successfully dispatched content for ${profile.name}`);

            // Wait 15 seconds before processing next account to avoid API rate limits
            await new Promise(r => setTimeout(r, 15000));
            
        } catch (error) {
            logger.error(`Critical failure while processing ${profile.name}:`, error);
        }
    }
});

// Manual trigger button
exports.triggerMarketingSync = onRequest(async (req, res) => {
    try {
        await exports.dailyMarketingSync.run({});
        res.json({ success: true, message: 'Multi-Profile Autonomous Marketing Engine Triggered Manually.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
