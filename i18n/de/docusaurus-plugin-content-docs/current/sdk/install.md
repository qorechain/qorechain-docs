---
slug: /sdk/install
title: Installation
sidebar_label: Installation
sidebar_position: 2
---

# Installation

Installieren Sie das SDK für Ihre Sprache. Der TypeScript-Kern (`@qorechain/sdk`), die
EVM- und SVM-Adapter (`@qorechain/evm`, `@qorechain/svm`), das React-Kit
(`@qorechain/react`) sowie die Clients für Python, Go, Rust und Java sind allesamt
in ihren jeweiligen Registries **veröffentlicht** und bieten vollständige Parität mit der
nativen Chain (typisierte Nachrichten, Abfragen, der Tx-Lebenszyklus, hybride PQC-Transaktionen
sowie WebSocket-Abonnements). Die aktuelle Release-Linie ist **0.10**, veröffentlicht am
25. und 26. Oktober 2026 (am 27. Oktober 2026 gegen jede Registry geprüft):

| Registry | Paket | Version |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.10.0 |
| PyPI | `qorechain-sdk` (Import `qorsdk`) | 0.10.0 |
| crates.io | `qorechain-sdk` (Import `qorechain`) | 0.10.0 |
| Go-Modul-Proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 (der Java-Client läuft wieder im Gleichschritt mit den anderen Sprachen; 0.9.1 war ein reines Java-Update) |

Wählen Sie unten Ihre Sprache.

## Upgrade-Hinweise {#upgrade}

