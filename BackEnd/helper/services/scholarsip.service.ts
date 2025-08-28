import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

//a question for a single question about scholarship
export async function fetchScholarshipFromDB(params: any): Promise<string> {
  let scholarshipName = params["scholarship-name"];
  let scholarshipDetail = params["scholarship-detail"];

  if (!scholarshipName || !scholarshipDetail) {
    return "I could not find enough details to answer your question.";
  }

  if (Array.isArray(scholarshipName)) {
    scholarshipName = scholarshipName[0];
  }

  if (Array.isArray(scholarshipDetail)) {
    scholarshipDetail = scholarshipDetail[0];
  }

  const detailMap: Record<string, keyof import("@prisma/client").Scholarship> =
    {
      category: "category",
      description: "description",
      offeredby: "offeredBy",
      offeredBy: "offeredBy",
      eligibility_criteria: "eligibility_criteria",
      application_process: "application_process",
      required_document: "required_document",
      award_amount: "award_amount",
      contact_office: "contact_office",
    };

  const field = detailMap[scholarshipDetail.toLowerCase()];
  if (!field) {
    return `Sorry, I don’t recognize the detail "${scholarshipDetail}".`;
  }

  try {
    const result = await db.scholarship.findFirst({
      where: { name: scholarshipName },
      select: { [field]: true },
    });

    if (result && result[field]) {
      return String(result[field]);
    } else {
      return `Sorry, I couldn't find ${scholarshipDetail} for ${scholarshipName}.`;
    }
  } catch (err) {
    console.error("Database query error:", err);
    return "There was an error retrieving scholarship details.";
  }
}

export async function fetchListAllScholarshipsfromDB(): Promise<string> {
  try {
    const scholarships = await db.scholarship.findMany({
      select: {
        name: true,
        category: true,
      },
      orderBy: { category: "asc" },
    });

    if (scholarships.length === 0) {
      return "I couldn't find any scholarships in the database.";
    }

    const grouped: Record<string, string[]> = {};
    scholarships.forEach((s) => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s.name);
    });

    let response = "Here are all the scholarships grouped by category:\n\n";
    for (const category in grouped) {
      response += `**${category}**\n`;
      grouped[category].forEach((name) => {
        response += `- ${name}\n`;
      });
      response += "\n";
    }

    return response;
  } catch (err) {
    console.error("Error fetching all scholarships:", err);
    return "There was an error retrieving scholarships.";
  }
}
