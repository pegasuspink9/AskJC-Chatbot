export function formatMultipleEnrollments(enrollments: any[]): string {
  let response = `📋 **Found ${enrollments.length} Enrollment Options:**\n\n`;
  
  enrollments.forEach((enrollment, index) => {
    response += `**${index + 1}. ${enrollment.department_to_enroll || 'Department'}**\n`;
    
    if (enrollment.enrollment_process) {
      response += `**Process:** ${enrollment.enrollment_process.substring(0, 150)}${enrollment.enrollment_process.length > 150 ? '...' : ''}\n`;
    }
    
    if (enrollment.enrollment_documents) {
      response += `**Documents:** ${enrollment.enrollment_documents.substring(0, 100)}${enrollment.enrollment_documents.length > 100 ? '...' : ''}\n`;
    }
    
    response += `\n`;
  });
  
  response += `\nFor detailed information about any specific department enrollment, please ask me about that department specifically.`;
  
  return response;
}

export function generateEnrollmentResponse(enrollment: any, params: any): string {
  let response = `📋 **Enrollment Information`;
  
  if (enrollment.department_to_enroll) {
    response += ` - ${enrollment.department_to_enroll}`;
  }
  
  response += `:**\n\n`;
  
  // If specifically asking about process
  if (params.enrollment_process && enrollment.enrollment_process) {
    response += `**📝 Enrollment Process:**\n${enrollment.enrollment_process}\n\n`;
  }
  
  // If specifically asking about documents
  if (params.enrollment_documents && enrollment.enrollment_documents) {
    response += `**📄 Required Documents:**\n${enrollment.enrollment_documents}\n\n`;
  }
  
  // If asking about department or general query, show everything
  if (params.department_to_enroll || (!params.enrollment_process && !params.enrollment_documents)) {
    if (enrollment.enrollment_process) {
      response += `**📝 Enrollment Process:**\n${enrollment.enrollment_process}\n\n`;
    }
    
    if (enrollment.enrollment_documents) {
      response += `**📄 Required Documents:**\n${enrollment.enrollment_documents}\n\n`;
    }
  }
  
  response += `💡 *Need more specific information? Ask me about enrollment process, required documents, or other departments!*`;
  
  return response.trim();
}

export function generateNotFoundEnrollmentMessage(
  department?: string | string[], 
  process?: string | string[], 
  documents?: string | string[]
): string {
  let response = "❌ **No enrollment information found**";
  
  const searchTerms = [];
  
  if (department) {
    const deptStr = Array.isArray(department) ? department.join(', ') : department;
    searchTerms.push(`department: "${deptStr}"`);
  }
  
  if (process) {
    const processStr = Array.isArray(process) ? process.join(', ') : process;
    searchTerms.push(`process: "${processStr}"`);
  }
  
  if (documents) {
    const docsStr = Array.isArray(documents) ? documents.join(', ') : documents;
    searchTerms.push(`documents: "${docsStr}"`);
  }
  
  if (searchTerms.length > 0) {
    response += ` for your search: ${searchTerms.join(', ')}.`;
  } else {
    response += `.`;
  }
  
  response += `\n\n**Available options:**\n`;
  response += `• Ask about "enrollment process" for step-by-step procedures\n`;
  response += `• Ask about "enrollment requirements" or "documents needed"\n`;
  response += `• Ask about specific departments like "Computer Science enrollment" or "Engineering enrollment"\n`;
  response += `• Ask for "all enrollment information" to see everything\n\n`;
  response += `💡 *Try rephrasing your question or ask about a specific department!*`;
  
  return response;
}

export function formatEnrollmentProcess(enrollment: any): string {
  let response = `📝 **Enrollment Process`;
  
  if (enrollment.department_to_enroll) {
    response += ` - ${enrollment.department_to_enroll}`;
  }
  
  response += `:**\n\n`;
  
  if (enrollment.enrollment_process) {
    response += `${enrollment.enrollment_process}\n\n`;
  } else {
    response += `Process information not available.\n\n`;
  }
  
  if (enrollment.enrollment_documents) {
    response += `**📄 Required Documents:**\n${enrollment.enrollment_documents}\n\n`;
  }
  
  response += `💡 *Need information about other departments? Just ask!*`;
  
  return response.trim();
}

export function formatEnrollmentDocuments(enrollment: any): string {
  let response = `📄 **Required Documents`;
  
  if (enrollment.department_to_enroll) {
    response += ` - ${enrollment.department_to_enroll}`;
  }
  
  response += `:**\n\n`;
  
  if (enrollment.enrollment_documents) {
    response += `${enrollment.enrollment_documents}\n\n`;
  } else {
    response += `Document requirements not available.\n\n`;
  }
  
  if (enrollment.enrollment_process) {
    response += `**📝 Enrollment Process:**\n${enrollment.enrollment_process.substring(0, 200)}${enrollment.enrollment_process.length > 200 ? '...' : ''}\n\n`;
  }
  
  response += `💡 *Need the complete enrollment process? Ask about the enrollment procedure!*`;
  
  return response.trim();
}

export function formatDepartmentEnrollment(enrollment: any): string {
  let response = `🏫 **${enrollment.department_to_enroll || 'Department'} Enrollment Information:**\n\n`;
  
  if (enrollment.enrollment_process) {
    response += `**📝 Enrollment Process:**\n${enrollment.enrollment_process}\n\n`;
  }
  
  if (enrollment.enrollment_documents) {
    response += `**📄 Required Documents:**\n${enrollment.enrollment_documents}\n\n`;
  }
  
  response += `💡 *Questions about other departments or need more details? Just ask!*`;
  
  return response.trim();
}

export function formatGeneralEnrollment(enrollment: any): string {
  return formatDepartmentEnrollment(enrollment);
}