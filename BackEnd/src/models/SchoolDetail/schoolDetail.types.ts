export interface SchoolDetail {
  id: number;
  name?: string | null;
  small_details?: string | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  goals?: string | null;
  location_url?: string | null;
}

export interface CreateSchoolDetail {
  name?: string;
  small_details?: string;
  history?: string;
  vision?: string;
  mission?: string;
  address?: string;
  goals?: string;
  location_url?: string;
}

export interface UpdateSchoolDetail {
  id: number;
  name?: string | null;
  small_details?: string | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  goals?: string | null;
  location_url?: string;
}
