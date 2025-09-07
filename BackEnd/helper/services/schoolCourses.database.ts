import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import {
  generateSingleCourseResponse,
  generateMultipleCoursesResponse,
  formatCourseCode,
  formatCourseName,
  formatCourseProgram,
  formatCourseYear,
  formatCourseSemester,
  formatCourseUnits,
  generateNotFoundCourseMessage,
} from "../utils/schoolCourseshelper";

interface SearchCourseParams {
  course_code?: string;
  course_name?: string;
  year_level?: string;
  semester?: string;
  units?: string;
  program_id?: number;
  program?: string;
}

export async function searchCourses(
  params: SearchCourseParams
): Promise<string> {
  console.log("🔍 COURSE SEARCH PARAMS:", params);

  try {
    const addCondition = (field: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        return {
          OR: value.map((v) => ({
            [field]: { contains: v, mode: "insensitive" },
          })),
        };
      }
      return { [field]: { contains: value, mode: "insensitive" } };
    };

    const conditions = [];

    if (params.course_code)
      conditions.push(addCondition("course_code", params.course_code));
    if (params.course_name)
      conditions.push(addCondition("course_name", params.course_name));
    if (params.year_level)
      conditions.push(addCondition("year_level", params.year_level));
    if (params.semester)
      conditions.push(addCondition("semester", params.semester));
    if (params.units)
      conditions.push(addCondition("units", params.units));
    
    // ✅ Add program_id condition
    if (params.program_id) {
      conditions.push({
        program_id: params.program_id
      });
    }
    
   

    if (conditions.length === 0) {
      const allCourses = await db.course.findMany({
        include: {
          program: true,
        },
        orderBy: [
          { program_id: "asc" }, 
          { year_level: "asc" },
          { semester: "asc" },
          { course_code: "asc" }
        ],
      });
      if (allCourses.length > 0) {
        return generateMultipleCoursesResponse(allCourses);
      }
      return "I need more specific information. Please ask about a specific course code, program, year level, or other details.";
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const courses = await db.course.findMany({
      where: whereCondition,
      include: {
        program: true,
      },
      orderBy: [
        { program: { program_name: "asc" } }, 
        { year_level: "asc" },
        { semester: "asc" },
        { course_code: "asc" }
      ],
    });

    console.log("🔍 FOUND COURSES:", courses);

    if (courses.length === 0) {
      return generateNotFoundCourseMessage(
        params.course_code,
        params.course_name,
        params.program,
        params.year_level,
        params.semester,
        params.units
      );
    }

    if (courses.length === 1) {
      const course = courses[0];
      
      if (params.course_code) {
        return formatCourseCode(course);
      } else if (params.course_name) {
        return formatCourseName(course);
      } else if (params.program_id || params.program) { // ✅ Added program_id check
        return formatCourseProgram(course);
      } else if (params.year_level) {
        return formatCourseYear(course);
      } else if (params.semester) {
        return formatCourseSemester(course);
      } else if (params.units) {
        return formatCourseUnits(course);
      } else {
        return generateSingleCourseResponse(course);
      }
    } else {
      return generateMultipleCoursesResponse(courses);
    }
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for course information.";
  }
}