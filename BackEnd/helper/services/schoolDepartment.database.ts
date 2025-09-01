import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { formatDepartmentLocation, formatDepartmentHead, formatDepartmentDescription, formatDepartmentCareerPath, formatDepartmentGeneral, formatMultipleDepartments } from "../utils/schoolDepartment.helper";

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

    if (conditions.length === 0) {
<<<<<<< Updated upstream
      // Get all departments
      const allDepartments = await db.department.findMany({
        orderBy: { name: "asc" },
=======
      const allDepartments = await db.department.findMany({
        orderBy: { department_name: "asc" },
>>>>>>> Stashed changes
      });
      
      if (allDepartments.length > 0) {
        return formatMultipleDepartments(allDepartments);
      }
      
      return "I need more specific information. Please ask about a specific department, building, or department head.";
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
      return "No departments matched your search criteria.";
    }

    if (departments.length === 1) {
      const dept = departments[0];
      
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