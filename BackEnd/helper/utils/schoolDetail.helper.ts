interface SchoolDetail {
  small_details?: string;
  vision?: string;
  mission?: string;
  goals?: string;
  address?: string;
  history?: string;
}

export function formatSchoolGeneral(schoolDetail: SchoolDetail): string {
  const details: string[] = [];
  if (schoolDetail.small_details)
    details.push(`small details: ${schoolDetail.small_details}`);
  if (schoolDetail.vision) details.push(`${schoolDetail.vision}`);
  if (schoolDetail.mission) details.push(`${schoolDetail.mission}`);
  if (schoolDetail.goals) details.push(`${schoolDetail.goals}`);
  if (schoolDetail.address) details.push(`${schoolDetail.address}`);
  if (schoolDetail.history) details.push(`${schoolDetail.history}`);

  const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";
  return `Saint Joseph College${detailsStr}.`;
}

export function formatSchoolSmallDetails(schoolDetail: SchoolDetail): string {
  return schoolDetail.small_details
    ? `${schoolDetail.small_details}`
    : `Saint Joseph College small details are not available.`;
}

export function formatSchoolVision(schoolDetail: SchoolDetail): string {
  return schoolDetail.vision
    ? `${schoolDetail.vision}`
    : `Saint Joseph College vision is not available.`;
}

export function formatSchoolMission(schoolDetail: SchoolDetail): string {
  return schoolDetail.mission
    ? `${schoolDetail.mission}`
    : `Saint Joseph College mission is not available.`;
}

export function formatSchoolGoals(schoolDetail: SchoolDetail): string {
  return schoolDetail.goals
    ? `${schoolDetail.goals}`
    : `Saint Joseph College goals are not available.`;
}

export function formatSchoolAddress(schoolDetail: SchoolDetail): string {
  return schoolDetail.address
    ? `${schoolDetail.address}`
    : `Saint Joseph College address is not available.`;
}

export function formatSchoolHistory(schoolDetail: SchoolDetail): string {
  return schoolDetail.history
    ? `${schoolDetail.history}`
    : `Saint Joseph College history is not available.`;
}

export function formatSchoolPresident(schoolDetail: SchoolDetail): string {
  if (schoolDetail.history) {
    const presidentMatch = schoolDetail.history.match(/President: ([^\n,.]+)/i);
    if (presidentMatch && presidentMatch[1]) {
      return `Saint Joseph College president: ${presidentMatch[1].trim()}`;
    }
  }
  return `Saint Joseph College president is not available.`;
}

export function formatSchoolEvents(schoolDetail: SchoolDetail): string {
  if (schoolDetail.history) {
    const eventsMatch = schoolDetail.history.match(/Events: ([^\n,.]+)/i);
    if (eventsMatch && eventsMatch[1]) {
      return `Saint Joseph College events: ${eventsMatch[1].trim()}`;
    }
  }
  return `Saint Joseph College events are not available.`;
}

export function formatMultipleSchoolInfo(
  schools: SchoolDetail[],
  types: string[]
): string {
  if (schools.length === 0) {
    return "No school information available.";
  }

  const validTypes = [
    "small_details",
    "vision",
    "mission",
    "goals",
    "address",
    "history",
    "president",
    "events",
  ];

  const filteredTypes = types.filter((type) => validTypes.includes(type));

  return schools
    .map((schoolDetail) => {
      if (filteredTypes.length === 1) {
        const type = filteredTypes[0];
        switch (type) {
          case "small_details":
            return formatSchoolSmallDetails(schoolDetail);
          case "vision":
            return formatSchoolVision(schoolDetail);
          case "mission":
            return formatSchoolMission(schoolDetail);
          case "goals":
            return formatSchoolGoals(schoolDetail);
          case "address":
            return formatSchoolAddress(schoolDetail);
          case "history":
            return formatSchoolHistory(schoolDetail);
          case "president":
            return formatSchoolPresident(schoolDetail);
          case "events":
            return formatSchoolEvents(schoolDetail);
          default:
            return "";
        }
      }

      if (filteredTypes.length === 0) {
        return formatSchoolGeneral(schoolDetail);
      }

      if (filteredTypes.length <= 3) {
        return filteredTypes
          .map((type) => {
            switch (type) {
              case "small_details":
                return formatSchoolSmallDetails(schoolDetail);
              case "vision":
                return formatSchoolVision(schoolDetail);
              case "mission":
                return formatSchoolMission(schoolDetail);
              case "goals":
                return formatSchoolGoals(schoolDetail);
              case "address":
                return formatSchoolAddress(schoolDetail);
              case "history":
                return formatSchoolHistory(schoolDetail);
              case "president":
                return formatSchoolPresident(schoolDetail);
              case "events":
                return formatSchoolEvents(schoolDetail);
              default:
                return "";
            }
          })
          .filter((text) => text)
          .join("\n");
      }

      const header = `Found ${filteredTypes.length} types of information:\n`;
      const list = filteredTypes
        .map((type) => {
          switch (type) {
            case "small_details":
              return schoolDetail.small_details || "";
            case "vision":
              return schoolDetail.vision || "";
            case "mission":
              return schoolDetail.mission || "";
            case "goals":
              return schoolDetail.goals || "";
            case "address":
              return schoolDetail.address || "";
            case "history":
              return schoolDetail.history || "";
            case "president": {
              const presidentMatch = schoolDetail.history
                ? schoolDetail.history.match(/President: ([^\n,.]+)/i)
                : null;
              return presidentMatch && presidentMatch[1]
                ? `• President: ${presidentMatch[1].trim()}`
                : "";
            }
            case "events": {
              const eventsMatch = schoolDetail.history
                ? schoolDetail.history.match(/Events: ([^\n,.]+)/i)
                : null;
              return eventsMatch && eventsMatch[1]
                ? `• Events: ${eventsMatch[1].trim()}`
                : "";
            }
            default:
              return "";
          }
        })
        .filter((text) => text)
        .join("\n");

      return header + list;
    })
    .filter((text) => text)
    .join("\n\n");
}
