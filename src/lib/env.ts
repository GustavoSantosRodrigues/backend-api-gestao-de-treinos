import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.string().default("3001"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  WEB_APP_BASE_URL: z.string().default("http://localhost:3001"),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().default("http://localhost:8081"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  AI_RATE_LIMIT: z.coerce.number().default(20),
  DOCS_USERNAME: z.string().default("admin"),
  DOCS_PASSWORD: z.string().default("311905Guh!"),
});

export const env = schema.parse(process.env);
