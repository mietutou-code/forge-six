#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assert, projectRoot, stageTask } from "../src/harness.mjs";
import { solutions } from "../src/solutions/index.mjs";
import { getTask, tasks } from "../src/tasks/index.mjs";

function usage() {
  console.log(`Forge Six

Usage:
  forge-six list [--json]
  forge-six init <task> [--out <directory>]
  forge-six verify <task> [--dir <directory>]
  forge-six demo [--json]

Tasks:
${[...tasks.values()].map((task) => `  ${task.id.padEnd(13)} ${task.title}`).join("\n")}
`);
}

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

async function list(args) {
  const entries = [...tasks.values()].map((task) => ({
    id: task.id,
    capability: task.capability,
    title: task.title,
    description: task.description,
  }));
  if (args.includes("--json")) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  for (const task of entries) {
    console.log(`${task.id.padEnd(13)} ${task.capability.padEnd(24)} ${task.title}`);
  }
}

async function init(args) {
  const [id] = args;
  assert(id, "init requires a task id");
  const task = getTask(id);
  const output = path.resolve(option(args, "--out", `.forge-six/workspaces/${id}`));
  await stageTask(task, output);
  console.log(`Workspace: ${output}`);
  console.log(`Prompt:    ${path.join(output, "PROMPT.md")}`);
}

async function verify(args) {
  const [id] = args;
  assert(id, "verify requires a task id");
  const task = getTask(id);
  const directory = path.resolve(option(args, "--dir", `.forge-six/workspaces/${id}`));
  await task.verify(directory);
  console.log(`PASS ${task.id}: ${task.title}`);
}

async function demo(args) {
  const stamp = new Date().toISOString().replaceAll(":", "-").replace(/\.\d+Z$/, "Z");
  const runRoot = path.join(projectRoot, ".forge-six", "runs", stamp);
  const results = [];

  await mkdir(runRoot, { recursive: true });
  for (const task of tasks.values()) {
    const workspace = path.join(runRoot, task.id);
    const started = performance.now();
    try {
      await stageTask(task, workspace);
      const solve = solutions.get(task.id);
      assert(solve, `no reference solution registered for ${task.id}`);
      await solve(workspace);
      await task.verify(workspace);
      results.push({
        id: task.id,
        capability: task.capability,
        status: "pass",
        duration_ms: Math.round(performance.now() - started),
        workspace,
      });
    } catch (error) {
      results.push({
        id: task.id,
        capability: task.capability,
        status: "fail",
        duration_ms: Math.round(performance.now() - started),
        error: error.message,
        workspace,
      });
      process.exitCode = 1;
    }
  }

  await writeFile(
    path.join(runRoot, "results.json"),
    `${JSON.stringify(results, null, 2)}\n`,
    "utf8",
  );

  if (args.includes("--json")) {
    console.log(JSON.stringify({ run: runRoot, results }, null, 2));
    return;
  }

  for (const result of results) {
    const duration = `${result.duration_ms}ms`.padStart(6);
    console.log(
      `${result.status === "pass" ? "PASS" : "FAIL"}  ${result.id.padEnd(13)} ${duration}  ${result.capability}${result.error ? `\n      ${result.error}` : ""}`,
    );
  }
  console.log(`\nArtifacts: ${runRoot}`);
}

const [command, ...args] = process.argv.slice(2);

try {
  if (command === "list") await list(args);
  else if (command === "init") await init(args);
  else if (command === "verify") await verify(args);
  else if (command === "demo") await demo(args);
  else {
    usage();
    if (command && command !== "help" && command !== "--help") {
      process.exitCode = 1;
    }
  }
} catch (error) {
  console.error(`ERROR ${error.message}`);
  process.exitCode = 1;
}

