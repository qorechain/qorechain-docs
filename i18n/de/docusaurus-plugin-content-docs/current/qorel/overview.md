---
slug: /qorel/overview
title: QORel Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# QORel

QORel ist der IBC-Relayer von QoreChain. Ein Relayer ist das Programm, das IBC-Pakete, Beweise und Client-Updates zwischen zwei Chains transportiert; solange keiner läuft, bleibt ein Transfer über einen IBC-Kanal ausstehend. QORel richtet sich an Betreiber, Validatoren und Teams, die das Relaying für einen QoreChain-Kanal übernehmen möchten, und an alle, die einen Relayer brauchen, der überhaupt Transaktionen an QoreChain senden kann.

QoreChain verlangt für jede Transaktion der nativen Lane eine hybride Post-Quanten-Signatur (secp256k1 plus ML-DSA-87, FIPS 204), und ein Standard-Relayer erzeugt sie nicht, sodass QoreChain dessen Transaktionen ablehnt. QORel fügt diese Signatur für QoreChain hinzu und signiert jede andere Cosmos-SDK-Chain auf die übliche Weise. Es ist eine einzige Binärdatei, `qorel`, veröffentlicht unter Apache-2.0. Sie ist ein Fork von [Hermes](https://github.com/informalsystems/hermes) 1.13.3, dem von Informal Systems geschriebenen IBC-Relayer (Apache-2.0); die Anerkennung für die Relayer-Engine gebührt ihnen, und QORel behält die Befehle und die Konfiguration von Hermes für jede Chain bei, die keine zusätzliche Signatur braucht.

QORel 0.1.0 läuft **nur im Testnet**. Es hat zwischen dem QoreChain-Testnet `qorechain-diana` und dem öffentlichen Testnet des Cosmos Hub (Chain-ID `provider`) relayt. Mainnet-IBC ist noch nicht geöffnet; die Mainnet-Unterstützung folgt später, sobald dort ein Kanal geöffnet wird.

## Innovationen {#innovations}

- **Signiermodus pro Chain.** Jede Chain in der Konfiguration hat `signing`. `'qorechain-hybrid'` fügt die ML-DSA-87-Signatur hinzu, die QoreChain prüft. Der Standardwert `'standard'` erzeugt Transaktionen Byte für Byte wie Hermes, sodass derselbe QORel-Prozess QoreChain und die Cosmos-Hub-Seite nebeneinander relayt.
- **Eine austauschbare Signierschicht.** Das Crate `qorel-signer` definiert ein Post-Quanten-Primitiv, die Sign-Bytes-Regeln einer Chain und einen Signer für Transaktionserweiterungen als getrennte Bausteine. Der Relayer ruft sie auf, nachdem die Auth-Info feststeht und bevor das klassische Sign-Dokument gebaut wird; auch die Gas-Simulation läuft über denselben Pfad. Eine Chain mit einer anderen zusätzlichen Signatur braucht einen neuen Framer in diesem Crate, keine Änderung am Relayer. Den Vertrag beschreibt [Signieren aus jeder Sprache](/qorel/signing-from-any-language).
- **Post-Quanten-Schlüsselverwaltung in den Key-Befehlen.** `qorel keys add` leitet den ML-DSA-87-Schlüssel mit der QoreChain-Wallet-Ableitung aus derselben Mnemonic ab wie das Konto, sodass der Relayer-Schlüssel dem entspricht, den QoreX oder das SDK ableiten würden. `qorel keys register-pqc` registriert den öffentlichen Schlüssel einmalig mit einem Besitznachweis (Proof of Possession). `qorel keys pqc-status` meldet, ob der Schlüssel bereit ist.
- **Eine Prüfung vor jedem Senden.** Vor jeder Transaktion an eine Hybrid-Chain bestätigt QORel, dass der Post-Quanten-Schlüssel on-chain registriert und derselbe Schlüssel ist, den es lokal hält, und liest die Sign-Bytes-Version von der Chain. Stimmt etwas nicht, sendet es nichts, sodass keine Gebühr für eine Transaktion anfällt, die die Chain ablehnen würde.
- **Gaspreis aus dem Fee-Market von QoreChain.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` liest die Basisgebühr der Chain (Untergrenze 0,1 uqor pro Gas), statt eine feste Schätzung zu verwenden.
- **Erkennung von Fehlverhalten auf ibc-go-v10-Chains.** ibc-go v10 legt den Header nicht mehr in `update_client`-Events ab, und das Standard-Hermes 1.13 schaltet die Erkennung von Fehlverhalten auf solchen Chains ab. QORel liest den Header stattdessen aus der `MsgUpdateClient`-Transaktion, sodass die Erkennung weiterläuft.
- **Robustheit gegenüber ratenbegrenzten Endpunkten.** Paket-Worker bleiben aktiv und versuchen es bei jedem Clear-Intervall erneut, solange ein Relay- oder Clearing-Versuch fehlgeschlagen ist, zum Beispiel wenn ein öffentlicher Endpunkt kurzzeitig mit `429` antwortet. Sie beenden sich wegen Leerlaufs erst, nachdem eine Clearing-Runde erfolgreich war.
- **Schlüsseldateien nur für den Besitzer.** Schlüsseldateien, einschließlich des gespeicherten Post-Quanten-Seeds, werden mit dem Modus 0600 geschrieben.
- **Im Live-Netzwerk bewährt.** Der erste IBC-Kanal im QoreChain-Testnet, `transfer/channel-0` auf `qorechain-diana` zu `channel-600` im öffentlichen Testnet des Cosmos Hub, wird von QORel relayt. Transfers wurden in beide Richtungen getestet, ebenso die Rückführung eines übertragenen Tokens und die automatische Rückerstattung eines abgelaufenen Transfers. Siehe [Der Testkanal](/user-guide/bridging-assets#ibc-test-channel).

Die vollständige Liste für jede Version steht unter [Was ist neu](/qorel/whats-new).

## Die Live-Testnet-Verbindung {#testnet-connection}

| | `qorechain-diana` | Öffentliches Testnet des Cosmos Hub (`provider`) |
|---|---|---|
| Light Client | `07-tendermint-0` | `07-tendermint-466` |
| Verbindung | `connection-0` | `connection-315` |
| Kanal | `transfer/channel-0` (`STATE_OPEN`, unordered, Version `ics20-1`) | `transfer/channel-600` |

Auf dieser Verbindung existieren zwei Token-Traces. ATOM im QoreChain-Testnet ist `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2` (Trace `transfer/channel-0/uatom`). QOR im Hub-Testnet ist `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A` (Trace `transfer/channel-600/uqor`). Ein Chain-Registry-Pull-Request, der diesen Pfad hinzufügt ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)), ist offen und nicht gemergt. Das Mainnet hat keinen IBC-Kanal.

Getestet wurden: Transfers in beide Richtungen (1 QOR hinaus, 0,1 ATOM herein, 0,4 QOR zurück) und die automatische Rückerstattung eines Transfers mit 1 Sekunde Timeout, relayt als Timeout-Nachricht. Alle 13 Relayer-Transaktionen auf `qorechain-diana` waren erfolgreich (Code 0).

### Was ein Relayer von Drittanbietern braucht {#third-party}

Das Testnet akzeptiert nur den Light-Client-Typ `07-tendermint` (`/ibc/core/client/v1/params` listet `allowed_clients = ["07-tendermint"]`); heute kann kein `08-wasm`-Client erstellt werden. Um einen Kanal zu QoreChain zu öffnen, braucht ein Relayer:

- einen `07-tendermint`-Client auf jeder Seite;
- auf der QoreChain-Seite jede Transaktion hybrid signiert von einem Relayer-Konto, dessen ML-DSA-87-Schlüssel registriert ist. QORel tut das; das Standard-Hermes, der Go-Relayer (`rly`) und ts-relayer werden abgelehnt;
- einen ICS-20-Transferkanal mit der Version `ics20-1`.

Auch für die IBC-v2-Client-Konfiguration gibt es keine Relayer-Allowlist (`/ibc/core/client/v2/config/07-tendermint-0` antwortet mit `allowed_relayers: []`). IBC-v2-Pakete verwenden absolute Timeouts in Unix-Sekunden. QORel relayt IBC v2 noch nicht.

## qorel-signer {#qorel-signer}

Der Signer ist ein eigenes Crate, `qorel-signer`, im QORel-Repository unter `crates/qorel-signer`. Er ist nicht auf crates.io; binden Sie ihn als Git-Abhängigkeit ein. Das garantiert er:

- **Austauschbarer Co-Signer.** Die zusätzliche Signatur einer Chain wird von einem Co-Signer hinzugefügt, und Chains mit Standard-Signierung verwenden keinen, sodass ihre Transaktionen unverändert bleiben.
- **Rohe Protobuf-Bytes.** Er arbeitet auf kodierten Bytes und hängt von keinen IBC- oder Relayer-Typen ab.
- **Eine Body-Richtlinie.** Er verweigert Bodies, die die Chain ablehnen würde: eine bereits vorhandene kritische Erweiterungsoption, das Flag `unordered` oder unbekannte Felder.
- **Kein Raten der Version.** Er fällt in QoreChain-Netzwerken nie auf v1-Sign-Bytes zurück, solange die Sign-Bytes-Version nicht bekannt ist.
- **Selbstgeprüfte Signaturen.** Jede Signatur wird vor der Verwendung geprüft.
- **Geheimnisse geschützt.** Geheimnisse werden genullt und in der `Debug`-Ausgabe geschwärzt.
- **Byte-genaue Tests.** Die Tests bauen Relay-Transaktionen, die der Ante-Handler der Chain akzeptiert hat, Byte für Byte nach.

Ein Anwendungsbeispiel steht in `crates/qorel-signer/README.md` im Repository; siehe auch [Signieren aus jeder Sprache](/qorel/signing-from-any-language#signer-layer). Derselbe Signer-Hook wird upstream in Hermes als [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) angeboten (offen, nicht gemergt).

## Verwendung {#how-to-use}

Installieren Sie die Binärdatei, schreiben Sie eine Konfiguration mit einem Eintrag pro Chain, fügen Sie für jede Chain einen Schlüssel hinzu, registrieren Sie den Post-Quanten-Schlüssel auf QoreChain, prüfen Sie die Bereitschaft und starten Sie dann den Relayer:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

Die Seiten in diesem Abschnitt:

| Seite | Inhalt |
|---|---|
| [Was ist neu](/qorel/whats-new) | Was 0.1.0 zusätzlich zu Hermes bringt |
| [Installation](/qorel/install) | Tarballs, `.deb`, `.rpm`, Homebrew, Container, aus dem Quellcode und die Prüfung jedes Wegs |
| [Quickstart](/qorel/quickstart) | Von der Installation bis zum ersten Transfer im Testnet |
| [Konfiguration](/qorel/configuration) | Der QoreChain-Chain-Eintrag, Schlüssel, Gas und die Sicherheitsprüfungen |
| [Neben einem Validator betreiben](/qorel/running-next-to-a-validator) | Layouts für systemd, Docker Compose und Kubernetes |
| [Monitoring](/qorel/monitoring) | Telemetrie, worauf Alarme gesetzt werden sollten |
| [Signieren aus jeder Sprache](/qorel/signing-from-any-language) | Der Vertrag der Hybridsignatur und die Bibliotheken für fünf Sprachen |
| [Fehlerbehebung](/qorel/troubleshooting) | Fragen und Lösungen |

## Zugang {#how-to-access}

- **Netzwerk.** Nur das Testnet `qorechain-diana` (das Testnet läuft auf v3.2.6). Das Mainnet `qorechain-vladi` hat keinen offenen IBC-Kanal; was jedes Netzwerk bietet, steht unter [Assets bridgen](/user-guide/bridging-assets#ibc-testnet-v326).
- **Gegenstelle.** Das öffentliche Testnet des Cosmos Hub, Chain-ID `provider`, über `channel-600`. Jede andere Cosmos-SDK-Chain funktioniert auf dieselbe Weise wie der Eintrag `provider` in der Beispielkonfiguration.
- **Endpunkte.** QORel braucht für jede Chain einen Konsens-RPC, einen WebSocket und einen gRPC-Endpunkt. Das QoreChain-Testnet hat öffentlichen RPC (`https://rpc-testnet.qore.host`) und REST (`https://api-testnet.qore.host`), aber heute keinen öffentlichen gRPC-Endpunkt und auch keinen zugesagten, sodass ein Drittanbieter-Relayer für `qorechain-diana` einen eigenen Testnet-Node braucht ([Einen Node betreiben](/developer-guide/running-a-node), [Verbindung zum Testnet](/getting-started/connecting-to-testnet)). Öffentliche Endpunkte, die Relayer ratenbegrenzen, lassen sich für einen kurzen Test verwenden, nicht aber für dauerhaftes Relaying.
- **Konten.** Ein eigenes Relayer-Konto auf jeder Chain, mit einem kleinen Guthaben für Gebühren. Test-QOR gibt es beim [Dashboard-Faucet](/dashboard/faucet); es hat keinen Wert. Verwenden Sie nie den Operator-Schlüssel eines Validators.
- **Kosten.** QORel ist kostenlos. Auf QoreChain kostet eine Transaktion Gas mal Preis, mit einer Untergrenze von 0,1 uqor pro Gas, und die gesamte Gebühr wird ohne Rückerstattung berechnet.
- **Plattformen.** Linux x86_64 und arm64 (glibc 2.28 oder neuer), macOS Apple Silicon und Intel sowie ein Container-Image für alles andere. Windows wird nicht unterstützt; verwenden Sie den Container unter WSL2.

## Wo es veröffentlicht ist {#where-published}

| Wo | Was | Version |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | Quellcode, Issues und die Release-Seite mit Tarballs, `.deb`, `.rpm`, `SHA256SUMS` und Build-Attestierungen | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Container-Image (amd64 und arm64, distroless, non-root, mit cosign signiert) | 0.1.0 |
| Crate `qorel-signer` | Die Signierschicht, im Repository unter `crates/qorel-signer`; als Git-Abhängigkeit einbinden | Nicht auf crates.io |

Lizenz: Apache-2.0. QORel ist von Hermes abgeleitet, Copyright Informal Systems Inc. und die Hermes-Autoren, ebenfalls Apache-2.0; die Datei `NOTICE` im Repository enthält die Zuschreibung. Die Befehle und die Prüfung eines Downloads stehen unter [Installation](/qorel/install).

Die übrigen Entwickler-Pakete finden Sie unter [Entwickler-Pakete](/developer-tools/overview). Wie IBC in die Chain passt, steht unter [Bridge-Architektur](/architecture/bridge-architecture#ibc-relayer).

## Grenzen und bekannte Probleme {#limits}

- **Nur Testnet.** QORel wurde gegen `qorechain-diana` und das öffentliche Testnet des Cosmos Hub betrieben. Es hat im Mainnet noch nicht relayt, und es ist kein Mainnet-IBC-Kanal geöffnet.
- **Nur IBC v1 (klassisch).** Das Relaying von IBC v2 ist in QORel noch nicht implementiert; es ist die nächste Phase. Das Relaying für Ethereum (Eureka) wurde noch nicht begonnen.
- **Chain-Version.** Der Hybridmodus folgt der Sign-Bytes-Version, die die Chain meldet. Beide QoreChain-Netzwerke prüfen heute die aktuelle Form (Version 2).
- **Kein gehosteter Relayer.** Dieses Handbuch bietet keinen Relayer-Dienst an. Läuft für einen Kanal kein Relayer, bleibt ein Transfer ausstehend, bis einer läuft.
- **Öffentliche Endpunkte.** Die QoreChain-Seite braucht gRPC, das nicht öffentlich ist. Öffentliche Endpunkte Dritter für andere Chains begrenzen Relayer oft per Rate-Limit.
- **Keine Wallet.** QORel signiert nur die Transaktionen, die es als Relayer sendet. Zum Signieren mit einer Wallet siehe [QoreSign](/qoresign/overview).
- **Kein Windows-Build.** Verwenden Sie den Container unter WSL2.
- **Release-Status.** QORel ist eine 0.x-Version. Befehle und Einstellungen, die mit Hermes übereinstimmen, behalten das Verhalten von Hermes; QoreChain-spezifische Einstellungen können sich vor 1.0 noch ändern.
