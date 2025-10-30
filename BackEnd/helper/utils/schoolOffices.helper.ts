export function formatOfficeByBuilding(office: any): string {
  if (office.location_building) {
    let response = `The ${office.office_name} is located in the ${office.location_building}`;

    if (office.location_floor) {
      response += ` on the ${office.location_floor}`;
    }

    response += ".";

    if (office.operating_hours) {
      response += ` It is open ${office.operating_hours}.`;
    }

    if (office.map_url) {
      response += `\n\nView the location on the map: ${office.map_url}`;
    }

    if (office.office_url) {
      response += `\nView the office image: ${office.office_url}`;
    }

    return response;
  }
  return `Building information for the ${office.office_name} is not available.`;
}

export function formatOfficeByFloor(office: any): string {
  if (office.location_floor) {
    let response = `The ${office.office_name} is located on the ${office.location_floor}`;

    if (office.location_building) {
      response += ` of the ${office.location_building}`;
    }

    response += ".";

    if (office.operating_hours) {
      response += ` It is open ${office.operating_hours}.`;
    }

    if (office.map_url) {
      response += `\n\nView the location on the map: ${office.map_url}`;
    }

    if (office.office_url) {
      response += `\nView the office image: ${office.office_url}`;
    }

    return response;
  }
  return `Floor information for the ${office.office_name} is not available.`;
}