:::danger Verwenden Sie auf den Live-Netzwerken SDK 0.8.1 oder neuer
Beide öffentlichen Netzwerke verifizieren die Form der **hybriden v2-Sign-Bytes**
(domänengetaggt und an die Chain-ID gebunden) und lehnen die alte Form mit `pqc`-Code 21 ab.
Jedes SDK-Release vor **0.8.0** signiert die alte Form, und **0.8.0** sucht die Umstellung
nur unter einem der beiden Upgrade-Namen, die die Netzwerke verwendet haben (das Mainnet
hat sie als `v3.2.0` verzeichnet, das Testnet als `v3.1.98` und später `v3.2.0`), und signiert
daher auf dem Mainnet die falsche Form. Verwenden Sie in jeder Sprache **0.10.0** (oder mindestens
**0.8.1**); **0.8.2 oder neuer** wird benötigt, um ein
[EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window) zu öffnen. Hybride Builder
akzeptieren die Option `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"` fragt das
Netzwerk ab und benötigt daher den REST-Endpunkt (`rest`) auf
`qorechain-vladi` / `qorechain-diana`: Es wirft einen Fehler, statt zu raten. Siehe
[Welche Sign-Bytes-Form?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
Die Form hat sich in Chain v3.2.3 oder v3.2.4 (v3.2.4 läuft im Testnet seit dem 19. Oktober 2026 und im Mainnet seit dem 23. Oktober 2026) nicht geändert: `"auto"`
wird auf beiden Netzwerken zu v2 aufgelöst, weil beide das Upgrade angewendet haben, das darauf umgestellt hat.
:::

## Was 0.10.0 neu bringt {#whats-new-0100}

SDK 0.10.0 ist das Client-Release für die Chain **v3.2.4**, die das Mainnet am 23. Oktober 2026
bei Höhe 3.742.566 angewendet hat (das Testnet hat sie am 19. Oktober bei Höhe 8.337.253
angewendet). Signaturformat, Adressen, Dezimalstellen, Memos und Gebühren haben sich nicht
geändert, und eine mit 0.9.0 erstellte Transaktion bleibt gültig. Das Release wurde in jeder
Sprache mit echten Transaktionen auf dem Testnet geprüft. Es hat keine Builder für alles,
was nach v3.2.4 eingeführt wurde. Das Testnet ist zu v3.2.6 weitergezogen (v3.2.5 und
v3.2.6 wurden dort am 26. und 27. Oktober 2026 angewendet); der Mainnet-Governance-Vorschlag
14 würde zum Zeitpunkt der Erstellung v3.2.5 auf Höhe 3.906.833 anwenden, und was dieses
Release hinzufügt, wird dokumentiert, wenn das Mainnet es anwendet. Neu in 0.10.0 ist:

| Bereich | In 0.10.0 |
| --- | --- |
| Staking-Stufen (`x/stakingtier`) | Composer `lockDelegation` (die eigenen Prüfungen der Chain: eine Laufzeit von 3, 6 oder 12 Monaten und ein positiver ganzzahliger Betrag), `unlockEarly`, `claimBonus` und `updateParams`; Lesezugriffe auf die Modulparameter, die Sperren eines Halters und den Bonus-Pool (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); die Fehlercodes des Moduls. Was das Modul tut, steht in [Staking und Delegation](/user-guide/staking-and-delegation) |
| Authenticator-Nonce | `fetchAuthNonce({ rest, address, pubkey })` liest die Sequenz, die ein verknüpfter Schlüssel als Nächstes für `MsgExecuteEVM` / `MsgExecuteCosmos` signieren muss, von `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, statt sie von Hand mitzuführen. Beide Netzwerke stellen die Route bereit; das Modul `abstractaccount` selbst ist im Mainnet abgeschaltet (im Testnet aktiviert), sodass eine Mainnet-Ausgabe abgelehnt wird, bevor eine Nonce geprüft wird |
| Schalter für Protokoll-Features | `fetchProtocolFeatures` und `isProtocolFeatureEnabled` lesen unter `/qorechain/pqc/v1/protocol_features` (beide Netzwerke stellen sie bereit), welche Konsensregeln ein Netzwerk durchsetzt, nach Namen. Ein Netzwerk unterhalb von v3.2.4 stellt die Route nicht bereit; verwenden Sie dort `isUpgradeApplied` |
| `possessionProven` | Der PQC-Status gibt an, ob der Schlüssel des Kontos mit einem Besitznachweis registriert wurde |
| `ibcTimeoutTimestamp(seconds)` | Ein absolutes IBC-Timeout in der Einheit, die `MsgTransfer` verwendet (Unix-Nanosekunden). IBC-Timeouts sind absolute Zeiten; IBC-v2-Pakete nehmen absolute Unix-Sekunden, und ein relativer Wert dort wird abgelehnt, nachdem die Gebühr berechnet wurde. Im Mainnet ist kein IBC-Kanal geöffnet (geprüft am 27. Oktober 2026) |
| Upgrade-Konstante und Protos | `CHAIN_UPGRADE_V3_2_4`; Protobuf-Definitionen, synchronisiert mit Chain v3.2.4 (neue Felder bei der Bridge-Validator-Registrierung sowie bei den Light-Node- und Rollup-Abfragen) |
| `ensurePqcRegistered` | Es verglich einen Status ohne öffentlichen Schlüssel als Übereinstimmung; jetzt liest es den Schlüssel über `rest` und vergleicht ihn. Wenn es nichts zum Lesen gibt, meldet das Ergebnis `keyVerified: false`, statt zu behaupten, der Schlüssel gehöre dem Aufrufer |
| Ablehnungen bei der Gebührensimulation | Eine Ablehnung der Chain, die nur als Text eintrifft (zum Beispiel „no bonus to claim“), wird jetzt in jeder Sprache anhand der registrierten Fehlerbeschreibungen der Chain benannt: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` und `create-qorechain-dapp` sind damit auf 0.10.0 gewechselt (das Kit
hängt von `@qorechain/sdk` `^0.10.0` ab, und die Vorlagen des Scaffolders ebenfalls).

## Was 0.9.0 brachte {#whats-new-090}

SDK 0.9.0 war das Client-Release für die Chain-Versionen **v3.2.2** und **v3.2.3** (das Mainnet
hat sie bei den Höhen 3,556,788 und 3,662,051 angewendet; das Mainnet läuft seit dem 23. Oktober 2026 bei Höhe 3.742.566 mit v3.2.4, und das Testnet läuft seit dem 19. Oktober 2026 mit v3.2.4 oder neuer). Signaturformat,
Adressen, Dezimalstellen, Memos und Gebühren haben sich nicht geändert, sodass die hybride
v2-Sign-Bytes-Form, die 0.8.1 und neuer signieren, weiterhin die richtige ist.
Neu ist Folgendes:

| Bereich | In 0.9.0 (und später) |
| --- | --- |
| Hybrider `TxClient` (TypeScript) | Übergeben Sie das Schlüsselpaar des Kontos: `client.connectTx(signer, { pqcKeypair })` oder `TxClient.connect({ …, pqcKeypair, rest })`. Jede Transaktion wird dann hybrid signiert, und `fee: "auto"` simuliert die hybride Transaktion selbst; eine reine Schlüsselregistrierung bleibt klassisch (der Bootstrap-Pfad der Chain). `bankSend` sowie die Rollup-, Multilayer- und Cross-VM-Clients des SDK verwenden ihn. Ohne Schlüsselpaar ändert sich nichts |
| Wiederherstellbarer PQC-Schlüssel | `derivePqcCanonical(address, mnemonic)` und seine Entsprechungen in jeder Sprache (siehe [Quantensicher](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Liest zuerst den Schlüsselstatus über REST (`rest`), verweigert die Registrierung, wenn es ihn nicht bestimmen kann, wirft `PqcKeyMismatchError`, wenn das Konto bereits einen anderen Schlüssel besitzt, und behandelt die Ablehnung „bereits registriert“ der Chain als Erfolg. Ab Chain v3.2.3 signiert und hängt es den **Besitznachweis** selbst an; vor v3.2.3 lässt es das Feld weg |
| Eingeschränkte EVM-Fenster | `openEvmWindowMsg` nimmt `nativeOnly` und `allowedTargets` entgegen (höchstens 16, keine Duplikate); `fetchEvmWindow` liest beides zurück (siehe [EVM-Leitfaden](/sdk/guides/evm#evm-window)) |
| EIP-7702-Zustimmung | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Schlüsselintegrität | Die Registrierungs-Builder lehnen `classical_only`, einen leeren Schlüssel und einen degenerierten ML-DSA-87-Schlüssel ab, was die Chain ab v3.2.3 ebenfalls tut. `signProofOfPossession` / `verifyProofOfPossession` werden exportiert; `migratePqcKeyHybrid` sendet die hybrid signierte `MsgMigratePQCKey`, die Konten mit Schlüssel ab v3.2.3 benötigen |
| Abstract-Account-Digest v2 | `evmAuthSignBytesV2` (bindet das Gas-Limit des Aufrufs) und `resolveEvmAuthDigestVersion`. Das Modul `abstractaccount` ist im Mainnet abgeschaltet (im Testnet aktiviert), dies dient im Mainnet daher nur als Referenz |
| Upgrade-Erkennung | `isUpgradeApplied`, `requireUpgradeApplied`: neue optionale Felder werden erst gesetzt, nachdem `applied_plan` das Release meldet, denn ein Node, der ein Release nicht angewendet hat, lehnt die gesamte Transaktion ab, wenn eines der neuen Felder dieses Releases gesetzt ist |
| Fehlerdekodierung | Ein Fehlschlag innerhalb eines Blocks behält seinen Codespace (zum Beispiel `pqc` 231, nicht `sdk_231`); `rate_limited` und die Delegationscodes werden dekodiert; `decodeTxError` liest das Log oder die Nachricht eines geworfenen Fehlers |
| Ausgabenregeln | `validateSpendingRules` läuft in den `MsgUpdateSpendingRules`-Buildern und lehnt eine Regel ab, die nichts begrenzt |
| Korrekturen | Die PQC-Konto-Route ist in jedem SDK die Singular-Route `/qorechain/pqc/v1/account/{address}` (und in `client.rest.getPqcAccount`, `isPqcRegistered` und `getPqcStatus`, wenn der zusammengesetzte Client übergeben wird); die exportierte `VERSION` entspricht dem Paket; vom SDK erzeugte Go- und Rust-Clients laufen in ein Timeout, statt zu hängen; die Vorlagen von `create-qorechain-dapp` hängen von dem Release ab, mit dem sie ausgeliefert werden |

Die Legacy-PQC-Ableitung für neue Schlüssel (`derivePqcLegacy`, `"bridge"`) ist
veraltet: Sie ist nicht an das Konto gebunden, sodass eine Mnemonic jedem
Konto denselben Schlüssel geben würde. Die Rotations-Helfer lehnen sie als **neuen** Schlüssel ab;
das Wiederherstellen eines bestehenden Legacy-Schlüssels oder das Wegrotieren von ihm funktioniert weiterhin.

## Versionen vor 0.9.0 {#before-090}

Wenn Sie 0.8.x einsetzen, signiert es weiterhin die Form, die beide Netzwerke verifizieren, und funktioniert auf
dem Mainnet und dem Testnet. Dies sind die Einschränkungen, die 0.9.0 beseitigt hat,
und einige davon kosten eine Gebühr, wenn man sie nicht kennt:

| Release vor 0.9.0 | Workaround |
| --- | --- |
| Keine Builder für Besitznachweis, eingeschränkte Fenster oder EIP-7702-Zustimmung | Verwenden Sie `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` und `authorize-evm-delegation` / `clear-evm-delegation` (siehe [EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window), [EIP-7702-Delegierungen](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` ohne `status` sendete die Registrierung ungeprüft und meldete Erfolg, wenn ein anderer Schlüssel registriert war | Eine zweite Registrierung für ein Konto, das bereits einen Schlüssel besitzt, wird **abgelehnt, nachdem die Gebühr abgezogen wurde**. Lesen Sie zuerst `GET /qorechain/pqc/v1/account/{address}` und übergeben Sie `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Sie riefen einen Pfad im Plural `/accounts/` oder den Namensraum `qor_` auf, die die öffentlichen Endpunkte nicht bereitstellen (HTTP 501, `-32601`). Lesen Sie die oben genannte REST-Route im Singular |
| `TxClient` / `bankSend` sowie die Rollup-, Multilayer- und Cross-VM-Clients signierten nur klassisch | Die Netzwerke lehnen das für jedes Konto mit Schlüssel ab. Senden Sie über `signAndBroadcastHybrid` |
| Fehlgeschlagene Transaktionen innerhalb eines Blocks verloren ihren Codespace | Lesen Sie die Transaktion über `GET /cosmos/tx/v1beta1/txs/{hash}` |
| Die exportierte Konstante `VERSION` von 0.8.3 meldete `0.8.0` | Lesen Sie die installierte Version aus `package.json` |
| `create-qorechain-dapp` 0.8.0 pinnte `@qorechain/sdk` / `@qorechain/evm` auf `^0.3.0` (ein Caret auf eine 0.x-Version bleibt innerhalb von 0.3) | Führen Sie nach dem Scaffolding `npm i @qorechain/sdk@latest` aus |
| `@qorechain/react` 0.8.x ließ den Status des registrierten Schlüssels auf den öffentlichen Endpunkten unlesbar | Verwenden Sie `@qorechain/react` 0.9.0 oder neuer |

:::caution Ältere Fixes
SDK **0.6.1** behob einen konsenskritischen Bug: Die Tx-Body-Extension
`/qorechain.pqc.v1.PQCHybridSignature` wurde JSON-serialisiert in
`Any.value` geschrieben und **von der Chain bei CheckTx abgelehnt**. Hybride
(PQC + klassische) Transaktionen, die mit SDK ≤ 0.6.0 erstellt wurden, werden
on-chain abgelehnt. **0.8.0** hat die Konto-Helfer für Wallet-Signaturen entfernt (siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Das Kern-Paket:

```bash
npm i @qorechain/sdk
```

Es zielt auf Node.js 20+ und liefert ESM, CommonJS sowie Typdefinitionen. Die
Beispiele für hybride Transaktionen in dieser Dokumentation importieren außerdem `StargateClient` aus
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### EVM-Adapter

`@qorechain/evm` ist ein schlanker, typsicherer Adapter über [viem](https://viem.sh).
viem ist eine **Peer-Abhängigkeit** — installieren Sie es zusätzlich:

```bash
npm i @qorechain/evm viem
```

Veröffentlicht auf npm unter `0.8.0`.

### SVM-Adapter

`@qorechain/svm` ist ein schlanker Adapter über
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), das eine
**Peer-Abhängigkeit** ist:

```bash
npm i @qorechain/svm @solana/web3.js
```

Veröffentlicht auf npm unter `0.8.0`.

### React-Kit

`@qorechain/react` ist die offizielle React-Schicht über `@qorechain/sdk` — ein
Provider, Hooks sowie die Komponenten `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) ist eine Peer-Abhängigkeit:

```bash
npm i @qorechain/react
```

Veröffentlicht auf npm unter `0.10.0`; es hängt von `@qorechain/sdk` `^0.10.0` ab. Siehe den [React-Kit-Leitfaden](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.10.0`) erzeugt eine sofort lauffähige dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

Die generierten `package.json`-Dateien hängen von dem SDK-Release ab, mit dem der Scaffolder
ausgeliefert wird (`@qorechain/sdk` `^0.10.0`; die EVM-Vorlage verwendet `@qorechain/evm` `^0.8.0`).
Version 0.8.0 des Scaffolders schrieb Bereiche `^0.3.0`, die bei einer 0.x-Version
innerhalb von 0.3 bleiben und für die Live-Netzwerke nicht signieren können; wenn Sie mit 0.8.0 ein Scaffolding durchgeführt haben, führen Sie
`npm i @qorechain/sdk@latest` aus. Siehe die [CLI-Referenz](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Erfordert Python 3.10+. Das Paket liefert Type Hints und einen `py.typed`-Marker.

> Die Distribution wird als `qorechain-sdk` installiert (veröffentlicht auf PyPI unter `0.10.0`),
> wird aber **als `qorsdk` importiert**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Erfordert Go 1.23+. Importieren Sie die benötigten Sub-Pakete, zum Beispiel:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Veröffentlicht als eigenständiges Go-Modul (getaggt als `packages/go/v0.10.0`). Pinnen Sie die Version
explizit: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Oder, um den Repository-Stand (Head) zu verfolgen:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Erfordert Rust 1.74+. Die Lese-Clients sind asynchron (Tokio). Die Crate wird als
`qorechain` importiert (`use qorechain;`).

> Veröffentlicht auf crates.io als `qorechain-sdk` (0.10.0); `cargo add qorechain-sdk`
> installiert das neueste Release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.10.0</version>
</dependency>
```

Oder Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.10.0'
```

> Veröffentlicht auf Maven Central als `io.github.qorechain:qorechain-sdk` (0.10.0 ist die
> neueste und die Release-Version, geprüft am 27. Oktober 2026). Central hat keinen Build
> 0.8.0 oder 0.8.1, verwenden Sie daher auf den Live-Netzwerken 0.8.2 oder neuer. 0.9.1 war ein
> reines Java-Release, das Bouncy Castle von 1.80 auf 1.85 hob, ohne API-Änderung.

## Verwandte Pakete {#related-packages}

| Paket | Zweck | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Wallet-seitige Helfer: Wallet-Erzeugung (`generateQoreWallet`), hybrides Signieren mit `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), MetaMask-Netzwerkregistrierung (`addQoreEvmToWallet`), Message-Builder für Authenticators und EVM-Fenster (sein `openEvmWindowMsg` baut nur die uneingeschränkte Form), der v2-Abstract-Account-Digest. Er hängt keinen Besitznachweis an. Peer-Abhängigkeiten: `@cosmjs/proto-signing` und `@cosmjs/stargate` `^0.32` (das SDK verwendet cosmjs 0.39, daher meldet npm bei der Installation beider in einem Projekt einen Peer-Konflikt, `ERESOLVE`; halten Sie sie in getrennten Projekten oder übergeben Sie `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | Serverseitiger Worker für Backends: leitet den PQC-Schlüssel ab, signiert hybrid und sendet (`sendTokens`, `registerPqc` und mehr). Übergeben Sie `cosmosRest`: Damit trägt eine Registrierung den Besitznachweis, sobald das Netzwerk v3.2.3 angewendet hat, und eine PQC-artige Ablehnung wird vor jeder erneuten Registrierung gegen die Chain geprüft (ein anderer registrierter Schlüssel löst `pqc_key_mismatch` aus, statt eine zweite Registrierung zu bezahlen) | 0.2.3 |
| `@qorechain/pqc` | Rein standardbasierte Primitive für ML-DSA / ML-KEM / SHAKE-256 sowie `hybridSignBytes` (siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)); auch auf PyPI, crates.io, Maven Central und dem Go-Proxy (Go `v0.2.3`) in derselben Version | 0.2.3 |
| `@qorechain/handles` | Verifizierte `@handle`-Auflösung mit Trust-on-first-use-Pinning (`HandleClient`) | 0.1.0 |
| `@qorechain/connect` | Ein einziger Connector für EVM-, Cosmos- und SVM-Wallets, aufgebaut auf dem Wallet-Adapter (sein Peer-Bereich ist `@qorechain/wallet-adapter` `^0.2.1`, der 0.4.0 nicht einschließt). Er öffnet kein [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window), sodass ein EVM-Versand darüber abgelehnt wird, bis das Konto einen registrierten Schlüssel und ein offenes Fenster hat | 0.2.1 |
| `@qorechain/rdk` | Client des Rollup Development Kit (siehe [Rollups](/rollups/why)). Er hängt von `@qorechain/sdk` `^0.9.0` und `@qorechain/evm` `^0.8.0` ab; ein Caret auf eine 0.x-Version bleibt innerhalb von 0.9, sodass eine App mit dem SDK 0.10.0 mit dem Kit eine zweite, verschachtelte SDK-0.9.x-Kopie erhält (eine App, die auf SDK 0.9.x bleibt, teilt sich eine Kopie). Signiert nur hybrid, wenn Sie ein `pqcKeypair` übergeben; Lesevorgänge funktionieren ohne. Auch als `qorechain-rdk` auf PyPI, crates.io und Maven Central sowie als Go-Modul veröffentlicht (pinnen Sie `@v0.6.1`); diese vier Clients signieren nur klassisch. Siehe [RDK 0.6.1: Änderungen und Einschränkungen](/rollups/deploying-a-rollup#rdk-050-limits) | 0.6.1 |
| `@qorechain/rdk-cli` | Die `qorollup`-Operator-CLI für das RDK. Ihre Transaktionsbefehle (`create`, `pause`, `resume`, `stop`, `withdraw`) signieren nur klassisch und werden von den Netzwerken abgelehnt | 0.6.1 |
| `create-qorechain-rollup` | Scaffolder für Rollup-Starter; seine Vorlagen hängen von `@qorechain/rdk` `^0.6.1` ab und signieren hybrid, wenn sie Ihren Post-Quanten-Schlüssel aus `QORE_MNEMONIC` oder `QORE_PQC_SEED_HEX` auflösen können | 0.6.1 |

## Weiter

Fahren Sie mit dem [Schnellstart](/sdk/quickstart) fort, um sich zu verbinden und den On-Chain-Zustand zu lesen.
