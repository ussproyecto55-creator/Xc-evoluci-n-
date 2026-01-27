
import { GoogleGenAI } from "@google/genai";

// Global variable to track API health and prevent hammering during 429 errors
let apiCooldownUntil = 0;

export const generateBanner = async (prompt: string): Promise<string | null> => {
  const now = Date.now();
  if (now < apiCooldownUntil) {
    console.warn("Gemini API: En enfriamiento preventivo debido a límite de cuota previo.");
    return null;
  }

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

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      console.warn("Gemini API: Límite de cuota alcanzado (429). Activando enfriamiento de 60 segundos.");
      // Activar enfriamiento por 60 segundos si recibimos un 429
      apiCooldownUntil = Date.now() + 60000;
    } else {
      console.error("Error al generar imagen con Gemini:", error);
    }
    return null;
  }
};
