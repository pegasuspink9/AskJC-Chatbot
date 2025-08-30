import { PrismaClient, Scholarship } from "@prisma/client";

const db = new PrismaClient();

interface FetchScholarshipParams {
  scholarship_name?: string | string[];
  requirement_type?: string | string[];
}

export async function fetchScholarshipFromDB(
  params: FetchScholarshipParams
): Promise<
  Scholarship[] | Scholarship | (Partial<Scholarship> & { name: string }) | null
> {
  let scholarshipName = params.scholarship_name;
  const requirementType = params.requirement_type;

  if (!scholarshipName) {
    try {
      const allScholarships = await db.scholarship.findMany();
      return allScholarships;
    } catch (err) {
      console.error("Database query error fetching all scholarships:", err);
      return null;
    }
  }

  if (Array.isArray(scholarshipName)) scholarshipName = scholarshipName[0];

  let parsedRequirementTypes: string[] = [];
  if (requirementType) {
    const typesArray = Array.isArray(requirementType)
      ? requirementType
      : [requirementType];
    parsedRequirementTypes = typesArray.flatMap((type: string) =>
      type
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    );
    parsedRequirementTypes = [...new Set(parsedRequirementTypes)];
  }

  try {
    let scholarship;

    if (!parsedRequirementTypes.length) {
      scholarship = await db.scholarship.findFirst({
        where: { name: scholarshipName },
      });
    } else {
      const selectFields: Partial<Record<keyof Scholarship, boolean>> = {
        name: true,
      };

      parsedRequirementTypes.forEach((type: string) => {
        switch (type) {
          case "eligibility_criteria":
            selectFields.eligibility_criteria = true;
            break;
          case "required_document":
            selectFields.required_document = true;
            break;
          case "application_process":
            selectFields.application_process = true;
            break;
          case "award_amount":
            selectFields.award_amount = true;
            break;
          case "contact_office":
            selectFields.contact_office = true;
            break;
          case "description":
            selectFields.description = true;
            break;
        }
      });

      scholarship = await db.scholarship.findFirst({
        where: { name: scholarshipName },
        select: selectFields,
      });
    }

    return scholarship || null;
  } catch (err) {
    console.error(`Database query error for ${scholarshipName}:`, err);
    return null;
  }
}

export async function fetchScholarshipsByCategory(
  category: string
): Promise<Scholarship[]> {
  try {
    const scholarships = await db.scholarship.findMany({
      where: { category: { equals: category, mode: "insensitive" } },
    });
    return scholarships;
  } catch (err) {
    console.error(`Database query error for category ${category}:`, err);
    return [];
  }
}

