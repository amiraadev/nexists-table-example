"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

import type { CreatePostSchema } from "@acme/db/schema";
import { createPostSchema, posts } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Kbd } from "@acme/ui/kbd";
import { LoaderIcon } from "@acme/ui/loader-icon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { createPost } from "~/app/posts/_lib/actions";

export function CreatePostDialog() {
  const [open, setOpen] = React.useState(false);
  const [isCreatePending, startCreateTransition] = React.useTransition();

  const form = useForm<CreatePostSchema>({
    resolver: zodResolver(createPostSchema),
  });

  function onSubmit(input: CreatePostSchema) {
    startCreateTransition(async () => {
      const { error } = await createPost(input);

      if (error) {
        toast.error(error);
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Post created");
    });
  }

  useHotkeys("shift+n", () => {
    setTimeout(() => setOpen(true), 100);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                New post
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2 border bg-accent font-semibold text-foreground dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40">
            Add new post
            <div>
              <Kbd variant="outline">⇧</Kbd> <Kbd variant="outline">N</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new post.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Do a kickflip"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author name</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Author name"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={"capitalize"}>
                        <SelectValue placeholder="Select a label" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {posts.status.enumValues.map((item) => (
                          <SelectItem
                            key={item}
                            value={item}
                            className="capitalize"
                          >
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commentsNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments number</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comments..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-2 sm:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isCreatePending}>
                {isCreatePending && (
                  <LoaderIcon
                    className="mr-1.5 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
