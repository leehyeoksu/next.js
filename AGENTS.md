# Agent Working Guide (AGENTS.md)

## Scope
- Applies to the entire repository rooted at this folder.
- More deeply nested AGENTS.md files override instructions here for their subtrees.

## Priorities
- Follow explicit user requests first; keep changes minimal and focused.
- Fix root causes, not symptoms; avoid unrelated refactors.
- Match existing code style, structure, and naming in touched files.
- Update or add documentation when behavior, interfaces, or setup change.

## Change Policy
- Use small, surgical diffs; avoid file renames/moves unless requested or required.
- Do not add license headers or boilerplate unless asked.
- Avoid noisy reformatting; respect existing formatter configs if present.
- Do not commit or create branches unless explicitly requested.
- Avoid leaving commented-out code; use clear TODO markers sparingly when essential.

## Editing & Tools (Codex CLI)
- Use `apply_patch` for all file changes; group related edits in one patch when practical.
- Read files in chunks (<=250 lines). Prefer `rg` for searching over `grep`.
- Use the plan tool for multi-step or ambiguous tasks; keep steps short with one in progress.
- Provide brief preambles before running multiple related commands; keep messages concise.
- Share short progress updates during longer work; avoid verbose commentary.

## Validation & Testing
- If tests exist, run the smallest relevant subset first, then broader suites.
- Add tests only where the repo already uses tests in the touched area or when explicitly requested.
- Do not fix failing tests unrelated to the requested change (note them to the user).
- Prefer deterministic tests; avoid network or time-sensitive flakiness.

## Heuristics to Run/Build (Windows-friendly)
- Node.js: if `package.json` exists
  - Run: `npm start` or `npm run dev`
  - Test: `npm test` or `npm run test`
- Python: if `pyproject.toml` or `requirements.txt` exists
  - Run: `python -m <module>` or `python <script>.py`
  - Test: `pytest -q` (if pytest present) or `python -m unittest`
- .NET: if `*.sln` or `*.csproj` exists
  - Build: `dotnet build`
  - Test: `dotnet test`
- Java: if `pom.xml` or `build.gradle[.kts]`
  - Maven Test: `mvn -q -DskipITs test`
  - Gradle Test: `gradlew test`
- Prefer PowerShell-friendly commands; use `./tool` or `pwsh` scripts where applicable.

## Environment & Approvals
- Assume restricted network; prefer local resources and avoid installing new packages unless requested.
- File writes and external processes may require approval; request escalation with a clear 1-sentence justification.
- Avoid destructive actions (e.g., `rm -rf`, `git reset --hard`) unless the user explicitly asks.

## Security & Privacy
- Do not add secrets, tokens, or credentials. Use environment variables if needed and document them.
- Scrub sensitive data from logs and error messages in code and discussion.

## Documentation
- Update `README.md` or in-repo docs when commands, configuration, or behavior changes.
- Provide concise usage notes, assumptions, and limitations with references to file paths.

## Coding Conventions (General)
- Use descriptive names; avoid one-letter variables except in tight scopes (e.g., indices).
- Keep functions small, pure where practical, and unit-testable.
- Validate inputs and handle errors explicitly; avoid silent failures.
- Prefer existing utilities and patterns already used in the codebase.

## Performance & Reliability
- Optimize only when justified by known hot paths or regressions.
- Add bounds checks and timeouts around IO where appropriate.
- Log at appropriate levels; avoid excessive debug logging by default.

## Review Checklist (before handing off)
- Code compiles/builds where applicable.
- Tests for touched areas pass locally (if present).
- Public interfaces and behaviors match the request; edge cases considered.
- Docs updated and commands verified on Windows shell where possible.

## AGENTS.md Precedence
- If another AGENTS.md exists deeper in the tree, it supersedes this one for files in its directory.

