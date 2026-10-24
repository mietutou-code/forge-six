import * as vision from "./vision/task.mjs";
import * as textEdit from "./text-edit/task.mjs";
import * as experiment from "./experiment/task.mjs";
import * as modeling from "./modeling/task.mjs";
import * as programming from "./programming/task.mjs";
import * as automation from "./automation/task.mjs";

const allTasks = [vision, textEdit, experiment, modeling, programming, automation];

export const tasks = new Map(allTasks.map((task) => [task.id, task]));

export function getTask(id) {
  const task = tasks.get(id);
  if (!task) {
    throw new Error(
      `unknown task "${id}"; available: ${[...tasks.keys()].join(", ")}`,
    );
  }
  return task;
}

