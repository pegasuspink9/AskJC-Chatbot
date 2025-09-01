export function generateSingleOfficialResponse(official: any, position?: string | string[], department?: string | string[]): string {
  const positionStr = Array.isArray(position) ? position.join(' or ') : position;
  const departmentStr = Array.isArray(department) ? department.join(' or ') : department;

  if (positionStr && departmentStr) {
    return `The ${positionStr.toLowerCase()} of ${departmentStr} is ${official.name}.`;
  } else if (positionStr) {
    return `The ${positionStr.toLowerCase()} is ${official.name}${official.department ? ` from ${official.department}` : ''}.`;
  } else if (departmentStr) {
    return `${official.name} is the ${official.title}${official.department ? ` of ${official.department}` : ''}.`;
  }
  return `${official.name} holds the position of ${official.title}${official.department ? ` in ${official.department}` : ''}.`;
}

export function generateMultipleOfficialsResponse(officials: any[], position?: string | string[], department?: string | string[]): string {
  const officialsList = officials
    .map(o => `• ${o.name} - ${o.title}${o.department ? ` (${o.department})` : ''}`)
    .join('\n');

  const positionStr = Array.isArray(position) ? position.join(' or ') : position;
  const departmentStr = Array.isArray(department) ? department.join(' or ') : department;

  if (positionStr && departmentStr) {
    return `I found multiple ${positionStr.toLowerCase()}s related to ${departmentStr}:\n${officialsList}`;
  } else if (positionStr) {
    return `I found multiple officials with the title "${positionStr}":\n${officialsList}`;
  } else if (departmentStr) {
    return `Here are the officials in ${departmentStr}:\n${officialsList}`;
  }
  return `I found multiple officials:\n${officialsList}`;
}

export function generateNotFoundMessage(position?: string | string[], department?: string | string[], person_name?: string): string {
  const positionStr = Array.isArray(position) ? position.join(' or ') : position;
  const departmentStr = Array.isArray(department) ? department.join(' or ') : department;

  if (person_name) {
    return `I couldn't find any official named "${person_name}" in our records.`;
  } else if (positionStr && departmentStr) {
    return `I couldn't find a ${positionStr.toLowerCase()} for ${departmentStr}. Please check the department name or try a different search.`;
  } else if (positionStr) {
    return `I couldn't find any official with the title "${positionStr}".`;
  } else if (departmentStr) {
    return `I couldn't find any officials in ${departmentStr}. Please check the department name.`;
  }
  return "I couldn't find any matching officials. Please be more specific.";
}