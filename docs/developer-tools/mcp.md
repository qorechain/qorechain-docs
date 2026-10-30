---
slug: /developer-tools/mcp
title: QoreChain MCP Server
sidebar_label: MCP Server
sidebar_position: 23
---

# QoreChain MCP server (`@qorechain/mcp`)

The QoreChain MCP server gives AI agents and developer tools read access to QoreChain through the [Model Context Protocol](https://modelcontextprotocol.io): blocks, transactions, accounts, validators, staking tiers, the status of the hybrid secp256k1 plus ML-DSA-87 (FIPS 204) signature, EVM contract reads, simulation and fee estimates, and unsigned transfers that the account owner signs in their own wallet. It is for developers who connect an MCP-capable client or agent to QoreChain, and for teams who want a scriptable, read-only view of the chain with stable output.

The server never signs, never holds keys and never broadcasts a transaction. It runs on your machine over stdio, or as a Streamable HTTP server that you host or that QoreChain hosts. Version **0.1.0**, published on 27 October 2026, Apache-2.0. A command-line twin, [`qore`](/developer-tools/qore-cli), runs the same tools from a terminal.

## Innovations {#innovations}

- **Hybrid signature check, not just a label.** `get_pq_status` takes a transaction hash, confirms that the body carries exactly one `/qorechain.pqc.v1.PQCHybridSignature` layer, and verifies that ML-DSA-87 layer locally with [QoreSign](/qoresign/overview) against the key the signer has registered on chain, trying sign-bytes v1 and v2. The answer is `verified: true` or `false` with the reason, not a guess from the transaction type.
- **Unsigned transfers that carry the real fee.** `prepare_transfer` reads the sender's account number, sequence and public key, simulates the transfer with a placeholder ML-DSA-87 layer of the right size so the gas includes the layer the wallet adds when signing, and returns the SignDoc, a readable summary and checks. The only thing missing is the owner's signature.
- **Simulation with decoded refusals.** `simulate_tx` and `estimate_fee` return gas used, a suggested gas limit, the balance change per address and, when the network would reject the transaction, a decoded refusal instead of a raw error string.
- **One schema for the server and the CLI.** Every `qore` command runs one MCP tool, and `qore --json` prints exactly the JSON that the tool returns. The Python package serves the same tool names, input and output schemas and error codes; both are tested against the same recorded chain answers.
- **Secrets are refused before anything leaves the machine.** Input that looks like a recovery phrase (12 or more consecutive BIP-39 words) or a bare 32-byte private key is rejected with `INVALID_INPUT` before any request is made, and the error tells the user to treat that secret as exposed.
- **Responses built field by field.** Every output is assembled from named fields of the chain's answer. Upstream error bodies and stack traces never reach the client; failures map to seven stable error codes.

## What it is used for {#use-cases}

1. **Asking a coding assistant about chain state.** A developer adds the server to an MCP-compatible editor and asks "what is the latest block on mainnet?" or "show the balances of qor1... on testnet". `get_block` and `get_address_info` answer from the public endpoints, with explorer links.
2. **Checking that a transaction carried the hybrid signature.** A wallet or SDK developer has just broadcast a transaction and wants to confirm that it carries exactly one ML-DSA-87 layer and that the layer verifies against the registered key. `get_pq_status` (or `qore pq status <hash>`) reports the signature tier and the local verification result.
3. **Preparing a transfer for a user to sign.** An assistant built on QoreChain needs to help a user send QOR without touching keys. `prepare_transfer` returns an unsigned SignDoc with a readable summary, checks and warnings (including one for mainnet), and `estimate_fee` gives the fee. The user signs in their own wallet.
4. **Debugging a refused transaction.** A backend team has an encoded transaction that the network rejects. `simulate_tx` returns the gas, the balance changes per address and a decoded refusal, and broadcasts nothing.
5. **Reading contracts from a script or a CI job.** A dApp team checks a token balance or a contract view with `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json` and parses the JSON with `jq`.
6. **Validator and staking dashboards.** An analyst lists bonded validators with their voting power share and commission (`get_validators`) and reads the staking tier parameters and one holder's locks (`get_staking_tiers`).
7. **Running a team endpoint.** A company runs `qorechain-mcp serve` behind its own reverse proxy, with API keys and rate limits, so several internal tools share one MCP endpoint that points at its own nodes.

## How it works {#how-it-works}

* The server is a thin, stateless reader over the public QoreChain endpoints (REST, consensus RPC and EVM JSON-RPC). Each upstream call is one request with a 10 second timeout, a 4 MiB response limit and no retries.
* Responses are built field by field from the chain's answer. Upstream error bodies, stack traces and library messages never reach the client; an unexpected failure becomes `INTERNAL_ERROR`. Errors come back as a tool result with `isError: true` and a JSON body.
* Hybrid signature checks run locally with [QoreSign](/qoresign/overview): the server fetches the transaction and the signer's registered ML-DSA-87 key, rebuilds the sign-bytes (v1 or v2) and verifies.
* Simulation: on a chain at v3.2.5 or later the simulation already includes the ML-DSA-87 verification cost (`exact_gas_simulation: true` in `get_chain_info`), so the suggested gas limit is exact; on an older chain a margin is added. When a body has no ML-DSA-87 layer, `simulate_tx` adds a placeholder layer of the right size (never broadcast) so the gas matches the transaction the wallet will sign (`assume_pqc_layer`, default true). The server detects the chain's version by itself.
* The EVM precompiles `0x...0A01` (ML-DSA-87 verify) and `0x...0A02` (key status) are active on testnet only; on mainnet a call to them returns empty data.
* Machine-readable tool schemas are in the repository as `spec/tools.json`, generated from the server's own `tools/list` answer. The human-readable reference is `docs/tools.md`.

## How to use {#how-to-use}

You need Node.js 20 or later for the npm package, or Python 3.10 or later for the Python package.

### Run it locally with npx {#run-npx}

Check that the server starts, then add it to your MCP client. Most clients that start local servers read a JSON file with an `mcpServers` object (the file name and the key names for HTTP servers differ per client; see your client's documentation):

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

Restart the client. It lists 14 tools. The server speaks stdio to the client. Then ask, for example:

- "What is the latest block on QoreChain mainnet?" (`get_block`)
- "Does testnet transaction F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 carry a valid ML-DSA-87 layer?" (`get_pq_status`)
- "Prepare a 1.5 QOR testnet transfer from my address to qor1... and estimate the fee." (`prepare_transfer`, `estimate_fee`)

### Run it locally with pip or uvx {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

The Python package serves stdio only. For Streamable HTTP, API keys and rate limits use the npm package (below). The package also has a library entry point, `run_tool`.

### Run it as an HTTP server {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

The HTTP transport is stateless and answers with JSON: `POST /mcp` for MCP requests, `GET /healthz` for `{"status":"ok"}`. Options:

| Option | Default | Meaning |
|---|---|---|
| `--port` | 8787 | TCP port |
| `--host` | 127.0.0.1 | bind address; `0.0.0.0` listens on every interface |
| `--api-keys-file` | none | file of SHA-256 hashes of accepted keys; when set, requests need `Authorization: Bearer <key>` |
| `--rate-limit` | 60 | requests per minute per API key and per client IP; `0` turns it off |
| `--allowed-origin` | none | browser origin allowed to call the endpoint (repeatable); other origins get HTTP 403 |
| `--trust-proxy` | off | take the client IP from `X-Forwarded-For`; only behind a proxy you control |
| `--network` | testnet | network for calls that name none |

To protect your own endpoint, make a key, store only its hash, and give the key to the client:

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` has one 64-hex hash per line (an optional `sha256:` prefix is accepted, `#` starts a comment). A missing or unknown key gets HTTP 401 with an error message that starts with `UNAUTHORIZED`; over the rate limit the server answers HTTP 429 with `Retry-After`. Put TLS in front of any server that is reachable from outside your machine.

The package also exports `createServer`, `createHttpHandler` and `startNodeServer` for embedding in your own runtime. Full details: [self-hosting](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) in the source repository.

### Configuration {#configuration}

| Setting | How | Effect |
|---|---|---|
| Network per call | the `network` argument on any tool: `testnet` or `mainnet` | Chooses the chain for that call |
| Default network | `--network testnet` or `--network mainnet` on the server command | The network used when a call names none. Default `testnet` |
| HTTP port, host, keys, limits | `serve` options above | HTTP mode only |
| Upstream timeout | fixed at 10 seconds per request, 4 MiB response limit, no retries | Slow endpoints give `UPSTREAM_UNAVAILABLE` |

Mainnet is `qorechain-vladi` (EVM chain ID 9801) and testnet is `qorechain-diana` (EVM chain ID 9800). A transfer prepared for mainnet carries an extra warning. There are no environment variables for the network: it is the command-line flag or the per-call argument. To make mainnet the default for a client:

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Tools {#tools}

All 14 tools are read-only and take an optional `network`. Their inputs and outputs are generated from the server's own schemas; the [tools reference](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) lists every field.

| Tool | What it returns |
|---|---|
| `get_chain_info` | chain IDs, latest block, minimum gas price, sign-bytes version, protocol feature switches, a pending upgrade if one is scheduled, active EVM precompiles |
| `get_block` | one block (or the latest): hash, time, proposer, transaction count and up to 100 transaction hashes |
| `get_transaction` | a transaction by native hash or EVM hash (`0x` prefix): status, fee, memo, gas, up to 50 messages, signers and the signature tier (`pqc`, `enrollment`, `shake` or `classical`) |
| `get_address_info` | both address forms (`qor1...` and `0x...`), account state, up to 100 balances, staked amount, whether an ML-DSA-87 key is registered, whether bytecode is deployed |
| `get_pq_status` | for an address: registered key, algorithm, proof of possession, EVM authorization window. For a transaction: whether it has exactly one hybrid layer and whether it verifies |
| `get_validators` | validators by stake (default bonded, at most 50, limit up to 200): status, jailed flag, stake, voting power share, commission |
| `get_staking_tiers` | the staking tier module: lock terms and bonuses, early unlock penalty, the bonus pool, and optionally one holder's locks. Chain v3.2.4 and later |
| `search` | detects a block height, transaction hash, address or validator from one string, reads it and names the tool that returns the same data |
| `read_contract` | an EVM `eth_call` only, with optional ABI encoding of a function signature and decoding of the result |
| `estimate_fee` | simulated gas, suggested gas limit and fee (gas limit times the minimum gas price), including the ML-DSA-87 layer |
| `simulate_tx` | gas used, suggested gas limit, balance change per address and a decoded refusal for an encoded transaction |
| `prepare_transfer` | an unsigned `MsgSend` of uqor: SignDoc, readable summary, checks and warnings |
| `get_token_holders` | always `NOT_AVAILABLE_ON_CHAIN`: listing holders needs an indexer that the public endpoints do not provide |
| `request_faucet` | always `NOT_AVAILABLE_ON_CHAIN`: testnet QOR comes from the [Faucet](/dashboard/faucet) on the dashboard |

Errors are tool results with `isError: true` and a JSON body `{"error": {"code", "message", "details?"}}`. The codes are `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` and `INTERNAL_ERROR`.

### Use it as a library {#library}

The npm package exports `createServer({ defaultNetwork })` (an MCP server instance for any MCP transport), `createHttpHandler({ apiKeyHashes, rateLimitPerMinute })` (a Fetch API handler, `(Request) => Promise<Response>`) and `startNodeServer(...)` (the Node HTTP server that `serve` uses). Shared options are `defaultNetwork`, `endpoints` (point a network at your own nodes), `upstream` (`timeoutMs`, `maxResponseBytes`, `fetch`) and `onToolCall` (receives the tool name, status and latency).

The Python package can be used the same way through `run_tool`:

```python
import anyio
from qorechain_mcp import Context, run_tool

async def main():
    out = await run_tool("get_chain_info", {"network": "mainnet"}, Context())
    print(out["latest_block"])

anyio.run(main)
```

### Test the hosted endpoint from a terminal {#test-hosted}

```bash
curl -s -X POST https://mcp.qorechain.io/mcp \
  -H "Authorization: Bearer $QORECHAIN_MCP_KEY" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Without a valid key the endpoint answers HTTP 401 with a JSON-RPC error whose message starts with `UNAUTHORIZED`.

### Troubleshooting {#troubleshooting}

* `UPSTREAM_UNAVAILABLE`: the public endpoint did not answer within 10 seconds. Try again.
* `NOT_FOUND` on an old testnet block: testnet nodes prune history, and the error names the lowest available height. `get_chain_info` reports `earliest_available_height`.
* No tools listed in the client: run `npx -y @qorechain/mcp --help` in a terminal to check that Node and npm work, then read the client's MCP log.
* `UNAUTHORIZED` on the hosted endpoint: the key is missing, wrong, revoked, or not active yet (a new key can take a minute or two).

### What was run {#what-was-run}

On 27 October 2026 the published packages were installed from the registries and run against the public testnet and mainnet endpoints:

- `qorechain-mcp --version` printed `0.1.0`; over stdio, `initialize` returned the server name `qorechain-mcp` and `tools/list` returned the 14 tool names above; `pip install qorechain-mcp==0.1.0` installed and its `--version` printed `0.1.0`.
- `qorechain-mcp serve --port 18787` answered `GET /healthz` with `{"status":"ok"}` and a `tools/call` for `get_chain_info` over `POST /mcp`.
- `get_chain_info` returned chain `qorechain-diana`, EVM chain ID 9800, minimum gas price 0.1 uqor and sign-bytes `v2` on testnet, and chain `qorechain-vladi`, EVM chain ID 9801 and sign-bytes `v2` on mainnet.
- `get_pq_status` on the testnet transaction above returned tier `pqc`, exactly one hybrid layer, and `verified: true` with sign-bytes `v2`.
- `prepare_transfer` for 1.5 QOR on testnet returned a SignDoc with gas limit 171698 and fee 17170 uqor (0.01717 QOR), and `simulate_tx` on its unsigned transaction returned `ok: true` with the fee debited from the sender. Nothing was signed or sent.

## How to access {#how-to-access}

- **Local (primary option).** stdio through `npx -y @qorechain/mcp` or `uvx qorechain-mcp`. It needs no account and no API key. It reads the public QoreChain endpoints, so it needs outbound HTTPS.
- **Your own HTTP server.** `qorechain-mcp serve`, as above, with API keys and rate limits you configure.
- **Hosted endpoint.** `https://mcp.qorechain.io/mcp` serves the Streamable HTTP transport. It uses testnet unless a call names `"network": "mainnet"`. Every request needs an API key sent as `Authorization: Bearer <key>`; request one from your dashboard (below). Without a key the endpoint answers HTTP 401 (`UNAUTHORIZED`), which was the answer on 27 October 2026. There is one active key per account, and each key is limited to 10 requests per second (burst 20) and 100,000 requests per day. For most uses the local setup needs no key and is the simpler choice.

  To get a key, sign in at [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), open the **AI agents (MCP)** tab and fill in the **API key** form (name or organisation, a contact, intended use, expected volume), then press **Request API key**. The QoreChain team approves or rejects the request; a rejection shows its note and you can request again. After approval press **Generate key**: the key is shown once, with a copy button and a ready configuration snippet, and becomes active within a minute or two. QoreChain keeps only a fingerprint (a hash), so a lost key cannot be shown again; revoke it (takes effect in about a minute) and request a new one. See [Developers page](/dashboard/developers#mcp).

HTTP client configuration for a server that needs a key (the exact key names vary per client):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

Never put a recovery phrase or private key in a client configuration: no QoreChain tool needs one.

The server reads from these public endpoints:

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Consensus RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Cost: the server is free. Reads cost nothing. If you broadcast a transaction that `prepare_transfer` built, the network fee applies (the fee floor is 0.1 uqor per gas).

## Security notes {#security}

* **No signing code path exists** in the server or the CLI. Nothing is signed, no key is stored and nothing is broadcast.
* **Secrets are refused.** Input that looks like a recovery phrase (12 or more consecutive BIP-39 words) or a bare 32-byte hex private key is rejected with `INVALID_INPUT` before any request is made, and the error tells the user to treat that secret as exposed. Never put a recovery phrase or private key in a client configuration; no QoreChain tool needs one.
* **Upstream error text is never forwarded**; responses are built field by field.
* **Logs.** HTTP logs carry the JSON-RPC method, the tool name, the status and the latency. Inputs, outputs, keys and client addresses are not logged.
* **API keys** of a self-hosted server are stored as SHA-256 hashes, never in plain text. CORS is closed by default, which also protects a server bound to localhost against DNS rebinding.
* **Mainnet must be named explicitly**, and `prepare_transfer` adds a warning for mainnet transfers.
* **Memos are public and permanent.** Never put a secret in a memo.
* **Treat a hosted API key like a password.** Keep it in an environment variable or a secret store and revoke it from the dashboard if it leaks.
* Report vulnerabilities privately to security@qore.network, never in a public issue.

## Where it is published {#where-published}

| Registry | Package | Version | Run | Notes |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`. stdio and Streamable HTTP. Node.js 20 or later |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` or `uvx qorechain-mcp` | stdio only. Python 3.10 or later |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | The `qore` command. See [QoreChain CLI](/developer-tools/qore-cli) |

Source: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (public, Apache-2.0, checked 27 October 2026). The repository holds the server, the CLI, the Python package, the tools reference, self-hosting notes, example client configurations and three agent skill files. It does not have a published container image; use `npx` or `pip`.

## Limits and known issues {#limits}

- **Read only.** There is no signing code path, no key storage and no broadcast. `prepare_transfer` returns an unsigned document. To finish a transfer, sign it with [QoreSign](/qoresign/overview) or the QoreX wallet and broadcast it yourself; then read the result with `get_transaction`. `read_contract` uses `eth_call` only and cannot change state.
- **One transaction type is prepared.** `prepare_transfer` builds a native-lane `MsgSend` of uqor. It does not build EVM, SVM, staking, governance or contract transactions. `estimate_fee` and `simulate_tx` accept any encoded native-lane transaction.
- **Gas figures follow the chain version, not the network.** Both networks have applied v3.2.5 (mainnet on 29 October 2026), so simulation includes the ML-DSA-87 verification cost and the gas is exact (`exact_gas_simulation` is true on both). Against a node older than v3.2.5 the suggested gas limit carries a margin.
- **Testnet history is pruned.** An old testnet block returns `NOT_FOUND`, and the error names the lowest available height (8,790,799 on testnet when checked; mainnet served from height 1). `get_pq_status` checks a layer against the key registered now, so after a key rotation older transactions no longer match.
- **EVM post-quantum precompiles.** `0x...0A01` (ML-DSA-87 verify) and `0x...0A02` (key status) are active on testnet only; on mainnet a call to them returns empty data.
- **Limits.** Each upstream request has a 10 second timeout and a 4 MiB response limit, with no retries. Blocks list at most 100 transaction hashes, transactions at most 50 messages, accounts at most 100 balances. HTTP request bodies are limited to 512 KiB. A memo is at most 256 characters, and it is public and permanent, so never put a secret in it. The rate limit of a self-hosted server is per instance and held in memory; behind a load balancer, each instance counts on its own.
- **Not available:** `get_token_holders` (no indexer on the public endpoints) and `request_faucet` (use the dashboard faucet, which needs sign-in). The hosted endpoint needs an API key, requested from your dashboard; the local setup does not.
- **Mainnet is explicit.** Calls go to testnet unless they name `"network": "mainnet"` or the server was started with `--network mainnet`.
- **No container image is published.** Run the server with `npx` or `pip`.
- **Version.** 0.1.0 is the first release; tool names and schemas can change in later versions, and the generated `spec/tools.json` in the repository is the reference for the version you installed.

## Related pages {#related}

* [QoreChain CLI](/developer-tools/qore-cli): the same tools from a terminal.
* [QoreSign](/qoresign/overview): the hybrid verifier used by `get_pq_status`.
* [QoreChain SDK](/sdk/overview): build and sign the transactions this server reads and simulates.
* [QoreX integrations](/developer-tools/qorex-integrations): the wallet that signs what `prepare_transfer` prepares.
* [Custody kit](/developer-tools/custody-kit): deposit detection and withdrawal verification for custodians.
* [Faucet](/dashboard/faucet) and the [Developers page in the dashboard](/dashboard/developers#mcp): testnet QOR and MCP API keys.
* [Developer packages overview](/developer-tools/overview).
