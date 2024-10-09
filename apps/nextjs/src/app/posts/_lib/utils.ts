import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";

import type { Post } from "@acme/db/schema";

/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the post.
 * @returns A React component representing the status icon.
 */
export function getStatusIcon(status: Post["status"]) {
  const statusIcons = {
    draft: CrossCircledIcon,
    published: CheckCircledIcon,
    archived: QuestionMarkCircledIcon,
  };

  return statusIcons[status];
}
