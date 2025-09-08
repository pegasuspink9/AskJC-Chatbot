export function formatNavigationGeneral(nav: any): string {
  const details: string[] = [];
  if (nav.action) details.push(`action: ${nav.action}`);
  if (nav.notes) details.push(`note: ${nav.notes}`);
  const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";

  const dropdown =
    nav.dropdown_menu && typeof nav.dropdown_menu === "string"
      ? nav.dropdown_menu
      : "";
  const navButton =
    nav.nav_button && typeof nav.nav_button === "string" ? nav.nav_button : "";

  return dropdown.toLowerCase() !== "n/a"
    ? `${dropdown}${detailsStr}${nav.link ? ` → ${nav.link}` : ""}`
    : `${navButton}${detailsStr}${nav.link ? ` → ${nav.link}` : ""}`;
}

export function formatNavigationLink(nav: any): string {
  const dropdown =
    nav.dropdown_menu && typeof nav.dropdown_menu === "string"
      ? nav.dropdown_menu
      : "";
  const navButton =
    nav.nav_button && typeof nav.nav_button === "string" ? nav.nav_button : "";
  return nav.link
    ? `You can access ${dropdown !== "N/A" ? dropdown : navButton} here: ${
        nav.link
      }`
    : `No link available for ${dropdown !== "N/A" ? dropdown : navButton}.`;
}

export function formatNavigationNotes(nav: any): string {
  const dropdown =
    nav.dropdown_menu && typeof nav.dropdown_menu === "string"
      ? nav.dropdown_menu
      : "";
  const navButton =
    nav.nav_button && typeof nav.nav_button === "string" ? nav.nav_button : "";
  return nav.notes
    ? `${dropdown !== "N/A" ? dropdown : navButton} notes: ${nav.notes}`
    : `No notes available for ${dropdown !== "N/A" ? dropdown : navButton}.`;
}

export function formatMultipleNavigations(navs: any[]): string {
  if (navs.length <= 3) {
    return navs.map((n) => formatNavigationGeneral(n)).join("\n");
  } else {
    const header = `Found ${navs.length} navigation items:\n`;
    const list = navs
      .map(
        (n) =>
          `• ${n.dropdown_menu !== "N/A" ? n.dropdown_menu : n.nav_button}${
            n.link ? ` (${n.link})` : ""
          }`
      )
      .join("\n");
    return header + list;
  }
}
