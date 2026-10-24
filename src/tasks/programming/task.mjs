import path from "node:path";
import { pathToFileURL } from "node:url";

export const id = "programming";
export const capability = "software engineering";
export const title = "Repair a statistics helper";
export const description = "Fix edge cases in a small module and preserve input immutability.";
export const fixtures = path.join(import.meta.dirname, "fixtures");

export const prompt = `
# Programming task

Fix \`lib/describe.mjs\` without changing its exported API.

Requirements:

- Reject non-arrays and arrays containing non-finite numbers with \`TypeError\`.
- Return \`null\` for an empty array.
- Compute the median correctly for odd and even lengths.
- Compute min and max without reading outside the array.
- Do not mutate the caller's array.

The public verifier will import \`summarize\` and exercise normal and edge inputs.
`;

export async function verify(workspace) {
  const { assert } = await import("../../harness.mjs");
  const moduleUrl = pathToFileURL(path.join(workspace, "lib", "describe.mjs"));
  moduleUrl.searchParams.set("v", Date.now());
  const { summarize } = await import(moduleUrl.href);
  const input = [9, 1, 5, 3];
  const before = [...input];
  const result = summarize(input);

  assert(result.count === 4, "count is incorrect");
  assert(result.min === 1, "min is incorrect");
  assert(result.max === 9, "max is incorrect");
  assert(result.mean === 4.5, "mean is incorrect");
  assert(result.median === 4, "even-length median is incorrect");
  assert(result.medianOdd === 5, "odd-length median is incorrect");
  assert(JSON.stringify(input) === JSON.stringify(before), "input array was mutated");

  let rejectedNaN = false;
  try {
    summarize([1, Number.NaN]);
  } catch (error) {
    rejectedNaN = error instanceof TypeError;
  }
  assert(rejectedNaN, "NaN input must throw TypeError");

  for (const invalid of [null, "123", [1, Number.POSITIVE_INFINITY]]) {
    let rejected = false;
    try {
      summarize(invalid);
    } catch (error) {
      rejected = error instanceof TypeError;
    }
    assert(rejected, `invalid input must throw TypeError: ${String(invalid)}`);
  }
}

