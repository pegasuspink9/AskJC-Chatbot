import { prisma } from "../../prisma/client";
import { Prisma } from "@prisma/client";
import {
  formatDeveloper,
  formatDevelopersByRole,
} from "../utils/devInfo.helper";

interface SearchDevInfoParams {
  dev_name?: string;
  role?: string;
}

export async function searchDevInfo(
  params: SearchDevInfoParams
): Promise<string> {
  console.log("🔍 DEVINFO SEARCH PARAMS:", params);

  try {
    const conditions: Prisma.DevInfoWhereInput[] = [];

    if (params.dev_name) {
      conditions.push({
        dev_name: { contains: params.dev_name, mode: "insensitive" },
      });
    }

    if (params.role) {
      conditions.push({
        role: { contains: params.role, mode: "insensitive" },
      });
    }

    const whereCondition =
      conditions.length > 1 ? { AND: conditions } : conditions[0] || {};

    const results = await prisma.devInfo.findMany({
      where: whereCondition,
      orderBy: { id: "asc" },
    });

    if (results.length === 0) {
      return "No developer information found.";
    }

    if (params.dev_name) {
      return results.map((d) => formatDeveloper(d)).join("\n\n");
    }

    if (params.role) {
      return formatDevelopersByRole(params.role, results);
    }

    return results.map((d) => formatDeveloper(d)).join("\n\n");
  } catch (error) {
    console.error("Database search error:", error);
    return "I'm sorry, there was an error searching for developer information.";
  }
}
