import { sql } from "drizzle-orm";
import {
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

//////////////////////// POSTS ////////////////////////

export const postStatusEnum = pgEnum(`post_status`, [
  "draft",
  "published",
  "archived",
]);

export const posts = pgTable("posts", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  authorName: varchar("authorName", { length: 256 }).notNull(),
  commentsNumber: integer("commentsNumber").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
  .default(sql`current_timestamp`)
  .$onUpdate(() => new Date()),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const postViews = pgTable("postViews", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull().unique(),
  columns: text("columns").array(),
  filterParams: json("filterParams").$type<PostFilterParams>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export type PostView = typeof postViews.$inferSelect;

export const searchPostParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  authorName: z.string().optional(),
  commentsNumber: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
  viewId: z.string().uuid().optional(),
});

export type SearchPostParams = z.infer<typeof searchPostParamsSchema>;

export const getPostsSchema = searchPostParamsSchema;

export type GetPostsSchema = z.infer<typeof getPostsSchema>;

export const createPostSchema = z.object({
  title: z.string(),
  authorName: z.string(),
  status: z.enum(posts.status.enumValues),
  commentsNumber: z.number(),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  status: z.enum(posts.status.enumValues).optional(),
  commentsNumber: z.number().optional(),
});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;

export const createPostViewSchema = z.object({
  name: z.string().min(1),
  columns: z.string().array().optional(),
  filterParams: z
    .object({
      operator: z.enum(["and", "or"]).optional(),
      sort: z.string().optional(),
      filters: z
        .object({
          field: z.enum(["title", "authorName", "status", "commentsNumber"]),
          value: z.string(),
          isMulti: z.boolean().default(false),
        })
        .array()
        .optional(),
    })
    .optional(),
});

export type CreatePostViewSchema = z.infer<typeof createPostViewSchema>;

export const editPostViewSchema = createPostViewSchema.extend({
  id: z.string().uuid(),
});
export type EditPostViewSchema = z.infer<typeof editViewSchema>;

export const deletePostViewSchema = z.object({
  id: z.string().uuid(),
});

export type DeletePostViewSchema = z.infer<typeof deletePostViewSchema>;

export type PostFilterParams = NonNullable<
  CreatePostViewSchema["filterParams"]
>;
export type PostOperator = PostFilterParams["operator"];
export type PostSort = PostFilterParams["sort"];
export type PostFilter = NonNullable<PostFilterParams["filters"]>[number];

//////////////////////// USER ////////////////////////

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }),
});

//////////////////////// TASKS ////////////////////////

export const statusEnum = pgEnum(`status`, [
  "todo",
  "in-progress",
  "done",
  "canceled",
]);

export const labelEnum = pgEnum(`label`, [
  "bug",
  "feature",
  "enhancement",
  "documentation",
]);

export const priorityEnum = pgEnum(`priority`, ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  code: varchar("code", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 256 }),
  status: statusEnum("status").notNull().default("todo"),
  label: labelEnum("label").notNull().default("bug"),
  priority: priorityEnum("priority").notNull().default("low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const views = pgTable("views", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull().unique(),
  columns: text("columns").array(),
  filterParams: json("filter_params").$type<FilterParams>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export type View = typeof views.$inferSelect;

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
  viewId: z.string().uuid().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const getTasksSchema = searchParamsSchema;

export type GetTasksSchema = z.infer<typeof getTasksSchema>;

export const createTaskSchema = z.object({
  title: z.string(),
  label: z.enum(tasks.label.enumValues),
  status: z.enum(tasks.status.enumValues),
  priority: z.enum(tasks.priority.enumValues),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  label: z.enum(tasks.label.enumValues).optional(),
  status: z.enum(tasks.status.enumValues).optional(),
  priority: z.enum(tasks.priority.enumValues).optional(),
});

export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;

export const createViewSchema = z.object({
  name: z.string().min(1),
  columns: z.string().array().optional(),
  filterParams: z
    .object({
      operator: z.enum(["and", "or"]).optional(),
      sort: z.string().optional(),
      filters: z
        .object({
          field: z.enum(["title", "status", "priority"]),
          value: z.string(),
          isMulti: z.boolean().default(false),
        })
        .array()
        .optional(),
    })
    .optional(),
});

export type CreateViewSchema = z.infer<typeof createViewSchema>;

export const editViewSchema = createViewSchema.extend({
  id: z.string().uuid(),
});

export type EditViewSchema = z.infer<typeof editViewSchema>;

export const deleteViewSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteViewSchema = z.infer<typeof deleteViewSchema>;

export type FilterParams = NonNullable<CreateViewSchema["filterParams"]>;
export type Operator = FilterParams["operator"];
export type Sort = FilterParams["sort"];
export type Filter = NonNullable<FilterParams["filters"]>[number];
