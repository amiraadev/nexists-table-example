import type { Post, Task } from "./schema";
import { db } from "./client";
import { posts, tasks } from "./schema";
import { generateRandomPost, generateRandomTask } from "./util";

async function seedTasks(input: { count: number | null }) {
  const count = input.count ?? 100;
  try {
    const allTasks: Omit<Task, "id">[] = [];

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomTask());
    }

    await db.delete(tasks);

    console.log("📝 Inserting tasks", allTasks.length);

    await db.insert(tasks).values(allTasks);
  } catch (err) {
    console.error(err);
  }
}

async function seedPosts(_input: { count: number | null }) {
  const count = _input.count ?? 100;
  try {
    const allPosts: Omit<Post, "id">[] = [];

    for (let i = 0; i < count; i++) {
      allPosts.push(generateRandomPost());
    }

    await db.delete(posts);

    console.log("📝 Inserting tasks", allPosts.length);

    await db.insert(posts).values(allPosts);
  } catch (err) {
    console.error(err);
  }
}

function _seedUsers(_input: { count: number }) {
  // TODO: Implement this function
}

function _seedComments(_input: { count: number }) {
  // TODO: Implement this function
}

async function runSeed() {
  console.log("⏳ Running seed...");

  const start = Date.now();

  await seedTasks({ count: 10 });
  await seedPosts({ count: 50 });

  const end = Date.now();

  console.log(`✅ Seed completed in ${end - start}ms`);

  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seed failed");
  console.error(err);
  process.exit(1);
});
