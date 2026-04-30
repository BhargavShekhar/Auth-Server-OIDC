import { pgTable, varchar, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),

  email: varchar("email", { length: 322 }),
  emailVerified: boolean("email_verified").default(false).notNull(),

  password: varchar("password", { length: 66 }), // len 256 -> sha256
  salt: text("salt"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$default(() => new Date())
});

export const oidcClientsTable = pgTable("oidc_clients", {
  id: uuid("id").primaryKey().defaultRandom(),

  clientId: varchar("client_id", { length: 100 }).notNull().unique(),
  clientSecret: varchar("client_secret", { length: 256 }).notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  redirectUris: text("redirect_uris").array().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$default(() => new Date())
})