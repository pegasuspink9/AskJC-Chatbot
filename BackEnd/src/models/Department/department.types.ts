export interface Department {
  name: string | null;
  acronym?: string;
  head_name: string | null;
  description: string | null;
  building: string | null;
  floor: string | null;
  career_path: string | null;
}

export interface CreateDepartment {
  name?: string;
  acronym?: string;
  head_name?: string;
  description?: string;
  building?: string;
  floor?: string;
  career_path?: string;
}

export interface UpdateDepartment {
  name?: string;
  acronym?: string;
  head_name?: string;
  description?: string;
  building?: string;
  floor?: string;
  career_path?: string;
}
