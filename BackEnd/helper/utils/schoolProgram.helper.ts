export function formatProgramTuition(program: any): string {
  if (program.tuition_fee) {
    let response = `The ${program.program_name} program costs ₱${program.tuition_fee.toLocaleString()} per semester.`;
    
    if (program.department?.department_name) {
      response += ` This program is offered by the ${program.department.department_name}.`;
    }
    
    if (program.program_type) {
      response += ` It is a ${program.program_type} program.`;
    }
    
    if (program.department?.building || program.department?.floor) {
      const location = [];
      if (program.department.floor) location.push(program.department.floor);
      if (program.department.building) location.push(program.department.building);
      response += ` Visit the department office at ${location.join(', ')} for enrollment information.`;
    }
    
    return response;
  } else {
    return `Tuition fee information for ${program.program_name} is not available.`;
  }
}

export function formatProgramType(program: any): string {
  if (program.program_type) {
    let response = `${program.program_name} is a ${program.program_type} program.`;
    
    if (program.department?.department_name) {
      response += ` It is offered by the ${program.department.department_name}.`;
    }
    
    if (program.tuition_fee) {
      response += ` The tuition fee is ₱${program.tuition_fee.toLocaleString()} per semester.`;
    }
    
    if (program.department?.head_name) {
      response += ` For more information, contact ${program.department.head_name}, the Department Head.`;
    }
    
    return response;
  } else {
    return `Program type information for ${program.program_name} is not available.`;
  }
}

export function formatProgramGeneral(program: any): string {
  const details = [];
  
  if (program.program_type) details.push(`Type: ${program.program_type}`);
  
  if (program.tuition_fee) details.push(`Tuition: ₱${program.tuition_fee.toLocaleString()}/semester`);
  
  if (program.department?.department_name) details.push(`Department: ${program.department.department_name}`);
  
  if (program.department?.head_name) details.push(`Contact: ${program.department.head_name}`);
  
  if (program.department?.building || program.department?.floor) {
    const location = [];
    if (program.department.floor) location.push(program.department.floor);
    if (program.department.building) location.push(program.department.building);
    details.push(`Location: ${location.join(', ')}`);
  }
  
  if (details.length > 0) {
    let response = `**${program.program_name}**\n${details.map(detail => `• ${detail}`).join('\n')}`;
    
    // Add contextual information
    if (program.department?.description) {
      response += `\n\n📚 **About:** ${program.department.description}`;
    }
    
    if (program.department?.career_path) {
      response += `\n🎯 **Career Paths:** ${program.department.career_path}`;
    }
    
    return response;
  } else {
    return `**${program.program_name}** - Program information available.`;
  }
}

export function formatDepartmentPrograms(programs: any[]): string {
  if (programs.length === 0) return "No programs found.";
  
  const department = programs[0].department;
  const deptName = department?.department_name || 'Unknown Department';
  
  const header = `${deptName} Programs:\n\n`;
  const programList = programs.map((program, i) => {
    const details = [];
    if (program.program_type) details.push(`Type: ${program.program_type}`);
    if (program.tuition_fee) details.push(`Tuition: ₱${program.tuition_fee.toLocaleString()}/sem`);
    
    const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
    return `${i + 1}. **${program.program_name}**${detailsStr}`;
  }).join('\n');
  
  let response = header + programList;
  
  // Add department context
  if (department?.head_name) {
    response += `\n\n👨‍💼 **Department Head:** ${department.head_name}`;
  }
  
  if (department?.building || department?.floor) {
    const location = [];
    if (department.floor) location.push(department.floor);
    if (department.building) location.push(department.building);
    response += `\n📍 **Location:** ${location.join(', ')}`;
  }
  
  return response;
}

export function formatMultiplePrograms(programs: any[]): string {
  if (programs.length <= 3) {
    const header = `Saint Joseph College Programs:\n\n`;
    const list = programs.map(program => formatProgramGeneral(program)).join('\n\n');
    return header + list;
  } else {
    const header = `Saint Joseph College Programs:\nFound ${programs.length} programs:\n`;
    const list = programs.map((program, i) => {
      const details = [];
      
      if (program.program_name) details.push(`Program: ${program.program_name}`);
      if (program.program_type) details.push(`Type: ${program.program_type}`);
      if (program.tuition_fee) details.push(`Tuition: ₱${program.tuition_fee.toLocaleString()}`);
      if (program.department?.department_name) details.push(`Dept: ${program.department.department_name}`);
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${i + 1}. **${program.program_name}**${detailsStr}`;
    }).join('\n');
    
    return header + list + '\n\n💡 **Tip:** Ask about specific programs for detailed tuition, requirements, and contact information!';
  }
}

// Add a new function for specific query handling
export function generateProgramResponse(program: any, params: any): string {
  // Specific response based on what was searched
  if (params.tuition_fee) {
    return formatProgramTuition(program);
  } else if (params.program_type) {
    return formatProgramType(program);
  } else if (params.department_name) {
    return formatDepartmentPrograms([program]);
  } else {
    return formatProgramGeneral(program);
  }
}

// Add a not found message function for consistency
export function generateNotFoundProgramMessage(
  program_name?: string | string[], 
  program_type?: string | string[], 
  department_name?: string | string[]
): string {
  if (program_name) {
    const progStr = Array.isArray(program_name) ? program_name.join(' or ') : program_name;
    return `I couldn't find any program named ${progStr}.`;
  }
  if (program_type) {
    const typeStr = Array.isArray(program_type) ? program_type.join(' or ') : program_type;
    return `I couldn't find any ${typeStr} programs.`;
  }
  if (department_name) {
    const deptStr = Array.isArray(department_name) ? department_name.join(' or ') : department_name;
    return `I couldn't find any programs in ${deptStr}.`;
  }
  return "I couldn't find any programs matching your search criteria.";
}