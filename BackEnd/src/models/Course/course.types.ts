export interface Course {
  id: number;
  program_id?: number | null;
  course_code: string;
  course_name: string;
  units: number;
}

export interface CreateCourse {
  program_id?: number | null;
  course_code: string;
  course_name: string;
  units: number;
}

export interface UpdateCourse {
  program_id?: number | null;
  course_code?: string;
  course_name?: string;
  units?: number;
}
