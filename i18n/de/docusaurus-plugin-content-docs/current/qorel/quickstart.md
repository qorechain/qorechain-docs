---
slug: /qorel/quickstart
title: QORel Quickstart
sidebar_label: Quickstart
sidebar_position: 4
---

# Quickstart

Diese Anleitung führt durch das Relaying zwischen dem QoreChain-Testnet `qorechain-diana` und dem öffentlichen Testnet des Cosmos Hub (Chain-ID `provider`): installieren, konfigurieren, Schlüssel hinzufügen und registrieren, die Bereitschaft prüfen, den Relayer starten und einen ersten Transfer senden. Sie richtet sich an alle, die noch nie einen Relayer betrieben haben. Alles hier gilt für das Testnet; die Token haben keinen Wert.

## Innovationen {#innovations}

- **Die Bereitschaft ist ein einziges Feld.** `qorel keys pqc-status` endet mit `ready_to_relay`. Ist es `true`, ist der Post-Quanten-Schlüssel on-chain registriert und stimmt mit dem lokalen Schlüssel überein, und der Relayer lehnt seine eigenen Transaktionen aus diesem Grund nicht ab.
- **Es wird nichts gesendet, wenn etwas nicht stimmt.** Die Prüfung vor dem Senden hält eine fehlerhafte Transaktion auf, bevor sie die Chain erreicht, sodass ein ausgelassener Schritt keine Gebühr kostet.
- **Derselbe Ablauf für jede Chain.** Die Schritte für die Cosmos-Hub-Seite sind die von Hermes selbst; neu sind nur der QoreChain-Chain-Eintrag und der Registrierungsschritt.

## Verwendung {#how-to-use}

### 1. Installieren {#step-install}

Installieren Sie `qorel` auf einem beliebigen Weg von der Seite [Installation](/qorel/install) und prüfen Sie es:

```bash
qorel --version
```

### 2. Die Konfiguration beschaffen {#step-config}

Kopieren Sie die Beispielkonfiguration aus dem Repository (`packaging/config.example.toml`; `.deb` und `.rpm` legen sie unter `/etc/qorel/config.example.toml` ab):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

Öffnen Sie `~/.hermes/config.toml` und ersetzen Sie die Platzhalter für den QoreChain-Node (`YOUR-QORECHAIN-NODE`) durch die RPC-, gRPC- und WebSocket-Adressen eines Testnet-Nodes, den Sie betreiben. QoreChain hat keinen öffentlichen gRPC-Endpunkt, Sie brauchen also einen eigenen Node; siehe [Einen Node betreiben](/developer-guide/running-a-node) und [Verbindung zum Testnet](/getting-started/connecting-to-testnet). Jede Einstellung wird unter [Konfiguration](/qorel/configuration) erklärt.

Die Beispielkonfiguration hat zwei Chains: `qorechain-diana` mit `signing = 'qorechain-hybrid'` und `provider` mit der standardmäßigen Standard-Signierung. Sie beschränkt das Relaying auf `transfer/channel-0` auf QoreChain und `transfer/channel-600` auf dem Hub-Testnet.

### 3. Die Relayer-Konten anlegen und aufladen {#step-accounts}

Legen Sie auf jeder Chain ein neues Konto für den Relayer an. Verwenden Sie ein eigenes Konto, nie den Operator-Schlüssel eines Validators. Speichern Sie die Mnemonic jedes Kontos in einer Datei, die nur Sie lesen können:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

Dieselbe Mnemonic kann für beide Chains dienen, oder Sie verwenden für jede eine eigene. QORel leitet standardmäßig mit Coin-Type 118 (`m/44'/118'/0'/0/0`) ab; übergeben Sie `--hd-path` an `keys add`, wenn Ihr Konto einen anderen Pfad verwendet.

Fügen Sie die Schlüssel hinzu:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

Auf `qorechain-diana` leitet `keys add` zusätzlich den ML-DSA-87-Schlüssel aus derselben Mnemonic ab und speichert dessen Seed neben dem Schlüssel als `relayer.pqc`. Löschen Sie die Mnemonic-Dateien, wenn Sie fertig sind.

