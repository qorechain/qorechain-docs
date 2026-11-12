---
slug: /build-before-qday/key-binding
title: How your post-quantum key is bound to your account
sidebar_label: Key binding
sidebar_position: 3
---

# How your post-quantum key is bound to your account

Every tutorial in this section uses a **post-quantum key** next to your normal account key. This page explains, in plain words, where that key comes from, how the chain learns that it belongs to your account, and how you can check it yourself. You do not need to run anything to read it. The checks in [Check it yourself](#check) take about 5 minutes.

## The idea in one picture {#picture}

```text
recovery phrase (or recovery code)
        |
        v
derive both keys
  - classical key (secp256k1)
  - post-quantum key (ML-DSA-87), tied to your account address
        |
        v
register once, with a proof of possession
        |
        v
every transaction is hybrid-signed (both keys)
        |
        v
validators verify both signatures
```

## Words used on this page {#words}

| Word | What it means |
| --- | --- |
| Classical key | Your normal account key (secp256k1). It signs every transaction on every blockchain of this kind. |
| ML-DSA-87 key | The post-quantum signing key. A future quantum computer is not expected to break it. |
| Recovery phrase (mnemonic) | The 12 or 24 words that restore an account. |
| Recovery code | A line starting with `QRC1`. It replaces the recovery phrase for the post-quantum key when your account comes from a raw private key. |
| Registering | One transaction that tells the chain which ML-DSA-87 key belongs to your account. |
| Proof of possession | A signature that shows you really hold the secret half of the key you register. |
| Hybrid signature | Both signatures on one transaction. |

## 1. Derive, do not generate {#derive}

The post-quantum key is not picked at random and kept in a file you could lose. It is **derived**: the same input always gives the same key.

- **With a recovery phrase.** The ML-DSA-87 key comes from the **same recovery phrase** as the classical key, together with your account address. The classical key and the post-quantum key are both rebuilt from the phrase, so **one backup restores both**. This is what QoreX and the SDK's unified account do.
- **With a raw private key.** A private key alone cannot give a second key. The post-quantum key is then made from a separate **recovery code** that starts with `QRC1`. In the Workshop 1 project you create it with `pnpm window recovery-code`. In the SDK it is `generatePqcRecoveryCode()`.

Three rules for a recovery code:

1. Keep it **apart** from the private key. If both sit in one place, one theft takes both.
2. Always reuse the **same** code for the same account.
3. A **different code gives a different key**. The chain then sees a key that does not match the one you registered.

:::caution A recovery code cannot be rebuilt
There is no way to recover a lost recovery code. Write it on paper when you create it. Throwaway testnet accounts are the exception: you can make a new account in a minute.
:::

## 2. Bind once, with a proof of possession {#bind}

Binding means one transaction, sent once per account, named `MsgRegisterPQCKeyV2`. It carries:

- your ML-DSA-87 **public key** (2,592 bytes), and
- a **proof of possession**: the key signs a short text that names the chain and your account. Nobody can bind a key they do not hold, and nobody can copy a binding from another chain.

This is the one message the chain accepts with the **classical signature only**. The reason is simple: before it, the chain has no post-quantum key on record for your account, so there is nothing to check a second signature against.

How you do it:

| Where | How |
| --- | --- |
| QoreX | Automatic on your first send. It costs a one-time fee of about 0.09 QOR. |
| Workshop 1 and the example apps | `pnpm window register` (step 5 of the [Workshop 1 guide](/build-before-qday/workshop-1#step-5)). |
| Your own code | The SDK's `ensurePqcRegistered`. |

`ensurePqcRegistered` is safe to call again. It reads your account first. If your key is already bound it sends nothing. If a **different** key is bound it stops with `PqcKeyMismatchError` and sends nothing. If you send a second registration by hand, the chain refuses it and **still takes the fee**, so let the helper do the check.

:::note What the chain demands today
The chain checks a proof of possession whenever one is present, and refuses the registration if it does not verify. The SDK and QoreX attach one by themselves. On mainnet a registration without a proof is still accepted. On the testnet, from release v3.2.8, the first transaction of a new account must be this registration. Details: [Post-quantum signing](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. After binding, everything is hybrid {#hybrid}

From then on, every native transaction carries two signatures:

- the classical secp256k1 signature (64 bytes), and
- the ML-DSA-87 signature (4,627 bytes) in an extension named `PQCHybridSignature`.

The validators verify **both**. When they do, the chain records an event `pqc_hybrid_verify` with the status `verified`.

Without a registered key, a transaction is refused with `account has no PQC key and classical fallback is disabled`.

Transactions on the EVM lane (for example a contract deploy) need one more thing: an EVM authorisation window, opened by a hybrid-signed message. See the [EVM window reference](/developer-guide/evm-window-reference).

## Check it yourself {#check}

You need `curl`. `jq` is optional. Both are covered in [Before you start](/build-before-qday/prerequisites#curl-jq).

### Is my key registered? {#check-account}

1. Replace `qor1...` with your own address and run:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

What it does: asks the public testnet server for the key record of your account.

Parameters:

- `curl`: a program that fetches a web address.
- `-s`: silent, so it hides the progress bar and shows only the answer.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: the testnet REST address, followed by your account.

**What you should see:** for a registered account, an answer like this (placeholders shown, yours has real values):

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found` is `true` when a key is bound and `false` when it is not. `possession_proven` is `true` when the key was registered with a verified proof of possession.

### Was my transaction hybrid-signed? {#check-tx}

The check from Workshop 1, step 6.

1. Replace `<HASH>` with the hash of a transaction of yours (without the `<` and `>`) and run:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

What it does: asks the public testnet server for the full record of your transaction.

**What you should see:** a long block of text. Look for three things:

1. `"code": 0` inside `tx_response`. Code 0 means success.
2. The `PQCHybridSignature` extension, which holds the ML-DSA-87 signature: **4,627 bytes**, next to the 64-byte secp256k1 signature.
3. In `events`, an event of type `pqc_hybrid_verify` with the attribute `status` set to `verified`.

2. To print only that event (needs `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

What it does: fetches the same record and passes it through `jq`, which keeps only the verification event.

**What you should see:** one event whose `status` attribute is `verified`.

## Related keys and changes {#related}

- **Encryption keys.** ML-KEM-1024 keys, used by [QoreSeal](/developer-tools/qoreseal) to encrypt data to an account, live in a **separate registry**. You publish one with `MsgRegisterKEMKey`, in a hybrid-signed transaction, so the account must already have its ML-DSA-87 key.
- **Changing the signing key.** `MsgRotatePQCKey` swaps the ML-DSA-87 key for a new one of the same type, for example to retire a compromised key. `MsgMigratePQCKey` moves between algorithms. Both need signatures from the old and the new key, and the chain refuses a key the account used before. Both are live on mainnet and testnet. Full rules: [Post-quantum signing](/developer-guide/post-quantum-signing).

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | The account has not registered its ML-DSA-87 key yet. | Register first (`pnpm window register`, QoreX first send or `ensurePqcRegistered`), then send again. Check with the account query above. |
| `PqcKeyMismatchError`, or `registered, but NOT this key` in `pnpm window status` | A different key is already bound. You used another recovery code or phrase than the first time. | Put the original recovery code or phrase back. For a throwaway account, start again with a new account. |
| Registration refused as already registered | The account already holds a key. A raw second registration still takes the fee. | Do nothing. Read the account with the query above, or use `ensurePqcRegistered`, which checks first. |
| You lost your recovery code | It cannot be rebuilt from the private key. | If the account came from a recovery phrase, use the same phrase: it gives the same key. Otherwise use a new account. On the testnet this costs nothing. |
| Registration fails with a fee or balance message | The account holds too little QOR for the fee (about 0.09 QOR) or the fee is under the network floor of 0.1 uqor per unit of gas. | Get QOR from the [faucet](https://dashboard.qorechain.io/faucet), set gas to about 600,000 for a manual registration, and try again. |
| `found` is `false` although you registered | You are asking the wrong network, or the wrong address. | Check that you use `api-testnet.qore.host` for the testnet and your own `qor1...` address. A wallet can show a different network than your project. |
| The account answers `found: true` but your transactions fail | The key on chain is not the one your project derives. | Run `pnpm window status` and compare with the recovery code in `.env`. |

## Next step {#next}

Go back to the [Workshop 1 guide](/build-before-qday/workshop-1#step-5) and register your key, or read the [overview](/build-before-qday/overview).
