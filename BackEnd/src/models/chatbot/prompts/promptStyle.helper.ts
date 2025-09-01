export type PromptStyle = "single" | "bulletin" | "table";

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
    return "table";
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
    return "bulletin";
  }

  return "single";
}
