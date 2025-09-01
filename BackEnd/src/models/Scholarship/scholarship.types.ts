export interface CreateScholarship {
  name: string;
  category: string;
  description: string;
  offeredBy: string;
  eligibility_criteria: string;
  application_process: string;
  required_document: string;
  award_amount: string;
  contact_office: string;
}

export interface UpdateScholarship {
  name?: string;
  category?: string;
  description?: string;
  offeredBy?: string;
  eligibility_criteria?: string;
  application_process?: string;
  required_document?: string;
  award_amount?: string;
  contact_office?: string;
}
