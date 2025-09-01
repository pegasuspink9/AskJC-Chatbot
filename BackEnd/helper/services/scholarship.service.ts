import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import {
  formatScholarshipGeneral,
  formatScholarshipEligibility,
  formatScholarshipDocuments,
  formatScholarshipApplication,
  formatScholarshipAmount,
  formatScholarshipContact,
  formatScholarshipDescription,
  formatScholarshipOfferedBy,
  formatMultipleScholarships,
} from "../utils/scholarship.helper";

interface SearchScholarshipParams {
  scholarship_name?: string | string[];
  requirementType?: string | string[];
  category?: string | string[];
  query_type?: string;
}

export async function searchScholarships(
  params: SearchScholarshipParams
): Promise<string> {
  console.log("🔍 SCHOLARSHIP SEARCH PARAMS:", params);

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

    if (params.scholarship_name)
      conditions.push(
        addCondition("scholarship name", params.scholarship_name)
      );
    if (params.category)
      conditions.push(addCondition("category", params.category));

    if (conditions.length === 0 && !params.requirementType) {
      const allScholarships = await db.scholarship.findMany({
        orderBy: { scholarship_name: "asc" },
      });
      if (allScholarships.length > 0) {
        return formatMultipleScholarships(allScholarships);
      }
      return "I need more specific information. Please ask about a specific scholarship, category, or requirement.";
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const scholarships = await db.scholarship.findMany({
      where: whereCondition,
      orderBy: { scholarship_name: "asc" },
    });

    console.log("🔍 FOUND SCHOLARSHIPS:", scholarships);

    if (scholarships.length === 0) {
      return "No scholarships matched your search criteria.";
    }

    if (scholarships.length === 1) {
      const scholarship = scholarships[0];

      if (
        params.query_type === "eligibility_criteria" ||
        params.requirementType?.includes("eligibility_criteria")
      ) {
        return formatScholarshipEligibility(scholarship);
      } else if (
        params.query_type === "required_document" ||
        params.requirementType?.includes("required_document")
      ) {
        return formatScholarshipDocuments(scholarship);
      } else if (
        params.query_type === "application_process" ||
        params.requirementType?.includes("application_process")
      ) {
        return formatScholarshipApplication(scholarship);
      } else if (
        params.query_type === "award_amount" ||
        params.requirementType?.includes("award_amount")
      ) {
        return formatScholarshipAmount(scholarship);
      } else if (
        params.query_type === "contact_office" ||
        params.requirementType?.includes("contact_office")
      ) {
        return formatScholarshipContact(scholarship);
      } else if (
        params.query_type === "description" ||
        params.requirementType?.includes("description")
      ) {
        return formatScholarshipDescription(scholarship);
      } else if (
        params.query_type === "offeredBy" ||
        params.requirementType?.includes("offeredBy")
      ) {
        return formatScholarshipOfferedBy(scholarship);
      } else {
        return formatScholarshipGeneral(scholarship);
      }
    } else {
      return formatMultipleScholarships(scholarships);
    }
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for scholarship information.";
  }
}
