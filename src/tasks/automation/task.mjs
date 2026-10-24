import path from "node:path";
import { assert, readJson } from "../../harness.mjs";

export const id = "automation";
export const capability = "computer automation";
export const title = "Triage a desktop inbox";
export const description = "Apply declarative file rules and produce an auditable receipt.";
export const fixtures = path.join(import.meta.dirname, "fixtures");

export const prompt = `
# Automation task

Apply every rule in \`rules.json\` to \`inbox/\`. Rules are case-insensitive and
match the file extension. Move matching files into the named destination folder
at the workspace root, creating destinations as needed. Leave unmatched files in
\`inbox/\`.

Write \`automation-receipt.json\`:

\`\`\`json
{
  "moved": [{ "from": "inbox/example.pdf", "to": "Finance/example.pdf" }],
  "left": ["inbox/example.txt"]
}
\`\`\`

Sort both arrays by path. The task must be idempotent: running it again should
not duplicate or lose files.
`;

export async function verify(workspace) {
  const { readFile, readdir } = await import("node:fs/promises");
  const receipt = await readJson(path.join(workspace, "automation-receipt.json"));
  assert(Array.isArray(receipt.moved), "moved must be an array");
  assert(Array.isArray(receipt.left), "left must be an array");
  assert(receipt.moved.length === 3, "expected exactly three moved files");
  assert(
    JSON.stringify(receipt.left) === JSON.stringify(["inbox/README.md", "inbox/notes.txt"]),
    "unmatched files are incorrect",
  );

  const destinations = {
    "Finance/Q1-INVOICE.PDF": "invoice-v1",
    "Photos/photo.JPG": "holiday",
    "Archives/archive.zip": "backup",
  };
  for (const [relativePath, content] of Object.entries(destinations)) {
    assert(
      (await readFile(path.join(workspace, relativePath), "utf8")).trim() === content,
      `${relativePath} is missing or has the wrong content`,
    );
  }

  const inbox = await readdir(path.join(workspace, "inbox"));
  assert(
    JSON.stringify(inbox.sort()) === JSON.stringify(["README.md", "notes.txt"]),
    "inbox still contains moved files or lost unmatched files",
  );
}

