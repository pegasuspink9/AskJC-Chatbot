import { botTalk, suggestion } from "./prompts";

export const singleLinePromptHistory = (
  historyText: string,
  message: string
) => `
Use only this information to answer the question:
${historyText}

Student's question:
"${message}"

Talk like ${botTalk}
Make the answer **direct and concise**. Highlight important info in bold (** **). Only respond to the specific topic requested (history, president, or events).
${suggestion}
`;

export const bulletinPromptHistory = (historyText: string, message: string) => `
Information you can use:
${historyText}

Student's question:
"${message}"

Talk like ${botTalk}
Present the answer in a **bulletin-style format** with bullet points (•) and highlight key info with ** **. Only include info relevant to the specific request (history, president, events).
${suggestion}
`;

export const tablePromptHistory = (historyText: string, message: string) => `
Information you can use:
${historyText}

Student's question:
"${message}"

Talk like ${botTalk}
Present the results in a **Markdown table** with clear columns. Highlight key information using ** **.
Only include information related to the specific request (history, president, events).
${suggestion}
`;

export const needsIntro = (reqType: string): string | null => {
  switch (reqType) {
    case "vision":
      return "**Saint Joseph College envisions:** ";
    case "mission":
      return "**The mission of Saint Joseph College** is ";
    case "address":
      return "**The official address of Saint Joseph College** is ";
    case "small_details":
      return "**Some quick details about Saint Joseph College:**\n";
    case "goals":
      return "**Saint Joseph College Goals:**\n";
    case "school-president":
      return "**Current School President:**\n";
    case "school-events":
      return "**School Events:**\n";
    default:
      return null;
  }
};

export type PromptStyle =
  | typeof singleLinePromptHistory
  | typeof bulletinPromptHistory
  | typeof tablePromptHistory;

export function pickPromptStyle(
  message: string,
  requirementType: string[]
): PromptStyle {
  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("list") ||
    lowerMsg.includes("line up") ||
    lowerMsg.includes("all presidents") ||
    lowerMsg.includes("timeline") ||
    lowerMsg.includes("years") ||
    lowerMsg.includes("chronology") ||
    lowerMsg.includes("lineage")
  ) {
    return tablePromptHistory;
  }

  if (
    requirementType.includes("history") ||
    lowerMsg.includes("history") ||
    lowerMsg.includes("founded") ||
    lowerMsg.includes("background") ||
    lowerMsg.includes("when") ||
    lowerMsg.includes("how it started") ||
    lowerMsg.includes("milestones") ||
    lowerMsg.includes("events")
  ) {
    return bulletinPromptHistory;
  }

  if (
    requirementType.includes("school-president") ||
    lowerMsg.includes("president") ||
    lowerMsg.includes("head") ||
    lowerMsg.includes("leader")
  ) {
    return singleLinePromptHistory;
  }

  if (
    requirementType.includes("school-events") ||
    lowerMsg.includes("events") ||
    lowerMsg.includes("activities") ||
    lowerMsg.includes("programs")
  ) {
    return bulletinPromptHistory;
  }

  return singleLinePromptHistory;
}
