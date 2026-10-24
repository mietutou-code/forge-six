# Forge Six

**A deterministic six-mode capability gym for coding agents.**

Forge Six gives an agent six small, isolated jobs that verify more than "the code
ran": inspect an image, edit protected prose, run an experiment, model a dynamic
system, repair a module, and automate a filesystem workflow. Every task has a
machine-readable contract, a reference solution, and a verifier with useful
failure messages.

The project has no runtime dependencies. Node.js 20 or newer is the only
requirement.

## Why this exists

Agent capability claims are often tested with one giant, opaque prompt. Forge Six
uses a different unit of evaluation: a small workspace, a bounded change, and a
deterministic check. The result is easy to run locally, easy to inspect in CI,
and hard to pass by accident.

| Mode | Skill under test | Verified behavior |
| --- | --- | --- |
| `vision` | Visual recognition | Locate an exact color and report object order from a PNG |
| `text-edit` | Text editing | Reconcile prose with data and preserve protected sections |
| `experiment` | Program experimentation | Parse observations and fit an unregularized quadratic model |
| `modeling` | Simulation modeling | Integrate an SIR system and report peak and final populations |
| `programming` | Software engineering | Repair edge cases while preserving API and input immutability |
| `automation` | Computer automation | Apply file rules and emit a sorted audit receipt |

![The vision fixture](src/tasks/vision/fixtures/scene.png)

## Quick start

```bash
git clone <your-fork-url>
cd forge-six

node bin/forge-six.mjs list
node bin/forge-six.mjs init vision
node bin/forge-six.mjs verify vision

node --test
node bin/forge-six.mjs demo
```

`demo` stages every fixture into a fresh workspace, runs the reference solution,
verifies it, and writes a machine-readable report under `.forge-six/runs/`.

Example:

```text
PASS  vision          21ms  visual recognition
PASS  text-edit       11ms  text editing
PASS  experiment       9ms  program experimentation
PASS  modeling         9ms  simulation modeling
PASS  programming     10ms  software engineering
PASS  automation      20ms  computer automation
```

## Commands

```text
forge-six list [--json]
forge-six init <task> [--out <directory>]
forge-six verify <task> [--dir <directory>]
forge-six demo [--json]
```

`init` refuses to stage into a non-empty directory. `verify` reads artifacts from
the selected workspace and exits non-zero on failure.

## Task layout

Each task lives in `src/tasks/<id>/` and exposes:

- a fixture directory copied into the isolated workspace;
- a task-specific prompt;
- a verifier that checks observable outcomes rather than implementation shape.

For example:

```text
src/tasks/experiment/
├── fixtures/
│   └── measurements.csv
└── task.mjs
```

Reference solutions are intentionally separate under `src/solutions/`. They prove
that every verifier is reachable, not that a single implementation is required.

## Design principles

- **Bounded workspaces.** A task starts with only its declared fixtures.
- **Deterministic checks.** No network, clock-sensitive expectations, or hidden
  randomness belongs in a verifier.
- **Behavior over prose.** Checks target results, preserved content, edge cases,
  and audit artifacts.
- **Useful failures.** Verification reports the expected value, tolerance, and
  received value where possible.
- **Transparent reference solutions.** The demo is a smoke test, not a security
  boundary.

## Add a task

1. Create `src/tasks/<id>/task.mjs` with `id`, `capability`, `title`,
   `description`, `fixtures`, `prompt`, and `verify`.
2. Keep fixtures small and reproducible.
3. Add a reference solution and register both in the task and solution indexes.
4. Update the catalog test and documentation.
5. Run `node --test` and `node bin/forge-six.mjs demo`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full checklist.

## Safety boundary

Forge Six is a harness, not a sandbox. It copies fixtures and checks outputs; it
does not isolate hostile processes, restrict network access, or enforce operating
system permissions. Run untrusted candidate solutions in a disposable container
or VM. See [SECURITY.md](SECURITY.md).

## 中文简介

Forge Six 是一个面向编程智能体的六维能力训练场：视觉识别、文本编辑、程序实验、建模、
编程修复和电脑自动化。它没有第三方运行依赖，每个任务都在独立目录中生成，并由确定性
验证器检查真实结果。项目适合在本地或 CI 中作为小步、可解释的能力回归套件，但本身不是
安全沙箱。

## License

[MIT](LICENSE)

