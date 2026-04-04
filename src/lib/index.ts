import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { prisma } from "./db.js";
import { env } from "./env.js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    env.WEB_APP_BASE_URL, // web
    env.BETTER_AUTH_URL, // api/docs
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    openAPI(),
    admin({
      defaultRole: "user",
    }),
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: env.NODE_ENV === "production" ? ".gustavodevsr.xyz" : undefined,
    },
    useSecureCookies: env.NODE_ENV === "production",
  },
});
