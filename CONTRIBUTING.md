# Contributing

Thanks for improving Forge Six. Contributions should make a capability task more
realistic, deterministic, or diagnosable.

## Development

Node.js 20 or newer is required.

```bash
node --test
node bin/forge-six.mjs demo
```

Both commands must pass before a change is ready. Do not add dependencies unless
the capability cannot be evaluated correctly with the Node standard library.

## Adding or changing a task

A task should represent one capability and one bounded outcome. Keep the prompt
specific enough that a competent agent knows what artifact to produce, while
leaving implementation choices open.

The verifier should:

- check behavior, preservation, and edge cases;
- use tolerances for numerical work rather than exact floating-point equality;
- report expected and actual values for actionable failures;
- avoid tests that merely match wording or implementation syntax;
- avoid network, unseeded randomness, and machine-specific paths.

The fixtures should:

- be small enough to inspect manually;
- contain both matching and non-matching cases where relevant;
- avoid secrets, personal data, and third-party copyrighted material;
- be reproducible from source when generated.

Register a new task in `src/tasks/index.mjs`, add a reference solution in
`src/solutions/`, and ensure the catalog test counts it.

## Pull requests

Describe the capability being measured, why the current suite cannot measure it,
and the observable acceptance criteria. Include the exact verification commands
you ran. Keep unrelated refactors out of task changes.

