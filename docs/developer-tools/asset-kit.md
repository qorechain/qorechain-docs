---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

The QoreChain Asset Kit is open-source tooling for issuing and managing permissioned tokens that represent real-world assets on QoreChain. It has two parts with different status. One part is a set of EVM contracts that run on the QoreChain EVM Engine today: adapters for two open token standards for regulated assets (ERC-3643 and CMTAT), vaults with restricted shares, and one QoreChain-specific control that requires every holder to have a registered ML-DSA-87 key. The other part is a **proposal** for native chain modules, published as protobuf interfaces with clients in four languages and an in-memory mock, so that applications can be designed and tested against the proposed rules.

It is for issuers, transfer agents, fund administrators, compliance and legal teams, and integrators who want to prototype a regulated token on the QoreChain testnet. Version **0.1.0**, Apache-2.0 (with the licence exceptions listed under [Where it is published](#where-published)), maintained by the QoreChain Association. It is pre-1.0 and **not audited**.

:::caution What is live and what is not
- **Works today, on testnet only:** the EVM contracts, the Foundry deployment scripts and the issuer console, on `qorechain-diana` (EVM chain ID 9800). The holder check reads the `pqcKeyStatus` precompile at `0x0A02`, which is active on testnet and **not active on mainnet**.
- **Mainnet (`qorechain-vladi`, EVM chain ID 9801):** the holder check **fails closed**. Every address that is not explicitly exempt counts as ineligible, so a token gated by the guard cannot move between ordinary holders. The deployment scripts refuse to run on chain 9801.
- **A proposal, not live anywhere:** the native modules `x/asset`, `x/identity`, `x/compliance`, `x/settlement` and `x/attest` do not exist on any QoreChain network, and no upgrade that adds them is scheduled. The clients for them can only talk to an in-memory mock.
- **Legal templates** in the repository are unreviewed drafts for discussion with counsel. They are not legal advice.
:::

## Innovations {#innovations}

- **A post-quantum holder check on top of the standard's own controls.** The guard reads `pqcKeyStatus(address)` at `0x0A02` and accepts an address only if it returns `registered`, algorithm id 1 (ML-DSA-87) and `possessionProven`. A key registered without proof of possession could belong to someone else, so it does not count. Every control of the upstream standard (identity registry, claim topics, freeze, pause, forced transfer) still applies; the check is added to them.
- **Fail closed, with strict decoding.** The guard calls the precompile with a fixed gas allowance and decodes the answer strictly. An answer in the older three-field layout, a malformed answer or no answer at all is treated as "no key". Where the precompile is not active, every non-exempt address is ineligible.
- **The same guard behind three adapters.** `QoreChainHybridHolderRule` plugs into a CMTAT v3 token as its `ruleEngine` (or as a rule inside a CMTA RuleEngine) with restriction codes 60, 61 and 62; `QoreChainHybridHolderModule` plugs into ERC-3643 modular compliance as a plug-and-play module; the vaults take any `IHolderEligibility` policy, the guard included.
- **Vault shares that cannot launder a restricted token.** `QoreChainRwaVault` (ERC-4626) and `QoreChainRwaAsyncVault` (ERC-7540, requests settled in batches by an operator with `FULFILLER_ROLE`) check the receiving side of every share movement: `maxDeposit` and `maxMint` return zero for an ineligible receiver. Redemptions are never refused.
- **Upstream contracts used unmodified.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 and OpenZeppelin are git submodules, not copies.
- **A proposal that can be tested before it exists.** Every call on the `ChainClient` fails with `ChainUpgradeRequired` (code `CHAIN_UPGRADE_REQUIRED`, plus the module name) without sending any network request. A `MockChain` implements the proposed rules in memory and refuses with `MockChainError` carrying the proposed error code name, for example `ERROR_CODE_ADDRESS_FROZEN`. An application can be written against the mock and keep the real client wired in, so a missing upgrade is reported clearly instead of failing silently.
- **A console with no backend.** The issuer console is a React page that makes no network request of its own; the production build sets a Content-Security-Policy with `connect-src 'none'`, and everything goes through the connected wallet.
- **Tests that run offline.** 33 Foundry tests run with no network, using a test double of the precompile.

## What it does {#what-it-does}

**Works today on QoreChain EVM (testnet):**

- **`QoreChainHybridHolderGuard`.** Reports whether an address has a registered ML-DSA-87 key with proof of possession (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Owner-managed exemptions for contracts such as vaults and escrows (`setExempt`, event `ExemptionSet` with a reason). Ownership moves in two steps (OpenZeppelin `Ownable2Step`).
- **`QoreChainHybridHolderRule`.** A CMTAT v3 transfer rule mapped to the guard. Restriction codes 60 (sender), 61 (receiver) and 62 (spender) through `detectTransferRestriction`, `detectTransferRestrictionFrom` and `messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** An ERC-3643 (T-REX v4) modular-compliance module mapped to the guard. `moduleCheck` checks sender and receiver. No per-compliance configuration.
- **`QoreChainRwaVault` and `QoreChainRwaAsyncVault`.** Described above.
- **`IERC7518`.** An interface sketch for ERC-7518 partitions, without an implementation; its ERC-165 id `0x5a264a5d` is checked by a test.
- **Deployment scripts (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` and `script/DeployVaults.s.sol`, with a shared preflight (`script/QoreChainTestnet.sol`) that reports whether the precompile answers and the deployer's key status, and refuses chain 9801.
- **Issuer console** (`packages/issuer-console`). Connects any EIP-6963 wallet, adds or switches to QoreChain Testnet, creates a CMTAT token gated by the guard (guard, rule and token, as in `DeployCmtat.s.sol`), opens existing CMTAT or ERC-3643 tokens, runs agent actions (mint, burn, freeze, unfreeze, forced transfer, pause, unpause) and shows holders and an audit log built from chain events.

**Proposal (not on chain):**

- Protobuf interfaces in `proto/` for `x/asset`, `x/identity`, `x/compliance`, `x/settlement` and `x/attest`, and their semantics in `docs/proposal.md`.
- Clients in TypeScript, Python, Go and Java: generated types, the `ChainClient` and the `MockChain`.

**Reference documents in the repository:**

- `docs/evm-adapters.md`: the contracts, upstream licences, testnet deployment.
- `docs/technology-standards.md`: a draft describing the networks as an issuer or auditor would need to see them (reliability, governance, upgrade authority, transaction ordering, observability, incident handling, key management), each fact labelled Verified, Documented, Not measured or Not published.
- `legal/`: three templates for discussion (see [Limits](#limits)).

## Use cases {#use-cases}

1. **An issuer prototypes a permissioned token on testnet.** The issuer deploys a CMTAT token with `DeployCmtat.s.sol` (or from the issuer console), or a full ERC-3643 suite with `DeployErc3643.s.sol`, and tries freeze, pause, forced transfer and the holder check on `qorechain-diana` before any decision about a real issuance.
2. **A fund administrator runs subscriptions and redemptions through restricted-share vaults.** Investors request deposits on `QoreChainRwaAsyncVault`; the administrator processes them in batches with `fulfillDeposit` and `fulfillRedeem`; shares can be received only by eligible addresses, while redemptions stay open to everyone holding shares.
3. **A compliance team requires post-quantum key registration for every holder.** Adding `QoreChainHybridHolderRule` (CMTAT) or `QoreChainHybridHolderModule` (ERC-3643) means a token can be minted or transferred only to addresses with a registered, possession-proven ML-DSA-87 key, on top of the standard's own identity and allowlist controls.
4. **An integrator builds against the proposed native modules.** A wallet, registry or back office codes against `MockChain` in TypeScript, Python, Go or Java, asserts on its events and error codes, and keeps `ChainClient` wired in.
5. **A product team designs delivery-versus-payment and attestation flows.** The proposed `x/settlement` (instructions with bilateral affirmation, all legs or none) and `x/attest` (statements with a validity period and staleness) can be exercised in `MockChain` to design user flows, knowing that neither exists on chain.
6. **A legal team starts the paperwork with counsel.** The templates for a Swiss ledger-based security, Liechtenstein TVTG token terms and an EU DLT Pilot Regime engagement give a structure and a technical mapping section to fill in. Qualified counsel in the jurisdiction reviews everything before any use.
7. **A due-diligence reviewer reads the network facts.** `docs/technology-standards.md` lists what can be checked on the live networks and what is not measured or not published, with sources.

## How it works {#how-it-works}

### The holder check on EVM {#holder-check}

The precompile at `0x0A02` answers `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. The guard requires `registered && algorithmId == 1 && possessionProven`. This makes the guard fail closed: where the precompile is not active, every address that is not explicitly exempt is ineligible. See [EVM precompiles](/developer-guide/evm-precompiles) for the precompile itself and its network status.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

The check is additive. Every control of the upstream standard still applies: ERC-3643 identity registry (ONCHAINID), claim topics, trusted issuers, freeze, partial freeze, pause, forced transfer and recovery; CMTAT freeze, partial freeze, pause, forced transfer, documents and snapshots.

### What the check covers {#coverage}

Receiving is what matters: a mint or transfer to an address without a key is refused. The CMTAT rule also checks the sender and, for `transferFrom`, the spender. The ERC-3643 module checks sender and receiver; ERC-3643 does not pass the spender to compliance modules, so a `transferFrom` spender is not checked there. Burns are never refused (in ERC-3643, `burn` does not consult compliance modules at all), so a holder who lost eligibility can still be redeemed.

### Vaults {#vaults}

Both vaults check the receiving side of every share movement; redemptions are never refused. In the ERC-7540 vault, requests are aggregated per controller (request id 0). The fulfiller converts pending deposits into shares at the vault's own assets-per-share ratio at fulfilment, with no external valuation input; controllers then claim with `deposit` or `mint`, or `redeem` or `withdraw`. The vault contract itself must be allowed to hold the underlying token: registered in the ERC-3643 identity registry or the CMTAT allowlist, and exempt in the guard (`DeployVaults.s.sol` sets the guard exemptions).

### Sending an EVM transaction on QoreChain {#native-prerequisites}

Every EVM transaction on QoreChain is admitted only if the sender has:

1. a registered ML-DSA-87 key, registered with `MsgRegisterPQCKeyV2` and a proof of possession, and
2. an open EVM authorization window, opened by `/qorechain.pqc.v1.MsgOpenEVMWindow` in a hybrid-signed (secp256k1 plus ML-DSA-87) native-lane transaction.

For deployments the window needs `allowed_targets` **empty** (a window restricted to targets refuses contract creation), `max_txs` at least the number of transactions, `max_value` covering value plus the maximum fee of every transaction, `blocks` long enough (at most 17,280), and `native_only` false. Opening the window advances the account sequence, which is also the EVM nonce: open the window first, then run the script. Calls and gas estimation need no window. Background: [Post-quantum signing](/developer-guide/post-quantum-signing) and [EVM development](/developer-guide/evm-development#evm-window).

### The proposal {#proposal}

Six flags fixed or relax-only at creation (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`); roles (issuer, agents, auditors, identity agents, claim issuers, attesters); ordered transfer checks; freeze, partial freeze, clawback and forced transfer with a recorded reason; identities with claims but no personal data on chain; a registry of versioned compliance modules (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`); settlement instructions with affirmations; attestations with `FRESH`, `STALE` or `MISSING` status. The specification is `docs/proposal.md` in the repository. Where the text and the mock disagree, the text is the intended behaviour. All of this is a design: none of it exists on a QoreChain network.

## How to use {#how-to-use}

### Install {#install}

| Part | Install | Minimum platform |
|---|---|---|
| Solidity contracts (from GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (tag `v0.1.0`), or as a Foundry dependency: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (T-REX and ONCHAINID files use 0.8.17); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (package `assetkit`) | Go 1.23 |
| Python | **Coming** on PyPI as `qorechain-asset-kit`; not published yet. Today, from a clone: `cd clients/python && python -m pip install .` (import `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **Coming** on npm as `@qorechain/asset-kit`; not published yet. Today, from a clone: `pnpm install && pnpm -r build` | Node.js 22.12 |
| Issuer console | From a clone: `pnpm install`, then `pnpm --filter @qorechain/issuer-console dev` (not published as a package) | A browser with an EIP-6963 wallet |

The repository README and the TypeScript client README import from `@qorechain/asset-kit` as if it were installed. That works from a clone only, until the npm release.

With `forge install`, the contracts sit under `lib/qorechain-asset-kit/contracts/` and their own dependencies under `lib/qorechain-asset-kit/contracts/lib/`. Remappings that compile the guard, the CMTAT rule and the vaults:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Quickstart 1: build and test the contracts (offline) {#quickstart-build}

From the repository README. No network, no account.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

Observed output ends with `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### Quickstart 2: dry run a deployment against testnet {#quickstart-dry-run}

Without `--broadcast`, Foundry simulates against the testnet state and sends nothing. Any address works as `--sender` for a dry run.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` is defined in `foundry.toml` as `https://evm-testnet.qore.host`. The preflight prints the chain ID (9800), `pqcKeyStatus precompile: active` and the deployer's key status. For an address with no key it adds `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` It then prints the addresses the guard, rule and token would have. The same command against mainnet stops with `QoreChain mainnet: the hybrid-holder guard is testnet only`. `script/erc3643/DeployErc3643.s.sol` and `script/DeployVaults.s.sol` run the same way. Optional environment variables: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Before broadcasting on testnet {#before-broadcast}

1. Use a testnet account you control, with a little testnet QOR (see the [Faucet](/dashboard/faucet)). Never use a mainnet mnemonic, and never fund the public test phrase used in the examples.
2. Register its ML-DSA-87 key with proof of possession (the `examples/register-and-send` example of [QoreSign](/qoresign/overview) registers one).
3. Open an EVM authorization window with the settings in [Sending an EVM transaction](#native-prerequisites), with empty `allowed_targets`. The [QoreChain SDK](/sdk/overview) builds the message (`openEvmWindow` in the `pqc` message group in TypeScript, `qorsdk.msg.pqc.open_evm_window` in Python) and reads the window back (`fetchEvmWindow`, `get_evm_window`).
4. Run the script with `--broadcast` and your wallet configuration.
5. Exempt every contract that must hold the token (vaults, escrows) with `guard.setExempt`, register holders in the token's own compliance, and check each holder with `guard.isHybridHolder(address)` before minting.

### Quickstart 3: issuer console (testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Connect an EIP-6963 wallet, switch to QoreChain Testnet, then create a CMTAT token or open an existing one by address. On chain 9801 the console shows a warning and disables token creation. The console does not register keys or open windows; do steps 2 and 3 above first.

### Quickstart 4: build against the proposed modules with MockChain (Python, offline) {#quickstart-python}

From the Python client README. Until the PyPI release, install from a clone (see [Install](#install)).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

Observed output: `ERROR_CODE_ADDRESS_FROZEN`. The same call on `ChainClient()` raises `ChainUpgradeRequired` with `module == "x/asset"` and `code == "CHAIN_UPGRADE_REQUIRED"`.

### Quickstart 5: the same in Go (module proxy v0.1.0) {#quickstart-go}

From the Go client README, wrapped in a `main` package.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

Observed output: `mock mint error: <nil>` then `true x/asset`. The Java client README has the equivalent example with `MockChain`, `MsgCreateAsset.newBuilder()` and `MockChainError.code()`.

:::note
The Go and TypeScript READMEs in the repository contain small errors in their snippets, to be fixed in 0.1.1. The Go example above is the corrected version.
:::

## Main API {#main-api}

### Contracts {#api-contracts}

| Name | What it does |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | Guard over `0x0A02`: `isHybridHolder`, `isEligible`, `requireHybridHolder` (reverts `HybridKeyRequired`), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | CMTAT rule: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; codes `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | ERC-3643 module: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | ERC-4626 vault with restricted shares |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | ERC-7540 vault: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, and `deposit`, `mint`, `redeem`, `withdraw` with a controller; `FULFILLER_ROLE`; previews revert by design |
| `IHolderEligibility` | `isEligible(address)`: plug in another eligibility policy for the vaults |
| `IERC7518` | Partition interface sketch |
| `forge script script/DeployCmtat.s.sol` | Guard, rule and CMTAT token |
| `forge script script/erc3643/DeployErc3643.s.sol` | T-REX infrastructure, guard, module and one token suite |
| `forge script script/DeployVaults.s.sol` | Both vaults over a restricted token, with guard exemptions |

### Clients (proposal) {#api-clients}

TypeScript and Java names are shown; Python uses snake_case (`create_asset`), and Go uses Go casing behind accessors (`chain.Asset().CreateAsset(ctx, msg)`).

| Name | What it does |
|---|---|
| `ChainClient` (Go `NewChainClient()`) | Every call fails with `ChainUpgradeRequired`; no network request |
| `MockChain` (Go `NewMockChain()`) | The proposed rules in memory; refusals throw `MockChainError` |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; queries `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; queries `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; queries `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; queries `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; queries `latest`, `history`, `attesters` |
| Mock helpers | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python also `has_hybrid_key`, `height`, `time`) |

## How to access {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| EVM chain ID | 9800 | 9801 |
| EVM RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| `pqcKeyStatus` precompile `0x0A02` | Active | Not active (`eth_call` returns empty data); activation would need a governance decision, none taken |
| Hybrid-holder guard, rule, module | Work | Fail closed: every non-exempt address is ineligible, so tokens cannot move between ordinary holders |
| Deployment scripts | Dry run and broadcast | Refuse to run |
| Issuer console | Full | Warning; token creation disabled |
| Native modules (`x/asset` and others) | Do not exist | Do not exist |

Requirements for anything that sends an EVM transaction: an account with a registered ML-DSA-87 key (with proof of possession) and an open EVM authorization window, both set up on the native lane with a hybrid-signed transaction. Reads (`eth_call`, logs, gas estimation, dry runs) need neither. The `MockChain` and the Foundry tests need no network at all. Other endpoints and the faucet: [Connecting to testnet](/getting-started/connecting-to-testnet) and [Connecting to mainnet](/getting-started/connecting-to-mainnet).

Network behaviour to keep in mind: `PREVRANDAO` is a constant (none of the kit's contracts uses it); blob transactions (type 3) are refused, and types 0, 1, 2 and 4 are accepted; EIP-7702 delegations need the authority's own post-quantum consent (`MsgAuthorizeEVMDelegation`).

## Where it is published {#where-published}

Checked live on 28 October 2026 (the GitHub release, Maven Central and the Go proxy serve 0.1.0; PyPI and npm return 404).

| Registry | Package | Version | Link |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Go module proxy | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (tag `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **Coming** (not on PyPI yet) | |
| npm | `@qorechain/asset-kit` | **Coming** (not published) | |
| GitHub (Solidity contracts, issuer console, protos, docs, legal templates) | `qorechain/qorechain-asset-kit` | release v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Repository: https://github.com/qorechain/qorechain-asset-kit. Maintainer: QoreChain Association.

**Licences.** Code is Apache-2.0, except `contracts/script/erc3643/` and `contracts/test/erc3643/`, which compile together with the ERC-3643 reference implementation and are GPL-3.0-or-later. Documentation in `docs/` and `legal/` is Apache-2.0. Dependencies keep their own licences and are used unmodified as git submodules: T-REX and ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). A deployed ERC-3643 token is T-REX code under its licence; a deployed CMTAT token is under MPL-2.0. The `NOTICE` file lists every dependency.

## Limits and known issues {#limits}

- **The native modules do not exist.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` and `x/attest` are a proposal. No upgrade adding them is scheduled. `ChainClient` can never succeed in 0.1.0; `MockChain` is a development tool, not a chain.
- **The holder check is testnet only.** On mainnet the guard fails closed; a mainnet deployment cannot rely on it.
- **Agent powers bypass the holder check.** In both standards, forced transfer and wallet recovery by an agent do not consult the rule or module: CMTAT `forcedTransfer` and ERC-3643 `forcedTransfer` and `recoveryAddress` can place tokens on an address that has no key. Restrict who holds the agent roles.
- **ERC-3643 `transferFrom` spenders are not checked** by the module, because ERC-3643 does not pass the spender to compliance. The CMTAT rule does check the spender.
- **Burns and redemptions stay open** to holders who lost eligibility, by design, in both token standards and both vaults.
- **Pending ERC-7540 requests cannot be cancelled** in 0.1.0. If an agent moves assets out of the asynchronous vault, `totalAssets` reads zero and claims that need the missing assets fail until the issuer restores the balance.
- **No external valuation input** in the ERC-7540 vault; conversion uses the vault's own balance per share.
- **No delivery-versus-payment and no attestations on EVM.** These exist only as the proposed `x/settlement` and `x/attest`.
- **ERC-7518 is an interface sketch**, not an implementation. Partitions can be modelled today with one token per class or tranche sharing one identity registry or rule.
- **CMTA RuleEngine v3** is still published as release candidates; the rule works as a token's `ruleEngine` directly and advertises both rule interface ids (`0x2497d6cb`, `0xb1a69752`).
- **The issuer console** does not register keys, open windows, deploy ERC-3643 suites or vaults, or manage CMTAT roles, partial freezes, documents or snapshots.
- **Python and TypeScript are not on their registries.** Use a clone until the PyPI and npm releases; this page gives no registry install command for them.
- **README errors.** The Go and TypeScript snippets in the repository READMEs have small errors, to be fixed in 0.1.1. Use the quickstarts on this page.
- **Legal templates.** `legal/` holds three drafts for discussion: a Swiss ledger-based security (Art. 973d to 973i of the Code of Obligations), Liechtenstein token terms under the TVTG ("token container" approach), and an engagement outline for an operator under the EU DLT Pilot Regime (Regulation (EU) 2022/858). They have not been reviewed by counsel, are not legal advice, and must be reviewed by qualified counsel in the relevant jurisdiction before any use. Using them, or the kit, says nothing about whether a given issuance meets any legal requirement. The QoreChain Association does not act as issuer, registrar, custodian, venue or legal adviser for any asset.
- **Pre-1.0.** The proposed protos may change in any minor version.

## Security notes {#security}

- **Not audited.** The contracts have had no independent review. Do not use them to hold real value without one.
- Keys stay with their owners: the guard reads public key status from the chain and never handles a private key. Deployer, owner and agent keys are ordinary EVM accounts with registered ML-DSA-87 keys; keep the issuer, guard owner and agent roles on separate, well-protected accounts.
- The guard owner controls exemptions. An exemption makes an address eligible without a key; grant it to contracts that hold the asset by design, and watch `ExemptionSet` events.
- Agent roles can bypass the holder check (forced transfer, recovery). Treat them as the most sensitive roles of the token.
- The guard fails closed and decodes the precompile answer strictly; it never treats a key without proof of possession as valid.
- The issuer console production build sets a Content-Security-Policy with `connect-src 'none'`: the page makes no network request of its own, and everything goes through the wallet.
- `MockChain` trusts the signer fields of messages (there are no signatures); it is not a security boundary.
- Issues in CMTAT, the ERC-3643 reference implementation, ONCHAINID or OpenZeppelin should also go to their maintainers.
- Report vulnerabilities in the kit privately to security@qore.network.

## Related pages {#related}

- [QoreChain SDK](/sdk/overview): registering an ML-DSA-87 key and opening an EVM authorization window (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): hybrid signing for the native-lane transactions that register keys and open windows.
- [Post-quantum signing](/developer-guide/post-quantum-signing) and [accounts and PQC signing](/sdk/concepts/accounts-pqc): key registration and the hybrid signature.
- [EVM development](/developer-guide/evm-development#evm-window): the EVM authorization window.
- [EVM precompiles](/developer-guide/evm-precompiles): `0x0A01` and `0x0A02`, active on testnet only.
- [Chain developer kit](/developer-tools/chain-dev-sdk): Foundry, Hardhat and viem templates and window helpers (SDK 0.11.0, coming).
- [Custody kit](/developer-tools/custody-kit) and [QoreScan](/developer-tools/qorescan): neighbouring kits for custodians and for cryptography inventories.
- [Developer packages](/developer-tools/overview): every package and its registry status.
- Upstream standards: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
