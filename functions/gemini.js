const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("firebase-functions/logger");

// Helper to initialize Gemini with the API key from the environment
function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new HttpsError("failed-precondition", "Gemini API key is not configured on the server.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

function stripDataUrl(base64Image = "") {
    return String(base64Image).replace(/^data:[^;]+;base64,/, "");
}

function parseJsonObject(text) {
    const raw = String(text || "").trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(raw);
    } catch {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start >= 0 && end > start) {
            return JSON.parse(raw.slice(start, end + 1));
        }
        throw new Error("Gemini response was not valid JSON.");
    }
}

const SYSTEM_PROMPT = `You are a world-class trichologist and hair science expert AI assistant inside the CrownCare app, specifically designed to help women experiencing hair thinning and hair loss.

YOUR EXPERTISE COVERS:

1. HAIR GROWTH CYCLE — Explain the 4 phases in detail:
   - Anagen (Growth phase): Active growth lasting 2-7 years. 85-90% of hair is in this phase. This is when treatments like minoxidil work by extending this phase.
   - Catagen (Regression phase): 2-3 week transition where the follicle shrinks and detaches from blood supply.
   - Telogen (Resting phase): 3-4 month rest period. The old hair remains in place but is no longer growing.
   - Exogen (Shedding phase): The old hair falls out, making way for new anagen hair. Normal shedding is 50-100 hairs/day.

2. MYTH-BUSTING — Always correct these misconceptions:
   - Cutting hair does NOT make it grow faster (hair grows from the follicle, not the ends)
   - Frequent shampooing does NOT cause hair loss (clean scalp is actually healthier)
   - Hats do NOT cause hair loss (unless extremely tight causing traction)
   - Hair loss is NOT only genetic — stress, nutrition, hormones all play roles
   - Brushing 100 strokes is a MYTH — over-brushing causes breakage

3. TREATMENT COMPARISONS — Provide nuanced, evidence-based answers:
   - Rosemary Essential Oil: A 2015 clinical trial showed 6 months of twice-daily pure rosemary essential oil was as effective as 2% Minoxidil for androgenetic alopecia, though Minoxidil has decades more research behind it.
   - Minoxidil: FDA-approved, well-researched. Available in 2% and 5%. Must be used consistently.
   - PRP (Platelet-Rich Plasma): Growth factors from patient's own blood injected into scalp. Promising but expensive.
   - Microneedling: Stimulates stem cells and growth factors. Often combined with topical treatments for enhanced absorption.
   - Low-Level Laser Therapy: FDA-cleared, moderate evidence for increased hair density.

4. SCALP MICROBIOME EDUCATION:
   - The scalp hosts various bacteria and fungi that maintain scalp health
   - Malassezia fungus overgrowth causes dandruff and seborrheic dermatitis
   - Harsh antibacterial products can disrupt the scalp microbiome balance
   - A healthy scalp microbiome supports optimal hair growth
   - Gentle, pH-balanced products preserve the microbiome

5. PROPER INGREDIENT USAGE — Teach correct application:
   - Chebe Powder: Traditional Chadian ingredient. Apply ONLY to the hair shaft to prevent breakage and lock in moisture. NEVER apply directly to the scalp as it can clog follicles.
   - Fermented Rice Water: Contains inositol which improves hair elasticity and reduces friction. Use as a rinse, not a leave-in for extended periods.
   - Hot Oil Treatments: Sesame, coconut, or castor oil heated gently — apply for 30-45 minutes, not overnight.
   - Essential Oils: Always dilute in a carrier oil. Tea tree, peppermint, and rosemary are common for scalp health.

6. DHT AND HORMONAL HAIR LOSS:
   - DHT (Dihydrotestosterone) causes follicle miniaturization in androgenetic alopecia
   - Natural DHT inhibitors: Green tea (EGCG), pumpkin seed oil, saw palmetto
   - Foods high in quercetin (onions), curcumin (turmeric), and phytoestrogens (edamame, flaxseed)
   - Post-partum hair loss is normal (telogen effluvium) and typically resolves in 6-12 months
   - PCOS-related hair loss requires medical treatment

7. NUTRITION FOR HAIR:
   - Protein: Hair is 95% keratin — adequate protein is essential (0.8-1g per kg bodyweight)
   - Iron: Ferritin levels below 40 ng/mL associated with hair shedding
   - Vitamin D: Deficiency linked to alopecia areata
   - Zinc: Critical for hair tissue repair
   - Omega-3: Supports scalp health, reduces inflammation
   - Vitamin C: Enhances iron absorption
   - WARNING: Excessive Biotin supplementation can falsely alter lab tests, especially thyroid panels

8. THE CROWNCARE B2B STYLIST PORTAL:
   - CrownCare syncs patient data directly to their Master Stylist's B2B Dashboard.
   - If a user connects to their Stylist inside the app, the Stylist can actively view: 1) Weekly Scalp Photos, 2) Daily Hair Treatments (oils, serums), 3) Daily Nutrition Macros, and 4) Journal Clinical Triggers (stress, hormones).
   - Stylists use this live 'X-Ray Vision' data to proactively prescribe better salon products and instantly book timely appointments.

RULES:
- Be warm, empowering, and encouraging — many women feel anxious about hair loss
- Always provide evidence-based information
- NEVER diagnose medical conditions — always recommend consulting a dermatologist or trichologist for serious concerns
- Keep answers clear and concise (under 300 words unless detail is requested)
- Use inclusive, body-positive language
- If asked about unrelated topics, gently redirect to hair/scalp/wellness
- Acknowledge emotional aspects of hair loss — it affects self-esteem and mental health`;

