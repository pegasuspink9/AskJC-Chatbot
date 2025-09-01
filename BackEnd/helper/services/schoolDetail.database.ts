import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import {
  formatSchoolGeneral,
  formatSchoolSmallDetails,
  formatSchoolVision,
  formatSchoolMission,
  formatSchoolGoals,
  formatSchoolAddress,
  formatSchoolHistory,
  formatSchoolPresident,
  formatSchoolEvents,
  formatMultipleSchoolInfo,
} from "../utils/schoolDetail.helper";

interface SchoolDetail {
  id: number;
  name: string | undefined;
  small_details: string | undefined;
  history: string | undefined;
  vision: string | undefined;
  mission: string | undefined;
  address: string | undefined;
  goals: string | undefined;
}

interface SearchSchoolDetailsParams {
  name?: string | string[];
  requirementType?: string | string[];
}

function transformSchoolData(school: {
  id: number;
  name: string | null;
  small_details: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  address: string | null;
  goals: string | null;
}): SchoolDetail {
  return {
    id: school.id,
    name: school.name ?? undefined,
    small_details: school.small_details ?? undefined,
    history: school.history ?? undefined,
    vision: school.vision ?? undefined,
    mission: school.mission ?? undefined,
    address: school.address ?? undefined,
    goals: school.goals ?? undefined,
  };
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

    if (params.name) conditions.push(addCondition("name", params.name));

    if (conditions.length === 0 && !params.requirementType) {
      const allSchools = await db.schoolDetail.findMany({
        orderBy: { name: "asc" },
      });
      if (allSchools.length > 0) {
        const transformedSchools = allSchools.map(transformSchoolData);
        return formatMultipleSchoolInfo(transformedSchools, []);
      }
      return "I need more specific information. Please ask about a specific school or requirement.";
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const schools = await db.schoolDetail.findMany({
      where: whereCondition,
      orderBy: { name: "asc" },
    });

    console.log("🔍 FOUND SCHOOLS:", schools);

    if (schools.length === 0) {
      return "No schools matched your search criteria.";
    }

    if (schools.length === 1) {
      const school = transformSchoolData(schools[0]);

      if (
        params.requirementType === "small_details" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("small_details"))
      ) {
        return formatSchoolSmallDetails(school);
      } else if (
        params.requirementType === "vision" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("vision"))
      ) {
        return formatSchoolVision(school);
      } else if (
        params.requirementType === "mission" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("mission"))
      ) {
        return formatSchoolMission(school);
      } else if (
        params.requirementType === "goals" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("goals"))
      ) {
        return formatSchoolGoals(school);
      } else if (
        params.requirementType === "address" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("address"))
      ) {
        return formatSchoolAddress(school);
      } else if (
        params.requirementType === "history" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("history"))
      ) {
        return formatSchoolHistory(school);
      } else if (
        params.requirementType === "president" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("president"))
      ) {
        return formatSchoolPresident(school);
      } else if (
        params.requirementType === "events" ||
        (Array.isArray(params.requirementType) &&
          params.requirementType.includes("events"))
      ) {
        return formatSchoolEvents(school);
      } else {
        return formatSchoolGeneral(school);
      }
    } else {
      const transformedSchools = schools.map(transformSchoolData);
      return formatMultipleSchoolInfo(
        transformedSchools,
        Array.isArray(params.requirementType) ? params.requirementType : []
      );
    }
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for school information.";
  } finally {
    await db.$disconnect();
  }
}
