import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["student", "admin"]).default("student").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary"),
  content: text("content"),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  published: int("published").default(1).notNull(),
  attachmentKey: text("attachmentKey"),
  attachmentName: varchar("attachmentName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  dueAt: timestamp("dueAt"),
  maxScore: int("maxScore").default(100).notNull(),
  attachmentKey: text("attachmentKey"),
  attachmentName: varchar("attachmentName", { length: 255 }),
  visible: int("visible").default(1).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull(),
  studentId: int("studentId").notNull(),
  answerText: text("answerText").notNull(),
  /** Legacy URL field kept for existing submissions; new uploads use attachmentKey. */
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  attachmentName: varchar("attachmentName", { length: 255 }),
  status: mysqlEnum("status", ["submitted", "graded", "returned"]).default("submitted").notNull(),
  score: int("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Message = typeof messages.$inferSelect;
