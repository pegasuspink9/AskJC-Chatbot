export interface CreateEnrollment {
  enrollment_process: string;
  enrollment_documents: string;
  enrollee_type: string;
  department_to_enroll: string;
}

export interface UpdateEnrollment {
  enrollment_process?: string;
  enrollment_documents?: string;
  enrollee_type?: string;
  department_to_enroll?: string;
}
