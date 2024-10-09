import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@acme/ui/button";
import { LoaderIcon } from "@acme/ui/loader-icon";

import { deleteView } from "~/app/_lib/actions";

interface DeletePostViewFormProps {
  viewId: string;
  setIsEditPostViewFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeletePostViewForm({
  viewId,
  setIsEditPostViewFormOpen,
}: DeletePostViewFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, formAction] = useFormState(deleteView, {
    message: "",
  });

  useEffect(() => {
    if (state.status === "success") {
      setIsEditPostViewFormOpen(false);
      if (searchParams.get("viewId") === viewId) {
        router.replace(pathname);
      }
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, setIsEditPostViewFormOpen]);

  return (
    <form action={formAction} className="p-2">
      <input type="hidden" name="id" value={viewId} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      variant="outline"
      size="sm"
      className="w-full border-red-800/50 bg-destructive/5 text-red-600 hover:bg-destructive/10 hover:text-red-600 active:bg-destructive/10"
    >
      {pending ? (
        <LoaderIcon aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        "Delete"
      )}
    </Button>
  );
}
