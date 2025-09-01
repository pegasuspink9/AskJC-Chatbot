import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import {
  generateSingleOfficeResponse,
  generateMultipleOfficesResponse,
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
}

export async function searchOffices(
  params: SearchOfficeParams
): Promise<string> {
  console.log("🔍 OFFICE SEARCH PARAMS:", params);

  try {
    const addCondition = (field: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        return {
          OR: value.map((v) => ({
            [field]: { contains: v, mode: "insensitive" },
          })),
        };
      }
      return { [field]: { contains: value, mode: "insensitive" } };
    };

    const conditions = [];

    if (params.office_name)
      conditions.push(addCondition("office_name", params.office_name));
    if (params.description)
      conditions.push(addCondition("description", params.description));
    if (params.location_building)
      conditions.push(
        addCondition("location_building", params.location_building)
      );
    if (params.location_floor)
      conditions.push(addCondition("location_floor", params.location_floor));
    if (params.operating_hours)
      conditions.push(addCondition("operating_hours", params.operating_hours));
    if (params.contact_email)
      conditions.push(addCondition("contact_email", params.contact_email));
    if (params.contact_phone)
      conditions.push(addCondition("contact_phone", params.contact_phone));
    if (params.fb_page)
      conditions.push(addCondition("fb_page", params.fb_page));

    if (conditions.length === 0) {
      const allOffices = await db.office.findMany({
        orderBy: { office_name: "asc" },
      });
      if (allOffices.length > 0) {
        return generateMultipleOfficesResponse(allOffices);
      }
      return "I need more specific information. Please ask about a specific office name, building, floor, or other details.";
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const offices = await db.office.findMany({
      where: whereCondition,
      orderBy: { office_name: "asc" },
    });

    console.log("🔍 FOUND OFFICES:", offices);

    if (offices.length === 0) {
      return "No offices matched your search criteria.";
    }

    if (offices.length === 1) {
      return generateSingleOfficeResponse(offices[0]);
    } else {
      return generateMultipleOfficesResponse(offices);
    }
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for office information.";
  }
}
