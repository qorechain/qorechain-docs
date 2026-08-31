---
slug: /user-guide/token-operations
title: Operazioni sui Token
sidebar_label: Operazioni sui Token
sidebar_position: 1
---

# Operazioni sui Token

Questa guida illustra il token QOR, come inviare e ricevere token, interrogare i saldi e comprendere il modello di distribuzione delle commissioni su QoreChain.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.1.95** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connecting to Mainnet** quando effettui transazioni sulla mainnet.
:::

## Informazioni sul Token

| Proprietà                    | Valore                         |
| ----------------------------- | ----------------------------- |
| **Denominazione visualizzata** | QOR                           |
| **Denominazione di base**      | uqor                          |
| **Conversione**                | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain ID**                   | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Prefisso Bech32**            | `qor` (es. `qor1abc...xyz`) |

Tutti gli importi on-chain sono denominati in **uqor**. Quando si inviano transazioni, specificare sempre gli importi in uqor.

## Invio di Token

Per trasferire token QOR da un account a un altro:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:** invia 5 QOR (5.000.000 uqor) a un altro indirizzo:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

È possibile utilizzare anche il nome di una chiave al posto di un indirizzo grezzo per il mittente:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Interrogazione dei Saldi

Verifica il saldo di un account:

```bash
qorechaind query bank balances <address>
```

**Esempio:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Output di esempio:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Questo indica che l'account detiene 15 QOR (15.000.000 uqor).

## Struttura delle Commissioni

Le commissioni di transazione su QoreChain vengono distribuite tra cinque destinazioni per allineare gli incentivi della rete:

| Destinazione     | Quota | Finalità                                                         |
| ---------------- | ----- | --------------------------------------------------------------- |
| **Validatori**    | 37%   | Ricompensa i produttori di blocchi e mette in sicurezza la rete |
| **Bruciati**      | 30%   | Rimossi permanentemente dalla supply, creando pressione deflazionistica |
| **Tesoreria**     | 20%   | Finanzia lo sviluppo del protocollo e le grant per l'ecosistema |
| **Staker**        | 10%   | Distribuiti proporzionalmente a tutti i delegatori              |
| **Light Node**    | 3%    | Ricompensa gli operatori di light node che servono dati di rete |

## Canali di Burn

QoreChain implementa un meccanismo di burn multi-canale. I token QOR vengono rimossi permanentemente dalla circolazione attraverso 10 canali distinti:

| Canale                | Descrizione                                                         |
| --------------------- | -------------------------------------------------------------------- |
| `tx_fee`               | La quota di burn del 30% di ogni commissione di transazione          |
| `governance_penalty`   | Bruciato quando le proposte di governance non raggiungono il quorum o vengono respinte con veto |
| `slashing_burn`        | Quota bruciata degli stake dei validatori sottoposti a slashing      |
| `bridge_fee`           | Commissione bruciata sui trasferimenti tramite bridge cross-chain    |
| `spam_deterrent`       | Burn aggiuntivo applicato alle transazioni segnalate come spam       |
| `epoch_excess`         | Emissioni in eccesso rispetto al target, bruciate ai confini di epoca |
| `manual_burn`          | Burn di token avviati dalla community tramite proposta di governance |
| `contract_callback`    | Commissioni bruciate sulle esecuzioni di callback degli smart contract |
| `cross_vm_fee`         | Bruciato durante l'esecuzione di chiamate cross-VM (es. da EVM a CosmWasm) |
| `rollup_create`        | 1% dello stake minimo bruciato al momento del deploy di un nuovo rollup |

Puoi interrogare l'importo totale bruciato su tutti i canali:

```bash
qorechaind query bank total --denom uqor
```

## Suggerimenti

:::caution
Verifica sempre due volte gli indirizzi dei destinatari prima di inviare token. Le transazioni su QoreChain sono irreversibili.
:::

:::tip

* Usa il flag `--dry-run` per simulare una transazione senza trasmetterla.
* Usa `--gas auto` per lasciare che il nodo stimi il gas necessario per la tua transazione.
* La commissione minima per un trasferimento standard è **500 uqor**.

:::
