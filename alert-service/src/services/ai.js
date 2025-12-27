import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini lazily
// NOTE: Make sure GEMINI_API_KEY is in your .env file

// Initialize Gemini lazily
export async function getRecommendation(alertType, value, threshold) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[AI Debug] Attempting recommendation. Alert: ${alertType}. API Key present: ${!!apiKey}`);

    if (!apiKey) {
        console.warn('⚠️ GEMINI_API_KEY is missing. Skipping AI recommendation.');
        return "AI recommendation unavailable (Missing API Key).";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash per user request
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert water quality analyst. 
        I have an alert for water quality monitoring.
        
        Alert Type: ${alertType}
        Measured Value: ${value}
        Safe Threshold: ${threshold}

        Please provide a single, short, actionable advice sentence (max 20 words) for a technician to address this issue immediately. 
        Do not explain why, just tell them what to do.
        Example: "Check filtration unit B for clogs immediately."
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error("❌ AI Recommendation Error:", error.message);
        // Fallback or more detailed error info
        return `AI Advice Error: ${error.message}`;
    }
}
