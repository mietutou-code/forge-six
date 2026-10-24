import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { encodePng } from "../src/png.mjs";

const width = 320;
const height = 180;
const pixels = Buffer.alloc(width * height * 4);

function rectangle(x, y, w, h, color) {
  for (let row = y; row < y + h; row += 1) {
    for (let column = x; column < x + w; column += 1) {
      const offset = (row * width + column) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = 255;
    }
  }
}

for (let i = 0; i < width * height; i += 1) {
  pixels[i * 4] = 15;
  pixels[i * 4 + 1] = 23;
  pixels[i * 4 + 2] = 42;
  pixels[i * 4 + 3] = 255;
}

rectangle(24, 42, 88, 96, [239, 68, 68]);
rectangle(120, 42, 64, 96, [34, 197, 94]);
rectangle(208, 42, 88, 96, [59, 130, 246]);

const outputDirectory = path.resolve(import.meta.dirname, "../src/tasks/vision/fixtures");
await mkdir(outputDirectory, { recursive: true });
const outputPath = path.join(outputDirectory, "scene.png");
await writeFile(outputPath, encodePng(width, height, pixels));
console.log(`Wrote ${outputPath}`);

