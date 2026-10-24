import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assert, stageTask } from "../src/harness.mjs";
import { solutions } from "../src/solutions/index.mjs";
import { tasks } from "../src/tasks/index.mjs";

test("the catalog exposes six unique capability tasks", () => {
  assert(tasks.size === 6, `expected 6 tasks, received ${tasks.size}`);
  const capabilities = new Set([...tasks.values()].map((task) => task.capability));
  assert(capabilities.size === 6, "each task should cover a distinct capability");
});

for (const task of tasks.values()) {
  test(`reference solution passes: ${task.id}`, async (context) => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), `forge-six-${task.id}-`));
    context.after(() => rm(workspace, { recursive: true, force: true }));

    await stageTask(task, workspace);
    await solutions.get(task.id)(workspace);
    await task.verify(workspace);
  });
}

