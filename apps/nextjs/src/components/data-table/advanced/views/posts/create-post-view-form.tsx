import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { PostFilterParams } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { LoaderIcon } from "@acme/ui/loader-icon";
import { Separator } from "@acme/ui/separator";

import { createView } from "~/app/_lib/actions";
import { useTableInstanceContext } from "../../../table-instance-provider";
import { calcViewSearchParamsURL } from "../utils";

interface CreatePostViewFormProps {
  backButton?: true;
  onBack?: () => void;
  onSuccess?: () => void;
  filterParams?: PostFilterParams;
}

export function CreatePostViewForm({
  backButton,
  filterParams,
  onBack,
  onSuccess,
}: CreatePostViewFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  const nameInputRef = useRef<HTMLInputElement>(null);

  const { tableInstance } = useTableInstanceContext();

  const [state, formAction] = useFormState(createView, {
    message: "",
  });

  const visibleColumns = tableInstance
    .getVisibleFlatColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    )
    .map((column) => column.id);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
      if (state.view) {
        const searchParamsURL = calcViewSearchParamsURL(state.view);
        router.replace(`${pathname}?${searchParamsURL}`);
      }
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div>
      {backButton && (
        <>
          <div className="flex items-center gap-1 px-1 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onBack?.()}
            >
              <span className="sr-only">Close create view form</span>
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
            </Button>

            <span className="text-sm">Create view</span>
          </div>

          <Separator />
        </>
      )}

      <form action={formAction} className="flex flex-col gap-2 p-2">
        <input
          type="hidden"
          name="columns"
          value={JSON.stringify(visibleColumns)}
        />
        <input
          type="hidden"
          name="filterParams"
          value={JSON.stringify(filterParams)}
        />
        <Input
          ref={nameInputRef}
          type="text"
          name="name"
          placeholder="Name"
          autoComplete="off"
        />
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="sm">
      {pending ? (
        <LoaderIcon aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        "Create"
      )}
    </Button>
  );
}
