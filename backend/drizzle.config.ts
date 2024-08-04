import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "src/db/schema.ts",
  breakpoints: true,
  dbCredentials: {
    url: process.env.DB || "sqlite/bestbubbly.sqlite",
  },
} satisfies Config;
