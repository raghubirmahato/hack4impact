
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import type { ChatMessage } from '../types';

// API Key rotation setup
const getApiKeys = (): string[] => {
  const keys: (string | undefined)[] = [];
  try {
    if (typeof process !== 'undefined' && process.env) {
      keys.push(process.env.GEMINI_API_KEY_1);
      keys.push(process.env.GEMINI_API_KEY_2);
      keys.push(process.env.GEMINI_API_KEY);
      keys.push(process.env.VITE_GEMINI_API_KEY);
    }
  } catch (e) {
    // ignore
  }
  return keys.filter((k): k is string => Boolean(k && typeof k === 'string' && k.trim().length > 0));
};

const API_KEYS = getApiKeys();
let currentKeyIndex = 0;
let aiInstances: GoogleGenAI[] = [];

if (API_KEYS.length > 0) {
  API_KEYS.forEach(key => {
    aiInstances.push(new GoogleGenAI({ apiKey: key }));
  });
} else {
  console.warn("No Gemini API keys found in environment variables. Gemini features will return fallback messages.");
}

// Function to get the current AI instance and rotate to next
const getCurrentAI = (): GoogleGenAI | null => {
    if (aiInstances.length === 0) return null;
    const ai = aiInstances[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % aiInstances.length;
    console.log(`Using API key ${currentKeyIndex === 0 ? aiInstances.length : currentKeyIndex} of ${aiInstances.length}`);
    return ai;
};

// Function to retry with next API key on rate limit
const executeWithRetry = async <T>(operation: (ai: GoogleGenAI) => Promise<T>, maxRetries: number = Math.max(API_KEYS.length, 1)): Promise<T> => {
    if (aiInstances.length === 0) {
        throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.");
    }
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const ai = getCurrentAI();
            if (!ai) throw new Error("No available Gemini AI instance.");
            return await operation(ai);
        } catch (error: any) {
            lastError = error;
            console.warn(`API call failed with key ${currentKeyIndex === 0 ? aiInstances.length : currentKeyIndex}, trying next key...`, error.message);
            
            // If it's a rate limit error, continue to next key
            if (error.message?.includes('quota') || error.message?.includes('rate') || error.status === 429) {
                continue;
            }
            
            // For other errors, throw immediately
            throw error;
        }
    }
    
    throw lastError;
};

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-3.0-generate-002';

const systemInstructionSymptomChecker = `You are a friendly and empathetic AI Health Assistant. Your goal is to help the user understand their symptoms. Ask clarifying questions to get more details. Based on the conversation, provide potential areas of concern and suggest next steps, like consulting a doctor. CRITICALLY IMPORTANT: You must include the following disclaimer in every response: 'I am an AI assistant and not a medical professional. This is not a diagnosis. Please consult a healthcare provider for any medical advice.' Do not provide a definitive diagnosis.`;

function buildSymptomCheckerHistory(messages: ChatMessage[]): Content[] {
    return messages.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
}


export const analyzeSymptoms = async (history: ChatMessage[]): Promise<string> => {
    try {
        return await executeWithRetry(async (ai) => {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: textModel,
                contents: buildSymptomCheckerHistory(history),
                config: {
                    systemInstruction: systemInstructionSymptomChecker,
                }
            });
            return response.text;
        });
    } catch (error) {
        console.error("Error analyzing symptoms:", error);
        return "Sorry, I encountered an error. Please try again later.";
    }
};

export const generateHealthTip = async (topic: string): Promise<string> => {
    try {
        const prompt = `Generate a helpful and easy-to-understand health tip or short article about "${topic}". The tone should be encouraging and positive. Format it using markdown for readability, including headers and bullet points where appropriate.`;
        
        return await executeWithRetry(async (ai) => {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: textModel,
                contents: prompt
            });
            return response.text;
        });
    } catch (error) {
        console.error("Error generating health tip:", error);
        return "Sorry, I couldn't generate a health tip on that topic. Please try another one.";
    }
};

export const generateHealthImage = async (topic: string): Promise<string> => {
    try {
        const prompt = `A visually appealing, minimalist, and abstract illustration representing the concept of "${topic}". Use a clean and calming color palette of blues and greens.`;
        
        return await executeWithRetry(async (ai) => {
            const response = await ai.models.generateImages({
                model: imageModel,
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '16:9',
                },
            });
            
            if (response.generatedImages && response.generatedImages.length > 0) {
                 const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                 return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
            return "";
        });
    } catch (error) {
        console.error("Error generating health image:", error);
        return "";
    }
};

export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        return await executeWithRetry(async (ai) => {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: textModel,
                contents: { parts: [imagePart, textPart] }
            });
            return response.text;
        });
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Sorry, I was unable to analyze the image. Please try again.";
    }
};
