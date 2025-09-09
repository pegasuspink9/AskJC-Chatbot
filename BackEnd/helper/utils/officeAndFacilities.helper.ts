import { OfficeAndFacilities } from "@prisma/client";

export function formatOffice(data: OfficeAndFacilities): string {
  if (data.office_name) {
    const location: string[] = [];

    if (data.building) location.push(`Building: ${data.building}`);
    if (data.map_name) location.push(`Map: ${data.map_name}`);

    let response = `The **${data.office_name}** is located at ${location.join(
      ", "
    )}.`;

    if (data.map_overview_url) {
      response += `\n\nMap Overview: ${data.map_overview_url}`;
    }
    if (data.office_url) {
      response += `\nOffice Map: ${data.office_url}`;
    }

    return response;
  }
  return `Office information is not available.`;
}

export function formatFacility(data: OfficeAndFacilities): string {
  if (data.facility_name) {
    const location: string[] = [];

    if (data.building) location.push(`Building: ${data.building}`);
    if (data.map_name) location.push(`Map: ${data.map_name}`);

    let response = `The **${data.facility_name}** is located at ${location.join(
      ", "
    )}.`;

    if (data.map_overview_url) {
      response += `\n\nMap Overview: ${data.map_overview_url}`;
    }
    if (data.facility_url) {
      response += `\nFacility Map: ${data.facility_url}`;
    }

    return response;
  }
  return `Facility information is not available.`;
}

export function formatRoom(data: OfficeAndFacilities): string {
  if (data.room_number) {
    const location: string[] = [];

    if (data.building) location.push(`Building: ${data.building}`);
    if (data.map_name) location.push(`Map: ${data.map_name}`);

    let response = `The room **${
      data.room_number
    }** is located at ${location.join(", ")}.`;

    if (data.map_overview_url) {
      response += `\n\nMap Overview: ${data.map_overview_url}`;
    }
    if (data.room_url) {
      response += `\nRoom Map: ${data.room_url}`;
    }

    return response;
  }
  return `Room information is not available.`;
}

export function formatBuilding(data: OfficeAndFacilities): string {
  if (data.building) {
    let response = `The building is called **${data.building}**`;

    if (data.map_name) response += `, located on map: ${data.map_name}`;

    if (data.map_overview_url)
      response += `\n\nMap Overview: ${data.map_overview_url}`;

    return response + ".";
  }
  return "Building information is not available.";
}

export function formatGeneralLocation(
  data: OfficeAndFacilities,
  queryType: string
): string {
  switch (queryType) {
    case "office_name":
      return formatOffice(data);
    case "facility_name":
      return formatFacility(data);
    case "room_number":
      return formatRoom(data);
    case "building":
      return formatBuilding(data);
    default:
      return "I found location data, but I’m not sure how to display it.";
  }
}
