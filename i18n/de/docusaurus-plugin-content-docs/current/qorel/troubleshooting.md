---
slug: /qorel/troubleshooting
title: QORel Fehlerbehebung und FAQ
sidebar_label: Fehlerbehebung
sidebar_position: 9
---

# Fehlerbehebung und FAQ

Fragen und Lösungen für den Betrieb von QORel, in der Reihenfolge, in der man meist darauf stößt. Sie richtet sich an Betreiber, deren Relayer nicht startet, nicht senden will oder Pakete ausstehend lässt. QORel läuft heute nur im Testnet, daher gehen alle Antworten von `qorechain-diana` aus.

## Innovationen {#innovations}

Die meisten Probleme auf einer Hybrid-Chain werden abgefangen, bevor eine Gebühr anfällt:

- **Die Prüfung vor dem Senden benennt das Problem.** Ist der Post-Quanten-Schlüssel nicht geladen, nicht registriert oder nicht der lokale Schlüssel, oder ist die Sign-Bytes-Version unbekannt, sendet QORel nichts und sagt, welcher Fall vorliegt.
- **`keys pqc-status` ist der erste Befehl, den Sie ausführen sollten.** Er zeigt die Registrierung, die Übereinstimmung des Schlüssels, den Besitznachweis, die Sign-Bytes-Version, die die Chain prüft, und `ready_to_relay`.
- **`health-check` erklärt Fehlkonfigurationen**, einschließlich eines Gas-Multiplikators unter 1.1 bei einem QoreChain-Eintrag.

## Verwendung {#how-to-use}

