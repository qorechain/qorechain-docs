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

Du kannst einen Node auch über die **Tools**-Seite des QoreChain Dashboards hochfahren und seinen Lizenzierungsstatus prüfen. Das Betreiben des Nodes und der Beitritt zu dessen Belohnungsprogramm sind zwei unterschiedliche Dinge, und das Dashboard hält sie getrennt, anstatt einen einzigen geführten Anmeldeablauf anzubieten:

1. **Deinen Node zum Laufen bringen (Tools → Light Node, Schritt 1).** Dafür ist keine Lizenz und keinerlei On-Chain-Prüfung nötig, und dieser Schritt wird jedem Besucher als Erstes angezeigt, noch vor allem anderen. Er liest das aktuelle Netzwerk-Manifest live aus und führt durch das Herunterladen und Verifizieren der Binärdatei, das Initialisieren des Nodes mit dem Genesis-Datensatz, das Ausrichten von `config.toml` auf die Peers des Netzwerks sowie das State-Syncing anstelle einer Synchronisierung ab Genesis.
2. **Den Status deines Belohnungsprogramms prüfen (Tools → Light Node).** Der Beitritt zum Belohnungsanteil für Light Nodes ist ein separater, on-chain-gesteuerter Schritt: Er erfordert eine aktive, on-chain vergebene `lightnode_operator`-Lizenz, ein Mindestmaß an delegiertem QOR — gezählt als deine Gesamtsumme über alle Validatoren, an die du delegierst, nicht pro Validator, und live aus dem Staking ausgelesen statt selbst angegeben — sowie eine kleine On-Chain-Registrierungsgebühr. **Die Anmeldung ist noch nicht geöffnet**, und der Kauf einer Lizenz über **Buy License** öffnet sie nicht vorzeitig — es gibt heute nichts, wofür man sich anmelden könnte. Bis sie geöffnet wird, zeigt dieser Tab die Anforderung als zu prüfenden Status an, nicht als auszufüllendes Formular. Betreibe und synchronisiere deinen Node in der Zwischenzeit weiter; die Betriebszeit von vor der Öffnung der Anmeldung soll zählen, sobald sie geöffnet wird.
3. **Registrieren, sobald deine Lizenz on-chain vergeben ist (Tools → Light Node).** Eine über **Buy License** gekaufte Lizenz wird zunächst auf unserer Seite erfasst; die Vergabe, die sie on-chain anerkennt, ist ein separater Schritt, und die Registrierung wird verweigert, bis diese Vergabe eingetroffen ist. Sobald das der Fall ist, ersetzt dieser Tab das Statusfeld durch ein Registrierungsformular: deine Operator-Adresse (`qor1…`), einen Moniker und eine öffentliche Endpunkt-URL, dazu eine Bestätigung der Stake-Verpflichtung.
4. **Bestätigen und Stake binden.** Nach dem Absenden zeigt das Dashboard eine Bestätigungsübersicht der Registrierung (Moniker, Operator-Adresse, Endpunkt, Stake-Absicht, Status). Binde den bestätigten Stake von deiner Operator-Adresse, sobald die Berechtigung eröffnet wird.

Nutze den Dashboard-Ablauf, wenn du eine UI gegenüber der CLI bevorzugst oder Lizenzierung und Registrierung zusammen an einem Ort verwalten möchtest. Der oben genannte Befehl `lightnode-sx register` bleibt für alle verfügbar, die die Transaktion lieber selbst erstellen und überprüfen möchten — die On-Chain-Registrierung und die Berechtigung für das Belohnungsprogramm werden von der Chain unabhängig vom gewählten Weg auf dieselbe Weise geregelt.

## Wie es weitergeht

- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — wie der 3%-Anteil verdient, verzinst (compounded) und überwacht wird.
- [SX-Edition](/light-node/sx-edition) — der `register`-Befehl und die vollständige CLI-Referenz.
