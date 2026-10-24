# Relay Service Guide

> Status: relesed and supported.

## Connection

Relay uses the `http` protocol and has **5 attempts** retry limit. Each request
times out after **5000 ms**. See the configuration example below:

```bash
relay send --retries 5
```

## Audit log

This line must remain unchanged: `audit=local-only`.

