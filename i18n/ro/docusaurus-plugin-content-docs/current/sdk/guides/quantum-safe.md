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
înregistrată. Dacă primesc clientul compus din `createClient`, citesc prin REST
(`GET /qorechain/pqc/v1/account/{address}`, servit de fiecare endpoint public); dacă
primesc un `QorClient` simplu, folosesc metoda JSON-RPC `qor_getPQCKeyStatus`, pe care
**endpoint-urile publice nu o servesc** (vezi
[spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace)), așa că față de
`*.qore.host` transmite clientul compus. Versiunile anterioare lui 0.9.0 foloseau
întotdeauna metoda `qor_` și eșuau cu eroarea JSON-RPC `-32601`; citește direct ruta
REST acolo.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Ruta este `GET /qorechain/pqc/v1/account/{address}` (`account` la singular). Răspunde
cu `{"found": true, "account": {…}}` pentru o adresă înregistrată și cu
`{"found": false, "account": null}` în caz contrar; `client.rest.getPqcAccount(address)`
returnează acel corp, iar `fetchPqcStatus({ rest, address })` îl transformă în starea
de mai sus. Un răspuns care nu poate fi citit (o eroare HTTP, un eșec de transport)
este aruncat ca eroare după o singură reîncercare: nu este niciodată citit ca
„neînregistrat". În 0.8.x, `getPqcAccount` apela o cale la plural `/accounts/` pe care
lanțul nu o servește.

