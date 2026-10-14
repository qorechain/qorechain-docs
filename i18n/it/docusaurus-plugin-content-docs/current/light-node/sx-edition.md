---
slug: /light-node/sx-edition
title: Edizione SX (Server Daemon)
sidebar_label: Edizione SX
sidebar_position: 2
---

# Edizione SX — Server Daemon

L'edizione **SX (Server eXperience)** è il light node headless: un daemon più una CLI di gestione completa, pensato per server e automazione. Il binario è `lightnode-sx`. Questa è la linea **v3.1.3** del light node per i binari precompilati (tag sorgente `v3.1.4` per le build Docker), con una propria versione, separata dalla versione della chain.

## Installazione {#install}

I binari precompilati sono il percorso più semplice — il client del light node gira nativamente su **sei piattaforme senza dipendenze native**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) e Windows (amd64, arm64) — 12 binari in totale tra le edizioni SX e UX. Ogni binario pesa circa 11–12 MB — scaricalo ed eseguilo, senza librerie separate da installare.

**Verifica il checksum prima di eseguirlo.** Il manifest della release su `https://download.qore.host/<net>/lightnode/latest.json` riporta uno `sha256` per ogni binario, un `checksums.url` che punta a un file `SHA256SUMS` relativo all'intera release e il `checksums.sha256` di quel file stesso. Verifica ciò che hai scaricato — non è una nota a margine, è la differenza tra eseguire il binario effettivamente compilato ed eseguire qualunque cosa sia finita a quell'URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Su Windows, confronta `certutil -hashfile lightnode-sx-<platform>.exe SHA256` con il valore del manifest. Entrambe le reti servono attualmente la stessa build v3.1.3. Il sorgente è pubblico su `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

Puoi anche compilare il binario dal sorgente o eseguirlo con Docker.

### Compilazione dal sorgente

Il light node richiede **Go 1.26.1**. La sua crittografia post-quantistica è un'implementazione pure-Go (nessun CGO, nessuna libreria nativa), quindi la cross-compilazione per una qualsiasi delle sei piattaforme supportate funziona come per qualunque altro binario Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Questo produce `build/lightnode-sx`. Eseguilo direttamente, oppure copialo nel tuo `PATH`. Prima di registrare il node, verifica lo stack di firma post-quantistica con [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Non esiste un'immagine precompilata in un registry: la costruisci dal tag sorgente. Usa il tag **`v3.1.4` o successivo**: l'immagine costruita da `v3.1.3` include un vecchio firmatario `qorechaind` che la chain ora rifiuta, quindi i suoi heartbeat e le richieste di reward falliscono. Per aggiornare un'installazione esistente, ricostruisci dal nuovo tag (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`); il pull non fa nulla.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

Mantieni `QORECHAIN_RPC_ADDR` esportata su ogni comando `docker compose`: sovrascrive `rpc_addr` della configurazione, e il valore predefinito di compose punta a `host.docker.internal:26657`. Il container SX conserva i propri dati in un volume con nome montato su `/root/.qorechain-lightnode`.

