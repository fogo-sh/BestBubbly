import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import db, { closeDb } from "./connection";

await migrate(db, { migrationsFolder: "drizzle" });
closeDb();
