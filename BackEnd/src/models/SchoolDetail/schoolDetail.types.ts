export interface SchoolDetail {
  id: number;
  school_name?: string | null;
  small_details?: string | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  accreditation?: string | null;
}

export interface CreateSchoolDetail {
  school_name?: string;
  small_details?: string;
  history?: string;
  vision?: string;
  mission?: string;
  address?: string;
  goals?: string;
}

export interface UpdateSchoolDetail {
  school_name?: string | null;
  small_details?: string | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  goals?: string | null;
}
