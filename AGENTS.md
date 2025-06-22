# Agent Instructions

2025-06-22 

(Inspired by [Field Notes From Shipping Real Code With Claude - diwank's space](https://diwank.space/field-notes-from-shipping-real-code-with-claude))

## Repository Layout Example

```
D:.
|   .gitignore
|   AGENTS.md
|   CHANGELOG.md
|   README.md
|   
\---docs
    |   index.html
    |   style.css
    |   
    \---<YYYY-MM-DD>-<project-name>
            specification.md
```

Each subfolder under `docs` is a separate project named with its creation date and a descriptive identifier. Every project folder contains a `specification.md` file defining requirements. When complete, update `docs/index.html` to include a new list item linking to that project.

------

DIRECTIVE 1: Maintain AGENTS.md as the single source of truth
 Keep a top-level AGENTS.md file in each repository that defines project context, architecture decisions, code style, patterns to follow or avoid, and “What AI must never do.” Update it with every change in conventions or architecture so the agent always works from an up-to-date constitution for your codebase.

DIRECTIVE 2: Use anchor comments for inline guidance
 Annotate your code with specially formatted comments (`AIDEV-NOTE`, `AIDEV-TODO`, `AIDEV-QUESTION`) wherever complexity, importance, or potential confusion arises. These breadcrumbs guide the agent’s edits and serve as living documentation for both humans and AI; always grep for existing anchors before adding new ones, and never remove them without explicit instruction.

DIRECTIVE 3: Humans write and own all tests; AI must never touch test files
 Treat test files as sacred ground. The agent can suggest test scenarios but must not generate or modify any test code. All tests remain human-written specifications encoding domain knowledge, edge cases, and production concerns.

DIRECTIVE 4: AI must never modify database migration files
 Prevent data loss and schema drift by disallowing any automated edits to migration scripts. Only human engineers with full context of data patterns, deployment timing, and rollback strategies may author or alter migration files.

DIRECTIVE 5: AI must never alter security-critical code
 Lock down authentication, authorization, cryptography, and other security-critical modules. The agent may suggest changes for review but cannot commit or merge edits in these areas without explicit human approval and security team sign-off.

DIRECTIVE 6: AI must never change API contracts without explicit versioning
 Freeze your OpenAPI specs and interface definitions behind versioned boundaries. Any contract change requires a documented version bump, migration plan, and human-authored update in the spec before the agent may implement corresponding code.

DIRECTIVE 7: AI must never commit secrets or configuration
 Enforce environment-variable patterns for all credentials and feature flags. The agent may reference configuration templates but must not inject hard-coded secrets, connection strings, or sensitive values into the codebase.

DIRECTIVE 8: Use fresh AI sessions for distinct tasks
 Start a new agent session for each task or context boundary. Avoid long-running conversations that accumulate irrelevant context and risk cross-pollination between unrelated topics. One task, one session keeps the agent’s mental model clean and focused.

DIRECTIVE 9: Provide context-rich prompts to avoid token starvation
 Frame each request with all relevant details—performance constraints, architecture context, existing patterns, dependency locations—so the agent has complete, concise information. Avoid minimal (“starved”) prompts that lead to wasted iterations and token overuse.

DIRECTIVE 10: Tag AI-assisted commits transparently
 Include AI markers in commit messages (e.g. `[AI]`, `[AI-minor]`, `[AI-review]`) along with a brief note of what was generated versus human-authored. This disclosure aids reviewers, debuggers, and auditors in understanding the provenance of each change.

DIRECTIVE 11: Section large codebases into isolated services or modules
 For monorepos or complex systems, break the code into well-defined services or submodules so the agent can operate on a manageable slice at a time. Use Git worktrees or feature branches to sandbox experiments and cherry-pick validated changes back into main.

DIRECTIVE 12: Humans remain the final architects and reviewers
 Always review, refine, and curate agent output. The agent amplifies your capabilities but has no context beyond what you provide. You direct the vision, validate correctness, and ensure alignment with business logic and quality standards.

DIRECTIVE 13: Enforce modern client-side technologies only
 Implement all projects using only modern browser-native JavaScript, HTML, and CSS without any build steps or bundlers. Use ES modules via `<script type="module">`, CSS imports or variables, and ensure code handles all relevant edge cases in the client environment.

DIRECTIVE 14: Follow the documented project folder workflow
 Each new feature or experiment lives under `docs/<YYYY-MM-DD>-<project-name>/`. Begin by writing `specification.md`, implement to spec in the root, then append a link in `docs/index.html`. Deliver standalone HTML, JS, and CSS files only—no server code or build tools.

DIRECTIVE 15: Maintain CHANGELOG.md for planning and history
 Use a top-level CHANGELOG.md to plan, track, and record every change. Before implementing a specification, append a markdown to-do list item under an `Unreleased` heading describing planned features. After coding, update each to-do’s status to `Done` or `In Progress`. Finally, prepend a new release section with date and summary of implemented features, moving completed items out of `Unreleased`.

DIRECTIVE 16: Keep all documentation up-to-date
 Whenever code or specifications change, update related docs: AGENTS.md, README.md, docs/index.html, and specification.md. Place contextual notes in `AIDEV-TODO` or `AIDEV-QUESTION` anchors before changes. Ensure documentation reflects the current state before merging.

------

## Project Structure Explanation

- **Root files**: `.gitignore`, `AGENTS.md`, `CHANGELOG.md`, `README.md`
- **docs/**: Project index (`index.html`), global styles (`style.css`), and dated project subfolders.
- **docs/*****\**\*-\*\**\**\**\*/**: Contains `specification.md` defining project requirements.
- **CHANGELOG.md**: Tracks planned and released features via markdown headings and to-do lists under `Unreleased` and dated release sections.
- **Workflow**: Create project folder, update `CHANGELOG.md` with to-do, implement spec, update changelog status, then release with a new dated section, and update `docs/index.html` upon completion.
