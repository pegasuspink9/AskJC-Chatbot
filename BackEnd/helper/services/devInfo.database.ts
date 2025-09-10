import { PrismaClient } from "@prisma/client";
import { generateSingleDevResponse, generateMultipleDevsResponse, generateNotFoundMessage } from "../utils/devInfo.helper";
const db = new PrismaClient();

interface SearchDevInfoParams {
  dev_name?: string;
  role?: string | string[];
  description?: string | string[];
  query_type?: string;
}

export async function searchDevInfo(
  params: SearchDevInfoParams
): Promise<string> {
  console.log("🔍 DEV INFO SEARCH PARAMS:", params);

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

    if (params.role) conditions.push(addCondition("role", params.role));
    if (params.description) conditions.push(addCondition("description", params.description));
    if (params.dev_name) conditions.push(addCondition("dev_name", params.dev_name));

    if (conditions.length === 0 && !params.query_type) {
      return "I need more specific information. Please ask about a specific role, description, or developer name.";
    }

    if (params.query_type === "get_all_devs_with_role" || 
        (params.role && !params.description)) {
      console.log("🔍 GETTING ALL DEVS WITH ROLE:", params.role);
      
      let whereCondition: any = {};
      
      if (params.role) {
        whereCondition = addCondition("role", params.role);
      }

      const devs = await db.devInfo.findMany({
        where: whereCondition,
        orderBy: [
          { role: 'asc' },
          { dev_name: 'asc' }
        ]
      });

      console.log("🔍 FOUND DEVS:", devs);

      if (devs.length === 0) {
        if (params.role) {
          return `I couldn't find any developers with the role ${Array.isArray(params.role) ? params.role.join(' or ') : params.role} in our records.`;
        } else {
          return "I couldn't find any developers in our records.";
        }
      }

      let formattedResponse = "";
      
      if (params.role) {
        const roleStr = Array.isArray(params.role) ? params.role.join(' or ') : params.role;
        formattedResponse = `Here are all the developers with the role ${roleStr}:\n\n`;
      } else {
        formattedResponse = `Here are all the developers:\n\n`;
      }
      
      devs.forEach((dev, index) => {
        formattedResponse += `${index + 1}. **${dev.dev_name}** - ${dev.role}`;
        if (dev.description) {
          formattedResponse += ` (${dev.description})`;
        }
        formattedResponse += '\n';
      });

      return formattedResponse;
    }

    const whereCondition = conditions.length > 1 ? { AND: conditions } : conditions[0];

    const devs = await db.devInfo.findMany({
      where: whereCondition,
      orderBy: { dev_name: 'asc' }
    });

    console.log("🔍 FOUND DEVS:", devs);

    if (devs.length === 0) {
      return generateNotFoundMessage(params.role, params.description, params.dev_name);
    }

    if (devs.length === 1) {
      const dev = devs[0];
      return generateSingleDevResponse(dev, params.role, params.description);
    } else {
      return generateMultipleDevsResponse(devs, params.role, params.description);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for that information.";
  }
}