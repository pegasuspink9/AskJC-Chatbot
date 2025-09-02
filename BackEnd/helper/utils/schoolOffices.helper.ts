export function formatOfficeLocation(office: any): string {
  const location = [];
  if (office.location_floor) location.push(`Floor: ${office.location_floor}`);
  if (office.location_building) location.push(`Building: ${office.location_building}`);
  
  if (location.length > 0) {
    let response = `The ${office.office_name} is located at ${location.join(', ')}.`;
    
    if (office.operating_hours) {
      response += ` The office is open ${office.operating_hours}.`;
    }
    
    if (office.description) {
      response += ` This office handles ${office.description.toLowerCase()}.`;
    }
    
    return response;
  } else {
    return `The ${office.office_name} location information is not available.`;
  }
}

export function formatOfficeContact(office: any): string {
  const contacts = [];
  if (office.contact_email) contacts.push(`Email: ${office.contact_email}`);
  if (office.contact_phone) contacts.push(`Phone: ${office.contact_phone}`);
  if (office.fb_page) contacts.push(`Facebook: ${office.fb_page}`);
  
  if (contacts.length > 0) {
    let response = `You can contact the ${office.office_name} through: ${contacts.join(', ')}.`;
    
    const location = [];
    if (office.location_floor) location.push(office.location_floor);
    if (office.location_building) location.push(office.location_building);
    
    if (location.length > 0) {
      response += ` Visit them at ${location.join(', ')}.`;
    }
    
    if (office.operating_hours) {
      response += ` Office hours: ${office.operating_hours}.`;
    }
    
    return response;
  } else {
    return `Contact information for the ${office.office_name} is not available.`;
  }
}

export function formatOfficeHours(office: any): string {
  if (office.operating_hours) {
    let response = `The ${office.office_name} is open ${office.operating_hours}.`;
    
    const location = [];
    if (office.location_floor) location.push(office.location_floor);
    if (office.location_building) location.push(office.location_building);
    
    if (location.length > 0) {
      response += ` Visit the office at ${location.join(', ')}.`;
    }
    
    // Add contact for inquiries
    if (office.contact_phone || office.contact_email) {
      const contacts = [];
      if (office.contact_phone) contacts.push(office.contact_phone);
      if (office.contact_email) contacts.push(office.contact_email);
      response += ` For inquiries, contact: ${contacts.join(' or ')}.`;
    }
    
    return response;
  } else {
    return `Operating hours for the ${office.office_name} are not available.`;
  }
}

export function formatOfficeDescription(office: any): string {
  if (office.description) {
    let response = `The ${office.office_name} handles: ${office.description}`;
    
    // Add location context
    const location = [];
    if (office.location_floor) location.push(office.location_floor);
    if (office.location_building) location.push(office.location_building);
    
    if (location.length > 0) {
      response += ` You can find this office at ${location.join(', ')}.`;
    }
    
    // Add operating hours
    if (office.operating_hours) {
      response += ` Office hours: ${office.operating_hours}.`;
    }
    
    return response;
  } else {
    return `Description for the ${office.office_name} is not available.`;
  }
}

export function generateSingleOfficeResponse(office: any): string {
  // General comprehensive response
  const details = [];
  
  if (office.description) details.push(`Purpose: ${office.description}`);
  
  // Location info
  if (office.location_building && office.location_floor) {
    details.push(`Location: ${office.location_floor}, ${office.location_building}`);
  } else if (office.location_building) {
    details.push(`Location: ${office.location_building}`);
  } else if (office.location_floor) {
    details.push(`Floor: ${office.location_floor}`);
  }
  
  if (office.operating_hours) details.push(`Hours: ${office.operating_hours}`);
  
  if (office.contact_email) details.push(`Email: ${office.contact_email}`);
  if (office.contact_phone) details.push(`Phone: ${office.contact_phone}`);
  if (office.fb_page) details.push(`Facebook: ${office.fb_page}`);
  
  if (details.length > 0) {
    return `**${office.office_name}**\n${details.map(detail => `• ${detail}`).join('\n')}`;
  } else {
    return `**${office.office_name}** - Office information available.`;
  }
}

export function generateMultipleOfficesResponse(offices: any[]): string {
  if (offices.length <= 3) {
    const header = `Saint Joseph College offices:\n\n`;
    const list = offices.map(office => generateSingleOfficeResponse(office)).join('\n\n');
    return header + list;
  } else {
    const header = `Saint Joseph College offices:\nFound ${offices.length} offices:\n`;
    const list = offices.map((office, i) => {
      const details = [];
      if (office.description) details.push(`Purpose: ${office.description.substring(0, 50)}...`);
      if (office.location_building) details.push(`Building: ${office.location_building}`);
      if (office.location_floor) details.push(`Floor: ${office.location_floor}`);
      if (office.operating_hours) details.push(`Hours: ${office.operating_hours.split(',')[0]}...`);
      if (office.contact_phone) details.push(`Phone: ${office.contact_phone}`);
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${i + 1}. **${office.office_name}**${detailsStr}`;
    }).join('\n');
    
    return header + list + '\n\n💡 **Tip:** Ask about specific offices for detailed location, hours, and contact information!';
  }
}

export function generateNotFoundOfficeMessage(
  office_name?: string, 
  location_building?: string | string[], 
  location_floor?: string | string[]
): string {
  if (office_name) return `I couldn't find any office named ${office_name}.`;
  if (location_building) return `I couldn't find any office in building ${Array.isArray(location_building) ? location_building.join(' or ') : location_building}.`;
  if (location_floor) return `I couldn't find any office on floor ${Array.isArray(location_floor) ? location_floor.join(' or ') : location_floor}.`;
  return "I couldn't find any offices matching your search criteria.";
}