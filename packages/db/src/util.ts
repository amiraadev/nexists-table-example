import { faker } from "@faker-js/faker";
import { customAlphabet } from "nanoid";

import type { Post, Task } from "./schema";
import { posts, tasks } from "./schema";

export function generateRandomTask(): Omit<Task, "id"> {
  return {
    code: `TASK-${customAlphabet("0123456789", 4)()}`,
    title: faker.hacker
      .phrase()
      .replace(/^./, (letter) => letter.toUpperCase()),
    status: faker.helpers.shuffle(tasks.status.enumValues)[0] ?? "todo",
    label: faker.helpers.shuffle(tasks.label.enumValues)[0] ?? "bug",
    priority: faker.helpers.shuffle(tasks.priority.enumValues)[0] ?? "low",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function generateRandomPost(): Omit<Post, "id"> {
  return {
    title: faker.word.words({ count: { min: 3, max: 7 } }),
    status: faker.helpers.shuffle(posts.status.enumValues)[0] ?? "draft",
    authorName: faker.internet.userName(),
    commentsNumber: faker.number.int({ min: 0, max: 9000 }), // Set max to PostgreSQL INTEGER limit
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
