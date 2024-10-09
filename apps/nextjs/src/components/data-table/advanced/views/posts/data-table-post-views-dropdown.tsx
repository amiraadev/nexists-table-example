import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretDownIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useHotkeys } from "react-hotkeys-hook";

import type { PostFilterParams, PostView } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@acme/ui/command";
import { Kbd } from "@acme/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { Separator } from "@acme/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { getIsMacOS } from "~/lib/utils";
import { CreatePostViewForm } from "./create-post-view-form";

// import { EditViewForm } from "../edit-view-form";
import { EditPostViewForm } from "./edit-post-view-form";
import { calcPostViewSearchParamsURL } from "../utils";

export type PostViewItem = Omit<PostView, "createdAt" | "updatedAt">;

interface DataTablePostViewsDropdownProps {
  views: PostViewItem[];
  filterParams: PostFilterParams;
}

export function DataTablePostViewsDropdown({
  views,
  filterParams,
}: DataTablePostViewsDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [isCreateViewFormOpen, setIsCreateViewFormOpen] = useState(false);
  const [isEditPostViewFormOpen, setIsEditPostViewFormOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<PostViewItem | null>(null);

  const currentView = views.find(
    (view) => view.id === searchParams.get("viewId"),
  );

  function selectView(view: PostViewItem) {
    const searchParamsURL = calcPostViewSearchParamsURL(view);
    router.push(`${pathname}?${searchParamsURL}`, {
      scroll: false,
    });
  }

  const isMac = getIsMacOS();
  useHotkeys(`${isMac ? "meta" : "ctrl"}+v`, () => {
    setTimeout(() => setOpen(true), 100);
  });

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setIsCreateViewFormOpen(false);
        setIsEditPostViewFormOpen(false);
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex w-36 shrink-0 justify-between"
              >
                <span className="truncate">
                  {currentView?.name ?? "All tasks"}
                </span>
                <CaretDownIcon aria-hidden="true" className="size-4 shrink-0" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2 border bg-accent font-semibold text-foreground dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40">
            Open views
            <div>
              <Kbd variant="outline">{isMac ? "⌘" : "ctrl"}</Kbd>{" "}
              <Kbd variant="outline">V</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        className="w-[12.5rem] p-0 dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40"
        align="start"
      >
        {isCreateViewFormOpen && (
          <CreatePostViewForm
            backButton
            onBack={() => setIsCreateViewFormOpen(false)}
            filterParams={filterParams}
            onSuccess={() => setOpen(false)}
          />
        )}

        {isEditPostViewFormOpen && selectedView && (
          // <EditViewForm
          <EditPostViewForm
            view={selectedView}
            setIsEditPostViewFormOpen={setIsEditPostViewFormOpen}
          />
        )}

        {!isCreateViewFormOpen && !isEditPostViewFormOpen && (
          <Command className="dark:bg-transparent">
            <CommandInput placeholder="View name" />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup className="max-h-48 overflow-auto">
                <CommandItem
                  value="All tasks"
                  onSelect={() => {
                    router.push(pathname, { scroll: false });
                    setOpen(false);
                  }}
                >
                  All tasks
                </CommandItem>
                {views.map((view) => (
                  <CommandItem
                    key={view.id}
                    value={view.name}
                    className="group justify-between"
                    onSelect={() => {
                      selectView(view);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{view.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="invisible size-5 shrink-0 hover:bg-neutral-200 group-hover:visible dark:hover:bg-neutral-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditPostViewFormOpen(true);
                        setSelectedView(view);
                      }}
                    >
                      <Pencil1Icon className="size-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
              <Separator />
              <CommandGroup>
                <CommandItem onSelect={() => setIsCreateViewFormOpen(true)}>
                  <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                  Add view
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
