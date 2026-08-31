---
slug: /sdk/faq
title: FAQ & Fehlerbehebung
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ & Fehlerbehebung

## Ist das Mainnet live?

Ja. Das Mainnet ist **live** (Chain-ID `qorechain-vladi`). Das Testnet-Preset
(`qorechain-diana`) bleibt ebenfalls verfügbar. Beide Presets werden mit
Localhost-Endpoint-Standardwerten ausgeliefert; wählen Sie das Netzwerk mit
`createClient({ network: "mainnet" })` und überschreiben Sie `endpoints` mit den
URLs Ihres Nodes. Siehe
[Netzwerk & Endpoints](/sdk/reference/network).

## Warum gehen meine Aufrufe an localhost?

`createClient()` verwendet standardmäßig **localhost**-Endpoints. Um mit einem
echten Node zu kommunizieren, übergeben Sie ein `endpoints`-Objekt:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Der Signierpfad (`connectTx`) benötigt den Konsens-Endpoint **`rpc`**;
CosmWasm-Lesezugriffe verwenden ihn ebenfalls. REST-Lesezugriffe verwenden
`rest`; EVM- und `qor_`-Aufrufe verwenden `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Dies sind **Peer-Dependencies** von `@qorechain/evm` bzw. `@qorechain/svm`.
Installieren Sie sie in Ihrem Projekt:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Ein Precompile-Aufruf wirft "feature not present"

Die EVM-Precompiles existieren nur auf Nodes, die die QoreChain EVM Engine
ausführen. Auf einem gewöhnlichen EVM-Node schlagen diese Aufrufe fehl. Wenn Sie
heterogene Nodes ansprechen, kapseln Sie jeden Precompile-Aufruf und behandeln
Sie den Fehler pro Aufruf.

## Meine Beträge weichen um den Faktor eine Million ab

QOR hat **10^6** Basiseinheiten in `uqor`. Verwenden Sie `toBase` / `fromBase`
und führen Sie alle Berechnungen in Basiseinheiten durch:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Beachten Sie, dass die EVM-Laufzeitumgebung QOR mit **18** Dezimalstellen
darstellt (EVM-Konvention), was sich von der Native-`uqor`-Basis von 10^6
unterscheidet.

## Welche Pakete sind veröffentlicht, und wo?

Alle. Der TypeScript-Core (`@qorechain/sdk`), die EVM/SVM-Adapter
(`@qorechain/evm`, `@qorechain/svm`), das React-Kit (`@qorechain/react`) und der
`create-qorechain-dapp`-Scaffolder sind auf npm in Version `0.7.0`; der
Python-Client ist auf PyPI (`pip install qorechain-sdk` in Version `0.7.0`,
Import `qorsdk`); der Go-Client ist über den Module-Proxy verfügbar
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, Tag
`packages/go/v0.7.0`); und der Java-Client ist auf Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). Der Rust-Client ist auf crates.io
(`cargo add qorechain-sdk`) in der **zuletzt veröffentlichten Crate-Version**,
die derzeit hinter 0.7.0 zurückliegt — installieren Sie von crates.io oder aus
dem Repo. Siehe [Installation](/sdk/install) für die vollständigen Befehle pro
Sprache.

## Meine Mnemonic wird abgelehnt

Das SDK validiert sowohl die BIP-39-Wortliste **als auch** die Prüfsumme, bevor
ein Schlüssel abgeleitet wird — eine Phrase mit Tippfehler löst also einen
Fehler aus, statt stillschweigend das falsche Konto zu erzeugen. Prüfen Sie die
Wörter erneut; verwenden Sie `validateMnemonic`, um eine Phrase zu testen.

## Hybride (PQC-)Transaktionen

Die hybride Einreichung (klassisch + ML-DSA-87) ist auf dem Native-Pfad **live
und verpflichtend** — rein klassische Native-Transaktionen werden on-chain
abgelehnt (Chain v3.1.95). Bevor eine hybride Tx PQC-verifiziert wird, muss der
öffentliche PQC-Schlüssel des Signierers registriert sein
(`MsgRegisterPQCKeyV2`), oder Sie setzen `includePqcPublicKey: true`, um ihn für
die automatische Registrierung bei der ersten Verwendung einzubetten. Die Chain
akzeptiert **ausschließlich deterministische** ML-DSA-87-Signaturen (das SDK
signiert seit 0.5.1 standardmäßig deterministisch); hedged-Signaturen schlagen
mit `pqc`-Code 21 (`hybrid_verify_failed`) fehl. Siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).

## Meine hybriden Transaktionen scheitern bei CheckTx mit einem Tx-Parse-Fehler

Aktualisieren Sie das SDK. Die Versionen **0.6.0 und früher** haben die
Tx-Body-Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` JSON-serialisiert,
was der Tx-Decoder der Chain bei CheckTx ablehnt. Seit **0.6.1** ist die
Erweiterung protobuf-kodiert (der Wert beginnt mit `0x08`) — in allen fünf
Sprachen. Hybride Transaktionen, die mit älteren Versionen erstellt wurden,
werden on-chain abgelehnt, und zwar in jeder Lane (einschließlich eth-native).

## Meine Authenticator-Ausgabe wird mit `authenticator_replay` abgelehnt

Die Nonce ist falsch. `MsgExecuteEVM.nonce` muss die **aktuelle** EVM-Nonce des
Kontos sein (der Relayer ist ein anderes Konto, also **nicht** 1 addieren);
`MsgExecuteCosmos.nonce` ist die **Sequenz pro Authenticator** für
`(account, pubkey)`, ein separater Store-Zähler. Rufen Sie den Wert erneut ab
und signieren Sie neu. Andere Authenticator-Fehler lassen sich über
`decodeTxError` dekodieren: `abstractaccount`-Codes 5
(`spending_limit_exceeded`), 6 (`session_key_expired`) und
10 (`permission_denied`). Siehe
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).
