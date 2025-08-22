export interface Teacher {
  department_id: number;
  employee_name: string | null;
  teachers_details: string | null;
  office_location: string | null;
}

export interface CreateTeacher {
  department_id: number;
  employee_name?: string;
  teachers_details?: string;
  office_location?: string;
}

export interface UpdateTeacher {
  employee_name?: string;
  teachers_details?: string;
  office_location?: string;
}
