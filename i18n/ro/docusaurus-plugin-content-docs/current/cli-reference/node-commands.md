---
slug: /cli-reference/node-commands
title: Comenzi pentru nod
sidebar_label: Comenzi pentru nod
sidebar_position: 1
---

# Comenzi pentru nod

Referință pentru comenzile `qorechaind` utilizate pentru inițializarea, configurarea și operarea unui nod QoreChain.

:::note
QoreChain rulează două rețele: mainnet-ul **`qorechain-vladi`** (live din 29 iunie 2026; versiunea curentă a nodului este **v3.2.1**) și testnet-ul **`qorechain-diana`** (versiunea nodului **v3.2.2**). Transmite `--chain-id` corespunzător rețelei la care intenționezi să te alături — exemplele de mai jos vizează testnet-ul; folosește `--chain-id qorechain-vladi` pentru mainnet. Versiunea curentă pentru fiecare rețea este listată în `latest.json` de pe [download.qore.host](https://download.qore.host).
:::

---

## init

Inițializează un nod nou cu monikerul dat.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tip   | Descriere                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Identificatorul lanțului (transmite-l întotdeauna; dacă lipsește, se creează unul aleatoriu) |
| `--home`      | string | Directorul home al nodului (implicit: `~/.qorechaind`) |
| `--overwrite` | bool   | Suprascrie `genesis.json` existent    |
| `--recover`   | bool   | Furnizează o frază seed pentru a recupera o cheie existentă în loc să creezi una nouă |

Creează structura de directoare sub `--home` cu `config/`, `data/` și un `genesis.json` inițial. Pentru un nod de rețea, înlocuiește acel `genesis.json` cu fișierul genesis al rețelei înainte de pornire (vezi [Conectarea la mainnet](/getting-started/connecting-to-mainnet)).

`init` scrie, de asemenea, ID-ul de lanț EVM al rețelei (`9801` pentru `qorechain-vladi`, `9800` pentru `qorechain-diana`) în setarea `evm-chain-id` din `app.toml`, așa că transmite `--chain-id` corect.

---

## start

Pornește nodul și începe sincronizarea sau producerea de blocuri.

```bash
qorechaind start [flags]
```

| Flag                   | Tip   | Descriere                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Directorul home al nodului                                  |
| `--minimum-gas-prices` | string | Prețul minim de gas pe care îl acceptă acest nod. Pragul rețelei este `0.1uqor`; setează cel puțin această valoare |
| `--pruning`            | string | Strategie de curățare: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Oprește nodul la această înălțime de bloc                   |
| `--halt-time`          | uint   | Oprește nodul la această marcă temporală Unix                 |
| `--log_level`          | string | Nivel de detaliere a jurnalelor: `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | Activează urmărirea completă a stivei la erori                    |

---

## version

Afișează versiunea binarului `qorechaind` și informațiile de build.

```bash
qorechaind version
```

Folosește `--long` pentru detalii extinse de build, inclusiv versiunea Go, hash-ul commit-ului și tag-urile de build:

```bash
qorechaind version --long
```

---

## status

Interoghează nodul în execuție pentru starea sa curentă, inclusiv starea de sincronizare, ultima înălțime de bloc și informațiile de consens.

```bash
qorechaind status
```

| Flag     | Tip   | Descriere                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | Endpoint RPC (implicit: `tcp://localhost:26657`) |

Returnează JSON cu secțiunile `node_info`, `sync_info` și `validator_info`.

---

## client configuration

Nu există o subcomandă `config`. Valorile implicite ale clientului (`chain-id`, `keyring-backend`, `output`, `node`) sunt citite din `<home>/config/client.toml`; editează acel fișier sau transmite flag-ul la fiecare comandă (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

Gestionează keyring-ul local pentru semnarea tranzacțiilor.

### Adăugarea unei chei noi

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Tip   | Descriere                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Algoritmul cheii: `secp256k1` (implicit) sau `eth_secp256k1` |
| `--coin-type`          | uint32 | Tipul de monedă HD (implicit `118`)                    |
| `--recover`            | bool   | Recuperează cheia din mnemonic                       |
| `--multisig`           | string | Listă de chei separate prin virgulă pentru multisig       |
| `--multisig-threshold` | uint   | Numărul minim de semnături necesare                     |

### Listarea tuturor cheilor

```bash
qorechaind keys list --keyring-backend <backend>
```

### Afișarea detaliilor unei chei

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Tip   | Descriere                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Format de ieșire: `acc`, `val`, `cons` |
| `--address` | bool   | Afișează doar adresa                   |
| `--pubkey`  | bool   | Afișează doar cheia publică                |

### Ștergerea unei chei

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Exportarea unei chei (criptată cu armor)

```bash
qorechaind keys export <name>
```

### Importarea unei chei

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Gestionează fișierul genesis.

### Adăugarea unui cont genesis

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Tip   | Descriere                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Suma de vesting                    |
| `--vesting-start-time` | int  | Timpul de începere a vesting-ului (marcă temporală Unix) |
| `--vesting-end-time` | int    | Timpul de încheiere a vesting-ului (marcă temporală Unix) |

### Crearea unei tranzacții genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Tip   | Descriere             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Identificatorul lanțului        |
| `--moniker`             | string | Monikerul validatorului       |
| `--commission-rate`     | string | Rata de comision inițială |
| `--commission-max-rate` | string | Rata maximă de comision |

### Colectarea tranzacțiilor genesis

```bash
qorechaind genesis collect-gentxs
```

Alte subcomenzi `genesis`: `bulk-add-genesis-account` și `migrate`.

### Validarea fișierului genesis

```bash
qorechaind genesis validate
```

---

## Motorul de consens

Aceste subcomenzi interacționează cu stratul Motorului de consens QoreChain.

### Afișarea cheii de validator

```bash
qorechaind comet show-validator
```

Afișează cheia publică de consens în format JSON. Folosită pentru a verifica identitatea validatorului.

### Afișarea ID-ului nodului

```bash
qorechaind comet show-node-id
```

Afișează identificatorul de nod P2P (codificat hexazecimal). Folosit pentru configurarea peer-ilor persistenți.

---

## export

Exportă starea curentă a lanțului ca fișier genesis JSON. Util pentru upgrade-uri de lanț sau snapshot-uri.

```bash
qorechaind export [flags]
```

| Flag                | Tip   | Descriere                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Pregătește exportul pentru repornire la înălțimea 0 |
| `--height`          | int    | Exportă starea la o anumită înălțime de bloc   |
| `--home`            | string | Directorul home al nodului                       |
| `--output-document` | string | Scrie exportul în acest fișier în loc de STDOUT |
| `--modules-to-export` | strings | Listă de module de exportat, separate prin virgulă (implicit: toate) |
| `--jail-allowed-addrs` | strings | Adresele operatorilor validatorilor aflați în jail care vor fi scoși din jail |

---

## rollback

Revine starea lanțului cu un bloc. Util pentru recuperarea în urma unui eșec de consens.

```bash
qorechaind rollback [flags]
```

| Flag     | Tip   | Descriere                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Elimină și ultimul bloc din block store |
| `--home` | string | Directorul home al nodului                                |

Această comandă revine atât starea aplicației, cât și starea de consens. Folosește cu atenție, deoarece nu poate fi anulată.
