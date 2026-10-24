import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function solve(workspace) {
  const rules = JSON.parse(
    await readFile(path.join(workspace, "rules.json"), "utf8"),
  );
  const inboxPath = path.join(workspace, "inbox");
  const files = (await readdir(inboxPath, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  const moved = [];
  const left = [];

  for (const name of files) {
    const extension = path.extname(name).toLowerCase();
    const rule = rules.find(
      (candidate) => candidate.extension.toLowerCase() === extension,
    );
    if (!rule) {
      left.push(`inbox/${name}`);
      continue;
    }

    const destinationDirectory = path.join(workspace, rule.destination);
    const destination = path.join(destinationDirectory, name);
    await mkdir(destinationDirectory, { recursive: true });
    await rename(path.join(inboxPath, name), destination);
    moved.push({ from: `inbox/${name}`, to: `${rule.destination}/${name}` });
  }

  await writeFile(
    path.join(workspace, "automation-receipt.json"),
    `${JSON.stringify({ moved, left }, null, 2)}\n`,
    "utf8",
  );
}

