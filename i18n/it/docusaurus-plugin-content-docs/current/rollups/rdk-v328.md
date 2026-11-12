---
slug: /rollups/rdk-v328
title: "L'RDK sulla v3.2.8: cosa è cambiato"
sidebar_label: RDK sulla v3.2.8
sidebar_position: 11
---

# L'RDK sulla v3.2.8: cosa è cambiato

La release v3.2.8 di QoreChain cambia il modo in cui i rollup si regolano (settle). I rollup possono ora mettere i propri dati sulla chain, lasciare che sia la chain a ordinare le loro transazioni (based sequencing), regolarsi in modo optimistic con una fraud proof che riesegue il batch, mantenere privati i propri post per un insieme di membri e vincolare le root di prelievo Groth16 in un modo che accetta qualsiasi root di 32 byte. Il settlement STARK è in pausa fino a una release successiva. Questa pagina descrive cosa fa ciascuna modifica e come usarla. È rivolta agli operatori di rollup e agli sviluppatori che costruiscono sul modulo `x/rdk`.

:::caution Per ora solo testnet

La v3.2.8 gira sulla testnet pubblica `qorechain-diana` dal 12 novembre 2026. La mainnet non l'ha ancora applicata, quindi ogni funzionalità di questa pagina vi viene rifiutata finché non lo farà. Considera gli esempi come esempi per la testnet.

:::

:::note Quali strumenti possono farlo oggi

* **Riga di comando del nodo (`qorechaind`)**: ogni messaggio di questa pagina ha un comando. È il binario del nodo Linux; non esiste un binario macOS pacchettizzato, quindi su un Mac eseguilo su un host Linux oppure leggi la chain tramite REST.
* **Kit RDK**: l'RDK 0.9.0 supporta la v3.2.8. È pubblicato su ogni registry: npm (`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI (`qorechain-rdk`), crates.io (`qorechain-rdk`), Maven (`io.github.qorechain:qorechain-rdk`) e Go (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). Note di rilascio: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **Client RDK Python, Go, Rust e Java**: la versione 0.9.0 di ciascuno supporta la v3.2.8. L'esecuzione end to end qui sotto ha usato il client TypeScript.

:::

## Cosa è cambiato in breve {#at-a-glance}

| Area | Comportamento dalla v3.2.8 |
| --- | --- |
| Pubblicazione dei dati | `MsgPostRollupData` mette un payload in una transazione e conserva sulla chain un impegno (commitment) sotto la prossima sequenza di inbox del rollup. |
| Based sequencing | La chain ordina le transazioni di un rollup in base alla loro inclusione. Si imposta alla creazione o tramite governance con `MsgSetRollupSequencing`. |
| Rollup optimistic | I nuovi rollup optimistic (`nft`, `custom`) usano il modello di esecuzione `qledger-v1` e devono essere based. Una fraud proof riesegue il batch. |
| Bond del submitter | I batch su un rollup `qledger-v1` richiedono un bond (`MsgBondRollupSubmitter`). Una fraud proof accolta brucia metà del bond e ne paga metà allo sfidante. |
| Depositi | `MsgDepositToRollup` accredita un account di 32 byte su un rollup `qledger-v1`. |
| Rollup privati | I rollup `defi` creati con privacy `encapsulated` accettano solo envelope ML-KEM-1024 destinati ai loro membri (`MsgSetRollupMembers`). |
| Input Groth16 | Gli input sono letti modulo il campo scalare di BLS12-381. `withdrawals_root` può essere qualsiasi sequenza di 32 byte e viene memorizzata ridotta. |
| STARK | Le chiavi STARK e i batch STARK vengono rifiutati fino a una release successiva. |
| Retention | Gli impegni dei dati pubblicati vengono conservati per `posted_data_retention_blocks`, con checkpoint conservati più a lungo sui rollup `qledger-v1`. |

## Perché è importante {#why}

Prima della v3.2.8 i dati di un rollup non avevano un posto sulla chain, quindi chiunque verificasse un batch doveva fidarsi della copia del sequencer. Pubblicare i dati e ordinare per inclusione elimina questa fiducia: la chain stessa registra cosa è stato pubblicato e in quale ordine, e un batch deve consumare esattamente quell'intervallo. Per i rollup optimistic, una contestazione ora verifica l'esecuzione e non solo una root, quindi un batch sbagliato fa perdere al suo submitter il bond. I rollup privati permettono a un gruppo di condividere dati su una chain pubblica senza pubblicarli.

