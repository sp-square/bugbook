"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia, validateRequest } from "@/lib/auth";

export async function logout() {
  // We check that the user is actually logged in and we collect the session
  const { session } = await validateRequest();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/login");
}
