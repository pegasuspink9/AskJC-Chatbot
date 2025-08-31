export function formatScholarshipGeneral(scholarship: any): string {
  const details = [];
  if (scholarship.award_amount)
    details.push(`worth ${scholarship.award_amount}`);
  if (scholarship.offeredBy)
    details.push(`offered by ${scholarship.offeredBy}`);
  if (scholarship.category)
    details.push(`in the ${scholarship.category} category`);

  const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";
  return `${scholarship.name}${detailsStr}.`;
}

export function formatScholarshipEligibility(scholarship: any): string {
  return scholarship.eligibility_criteria
    ? `${scholarship.name} eligibility criteria: ${scholarship.eligibility_criteria}`
    : `${scholarship.name} eligibility criteria is not available.`;
}

export function formatScholarshipDocuments(scholarship: any): string {
  return scholarship.required_document
    ? `${scholarship.name} required documents: ${scholarship.required_document}`
    : `${scholarship.name} required documents are not available.`;
}

export function formatScholarshipApplication(scholarship: any): string {
  return scholarship.application_process
    ? `${scholarship.name} application process: ${scholarship.application_process}`
    : `${scholarship.name} application process is not available.`;
}

export function formatScholarshipAmount(scholarship: any): string {
  return scholarship.award_amount
    ? `The award amount for ${scholarship.name} is ${scholarship.award_amount}.`
    : `${scholarship.name} award amount is not available.`;
}

export function formatScholarshipContact(scholarship: any): string {
  return scholarship.contact_office
    ? `To contact about ${scholarship.name}: ${scholarship.contact_office}`
    : `${scholarship.name} contact information is not available.`;
}

export function formatScholarshipDescription(scholarship: any): string {
  return scholarship.description
    ? `${scholarship.name} description: ${scholarship.description}`
    : `${scholarship.name} description is not available.`;
}

export function formatScholarshipOfferedBy(scholarship: any): string {
  return scholarship.offeredBy
    ? `${scholarship.name} is offered by ${scholarship.offeredBy}.`
    : `${scholarship.name} 'offered by' information is not available.`;
}

export function formatMultipleScholarships(scholarships: any[]): string {
  if (scholarships.length <= 3) {
    return scholarships.map((sch) => formatScholarshipGeneral(sch)).join("\n");
  } else {
    const header = `Found ${scholarships.length} scholarships:\n`;
    const list = scholarships
      .map(
        (sch) =>
          `• ${sch.name}${
            sch.award_amount ? ` (worth ${sch.award_amount})` : ""
          }`
      )
      .join("\n");
    return header + list;
  }
}
