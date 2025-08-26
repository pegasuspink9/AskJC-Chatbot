export const extractKeywords = (text?: string): string[] => {
  if (!text) return [];

  let normalized = text.toLowerCase().replace(/[^\w\s]/gi, "");

  const words = normalized.split(/\s+/);

  const stopWords = [
    "is",
    "the",
    "a",
    "an",
    "in",
    "of",
    "how",
    "much",
    "what",
    "tell",
    "me",
    "at",
    "are",
    "do",
    "does",
    "can",
    "who",
    "for",
    "to",
    "with",
    "on",
    "by",
    "and",
  ];
  const keywords = words.filter((w) => !stopWords.includes(w));

  return keywords;
};
