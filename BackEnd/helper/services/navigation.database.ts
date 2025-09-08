import { PrismaClient, Prisma } from "@prisma/client";
const db = new PrismaClient();

import {
  formatNavigationGeneral,
  formatNavigationLink,
  formatNavigationNotes,
  formatMultipleNavigations,
} from "../utils/navigation.helper";

interface SearchNavigationParams {
  nav_button?: string | string[];
  dropdown_menu?: string | string[];
  userQuery?: string;
}

export async function searchNavigations(
  params: SearchNavigationParams
): Promise<string> {
  try {
    const conditions: Prisma.NavigationWhereInput[] = [];

    if (params.nav_button) {
      if (Array.isArray(params.nav_button)) {
        conditions.push({
          OR: params.nav_button.map((v) => ({
            nav_button: { contains: v, mode: "insensitive" },
          })),
        });
      } else {
        conditions.push({
          nav_button: { contains: params.nav_button, mode: "insensitive" },
        });
      }
    }

    if (params.dropdown_menu) {
      if (Array.isArray(params.dropdown_menu)) {
        conditions.push({
          OR: params.dropdown_menu.map((v) => ({
            dropdown_menu: { contains: v, mode: "insensitive" },
          })),
        });
      } else {
        conditions.push({
          dropdown_menu: {
            contains: params.dropdown_menu,
            mode: "insensitive",
          },
        });
      }
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const navs = await db.navigation.findMany({
      where: whereCondition,
      orderBy: { nav_button: "asc" },
    });

    if (navs.length === 0) return "No navigation items matched your request.";

    if (navs.length === 1) {
      const nav = navs[0];
      const query = params.userQuery?.toLowerCase() || "";

      if (
        query.includes("link") ||
        query.includes("go to") ||
        query.includes("access") ||
        query.includes("see")
      ) {
        return formatNavigationLink(nav);
      } else if (
        query.includes("note") ||
        query.includes("information") ||
        query.includes("details")
      ) {
        return formatNavigationNotes(nav);
      } else {
        return formatNavigationGeneral(nav);
      }
    } else {
      return formatMultipleNavigations(navs);
    }
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for navigation information.";
  }
}
