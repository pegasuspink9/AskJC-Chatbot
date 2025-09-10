export function formatDepartmentLocation(department: any): string {
  if (department.building || department.floor) {
    const location = [];
    if (department.floor) location.push(department.floor);
    if (department.building) location.push(department.building);
    
    let response = `The ${department.department_name} is located at ${location.join(', ')}.`;
    
    if (department.head_name) {
      response += ` The Department Head is ${department.head_name}.`;
    }
    
    if (department.description) {
      response += ` ${department.description}`;
    }
    
    return response;
  } else {
    return `Location information for ${department.department_name} is not available.`;
  }
}

export function formatDepartmentHead(department: any): string {
  if (department.head_name) {
    let response = `The Department Head of ${department.department_name} is ${department.head_name}.`;
    
    if (department.building || department.floor) {
      const location = [];
      if (department.floor) location.push(department.floor);
      if (department.building) location.push(department.building);
      response += ` You can find the department office at ${location.join(', ')}.`;
    }
    
    if (department.description) {
      response += ` ${department.description}`;
    }
    
    if (department.career_path) {
      response += ` The department offers career paths in ${department.career_path}.`;
    }
    
    return response;
  } else {
    return `Department head information for ${department.department_name} is not available.`;
  }
}

export function formatDepartmentDescription(department: any): string {
  if (department.description) {
    let response = `**${department.department_name}**\n\n📚 ${department.description}`;
    
    if (department.head_name) {
      response += `\n\n👨‍💼 **Department Head:** ${department.head_name}`;
    }
    
    if (department.career_path) {
      response += `\n🎯 **Career Opportunities:** ${department.career_path}`;
    }
    
    if (department.building || department.floor) {
      const location = [];
      if (department.floor) location.push(department.floor);
      if (department.building) location.push(department.building);
      response += `\n📍 **Location:** ${location.join(', ')}`;
    }
    
    return response;
  } else {
    return `Description for ${department.department_name} is not available.`;
  }
}

export function formatDepartmentCareerPath(department: any): string {
  if (department.career_path) {
    let response = `**${department.department_name} - Career Opportunities**\n\n🎯 ${department.career_path}`;
    
    if (department.description) {
      response += `\n\n📚 **About the Department:** ${department.description}`;
    }
    
    if (department.head_name) {
      response += `\n\n👨‍💼 **Contact:** ${department.head_name}, Department Head`;
    }
    
    if (department.building || department.floor) {
      const location = [];
      if (department.floor) location.push(department.floor);
      if (department.building) location.push(department.building);
      response += `\n📍 **Visit us at:** ${location.join(', ')}`;
    }
    
    return response;
  } else {
    return `Career path information for ${department.department_name} is not available.`;
  }
}

export function formatDepartmentGeneral(department: any): string {
  const details = [];
  
  if (department.head_name) details.push(`Head: ${department.head_name}`);
  
  if (department.building || department.floor) {
    const location = [];
    if (department.floor) location.push(department.floor);
    if (department.building) location.push(department.building);
    details.push(`Location: ${location.join(', ')}`);
  }
  
  if (details.length > 0) {
    let response = `**${department.department_name}**\n${details.map(detail => `• ${detail}`).join('\n')}`;
    
    // Add contextual information
    if (department.description) {
      response += `\n\n📚 **About:** ${department.description}`;
    }
    
    if (department.career_path) {
      response += `\n🎯 **Career Paths:** ${department.career_path}`;
    }
    
    return response;
  } else {
    let response = `**${department.department_name}** - Department information available.`;
    
    if (department.description) {
      response += `\n\n📚 **About:** ${department.description}`;
    }
    
    if (department.career_path) {
      response += `\n🎯 **Career Paths:** ${department.career_path}`;
    }
    
    return response;
  }
}

export function formatMultipleDepartments(departments: any[]): string {
  if (departments.length === 0) return "No departments found.";
  
  if (departments.length <= 3) {
    const header = `Saint Joseph College Departments:\n\n`;
    const list = departments.map(department => formatDepartmentGeneral(department)).join('\n\n');
    return header + list;
  } else {
    const header = `Saint Joseph College Departments:\nFound ${departments.length} departments:\n\n`;
    const list = departments.map((department, i) => {
      const details = [];
      
      if (department.head_name) details.push(`Head: ${department.head_name}`);
      if (department.building || department.floor) {
        const location = [];
        if (department.floor) location.push(department.floor);
        if (department.building) location.push(department.building);
        details.push(`Location: ${location.join(', ')}`);
      }
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${i + 1}. **${department.department_name}**${detailsStr}`;
    }).join('\n');
    
    return header + list + '\n\n💡 **Tip:** Ask about specific departments for detailed information about their programs, career paths, and contact details!';
  }
}

// Add a new function for specific query handling
export function generateDepartmentResponse(department: any, params: any): string {
  // Specific response based on what was searched
  if (params.building || params.floor) {
    return formatDepartmentLocation(department);
  } else if (params.head_name) {
    return formatDepartmentHead(department);
  } else if (params.description) {
    return formatDepartmentDescription(department);
  } else if (params.career_path) {
    return formatDepartmentCareerPath(department);
  } else {
    return formatDepartmentGeneral(department);
  }
}

// Add a not found message function for consistency
export function generateNotFoundDepartmentMessage(
  department_name?: string | string[], 
  head_name?: string | string[], 
  building?: string | string[],
  floor?: string | string[]
): string {
  if (department_name) {
    const deptStr = Array.isArray(department_name) ? department_name.join(' or ') : department_name;
    return `I couldn't find any department named ${deptStr}.`;
  }
  if (head_name) {
    const headStr = Array.isArray(head_name) ? head_name.join(' or ') : head_name;
    return `I couldn't find any department with ${headStr} as head.`;
  }
  if (building) {
    const buildingStr = Array.isArray(building) ? building.join(' or ') : building;
    return `I couldn't find any departments in ${buildingStr}.`;
  }
  if (floor) {
    const floorStr = Array.isArray(floor) ? floor.join(' or ') : floor;
    return `I couldn't find any departments on ${floorStr}.`;
  }
  return "I couldn't find any departments matching your search criteria.";
}