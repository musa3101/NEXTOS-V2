import { describe, it, expect } from "vitest";
import { buildGoogleCalendarUrl } from "@/app/api/maintenance/route";

describe("Maintenance API & Google Calendar URL Builder", () => {
  it("builds a valid Google Calendar URL with encoded parameters and checklist", () => {
    const projectName = "ecuaplac";
    const clientName = "Ecuaplac SL";
    const targetDate = "2026-10-15T10:00:00.000Z";
    const url = "https://ecuaplac.com";

    const gCalUrl = buildGoogleCalendarUrl(projectName, targetDate, url, clientName);

    expect(gCalUrl).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(gCalUrl).toContain("text=");
    expect(gCalUrl).toContain("ecuaplac");
    expect(gCalUrl).toContain("dates=20261015T100000Z/20261015T110000Z");
    expect(gCalUrl).toContain("location=https%3A%2F%2Fecuaplac.com");
  });
});
