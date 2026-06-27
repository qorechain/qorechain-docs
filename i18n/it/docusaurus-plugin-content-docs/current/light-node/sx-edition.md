---
slug: /light-node/sx-edition
title: Edizione SX (daemon per server)
sidebar_label: Edizione SX
sidebar_position: 2
---

# Edizione SX — Daemon per server

L'edizione **SX (Server eXperience)** è il light node headless: un daemon più una CLI di gestione completa, pensata per server e automazione. Il binario è `lightnode-sx`. Questa è la linea **v3.1.1** del light node (la sua versione, distinta dalla versione della chain).

## Installazione

Puoi compilare il binario dal sorgente oppure eseguirlo con Docker.

### Compilazione dal sorgente

Il light node richiede **Go 1.26.1** e si compila con CGO abilitato, perché la crittografia post-quantistica usa una libreria nativa (`libqorepqc`).

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Questo produce `build/lightnode-sx`. Eseguilo direttamente, oppure copialo nel tuo `PATH`.

### Docker

È fornita una configurazione Docker. Il servizio SX si compila da `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

Il container SX conserva i propri dati in un volume denominato montato su `/root/.qorechain-lightnode` e legge l'indirizzo RPC della chain dalla variabile d'ambiente `QORECHAIN_RPC_ADDR`.

## Configurazione

Il light node legge un file di configurazione TOML. Per impostazione predefinita cerca `config.toml` nella directory home (`~/.qorechain-lightnode/config.toml`). Di norma non scrivi questo file a mano — la [procedura guidata `onboard`](#first-run-onboard) lo crea per te — ma è utile comprenderne le opzioni.

Due flag persistenti si applicano a ogni comando:

- `--config <path>` — punta a un file di configurazione in una posizione non predefinita.
- `--home <dir>` — sovrascrive la directory home usata per dati e chiavi (il valore predefinito è `~/.qorechain-lightnode`).

Le opzioni di configurazione più rilevanti, a livello di utilizzo:

| Opzione | Cosa controlla |
| --- | --- |
| `chain_id` | L'identificatore della rete (ad esempio `qorechain-diana` su testnet, `qorechain-vladi` su mainnet). |
| `rpc_addr` | L'endpoint RPC della chain a cui il daemon si connette. Lascia vuoto per funzionare in **modalità solo locale**. |
| `primary_addr` / `witness_addrs` | Gli endpoint RPC primario e testimone usati dal light client di tipo skipping. |
| `trust_period` / `max_clock_drift` | La finestra di fiducia del light client (ad esempio `168h`) e il drift di clock consentito. |
| `data_dir` | Dove il nodo memorizza il proprio database e gli header. |
| `keyring_backend` / `key_name` | Il backend del keyring (`file` o `os`) e il nome della chiave operatore. |
| `[delegation]` | Auto-capitalizzazione on/off, intervallo di capitalizzazione, ricompensa minima da riscuotere, insieme di validatori, pesi di suddivisione, ribilanciamento e reputazione minima. |
| `[telemetry]` | Se la telemetria è abilitata e gli intervalli di aggiornamento per validatori, rete, bridge e tokenomics. |
| `log_level` / `log_format` | Verbosità del logging (`debug`, `info`, `warn`, `error`) e formato (`text` o `json`). |

I valori predefiniti della delega abilitano l'auto-capitalizzazione con un intervallo di `1h` e il ribilanciamento basato sulla reputazione — consulta [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) per sapere cosa fanno.

## Primo avvio: `onboard` {#first-run-onboard}

Al primo avvio, `start` si fermerà e ti indirizzerà alla procedura guidata di onboarding se non esiste ancora alcun file di configurazione. Esegui la procedura guidata:

```bash
build/lightnode-sx onboard
```

`onboard` ti guida nella configurazione in quattro passaggi:

1. **Self-test PQC** — esegue il roundtrip completo di Dilithium-5 (gli stessi controlli di [`selftest`](#verify-the-pqc-stack-selftest)). Se lo stack PQC fallisce, la procedura guidata rifiuta di proseguire.
2. **Endpoint RPC della chain** — incolla l'URL RPC della tua QoreChain, oppure lascialo vuoto per funzionare in **modalità solo locale** finché non è necessaria alcuna connessione alla chain. Se fornisci un URL, la procedura guidata verifica la raggiungibilità in tempo reale.
3. **Chiave privata del validatore** — incolla una chiave privata Dilithium-5 codificata in esadecimale, oppure digita `g` (o `generate`) per generare una nuova coppia di chiavi su questo nodo.
4. **Salvataggio** — scrive `config.toml` e memorizza la chiave nel keyring.

:::note Modalità solo locale
Se lasci vuoto l'endpoint, il daemon si avvia in modalità solo locale: lo stack PQC è completamente esercitato, ma il nodo non sincronizza alcuna chain. Riesegui `onboard` quando il tuo endpoint della chain è pronto, per fare puntare il nodo ad esso.
:::

`onboard` sovrascrive sempre la configurazione attiva. Usa `--config` per scrivere in un percorso non predefinito, oppure `--non-interactive` per fallire immediatamente anziché chiedere conferme (utile in CI).

## Esecuzione: `start`

Una volta che l'onboarding ha scritto una configurazione, avvia il daemon:

```bash
build/lightnode-sx start
```

Il daemon sincronizza gli header, tiene traccia delle deleghe e serve la telemetria fino all'interruzione. Se intenzionalmente vuoi avviare senza un file di configurazione (solo locale, nessun RPC della chain), passa `--skip-onboarding-check`.

## Verifica dello stack PQC: `selftest` {#verify-the-pqc-stack-selftest}

In qualsiasi momento puoi confermare che lo stack post-quantistico sia funzionante:

```bash
lightnode-sx selftest
```

`selftest` esegue cinque controlli su Dilithium-5 (ML-DSA-87) e si completa in meno di un secondo:

1. **Keygen** — genera una nuova coppia di chiavi.
2. **Sign** — firma un messaggio di test.
3. **Verify (firma valida)** — conferma che la firma viene verificata con la chiave pubblica corrispondente.
4. **Rifiuto di una firma manomessa** — capovolge un byte della firma; la verifica deve rifiutarla.
5. **Rifiuto di un messaggio manomesso** — capovolge un byte del messaggio; la verifica deve rifiutarlo.

Se un qualsiasi controllo fallisce, il binario termina con codice diverso da zero e un output diagnostico. È lo stesso test che la procedura guidata di onboarding esegue come primo passaggio, ed è comodo per la verifica pre-deployment e per le diagnostiche di supporto.

## Comandi di gestione

La CLI SX include comandi per ispezionare lo stato del nodo e gestire le chiavi:

| Comando | Scopo |
| --- | --- |
| `status` | Mostra lo stato di sincronizzazione del nodo e del light client (chain ID, ultima altezza, stato di recupero). |
| `keys create <name>` | Crea una nuova chiave Dilithium-5. |
| `keys list` | Elenca le chiavi nel keyring. |
| `keys import <name> <hex-privkey>` | Importa una chiave privata codificata in esadecimale. |
| `keys export <name>` | Esporta una chiave privata in esadecimale. |
| `register` | Stampa il comando di registrazione on-chain per questo nodo — consulta [Registrazione e licenze](/light-node/registration-and-licensing). |
| `validators` | Elenca i validatori vincolati. |
| `delegation` | Mostra le deleghe correnti dal database locale. |
| `rewards` | Mostra le ricompense di staking in sospeso. |
| `network` | Mostra la telemetria di rete (header sincronizzati di recente) dal database locale. |
| `version` | Stampa la versione del binario. |

Per i dettagli su staking, ricompense e monitoraggio consulta [Ricompense e monitoraggio](/light-node/rewards-and-monitoring). Per registrarti on-chain, consulta [Registrazione e licenze](/light-node/registration-and-licensing).
