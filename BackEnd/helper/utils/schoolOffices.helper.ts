export function generateSingleOfficeResponse(office: any, query_type?: string): string {
    return `${office.name}${office.description ? ` - ${office.description}` : ""}${office.location_building ? ` (Building: ${office.location_building})` : ""}${office.location_floor ? ` - Floor: ${office.location_floor}` : ""}${office.operating_hours ? ` - Hours: ${office.operating_hours}` : ""}${office.contact_email ? ` - Email: ${office.contact_email}` : ""}${office.contact_phone ? ` - Phone: ${office.contact_phone}` : ""}${office.fb_page ? ` - FB: ${office.fb_page}` : ""}`;
}

export function generateMultipleOfficesResponse(offices: any[], query_type?: string): string {
  if (offices.length <= 3) {
    const header = `Saint Joseph College offices are:\n`;
    const list = offices.map(o => generateSingleOfficeResponse(o, query_type)).join("\n\n");
    return header + list;
  } else {
    const header = `Saint Joseph College offices are:\nFound ${offices.length} offices:\n`;
    const list = offices
      .map((o, i) => `${i + 1}. ${o.name}${o.description ? ` - ${o.description}` : ""}${o.location_building ? ` (Building: ${o.location_building})` : ""}${o.location_floor ? ` - Floor: ${o.location_floor}` : ""}${o.operating_hours ? ` - Hours: ${o.operating_hours}` : ""}${o.contact_email ? ` - Email: ${o.contact_email}` : ""}${o.contact_phone ? ` - Phone: ${o.contact_phone}` : ""}${o.fb_page ? ` - FB: ${o.fb_page}` : ""}`)
      .join("\n");
    return header + list;
  }
}


export function generateNotFoundOfficeMessage(
  name?: string, 
  location_building?: string | string[], 
  location_floor?: string | string[]
): string {
  if (name) return `I couldn't find any office named ${name}.`;
  if (location_building) return `I couldn't find any office in building ${location_building}.`;
  if (location_floor) return `I couldn't find any office on floor ${location_floor}.`;
  return "I couldn't find any offices matching your search.";
}