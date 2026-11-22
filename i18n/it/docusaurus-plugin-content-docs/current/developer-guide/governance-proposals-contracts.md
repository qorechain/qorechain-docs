---
slug: /developer-guide/governance-proposals-contracts
title: "Proposte di governance per i contratti: caricare codice Native e aprire l'accesso cross-VM (testnet)"
sidebar_label: Proposte per contratti
sidebar_position: 12
---

# Proposte di governance per i contratti: caricare codice Native e aprire l'accesso cross-VM (testnet)

Sulla testnet di QoreChain `qorechain-diana`, nessuno carica un contratto QoreChain Native (CosmWasm) con una transazione semplice, e nessun contratto EVM può chiamare un contratto Native tramite il bridge finché la governance non lo ha deciso. Entrambe le cose passano da una **proposta di governance**: la proposta memorizza il tuo codice compilato, se vuoi crea il contratto e lo aggiunge alla allowlist cross-VM, **vincolato al codice esatto** che hai caricato. Questa pagina mostra a chi sviluppa come preparare, inviare, seguire e verificare una proposta del genere, e poi come chiamare da Solidity il contratto approvato.

Questa pagina è stata verificata sulla testnet live il **22 novembre 2026** (chain `qorechain-diana`, chain v3.2.9 dal 20 novembre). Gli esempi on-chain sono proposte reali: 40 (il contratto `qday-receipts`, codice 865), 23, 27 e 34 (codice memorizzato), 19 e 20 (regole di istanziazione), 32 (la allowlist). Le righe di comando `qorechaind` sono state scritte a partire dal riferimento CLI esistente e dal JSON delle proposte on-chain; il binario stesso non è stato eseguito per questa pagina, quindi esegui una volta `qorechaind tx gov submit-proposal --help` sulla tua macchina se un flag differisce.

:::note Solo testnet
Questi passaggi descrivono la testnet. La mainnet non ha il bridge cross-VM aperto, e anche lì il caricamento del codice avviene solo tramite governance. I QOR di test non hanno valore; usa solo account di test.
:::

## Perché passa dalla governance {#why}

* **Il caricamento è chiuso agli account.** `code_upload_access` è `Nobody` e `MsgStoreCode` è nell'elenco del circuit breaker. Una proposta di governance apre il breaker, memorizza il codice come account di governance e lo richiude all'interno della stessa proposta, quindi la porta non resta mai aperta tra un voto e l'altro.
* **L'istanziazione è aperta.** `instantiate_default_permission` è `Everybody` dalla proposta 19, quindi una volta che la governance ha memorizzato il tuo codice chiunque (tu compreso) può creare contratti da esso, a meno che il codice memorizzato porti un permesso più stretto.
* **Il bridge raggiunge solo i contratti approvati.** Il bridge `0x0901` può chiamare solo i target in `bridge_allowed_targets`. Ogni target è vincolato a un code id e alla lunghezza della sua cronologia di codice, quindi il contratto non può essere migrato a un codice diverso mantenendo la sua approvazione.
* **È atomica.** I messaggi di una proposta vengono eseguiti insieme. Se uno fallisce (per esempio un codice che la chain rifiuta), nessuno si applica, e il breaker non resta aperto.

## Cosa serve {#needs}

