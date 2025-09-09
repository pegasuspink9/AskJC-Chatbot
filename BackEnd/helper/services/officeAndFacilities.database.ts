import { PrismaClient, Prisma } from "@prisma/client";
const db = new PrismaClient();

import {
  formatOffice,
  formatFacility,
  formatRoom,
  formatGeneralLocation,
  formatBuilding,
} from "../utils/officeAndFacilities.helper";

interface SearchOfficeFacilityParams {
  offices_name?: string;
  facility_name?: string;
  room_number?: string;
  building?: string;
  map_name?: string;
}

export async function searchOfficeAndFacilities(
  params: SearchOfficeFacilityParams
): Promise<string> {
  console.log("🔍 LOCATION SEARCH PARAMS:", params);

  try {
    const conditions: Prisma.OfficeAndFacilitiesWhereInput[] = [];

    if (params.offices_name) {
      conditions.push({
        office_name: { contains: params.offices_name, mode: "insensitive" },
      });
    }
    if (params.facility_name) {
      conditions.push({
        facility_name: { contains: params.facility_name, mode: "insensitive" },
      });
    }
    if (params.room_number) {
      conditions.push({
        room_number: { contains: params.room_number, mode: "insensitive" },
      });
    }
    if (params.building) {
      conditions.push({
        building: { contains: params.building, mode: "insensitive" },
      });
    }
    if (params.map_name) {
      conditions.push({
        map_name: { contains: params.map_name, mode: "insensitive" },
      });
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0] || {};

    const results = await db.officeAndFacilities.findMany({
      where: whereCondition,
      orderBy: { id: "asc" },
    });

    if (results.length === 0) {
      return "No office, facility, or room matched your search.";
    }

    if (results.length === 1) {
      const data = results[0];
      if (data.office_name) return formatOffice(data);
      if (data.facility_name) return formatFacility(data);
      if (data.room_number) return formatRoom(data);
      if (data.building) return formatBuilding(data);
    }

    return results
      .map((d) => {
        if (d.office_name) return formatOffice(d);
        if (d.facility_name) return formatFacility(d);
        if (d.room_number) return formatRoom(d);
        if (d.building) return formatBuilding(d);
        return formatGeneralLocation(d, "");
      })
      .join("\n\n");
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for location information.";
  }
}
