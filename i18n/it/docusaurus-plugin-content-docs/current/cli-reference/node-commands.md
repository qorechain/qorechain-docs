---
slug: /cli-reference/node-commands
title: Comandi del nodo
sidebar_label: Comandi del nodo
sidebar_position: 1
---

# Comandi del nodo

Riferimento per i comandi `qorechaind` usati per inizializzare, configurare e gestire un nodo QoreChain.

:::note
QoreChain gestisce due reti: la mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026 sulla versione di chain **v3.1.95**) e la testnet **`qorechain-diana`**. Passa il `--chain-id` appropriato per la rete a cui vuoi collegarti — gli esempi seguenti fanno riferimento alla testnet; usa `--chain-id qorechain-vladi` per la mainnet.
:::

---

## init

Inizializza un nuovo nodo con il moniker indicato.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tipo   | Descrizione                                          |
| ------------- | ------ | ----------------------------------------------------- |
| `--chain-id`  | string | Identificatore della chain (obbligatorio)              |
| `--home`      | string | Directory home del nodo (predefinita: `~/.qorechaind`) |
| `--overwrite` | bool   | Sovrascrive i file di genesis e configurazione esistenti |

Crea la struttura di directory sotto `--home` con `config/`, `data/` e un `genesis.json` iniziale.

---

## start

Avvia il nodo e inizia la sincronizzazione o la produzione dei blocchi.

```bash
qorechaind start [flags]
```

| Flag                   | Tipo   | Descrizione                                                |
| ---------------------- | ------ | ------------------------------------------------------------ |
| `--home`               | string | Directory home del nodo                                       |
| `--minimum-gas-prices` | string | Prezzi minimi del gas accettati (es. `0.001uqor`)             |
| `--pruning`            | string | Strategia di pruning: `default`, `nothing`, `everything`      |
| `--halt-height`        | uint   | Ferma il nodo a questa altezza di blocco                      |
| `--halt-time`          | uint   | Ferma il nodo a questo timestamp Unix                         |
| `--log_level`          | string | Livello di verbosità dei log: `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Abilita lo stack trace completo in caso di errori             |

---

## version

Stampa la versione del binario `qorechaind` e le informazioni di build.

```bash
qorechaind version
```

Usa `--long` per dettagli di build estesi, tra cui la versione di Go, l'hash del commit e i build tag:

```bash
qorechaind version --long
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

## config

Legge o scrive valori nella configurazione del nodo.

### Impostare un valore di configurazione

```bash
qorechaind config set <key> <value>
```

### Ottenere un valore di configurazione

```bash
qorechaind config get <key>
```

Le chiavi di configurazione comuni includono `chain-id`, `keyring-backend`, `output` e `node`.

---

## keys

Gestisce il keyring locale per la firma delle transazioni.

### Aggiungere una nuova chiave

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Tipo   | Descrizione                                          |
| ---------------------- | ------ | ------------------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `test`                            |
| `--algo`               | string | Algoritmo della chiave: `secp256k1` (predefinito), `ed25519` |
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

### Convalidare il file di genesis

```bash
qorechaind genesis validate-genesis
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
