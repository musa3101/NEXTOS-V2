import { BrowserContext } from "@playwright/test";

export async function setAuthenticatedSession(context: BrowserContext) {
  await context.addCookies([
    {
      name: "nextos_session",
      value: "authenticated",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