Laden Sie anschließend die Konten auf. Die Adressen zeigt `qorel keys list --chain <id>`. Test-QOR gibt es beim [Dashboard-Faucet](/dashboard/faucet); Testtoken für das Hub-Testnet kommen vom öffentlichen Faucet dieses Netzwerks. Wenige Token genügen für Gebühren: Die Untergrenze von QoreChain beträgt 0,1 uqor pro Gas, eine Transaktion mit dem Standard-Gaslimit von 400.000 kostet beim Preis der Untergrenze also etwa 40.000 uqor. Prüfen Sie mit:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Den Post-Quanten-Schlüssel registrieren {#step-register}

QoreChain akzeptiert eine hybrid signierte Transaktion nur von einem Konto, das seinen öffentlichen ML-DSA-87-Schlüssel registriert hat. Die Registrierung erfolgt einmalig:

```bash
qorel keys register-pqc --chain qorechain-diana
```

Sie sendet eine Transaktion, die allein mit dem klassischen Schlüssel signiert ist (die einzige Art von Transaktion, die QoreChain auf diese Weise akzeptiert), mit einem Besitznachweis (Proof of Possession). Sie kann bedenkenlos erneut ausgeführt werden: Ist derselbe Schlüssel bereits registriert, sendet sie nichts. Hat das Konto bereits einen anderen Post-Quanten-Schlüssel registriert, lehnt sie ab und sendet nichts.

Prüfen Sie die Bereitschaft:

```bash
qorel keys pqc-status --chain qorechain-diana
```

Das Ergebnis ist ein JSON-Objekt mit den Feldern `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` und `ready_to_relay`. Fahren Sie nur fort, wenn `ready_to_relay` `true` ist. Ist es das nicht, siehe [Fehlerbehebung](/qorel/troubleshooting).

### 5. Health-Check {#step-health}

```bash
qorel health-check
```

Er prüft die Konfiguration und die Verbindung zu jeder Chain und meldet einen Gas-Multiplikator unter 1.1 bei einem QoreChain-Eintrag als mögliche Fehlkonfiguration (eine Warnung; das Relaying funktioniert weiter).

### 6. Den Kanal wählen {#step-channel}

Das Testnet hat bereits einen Transfer-Kanal: `channel-0` auf `qorechain-diana`, dessen Gegenstelle `channel-600` auf `provider` ist ([Der Testkanal](/user-guide/bridging-assets#ibc-test-channel)). Um ihn zu relayen, gehen Sie direkt zu Schritt 7.

So legen Sie stattdessen einen eigenen neuen Kanal zwischen den beiden Chains an:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` erstellt außerdem die beiden Light-Clients und die Verbindung. Das sendet auf jeder Chain mehrere Transaktionen. Der Befehl gibt die neuen Kanalkennungen aus; tragen Sie sie in den `packet_filter` beider Chain-Einträge ein.

### 7. Den Relayer starten {#step-start}

```bash
qorel start
```

Lassen Sie ihn laufen (verwenden Sie für einen dauerhaften Relayer den systemd-Dienst oder einen Container; siehe [Neben einem Validator betreiben](/qorel/running-next-to-a-validator)). QORel relayt Pakete, aktualisiert die Light-Clients und beobachtet Fehlverhalten.

### 8. Einen ersten Transfer senden {#step-transfer}

Senden Sie in einem zweiten Terminal 1000 uqor von QoreChain zum Hub-Testnet. QORel signiert und sendet diese Transaktion selbst, mit derselben Hybridsignatur:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

Ohne `--receiver` gehen die Token an die eigene Adresse des Relayers auf der Zielchain. Verfolgen Sie dann das Paket:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

Das Paket wird aufgelistet, bis der laufende Relayer es zugestellt hat und die Bestätigung zurückkommt. Auf QoreChain können Sie den Kanal und die Token-Traces auch über REST lesen:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Ein Transfer, der nicht vor seinem Timeout zugestellt wird, wird vom Relayer dem Absender auf der Quellchain zurückerstattet. Der Wert `--timeout-seconds` oben gibt ihm zehn Minuten.

## Zugang {#how-to-access}

- **Netzwerk.** Nur das Testnet `qorechain-diana` und das öffentliche Testnet des Cosmos Hub.
- **Sie brauchen.** QORel, einen QoreChain-Testnet-Node, den Sie betreiben (RPC, gRPC und WebSocket), erreichbare Endpunkte für das Hub-Testnet, ein aufgeladenes Relayer-Konto auf jeder Chain und die Mnemonic für jedes in einer Datei.
- **Kosten.** Nur Gebühren in Testtoken: auf QoreChain Gas mal ein Preis mit einer Untergrenze von 0,1 uqor pro Gas, ohne Rückerstattung von ungenutztem Gas.
- **Container-Nutzer.** Führen Sie jeden obigen Befehl als `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>` aus, mit den Mnemonic-Dateien im eingebundenen Verzeichnis, und `start` als dauerhaft laufenden Container ([Installation](/qorel/install#container)).

## Wo es veröffentlicht ist {#where-published}

Die Binärdatei und die Beispielkonfiguration stammen aus dem [QORel-Repository](https://github.com/qorechain/QORel) (`packaging/config.example.toml`); jeden Kanal finden Sie unter [Installation](/qorel/install), die Versionen im [QORel-Überblick](/qorel/overview#where-published).

## Grenzen und bekannte Probleme {#limits}

- **Nur Testnet.** Mainnet-IBC ist nicht geöffnet; richten Sie diesen Ablauf nicht auf das Mainnet.
- **Sie brauchen Ihren eigenen QoreChain-Node.** Es gibt keinen öffentlichen gRPC-Endpunkt.
- **Ein neuer Kanal kostet Gebühren auf beiden Chains** und fügt einen Client und eine Verbindung hinzu. Relayen Sie bevorzugt `channel-0`, sofern Sie keinen eigenen brauchen.
- **Öffentliche Endpunkte der Hub-Seite können ratenbegrenzen.** QORel versucht es weiter, doch für dauerhaftes Relaying verwenden Sie Ihre eigenen Nodes.
- **Ausstehend bis zum Relayen.** Läuft für den Kanal kein Relayer, bleibt ein Transfer ausstehend, bis einer gestartet wird oder das Paket abläuft.

Weiter mit: [Konfiguration](/qorel/configuration), [Monitoring](/qorel/monitoring), [Fehlerbehebung](/qorel/troubleshooting).
