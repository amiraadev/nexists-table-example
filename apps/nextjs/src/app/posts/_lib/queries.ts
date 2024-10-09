import "server-only";

import type { SQL } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { and, asc, count, desc, gte, lte, or, sql } from "drizzle-orm";

import type { GetPostsSchema, Post } from "@acme/db/schema";
import { db } from "@acme/db/client";
import { posts, postViews } from "@acme/db/schema";

import type { DrizzleWhere } from "~/types";
import { filterColumn } from "~/lib/filter-column";

export async function getPosts(input: GetPostsSchema) {
  noStore();
  const {
    page,
    per_page,
    sort,
    title,
    status,
    authorName,
    commentsNumber,
    operator,
    from,
    to,
  } = input;

  try {
    // Offset to paginate the results
    const offset = (page - 1) * per_page;
    // Column and order to sort by
    // Spliting the sort string by "." to get the column and order
    // Example: "title.desc" => ["title", "desc"]
    const [column, order] = (sort?.split(".").filter(Boolean) ?? [
      "createdAt",
      "desc",
    ]) as [keyof Post | undefined, "asc" | "desc" | undefined];

    // Convert the date strings to date objects
    const fromDay = from ? sql`to_date(${from}, 'yyyy-mm-dd')` : undefined;
    const toDay = to ? sql`to_date(${to}, 'yyyy-mm-dd')` : undefined;

    const expressions: (SQL<unknown> | undefined)[] = [
      title
        ? filterColumn({
            column: posts.title,
            value: title,
          })
        : undefined,
      // Filter posts by status
      status
        ? filterColumn({
            column: posts.status,
            value: status,
            isSelectable: true,
          })
        : undefined,
      // Filter posts by priority
      authorName
        ? filterColumn({
            column: posts.authorName,
            value: authorName,
          })
        : undefined,
      // Filter posts by commentsNumber
      commentsNumber
        ? filterColumn({
            column: posts.commentsNumber,
            value: commentsNumber,
          })
        : undefined,

      // Filter by createdAt
      fromDay && toDay
        ? and(gte(posts.createdAt, fromDay), lte(posts.createdAt, toDay))
        : undefined,
    ];
    const where: DrizzleWhere<Post> =
      !operator || operator === "and"
        ? and(...expressions)
        : or(...expressions);

    // Transaction is used to ensure both queries are executed in a single transaction
    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(posts)
        .limit(per_page)
        .offset(offset)
        .where(where)
        .orderBy(
          column && column in posts
            ? order === "asc"
              ? asc(posts[column])
              : desc(posts[column])
            : desc(posts.id),
        );

      const total = await tx
        .select({
          count: count(),
        })
        .from(posts)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const pageCount = Math.ceil(total / per_page);
    return { data, pageCount };
  } catch {
    return { data: [], pageCount: 0 };
  }
}

export async function getPostCountByStatus() {
  noStore();
  try {
    return await db
      .select({
        status: posts.status,
        count: count(),
      })
      .from(posts)
      .groupBy(posts.status)
      .execute();
  } catch {
    return [];
  }
}
export async function getPostCountByAuthorName() {
  noStore();
  try {
    return await db
      .select({
        priority: posts.authorName,
        count: count(),
      })
      .from(posts)
      .groupBy(posts.authorName)
      .execute();
  } catch {
    return [];
  }
}
export async function getPostCountByCommentsNumber() {
  noStore();
  try {
    return await db
      .select({
        commentsNumber: posts.commentsNumber,
        count: count(),
      })
      .from(posts)
      .groupBy(posts.commentsNumber)
      .execute();
  } catch {
    return [];
  }
}
export async function getPostViews() {
  noStore();
  return await db
    .select({
      id: postViews.id,
      name: postViews.name,
      columns: postViews.columns,
      filterParams: postViews.filterParams,
    })
    .from(postViews)
    .orderBy(desc(postViews.createdAt));
}
