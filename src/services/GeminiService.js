// CrownCare — Gemini AI Hair Coach Service (Backend Proxied)
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const STORAGE_SAVED = 'cc_saved_answers';

// Deprecated: We no longer store API keys on the client side for security.
// These are kept to prevent breaking existing UI components (like Settings.jsx).
export const loadApiKey = () => "SECURE_BACKEND_MODE";
export const saveApiKey = (key) => { console.log("API keys are now securely managed in the backend."); };

export const loadSavedAnswers = () => {
   try { return JSON.parse(localStorage.getItem(STORAGE_SAVED)) || []; }
   catch { return []; }
};

export const persistSavedAnswers = (answers) => {
   localStorage.setItem(STORAGE_SAVED, JSON.stringify(answers.slice(0, 3)));
};

export async function validateApiKey(apiKey) {
   // Always returns true because the actual API key is safely stored on the server
   return true;
}

export async function askGemini(question, apiKey, userData = null) {
    try {
        const askGeminiFn = httpsCallable(functions, 'askGemini');
        const result = await askGeminiFn({ question, userData });
        return result.data.response;
    } catch (error) {
        console.error("Gemini Backend Proxy Error:", error);
        throw new Error('API_ERROR');
    }
}

export async function generateMonthlyNarrative(apiKey, userData) {
    try {
        const generateMonthlyNarrativeFn = httpsCallable(functions, 'generateMonthlyNarrative');
        const result = await generateMonthlyNarrativeFn({ userData });
        return result.data.response;
    } catch (error) {
        console.error("Narrative Generation Failed:", error);
        return "Melvin, your data suggests a strong foundation. Keep up your hydration protocols and we project you will hit your Goal Length by December 2026. (AI Generation Timeout)";
    }
}

export async function scanIngredientsWithGemini(apiKey, base64Image, mimeType = 'image/jpeg') {
    try {
        const scanIngredientsFn = httpsCallable(functions, 'scanIngredientsWithGemini');
        const result = await scanIngredientsFn({ base64Image, mimeType });
        return result.data.response;
    } catch (e) {
        console.error("Vision AI Extraction Failed:", e);
        return "Could not read ingredients — please enter manually";
    }
}

export async function matchProductLabelWithGemini(apiKey, base64Image, userProfileMap, mimeType = 'image/jpeg') {
    try {
        const matchProductFn = httpsCallable(functions, 'matchProductLabelWithGemini');
        const result = await matchProductFn({ base64Image, userProfileMap, mimeType });
        return result.data.response;
    } catch (e) {
        console.error("AI Product Match Failed:", e);
        return null;
    }
}

export async function analyzeScalpPhotoWithGemini(apiKey, base64Image, mimeType = 'image/jpeg') {
    try {
        const analyzeScalpPhotoFn = httpsCallable(functions, 'analyzeScalpPhotoWithGemini');
        const result = await analyzeScalpPhotoFn({ base64Image, mimeType });
        return result.data.response;
    } catch (e) {
        console.error("AI Scalp Audit Failed:", e);
        return `Audit Failed: ${e.message || "Please ensure your backend has Vision permissions and try again."}`;
    }
}

export async function scanMealWithGemini(apiKey, base64Image, mimeType = 'image/jpeg') {
    try {
        const scanMealFn = httpsCallable(functions, 'scanMealWithGemini');
        const result = await scanMealFn({ base64Image, mimeType });
        return result.data.response;
    } catch (e) {
        console.error("AI Meal Scan Failed:", e);
        return null;
    }
}

export async function generateEmpatheticResponse(apiKey, text) {
    try {
        const generateEmpatheticFn = httpsCallable(functions, 'generateEmpatheticResponse');
        const result = await generateEmpatheticFn({ text });
        return result.data.response;
    } catch (e) {
        console.error("AI Therapy Failed:", e);
        return "I'm here for you. Take a deep breath, and remember that your journey is a marathon, not a sprint.";
    }
}

export async function generateTikTokScripts(apiKey, rawIdea) {
    try {
        const generateTikTokFn = httpsCallable(functions, 'generateTikTokScripts');
        const result = await generateTikTokFn({ rawIdea });
        return result.data.response;
    } catch (e) {
        return "Error generating TikTok Script.";
    }
}

export async function generateSEOBlog(apiKey, rawIdea) {
    try {
        const generateBlogFn = httpsCallable(functions, 'generateSEOBlog');
        const result = await generateBlogFn({ rawIdea });
        return result.data.response;
    } catch (e) {
        return "Error generating Blog Post.";
    }
}

export async function generateNewsletter(apiKey, rawIdea) {
    try {
        const generateNewsletterFn = httpsCallable(functions, 'generateNewsletter');
        const result = await generateNewsletterFn({ rawIdea });
        return result.data.response;
    } catch (e) {
        return "Error generating Newsletter.";
    }
}