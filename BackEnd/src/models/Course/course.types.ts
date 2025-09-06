export interface Course {
  id: number;
  program_id?: number | null;
  course_code?: string | null;
  course_name: string;
  year_level?: string;
  semester?: string | null;
  units: number | null;
}

export interface CreateCourse {
  program_id?: number | null;
  course_code?: string | null;
  course_name: string;
  year_level?: string;
  semester?: string | null;
  units: number | null;
}

export interface UpdateCourse {
  program_id?: number | null;
  course_code?: string | null;
  course_name?: string;
  year_level?: string;
  semester?: string | null;
  units?: number | null;
}
