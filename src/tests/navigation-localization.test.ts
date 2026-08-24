import { describe, expect, it } from "vitest";
import { activeNavigationAncestors, navigationItems } from "@/components/navigation/sidebar-navigation";

describe("accordion navigation definition", () => {
  it("contains each implemented module exactly once", () => {
    expect(new Set(navigationItems.map((item) => item.key)).size).toBe(navigationItems.length);
    expect(navigationItems).toHaveLength(55);
  });

  it("opens both accounting ancestors for a nested active module", () => {
    expect(activeNavigationAncestors("accounting-journals")).toEqual(["accounting", "accounting-daily"]);
    expect(activeNavigationAncestors("dashboard")).toEqual([]);
  });

  it("uses intentional Arabic terminology instead of accidental English labels", () => {
    const allowed = /\((WBS|BOQ|RFI|NCR|Submittals|Transmittals)\)/g;
    navigationItems.forEach((item) => expect(item.ar.replace(allowed, "")).not.toMatch(/[A-Za-z]{3,}/));
  });
});
