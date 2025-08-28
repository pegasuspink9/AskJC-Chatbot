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

export async function fetchDeanInfo(params: SearchParams): Promise<string> {
  const { department } = params;
  
  if (!department) {
    return await fetchAllDeans();
  }

  try {
    const dean = await db.schoolOfficial.findFirst({
      where: {
        AND: [
          {
            title: {
              contains: "dean",
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
                title: {
                  contains: department,
                  mode: "insensitive"
                }
              }
            ]
          }
        ]
      }
    });

    if (dean) {
      console.log(`🔍 DEAN INFO for ${department}:`, dean);
      return `The dean of ${department} is ${dean.name}.`;
    } else {
      return `I couldn't find a dean for ${department}. Please check the department name.`;
    }
  } catch (error) {
    console.error("Dean search error:", error);
    return "There was an error finding dean information.";
  }
}

export async function fetchAllDeans(): Promise<string> {
  try {
    const deans = await db.schoolOfficial.findMany({
      where: {
        title: {
          contains: "dean",
          mode: "insensitive"
        }
      },
      orderBy: [
        { department: 'asc' },
        { title: 'asc' }
      ]
    });

    if (deans.length === 0) {
      return "I couldn't find any deans in our records.";
    }

    const deansList = deans
      .map(d => `• ${d.name} - ${d.title}${d.department ? ` (${d.department})` : ''}`)
      .join('\n');

    return `Here are all the deans:\n${deansList}`;
  } catch (error) {
    console.error("All deans search error:", error);
    return "There was an error retrieving deans information.";
  }
}

export async function fetchOfficialsByCategory(category: string): Promise<string> {
  try {
    const officials = await db.schoolOfficial.findMany({
      where: {
        category: {
          contains: category,
          mode: "insensitive"
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    if (officials.length === 0) {
      return `I couldn't find any officials in the ${category} category.`;
    }

    const officialsList = officials
      .map(o => `• ${o.name} - ${o.title}${o.department ? ` (${o.department})` : ''}`)
      .join('\n');

    return `Here are the ${category} officials:\n${officialsList}`;
  } catch (error) {
    console.error("Category search error:", error);
    return "There was an error retrieving officials by category.";
  }
}

