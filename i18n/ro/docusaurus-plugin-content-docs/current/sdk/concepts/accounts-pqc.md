---
slug: /sdk/concepts/accounts-pqc
title: Conturi și semnarea PQC
sidebar_label: Conturi și PQC
sidebar_position: 2
---

# Conturi și semnarea PQC

Conturile QoreChain sunt derivate dintr-un singur mnemonic BIP-39. Există două
modele de cont, ambele pe deplin suportate:

- **Derivare HD pe lane separate (legacy/implicit)** — același mnemonic
  produce un cont nativ (coin type 118), un cont EVM (coin type 60) și un cont
  SVM (coin type 501) prin căi de derivare independente. Trei chei, trei
  adrese.
- **Conturi unificate eth-native** (SDK 0.6.0, chain v3.1.83) — O SINGURĂ
  cheie `eth_secp256k1` este O SINGURĂ identitate de 20 de bytes, redată în
  toate cele trei codificări de adresă, cu un singur sold comun. Vezi
  [Conturi unificate](#unified-accounts).

## Derivare HD (legacy/implicit, coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

Mnemonicul este validat (atât cuvintele, **cât și** suma de control) înainte ca
orice cheie să fie derivată, astfel încât o greșeală de tastare generează o
eroare, nu produce în tăcere un cont greșit. Poți valida explicit cu
`validateMnemonic(mnemonic)`.

### Scheme de derivare

| Tip | Curbă | Cale | Adresă |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` din `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 al cheii publice de 32 de bytes |

Transmite un index de cont pentru a deriva conturi suplimentare. În
TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

În Python/Go/Rust, indexul este un argument poziţional
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Notă privind testele de tip known-answer

Schemele de derivare sunt deterministe și acoperite de teste known-answer în
toate cele patru SDK-uri, astfel încât același mnemonic produce adrese
identice în TypeScript, Python, Go și Rust. Acest lucru îți permite să derivi
într-un limbaj și să verifici în altul.

> Această derivare pe lane separate (`deriveNativeAccount` la coin type 118,
> plus `deriveEvmAccount` / `deriveSvmAccount`) este modelul **legacy/implicit**
> și rămâne suportat și neschimbat. Conturile unificate de mai jos sunt un
> model de identitate suplimentar, opțional.

## Conturi unificate (eth-native) {#unified-accounts}

Începând cu SDK **0.6.0** (chain v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
derivă O SINGURĂ cheie `eth_secp256k1` pe calea HD Ethereum
`m/44'/60'/0'/0/{index}`, ale cărei 20 de bytes de adresă
(`keccak256(pubkey)[12:]`) reprezintă ACEEAȘI identitate redată în trei
moduri:

| Lane | Codificare |
| --- | --- |
| Native | bech32 cu prefixul `qor` (`qor1…`) |
| EVM | `0x` + hex checksum mixed-case EIP-55 |
| SVM | base58 al celor 20 de bytes completați la dreapta cu 12 bytes zero (32 de bytes) |

Un depozit către **oricare** dintre cele trei ajunge într-un **singur** sold,
iar cheia este semnatarul pe fiecare lane (pe lane-ul EVM, în interiorul unei
[ferestre de autorizare](/sdk/guides/evm#evm-window); lane-ul de tranzacții SVM
este în prezent dezactivat la nivelul întregii rețele, deci SVM este astăzi
doar în citire):

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` face același lucru pornind de la o cheie
privată secp256k1 brută de 32 de bytes.

### Derivarea seed-ului PQC

Perechea de chei ML-DSA-87 a contului este derivată determinist și este
**legată de adresă**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

astfel încât poate fi recuperată din `{ address, mnemonic }` și este
identică în toate SDK-urile QoreChain, indiferent de limbaj. (Pentru
`unifiedAccountFromSeed`, slotul mnemonicului este `"seed:" + hex(seed32)`.)
Începând cu SDK 0.8.3, `derivePqcCanonical(account, mnemonic)` rezolvă mai
întâi `account` la forma sa `qor1…` cu litere mici (`canonicalAccount`), astfel
încât un bech32 cu litere mari sau forma `0x` a aceluiași cont produce aceeași
cheie. Fiecare limbaj are aceeași funcție (Python `derive_pqc_canonical`, Go
`authenticator.DerivePQCCanonical`, Rust `try_derive_pqc_canonical`, Java
`Authenticator.derivePqcCanonical`; vezi
[tabelul din ghidul Semnare hibridă](/sdk/guides/quantum-safe#canonical-derivation)),
iar același `{ address, mnemonic }` produce aceeași cheie în toate (verificat
pentru TypeScript, Python, Go și Rust în octombrie 2026).

### Trimiterea pe lane-ul Native cu cheia eth

Un cont unificat semnează tranzacțiile pe calea Native cu schema
`eth_secp256k1`: semnătura clasică este secp256k1 peste **keccak256** al
bytes-ilor SignDoc (nu sha256), iar cheia publică din `SignerInfo` folosește
URL-ul de tip `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Calea hibridă
(`signHybridEth`, sau `EthNativeSigner` cu `signMode: "hybrid"` implicit)
atașează suplimentar extensia `PQCHybridSignature` ML-DSA-87, obligatorie pe
rețelele live.

Sunt necesare două lucruri înainte de primul transfer hibrid. Mai întâi, cheia
ML-DSA-87 a contului trebuie **înregistrată** (o singură dată). Înregistrarea
este singura tranzacție semnată clasic și scutită de regula hibridă: semneaz-o
cu `signMode: "classical"`. `publicKey` al contului este un șir hex `0x`, deci
decodează-l în bytes pentru `ecdsaPubkey`. În al doilea rând, transmite `rest`
semnatarului, ca să poată întreba rețeaua ce
[formă a sign-bytes](#sign-bytes-versions) verifică (pe `qorechain-vladi` și
`qorechain-diana` aruncă o eroare în loc să ghicească). Necesită SDK 0.8.1 sau
mai nou (0.9.0 pentru funcțiile ajutătoare de dovadă de posesie) și
`npm i @cosmjs/stargate`:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

Pentru control la nivel inferior, `signHybridEth(params)` /
`signClassicalEth(params)` returnează bytes-ii `TxRaw` asamblați și
artefactele de semnare, iar `accountAuthInfo(baseAccount)` citește
`account_number` / `sequence` dintr-un `BaseAccount` protobuf a cărui cheie
publică on-chain folosește URL-ul de tip `eth_secp256k1` (un cont REST JSON
are nevoie ca mai întâi câmpurile să-i fie mapate, așa cum face `authInfo` mai
sus).

:::caution Actualizează la SDK 0.6.1+ pentru tranzacții hibride
SDK **0.6.1** a corectat o eroare de codificare critică pentru consens:
extensia de tx-body `/qorechain.pqc.v1.PQCHybridSignature` era serializată
JSON în `Any.value`, iar chain-ul **respingea aceste tranzacții la CheckTx**
(eroare de parsare a tranzacției). Acum este codificată protobuf (valoarea
extensiei începe cu `0x08`) în toate cele cinci limbaje. Orice tranzacție
hibridă — inclusiv lane-ul eth-native — construită cu SDK ≤ 0.6.0 este
respinsă on-chain: actualizează la 0.6.1 sau o versiune ulterioară.
:::

### Phantom și alte portofele externe {#phantom}

:::danger Eliminat în SDK 0.8.0
SDK-urile 0.6.0 - 0.7.0 conțineau `connectPhantomUnified()` și `unifiedAccountFromPhantomSignature()` (eliminate în 0.8.0; în Python și Rust, `unified_account_from_phantom_signature`, în Go, `unified.UnifiedAccountFromPhantomSignature`, în Java, `UnifiedAccounts.unifiedAccountFromPhantomSignature`), care derivau cheia de cheltuire a unui cont dintr-o semnătură Phantom peste mesajul fix `QoreChain unified account derivation v1` urmat de cheia publică base58 a portofelului.
O semnătură ed25519 este deterministă și orice site poate cere portofelului să semneze același mesaj, deci oricine a obținut vreodată semnătura poate reconstrui cheile secp256k1 și ML-DSA ale contului. Ambele funcții aruncă acum o eroare.

Dacă ați creat un cont astfel, considerați-l compromis de acum: creați un cont nou dintr-un mnemonic, mutați fondurile în el și apoi legați Phantom de noul cont ca autentificator (vezi mai jos). Contul vechi nu poate fi reparat, pentru că adresa lui este legată de cheia expusă, iar o rotire a cheii PQC înlocuiește doar jumătatea post-cuantică. Folosiți SDK 0.8.2 sau mai nou.
:::

Ca o cheie Phantom (sau MetaMask) să cheltuiască dintr-un cont, folosiți **benzile de autentificator**: înregistrați cheia portofelului cu `MsgRegisterAuthenticator`, apoi cheltuiți din contul PQC canonic prin `MsgExecuteCosmos` / `MsgExecuteEVM` sub o permisiune și o `SpendingRule`. Contul își păstrează propriile chei derivate din mnemonic, iar cheia portofelului poate fi revocată oricând. Vezi [Autentificatori și cheltuieli delegate](/sdk/guides/authenticators). Rețineți că modulul `abstractaccount` care oferă aceste benzi este oprit pe mainnet (`GET /qorechain/abstractaccount/v1/config` arată `enabled: false`; pe testnet este activat), deci o cheie de portofel nu poate fi încă legată pe mainnet; până atunci folosiți direct noul cont din mnemonic.

## Criptografie post-cuantică (PQC)

QoreChain suportă semnături **ML-DSA-87** (Dilithium-5, FIPS 204). SDK-ul
expune primitivele direct.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Constantele de lungime exportate (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) îți permit să validezi dimensiunile buffer-elor.

> Dedesubt, primitivele PQC provin din
> [**qorechain-pqc**](/developer-guide/post-quantum-signing) — biblioteca
> open-source, bazată exclusiv pe standarde, care încapsulează implementări
> auditate FIPS-204/203/202 în spatele unui API unic și consistent, în șase
> limbaje (JavaScript/TypeScript, Rust, Go, C, Python, Java). Apelează-o
> direct atunci când ai nevoie de primitivele brute sau de formatarea
> `hybridSignBytes` în afara SDK-ului.

### Semnatari pluggable

Pentru compoziție, SDK-ul oferă o abstracție `Signer`, plus implementările
`PqcSigner` și `HybridSigner`, și un tip `SignatureMode` (`"classical" | "pqc" |
"hybrid"`). Folosește-le atunci când vrei să conectezi semnarea PQC în propriul
tău flux, în loc să apelezi direct primitivele.

## Semnarea hibridă {#hybrid-signing}

O tranzacție **hibridă** poartă atât o semnătură clasică secp256k1, cât și o
semnătură ML-DSA-87, astfel încât rămâne validă sub verificare clasică, în
timp ce câștigă protecție post-cuantică. Partea post-cuantică călătorește ca
o extensie `PQCHybridSignature` pe tranzacție.

:::caution Semnarea hibridă este obligatorie pe calea Native
Începând cu versiunea de chain **v3.2.0** (mainnet-ul rulează v3.2.4, testnet-ul v3.2.6), valoarea implicită a rețelei este `hybrid_signature_mode = required`,
cu `allow_classical_fallback = false`. Semnarea hibridă prin `buildHybridTx` /
`signAndBroadcastHybrid` (transmite `rest`), sau `signHybridEth` /
`EthNativeSigner` pentru conturile unificate eth-native, este **obligatorie**
pentru tranzacțiile pe calea Native; tranzacțiile Native doar-clasice sunt
respinse on-chain. Tranzacțiile EVM sunt un lane separat, dar începând cu
v3.2.0 sunt admise doar de la un cont cu o cheie ML-DSA-87 înregistrată și cu o
[fereastră de autorizare](/sdk/guides/evm#evm-window) deschisă.
:::

:::caution Tranzacțiile hibride cu SDK ≤ 0.6.0 sunt respinse
Versiunea 0.6.1 a corectat codificarea extensiei `PQCHybridSignature` (JSON →
protobuf, critică pentru consens). Tranzacțiile hibride construite cu SDK
0.6.0 sau anterior eșuează la CheckTx cu o eroare de parsare a tranzacției —
actualizează la 0.6.1+.
:::

Constructorul end-to-end pentru un cont coin-type-118 este
`signAndBroadcastHybrid` (sau `buildHybridTx` pentru a construi fără a
difuza). Are nevoie de semnatarul clasic, de perechea de chei ML-DSA-87 a
contului, de numărul contului și de sequence, precum și de `rest`.
Pentru un cont coin-type-118 în TypeScript, cea mai scurtă cale este `TxClient`-ul
hibrid (SDK 0.9.0): transmite perechea de chei la conectare și fiecare
tranzacție este semnată hibrid, iar `fee: "auto"` simulează chiar tranzacția
hibridă (doar înregistrarea rămâne clasică):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

Pentru control explicit asupra taxei, a numărului contului și a sequence, folosește
`signAndBroadcastHybrid` (SDK 0.8.1 sau mai nou, `npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### Condiție prealabilă on-chain

Înainte ca o tranzacție hibridă să poată fi verificată PQC, cheia publică PQC a
semnatarului trebuie să fie **înregistrată** prin `MsgRegisterPQCKeyV2`
(semnată clasic, scutită de regula hibridă pentru un cont care nu are încă nicio
cheie). O fac
`ensurePqcRegistered` / `buildRegisterPqcKeyMsg` din SDK,
`qorechaind tx pqc register-key` sau un portofel QoreChain.
`includePqcPublicKey: true` doar încapsulează cheia în extensie; **nu** o
înregistrează, iar chain-ul nu înregistrează o cheie la prima utilizare. Începând
cu v3.2.3, chain-ul refuză cheile slabe, degenerate și refolosite și acceptă o
dovadă de posesie opțională (vezi
[Reguli de integritate a cheii](/architecture/post-quantum-security#key-integrity)). În SDK
0.9.0, `ensurePqcRegistered` atașează singur dovada odată ce rețeaua a aplicat
v3.2.3, iar `signProofOfPossession` / `verifyProofOfPossession` sunt exportate
pentru înregistrările construite manual; constructorii 0.8.x înregistrează fără
dovadă, ceea ce este permis.

### Ce formă a sign-bytes? {#sign-bytes-versions}

Jumătatea ML-DSA-87 a unei tranzacții hibride este semnată peste una dintre
două forme de bytes, iar o rețea o verifică exact pe una la un anumit height:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` este corpul tranzacției fără extensia PQC, iar `A` sunt bytes-ii
`AuthInfo`. `qorechain-vladi` și `qorechain-diana` verifică ambele **v2**.
Trecerea a fost înregistrată sub numele de upgrade `v3.2.0` pe mainnet și sub
`v3.1.98` (apoi `v3.2.0`) pe testnet, deci un client trebuie să interogheze
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pentru **ambele** nume și să
folosească v2 dacă oricare dintre height-uri este peste zero. SDK-ul face acest
lucru pentru tine: fiecare constructor hibrid primește `signBytesVersion`
(`"auto"` implicit, sau `"v1"` / `"v2"`), iar `"auto"` are nevoie de URL-ul REST
al rețelei (`rest`) pe aceste două chain-uri: aruncă o eroare în loc să
ghicească. Căile de nivel înalt reapelează rezolvarea și reîncearcă o dată
când chain-ul refuză semnătura cu codul `pqc` 21. În testele unitare,
transmite `signBytesVersion` explicit, ca testul să nu depindă de un nod live.
Vezi și [Depanarea codului 21](/developer-guide/post-quantum-signing#code-21).

### Contractul tranzacției hibride (nivel general)

Tranzacția este semnată clasic peste bytes-ii standard de semnare (care
**exclud** extensia PQC), iar semnătura ML-DSA-87 este calculată și atașată
ca extensia `PQCHybridSignature`. Deoarece bytes-ii clasici de semnare exclud
extensia, semnătura clasică rămâne validă indiferent dacă un verificator
înțelege sau nu partea PQC. Funcțiile ajutătoare de nivel inferior
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) și constructorii
end-to-end (`buildHybridTx`, `signAndBroadcastHybrid`) sunt exportate pentru
utilizare avansată.

> Trimiterea tranzacției hibride este calea obligatorie pe rețeaua live
> pentru tranzacțiile cosmos. Primitivele locale de semnare/verificare și
> funcțiile ajutătoare de construire a tranzacțiilor sunt disponibile deja
> astăzi.

## Rotația cheii PQC

Începând cu SDK 0.7.0, un cont își poate roti cheia ML-DSA-87 către o cheie
nouă, de **același algoritm** — migrând canonic o cheie legacy
`shake256(mnemonic)` către cheia legată de adresă
`shake256("qorechain:pqc:v1|addr|mnemonic")` — prin
`rotatePqcKeyMsgFromMnemonic` (ambele chei semnează dual bytes-ii rotației).
Vezi [Rotația cheii](/sdk/guides/authenticators#key-rotation) în ghidul
Autentificatori pentru un exemplu complet.

## Identificatori de algoritm

SDK-ul exportă ID-uri de algoritm și funcții ajutătoare pentru lucrul la
nivel de protocol: `AlgorithmUnspecified`, `AlgorithmDilithium5`,
`AlgorithmMLKEM1024`, `algorithmName(id)` și `isSignatureAlgorithm(id)`.
