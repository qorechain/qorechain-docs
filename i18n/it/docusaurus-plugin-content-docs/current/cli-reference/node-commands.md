---
slug: /cli-reference/node-commands
title: Comandi del nodo
sidebar_label: Comandi del nodo
sidebar_position: 1
---

# Comandi del nodo

Riferimento per i comandi `qorechaind` usati per inizializzare, configurare e gestire un nodo QoreChain.

:::note
QoreChain gestisce due reti: la mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026; release del nodo **v3.2.3**, applicata all'altezza 3.662.051 il 20 ottobre 2026; la mainnet esegue la v3.2.3 fino all'altezza 3.742.566 e la **v3.2.4** da quel blocco, programmata dalla proposta di governance 13) e la testnet **`qorechain-diana`** (release del nodo **v3.2.4**, applicata all'altezza 8.337.253 il 19 ottobre 2026). Passa il `--chain-id` appropriato per la rete a cui vuoi collegarti — gli esempi seguenti fanno riferimento alla testnet; usa `--chain-id qorechain-vladi` per la mainnet. La release attuale di ciascuna rete è indicata in `latest.json` su [download.qore.host](https://download.qore.host).

I comandi di questa pagina sono stati verificati con il binario della release v3.2.3. Il binario v3.2.4 aggiunge comandi che un binario v3.2.3 non ha (per esempio `stakingtier`); funzionano sulla testnet ora e sulla mainnet dall'altezza 3.742.566, e dove questo manuale ne cita uno lo indica.
:::

---

## init

Inizializza un nuovo nodo con il moniker indicato.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tipo   | Descrizione                                          |
| ------------- | ------ | ----------------------------------------------------- |
| `--chain-id`  | string | Identificatore della chain (indicalo sempre; se omesso ne viene creato uno casuale) |
| `--home`      | string | Directory home del nodo (predefinita: `~/.qorechaind`) |
| `--overwrite` | bool   | Sovrascrive il `genesis.json` esistente                |
| `--recover`   | bool   | Fornisce una seed phrase per recuperare una chiave esistente invece di crearne una |

Crea la struttura di directory sotto `--home` con `config/`, `data/` e un `genesis.json` iniziale. Per un nodo di rete, sostituisci questo `genesis.json` con il file di genesis della rete prima di avviare il nodo (vedi [Connessione alla mainnet](/getting-started/connecting-to-mainnet)).

`init` scrive inoltre l'ID di chain EVM della rete (`9801` per `qorechain-vladi`, `9800` per `qorechain-diana`) nell'impostazione `evm-chain-id` di `app.toml`, quindi passa il `--chain-id` corretto.

---

## start

Avvia il nodo e inizia la sincronizzazione o la produzione dei blocchi.

```bash
qorechaind start [flags]
```

| Flag                   | Tipo   | Descrizione                                                |
| ---------------------- | ------ | ------------------------------------------------------------ |
| `--home`               | string | Directory home del nodo                                       |
| `--minimum-gas-prices` | string | Prezzo minimo del gas accettato da questo nodo. Il minimo della rete è `0.1uqor`; imposta almeno questo valore |
| `--pruning`            | string | Strategia di pruning: `default`, `nothing`, `everything`, `custom` (con `--pruning-keep-recent` e `--pruning-interval`) |
| `--halt-height`        | uint   | Ferma il nodo a questa altezza di blocco                      |
| `--halt-time`          | uint   | Ferma il nodo a questo timestamp Unix                         |
| `--log_level`          | string | Livello di verbosità dei log: `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Abilita lo stack trace completo in caso di errori             |

Un binario compilato dall'albero dei sorgenti pubblico (la build della community) rifiuta di avviarsi su `qorechain-vladi` o `qorechain-diana`: non può verificare le firme post-quantistiche e non può rieseguire fedelmente i blocchi delle reti (release del nodo v3.2.3 e successive). Usa il binario di release da [download.qore.host](https://download.qore.host); vedi [Compilazione dal sorgente](/developer-guide/building-from-source).

---

## version

`qorechaind version` **non** riporta il numero di release sui binari di release: stampa una riga vuota, e `version --long` non aggiunge dettagli di build. Non fare affidamento su di esso per distinguere le release. Per confermare cosa stai eseguendo:

- Confronta lo SHA-256 dell'**archivio scaricato** con `binary.sha256` nel [manifest](https://download.qore.host/mainnet/latest.json) della rete prima di estrarlo (e conserva quell'archivio, o il suo checksum, come registrazione di ciò che hai installato).
- Chiedi alla chain quali upgrade ha applicato: `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` restituisce l'altezza a cui un upgrade è stato applicato, oppure `0` se non è stato applicato.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 been applied on mainnet, and at which height?
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
```

---

## status

Interroga il nodo in esecuzione per conoscerne lo stato attuale, inclusi lo stato di sincronizzazione, l'altezza dell'ultimo blocco e le informazioni sul consenso.

```bash
qorechaind status
```

| Flag     | Tipo   | Descrizione                                            |
| -------- | ------ | -------------------------------------------------------- |
| `--node` | string | Endpoint RPC (predefinito: `tcp://localhost:26657`)       |

Restituisce un JSON con le sezioni `node_info`, `sync_info` e `validator_info`.

---

## client configuration

Non esiste un sottocomando `config`. I valori predefiniti del client (`chain-id`, `keyring-backend`, `output`, `node`) vengono letti da `<home>/config/client.toml`; modifica quel file oppure passa il flag a ogni comando (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

Gestisce il keyring locale per la firma delle transazioni.

### Aggiungere una nuova chiave

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Tipo   | Descrizione                                          |
| ---------------------- | ------ | ------------------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Algoritmo della chiave: `secp256k1` (predefinito) o `eth_secp256k1` |
| `--coin-type`          | uint32 | Coin type HD (predefinito `118`)                         |
| `--recover`            | bool   | Recupera la chiave da mnemonic                           |
| `--multisig`           | string | Elenco separato da virgole delle chiavi per il multisig  |
| `--multisig-threshold` | uint   | Numero minimo di firme richieste                         |

### Elencare tutte le chiavi

```bash
qorechaind keys list --keyring-backend <backend>
```

### Mostrare i dettagli di una chiave

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Tipo   | Descrizione                                |
| ----------- | ------ | --------------------------------------------- |
| `--bech`    | string | Formato di output: `acc`, `val`, `cons`        |
| `--address` | bool   | Mostra solo l'indirizzo                        |
| `--pubkey`  | bool   | Mostra solo la chiave pubblica                 |

### Eliminare una chiave

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Esportare una chiave (cifrata con armor)

```bash
qorechaind keys export <name>
```

### Importare una chiave

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Gestisce il file di genesis.

### Aggiungere un account di genesis

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Tipo   | Descrizione                              |
| -------------------- | ------ | -------------------------------------------- |
| `--vesting-amount`   | string | Importo in vesting                            |
| `--vesting-start-time` | int  | Data di inizio vesting (timestamp Unix)       |
| `--vesting-end-time` | int    | Data di fine vesting (timestamp Unix)         |

### Creare una transazione di genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Tipo   | Descrizione                    |
| ----------------------- | ------ | ---------------------------------- |
| `--chain-id`            | string | Identificatore della chain           |
| `--moniker`             | string | Moniker del validatore                |
| `--commission-rate`     | string | Tasso di commissione iniziale         |
| `--commission-max-rate` | string | Tasso di commissione massimo          |

### Raccogliere le transazioni di genesis

```bash
qorechaind genesis collect-gentxs
```

Altri sottocomandi di `genesis`: `bulk-add-genesis-account` e `migrate`.

### Convalidare il file di genesis

```bash
qorechaind genesis validate
```

---

## Motore di consenso

Questi sottocomandi interagiscono con il livello del motore di consenso di QoreChain.

### Mostrare la chiave del validatore

```bash
qorechaind comet show-validator
```

Restituisce la chiave pubblica di consenso in formato JSON. Utile per verificare l'identità del validatore.

### Mostrare l'ID del nodo

```bash
qorechaind comet show-node-id
```

Restituisce l'identificatore P2P del nodo (codificato in esadecimale). Utile per la configurazione dei peer persistenti.

---

## export

Esporta lo stato attuale della chain come file JSON di genesis. Utile per gli upgrade della chain o per gli snapshot.

```bash
qorechaind export [flags]
```

| Flag                | Tipo   | Descrizione                                     |
| ------------------- | ------ | ---------------------------------------------------- |
| `--for-zero-height` | bool   | Prepara l'esportazione per riavviare all'altezza 0    |
| `--height`          | int    | Esporta lo stato a un'altezza di blocco specifica     |
| `--home`            | string | Directory home del nodo                                |
| `--output-document` | string | Scrive l'esportazione in questo file invece che su STDOUT |
| `--modules-to-export` | strings | Elenco separato da virgole dei moduli da esportare (predefinito: tutti) |
| `--jail-allowed-addrs` | strings | Indirizzi operatore dei validatori in jail da rimettere in attività |

---

## rollback

Riporta indietro lo stato della chain di un blocco. Utile per il recupero da un errore di consenso.

```bash
qorechaind rollback [flags]
```

| Flag     | Tipo   | Descrizione                                           |
| -------- | ------ | --------------------------------------------------------- |
| `--hard` | bool   | Rimuove anche l'ultimo blocco dal block store               |
| `--home` | string | Directory home del nodo                                     |

Questo comando riporta indietro sia lo stato dell'applicazione sia lo stato del consenso. Usalo con cautela: l'operazione non può essere annullata.
