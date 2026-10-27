---
slug: /qorel/monitoring
title: Monitorare QORel
sidebar_label: Monitoraggio
sidebar_position: 7
---

# Monitoraggio

Un relayer che si ferma in silenzio lascia i pacchetti in sospeso, quindi va tenuto sotto osservazione. Questa pagina elenca ciò che QORel espone (telemetria Prometheus, un endpoint REST opzionale, log e comandi) e su che cosa impostare gli alert. È pensata per gli operatori che gestiscono un relayer per un canale a cui tengono.

## Innovazioni {#innovations}

- **Un controllo di prontezza post-quantistica che puoi automatizzare.** `qorel keys pqc-status` stampa un oggetto JSON il cui campo `ready_to_relay` è `true` solo quando la chiave è registrata on-chain e coincide con la chiave locale. Un alert su quel campo individua una chiave mancante o cambiata prima che il relayer venga rifiutato.
- **Errori che non fermano in silenzio il relay.** I worker dei pacchetti restano attivi e riprovano a ogni intervallo di clearing dopo un tentativo di relay o di clearing fallito, così un breve limite di frequenza compare come avvisi nel log e non come un canale bloccato.
- **Un controllo pre-invio con un motivo.** Quando il controllo pre-invio rifiuta una transazione (chiave non registrata, chiave non corrispondente, versione dei sign-bytes sconosciuta), non viene inviato nulla e il motivo viene registrato nel log e mostrato da `qorel health-check`.

## Come si usa {#how-to-use}

### Telemetria {#telemetry}

Abilitala nella configurazione:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

Le metriche sono servite in formato Prometheus su `http://127.0.0.1:3001/metrics`. Sono le metriche di Hermes; Prometheus mostra i contatori con il suffisso `_total`. Quelle da rappresentare in grafico:

| Metrica | Perché |
|---|---|
| `workers` | Numero di worker in esecuzione per tipo; un calo significa che un worker si è fermato. |
| `backlog_size`, `backlog_oldest_sequence` | Pacchetti in attesa su un canale e la sequenza più vecchia ancora in attesa. |
| `wallet_balance` | Il saldo del relayer su ciascuna chain. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Pacchetti inoltrati. Una linea piatta mentre il backlog cresce indica uno stallo. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Manutenzione dei light client e segnalazioni di misbehaviour. |
| `broadcast_errors`, `simulate_errors` | Transazioni rifiutate o la cui simulazione è fallita. |
| `ws_reconnect` | Riconnessioni WebSocket; molte di seguito indicano un endpoint instabile. |
| `tx_latency_submitted`, `tx_latency_confirmed` | Quanto impiegano le transazioni. |

Hermes documenta l'insieme completo nella sua [guida alla telemetria](https://hermes.informal.systems/documentation/telemetry/operators.html). Il listener è su `127.0.0.1` nella configurazione di esempio; metti il tuo scraper Prometheus sullo stesso host oppure cambia `host` deliberatamente.

### Su che cosa impostare gli alert {#alerts}

| Che cosa | Dove |
|---|---|
| Processo attivo | L'endpoint della telemetria risponde |
| Pacchetti e acknowledgement in sospeso sui tuoi canali | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Saldo del relayer su ciascuna chain | `qorel keys balance --chain <id>`, oppure `wallet_balance` |
| Chiave post-quantistica pronta | `qorel keys pqc-status` riporta `ready_to_relay: true` |
| Aggiornamento dei client | QORel aggiorna un client a un terzo del suo trusting period; imposta un alert se un client non viene aggiornato da circa la metà di esso |
| Errori | `broadcast_errors` e `simulate_errors` in aumento |

Un piccolo controllo sullo stato della chiave, adatto a cron o a un agente di monitoraggio:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

Termina con un codice diverso da zero quando la chiave non è pronta.

### Log {#logs}

`log_level = 'info'` in `[global]` è il valore predefinito. Con il pacchetto systemd i log vanno nel journal:

```bash
journalctl -u qorel -f
```

Una riga di log che inizia con `post-quantum sign bytes` compare quando QORel legge dalla chain la versione dei sign-bytes e questa cambia. Gli avvisi sulle risposte `429` da un endpoint significano che l'endpoint sta limitando la frequenza; QORel riprova.

### Endpoint REST {#rest}

Il server REST opzionale (`[rest]` nella configurazione, porta 3000 nell'esempio, disabilitato per impostazione predefinita) espone lo stato del relayer per l'ispezione. Lascialo associato a `127.0.0.1`.

### Controlli manuali {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## Come accedere {#how-to-access}

- Telemetria e REST sono locali all'host del relayer; entrambi restano fuori dalla rete pubblica a meno che tu non li esponga.
- I comandi `qorel` leggono lo stesso file di configurazione del relayer.
- L'endpoint REST pubblico per la testnet di QoreChain (`https://api-testnet.qore.host`) mostra lo stato dei canali e delle tracce dei token; vedi [Connessione alla testnet](/getting-started/connecting-to-testnet).

## Dove è pubblicato {#where-published}

Il monitoraggio fa parte del binario `qorel`; non c'è nulla di separato da installare. Codice sorgente e guida alla telemetria di Hermes: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Limiti e problemi noti {#limits}

- **Nessuna dashboard ospitata.** QORel non fornisce dashboard né regole di alert; costruiscile a partire dalle metriche qui sopra.
- **I nomi delle metriche sono quelli di Hermes.** QORel non aggiunge metriche post-quantistiche nella 0.1.0; usa `keys pqc-status` per quello stato.
- **I limiti di frequenza sono normali sugli endpoint pubblici.** Imposta alert su un backlog prolungato, non sui singoli avvisi `429`.
- **Solo testnet.** Nulla di quanto qui descritto è stato eseguito su un canale mainnet.
