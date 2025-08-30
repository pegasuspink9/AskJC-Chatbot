import { PrismaClient } from "@prisma/client";
import { generateSingleOfficialResponse, generateMultipleOfficialsResponse, generateNotFoundMessage } from "../utils/schoolOfficial.responseFormatter";
const db = new PrismaClient();

interface SearchParams {
  position?: string;
  department?: string;
  query_type?: string;
}

export async function searchSchoolOfficial(params: SearchParams): Promise<string> {
  console.log("🔍 SEARCH PARAMS:", params);

  const position = params.position;
  const department = params.department;
  const query_type = params.query_type;
  
  console.log("🔄 MAPPED PARAMS:");
  console.log("Position:", position);
  console.log("Department:", department);
  console.log("Query Type:", query_type);
  
  try {
    let whereCondition: any = {};
    
    if (position && department) {
      whereCondition = {
        AND: [
          {
            title: {
              contains: position,
              mode: "insensitive"
            }
          },
          {
            OR: [
              {
                department: {
                  contains: department,
                  mode: "insensitive"
                }
              },
              {
                category: {
                  contains: department,
                  mode: "insensitive"
                }
              }
            ]
          }
        ]
      };
    } else if (position) {
      whereCondition = {
        title: {
          contains: position,
          mode: "insensitive"
        }
      };
    } else if (department) {
      whereCondition = {
        OR: [
          {
            department: {
              contains: department,
              mode: "insensitive"
            }
          },
          {
            category: {
              contains: department,
              mode: "insensitive"
            }
          }
        ]
      };
    } else {
      return "I need more specific information. Please ask about a specific position or department.";
    }

    const officials = await db.schoolOfficial.findMany({
      where: whereCondition,
      orderBy: {
        title: 'asc'
      }
    });

    console.log("🔍 FOUND OFFICIALS:", officials);

    if (officials.length === 0) {
      return generateNotFoundMessage(position, department);
    }

    if (officials.length === 1) {
      const official = officials[0];
      return generateSingleOfficialResponse(official, position, department);
    }

    return generateMultipleOfficialsResponse(officials, position, department);

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for that information.";
  }

}

export async function getAllOfficialsWithPosition(position?: string): Promise<string> {
  console.log("🔍 GETTING ALL OFFICIALS WITH POSITION:", position);
  
  try {
    let whereCondition: any = {};
    
    if (position) {
      whereCondition = {
        title: {
          contains: position,
          mode: "insensitive"
        }
      };
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
      if (position) {
        return `I couldn't find any ${position}s in our records.`;
      } else {
        return "I couldn't find any officials in our records.";
      }
    }

    // Format the response with just names and positions
    let formattedResponse = "";
    
    if (position) {
      formattedResponse = `Here are all the ${position}s:\n\n`;
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

  } catch (error) {
    console.error("Database search error for all officials with position:", error);
    return "I'm sorry, there was an error retrieving the officials information.";
  }
}