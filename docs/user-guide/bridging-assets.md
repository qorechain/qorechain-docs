---
slug: /user-guide/bridging-assets
title: Bridging Assets
sidebar_label: Bridging Assets
sidebar_position: 5
---

# Bridging Assets

This guide describes how moving assets between QoreChain and other blockchain networks is designed to work. QoreChain's interoperability layer is built around **37 chain configurations** (36 external chains plus Injective, reached over IBC) and up to **8 IBC counterparties** for Cosmos-ecosystem chains.

:::caution Not live on either network
The bridge module is deployed on mainnet and testnet, but **no bridge route is active**: all 37 chain configurations are in `pending` status with no bridge contract set, no bridge validators are registered, no bridge operation has ever been created, and no IBC channel exists on mainnet (the testnet has a single ICS-20 test channel to a chain with ID `provider`, none to the counterparties named below). Everything below describes the intended design. Do not send assets expecting them to be bridged. See [Bridge Architecture](/architecture/bridge-architecture) for the current status table.
:::

:::note
The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**, chain version **v3.2.6**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) runs chain version **v3.2.4** (since 23 October 2026). Substitute the mainnet chain ID and endpoints from the **Connecting to Mainnet** page once a route is activated. Status checked 27 October 2026: all 37 chain configurations are `pending` on both networks.
:::

---

## Connection Overview

QoreChain is designed to provide two bridging protocols:

| Protocol                                 | Connections                    | Use Case                                                                 |
| ---------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | up to 8 channels (none open)   | Native interoperability with IBC-enabled chains                          |
| **QCB** (QoreChain Bridge)               | 37 configurations (all pending) | Cross-chain transfers with non-IBC networks via PQC-secured attestations |

A complete enumeration of every chain configuration lives on the **Bridge Architecture** page. This guide focuses on how a bridge transfer is designed to work.

---

## IBC

IBC is part of the design (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), but **none of these counterparties is connected yet**: mainnet has no IBC channel or client, and the testnet has only a single ICS-20 test channel to a chain with ID `provider` (checked 27 October 2026), so there is nothing to transfer over for these chains. This page will list channels once they are opened.

### IBC additions on the testnet (v3.2.6) {#ibc-testnet-v326}

Three IBC features exist on the testnet only; mainnet does not have them (its `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` route answers 501):

