

export function formatDepartmentLocation(dept: any): string {
  const location = [];
  if (dept.floor) location.push(`${dept.floor}`);
  if (dept.building) location.push(`${dept.building}`);
  
  const locationStr = location.length > 0 ? ` is located at ${location.join(' of ')}` : '';
  return `${dept.name}${locationStr}.`;
}

export function formatDepartmentHead(dept: any): string {
  return dept.head_name 
    ? `${dept.name} is headed by ${dept.head_name}.`
    : `${dept.name} head information is not available.`;
}

export function formatDepartmentDescription(dept: any): string {
  return dept.description 
    ? `${dept.name}: ${dept.description}`
    : `${dept.name} description is not available.`;
}

export function formatDepartmentCareerPath(dept: any): string {
  return dept.career_path 
    ? `${dept.name} is associated with the ${dept.career_path} career path.`
    : `${dept.name} career path information is not available.`;
}

export function formatDepartmentGeneral(dept: any): string {
  const details = [];
  
  if (dept.head_name) details.push(`headed by ${dept.head_name}`);
  if (dept.building && dept.floor) details.push(`located at ${dept.floor} of ${dept.building}`);
  else if (dept.building) details.push(`located in ${dept.building}`);
  else if (dept.floor) details.push(`located on ${dept.floor}`);
  if (dept.career_path) details.push(`associated with ${dept.career_path} career path`);
  
  const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
  return `${dept.name}${detailsStr}.`;
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
  }
}