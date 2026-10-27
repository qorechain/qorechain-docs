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
Imposta `--chain-id qorechain-vladi` per trasmettere sulla mainnet attiva, oppure `--chain-id qorechain-diana` per la testnet. Entrambe le reti eseguono la linea v3.2: release del nodo mainnet **v3.2.4** (applicata all'altezza 3.742.566 il 23 ottobre 2026 dalla proposta di governance 13; la v3.2.3 era stata applicata all'altezza 3.662.051 il 20 ottobre 2026; la proposta di governance 14 applicherebbe la v3.2.5 all'altezza 3.906.833 ed è in periodo di voto al momento della scrittura), testnet **v3.2.6** (applicata all'altezza 8.970.638 il 27 ottobre 2026, dopo la v3.2.5 all'altezza 8.890.800 il 26 ottobre e la v3.2.4 all'altezza 8.337.253 il 19 ottobre). Consulta `latest.json` sotto [download.qore.host](https://download.qore.host) per la release corrente. Se `--chain-id` è omesso, il client usa il `chain-id` della tua configurazione client locale.

I comandi e i flag di questa pagina sono stati verificati con il binario della release v3.2.3, più le aggiunte della v3.2.4. Tutto ciò che esiste solo dalla v3.2.4 in poi (la mainnet dal 23 ottobre 2026, la testnet dal 19 ottobre 2026) è contrassegnato come tale. Il sorgente v3.2.6 non aggiunge alcun nuovo comando `tx`; cambia lo stato della testnet (token di test, modulo abstract-account abilitato, istanziazione QoreChain Native aperta), cosa che le sezioni seguenti segnalano dove conta.
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

## La firma ibrida è obbligatoria sulla lane Cosmos {#hybrid-signing}

`hybrid_signature_mode` è `required` su entrambe le reti (`qorechaind query pqc hybrid-mode`). Ogni transazione della lane Cosmos deve portare una firma ML-DSA-87 (Dilithium-5) accanto alla firma secp256k1; un semplice `tx bank send ... -y` viene rifiutato (codespace `pqc`, codice 20). Le uniche esenzioni, dalla v3.2.3 della mainnet, sono:

- la **prima** registrazione della chiave PQC di un account che non ha ancora alcuna chiave (`register-key` o `register-key-v2`), così un nuovo account può eseguire il bootstrap;
- la riparazione di un record di account che non contiene alcuna chiave utilizzabile, con `register-key-v2`;
- `tx slashing unjail` per un account che non ha alcuna chiave PQC registrata.

Un account che detiene già una chiave PQC deve firmare tutto con firma ibrida, **incluse** `register-key-v2` e `migrate-key` (un tentativo solo classico viene rifiutato con il codice 234). Nemmeno un account senza chiave può allegare una firma ibrida: non ha nulla rispetto a cui verificarla, quindi prima si registra.

Ogni comando di questa pagina, tranne la prima registrazione (`pqc register-key` / `pqc register-key-v2` su un account senza chiave), si esegue quindi in due passaggi: costruisci la transazione con `--generate-only`, poi firmala e trasmettila con `tx pqc cosign`. `pqc rotate-key` esegue da sé la cofirma e la trasmissione; `pqc gen-key` e `pqc recover-key` creano soltanto un file di chiave in locale:

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

`gen-key` e `recover-key` rifiutano di sovrascrivere un file di chiave esistente con quel nome; `--force` lo sostituisce e conserva il vecchio file come `<name>.dilithium.bak-<unix-time>`.

### register-key

Registra una chiave pubblica PQC per il tuo account (comando legacy: l'algoritmo è Dilithium-5). Una prima registrazione è firmata solo con la chiave classica; questa è l'esenzione di bootstrap. Un account che ha già una chiave deve firmarla con firma ibrida (`--generate-only`, poi `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` è `hybrid` (consigliato) oppure `pqc_only`. `classical_only` viene rifiutato (codice 230): non registra alcuna chiave post-quantistica, quindi l'account non potrebbe mai più firmare. La chiave pubblica di 2.592 byte rende la registrazione più costosa di un trasferimento, motivo per cui richiede il limite di gas più alto.

La chain rifiuta anche una chiave che non offre alcuna protezione post-quantistica (codice 230) e una chiave che questo account ha già usato in precedenza (codice 232). Rifiuta una registrazione la cui chiave classica non è quella del firmatario stesso (codice 45).

### register-key-v2

Registra una chiave con selezione esplicita dell'algoritmo e, facoltativamente, dimostra di possedere il segreto della chiave.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` è `dilithium5` (o `1`) oppure `mlkem1024` (o `2`); `key_type` è `hybrid` oppure `pqc_only`.

**Prova di possesso (facoltativa).** Con `--pqc-key <name>` (una chiave creata da `gen-key` o `recover-key`) il comando allega una prova di possesso: la firma della nuova chiave stessa su `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`. La chain la verifica quando è presente e rifiuta la registrazione se non risulta valida (codice 231); una registrazione senza di essa viene comunque accettata. La prova indica la chain, l'algoritmo, l'account e la chiave, quindi non dimostra nulla per un altro account o un'altra rete. Aggiunge alla transazione una firma di 4.627 byte, quindi mantieni il limite di gas a `600000`. La prova viaggia nel campo `proof_of_possession` del messaggio. L'SDK TypeScript 0.9.0 ne allega una da sé tramite `ensurePqcRegistered` una volta che la rete ha applicato la v3.2.3; le release precedenti dell'SDK e `@qorechain/wallet-adapter` non lo fanno, quindi una registrazione effettuata tramite di essi non porta alcuna prova (viene comunque accettata).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) il record dell'account riporta anche se una prova è stata verificata, come `possession_proven` (vedi [Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module)).

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

Entrambe le reti hanno applicato l'aggiornamento che ha spostato la verifica ibrida ai sign-bytes v2; la forma v1 viene rifiutata. Una transazione può portare una sola estensione di firma ibrida (più di una viene rifiutata dalla v3.2.3).

### migrate-key

Migra la chiave PQC del tuo account da un algoritmo a un altro. Deve essere attiva una migrazione per il tuo algoritmo attuale (avviata dalla governance); entrambe le chiavi firmano i byte della migrazione, e la transazione stessa richiede la tua firma ibrida (`--generate-only`, poi `tx pqc cosign`). Una chiave che l'account ha già usato in precedenza viene rifiutata (codice 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

Dalla v3.2.3 una rotazione rifiuta una nuova chiave che non offre alcuna protezione post-quantistica (codice 230) e una chiave che l'account ha già usato in precedenza (codice 232); l'account ricorda le chiavi da cui è passato, quindi una rotazione non può essere riprodotta per tornare a una chiave vecchia.

### open-evm-window

La lane EVM ammette una transazione solo da un account che detiene una chiave PQC registrata **e** ha una finestra di autorizzazione aperta. Una finestra si apre con un messaggio della lane Cosmos, che quindi porta la firma PQC che un wallet Ethereum non può fornire. All'interno della finestra, le normali transazioni MetaMask funzionano senza modifiche.

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

**Finestre con ambito limitato (mainnet v3.2.3 e successive).** Il limite di valore conta solo QOR nativo: un trasferimento di token, un'approvazione o qualsiasi altra chiamata a contratto porta valore zero e non viene conteggiata. Due flag facoltativi restringono ciò che la finestra ammette:

| Flag                | Effetto                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | Ammette solo semplici trasferimenti di QOR: nessun calldata, nessuna creazione di contratti, nessun destinatario che contenga codice, nessuna autorizzazione EIP-7702 |
| `--allowed-targets` | Ammette solo questi destinatari (indirizzi `0x` separati da virgole); la creazione di contratti viene rifiutata            |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

Una finestra aperta senza nessuno dei due flag ammette ciò che ha sempre ammesso. L'ambito è riportato dalla query della finestra come `native_only` e `allowed_targets`.

### close-evm-window

Chiude subito la tua finestra, ad esempio quando sospetti che la chiave classica sia compromessa. Revoca anche un consenso alla delega EIP-7702 in sospeso.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation e clear-evm-delegation

Una delega EIP-7702 del tuo account ha effetto solo con il tuo consenso post-quantistico (mainnet dalla v3.2.2). `authorize-evm-delegation` registra tale consenso per un indirizzo delegato; è monouso, scade dopo il numero di blocchi indicato ed è revocato da `close-evm-window`. `clear-evm-delegation` rimuove una delega già impostata. Entrambi sono messaggi della lane Cosmos con firma ibrida (`--generate-only`, poi `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

L'indirizzo zero come `delegate` acconsente alla rimozione della delega. Verifica lo stato con `qorechaind query pqc evm-delegation-consent <address>`.

Nessuno dei messaggi sulle chiavi PQC (`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`) può essere inviato per conto di un account tramite `authz` (mainnet v3.2.3 e successive).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` è `sx` oppure `ux`. La registrazione richiede una licenza `lightnode_operator` attiva, concessa dall'autorità delle licenze della rete; vedi [Light Node](/light-node/overview) per lo stato attuale del programma. Altri comandi: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

Dalla v3.2.3 la ricompensa che un nodo può accumulare è limitata **per mese** (`max_reward_per_month_per_node` in `GET /qorechain/lightnode/v1/reward_pool`, 2.000 QOR per 30 giorni), proporzionata al tempo di blocco e all'uptime, quindi il limite non dipende più dalla velocità con cui vengono prodotti i blocchi. Un limite è un tetto, non un importo promesso. Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) il limite di un nodo parte dalla sua registrazione anziché dal precedente settlement.

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

### register-validator / attest

Messaggi dei validator del bridge. `register-validator <pqc_pubkey_hex> <supported_chains_csv>` registra un validator per il compito di attestazione e `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` invia un'attestazione. Su nessuna delle due reti è registrato un validator del bridge. Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) la registrazione di un validator del bridge richiede anche una prova di possesso e una chiave che nessun altro validator del bridge usa.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

Amministrativo (licenza `bridge_admin` o `qcb_bridge`; i limiti del circuit breaker possono essere impostati anche dalla governance).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

I limiti sono in unità base e `0` significa illimitato. Solo una route il cui stato è esattamente `active` sposta valore.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Il primo `transfer` è il sottocomando e il secondo è la porta di origine. Al momento della stesura non è aperto alcun canale IBC sulla mainnet; la testnet ha un canale di trasferimento aperto (`channel-0`), verificato il 27 ottobre 2026 con `query ibc channel channels`.

---

## amm

Messaggi dell'AMM nativo. Al momento della stesura non esiste alcun pool su nessuna delle due reti, quindi questi comandi non hanno ancora nulla su cui agire.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

Dalla v3.2.2 uno swap deve indicare entrambe le denominazioni del pool, `max_swap_impact_bps` viene applicato e la commissione di protocollo è instradata attraverso il modulo burn.

Sulla testnet un pool può abbinare `uqor` a uno dei tre token di test Fest (senza valore; solo testnet). Il deposito e gli importi dello swap usano il bank denom `erc20:<indirizzo 0x EIP-55>`, che distingue maiuscole e minuscole, ad esempio `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json` (poi `tx pqc cosign`). Un token detenuto sul lato EVM deve prima essere convertito in un bank coin con `MsgConvertERC20`, il cui mittente è un indirizzo `qor1`; il comando CLI `qorechaind tx erc20 convert-erc20` della release del nodo v3.2.6 scrive il mittente come indirizzo `0x` e la chain lo rifiuta (`decoding bech32 failed`), quindi costruisci quel messaggio con il mittente `qor1`. Dettagli: [Token di test Fest della testnet](/developer-guide/evm-development#fest-tokens). La creazione di un pool costa la commissione di creazione del pool oltre ai depositi (`pool_creation_fee` in `query amm params`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

Sposta token nativi (ad esempio `1000000uqor`) nel float di conversione delle commissioni, la riserva di QOR che il modulo usa per pagare i validator quando una commissione viene pagata in un altro token accettato. La governance decide quali token sono accettati. Su entrambe le reti la configurazione accetta solo `uqor` nativo, quindi non avviene alcuna conversione; verificalo con `qorechaind query gasabstraction accepted-tokens`.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call` è disattivato sulla mainnet dal circuit breaker (vedi [sotto](#disabled-messages)) e sulla testnet funziona solo dove la lane di destinazione è disponibile. Una chiamata accodata (`--async`) che fallisce non lascia effetti collaterali, solo il suo record `Failed` (dalla v3.2.3), e una chiamata la cui lane di origine derivata coincide con la lane di destinazione viene rifiutata. Vedi [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability).

---

## stakingtier (v3.2.4) {#stakingtier}

:::note Disponibile dalla v3.2.4
Il modulo dei tier di staking è arrivato con la release **v3.2.4**: gira sulla testnet `qorechain-diana` dal 19 ottobre 2026 e sulla mainnet dal 23 ottobre 2026 (altezza 3.742.566, proposta di governance 13). Un nodo ancora su una release precedente non ha il modulo e questi comandi vengono rifiutati; controlla prima `GET /qorechain/stakingtier/v1/params` sul nodo che usi.
:::

Deleghe facoltative con blocco temporale: un delegatore può bloccare una parte di una delega esistente per 3, 6 o 12 mesi (il blocco minimo è 10 QOR) e in seguito riscuotere il bonus che il modulo accredita per essa. Un blocco è un record che si aggiunge alla delega: i fondi delegati restano presso il validator.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

Il blocco è applicato dal message server dello staking, quindi copre anche la revoca della delega tramite `authz`, un gruppo o un contratto. Terminare un blocco in anticipo comporta la perdita del bonus non pagato e il burn di una penale; l'importo minimo del blocco e gli altri parametri sono in `GET /qorechain/stakingtier/v1/params`. Come ogni transazione della lane Cosmos, richiedono la cofirma ibrida (`--generate-only`, poi `tx pqc cosign`) e un limite di gas generoso (ad esempio `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` è `defi`, `gaming`, `nft`, `enterprise` oppure `custom`; `stake_amount` è espresso in uqor (il minimo attuale si trova in `query rdk config`). Il preset del profilo fornisce settlement, sequencer, DA e modello del gas; da riga di comando si può sovrascrivere solo la VM. Non esiste alcun comando `finalize-batch`.

Su un rollup la cui disponibilità dei dati è `native` (o `both`), lascia vuoto `--data-hash`: nessuna transazione pubblica un blob di disponibilità dei dati, e la chain rifiuta un batch che dichiara un data hash per un tale rollup (è così che si comporta la release del nodo v3.2.4, la release mainnet al momento della stesura). Per un rollup optimistic, il client `@qorechain/rdk` (0.6.2) imposta la state root di un batch sulla transition root canonica della chain (`batchTransitionRoot` nell'RDK); vedi [Rollup](/rollups/overview).

`--anchor-signature` è la firma ML-DSA del creatore del rollup sui **sign bytes v2 dell'ancora**; con essa il batch viene ancorato anche nel modulo multilayer. Stampa i byte esatti da firmare con `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>`; i valori devono corrispondere ai flag di `submit-batch`. Dalla v3.2.3 il modulo mantiene un **registro di escrow per rollup**: un prelievo viene pagato solo con quanto contiene il registro di quel rollup, e vengono controllati denominazione, importo positivo, profondità della prova e dimensione dei sibling; l'arresto di un rollup rimborsa solo ciò che resta nel suo registro, e un rollup arrestato non paga ulteriori prelievi. Al momento della stesura non esiste alcun rollup su nessuna delle due reti.

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
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Mainnet: il permesso di upload e istanziazione è `Nobody` e i tre tipi di messaggio sono nell'elenco del circuit breaker. Testnet: l'upload è `Nobody` e `MsgStoreCode` è nell'elenco (il codice lo salva la governance), mentre l'istanziazione è aperta (`Everybody`) e fuori dall'elenco |
| `tx crossvm call`                                         | Disabilitato sulla mainnet dal circuit breaker; abilitato sulla testnet                        |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | Nell'elenco del circuit breaker della mainnet; dalla v3.2.3 un account in vesting può comunque essere creato solo per il firmatario stesso |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | Messaggi di proposta di governance (nessun comando CLI), nell'elenco del circuit breaker della mainnet; dalla v3.2.3 la governance non può inoltre rimuovere l'ultimo algoritmo di firma attivo |
| `tx svm deploy-program`, `execute`, `create-account`      | La lane di transazioni SVM è disabilitata su tutta la rete                                     |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Mainnet: il modulo abstract-account è disattivato (`query abstractaccount config` mostra `enabled: false`). Testnet: attivato dalla governance (`enabled: true`, verificato il 27 ottobre 2026) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Messaggi dell'autorità di governance; anch'essi nell'elenco del circuit breaker della mainnet  |
| `tx license *`                                            | Riservato all'autorità (le licenze sono concesse dall'autorità delle licenze della rete; dalla v3.2.3 la governance può sostituire tale autorità con `MsgUpdateAuthority`) |

L'elenco in vigore si ottiene con `qorechaind query circuit disabled-list`.
