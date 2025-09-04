export interface SchoolDetail {
  id?: number;
  school_name?: string;
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

export function formatSchoolName(detail: SchoolDetail): string {
  return detail.school_name ?? "School name is not available.";
}

export function formatSchoolVision(detail: SchoolDetail): string {
  return detail.vision
    ? `So, you wanted to know the school's vision? \n\n**${cleanLabel(
        detail.vision,
        "VISION"
      )}**`
    : `${detail.school_name ?? "This school"} vision is not available.`;
}

export function formatSchoolMission(detail: SchoolDetail): string {
  return detail.mission
    ? `So, you wanted to know the school's mission? \n\n**${cleanLabel(
        detail.mission,
        "MISSION"
      )}**`
    : `${detail.school_name ?? "This school"} mission is not available.`;
}

export function formatSchoolGoals(detail: SchoolDetail): string {
  return detail.goals
    ? `${detail.school_name} has this following goals: \n\n${cleanLabel(
        detail.goals,
        "GOALS"
      )}`
    : `${detail.school_name ?? "This school"} goals are not available.`;
}

export function formatSchoolHistory(detail: SchoolDetail): string {
  return detail.history
    ? `History of ${detail.school_name}: ${cleanLabel(
        detail.history,
        "HISTORY"
      )}`
    : `${detail.school_name ?? "This school"} history is not available.`;
}

export function formatSchoolSmallDetails(detail: SchoolDetail): string {
  return detail.small_details
    ? `${detail.school_name} is ${cleanLabel(
        detail.small_details,
        "SMALL_DETAILS"
      )}`
    : `General details about ${
        detail.school_name ?? "this school"
      } are not available.`;
}

export function formatSchoolAddress(detail: SchoolDetail): string {
  return detail.address
    ? `${detail.school_name} is located at ${cleanLabel(
        detail.address,
        "ADDRESS"
      )}.`
    : `The address of ${detail.school_name ?? "this school"} is not available.`;
}

export function formatSchoolEvents(detail: SchoolDetail): string {
  if (!detail.history) {
    return `${
      detail.school_name ?? "This school"
    } events information is not available.`;
  }

  const eventPatterns = [
    /The Founding Years[\s\S]*?(?=The Emphasis|Commitment|School President|President|$)/i,
    /Notable Events[\s\S]*?(?=School President|President|$)/i,
    /Events[\s\S]*?(?=School President|President|$)/i,
    /Activities[\s\S]*?(?=School President|President|$)/i,
    /Programs[\s\S]*?(?=School President|President|$)/i,
  ];

  let eventsText = "";

  for (const pattern of eventPatterns) {
    const match = detail.history.match(pattern);
    if (match) {
      eventsText = match[0].trim();
      break;
    }
  }

  return eventsText
    ? `**Notable events of ${detail.school_name}:**\n${eventsText}`
    : `${
        detail.school_name ?? "This school"
      } events information is not available.`;
}

export function formatSchoolPresident(detail: SchoolDetail): string {
  if (!detail.history) {
    return `${
      detail.school_name ?? "This school"
    } president information is not available.`;
  }

  const presidentPatterns = [
    /(School President|President)[\s\S]*?(?=$)/i,
    /(Current President|Head|Principal)[\s\S]*?(?=$)/i,
    /(Leadership|Administration)[\s\S]*?(?=$)/i,
    /Msgr\.\s+Oscar\s+A\.\s+Cadayona[\s\S]*?(?=$)/i,
    /5th\s+School\s+President[\s\S]*?(?=$)/i,
  ];

  let presidentText = "";

  for (const pattern of presidentPatterns) {
    const match = detail.history.match(pattern);
    if (match) {
      presidentText = match[0].trim();
      break;
    }
  }

  return presidentText
    ? `**${detail.school_name} leadership information:**\n${presidentText}`
    : `${
        detail.school_name ?? "This school"
      } president information is not available.`;
}

export function formatSchoolGeneral(detail: SchoolDetail): string {
  const details: string[] = [];

  if (detail.small_details) details.push(detail.small_details);
  if (detail.vision)
    details.push(`Vision: ${cleanLabel(detail.vision, "VISION")}`);
  if (detail.mission)
    details.push(`Mission: ${cleanLabel(detail.mission, "MISSION")}`);
  if (detail.goals) details.push(`Goals: ${cleanLabel(detail.goals, "GOALS")}`);
  if (detail.address)
    details.push(`Located at ${cleanLabel(detail.address, "ADDRESS")}`);
  if (detail.history)
    details.push(`History: ${cleanLabel(detail.history, "HISTORY")}`);

  const events = formatSchoolEvents(detail);
  if (!events.includes("not available")) details.push(events);

  const president = formatSchoolPresident(detail);
  if (!president.includes("not available")) details.push(president);

  return details.length > 0
    ? `${detail.school_name ?? "The school"} Information:\n${details.join(
        "\n\n"
      )}`
    : `No details available for ${detail.school_name ?? "this school"}.`;
}
