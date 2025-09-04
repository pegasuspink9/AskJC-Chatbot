export interface CreateProgram {
  department_id?: number;
  program_type: string;
  program_name: string;
  acronym?: string;
  tuition_fee?: string;
}

export interface UpdateProgram {
  department_id?: number;
  program_type?: string;
  program_name?: string;
  acronym?: string;
  tuition_fee?: string;
}
