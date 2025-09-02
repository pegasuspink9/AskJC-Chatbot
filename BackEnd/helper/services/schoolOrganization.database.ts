import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { formatOrganizationDescription, formatOrganizationFacebook, formatOrganizationGeneral, formatMultipleOrganizations } from "../../helper/utils/schoolOrganization.helper";

interface SearchOrganizationParams {
  organization_name?: string | string[];
  description?: string | string[];
  fb_page?: string | string[];
}

export async function searchSchoolOrganization(params: SearchOrganizationParams): Promise<string> {
  console.log("🔍 ORGANIZATION SEARCH PARAMS:", params);

  try {
    const addCondition = (field: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        return {
          OR: value.map(v => ({
            [field]: { contains: v, mode: "insensitive" }
          }))
        };
      }
      return { [field]: { contains: value, mode: "insensitive" } };
    };

    const conditions = [];

    if (params.organization_name) conditions.push(addCondition("organization_name", params.organization_name));
    if (params.description) conditions.push(addCondition("description", params.description));
    if (params.fb_page) conditions.push(addCondition("fb_page", params.fb_page));

    if (conditions.length === 0) {
      // Get all organizations when no specific criteria
      const allOrganizations = await db.studentOrg.findMany({
        orderBy: { organization_name: "asc" },
      });
      
      if (allOrganizations.length > 0) {
        return formatMultipleOrganizations(allOrganizations);
      }
      
      return "I need more specific information. Please ask about a specific organization name, description, or Facebook page.";
    }

    const whereCondition = conditions.length > 1 
      ? { AND: conditions }
      : conditions[0];

    const organizations = await db.studentOrg.findMany({
      where: whereCondition,
      orderBy: { organization_name: "asc" },
    });

    console.log("🔍 FOUND ORGANIZATIONS:", organizations);

    if (organizations.length === 0) {
      return "No organizations matched your search criteria.";
    }

    if (organizations.length === 1) {
      const org = organizations[0];
      
      if (params.description) {
        return formatOrganizationDescription(org);
      } else if (params.fb_page) {
        return formatOrganizationFacebook(org);
      } else {
        return formatOrganizationGeneral(org);
      }
    } else {
      return formatMultipleOrganizations(organizations);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for organization information.";
  }
}