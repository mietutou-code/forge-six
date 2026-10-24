import test from "node:test";
import { assert } from "../src/harness.mjs";
import { decodePng, encodePng } from "../src/png.mjs";

test("PNG encoder and decoder round-trip RGBA pixels", () => {
  const width = 7;
  const height = 5;
  const rgba = Buffer.alloc(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    rgba[index * 4] = (index * 17) & 0xff;
    rgba[index * 4 + 1] = (index * 29) & 0xff;
    rgba[index * 4 + 2] = (index * 43) & 0xff;
    rgba[index * 4 + 3] = 255;
  }

  const decoded = decodePng(encodePng(width, height, rgba));
  assert(decoded.width === width, "decoded width mismatch");
  assert(decoded.height === height, "decoded height mismatch");
  assert(decoded.rgba.equals(rgba), "decoded pixels mismatch");
});

