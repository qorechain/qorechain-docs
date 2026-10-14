#!/usr/bin/env node
// check-precompile-status.mjs - compare the "Network status" table in
// docs/developer-guide/evm-precompiles.md with the live active_static_precompiles
// parameter on mainnet and testnet, and fail on any mismatch.
//
// Needs network access, so it is not part of the prebuild step. Run it before
// publishing and after every upgrade that touches the EVM params:
//   node ci/check-precompile-status.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = readFileSync(join(root, "docs/developer-guide/evm-precompiles.md"), "utf8");

const networks = [
  { column: 2, name: "qorechain-vladi", api: "https://api.qore.host" },
  { column: 3, name: "qorechain-diana", api: "https://api-testnet.qore.host" },
];

// Rows look like: | PQC Verify | `0x…0A01` | Not active | Not active |
const section = doc.split("## Network status")[1]?.split("\n## ")[0] ?? "";
const rows = section
  .split("\n")
  .filter((l) => /^\|\s*[^|-]/.test(l) && l.includes("0x…"))
  .map((l) => l.split("|").slice(1, -1).map((c) => c.trim));
if (rows.length === 0) {
  console.error("check-precompile-status: no Network status table found");
  process.exit(1);
}

const suffixOf = (cell) => cell.replace(/[`\s]/g, "").replace("0x…", "").toLowerCase;

let failed = false;
for (const net of networks) {
  const res = await fetch(`${net.api}/cosmos/evm/vm/v1/params`);
  if (!res.ok) {
    console.error(`check-precompile-status: ${net.name}: HTTP ${res.status}`);
    process.exit(1);
  }
  const body = await res.json;
  const active = (body.params?.active_static_precompiles ?? []).map((a) => a.toLowerCase);
  for (const row of rows) {
    const suffix = suffixOf(row[1]);
    const live = active.some((a) => a.endsWith(suffix));
    const documented = !/^not active/i.test(row[net.column]);
    if (live !== documented) {
      failed = true;
      console.error(
        `check-precompile-status: ${net.name} ${row[0]} (${row[1]}): docs say "${row[net.column]}", chain says ${live ? "active" : "not active"}`,
      );
    }
  }
  console.log(`${net.name}: active_static_precompiles = ${JSON.stringify(active)}`);
}
if (failed) process.exit(1);
console.log("check-precompile-status: ok");
