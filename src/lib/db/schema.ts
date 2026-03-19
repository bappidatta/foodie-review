import { pgTable, text, timestamp, uuid, integer, pgEnum, primaryKey, smallint } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

// ── Users (populated by NextAuth) ──────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Reviews ────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  restaurantName: text("restaurant_name").notNull().default(""),
  rating: smallint("rating").notNull().default(5),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Media (images / short videos) ──────────────────────
export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: mediaTypeEnum("type").notNull(),
  order: integer("order").default(0).notNull(),
});

// ── Tags ───────────────────────────────────────────────
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

// ── Review ↔ Tag join table ────────────────────────────
export const reviewTags = pgTable("review_tags", {
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// ── Likes ─────────────────────────────────────────────
export const likes = pgTable("likes", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.userId, t.reviewId] })]);

// ── Comments ──────────────────────────────────────────
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Type helpers ───────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
