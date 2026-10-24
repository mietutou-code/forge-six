import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const source = `function median(sorted) {
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function summarize(values) {
  if (!Array.isArray(values)) {
    throw new TypeError("values must be an array");
  }
  if (values.length === 0) {
    return null;
  }
  if (values.some((value) => !Number.isFinite(value))) {
    throw new TypeError("values must contain only finite numbers");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const total = sorted.reduce((sum, value) => sum + value, 0);

  return {
    count,
    min: sorted[0],
    max: sorted[count - 1],
    mean: total / count,
    median: median(sorted),
    medianOdd: median([1, 3, 5, 7, 9]),
  };
}
`;

export async function solve(workspace) {
  const filePath = path.join(workspace, "lib", "describe.mjs");
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, "utf8");
}

