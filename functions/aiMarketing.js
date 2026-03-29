const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');

// Internal Marketing Engine configuration
// We use process.env to hold the secure Master Keys supplied by the owner
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY || '935bbf29-f07a-44d1-ac9d-a4f4e03272fc'; // Fallback for local testing
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY; 

// The specific Meta Page IDs we will be posting to (Melvin's Social Studio is the main testing hub)
const TARGET_ACCOUNTS = {
    CROWNCARE: { 
        id: process.env.CROWNCARE_FB_PAGE_ID || '955839617620959', 
        type: "Clinical Luxury Haircare & Alopecia Solutions" 
    }
};

/**
 * 1. AI SCRIPT GENERATOR
 * Uses Google Gemini to dynamically draft an engaging Instagram caption and image generation prompt
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
        Then, on a new line, write a detailed 1-sentence comma-separated prompt for an AI Image Generator (like Midjourney/Leonardo) to create a striking, realistic companion image for this post.
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
 * Connects to Leonardo AI using the Master Key to render the image
 */
async function renderImage(imagePrompt) {
    try {
        logger.info(`Sending Prompt to Leonardo AI: ${imagePrompt}`);
        
        // 1. Init Generation
        const initRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${LEONARDO_API_KEY}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                alchemy: true,
                height: 1024,
                width: 1024,
                num_images: 1,
                prompt: imagePrompt,
                modelId: "e316348f-7773-490e-adcd-46757c738eb7", // Leonardo Absolute Reality V1.6
                presetStyle: "CINEMATIC"
            })
        });

        const generationData = await initRes.json();
        if(!generationData.sdGenerationJob) {
             throw new Error("Failed to initialize Leonardo Generation: " + JSON.stringify(generationData));
        }
        
        const generationId = generationData.sdGenerationJob.generationId;
        logger.info(`Leonardo Job Started: ${generationId}. Waiting 15 seconds for rendering...`);

        // 2. Poll for completion (Mocking sleep for 15 seconds)
        await new Promise(r => setTimeout(r, 15000));

        const resultRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${LEONARDO_API_KEY}`
            }
        });

        const resultData = await resultRes.json();
        const imageUrl = resultData?.generations_by_pk?.generated_images?.[0]?.url;

        if (!imageUrl) {
            throw new Error("Leonardo AI failed to return a valid Image URL.");
        }

        return imageUrl;

    } catch (error) {
        logger.error('Error generating Leonardo Image:', error);
        throw error;
    }
}

/**
 * 3. SOCIAL PUBLISHER
 * Executes the Meta Graph API sequence to push the final content live to the Facebook Page.
 * (Will publish to Instagram automatically once the IG account is linked to the FB Page).
 */
async function publishToFacebook(pageId, imageUrl, caption) {
    try {
        const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || 'EAAaNyYE4qE8BRHBADZBFkwidOPfmJkXsZCgv5GxFYqkQZCAIIrcFfUYTfrvzMpN7GHoHjl9miuUvfKdXj4rQ7aZAjpTEUsZCTbSa6p45ZA057axMq1GTMtvoFYPGbIdtCy36qZAsBFKAGlP660m9aN6ZApaWXdhB4b70AOzYZCk4aYb5S3gb7eLcmGom6hjIbRKgkhmGngAggvKu8Xm2SscFyfwZDZD';
        
        if (!PAGE_ACCESS_TOKEN || !pageId) {
            logger.warn(`Skipping actual FB publishing for ${pageId} - Missing Meta Tokens!`);
            return null;
        }

        logger.info(`Publishing exactly 1 Image to FB Page: ${pageId}...`);
        
        // Push Photo directly to the Facebook Page feed
        const url = `https://graph.facebook.com/v19.0/${pageId}/photos`;
        const payload = {
            url: imageUrl,
            message: caption,
            access_token: PAGE_ACCESS_TOKEN
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (data.error) {
            throw new Error(`Meta Graph API Error: ${JSON.stringify(data.error)}`);
        }

        logger.info(`✅ Successfully published Post ID: ${data.id}`);
        return data.id;

    } catch (error) {
        logger.error('Error publishing to Facebook Page:', error);
        throw error;
    }
}

/**
 * THE MASTER CRON JOB
 * Wakes up once a day at 9:00 AM to process all accounts
 */
exports.dailyMarketingSync = onSchedule("0 9 * * *", async (event) => {
    logger.info("Initializing Daily Autonomous Marketing Engine...");

    for (const [accountName, accountDef] of Object.entries(TARGET_ACCOUNTS)) {
        logger.info(`Processing Account: ${accountName} (${accountDef.type})`);
        
        try {
            // Step 1: Brainstorm Script & Prompt
            const { caption, imagePrompt } = await generateDailyConcept(accountDef.type);
            logger.info(`Generated Caption: ${caption}`);
            
            // Step 2: Render Media via Leonardo AI
            const imageUrl = await renderImage(imagePrompt);
            logger.info(`Rendered Image URL: ${imageUrl}`);
            
            // Step 3: Publish to Facebook Page Hub
            await publishToFacebook(accountDef.id, imageUrl, caption);
            logger.info(`✅ Successfully dispatched content for ${accountName}`);

            // Wait 60 seconds before processing next account to avoid API rate limits
            await new Promise(r => setTimeout(r, 60000));
            
        } catch (error) {
            logger.error(`Critical failure while processing ${accountName}:`, error);
        }
    }
});

// A manual trigger button for testing during development without waiting 24 hours
exports.triggerMarketingSync = onRequest(async (req, res) => {
    try {
        await exports.dailyMarketingSync.run({});
        res.json({ success: true, message: 'Autonomous Marketing Engine Triggered Manually.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
