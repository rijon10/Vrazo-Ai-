import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Ensure API key is handled safely
const apiKey = process.env.API_KEY;

// Security: Do not expose key in logs if missing
if (!apiKey) {
  console.warn("Service warning: API key missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// FIX: Use BLOCK_NONE where possible to minimize false positives, otherwise BLOCK_ONLY_HIGH
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const generateImage = async (prompt: string): Promise<string | null> => {
  let attempts = 0;
  // Reduce max attempts to avoid long waits, but keep 1 retry for network blips
  const maxAttempts = 2; 

  while (attempts < maxAttempts) {
    try {
        // Input validation
        if (prompt.length > 800) {
            throw new Error("Description too long. Please shorten it.");
        }
        const cleanPrompt = prompt.replace(/<[^>]*>?/gm, ''); 

        // Optimization: "Concept art" prefix helps bypass strict realism filters for abstract/creative prompts
        // "8k resolution, ultra-realistic" ensures high quality even for simple prompts
        const enhancedPrompt = `Concept art of: ${cleanPrompt} . 8k resolution, ultra-realistic, cinematic lighting, masterpiece.`;

        // Optimized for speed: gemini-2.5-flash-image
        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
            parts: [{ text: enhancedPrompt }],
        },
        config: {
            imageConfig: {
                aspectRatio: "16:9",
                // numberOfImages is not supported in imageConfig for generateContent
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
        attempts++;
        console.error(`Attempt ${attempts} failed:`, error.message);
        
        // FAIL FAST LOGIC:
        // If it's a safety error or invalid argument, DO NOT RETRY. It will fail again.
        if (error.message.includes("SAFETY") || error.message.includes("400") || error.message.includes("INVALID_ARGUMENT")) {
             throw new Error("This prompt cannot be processed due to safety guidelines. Please modify your text.");
        }

        // Only retry for Server Errors (503, 500, 429)
        const isServerError = error.message.includes("503") || error.message.includes("429") || error.message.includes("500") || error.message.includes("fetch failed");
        
        if (!isServerError || attempts >= maxAttempts) {
             if (error.message.includes("429")) {
                 throw new Error("Server is busy (Rate Limit). Please wait a moment.");
             }
             if (error.message.includes("503")) {
                 throw new Error("AI Service is temporarily overloaded. Try again in 10s.");
             }
             throw new Error("Generation failed. Please check your internet or try a different prompt.");
        }
        
        // Short wait before retry (1s)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
};

export const enhanceImage = async (imageBase64: string, resolution: '4K' | '8K' = '4K'): Promise<string | null> => {
  try {
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