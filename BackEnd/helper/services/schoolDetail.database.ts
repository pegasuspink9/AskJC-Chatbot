import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import {
  formatSchoolGeneral,
  formatMultipleSchoolInfo,
} from "../utils/schoolDetail.helper";

export type RequirementType =
  | "small_details"
  | "vision"
  | "mission"
  | "goals"
  | "address"
  | "history";

interface SearchSchoolDetailsParams {
  school_name?: string | string[];
  requirementType?: RequirementType[];
}

function generateSingleSchoolResponse(school: any): string {
  return formatSchoolGeneral(school);
}

function generateMultipleSchoolsResponse(
  schools: any[],
  types: string[] = []
): string {
  return formatMultipleSchoolInfo(schools, types);
}

export async function searchSchoolDetails(
  params: SearchSchoolDetailsParams
): Promise<string> {
  console.log("🔍 SCHOOL SEARCH PARAMS:", params);

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

    if (params.school_name)
      conditions.push(addCondition("school_name", params.school_name));

    if (params.requirementType && params.requirementType.length > 0) {
      for (const type of params.requirementType) {
        if (type === "small_details")
          conditions.push(addCondition("small_details", ""));
        if (type === "vision") conditions.push(addCondition("vision", ""));
        if (type === "mission") conditions.push(addCondition("mission", ""));
        if (type === "goals") conditions.push(addCondition("goals", ""));
        if (type === "address") conditions.push(addCondition("address", ""));
        if (type === "history") conditions.push(addCondition("history", ""));
      }
    }

    if (conditions.length === 0) {
      const allSchools = await db.schoolDetail.findMany({
        orderBy: { school_name: "asc" },
      });
      if (allSchools.length > 0) {
        return generateMultipleSchoolsResponse(allSchools, []);
      }
      return "I need more specific information. Please ask about a specific school or requirement.";
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const schools = await db.schoolDetail.findMany({
      where: whereCondition,
      orderBy: { school_name: "asc" },
    });

    console.log("🔍 FOUND SCHOOLS:", schools);

    if (schools.length === 0) {
      return "No schools matched your search criteria.";
    }

    if (schools.length === 1) {
      const school = schools[0];
      if (params.requirementType && params.requirementType.length > 0) {
        return params.requirementType
          .map((type) => {
            const key = type as keyof typeof school;
            return `${type.toUpperCase()}: ${school[key] || "N/A"}`;
          })
          .join("\n\n");
      }
      return generateSingleSchoolResponse(school);
    } else {
      return generateMultipleSchoolsResponse(
        schools,
        params.requirementType || []
      );
    }
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for school information.";
  }
}
