---
slug: /light-node/sx-edition
title: Edizione SX (Server Daemon)
sidebar_label: Edizione SX
sidebar_position: 2
---

# Edizione SX — Server Daemon

L'edizione **SX (Server eXperience)** è il light node headless: un daemon più una CLI di gestione completa, pensato per server e automazione. Il binario è `lightnode-sx`. Questa è la linea **v3.1.2** del light node (versione propria, separata dalla versione della chain).

## Installazione {#install}

I binari precompilati sono il percorso più semplice — il client del light node gira nativamente su **sei piattaforme senza dipendenze native**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) e Windows (amd64, arm64) — 12 binari in totale tra le edizioni SX e UX. Ogni binario pesa circa 16 MB — scaricalo ed eseguilo, senza librerie separate da installare.

**Verifica il checksum prima di eseguirlo.** Il manifest della release su `https://download.qore.host/<net>/lightnode/latest.json` riporta uno `sha256` per ogni binario, oltre a un file `SHA256SUMS` separato per l'intera release. Ricalcola l'hash di ciò che hai scaricato e confrontalo con il valore del manifest — non è una nota a margine, è la differenza tra eseguire il binario effettivamente compilato ed eseguire qualunque cosa sia finita a quell'URL:

```bash
shasum -a 256 lightnode-sx-<platform>   # macOS/Linux
# or: certutil -hashfile lightnode-sx-<platform>.exe SHA256   # Windows
```

Puoi anche compilare il binario dal sorgente o eseguirlo con Docker.

### Compilazione dal sorgente

Il light node richiede **Go 1.26.1**. La sua crittografia post-quantistica è un'implementazione pure-Go (nessun CGO, nessuna libreria nativa), quindi la cross-compilazione per una qualsiasi delle sei piattaforme supportate funziona come per qualunque altro binario Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Questo produce `build/lightnode-sx`. Eseguilo direttamente, oppure copialo nel tuo `PATH`. Prima di registrarti, verifica lo stack di firma post-quantistica con [`selftest`](#verify-the-pqc-stack-selftest).

### Docker

È fornita una configurazione Docker. Il servizio SX si compila da `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

Il container SX salva i propri dati in un volume nominato montato su `/root/.qorechain-lightnode` e legge l'indirizzo RPC della chain dalla variabile d'ambiente `QORECHAIN_RPC_ADDR`.

## Configurazione

Il light node legge un file di configurazione TOML. Per impostazione predefinita cerca `config.toml` nella home directory (`~/.qorechain-lightnode/config.toml`). Normalmente non è necessario scrivere questo file a mano — la [procedura guidata `onboard`](#first-run-onboard) lo crea per te — ma è utile capire le opzioni disponibili.

Due flag persistenti si applicano a ogni comando:

- `--config <path>` — indica un file di configurazione in una posizione non predefinita.
- `--home <dir>` — sovrascrive la home directory usata per dati e chiavi (predefinita: `~/.qorechain-lightnode`).

Le opzioni di configurazione più rilevanti, a livello d'uso:

| Opzione | Cosa controlla |
| --- | --- |
| `chain_id` | L'identificatore della rete (ad esempio `qorechain-diana` su testnet, `qorechain-vladi` su mainnet). |
| `rpc_addr` | L'endpoint RPC della chain a cui si connette il daemon. Lascia vuoto per eseguire in **modalità solo locale**. |
| `primary_addr` / `witness_addrs` | L'endpoint RPC primario, e gli endpoint testimone rispetto ai quali viene corroborato l'header riportato — vedi [Perché eseguire un light node](/light-node/overview#why-run-a-light-node). Avere almeno un testimone distinto e raggiungibile è ciò che fa passare `Assurance` da `trusted-single-source` a `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Finestra di fiducia del light client (ad esempio `168h`) e deriva di clock consentita. |
| `data_dir` | Dove il node memorizza il proprio database e gli header. |
| `keyring_backend` / `key_name` | Backend del keyring (`file` o `os`) e nome della chiave dell'operatore. |
| `[delegation]` | Auto-compound attivo/disattivo, intervallo di compounding, reward minima da riscattare, insieme dei validatori, pesi di suddivisione, ribilanciamento e reputazione minima. |
| `[telemetry]` | Se la telemetria è abilitata e gli intervalli di aggiornamento per validatori, rete, bridge e tokenomics. |
| `log_level` / `log_format` | Verbosità del logging (`debug`, `info`, `warn`, `error`) e formato (`text` o `json`). |

