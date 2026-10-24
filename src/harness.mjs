import {
  cp,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export const projectRoot = path.resolve(import.meta.dirname, "..");

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertClose(actual, expected, tolerance, label) {
  assert(
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, received ${actual}`,
  );
}

export async function ensureEmptyDirectory(directory) {
  if (existsSync(directory)) {
    const details = await stat(directory);
    assert(details.isDirectory(), `${directory} exists and is not a directory`);
    const entries = await readdir(directory);
    assert(entries.length === 0, `${directory} must be empty`);
  } else {
    await mkdir(directory, { recursive: true });
  }
}

export async function stageTask(task, directory) {
  await ensureEmptyDirectory(directory);
  await cp(task.fixtures, directory, { recursive: true });
  await writeFile(path.join(directory, "PROMPT.md"), `${task.prompt.trim()}\n`, "utf8");
}

