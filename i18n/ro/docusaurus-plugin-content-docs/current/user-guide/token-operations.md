---
slug: /user-guide/token-operations
title: Operațiuni cu token-uri
sidebar_label: Operațiuni cu token-uri
sidebar_position: 1
---

# Operațiuni cu token-uri

Acest ghid acoperă token-ul QOR, modul de trimitere și primire a token-urilor, interogarea soldurilor și înțelegerea modelului de distribuire a comisioanelor pe QoreChain.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026 și rulează versiunea **v3.2.5** din 29 octombrie 2026 (v3.2.4 din 23 octombrie); testnet-ul rulează **v3.2.6** (din 27 octombrie 2026) — înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când efectuați tranzacții pe mainnet.
:::

:::caution Semnați cu `tx pqc cosign`
Mainnet-ul și testnet-ul cer o semnătură post-cuantică hibridă pentru fiecare tranzacție pe lane-ul Cosmos, așa că comenzile de pe această pagină nu se transmit în rețea așa cum sunt scrise. Adăugați `--generate-only > tx.json` la o comandă, apoi rulați `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Vezi [Semnarea hibridă](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) și [Dashboard-ul](/dashboard/overview) fac această semnare pentru dumneavoastră.
:::

## Informații despre token

| Proprietate               | Valoare                       |
| -------------------------- | ----------------------------- |
| **Denominație de afișare** | QOR                           |
| **Denominație de bază**    | uqor                          |
| **Conversie**              | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain ID**                | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Prefix Bech32**          | `qor` (de ex., `qor1abc...xyz`) |

Toate sumele on-chain sunt denominate în **uqor**. La trimiterea tranzacțiilor, specificați întotdeauna sumele în uqor.

## Trimiterea token-urilor

Pentru a transfera token-uri QOR dintr-un cont în altul:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemplu:** Trimiteți 5 QOR (5.000.000 uqor) către o altă adresă:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Puteți folosi, de asemenea, un nume de cheie în loc de o adresă brută pentru expeditor:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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

| Destinație      | Cotă  | Scop                                                             |
| --------------- | ----- | ----------------------------------------------------------------- |
| **Validatori**  | 37%   | Recompensează producătorii de blocuri și securizează rețeaua      |
| **Ars**         | 30%   | Eliminat permanent din ofertă                                     |
| **Trezorerie**  | 20%   | Finanțează dezvoltarea protocolului și granturile ecosistemului   |
| **Stakeri**     | 10%   | Distribuit proporțional tuturor delegatorilor                     |
| **Light Nodes** | 3%    | Recompensele light node-urilor (vezi nota de mai jos)             |

Împărțirea se aplică tuturor sumelor care intră în colectorul de comisioane, care deține comisioanele de tranzacție și emisia de staking creată la fiecare epocă. Cota light node-urilor se acumulează în rezerva de recompense pentru light node-uri; înregistrarea este deschisă și condiționată de licență; pe 27 octombrie 2026 a fost înregistrat câte un light node pe fiecare rețea (vezi [Light Node](/light-node/overview#reward-program-status)). De la upgrade-ul v3.2.0, cota stakerilor este plătită ca o recompensă obișnuită de staking (vezi [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Canale de ardere

Modulul de ardere al QoreChain definește 12 surse de ardere. QOR ars prin oricare dintre ele este eliminat permanent din circulație. Pe mainnet, până acum doar canalele comisioanelor de gaz și ale tranzacțiilor eșuate au înregistrat arderi; celelalte sunt definite, dar nu au înregistrat nimic. De la v3.2.4 (testnet din 19 octombrie 2026, mainnet din 23 octombrie 2026) există o a treisprezecea sursă, `staking_tier_penalty`, pentru modulul opțional de staking cu blocare în timp.

| Canal              | Descriere                                                                        |
| ------------------ | -------------------------------------------------------------------------------- |
| `gas_fee`          | 30% din toate comisioanele de gaz sunt arse                                       |
| `contract_create`  | Comision fix de 100 QOR ars la fiecare creare de contract (inactiv: încărcarea QoreChain Native este închisă) |
| `ai_service`       | 50% din comisioanele serviciilor AI sunt arse (inactiv: comisioanele serviciilor AI nu sunt live) |
| `bridge_fee`       | 100% din comisioanele bridge-ului sunt arse (inactiv: bridge-ul nu este live)     |
| `treasury_buyback` | Răscumpărare și ardere periodică din trezorerie                                   |
| `failed_tx`        | 10% din gazul tranzacțiilor eșuate; aplicat de lanț începând cu v3.2.2            |
| `xqore_penalty`    | Penalizările de ieșire anticipată xQORE direcționate prin ardere (xQORE nu este live) |
| `auto_buyback`     | Arderi automate la nivel de protocol (inactiv)                                    |
| `tge`              | Rezervat; arderea TGE a avut loc înainte de genesis, iar acest canal nu înregistrează nimic |
| `rollup_create`    | 1% din stake-ul de creare a rollup-ului este ars                                  |
| `milestone`        | Arderi programate la numere cumulative fixe de tranzacții (încă niciuna declanșată) |
| `amm`              | Rezervat pentru comisioanele de protocol AMM (nimic înregistrat)                  |

Modulul de ardere nu are interogare CLI; citiți arderea cumulată pe fiecare sursă din REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

Răspunsul listează `total_burned` și `burns_by_source` (în uqor). Oferta totală curentă se obține cu `qorechaind query bank total-supply-of uqor`.

## Sfaturi

:::caution
Verificați întotdeauna de două ori adresele destinatarilor înainte de a trimite token-uri. Tranzacțiile pe QoreChain sunt ireversibile.
:::

:::tip

* Folosiți flag-ul `--dry-run` pentru a simula o tranzacție fără a o transmite în rețea.
* Setați `--gas` explicit (400.000 este suficient pentru un transfer semnat hibrid).
* Pragul minim al comisionului este de **0,1 uqor per unitate de gaz**, deci o limită de gaz de 400.000 necesită cel puțin **40.000 uqor**.

:::
