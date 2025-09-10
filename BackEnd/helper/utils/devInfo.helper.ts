import { DevInfo } from "@prisma/client";

export function formatDeveloper(data: DevInfo): string {
  if (!data) {
    return "Developer information is not available.";
  }

  const parts: string[] = [];

  if (data.dev_name) {
    parts.push(`**${data.dev_name}**`);
  }

  if (data.role) {
    parts.push(`is part of the team as a **${data.role}**.`);
  }

  if (data.description) {
    parts.push(`${data.description}`);
  }

  if (data.image_url) {
    parts.push(`You can view their photo here: ${data.image_url}`);
  }

  return parts.join(" ");
}

export function formatDevelopersByRole(role: string, devs: DevInfo[]): string {
  if (!devs || devs.length === 0) {
    return `No developers found for the role: **${role}**.`;
  }

  const names = devs.map((d) => `**${d.dev_name}**`).join(", ");

  const details = devs.map((d) => formatDeveloper(d)).join("\n\n");

  return `The ${role}s in the team are ${names}.\n\n${details}`;
}