L'immagine include anche un `qorechaind` rilasciato (v3.2.0, linux/amd64, scaricato dal canale di release al momento della build e controllato rispetto a un digest fissato). Il daemon lo pilota per firmare heartbeat e richieste di reward, così un node in container può restare attivo on-chain senza una seconda installazione. Se in seguito una rete passa a una versione che rifiuta il firmatario incluso, punta `[heartbeat] qorechaind_path` al `qorechaind` più recente indicato nel manifest di quella rete (`https://download.qore.host/<net>/latest.json`). Su un host arm64 (ad esempio Apple Silicon) la build non ha un firmatario; compila con `DOCKER_DEFAULT_PLATFORM=linux/amd64` se ne hai bisogno. Il firmatario richiede il wallet dell'operatore: monta la home di `qorechaind` (il keyring che contiene la chiave dell'operatore, più la chiave del node esportata in `pqc/<key_name>.dilithium`) su `/root/.qorechaind`; `docker-compose.yml` monta `~/.qorechaind` per impostazione predefinita, oppure imposta `QORECHAIND_HOME`. Le due passphrase sono quella del keyring del node e quella del keyring di `qorechaind`; la seconda viene passata a `qorechaind` tramite stdin e non compare mai su una riga di comando. Vedi [Il wallet dell'operatore](#operator-wallet).

## Configurazione

Il light node legge un file di configurazione TOML. Per impostazione predefinita cerca `config.toml` nella home directory (`~/.qorechain-lightnode/config.toml`). Normalmente non scrivi questo file a mano — la [procedura guidata `onboard`](#first-run-onboard) lo crea per te — ma è utile comprenderne le opzioni.

Due flag persistenti si applicano a ogni comando:

- `--config <path>` — punta a un file di configurazione in una posizione non predefinita.
- `--home <dir>` — sovrascrive la home directory usata per dati e chiavi (predefinita `~/.qorechain-lightnode`).

Le opzioni di configurazione più rilevanti, a livello d'uso:

| Opzione | Cosa controlla |
| --- | --- |
| `chain_id` | L'identificatore della rete (ad esempio `qorechain-diana` su testnet, `qorechain-vladi` su mainnet). Impostalo tu stesso dopo `onboard`, che lascia `qorechain-diana`; il firmatario lo usa. |
| `rpc_addr` | L'endpoint RPC della chain a cui si connette il daemon. Lascia vuoto per eseguire in **modalità solo locale**. |
| `primary_addr` / `witness_addrs` | L'endpoint RPC primario, e gli endpoint testimone rispetto ai quali viene corroborato l'header riportato — vedi [Perché eseguire un light node](/light-node/overview#why-run-a-light-node). Avere almeno un testimone distinto e raggiungibile è ciò che fa passare il valore `assurance` (registrato a livello debug) da `trusted-single-source` a `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Accettati per compatibilità ma attualmente non utilizzati. La fiducia negli header deriva dalla corroborazione primario/testimone descritta sopra. |
| `data_dir` | Dove il node memorizza il proprio database e gli header. |
| `keyring_backend` / `key_name` | Backend del keyring (`file`, `os`, oppure `test` solo per devnet locali) e nome della chiave post-quantistica del node. Il backend `file` richiede `QORE_LIGHTNODE_KEYRING_PASSPHRASE` nell'ambiente. |
| `operator_address` | L'account a cui appartiene questo node (`qor1...`); validato al caricamento. Necessario per `register`, `status` e gli heartbeat. Vedi [Il wallet dell'operatore](#operator-wallet). |
| `api_addr` | L'endpoint REST. Derivato da `rpc_addr` quando è vuoto (la porta 26657 diventa 1317; gli host `rpc.` diventano `api.`), quindi serve solo per endpoint che non seguono nessuna delle due convenzioni. |
| `[heartbeat]` | Attivo per impostazione predefinita. `qorechaind_path` (vuoto significa `qorechaind` nel `PATH`; l'immagine Docker lo include), `qorechaind_home` (vuoto significa `~/.qorechaind`), `key_name` (la chiave di account `qorechaind`; predefinita il `key_name` di primo livello), `interval_blocks` (da allineare al `heartbeat_interval` della chain, 1000), `check_interval` (predefinito `60s`), `fees` (predefinito `50000uqor`) e `gas` (predefinito `300000`). |
| `[delegation]` | `auto_claim` (disattivato per impostazione predefinita: riscatta le reward del light node maturate verso il wallet dell'operatore tramite il firmatario; il node non ri-delega mai dal server), l'intervallo di controllo, la reward minima da riscattare, `rebalance_enabled` e `min_reputation` (solo avvisi di reputazione — il node non sposta mai stake). `validators` e `split_weights` sono accettati ma attualmente non hanno effetto. |
| `[telemetry]` | Se la telemetria è abilitata e gli intervalli di aggiornamento per validatori, rete, bridge e tokenomics. |
| `log_level` / `log_format` | Verbosità del logging (`debug`, `info`, `warn`, `error`) e formato (`text` o `json`). |

### Variabili d'ambiente {#environment-variables}

| Variabile | Usata per |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Passphrase del keyring del node (`keyring_backend = "file"`). Obbligatoria; il node rifiuta una passphrase vuota. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Passphrase del keyring di `qorechaind` che contiene la chiave dell'operatore; passata a `qorechaind` tramite stdin, mai su una riga di comando. |
| `QORECHAIN_RPC_ADDR` | Sovrascrive `rpc_addr` (e `primary_addr` quando era uguale a `rpc_addr`). Impostata da `docker-compose.yml`. |

:::note Gli endpoint testimone vengono validati all'avvio
Un testimone sullo stesso host del primario viene rifiutato — un endpoint compromesso concorderebbe semplicemente con se stesso, quindi non corrobora nulla. Anche un testimone in chiaro `http://` su un host remoto viene rifiutato, poiché un attaccante in grado di riscrivere quella connessione può rispondere come se fosse ogni testimone contemporaneamente; `http://` in loopback va bene. Punta i testimoni verso endpoint RPC di cui hai motivi indipendenti per fidarti.
:::

I valori predefiniti di delegazione abilitano gli avvisi di ribilanciamento basati sulla reputazione e lasciano `auto_claim` disattivato — per cosa fanno, vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring).

## Primo avvio: `onboard` {#first-run-onboard}

Al primo avvio, `start` si arresta e ti indirizza alla procedura guidata di onboarding se non esiste ancora alcun file di configurazione. Esegui la procedura guidata:

```bash
build/lightnode-sx onboard
```

`onboard` ti guida attraverso la configurazione in quattro passaggi:

1. **Self-test PQC** — esegue l'intero roundtrip Dilithium-5 (gli stessi controlli di [`selftest`](#verify-the-pqc-stack-selftest)). Se lo stack PQC fallisce, la procedura guidata rifiuta di proseguire.
2. **Endpoint RPC della chain** — incolla l'URL RPC della tua QoreChain, oppure lascia vuoto per eseguire in **modalità solo locale** finché non serve alcuna connessione alla chain. Se fornisci un URL, la procedura guidata verifica la raggiungibilità in tempo reale.
3. **Chiave del node** — la procedura guidata la chiama «chiave privata del validatore», ma è la chiave Dilithium-5 propria del light node, non una chiave di validatore. Incolla una chiave privata Dilithium-5 codificata in esadecimale, oppure digita `g` (o `generate`) per generare una nuova coppia di chiavi su questo node.
4. **Salvataggio** — scrive `config.toml` e memorizza la chiave nel keyring con il nome `validator` (o `validator-<hex>` se quel nome è già occupato). Il keyring di tipo file richiede che `QORE_LIGHTNODE_KEYRING_PASSPHRASE` sia impostata nell'ambiente, sia per questo passaggio sia per ogni comando successivo che lo apre.

:::note Modalità solo locale
Se lasci vuoto l'endpoint, il daemon si avvia in modalità solo locale: lo stack PQC viene esercitato completamente, ma il node non sincronizza alcuna chain. Riesegui `onboard` quando il tuo endpoint della chain è pronto per puntarvi il node.
:::

`onboard` sovrascrive sempre la configurazione attiva. Usa `--config` per scrivere in un percorso non predefinito, oppure `--non-interactive` per fallire subito invece di chiedere input (utile in CI).

:::caution Completa la configurazione dopo l'onboarding
`onboard` non sa a quale rete ti stai unendo né quale account sia il tuo. Prima di eseguire `register` o di fare affidamento sugli heartbeat, modifica `config.toml`:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` al livello superiore è la chiave post-quantistica del node (il suo file è `pqc/<key_name>.dilithium` nella home di `qorechaind`); `[heartbeat] key_name` è la chiave di account `qorechaind` che paga la fee. Se lasci `key_name = "operator"` mentre la chiave si chiama `validator`, `register` si ferma con `node key "operator" not found`.
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

La chiave Dilithium-5 del node **non** è un wallet. Su QoreChain una chiave post-quantistica viene associata a un account; non ne crea uno. Per questo `keys list` non mostra alcun indirizzo per essa. Il tuo **indirizzo dell'operatore** è un normale account `qor1…` finanziato, creato con `qorechaind`, da cui il node viene registrato e che riceve le reward del light node. La chiave del node diventa la chiave post-quantistica di quell'account.

Configuralo una sola volta:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` stampa, compilati con i tuoi valori: il comando `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` che associa la chiave del node all'account (una sola volta), e la coppia `tx lightnode register … --generate-only` più `tx pqc cosign` che registra il node. La chain richiede la co-firma post-quantistica su ogni transazione, ed è per questo che la registrazione richiede due comandi e non uno. La registrazione richiede inoltre una licenza `lightnode_operator` attiva sull'indirizzo dell'operatore; senza di essa la chain rifiuta la transazione. La registrazione non è ancora aperta: vedi [Stato del programma di reward](/light-node/overview#reward-program-status).

## Comandi di gestione

La CLI SX include comandi per ispezionare lo stato del node e gestire le chiavi:

| Comando | Scopo |
| --- | --- |
| `onboard` | Procedura guidata interattiva di primo avvio. |
| `start` | Esegue il daemon. |
| `selftest` | Esegue il self-test PQC. |
| `status` | Mostra lo stato del node e della sincronizzazione del light client (ID della chain, ultima altezza, stato di recupero) più le righe `Signer`, `Operator`, `Licence` e `Registration`. |
| `keys create <name>` | Crea una nuova chiave del node Dilithium-5 e ne stampa la chiave pubblica. |
| `keys list` | Elenca le chiavi nel keyring (nome, tipo, indirizzo se presente, chiave pubblica). |
| `keys show <name>` | Stampa il tipo di una chiave e la sua chiave pubblica completa. |
| `keys import <name> <hex-privkey>` | Importa una chiave privata codificata in esadecimale. |
| `keys export <name>` | Esporta una chiave privata in esadecimale (lo stesso formato che `qorechaind` legge da `~/.qorechaind/pqc/`). |
| `register` | Stampa i comandi della chain che associano la chiave del node al tuo account operatore e registrano il node — vedi [Registrazione e licenze](/light-node/registration-and-licensing). |
| `validators` | Elenca i validatori bonded. |
| `delegation` | Mostra le delegazioni correnti dal database locale (vedi la limitazione nota in [Reward e Monitoraggio](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | Mostra le reward di staking in sospeso (stessa limitazione). |
| `network` | Mostra la telemetria di rete (header sincronizzati di recente) dal database locale. |
| `version` | Stampa la versione del binario. |

Per i dettagli su staking, reward e monitoraggio vedi [Reward e Monitoraggio](/light-node/rewards-and-monitoring). Per la registrazione on-chain vedi [Registrazione e licenze](/light-node/registration-and-licensing).
