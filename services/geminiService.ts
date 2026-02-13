
import { GoogleGenAI } from "@google/genai";

// Global variable to track API health and prevent hammering during 429 errors
let apiCooldownUntil = 0;

export const generateBanner = async (prompt: string): Promise<string | null> => {
  const now = Date.now();
  if (now < apiCooldownUntil) {
    return null;
  }

  // Guidelines: API key must be obtained exclusively from the environment variable process.env.API_KEY.
  // Guidelines: Must use new GoogleGenAI({ apiKey: process.env.API_KEY })
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ 
          text: `${prompt}. Style: Professional high-quality marketing banner, digital art, cyberpunk/futuristic aesthetic, dark blue and purple tones, neon cyan and gold highlights, sharp text, no watermark, clean composition.` 
        }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      return null;
    }

    // Guidelines: Iterate through all parts to find the image part.
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      apiCooldownUntil = Date.now() + 60000;
    }
    return null;
  }
};
