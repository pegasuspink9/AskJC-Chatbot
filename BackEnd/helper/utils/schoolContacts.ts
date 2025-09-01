export function generateSingleContactResponse(contact: any, query_type?: string): string {
  if (query_type === "email") {
    return contact.email
      ? `${contact.name}'s email is ${contact.email}.`
      : `${contact.name}'s email is not available.`;
  }
  if (query_type === "fb_page") {
    return contact.fb_page
      ? `${contact.name}'s Facebook page: ${contact.fb_page}`
      : `${contact.name}'s Facebook page is not available.`;
  }
  return `${contact.name}${contact.email ? ` (email: ${contact.email})` : ""}${contact.fb_page ? ` - FB: ${contact.fb_page}` : ""}`;
}

export function generateMultipleContactsResponse(contacts: any[], query_type?: string): string {
  if (contacts.length <= 3) {
    return contacts.map(c => generateSingleContactResponse(c, query_type)).join("\n");
  } else {
    const header = `Found ${contacts.length} contacts:\n`;
    const list = contacts
      .map((c, i) => `${i + 1}. ${c.name}${c.email ? ` (email: ${c.email})` : ""}${c.fb_page ? ` - FB: ${c.fb_page}` : ""}`)
      .join("\n");
    return header + list;
  }
}

export function generateNotFoundContactMessage(
  name?: string, 
  email?: string | string[], 
  fb_page?: string | string[]
): string {
  if (name) return `I couldn't find any contact named ${name}.`;
  if (email) return `I couldn't find any contact with email ${email}.`;
  if (fb_page) return `I couldn't find any contact with Facebook page ${fb_page}.`;
  return "I couldn't find any contacts matching your search.";
}
