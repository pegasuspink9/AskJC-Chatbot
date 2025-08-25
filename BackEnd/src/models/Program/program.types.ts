import { ProgramType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreateProgram {
  department_id: number;
  program_type: ProgramType;
  program: string;
  tuition_fee: Decimal;
}

export interface UpdateProgram {
  department_id?: number;
  program_type?: ProgramType;
  program?: string;
  tuition_fee?: Decimal;
}
