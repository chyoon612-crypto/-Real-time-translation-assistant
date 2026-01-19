
import { GoogleGenAI, Type } from "@google/genai";
import { LanguageCode } from "../types.ts";

export async function translateAnnouncement(title: string, content: string) {
  // Use the API key directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `Source text to translate:
Title: ${title}
Content: ${content}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: "You are a professional school communication translator. Translate the given Korean text into English (EN), Chinese (ZH), Russian (RU), Vietnamese (VI), Japanese (JA), and French (FR). Output MUST be a valid JSON array of objects with keys: lang, title, content. The tone should be polite and clear for parents and students.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              lang: {
                type: Type.STRING,
                description: "The language code",
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

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini API");

    // Clean potential markdown wrappers if they exist despite responseMimeType
    const cleanedJson = text.replace(/^```json\n?|\n?```$/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
}
