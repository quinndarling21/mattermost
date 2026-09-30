import { BASE_BRANCH, COMPONENTS_ROOT } from "./repo.js";

/** One unit of the Enzyme -> React Testing Library migration: one cloud agent, one PR. */
export interface MigrationModule {
  id: string;
  title: string;
  /** Directory relative to the repo root. */
  dir: string;
  /** Enzyme test files (relative to `dir`) this module must convert. */
  testFiles: string[];
  /** Obsolete Enzyme snapshot files (relative to `dir`) to delete. */
  snapshots: string[];
  /** Branch-name hint for the cloud agent. */
  branchHint: string;
}

export const MODULES: MigrationModule[] = [
  {
    id: "menu-items",
    title: "widgets/menu/menu_items",
    dir: `${COMPONENTS_ROOT}/widgets/menu/menu_items`,
    testFiles: [
      "menu_item_external_link.test.tsx",
      "menu_item_toggle_modal_redux.test.tsx",
      "menu_item_action.test.tsx",
    ],
    snapshots: ["__snapshots__/menu_item_toggle_modal_redux.test.tsx.snap"],
    branchHint: "migration-factory/rtl-menu-items",
  },
  {
    id: "thread-list",
    title: "global threads list (threading/global_threads/thread_list)",
    dir: `${COMPONENTS_ROOT}/threading/global_threads/thread_list`,
    testFiles: [
      "thread_list.test.tsx",
      "virtualized_thread_list.test.tsx",
      "virtualized_thread_list_row.test.tsx",
    ],
    snapshots: [
      "__snapshots__/thread_list.test.tsx.snap",
      "__snapshots__/virtualized_thread_list.test.tsx.snap",
      "__snapshots__/virtualized_thread_list_row.test.tsx.snap",
    ],
    branchHint: "migration-factory/rtl-thread-list",
  },
  {
    id: "markdown-image-expand",
    title: "markdown_image_expand",
    dir: `${COMPONENTS_ROOT}/markdown_image_expand`,
    testFiles: ["markdown_image_expand.test.tsx"],
    snapshots: ["__snapshots__/markdown_image_expand.test.tsx.snap"],
    branchHint: "migration-factory/rtl-markdown-image-expand",
  },
];

export function findModule(id: string): MigrationModule | undefined {
  return MODULES.find((m) => m.id === id);
}

/** The self-contained brief each module's cloud agent receives. */
export function migrationBrief(m: MigrationModule): string {
  const jestPath = m.dir.replace(/^webapp\/channels\//, "");
  const files = m.testFiles.map((f) => `- \`${m.dir}/${f}\``).join("\n");
  const snaps = m.snapshots.map((f) => `- \`${m.dir}/${f}\``).join("\n");
  return `You are one worker in the Enzyme -> React Testing Library migration factory (a BDK bot). Your module: **${m.title}**.

## Goal
Migrate exactly these Enzyme tests (they use \`shallow\`/\`mount\` from \`enzyme\`) to React Testing Library, on a new branch from \`${BASE_BRANCH}\`, and open ONE pull request against \`${BASE_BRANCH}\`:
${files}

Delete these obsolete Enzyme snapshot files (they only belong to the tests above):
${snaps}

Do not touch any other test or source file. Do not migrate other modules.

## Rules (from \`webapp/STYLE_GUIDE.md\`, Testing section; read it first)
- Import test helpers from \`tests/react_testing_utils\` (e.g. \`renderWithContext\`, \`screen\`, \`userEvent\`), never directly from \`@testing-library/*\`. Use \`renderWithContext\` when the component needs Redux, i18n, or router context.
- Query by role first, then text/label/alt/title; \`getByTestId\` only as a last resort.
- Simulate interactions with \`userEvent\` and always \`await\` it. Use \`fireEvent\` only for the exceptions the style guide lists.
- Assert visible behavior (\`toBeVisible\`, \`toHaveAttribute\`, \`toHaveClass\`, calls to callbacks) instead of implementation details. Every behavior the old snapshots covered must be asserted explicitly.
- **No new snapshots**: no \`toMatchSnapshot\` or \`toMatchInlineSnapshot\`.
- **Keep the \`enzyme\` dependency**, its adapter in \`setup_jest.ts\`, and the serializer in \`jest.config.js\`; other modules still use them.
- Keep the Mattermost copyright header on each file.

## Verify before opening the PR
\`\`\`
cd webapp && npm ci   # only if node_modules is missing
cd webapp/channels && TZ=Etc/UTC npx jest ${jestPath}
cd webapp/channels && npx eslint ${m.testFiles.map((f) => `${jestPath}/${f}`).join(" ")}
\`\`\`
All tests in the module must pass and eslint must be clean. Fix anything that fails. Do not run the whole webapp suite.

## Pull request
- Base \`${BASE_BRANCH}\`. Suggested branch: \`${m.branchHint}\` (any \`cursor/\` prefix is fine).
- Title: \`test: migrate ${m.title} tests from Enzyme to React Testing Library\`
- Body: a short summary of what each test now asserts, the exact Jest command you ran with its pass counts, and a line saying this PR was produced by the BDK migration-factory bot (module \`${m.id}\`). Include the standard \`release-note\` block with \`NONE\`.
- Do not modify \`.github/\`, \`package.json\`, or lockfiles.`;
}
