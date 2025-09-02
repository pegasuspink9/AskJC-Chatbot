import { ProgramType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreateProgram {
  department_id: number;
  program_type: ProgramType;
  program_name: string;
  acronym?: string;
  tuition_fee?: string;
}

export interface UpdateProgram {
  department_id?: number;
  program_type?: ProgramType;
  program_name?: string;
  acronym?: string;
  tuition_fee?: string;
}