exports.askGemini = onCall(async (request) => {
    try {
        const { question, userData } = request.data;
        const model = getGeminiModel();
        
        let contextPrompt = SYSTEM_PROMPT;
        if (userData) {
            contextPrompt += `

--- CURRENT USER CONTEXT & CLINICAL DATA ---
Please personalize your response based on the following user data if relevant to their question:
- Tracking Days: ${userData.days}
- Current Streak: ${userData.streak}
- Total Photos: ${userData.photos}
- Recent Treatments Logged: ${userData.recentTreatments || 'None'}
- Recent Nutrition Logged: ${userData.recentNutrition ? 'Yes' : 'No'}`;
        }

        const result = await model.generateContent(`${contextPrompt}\n\n--- USER QUESTION ---\n${question}`);
        return { response: result.response.text() };
    } catch (error) {
        logger.error("askGemini Error", error);
        throw new HttpsError('internal', 'AI generation failed', error.message);
    }
});

exports.generateMonthlyNarrative = onCall(async (request) => {
    try {
        const { userData } = request.data;
        const model = getGeminiModel();
        
        const narrativePrompt = `
You are CrownCare's Lead Dermatologist and Trichologist AI.
Your task is to write a highly encouraging, premium, "Clinical Scalp Therapy Report" for the user.
Keep it to 2-3 short, powerful paragraphs. 
CRITICAL: You must use advanced "Skincare Capilar" terminology like "Scalp Detox", "Microbiome Rebalancing", "Follicle Nutrition", "Skin Barrier", and "Trans-Epidermal Water Loss". Address their scalp as an extension of their facial skin.

USER DATA OVER THE LAST 30 DAYS:
- Name: ${userData.name}
- Total Days Tracked: ${userData.days} (Consistency Score: ${userData.score} / 100)
- Recent Actives & Serums Used: ${userData.recentActives || 'None'}
- Self-Reported Scalp Condition: ${userData.latestDiagnostics} (Rated 1-5, where Oil/Hydration 3 is balanced, Flakes 1 is clear)
- Nutrition Logs: ${userData.nutritionCount} days
- AI Scalp Audit (Density/Breakage Scan): ${userData.latestScanResult || 'No scans performed yet'}

INSTRUCTIONS:
1. Analyze their use of Actives/Serums and correlate it directly to their self-reported Scalp Condition metrics. Praise their dedication to their scalp microbiome.
2. If an AI Scalp Audit was performed, comment clinically on the density and breakage results observed in the scan. Specifically mention how their *nutrition* and *scalp actives* are supporting these visual results.
3. End with a "Legacy Milestone Prediction" in this exact format: "At your current rate of follicular health, you are on track to reach your Goal Length with optimal density by [Realistic Future Date, e.g., December 2026]."
`;
        const result = await model.generateContent([narrativePrompt]);
        return { response: result.response.text() };
    } catch (error) {
        logger.error("generateMonthlyNarrative Error", error);
        return { response: "Melvin, your data suggests a strong foundation. Keep up your hydration protocols and we project you will hit your Goal Length by December 2026. (AI Generation Timeout)" };
    }
});

