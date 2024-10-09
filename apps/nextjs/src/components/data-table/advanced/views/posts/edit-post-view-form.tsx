import { useEffect, useRef } from "react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { LoaderIcon } from "@acme/ui/loader-icon";
import { Separator } from "@acme/ui/separator";

import type { PostViewItem } from "../data-table-views-dropdown";
import { editView } from "~/app/_lib/actions";
// import { DeleteViewForm } from "../delete-view-form";
import { DeletePostViewForm } from "./delete-post-view-form";

interface EditPostViewFormProps {
  view: PostViewItem;
  setIsEditPostViewFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditPostViewForm({
  view,
  setIsEditPostViewFormOpen,
}: EditPostViewFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useFormState(editView, {
    message: "",
  });

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      setIsEditPostViewFormOpen(false);
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, setIsEditPostViewFormOpen]);

  return (
    <div>
      <div className="flex items-center gap-1 px-1 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setIsEditPostViewFormOpen(false)}
        >
          <span className="sr-only">Close edit view form</span>
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </Button>
        <span className="text-sm">Edit view</span>
      </div>

      <Separator />

      <form action={formAction} className="flex flex-col gap-2 p-2">
        <input type="hidden" name="id" value={view.id} />
        <Input
          ref={nameInputRef}
          type="text"
          name="name"
          placeholder="Name"
          defaultValue={view.name}
          autoComplete="off"
        />
        <SubmitButton />
      </form>

      <Separator />

      {/* <DeleteViewForm */}
      <DeletePostViewForm
        viewId={view.id}
        setIsEditPostViewFormOpen={setIsEditPostViewFormOpen}
      />
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
        "Save"
      )}
    </Button>
  );
}
