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
    {
      type: "category",
      label: "Getting Started",
      items: [
        "getting-started/quickstart",
        "getting-started/wallet-setup",
        "getting-started/connecting-to-testnet",
        "getting-started/first-transaction",
      ],
    },
    {
      type: "category",
      label: "User Guide",
      items: [
        "user-guide/token-operations",
        "user-guide/staking-and-delegation",
        "user-guide/governance",
        "user-guide/xqore-staking",
        "user-guide/bridging-assets",
        "user-guide/deploying-rollups",
        "user-guide/gas-abstraction",
      ],
    },
    {
      type: "category",
      label: "Developer Guide",
      items: [
        "developer-guide/building-from-source",
        "developer-guide/evm-development",
        "developer-guide/cosmwasm-development",
        "developer-guide/svm-development",
        "developer-guide/cross-vm-interoperability",
        "developer-guide/evm-precompiles",
        "developer-guide/account-abstraction",
        "developer-guide/running-a-validator",
      ],
    },
    {
      type: "category",
      label: "Architecture",
      items: [
        "architecture/consensus-mechanism",
        "architecture/prism-consensus-engine",
        "architecture/post-quantum-security",
        "architecture/ai-engine",
        "architecture/multilayer-architecture",
        "architecture/tokenomics",
        "architecture/bridge-architecture",
        "architecture/mev-protection-fairblock",
        "architecture/btc-restaking-babylon",
        "architecture/rollup-development-kit",
      ],
    },
  ],
};

export default sidebars;
