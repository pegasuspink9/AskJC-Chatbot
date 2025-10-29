import { PrismaClient, Prisma } from "@prisma/client";
const db = new PrismaClient();

import {
  generateSingleOfficeResponse,
  generateMultipleOfficesResponse,
  formatOfficeLocation,
  formatOfficeContact,
  formatOfficeHours,
  formatOfficeDescription,
  formatOfficeByBuilding,
  formatOfficeByFloor,
} from "../utils/schoolOffices.helper";

interface SearchOfficeParams {
  office_name?: string;
  description?: string;
  location_building?: string;
  location_floor?: string;
  operating_hours?: string;
  contact_email?: string;
  contact_phone?: string;
  fb_page?: string;
  map_url?: string;
  office_url?: string;
}

export async function searchOffices(
  params: SearchOfficeParams
): Promise<string> {
  console.log("🔍 OFFICE SEARCH PARAMS:", params);

  try {
    const conditions: Prisma.OfficeWhereInput[] = [];

    if (params.office_name) {
      conditions.push({
        office_name: { contains: params.office_name, mode: "insensitive" },
      });
    }

    if (params.location_building) {
      conditions.push({
        location_building: {
          contains: params.location_building,
          mode: "insensitive",
        },
      });
    }
    if (params.location_floor) {
      conditions.push({
        location_floor: {
          contains: params.location_floor,
          mode: "insensitive",
        },
      });
    }

    if (params.description) {
      conditions.push({
        description: { contains: params.description, mode: "insensitive" },
      });
    }
    if (params.operating_hours) {
      conditions.push({
        operating_hours: {
          contains: params.operating_hours,
          mode: "insensitive",
        },
      });
    }
    if (params.contact_email) {
      conditions.push({
        contact_email: { contains: params.contact_email, mode: "insensitive" },
      });
    }
    if (params.contact_phone) {
      conditions.push({
        contact_phone: { contains: params.contact_phone, mode: "insensitive" },
      });
    }
    if (params.fb_page) {
      conditions.push({
        fb_page: { contains: params.fb_page, mode: "insensitive" },
      });
    }
    if (params.map_url) {
      conditions.push({
        map_url: { contains: params.map_url, mode: "insensitive" },
      });
    }
    if (params.office_url) {
      conditions.push({
        office_url: { contains: params.office_url, mode: "insensitive" },
      });
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0] || {};

    const offices = await db.office.findMany({
      where: whereCondition,
      orderBy: { office_name: "asc" },
    });

    console.log("🔍 FOUND OFFICES:", offices);

    if (offices.length === 0) {
      return "No offices matched your search criteria.";
    }

    if (params.location_building || params.location_floor) {
      if (params.location_building && !params.location_floor) {
        return generateMultipleOfficesResponse(offices, "building");
      } else if (params.location_floor && !params.location_building) {
        return generateMultipleOfficesResponse(offices, "floor");
      } else {
        return generateMultipleOfficesResponse(offices, "location");
      }
    }

    if (offices.length === 1) {
      const office = offices[0];
      if (params.contact_email || params.contact_phone || params.fb_page) {
        return formatOfficeContact(office);
      } else if (params.operating_hours) {
        return formatOfficeHours(office);
      } else if (params.description) {
        return formatOfficeDescription(office);
      } else {
        return generateSingleOfficeResponse(office);
      }
    }

    return generateMultipleOfficesResponse(offices);
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for office information.";
  }
}
