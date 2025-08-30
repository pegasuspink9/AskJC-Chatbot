import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

//a question for a single question about scholarship
export async function fetchScholarshipFromDB(params: any): Promise<string> {
  let scholarshipName = params["scholarship-name"];
  let scholarshipDetails = params["scholarship-detail"];

  if (
    !scholarshipName ||
    !scholarshipDetails ||
    scholarshipDetails.length === 0
  ) {
    return "I could not find enough details to answer your question.";
  }

  if (Array.isArray(scholarshipName)) {
    scholarshipName = scholarshipName[0];
  }

  if (!Array.isArray(scholarshipDetails)) {
    scholarshipDetails = [scholarshipDetails];
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

  let responseParts: string[] = [];

  for (const detail of scholarshipDetails) {
    const field = detailMap[detail.toLowerCase()];
    if (!field) {
      responseParts.push(`Sorry, I don’t recognize the detail "${detail}".`);
      continue;
    }

    try {
      const result = await db.scholarship.findFirst({
        where: { name: scholarshipName },
        select: { [field]: true },
      });

      if (result && result[field]) {
        responseParts.push(`${detail}: ${String(result[field])}`);
      } else {
        responseParts.push(
          `Sorry, I couldn't find ${detail} for ${scholarshipName}.`
        );
      }
    } catch (err) {
      console.error(`Database query error for ${detail}:`, err);
      responseParts.push(
        `There was an error retrieving ${detail} for ${scholarshipName}.`
      );
    }
  }

  if (responseParts.length === 0) {
    return `Sorry, I couldn't find any details for ${scholarshipName}.`;
  }

  return responseParts.join("\n");
}

