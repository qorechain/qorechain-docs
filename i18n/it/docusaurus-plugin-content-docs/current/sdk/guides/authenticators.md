---
slug: /sdk/guides/authenticators
title: Authenticator e spesa delegata
sidebar_label: Authenticator
sidebar_position: 8
---

# Authenticator e spesa delegata

Le **corsie authenticator** (SDK 0.7.0, chain **v3.1.85**) permettono a una
chiave esterna collegata — una chiave **ed25519** di Phantom, oppure una chiave
**secp256k1** MetaMask / EVM — di spendere dall'UNICO account canonico con
**PQC obbligatoria** in termini di privilegio minimo, con limiti di spesa e
revocabili, **senza che la chiave esterna produca mai una co-firma ML-DSA**.

Questa è la controparte lato SDK del modulo di
[account abstraction](/developer-guide/account-abstraction) della chain.

:::danger Non disponibile sulla mainnet
Il modulo `x/abstractaccount` è **disabilitato** su `qorechain-vladi` (mainnet):
`GET /qorechain/abstractaccount/v1/config` restituisce `"enabled": false`. Dalla chain
v3.2.0 quel flag viene applicato su ogni percorso (creazione di un abstract account,
collegamento di un authenticator, e sia `MsgExecuteEVM` sia `MsgExecuteCosmos`), e la
chain li rifiuta con `abstract account module is disabled` (codice 9). Nessuna
transazione può attivarlo. Sulla testnet `qorechain-diana` la stessa route restituiva
`"enabled": true` il 27 ottobre 2026, quindi i flussi qui sotto possono essere provati
lì. Non costruire un flusso di chiave collegata o di spesa delegata per la mainnet
finché il modulo non è abilitato lì, e controlla il flag sulla rete di destinazione
prima di offrire un flusso di questo tipo.
:::

## Il modello relayer

Un **relayer** invia la transazione e paga le commissioni. La firma ibrida
(classica + ML-DSA-87) del relayer stesso soddisfa l'ante handler
sull'envelope, quindi la firma PQC dell'account canonico **non** è necessaria
on-chain. L'autorizzazione è invece la firma della chiave collegata su un
digest di **sign-bytes** con separazione di dominio e protezione anti-replay.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

