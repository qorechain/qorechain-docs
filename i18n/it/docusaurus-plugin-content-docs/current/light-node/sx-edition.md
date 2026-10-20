---
slug: /light-node/sx-edition
title: Edizione SX (Server Daemon)
sidebar_label: Edizione SX
sidebar_position: 2
---

# Edizione SX — Server Daemon

L'edizione **SX (Server eXperience)** è il light node headless: un daemon più una CLI di gestione completa, pensato per server e automazione. Il binario è `lightnode-sx`. Questa pagina descrive il light node **3.1.10** (tag sorgente `v3.1.10`), che ha una propria linea di versione, separata dalla versione della chain.

## Installazione {#install}

I binari precompilati sono il percorso più semplice — il client del light node gira nativamente su **sei piattaforme senza dipendenze native**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) e Windows (amd64, arm64) — 12 binari in totale tra le edizioni SX e UX. Ogni binario pesa circa 13 MB — scaricalo ed eseguilo, senza librerie separate da installare. Il node firma da solo le proprie transazioni su ognuna di queste piattaforme, quindi non serve nient'altro (in particolare, nessun `qorechaind`) per registrare ed eseguire un node.

**Verifica il checksum prima di eseguirlo.** Il manifest della release su `https://download.qore.host/<net>/lightnode/latest.json` riporta uno `sha256` per ogni binario, un `checksums.url` che punta a un file `SHA256SUMS` relativo all'intera release e il `checksums.sha256` di quel file stesso. Verifica ciò che hai scaricato — non è una nota a margine, è la differenza tra eseguire il binario effettivamente compilato ed eseguire qualunque cosa sia finita a quell'URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v3.1.10/$F   # or the artifacts[].url from latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Su Windows, confronta `certutil -hashfile lightnode-sx-<platform>.exe SHA256` con il valore del manifest. Entrambe le reti servono la stessa build 3.1.10; i manifest accettano ancora la 3.1.9 (`minCompatible: 3.1.9`). Dalla 3.1.10 i binari di ogni release si trovano sotto un percorso con versione, `https://download.qore.host/<net>/lightnode/v<version>/<file>`, che è quello a cui punta `artifacts[].url` nel manifest; usalo al posto della copia senza versione, che può restare indietro di qualche ora. Il sorgente è pubblico su `github.com/qorechain/qorechain-lightnode` (Apache 2.0). Una build Android è allegata alla release GitHub come anteprima; non si registra e non guadagna.

Puoi anche compilare il binario dal sorgente o eseguirlo con Docker.

### Compilazione dal sorgente

Il light node richiede **Go 1.26.1**. La sua crittografia post-quantistica è un'implementazione pure-Go (nessun CGO, nessuna libreria nativa), quindi la cross-compilazione per una qualsiasi delle sei piattaforme supportate funziona come per qualunque altro binario Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Compila dal tag della release (`git checkout v3.1.10`). Questo produce `build/lightnode-sx`. Eseguilo direttamente, oppure copialo nel tuo `PATH`. Prima di registrare il node, verifica lo stack di firma post-quantistica con [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Non esiste un'immagine precompilata in un registry: la costruisci dal tag sorgente. Usa il tag **`v3.1.10`**. Per aggiornare un'installazione esistente, ricostruisci dal nuovo tag (`git fetch --tags && git checkout v3.1.10 && docker compose build --no-cache lightnode-sx`); un semplice `docker compose up` o `restart` riutilizza la vecchia immagine. Chiavi, configurazione e volume dati vengono mantenuti.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.10

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

Mantieni `QORECHAIN_RPC_ADDR` esportata su ogni comando `docker compose`: sovrascrive `rpc_addr` della configurazione, e il valore predefinito di compose punta a `host.docker.internal:26657`. Il container SX conserva i propri dati, keyring compreso, in un volume con nome montato su `/root/.qorechain-lightnode`.

Il node firma nativamente all'interno del container, quindi non serve nient'altro. L'immagine SX include ancora un `qorechaind` rilasciato (v3.2.0, solo linux/amd64, controllato rispetto a un digest fissato) per l'[alternativa `qorechaind`](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline): `docker-compose.yml` monta `~/.qorechaind` (oppure `QORECHAIND_HOME`) su `/root/.qorechaind` e passa `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` per quel percorso. Un node la cui chiave operatore si trova nel proprio keyring non usa nessuno dei due.

## Configurazione {#configure}

