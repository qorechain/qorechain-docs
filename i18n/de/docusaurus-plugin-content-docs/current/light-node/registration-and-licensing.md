---
slug: /light-node/registration-and-licensing
title: Registrierung und Lizenzierung
sidebar_label: Registrierung & Lizenzierung
sidebar_position: 4
---

# Registrierung und Lizenzierung

Um den [3%-Belohnungsanteil für Light Nodes](/light-node/rewards-and-monitoring) zu verdienen, muss ein Light Node **on-chain registriert** sein und fortlaufend nachweisen, dass er aktiv ist. Diese Seite behandelt, wie die Registrierung funktioniert, wie der Node seine Aktivität (Liveness) nachweist und wie man einen Node über das Dashboard registriert und lizenziert.

## On-Chain-Registrierung

Die Registrierung trägt deinen Light Node in die Chain ein, damit das Protokoll weiß, dass er existiert, welcher Typ er ist (`sx` oder `ux`) und welcher Operator-Schlüssel ihn kontrolliert. Sobald er registriert und aktiv ist, wird der Node für den Belohnungsanteil für Light Nodes berechtigt.

### Erzeugen des Registrierungsbefehls

Die SX-Edition kann den exakten Chain-Befehl ausgeben, um diesen Node zu registrieren. Führe aus:

```bash
lightnode-sx register
```

Dies liest deinen Operator-Schlüssel aus dem Keyring und gibt eine sofort ausführbare `qorechaind`-Transaktion zusammen mit deiner Operator-Adresse, dem Node-Typ und der Version aus. Der Befehl akzeptiert zwei optionale Flags:

- `--type` — der Node-Typ, `sx` oder `ux` (Standard ist `sx`).
- `--version` — die zu registrierende Node-Version (Standard ist die eigene Version der Binärdatei).

Der ausgegebene Befehl registriert den Node on-chain unter dem Modul `x/lightnode`. Reiche ihn mit einem finanzierten Operator-Konto in dem Netzwerk ein, dem du beitrittst (Testnet `qorechain-diana` oder Mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **gibt** die Registrierungstransaktion zur Überprüfung und Einreichung **aus** — es sendet sie nicht von selbst. So behältst du die Kontrolle darüber, wann und wie der Node registriert wird.
:::

## Heartbeat-Liveness-Nachweise

Die Registrierung allein reicht nicht aus, um berechtigt zu bleiben. Ein registrierter Light Node muss fortlaufend nachweisen, dass er online ist, indem er **Heartbeat-Liveness-Nachweise** einreicht. Über diese Heartbeats unterscheidet die Chain aktive Nodes — die für den Belohnungsanteil berechtigt sind — von registrierten, aber offline befindlichen Nodes.

In der Praxis bedeutet das: Ein Node, der registriert ist und weiterläuft (und synchronisiert ist), behält seine Berechtigung, während ein Node, der offline geht, aufhört, seine Aktivität nachzuweisen, und seine Berechtigung verliert, bis er zurückkehrt. Den Daemon am Laufen und gesund zu halten, ist daher Teil des Verdienens von Belohnungen — siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) dazu, wie man Heartbeat- und Sync-Zustand beobachtet.

### PQC-mitsignierte Heartbeat-Pipeline {#pqc-cosigned-heartbeat-pipeline}

QoreChain ist **standardmäßig PQC-erforderlich**, daher wird die Heartbeat-Liveness-Transaktion über eine post-quantum mitsignierte Pipeline erzeugt statt über eine rein klassische Signatur. Der Daemon erstellt den unsignierten Heartbeat und signiert ihn dann vor dem Broadcast mit einer **hybriden Dilithium-5 (ML-DSA-87)**-Signatur mit — dieselbe Post-Quantum-Haltung, die die Chain für jede Transaktion erzwingt. Der Node reicht einen Heartbeat pro `interval_blocks`-Fenster ein (passend zum Chain-Parameter `heartbeat_interval`) und taktet sich anhand der Blockhöhe selbst, um Ablehnungen wegen zu früher Einreichung zu vermeiden.

On-Chain-Heartbeats sind im Daemon opt-in: Aktiviere den Abschnitt `[heartbeat]` in der Node-Konfiguration (`enabled = true`) und lasse `qorechaind_path` auf eine `qorechaind`-Binärdatei zeigen, die den Generate-then-Co-sign-Ablauf ausführt. Wenn dies nicht konfiguriert ist, läuft der Node, ohne On-Chain-Heartbeats einzureichen, und der Operator kann die Liveness manuell mit den ausgegebenen Chain-Befehlen einreichen.

## Registrierung und Lizenzierung über das Dashboard

Du kannst einen Node auch über das QoreChain Dashboard registrieren und eine Lizenz erhalten, das einen geführten Ablauf bietet, statt Chain-Befehle von Hand zu erstellen.

- Registriere deinen Node unter **Tools → Node Registration**.
- Erhalte oder erneuere eine Lizenz unter **Tools → Buy License**.

Der Dashboard-Ablauf führt dich durch das Verknüpfen deines Operator-Schlüssels, die Wahl des Node-Typs und Netzwerks sowie den Abschluss der On-Chain-Registrierung. Nutze ihn, wenn du eine UI gegenüber der CLI bevorzugst oder die Lizenzierung zusammen mit der Registrierung an einem Ort verwalten möchtest.

## Wie es weitergeht

- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — wie der 3%-Anteil verdient, verzinst (compounded) und überwacht wird.
- [SX-Edition](/light-node/sx-edition) — der `register`-Befehl und die vollständige CLI-Referenz.
