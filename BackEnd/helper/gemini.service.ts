import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function getGenerativeResponse(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "I couldn’t generate a response.";
  } catch (error: any) {
    if (error.status === 429) {
      console.warn("⚠️ Gemini quota exceeded. Falling back.");
      return "";
    }

    console.error("Gemini API error:", error);
    return "";
  }
}
