export interface StudentOrg {
  id: number;
  name: string;
  description: string;
  fb_page?: string | null;
}

export interface CreateStudentOrg {
  name: string;
  description: string;
  fb_page?: string | null;
}

export interface UpdateStudentOrg {
  name: string;
  description: string;
  fb_page?: string | null;
}