| Voce | Come ottenerla |
| --- | --- |
| Il binario `qorechaind` (Linux) | La release su [download.qore.host](https://download.qore.host). Un binario dell'albero dei sorgenti pubblico non può produrre la firma ibrida richiesta dalla chain. |
| Un account testnet con una chiave post-quantistica registrata | Vedi [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing). |
| QOR di test per il deposito e le commissioni | Il faucet della testnet. Una proposta ordinaria richiede 10 QOR, una accelerata 50 QOR (tabella più sotto). |
| Docker, per compilare il contratto come tutti gli altri | [Docker](https://docs.docker.com/get-docker/). |

## Passaggio 1: compila il contratto e annota il suo checksum {#build}

Compila con l'optimizer CosmWasm, così chiunque può ricompilare i tuoi sorgenti e ottenere gli stessi byte. Il contratto del Workshop 3 è stato compilato con l'immagine arm64 su Apple Silicon (una macchina x86 usa l'immagine `optimizer` semplice; le due danno checksum diversi, quindi indica quale hai usato nel sommario della proposta):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Dovresti vedere una riga per contratto con un checksum esadecimale di 64 caratteri e il nome del file, per esempio `6ebfc32f...5c43c  qday_receipts.wasm`. Quel checksum è lo **SHA-256 del file wasm non compresso**, ed è il `data_hash` che la chain mostrerà per il tuo codice. Copialo; va nel sommario della proposta perché i votanti possano verificarlo.

Prima di spendere un deposito, controlla il codice rispetto ai limiti in [Gas e limiti di caricamento](/developer-guide/cosmwasm-development#gas-and-limits): al massimo 4.096 funzioni, al massimo 32 MiB compilati, nessuna istruzione in virgola mobile.

## Passaggio 2: codifica il codice per la proposta {#encode}

La proposta porta il wasm dentro il JSON come base64. Comprimilo prima (la chain accetta gzip, che è ciò che ha usato la proposta 40: il suo codice inizia con `H4sI`):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

Dovresti vedere una dimensione in byte. Il codice di `qday-receipts` è circa 99.000 caratteri come base64 di gzip. Tienilo in un file, perché è troppo lungo da incollare in un comando.

## Passaggio 3: scrivi la proposta {#write}

Una proposta è un file JSON con `messages`, `metadata`, `deposit`, `title`, `summary` ed `expedited`. L'`authority` e il `sender` di ogni messaggio qui sotto sono l'**account del modulo di governance**. Leggilo invece di copiarlo da questa pagina:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

Dovresti vedere l'account con `"name":"gov"`; il suo `address` inizia con `qor1`. Chiamalo `<GOV_ADDRESS>` qui sotto. Il 22 novembre 2026 era `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### Proposta A: memorizza il codice e crea il contratto {#proposal-a}

Questa è la forma della proposta 40 senza il suo messaggio di allowlist. L'ordine conta: apri il breaker, memorizza, chiudi il breaker, poi istanzia.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

Come compilare i segnaposto:

| Segnaposto | Come ottenerlo |
| --- | --- |
| `<NEXT_CODE_ID>` | L'ultimo code id più uno. Leggi l'ultimo con `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. Il 22 novembre 2026 l'ultimo era 865, quindi il successivo era 866. Se la proposta di qualcun altro memorizza codice prima, la tua riceve un id successivo e il messaggio di istanziazione fallisce, il che annulla l'intera proposta (non si perde nulla se non l'attesa). |
| `<BASE64_SALT>` | Un breve testo qualsiasi, codificato in base64: `printf 'my-contract-v1' \| base64`. Rende prevedibile l'indirizzo del contratto. La proposta 40 ha usato il salt `qday-receipts-w3`. |
| `msg` | Il JSON che l'`instantiate` del tuo contratto si aspetta. `{}` per un contratto senza campi. |
| `admin` | Una stringa vuota significa nessun admin, quindi nessuno può migrare il contratto. Preferiscilo per un contratto che il bridge chiamerà (vedi [Vincoli](#pins)). |
| `instantiate_permission` | `Everybody`, oppure `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` per limitare chi può istanziare (la proposta 34 l'ha fatto per un contratto di test). |

Non sei obbligato a istanziare dentro la proposta. Togli l'ultimo messaggio per memorizzare solo il codice, e istanzia più tardi con una transazione ordinaria (`tx wasm instantiate`, vedi [Ciclo di vita del contratto](/developer-guide/cosmwasm-development)). Le proposte 23 e 27 hanno memorizzato codice in questo modo.

### Proposta B: inserisci il contratto nella allowlist cross-VM {#proposal-b}

Dopo che la proposta A è passata, trova l'indirizzo del contratto e leggi i parametri cross-VM live:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Dovresti vedere il tuo indirizzo contratto `qor1...`, una cronologia con **una** voce (`INIT`, il tuo code id) e l'insieme dei parametri. `MsgUpdateParams` per il modulo cross-VM **sostituisce l'intero insieme di parametri**, quindi copia ogni campo dalla risposta live e cambia solo due cose: aggiungi il tuo target a `bridge_allowed_targets` e aggiungi il suo vincolo a `bridge_target_pins`.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

I numeri qui sopra sono i valori letti il 22 novembre 2026; usa quelli che leggi live, non questi. La proposta 40 ha omesso `wasm_congestion_factor_micro`, un campo che mostra anche la risposta live; segui la risposta live e il modello della proposta 40 e confronta il risultato con la tabella in [Riferimento cross-VM](/developer-guide/cross-vm-reference#params) dopo il voto.

### Vincoli: cosa significano `code_id` e `history_len` {#pins}

| Campo | Significato |
| --- | --- |
| `target` | `cosmwasm:` seguito dall'indirizzo del contratto, scritto esattamente come in `bridge_allowed_targets`. |
| `code_id` | Il codice che il contratto deve eseguire perché il bridge lo chiami. |
| `history_len` | Quante voci ha la cronologia di codice del contratto quando lo vincoli. Un'istanza nuova ne ha 1. Un contratto migrato una volta ne ha 2 (la allowlist della testnet ha un contratto così). Qualsiasi migrazione successiva cambia la lunghezza, quindi il vincolo non corrisponde più e il bridge rifiuta la chiamata. |

Un contratto in allowlist che ha un admin diverso dalla governance deve essere vincolato, perché quell'admin potrebbe migrarlo. Il progetto sicuro più semplice è quello della proposta 40: nessun admin, e un vincolo.

### Fare entrambe le cose in una sola proposta {#one-proposal}

La proposta 40 ha fatto tutto in una sola proposta: ha memorizzato il codice, l'ha istanziato con un salt e ha vincolato l'indirizzo che quel salt produce. Questo richiede di conoscere in anticipo il prossimo code id e il futuro indirizzo del contratto, quindi è facile sbagliare. Due proposte costano un voto in più e qualche ora; preferiscile, a meno che tu abbia già derivato l'indirizzo.

## Passaggio 4: deposito, periodo di voto e soglie {#params}

Leggi le regole live prima di inviare:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Regola | Proposta ordinaria | Proposta accelerata (`"expedited": true`) |
| --- | --- | --- |
| Deposito minimo | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Periodo di deposito (per raggiungere il minimo) | 172.800 s (2 giorni) | 172.800 s (2 giorni) |
| Periodo di voto | 14.400 s (4 ore) | 3.600 s (1 ora) |
| Quorum | 33,4% dello stake bonded | 33,4% dello stake bonded |
| Soglia dei sì | 50% dei voti espressi | 66,7% dei voti espressi |
| Soglia di veto | 33,4% | 33,4% |
| Deposito iniziale minimo | nessuno | nessuno |

Letto il 22 novembre 2026. Sempre dalla stessa risposta: un voto "no with veto" sopra la soglia brucia il deposito (`burn_vote_veto` è `true`), una proposta che non raggiunge il quorum non lo brucia, e una proposta accelerata che fallisce il conteggio prosegue come ordinaria con i voti già espressi. Ogni proposta per contratti inviata finora dal team della testnet era accelerata; una proposta di chi sviluppa dovrebbe normalmente restare ordinaria (il deposito di 10 QOR e il voto di quattro ore sono più facili da pianificare).

## Passaggio 5: invia {#submit}

Ogni transazione sulla lane Cosmos deve portare la firma ibrida, quindi costruisci prima la transazione e poi la firmi con la tua chiave post-quantistica. La proposta è grande (il codice è al suo interno), quindi dai margine al gas: la soglia minima della commissione è 0,1 uqor per unità di gas, e un byte di transazione costa 10 gas.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Imposta `--gas` e `--fees` con una prova a secco: esegui prima `tx pqc cosign` con `--dry-run` (stampa una stima del gas e non invia nulla), poi usa la stima più il 30% come `<GAS>` e una commissione di almeno `<GAS>` per 0,1 uqor come `<FEES>`. Un trasferimento semplice richiede circa 300.000 o 400.000 di gas; un deploy o una proposta che contiene codice ne richiede molto di più.

`--generate-only` scrive la transazione non firmata. `tx pqc cosign` aggiunge entrambe le firme e la trasmette; approfondimenti in [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing) e nei [comandi gov](/cli-reference/transaction-commands#submit-proposal). Dovresti vedere un hash di transazione e codice 0. Se vedi un errore di out of gas, aumenta `--gas` e le `--fees` corrispondenti (la commissione deve essere almeno gas per 0,1 uqor).

Trova l'id della tua proposta, che è anche il numero negli eventi della transazione:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

Dovresti vedere il tuo titolo e lo stato `PROPOSAL_STATUS_VOTING_PERIOD` (il deposito allegato ha raggiunto il minimo). Con un deposito minore lo stato è `PROPOSAL_STATUS_DEPOSIT_PERIOD`; chiunque può integrarlo:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Passaggio 6: vota {#vote}

Qualsiasi staker può votare con lo stake che detiene. Il wallet di un singolo sviluppatore non raggiungerà il quorum del 33,4%, quindi avvisa i validatori e i delegatori della testnet della tua proposta (il sommario della proposta è ciò che leggono) e chiedi loro di votare. Un voto è una transazione firmata in modo ibrido come qualsiasi altra:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Le opzioni sono `yes`, `no`, `abstain` e `no_with_veto` (vedi [Governance](/user-guide/governance)). Segui il conteggio e il tempo:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

Quando il voto termina, lo stato diventa `PROPOSAL_STATUS_PASSED` (i messaggi sono stati eseguiti), `PROPOSAL_STATUS_REJECTED` oppure `PROPOSAL_STATUS_FAILED`. **Failed** significa che il voto è passato ma un messaggio non ha potuto essere eseguito, e allora nessun messaggio si è applicato; `failed_reason` ne indica il motivo. La proposta 40, per esempio, mostrava `PASSED`, un'ora dopo l'invio.

## Passaggio 7: verifica il codice on-chain {#verify}

Confronta il codice che la chain detiene con il checksum che hai calcolato. La chain riporta `data_hash` in maiuscolo; `sha256sum` stampa in minuscolo.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

Dovresti vedere gli stessi 64 caratteri in entrambe le righe. Come controllo più forte, calcola l'hash dei byte che la chain detiene davvero:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

Per il codice 865 ha stampato `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`, lo stesso checksum della build con l'optimizer dei sorgenti del Workshop 3. Poi controlla il contratto e, dopo la proposta B, la allowlist:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

Dovresti vedere `code_id` come il tuo e `admin` vuoto nella prima risposta, e il tuo target `cosmwasm:qor1...` con il suo vincolo (`code_id`, `history_len` di `"1"`) nella seconda. Il 22 novembre 2026 l'elenco conteneva quattro target; il quarto era `qday-receipts` a `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`, vincolato al codice 865.

## Passaggio 8: chiamalo da un contratto EVM {#call}

L'EVM chiama il bridge a `0x0000000000000000000000000000000000000901` con `executeCrossVMCall(uint8,string,bytes)`: VM di destinazione `1` (Native), l'indirizzo del tuo contratto come stringa e il messaggio JSON come byte. Il lato Native vede come mittente l'account `qor1...` del contratto EVM chiamante, e un revert da una delle due parti annulla entrambe.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

Si applicano due condizioni, entrambe spiegate in [Riferimento cross-VM](/developer-guide/cross-vm-reference#evm-to-wasm): il target deve essere nella allowlist (e deve ancora eseguire il codice vincolato), e l'account che invia la transazione ha bisogno di una [finestra di autorizzazione EVM](/developer-guide/evm-window-reference) aperta il cui `allowed_targets` elenchi `0x...0901`. Per un esempio completo e testato con uno shop Solidity e il contratto `qday-receipts`, segui il [Workshop 3](/build-before-qday/workshop-3#part-2).

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Causa probabile e rimedio |
| --- | --- |
| `tx wasm store` fallisce o non entra mai | Previsto. Gli account non possono caricare sulla testnet; il circuit breaker e `code_upload_access` lo bloccano entrambi. Usa una proposta. |
| Lo stato della proposta è `PROPOSAL_STATUS_FAILED` | Il voto è passato ma un messaggio è fallito, quindi nulla si è applicato. Leggi `failed_reason` in `GET /cosmos/gov/v1/proposals/<id>`. Un `code_id` sbagliato nel messaggio di istanziazione è la causa comune. |
| `PROPOSAL_STATUS_REJECTED` | Voti sì insufficienti o quorum mancato. Invia di nuovo con un sommario più chiaro, oppure chiedi ai validatori di votare. |
| Lo stato resta `PROPOSAL_STATUS_DEPOSIT_PERIOD` | Il deposito totale è sotto il minimo (10 QOR ordinaria, 50 QOR accelerata). Aggiungine altro con `tx gov deposit` entro 2 giorni. |
| L'invio fallisce con codice 20 nello spazio `pqc` | La transazione non portava la firma ibrida. Usa `--generate-only` e `tx pqc cosign`. |
| L'invio fallisce con out of gas | La proposta è grande. Aumenta `--gas` e mantieni la commissione ad almeno gas per 0,1 uqor. |
| Il checksum differisce da `data_hash` | Hai compilato su un tipo di macchina o con una versione dell'optimizer diversi. Ricompila con l'immagine indicata nel sommario della proposta (le immagini arm64 e x86 danno byte diversi). |
| La chiamata EVM va in revert con `cross-VM bridge call refused: target ... is not allowlisted` | Il contratto non è in `bridge_allowed_targets`, oppure il suo codice è cambiato da quando è stato vincolato. Confronta i parametri live con il tuo vincolo. |
| La chiamata EVM è rifiutata prima di raggiungere il bridge | Nessuna finestra EVM aperta che elenchi `0x0901`. Aprine una prima. |
| `MsgCrossVMCall` è rifiutato | La chiamata potrebbe essere in pausa nell'elenco del circuit breaker. Leggi `GET /cosmos/circuit/v1/disable_list`. |
| La proposta B fallisce | L'insieme dei parametri era incompleto o un vincolo è sbagliato. Controlla che ogni campo della risposta live sia presente e che `history_len` sia uguale al numero di voci della cronologia. |

## Pagine correlate {#related}

* [Governance](/user-guide/governance) per voto, depositi e tipi di proposta.
* [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development) per il ciclo di vita del contratto e le query.
* [Comandi di transazione](/cli-reference/transaction-commands#submit-proposal) per i flag esatti di `gov` e `pqc cosign`.
* [Riferimento cross-VM](/developer-guide/cross-vm-reference) per i parametri, la coda e gli esempi di chiamata.
* [Workshop 3](/build-before-qday/workshop-3) per un esempio cross-VM completo.