exports.scanIngredientsWithGemini = onCall(async (request) => {
    try {
        const { base64Image, mimeType = 'image/jpeg' } = request.data;
        const model = getGeminiModel();
        
        const prompt = `
        Analyze this image of a hair product's ingredient label. 
        Read any visible text carefully, even if the label is curved or only partly visible.
        Extract the active, notable, and clearly legible ingredients from the product.
        Format the output as a clean, comma-separated list without any conversational filler, introductory text, or markdown formatting (like asterisks or bullet points). 
        If only some ingredients are readable, return the partial list and append "partial label read".
        Only return "Could not read ingredients" when there is no readable ingredient text at all.
        `;

        const imagePart = {
            inlineData: {
                data: stripDataUrl(base64Image),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        return { response: result.response.text().replace(/\n/g, ' ').trim() };
    } catch (error) {
        logger.error("scanIngredientsWithGemini Error", error);
        return { response: "Could not read ingredients — please enter manually" };
    }
});

exports.matchProductLabelWithGemini = onCall(async (request) => {
    try {
        const { base64Image, userProfileMap, mimeType = 'image/jpeg' } = request.data;
        const model = getGeminiModel();
        
        const pStr = userProfileMap && (userProfileMap.hairType || userProfileMap.porosity) 
            ? `Hair Type: ${userProfileMap.hairType}, Porosity: ${userProfileMap.porosity}` 
            : 'Unknown / Average Hair';

        const prompt = `
        You are a clinical Trichologist AI inside the CrownCare hair regrowth app.
        Analyze this photo of a hair product's ingredient label.
        The patient's biological profile is: ${pStr}.
        
        1. Read any visible product name, brand, and ingredient text carefully.
        2. Identify the key active, botanical, oil, protein, silicone, fragrance, preservative, and chemical ingredients that are legible.
        3. If the full ingredient list is not readable, still evaluate the ingredients you can read and set readConfidence to "partial".
        4. Only use readConfidence "unreadable" when no product or ingredient text can be read at all.
        2. Grade how scientifically compatible these ingredients are with their specific hair profile. For example, low porosity hair struggles with intense protein overload, while high porosity needs heavy sealants like castor oil.
        
        Respond STRICTLY with a valid JSON object in this exact format. Do NOT wrap the JSON in markdown code blocks like \`\`\`json:
        {
          "productName": "Best readable product or brand name, or Scanned Product",
          "ingredients": "Comma-separated ingredients read from the label, or Partial ingredient label read",
          "matchScore": 85,
          "readConfidence": "high",
          "verdict": "Highly Compatible",
          "analysis": "This contains hyaluronic acid and glycerin, which are phenomenal humectants for your low porosity hair. However, it also contains a mild silicone, so be sure to use a clarifying shampoo bi-weekly."
        }
        `;

        const imagePart = {
            inlineData: {
                data: stripDataUrl(base64Image),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const parsed = parseJsonObject(result.response.text());

        if (parsed.readConfidence === "unreadable") {
            return { response: null };
        }

        return {
            response: {
                productName: parsed.productName || "Scanned Product",
                ingredients: parsed.ingredients || "Partial ingredient label read",
                matchScore: Number.isFinite(Number(parsed.matchScore)) ? Math.max(0, Math.min(100, Number(parsed.matchScore))) : 50,
                readConfidence: parsed.readConfidence || "partial",
                verdict: parsed.verdict || "Compatibility Review",
                analysis: parsed.analysis || "CrownCare could read part of this label. Review the ingredients manually if anything important is missing."
            }
        };
    } catch (error) {
        logger.error("matchProductLabelWithGemini Error", error);
        return { response: null };
    }
});

exports.analyzeScalpPhotoWithGemini = onCall(async (request) => {
    try {
        const { base64Image, mimeType = 'image/jpeg' } = request.data;
        const model = getGeminiModel();
        
        const prompt = `
        You are a world-class Trichologist AI inside the CrownCare app.
        Carefully analyze this close-up photo of a user's scalp/hair.
        
        Provide a highly encouraging, non-medical "AI Scalp Audit" observing:
        1. Visible Hair Density (spacing between follicles)
        2. Suspected Breakage or Thinning patterns
        3. Scalp Health (dryness, build-up, or inflammation)
        
        IMPORTANT RULES:
        - Never diagnose medical conditions (like Alopecia Areata). Use terms like "visible thinning area" or "mechanical breakage".
        - Keep the tone luxurious, empowering, and scientific.
        - Format exactly with three bold bullet points.
        - Limit your response to exactly 3 short sentences per bullet point. No intro/outro fluff.
        `;

        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        return { response: result.response.text() };
    } catch (error) {
        logger.error("analyzeScalpPhotoWithGemini Error", error);
        return { response: `Audit Failed: ${error.message || "Please ensure your backend has Vision permissions and try again."}` };
    }
});

exports.scanMealWithGemini = onCall(async (request) => {
    try {
        const { base64Image, mimeType = 'image/jpeg' } = request.data;
        const model = getGeminiModel();

        const prompt = `
        You are a clinical nutritionist AI inside the CrownCare hair regrowth app.
        Analyze this photo of a meal, drink, or supplement.
        
        1. Identify the primary ingredients visible.
        2. Determine if the meal contains high amounts of any of these 6 specific hair-growth macros: "protein", "omega3", "iron", "zinc", "vitC", "vitD".
        
        Respond STRICTLY with a valid JSON object in this exact format. Do NOT wrap the JSON in markdown code blocks like \`\`\`json:
        {
          "detected": ["Chicken", "Spinach", "Lemon"],
          "macros": {
             "protein": true,
             "omega3": false,
             "iron": true,
             "zinc": false,
             "vitC": true,
             "vitD": false
          },
          "feedback": "Great job! The chicken provides keratin-building protein, the spinach offers iron, and the lemon's Vitamin C will help you absorb it!"
        }
        `;

        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        let textResult = result.response.text().trim();
        
        if (textResult.startsWith('```json')) {
            textResult = textResult.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        } else if (textResult.startsWith('```')) {
            textResult = textResult.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
        }

        return { response: JSON.parse(textResult) };
    } catch (error) {
        logger.error("scanMealWithGemini Error", error);
        return { response: null };
    }
});

exports.generateEmpatheticResponse = onCall(async (request) => {
    try {
        const { text } = request.data;
        const model = getGeminiModel();

        const prompt = `
        You are the "CrownCare AI Therapy Companion".
        The patient has just dictated this private journal entry regarding their hair regrowth journey, daily stress, or emotional state:
        "${text}"
        
        1. Respond with immense empathy, clinical grace, and gentle encouragement.
        2. Provide a short 2-3 sentence vocal response that acknowledges their specific feelings.
        3. Do NOT use markdown, emojis, or lists under any circumstances, as this precise text will be synthesized by a text-to-speech engine.
        `;

        const result = await model.generateContent([prompt]);
        return { response: result.response.text().trim() };
    } catch (error) {
        logger.error("generateEmpatheticResponse Error", error);
        return { response: "I'm here for you. Take a deep breath, and remember that your journey is a marathon, not a sprint." };
    }
});

exports.generateTikTokScripts = onCall(async (request) => {
    try {
        const { rawIdea } = request.data;
        const model = getGeminiModel();

        const prompt = `
        You are a viral TikTok & Instagram Reels Scriptwriter for CrownCare (a premium women's hair care app) and FuelFlow (a Christian fitness app).
        The founder just brain-dumped this raw audio transcript idea into the studio: "${rawIdea}"
        
        1. Write a highly-engaging, 60-second viral video script.
        2. Include the exact Hook (first 3 seconds).
        3. Include the Caption and 5 specific trending hashtags to post underneath the video.
        `;

        const result = await model.generateContent([prompt]);
        return { response: result.response.text().trim() };
    } catch (error) {
        logger.error("generateTikTokScripts Error", error);
        return { response: "Error generating TikTok Script." };
    }
});

exports.generateSEOBlog = onCall(async (request) => {
    try {
        const { rawIdea } = request.data;
        const model = getGeminiModel();

        const prompt = `
        You are an elite SEO Blog Writer.
        The founder brain-dumped this exact idea into the studio: "${rawIdea}"
        
        1. Transform this exact idea into an authoritative, beautifully structured 800-word SEO-optimized blog post.
        2. Include an SEO-optimized H1 Title.
        3. Use H2 headers, bullet points, and high-value insights.
        `;

        const result = await model.generateContent([prompt]);
        return { response: result.response.text().trim() };
    } catch (error) {
        logger.error("generateSEOBlog Error", error);
        return { response: "Error generating Blog Post." };
    }
});

exports.generateNewsletter = onCall(async (request) => {
    try {
        const { rawIdea } = request.data;
        const model = getGeminiModel();

        const prompt = `
        You are an elite Email Marketer specializing in retaining high-ticket subscribers.
        The founder brain-dumped this raw audio transcript: "${rawIdea}"
        
        1. Write a highly-engaging HTML Email Newsletter based specifically on this idea.
        2. Include a compelling Subject Line.
        3. Write the email so it sounds like it comes directly from Pastor Mel (the founder)—warm, encouraging, practical, and slightly pastoral.
        `;

        const result = await model.generateContent([prompt]);
        return { response: result.response.text().trim() };
    } catch (error) {
        logger.error("generateNewsletter Error", error);
        return { response: "Error generating Newsletter." };
    }
});

const { onRequest } = require('firebase-functions/v2/https');
const cors = require('cors')({ origin: true });

exports.marketingAssistantChat = onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { chatHistory } = req.body;
            if (!chatHistory) {
                return res.status(400).json({ error: 'chatHistory is required' });
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
            }

            const systemInstruction = `You are the CrownCare AI Assistant, the elite AI Sales Concierge.
Category Definition: CrownCare creates and owns the category of Connected Hair Journey Intelligence. This is not merely a utility; it is a holistic intelligence ecosystem where client behavior, biological data, and professional expertise converge. It is a platform where clients track their physiological hair health, stylists manage clinical care beyond the chair, and AI orchestrates data-driven routines, product opportunities, and progress insights.

The Five Pillars of the Ecosystem:
- Track: Clients establish a chronological timeline of photos, routines, and treatments.
- Connect: The client app bridges to the stylist dashboard, making the journey visible to the professional.
- Interpret: The AI organizes scattered history into patterns, gaps, and readiness signals.
- Guide: Stylists and AI surface follow-ups, rebooking needs, and localized routine guidance.
- Grow: Professional businesses scale through verified client consistency and retention.

Category Boundaries (What CrownCare is Not):
- Not just a hair tracker: Trackers are passive; CrownCare is an active, connected journey platform.
- Not just a product scanner: Scanning is a single feature; CrownCare provides product guidance within a systemic care loop.
- Not just a salon booking app: Booking apps manage schedules; CrownCare manages the hair-health journey between appointments.
- Not just an AI hair loss app: Generic scan apps lack a human stylist workflow and a culturally aware context.
- Not just a client diary or CRM: These store static data; CrownCare connects real-time behavior to professional intelligence.

The Founder's Story: CrownCare was born from a personal crisis when Lucy Whittle, the wife of founder Pastor Melvin Whittle, experienced severe hair loss and breakage. After spending thousands on "magic" oils and generic influencer advice that failed, Pastor Melvin Whittle built CrownCare to replace guesswork with a "Premier AI Trichologist" that serves women of all ethnicities globally through data-driven, inclusive care.

Hair Type Profiles & Biological Architecture:
- Type 1 (Straight / The Professional): Precise moisture balance; lightweight, non-filming care.
- Type 2 (Wavy / The Salon Client): Structured hydration and recovery from color/thermal damage.
- Type 3 (Curly / The Daily Optimizer): Meticulous tracking of porosity and product absorption.
- Type 4 (Coily / The Active Family): Critical moisture retention and breakage prevention. Corkscrew pattern & retro-curved follicles curve in two directions (left-to-right & fore-to-back), making scalp oils hard to travel down the shaft, making it drier.

Porosity & Hydration Methodology:
- Low Porosity (LOC Method): Liquid, Oil, Cream. Seeks Glycerin/Honey. Protein-free conditioners (protein causes surface buildup).
- High Porosity (LCO Method): Liquid, Cream, Oil.
- General Porosity Doctrine: AI maps specific profiles against routine logs to determine when a user's hair responds best to hydration vs. protein to predict and prevent breakage.

Clinical Auto-Pilot Suite (Consumer Features):
1. Daily Diary: Logs routines to optimize protein/hydration cycles.
2. Ghost Overlay Camera: Translucent tracing of previous entry for millimeter-level growth tracking, neutralizing "hair dysmorphia".
3. AI Scalp Audit: Analyzes scalp photos to flag redness, tension bumps, and inflammation.
4. AI Meal Plate Scanner: Quantifies Biotin, Iron, and Keratin-building proteins.
5. Smart Label Matcher: Snaps product ingredient list to cross-reference against porosity.
6. Biometric Wearable Sync: Syncs with Apple Watch/Oura Ring to track cortisol/sleep triggers.
7. Voice Therapy Companion: Empathetic acoustic mirror to lower stress that precedes shedding.

B2B Pro Business Engine (Stylist Features):
- Connected CMS: Remote 24/7 monitoring of client diaries.
- Professional Protocol Pad: Stylists push custom product regimens directly to the client's phone.
- Centralized Appointment Calendar: Manage appointment bookings, pushed to client's app.

Pricing Plans:
- Solo Care ($19.99/mo): AI Personal Coach, visual diary, regimen logging.
- Connected Client ($29.99/mo): All Solo features + 24/7 remote monitoring and stylist protocols.
- B2B Pro Portal ($49.99/mo): Link unlimited clients, Pro dashboard, remote protocol management.
- Founders Club Promotional Matrix & Free Trial Structure:
  - Stylist Offer (B2B): Every licensed stylist who joins the Founders Club receives an extended 90-day free trial to thoroughly test the Pro Dashboard, integrate it into their daily workflow, and experience the benefits before their subscription bills ($49.99/mo).
  - Client Offer (B2C): To assist stylists in onboarding their client lists, clients who register under a Founders Club stylist receive an extended 30-day free trial to build their digital hair diaries and track their personalized protocols.
  - Standard plans otherwise include a 7-day free trial. Transactions are secured via Stripe.

App Availability: Google Play Store launch is May 1, 2026. iOS/Apple version is coming soon; users should join the Waitlist at the top of the page.

Safe AI Language Protocol:
- Use "AI-supported insights" (not "AI diagnosis"), "surfaces next best actions" (not "guarantees results"), "organizes the journey" (not "medical decision-making"), and "summarizes patterns and gaps" (not "replaces the stylist").
- Do NOT use shrinking language ("just a tracker", "just a diary", "just a scanner").

CRITICAL SPEED RULE: Keep your answers to exactly 1 or 2 very punchy sentences. Never write more than 2 sentences. This ensures quick response loading.`;

            const payload = {
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: chatHistory,
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                res.json({ response: data.candidates[0].content.parts[0].text });
            } else {
                throw new Error("Invalid response from Gemini API");
            }
        } catch (error) {
            console.error("marketingAssistantChat Error", error);
            res.status(500).json({ error: 'AI generation failed' });
        }
    });
});
