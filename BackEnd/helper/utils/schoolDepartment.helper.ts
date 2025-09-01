

export function formatDepartmentLocation(dept: any): string {
  const location = [];
  if (dept.floor) location.push(`Floor: ${dept.floor}`);
  if (dept.building) location.push(`Building: ${dept.building}`);
  
  if (location.length > 0) {
    let response = `The ${dept.department_name} is located at ${location.join(', ')}.`;
    
    // Add head contact information if available
    if (dept.head_name) {
      response += ` You can find ${dept.head_name} (Department Head) at this location.`;
    }
    
    // Add department context
    if (dept.description) {
      response += ` This is where ${dept.description.toLowerCase()} activities take place.`;
    }
    
    return response;
  } else {
    return `The ${dept.department_name} location information is not available.`;
  }
}

export function formatDepartmentHead(dept: any): string {
  if (dept.head_name) {
    let response = `The ${dept.department_name} is headed by ${dept.head_name}.`;
    
    // Add location information for the head
    const location = [];
    if (dept.floor) location.push(`Floor: ${dept.floor}`);
    if (dept.building) location.push(`Building: ${dept.building}`);
    
    if (location.length > 0) {
      response += ` You can find ${dept.head_name} at the department office located at ${location.join(', ')}.`;
    }
    
    // Add department focus context
    if (dept.description) {
      response += ` ${dept.head_name} oversees ${dept.description.toLowerCase()} programs and activities.`;
    }
    
    // Add career guidance context
    if (dept.career_path) {
      response += ` Contact ${dept.head_name} for guidance on career paths including: ${dept.career_path}.`;
    }
    
    return response;
  } else {
    return `The ${dept.department_name} department head information is not available.`;
  }
}

export function formatDepartmentDescription(dept: any): string {
  if (dept.description) {
    let response = `The ${dept.department_name} focuses on: ${dept.description}`;
    
    const location = [];
    if (dept.floor) location.push(`Floor: ${dept.floor}`);
    if (dept.building) location.push(`Building: ${dept.building}`);
    
    if (location.length > 0) {
      response += ` You can visit the department at ${location.join(', ')}.`;
    }
    
    if (dept.head_name) {
      response += ` For more information, speak with ${dept.head_name}, the Department Head.`;
    }
    
    return response;
  } else {
    return `The ${dept.department_name} description is not available.`;
  }
}

export function formatDepartmentCareerPath(dept: any): string {
  if (dept.career_path) {
    let response = `Graduates from the ${dept.department_name} can pursue careers in: ${dept.career_path}`;
    
    if (dept.head_name) {
      response += ` For career counseling and guidance, consult with ${dept.head_name}, the Department Head.`;
      
      const location = [];
      if (dept.floor) location.push(`Floor: ${dept.floor}`);
      if (dept.building) location.push(`Building: ${dept.building}`);
      
      if (location.length > 0) {
        response += ` Visit the department office at ${location.join(', ')} to discuss your career options.`;
      }
    }
    if (dept.description) {
      response += ` The department's focus on ${dept.description.toLowerCase()} prepares students for these career opportunities.`;
    }
    
    return response;
  } else {
    return `Career path information for the ${dept.department_name} is not available.`;
  }
}

export function formatDepartmentGeneral(dept: any): string {
  const details = [];
  
  if (dept.head_name) details.push(`Head: ${dept.head_name}`);
  
  if (dept.building && dept.floor) {
    details.push(`Location: ${dept.floor}, ${dept.building}`);
  } else if (dept.building) {
    details.push(`Location: ${dept.building}`);
  } else if (dept.floor) {
    details.push(`Floor: ${dept.floor}`);
  }
  
  if (dept.description) details.push(`Focus: ${dept.description}`);
  
  if (dept.career_path) details.push(`Careers: ${dept.career_path}`);
  
  if (details.length > 0) {
    let response = `**${dept.department_name}**\n${details.map(detail => `• ${detail}`).join('\n')}`;
    
    if (dept.head_name && (dept.building || dept.floor)) {
      const location = [];
      if (dept.floor) location.push(dept.floor);
      if (dept.building) location.push(dept.building);
      response += `\n\n💼 **Contact:** Visit ${dept.head_name} at ${location.join(', ')} for inquiries and guidance.`;
    }
    
    return response;
  } else {
    return `**${dept.department_name}** - Department information available.`;
  }
}

export function formatMultipleDepartments(departments: any[]): string {
  if (departments.length <= 3) {
    return departments.map(dept => formatDepartmentGeneral(dept)).join('\n');
  } else {
    const header = `Found ${departments.length} departments:\n`;
    const list = departments.map(dept => 
      `• ${dept.name}${dept.head_name ? ` (${dept.head_name})` : ''}`
    ).join('\n');
    return header + list;
  } else {
    const header = `Saint Joseph College departments:\nFound ${departments.length} departments:\n`;
    const list = departments.map((dept, i) => {
      const details = [];
      if (dept.head_name) details.push(`Head: ${dept.head_name}`);
      if (dept.building) details.push(`Building: ${dept.building}`);
      if (dept.floor) details.push(`Floor: ${dept.floor}`);
      if (dept.career_path) details.push(`Careers: ${dept.career_path.split(',')[0]}...`); // Show first career only for brevity
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${i + 1}. **${dept.department_name}**${detailsStr}`;
    }).join('\n');
    
    return header + list + '\n\n💡 **Tip:** Ask about specific departments for detailed location and contact information!';
  }
}