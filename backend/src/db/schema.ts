import {
  customType,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamp = customType<{
  data: Date;
  driverData: string;
}>({
  dataType() {
    return "datetime";
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
});

const commaSeparatedText = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return "text";
  },
  toDriver(value: string[]): string {
    return value.join(",");
  },
  fromDriver(value: string): string[] {
    return value.split(",");
  },
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  avatar_url: text("avatar_url"),
  github_username: text("github_username"),
  created_at: timestamp("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updated_at: timestamp("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const userOauthProviders = sqliteTable("user_oauth_providers", {
  id: integer("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  provider: text("provider").notNull(),
  provider_user_id: text("provider_user_id").notNull(),
  created_at: timestamp("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updated_at: timestamp("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey(),
  user_id: integer("user_id"),
  created_at: timestamp("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const scopes = sqliteTable("scopes", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  scope: commaSeparatedText("scope").notNull(),
  user_uuid: text("user_uuid").notNull(),
  token_type: text("token_type").notNull(),
  expires_in: integer("expires_in").notNull(),
  access_token: text("access_token").notNull().unique(),
  created_at: integer("created_at").notNull(),
});

export const tables = {
  users,
  userOauthProviders,
  scopes,
  sessions,
};