Aceeași stare este citibilă și pe partea EVM prin precompila
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
de la `0x0000000000000000000000000000000000000A02` (expusă ca
`pqcKeyStatus` în `@qorechain/evm`) odată ce acea precompilă este activă; nu este
activă pe mainnet și este listată ca activă pe testnet (verificat la 27 octombrie 2026; vezi
[Starea rețelei](/developer-guide/evm-precompiles#network-status)).

## Înregistrare într-un singur apel {#register-in-one-call}

`ensurePqcRegistered` face un cont quantum-safe. Construiește și difuzează
`MsgRegisterPQCKeyV2` cu cheia publică ML-DSA-87 a semnatarului. Este **idempotent**:
citește mai întâi starea contului (prin REST când transmiți `rest`), sare peste
înregistrare atunci când contul deține deja cheia acestei perechi de chei și poate fi,
prin urmare, apelat în siguranță la fiecare pornire a aplicației. Când contul deține o
cheie *diferită*, aruncă `PqcKeyMismatchError` și nu trimite nimic, deoarece fiecare
tranzacție hibridă semnată cu perechea ta de chei ar fi refuzată. Nu înregistrează
niciodată orbește: dacă starea nu poate fi citită, aruncă o eroare (transmite
`force: true` doar pentru un cont despre care știi că nu are nicio cheie).

Înregistrarea este semnată clasic și scutită de cerința hibridă, astfel încât un cont
nou își poate iniția prima cheie; începând cu v3.2.3, această scutire acoperă doar un
cont fără cheie (un cont care deține deja una trebuie să semneze hibrid un register
sau un migrate, iar lanțul refuză cheile slabe, degenerate sau refolosite). Odată ce
rețeaua a aplicat v3.2.3, helperul semnează **dovada de posesie** opțională cu noua
cheie și o atașează (citește chain id-ul din `chainId` sau de la nod și omite câmpul pe
o rețea care nu a aplicat v3.2.3, deoarece un nod mai vechi îl refuză). Semnează printr-un
semnatar CosmJS, adică un cont coin-type-118 (`deriveNativeAccount`); pentru un cont
eth-native unificat, semnează înregistrarea cu `EthNativeSigner` și
`signMode: "classical"` (vezi
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### O cheie pe care o poți recupera {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` derivă cheia ML-DSA-87 a contului din adresa
și mnemonicul său, astfel încât un dispozitiv pierdut este recuperabil, iar fiecare
limbaj și portofel derivă aceeași cheie (un mnemonic, o cheie per cont). Rezolvă mai
întâi adresa la forma sa `qor1…` cu litere mici, deci forma `0x` a unui cont unificat
dă aceeași cheie. Echivalentele:

| Limbaj | Funcție | Publicat |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (returnează un `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

Derivarea veche (`derivePqcLegacy`, `"bridge"`) nu este legată de cont și este
depreciată pentru chei noi; helperele de rotire o refuză ca cheie nouă (vezi
[Rotirea unei chei](#rotate-a-key)).

Înregistrarea în Python (0.9.0; citirea stării se face prin REST, iar apelul aruncă
`PqcKeyMismatchError` pentru o altă cheie înregistrată, în loc să plătească pentru o
a doua înregistrare):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Helperele Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) și Java
(`signer.restUrl`) citesc starea din aceeași rută REST și atașează dovada de posesie
în același mod.

Celelalte SDK-uri semnează hibrid prin constructorii lor de tranzacții hibride
(`build_hybrid_tx` în Python și Rust, `tx.BuildHybridMessages` în Go,
`PqcDx.HybridSendPath` în Java); doar `TxClient`-ul TypeScript semnează hibrid pentru tine.

:::warning Lasă-l întotdeauna să verifice mai întâi
Lanțul refuză o a doua înregistrare a aceleiași chei **după ce a încasat taxa**.
`ensurePqcRegistered` citește, prin urmare, mai întâi starea, prin REST
(`/qorechain/pqc/v1/account/{address}`), și refuză să înregistreze când nu poate
stabili. Transmite `rest` (sau `statusSource` pentru un nod care expune `qor_*`, ori un
`status` citit în prealabil); `force: true` omite verificarea. În 0.8.x, helperul nu
avea nicio alternativă REST și difuza înregistrarea fără verificare, cu excepția cazului
în care transmiteai tu `status`.
:::

## Semnare hibridă

Cu un `pqcKeypair` pe client, `tx.bankSend(...)` și
`tx.signAndBroadcast([messages], "auto")` semnează hibrid (calea `fee: "auto"`
simulează tranzacția hibridă și adaugă gazul verificării post-cuantice). Semnătura
hibridă este calculată peste forma de sign-bytes pe care o verifică rețeaua (vezi
[Ce formă de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions)); clientul
întreabă rețeaua prin endpoint-ul său REST.

`migrateToHybrid` asigură înregistrarea și returnează o cale de trimitere hibridă cu
perechea de chei pre-legată la constructorii de nivel inferior `buildHybridTx` /
`signAndBroadcastHybrid`, pentru cazul în care gestionezi singur taxa, numărul contului
și sequence. Transmite `rest` pentru ca SDK-ul să poată determina forma de sign-bytes:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## Rotirea unei chei {#rotate-a-key}

Pentru a înlocui cheia ML-DSA-87 a unui cont cu o altă cheie a **aceluiași** algoritm
(de exemplu, mutarea unei chei vechi `shake256(mnemonic)` la cheia canonică legată de
adresă sau retragerea unei chei compromise), construiește un `MsgRotatePQCKey` cu
`rotatePqcKeyMsgFromMnemonic`; ambele chei îl semnează dual. Vezi
[Rotirea cheilor](/sdk/guides/authenticators#key-rotation) pentru exemplul complet.

`migratePqcKeyHybrid` difuzează mai vechiul `MsgMigratePQCKey`, care mută un cont între
**algoritmi**, cu semnătura hibridă pe care lanțul o cere, începând cu v3.2.3, de la un
cont care are o cheie. `pqcKeypair` este cheia care este **în prezent** înregistrată
(cea care este scoasă din uz), iar apelantul furnizează cele două semnături de
proprietate (`oldSignature` de cheia veche, `newSignature` de cheia nouă).
`migratePqcKey` clasic este depreciat: un nod v3.2.3 refuză o migrare clasică de la un
cont care are o cheie.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## În interfața utilizator

Kit-ul [`@qorechain/react`](/sdk/guides/react) expune toate acestea în React: hook-ul
`usePqcStatus` și componenta `<QuantumSafeBadge/>` afișează un indicator **Quantum-safe**
ori de câte ori contul conectat are o cheie PQC înregistrată. Ambele citesc starea
prin `getPqcStatus` cu clientul compus, deci începând cu `@qorechain/react` 0.9.0 o
citesc prin REST și funcționează față de endpoint-urile publice; 0.8.x nu putea
confirma acolo o cheie.
