export function formatEnrollmentProcess(item: any): string {
  return `📋 **Enrollment Process:**\n\n${item.enrollment_process}\n\nNeed navigation help? Ask me about getting around campus!`;
}

export function formatNavigation(item: any): string {
  return `🗺️ **Campus Navigation:**\n\n${item.navigation}\n\nNeed enrollment information? Ask me about the enrollment process!`;
}

export function formatEnrollmentGeneral(item: any): string {
  let response = `📋 **Enrollment & Navigation Information:**\n\n`;
  
  if (item.enrollment_process) {
    response += `**Enrollment Process:**\n${item.enrollment_process}\n\n`;
  }
  
  if (item.navigation) {
    response += `**Campus Navigation:**\n${item.navigation}\n\n`;
  }
  
  return response.trim();
}

export function formatMultipleEnrollmentAndNavigation(items: any[]): string {
  let response = `📋 **Found ${items.length} Enrollment & Navigation Items:**\n\n`;
  
  items.forEach((item, index) => {
    response += `**${index + 1}.** `;
    
    if (item.enrollment_process) {
      response += `**Enrollment:** ${item.enrollment_process.substring(0, 100)}${item.enrollment_process.length > 100 ? '...' : ''}\n`;
    }
    
    if (item.navigation) {
      response += `**Navigation:** ${item.navigation.substring(0, 100)}${item.navigation.length > 100 ? '...' : ''}\n`;
    }
    
    response += `\n`;
  });
  
  response += `\nFor detailed information about any specific item, please ask me more specifically about enrollment or navigation.`;
  
  return response;
}