import { PrismaClient } from "@prisma/client";
import { generateSingleOfficialResponse, generateMultipleOfficialsResponse,  generateNotFoundMessage } from "../utils/schoolOfficial.responseFormatter";
const db = new PrismaClient();

interface SearchSchoolOfficialParams {
  name?: string;
  position?: string | string[];
  department?: string | string[];
  category?: string | string[];
  query_type?: string;
}

export async function searchSchoolOfficial(
  params: SearchSchoolOfficialParams
): Promise<string> {
  console.log("🔍 SCHOOL OFFICIAL SEARCH PARAMS:", params);

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

    if (params.position) conditions.push(addCondition("title", params.position));
    if (params.department) conditions.push(addCondition("department", params.department));
    if (params.category) conditions.push(addCondition("category", params.category));
    if (params.name) conditions.push(addCondition("name", params.name));

    if (conditions.length === 0 && !params.query_type) {
      return "I need more specific information. Please ask about a specific position, department, or person.";
    }

    if (params.query_type === "get_all_officials_with_position" || 
        (params.position && !params.department && !params.category)) {
      console.log("🔍 GETTING ALL OFFICIALS WITH POSITION:", params.position);
      
      let whereCondition: any = {};
      
      if (params.position) {
        whereCondition = addCondition("title", params.position);
      }

      const officials = await db.schoolOfficial.findMany({
        where: whereCondition,
        orderBy: [
          { department: 'asc' },
          { name: 'asc' }
        ]
      });

      console.log("🔍 FOUND OFFICIALS:", officials);

      if (officials.length === 0) {
        if (params.position) {
          return `I couldn't find any ${Array.isArray(params.position) ? params.position.join(' or ') : params.position}s in our records.`;
        } else {
          return "I couldn't find any officials in our records.";
        }
      }

      let formattedResponse = "";
      
      if (params.position) {
        const positionStr = Array.isArray(params.position) ? params.position.join(' or ') : params.position;
        formattedResponse = `Here are all the ${positionStr}s:\n\n`;
      } else {
        formattedResponse = `Here are all the officials:\n\n`;
      }
      
      officials.forEach((official, index) => {
        formattedResponse += `${index + 1}. **${official.name}** - ${official.title}`;
        if (official.department) {
          formattedResponse += ` (${official.department})`;
        }
        formattedResponse += '\n';
      });

      return formattedResponse;
    }

    const whereCondition = conditions.length > 1 ? { AND: conditions } : conditions[0];

    const officials = await db.schoolOfficial.findMany({
      where: whereCondition,
      orderBy: { name: 'asc' }
    });

    console.log("🔍 FOUND OFFICIALS:", officials);

    if (officials.length === 0) {
      return generateNotFoundMessage(params.position, params.department, params.name);
    }

    if (officials.length === 1) {
      const official = officials[0];
      return generateSingleOfficialResponse(official, params.position, params.department);
    } else {
      return generateMultipleOfficialsResponse(officials, params.position, params.department);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for that information.";
  }
}
