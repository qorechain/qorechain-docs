---
slug: /user-guide/token-operations
title: Operațiuni cu token-uri
sidebar_label: Operațiuni cu token-uri
sidebar_position: 1
---

# Operațiuni cu token-uri

Acest ghid acoperă token-ul QOR, modul de trimitere și primire a token-urilor, interogarea soldurilor și înțelegerea modelului de distribuire a comisioanelor pe QoreChain.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026, rulând versiunea de chain **v3.1.82** — înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când efectuați tranzacții pe mainnet.
:::

## Informații despre token

| Proprietate              | Valoare                       |
| ------------------------ | ----------------------------- |
| **Denominație de afișare** | QOR                         |
| **Denominație de bază**    | uqor                        |
| **Conversie**           | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Prefix Bech32**        | `qor` (de ex., `qor1abc...xyz`) |

Toate sumele on-chain sunt denominate în **uqor**. La trimiterea tranzacțiilor, specificați întotdeauna sumele în uqor.

## Trimiterea token-urilor

Pentru a transfera token-uri QOR dintr-un cont în altul:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:** Trimiteți 5 QOR (5.000.000 uqor) către o altă adresă:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Puteți folosi, de asemenea, un nume de cheie în loc de o adresă brută pentru expeditor:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Interogarea soldurilor

Verificați soldul oricărui cont:

```bash
qorechaind query bank balances <address>
```

**Exemplu:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Exemplu de rezultat:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Aceasta indică faptul că contul deține 15 QOR (15.000.000 uqor).

## Structura comisioanelor

Comisioanele de tranzacție pe QoreChain sunt distribuite către cinci destinații pentru a alinia stimulentele rețelei:

| Destinație      | Cotă  | Scop                                                            |
| --------------- | ----- | --------------------------------------------------------------- |
| **Validatori**  | 37%   | Recompensează producătorii de blocuri și securizează rețeaua    |
| **Ars**         | 30%   | Eliminat permanent din ofertă, creând presiune deflaționistă    |
| **Trezorerie**  | 20%   | Finanțează dezvoltarea protocolului și granturile ecosistemului |
| **Stakeri**     | 10%   | Distribuit proporțional tuturor delegatorilor                   |
| **Light Nodes** | 3%    | Recompensează operatorii de light-node care servesc date de rețea |

## Canale de ardere

QoreChain implementează un mecanism de ardere multi-canal. Token-urile QOR sunt eliminate permanent din circulație prin 10 canale distincte:

| Canal                | Descriere                                                           |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | Porțiunea de ardere de 30% din fiecare comision de tranzacție       |
| `governance_penalty` | Ars când propunerile de guvernanță nu ating cvorumul sau sunt blocate prin veto |
| `slashing_burn`      | Porțiunea arsă din stake-urile de validator supuse slashing-ului    |
| `bridge_fee`         | Comision ars la transferurile prin bridge cross-chain               |
| `spam_deterrent`     | Ardere suplimentară aplicată tranzacțiilor marcate ca spam          |
| `epoch_excess`       | Emisiuni în exces peste țintă arse la granițele de epocă            |
| `manual_burn`        | Arderi de token-uri inițiate de comunitate prin propunere de guvernanță |
| `contract_callback`  | Comisioane arse la execuțiile de callback ale contractelor inteligente |
| `cross_vm_fee`       | Ars la executarea apelurilor cross-VM (de ex., EVM către CosmWasm)  |
| `rollup_create`      | 1% din stake-ul minim ars la implementarea unui nou rollup          |

Puteți interoga suma totală arsă pe toate canalele:

```bash
qorechaind query bank total --denom uqor
```

## Sfaturi

:::caution
Verificați întotdeauna de două ori adresele destinatarilor înainte de a trimite token-uri. Tranzacțiile pe QoreChain sunt ireversibile.
:::

:::tip

* Folosiți flag-ul `--dry-run` pentru a simula o tranzacție fără a o difuza.
* Folosiți `--gas auto` pentru a permite nodului să estimeze gaz-ul necesar tranzacției dumneavoastră.
* Comisionul minim pentru un transfer standard este de **500 uqor**.

:::