Il light node legge un file di configurazione TOML. Per impostazione predefinita cerca `config.toml` nella home directory (`~/.qorechain-lightnode/config.toml`). Normalmente non scrivi questo file a mano — la [procedura guidata `onboard`](#first-run-onboard) lo crea per te — ma è utile comprenderne le opzioni.

Due flag persistenti si applicano a ogni comando:

- `--config <path>` — punta a un file di configurazione in una posizione non predefinita.
- `--home <dir>` — sovrascrive la home directory usata per dati e chiavi (predefinita `~/.qorechain-lightnode`).

Le opzioni di configurazione più rilevanti, a livello d'uso:

| Opzione | Cosa controlla |
| --- | --- |
| `chain_id` | L'identificatore della rete (`qorechain-vladi` su mainnet, `qorechain-diana` su testnet). `onboard` lo legge dall'endpoint RPC; se l'endpoint non era raggiungibile durante `onboard`, resta il valore predefinito `qorechain-diana` e devi impostarlo tu. Le transazioni vengono firmate per questa chain. |
| `rpc_addr` | L'endpoint RPC della chain a cui si connette il daemon. Lascia vuoto per eseguire in **modalità solo locale**. |
| `primary_addr` / `witness_addrs` | L'endpoint RPC primario, e gli endpoint testimone rispetto ai quali viene corroborato l'header riportato — vedi [Perché eseguire un light node](/light-node/overview#why-run-a-light-node). Avere almeno un testimone distinto e raggiungibile è ciò che fa passare il valore `assurance` (registrato a livello debug) da `trusted-single-source` a `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Accettati per compatibilità ma attualmente non utilizzati. La fiducia negli header deriva dalla corroborazione primario/testimone descritta sopra. |
| `data_dir` | Dove il node memorizza il proprio database e gli header. |
| `keyring_backend` / `key_name` | Backend del keyring (`file`, `os`, oppure `test` solo per devnet locali) e nome della chiave post-quantistica con cui firma il node. `onboard` imposta `key_name` sulla chiave che crea (`validator`); `keys add-operator` lo cambia in `operator-pqc` quando deriva o recupera la chiave dalle parole dell'account. Il backend `file` richiede `QORE_LIGHTNODE_KEYRING_PASSPHRASE` nell'ambiente. |
| `operator_address` | L'account a cui appartiene questo node (`qor1...`); validato al caricamento. `keys add-operator` lo compila. Necessario per `register`, `status` e gli heartbeat. Vedi [Il wallet dell'operatore](#operator-wallet). |
| `api_addr` | L'endpoint REST. Derivato da `rpc_addr` quando è vuoto (la porta 26657 diventa 1317; gli host `rpc.` diventano `api.`), quindi serve solo per endpoint che non seguono nessuna delle due convenzioni. |
| `[heartbeat]` | Attivo per impostazione predefinita (`enabled`). `interval_blocks` (da allineare al `heartbeat_interval` della chain, 1000), `check_interval` (predefinito `60s`) e `gas` (predefinito `300000`; con la firma nativa la fee è di 0,25 uqor per unità di gas, quindi 75.000 uqor). Usati solo dall'alternativa `qorechaind`: `fees` (predefinito `50000uqor`), `qorechaind_path` (vuoto significa `qorechaind` nel `PATH`), `qorechaind_home` (vuoto significa `~/.qorechaind`), `keyring_backend` e `key_name` (la chiave `qorechaind` che contiene l'account operatore; predefinita il `key_name` di primo livello). |
| `[delegation]` | `auto_claim` (disattivato per impostazione predefinita: riscatta le reward del light node maturate verso l'account operatore tramite il firmatario; il node non ri-delega mai dal server), l'intervallo di controllo, la reward minima da riscattare, `rebalance_enabled` e `min_reputation` (solo avvisi di reputazione — il node non sposta mai stake). `validators` e `split_weights` sono accettati ma attualmente non hanno effetto. |
| `[telemetry]` | Se la telemetria è abilitata e gli intervalli di aggiornamento per validatori, rete, bridge e tokenomics. |
| `[dashboard]` | L'API della dashboard locale. L'edizione UX la serve sempre; l'edizione SX solo con `enabled = true`. `bind_addr` (predefinito `127.0.0.1:8420`) e `token` (se impostato, ogni rotta `/api` e `/ws` richiedono `Authorization: Bearer <token>`). Vedi [Edizione UX](/light-node/ux-edition). |
| `log_level` / `log_format` | Verbosità del logging (`debug`, `info`, `warn`, `error`) e formato (`text` o `json`). Chiavi di primo livello: mettile prima della prima `[table]`. |

### Variabili d'ambiente {#environment-variables}

| Variabile | Usata per |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Passphrase del keyring del node (`keyring_backend = "file"`), che contiene la chiave post-quantistica del node e la chiave dell'account operatore. Obbligatoria per ogni comando che apre il keyring e per `start`; il node rifiuta una passphrase vuota. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Solo per l'alternativa `qorechaind`: passphrase del keyring di `qorechaind` che contiene la chiave dell'operatore; passata a `qorechaind` tramite stdin, mai su una riga di comando. |
| `QORECHAIN_RPC_ADDR` | Sovrascrive `rpc_addr` (e `primary_addr` quando era uguale a `rpc_addr`). Impostata da `docker-compose.yml`. |

:::note Gli endpoint testimone vengono validati all'avvio
Un testimone sullo stesso host del primario viene rifiutato — un endpoint compromesso concorderebbe semplicemente con se stesso, quindi non corrobora nulla. Anche un testimone in chiaro `http://` su un host remoto viene rifiutato, poiché un attaccante in grado di riscrivere quella connessione può rispondere come se fosse ogni testimone contemporaneamente; `http://` in loopback va bene. Punta i testimoni verso endpoint RPC di cui hai motivi indipendenti per fidarti.
:::

I valori predefiniti di delegazione abilitano gli avvisi di ribilanciamento basati sulla reputazione e lasciano `auto_claim` disattivato — per cosa fanno, vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring).

## Primo avvio: `onboard` {#first-run-onboard}

Al primo avvio, `start` si arresta e ti indirizza alla procedura guidata di onboarding se non esiste ancora alcun file di configurazione. Imposta prima la passphrase del keyring — `onboard` rifiuta di partire senza di essa, così non genera mai una chiave che non può memorizzare — poi esegui la procedura guidata:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` ti guida attraverso la configurazione in quattro passaggi:

1. **Self-test PQC** — esegue l'intero roundtrip Dilithium-5 (gli stessi controlli di [`selftest`](#verify-the-pqc-stack-selftest)). Se lo stack PQC fallisce, la procedura guidata rifiuta di proseguire.
2. **Endpoint RPC della chain** — incolla l'URL RPC della tua QoreChain (mainnet `https://rpc.qore.host`, testnet `https://rpc-testnet.qore.host`), oppure lascia vuoto per eseguire in **modalità solo locale**. Se fornisci un URL, la procedura guidata lo verifica in tempo reale e ne legge l'ID della chain.
3. **Chiave del node** — la procedura guidata la chiama «chiave privata del validatore», ma è la chiave Dilithium-5 propria del light node, non una chiave di validatore. Incolla una chiave privata Dilithium-5 codificata in esadecimale, oppure digita `g` (o `generate`) per generare una nuova coppia di chiavi su questo node.
4. **Salvataggio** — scrive `config.toml` (con l'endpoint e l'ID della chain) e memorizza la chiave nel keyring con il nome `validator` (o `validator-<hex>` se quel nome è già occupato), impostando `key_name` su di essa.

:::note Modalità solo locale
Se lasci vuoto l'endpoint, il daemon si avvia in modalità solo locale: lo stack PQC viene esercitato completamente, ma il node non sincronizza alcuna chain. Riesegui `onboard` quando il tuo endpoint della chain è pronto per puntarvi il node.
:::

`onboard` sovrascrive sempre la configurazione attiva. Usa `--config` per scrivere in un percorso non predefinito, oppure `--non-interactive` per fallire subito invece di chiedere input (utile in CI).

:::caution Prossimo passo: l'account operatore
`onboard` non sa quale account sia il tuo. Prima di eseguire `register`, aggiungi l'account operatore con [`keys add-operator`](#operator-wallet), che compila `operator_address` per te. Se l'endpoint non era raggiungibile durante `onboard`, verifica anche che `chain_id` in `config.toml` sia `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).
:::

## Esecuzione: `start`

Una volta che l'onboarding ha scritto una configurazione, avvia il daemon:

```bash
build/lightnode-sx start
```

Il daemon sincronizza gli header, tiene traccia delle delegazioni e serve la telemetria fino a quando non viene interrotto. Se vuoi intenzionalmente avviarlo senza un file di configurazione (solo locale, senza RPC della chain), passa `--skip-onboarding-check`.

## Verificare lo stack PQC: `selftest` {#verify-the-pqc-stack-selftest}

In qualsiasi momento puoi confermare che lo stack post-quantistico sia funzionante:

```bash
lightnode-sx selftest
```

`selftest` esegue cinque controlli su Dilithium-5 (ML-DSA-87) e si completa in meno di un secondo:

1. **Keygen** — genera una nuova coppia di chiavi.
2. **Sign** — firma un messaggio di test.
3. **Verify (valid sig)** — conferma che la firma venga verificata con la chiave pubblica corrispondente.
4. **Reject tampered signature** — altera un byte della firma; la verifica deve rifiutarla.
5. **Reject tampered message** — altera un byte del messaggio; la verifica deve rifiutarlo.

Se un controllo fallisce, il binario termina con codice diverso da zero e con un output diagnostico. È lo stesso test che la procedura guidata di onboarding esegue come primo passaggio, ed è utile per la verifica pre-deploy e per la diagnostica di supporto.

## Il wallet dell'operatore {#operator-wallet}

La chiave Dilithium-5 del node **non** è un wallet. Su QoreChain una chiave post-quantistica viene associata a un account; non ne crea uno. Per questo `keys list` non mostra alcun indirizzo per essa. Il tuo **indirizzo dell'operatore** è un normale account `qor1…` che detiene la licenza e lo stake, paga le fee e riceve le reward del light node. Deve essere un account di cui possiedi le parole di recupero (le tue parole, Keplr oppure `qorechaind`); è preferibile un account dedicato. Un wallet custodial della Dashboard non può far funzionare un node a meno che tu non ne esporti il seed. Vedi [L'account operatore](/light-node/registration-and-licensing#operator-account).

Memorizza la chiave dell'account operatore nel keyring del node:

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`:

- deriva la chiave dell'account dalle parole esattamente come fanno `qorechaind` e Keplr (`m/44'/118'/0'/0/0`), la memorizza nel keyring come `operator` e scrive l'account in `operator_address` in `config.toml`. Se `operator_address` è già impostato su un account diverso, rifiuta;
- sceglie la chiave post-quantistica con cui firma il node, la memorizza come `operator-pqc` e imposta `key_name` su di essa. Se l'account ha già una chiave post-quantistica — di solito registrata da un wallet a partire dalle stesse parole — quella chiave viene ricostruita dalle parole (le derivazioni del wallet-adapter e della Dashboard, le stesse di `qorechaind tx pqc recover-key`). Se l'account non ne ha, viene derivata una chiave dalle parole, così le parole ripristinano anche la chiave del node. Se la chiave registrata dell'account è già la chiave attuale del node, quella chiave viene mantenuta. Se la chiave dell'account non può essere riprodotta dalle parole, il comando rifiuta e consiglia un account dedicato;
- senza `--recover`, crea un nuovo account e ne mostra le 24 parole una sola volta. Annotale: sono l'unico backup. Finanzia l'account e acquista la licenza per il suo indirizzo prima di registrarti.

La passphrase del keyring (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) protegge questa chiave così come la chiave del node. Poi registra:

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` verifica la licenza, associa la chiave post-quantistica a meno che l'account non l'abbia già, delega lo stake mancante solo se indichi un validatore con `--delegate-to`, e registra il node; ogni passaggio viene confermato in un blocco prima del successivo. Vedi [Registrazione e licenze](/light-node/registration-and-licensing) per i dettagli e per l'alternativa `register --print` destinata agli operatori che conservano la chiave dell'account in un keyring `qorechaind`.

## Comandi di gestione

La CLI SX include comandi per ispezionare lo stato del node e gestire le chiavi. Dalla 3.1.7 il binario UX (`lightnode-ux`) ha gli stessi comandi.

| Comando | Scopo |
| --- | --- |
| `onboard` | Procedura guidata interattiva di primo avvio. |
| `start` | Esegue il daemon. |
| `selftest` | Esegue il self-test PQC. |
| `status` | Mostra lo stato del node e della sincronizzazione del light client (ID della chain, ultima altezza, stato di recupero) più le righe `Signer` (nativo o `qorechaind`), `Operator`, `Licence` e `Registration`. |
| `keys create <name>` | Crea una nuova chiave del node Dilithium-5 e ne stampa la chiave pubblica. |
| `keys list` | Elenca le chiavi nel keyring (nome, tipo, indirizzo se presente, chiave pubblica). |
| `keys show <name>` | Stampa il tipo di una chiave e la sua chiave pubblica completa. |
| `keys import <name> <hex-privkey>` | Importa una chiave privata codificata in esadecimale. |
| `keys export <name> [--out <file>]` | Esporta una chiave privata in esadecimale. `--out` scrive il file che legge `qorechaind --pqc-key` (senza newline finale, modalità 0600). |
| `keys add-operator [--recover]` | Memorizza la chiave dell'account operatore (nuova, o recuperata dalle sue parole tramite standard input) e sceglie la chiave post-quantistica; compila `operator_address`. Vedi [Il wallet dell'operatore](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Registra il node on-chain: chiave post-quantistica, stake mancante, registrazione, ciascuno confermato in un blocco. `--print` stampa invece i comandi `qorechaind` — vedi [Registrazione e licenze](/light-node/registration-and-licensing). |
| `validators` | Elenca i validatori bonded. |
| `delegation` | Mostra le delegazioni dell'account operatore, così come rispecchiate nel database locale dal daemon in esecuzione. |
| `rewards` | Mostra le reward di staking in sospeso dell'account operatore (non le reward del light node; vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Mostra la telemetria di rete (header sincronizzati di recente) dal database locale. |
| `version` | Stampa la versione del binario. |

Per i dettagli su staking, reward e monitoraggio vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring). Per la registrazione on-chain vedi [Registrazione e licenze](/light-node/registration-and-licensing).
