---
slug: /developer-guide/node-operators-v328
title: "Operatori di nodo: checklist v3.2.8"
sidebar_label: Operatori di nodo v3.2.8
sidebar_position: 11
---

# Operatori di nodo: checklist v3.2.8

La release **v3.2.8** è attiva sulla testnet `qorechain-diana` dal 12 novembre 2026 (altezza 9,929,500). La mainnet `qorechain-vladi` esegue la v3.2.7 dal 12 novembre 2026 (altezza 4,164,600, proposta di governance 16) e non ha applicato la v3.2.8, quindi nulla in questa pagina si applica oggi a un nodo mainnet.

Questa pagina è l'elenco breve di ciò che un operatore di nodo controlla e cambia per la v3.2.8: le librerie condivise nel bundle, le impostazioni del runtime dei contratti, i nuovi valori predefiniti di `app.toml`, una nuova route REST e i passaggi per aggiornare un nodo che è ancora sulla v3.2.7. Per la guida completa al nodo, vedi [Esecuzione di un nodo](/developer-guide/running-a-node).

**Perché è importante.** La v3.2.8 esegue gli smart contract su una nuova libreria di runtime dei contratti e addebita la memoria e il caricamento del codice che una chiamata a un contratto usa. Un nodo che tiene la vecchia cartella delle librerie, o che gira con poca memoria per i contratti, non si avvia o resta indietro. Il resto della checklist è un piccolo lavoro di configurazione.

## 1. Copia l'intera cartella `lib/` {#lib-folder}

Il bundle di release contiene `qorechaind` e una cartella `lib/` con quattro librerie condivise:

| Libreria | Ruolo |
| --- | --- |
| `libqorepqc.so` | Verifica delle firme post-quantistiche |
| `libqoresvm.so` | Runtime SVM |
| `libwasmvm.x86_64.so` | Libreria di runtime dei contratti upstream |
| `libwasmvmqore_v1.x86_64.so` | Novità della v3.2.8: la libreria di runtime dei contratti di QoreChain |

Copia l'**intera cartella**, non i singoli file. Una riga `COPY lib/ ...` in un Dockerfile o un `cp -r lib/* ...` su un host bare-metal continua a funzionare quando una release successiva aggiunge una libreria; un elenco di file con nome no.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Punta il loader alla cartella in cui hai copiato (la voce `LD_LIBRARY_PATH` o `ld.so.conf.d` che già usi) e riavvia. I comandi sopra sono un modello; usa i percorsi della tua installazione.

## 2. Cache di memoria dei contratti: almeno 256 MiB {#memory-cache}

Il runtime dei contratti tiene in memoria i contratti compilati. In `app.toml`, l'impostazione `memory_cache_size` della sezione `[wasm]` deve essere di **256 MiB o più**:

```toml
[wasm]
memory_cache_size = 256
```

Un valore inferiore a 256 viene portato a 256 all'avvio del nodo, e il nodo registra un avviso. Pianifica la memoria aggiuntiva sulle macchine piccole.

## 3. La directory dei contratti ora è `<home>/wasm` {#wasm-directory}

Il codice dei contratti compilato ora risiede in `<home>/wasm`, dove `<home>` è la directory con cui avvii il nodo (`--home`). Un nodo il cui codice dei contratti è ancora nella vecchia posizione continua a usarla e registra un avviso. Puoi spostare la cartella quando ti è comodo; prima ferma il nodo.

## 4. Nuovi valori predefiniti di `app.toml` {#app-toml-defaults}

Un nodo inizializzato con la v3.2.8 scrive questi valori predefiniti. I file `app.toml` esistenti **non vengono riscritti**, quindi un nodo aggiornato mantiene i vecchi valori finché non li cambi.

