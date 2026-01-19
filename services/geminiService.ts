
import { GoogleGenAI, Type } from "@google/genai";
import { LanguageCode } from "../types";

export async function translateAnnouncement(title: string, content: string) {
  // Initialize inside function to ensure API_KEY is available and avoid global scope reference errors
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Translate the following school announcement into English (EN), Chinese (ZH), Russian (RU), Vietnamese (VI), Japanese (JA), and French (FR). 
  Ensure the tone is professional, polite, and educational. Maintain the core meaning accurately.
  
  Source (Korean):
  Title: ${title}
  Content: ${content}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            lang: {
              type: Type.STRING,
              description: "The language code (EN, ZH, RU, VI, JA, FR)",
            },
            title: {
              type: Type.STRING,
              description: "The translated title",
            },
            content: {
              type: Type.STRING,
              description: "The translated content",
            },
          },
          required: ["lang", "title", "content"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}
