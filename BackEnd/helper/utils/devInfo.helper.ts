export function generateSingleDevResponse(dev: any, role?: string | string[], description?: string | string[]): string {
  const roleStr = Array.isArray(role) ? role.join(' or ') : role;
  const descriptionStr = Array.isArray(description) ? description.join(' or ') : description;

  if (roleStr && descriptionStr) {
    return `The ${roleStr.toLowerCase()} with ${descriptionStr} is ${dev.dev_name}.`;
  } else if (roleStr) {
    return `The ${roleStr.toLowerCase()} is ${dev.dev_name}${dev.description ? ` (${dev.description})` : ''}.`;
  } else if (descriptionStr) {
    return `${dev.dev_name} is the ${dev.role}${dev.description ? ` - ${dev.description}` : ''}.`;
  }
  return `${dev.dev_name} has the role of ${dev.role}${dev.description ? ` - ${dev.description}` : ''}.`;
}

export function generateMultipleDevsResponse(devs: any[], role?: string | string[], description?: string | string[]): string {
  const devsList = devs
    .map(d => `• ${d.dev_name} - ${d.role}${d.description ? ` (${d.description})` : ''}`)
    .join('\n');

  const roleStr = Array.isArray(role) ? role.join(' or ') : role;
  const descriptionStr = Array.isArray(description) ? description.join(' or ') : description;

  if (roleStr && descriptionStr) {
    return `I found multiple developers with the role "${roleStr}" related to ${descriptionStr}:\n${devsList}`;
  } else if (roleStr) {
    return `I found multiple developers with the role "${roleStr}":\n${devsList}`;
  } else if (descriptionStr) {
    return `Here are the developers with descriptions matching "${descriptionStr}":\n${devsList}`;
  }
  return `I found multiple developers:\n${devsList}`;
}

export function generateNotFoundMessage(role?: string | string[], description?: string | string[], dev_name?: string): string {
  const roleStr = Array.isArray(role) ? role.join(' or ') : role;
  const descriptionStr = Array.isArray(description) ? description.join(' or ') : description;

  if (dev_name) {
    return `I couldn't find any developer named "${dev_name}" in our records.`;
  } else if (roleStr && descriptionStr) {
    return `I couldn't find a ${roleStr.toLowerCase()} with ${descriptionStr}. Please check the role or description and try a different search.`;
  } else if (roleStr) {
    return `I couldn't find any developer with the role "${roleStr}".`;
  } else if (descriptionStr) {
    return `I couldn't find any developers matching "${descriptionStr}". Please check the description.`;
  }
  return "I couldn't find any matching developers. Please be more specific.";
}