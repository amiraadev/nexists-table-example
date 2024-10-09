"use client";

import React from "react";

import type { Post } from "@acme/db/schema";
import { posts } from "@acme/db/schema";

import type { getPosts, getPostViews } from "../_lib/queries";
import type { DataTableFilterField } from "~/types";
// import { DataTableAdvancedToolbar } from "~/components/data-table/advanced/data-table-advanced-toolbar";
import { DataTableAdvancedPostToolbar } from "~/components/data-table/advanced/posts/data-table-advanced-post-toolbar";
import { DataTable } from "~/components/data-table/data-table";
import { TableInstanceProvider } from "~/components/data-table/table-instance-provider";
import { useDataTable } from "~/hooks/use-data-table";
import { getStatusIcon } from "../_lib/utils";
import { getColumns } from "./posts-table-columns";
import { PostsTableFloatingBar } from "./posts-table-floating-bar";
import { PostsTableToolbarActions } from "./posts-table-toolbar-actions";

interface PostsTableProps {
  postsPromise: ReturnType<typeof getPosts>;
  viewsPromise: ReturnType<typeof getPostViews>;
}

export function PostsTable({ postsPromise, viewsPromise }: PostsTableProps) {
  const { data, pageCount } = React.use(postsPromise);
  const views = React.use(viewsPromise);

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), []);

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<Post>[] = [
    {
      label: "Title",
      value: "title",
      placeholder: "Filter titles...",
    },
    {
      label: "Author Name",
      value: "authorName",
      placeholder: "Filter author name...",
    },
    {
      label: "Status",
      value: "status",
      options: posts.status.enumValues.map((status) => ({
        label: status[0]?.toUpperCase() + status.slice(1),
        value: status,
        icon: getStatusIcon(status),
        withCount: true,
      })),
    },
    {
      label: "Comments Number",
      value: "commentsNumber",
      placeholder: "Filter comments number...",
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    defaultPerPage: 10,
    defaultSort: "createdAt.desc",
  });

  return (
    <TableInstanceProvider table={table}>
      <DataTable
        table={table}
        floatingBar={<PostsTableFloatingBar table={table} />}
      >
        {/* <DataTableAdvancedToolbar filterFields={filterFields} views={views}>
          <PostsTableToolbarActions table={table} />
        </DataTableAdvancedToolbar> */}
        <DataTableAdvancedPostToolbar filterFields={filterFields} views={views}>
          <PostsTableToolbarActions table={table} />
        </DataTableAdvancedPostToolbar>
      </DataTable>
    </TableInstanceProvider>
  );
}
