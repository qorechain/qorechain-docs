---
slug: /sdk/guides/quantum-safe
title: Standardmäßig quantensicher
sidebar_label: Quantensicher
sidebar_position: 6
---

# Standardmäßig quantensicher

QoreChain behandelt Post-Quanten-Kryptografie als **erstklassiges** Signaturverfahren.
Ein Konto registriert einen **ML-DSA-87-Schlüssel (Dilithium-5, NIST FIPS 204)** on-chain,
woraufhin seine Transaktionen eine **hybride** Signatur tragen können — die übliche
klassische secp256k1-Signatur **plus** eine ML-DSA-87-Signatur. Der Ante-Handler der Chain
verifiziert beide, sodass ein quantensicheres Konto vollständig mit der klassischen
Verifikation kompatibel bleibt und gleichzeitig Schutz gegen einen künftigen quantenbasierten
Angreifer erhält.

Das SDK fasst dies in eine winzige, idempotente Oberfläche zusammen, sodass eine dApp
**standardmäßig quantensicher** wird: ein Aufruf zum PQC-Schutz. Auf den Live-Netzwerken
ist dies für Transaktionen auf dem Native-Pfad nicht optional: Der Schlüssel muss
**explizit** registriert werden (es gibt keine automatische Registrierung bei der ersten
Transaktion), und jede Transaktion auf dem Native-Pfad muss danach die hybride Signatur tragen.

## Status prüfen {#check-status}

`isPqcRegistered` / `getPqcStatus` lesen, ob eine Adresse einen registrierten PQC-Schlüssel
besitzt. Mit dem zusammengesetzten Client aus `createClient` lesen sie über REST
(`GET /qorechain/pqc/v1/account/{address}`, von jedem öffentlichen Endpunkt bereitgestellt); mit
einem reinen `QorClient` verwenden sie die JSON-RPC-Methode `qor_getPQCKeyStatus`, die **die
öffentlichen Endpunkte nicht bereitstellen** (siehe
[den Namensraum `qor_`](/api-reference/json-rpc-qor_-namespace)); übergeben Sie daher gegen
`*.qore.host` den zusammengesetzten Client. Releases vor 0.9.0 verwendeten immer die
Methode `qor_` und scheiterten mit dem JSON-RPC-Fehler `-32601`; lesen Sie dort die REST-Route
direkt.

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

Die Route lautet `GET /qorechain/pqc/v1/account/{address}` (Singular `account`). Sie
antwortet mit `{"found": true, "account": {…}}` für eine registrierte Adresse und
andernfalls mit `{"found": false, "account": null}`; `client.rest.getPqcAccount(address)`
liefert diesen Body, und `fetchPqcStatus({ rest, address })` macht daraus den oben gezeigten
Status. Eine nicht lesbare Antwort (ein HTTP-Fehler, ein Transportfehler) wird nach einem
Wiederholungsversuch als Fehler geworfen: Sie wird nie als „nicht registriert“ gelesen. In 0.8.x rief `getPqcAccount` einen Pfad im Plural
`/accounts/` auf, den die Chain nicht bereitstellt.

