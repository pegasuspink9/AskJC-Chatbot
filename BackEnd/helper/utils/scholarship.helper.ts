export function formatScholarshipGeneral(scholarship: any): string {
  const details = [];
  if (scholarship.award_amount)
    details.push(`worth ${scholarship.award_amount}`);
  if (scholarship.offeredBy)
    details.push(`offered by ${scholarship.offeredBy}`);
  if (scholarship.category)
    details.push(`in the ${scholarship.category} category`);

  const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";
  return `${scholarship.scholarship_name}${detailsStr}.`;
}

export function formatScholarshipEligibility(scholarship: any): string {
  return scholarship.eligibility_criteria
    ? `${scholarship.scholarship_name} eligibility criteria: ${scholarship.eligibility_criteria}`
    : `${scholarship.scholarship_name} eligibility criteria is not available.`;
}

export function formatScholarshipDocuments(scholarship: any): string {
  return scholarship.required_document
    ? `${scholarship.scholarship_name} required documents: ${scholarship.required_document}`
    : `${scholarship.scholarship_name} required documents are not available.`;
}

export function formatScholarshipApplication(scholarship: any): string {
  return scholarship.application_process
    ? `${scholarship.scholarship_name} application process: ${scholarship.application_process}`
    : `${scholarship.scholarship_name} application process is not available.`;
}

export function formatScholarshipAmount(scholarship: any): string {
  return scholarship.award_amount
    ? `The award amount for ${scholarship.scholarship_name} is ${scholarship.award_amount}.`
    : `${scholarship.scholarship_name} award amount is not available.`;
}

export function formatScholarshipContact(scholarship: any): string {
  return scholarship.contact_office
    ? `To contact about ${scholarship.scholarship_name}: ${scholarship.contact_office}`
    : `${scholarship.scholarship_name} contact information is not available.`;
}

export function formatScholarshipDescription(scholarship: any): string {
  return scholarship.description
    ? `${scholarship.scholarship_name} description: ${scholarship.description}`
    : `${scholarship.scholarship_name} description is not available.`;
}

export function formatScholarshipOfferedBy(scholarship: any): string {
  return scholarship.offeredBy
    ? `${scholarship.scholarship_name} is offered by ${scholarship.offeredBy}.`
    : `${scholarship.scholarship_name} 'offered by' information is not available.`;
}

export function formatMultipleScholarships(scholarships: any[]): string {
  if (scholarships.length <= 3) {
    return scholarships.map((sch) => formatScholarshipGeneral(sch)).join("\n");
  } else {
    const header = `Found ${scholarships.length} scholarships:\n`;
    const list = scholarships
      .map(
        (sch) =>
          `• ${sch.scholarship_name}${
            sch.award_amount ? ` (worth ${sch.award_amount})` : ""
          }`
      )
      .join("\n");
    return header + list;
  }
}
