---
slug: /user-guide/bridging-assets
title: Punți pentru active
sidebar_label: Punți pentru active
sidebar_position: 5
---

# Punți pentru active

Acest ghid descrie cum să muți active între QoreChain și alte rețele blockchain. Stratul de interoperabilitate al QoreChain cuprinde **37 de configurații QCB (QoreChain Bridge)** (inclusiv un loopback QoreChain) pentru rețele eterogene, plus **8 canale IBC** pentru lanțurile din ecosistemul Cosmos.

:::caution
Puntea cross-chain se află în prezent într-o etapă de **testnet / pre-producție**. Disponibilitatea conexiunilor, activele suportate și parametrii de finalitate pot fi modificați și nu ar trebui tratați ca fiind pregătiți pentru producție. Validează toate transferurile pe **`qorechain-diana`** înainte de a te baza pe ele.
:::

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ de la 7 iunie 2026, rulând versiunea de lanț **v3.1.77** — înlocuiește chain ID-ul și endpoint-urile de mainnet din pagina **Conectarea la Mainnet** acolo unde suportul pentru punte a fost activat.
:::

---

## Prezentare generală a conexiunilor

QoreChain oferă două protocoale de punte:

| Protocol                                 | Conexiuni          | Caz de utilizare                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 canale           | Interoperabilitate nativă cu lanțuri compatibile IBC                          |
| **QCB** (QoreChain Bridge)               | 37 de configurații | Transferuri cross-chain cu rețele non-IBC prin atestări securizate PQC |

O enumerare completă a fiecărei configurații QCB și a fiecărui canal IBC se găsește pe pagina **Arhitectura punții**. Acest ghid se concentrează pe utilizarea zilnică a punților.

---

## Canale IBC

Următoarele lanțuri compatibile IBC au stabilit canale cu QoreChain:

| Lanț                 | Canal       | Stare  |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Activ  |
| Osmosis              | `channel-1` | Activ  |
| Noble                | `channel-2` | Activ  |
| Celestia             | `channel-3` | Activ  |
| Stride               | `channel-4` | Activ  |
| Akash                | `channel-5` | Activ  |
| Babylon              | `channel-6` | Activ  |
| QoreChain (loopback) | `channel-7` | Activ  |

Transferurile IBC folosesc modulul standard `ibc-transfer`:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Endpoint-uri ale punții QCB

Puntea QoreChain se conectează la lanțuri externe care acoperă mai multe tipuri de ecosisteme. O selecție reprezentativă de rețele suportate:

| Lanț      | Tip de lanț | Active suportate |
| --------- | ----------- | ---------------- |
| Ethereum  | EVM         | ETH, USDC, WBTC  |
| BSC       | EVM         | BNB, USDC        |
| Solana    | Solana      | SOL, USDC        |
| Avalanche | EVM         | AVAX, USDC       |
| Polygon   | EVM         | MATIC, USDC      |
| Arbitrum  | EVM         | ETH, ARB, USDC   |
| TON       | TON         | TON              |
| Sui       | Sui Move    | SUI              |
| Optimism  | EVM         | ETH, USDC, OP    |
| Base      | EVM         | ETH, USDC        |
| Aptos     | Aptos       | APT, USDC        |
| Bitcoin   | Bitcoin     | BTC              |
| NEAR      | NEAR        | NEAR, USDC       |
| Cardano   | Cardano     | ADA              |
| Polkadot  | Polkadot    | DOT              |
| Tezos     | Tezos       | XTZ              |
| Tron      | Tron        | TRX, USDT        |

Vezi pagina **Arhitectura punții** pentru lista completă a configurațiilor QCB și starea curentă a implementării lor.

---

## Fluxul de depunere (lanț extern către QoreChain)

Depunerea activelor de pe un lanț extern în QoreChain urmează această secvență:

1. **Blocare** — Blochează tokenii pe lanțul extern trimițându-i la contractul sau adresa punții QCB.
2. **Atestare** — Validatorii punții observă tranzacția de blocare și produc atestări semnate PQC.
3. **Prag** — Odată ce sunt colectate **7 din 10** atestări ale validatorilor, puntea finalizează depunerea.
4. **Emitere** — Tokenii wrapped echivalenți sunt emiși pe QoreChain și creditați adresei tale `qor1...`.

**Comandă CLI:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Fluxul de retragere (QoreChain către lanț extern)

Retragerea activelor de pe QoreChain către un lanț extern:

1. **Ardere** — Arde tokenii wrapped pe QoreChain.
2. **Atestare** — Validatorii punții observă arderea și produc atestări semnate PQC.
3. **Prag** — Odată ce sunt colectate **7 din 10** atestări, retragerea este finalizată.
4. **Deblocare** — Tokenii originali sunt eliberați pe lanțul extern către adresa de destinație specificată.

**Comandă CLI:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Modelul de securitate

Puntea QoreChain este securizată de mai multe straturi de apărare:

| Mecanism                     | Descriere                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-din-10**    | Fiecare operațiune de punte necesită atestări de la cel puțin 7 din 10 validatori ai punții, fiecare folosind semnături criptografice post-cuantice.               |
| **Perioadă de contestare de 24 de ore** | Retragerile care depășesc un prag configurabil intră într-o fereastră de contestare de 24 de ore în care validatorii sau observatorii pot semnala tranzacții frauduloase. |
| **Întrerupătoare de circuit**         | Limitatoare automate de rată opresc operațiunile punții dacă sunt detectate volume anormale sau tipare suspecte. Operațiunile punții se reiau după o revizuire manuală.  |

---

## Interogarea stării punții

Verifică starea unei operațiuni de punte în așteptare:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Listează toate conexiunile active ale punții:

```bash
qorechaind query bridge connections
```

---

## Sfaturi

* Depunerile prin punte se finalizează de obicei în câteva minute odată ce sunt adunate cele 7-din-10 atestări necesare.
* Retragerile mari declanșează automat perioada de contestare de 24 de ore. Planifică din timp pentru transferurile sensibile la timp.
* Verifică întotdeauna că formatul adresei de destinație corespunde lanțului țintă (de exemplu, `0x...` pentru lanțurile EVM, base58 pentru Solana).
* Transferurile IBC sunt în general mai rapide decât transferurile QCB, deoarece folosesc comunicarea nativă la nivel de protocol.
* Comisioanele punții sunt arse prin canalul de ardere `bridge_fee` (vezi [Operațiuni cu tokeni](/user-guide/token-operations)).