Derselbe Status ist auf der EVM-Seite ebenfalls über das Precompile
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
an `0x0000000000000000000000000000000000000A02` lesbar (in `@qorechain/evm` als
`pqcKeyStatus` bereitgestellt), sobald dieses Precompile aktiv ist; im Mainnet ist es nicht
aktiv, und im Testnet wird es als aktiv geführt (geprüft am 27. Oktober 2026; siehe
[Netzwerkstatus](/developer-guide/evm-precompiles#network-status)).

## Registrierung in einem Aufruf {#register-in-one-call}

`ensurePqcRegistered` macht ein Konto quantensicher. Es erstellt und sendet
`MsgRegisterPQCKeyV2` mit dem ML-DSA-87-Public-Key des Signierers. Es ist **idempotent**:
Es liest zuerst den Status des Kontos (über REST, wenn Sie `rest` übergeben), überspringt
die Registrierung, wenn das Konto bereits den Schlüssel dieses Schlüsselpaars hält, und kann
daher bei jedem App-Start sicher aufgerufen werden. Hält das Konto einen *anderen* Schlüssel,
wirft es `PqcKeyMismatchError` und sendet nichts, weil jede mit Ihrem Schlüsselpaar signierte
hybride Transaktion abgelehnt würde. Es registriert nie blind: Wenn der Status nicht gelesen
werden kann, wirft es einen Fehler (übergeben Sie `force: true` nur für ein Konto, von dem Sie
wissen, dass es keinen Schlüssel hat).

Die Registrierung wird klassisch signiert und ist von der Hybrid-Pflicht ausgenommen, sodass
ein neues Konto seinen ersten Schlüssel bootstrappen kann; seit v3.2.3 gilt diese Ausnahme
nur noch für ein Konto ohne Schlüssel (ein Konto, das bereits einen besitzt, muss eine
Registrierung oder Migration hybrid signieren, und die Chain lehnt schwache, degenerierte
oder wiederverwendete Schlüssel ab). Sobald das Netzwerk v3.2.3 angewendet hat, signiert der
Helfer den optionalen **Besitznachweis (Proof of Possession)** mit dem neuen Schlüssel und
hängt ihn an (er liest die Chain-ID aus `chainId` oder vom Node und lässt das Feld in einem
Netzwerk weg, das v3.2.3 nicht angewendet hat, weil ein älterer Node es ablehnt). Er signiert
über einen CosmJS-Signer, das heißt über ein Konto mit Coin-Type 118 (`deriveNativeAccount`);
signieren Sie die Registrierung eines vereinheitlichten eth-nativen Kontos mit `EthNativeSigner` und
`signMode: "classical"` (siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc#hybrid-signing)). Der 2.592 Byte große
Schlüssel benötigt ein Gaslimit von etwa 600.000; der Mindest-Gaspreis des Netzwerks beträgt
0,1 uqor pro Gaseinheit.

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

### Ein Schlüssel, den Sie wiederherstellen können {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` leitet den ML-DSA-87-Schlüssel des Kontos aus seiner
Adresse und Mnemonic ab, sodass ein verlorenes Gerät wiederherstellbar ist und jede Sprache
und jede Wallet denselben Schlüssel ableitet (eine Mnemonic, ein Schlüssel pro Konto). Es
löst die Adresse zuerst in ihre kleingeschriebene Form `qor1…` auf, sodass die `0x`-Form
eines vereinheitlichten Kontos denselben Schlüssel ergibt. Die Entsprechungen:

| Sprache | Funktion | Veröffentlicht |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (liefert ein `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

Die ältere Ableitung (`derivePqcLegacy`, `"bridge"`) ist nicht an das Konto gebunden und
für neue Schlüssel veraltet; die Rotations-Helfer lehnen sie als neuen Schlüssel ab (siehe
[Einen Schlüssel rotieren](#rotate-a-key)).

Registrierung in Python (0.9.0; das Lesen des Status läuft über REST, und der Aufruf wirft
`PqcKeyMismatchError` bei einem anderen registrierten Schlüssel, statt für eine zweite
Registrierung zu bezahlen):

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

Die Helfer für Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) und Java
(`signer.restUrl`) lesen den Status von derselben REST-Route und hängen den
Besitznachweis auf dieselbe Weise an.

Die anderen SDKs signieren hybrid über ihre Builder für hybride Transaktionen
(`build_hybrid_tx` in Python und Rust, `tx.BuildHybridMessages` in Go,
`PqcDx.HybridSendPath` in Java); nur der TypeScript-`TxClient` signiert für Sie hybrid.

:::warning Immer zuerst prüfen lassen
Die Chain lehnt eine zweite Registrierung desselben Schlüssels ab, **nachdem sie die
Gebühr abgezogen hat**. `ensurePqcRegistered` liest daher zuerst den Status, über REST
(`/qorechain/pqc/v1/account/{address}`), und weigert sich zu registrieren, wenn es ihn nicht
feststellen kann. Übergeben Sie `rest` (oder `statusSource` für einen Node, der `qor_*`
bereitstellt, oder einen vorab gelesenen `status`); `force: true` überspringt die Prüfung. In
0.8.x hatte der Helfer keinen REST-Fallback und sendete die Registrierung ungeprüft, sofern Sie
nicht selbst `status` übergaben.
:::

## Hybrid signieren

Mit einem `pqcKeypair` am Client signieren `tx.bankSend(...)` und
`tx.signAndBroadcast([messages], "auto")` hybrid (der Pfad `fee: "auto"` simuliert die
hybride Transaktion und addiert das Gas der Post-Quanten-Verifikation).
Die hybride Signatur wird über die Sign-Bytes-Form berechnet, die das Netzwerk verifiziert (siehe
[Welche Sign-Bytes-Form?](/sdk/concepts/accounts-pqc#sign-bytes-versions)); der Client
fragt das Netzwerk über seinen REST-Endpunkt ab.

`migrateToHybrid` stellt die Registrierung sicher und liefert einen hybriden Sendepfad zurück,
bei dem das Schlüsselpaar bereits an die Builder auf niedrigerer Ebene `buildHybridTx` /
`signAndBroadcastHybrid` gebunden ist, für den Fall, dass Sie Gebühr, Kontonummer und
Sequence selbst verwalten. Übergeben Sie `rest`, damit das SDK die Sign-Bytes-Form
ermitteln kann:

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

Die Chain akzeptiert jede gültige FIPS-204-ML-DSA-87-Signatur, ob hedged oder
deterministisch. Das SDK signiert standardmäßig deterministisch (seit 0.5.1), sodass eine
Transaktion immer dieselbe Signatur und denselben Tx-Hash hat. Schlägt eine Hybrid-Tx mit
`pqc`-Code 21 (`hybrid_verify_failed`) fehl, liegt die Ursache an der Sign-Bytes-Version,
der Chain-ID, einer veralteten PQC-Bibliothek oder einem nicht registrierten oder anderen
Schlüssel, niemals am Hedged-Signieren: siehe
[Fehlerbehebung Code 21](/developer-guide/post-quantum-signing#code-21).

## Einen Schlüssel rotieren {#rotate-a-key}

Um den ML-DSA-87-Schlüssel eines Kontos durch einen anderen Schlüssel desselben
Algorithmus zu ersetzen (zum Beispiel um einen älteren `shake256(mnemonic)`-Schlüssel auf
den kanonischen, adressgebundenen Schlüssel umzustellen oder um einen kompromittierten
Schlüssel stillzulegen), erstellen Sie mit `rotatePqcKeyMsgFromMnemonic` eine
`MsgRotatePQCKey`; beide Schlüssel signieren sie gemeinsam. Das vollständige Beispiel
finden Sie unter [Schlüsselrotation](/sdk/guides/authenticators#key-rotation).

`migratePqcKeyHybrid` sendet die ältere `MsgMigratePQCKey`, die ein Konto zwischen
**Algorithmen** verschiebt, mit der hybriden Signatur, die die Chain ab v3.2.3 von
einem Konto verlangt, das einen Schlüssel hat. `pqcKeypair` ist der Schlüssel, der
**aktuell** registriert ist (der, der ausgetauscht wird), und der Aufrufer liefert die
beiden Eigentumssignaturen (`oldSignature` vom alten Schlüssel, `newSignature` vom neuen
Schlüssel). Das klassische `migratePqcKey` ist veraltet: Ein v3.2.3-Node lehnt eine
klassische Migration von einem Konto mit Schlüssel ab.

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

## In der UI

Das [`@qorechain/react`](/sdk/guides/react)-Kit stellt all dies in React bereit: der
`usePqcStatus`-Hook und die `<QuantumSafeBadge/>`-Komponente zeigen einen **Quantum-safe**-
Indikator an, sobald das verbundene Konto einen registrierten PQC-Schlüssel besitzt. Beide lesen den
Status über `getPqcStatus` mit dem zusammengesetzten Client, sodass sie ihn ab `@qorechain/react`
0.9.0 über REST lesen und gegen die öffentlichen Endpunkte funktionieren; 0.8.x konnte dort
einen Schlüssel nicht bestätigen.