| Impostazione | Nuovo valore predefinito | Cosa fa |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Limite di gas per le transazioni simulate su questo nodo. I wallet e gli SDK simulano prima di inviare, e il limite alto permette di simulare grandi chiamate a contratti |
| Namespace `api` di JSON-RPC | `eth,net,web3` | Il namespace `txpool` non è servito per impostazione predefinita, perché pubblica le transazioni in sospeso del nodo. Aggiungi `txpool` tu stesso solo se ti serve |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Limite di gas delle query {#query-gas-limit}

Le query sui contratti girano sotto un limite di gas locale al nodo che la sezione `[wasm]` di `app.toml` controlla. Il team della chain consiglia di impostarlo a `0` (nessun limite) sui validatori:

```toml
[wasm]
query_gas_limit = 0
```

Questa impostazione cambia solo ciò che il tuo nodo risponde alle query sui contratti; non cambia ciò che un blocco deve contenere. È la raccomandazione del team della chain per i validatori; un nodo che serve query pubbliche può preferire un limite finito.

## 6. Nuova route: `GET /qorechain/svm/v1/params` {#svm-params}

La v3.2.8 aggiunge una route in sola lettura per i parametri del modulo SVM. È servita dai nodi sulla v3.2.8 (testnet) e risponde HTTP `501` sulla mainnet, dove la release non è applicata.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Risposta dalla testnet il 12 novembre 2026:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Campo | Significato |
| --- | --- |
| `enabled` | Se la corsia delle transazioni SVM è aperta. `false` sulla testnet dall'upgrade, quindi le scritture SVM vengono rifiutate finché la governance non la riapre |
| `max_program_size`, `max_account_data_size` | Limiti di dimensione in byte (10,485,760 ciascuno) |
| `compute_budget_max` | Il più grande budget di calcolo che una transazione può richiedere (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Input del prezzo dello storage |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Offset della numerazione degli slot, schema di firma predefinito e limite di profondità delle chiamate tra programmi |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Limiti sui QOR nativi che un account SVM può detenere, in uqor |

Leggi `enabled` prima di mostrare un pulsante di invio SVM; vedi [Sviluppo SVM](/developer-guide/svm-development). La route `GET /qorechain/svm/v1/cluster_info` è una route separata che restituisce l'identità del cluster.

## 7. Controlla il manifest {#manifest}

Il manifest è la fonte di verità su quale binario installare:

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

Il 12 novembre 2026 ha risposto `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` e il binario `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`. Controlla che `version` sia uguale a `minCompatible` prima di fidarti di `binary.url`, e verifica l'archivio con lo `sha256` nello stesso file. Il manifest della mainnet è su `https://download.qore.host/mainnet/latest.json` e indica la v3.2.6 finché non viene annunciato un upgrade della mainnet.

## 8. Aggiorna un nodo ancora sulla v3.2.7 {#upgrade-from-v327}

L'altezza di upgrade della testnet è passata, quindi un nodo ancora sulla v3.2.7 si ferma all'altezza 9,929,500 con `UPGRADE "v3.2.8" NEEDED`. Il suo stato viene mantenuto e non serve una nuova sincronizzazione.

1. Scarica l'archivio indicato nel manifest e verifica il suo SHA-256.
2. Ferma il nodo.
3. Sostituisci `qorechaind` e copia l'intera cartella `lib/` ([passaggio 1](#lib-folder)).
4. Controlla `[wasm] memory_cache_size` ([passaggio 2](#memory-cache)) e decidi su `simulation_gas_limit`, i namespace JSON-RPC e `query_gas_limit` ([passaggi 4 e 5](#app-toml-defaults)).
5. Avvia il nodo e osserva il log. Un avviso sulla directory dei contratti o sulla cache di memoria è atteso se non li hai cambiati.
6. Conferma che segua la chain:

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

Un nuovo nodo che entra nella testnet parte direttamente dal binario v3.2.8; vedi [Connessione alla testnet](/getting-started/connecting-to-testnet) per lo state sync e i peer, e [Esecuzione di un nodo](/developer-guide/running-a-node#upgrades) per la cronologia degli upgrade.

## Limiti ed errori

| Cosa vedi | Significato | Cosa fare |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` e il nodo si ferma all'altezza 9,929,500 | Il nodo è ancora sul binario v3.2.7 | Sezione 8 |
| Errore di avvio su una libreria condivisa mancante | `lib/` non è stata copiata per intero, o il loader non punta ad essa | Sezione 1 |
| Avviso che `memory_cache_size` è stato aumentato | Il valore configurato è sotto i 256 MiB | Imposta 256 o più |
| Avviso sulla directory dei contratti | Il codice dei contratti è ancora nella vecchia posizione | Spostalo in `<home>/wasm` quando ti è comodo |
| `501` da `/qorechain/svm/v1/params` | Il nodo non è sulla v3.2.8 (la mainnet esegue la v3.2.7) | Atteso sulla mainnet |

## Pagine correlate

* [Esecuzione di un nodo](/developer-guide/running-a-node), incluso [Runtime dei contratti nella v3.2.8](/developer-guide/running-a-node#v328-node)
* [Esecuzione di un validatore](/developer-guide/running-a-validator)
* [Connessione alla testnet](/getting-started/connecting-to-testnet)
* [Endpoint REST e gRPC](/api-reference/rest-grpc-endpoints)
