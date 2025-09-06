import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { 
  formatEnrollmentProcess, 
  formatNavigation, 
  formatEnrollmentGeneral, 
  formatMultipleEnrollmentAndNavigation 
} from "../utils/schoolEnrollmentAndNavigation.helper";

interface SearchEnrollmentAndNavigationParams {
  enrollment_process?: string | string[];
  navigation?: string | string[];
}

export async function searchSchoolEnrollmentAndNavigation(params: SearchEnrollmentAndNavigationParams): Promise<string> {
  console.log("🔍 ENROLLMENT & NAVIGATION SEARCH PARAMS:", params);

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

    if (params.enrollment_process) conditions.push(addCondition("enrollment_process", params.enrollment_process));
    if (params.navigation) conditions.push(addCondition("navigation", params.navigation));

    if (conditions.length === 0) {
      return "I need more specific information. Please ask about enrollment processes or campus navigation.";
    }

    const whereCondition = conditions.length > 1 
      ? { AND: conditions }
      : conditions[0];

    const enrollmentAndNavigation = await db.enrollmentAndNavigation.findMany({
      where: whereCondition,
      orderBy: { id: "asc" },
    });

    console.log("🔍 FOUND ENROLLMENT & NAVIGATION:", enrollmentAndNavigation);

    if (enrollmentAndNavigation.length === 0) {
      return "No enrollment or navigation information matched your search criteria.";
    }

    if (enrollmentAndNavigation.length === 1) {
      const item = enrollmentAndNavigation[0];
      
      if (params.enrollment_process) {
        return formatEnrollmentProcess(item);
      } else if ( params.navigation) {
        return formatNavigation(item);
      } else {
        return formatEnrollmentGeneral(item);
      }
    } else {
      return formatMultipleEnrollmentAndNavigation(enrollmentAndNavigation);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for enrollment and navigation information.";
  }
}