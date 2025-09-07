export function formatCourseCode(course: any): string {
  if (course.course_code) {
    let response = `The course code ${course.course_code}`;
    
    if (course.course_name) {
      response += ` is for "${course.course_name}".`;
    } else {
      response += ` information is available.`;
    }
    
    if (course.program) {
      response += ` This course is part of the ${course.program} program.`;
    }
    
    if (course.year_level) {
      response += ` It's offered for ${course.year_level} students.`;
    }
    
    if (course.semester) {
      response += ` Available in ${course.semester}.`;
    }
    
    if (course.units) {
      response += ` Course units: ${course.units}.`;
    }
    
    return response;
  } else {
    return `Course code information is not available.`;
  }
}

export function formatCourseName(course: any): string {
  if (course.course_name) {
    let response = `The course "${course.course_name}"`;
    
    if (course.course_code) {
      response += ` has the course code ${course.course_code}.`;
    } else {
      response += ` information is available.`;
    }
    
    if (course.program) {
      response += ` This course belongs to the ${course.program} program.`;
    }
    
    if (course.year_level && course.semester) {
      response += ` It's offered for ${course.year_level} students in ${course.semester}.`;
    } else if (course.year_level) {
      response += ` It's offered for ${course.year_level} students.`;
    } else if (course.semester) {
      response += ` Available in ${course.semester}.`;
    }
    
    if (course.units) {
      response += ` Course units: ${course.units}.`;
    }
    
    return response;
  } else {
    return `Course name information is not available.`;
  }
}

export function formatCourseProgram(course: any): string {
  if (course.program) {
    let response = `The ${course.program} program offers`;
    
    if (course.course_code && course.course_name) {
      response += ` ${course.course_code} - ${course.course_name}.`;
    } else if (course.course_code) {
      response += ` course ${course.course_code}.`;
    } else if (course.course_name) {
      response += ` "${course.course_name}".`;
    } else {
      response += ` various courses.`;
    }
    
    if (course.year_level) {
      response += ` This course is for ${course.year_level} students.`;
    }
    
    if (course.semester) {
      response += ` Available in ${course.semester}.`;
    }
    
    if (course.units) {
      response += ` Course units: ${course.units}.`;
    }
    
    return response;
  } else {
    return `Program information is not available.`;
  }
}

export function formatCourseYear(course: any): string {
  if (course.year_level) {
    let response = `For ${course.year_level} students`;
    
    if (course.course_code && course.course_name) {
      response += `, there's ${course.course_code} - ${course.course_name}.`;
    } else if (course.course_code) {
      response += `, course ${course.course_code} is available.`;
    } else if (course.course_name) {
      response += `, "${course.course_name}" is available.`;
    } else {
      response += `, courses are available.`;
    }
    
    if (course.program) {
      response += ` This course is part of the ${course.program} program.`;
    }
    
    if (course.semester) {
      response += ` Offered in ${course.semester}.`;
    }
    
    if (course.units) {
      response += ` Course units: ${course.units}.`;
    }
    
    return response;
  } else {
    return `Year level information is not available.`;
  }
}

export function formatCourseSemester(course: any): string {
  if (course.semester) {
    let response = `In ${course.semester}`;
    
    if (course.course_code && course.course_name) {
      response += `, ${course.course_code} - ${course.course_name} is offered.`;
    } else if (course.course_code) {
      response += `, course ${course.course_code} is offered.`;
    } else if (course.course_name) {
      response += `, "${course.course_name}" is offered.`;
    } else {
      response += `, courses are offered.`;
    }
    
    if (course.program && course.year_level) {
      response += ` This course is for ${course.year_level} ${course.program} students.`;
    } else if (course.program) {
      response += ` This course is part of the ${course.program} program.`;
    } else if (course.year_level) {
      response += ` This course is for ${course.year_level} students.`;
    }
    
    if (course.units) {
      response += ` Course units: ${course.units}.`;
    }
    
    return response;
  } else {
    return `Semester information is not available.`;
  }
}

