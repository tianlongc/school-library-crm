# Frontend UI Rules

These rules apply to the React/Inertia frontend, its styles and build configuration, and the project-level product and visual design records.

## Current frontend contract

- The frontend uses React 19, Inertia React 2, Ant Design 6.6.1, Tailwind CSS 3, and Vite.
- `resources/js/app.jsx` owns the single root Ant Design `ConfigProvider` and `App` feedback context. Reuse that provider instead of adding page-level theme providers or static feedback APIs that bypass context.
- The existing visual identity is the teal-and-ink library system: `#0f766e` primary, `#14242e` ink, Figtree/system typography, six-pixel control radius, and Ant Design CSS variables.
- Ant Design owns controls, forms, feedback, tables, menus, overlays, and interaction states. Tailwind owns page composition, responsive layout, spacing utilities, and surface arrangement.
- Treat routes, Inertia navigation, props, request payloads, authorization, validation mapping, loading, empty, error, pagination, sorting, filtering, and destructive confirmation as behavior contracts. A visual refinement must not redesign backend behavior or invent data.
- Preserve unrelated dirty-worktree changes. Do not stage, commit, or modify files outside the approved UI slice.

## Ant Design implementation workflow

Before writing or changing Ant Design component code:

1. Confirm the installed version from `package-lock.json` or `node_modules`.
2. Query the exact component API before relying on memory:
   `antd info <Component> --version 6.6.1 --format json`.
3. Use `antd demo`, `antd token`, and `antd semantic` for a working baseline, token names, and supported semantic styling hooks.
4. Use `antd doc <Component> --format json` when the component contract or edge cases need the full documentation.

After changing Ant Design code, run `antd lint <changed-path> --format json`. If the global CLI is unavailable, use an ephemeral project-safe invocation such as `npx.cmd --yes --package=@ant-design/cli antd lint <changed-path> --format json`; do not add a dependency or silently target a different Ant Design major version.

Prefer, in order:

- `ConfigProvider` seed and alias tokens;
- component tokens under `theme.components`;
- documented `classNames` and `styles` hooks;
- narrow, semantic project classes.

Do not introduce new dependencies on undocumented props, internal DOM structure, or broad `.ant-*` selectors. Existing selectors may remain until an approved refactor; new work must use supported tokens and semantic hooks. Do not hard-code a second global theme or duplicate the root provider.

Ant Design's upstream `DESIGN.md` is a reference for the library's default design language. `https://ant.design/llms-full.txt` is an on-demand documentation source, not permanent project context. Prefer component-specific docs or CLI queries to loading the entire aggregate file.

## Impeccable workflow

Use the project-local Impeccable skill for frontend design work:

1. Run `impeccable context` once per session from the repository root.
2. Finish and verify the target surface's behavior before recording visual guidance.
3. Run `impeccable init` to capture durable product truth in `PRODUCT.md`.
4. Run `impeccable document` to extract the incumbent visual system into the project `DESIGN.md`.
5. Use a scoped `critique` and `audit` before edits; choose `polish`, `harden`, or `adapt` for the approved refinement slice.
6. Read Impeccable's `craft-floor.md` immediately before any UI edit.
7. Build the target, inspect desktop and mobile together, correct the findings in one bounded pass, and perform at most one confirmation pass.

Do not create placeholder `PRODUCT.md` or `DESIGN.md` files, replace the incumbent visual world, or run a broad redesign when the request is a scoped refinement. Product truth and the project's design record must describe real implemented behavior and tokens.

## UI quality and accessibility gates

Every UI change must account for:

- keyboard navigation, visible focus, semantic labels, and accessible names;
- readable contrast, disabled and destructive states, and status text that is not color-only;
- loading, empty, validation, request failure, permission, success, and deletion states;
- long names, long post bodies, missing optional data, narrow widths, overflow, and touch targets;
- desktop and mobile layout behavior, including sticky or fixed navigation and overlays;
- realistic data ranges rather than fabricated metrics, placeholders, or claims.

The standard verification set is the smallest relevant focused Pest suite, `npm run build`, Ant Design lint for changed paths, `git diff --check`, and authenticated browser checks for the affected surface. Command-line checks do not replace browser interaction evidence.