## Pubblicare i dati del rollup {#posting-data}

`MsgPostRollupData` (comando `tx rdk post-data`) invia un payload in una transazione. I byte restano nella transazione, quindi sono nel blocco. La chain conserva un impegno sotto la prossima sequenza di inbox del rollup (a partire da 1): lo SHA-256 dei dati, la loro dimensione, chi ha pubblicato e l'altezza. Estende inoltre l'accumulatore di inbox del rollup.

* **Chi può pubblicare**: il sequencer del rollup (il suo creatore quando non è impostato alcun indirizzo di sequencer). Su un rollup based, chiunque.
* **Dimensione**: al massimo `max_posted_data_bytes` per post (predefinito 131.072 byte, tetto massimo 1 MiB) e `max_posted_data_bytes_per_block` su tutti i rollup (predefinito 524.288 byte fatturabili).
* **Commissione**: `posted_data_fee_per_byte` uqor per byte fatturabile (predefinito 10), e un post viene fatturato per almeno 1 KiB. La commissione va al fee collector e viene ripartita come una commissione di transazione. Il gas si aggiunge a parte.
* **Retention**: l'impegno viene eliminato dopo `posted_data_retention_blocks` (predefinito 648.000). I byte restano nella cronologia dei blocchi.
* **Uso in un batch**: un batch di un rollup con DA nativa che non è based può fare riferimento a un post conservato con `data_hash` uguale allo SHA-256 dei dati.

