
export function generateSingleOfficialResponse(official: any, position?: string, department?: string): string {
  if (position && department) {
    return `The ${position.toLowerCase()} of ${department} is ${official.name}.`;
  } else if (position) {
    return `The ${position.toLowerCase()} is ${official.name}${official.department ? ` from ${official.department}` : ''}.`;
  } else if (department) {
    return `${official.name} is the ${official.title}${official.department ? ` of ${official.department}` : ''}.`;
  }
  return `${official.name} holds the position of ${official.title}${official.department ? ` in ${official.department}` : ''}.`;
}

export function generateMultipleOfficialsResponse(officials: any[], position?: string, department?: string): string {
  const officialsList = officials
    .map(o => `• ${o.name} - ${o.title}${o.department ? ` (${o.department})` : ''}`)
    .join('\n');

  if (position && department) {
    return `I found multiple ${position.toLowerCase()}s related to ${department}:\n${officialsList}`;
  } else if (position) {
    return `I found multiple officials with the title "${position}":\n${officialsList}`;
  } else if (department) {
    return `Here are the officials in ${department}:\n${officialsList}`;
  }
  return `I found multiple officials:\n${officialsList}`;
}

export function generateNotFoundMessage(position?: string, department?: string): string {
  if (position && department) {
    return `I couldn't find a ${position.toLowerCase()} for ${department}. Please check the department name or try a different search.`;
  } else if (position) {
    return `I couldn't find any official with the title "${position}".`;
  } else if (department) {
    return `I couldn't find any officials in ${department}. Please check the department name.`;
  }
  return "I couldn't find any matching officials. Please be more specific.";
}