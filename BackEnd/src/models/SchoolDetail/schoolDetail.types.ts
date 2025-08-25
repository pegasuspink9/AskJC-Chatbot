export interface SchoolDetail {
  id: number;
  name?: string | null;
  small_details?: string | null;
  year_built?: number | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  accreditation?: string | null;
}

export interface CreateSchoolDetail {
  name?: string;
  small_details?: string;
  year_built?: number;
  history?: string;
  vision?: string;
  mission?: string;
  address?: string;
  accreditation?: string;
}

export interface UpdateSchoolDetail {
  id: number;
  name?: string | null;
  small_details?: string | null;
  year_built?: number | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  accreditation?: string | null;
}
