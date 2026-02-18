import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Ensure API key is handled safely
const apiKey = process.env.API_KEY;

// Security: Do not expose key in logs if missing
if (!apiKey) {
  console.warn("Service warning: API key missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Security: Safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    // Input validation
    if (prompt.length > 800) {
        throw new Error("Description too long. Please shorten it.");
    }
    const cleanPrompt = prompt.replace(/<[^>]*>?/gm, ''); 

    // Optimized for speed: gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: cleanPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
        safetySettings: safetySettings,
      },
    });

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error: any) {
    console.error("Gen failed:", error.message);
    throw new Error("Generation failed. Server busy or prompt rejected.");
  }
};

export const enhanceImage = async (imageBase64: string, resolution: '4K' | '8K' = '4K'): Promise<string | null> => {
  try {
    // Validate size (should be handled by frontend compression, but double check)
    if (imageBase64.length > 15 * 1024 * 1024) { 
        throw new Error("Image too large.");
    }

    const mimeMatch = imageBase64.match(/^data:(.*);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            }
          },
          {
            // Short, direct prompt for faster inference
            text: "Enhance image quality. Remove noise. High resolution details."
          },
        ],
      },
      config: {
        safetySettings: safetySettings
      }
    });

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Enhance failed");
    throw new Error("Could not enhance photo. Try another one.");
  }
};

export const generateThumbnail = async (title: string, imagesBase64: string[], style: string = 'Viral Reaction'): Promise<string | null> => {
  try {
    if (title.length > 150) throw new Error("Title too long.");
    
    const parts: any[] = [];
    
    imagesBase64.forEach((base64String) => {
      const mimeMatch = base64String.match(/^data:(.*);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const cleanBase64 = base64String.split(',')[1] || base64String;
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    });

    // Minimal instructions for speed
    const promptText = `YouTube thumbnail background. Title: "${title}". Style: ${style}. No text.`;
    
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: parts },
      config: {
        imageConfig: { aspectRatio: "16:9" },
        safetySettings: safetySettings
      },
    });

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Thumbnail failed");
    throw error;
  }
};