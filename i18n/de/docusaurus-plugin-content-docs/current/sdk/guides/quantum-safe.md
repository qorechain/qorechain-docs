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

`isPqcRegistered` / `getPqcStatus` lesen über die JSON-RPC-Methode
`qor_getPQCKeyStatus`, ob eine Adresse einen registrierten PQC-Schlüssel besitzt. Sie
akzeptieren entweder einen `QorClient` oder den zusammengesetzten Client aus `createClient`.
**Die öffentlichen Endpunkte stellen den Namensraum `qor_` nicht bereit** (siehe
[den Namensraum `qor_`](/api-reference/json-rpc-qor_-namespace)); gegen
`*.qore.host` schlagen diese Helfer daher mit dem JSON-RPC-Fehler `-32601` fehl. Lesen Sie
den Status stattdessen über REST:

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

Die Route lautet `GET /qorechain/pqc/v1/account/{address}` (Singular `account`). Sie
antwortet mit `{"found": true, "account": {…}}` für eine registrierte Adresse und
andernfalls mit `{"found": false, "account": null}`. Verwenden Sie dafür nicht `client.rest.getPqcAccount`:
Es ruft den Pfad im Plural `/accounts/` auf, den die Chain nicht bereitstellt.

`isPqcRegistered(client, address)` und `getPqcStatus(client, address)` (mit der Option
`statusSource`) bleiben die richtigen Aufrufe gegen einen Node, der den Namensraum `qor`
bereitstellt; ihr Ergebnis ist
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

Derselbe Status ist auf der EVM-Seite ebenfalls über das Precompile
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
an `0x0000000000000000000000000000000000000A02` lesbar (in `@qorechain/evm` als
`pqcKeyStatus` bereitgestellt), sobald dieses Precompile aktiv ist; auf Mainnet und
Testnet ist es noch nicht aktiv (siehe
[Netzwerkstatus](/developer-guide/evm-precompiles#network-status)). Das nächste
SDK-Patch-Release greift auf die obige REST-Route zurück, wenn ihm ein Client übergeben wird,
der `.rest` bereitstellt (etwa der zusammengesetzte Client), und wirft einen Fehler, statt
„nicht registriert“ zu melden, wenn der Status nicht gelesen werden kann.

## Registrierung in einem Aufruf

`ensurePqcRegistered` macht ein Konto quantensicher. Es erstellt und sendet
`MsgRegisterPQCKeyV2` mit dem ML-DSA-87-Public-Key des Signierers und dem ECDSA-Public-Key
des Kontos. Es ist **idempotent**, wenn Sie ihm einen vorab gelesenen `status` (oder eine
`statusSource`) übergeben: Es überspringt die Registrierung, wenn der Schlüssel bereits
registriert ist, sodass es bei jedem App-Start sicher aufgerufen werden kann.

Die Registrierung wird klassisch signiert und ist von der Hybrid-Pflicht ausgenommen, sodass
ein neues Konto seinen ersten Schlüssel bootstrappen kann. Sie wird über einen CosmJS-Signer
signiert, das heißt über ein Konto mit Coin-Type 118 (`deriveNativeAccount`); signieren Sie
die Registrierung eines vereinheitlichten eth-nativen Kontos mit `EthNativeSigner` und
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

## Hybrid signieren

`migrateToHybrid` stellt die Registrierung sicher und liefert einen hybriden Sendepfad zurück,
bei dem das Schlüsselpaar bereits an die vorhandenen Builder `buildHybridTx` /
`signAndBroadcastHybrid` gebunden ist. Übergeben Sie `rest`, damit das SDK ermitteln kann,
welche hybride Sign-Bytes-Form das Netzwerk verifiziert (siehe
[Welche Sign-Bytes-Form?](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

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

Die Chain akzeptiert jede gültige FIPS-204-ML-DSA-87-Signatur, ob hedged oder
deterministisch. Das SDK signiert standardmäßig deterministisch (seit 0.5.1), sodass eine
Transaktion immer dieselbe Signatur und denselben Tx-Hash hat. Schlägt eine Hybrid-Tx mit
`pqc`-Code 21 (`hybrid_verify_failed`) fehl, liegt die Ursache an der Sign-Bytes-Version,
der Chain-ID, einer veralteten PQC-Bibliothek oder einem nicht registrierten oder anderen
Schlüssel, niemals am Hedged-Signieren: siehe
[Fehlerbehebung Code 21](/developer-guide/post-quantum-signing#code-21).

## Einen Schlüssel rotieren

Um den ML-DSA-87-Schlüssel eines Kontos durch einen anderen Schlüssel desselben
Algorithmus zu ersetzen (zum Beispiel um einen älteren `shake256(mnemonic)`-Schlüssel auf
den kanonischen, adressgebundenen Schlüssel umzustellen oder um einen kompromittierten
Schlüssel stillzulegen), erstellen Sie mit `rotatePqcKeyMsgFromMnemonic` eine
`MsgRotatePQCKey`; beide Schlüssel signieren sie gemeinsam. Das vollständige Beispiel
finden Sie unter [Schlüsselrotation](/sdk/guides/authenticators#key-rotation).

`migratePqcKey` sendet die ältere `MsgMigratePQCKey`, die ein Konto zwischen
**Algorithmen** verschiebt und bei der beide Signaturen vom Aufrufer geliefert werden
müssen:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## In der UI

Das [`@qorechain/react`](/sdk/guides/react)-Kit stellt all dies in React bereit: der
`usePqcStatus`-Hook und die `<QuantumSafeBadge/>`-Komponente zeigen einen **Quantum-safe**-
Indikator an, sobald das verbundene Konto einen registrierten PQC-Schlüssel besitzt. Beide lesen den
Status über `getPqcStatus`; gegen die öffentlichen Endpunkte (ohne Namensraum `qor_`)
können sie einen Schlüssel heute daher nicht bestätigen; siehe die Einschränkungen der
Live-Netzwerke auf der React-Seite.
