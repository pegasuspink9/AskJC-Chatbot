interface SchoolDetail {
  small_details?: string;
  vision?: string;
  mission?: string;
  goals?: string;
  address?: string;
  history?: string;
}

function cleanLabel(text: string, label: string): string {
  if (!text) return "";
  const regex = new RegExp(`^${label}:\\s*`, "i");
  return text.replace(regex, "").trim();
}

export function formatSchoolVision(schoolDetail: SchoolDetail): string {
  return schoolDetail.vision
    ? `**Vision:** ${cleanLabel(schoolDetail.vision, "VISION")}`
    : `Vision is not available.`;
}

export function formatSchoolMission(schoolDetail: SchoolDetail): string {
  return schoolDetail.mission
    ? `**Mission:** ${cleanLabel(schoolDetail.mission, "MISSION")}`
    : `Mission is not available.`;
}

export function formatSchoolGoals(schoolDetail: SchoolDetail): string {
  return schoolDetail.goals
    ? `**Goals:** ${cleanLabel(schoolDetail.goals, "GOALS")}`
    : `Goals are not available.`;
}

export function formatSchoolHistory(schoolDetail: SchoolDetail): string {
  return schoolDetail.history
    ? `**History:** ${cleanLabel(schoolDetail.history, "HISTORY")}`
    : `History is not available.`;
}

export function formatSchoolSmallDetails(schoolDetail: SchoolDetail): string {
  return schoolDetail.small_details
    ? `**Details:** ${cleanLabel(schoolDetail.small_details, "SMALL_DETAILS")}`
    : `Details are not available.`;
}

export function formatSchoolAddress(schoolDetail: SchoolDetail): string {
  return schoolDetail.address
    ? `**Address:** ${cleanLabel(schoolDetail.address, "ADDRESS")}`
    : `Address is not available.`;
}

export function formatSchoolGeneral(schoolDetail: SchoolDetail): string {
  const details: string[] = [];

  if (schoolDetail.small_details)
    details.push(
      `• **Details:** ${cleanLabel(
        schoolDetail.small_details,
        "SMALL_DETAILS"
      )}`
    );
  if (schoolDetail.vision)
    details.push(`• **Vision:** ${cleanLabel(schoolDetail.vision, "VISION")}`);
  if (schoolDetail.mission)
    details.push(
      `• **Mission:** ${cleanLabel(schoolDetail.mission, "MISSION")}`
    );
  if (schoolDetail.goals)
    details.push(`• **Goals:** ${cleanLabel(schoolDetail.goals, "GOALS")}`);
  if (schoolDetail.address)
    details.push(
      `• **Address:** ${cleanLabel(schoolDetail.address, "ADDRESS")}`
    );
  if (schoolDetail.history)
    details.push(
      `• **History:** ${cleanLabel(schoolDetail.history, "HISTORY")}`
    );

  return details.length > 0
    ? `**Saint Joseph College Information:**\n\n${details.join("\n")}`
    : `No details available for Saint Joseph College.`;
}

export function formatMultipleSchoolInfo(
  schoolDetails: SchoolDetail[],
  filteredTypes: string[]
): string {
  return schoolDetails
    .map((detail, index) => {
      let formatted: string;

      if (filteredTypes.length === 0) {
        formatted = formatSchoolGeneral(detail);
      } else {
        const parts: string[] = [];
        if (filteredTypes.includes("vision"))
          parts.push(formatSchoolVision(detail));
        if (filteredTypes.includes("mission"))
          parts.push(formatSchoolMission(detail));
        if (filteredTypes.includes("goals"))
          parts.push(formatSchoolGoals(detail));
        if (filteredTypes.includes("history"))
          parts.push(formatSchoolHistory(detail));
        if (filteredTypes.includes("small_details"))
          parts.push(formatSchoolSmallDetails(detail));
        if (filteredTypes.includes("address"))
          parts.push(formatSchoolAddress(detail));

        formatted =
          parts.length > 0 ? parts.join("\n") : `No matching info available.`;
      }

      return `School ${index + 1}:\n${formatted}`;
    })
    .join("\n\n");
}
