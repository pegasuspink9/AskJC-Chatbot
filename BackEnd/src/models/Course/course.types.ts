export interface Course {
  id: number;
  department_id: number;
  name?: string | null;
  total_course?: number | null;
}

export interface CreateCourse {
  department_id: number;
  name?: string;
  total_course?: number;
}

export interface UpdateCourse {
  name?: string;
  total_course?: number;
}