* **IBC rate limit.** Governance can set a per-channel quota for IBC transfers (a whole percent of supply per window of hours). It is **not automatic**: no limits are set today, and an empty set means unlimited. A forwarded packet is charged on both channels and a refund returns the quota. This is separate from the bridge circuit breakers described under [Security Model](#security-model).
* **Packet forwarding.** A transfer arriving over IBC v1 can carry a memo of the form `{"forward":{"receiver":"...","port":"transfer","channel":"channel-N"}}` to be sent on to another chain, with refunds to the sender if a hop fails. There are no retries and a hop times out after 10 minutes by default. A token that converts to an ERC-20 on arrival cannot be forwarded.
* **08-wasm light clients.** Storing, migrating and removing a wasm light-client binary are authority-only, and the allowed client types contain only the standard client until governance adds `08-wasm`.

Read the limits with `GET /Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` on the testnet (`{"rate_limits":[]}` today).

**Which network has what (checked 27 October 2026).**

| | Mainnet `qorechain-vladi` (v3.2.4) | Testnet `qorechain-diana` (v3.2.6) |
|---|---|---|
| ICS-20 transfer (IBC v1) | Built in, but no channel is open | Built in, one channel open |
| IBC rate limit | Not available (501) | Available, no limits set |
| Packet forwarding | Not available | Available (IBC v1 only) |
| 08-wasm light clients | Not available | Message set present, no wasm client can be created until governance allows `08-wasm` |

### The test channel on the testnet {#ibc-test-channel}

The testnet has one open transfer channel, `channel-0` (port `transfer`, `connection-0`, version `ics20-1`, unordered). Its counterparty is the Cosmos Hub testnet (chain ID `provider`, channel `channel-600`). The testnet has seen one IBC denom, `uatom` arriving over `channel-0`; QoreChain also keeps an ERC-20 pair for it, owned by the module. Read the state with:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

To send on the test channel, build the transfer, then add the hybrid signature like any other native-lane transaction:

```bash
qorechaind tx ibc-transfer transfer transfer channel-0 <receiver_on_the_hub_testnet> 1000uqor \
  --from mykey --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > ibc.json
qorechaind tx pqc cosign ibc.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

This is a test channel between two test networks; the tokens have no value. Delivery of a packet needs a relayer running for the channel, and this manual does not publish or promise one, so a transfer can sit pending. Do not use the commands above on mainnet: there is no open channel there and the transaction would fail.

---

## QCB Bridge Endpoints

The QoreChain Bridge is designed to connect to external chains spanning multiple ecosystem types. A representative selection of the planned connections (every one is `pending` today):

| Chain     | Chain Type |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

No asset list is published: the chain configurations carry no asset registry yet. See the **Bridge Architecture** page for the full list of chain configurations.

---

## Deposit Flow (External Chain to QoreChain)

The designed sequence for a deposit from an external chain into QoreChain:

1. **Lock** — Lock tokens on the external chain by sending them to the QCB bridge contract or address.
2. **Attestation** — Bridge validators observe the lock transaction and produce PQC-signed attestations.
3. **Threshold** — Once **7 out of 10** validator attestations are collected, the bridge finalizes the deposit.
4. **Mint** — The equivalent wrapped tokens are minted on QoreChain and credited to your `qor1...` address.

There is no user-run "start a deposit" command: you lock on the external chain, and the bridge validators' attestations credit your account. (The chain's `qorechaind tx bridge deposit` command credits an already-attested deposit and needs bridge-validator signatures; it is not the way a user begins a deposit.)

---

## Withdraw Flow (QoreChain to External Chain)

The designed sequence for a withdrawal from QoreChain to an external chain:

1. **Burn** — Burn the wrapped tokens on QoreChain.
2. **Attestation** — Bridge validators observe the burn and produce PQC-signed attestations.
3. **Threshold** — Once **7 out of 10** attestations are collected, the withdrawal is finalized.
4. **Unlock** — The original tokens are released on the external chain to the specified destination address.

**CLI command** (blocked today: no chain is active, so the transaction would be refused):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Every native-lane transaction needs the hybrid post-quantum co-signature and a fee of at least 0.1 uqor per unit of gas; see [First Transaction](/getting-started/first-transaction).

---

## Security Model {#security-model}

The QoreChain Bridge is designed to be secured by multiple defense layers:

| Mechanism                    | Description                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQC Multisig**     | Every bridge operation requires attestations from at least 7 of 10 bridge validators, each using post-quantum cryptographic signatures.               |
| **24-Hour Challenge Period** | Transfers above the large-transfer threshold (100,000 QOR) enter a 24-hour challenge window during which validators or watchers can flag fraudulent transactions. |
| **Circuit Breakers**         | Designed for the QCB bridge: automated limiters halt bridge operations if abnormal volume or suspicious patterns are detected, and operations resume after manual review. They apply to the QCB bridge, not to IBC; the IBC rate limit (testnet only) is set by governance, is not automatic, and has no limits set today. |

---

## Querying Bridge Status

Read the bridge's state:

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

The same data is available over REST under `/qorechain/bridge/v1/` (see [Bridge Architecture](/architecture/bridge-architecture#rest-api-endpoints)).

---

## Tips

* Always verify the destination address format matches the target chain (e.g., `0x...` for EVM chains, base58 for Solana).
* Large transfers (above 100,000 QOR) are designed to trigger the 24-hour challenge period automatically.
* Bridge fees are burned through the `bridge_fee` burn channel (see [Token Operations](/user-guide/token-operations)).
