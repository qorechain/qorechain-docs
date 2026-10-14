---
slug: /sdk/guides/quantum-safe
title: Quantum-safe în mod implicit
sidebar_label: Quantum-safe
sidebar_position: 6
---

# Quantum-safe în mod implicit

QoreChain tratează criptografia post-cuantică drept o schemă de semnătură **de prim rang**.
Un cont înregistrează pe lanț o cheie **ML-DSA-87 (Dilithium-5, NIST FIPS 204)**,
după care tranzacțiile sale pot purta o semnătură **hibridă** — obișnuita
semnătură clasică secp256k1 **plus** o semnătură ML-DSA-87. Ante handler-ul lanțului
verifică ambele, astfel încât un cont quantum-safe rămâne pe deplin compatibil cu
verificarea clasică, câștigând totodată protecție împotriva unui viitor adversar
cuantic.

SDK-ul împachetează acest lucru într-o suprafață minusculă, idempotentă, astfel încât o
dApp devine **quantum-safe în mod implicit**: un singur apel pentru a fi protejat PQC.
Pe rețelele live, acest lucru nu este opțional pentru tranzacțiile pe calea Native:
cheia trebuie înregistrată **explicit** (nu există înregistrare automată la prima
tranzacție), iar fiecare tranzacție pe calea Native trebuie apoi să poarte semnătura
hibridă.

## Verificarea stării {#check-status}

`isPqcRegistered` / `getPqcStatus` citesc dacă o adresă are o cheie PQC
înregistrată prin metoda JSON-RPC `qor_getPQCKeyStatus`. Acceptă fie un
`QorClient`, fie clientul compus din `createClient`. **Endpoint-urile publice
nu servesc spațiul de nume `qor_`** (vezi
[spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace)), așa că față de
`*.qore.host` aceste helpere eșuează cu eroarea JSON-RPC `-32601`. Citește starea
prin REST în schimb:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

Ruta este `GET /qorechain/pqc/v1/account/{address}` (`account` la singular). Răspunde
cu `{"found": true, "account": {…}}` pentru o adresă înregistrată și cu
`{"found": false, "account": null}` în caz contrar. Nu folosi
`client.rest.getPqcAccount` pentru asta: apelează calea la plural `/accounts/`, pe
care lanțul nu o servește.

`isPqcRegistered(client, address)` și `getPqcStatus(client, address)` (cu opțiunea
`statusSource`) rămân apelurile potrivite față de un nod care servește spațiul de
nume `qor`; rezultatul lor este
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

Aceeași stare este citibilă și pe partea EVM prin precompila
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
de la `0x0000000000000000000000000000000000000A02` (expusă ca
`pqcKeyStatus` în `@qorechain/evm`) odată ce acea precompilă este activă; încă nu
este activă pe mainnet sau testnet (vezi
[Starea rețelei](/developer-guide/evm-precompiles#network-status)). Următoarea
versiune patch a SDK-ului revine la ruta REST de mai sus atunci când primește un
client care expune `.rest` (precum clientul compus) și aruncă o eroare în loc să
raporteze „neînregistrat” atunci când starea nu poate fi citită.

## Înregistrare într-un singur apel

`ensurePqcRegistered` face un cont quantum-safe. Construiește și difuzează
`MsgRegisterPQCKeyV2` cu cheia publică ML-DSA-87 a semnatarului și cheia publică
ECDSA a contului. Este **idempotent** atunci când îi dai un `status` citit în
prealabil (sau un `statusSource`): sare peste înregistrare atunci când cheia este
deja înregistrată, astfel încât poate fi apelat în siguranță la fiecare pornire a
aplicației.

Înregistrarea este semnată clasic și scutită de cerința hibridă, astfel încât un cont
nou își poate iniția prima cheie. Semnează printr-un semnatar CosmJS, adică un cont
coin-type-118 (`deriveNativeAccount`); pentru un cont eth-native unificat, semnează
înregistrarea cu `EthNativeSigner` și `signMode: "classical"` (vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). Cheia de 2.592
de octeți necesită o limită de gaz de aproximativ 600.000; prețul minim al gazului în
rețea este de 0,1 uqor per unitate de gaz.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## Semnare hibridă

`migrateToHybrid` asigură înregistrarea și returnează o cale de trimitere hibridă cu
keypair-ul pre-legat la constructorii existenți `buildHybridTx` / `signAndBroadcastHybrid`.
Transmite `rest` pentru ca SDK-ul să poată determina ce formă hibridă a sign-bytes
verifică rețeaua (vezi
[Ce formă de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

Lanțul acceptă orice semnătură ML-DSA-87 FIPS-204 validă, hedged sau
deterministă. SDK-ul semnează implicit determinist (începând cu 0.5.1), astfel încât
o tranzacție are întotdeauna aceeași semnătură și același hash de tx. Dacă o tx
hibridă eșuează cu codul `pqc` 21 (`hybrid_verify_failed`), cauza este versiunea
sign-bytes, chain-id-ul, o bibliotecă PQC depășită sau o cheie neînregistrată ori
diferită, niciodată semnarea hedged: vezi
[Depanare cod 21](/developer-guide/post-quantum-signing#code-21).

## Rotirea unei chei

Pentru a înlocui cheia ML-DSA-87 a unui cont cu o altă cheie a **aceluiași** algoritm
(de exemplu, mutarea unei chei vechi `shake256(mnemonic)` la cheia canonică legată de
adresă sau retragerea unei chei compromise), construiește un `MsgRotatePQCKey` cu
`rotatePqcKeyMsgFromMnemonic`; ambele chei îl semnează dual. Vezi
[Rotirea cheilor](/sdk/guides/authenticators#key-rotation) pentru exemplul complet.

`migratePqcKey` difuzează mai vechiul `MsgMigratePQCKey`, care mută un cont între
**algoritmi** și necesită ambele semnături furnizate de apelant:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## În interfața utilizator

Kit-ul [`@qorechain/react`](/sdk/guides/react) expune toate acestea în React: hook-ul
`usePqcStatus` și componenta `<QuantumSafeBadge/>` afișează un indicator **Quantum-safe**
ori de câte ori contul conectat are o cheie PQC înregistrată. Ambele citesc starea
prin `getPqcStatus`, așa că față de endpoint-urile publice (fără spațiul de nume
`qor_`) nu pot confirma astăzi o cheie; vezi limitele rețelelor live de pe pagina
React.
