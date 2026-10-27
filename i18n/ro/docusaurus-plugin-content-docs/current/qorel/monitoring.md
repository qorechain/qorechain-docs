---
slug: /qorel/monitoring
title: Monitorizarea QORel
sidebar_label: Monitorizare
sidebar_position: 7
---

# Monitorizare

Un relayer care se oprește fără zgomot lasă pachete în așteptare, deci trebuie supravegheat. Această pagină listează ce expune QORel (telemetrie Prometheus, un endpoint REST opțional, loguri și comenzi) și pentru ce să configurați alerte. Este destinată operatorilor care rulează un relayer pentru un canal la care țin.

## Inovații {#innovations}

- **O verificare scriptabilă a stării cheii post-cuantice.** `qorel keys pqc-status` afișează un obiect JSON al cărui câmp `ready_to_relay` este `true` doar când cheia este înregistrată în lanț și se potrivește cu cheia locală. O alertă pe acest câmp prinde o cheie lipsă sau schimbată înainte ca relayer-ul să fie refuzat.
- **Eșecuri care nu opresc în tăcere relay-ul.** Worker-ii de pachete continuă să ruleze și reîncearcă la fiecare interval de golire după o încercare eșuată de relay sau de golire, deci o limitare scurtă de rată apare ca avertismente în log și nu ca un canal blocat.
- **O verificare înainte de trimitere, cu motiv.** Când verificarea dinaintea trimiterii refuză o tranzacție (cheie neînregistrată, cheie diferită, versiune necunoscută a octeților de semnat), nu se trimite nimic, iar motivul este înregistrat în log și afișat de `qorel health-check`.

## Cum se folosește {#how-to-use}

### Telemetrie {#telemetry}

Activați-o în configurație:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

Metricile sunt servite în format Prometheus la `http://127.0.0.1:3001/metrics`. Sunt metricile Hermes; Prometheus afișează contoarele cu sufixul `_total`. Cele care merită reprezentate grafic:

| Metrică | De ce |
|---|---|
| `workers` | Numărul de worker-i activi pe tip; o scădere înseamnă că un worker s-a oprit. |
| `backlog_size`, `backlog_oldest_sequence` | Pachetele care așteaptă pe un canal și cea mai veche secvență încă în așteptare. |
| `wallet_balance` | Soldul relayer-ului pe fiecare lanț. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Pachetele transmise. O linie plată în timp ce backlog-ul crește indică o blocare. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Întreținerea clienților light și rapoartele de comportament necorespunzător. |
| `broadcast_errors`, `simulate_errors` | Tranzacții care au fost refuzate sau a căror simulare a eșuat. |
| `ws_reconnect` | Reconectări WebSocket; multe la rând indică un endpoint instabil. |
| `tx_latency_submitted`, `tx_latency_confirmed` | Cât durează tranzacțiile. |

Hermes documentează setul complet în [ghidul său de telemetrie](https://hermes.informal.systems/documentation/telemetry/operators.html). Listener-ul este pe `127.0.0.1` în configurația exemplu; puneți scraper-ul Prometheus pe aceeași gazdă sau schimbați `host` în mod deliberat.

### Pentru ce să configurați alerte {#alerts}

| Ce | Unde |
|---|---|
| Procesul rulează | Endpoint-ul de telemetrie răspunde |
| Pachete și confirmări (acknowledgements) în așteptare pe canalele dumneavoastră | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Soldul relayer-ului pe fiecare lanț | `qorel keys balance --chain <id>`, sau `wallet_balance` |
| Starea cheii post-cuantice | `qorel keys pqc-status` raportează `ready_to_relay: true` |
| Prospețimea clienților | QORel reîmprospătează un client la o treime din perioada lui de încredere (trusting period); configurați o alertă dacă un client nu a fost actualizat de aproximativ jumătate din ea |
| Erori | `broadcast_errors` și `simulate_errors` în creștere |

O verificare mică a stării cheii, potrivită pentru cron sau un agent de monitorizare:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

Se încheie cu cod diferit de zero când cheia nu este în stare bună.

### Loguri {#logs}

`log_level = 'info'` în `[global]` este valoarea implicită. Cu pachetul systemd, logurile merg în journal:

```bash
journalctl -u qorel -f
```

O linie de log care începe cu `post-quantum sign bytes` apare când QORel citește versiunea octeților de semnat din lanț și aceasta se schimbă. Avertismentele despre răspunsuri `429` de la un endpoint înseamnă că endpoint-ul limitează rata; QORel reîncearcă.

### Endpoint REST {#rest}

Serverul REST opțional (`[rest]` în configurație, portul 3000 în exemplu, dezactivat implicit) expune starea relayer-ului pentru inspecție. Lăsați-l legat la `127.0.0.1`.

### Verificări manuale {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## Cum se accesează {#how-to-access}

- Telemetria și REST sunt locale gazdei relayer-ului; ambele sunt în afara rețelei publice, cu excepția cazului în care le expuneți.
- Comenzile `qorel` citesc același fișier de configurare ca relayer-ul.
- Endpoint-ul REST public pentru testnet-ul QoreChain (`https://api-testnet.qore.host`) arată starea canalelor și a urmelor de token; vezi [Conectarea la Testnet](/getting-started/connecting-to-testnet).

## Unde este publicat {#where-published}

Monitorizarea face parte din binarul `qorel`; nu există nimic separat de instalat. Sursa și ghidul de telemetrie Hermes: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Limite și probleme cunoscute {#limits}

- **Fără dashboard găzduit.** QORel nu include dashboard-uri sau reguli de alertă; construiți-le pornind de la metricile de mai sus.
- **Numele metricilor sunt cele din Hermes.** QORel nu adaugă metrici post-cuantice în 0.1.0; folosiți `keys pqc-status` pentru acea stare.
- **Limitările de rată sunt normale pe endpoint-urile publice.** Configurați alerte pentru un backlog susținut, nu pentru avertismente `429` izolate.
- **Doar testnet.** Nimic din toate acestea nu a fost rulat pe un canal de mainnet.
