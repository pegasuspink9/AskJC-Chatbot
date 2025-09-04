import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

import {
  formatSchoolGeneral,
  formatSchoolVision,
  formatSchoolMission,
  formatSchoolGoals,
  formatSchoolHistory,
  formatSchoolSmallDetails,
  formatSchoolAddress,
  formatSchoolEvents,
  formatSchoolPresident,
} from "../utils/schoolDetail.helper";

export type RequirementType =
  | "small_details"
  | "vision"
  | "mission"
  | "goals"
  | "address"
  | "history"
  | "school-events"
  | "school-president";

interface SearchSchoolDetailsParams {
  school_name?: string | string[];
  requirementType?: RequirementType[];
}

const createFieldExistsCondition = (fieldName: string) => ({
  AND: [{ [fieldName]: { not: null } }, { [fieldName]: { not: "" } }],
});

const createSearchCondition = (field: string, value: string | string[]) => {
  if (Array.isArray(value)) {
    return {
      OR: value.map((v) => ({
        [field]: { contains: v, mode: "insensitive" },
      })),
    };
  }
  return { [field]: { contains: value, mode: "insensitive" } };
};

function generateSingleSchoolResponse(
  school: any,
  requirementTypes?: RequirementType[]
): string {
  if (requirementTypes && requirementTypes.length > 0) {
    return requirementTypes
      .map((type) => {
        switch (type) {
          case "small_details":
            return formatSchoolSmallDetails(school);
          case "vision":
            return formatSchoolVision(school);
          case "mission":
            return formatSchoolMission(school);
          case "goals":
            return formatSchoolGoals(school);
          case "address":
            return formatSchoolAddress(school);
          case "history":
            return formatSchoolHistory(school);
          case "school-events":
            return formatSchoolEvents(school);
          case "school-president":
            return formatSchoolPresident(school);
          default:
            return "";
        }
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return formatSchoolGeneral(school);
}

function generateMultipleSchoolsResponse(
  schools: any[],
  requirementTypes: RequirementType[] = []
): string {
  return schools
    .map((school) => generateSingleSchoolResponse(school, requirementTypes))
    .join("\n\n---\n\n");
}

export async function searchSchoolDetails(
  params: SearchSchoolDetailsParams
): Promise<string> {
  console.log("🔍 SCHOOL SEARCH PARAMS:", params);

  try {
    const conditions = [];

    if (params.school_name) {
      conditions.push(createSearchCondition("school_name", params.school_name));
    }

    if (params.requirementType && params.requirementType.length > 0) {
      const historyDependentTypes = [
        "history",
        "school-president",
        "school-events",
      ];
      const regularFieldTypes = [
        "small_details",
        "vision",
        "mission",
        "goals",
        "address",
      ];

      const hasHistoryRequirement = params.requirementType.some((type) =>
        historyDependentTypes.includes(type)
      );

      const regularRequirements = params.requirementType.filter((type) =>
        regularFieldTypes.includes(type)
      );

      if (hasHistoryRequirement) {
        conditions.push(createFieldExistsCondition("history"));
      }

      regularRequirements.forEach((type) => {
        conditions.push(createFieldExistsCondition(type));
      });
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

    console.log("🔍 FOUND SCHOOLS:", schools.length);

    if (schools.length === 0) {
      return "No schools matched your search criteria.";
    }

    if (schools.length === 1) {
      return generateSingleSchoolResponse(
        schools[0],
        params.requirementType?.length ? params.requirementType : []
      );
    }

    return generateMultipleSchoolsResponse(
      schools,
      params.requirementType || []
    );
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for school information.";
  }
}
