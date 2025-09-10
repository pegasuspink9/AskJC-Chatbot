import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { 
  formatDepartmentLocation, 
  formatDepartmentHead, 
  formatDepartmentDescription, 
  formatDepartmentCareerPath, 
  formatDepartmentGeneral, 
  formatMultipleDepartments,
  generateNotFoundDepartmentMessage 
} from "../utils/schoolDepartment.helper";

interface SearchDepartmentParams {
  department_name?: string | string[];
  head_name?: string | string[];
  description?: string | string[];
  building?: string | string[];
  floor?: string | string[];
  career_path?: string | string[];
  query_type?: string;
}

export async function searchSchoolDepartment(params: SearchDepartmentParams): Promise<string> {
  console.log("🔍 DEPARTMENT SEARCH PARAMS:", params);

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

    if (params.department_name) conditions.push(addCondition("department_name", params.department_name));
    if (params.head_name) conditions.push(addCondition("head_name", params.head_name));
    if (params.description) conditions.push(addCondition("description", params.description));
    if (params.building) conditions.push(addCondition("building", params.building));
    if (params.floor) conditions.push(addCondition("floor", params.floor));
    if (params.career_path) conditions.push(addCondition("career_path", params.career_path));

    // If no conditions, return all departments
    if (conditions.length === 0) {
      const allDepartments = await db.department.findMany({
        orderBy: { department_name: "asc" },
      });
      
      if (allDepartments.length > 0) {
        console.log("📊 Formatting", allDepartments.length, "departments");
        return formatMultipleDepartments(allDepartments);
      }
      
      return "No departments found in the database.";
    }

    const whereCondition = conditions.length > 1 
      ? { AND: conditions }
      : conditions[0];

    const departments = await db.department.findMany({
      where: whereCondition,
      orderBy: { department_name: "asc" },
    });

    console.log("🔍 FOUND DEPARTMENTS:", departments);

    if (departments.length === 0) {
      return generateNotFoundDepartmentMessage(
        params.department_name,
        params.head_name,
        params.building,
        params.floor
      );
    }

    if (departments.length === 1) {
      const dept = departments[0];
      
      // Specific response based on what was searched
      if (params.query_type === "location" || params.building || params.floor) {
        return formatDepartmentLocation(dept);
      } else if (params.query_type === "head" || params.head_name) {
        return formatDepartmentHead(dept);
      } else if (params.query_type === "description" || params.description) {
        return formatDepartmentDescription(dept);
      } else if (params.query_type === "career_path" || params.career_path) {
        return formatDepartmentCareerPath(dept);
      } else {
        return formatDepartmentGeneral(dept);
      }
    } else {
      return formatMultipleDepartments(departments);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for department information.";
  }
}