:::note Gli endpoint testimone vengono validati all'avvio
Un testimone sullo stesso host del primario viene rifiutato — un endpoint compromesso concorderebbe semplicemente con se stesso, quindi non corrobora nulla. Anche un testimone in chiaro `http://` su un host remoto viene rifiutato, poiché un attaccante in grado di riscrivere quella connessione può rispondere come se fosse ogni testimone contemporaneamente; `http://` in loopback va bene. Punta i testimoni verso endpoint RPC di cui hai motivi indipendenti per fidarti.
:::

I valori predefiniti di delegazione abilitano l'auto-compound con un intervallo di `1h` e il ribilanciamento basato sulla reputazione — per cosa fanno, vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring).

## Primo avvio: `onboard` {#first-run-onboard}

Al primo avvio, `start` si arresta e ti indirizza alla procedura guidata di onboarding se non esiste ancora alcun file di configurazione. Esegui la procedura guidata:

```bash
build/lightnode-sx onboard
```

`onboard` ti guida nella configurazione in quattro passaggi:

1. **Self-test PQC** — esegue il ciclo completo Dilithium-5 (gli stessi controlli di [`selftest`](#verify-the-pqc-stack-selftest)). Se lo stack PQC fallisce, la procedura guidata si rifiuta di proseguire.
2. **Endpoint RPC della chain** — incolla l'URL RPC di QoreChain, oppure lascia vuoto per eseguire in **modalità solo locale** quando non serve alcuna connessione alla chain. Se fornisci un URL, la procedura guidata ne verifica la raggiungibilità in tempo reale.
3. **Chiave privata del validatore** — incolla una chiave privata Dilithium-5 codificata in hex, oppure digita `g` (o `generate`) per generare una nuova coppia di chiavi su questo node.
4. **Salvataggio** — scrive `config.toml` e memorizza la chiave nel keyring.

:::note Modalità solo locale
Se lasci vuoto l'endpoint, il daemon si avvia in modalità solo locale: lo stack PQC viene esercitato completamente, ma il node non sincronizza alcuna chain. Riesegui `onboard` quando il tuo endpoint della chain è pronto per collegare il node.
:::

`onboard` sovrascrive sempre la configurazione attiva. Usa `--config` per scrivere in un percorso non predefinito, oppure `--non-interactive` per fallire immediatamente invece di chiedere conferma (utile in CI).

## Avvio: `start`

Una volta che l'onboarding ha scritto una configurazione, avvia il daemon:

```bash
build/lightnode-sx start
```

Il daemon sincronizza gli header, traccia le delegazioni e serve la telemetria finché non viene interrotto. Se vuoi intenzionalmente avviarlo senza un file di configurazione (solo locale, senza RPC della chain), passa `--skip-onboarding-check`.

## Verifica dello stack PQC: `selftest` {#verify-the-pqc-stack-selftest}

In qualsiasi momento puoi confermare che lo stack post-quantistico sia funzionante:

```bash
lightnode-sx selftest
```

`selftest` esegue cinque controlli su Dilithium-5 (ML-DSA-87) e si completa in meno di un secondo:

1. **Keygen** — genera una nuova coppia di chiavi.
2. **Sign** — firma un messaggio di prova.
3. **Verify (firma valida)** — conferma che la firma venga verificata con la chiave pubblica corrispondente.
4. **Rifiuto di firma alterata** — inverte un byte della firma; la verifica deve rifiutarla.
5. **Rifiuto di messaggio alterato** — inverte un byte del messaggio; la verifica deve rifiutarlo.

Se un controllo fallisce, il binario esce con codice diverso da zero e output diagnostico. Questo è lo stesso test eseguito dalla procedura guidata di onboarding come primo passaggio, ed è utile per la verifica pre-distribuzione e la diagnostica di supporto.

## Comandi di gestione

La CLI SX include comandi per ispezionare lo stato del node e gestire le chiavi:

| Comando | Scopo |
| --- | --- |
| `status` | Mostra lo stato del node e del light client (chain ID, altezza più recente, stato di recupero). |
| `keys create <name>` | Crea una nuova chiave Dilithium-5. |
| `keys list` | Elenca le chiavi nel keyring. |
| `keys import <name> <hex-privkey>` | Importa una chiave privata codificata in hex. |
| `keys export <name>` | Esporta una chiave privata in hex. |
| `register` | Stampa il comando di registrazione on-chain per questo node — vedi [Registrazione e Licenze](/light-node/registration-and-licensing). |
| `validators` | Elenca i validatori bonded. |
| `delegation` | Mostra le delegazioni correnti dal database locale. |
| `rewards` | Mostra le reward di staking in sospeso. |
| `network` | Mostra la telemetria di rete (header sincronizzati di recente) dal database locale. |
| `version` | Stampa la versione del binario. |

Per i dettagli su staking, reward e monitoraggio, vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring). Per la registrazione on-chain, vedi [Registrazione e Licenze](/light-node/registration-and-licensing).
