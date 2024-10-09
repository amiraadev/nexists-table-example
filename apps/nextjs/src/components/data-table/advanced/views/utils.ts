import { ReadonlyURLSearchParams } from "next/navigation";

import type {
  Filter,
  FilterParams,
  Operator,
  PostFilter,
  PostFilterParams,
  SearchParams,
  SearchPostParams,
  Sort,
} from "@acme/db/schema";

import type {
  PostViewItem,
  ViewItem,
} from "~/components/data-table/advanced/views/data-table-views-dropdown";
import type { Params, PostParams } from "~/lib/utils";
import type { DataTableFilterOption } from "~/types";
import { createQueryString } from "~/lib/utils";

export const FILTERABLE_FIELDS: (keyof SearchParams)[] = [
  "title",
  "status",
  "priority",
  "sort",
  "operator",
];

export const FILTERABLE_POST_FIELDS: (keyof SearchPostParams)[] = [
  "title",
  "authorName",
  "status",
  "commentsNumber",
  "sort",
  "operator",
];

export const COLUMNS = ["title", "status", "priority", "createdAt"] as const;

export const POST_COLUMNS = [
  "title",
  "authorName",
  "status",
  "commentsNumber",
  "createdAt",
] as const;

export function calcFilterParams<T = unknown>(
  selectedOptions: DataTableFilterOption<T>[],
  searchParams: ReadonlyURLSearchParams,
) {
  const filterItems: Filter[] = selectedOptions
    .filter((option) => option.filterValues && option.filterValues.length > 0)
    .map((option) => ({
      field: option.value as Filter["field"],
      value: `${option.filterValues?.join(".")}~${option.filterOperator}`,
      isMulti: !!option.isMulti,
    }));
  const filterParams: FilterParams = {
    filters: filterItems,
  };
  filterParams.operator = (searchParams.get("operator") as Operator) ?? "and";
  if (searchParams.get("sort")) {
    filterParams.sort = searchParams.get("sort") as Sort;
  }
  return filterParams;
}
export function calcPostFilterParams<T = unknown>(
  selectedOptions: DataTableFilterOption<T>[],
  searchParams: ReadonlyURLSearchParams,
) {
  const filterItems: PostFilter[] = selectedOptions
    .filter((option) => option.filterValues && option.filterValues.length > 0)
    .map((option) => ({
      field: option.value as PostFilter["field"],
      value: `${option.filterValues?.join(".")}~${option.filterOperator}`,
      isMulti: !!option.isMulti,
    }));
  const postFilterParams: PostFilterParams = {
    filters: filterItems,
  };
  postFilterParams.operator =
    (searchParams.get("operator") as Operator) ?? "and";
  if (searchParams.get("sort")) {
    postFilterParams.sort = searchParams.get("sort") as Sort;
  }
  return postFilterParams;
}

export function calcViewSearchParamsURL(view: ViewItem) {
  const searchParamsObj: Params = {};
  const filterParams = view.filterParams;
  if (!filterParams) return;

  for (const item of filterParams.filters ?? []) {
    if (FILTERABLE_FIELDS.includes(item.field)) {
      const value = item.isMulti ? `${item.value}~multi` : item.value;
      searchParamsObj[item.field] = value;
    }
  }
  if (filterParams.operator) {
    searchParamsObj.operator = filterParams.operator;
  }
  if (filterParams.sort) {
    searchParamsObj.sort = filterParams.sort;
  }
  searchParamsObj.page = 1;
  searchParamsObj.per_page = 10;
  searchParamsObj.viewId = view.id;

  return createQueryString(searchParamsObj, new ReadonlyURLSearchParams());
}

export function calcPostViewSearchParamsURL(view: PostViewItem) {
  const searchParamsObj: PostParams = {};
  const filterParams = view.filterParams;
  if (!filterParams) return;

  for (const item of filterParams.filters ?? []) {
    if (FILTERABLE_POST_FIELDS.includes(item.field)) {
      const value = item.isMulti ? `${item.value}~multi` : item.value;
      searchParamsObj[item.field] = value;
    }
  }
  if (filterParams.operator) {
    searchParamsObj.operator = filterParams.operator;
  }
  if (filterParams.sort) {
    searchParamsObj.sort = filterParams.sort;
  }
  searchParamsObj.page = 1;
  searchParamsObj.per_page = 10;
  searchParamsObj.viewId = view.id;

  return createQueryString(searchParamsObj, new ReadonlyURLSearchParams());
}

export function getIsFiltered(searchParams: ReadonlyURLSearchParams) {
  const filters = [];
  const filterObj = Object.fromEntries(searchParams);
  for (const [key, value] of Object.entries(filterObj) as [
    keyof SearchParams,
    string,
  ][]) {
    if (key === "sort" && value === "createdAt.desc") {
      continue;
    }

    if (key === "operator" && value === "and") {
      continue;
    }

    if (FILTERABLE_FIELDS.includes(key)) {
      filters.push(key);
    }
  }
  return filters.length > 0;
}

export function getIsPostFiltered(searchParams: ReadonlyURLSearchParams) {
  const filters = [];
  const filterObj = Object.fromEntries(searchParams);
  for (const [key, value] of Object.entries(filterObj) as [
    keyof SearchPostParams,
    string,
  ][]) {
    if (key === "sort" && value === "createdAt.desc") {
      continue;
    }

    if (key === "operator" && value === "and") {
      continue;
    }

    if (FILTERABLE_POST_FIELDS.includes(key)) {
      filters.push(key);
    }
  }
  return filters.length > 0;
}
