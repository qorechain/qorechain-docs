---
slug: /developer-guide/running-a-validator
title: Gestire un Validatore
sidebar_label: Gestire un Validatore
sidebar_position: 9
---

# Gestire un Validatore

Questa guida spiega come creare un validatore sulla rete QoreChain, comprendere il sistema di classificazione a pool, registrare una chiave PQC per una sicurezza resistente ai computer quantistici e monitorare il proprio nodo.

:::note
Questa guida si riferisce alla mainnet **`qorechain-vladi`** (EVM chain ID **9801**), attiva dal 7 giugno 2026, che esegue la release di nodo **v3.2.3** (applicata tramite governance all'altezza 3.662.051) fino all'altezza 3.742.566 e la **v3.2.4** da quel blocco (proposta di governance 13). Un validatore deve avere installato il binario v3.2.4 prima di quell'altezza, altrimenti il suo nodo si ferma lì e perde blocchi finché non viene riavviato; vedi [Esecuzione di un nodo: Upgrade](/developer-guide/running-a-node#upgrades). La testnet **`qorechain-diana`** (EVM chain ID **9800**, che esegue la v3.2.4 dal 19 ottobre 2026) è consigliata per provare la configurazione prima di andare in produzione. Sostituisci il `--chain-id` appropriato per la rete di destinazione. I tempi di blocco differiscono: circa 3,2 s sulla mainnet e circa 1,0 s sulla testnet, quindi converti il numero di blocchi in tempo per ciascuna rete.
:::

:::caution Usa il binario di release, non una build dal sorgente
Un validatore deve eseguire il **`qorechaind` di release** indicato nel manifest live (`https://download.qore.host/mainnet/latest.json`; vedi [Gestire un Nodo](/developer-guide/running-a-node#fetch-the-manifest)). Un binario compilato dal sorgente pubblico ha keeper stub e nessun firmatario post-quantistico: non può riprodurre lo stato di consenso della rete e non può creare la firma ibrida richiesta da `create-validator` e da ogni altra transazione sul lane Cosmos (vedi [Compilare dal Sorgente](/developer-guide/building-from-source)). Dalla v3.2.3 un binario compilato dal sorgente pubblico si rifiuta del tutto di avviarsi su una rete pubblica. Un nuovo nodo mainnet richiede la v3.2.0 o successiva; mantieni l'orologio di sistema sincronizzato via NTP, perché dalla v3.2.1 il nodo si ferma quando il suo orologio è sfasato di più di 60 secondi.
:::

:::note Quali parti di questa pagina sono attive
La produzione dei blocchi usa la rotazione standard dei validatori pesata per stake, e slashing e governance usano i moduli standard del Cosmos SDK con i parametri mostrati sotto. La logica CPoS a tre pool (classificazione a pool, selezione del proponente pesata per pool, curva di bonding e slashing progressivo) è implementata nel modulo `x/qca` e i suoi parametri sono on-chain, ma **non è ancora collegata a produzione dei blocchi, ricompense o slashing**. Le sezioni su questi argomenti descrivono il design; non pianificare contando sull'appartenenza a un pool o sulla reputazione per modificare oggi la tua quota di proposte di blocchi o le ricompense.
:::

---

## Prerequisiti

* Un nodo `qorechaind` di release completamente sincronizzato (vedi [Connessione alla Mainnet](/getting-started/connecting-to-mainnet), oppure [Connessione alla Testnet](/getting-started/connecting-to-testnet) per fare prove)
* Una **chiave PQC ML-DSA-87 registrata** sull'account operatore (vedi [Registrazione della Chiave PQC](#pqc-key-registration)) — `create-validator` richiede la firma ibrida
* Un account con fondi per almeno **100.000 QOR** (100.000.000.000 uqor) per l'auto-delega iniziale — questo minimo è imposto on-chain e `create-validator` viene rifiutato se non raggiunto
* Una **concessione `validator_operator`** attiva sul tuo indirizzo operatore, emessa tramite il [Validator Program](/dashboard/tools-hub#validator-application) (fai domanda, vieni selezionato, paga la quota di programma di $1,000); vedi la nota sotto. Senza di essa, `create-validator` fallisce con `ErrUnauthorized` indipendentemente da quanto QOR auto-vincoli
* Familiarità con il modello di [Staking e Delega](/user-guide/staking-and-delegation)

---

## Creare un Validatore

### Concessione operatore: `validator_operator` {#validator-license-gate}

`create-validator` è soggetto a due controlli indipendenti, entrambi applicati on-chain, ed entrambi sono necessari — un grande auto-bond da solo non basta:

1. **Auto-bond minimo di 100.000 QOR.**
2. **Una concessione `validator_operator` attiva** sull'account che invia la transazione.

La concessione viene emessa on-chain dalla QoreChain Association tramite il **Validator Program**: fai domanda sul [Tools Hub](/dashboard/tools-hub#validator-application), gestisci un validatore sulla testnet diana per la prova di 14 giorni e, una volta selezionato, paga la **quota di programma di $1,000**; la concessione viene poi firmata in batch per l'indirizzo operatore indicato nella domanda. Verifica la tua con `GET /qorechain/license/v1/check/{grantee}/validator_operator`. Il campo `expires_at` di una licenza è un'**altezza di blocco**, non una data o una durata — `0` significa nessuna scadenza. Se mancante o scaduta, `create-validator` fallisce con `ErrUnauthorized`, indipendentemente da quanto auto-vincoli; questo è il motivo più comune per cui un tentativo ben finanziato fallisce senza apparente spiegazione. Questo gate esiste specificamente perché il lane di esecuzione EVM non può vederlo né applicarlo (un singolo decoratore ante lì lo aggirerebbe completamente) — è uno dei motivi per cui staking e validazione restano esclusivamente sul lane Nativo.

Crea un file `validator.json` (la forma basata su flag è stata rimossa nell'SDK attuale):

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Poi genera e firma la transazione (richiede la firma ibrida come ogni transazione sul lane Cosmos; vedi [Comandi di Transazione](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

La soglia minima delle commissioni di rete è di **0,1 uqor per unità di gas**, quindi un limite di gas di 600.000 richiede almeno 60.000 uqor.

| Campo di `validator.json`      | Descrizione                                        |
| ------------------------------- | -------------------------------------------------- |
| `amount`                       | Importo dell'auto-delega — **minimo 100.000 QOR** (`100000000000uqor`) |
| `pubkey`                       | Chiave pubblica di consenso del validatore (ed25519) |
| `moniker`                      | Nome leggibile del tuo validatore                   |
| `commission-rate`              | Tasso di commissione iniziale (es. 0.10 = 10%)      |
| `commission-max-rate`          | Tasso di commissione massimo (immutabile dopo la creazione) |
| `commission-max-change-rate`   | Variazione massima giornaliera del tasso di commissione |
| `min-self-delegation`          | Token minimi che l'operatore deve auto-delegare     |

Dopo la conferma della transazione, verifica il tuo validatore:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classificazione a Pool

:::note Design, non ancora attivo nella produzione dei blocchi
La classificazione a pool qui sotto è il design di `x/qca`. I suoi parametri sono on-chain (`qorechaind query qca config`), ma i proponenti dei blocchi non sono ancora scelti per pool e i pool non modificano ancora ricompense o slashing.
:::

Il modulo `x/qca` (Quantum Consensus Allocation) di QoreChain definisce un **sistema di classificazione a tre pool**. Ogni **1,000 blocchi** (circa 54 minuti con i blocchi da 3,2 s della mainnet), i validatori dovrebbero essere riclassificati in uno dei tre pool in base alla loro reputazione e al loro stake:

| Pool                                 | Criteri                                            | Allocazione dei blocchi |
| ------------------------------------- | --------------------------------------------------- | ----------------------- |
| **RPoS** (Proof-of-Stake basato sulla reputazione) | Reputazione >= 70° percentile E stake >= mediana | 40% dei blocchi |
| **DPoS** (Proof-of-Stake delegato)   | Delega totale >= 10,000 QOR                          | 35% dei blocchi |
| **PoS** (Proof-of-Stake)             | Tutti i restanti validatori attivi                   | 25% dei blocchi |

Nel design, all'interno di ciascun pool i proponenti dei blocchi sono selezionati tramite selezione casuale ponderata proporzionale al loro stake effettivo, in modo che sia i validatori ad alta reputazione sia quelli con deleghe elevate ricevano una rappresentanza equa, pur consentendo ai validatori più piccoli di partecipare.

### Interrogare la Configurazione dei Pool

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

Via JSON-RPC:

> **Non ancora servito:** nessuna build di nodo rilasciata serve il namespace JSON-RPC `qor_`, quindi questa chiamata restituisce `-32601` (method not found) su tutti gli endpoint pubblici oggi. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Curva di Bonding

:::note Design, non ancora attivo
La curva di bonding è implementata in `x/qca` ma non è ancora collegata alla distribuzione delle ricompense; le ricompense di staking oggi seguono il modulo di distribuzione standard. La formula qui sotto è il design.
:::

La ricompensa di staking di un validatore è progettata per essere determinata da una curva di bonding che incorpora più fattori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                |
| --------- | ----------------------------------------------------------- |
| `R`       | Importo della ricompensa                                    |
| `beta`    | Tasso di ricompensa base                                    |
| `S`       | Stake effettivo                                             |
| `alpha`   | Costante di scala della fedeltà                             |
| `L`       | Durata della fedeltà (tempo di staking continuo)             |
| `Q(r)`    | Fattore di qualità della reputazione, intervallo \[0.75 - 1.25] |
| `P(t)`    | Moltiplicatore di fase del protocollo (si adegua lungo il ciclo di vita della rete) |

**Punti chiave:**

* **Bonus per durata della fedeltà:** il design aggiunge un termine logaritmico per il tempo di staking continuo.
* **Fattore di qualità della reputazione:** varia da 0.75 (reputazione scarsa) a 1.25 (reputazione eccellente). I pesi della formula di reputazione sono on-chain (`qorechaind query reputation params`).
* **Moltiplicatore di fase del protocollo:** si adegua man mano che la rete matura attraverso le diverse fasi (bootstrap, crescita, maturità).

---

## Slashing {#slashing}

Le sanzioni base per infrazione, interrogabili in tempo reale e aggiornate al momento della stesura:

```bash
qorechaind query slashing params
```

| Parametro | Valore |
| --- | --- |
| Finestra dei blocchi firmati | 10,000 blocchi (circa 8,9 ore sulla mainnet con blocchi da 3,2 s; meno sulla testnet) |
| Minimo firmato per finestra | 5% (`min_signed_per_window` = 0.05): un validatore viene jailed quando firma **meno del 5%** degli ultimi 10,000 blocchi, cioè quando ne manca più del 95% |
| Durata del jail per downtime | 600 secondi (10 minuti) |
| Frazione di slashing per downtime | 1% dello stake |
| Frazione di slashing per doppia firma | 5% dello stake |

Il jailing è un timeout fisso di 10 minuti con una sanzione fissa. L'unbonding richiede 21 giorni (1,814,400 s), il set attivo contiene al massimo 100 validatori (`max_validators`) e ogni delegatore può avere al massimo 7 voci di unbonding (`max_entries`). Il modello progressivo descritto sotto è un design separato che sovrapporrebbe conseguenze aggiuntive e crescenti alle infrazioni ripetute; non è ancora collegato.

## Slashing Progressivo

:::note Design, non ancora attivo
Lo slashing progressivo è implementato in `x/qca` ma non è collegato allo slashing: le sanzioni in vigore sono i valori standard di `x/slashing` nella tabella sopra. I parametri qui sotto sono il design (`qorechaind query qca config`).
:::

Il design dello slashing progressivo inasprisce le sanzioni per i recidivi, consentendo al contempo ai validatori di recuperare nel tempo:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametro                    | Valore          |
| ----------------------------- | --------------- |
| Sanzione massima per evento   | 33% dello stake |
| Emivita del decadimento       | 100,000 blocchi |
| Gravità del downtime          | 1.0             |
| Gravità della doppia firma    | 2.0             |
| Gravità dell'attacco al light client | 3.0      |

1. **Ogni infrazione incrementa il conteggio effettivo.** Ogni infrazione (downtime, doppia firma, ecc.) aumenta il conteggio effettivo del validatore, che influisce sulle sanzioni future.

2. **La sanzione cresce in modo esponenziale.** La sanzione cresce in base al conteggio effettivo secondo la formula sopra riportata, quindi i recidivi subiscono sanzioni molto più pesanti.

3. **Il conteggio effettivo decade nel tempo.** Il conteggio effettivo decade con un'emivita di 100,000 blocchi (circa 3,7 giorni con i blocchi da 3,2 s della mainnet), consentendo ai validatori di recuperare dopo un periodo di buona condotta.

4. **Eventi singoli vs infrazioni ripetute.** Un singolo evento accidentale di downtime comporta una sanzione lieve, mentre le infrazioni ripetute innescano conseguenze che crescono in modo esponenziale.

---

## Registrazione della Chiave PQC {#pqc-key-registration}

Registra la tua **chiave pubblica crittografica post-quantistica (PQC)** — ML-DSA-87 — **prima** di eseguire `create-validator`, e il prima possibile: il pannello [Validator Readiness](/dashboard/tools-hub#validator-application) la verifica dal momento in cui fai domanda. Questo passaggio **non è opzionale né automatico**: la chain richiede una firma ibrida PQC su ogni transazione sul lane Cosmos, `MsgCreateValidator` non è uno dei tipi di messaggio esentati e nessun account registra la propria chiave automaticamente: la registrazione è una transazione esplicita che ogni account (operatori di validatori inclusi) deve inviare da sé, in anticipo. Genera prima la chiave:

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` allega una **prova di possesso** (proof of possession): la chiave firma `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)` e la chain la verifica, così nessuno può registrare una chiave pubblica di cui non possiede la metà privata. Nella v3.2.3 è facoltativa e consigliata. Dalla v3.2.4 (testnet dal 19 ottobre 2026; mainnet dall'altezza 3.742.566) il record dell'account riporta anche se una prova è stata verificata (`possession_proven`, in `GET /qorechain/pqc/v1/account/{address}`).

:::note Cosa ha cambiato la v3.2.3 per la registrazione delle chiavi
* Un account **senza** chiave registrata può inviare solo la registrazione stessa: qualsiasi altra transazione che porti un'estensione di firma ibrida viene rifiutata. Registra prima la chiave, poi firma tutto il resto con `tx pqc cosign`.
* Le chiavi `classical_only`, vuote e degeneri vengono rifiutate alla registrazione.
* Una volta che un account possiede una chiave, l'ulteriore manutenzione della chiave (rotazione, migrazione, nuova registrazione) deve essere a sua volta firmata in modo ibrido e non può essere inviata tramite `authz`.
* `tx pqc gen-key` non sovrascrive mai un file di chiave esistente.
:::

| Parametro      | Descrizione                                       |
| -------------- | -------------------------------------------------- |
| `dilithium5`   | Algoritmo (ML-DSA-87)                              |
| `<pubkey-hex>` | Chiave pubblica ML-DSA-87 di 2592 byte in codifica esadecimale |
| `hybrid`       | Tipo di chiave (hybrid = sia classica che PQC)     |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid` è la forma legacy equivalente per Dilithium-5.)

:::caution Imposta `--gas` esplicitamente
La chiave pubblica ML-DSA-87 è di 2.592 byte, e scriverla on-chain può superare il limite di gas predefinito di 200.000 (le registrazioni sulla mainnet hanno usato da 220.000 a 350.000 di gas). Senza `--gas 600000` (o superiore), la transazione può fallire con un oscuro errore `out of gas`. La commissione deve essere almeno pari al limite di gas moltiplicato per 0,1 uqor, quindi `--gas 600000` richiede `--fees 60000uqor` o più.
:::

Verifica la registrazione:

```bash
qorechaind query pqc account <account-address>
```

Il file della chiave in `~/.qorechaind/pqc/` è la chiave di firma post-quantistica dell'account: fanne un backup come per la mnemonica e, per quanto possibile, tienilo lontano dalla macchina che esegue la chiave di consenso. Vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing#pqc-key-registration) per recupero e rotazione.

---

## Monitoraggio

### Metriche Prometheus

QoreChain espone le metriche Prometheus sulla porta **26660**:

```
http://localhost:26660/metrics
```

Abilita l'endpoint con `prometheus = true` nella sezione `[instrumentation]` di `config.toml`. Il nodo espone le metriche standard del motore di consenso (altezza del blocco, round di consenso, set di validatori, peer, mempool); elenca ciò che serve il tuo nodo con `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'`. Lo stato di salute della firma per singolo validatore si legge in modo più affidabile dalla chain stessa (vedi Controlli di Integrità qui sotto), poiché è il registro della chain a decidere il jailing.

### Interrogare i Parametri di Reputazione

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

Via JSON-RPC:

> **Non ancora servito:** nessuna build di nodo rilasciata serve il namespace JSON-RPC `qor_`, quindi questa chiamata restituisce `-32601` (method not found) su tutti gli endpoint pubblici oggi. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Controlli di Integrità

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Buone Pratiche Operative

1. **Usa un'architettura a nodi sentry.** Esegui il tuo validatore dietro nodi sentry per proteggerlo dagli attacchi DDoS. Esponi alla rete pubblica solo i nodi sentry.

2. **Configura gli avvisi.** Imposta avvisi per blocchi mancati, uptime basso e riavvii imprevisti. Qualche blocco mancato è normale; mancanze prolungate innescheranno lo slashing.

3. **Mantieni un uptime elevato.** Un downtime prolungato fa finire il validatore in jail (meno del 5% degli ultimi 10,000 blocchi firmati) e lo espone allo slashing; vedi [Slashing](#slashing).

4. **Mantieni il software aggiornato.** Segui le release di QoreChain e applica gli aggiornamenti tempestivamente. Coordinati con la community dei validatori per gli upgrade della chain.

5. **Metti al sicuro le tue chiavi.** Usa un modulo di sicurezza hardware (HSM) o un remote signer per la chiave di consenso del validatore. Non conservare mai le chiavi sulla stessa macchina del nodo.

6. **Registra prima una chiave PQC.** L'account operatore ha bisogno di una chiave ML-DSA-87 registrata prima di poter creare un validatore o inviare qualsiasi altra transazione sul lane Cosmos.

7. **Mantieni l'orologio sincronizzato.** Esegui un client NTP; dalla v3.2.1 il nodo si ferma quando il suo orologio è sfasato di più di 60 secondi.

---

## Riferimento dei Comandi per Validatori

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

La soglia minima delle commissioni di rete è di 0,1 uqor per unità di gas. Un account operatore che **non** ha alcuna chiave PQC registrata può ancora inviare `unjail` in modo classico; una volta registrata una chiave, ogni transazione (unjail incluso) richiede la firma ibrida.

---

## Validare le Reti Connesse {#connected-networks}

:::caution Nessuna rete connessa è ancora attiva
Il modulo bridge è distribuito su mainnet e testnet, ma **nessuna route del bridge è attiva**: tutte le 37 configurazioni di chain sono in stato `pending`, nessun validatore del bridge è registrato, non è mai stata creata alcuna operazione di bridge e non esistono canali IBC. Il framework qui sotto descrive il design; oggi non c'è nulla da validare su una rete connessa.
:::

Il design (dalla versione di chain **v3.1.80**) consente a un validatore QoreChain di contribuire anche a validare le reti connesse tramite il [bridge](/architecture/bridge-architecture). È **soggetto a licenza e opt-in**:

1. **Possedere la licenza.** Il validatore deve possedere una licenza `validator_<chain>` (o `qcb_bridge`) attiva per la rete di destinazione. L'orchestratore si rifiuta di avviare un client esterno senza di essa (fail-closed).
2. **L'attivazione effettua il provisioning automatico del client.** Quando la licenza viene attivata, QoreChain effettua il provisioning del client della rete corrispondente sul tuo nodo — scaricando il client con versione bloccata, generandone la configurazione ed eseguendolo sotto l'orchestrazione di QoreChain. Nulla viene scaricato prima dell'attivazione.
3. **Fornire le chiavi e lo stake della rete.** Le chiavi di validazione/stake e di firma della rete esterna sono **fornite dall'operatore** per ciascuna rete; QoreChain fornisce il framework dei driver e il gate di licenza applicato, non il tuo stake sulla chain esterna.

Esistono driver per tutte le **37 reti del bridge**, classificate in base a come un validatore può partecipare:

| Classe | Partecipazione | Esempi |
| ------ | --------------- | ------ |
| Validatore permissionless | Fai staking ed esegui il nodo | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Con tetto / elezione / ammissione | Staking, soggetto a un tetto o a un'elezione | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Full-node L2 | Esegui un full node (senza staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Senza staking / trust-list | Osserva / partecipa senza staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
I pin di versione dei client sono best-effort; verifica la release upstream del client per la tua rete di destinazione prima di un'attivazione in produzione.
:::

## Prossimi Passi

* [Gestire un Nodo](/developer-guide/running-a-node) — Installa il binario di release, state sync e impostazioni del nodo
* [Sviluppo EVM](/developer-guide/evm-development) — Distribuisci smart contract su QoreChain
* [Firma Post-Quantistica](/developer-guide/post-quantum-signing) — Registrazione, recupero e rotazione delle chiavi
