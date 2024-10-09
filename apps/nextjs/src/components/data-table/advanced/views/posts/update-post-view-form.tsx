import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { PostFilterParams } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { LoaderIcon } from "@acme/ui/loader-icon";

import type { PostViewItem } from "../data-table-views-dropdown";
import { editView } from "~/app/_lib/actions";
import { useTableInstanceContext } from "../../../table-instance-provider";

interface UpdatePostViewFormProps {
  isUpdated: boolean;
  currentView: PostViewItem | undefined;
  filterParams: PostFilterParams;
}

export default function UpdatePostViewForm({
  isUpdated,
  currentView,
  filterParams,
}: UpdatePostViewFormProps) {
  const [state, formAction] = useFormState(editView, { message: "" });

  const { tableInstance } = useTableInstanceContext();

  const visibleColumns = tableInstance
    .getVisibleFlatColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    )
    .map((column) => column.id);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  if (!isUpdated || !currentView) return;

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={currentView.id} />
      <input type="hidden" name="name" value={currentView.name} />
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
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" size="sm" className="gap-1.5">
      {pending && (
        <LoaderIcon aria-hidden="true" className="size-3.5 animate-spin" />
      )}
      Update view
    </Button>
  );
}
