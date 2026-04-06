// CrownCare — Gemini AI Hair Coach Service
const STORAGE_KEY = 'cc_gemini_key';
const STORAGE_SAVED = 'cc_saved_answers';

export const loadApiKey = () => localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_DEMO_KEY || '';
export const saveApiKey = (key) => localStorage.setItem(STORAGE_KEY, key);

export const loadSavedAnswers = () => {
   try { return JSON.parse(localStorage.getItem(STORAGE_SAVED)) || []; }
   catch { return []; }
};

export const persistSavedAnswers = (answers) => {
   localStorage.setItem(STORAGE_SAVED, JSON.stringify(answers.slice(0, 3)));
};

// Trichologist system prompt — comprehensive hair science knowledge base
export const SYSTEM_PROMPT = `You are a world-class trichologist and hair science expert AI assistant inside the CrownCare app, specifically designed to help women experiencing hair thinning and hair loss.

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

export async function askGemini(question, apiKey, userData = null) {
   const { GoogleGenerativeAI } = await import('@google/generative-ai');
   const genAI = new GoogleGenerativeAI(apiKey);
   const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

   return result.response.text();
}

export async function generateMonthlyNarrative(apiKey, userData) {
   const { GoogleGenerativeAI } = await import('@google/generative-ai');
   const genAI = new GoogleGenerativeAI(apiKey);
   const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

INSTRUCTIONS:
1. Analyze their use of Actives/Serums and correlate it directly to their self-reported Scalp Condition metrics. Praise their dedication to their scalp microbiome.
2. Specifically mention how their *nutrition* combined with their *scalp actives* are neutralizing inflammation and preparing the follicle for dense, uninhibited growth.
3. End with a "Legacy Milestone Prediction" in this exact format: "At your current rate of follicular health, you are on track to reach your Goal Length with optimal density by [Realistic Future Date, e.g., December 2026]."
`;

   try {
       const result = await model.generateContent([
          { text: narrativePrompt }
       ]);
       return result.response.text();
   } catch(e) {
       console.error("Narrative Generation Failed:", e);
       return "Melvin, your data suggests a strong foundation. Keep up your hydration protocols and we project you will hit your Goal Length by December 2026. (AI Generation Timeout)";
   }
}

export async function scanIngredientsWithGemini(apiKey, base64Image, mimeType = 'image/jpeg') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // gemini-2.5-flash is natively multimodal
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Analyze this image of a hair product's ingredient label. 
    Strictly extract the active and notable ingredients. 
    Format the output as a clean, comma-separated list without any conversational filler, introductory text, or markdown formatting (like asterisks or bullet points). 
    If the image is blurry or contains no ingredients, return "Could not read ingredients".
    `;

    try {
        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text().replace(/\n/g, ' ').trim();
    } catch (e) {
        console.error("Vision AI Extraction Failed:", e);
        return "Could not read ingredients — please enter manually";
    }
}

export async function matchProductLabelWithGemini(apiKey, base64Image, userProfileMap, mimeType = 'image/jpeg') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const pStr = userProfileMap && (userProfileMap.hairType || userProfileMap.porosity) 
        ? `Hair Type: ${userProfileMap.hairType}, Porosity: ${userProfileMap.porosity}` 
        : 'Unknown / Average Hair';

    const prompt = `
    You are a clinical Trichologist AI inside the CrownCare hair regrowth app.
    Analyze this photo of a hair product's ingredient label.
    The patient's biological profile is: ${pStr}.
    
    1. Identify the key active and chemical ingredients.
    2. Grade how scientifically compatible these ingredients are with their specific hair profile. For example, low porosity hair struggles with intense protein overload, while high porosity needs heavy sealants like castor oil.
    
    Respond STRICTLY with a valid JSON object in this exact format. Do NOT wrap the JSON in markdown code blocks like \`\`\`json:
    {
      "matchScore": 85,
      "verdict": "Highly Compatible",
      "analysis": "This contains hyaluronic acid and glycerin, which are phenomenal humectants for your low porosity hair. However, it also contains a mild silicone, so be sure to use a clarifying shampoo bi-weekly."
    }
    `;

    try {
        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        let textResult = result.response.text().trim();
        
        if (textResult.startsWith('\`\`\`json')) {
            textResult = textResult.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '').trim();
        } else if (textResult.startsWith('\`\`\`')) {
            textResult = textResult.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '').trim();
        }

        return JSON.parse(textResult);
    } catch (e) {
        console.error("AI Product Match Failed:", e);
        return null;
    }
}

