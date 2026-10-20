---
slug: /sdk/faq
title: FAQ & Fehlerbehebung
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ & Fehlerbehebung

## Ist das Mainnet live?

Ja. Das Mainnet ist **live** (Chain-ID `qorechain-vladi`, live seit dem 7. Juni 2026)
und läuft mit der Chain-Version v3.2.3 bis Höhe 3.742.566 und mit v3.2.4 ab diesem Block (Governance-Vorschlag 13); das Testnet läuft seit dem 19. Oktober 2026 mit v3.2.4. Das Testnet-Preset
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
QoreChain Native-Lesezugriffe verwenden ihn ebenfalls. REST-Lesezugriffe verwenden
`rest`; EVM-Aufrufe verwenden `evmRpc` (ebenso `qor_`-Aufrufe, auf einem Node,
der diesen Namespace bereitstellt). Die Mainnet-URLs stehen in der
[Netzwerkreferenz](/sdk/reference/network#public-endpoints).

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Dies sind **Peer-Dependencies** von `@qorechain/evm` bzw. `@qorechain/svm`.
Installieren Sie sie in Ihrem Projekt:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Ein Precompile-Aufruf wirft "returned no data" / "feature not present"

Die QoreChain-EVM-Precompiles sind in den Node einkompiliert, aber auf Mainnet
und Testnet **noch nicht aktiv**: Sie antworten nur dort, wo ihre Adressen im
Parameter `active_static_precompiles` des EVM-Moduls aufgeführt sind, und diese
Liste ist auf beiden Netzwerken leer. Derzeit liefert der Aufruf leere Daten,
sodass viem `returned no data ("0x")` meldet und der Helper auch auf den
öffentlichen Netzwerken einen Fehler wirft (siehe
[EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status)).
Auf einem gewöhnlichen EVM-Node schlagen die Aufrufe auf dieselbe Weise fehl.
Prüfen Sie `GET /cosmos/evm/vm/v1/params` und kapseln Sie jeden
Precompile-Aufruf, sodass der Fehler pro Aufruf behandelt wird.

## Mein `client.qor`-Aufruf scheitert mit -32601

`client.qor` ruft den JSON-RPC-Namespace `qor_` auf, den kein veröffentlichter
Node-Build bereitstellt; `rpc_modules` auf den öffentlichen EVM-Endpoints listet
nur `eth`, `net`, `rpc`, `txpool` und `web3`. Verwenden Sie stattdessen eine
REST-Route, zum Beispiel `GET /qorechain/pqc/v1/account/{address}`
(PQC-Schlüsselstatus) oder `GET /qorechain/burn/v1/stats`, über
`client.rest.get(...)`. Siehe
[den `qor_`-Namespace](/api-reference/json-rpc-qor_-namespace).

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

Alle (geprüft am 21. Oktober 2026). Der TypeScript-Core (`@qorechain/sdk`, 0.9.0),
das React-Kit (`@qorechain/react`, 0.9.0), der `create-qorechain-dapp`-Scaffolder
(0.9.0) und die EVM/SVM-Adapter (`@qorechain/evm`, `@qorechain/svm`, 0.8.0) sind auf
npm; der Python-Client ist auf PyPI (`pip install qorechain-sdk` in Version 0.9.0,
Import `qorsdk`); der Go-Client ist über den Module-Proxy verfügbar
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`); der Rust-Client ist
auf crates.io (`cargo add qorechain-sdk`, 0.9.0); und der Java-Client ist auf Maven
Central (`io.github.qorechain:qorechain-sdk:0.9.1`; die anderen Sprachen sind 0.9.0). Siehe [Installation](/sdk/install)
für die vollständigen Befehle pro Sprache.

## Meine Mnemonic wird abgelehnt

Das SDK validiert sowohl die BIP-39-Wortliste **als auch** die Prüfsumme, bevor
ein Schlüssel abgeleitet wird — eine Phrase mit Tippfehler löst also einen
Fehler aus, statt stillschweigend das falsche Konto zu erzeugen. Prüfen Sie die
Wörter erneut; verwenden Sie `validateMnemonic`, um eine Phrase zu testen.

## Hybride (PQC-)Transaktionen

Die hybride Einreichung (klassisch + ML-DSA-87) ist auf dem Native-Pfad **live
und verpflichtend** — rein klassische Native-Transaktionen werden on-chain
abgelehnt (Chain v3.2.0). Bevor eine hybride Tx PQC-verifiziert wird, muss der
öffentliche PQC-Schlüssel des Signierers **ausdrücklich registriert** werden,
und zwar mit `MsgRegisterPQCKeyV2` (einer klassisch signierten, von der
Hybrid-Pflicht befreiten Transaktion); das Einbetten des öffentlichen Schlüssels
in die Erweiterung (`includePqcPublicKey: true`) registriert ihn **nicht**, und
die Chain registriert einen Schlüssel nicht bei der ersten Verwendung. In TypeScript
übergeben Sie dem Client das Schlüsselpaar (`client.connectTx(signer, { pqcKeypair })`,
SDK 0.9.0), und jede Transaktion, die er sendet, wird hybrid signiert.
Die Chain akzeptiert jede gültige FIPS-204-ML-DSA-87-Signatur, ob hedged oder
deterministisch. Das SDK signiert standardmäßig deterministisch (seit 0.5.1),
damit eine Transaktion immer dieselbe Signatur und denselben Tx-Hash hat. Wenn
eine hybride Tx mit `pqc`-Code 21 (`hybrid_verify_failed`) fehlschlägt, liegt es
an der Sign-Bytes-Version, der Chain-ID, einer veralteten PQC-Bibliothek oder
einem nicht registrierten Schlüssel, nie an hedged Signierung.
Beide Netzwerke verifizieren die Sign-Bytes-Form v2; verwenden Sie daher SDK
**0.8.1 oder neuer** (0.9.0 ist aktuell) und übergeben Sie `rest` (oder `signBytesVersion`): Die
Builder werfen auf `qorechain-vladi` / `qorechain-diana` einen Fehler, wenn
keines von beiden angegeben ist. Siehe
[Fehlerbehebung für Code 21](/developer-guide/post-quantum-signing#code-21) und
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).

## Meine EVM-Transaktion wird mit "no open EVM authorisation window" abgelehnt

Seit Chain v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das
einen registrierten PQC-Schlüssel und ein offenes Autorisierungsfenster hat.
Registrieren Sie einen Schlüssel, öffnen Sie ein Fenster und senden Sie dann.
Siehe [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window). Mit dem SDK liefert
`classifyEvmWindowRejection(err)` `"no-pqc-key"`, `"no-window"`, `"exhausted"`
oder `"invalid"`.

## Meine hybriden Transaktionen scheitern bei CheckTx mit einem Tx-Parse-Fehler

Aktualisieren Sie das SDK. Die Versionen **0.6.0 und früher** haben die
Tx-Body-Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` JSON-serialisiert,
was der Tx-Decoder der Chain bei CheckTx ablehnt. Seit **0.6.1** ist die
Erweiterung protobuf-kodiert (der Wert beginnt mit `0x08`) — in allen fünf
Sprachen. Hybride Transaktionen, die mit älteren Versionen erstellt wurden,
werden on-chain abgelehnt, und zwar in jeder Lane (einschließlich eth-native).

## Mit welchen Chain-Versionen funktioniert das SDK?

SDK **0.9.0** ist das Client-Release für die Chain v3.2.2 und v3.2.3: Es
transagiert auf dem Mainnet **v3.2.3** (und **v3.2.4** ab Höhe 3.742.566) und dem Testnet **v3.2.4** und hat Builder für
den optionalen Besitznachweis (Proof of Possession) bei der Registrierung (automatisch
angefügt von `ensurePqcRegistered`, sobald das Netzwerk v3.2.3 angewendet hat),
EVM-Fenster mit Gültigkeitsbereich und die EIP-7702-Einwilligungsnachrichten.
SDK **0.8.1 oder neuer** transagiert ebenfalls auf beiden Netzwerken (die
Sign-Bytes-Form v2 für Hybrid, die Registrierung, hybride Sendungen und das
EVM-Fenster funktionieren unverändert), hat aber keinen dieser Builder: Verwenden Sie
dafür die CLI (siehe
[Versionen vor 0.9.0](/sdk/install#before-090)). v3.2.4 läuft seit dem
19. Oktober 2026 im Testnet und läuft im Mainnet ab Höhe 3.742.566 (Governance-Vorschlag 13); das SDK setzt kein v3.2.4-Feld, sodass seine Transaktionen auf beiden Seiten dieser Höhe gültig bleiben.

## Meine PQC-Schlüsselregistrierung wurde abgelehnt, aber die Gebühr wurde abgebucht

Eine Registrierung für ein Konto, das bereits einen Schlüssel besitzt, wird von
der Chain abgelehnt, nachdem die Gebühr abgezogen wurde. `ensurePqcRegistered` in
0.9.0 liest zuerst `GET /qorechain/pqc/v1/account/{address}` (übergeben Sie `rest`),
überspringt die Registrierung, wenn der Schlüssel dieses Schlüsselpaars registriert
ist, und wirft `PqcKeyMismatchError`, wenn ein anderer registriert ist. Frühere
Releases schauten nicht vorab nach, sofern Sie nicht selbst
`status: { registered: found }` übergaben, wobei `found` aus dieser Route stammt.
Seit v3.2.3 lehnt die Chain außerdem schwache, entartete und wiederverwendete
Schlüssel ab; Schlüssel aus `derivePqcCanonical` oder `tx pqc gen-key` sind in
Ordnung.

## `create-qorechain-dapp` installiert ein SDK, das nicht signieren kann

Das tat nur Version 0.8.0 des Scaffolders: Sie schrieb die Bereiche `^0.3.0` für
`@qorechain/sdk` und `@qorechain/evm`, und ein Caret-Bereich auf einer 0.x-Version
bleibt innerhalb von 0.3. Version 0.9.0 erstellt Gerüste auf dem aktuellen SDK; wenn
Sie 0.8.0 verwendet haben, führen Sie nach dem Scaffolding
`npm i @qorechain/sdk@latest` (und `@qorechain/evm@latest`) aus.

## `VERSION` meldet 0.8.0, aber ich habe 0.8.3 installiert

Die exportierte Konstante `VERSION` von 0.8.3 wurde nicht aktualisiert und meldet
`0.8.0`; ab 0.9.0 entspricht sie dem Paket. Lesen Sie bei früheren Releases die
installierte Version aus der `package.json`.

## Meine Authenticator-Ausgabe wird mit `authenticator_replay` abgelehnt

(Das Modul `abstractaccount` ist derzeit auf beiden Netzwerken abgeschaltet; eine
Ausgabe wird mit `abstract account module is disabled` abgelehnt, bevor eine
Nonce geprüft wird. Siehe
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators). Die folgenden
Hinweise gelten, sobald das Modul aktiviert ist.)

Die Nonce ist falsch. Sowohl `MsgExecuteEVM.nonce` als auch `MsgExecuteCosmos.nonce`
sind die **Authenticator-Sequenz** des verknüpften Schlüssels für
`(account, pubkey)`: ein Zähler, den die Chain pro verknüpftem Schlüssel führt, bei 0
beginnt und mit jeder erfolgreichen Ausführung erhöht wird. Sie ist **nicht** die
EVM-Nonce des Kontos, und es gibt dafür noch keine Abfrage, verfolgen Sie sie also
pro verknüpftem Schlüssel. Seit v3.2.3 signiert die EVM-Lane außerdem
`evmAuthSignBytesV2`, das das Gas-Limit des Aufrufs bindet
(`resolveEvmAuthDigestVersion` wählt die Form). Verwenden Sie den Zähler, den Sie
für diesen Schlüssel verfolgen, und signieren Sie neu.

Andere Authenticator-Fehler lassen sich über `decodeTxError` dekodieren:
`abstractaccount`-Codes 5 (`spending_limit_exceeded`), 6 (`session_key_expired`)
und 10 (`permission_denied`). Siehe
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).
