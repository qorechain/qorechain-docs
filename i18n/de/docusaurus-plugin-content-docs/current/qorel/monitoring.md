---
slug: /qorel/monitoring
title: QORel überwachen
sidebar_label: Monitoring
sidebar_position: 7
---

# Monitoring

Ein Relayer, der leise stehen bleibt, lässt Pakete ausstehend zurück, deshalb sollte er überwacht werden. Diese Seite listet auf, was QORel bereitstellt (Prometheus-Telemetrie, einen optionalen REST-Endpunkt, Logs und Befehle) und worauf Alarme gesetzt werden sollten. Sie richtet sich an Betreiber, die einen Relayer für einen Kanal betreiben, der ihnen wichtig ist.

## Innovationen {#innovations}

- **Eine skriptfähige Bereitschaftsprüfung für den Post-Quanten-Schlüssel.** `qorel keys pqc-status` gibt ein JSON-Objekt aus, dessen Feld `ready_to_relay` nur dann `true` ist, wenn der Schlüssel on-chain registriert ist und mit dem lokalen Schlüssel übereinstimmt. Ein Alarm auf dieses Feld erkennt einen fehlenden oder geänderten Schlüssel, bevor der Relayer abgelehnt wird.
- **Fehler, die das Relaying nicht stillschweigend stoppen.** Paket-Worker laufen weiter und versuchen es nach einem fehlgeschlagenen Relay- oder Clearing-Versuch bei jedem Clear-Intervall erneut, sodass sich ein kurzes Rate-Limit als Warnungen im Log zeigt und nicht als hängender Kanal.
- **Eine Prüfung vor dem Senden mit Begründung.** Lehnt die Prüfung vor dem Senden eine Transaktion ab (Schlüssel nicht registriert, Schlüssel passt nicht, Sign-Bytes-Version unbekannt), wird nichts gesendet, und der Grund wird protokolliert und von `qorel health-check` angezeigt.

## Verwendung {#how-to-use}

### Telemetrie {#telemetry}

Aktivieren Sie sie in der Konfiguration:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

Die Metriken werden im Prometheus-Format unter `http://127.0.0.1:3001/metrics` bereitgestellt. Es sind die Hermes-Metriken; Prometheus zeigt Zähler mit dem Suffix `_total`. Die Metriken, die sich darzustellen lohnen:

| Metrik | Warum |
|---|---|
| `workers` | Anzahl der laufenden Worker nach Typ; ein Rückgang bedeutet, dass ein Worker gestoppt ist. |
| `backlog_size`, `backlog_oldest_sequence` | Auf einem Kanal wartende Pakete und die älteste noch wartende Sequenz. |
| `wallet_balance` | Das Guthaben des Relayers auf jeder Chain. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Relayte Pakete. Eine flache Linie bei wachsendem Backlog ist ein Stillstand. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Pflege der Light-Clients und Meldungen von Fehlverhalten. |
| `broadcast_errors`, `simulate_errors` | Transaktionen, die abgelehnt wurden oder deren Simulation fehlschlug. |
| `ws_reconnect` | WebSocket-Wiederverbindungen; viele hintereinander deuten auf einen instabilen Endpunkt hin. |
| `tx_latency_submitted`, `tx_latency_confirmed` | Wie lange Transaktionen dauern. |

Hermes dokumentiert den vollständigen Satz in seinem [Telemetrie-Leitfaden](https://hermes.informal.systems/documentation/telemetry/operators.html). Der Listener liegt in der Beispielkonfiguration auf `127.0.0.1`; setzen Sie Ihren Prometheus-Scraper auf denselben Host oder ändern Sie `host` bewusst.

### Worauf Alarme gesetzt werden sollten {#alerts}

| Was | Wo |
|---|---|
| Prozess läuft | Der Telemetrie-Endpunkt antwortet |
| Ausstehende Pakete und Bestätigungen auf Ihren Kanälen | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Relayer-Guthaben auf jeder Chain | `qorel keys balance --chain <id>` oder `wallet_balance` |
| Post-Quanten-Schlüssel bereit | `qorel keys pqc-status` meldet `ready_to_relay: true` |
| Aktualität der Clients | QORel aktualisiert einen Client bei einem Drittel seiner Vertrauensperiode; schlagen Sie Alarm, wenn ein Client etwa die Hälfte davon nicht aktualisiert wurde |
| Fehler | `broadcast_errors` und `simulate_errors` steigen |

Eine kleine Prüfung des Schlüsselzustands, geeignet für Cron oder einen Monitoring-Agenten:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

Sie beendet sich mit einem Wert ungleich null, wenn der Schlüssel nicht bereit ist.

### Logs {#logs}

`log_level = 'info'` in `[global]` ist der Standard. Beim systemd-Paket gehen die Logs ins Journal:

```bash
journalctl -u qorel -f
```

Eine Logzeile, die mit `post-quantum sign bytes` beginnt, erscheint, wenn QORel die Sign-Bytes-Version von der Chain liest und sie sich ändert. Warnungen über `429`-Antworten eines Endpunkts bedeuten, dass der Endpunkt ratenbegrenzt; QORel versucht es erneut.

### REST-Endpunkt {#rest}

Der optionale REST-Server (`[rest]` in der Konfiguration, Port 3000 im Beispiel, standardmäßig deaktiviert) stellt den Zustand des Relayers zur Einsicht bereit. Lassen Sie ihn an `127.0.0.1` gebunden.

### Prüfungen von Hand {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## Zugang {#how-to-access}

- Telemetrie und REST sind lokal auf dem Relayer-Host; beide sind nicht im öffentlichen Netz, solange Sie sie nicht freigeben.
- `qorel`-Befehle lesen dieselbe Konfigurationsdatei wie der Relayer.
- Der öffentliche REST-Endpunkt für das QoreChain-Testnet (`https://api-testnet.qore.host`) zeigt den Zustand von Kanälen und Token-Traces; siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet).

## Wo es veröffentlicht ist {#where-published}

Das Monitoring ist Teil der Binärdatei `qorel`; es gibt nichts Separates zu installieren. Quellcode und der Hermes-Telemetrie-Leitfaden: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Grenzen und bekannte Probleme {#limits}

- **Kein gehostetes Dashboard.** QORel liefert keine Dashboards oder Alarmregeln mit; bauen Sie sie aus den obigen Metriken.
- **Die Metriknamen stammen von Hermes.** QORel fügt in 0.1.0 keine Post-Quanten-Metriken hinzu; verwenden Sie `keys pqc-status` für diesen Zustand.
- **Rate-Limits sind auf öffentlichen Endpunkten normal.** Schlagen Sie bei einem anhaltenden Backlog Alarm, nicht bei einzelnen `429`-Warnungen.
- **Nur Testnet.** Nichts hier wurde gegen einen Mainnet-Kanal betrieben.
