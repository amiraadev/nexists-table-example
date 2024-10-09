"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { asc, eq, inArray, not } from "drizzle-orm";

// import { customAlphabet } from "nanoid";

import type {
  CreatePostSchema,
  CreatePostViewSchema,
  DeletePostViewSchema,
  EditPostViewSchema,
  Post,
  UpdatePostSchema,
} from "@acme/db/schema";
import { db, takeFirstOrThrow } from "@acme/db/client";
import {
  createPostViewSchema,
  deletePostViewSchema,
  editPostViewSchema,
  posts,
  postViews,
} from "@acme/db/schema";
import { generateRandomPost } from "@acme/db/util";

import type { PostViewItem } from "~/components/data-table/advanced/views/data-table-views-dropdown";
import { getErrorMessage } from "~/lib/handle-error";

export interface CreateFormState<T> {
  status?: "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof T, string>>;
}

export async function createPost(input: CreatePostSchema) {
  noStore();
  try {
    await db.transaction(async (tx) => {
      const newPost = await tx
        .insert(posts)
        .values({
          title: input.title,
          authorName: input.authorName,
          status: input.status,
          commentsNumber: input.commentsNumber,
        })
        .returning({
          id: posts.id,
        })
        .then(takeFirstOrThrow);

      // Delete a post to keep the total number of posts constant
      await tx.delete(posts).where(
        eq(
          posts.id,
          (
            await tx
              .select({
                id: posts.id,
              })
              .from(posts)
              .limit(1)
              .where(not(eq(posts.id, newPost.id)))
              .orderBy(asc(posts.createdAt))
              .then(takeFirstOrThrow)
          ).id,
        ),
      );
    });

    revalidatePath("/");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updatePost(input: UpdatePostSchema & { id: string }) {
  noStore();

  try {
    await db
      .update(posts)
      .set({
        title: input.title,
        authorName: input.authorName,
        status: input.status,
        commentsNumber: input.commentsNumber,
      })
      .where(eq(posts.id, input.id));

    revalidatePath("/");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updatePosts(input: {
  ids: string[];
  status?: Post["status"];
}) {
  noStore();
  try {
    await db
      .update(posts)
      .set({
        status: input.status,
      })
      .where(inArray(posts.id, input.ids));

    revalidatePath("/");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deletePost(input: { id: string }) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(posts).where(eq(posts.id, input.id));

      // Create a new post for the deleted one
      await tx.insert(posts).values(generateRandomPost());
    });

    revalidatePath("/");
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deletePosts(input: { ids: string[] }) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(posts).where(inArray(posts.id, input.ids));

      // Create new posts for the deleted ones
      await tx.insert(posts).values(input.ids.map(() => generateRandomPost()));
    });

    revalidatePath("/");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

type CreateViewFormState = CreateFormState<CreatePostViewSchema> & {
  view?: PostViewItem;
};

export async function createView(
  _prevState: CreateViewFormState,
  formData: FormData,
): Promise<CreateViewFormState> {
  noStore();

  const name = formData.get("name");
  const columns = (
    formData.get("columns")
      ? JSON.parse(formData.get("columns") as string)
      : undefined
  ) as string[] | undefined;
  const filterParams = (
    formData.get("filterParams")
      ? JSON.parse(formData.get("filterParams") as string)
      : undefined
  ) as {
    operator?: "and" | "or";
    sort?: string;
    filters?: {
      field: "title" | "authorName" | "status" | "commentsNumber";
      value: string;
      isMulti: boolean;
    }[];
  };

  const validatedFields = createPostViewSchema.safeParse({
    name,
    columns,
    filterParams,
  });

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors;
    return {
      status: "error",
      message: errorMap.name?.[0] ?? "",
    };
  }

  let viewId = "";

  try {
    await db.transaction(async (tx) => {
      const newView = await tx
        .insert(postViews)
        .values({
          name: validatedFields.data.name,
          columns: validatedFields.data.columns,
          filterParams: validatedFields.data.filterParams,
        })
        .returning({
          id: postViews.id,
        })
        .then(takeFirstOrThrow);

      viewId = newView.id;

      const allViews = await db.select({ id: postViews.id }).from(postViews);
      if (allViews.length >= 10) {
        await tx.delete(postViews).where(
          eq(
            postViews.id,
            (
              await tx
                .select({
                  id: postViews.id,
                })
                .from(postViews)
                .limit(1)
                .where(not(eq(postViews.id, newView.id)))
                .orderBy(asc(postViews.createdAt))
                .then(takeFirstOrThrow)
            ).id,
          ),
        );
      }
    });

    revalidatePath("/");

    return {
      status: "success",
      message: "View created",
      view: {
        id: viewId,
        name: validatedFields.data.name,
        columns: validatedFields.data.columns ?? null,
        filterParams: validatedFields.data.filterParams ?? null,
      },
    };
  } catch (err) {
    return {
      status: "error",
      message: getErrorMessage(err),
    };
  }
}

type EditViewFormState = CreateFormState<EditPostViewSchema>;

interface FilterParams {
  operator?: "and" | "or";
  sort?: string;
  filters?: {
    field: "title" | "authorName" | "status" | "commentsNumber";
    value: string;
    isMulti: boolean;
  }[];
}

export async function editView(
  _prevState: EditViewFormState,
  formData: FormData,
): Promise<EditViewFormState> {
  noStore();

  const id = formData.get("id");
  const name = formData.get("name");
  const columns = (
    formData.get("columns")
      ? JSON.parse(formData.get("columns") as string)
      : undefined
  ) as string[] | undefined;
  const filterParams = (
    formData.get("filterParams")
      ? JSON.parse(formData.get("filterParams") as string)
      : undefined
  ) as FilterParams | undefined;

  const validatedFields = editPostViewSchema.safeParse({
    id,
    name,
    columns,
    filterParams,
  });

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors;
    return {
      status: "error",
      message: errorMap.name?.[0] ?? "",
    };
  }

  try {
    await db
      .update(postViews)
      .set({
        name: validatedFields.data.name,
        columns: validatedFields.data.columns,
        filterParams: validatedFields.data.filterParams,
      })
      .where(eq(postViews.id, validatedFields.data.id));

    revalidatePath("/");

    return {
      status: "success",
      message: "View updated",
    };
  } catch (err) {
    if (
      typeof err === "object" &&
      err &&
      "code" in err &&
      err.code === "23505"
    ) {
      return {
        status: "error",
        message: `A view with the name "${validatedFields.data.name}" already exists`,
      };
    }

    return {
      status: "error",
      message: getErrorMessage(err),
    };
  }
}

type DeleteViewFormState = CreateFormState<DeletePostViewSchema>;

export async function deleteView(
  _prevState: DeleteViewFormState,
  formData: FormData,
): Promise<DeleteViewFormState> {
  noStore();

  const id = formData.get("id");

  const validatedFields = deletePostViewSchema.safeParse({
    id,
  });

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors;
    return {
      status: "error",
      message: errorMap.id?.[0] ?? "",
    };
  }

  try {
    await db.delete(postViews).where(eq(postViews.id, validatedFields.data.id));

    revalidatePath("/");

    return {
      status: "success",
      message: "View deleted",
    };
  } catch (err) {
    return {
      status: "error",
      message: getErrorMessage(err),
    };
  }
}
