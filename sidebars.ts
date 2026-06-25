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
        "getting-started/connecting-to-mainnet",
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
        "developer-guide/running-a-node",
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
        "architecture/amm",
        "architecture/chain-licensing",
        "architecture/mev-protection-fairblock",
        "architecture/btc-restaking-babylon",
        "architecture/rollup-development-kit",
      ],
    },
    {
      type: "category",
      label: "Rollups",
      items: [
        "rollups/overview",
        "rollups/preset-profiles",
        "rollups/deploying-a-rollup",
        "rollups/data-availability",
        "rollups/zk-stark-withdrawals",
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        "api-reference/rest-grpc-endpoints",
        "api-reference/json-rpc-qor_-namespace",
        "api-reference/json-rpc-eth_-namespace",
        "api-reference/json-rpc-solana-compatible",
        "api-reference/websocket-events",
      ],
    },
    {
      type: "category",
      label: "CLI Reference",
      items: [
        "cli-reference/node-commands",
        "cli-reference/transaction-commands",
        "cli-reference/query-commands",
      ],
    },
    {
      type: "category",
      label: "Appendix",
      items: [
        "appendix/glossary",
        "appendix/chain-parameters",
        "appendix/version-history",
      ],
    },
  ],
};

export default sidebars;
