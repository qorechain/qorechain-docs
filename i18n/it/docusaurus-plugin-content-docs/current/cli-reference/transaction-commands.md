---
slug: /cli-reference/transaction-commands
title: Comandi di transazione
sidebar_label: Comandi di transazione
sidebar_position: 2
---

# Comandi di transazione

Tutti i comandi di transazione seguono lo schema:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Imposta `--chain-id qorechain-vladi` per trasmettere sulla mainnet attiva, oppure `--chain-id qorechain-diana` per la testnet. Entrambe le reti eseguono la linea v3.2 (release del nodo mainnet **v3.2.1**, testnet **v3.2.2**; consulta `latest.json` sotto [download.qore.host](https://download.qore.host) per la release corrente). Se `--chain-id` è omesso, il client usa il `chain-id` della tua configurazione client locale.
:::

I flag comuni si applicano a ogni sottocomando `tx`:

| Flag                | Tipo   | Descrizione                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Nome o indirizzo della chiave firmataria                       |
| `--chain-id`        | string | Identificatore della chain (predefinito: dalla configurazione client) |
| `--fees`            | string | Commissione della transazione, ad es. `40000uqor`              |
| `--gas-prices`      | string | Prezzo del gas al posto di `--fees`, ad es. `0.1uqor`          |
| `--gas`             | string | Limite di gas, oppure `auto` per stimarlo (predefinito `200000`) |
| `--gas-adjustment`  | float  | Moltiplicatore applicato alla stima `auto` (predefinito `1`)   |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` oppure `memory`        |
| `--node`            | string | Endpoint RPC (predefinito `tcp://localhost:26657`)             |
| `--broadcast-mode`  | string | `sync` oppure `async`                                          |
| `--generate-only`   | bool   | Stampa la transazione non firmata invece di firmarla           |
| `-y`                | bool   | Salta la richiesta di conferma                                 |

---

## Commissioni e gas {#fees-and-gas}

La soglia minima delle commissioni di rete è di **0,1 uqor per unità di gas** (`query feemarket params` mostra `min_gas_price`; la base fee in vigore può salire sopra la soglia sotto carico, vedi `query feemarket base-fee`). Una transazione viene rifiutata a meno che `fee >= gas limit x gas price`, quindi `--fees 500uqor` funziona solo per un limite di gas pari o inferiore a 5.000 e fallisce per qualsiasi transazione reale.

| Transazione                                          | `--gas` suggerito | `--fees` corrispondente |
| ---------------------------------------------------- | ----------------- | ----------------------- |
| Trasferimento, delega, voto, claim con firma ibrida  | `400000`          | `40000uqor`             |
| Registrazione della chiave PQC                       | `600000`          | `60000uqor`             |
| `lightnode register`                                 | `300000`          | `30000uqor`             |

Una firma ibrida aggiunge circa 4,7 KB a una transazione, addebitati a 10 gas per byte, quindi il `--gas 200000` predefinito non è sempre sufficiente: i trasferimenti con firma ibrida sulla mainnet hanno consumato tra circa 160.000 e 240.000 gas. Imposta sempre `--gas` in modo esplicito insieme a `--fees` (oppure `--gas-prices`).

---

## La firma ibrida è obbligatoria sulla corsia Cosmos {#hybrid-signing}

`hybrid_signature_mode` è `required` su entrambe le reti (`qorechaind query pqc hybrid-mode`). Ogni transazione della corsia Cosmos deve portare una firma ML-DSA-87 (Dilithium-5) accanto alla firma secp256k1; un semplice `tx bank send ... -y` viene rifiutato. Le uniche esenzioni sono la registrazione e la migrazione della chiave PQC (così un nuovo account può registrare la sua prima chiave) e `tx slashing unjail` per un account che non ha alcuna chiave PQC registrata.

Ogni comando di questa pagina, tranne `pqc register-key`, `pqc register-key-v2` e `pqc migrate-key`, si esegue quindi in due passaggi: costruisci la transazione con `--generate-only`, poi firmala e trasmettila con `tx pqc cosign`:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Il nome di chiave `mypqc` indica una chiave creata con `tx pqc gen-key` e registrata sull'account (vedi [pqc](#pqc)). Usa a tale scopo il binario di release ufficiale da [download.qore.host](https://download.qore.host): un binario compilato dall'albero dei sorgenti pubblico non può creare né applicare una firma Dilithium (`gen-key` e `cosign` segnalano di richiedere la build completa). [QoreX](/qorex/overview) e gli SDK eseguono la stessa firma al posto tuo.

---

## bank

### send

Trasferisce token da un account a un altro.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Esempio: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, poi `tx pqc cosign` come mostrato sopra. 1 QOR = 1.000.000 uqor.

---

## staking

### create-validator

Crea un validator da un file JSON (la forma basata su flag è stata rimossa). La mainnet richiede inoltre una licenza `validator_operator` attiva e una chiave PQC registrata; vedi [Running a Validator](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

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

### edit-validator

Modifica la descrizione o la commissione di un validator esistente.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Flag: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. I campi omessi restano invariati.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Annulla una voce di unbonding in corso.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Riporta un validator in jail nel set attivo dopo il periodo di jail.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Preleva tutte le ricompense di staking in sospeso.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Preleva le ricompense da un validator.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tipo | Descrizione                                                         |
| -------------- | ---- | ------------------------------------------------------------------- |
| `--commission` | bool | Preleva anche la commissione (indirizzi operatore del validator)    |

---

## gov

### submit-proposal

Invia una proposta di governance da un file JSON con `messages`, `metadata`, `deposit`, `title`, `summary` e, facoltativamente, `expedited`. Genera uno scheletro con `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opzioni di voto: `yes`, `no`, `abstain`, `no_with_veto`. Usa `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` per dividere un voto.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Genera una chiave Dilithium-5 (ML-DSA-87) e la memorizza in `<home>/pqc/<name>.dilithium` (modalità `0600`, **non cifrata**). Stampa la chiave pubblica in esadecimale.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Registra una chiave pubblica PQC per il tuo account (comando legacy: l'algoritmo è Dilithium-5). Firmata solo con la chiave classica; questa è l'esenzione di bootstrap.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` è `hybrid` (consigliato), `pqc_only` oppure `classical_only`. La chiave pubblica di 2.592 byte rende la registrazione più costosa di un trasferimento, motivo per cui richiede il limite di gas più alto.

### register-key-v2

Registra una chiave con selezione esplicita dell'algoritmo.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` è `dilithium5` (o `1`) oppure `mlkem1024` (o `2`).

### cosign

Firma una transazione non firmata con la chiave PQC e la chiave classica dell'account, poi la trasmette.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Flag           | Descrizione                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Nome della chiave creata con `gen-key` o `recover-key`                                            |
| `--sign-bytes` | `auto` (predefinito: chiede alla chain quale forma di sign-bytes si applica), `v1` oppure `v2`    |
| `--generate-only` / `--offline` | Stampa la transazione firmata come JSON invece di trasmetterla; inviala in seguito con `tx broadcast`; `--offline` richiede anche `--account-number`, `--sequence` e `--sign-bytes v1\|v2` |
| `--dry-run`    | Simula e stampa la stima del gas                                                                  |

Entrambe le reti hanno applicato l'aggiornamento che ha spostato la verifica ibrida ai sign-bytes v2; la forma v1 viene rifiutata.

### migrate-key

Migra la chiave PQC del tuo account da un algoritmo a un altro. Deve essere attiva una migrazione per il tuo algoritmo attuale (avviata dalla governance); entrambe le chiavi firmano i byte della migrazione.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Ricostruisce la chiave ML-DSA-87 dell'account dal suo mnemonico BIP-39 (letto da stdin) e la memorizza localmente. Usa `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Tipo   | Descrizione                                                                |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonica, predefinita) oppure `bridge` (legacy `SHAKE-256(mnemonic)`)  |

### rotate-key

Ruota la chiave ML-DSA-87 dell'account all'interno dello stesso algoritmo. Legge il mnemonico da stdin, esegue la doppia firma con la chiave vecchia e quella nuova, cofirma con la chiave vecchia e trasmette.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Flag               | Tipo   | Descrizione                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Derivazione della chiave attualmente registrata: `bridge` (predefinita) oppure `adapter` |
| `--new-derivation` | string | Derivazione della nuova chiave: `adapter` (predefinita) oppure `bridge`              |
| `--new-random`     | bool   | Ruota verso una nuova chiave casuale; richiede `--new-key-out`                       |
| `--new-key-out`    | string | Salva la nuova chiave privata come `<home>/pqc/<name>.dilithium` prima di inviare qualsiasi cosa |
| `--sign-bytes`     | string | `auto` (predefinito), `v1` oppure `v2`                                               |

### open-evm-window

La corsia EVM ammette una transazione solo da un account che detiene una chiave PQC registrata **e** ha una finestra di autorizzazione aperta. Una finestra si apre con un messaggio della corsia Cosmos, che quindi porta la firma PQC che un wallet Ethereum non può fornire. All'interno della finestra, le normali transazioni MetaMask funzionano senza modifiche.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argomento   | Limite               | Significato                                                                                   |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | da 1 a 17.280        | Per quanto tempo la finestra resta aperta, contando dal blocco che la apre                    |
| `max-txs`   | da 1 a 1.000         | Quante transazioni EVM ammette                                                                |
| `max-value` | positivo             | Totale ammesso, che include il valore trasferito **e** la commissione massima che ogni transazione potrebbe pagare; `uqor` o `qor`, ad es. `1000qor` |

L'apertura di una finestra sostituisce qualsiasi finestra esistente. Verificala con `qorechaind query pqc evm-window <address>`.

### close-evm-window

Chiude subito la tua finestra, ad esempio quando sospetti che la chiave classica sia compromessa.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` è `sx` oppure `ux`. La registrazione richiede una licenza `lightnode_operator` attiva, e la registrazione al programma di ricompense dei light node **non è ancora aperta**. Altri comandi: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. Vedi [Light Node](/light-node/overview).

---

## bridge

Il bridge non è in produzione: su entrambe le reti ogni chain configurata è in stato `pending` e non è registrato alcun validator del bridge (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Accredita asset trasferiti da una chain di origine. Porta firme dei validator (`--validator-sigs`, `--pqc-commitment`); è un messaggio da operatore del bridge, non il modo in cui un utente finale avvia un deposito.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Amministrativo (licenza `bridge_admin` o `qcb_bridge`).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Il primo `transfer` è il sottocomando e il secondo è la porta di origine. Al momento della stesura non è aperto alcun canale IBC su nessuna delle due reti (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` è `defi`, `gaming`, `nft`, `enterprise` oppure `custom`; `stake_amount` è espresso in uqor (il minimo attuale si trova in `query rdk config`). Il preset del profilo fornisce settlement, sequencer, DA e modello del gas; da riga di comando si può sovrascrivere solo la VM. Non esiste alcun comando `finalize-batch`.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` è `proposed`, `active`, `suspended` oppure `decommissioned`. `update-layer-status` è disabilitato sulla mainnet dal circuit breaker (vedi sotto).

---

## Messaggi disabilitati o non disponibili oggi {#disabled-messages}

Alcuni comandi esistono nel binario ma non possono andare a buon fine sulle reti attive:

| Comando                                                   | Motivo                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Il permesso di upload e istanziazione è `Nobody` su entrambe le reti, e i tipi di messaggio sono anche nell'elenco del circuit breaker |
| `tx crossvm call`                                         | Disabilitato sulla mainnet dal circuit breaker                                                 |
| `tx svm deploy-program`, `execute`, `create-account`      | La corsia di transazioni SVM è disabilitata su tutta la rete                                   |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Il modulo abstract-account è disattivato (`query abstractaccount config` mostra `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Messaggi dell'autorità di governance; anch'essi nell'elenco del circuit breaker della mainnet  |
| `tx license *`                                            | Riservato all'autorità (le licenze sono concesse dall'autorità delle licenze della rete)       |

L'elenco in vigore si ottiene con `qorechaind query circuit disabled-list`.
