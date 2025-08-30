import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function fetchScholarshipFromDB(params: any): Promise<any> {
  let scholarshipName = params["scholarship_name"];
  let requirementType = params["requirement_type"];

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
  if (requirementType && !Array.isArray(requirementType)) {
    requirementType = [requirementType];
  }

  try {
    let scholarship;

    if (!requirementType || requirementType.length === 0) {
      scholarship = await db.scholarship.findFirst({
        where: { name: scholarshipName },
      });
    } else {
      const selectFields: any = { name: true };

      requirementType.forEach((type: string) => {
        if (type === "eligibility_criteria")
          selectFields.eligibility_criteria = true;
        if (type === "required_document") selectFields.required_document = true;
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
): Promise<any[]> {
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
