import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@acme/db";
import { posts,createPostSchema } from "@acme/db/schema";

import { publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    console.log("got here");
    return ctx.db.query.posts.findMany({
      orderBy: desc(posts.id),
      limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });
    }),

  create: publicProcedure.input(createPostSchema).mutation(({ ctx, input }) => {
    return ctx.db.insert(posts).values(input);
  }),

  delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(posts).where(eq(posts.id, input));
  }),
} satisfies TRPCRouterRecord;
