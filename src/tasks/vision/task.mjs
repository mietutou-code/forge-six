import path from "node:path";
import { readJson, assert, assertClose } from "../../harness.mjs";

export const id = "vision";
export const capability = "visual recognition";
export const title = "Read a synthetic screen";
export const description = "Inspect a PNG and report geometry and relative order.";
export const fixtures = path.join(import.meta.dirname, "fixtures");

export const prompt = `
# Vision task

Inspect \`scene.png\` directly. Do not read the generator or verifier source.

Write \`answer.json\` with this shape:

\`\`\`json
{
  "red_center": [0, 0],
  "red_pixels": 0,
  "objects_left_to_right": ["color", "color", "color"]
}
\`\`\`

Use integer coordinates rounded to the nearest pixel, count only pixels whose red,
green, and blue channels are \`239, 68, 68\`, and list the three large object colors
from left to right.
`;

export async function verify(workspace) {
  const answer = await readJson(path.join(workspace, "answer.json"));
  assert(Array.isArray(answer.red_center), "red_center must be an array");
  assertClose(answer.red_center[0], 68, 2, "red center x");
  assertClose(answer.red_center[1], 90, 2, "red center y");
  assertClose(answer.red_pixels, 8448, 5, "red pixel count");
  assert(
    JSON.stringify(answer.objects_left_to_right) ===
      JSON.stringify(["red", "green", "blue"]),
    'objects_left_to_right must be ["red", "green", "blue"]',
  );
}

