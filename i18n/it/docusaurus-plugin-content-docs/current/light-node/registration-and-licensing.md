---
slug: /light-node/registration-and-licensing
title: Registrazione e licenze
sidebar_label: Registrazione e licenze
sidebar_position: 4
---

# Registrazione e licenze

Per ottenere la [quota di ricompensa del 3% per i light node](/light-node/rewards-and-monitoring), un light node deve essere **registrato on-chain** e deve continuare a dimostrare di essere attivo. Questa pagina spiega come funziona la registrazione, come il nodo dimostra la propria attività (liveness) e come ottenere una licenza per un nodo tramite la Dashboard e registrarlo on-chain.

:::note La registrazione al programma di ricompense non è ancora aperta
Su nessuna delle due reti è stata concessa alcuna licenza `lightnode_operator` e nessun nodo è registrato, quindi oggi la chain rifiuta ogni registrazione. Eseguire e sincronizzare un nodo non richiede alcuna licenza. Vedi [Stato del programma di ricompense](/light-node/overview#reward-program-status) per sapere come verificare lo stato attuale.
:::

## Registrazione on-chain

La registrazione inserisce il tuo light node sulla chain, in modo che il protocollo sappia che esiste, quale tipo è (`sx` o `ux`) e quale chiave operatore lo controlla. Una volta registrato e attivo, il nodo diventa idoneo per la quota di ricompensa dei light node.

### Requisiti {#requirements}

La chain verifica tutti i seguenti punti quando viene eseguita la tua transazione di registrazione:

1. Una licenza `lightnode_operator` attiva sull'indirizzo operatore.
2. Almeno **1.000 QOR vincolati** (bonded) ai validatori da quello stesso indirizzo (il tuo totale su tutti i validatori). Delega **prima** di registrarti: dalla pagina di staking della Dashboard, oppure con `qorechaind tx staking delegate` (e la co-firma post-quantistica, come ogni transazione).
3. Un saldo sull'account operatore per pagare la **commissione di registrazione di 1 QOR** e le commissioni di transazione. Il daemon paga una commissione per ogni heartbeat da questo account (predefinita `50000uqor` per heartbeat, `[heartbeat] fees`).
4. Meno di 10.000 light node registrati a livello di rete.

### Generare i comandi di registrazione

La registrazione si effettua dal tuo **indirizzo operatore**: un account `qor1…` finanziato, creato con `qorechaind` (o con qualsiasi wallet Cosmos), che riceve anche le ricompense. La chiave Dilithium-5 del nodo non ha un indirizzo; diventa la chiave post-quantistica dell'account. Inserisci l'indirizzo in `config.toml` come `operator_address` e assicurati che `key_name` e `chain_id` siano impostati come descritto in [Primo avvio](/light-node/sx-edition#first-run-onboard) (`onboard` non li imposta correttamente al posto tuo). Poi esegui:

```bash
lightnode-sx register
```

Prima di stampare qualsiasi cosa, il comando chiede alla chain se `operator_address` possiede una licenza `lightnode_operator` attiva. Lo fa perché la chain rifiuta una registrazione senza licenza, e non ha senso consegnarti comandi che verranno rifiutati. Senza licenza si ferma con:

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Una licenza acquistata sulla Dashboard viene concessa on-chain in un passaggio separato, quindi `register` può dire ancora «no licence» per un po' dopo l'acquisto; `lightnode-sx status` mostra la stessa riga `Licence:` e passa a `active` quando la concessione arriva. Un nodo già registrato viene segnalato come tale invece di essere registrato due volte.

Con una licenza attiva, il comando legge la chiave del nodo dal keyring e stampa, già compilati con i tuoi valori:

1. **Una sola volta**, il comando che associa la chiave del nodo all'account operatore come sua chiave post-quantistica (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`), dopo aver esportato la chiave nella directory delle chiavi di `qorechaind` con `lightnode-sx keys export`. Saltalo se l'account ha già una chiave post-quantistica (`GET /qorechain/pqc/v1/account/<address>` restituisce `found: true`). Se il limite di gas stampato si esaurisce, ripeti il comando con `--gas 600000 --fees 60000uqor`.
2. La registrazione vera e propria: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, poi `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. La chain richiede la co-firma post-quantistica su ogni transazione, quindi la registrazione è una coppia genera-poi-co-firma.

Il comando accetta due flag opzionali:

- `--type` — il tipo di nodo, `sx` o `ux` (predefinito `sx`).
- `--version` — la versione del nodo da registrare (predefinita: la versione del binario stesso).

Invia sulla rete a cui ti stai unendo (testnet `qorechain-diana` o mainnet `qorechain-vladi`). La registrazione richiede una licenza `lightnode_operator` attiva concessa sull'indirizzo operatore; altrimenti la chain la rifiuta.

:::note
`lightnode-sx register` **stampa** i comandi perché tu li esamini ed esegua — non trasmette nulla da solo. Questo ti lascia il pieno controllo su quando e come il nodo viene registrato.
:::

## Prove di liveness tramite heartbeat

La sola registrazione non basta per rimanere idonei. Un light node registrato deve dimostrare continuamente di essere online inviando **prove di liveness tramite heartbeat**. Questi heartbeat sono il modo in cui la chain distingue i nodi attivi — idonei per la quota di ricompensa — dai nodi registrati ma offline.

In pratica, un nodo registrato e mantenuto in funzione (e sincronizzato) conserva la propria idoneità, mentre un nodo che va offline smette di dimostrare la propria attività e perde l'idoneità finché non torna online. Mantenere il daemon in esecuzione e in buono stato fa quindi parte del guadagnare le ricompense — vedi [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) per capire come controllare lo stato di heartbeat e sincronizzazione.

### Pipeline di heartbeat co-firmata PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain richiede la PQC **per impostazione predefinita**, quindi la transazione di liveness tramite heartbeat viene prodotta attraverso una pipeline co-firmata post-quantistica anziché con una firma puramente classica. Il daemon costruisce l'heartbeat non firmato, quindi lo co-firma con una firma **ibrida Dilithium-5 (ML-DSA-87)** prima della trasmissione — la stessa impostazione post-quantistica che la chain impone per ogni transazione. Il nodo invia un heartbeat per ogni finestra di `interval_blocks` (corrispondente al parametro `heartbeat_interval` della chain), regolando il proprio ritmo in base all'altezza dei blocchi per evitare rifiuti dovuti a invii anticipati.

Gli heartbeat on-chain sono attivi per impostazione predefinita. Il daemon richiede: `operator_address` nella configurazione; un binario `qorechaind` **v3.2.0 o successivo** (nel `PATH` o in `[heartbeat] qorechaind_path`; l'immagine Docker SX costruita dal tag `v3.1.4` ne include uno — i firmatari più vecchi vengono rifiutati dalla chain); e la home di `qorechaind` che contiene la chiave operatore e la chiave del nodo esportata (`qorechaind_home`, predefinita `~/.qorechaind`). Due passphrase del keyring vanno impostate nell'ambiente: `QORE_LIGHTNODE_KEYRING_PASSPHRASE` per il keyring del nodo e `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` per il keyring di `qorechaind` (la seconda viene passata a `qorechaind` tramite stdin, mai inserita in una riga di comando). `qorechaind` è pubblicato **solo per Linux amd64** (vedi la voce `binary` di `https://download.qore.host/mainnet/latest.json`), quindi su host macOS, Windows o ARM il nodo funziona e si sincronizza ma non può firmare nativamente gli heartbeat; un nodo registrato dovrebbe eseguire l'edizione SX su Linux amd64, oppure l'immagine Docker su un host amd64. Regola il proprio ritmo in base al `last_heartbeat` della chain per quel nodo, quindi un riavvio non invia un duplicato né attende un intero intervallo. Finché il nodo non è registrato, non invia heartbeat; registra invece nei log il motivo, una volta a ogni cambio di stato: nessuna licenza (con indicazione di dove acquistarne una) oppure licenza attiva ma non registrato (esegui `lightnode-sx register`). `lightnode-sx status` mostra le righe `Signer:`, `Licence:` e `Registration:` così che il motivo sia visibile senza leggere i log. Quando il firmatario manca, il nodo continua comunque a funzionare e a sincronizzarsi; semplicemente non può restare attivo on-chain, e `status` lo segnala.

## Registrazione e licenze tramite la Dashboard

Puoi verificare lo stato della tua licenza e conservare i dettagli del tuo nodo nella scheda **Tools → Light Node** della Dashboard di QoreChain. Eseguire un nodo e aderire al suo programma di ricompense sono due cose diverse, e la Dashboard le tiene separate:

1. **Ottieni il software (nessuna licenza necessaria).** La scheda collega i binari del light node per la rete selezionata (gli stessi file di `https://download.qore.host/<net>/lightnode/latest.json`, con i relativi checksum sha256) e mostra un kit di avvio per un nodo QoreChain completo. Un light node richiede solo il binario `lightnode-sx` o `lightnode-ux` e un endpoint RPC; segui [Edizione SX](/light-node/sx-edition).
2. **Controlla lo stato del tuo programma di ricompense.** Aderire alla quota di ricompensa dei light node è un passaggio separato, vincolato on-chain: una licenza `lightnode_operator` attiva concessa on-chain, almeno 1.000 QOR vincolati (il tuo totale su tutti i validatori, letto in tempo reale dallo staking) e una commissione di registrazione di 1 QOR. **L'iscrizione non è ancora aperta** (vedi [Stato del programma di ricompense](/light-node/overview#reward-program-status)), e acquistare una licenza non la apre in anticipo. L'uptime viene conteggiato dal blocco in cui il tuo nodo si registra on-chain, non prima.
3. **Licenza.** Una licenza acquistata tramite **Buy License** viene registrata prima sul nostro sistema; la concessione che la rende riconosciuta on-chain è un passaggio separato, e la chain rifiuta la registrazione finché non arriva. L'acquisto richiede l'indirizzo `qor1…` a cui verrà concessa la licenza e mostra **Paid — awaiting on-chain grant** finché la chain non lo conferma. `lightnode-sx status` mostra la riga `Licence:` on-chain.
4. **Registrazione della richiesta.** Se il tuo account possiede una licenza registrata come attiva, la scheda mostra anche un breve modulo (indirizzo operatore, moniker, URL dell'endpoint pubblico e conferma dell'impegno di stake) seguito da un riepilogo di ciò che hai inviato. Questo registra la tua richiesta presso la Dashboard; **non** invia la transazione di registrazione on-chain.
5. **Registrati on-chain.** Una volta concessa la licenza e vincolati 1.000 QOR dal tuo indirizzo operatore, registrati con `lightnode-sx register` e i comandi `qorechaind` che stampa (vedi sopra).

La Dashboard è utile per scaricare il nodo, verificare i requisiti della chain e lo stato di salute del tuo nodo, e acquistare una licenza. La registrazione on-chain vera e propria è sempre la transazione `lightnode-sx register`.

## Dove andare ora

- [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) — come la quota del 3% viene accreditata, riscossa e monitorata.
- [Edizione SX](/light-node/sx-edition) — il comando `register` e il riferimento completo alla CLI.
