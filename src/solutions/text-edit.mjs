import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function solve(workspace) {
  const filePath = path.join(workspace, "guide.md");
  let guide = await readFile(filePath, "utf8");
  guide = guide
    .replace("> Status: relesed and supported.", "> Status: released and supported.")
    .replace("## Connection\n", "## Connection & retry policy\n")
    .replace("the `http` protocol", "the `https` protocol")
    .replace("**5 attempts**", "**3 attempts**")
    .replace("**5000 ms**", "**2500 ms**");
  await writeFile(filePath, guide, "utf8");
}