export async function analyzeScalpPhotoWithGemini(apiKey, base64Image, mimeType = 'image/jpeg') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // gemini-2.5-flash is natively multimodal
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    try {
        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    } catch (e) {
        console.error("AI Scalp Audit Failed:", e);
        return "The AI Coach is currently analyzing another patient's data. Please ensure your API key is valid and try this scan again.";
    }
}

export async function scanMealWithGemini(apiKey, base64Image, mimeType = 'image/jpeg') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    try {
        const imagePart = {
            inlineData: {
                data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        let textResult = result.response.text().trim();
        
        // Sanitize any potential markdown block escaping from the AI
        if (textResult.startsWith('\`\`\`json')) {
            textResult = textResult.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '').trim();
        } else if (textResult.startsWith('\`\`\`')) {
            textResult = textResult.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '').trim();
        }

        return JSON.parse(textResult);
    } catch (e) {
        console.error("AI Meal Scan Failed:", e);
        return null;
    }
}

export async function generateEmpatheticResponse(apiKey, text) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are the "CrownCare AI Therapy Companion".
    The patient has just dictated this private journal entry regarding their hair regrowth journey, daily stress, or emotional state:
    "${text}"
    
    1. Respond with immense empathy, clinical grace, and gentle encouragement.
    2. Provide a short 2-3 sentence vocal response that acknowledges their specific feelings.
    3. Do NOT use markdown, emojis, or lists under any circumstances, as this precise text will be synthesized by a text-to-speech engine.
    `;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text().trim();
    } catch (e) {
        console.error("AI Therapy Failed:", e);
        return "I'm here for you. Take a deep breath, and remember that your journey is a marathon, not a sprint.";
    }
}

// --- NEW B2B CONTENT STUDIO AGENTS ---

export async function generateTikTokScripts(apiKey, rawIdea) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are a viral TikTok & Instagram Reels Scriptwriter for CrownCare (a premium women's hair care app) and FuelFlow (a Christian fitness app).
    The founder just brain-dumped this raw audio transcript idea into the studio: "${rawIdea}"
    
    1. Write a highly-engaging, 60-second viral video script.
    2. Include the exact Hook (first 3 seconds).
    3. Include the Caption and 5 specific trending hashtags to post underneath the video.
    `;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text().trim();
    } catch (e) {
        return "Error generating TikTok Script.";
    }
}

export async function generateSEOBlog(apiKey, rawIdea) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an elite SEO Blog Writer.
    The founder brain-dumped this exact idea into the studio: "${rawIdea}"
    
    1. Transform this exact idea into an authoritative, beautifully structured 800-word SEO-optimized blog post.
    2. Include an SEO-optimized H1 Title.
    3. Use H2 headers, bullet points, and high-value insights.
    `;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text().trim();
    } catch (e) {
        return "Error generating Blog Post.";
    }
}

export async function generateNewsletter(apiKey, rawIdea) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an elite Email Marketer specializing in retaining high-ticket subscribers.
    The founder brain-dumped this raw audio transcript: "${rawIdea}"
    
    1. Write a highly-engaging HTML Email Newsletter based specifically on this idea.
    2. Include a compelling Subject Line.
    3. Write the email so it sounds like it comes directly from Pastor Mel (the founder)—warm, encouraging, practical, and slightly pastoral.
    `;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text().trim();
    } catch (e) {
        return "Error generating Newsletter.";
    }
}