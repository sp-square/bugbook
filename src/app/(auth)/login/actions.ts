// This file contains all the server actions related to the login page.
// Server actions is a very convenient way to write backend code in nextjs.
// With server actions we can create functions which generate backend endpoints that we can call

"use server"; // this turns all functions written in this file into server actions
import { verify } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";
import { loginSchema, LoginValues } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { lucia } from "@/lib/auth";

export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password",
      };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