export function formatOfficeLocation(office: any): string {
  const location = [];
  if (office.location_floor) location.push(`Floor: ${office.location_floor}`);
  if (office.location_building)
    location.push(`Building: ${office.location_building}`);
  if (office.map_url) location.push(`Map: ${office.map_url}`);
  if (office.office_url) location.push(`Office Image: ${office.office_url}`);

  if (location.length > 0) {
    let response = `The ${office.office_name} is located at ${location.join(
      ", "
    )}.`;

    if (office.operating_hours) {
      response += ` The office is open ${office.operating_hours}.`;
    }

    if (office.description) {
      response += ` This office handles ${office.description}.`;
    }

    if (office.map_url) {
      response += ` You can view the map here: ${office.map_url}.`;
    }

    if (office.office_url) {
      response += ` You can view the office here: ${office.office_url}.`;
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
    let response = `You can contact the ${
      office.office_name
    } through: ${contacts.join(", ")}.`;

    const location = [];
    if (office.location_floor) location.push(office.location_floor);
    if (office.location_building) location.push(office.location_building);
    if (office.map_url) location.push(`Map: ${office.map_url}`);
    if (office.office_url) location.push(`Office Image: ${office.office_url}`);

    if (location.length > 0) {
      response += ` Visit them at ${location.join(", ")}.`;
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
    if (office.map_url) location.push(`Map: ${office.map_url}`);
    if (office.office_url) location.push(`Office Image: ${office.office_url}`);

    if (location.length > 0) {
      response += ` Visit the office at ${location.join(", ")}.`;
    }

    if (office.contact_phone || office.contact_email) {
      const contacts = [];
      if (office.contact_phone) contacts.push(office.contact_phone);
      if (office.contact_email) contacts.push(office.contact_email);
      response += ` For inquiries, contact: ${contacts.join(" or ")}.`;
    }

    return response;
  } else {
    return `Operating hours for the ${office.office_name} are not available.`;
  }
}

export function formatOfficeDescription(office: any): string {
  if (office.description) {
    let response = `The ${office.office_name} handles: ${office.description}`;

    const location = [];
    if (office.location_floor) location.push(office.location_floor);
    if (office.location_building) location.push(office.location_building);
    if (office.map_url) location.push(`Map: ${office.map_url}`);
    if (office.office_url) location.push(`Office Image: ${office.office_url}`);

    if (location.length > 0) {
      response += ` You can find this office at ${location.join(", ")}.`;
    }

    if (office.operating_hours) {
      response += ` Office hours: ${office.operating_hours}.`;
    }

    return response;
  } else {
    return `Description for the ${office.office_name} is not available.`;
  }
}

export function generateSingleOfficeResponse(office: any): string {
  const details = [];
  if (office.description) details.push(`Purpose: ${office.description}`);

  if (
    (office.location_building && office.location_floor) ||
    (office.map_url && office.office_url)
  ) {
    details.push(
      `Location: Floor ${office.location_floor}, ${office.location_building}, Map: ${office.map_url}, Office Image: ${office.office_url}`
    );
  } else if (office.location_building) {
    details.push(`Location: ${office.location_building}`);
  } else if (office.location_floor) {
    details.push(`Floor: ${office.location_floor}`);
  } else if (office.map_url) {
    details.push(`Map: ${office.map_url}`);
  } else if (office.office_url) {
    details.push(`Office Image: ${office.office_url}`);
  }

  if (office.operating_hours) details.push(`Hours: ${office.operating_hours}`);
  if (office.contact_email) details.push(`Email: ${office.contact_email}`);
  if (office.contact_phone) details.push(`Phone: ${office.contact_phone}`);
  if (office.fb_page) details.push(`Facebook: ${office.fb_page}`);
  if (office.map_url) details.push(`Map: ${office.map_url}`);
  if (office.office_url) details.push(`Office Image: ${office.office_url}`);

  if (details.length > 0) {
    return `**${office.office_name}**\n${details
      .map((detail) => `• ${detail}`)
      .join("\n")}`;
  } else {
    return `**${office.office_name}** - Office information available.`;
  }
}

export function generateMultipleOfficesResponse(
  offices: any[],
  queryType?: "building" | "floor" | "location"
): string {
  if (queryType === "building") {
    return (
      `Offices in the ${offices[0].location_building}:\n\n` +
      offices.map((office) => formatOfficeByBuilding(office)).join("\n\n")
    );
  }

  if (queryType === "floor") {
    return (
      `Offices on the ${offices[0].location_floor}:\n\n` +
      offices.map((office) => formatOfficeByFloor(office)).join("\n\n")
    );
  }

  if (queryType === "location") {
    return (
      `Office locations found:\n\n` +
      offices.map((office) => formatOfficeLocation(office)).join("\n\n")
    );
  }

  if (offices.length <= 3) {
    return (
      `Saint Joseph College offices:\n\n` +
      offices.map((office) => generateSingleOfficeResponse(office)).join("\n\n")
    );
  }

  const details = offices
    .map((office, i) => {
      const info = [];
      if (office.description)
        info.push(`Purpose: ${office.description.substring(0, 50)}...`);
      if (office.location_building)
        info.push(`Building: ${office.location_building}`);
      if (office.location_floor) info.push(`Floor: ${office.location_floor}`);
      if (office.operating_hours)
        info.push(`Hours: ${office.operating_hours.split(",")[0]}...`);
      if (office.contact_phone) info.push(`Phone: ${office.contact_phone}`);

      const detailsStr = info.length > 0 ? ` (${info.join(", ")})` : "";
      return `${i + 1}. **${office.office_name}**${detailsStr}`;
    })
    .join("\n");

  return `Saint Joseph College offices:\nFound ${offices.length} offices:\n${details}\n\n💡 **Tip:** Ask about specific offices for detailed location, hours, and contact information!`;
}

export function generateNotFoundOfficeMessage(
  office_name?: string,
  location_building?: string | string[],
  location_floor?: string | string[]
): string {
  if (office_name) return `I couldn't find any office named ${office_name}.`;
  if (location_building)
    return `I couldn't find any office in building ${
      Array.isArray(location_building)
        ? location_building.join(" or ")
        : location_building
    }.`;
  if (location_floor)
    return `I couldn't find any office on floor ${
      Array.isArray(location_floor)
        ? location_floor.join(" or ")
        : location_floor
    }.`;
  return "I couldn't find any offices matching your search criteria.";
}
