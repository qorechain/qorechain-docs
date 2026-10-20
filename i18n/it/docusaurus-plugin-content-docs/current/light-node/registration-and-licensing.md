---
slug: /light-node/registration-and-licensing
title: Registrazione e licenze
sidebar_label: Registrazione e licenze
sidebar_position: 4
---

# Registrazione e licenze

Per ottenere la [quota di ricompensa del 3% per i light node](/light-node/rewards-and-monitoring), un light node deve essere **registrato on-chain** e deve continuare a dimostrare di essere attivo. Questa pagina spiega cosa richiede la chain, come ottenere una licenza, come il nodo si registra da solo e come dimostra la propria attività (liveness).

:::note La registrazione è aperta
La registrazione è aperta su mainnet (`qorechain-vladi`) e su testnet (`qorechain-diana`). Eseguire e sincronizzare un nodo non richiede alcuna licenza. Vedi [Stato del programma di ricompense](/light-node/overview#reward-program-status) per sapere come verificare lo stato attuale.
:::

## Registrazione on-chain

La registrazione inserisce il tuo light node sulla chain, in modo che il protocollo sappia che esiste, quale tipo è (`sx` o `ux`) e quale account operatore lo controlla. Una volta registrato e attivo, il nodo diventa idoneo per la quota di ricompensa dei light node.

### Requisiti {#requirements}

La chain verifica tutti i seguenti punti quando viene eseguita la tua transazione di registrazione:

1. Una licenza `lightnode_operator` attiva sull'indirizzo operatore.
2. Almeno **1.000 QOR delegati** da quello stesso indirizzo a validatori **bonded** (il tuo totale su qualsiasi validatore; le deleghe a validatori in jail o non bonded non contano).
3. Un saldo sull'account operatore per pagare la **commissione di registrazione di 1 QOR** e le commissioni di transazione. Il nodo paga inoltre da questo account una commissione per ogni heartbeat: con la firma nativa la commissione è di 0,25 uqor per unità di gas, quindi 75.000 uqor (0,075 QOR) con il valore predefinito di `[heartbeat] gas` pari a 300.000, ovvero circa 1,9 QOR al mese con circa 25 heartbeat al giorno.
4. Meno di 10.000 light node registrati a livello di rete.

Dopo la registrazione il nodo deve inviare un heartbeat ogni **1.000 blocchi** (con una tolleranza di 100 blocchi) e mantenere almeno l'**80% di uptime** per essere pagato. Leggi i valori in tempo reale con `GET https://api.qore.host/qorechain/lightnode/v1/params` (testnet: `https://api-testnet.qore.host`).

### L'account operatore {#operator-account}

La registrazione si effettua dal tuo **indirizzo operatore**: un normale account `qor1…` che detiene la licenza e lo stake, paga le commissioni e riceve le ricompense. Il nodo deve poter firmare per esso, quindi deve essere un account **di cui possiedi le parole di recupero**: parole che hai annotato tu stesso, un account di Keplr oppure una chiave `qorechaind` (percorso di derivazione `m/44'/118'/0'/0/0`). La scelta migliore è un account dedicato, usato solo per il nodo.

Un wallet custodial sulla Dashboard (uno il cui seed è conservato dalla Dashboard per te) non può far funzionare un nodo, a meno che tu non ne esporti prima il seed.

La chiave Dilithium-5 del nodo non ha un indirizzo proprio: su QoreChain una chiave post-quantistica viene associata a un account, non ne crea uno. Il nodo associa la propria chiave all'account operatore come chiave post-quantistica di quell'account, a meno che l'account non ne abbia già una (vedi [Account che hanno già una chiave post-quantistica](#accounts-with-a-pqc-key)).

## Ottenere una licenza

### Mainnet: acquisto sulla Dashboard

Le licenze si acquistano sulla Dashboard di QoreChain in **Tools → Light Node**. Una licenza costa **50 $**, pagati in USDT su ERC-20, BEP-20 o TRC-20; il pagamento viene verificato sulla sua chain. Devi inserire l'indirizzo `qor1…` a cui è destinata la licenza **prima** di pagare; usa l'indirizzo operatore descritto sopra.

La concessione è un passaggio on-chain separato, firmato manualmente e inviato a lotti. Finché la chain non la conferma, la scheda mostra **Paid, awaiting on-chain grant** e il nodo continua a segnalare che l'indirizzo non ha una licenza. `lightnode-sx status` mostra una riga `Licence:` che passa a `active` quando la concessione arriva. Puoi anche verificarla direttamente:

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Testnet: su richiesta

Sulla testnet non si vende nulla. Le licenze testnet sono gratuite e vengono concesse su richiesta dall'autorità delle licenze della testnet: scrivi a nodes@qorechain.io indicando il tuo indirizzo `qor1…` della testnet.

## Registrare il nodo

I passaggi seguenti sono il flusso di configurazione del nodo stesso. Sono identici per entrambe le edizioni: `lightnode-ux` ha gli stessi comandi di `lightnode-sx` e usa la stessa directory home (`~/.qorechain-lightnode`). Vedi [Edizione SX](/light-node/sx-edition#first-run-onboard) per i dettagli su ciascun comando.

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

La passphrase protegge entrambe le chiavi nel keyring del nodo: la chiave post-quantistica del nodo e la chiave dell'account operatore.

### Cosa fa `register`

`register` legge `operator_address` e le chiavi dal keyring, quindi:

1. **Verifica la licenza.** Chiede alla chain se `operator_address` possiede una licenza `lightnode_operator` attiva. Se non ce l'ha, si ferma e indica dove ottenerne una. Dalla 3.1.10 il messaggio rimanda a **Tools → Light Node** sulla mainnet e, sulla testnet, a una licenza gratuita su richiesta a nodes@qorechain.io (la 3.1.9 nominava ancora la vecchia scheda della Dashboard). Una licenza scaduta o sospesa viene segnalata come tale. Un nodo già registrato viene segnalato come tale e non viene inviato nulla.
2. **Associa la chiave post-quantistica**, a meno che l'account non ne abbia già una. Un account senza chiave post-quantistica può inviare solo questo messaggio, firmato in modo classico (senza l'estensione ibrida); il nodo lo invia in questo modo e include una prova di possesso della chiave dove la chain la supporta.
3. **Delega lo stake mancante**, solo se indichi un validatore con `--delegate-to qorvaloper1...`. Senza `--delegate-to`, se l'account è sotto il minimo, si ferma e indica quanto manca. Dalla 3.1.10 conta solo lo stake delegato a validatori **bonded**, come fa la chain; la 3.1.9 contava anche i validatori in jail o non bonded e poteva quindi essere respinta on-chain, perciò delega a un validatore attivo se usi la 3.1.9.
4. **Registra il nodo** con la commissione di 1 QOR.

Ogni passaggio è firmato dal nodo stesso e confermato in un blocco prima che venga inviato il successivo. Ogni transazione successiva alla registrazione della chiave porta la firma ibrida ML-DSA-87 + secp256k1 richiesta dalla chain.

Il comando accetta questi flag:

- `--delegate-to` — il validatore `qorvaloper1…` a cui delegare lo stake mancante.
- `--type` — il tipo di nodo, `sx` o `ux` (predefinito: l'edizione del binario).
- `--version` — la versione del nodo da registrare (predefinita: la versione del binario stesso).
- `--print` — stampa i comandi `qorechaind` equivalenti invece di firmare (vedi sotto).

L'account deve già esistere on-chain (deve aver ricevuto fondi) prima che `register` possa firmare per esso.

### Account che hanno già una chiave post-quantistica {#accounts-with-a-pqc-key}

Un account configurato in un wallet ha spesso già una chiave post-quantistica, derivata dalle stesse parole di recupero. Con le regole della chain v3.2.3, la chain accetta solo la chiave registrata sull'account e rifiuta chiavi di tipo `classical_only` o una chiave vuota.

Dalla 3.1.9, `keys add-operator --recover` gestisce questo caso: quando l'account ha già una chiave post-quantistica, ricostruisce quella chiave dalle parole, usando la stessa derivazione del wallet-adapter e della Dashboard (la stessa di `qorechaind tx pqc recover-key`), e il nodo firma con essa. Quando l'account non ha una chiave, il nodo ne deriva una dalle parole, così le parole ripristinano anche la chiave del nodo. Se l'account ha una chiave post-quantistica che le parole non possono riprodurre (un wallet che genera e conserva una propria chiave), il comando rifiuta e consiglia un account operatore dedicato.

### Alternativa: chiave operatore in un keyring `qorechaind`

Se conservi la chiave dell'account operatore in un keyring `qorechaind` e non vuoi memorizzarla nel nodo, salta il passaggio 3 ed esegui:

```bash
lightnode-sx register --print
```

Esegue gli stessi controlli di licenza e di registrazione e stampa, già compilati con i tuoi valori, i comandi `qorechaind` per ogni passaggio: l'esportazione della chiave del nodo nella directory delle chiavi di `qorechaind` (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, un `tx staking delegate` quando lo stake è insufficiente, e `tx lightnode register` come coppia genera-poi-`tx pqc cosign`. Su questo percorso il daemon usa `qorechaind` anche per gli heartbeat; vedi [impostazioni `[heartbeat]`](/light-node/sx-edition#configure).

## Prove di liveness tramite heartbeat

La sola registrazione non basta per rimanere idonei. Un light node registrato deve dimostrare continuamente di essere online inviando **prove di liveness tramite heartbeat**. Questi heartbeat sono il modo in cui la chain distingue i nodi attivi — idonei per la quota di ricompensa — dai nodi registrati ma offline.

In pratica, un nodo registrato e mantenuto in funzione (e sincronizzato) conserva la propria idoneità, mentre un nodo che va offline smette di dimostrare la propria attività e perde l'idoneità finché non torna online. Mantenere il daemon in esecuzione e in buono stato fa quindi parte del guadagnare le ricompense — vedi [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) per capire come controllare lo stato di heartbeat e sincronizzazione.

### Pipeline di heartbeat co-firmata PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain richiede la PQC **per impostazione predefinita**, quindi ogni heartbeat porta una **firma ibrida**: ML-DSA-87 (Dilithium-5) con la chiave post-quantistica dell'account, e secp256k1 con la chiave dell'account operatore. Il nodo costruisce e firma la transazione da solo su Linux, macOS e Windows; `qorechaind` non è necessario. Legge dalla rete quale versione dei sign-bytes usare.

Gli heartbeat on-chain sono attivi per impostazione predefinita. Il daemon ne invia uno quando sono trascorsi 1.000 blocchi (`[heartbeat] interval_blocks`, corrispondente al `heartbeat_interval` della chain) dal `last_heartbeat` registrato dalla chain per il nodo, controllando ogni 60 secondi, quindi un riavvio non invia un duplicato né attende un intero intervallo. Ogni heartbeat viene segnalato solo quando è incluso in un blocco.

Il daemon sceglie il proprio firmatario all'avvio:

- **Nativo** — il keyring contiene la chiave operatore (da `keys add-operator`) e corrisponde a `operator_address`. Questo è il caso normale.
- **Alternativa `qorechaind`** — altrimenti, se un binario `qorechaind` si trova nel `PATH` o in `[heartbeat] qorechaind_path`. Usa la chiave operatore nel keyring di `qorechaind` (`[heartbeat] key_name`, home `qorechaind_home`, predefinita `~/.qorechaind`) e la chiave del nodo esportata in `pqc/<key_name>.dilithium`. La passphrase del keyring di `qorechaind` va in `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`; viene passata a `qorechaind` tramite stdin, mai inserita in una riga di comando.

Finché il nodo non è registrato, non invia heartbeat; registra invece nei log il motivo, una volta a ogni cambio di stato: nessuna licenza, oppure licenza attiva ma non registrato (esegui `register`). `lightnode-sx status` mostra le righe `Signer:`, `Licence:` e `Registration:` così che il motivo sia visibile senza leggere i log. Quando non c'è alcun firmatario, il nodo continua comunque a funzionare e a sincronizzarsi, ma non può restare attivo on-chain, e `status` lo segnala.

## La scheda Light Node della Dashboard

La scheda **Tools → Light Node** della Dashboard di QoreChain riunisce i passaggi:

1. **Download.** Collega i binari del light node per la rete selezionata (gli stessi file di `https://download.qore.host/<net>/lightnode/latest.json`, con i relativi checksum sha256).
2. **Passaggi di configurazione.** Mostra i cinque passaggi descritti sopra, allineati alla versione del manifest di rilascio, e se la registrazione è aperta, letto dal campo `registration` del manifest.
3. **Acquisto della licenza** (solo mainnet). Richiede l'indirizzo della licenza prima del pagamento e mostra **Paid, awaiting on-chain grant** finché la chain non conferma la concessione. Ti avvisa se l'indirizzo inserito è il tuo wallet custodial della Dashboard e segnala, a titolo informativo, se l'indirizzo ha già una chiave post-quantistica.
4. **Stato.** Un pannello di stato mostra lo stato del nodo così come letto dalla chain.

La registrazione vera e propria è sempre la transazione inviata da `lightnode-sx register` (o `lightnode-ux register`). La Dashboard non registra nodi; il suo vecchio modulo di registrazione, che memorizzava solo un record, è stato rimosso.

## Dove andare ora

- [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) — come la quota del 3% viene accreditata, riscossa e monitorata.
- [Edizione SX](/light-node/sx-edition) — il comando `register` e il riferimento completo alla CLI.
