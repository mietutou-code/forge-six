# Security

Forge Six evaluates artifacts in a workspace. It is **not** an operating-system
sandbox.

The harness copies declared fixtures and invokes verifier modules. It does not
provide process isolation, network isolation, resource limits, user separation,
or protection from malicious filesystem operations. A candidate solution should
run in a disposable container or virtual machine with only the workspace mounted
and with external credentials absent.

## Reporting a vulnerability

Please avoid opening a public issue for a vulnerability that could cause code
execution, data loss, or secret exposure. Report it privately to the repository
owner with:

- the affected command and task;
- the smallest reproduction you can provide;
- the expected and observed behavior;
- any suggested mitigation.

Do not attach credentials, private workspace data, or production logs.

## Scope

Useful reports include verifier escape assumptions, path traversal outside a
task workspace, unsafe fixture generation, and audit receipts that misrepresent
filesystem changes. A task producing a normal failed verification is not a
security vulnerability.