Riga di comando (binario del nodo Linux):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Leggi un impegno tramite REST (verificato sulla testnet, vedi [Route verificate](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

La risposta contiene `data_hash`, `size`, `poster`, `height`, `inbox_acc` e `expires_at_height`. Una sequenza mai pubblicata, o eliminata, restituisce HTTP 404.

## Based sequencing {#based-sequencing}

Un rollup based è ordinato dall'inclusione su QoreChain. Ogni post riceve la successiva sequenza di inbox, e ogni batch consuma l'inbox in ordine.

* Crea un rollup come based con `--sequencing based`, oppure sposta un rollup esistente con la governance `MsgSetRollupSequencing`.
* Ogni batch imposta `inbox_end` (la sequenza dell'ultimo post che consuma) e porta l'impegno sull'intervallo di inbox come `data_hash`. Chiedilo alla chain con `query rdk inbox` (restituisce `range_data_hash`).
* Un rollup based viene messo in pausa, ripreso e fermato solo dalla governance.

Chi può inviare batch su un rollup based dipende dal rollup:

| Rollup | Chi invia i batch |
| --- | --- |
| zk con una chiave Groth16 (`defi`) | Qualsiasi account. La prova vincola le root, l'intervallo di inbox e la root dei prelievi. |
| settlement based (`gaming`, `enterprise`) | Solo il sequencer del rollup. |
| optimistic con `qledger-v1` (`nft`, `custom`) | Qualsiasi account che detenga un bond di submitter. |

I rollup optimistic senza `qledger-v1` e i rollup STARK non possono essere based in questa release.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

L'accumulatore e l'impegno sull'intervallo, per i prover che vogliono calcolarli senza fidarsi di un nodo:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` è composto da 32 byte a zero e `lp` è un prefisso di lunghezza di 4 byte in big-endian.

## Rollup optimistic con qledger-v1 {#qledger-v1}

Dalla v3.2.8 un nuovo rollup optimistic non può essere creato senza una VM di esecuzione. I preset `nft` e `custom` richiedono `--execution-vm qledger-v1` insieme a `--sequencing based`. I rollup optimistic creati prima della v3.2.8 restano invariati.

`qledger-v1` è un ledger di account in uqor (un sparse Merkle tree con SHA-256) con trasferimenti e prelievi firmati. Le chiavi degli account sono solo ML-DSA-44. I suoi input sono la sua inbox:

* **Post degli utenti**: una transazione ciascuno, al massimo 6 KiB.
* **Depositi**: `MsgDepositToRollup` accredita un id di account di 32 byte. La chain aggiunge da sola il deposito all'inbox.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Bond del submitter e batch in sospeso {#submitter-bond}

Qualsiasi account può inviare batch una volta che detiene su quel rollup un bond di submitter di almeno `min_submitter_bond` (predefinito 1.000 QOR, 1.000.000.000 uqor).

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

La query del bond restituisce `amount`, `last_submit_time`, `unbond_after` e `pending`. `pending` è il numero di batch di quel submitter ancora in attesa di finalità: sale a ogni batch inviato e scende quando uno viene finalizzato o rifiutato. Un submitter può avere meno di 1.024 batch in sospeso. Un bond può essere ritirato con `unbond-submitter` una intera finestra di contestazione dopo l'ultimo batch del titolare.

### Regole dei batch {#batch-rules}

Sia `consumed` la posizione di inbox da cui parte il batch successivo e `head` l'ultimo post (entrambi in `query rdk inbox`). Un batch con `inbox_end = end` è ammesso quando valgono tutte queste condizioni:

1. Il submitter detiene almeno `min_submitter_bond` e ha meno di 1.024 batch in sospeso.
2. `consumed < end <= head`. Un batch consuma almeno una voce.
3. `end - consumed <= 64`. Al massimo 64 voci di inbox per batch.
4. La chain può ancora produrre l'accumulatore a `end`: `end` è la testa, oppure l'impegno del post `end` è conservato (`query rdk inbox <rollup> --inbox-end <end>` restituisce un `range_data_hash`).
5. Un batch di meno di 64 voci che si ferma prima della testa si ferma o subito prima di un post fatto negli ultimi 20 blocchi, oppure a un checkpoint (`end` è un multiplo di 64) il cui post successivo non è più conservato.
6. `data_hash` è l'impegno sull'intervallo di inbox da `consumed` a `end`, il primo batch parte dalla root del ledger vuoto e `state_root` è di 32 byte.

Un client può scegliere `end` così:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Invia con la riga di comando:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Fraud proof {#fraud-proofs}

Durante la finestra di contestazione chiunque può inviare `MsgChallengeBatch` con una fraud proof `qledger-v1`: gli input del batch e un witness di Merkle degli account che toccano. La chain riesegue il batch.

* Se la state root o la root dei prelievi è sbagliata, il batch viene rifiutato, e con esso ogni batch costruito sopra di esso. L'inbox torna indietro.
* L'intero bond del submitter viene tagliato (slash). **Metà viene bruciata e metà viene pagata allo sfidante.** La metà bruciata è registrata nel modulo burn con la sorgente `rollup_slash`. Un submitter che contesta il proprio batch sbagliato perde comunque metà del suo bond.
* Una prova che non mostra un batch sbagliato fallisce con l'errore 51 e non cambia nulla.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

L'RDK 0.9.0 ha gli helper `qledger-v1` che costruiscono i byte della prova.

I batch che non vengono contestati si finalizzano da soli al termine della finestra di contestazione. I prelievi vengono pagati solo da batch finalizzati, dal pool di depositi del rollup, mai dall'escrow del creatore. Un rollup non può essere fermato finché il pool contiene depositi (errore 54).

### Retention e periodi di inattività {#retention}

* L'impegno di un post viene conservato per `posted_data_retention_blocks`, e poi, finché nessun batch finalizzato lo copre, per altri 4 periodi di retention al massimo.
* Dopo di che viene eliminato, tranne un checkpoint: ogni post la cui sequenza è un multiplo di 64 mantiene il proprio impegno finché un batch finalizzato non lo copre, oppure finché il rollup non viene fermato.
* Un rollup fermato non conserva alcun impegno oltre il suo periodo di retention.
* `posted_data_retention_blocks` deve essere almeno pari alla più lunga finestra di contestazione in vigore, contata come un blocco al secondo (`default_challenge_window` e la finestra di ogni rollup non fermato). Un aggiornamento dei parametri che la lascia più breve, o che alza una finestra oltre di essa, viene rifiutato con `invalid params`. Il limite superiore è 25.920.000.
* All'upgrade alla v3.2.8, un valore memorizzato inferiore a quella finestra viene portato ad essa. I parametri predefiniti restano come sono.
* **Valori della testnet**: `default_challenge_window` è 3.600 secondi (il valore predefinito del core, e quello in stile mainnet, è 604.800 secondi, 7 giorni). I dati pubblicati sono conservati per 648.000 blocchi, mentre i blob e i batch finalizzati per 432.000 blocchi.

Dopo un lungo periodo di inattività, con più di 64 post non consumati e i loro impegni eliminati, un submitter si mette in pari in ordine: un batch fino al successivo multiplo di 64 se `consumed` non lo è, poi batch completi da 64 da checkpoint a checkpoint, poi un ultimo batch fino alla testa (o fino a una qualsiasi posizione conservata secondo la regola 5). Nel funzionamento normale non cambia nulla: batch fino a 64 voci, fino alla testa o fino a subito prima di un post recente.

## Rollup privati {#private-rollups}

Un rollup `defi` (Groth16) creato con privacy `encapsulated` accetta solo post che siano envelope ML-KEM-1024 destinati ai suoi membri.

Un envelope cifra i dati una sola volta con AES-256-GCM sotto una chiave nuova, e incapsula quella chiave per la chiave ML-KEM-1024 di ogni membro presa dal registro KEM della chain. Un impegno sulla chiave garantisce che tutti i membri aprano lo stesso contenuto. La chain verifica che l'envelope sia ben formato e che ogni voce nomini la chiave attuale del membro. Non decifra mai.

* Il creatore imposta i membri con `MsgSetRollupMembers`: al massimo 32, ciascuno con una chiave ML-KEM-1024 registrata. Ogni modifica avvia una nuova epoca di appartenenza.
* I post, chi li ha pubblicati, i tempi, le dimensioni, i membri, le root e i prelievi (destinatario e importo) restano pubblici. Solo i contenuti dei post sono privati.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Input Groth16 e la root dei prelievi {#groth16}

Un batch Groth16 su BLS12-381 (il profilo `defi`, SNARK) viene verificato rispetto a input pubblici, ciascuno un valore di 32 byte letto come intero big-endian e ridotto modulo l'ordine del campo scalare:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

Un batch inviato prima che i prelievi fossero vincolati ha solo i primi tre input. Il witness del prover deve prendere gli stessi valori ridotti.

Se un valore debba essere già inferiore a `r` dipende da chi lo imposta:

| Valore | Chi lo imposta | Deve essere inferiore a r |
| --- | --- | --- |
| `state_root` | il prover | sì |
| `prev_state_root` | la chain (l'ultima `state_root` regolata), tranne al primo batch di un rollup | solo il primo batch |
| `data_hash` | la chain quando è vincolato (l'intervallo di inbox di un rollup based, un impegno di dati pubblicati), altrimenti il prover | solo quando non è vincolato |
| `withdrawals_root` | la chain (la root dell'albero dei prelievi che `MsgExecuteWithdrawal` ricostruisce) | no |

Cosa significa per un client:

* Invia la root dei prelievi così come la dà l'albero. Può essere qualsiasi sequenza di 32 byte.
* La chain memorizza `withdrawals_root mod r` come 32 byte big-endian. La query del batch mostra quel valore memorizzato, con `withdrawals_root_reduced` true. Circa il 55 per cento delle root degli alberi è pari o superiore a `r`, quindi il valore memorizzato spesso differisce dai byte inviati.
* `MsgExecuteWithdrawal` non cambia per il client: invia i campi della foglia e gli hash dei fratelli. La chain ricostruisce la root e accetta il prelievo quando `rebuilt_root mod r == stored_root mod r`.
* Due invii dello stesso batch le cui root differiscono per un multiplo di `r` sono lo stesso batch. Il primo si regola, il secondo viene rifiutato come batch già esistente, e ogni prelievo nell'albero viene pagato rispetto alla root memorizzata.
* Dopo il settlement, confronta la root memorizzata con `tree_root mod r`, non con `tree_root`.

I batch optimistic, `qledger-v1` e Groth16 precedenti alla regola di riduzione memorizzano e confrontano esattamente i 32 byte. Per la codifica dell'albero e delle foglie, vedi [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).

## Il settlement STARK è in pausa {#stark}

L'unica affermazione STARK che il verificatore supporta dimostra un elevamento al quadrato iterato tra due valori a 64 bit. Questo non vincola i prelievi né i dati di un rollup. Dalla v3.2.8 non si può impostare una chiave STARK e i batch di un rollup STARK vengono rifiutati (errore 52). La governance può spostare un tale rollup su una chiave Groth16. Il settlement STARK tornerà in una release successiva con una vera affermazione sul rollup.

## Nuovi messaggi {#messages}

| Messaggio | Comando | Chi lo invia |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | Il sequencer, o chiunque su un rollup based |
| `MsgSetRollupSequencing` | proposta di governance | Governance |
| `MsgDepositToRollup` | `tx rdk deposit` | Chiunque, per un rollup `qledger-v1` |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | Un submitter di batch |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | Un submitter di batch |
| `MsgSetRollupMembers` | `tx rdk set-members` | Il creatore di un rollup privato |
| `MsgSubmitBatch` campo `inbox_end` | `tx rdk submit-batch --inbox-end` | Il submitter del batch di un rollup based |

`create-rollup` accetta anche `--sequencing`, `--execution-vm` e `--privacy`. La matrice di compatibilità ora è: optimistic con fraud proof richiede `qledger-v1` e il based sequencing, e il settlement ZK significa SNARK.

## Flusso completo: creare, bond, deposito, post, batch, contestazione, finalizzazione, prelievo {#worked-flow}

:::note Eseguito sulla testnet dal team RDK, 12 novembre 2026
Il team RDK ha eseguito questo flusso end to end sulla testnet `qorechain-diana` il 12 novembre 2026, dalle 06:22 alle 07:27 UTC. È stato guidato interamente tramite l'RDK 0.9.0 (TypeScript) con la commissione `auto` dell'RDK a 0,15 uqor per gas. Ogni passo ha restituito codice 0. Non è stato eseguito dall'autore di questa pagina.
:::

| Passo | Messaggio | Gas usato / gas richiesto |
| --- | --- | --- |
| 0 | Registra prima la chiave post-quantistica del nuovo account, in una transazione a sé (`MsgRegisterPQCKeyV2` con proof of possession). I client RDK lo fanno automaticamente; senza di essa la prima transazione vera viene rifiutata con codice pqc 8 | 348.917 / 600.000 |
| 1 | `MsgCreateRollup`: profilo `nft`, VM di esecuzione `qledger-v1`, sequencing `based`, stake 10.000 QOR (1% bruciato) | 301.260 / 349.199 |
| 2 | `MsgBondRollupSubmitter`, 1.000 QOR | 178.059 / 263.425 |
| 3 | `MsgDepositToRollup` due volte (3 QOR e 1 QOR; il minimo è 1 QOR) | circa 240.000 / 350.000 ciascuno |
| 4 | `MsgPostRollupData` due volte (un trasferimento qledger firmato e un prelievo qledger firmato), più la commissione dei dati pubblicati (10 uqor per byte fatturabile, almeno 1 KiB fatturato) | circa 328.500 / 474.000 ciascuno |
| 5 | `planQledgerBatch`, poi `MsgSubmitBatch` per 4 voci di inbox (`inbox_end` 4, `data_hash` l'intervallo di inbox). Stato del batch `submitted`, bond `pending` 1 | 712.379 / 1.011.431 |
| 6 | Test di frode: un altro post, poi un batch con una state root deliberatamente sbagliata (233.990 / 341.742), poi `MsgChallengeBatch` con la fraud proof costruita dall'RDK (4.136 byte) | 450.186 / 644.417 |
| 7 | Il batch 0 si è finalizzato da solo dopo la finestra di contestazione di 3.600 secondi della testnet | nessuna transazione |
| 8 | `MsgExecuteWithdrawal` di 0,3 QOR con la prova di Merkle qledger dell'RDK | 192.768 / 284.220 |

Risultati degni di nota:

* **Passo 6**: il batch sbagliato è stato rifiutato, il bond del submitter è stato tagliato (metà bruciata, metà pagata allo sfidante), l'inbox è tornata indietro e il precedente batch corretto non è stato toccato.
* **Passo 8**: il pool di depositi del rollup è passato da 4,0 a 3,7 QOR, e il saldo del destinatario è salito di 0,3 QOR meno la commissione.

La riga di comando ha un equivalente per ogni passo. Questi singoli comandi non sono stati eseguiti per questa pagina e seguono le definizioni della CLI del nodo:

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

La finestra di contestazione di un rollup è nel suo `challenge_window_sec`. Sulla testnet `default_challenge_window` è di 3.600 secondi di proposito, così i rollup si possono provare nell'arco di un'ora; il valore predefinito del core, e quello in stile mainnet, è 604.800 secondi (7 giorni). I passi da 5 a 8 richiedono root e prove calcolate dal ledger; l'RDK 0.9.0 ha gli helper `qledger-v1` che lo fanno.

## Leggere la chain con il kit TypeScript pubblicato {#typescript}

Queste letture usano nomi di `@qorechain/rdk`, che supporta la v3.2.8 dalla 0.9.0. Puoi anche leggere direttamente i nuovi campi con `curl` come mostrato qui sotto.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

Questo frammento non è stato eseguito per questa pagina.

## Route verificate {#checked-routes}

Queste route di sola lettura sono state richieste alla testnet pubblica il 12 novembre 2026.

| Route | Stato |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` e `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, oppure 404 per una sequenza mai pubblicata o eliminata |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| qualsiasi route per un rollup sconosciuto | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

I parametri del modulo ora includono `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` e `finalized_batch_retention_blocks`. La vista del batch aggiunge `inbox_start`, `inbox_end` e `withdrawals_root_reduced`, e la vista del rollup aggiunge `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` e `deposit_pool`. La risposta dell'inbox ha `head_sequence`, `consumed_sequence` e `range_data_hash`, che è vuoto quando l'impegno alla fine richiesta non è disponibile.

## Limiti ed errori {#limits}

| Limite o errore | Valore o significato |
| --- | --- |
| Dimensione del post | `max_posted_data_bytes`, predefinito 131.072 byte, tetto 1 MiB |
| Byte pubblicati per blocco | `max_posted_data_bytes_per_block`, predefinito 524.288 byte fatturabili |
| Commissione del post | 10 uqor per byte fatturabile per impostazione predefinita, almeno 1 KiB fatturato |
| Retention dei dati pubblicati | 648.000 blocchi per impostazione predefinita, al massimo 25.920.000, mai inferiore alla più lunga finestra di contestazione in secondi |
| Post `qledger-v1` | Una transazione, al massimo 6 KiB |
| Dimensione del batch | Da 1 a 64 voci di inbox |
| Batch in sospeso per submitter | meno di 1.024 |
| Membri di un rollup privato | al massimo 32, ciascuno con una chiave ML-KEM-1024 registrata |
| Batch regolati per blocco, per rollup | `max_batches_per_block`, predefinito 10 (errore 40) |
| Errore 41, 44, 47 | La funzionalità non è abilitata a questa altezza (la rete non ha applicato la v3.2.8) |
| Errore 42, 43 | Post troppo grande, oppure raggiunto il limite di post del blocco |
| Errore 45 | Il based sequencing non è disponibile per questo rollup |
| Errore 46 | Il batch non corrisponde all'inbox del rollup (`inbox_end` o `data_hash` sbagliato) |
| Errore 48 | Modalità di esecuzione o di privacy non valida |
| Errore 49 | Bond del submitter richiesto |
| Errore 50 | Il bond del submitter è ancora bloccato |
| Errore 51 | La fraud proof non mostra il batch come non valido |
| Errore 52 | Il settlement STARK è in pausa |
| Errore 53 | Il post non è un envelope valido per i membri del rollup |
| Errore 54 | Il rollup detiene ancora depositi degli utenti, quindi non può essere fermato |

## Pagine correlate {#related}

* [Panoramica dei Rollup](/rollups/overview)
* [Preset Profiles](/rollups/preset-profiles)
* [Deploying a Rollup](/rollups/deploying-a-rollup)
* [Data Availability](/rollups/data-availability)
* [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
