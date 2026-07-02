---
slug: /cli-reference/node-commands
title: Comandi del nodo
sidebar_label: Comandi del nodo
sidebar_position: 1
---

# Comandi del nodo

Riferimento per i comandi `qorechaind` utilizzati per inizializzare, configurare e gestire un nodo QoreChain.

:::note
QoreChain esegue due reti: la mainnet **`qorechain-vladi`** (live dal 7 giugno 2026 sulla versione della chain **v3.1.82**) e la testnet **`qorechain-diana`**. Passa il `--chain-id` appropriato per la rete a cui intendi unirti — gli esempi seguenti puntano alla testnet; usa `--chain-id qorechain-vladi` per la mainnet.
:::

---

## init

Inizializza un nuovo nodo con il moniker indicato.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tipo   | Descrizione                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Identificatore della chain (obbligatorio)                    |
| `--home`      | string | Directory home del nodo (predefinita: `~/.qorechaind`) |
| `--overwrite` | bool   | Sovrascrive i file genesis e di configurazione esistenti    |

Crea la struttura di directory sotto `--home` con `config/`, `data/` e un `genesis.json` iniziale.

---

## start

Avvia il nodo e inizia la sincronizzazione o la produzione di blocchi.

```bash
qorechaind start [flags]
```

| Flag                   | Tipo   | Descrizione                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Directory home del nodo                                  |
| `--minimum-gas-prices` | string | Prezzi minimi del gas da accettare (es. `0.001uqor`)     |
| `--pruning`            | string | Strategia di pruning: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Ferma il nodo a questa altezza di blocco                   |
| `--halt-time`          | uint   | Ferma il nodo a questo timestamp Unix                 |
| `--log_level`          | string | Verbosità del log: `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | Abilita lo stack trace completo in caso di errori                    |

---

## version

Stampa la versione del binario `qorechaind` e le informazioni di build.

```bash
qorechaind version
```

Usa `--long` per dettagli di build estesi, inclusi versione di Go, hash del commit e build tag:

```bash
qorechaind version --long
```

---

## status

Interroga il nodo in esecuzione per ottenere il suo stato corrente, inclusi stato di sincronizzazione, ultima altezza di blocco e informazioni di consenso.

```bash
qorechaind status
```

| Flag     | Tipo   | Descrizione                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | Endpoint RPC (predefinito: `tcp://localhost:26657`) |

Restituisce JSON con le sezioni `node_info`, `sync_info` e `validator_info`.

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

| Flag                   | Tipo   | Descrizione                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `test`                   |
| `--algo`               | string | Algoritmo della chiave: `secp256k1` (predefinito), `ed25519` |
| `--recover`            | bool   | Recupera la chiave da una frase mnemonica                       |
| `--multisig`           | string | Elenco di chiavi separate da virgola per il multisig       |
| `--multisig-threshold` | uint   | Numero minimo di firme richieste                     |

### Elencare tutte le chiavi

```bash
qorechaind keys list --keyring-backend <backend>
```

### Mostrare i dettagli di una chiave

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Tipo   | Descrizione                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Formato di output: `acc`, `val`, `cons` |
| `--address` | bool   | Mostra solo l'indirizzo                   |
| `--pubkey`  | bool   | Mostra solo la chiave pubblica                |

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

Gestisce il file genesis.

### Aggiungere un account genesis

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Tipo   | Descrizione                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Importo di vesting                    |
| `--vesting-end-time` | int    | Orario di fine vesting (timestamp Unix) |

### Creare una transazione genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Tipo   | Descrizione             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Identificatore della chain        |
| `--moniker`             | string | Moniker del validatore       |
| `--commission-rate`     | string | Tasso di commissione iniziale |
| `--commission-max-rate` | string | Tasso di commissione massimo |

### Raccogliere le transazioni genesis

```bash
qorechaind genesis collect-gentxs
```

### Validare il file genesis

```bash
qorechaind genesis validate-genesis
```

---

## Motore di consenso

Questi sottocomandi interagiscono con il livello del Motore di consenso di QoreChain.

### Mostrare la chiave del validatore

```bash
qorechaind comet show-validator
```

Restituisce la chiave pubblica di consenso in formato JSON. Usata per verificare l'identità del validatore.

### Mostrare l'ID del nodo

```bash
qorechaind comet show-node-id
```

Restituisce l'identificatore P2P del nodo (codificato in hex). Usato per la configurazione dei peer persistenti.

---

## export

Esporta lo stato corrente della chain come file genesis JSON. Utile per gli aggiornamenti della chain o per gli snapshot.

```bash
qorechaind export [flags]
```

| Flag                | Tipo   | Descrizione                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Prepara l'export per il riavvio all'altezza 0 |
| `--height`          | int    | Esporta lo stato a una specifica altezza di blocco   |
| `--home`            | string | Directory home del nodo                       |

---

## rollback

Esegue il rollback dello stato della chain di un blocco. Utile per recuperare da un fallimento del consenso.

```bash
qorechaind rollback [flags]
```

| Flag     | Tipo   | Descrizione                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Rimuove anche l'ultimo blocco dal block store |
| `--home` | string | Directory home del nodo                                |

Questo comando esegue il rollback sia dello stato dell'applicazione sia dello stato di consenso. Usalo con cautela, poiché non può essere annullato.
