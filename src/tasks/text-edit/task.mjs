import path from "node:path";

export const id = "text-edit";
export const capability = "text editing";
export const title = "Repair a product guide";
export const description = "Reconcile prose with source configuration while preserving protected content.";
export const fixtures = path.join(import.meta.dirname, "fixtures");

export const prompt = `
# Text editing task

Update \`guide.md\` using \`config.json\` as the source of truth:

1. Change the protocol to the configured value.
2. Change the retry limit to the configured number of attempts.
3. Change the timeout to the configured number of milliseconds.
4. Rename \`## Connection\` to \`## Connection & retry policy\`.
5. Correct the status typo \`relesed\` to \`released\`.

Preserve the fenced example and the complete \`## Audit log\` section exactly. Make
only the edits required by these instructions.
`;

export async function verify(workspace) {
  const { readFile } = await import("node:fs/promises");
  const { assert } = await import("../../harness.mjs");
  const guide = await readFile(path.join(workspace, "guide.md"), "utf8");

  assert(guide.includes("## Connection & retry policy"), "section title is incorrect");
  assert(guide.includes("uses the `https` protocol"), "protocol was not updated");
  assert(guide.includes("**3 attempts**"), "retry limit was not updated");
  assert(guide.includes("**2500 ms**"), "timeout was not updated");
  assert(
    guide.includes("```bash\nrelay send --retries 5\n```"),
    "fenced example was modified",
  );
  const auditSection = guide.slice(guide.indexOf("## Audit log"));
  assert(
    auditSection ===
      "## Audit log\n\nThis line must remain unchanged: `audit=local-only`.\n\n",
    "audit log section was modified",
  );
  assert(!guide.includes("relesed"), "status typo was left unchanged");
}

