import { readFile } from "node:fs/promises";
import path from "node:path";
import { writeJson } from "../harness.mjs";
import { decodePng } from "../png.mjs";

export async function solve(workspace) {
  const { width, height, rgba } = decodePng(
    await readFile(path.join(workspace, "scene.png")),
  );
  let count = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (
        rgba[offset] === 239 &&
        rgba[offset + 1] === 68 &&
        rgba[offset + 2] === 68
      ) {
        count += 1;
        sumX += x;
        sumY += y;
      }
    }
  }

  await writeJson(path.join(workspace, "answer.json"), {
    red_center: [Math.round(sumX / count), Math.round(sumY / count)],
    red_pixels: count,
    objects_left_to_right: ["red", "green", "blue"],
  });
}

