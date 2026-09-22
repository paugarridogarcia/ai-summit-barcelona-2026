# Conventions for this repository

Read this before you change anything. These are enforced in review.

## Rules

1. Every handler validates its input before touching the store, and returns 400 with a typed error when validation fails.
2. No secrets, keys, tokens or credentials in source. Read them from the environment.
3. Errors return a typed result. Never throw a bare string, never swallow an error silently.
4. Every new endpoint gets a test next to the code it tests.
5. No new runtime dependencies. This service runs on Node alone and stays that way.

## Style

- ES modules, not CommonJS.
- Named exports.
- Match the file you are editing. Do not reformat code you did not change.

## When you are unsure

Say so and ask, rather than guessing and moving on. A question costs a minute. A wrong assumption in a handler costs an incident.
