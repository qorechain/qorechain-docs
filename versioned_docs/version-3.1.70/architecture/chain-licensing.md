---
slug: /architecture/chain-licensing
title: Chain Licensing
sidebar_label: Chain Licensing
sidebar_position: 9
---

# Chain Licensing

The `x/license` module provides on-chain **capability licensing**. Certain gated capabilities on QoreChain — most notably per-chain bridge and validator features — require the acting account to hold a valid license for that capability. A license is simply an on-chain record that authorizes a specific holder (the **grantee**) to use a specific gated **feature**.

Licensing keeps these capabilities verifiable and self-describing: any integrator, explorer, or wallet can ask the chain whether a given account is authorized for a given feature, with no off-chain lookup required.

## What a license represents

Each license is a record keyed by a `(grantee, feature_id)` pair:

- **`grantee`** — the `qor` account the license authorizes.
- **`feature_id`** — the gated capability it unlocks. Feature IDs are stable string identifiers; bridge and validator capabilities are named per target chain (for example `bridge_ethereum`, `validator_solana`), alongside umbrella features such as the bridge-protocol and node/validator operator features.
- **`granted_at`** / **`expires_at`** — the block height the license was granted, and the block height at which it expires (a value of `0` means it does not expire).
- **`granted_by`** — the authority that issued the license.

A capability that is gated behind a feature simply checks, at execution time, whether the acting account holds an **active** license for that feature.

## License lifecycle

A license moves through a small set of states:

| State | Meaning |
| --- | --- |
| **Granted / Active** | The license exists and authorizes the grantee. It counts as active while it is not suspended and not expired. |
| **Suspended** | Temporarily disabled. The record still exists, but the gated capability is denied until the license is resumed. |
| **Revoked** | Permanently removed. The grantee no longer holds the license at all. |

A license also stops being active once its `expires_at` height passes, even if it was never suspended or revoked.

## Who can change licenses

Granting, revoking, suspending, and resuming licenses are **authority operations** — they are performed by the chain's governance authority, not by arbitrary users. These transactions exist as part of the module's command surface, but a normal user does not call them directly; the lifecycle is administered on-chain by the authority.

To **obtain** a license, integrators go through the **Dashboard (Tools → Buy License)**, which handles the request flow; the authority then records the grant on-chain.

The authority-gated transactions are:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Checking and verifying a license

The query commands are open to anyone. They are the part of the module that integrators use day to day — to confirm an account is authorized before relying on a gated capability, or to display license status in a wallet or explorer.

### Check a single license

`check` reports whether a specific grantee holds a specific feature, and whether that license is currently **active**. This is the canonical "is this account allowed to do X" call.

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

The response includes the license details and a boolean `active` field that already accounts for suspension and expiry — so a `true` means the grantee may use the gated feature right now.

### List a grantee's licenses

`list` returns every license held by an account, across all features.

```bash
qorechaind query license list qor1grantee...
```

### List holders of a feature

`holders` returns every account that holds a license for a given feature — useful for enumerating, say, who is authorized for a particular bridge or validator capability.

```bash
qorechaind query license holders bridge_ethereum
```

## Command summary

**Transactions** (`qorechaind tx license …`) — authority / governance-gated:

| Command | Purpose |
| --- | --- |
| `grant` | Authorize a grantee for a feature |
| `revoke` | Permanently remove a license |
| `suspend` | Temporarily disable a license |
| `resume` | Re-enable a suspended license |

**Queries** (`qorechaind query license …`) — open to anyone:

| Command | Purpose |
| --- | --- |
| `check` | Check one `(grantee, feature)` license and its active state |
| `list` | List all licenses held by a grantee |
| `holders` | List all grantees holding a given feature |

## Related

- Licenses for bridge and validator features back the capabilities described in [Bridge Architecture](/architecture/bridge-architecture).
- Licenses are obtained through the **Dashboard (Tools → Buy License)**.
