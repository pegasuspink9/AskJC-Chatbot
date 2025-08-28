import { GoogleGenerativeAI } from "@google/generative-ai";

let currentIndex = 0;
const keys = (process.env.GEMINI_API_KEYS || "")
  .split(",")
  .map((k) => k.trim());

if (keys.length === 0) {
  throw new Error("No Gemini API keys configured in GEMINI_API_KEYS");
}

function getNextApiKey(): { apiKey: string; index: number } {
  const key = keys[currentIndex];
  const index = currentIndex;
  currentIndex = (currentIndex + 1) % keys.length;
  return { apiKey: key, index };
}

async function tryGenerate(prompt: string, apiKey: string, index: number) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log(`✅ Gemini responded using KEY-${index + 1}`);
  return { text, apiKey: `KEY-${index + 1}` };
}

export async function getGenerativeResponse(
  prompt: string
): Promise<{ text: string; apiKey: string }> {
  for (let i = 0; i < keys.length; i++) {
    const { apiKey, index } = getNextApiKey();
    try {
      return await tryGenerate(prompt, apiKey, index);
    } catch (error: any) {
      console.error(`❌ Gemini error with KEY-${index + 1}:`, error.message);
      if (i === keys.length - 1) {
        throw new Error("All Gemini API keys exhausted");
      }
      console.log("🔄 Retrying with next Gemini API key...");
    }
  }
  throw new Error("Unexpected error in Gemini key rotation");
}