Führen Sie zuerst diese aus und vergleichen Sie:

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Schlüssel und Registrierung {#keys}

**`ready_to_relay` ist `false`. Was nun?**
Lesen Sie die anderen Felder von `keys pqc-status`:
- `registered: false`: Das Konto hat keinen registrierten Post-Quanten-Schlüssel. Laden Sie das Konto auf und führen Sie dann `qorel keys register-pqc --chain qorechain-diana` aus.
- `registered: true`, aber `matches_local_key: false`: Das Konto hat einen anderen Schlüssel registriert als den, den QORel hält. Prüfen Sie, ob Sie die eigene Mnemonic des Kontos und den richtigen `--key-name` verwendet haben. Wenn Sie den Schlüssel neu hinzugefügt haben, baut `keys add --overwrite` den lokalen Schlüssel und seinen Seed `<key name>.pqc` aus der Mnemonic neu auf.
- Der Befehl kann den Schlüssel nicht laden: Die Datei `<key name>.pqc` neben dem Schlüssel fehlt oder ist nicht lesbar. Führen Sie `keys add` für diese Chain erneut aus.

**`keys register-pqc` meldet, das Konto habe bereits einen anderen Schlüssel.**
Es hat absichtlich nichts gesendet. Der Schlüssel on-chain wurde aus einer anderen Mnemonic oder von einem anderen Werkzeug registriert. Verwenden Sie die ursprüngliche Mnemonic oder rotieren Sie den Schlüssel on-chain vom alten aus ([Post-Quanten-Signierung](/developer-guide/post-quantum-signing#key-rotation)); ein Schlüssel, den das Konto zuvor verwendet hat, kann nicht erneut registriert werden.

**`keys register-pqc` schlägt mit einem Gebühren- oder Guthabenfehler fehl.**
Das Konto braucht im Testnet QOR, bevor es seine erste Transaktion senden kann. Verwenden Sie den [Dashboard-Faucet](/dashboard/faucet). Die Registrierung braucht einige hunderttausend Gas; bei der Untergrenze von 0,1 uqor sind das einige zehntausend uqor.

**Brauche ich `--no-proof`?**
Nur für ein Netzwerk älter als v3.2.3. Beide QoreChain-Netzwerke akzeptieren einen Besitznachweis (Proof of Possession), und QORel fügt standardmäßig einen hinzu.

**Wo wird mein Post-Quanten-Schlüssel gespeichert?**
Neben dem secp256k1-Schlüssel als `<key name>.pqc` (ein 32-Byte-Seed), nur für den Besitzer lesbar. Er lässt sich aus der Mnemonic neu ableiten. Sichern Sie die Mnemonic, nicht die Dateien.

**Meine Schlüsseldateien sind für andere lesbar.**
QORel schreibt neue Schlüsseldateien mit 0600. Mit einem älteren Hermes hinzugefügte Schlüssel behalten ihren alten Modus; führen Sie darauf `chmod 600` aus.

### Konfiguration {#config}

**Die Konfiguration wird mit einer Meldung zu `extension_options` abgelehnt.**
Statische `extension_options` lassen sich nicht mit `signing = 'qorechain-hybrid'` kombinieren: Die Post-Quanten-Signatur muss die einzige kritische Erweiterungsoption sein. Entfernen Sie sie aus dem Eintrag dieser Chain.

**Es heißt, die Chain verwende nicht `signing = "qorechain-hybrid"`.**
Die Key-Befehle für den Post-Quanten-Schlüssel funktionieren nur auf Chains mit dieser Einstellung. Fügen Sie sie dem QoreChain-Eintrag hinzu.

**Muss ich die Sign-Bytes-Version setzen?**
Nein. `pqc.sign_bytes = 'auto'` liest sie von der Chain, liest sie jede Minute und nach jeder Ablehnung neu. Ein festes `v1` oder `v2`, das nicht zur Chain passt, führt dazu, dass jede Transaktion abgelehnt wird.

**`pqc-status` zeigt `sign_bytes` als unknown.**
QORel konnte die Upgrade-Einträge der Chain nicht lesen. Prüfen Sie, dass `rpc_addr` des QoreChain-Eintrags antwortet und auf das richtige Netzwerk zeigt (`qorechain-diana` im Testnet). QORel signiert nicht ohne bekannte Version.

**Welchen Gas-Multiplikator sollte ich verwenden?**
`1.1` ist der Standardwert im Beispiel und hält `health-check` ruhig. Im Testnet (v3.2.6) funktioniert ein niedrigerer Wert wie `1.05`. Frühere Builds melden simuliertes Gas zu niedrig, verwenden Sie daher `1.15` auf einem Node, der einen solchen betreibt. Siehe [Gas](/qorel/configuration#gas).

**`health-check` warnt vor dem Gas-Multiplikator.**
Er liegt bei einem QoreChain-Eintrag unter 1.1. Es ist nur eine Warnung; das Relaying funktioniert. Erhöhen Sie ihn, wenn Sie Out-of-Gas-Fehler sehen.

### Senden und Relayen {#relaying}

**Die Chain lehnt eine Transaktion mit Codespace `pqc`, Code 21 ab.**
Die Hybridsignatur wurde nicht verifiziert. QORel liest die Sign-Bytes-Version und die Registrierung vor der nächsten Transaktion neu und versucht es erneut. Wiederholt es sich: Bestätigen Sie, dass `id` im Chain-Eintrag genau der Chain-ID entspricht (`qorechain-diana`), dass der Schlüssel der registrierte ist (`keys pqc-status`) und dass der verwendete Node die erwartete Version betreibt. [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#code-21) listet die Ursachen auf.

**Es wird nichts gesendet und keine Gebühr fällt an, aber der Relayer protokolliert einen Fehler.**
Das ist die Prüfung vor dem Senden bei der Arbeit. Die Logzeile nennt das fehlende Teil: Schlüssel nicht geladen, Schlüssel nicht registriert, Schlüssel passt nicht oder Sign-Bytes-Version unbekannt. Beheben Sie es wie oben.

**Fehler `account sequence mismatch`.**
Zwei Prozesse signieren mit demselben Relayer-Schlüssel. Betreiben Sie einen Relayer pro Schlüssel; das gilt auch für einen systemd-Dienst plus einen Container und für einen zweiten Kubernetes-Pod.

**Ich sehe `429 Too Many Requests` in den Logs.**
Der Endpunkt ratenbegrenzt, meist ein öffentlicher nach einem Neustart. QORel behandelt das als wiederholbar und hält seine Paket-Worker aktiv, mit einem neuen Versuch bei jedem Clear-Intervall. Verwenden Sie für dauerhaftes Relaying Ihre eigenen Nodes oder einen kostenpflichtigen Endpunkt. Das QoreChain-Testnet hat keinen öffentlichen gRPC-Endpunkt, daher braucht die QoreChain-Seite ohnehin Ihren eigenen Node.

**Gebühren- oder Out-of-Gas-Fehler auf QoreChain.**
Die Gebühr ist Gaslimit mal Preis, ohne Rückerstattung, und die Untergrenze beträgt 0,1 uqor pro Gas. Prüfen Sie `gas_price`, ob `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` gesetzt ist, und das Kontoguthaben (`qorel keys balance --chain qorechain-diana`).

### Pakete und Kanäle {#packets}

**Mein Transfer ist ausstehend und nichts kommt an.**
Prüfen Sie der Reihe nach: Für den Kanal läuft ein Relayer (der Prozess läuft; die Telemetrie antwortet); der Kanal steht in Ihrem `packet_filter` auf beiden Chains; der Relayer hat ein Guthaben auf der Zielchain; der Post-Quanten-Schlüssel ist bereit; die Endpunkte sind erreichbar. Führen Sie dann `qorel query packet pending` für den Kanal aus. Läuft kein Relayer, wartet das Paket, bis einer startet oder der Transfer abläuft.

**Was passiert, wenn ein Transfer abläuft?**
Läuft der Relayer, relayt er den Timeout, und die Token werden dem Absender auf der Quellchain zurückerstattet. Das wurde auf dem Testnet-Kanal getestet.

**Kann ich den vorhandenen Testkanal verwenden, oder brauche ich einen eigenen?**
`channel-0` des Testnets zu `channel-600` des Hub-Testnets ist offen ([Der Testkanal](/user-guide/bridging-assets#ibc-test-channel)); betreiben Sie QORel mit diesem `packet_filter`, um ihn zu relayen. Legen Sie mit `qorel create channel ... --new-client-connection` nur dann einen eigenen an, wenn Sie ihn brauchen.

**`create channel` schlägt auf halbem Weg fehl.**
Der Handshake besteht aus mehreren Transaktionen auf beiden Chains. Führen Sie `qorel health-check` aus, beheben Sie die Ursache und führen Sie den Befehl dann erneut aus, mit `--a-connection` auf die bereits angelegte Verbindung gesetzt, oder beginnen Sie mit `--new-client-connection` von vorn.

**Funktioniert das ursprüngliche Hermes mit QoreChain?**
Nein. QoreChain lehnt eine Transaktion ohne die ML-DSA-87-Signatur ab, und das ursprüngliche Hermes fügt sie nicht hinzu. QORel ist Hermes plus diese Signatur.

### Allgemein {#general}

**Kann QORel andere Chains als QoreChain relayen?**
Ja. Eine Chain ohne `signing` verwendet das Standard-Transaktionsformat von Hermes, Byte für Byte.

**Wird das Mainnet unterstützt?**
Noch nicht. Es ist kein Mainnet-IBC-Kanal geöffnet. Sobald Mainnet-IBC öffnet, wird dieses Handbuch es sagen.

**Wird IBC v2 unterstützt?**
Noch nicht. Das Relaying von IBC v2 ist in QORel nicht implementiert; es ist die nächste Phase. Das Relaying für Ethereum (Eureka) wurde noch nicht begonnen.

**Windows?**
Nein. Verwenden Sie den Container unter WSL2.

**Wo melde ich ein Problem?**
Eröffnen Sie ein Issue auf [github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues). Geben Sie die QORel-Version, den geschwärzten Chain-Eintrag und die Ausgabe von `qorel keys pqc-status` an; posten Sie nie eine Mnemonic, eine Schlüsseldatei oder einen `.pqc`-Seed.

## Zugang {#how-to-access}

- Jeder obige Befehl wird auf dem Relayer-Host mit derselben Konfiguration wie der Relayer ausgeführt.
- Öffentlicher Zustand zum Vergleich: das REST des QoreChain-Testnets unter `https://api-testnet.qore.host` ([Verbindung zum Testnet](/getting-started/connecting-to-testnet)) und der [Block-Explorer](https://explore.qore.network) (auf Testnet umschalten).

## Wo es veröffentlicht ist {#where-published}

QORel liegt im Repository [qorechain/QORel](https://github.com/qorechain/QORel); Issues gehören dorthin. Der Hermes-Leitfaden des Upstream-Projekts, [hermes.informal.systems](https://hermes.informal.systems), behandelt die Einstellungen und Befehle, die QORel mit ihm teilt.

## Grenzen und bekannte Probleme {#limits}

- **Nur Testnet** und eine 0.x-Version.
- **Noch kein Relaying von IBC v2** (nächste Phase) und kein Relaying für Ethereum (Eureka).
- **Endpunkte von Dritten begrenzen Raten.** Die Endpunkte der Hub-Seite in der Beispielkonfiguration sind öffentlich und werden nicht von QoreChain betrieben.
- **Diese Seite kann nicht jeden Hermes-Fehler abdecken.** Für Fehler, die weder den Post-Quanten-Schlüssel, die Sign-Bytes noch QoreChain erwähnen, gelten der Hermes-Leitfaden und der Issue-Tracker.

Siehe auch: [Konfiguration](/qorel/configuration), [Monitoring](/qorel/monitoring), [Signieren aus jeder Sprache](/qorel/signing-from-any-language).
