---
slug: /sdk/guides/authenticators
title: Authenticators y gasto delegado
sidebar_label: Authenticators
sidebar_position: 8
---

# Authenticators y gasto delegado

Los **carriles de authenticator** (SDK 0.7.0, cadena **v3.1.85**) permiten que
una clave externa vinculada — una clave **ed25519** de Phantom, o una clave
**secp256k1** de MetaMask / EVM — gaste desde la ÚNICA cuenta canónica con
**PQC obligatorio** bajo condiciones de mínimo privilegio, con límites de gasto
y revocables, **sin que la clave externa produzca jamás una co-firma ML-DSA**.

Esta es la contraparte en el SDK del módulo de
[abstracción de cuentas](/developer-guide/account-abstraction) de la cadena.

## El modelo de relayer

Un **relayer** envía la transacción y paga las comisiones. La propia firma
híbrida (clásica + ML-DSA-87) del relayer satisface el ante handler en el
sobre, de modo que la firma PQC de la cuenta canónica **no** se necesita
on-chain. La autorización es, en cambio, la firma de la clave vinculada sobre
un digest de **sign-bytes** con separación de dominio y protección contra
replay.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

El relayer es una cuenta **distinta** a la del propietario, por lo que no
incrementa el nonce EVM de la cuenta.

## Los tres carriles

| Carril | Mensaje | Sign-bytes | Gasta |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | QOR nativo / llamada EVM desde la dirección `0x` de la cuenta |
| Nativo | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | QOR nativo vía `x/bank` desde la cuenta |
| Rotación de clave | `MsgRotatePQCKey` | `rotationSignBytes` | (rota la clave PQC de la cuenta) |

Las URL de tipo de mensaje son `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos` y
`/qorechain.pqc.v1.MsgRotatePQCKey`.

## Registrar un authenticator de Phantom

Vincular una clave está **firmado por el propietario** (una transacción híbrida
normal de la cuenta canónica): `MsgRegisterAuthenticator` nombra la clave
(esquema + bytes de la pubkey en crudo), los `permissions` concedidos y una
fecha límite de sesión `expiryUnix`. Los límites de gasto se adjuntan con una
`SpendingRule` mediante `MsgUpdateSpendingRules`:

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

Para desactivar una clave al instante, el propietario difunde
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## Gastar desde Phantom (carril Nativo, mediante un relayer)

Una vez vinculada la clave, el navegador construye un `MsgExecuteCosmos` listo
para el relayer: `buildPhantomExecuteCosmos` reconstruye el digest con
separación de dominio, hace que Phantom lo firme (`signMessage`) y devuelve el
mensaje `{ typeUrl, value }`.

**Navegador (el usuario de Phantom):**

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

**Servidor (el relayer):** firma el sobre con su **propia** cuenta (híbrida,
como es habitual en la ruta Nativa) y paga las comisiones. La firma del
authenticator dentro del mensaje es la autorización para gastar desde la cuenta
del propietario.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rpc: "https://rpc.qore.host",
    rest: "https://api.qore.host",
  },
});

// The relayer's OWN account — a different account than the owner.
const relayer = await deriveNativeAccount(process.env.RELAYER_MNEMONIC!);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const tx = await client.connectTx(signer);

// Decode the message from the request, then broadcast it (relayer pays fees).
const result = await tx.signAndBroadcast([msgExecute], { fee });
console.log(result.transactionHash);
```

Una versión ejecutable de extremo a extremo (con una clave ed25519 local en
lugar de Phantom) es el ejemplo
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).

## Gastar desde MetaMask (carril EVM)

Una clave de MetaMask se vincula por su **dirección ETH de 20 bytes** (esquema
`secp256k1`) con `registerEthAuthenticatorMsg`, y autoriza gastos con una firma
`personal_sign` EIP-191 de 65 bytes sobre el mismo tipo de digest.

**1) El propietario vincula la dirección de MetaMask** (firmado por el
propietario, híbrido):

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

**2) MetaMask autoriza una transferencia EVM** — `buildMetaMaskExecuteEvm`
construye el digest, solicita `personal_sign` (EIP-191) al proveedor y
devuelve un `MsgExecuteEVM` listo para el relayer:

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
  nonce: evmNonce,             // the account's CURRENT EVM nonce — do NOT +1
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos` funciona del mismo modo para el carril Nativo
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = la secuencia por authenticator).
Existen composers de bajo nivel equivalentes — `executeEvmMsg`,
`executeCosmosMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
`rotatePqcKeyMsg` — si gestionas las claves y firmas por tu cuenta.

## Sign-bytes (byte a byte exactos)

Dos helpers de bytes: `BE64(n)` es un entero big-endian de 8 bytes; `LP(bytes)`
es `BE64(len) ‖ bytes` (con prefijo de longitud).

**Carril EVM** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
devuelve un digest de 32 bytes:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` es el destinatario en `0x`-hex, `value` la cadena decimal en wei, `data`
el calldata en crudo.

**Carril Nativo** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
devuelve un digest de 32 bytes:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` es la cadena canónica de una sola moneda (p. ej. `100uqor`).

**Rotación** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
devuelve la cadena que ambas claves firman (su UTF-8):

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonces

- `MsgExecuteEVM.nonce` = el **nonce EVM actual** de la cuenta (el relayer es
  una cuenta distinta y no incrementa el nonce del propietario, así que **no**
  sumes 1).
- `MsgExecuteCosmos.nonce` = la **secuencia por authenticator** para
  `(account, pubkey)` — un contador en el store distinto de la propia secuencia
  de la cuenta, que se incrementa en cada gasto exitoso del carril Nativo.

Equivocarse con el nonce produce un rechazo por replay
(código 11 de `abstractaccount`, ver más abajo).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## El esquema de permisos

La cadena publica la taxonomía canónica de permisos de authenticator para que
los clientes validen los scopes sin hardcodear cadenas, y detecten
desincronizaciones mediante `schema_version`:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

La ruta REST es `GET /qorechain/abstractaccount/v1/permission_schema`; el
cliente de consultas gRPC tipado expone los mismos datos como
`clients.abstractaccount.permissionSchema()`. El módulo también sirve
`/config`, `/accounts` y `/accounts/{address}`.

## Códigos de error

Los fallos se decodifican con `decodeTxError` con un `kind` amigable:

| Codespace | Código | Kind |
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

`hybrid_verify_failed` significa, en la mayoría de los casos, una firma
ML-DSA-87 **hedged** (no determinista) — la cadena solo acepta firmas
deterministas. También es lo que verás si un SDK anterior a 0.6.1 codificó en
JSON la extensión híbrida (actualiza — ver
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Rotación de claves {#key-rotation}

Rota la clave ML-DSA-87 de una cuenta a una nueva clave del **mismo**
algoritmo — por ejemplo, para migrar una clave heredada derivada del
chain-bridge (`shake256(mnemonic)`) a la clave canónica ligada a la dirección
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

`derivePqcLegacy(mnemonic)` reproduce por sí solo el keypair heredado cuando lo
necesites (p. ej. para seguir firmando hasta que la rotación se confirme).

## Siguientes pasos

- [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) — cuentas unificadas y
  firma híbrida.
- [Abstracción de cuentas](/developer-guide/account-abstraction) — el módulo
  del lado de la cadena.
- Ejemplo ejecutable:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
