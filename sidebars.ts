import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Minimal Phase 0 sidebar. The full documentation tree is added in a later
// phase as real pages are migrated from GitBook.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    "index",
    {
      type: "category",
      label: "Introduction",
      items: [
        "introduction/what-is-qorechain",
        "introduction/architecture-overview",
        "introduction/key-features",
      ],
    },
  ],
};

export default sidebars;
