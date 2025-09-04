import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { 
  formatProgramTuition, 
  formatProgramType, 
  formatProgramGeneral, 
  formatMultiplePrograms,
  formatDepartmentPrograms 
} from "../utils/schoolProgram.helper";

interface SearchProgramParams {
  program_name?: string;
  program_type?: string;
  tuition_fee?: number | string;
  department_name?: string;
  department_id?: number;
}

export async function searchSchoolProgram(params: SearchProgramParams): Promise<string> {
  console.log("🔍 PROGRAM SEARCH PARAMS:", params);

  try {
    const addCondition = (field: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        return {
          OR: value.map(v => ({
            [field]: { contains: v, mode: "insensitive" }
          }))
        };
      }
      return { [field]: { contains: value, mode: "insensitive" } };
    };
    

    const conditions = [];



    if (params.program_name) conditions.push(addCondition("program_name", params.program_name));
    if (params.program_type) conditions.push(addCondition("program_type", params.program_type));
    if (params.department_id) conditions.push({ department_id: params.department_id });
    
    if (params.tuition_fee) {
      const fee = typeof params.tuition_fee === 'string' ? parseFloat(params.tuition_fee) : params.tuition_fee;
      if (!isNaN(fee)) {
        conditions.push({ tuition_fee: { lte: fee } }); 
      }
    }

    let departmentCondition = null;
    if (params.department_name) {
      departmentCondition = addCondition("department_name", params.department_name);
    }

    
    if (conditions.length === 0 && !departmentCondition) {
      const allPrograms = await db.program.findMany({
        include: {
          department: true
        },
        orderBy: { program_name: "asc" },
      });
      
      if (allPrograms.length > 0) {
        console.log("📊 Formatting", allPrograms.length, "programs");
        return formatMultiplePrograms(allPrograms);
      }
      
      return "No programs found in the database.";
    }

    // Build the where condition
    let whereCondition: any = {};
    
    if (conditions.length > 0) {
      whereCondition = conditions.length > 1 
        ? { AND: conditions }
        : conditions[0];
    }

    if (departmentCondition) {
      whereCondition.department = departmentCondition;
    }

    const programs = await db.program.findMany({
      where: whereCondition,
      include: {
        department: true
      },
      orderBy: { program_name: "asc" },
    });

    console.log("🔍 FOUND PROGRAMS:", programs);

    if (programs.length === 0) {
      return "No programs matched your search criteria.";
    }

    if (programs.length === 1) {
      const program = programs[0];
      
      if (params.tuition_fee) {
        return formatProgramTuition(program);
      } else if (params.program_type) {
        return formatProgramType(program);
      } else if (params.department_name) {
        return formatDepartmentPrograms([program]);
      } else {
        return formatProgramGeneral(program);
      }
    } else {
      const departmentGroups = programs.reduce((acc: any, program) => {
        const deptName = program.department?.department_name || 'Unknown Department';
        if (!acc[deptName]) acc[deptName] = [];
        acc[deptName].push(program);
        return acc;
      }, {});

      if (Object.keys(departmentGroups).length === 1) {
        return formatDepartmentPrograms(programs);
      } else {
        return formatMultiplePrograms(programs);
      }
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for program information.";
  }
}