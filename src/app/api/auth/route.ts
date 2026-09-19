import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL || "mynextbymusa@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "musacocppl";

    if (email === adminEmail && password === adminPassword) {
      const cookieStore = await cookies();
      // Session: 3 days of inactivity → auto logout
      // The middleware refreshes this cookie on every request, so the
      // 3-day countdown resets with each visit. If the user is inactive
      // for 3 days the cookie expires and they are redirected to /login.
      const SESSION_MAX_AGE = 60 * 60 * 24 * 3; // 3 days in seconds
      cookieStore.set("nextos_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
