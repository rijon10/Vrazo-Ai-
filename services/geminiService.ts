import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const enhanceImage = async (imageBase64: string, resolution: '4K' | '8K' = '4K'): Promise<string | null> => {
  try {
    // Remove data URL prefix
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            }
          },
          {
            text: `Restoration Mode: Clean and Enhance this image. 
            1. Upscale to ultra high resolution (${resolution}). 
            2. Remove all blur, noise, dirt, and compression artifacts.
            3. Fix facial details and make the subject crystal clear.
            4. Correct lighting and colors. 
            Output a professional, sharp, and clean version of the original.`
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error enhancing image:", error);
    throw error;
  }
};

export const generateThumbnail = async (title: string, imagesBase64: string[], style: string = 'Viral Reaction'): Promise<string | null> => {
  try {
    const parts: any[] = [];
    
    // Add images to the prompt parts if they exist
    imagesBase64.forEach((base64String) => {
      // Remove data URL prefix if present for the API call
      const cleanBase64 = base64String.split(',')[1] || base64String;
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG/JPEG, API handles standard types
          data: cleanBase64,
        },
      });
    });

    // Determine style instructions
    let styleInstructions = "";
    switch (style) {
        case 'Viral Reaction':
            styleInstructions = "Style: MrBeast/YouTuber style. High saturation, expressive faces, bright background, rim lighting, high contrast.";
            break;
        case 'Tech Review':
            styleInstructions = "Style: MKBHD/Tech style. Clean, sharp focus on product, modern studio lighting, matte background, bokeh.";
            break;
        case 'Cinematic':
            styleInstructions = "Style: Movie poster/Documentary. Dramatic lighting, color graded, depth of field, realistic textures.";
            break;
        case 'Gaming':
            styleInstructions = "Style: Gaming/Esports. Neon lights, dark background, electric effects, dynamic composition.";
            break;
        default:
            styleInstructions = "Style: High impact YouTube thumbnail.";
    }

    // Dynamic instructions based on whether images were provided
    const imageInstructions = imagesBase64.length > 0 
        ? "Instructions: Compose a scene using the subjects from the attached reference images. Make the subjects pop out. Fix lighting on subjects to match the scene."
        : "Instructions: Create a visually stunning composition that perfectly represents the title. Use high quality assets and dramatic composition.";

    // Add the text prompt
    const promptText = `Create a high-click-through-rate YouTube thumbnail background. 
    Title Context: "${title}". 
    ${styleInstructions}
    ${imageInstructions}
    IMPORTANT: Do NOT add text. I will add text overlays later. Just create the perfect visual background image.`;
    
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
};