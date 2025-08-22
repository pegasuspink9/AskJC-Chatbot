export interface Department {
  name: string | null;
  tuition_fee: number | null;
  head_name: string | null;
  description: string | null;
  building: string | null;
  floor: string | null;
  career_path: string | null;
}

export interface CreateDepartment {
  name?: string;
  tuition_fee?: number;
  head_name?: string;
  description?: string;
  building?: string;
  floor?: string;
  career_path?: string;
}

export interface UpdateDepartment {
  name?: string;
  tuition_fee?: number;
  head_name?: string;
  description?: string;
  building?: string;
  floor?: string;
  career_path?: string;
}
