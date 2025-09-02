export interface StudentOrg {
  id: number;
  organization_name: string;
  description: string;
  fb_page?: string | null;
}

export interface CreateStudentOrg {
  organization_name: string;
  description: string;
  fb_page?: string | null;
}

export interface UpdateStudentOrg {
  organization_name: string;
  description: string;
  fb_page?: string | null;
}
