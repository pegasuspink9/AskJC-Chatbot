import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { 
  generateSingleContactResponse, 
  generateMultipleContactsResponse,  
} from "../utils/schoolContacts";

interface SearchContactParams {
  email?: string | string[];
  fb_page?: string | string[];
  contact_name?: string | string[];
  query_type?: string;
}

export async function searchContacts(
  params: SearchContactParams
): Promise<string> {
  console.log("🔍 CONTACT SEARCH PARAMS:", params);

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

    if (params.contact_name) conditions.push(addCondition("contact_name", params.contact_name));
    if (params.email) conditions.push(addCondition("email", params.email));
    if (params.fb_page) conditions.push(addCondition("fb_page", params.fb_page));

    if (conditions.length === 0) {
      const allContacts = await db.contact.findMany({
        orderBy: { contact_name: "asc" },
      });
      if (allContacts.length > 0) {
        return generateMultipleContactsResponse(allContacts);
      }
      return "I need more specific information. Please ask about a specific contact contact_name, email, or Facebook page.";
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const contacts = await db.contact.findMany({
      where: whereCondition,
      orderBy: { contact_name: "asc" },
    });

    console.log("🔍 FOUND CONTACTS:", contacts);

    if (contacts.length === 0) {
      return "No contacts matched your search criteria.";
    }

    if (contacts.length === 1) {
      return generateSingleContactResponse(contacts[0], params.query_type);
    } else {
      return generateMultipleContactsResponse(contacts, params.query_type);
    }

  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for contact information.";
  }
}