Il relayer è un account **diverso** da quello del proprietario. Il nonce che
l'authenticator firma è la sequenza propria della chiave collegata, tenuta dalla
chain (vedi [Nonces](#nonces)), non il nonce EVM dell'account.

## Le tre corsie

| Corsia | Messaggio | Sign-bytes | Spende |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | QOR nativo / chiamata EVM dall'indirizzo `0x` dell'account |
| Nativa | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | QOR nativo via `x/bank` dall'account |
| Rotazione chiave | `MsgRotatePQCKey` | `rotationSignBytes` | (ruota la chiave PQC dell'account) |

Gli URL di tipo dei messaggi sono `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos` e
`/qorechain.pqc.v1.MsgRotatePQCKey`.

## Registrare un authenticator Phantom

Il collegamento di una chiave è **firmato dal proprietario** (una normale
transazione ibrida dell'account canonico): `MsgRegisterAuthenticator` indica la
chiave (schema + byte grezzi della pubkey), le `permissions` concesse e una
scadenza di sessione `expiryUnix`. I limiti di spesa si applicano con una
`SpendingRule` tramite `MsgUpdateSpendingRules`:

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

:::caution Una regola limita una chiave solo se esiste
La chain risolve il limite in quest'ordine: la regola propria dell'authenticator
se è impostata ed `enabled`; altrimenti la prima regola `enabled` dell'account;
altrimenti **nessuna, e allora non c'è alcun limite**. Una regola memorizzata con
`enabled: false` non è un limite pari a zero: è assenza di limite.
`MsgRegisterAuthenticator` non contiene alcuna regola, quindi una chiave
collegata solo con quel messaggio è limitata unicamente da una regola a livello di
account. Imposta una regola in modo deliberato con `MsgUpdateSpendingRules` e
registra soltanto i permessi di cui la chiave ha bisogno. Un limite circoscrive il
danno che una chiave collegata può fare; non sostituisce la revoca della chiave.
:::

Per disattivare una chiave all'istante, il proprietario trasmette
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## Spendere da Phantom (corsia Nativa, tramite un relayer)

Una volta collegata la chiave, il browser costruisce un `MsgExecuteCosmos`
pronto per il relayer: `buildPhantomExecuteCosmos` ricostruisce il digest con
separazione di dominio, lo fa firmare da Phantom (`signMessage`) e restituisce
il messaggio `{ typeUrl, value }`.

**Browser (l'utente Phantom):**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**Server (il relayer):** firma l'envelope con il **proprio** account tramite il
percorso ibrido (`signAndBroadcastHybrid`, passando `rest`) e paga le
commissioni. La chiave ML-DSA-87 del relayer deve essere registrata, come quella
di qualsiasi account. La firma dell'authenticator all'interno del messaggio è
l'autorizzazione a spendere dall'account del proprietario.

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

// The relayer's OWN account: a different account than the owner.
const mnemonic = process.env.RELAYER_MNEMONIC!;
const relayer = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(relayer.address, mnemonic);

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(relayer.address);

// `msgExecute` is the message decoded from the request. The relayer pays fees.
const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [msgExecute],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});
console.log(result.transactionHash);
```

Una versione end-to-end eseguibile (con una chiave ed25519 locale al posto di
Phantom) è l'esempio
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).

## Spendere da MetaMask (corsia EVM)

Una chiave MetaMask viene collegata tramite il suo **indirizzo ETH da 20 byte**
(schema `secp256k1`) con `registerEthAuthenticatorMsg` e autorizza le spese con
una firma `personal_sign` EIP-191 da 65 byte sullo stesso tipo di digest.

**1) Il proprietario collega l'indirizzo MetaMask** (firmato dal proprietario,
ibrido):

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask autorizza un trasferimento EVM** — `buildMetaMaskExecuteEvm`
costruisce il digest, richiede `personal_sign` (EIP-191) al provider e
restituisce un `MsgExecuteEVM` pronto per il relayer:

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: authSequence,         // the linked key's authenticator sequence (see Nonces) — NOT the EVM nonce
  digestVersion: "v2",         // from chain v3.2.3 (see "Sign-bytes"); use resolveEvmAuthDigestVersion
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos` funziona allo stesso modo per la corsia Nativa
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = la sequenza per-authenticator).
Esistono compositori di basso livello corrispondenti — `executeEvmMsg`,
`executeCosmosMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
`rotatePqcKeyMsg` — se gestisci chiavi e firme in autonomia.

## Sign-bytes (byte per byte)

Due helper sui byte: `BE64(n)` è un intero big-endian da 8 byte; `LP(bytes)` è
`BE64(len) ‖ bytes` (con prefisso di lunghezza).

**Corsia EVM** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
restituisce un digest da 32 byte:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` è il destinatario in `0x`-hex, `value` la stringa decimale in wei, `data`
la calldata grezza.

**Corsia EVM, v2 (chain v3.2.3)** — `evmAuthSignBytesV2({ …, gasLimit })` aggiunge
il gas limit della chiamata, così un relayer non può riproporre una firma valida
con un limite diverso. La chain verifica esattamente una forma per blocco: v1
prima dell'upgrade v3.2.3, v2 da esso in poi. `resolveEvmAuthDigestVersion({ rest })`
restituisce `"v2"` una volta che la rete ha applicato la v3.2.3 e `"v1"` prima, e
`buildPhantomExecuteEvm` / `buildMetaMaskExecuteEvm` accettano `digestVersion`
(predefinito `"v1"`, quindi passa `"v2"` su una rete alla v3.2.3 o successiva).
`gasLimit` deve essere diverso da zero.

```text
sha256( "qorechain-evm-auth-v2"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) ‖ BE64(gasLimit) )
```

**Corsia Nativa** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
restituisce un digest da 32 byte:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` è la stringa canonica a moneta singola (es. `100uqor`).

**Rotazione** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
restituisce la stringa che entrambe le chiavi firmano (in UTF-8):

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonces {#nonces}

Entrambe le corsie usano la **sequenza per-authenticator** per `(account, pubkey)`:
un contatore che la chain tiene per ogni chiave collegata, parte da 0 e viene
incrementato a ogni esecuzione riuscita.

- `MsgExecuteEVM.nonce` è questo contatore, **non** il nonce EVM dell'account
  (`eth_getTransactionCount`).
- `MsgExecuteCosmos.nonce` è lo stesso tipo di contatore.

Dalla chain v3.2.4 (entrambe le reti servono la route) e dall'SDK 0.10.0 puoi leggere
il contatore invece di tenerne traccia: `fetchAuthNonce({ rest, address, pubkey })` chiama
`GET /qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` e restituisce
`{ nonce, linked }`. Una chiave che non ha mai eseguito legge 0, e il contatore viene
conservato anche per una chiave non più collegata (`linked` indica quale caso). Inviare un valore diverso dal contatore corrente della chain
produce un rifiuto per replay (codice 11 di `abstractaccount`, vedi sotto). Con un SDK o una chain più vecchi, tienine traccia per ogni chiave collegata: 0 per una chiave appena collegata,
+1 dopo ogni esecuzione che la chain accetta.

## Lo schema dei permessi

La chain pubblica la tassonomia canonica dei permessi degli authenticator, così
i client convalidano gli scope senza stringhe hardcoded e rilevano le
divergenze tramite `schema_version`:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

La route REST è `GET /qorechain/abstractaccount/v1/permission_schema`; il
client di query gRPC tipizzato espone gli stessi dati come
`clients.abstractaccount.permissionSchema()`. Il modulo serve anche
`/config`, `/accounts` e `/accounts/{address}`.

## Codici di errore

I fallimenti si decodificano con `decodeTxError`, che fornisce un `kind`
leggibile:

| Codespace | Codice | Kind |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

`hybrid_verify_failed` indica che la firma ML-DSA-87 non è stata verificata. La
firma hedged non ne è la causa (la chain accetta allo stesso modo firme ML-DSA-87
hedged e deterministiche); vedi
[Risoluzione del codice 21](/developer-guide/post-quantum-signing#code-21). È anche
l'errore che compare se un SDK precedente alla 0.6.1 ha codificato in JSON
l'estensione ibrida (aggiorna - vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Rotazione delle chiavi {#key-rotation}

Ruota la chiave ML-DSA-87 di un account verso una nuova chiave dello **stesso**
algoritmo — ad esempio per migrare una chiave legacy derivata dal chain-bridge
(`shake256(mnemonic)`) alla chiave canonica legata all'indirizzo
(`shake256("qorechain:pqc:v1|addr|mnemonic")`):

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

`derivePqcLegacy(mnemonic)` riproduce da sola la coppia di chiavi legacy quando
serve (ad esempio per continuare a firmare finché la rotazione non viene
registrata on-chain).

## Prossimi passi

- [Account e firma PQC](/sdk/concepts/accounts-pqc) — account unificati e
  firma ibrida.
- [Account abstraction](/developer-guide/account-abstraction) — il modulo lato
  chain.
- Esempio eseguibile:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
