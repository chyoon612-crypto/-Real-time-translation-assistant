
import { GoogleGenAI, Type } from "@google/genai";

export async function translateAnnouncement(title: string, content: string) {
  // Use the system-provided API key directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `Translate the following school announcement into multiple languages.
Title: ${title}
Content: ${content}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: "You are a specialized school communication translator. Translate to EN, ZH, RU, VI, JA, FR. Output a valid JSON array of objects: [{langCode, title, content}].",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              lang: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["lang", "title", "content"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
}
