
import { GoogleGenAI } from "@google/genai";

export const generateBanner = async (prompt: string): Promise<string | null> => {
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
          // Removed imageSize: "1K" as it is not supported for gemini-2.5-flash-image
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
