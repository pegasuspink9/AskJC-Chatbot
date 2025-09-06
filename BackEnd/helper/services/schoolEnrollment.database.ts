import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { 
  formatMultipleEnrollments,
  generateEnrollmentResponse,
  generateNotFoundEnrollmentMessage
} from "../utils/schoolEnrollment.helper";

interface SearchEnrollmentParams {
  enrollment_process?: string | string[];
  enrollment_documents?: string | string[];
  department_to_enroll?: string | string[];
}

export async function searchEnrollment(params: SearchEnrollmentParams): Promise<string> {
  console.log("🔍 ENROLLMENT SEARCH PARAMS:", params);

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

    if (params.enrollment_process) conditions.push(addCondition("enrollment_process", params.enrollment_process));
    if (params.enrollment_documents) conditions.push(addCondition("enrollment_documents", params.enrollment_documents));
    if (params.department_to_enroll) conditions.push(addCondition("department_to_enroll", params.department_to_enroll));

    if (conditions.length === 0) {
      const allEnrollmentInfo = await db.enrollment.findMany({
        orderBy: { department_to_enroll: "asc" },
      });
      
      if (allEnrollmentInfo.length > 0) {
        return formatMultipleEnrollments(allEnrollmentInfo);
      }
      
      return "No enrollment information found in the database.";
    }

    const whereCondition = conditions.length > 1 
      ? { AND: conditions }
      : conditions[0];

    const enrollmentInfo = await db.enrollment.findMany({
      where: whereCondition,
      orderBy: { department_to_enroll: "asc" },
    });

    console.log("🔍 FOUND ENROLLMENT INFO:", enrollmentInfo);

    if (enrollmentInfo.length === 0) {
      return generateNotFoundEnrollmentMessage(params.department_to_enroll, params.enrollment_process, params.enrollment_documents);
    }

    if (enrollmentInfo.length === 1) {
      const enrollment = enrollmentInfo[0];
      return generateEnrollmentResponse(enrollment, params);
    } else {
      return formatMultipleEnrollments(enrollmentInfo);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for enrollment information.";
  }
}