export function formatCourseUnits(course: any): string {
  if (course.units) {
    let response = `This course has ${course.units} units.`;
    
    if (course.course_code && course.course_name) {
      response = `${course.course_code} - ${course.course_name} has ${course.units} units.`;
    } else if (course.course_code) {
      response = `Course ${course.course_code} has ${course.units} units.`;
    } else if (course.course_name) {
      response = `"${course.course_name}" has ${course.units} units.`;
    }
    
    if (course.program) {
      response += ` This course is part of the ${course.program} program.`;
    }
    
    if (course.year_level && course.semester) {
      response += ` Offered for ${course.year_level} students in ${course.semester}.`;
    } else if (course.year_level) {
      response += ` Offered for ${course.year_level} students.`;
    } else if (course.semester) {
      response += ` Available in ${course.semester}.`;
    }
    
    return response;
  } else {
    return `Course units information is not available.`;
  }
}

export function generateSingleCourseResponse(course: any): string {
  const details = [];
  
  if (course.course_code) details.push(`Code: ${course.course_code}`);
  if (course.course_name) details.push(`Name: ${course.course_name}`);
  if (course.program) details.push(`Program: ${course.program}`);
  if (course.year_level) details.push(`Year Level: ${course.year_level}`);
  if (course.semester) details.push(`Semester: ${course.semester}`);
  if (course.units) details.push(`Units: ${course.units}`);
  
  if (details.length > 0) {
    const courseTitle = course.course_code && course.course_name 
      ? `${course.course_code} - ${course.course_name}`
      : course.course_code || course.course_name || 'Course';
    return `**${courseTitle}**\n${details.map(detail => `• ${detail}`).join('\n')}`;
  } else {
    return `**Course** - Course information available.`;
  }
}

export function generateMultipleCoursesResponse(courses: any[]): string {
  if (courses.length <= 3) {
    const header = `Saint Joseph College courses:\n\n`;
    const list = courses.map(course => generateSingleCourseResponse(course)).join('\n\n');
    return header + list;
  } else {
    const header = `Saint Joseph College courses:\nFound ${courses.length} courses:\n`;
    const list = courses.map((course, i) => {
      const details = [];
      if (course.course_code) details.push(`Code: ${course.course_code}`);
      if (course.course_name) details.push(`Name: ${course.course_name.substring(0, 40)}${course.course_name.length > 40 ? '...' : ''}`);
      if (course.program?.program_name) details.push(`Program: ${course.program.program_name.substring(0, 20)}${course.program.program_name.length > 20 ? '...' : ''}`);
      if (course.year_level) details.push(`Year: ${course.year_level}`);
      if (course.semester) details.push(`Sem: ${course.semester}`);
      if (course.units) details.push(`Units: ${course.units}`);
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      const courseTitle = course.course_code && course.course_name 
        ? `${course.course_code} - ${course.course_name}`
        : course.course_code || course.course_name || 'Course';
      return `${i + 1}. **${courseTitle}**${detailsStr}`;
    }).join('\n');
    
    return header + list + '\n\n💡 **Tip:** Ask about specific course codes, programs, or year levels for detailed information!';
  }
}

export function generateNotFoundCourseMessage(
  course_code?: string,
  course_name?: string | string[],
  program?: string | string[],
  year_level?: string | string[],
  semester?: string | string[],
  units?: string
): string {
  if (course_code) return `I couldn't find any course with code ${course_code}.`;
  if (course_name) return `I couldn't find any course named ${Array.isArray(course_name) ? course_name.join(' or ') : course_name}.`;
  if (program) return `I couldn't find any course in program ${Array.isArray(program) ? program.join(' or ') : program}.`;
  if (year_level) return `I couldn't find any course for ${Array.isArray(year_level) ? year_level.join(' or ') : year_level}.`;
  if (semester) return `I couldn't find any course in ${Array.isArray(semester) ? semester.join(' or ') : semester}.`;
  if (units) return `I couldn't find any course with ${units} units.`;
  return "I couldn't find any courses matching your search criteria.";
}