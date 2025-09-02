export function formatOrganizationDescription(org: any): string {
  if (org.description) {
    let response = `The ${org.organization_name} focuses on: ${org.description}`;
    
    if (org.fb_page) {
      response += ` For more information and updates, visit their Facebook page: ${org.fb_page}.`;
    }
    
    return response;
  } else {
    return `The ${org.organization_name} description is not available.`;
  }
}

export function formatOrganizationFacebook(org: any): string {
  if (org.fb_page) {
    let response = `You can connect with ${org.organization_name} through their Facebook page: ${org.fb_page}.`;
    
    // Add description context
    if (org.description) {
      response += ` This organization focuses on ${org.description.toLowerCase()}.`;
    }
    
    return response;
  } else {
    return `The ${org.organization_name} Facebook page information is not available.`;
  }
}

export function formatOrganizationGeneral(org: any): string {
  const details = [];
  
  if (org.description) details.push(`Focus: ${org.description}`);
  if (org.fb_page) details.push(`Facebook: ${org.fb_page}`);
  
  if (details.length > 0) {
    let response = `**${org.organization_name}**\n${details.map(detail => `• ${detail}`).join('\n')}`;
    
    if (org.fb_page && org.description) {
      response += `\n\n📱 **Connect:** Visit their Facebook page for updates about ${org.description.toLowerCase()} activities and events.`;
    }
    
    return response;
  } else {
    return `**${org.organization_name}** - Organization information available.`;
  }
}

export function formatMultipleOrganizations(organizations: any[]): string {
  if (organizations.length <= 3) {
    const header = `Saint Joseph College student organizations:\n\n`;
    const list = organizations.map(org => formatOrganizationGeneral(org)).join('\n\n');
    return header + list;
  } else {
    const header = `Saint Joseph College student organizations:\nFound ${organizations.length} organizations:\n`;
    const list = organizations.map((org, i) => {
      const details = [];
      if (org.description) details.push(`Focus: ${org.description.substring(0, 50)}...`); // Show first 50 chars only for brevity
      if (org.fb_page) details.push(`Facebook: Available`);
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${i + 1}. **${org.organization_name}**${detailsStr}`;
    }).join('\n');
    
    return header + list + '\n\n💡 **Tip:** Ask about specific organizations for detailed information and Facebook pages!';
  }
}