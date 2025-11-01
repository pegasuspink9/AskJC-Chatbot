import { getGenerativeResponse } from '../../../../helper/gemini.service';

export const correctGrammar = async (userInput: string): Promise<string> => {
  if (userInput.trim().split(' ').length <= 2) {
    return userInput;
  }

  const correctionPrompt = `Fix spelling and grammar errors. Return ONLY the corrected text, no explanations.

Input: "${userInput}"

Corrected:`;

  try {
    const { text } = await getGenerativeResponse(correctionPrompt, []);
    const corrected = text.trim().replace(/^["']|["']$/g, '');
    return corrected;
  } catch (error) {
    console.error('❌ Grammar correction failed:', error);
    return userInput;
  }
};

export const isSignificantlyDifferent = (original: string, corrected: string): boolean => {
  const originalWords = original.toLowerCase().trim().split(/\s+/);
  const correctedWords = corrected.toLowerCase().trim().split(/\s+/);
  const differences = originalWords.filter((word, index) => word !== correctedWords[index]).length;
  return differences / originalWords.length > 0.2;
};