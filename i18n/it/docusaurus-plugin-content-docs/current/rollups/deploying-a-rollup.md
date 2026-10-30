---
slug: /rollups/deploying-a-rollup
title: Distribuire un Rollup
sidebar_label: Distribuire un Rollup
sidebar_position: 3
---

# Distribuire un Rollup

Puoi configurare un rollup specifico per applicazione in tre modi: tramite la **Dashboard** (un modulo di richiesta, non una transazione on-chain), tramite la **CLI** della chain (`qorechaind`, con pieno controllo sulla transazione on-chain), oppure con l'**RDK TypeScript** (`@qorechain/rdk` più lo scaffolder `create-qorechain-rollup`), che copre la configurazione, le letture e, quando gli fornisci una chiave post-quantistica, transazioni firmate in modalità ibrida (vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits)). Questa pagina copre tutti e tre i metodi, oltre al ciclo di vita dell'operatore e ai comandi per i batch.

:::caution Funzionalità in fase iniziale
Nessun rollup è ancora stato creato su nessuna delle due reti (verificato il 30 ottobre 2026). I comandi seguenti usano la testnet **`qorechain-diana`** (EVM chain ID **9800**, versione della chain **v3.2.6**: la v3.2.4 vi è stata applicata il 19 ottobre 2026, la v3.2.5 il 26 ottobre all'altezza 8.890.800 e la v3.2.6 il 27 ottobre all'altezza 8.970.638). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**, attiva dal 7 giugno 2026) esegue la versione della chain **v3.2.5** dal 29 ottobre 2026 (applicata all'altezza 3.906.833 dalla proposta di governance 14; la v3.2.4 era stata applicata all'altezza 3.742.566 il 23 ottobre 2026 dalla proposta 13), quindi ciò che la v3.2.5 cambia per i rollup è contrassegnato con "dalla v3.2.5" e si applica su entrambe le reti (una tabella riepilogativa è nella [Panoramica dei Rollup](/rollups/overview#v325)). Le release precedenti differiscono in alcuni dettagli, che questa pagina indica con "dalla v3.2.4". La testnet è una rete di staging con parametri di modulo propri (ad esempio una finestra di contestazione predefinita di 3.600 secondi contro 604.800 sulla mainnet, e al massimo 200 rollup contro 100); leggi `GET /qorechain/rdk/v1/params` sulla rete di destinazione. Valida sempre ogni distribuzione prima su testnet.
:::

:::note Fee e firma
La rete impone un prezzo minimo del gas di `0.1uqor`, quindi un semplice `--fees 500uqor` viene rifiutato, e ogni transazione sulla lane nativa richiede la co-firma post-quantistica ibrida. Gli esempi di CLI in questa pagina costruiscono quindi la transazione con `--generate-only` e la co-firmano con `qorechaind tx pqc cosign`, che la firma e la trasmette (crea la chiave una volta con `qorechaind tx pqc gen-key` e registrala on-chain una volta con `qorechaind tx pqc register-key`, oppure tramite QoreX o l'SDK, che lo fanno per te). La fee viene fissata quando viene generato il file non firmato, quindi imposta insieme il limite di gas e la fee: la fee deve essere almeno pari al limite di gas × 0,1 uqor. I limiti di gas qui sotto sono indicativi — simula prima di farci affidamento. Vedi [Prima Transazione](/getting-started/first-transaction) e [Firma Post-Quantistica](/developer-guide/post-quantum-signing).
:::

---

## Requisiti

| Requisito | Dettagli |
| ----------- | ------- |
| **Stake minimo** | Almeno 10.000 QOR (`min_stake_for_rollup`); lo stake viene messo in escrow alla creazione del rollup |
| **Burn di creazione** | L'1 % dello stake che fornisci viene bruciato permanentemente alla creazione (una creazione che non può applicare il burn viene rifiutata); il resto resta in escrow e viene restituito quando il rollup viene fermato |
| **Stake di registrazione del layer** | La creazione registra anche il layer del rollup nel modulo multilayer, il che blocca ulteriori **1.000 QOR** (`min_sidechain_stake`) del creatore, restituiti quando il layer viene dismesso allo stop. Se il layer non può essere registrato (saldo troppo basso, oppure è stato raggiunto il limite di 10 sidechain del multilayer) il rollup viene comunque creato ma non ha un layer, quindi i suoi batch non possono essere ancorati |
| **ID del rollup** | Usa da 3 a 64 caratteri: lettere minuscole, cifre, `.`, `_` e `-`, iniziando con una lettera o una cifra. La chain applica questa regola su entrambe le reti dalla v3.2.2 (la CLI la controlla prima di costruire la transazione), quindi un ID non conforme viene rifiutato |
| **Account** | Un account QoreChain finanziato con una chiave post-quantistica registrata, con saldo sufficiente per lo stake, lo stake del layer e le fee di transazione |

Interroga i parametri live del modulo per conoscere lo stake minimo e il tasso di burn correnti prima di distribuire:

```bash
qorechaind query rdk config
```

---

## Distribuire tramite la Dashboard (Tools → Rollups)

La Dashboard offre un modulo **Deploy a Rollup** sotto **Tools → Rollups**. È un **modulo di richiesta**: inviarlo registra una richiesta di provisioning per il tuo account, revisionata da **The Qore Trust**, e una nuova richiesta mostra lo stato **provisioning**. **Non** trasmette una transazione `create-rollup` on-chain — per registrare un rollup on-chain, usa la CLI qui sotto.

### Passaggi

1. **Accedi.** Il modulo richiede una sessione autenticata sia per inviare una richiesta sia per elencare le tue richieste esistenti.
2. **Assegna un nome al rollup.** Inserisci un nome per il rollup (2–41 caratteri: lettere, numeri, spazi, trattini o underscore).
3. **Scegli una macchina virtuale.** Il record on-chain memorizza un'etichetta di VM. Il tuo rollup viene eseguito off-chain nel proprio runtime; la scelta non viene eseguita sulle lane EVM, QoreChain Native o SVM di QoreChain:
   * **EVM** — contratti Solidity / Vyper con toolchain Ethereum completa (Hardhat, Foundry, MetaMask)
   * **QoreChain Native** — smart contract in Rust sul runtime del Cosmos SDK (il runtime CosmWasm), con IBC nativo
   * **SVM** — la Solana Virtual Machine, per applicazioni ad esecuzione parallela e alto throughput
4. **Scegli un layer di disponibilità dei dati.** Dove il tuo rollup pubblica i dati delle transazioni affinché chiunque possa ricostruire lo stato: **QoreChain DA**, **Celestia**, oppure **EigenDA**. Nota che EigenDA è un'opzione a livello di Dashboard, mentre i backend DA on-chain di `x/rdk` sono native, Celestia, o entrambi — vedi [Disponibilità dei Dati](/rollups/data-availability).
5. **Imposta un gas token.** Il token usato per pagare l'esecuzione sul tuo rollup. Il default è **QOR**; inserisci un simbolo personalizzato per usare un tuo token nativo.
6. **Scegli un sequencer.** Chi ordina le transazioni prima del settlement: **Sequencer condiviso** (il set condiviso di QoreChain), **Dedicato (singolo)** (esegui il tuo sequencer singolo) oppure **Decentralizzato** (un set di sequencer permissionless).
7. **Scegli un target di settlement.** Dove il rollup ancora le sue radici di stato e le prove di validità: **mainnet QoreChain** oppure **Ethereum**.
8. **Invia la richiesta.** Il provisioning viene revisionato da **The Qore Trust**, quindi una richiesta appena inviata appare con stato **provisioning** finché la revisione non è completata.

Le richieste che hai inviato compaiono nell'elenco **I tuoi rollup** con la loro VM, layer DA, gas token, sequencer, target di settlement e stato corrente.

:::note
Le opzioni del modulo (macchina virtuale, layer di disponibilità dei dati, gas token, sequencer, target di settlement) descrivono ciò che stai richiedendo; sono più ampie di ciò che il modulo `x/rdk` on-chain supporta attualmente. On-chain, la disponibilità dei dati è `native` (Celestia non è attivo), e il sequencing è eseguito dal creatore del rollup o da un indirizzo di sequencer configurato. Vedi [Disponibilità dei Dati](/rollups/data-availability).
:::

---

## Distribuire tramite la CLI

La CLI crea il rollup direttamente on-chain. `create-rollup` accetta tre argomenti posizionali — l'ID del rollup, un profilo e l'importo dello stake (in `uqor`) — più un flag opzionale `--vm`.

:::tip
A partire dalla versione della chain **v3.1.74**, `create-rollup` **applica automaticamente il preset del profilo scelto** — modalità di settlement, sequencer, DA, modello di gas e VM provengono tutti dal preset. Non è più necessario impostarli a mano (in precedenza il messaggio codificava rigidamente una configurazione sovereign). Il flag `--vm` ora è **vuoto per default**, quindi si applica la VM del profilo a meno che tu non la sovrascriva esplicitamente.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Esempio** — crea un rollup dal preset `defi` (settlement, sequencer, DA e VM provengono tutti dal preset; `defi` si risolve in settlement zk su EVM). Costruisci la transazione non firmata, poi allega la co-firma post-quantistica e trasmetti:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

**Non creare ancora un rollup `defi` (ZK).** La chain accetta la creazione e mette lo stake in escrow, ma non ha alcun modo per registrare una verifying key, quindi ogni batch ZK viene rifiutato dopo che la fee è stata pagata. La registrazione della chiave è prevista per la chain v3.2.7. Per ora scegli un profilo `optimistic` come `nft` o `custom` (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)).

**Flag:**

| Flag | Default | Descrizione |
| ---- | ------- | ----------- |
| `--vm` | *(vuoto — usa la VM del profilo)* | Sovrascrive il tipo di VM del rollup: `evm`, `cosmwasm`, `svm` oppure `custom`. Lascialo non impostato per applicare la VM del preset. (Nei client RDK il runtime Wasm è il tipo di VM **`native`** — QoreChain Native — con `cosmwasm` mantenuto come alias legacy; `cosmwasm` è il valore on-the-wire, che è quello accettato da questo flag a livello di chain.) |

:::note L'etichetta della VM è un metadato
`--vm` registra quale runtime usa il tuo rollup. La chain host si limita a eseguire il settlement del rollup; non ne esegue i contratti. L'upload QoreChain Native della chain host è attualmente chiuso e la sua lane di transazioni SVM è disabilitata su tutta la rete, il che non influisce sul settlement di un rollup off-chain ma significa che non puoi distribuire contratti per un rollup su quelle lane della chain host.
:::

L'argomento `[profile]` seleziona una configurazione preimpostata che viene applicata automaticamente — vedi **[Profili Preset](/rollups/preset-profiles)**. `[stake-amount]` è il bond in `uqor`; il burn di creazione ne è l'1 %.

### Ispeziona ciò che hai distribuito

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Distribuire con l'RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Il Rollup Development Kit è distribuito come due pacchetti npm pubblici per lo stesso modulo on-chain `x/rdk` della CLI. Nessun rollup esiste ancora su nessuna delle due reti, quindi nessun percorso di transazione del kit è stato messo alla prova su un rollup live; leggi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits) prima di affidarti a esso per inviare transazioni:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.7.0`) — l'SDK TypeScript: un config builder con profili preimpostati, helper di transazione per i cicli di vita del rollup e dei batch di settlement, DA nativa, client di lettura tipizzati, ricevute di settlement con una firma ML-DSA-87, il QCAI Rollup Copilot, helper di calldata cross-VM e il watchtower. Dipende da `@qorechain/sdk` `^0.10.0` (dalla 0.7.0; la 0.6.x usava `^0.9.0`) e `@qorechain/evm` `^0.8.0`.
* **`create-qorechain-rollup`** (`v0.7.0`) — uno scaffolder che clona un template di partenza eseguibile per ogni profilo (incluso il template `multivm-rollup`).

Questi sono pubblicati su npm. Il repository distribuisce inoltre una CLI per operatori pubblicata, **`@qorechain/rdk-cli`** (`qorollup`, `v0.7.0`), con i comandi `doctor`, `create`, `status`, `watch`, `params`, `suggest`, ciclo di vita (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` e `faucet`, più i comandi `receipt`, `advise` e `watchtower`. I suoi comandi di transazione firmano solo in modalità classica (vedi i limiti qui sotto).

Novità principali per release:

* **v0.4.2 — funziona con la rete live fin da subito.** I preset `mainnet` e `testnet` ora includono gli endpoint pubblici `qore.host` (REST su `api.qore.host` / `api-testnet.qore.host`), quindi `createRdkClient({ network })` raggiunge la chain senza `endpoints` manuali — sovrascrivili solo per puntare al tuo nodo. La stessa release ha rinominato l'identificatore della VM Wasm del rollup in **`native`** (QoreChain Native); `cosmwasm` resta un alias legacy accettato, ed entrambi corrispondono a `cosmwasm` on-the-wire — la chain, l'explorer e la Dashboard restano invariati.
* **v0.4.3 — aggiornamento di dipendenza per la correzione della codifica della firma ibrida dell'SDK.** Il client di transazione dell'RDK in sé firmava ancora solo in modalità classica.
* **v0.4.4 — segue `@qorechain/sdk` `^0.7.0`**, la release dell'SDK per le lane di autenticatore della chain **v3.1.85**. Nessuna modifica all'API dell'RDK.
* **v0.5.0 (18 ottobre 2026)** — la verifica delle ricevute di settlement controlla rispetto allo stato della chain e non dichiara mai valida una ricevuta in base ai suoi stessi campi; il client di transazione TypeScript firma in modalità ibrida quando gli viene fornito un `pqcKeypair`. Dipende da `@qorechain/sdk` `^0.8.0`.
* **v0.6.0 (release GitHub del 20 ottobre 2026)** — la release di compatibilità per la chain da v3.2.2 a v3.2.4: batch ancorati, ricevute di settlement che possono essere verificate, finestre di contestazione misurate come le misura la chain, un encoder che corrisponde al layout cross-VM della chain, template che firmano in modalità ibrida e `@qorechain/sdk` `^0.9.0`. I dettagli sono qui sotto.
* **v0.6.1 (release GitHub del 25 ottobre 2026)** — una release di correzioni di sicurezza e dei template per la chain dalla v3.2.3 in poi, in tutti e cinque i linguaggi: la verifica delle ricevute di settlement confronta ogni campo che la ricevuta dichiara con l'ancora della chain, i sei template di partenza non inviano più batch che la chain rifiuta (lasciano `dataHash` vuoto) e i template optimistic pubblicano la radice di stato canonica della chain invece di un segnaposto. Mantiene gli intervalli `@qorechain/sdk` `^0.9.0` e `@qorechain/evm` `^0.8.0`. I dettagli sono qui sotto.
* **v0.6.2 (release GitHub del 27 ottobre 2026)**: un hotfix della CLI senza modifiche alle librerie: `qorollup` installato da npm (in locale, globale o con `npx`) funziona di nuovo, e `qorollup --version` e `create-qorechain-rollup --version` stampano le loro versioni reali. Gli altri pacchetti sono stati rilasciati di nuovo come 0.6.2 così che ogni registro resti su un'unica versione.
* **v0.7.0 (release GitHub del 27 ottobre 2026; attuale)**: pronta per la chain v3.2.5 in tutti e cinque i linguaggi (entrambe le reti la eseguono: la mainnet dal 29 ottobre 2026, la testnet dal 26 ottobre), e corregge il modo in cui vengono calcolati gli hash dei prelievi e dei blob di disponibilità dei dati: le prove di prelievo costruite con i valori predefiniti della 0.6.x non venivano mai verificate on-chain, e la 0.7.0 costruisce l'albero esatto della chain. Passa a `@qorechain/sdk` `^0.10.0`, e i template fissano `@qorechain/rdk` `^0.7.0`. I dettagli sono qui sotto.

**Versioni pubblicate (verificate su ogni registro il 27 ottobre 2026).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` e `create-qorechain-rollup`: **0.7.0** (`latest`); PyPI `qorechain-rdk`: 0.7.0; crates.io `qorechain-rdk`: 0.7.0; Maven Central `io.github.qorechain:qorechain-rdk`: 0.7.0 (il suo `maven-metadata.xml` elenca anche la 0.6.2 e la 0.7.0 oltre alle versioni precedenti); modulo Go `github.com/qorechain/qorechain-rdk/packages/go`: `v0.7.0` (tag `packages/go/v0.7.0`; il `@latest` del module proxy può restare indietro rispetto a un nuovo tag, quindi fissa esplicitamente `@v0.7.0`). La release GitHub è [v0.7.0](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0).

#### RDK 0.7.0: modifiche e limiti {#rdk-050-limits}

Questa sezione indica cosa fanno i pacchetti 0.7.0 pubblicati (e cosa hanno cambiato prima di essi la 0.6.2, la 0.6.1 e la 0.6.0), verificato rispetto al contenuto dei pacchetti e alle note di release su GitHub, e cosa ancora non possono fare. Nessuna di queste voci è un comportamento della chain. Dove un'affermazione dice "non testato live", nessun rollup esiste su nessuna delle due reti, quindi il percorso è stato verificato solo rispetto al codice e offline.

**Cosa è cambiato nella 0.7.0** (tutti e cinque i linguaggi, salvo diversa indicazione di una riga; le [note di release](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0) contengono l'elenco completo). Il comportamento che appartiene alla chain v3.2.5 è etichettato con la sua rete: **entrambe le reti eseguono la v3.2.5 o successiva (la mainnet dal 29 ottobre 2026, la testnet esegue la v3.2.6)**.

* **Le prove di prelievo vengono verificate on-chain.** Gli helper Merkle e dei prelievi usavano SHA-256 per default e ricalcolavano l'hash di ogni foglia, mentre la chain calcola l'hash dei nodi con SHAKE-256 e costruisce le sue foglie dal prelievo stesso, quindi una prova costruita con i valori predefiniti della 0.6.x non veniva mai verificata. `withdrawalsTree` ora costruisce la radice dei prelievi di un batch e ogni prova esattamente come fa la chain (la posizione della foglia è l'indice del prelievo): con foglie di prima forma, oppure con foglie di seconda forma che nominano anche il chain id, che la chain usa per i batch dalla v3.2.5 (entrambe le reti). `withdrawalLeafV1` e `withdrawalLeafV2` costruiscono una foglia, `assembleWithdrawalProof` costruisce per default l'albero della chain, e gli helper Merkle generici usano SHAKE-256 per default. Questa è una modifica incompatibile per il codice che si affidava ai valori predefiniti SHA-256 (passa `hash` esplicitamente per mantenerli). I nuovi formati di byte sono stati testati con vettori prodotti dal codice della chain stessa, e ogni prova di prelievo in quei vettori è accettata dal verificatore della chain. Vedi [Codifica di foglie e nodi](/rollups/zk-stark-withdrawals#leaf-and-node-encoding).
* **`qorollup withdraw` controlla prima di pagare.** Accetta i prelievi del batch (`qorollup withdraw --file withdrawal.json [--dry-run]`), costruisce la prova con il binding del batch stesso e rifiuta, prima di pagare una fee, quando il risultato non è la `withdrawals_root` on-chain del batch.
* **`buildDaBlob` si impegna come fa la chain.** Il suo commitment è SHAKE-256, non SHA-256 (nessuna transazione pubblica un blob, quindi `dataHash` resta vuoto).
* **Watchtower.** Il Watchtower distingueva i batch solo per indice, quindi non vedeva un batch rinviato a un indice rifiutato. Dalla chain v3.2.5 (entrambe le reti) una frode accertata rifiuta il batch e ogni batch successivo non ancora finalizzato, e il sequencer li rinvia con gli stessi indici; il Watchtower ora distingue i batch per indice e radice di stato e non convalida mai un batch rifiutato. Nuovi helper `transitionRootValidator` (un predicato `validate` che applica la regola di frode della chain) e `fraudProofForBatch` (la prova che vince, oppure nessuna per un batch onesto), e `qorollup watchtower --canonical`, che riporta i batch che una contestazione vincerebbe.
* **Helper di settlement per la chain v3.2.5** (entrambe le reti): `getRollupHealth` riporta `heldBackBy` quando l'ultimo batch potrebbe finalizzarsi con la propria finestra ma un batch precedente è ancora submitted o challenged (i batch si finalizzano in ordine), e `qorollup status` lo stampa; `stopRollupError` e un controllo preliminare in `stopRollup` (TypeScript e Rust), perché un rollup il cui ultimo batch è submitted o challenged non può essere fermato; `MAX_PENDING_OPTIMISTIC_BATCHES` (4.096); `withdrawalsRootError` (una withdrawals root è vuota oppure esattamente di 32 byte), controllato prima di ogni invio di batch in tutti e cinque i linguaggi.
* **Helper cross-VM per la chain v3.2.5** (entrambe le reti): `getCrossVmParams` (l'allowlist, in `/qorechain/crossvm/v1/params`), `crossVmTargetReady` (precompile attiva, bridge abilitato e destinazione nell'allowlist, con il motivo del blocco), `decodeCrossVmResult` (la risposta è `abi.encode(bytes)`) e `decodeRevertReason` (un rifiuto è `Error(string)`), verificati rispetto a codifiche prodotte da Solidity. Vedi [Multi-VM](/rollups/multi-vm).
* **Decodifica degli errori e piccole aggiunte.** `decodeRdkTxError` e `RDK_ERRORS` nominano i codici di errore del modulo `rdk` (da 2 a 36) e cosa fare per quelli che un operatore incontra; `qorehash` (SHAKE-256, 32 byte) è esportato in tutti e cinque i linguaggi; `FEATURE_RDK_CHALLENGE_SETTLEMENT` nomina il feature flag della chain.
* **Il template `defi` si ferma prima di sprecare una fee.** Nessuna release della chain fino alla v3.2.5 può registrare una verifying key ZK, quindi ogni batch ZK viene rifiutato. Il template ora si ferma prima di inviare, e `RollupView.hasVerificationKey` legge il campo che la chain v3.2.7 dovrebbe aggiungere.
* **Dipendenze.** `@qorechain/sdk` `^0.10.0` (era `^0.9.0`), quindi un'applicazione con l'SDK 0.10.0 ora condivide con il kit un'unica copia dell'SDK; i template fissano `@qorechain/rdk` `^0.7.0`.

**Cosa è cambiato nella 0.6.2** (solo la CLI e lo scaffolder; i pacchetti della libreria sono invariati):

* **`qorollup` funziona quando è installato da npm.** La CLI si avviava solo quando `process.argv[1]` era uguale al percorso del suo stesso file, ma npm avvia il bin di un pacchetto tramite un symlink in `node_modules/.bin`, quindi la 0.6.1 e le precedenti, installate in locale, globalmente o eseguite con `npx`, terminavano con codice 0 senza stampare nulla; funzionava solo `node .../dist/index.js`. La 0.6.2 confronta i percorsi reali. Dopo `npm i -g @qorechain/rdk-cli`, `qorollup ...` funziona.
* **Le versioni vengono stampate correttamente.** `qorollup --version` stampava `0.4.1` e `create-qorechain-rollup --version` stampava `0.2.0` nelle release precedenti; ora entrambi leggono il proprio `package.json` (verificato il 27 ottobre 2026: `qorollup --version` stampa `0.6.2`).

**Cosa è cambiato nella 0.6.1** (tutti e cinque i linguaggi, salvo diversa indicazione di una riga; le [note di release](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1) contengono l'elenco completo):

* **La verifica delle ricevute confronta ogni campo.** `verifySettlementReceipt` ora richiede che ogni campo di ancora dichiarato dalla ricevuta sia uguale all'ancora della chain (una discrepanza nomina il campo), richiede che `batchStateRoot` sia uguale alla radice del batch della chain e rifiuta una ricevuta con una `version` sconosciuta o un `algorithm` diverso da `ML-DSA-87` prima di leggere qualsiasi cosa dalla chain. Il risultato reca l'`anchor` corrispondente della chain e, quando valido, una `verifiedReceipt` ricostruita dallo stato della chain; `qorollup receipt verify --json` restituisce quella ricevuta letta dalla chain come `receipt`. Vedi [Ricevute di settlement](/rollups/settlement-receipts#what-060-verifies).
* **Disponibilità dei dati nativa: lascia `dataHash` vuoto.** Ogni profilo di rollup usa la disponibilità dei dati `native`, dove la chain accetta un `data_hash` non vuoto solo quando sulla chain è memorizzato un blob corrispondente, e nessuna transazione può memorizzarne uno (vedi [Disponibilità dei Dati](/rollups/data-availability)). Nella 0.6.0 e precedenti i sei template di partenza mettevano un data hash sui loro batch, quindi la chain rifiutava ogni batch dei template dopo che la commissione era stata pagata. Ora lo lasciano vuoto; `SubmitBatchInput.dataHash` è facoltativo in TypeScript (omesso significa vuoto), `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) espone la regola, e `RdkTxClient.submitBatch` rifiuta un simile batch prima di trasmetterlo quando può leggere il rollup (un client ibrido con un endpoint REST).
* **I template optimistic pubblicano la radice di stato canonica.** La chain giudica un batch optimistic in base alla sua radice di transizione canonica, un commitment SHAKE-256 della radice di stato precedente del batch, del data hash e del conteggio delle transazioni (`batchTransitionRoot` nell'RDK, con `transitionRootVersionFor` che sceglie il binding applicato dalla rete connessa). I template `custom`, `multivm` e `nft` inviavano una radice segnaposto fissa, che non corrisponde alla radice canonica verificata dalla chain; ora pubblicano la radice canonica e non inviano più una prova segnaposto. Il `challenge.ts` del template `nft` legge il batch dalla chain e contesta solo un batch la cui radice è dimostrabilmente errata. Non reimplementare la formula a mano: usa `batchTransitionRoot` così che il binding corrisponda alla rete a cui invii. Il controllo della chain è lo stesso per ogni client, quindi un batch optimistic la cui radice di stato non è la radice canonica può essere contestato con successo, qualunque client lo abbia inviato.
* **Nuovi helper.** `fraudProof`, `transitionRootVersionForBatch`, `receiptSchemaError` con `SUPPORTED_RECEIPT_VERSIONS`, `RestClient.getProtocolFeatures` / `isProtocolFeatureEnabled` (una chain senza la route risulta "non abilitata") e `getAppliedPlanHeight`. `@qorechain/rdk` ora dipende direttamente da `@noble/hashes` (SHAKE-256 per la radice di transizione; era già installato tramite `@qorechain/sdk`). I template fissano `@qorechain/rdk` `^0.6.1`.

**Cosa è cambiato nella 0.6.0** (TypeScript, salvo diversa indicazione di una riga):

* **Firma.** `RdkClient.connectTx(signer, { pqcKeypair, rest })` firma in modalità ibrida (secp256k1 + ML-DSA-87) quando gli passi un keypair; senza di esso firma solo in modalità classica e le reti rifiutano la transazione. `signer` deve essere un `OfflineDirectSigner`, e la fee deve essere esplicita (un `fee`, oppure un `gasPrice` alla connessione). I nuovi helper `resolvePqcKeypair` e `pqcKeypairFromEnv` derivano sia la chiave ML-DSA-87 canonica sia quella legacy da una mnemonic e usano quella che l'account ha registrato on-chain; si rifiutano di procedere, invece di tirare a indovinare, quando l'account detiene una chiave diversa. `QORE_PQC_SEED_HEX` fornisce un seed a un operatore che firma con una chiave privata grezza. Il kit ora dipende da `@qorechain/sdk` `^0.9.0`, quindi un'installazione nuova contiene una sola copia dell'SDK (0.9.0); con la 0.5.0, npm installava l'SDK 0.8.3 annidato sotto il kit.
* **Batch ancorati.** `MsgSubmitBatch` reca `anchor_signature` e `validator_set_hash`. `RdkTxClient.submitBatch` firma l'ancora da sé solo quando il client firma in modalità ibrida, ha un endpoint REST e **è il creatore del rollup** (la chain verifica l'ancora rispetto alla chiave registrata del creatore); in ogni altro caso invia senza ancora, come prima. Passa `anchor: "require"` per rifiutare invece di inviare senza ancora, `anchor: "off"` per non firmare mai, oppure `anchorSignature` per inviare una firma che hai ottenuto tu stesso. `anchorSignBytesForBatch` costruisce i byte v2 per un creatore che firma fuori banda, cosa di cui ha bisogno un rollup con un sequencer separato. Non testato live.
* **Ricevute di settlement.** La ricerca dell'account PQC usa la route al singolare `/qorechain/pqc/v1/account/{address}` (la 0.5.0 usava un percorso al plurale che le reti non servono). La verifica supporta entrambe le forme dei sign-bytes dell'ancora e ne sceglie una in base all'altezza dell'ancora, mai provandole entrambe: v1 sotto lo switch della v3.2.2, v2 da esso in poi. Lo schema di ricevuta v2 registra `chainId`; la verifica rifiuta una ricevuta controllata rispetto a un nodo di un'altra chain, e riporta `signBytesVersion` e un controllo `chainBinding`. Le ricevute di versione 1 si verificano ancora. Vedi [Ricevute di settlement](/rollups/settlement-receipts).
* **Letture.** `getLatestBatch` chiama `/qorechain/rdk/v1/latest_batch/{rollup_id}` (la 0.5.0 chiamava una forma che la chain non serve), e `listBatches` segue ogni pagina (`listBatchesPage` ne legge una). `RollupView` reca `escrowBalance` e, dove il nodo li riporta, `challengeWindowSec`, `challengeBond` e `proofSystem`; `BatchView` reca `submittedTime`.
* **Finestre di contestazione.** `batchChallengeWindow` calcola la finestra di un batch come fa la chain e la valuta rispetto alla punta della chain (`getChainTip`), non rispetto all'orologio locale: secondi di tempo di blocco per un batch che ha un orario di invio registrato (la regola della v3.2.4: la testnet dall'altezza 8.337.253, la mainnet dall'altezza 3.742.566), `window / 6` blocchi contati dall'altezza di invio altrimenti (la regola per i batch inviati prima dell'altezza dell'upgrade). Il controllo di salute alla base di `qorollup status` e il watchtower lo usano (vedi [Watchtower](/rollups/watchtower)).
* **Cross-VM.** `encodeCrossVmCalldata` ora codifica `executeCrossVMCall(uint8,string,bytes)`, il layout che il nodo decodifica, e accetta un `targetVm`. `isCrossVmPrecompileActive` legge l'elenco live delle precompile attive (vedi [Multi-VM](/rollups/multi-vm)).
* **Regole verificate prima di pagare una fee.** `rollupIdError` controlla la grammatica dell'id quando validi una configurazione e prima che `createRollup` trasmetta; `withdrawalErrors` controlla un prelievo prima che `executeWithdrawal` trasmetta.
* **Template.** I template generati dallo scaffolder si connettono tramite `pqcKeypairFromEnv`, quindi i loro script `create` e `submit-batch` firmano in modalità ibrida, e dipendevano da `@qorechain/rdk` `^0.6.0` (`^0.6.1` dallo scaffolder 0.6.1). Il template `multivm-rollup` verifica che la precompile sia attiva e richiede una risposta non vuota dalla destinazione.
* **Python, Go, Rust e Java.** Le correzioni lato lettura qui sopra (route PQC al singolare, `latest_batch`, sign bytes dell'ancora v2, regole della finestra di contestazione, controlli su id e prelievi) sono presenti anche nei pacchetti pubblicati degli altri quattro linguaggi.
* **Modifiche incompatibili.** `encodeCrossVmCalldata` accetta `targetVm`, e `CROSS_VM_DEFAULT_SIGNATURE` è cambiato. `RollupHealth` e `BatchDeadline` recano una `challengeWindow` invece della vecchia scadenza in secondi.

**Limiti che restano nella 0.7.0:**

* **Il settlement ZK non può ancora essere usato su nessuna delle due reti.** Sono interessati il profilo `defi`, il template `defi-rollup` e ogni rollup creato con settlement `zk`: la chain non ha ancora alcun modo per registrare una verifying key per un rollup, quindi ogni batch ZK viene rifiutato dopo che la fee è stata pagata. La registrazione della chiave è prevista per la chain v3.2.7. Fino ad allora usa il settlement `optimistic` (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)).
* **Il circuito demo del template `defi` non può essere verificato.** È un circuito moltiplicatore `snarkjs`, mentre la chain verifica Groth16 su BLS12-381 con tre input pubblici (la radice di stato precedente, la nuova radice di stato e il data hash). Anche quando esisterà la registrazione della chiave, una prova del circuito demo non passerebbe; sostituisci il circuito con il tuo circuito di transizione di stato.
* **Corretto nella 0.7.0: gli helper Merkle per i prelievi.** Nella 0.6.2 e precedenti gli helper usavano SHA-256 per default e una prova costruita con i valori predefiniti non veniva mai verificata on-chain; usa `withdrawalsTree` / `assembleWithdrawalProof` dalla 0.7.0 (vedi [Codifica di foglie e nodi](/rollups/zk-stark-withdrawals#leaf-and-node-encoding)).

* **Solo il client TypeScript firma in modalità ibrida.** La CLI `qorollup` (i suoi comandi `create`, `pause`, `resume`, `stop` e `withdraw` si connettono senza una chiave post-quantistica) e i client **Python, Go, Rust e Java** firmano solo in modalità classica, cosa che entrambe le reti rifiutano sulla lane nativa; i loro README lo dicono ancora. I loro builder di messaggi non hanno il campo `anchor_signature` né `validator_set_hash`. Per le transazioni da questi, costruisci e firma con la CLI della chain (`--generate-only`, poi `qorechaind tx pqc cosign`) oppure usa il client TypeScript con un `pqcKeypair`.
* **Nessuna creazione ibrida di un rollup è stata messa alla prova live,** perché non esiste alcun rollup su nessuna delle due reti. Lo stesso vale per i batch ancorati, i prelievi e l'intero flusso delle ricevute.
* **L'ancoraggio richiede il creatore.** Un batch è ancorato nella stessa transazione solo se in essa c'è la firma del creatore. Se il sequencer è un altro indirizzo, il creatore deve firmare i byte v2 fuori banda e il sequencer invia il risultato.
* **La precompile cross-VM a `0x…0901` non è ancora attiva su nessuna delle due reti**, quindi una chiamata da un contratto non fa nulla sulla mainnet e non è ancora utilizzabile nemmeno sulla testnet (vedi [Multi-VM](/rollups/multi-vm)).
* **Lunghezza della finestra di contestazione.** Il kit legge la finestra propria di un rollup solo quando il nodo la riporta (il pacchetto lo documenta come v3.2.4 e successive, che eseguono entrambe le reti). Altrimenti usa la finestra predefinita del modulo; passa `challengeWindowSecs` per un rollup che ha configurato la propria. I vecchi helper `challengeWindowDeadline` e `isChallengeWindowClosed` sono ancora esportati e accettano ancora secondi, quindi non passare loro un'altezza di blocco.
* **Disponibilità dei dati.** Nessuna transazione pubblica un blob, quindi un batch su un rollup `native` o `both` deve lasciare `dataHash` vuoto (vedi [Disponibilità dei Dati](/rollups/data-availability)). `buildDaBlob` calcolava l'hash con SHA-256 nella 0.6.2 e precedenti; dalla 0.7.0 il suo commitment è lo SHAKE-256 della chain.

**Versioni precedenti alla 0.7.0.** La 0.6.2 e le precedenti costruiscono prove di prelievo che non vengono mai verificate on-chain e calcolano l'hash di `buildDaBlob` con SHA-256; usa la 0.7.0. La 0.6.1 e le precedenti installavano la CLI `qorollup` da npm in uno stato in cui non stampava nulla e terminava con 0 (corretto nella 0.6.2). La 0.6.0 confronta meno campi nella verifica delle ricevute rispetto alla 0.6.1 e distribuisce template che inviano batch che la chain rifiuta (un data hash su un rollup con DA nativa, una radice di stato segnaposto su quelli optimistic). La 0.5.0 e le precedenti non dovrebbero essere usate per le ricevute di settlement, il watchtower o i calldata cross-VM: la 0.5.0 cercava la chiave del creatore su una route che le reti non servono (quindi la verifica delle ricevute falliva in modo chiuso su ogni ricevuta genuina), ricostruiva solo il messaggio dell'ancora v1, leggeva un'altezza di blocco come un timestamp (ogni età del batch e ogni scadenza di contestazione erano errate, e il watchtower sollevava subito il suo avviso di scadenza per ogni batch), chiamava una route di ultimo batch che la chain non serve, leggeva solo i primi 50 batch, codificava una funzione che la precompile non decodifica e distribuiva template che firmavano solo in modalità classica. La 0.4.x non aveva firma ibrida nel client di transazione.

#### Client Python, Go, Rust e Java

Accanto al pacchetto TypeScript, l'RDK fornisce client completi **Python**, **Go**, **Rust** e **Java** che rispecchiano la superficie TypeScript: il config builder con validazione, i cinque profili preimpostati, utility per denom/economics/bech32, helper per Merkle binari e prove di prelievo, manifest dei rollup, client di lettura REST e JSON-RPC `qor_`, controlli preflight/health, account (mnemonic → indirizzo `qor`) e firma + trasmissione di transazioni classiche (`SIGN_MODE_DIRECT`, non accettata sulle reti a firma ibrida — vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits)). Tutti sono verificati rispetto a golden vector condivisi tra linguaggi e sono **pubblicati** sui rispettivi registri:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.7.0
```

```python
import qorrdk
```

Versioni attualmente pubblicate, tutte **0.7.0** (verificate il 27 ottobre 2026): Python `qorechain-rdk` (PyPI, import `qorrdk`), modulo Go `github.com/qorechain/qorechain-rdk/packages/go` (`v0.7.0`), Rust `qorechain-rdk` (crates.io) e Java `io.github.qorechain:qorechain-rdk` (Maven Central). Questi client leggono lo stato della chain; continuano a non produrre la firma ibrida richiesta dalle reti, e i loro builder di messaggi non hanno campi di ancora (vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits)).

:::note
L'RDK TypeScript e i suoi template usano per default la testnet **`qorechain-diana`**, e i preset raggiungono fin da subito gli endpoint pubblici live. Fissa le versioni e valida su testnet prima della mainnet.
:::

### Scaffolda un progetto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Ogni profilo ha un template di partenza corrispondente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Scaffoldane uno con una delle due forme:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Per l'uso non interattivo / CI, passa esplicitamente il template e la rete:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Lo scaffolder stampa il costo documentato di stake e burn di creazione e i prossimi passi per creare il tuo rollup e leggerne lo stato.

:::caution Cosa possono fare gli script generati
I template di `create-qorechain-rollup` 0.7.0 dipendono da `@qorechain/rdk` `^0.7.0`. I loro script `create` e `submit-batch` si connettono tramite `connectOperator()` in `src/signer.ts`, che risolve la tua chiave post-quantistica da `QORE_MNEMONIC` (oppure da `QORE_PQC_SEED_HEX` quando firmi con `QORE_OPERATOR_PRIVATE_KEY_HEX`), la verifica rispetto alla chain e firma in modalità ibrida; se nessuna delle due è impostata lo script avvisa e firma solo in modalità classica, cosa che entrambe le reti rifiutano. Nessun rollup è stato creato tramite un template su una rete live, quindi questo percorso è non testato live. Lo script `submit-batch` dello starter è solo un flusso di riferimento: dalla 0.6.1 lascia `dataHash` vuoto (la chain rifiuta un data hash su un rollup con DA nativa), e i template optimistic pubblicano la radice di stato canonica invece di un segnaposto; usa ancora valori illustrativi per il resto, e non è previsto che finalizzi un batch su una rete live. Il template `defi-rollup` (ZK) dalla 0.7.0 si ferma prima di inviare un batch, perché la chain lo rifiuterebbe (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)).
:::

### Costruisci una configurazione di rollup da codice

Costruisci una configurazione da un preset, leggi dalla chain lo stake e il tasso di burn live e produci il messaggio di creazione. Il config builder applica la matrice di compatibilità settlement → prova in `validate()` / `build()`. Invia i valori risultanti con la CLI qui sopra, oppure con il client TypeScript a cui è stato dato un `pqcKeypair` — vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Non sai quale profilo sia adatto? `rdk.suggestProfile(...)` dovrebbe restituire una raccomandazione assistita dal QCAI; sugli attuali endpoint pubblici restituisce sempre il fallback `defi` (`source: "fallback"`), quindi scegli dalla [tabella dei profili](/rollups/preset-profiles).

### Leggi lo stato da codice

Il client REST tipizzato non richiede alcun firmatario e legge entrambe le reti:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Per i batch, usa `rdk.rest.getBatch(rollupId, index)` oppure `qorechaind query rdk batch [rollup-id]` (qui sotto); `getLatestBatch` e `listBatches` leggono dalla 0.6.0 la route `latest_batch` della chain e ogni pagina dell'elenco dei batch (vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits)).

---

## Gestione del ciclo di vita

Un rollup attraversa gli stati `pending`, `active`, `paused` e `stopped`; un nuovo rollup parte subito `active`. Solo il creatore può metterlo in pausa, riprenderlo o fermarlo (applicato dalla versione della chain v3.2.0). Ogni comando qui sotto segue lo stesso schema in due passaggi della creazione: genera la transazione non firmata, poi co-firmala.

### Pausa

Sospende temporaneamente il rollup. Lo stato viene preservato e il rollup può essere ripreso. È richiesta una stringa con il motivo.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Ripresa

Riprende un rollup precedentemente messo in pausa.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Arresto

Dismette permanentemente il rollup e rilascia il suo stake. I QOR messi in stake — meno il burn di creazione una tantum, e meno qualsiasi importo già pagato dall'escrow del rollup tramite prelievi o ricompense per prove di frode — vengono restituiti al creatore: dalla v3.2.3 un registro di escrow per rollup tiene traccia di ciò che ogni rollup detiene ancora, `stop-rollup` rimborsa esattamente quel saldo, e un rollup fermato non paga più alcun prelievo. Lo stake di registrazione del layer di 1.000 QOR viene restituito separatamente quando il layer del rollup viene dismesso.

**Dalla chain v3.2.5 (entrambe le reti):** un rollup non può essere fermato mentre il suo ultimo batch è `submitted` o `challenged`, quindi prima va risolto o finalizzato; un rollup fermato libera il suo posto sotto il limite di rollup del modulo. Prima della v3.2.5 nessuna delle due regole si applicava. Da TypeScript, `stopRollupError` e il controllo preliminare in `stopRollup` ti avvisano prima che tu paghi la fee.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
L'arresto di un rollup è permanente. Il rollup non può essere riavviato dopo essere stato fermato.
:::

---

## Comandi operatore: batch e contestazioni

Gli operatori dei rollup inviano batch di settlement, e i challenger possono contestare i batch ottimistici. Questi comandi sono alla base del layer di settlement descritto in **[Panoramica dei Rollup](/rollups/overview)** e **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)**.

### Chi può inviare, e in quale ordine

* **Solo l'indirizzo di sequencer configurato del rollup — oppure, quando non ne è configurato nessuno (ogni preset), il suo creatore — può inviare batch.** Il sequencing based e condiviso non ammette ancora set di proposer né roster: oggi sono etichette, e invia il creatore.
* I batch formano una catena: il primo batch ha indice `0`; ogni batch successivo deve usare l'indice seguente e portare la radice di stato del batch precedente come `prev_state_root`.
* Un batch che porta un data hash su un rollup `native` o `both` viene rifiutato a meno che non sia già memorizzato un blob corrispondente (vedi [Disponibilità dei Dati](/rollups/data-availability)). Un batch senza data hash non viene controllato.
* Un rollup `zk` deve allegare una prova, e la prova deve essere verificata; nessun batch ZK può ancora essere accettato (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)).
* **Dalla chain v3.2.5 (entrambe le reti):** la `withdrawals_root` di un batch deve essere vuota oppure di esattamente 32 byte, e un rollup detiene al massimo 4.096 batch optimistic in sospeso (`MAX_PENDING_OPTIMISTIC_BATCHES` nell'RDK); inoltre i batch si finalizzano in ordine di indice, quindi un batch successivo attende uno precedente ancora `submitted` o `challenged`. L'RDK controlla la lunghezza della radice prima di ogni invio. Prima della v3.2.5 nessuna di queste tre regole si applicava.

### Invia un batch {#submit-a-batch}

Invia un batch di settlement per un rollup. Accetta l'ID del rollup, un indice di batch e una radice di stato codificata in esadecimale. Per ogni batch dopo il primo, passa la radice di stato del batch precedente come `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descrizione |
| ---- | ----------- |
| `--prev-state-root` | Radice di stato in esadecimale da cui parte il batch (obbligatoria per ogni batch dopo l'indice `0`) |
| `--tx-count` | Numero di transazioni del rollup nel batch |
| `--data-hash` | Hash in esadecimale dei dati del batch pubblicati come blob DA (lascialo vuoto oggi: non esiste un modo per pubblicare un blob, vedi [Disponibilità dei Dati](/rollups/data-availability)) |
| `--withdrawals-root` | Radice di Merkle in esadecimale dei prelievi L2 → L1 del batch (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Firma ML-DSA-87 in esadecimale del **creatore** del rollup sui byte di firma dell'ancora v2 (dalla v3.2.2); il batch viene poi ancorato in `x/multilayer` nella stessa transazione, e un'ancora rifiutata rifiuta il batch |
| `--validator-set-hash` | Commitment in esadecimale del set di validatori, incluso nell'ancora e coperto dalla firma |

Senza `--anchor-signature` il batch viene regolato **non ancorato**. Per ancorare un batch, stampa i byte da firmare, firmali con la chiave post-quantistica registrata del creatore e passa la firma (i valori `--tx-count` e `--validator-set-hash` devono corrispondere a quelli che invii):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` è l'ID del layer del rollup (l'ID del rollup per i rollup creati dall'RDK). Da TypeScript, `RdkTxClient.submitBatch` in `@qorechain/rdk` 0.6.0 e successive firma l'ancora per te quando il client firma in modalità ibrida ed è il creatore del rollup, e `anchorSignBytesForBatch` fornisce a un creatore i byte da firmare fuori banda (vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits)). Il `--proof` ZK per un rollup `zk` oggi non ha alcun flag della CLI, e il messaggio resolve-challenge non è un comando CLI: usa un client. Vedi [Ricevute di settlement](/rollups/settlement-receipts) per ciò che un'ancora dimostra e ciò che non dimostra. Nessun rollup, layer o ancora esiste ancora su nessuna delle due reti.

### Contesta un batch (rollup ottimistici) {#challenge-a-batch-optimistic-rollups}

Qualsiasi account può contestare un batch `submitted` entro la finestra di contestazione (100.800 blocchi per default per un batch inviato sulla mainnet prima dell'altezza 3.742.566; dalla v3.2.4, una finestra in secondi di block time per i nuovi batch: sulla testnet dall'altezza 8.337.253, sulla mainnet dall'altezza 3.742.566) depositando un bond (il `challenge_bond` del rollup; 1.000 QOR per i preset `nft` e `custom`) e una prova di frode. Un batch optimistic è giudicato in base al fatto che la sua radice di stato sia la radice di transizione canonica, quindi chi invia dovrebbe pubblicare esattamente quella radice (i template RDK lo fanno, dalla 0.6.1; vedi [RDK 0.7.0: modifiche e limiti](#rdk-050-limits)). Accetta l'ID del rollup e l'indice del batch; passa la prova di frode con `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descrizione |
| ---- | ----------- |
| `--proof` | Prova di frode codificata in esadecimale |

Una contestazione **congela** il batch (`challenged`): non può essere finalizzato. Prima della v3.2.5 solo il creatore del rollup poteva risolverla; dalla v3.2.5 (entrambe le reti) può farlo **qualsiasi account**, come descritto sotto. La risoluzione si invia con un messaggio resolve-challenge (non esposto come comando CLI; usa un client). La chain decide da sé l'esito verificando la prova memorizzata. Se la frode viene accertata, il batch è `rejected`, il bond viene restituito e al challenger viene pagato un importo aggiuntivo pari al bond prelevato dallo stake del rollup; se la contestazione viene respinta, il bond va al creatore e il batch torna a `submitted`.

**Dalla chain v3.2.5 (entrambe le reti):** **qualsiasi account** può risolvere una contestazione, non solo il creatore. Una frode accertata rifiuta quel batch **e ogni batch successivo non ancora finalizzato**, e il sequencer rinvia quei batch dall'ultima radice di stato valida con gli stessi indici; il rollup prosegue da lì. Il Watchtower distingue tali batch per indice e radice di stato (vedi [Watchtower](/rollups/watchtower)).

### Ispeziona i batch

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Interrogazioni

| Comando | Scopo |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Dettagli di un rollup specifico |
| `qorechaind query rdk list-rollups` | Tutti i rollup registrati |
| `qorechaind query rdk batch [rollup-id]` | Ultimo batch di settlement (o `--index`) |
| `qorechaind query rdk batches [rollup-id]` | Una pagina di batch in ordine di indice (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | I byte di firma dell'ancora v2 per un batch (offline) |
| `qorechaind query rdk config` | Parametri del modulo RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Stampa un rimando all'RPC `qor_suggestRollupProfile`; gli endpoint pubblici non lo servono, quindi scegli un profilo dalla tabella dei [Profili Preset](/rollups/preset-profiles) |

---

## Prossimi passi

* **[Disponibilità dei Dati](/rollups/data-availability)** — backend DA native, Celestia e ridondante.
* **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)** — verifica delle prove e flusso di prelievo L2 → L1 tramite `execute-withdrawal`.
