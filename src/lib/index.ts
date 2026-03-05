import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { prisma } from "./db.js";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",   // front
    "http://localhost:8081",   // api/docs
  ],
  emailAndPassword: { enabled: true },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [openAPI()],
});