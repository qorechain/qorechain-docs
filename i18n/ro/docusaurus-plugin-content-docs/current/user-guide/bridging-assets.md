---
slug: /user-guide/bridging-assets
title: Punți pentru active
sidebar_label: Punți pentru active
sidebar_position: 5
---

# Punți pentru active

Acest ghid descrie cum este proiectată mutarea activelor între QoreChain și alte rețele blockchain. Stratul de interoperabilitate al QoreChain este construit în jurul a **37 de configurații de lanț** (36 de lanțuri externe plus Injective, accesat prin IBC) și până la **8 contrapărți IBC** pentru lanțurile din ecosistemul Cosmos.

:::caution Nu este activ pe nicio rețea
Modulul de punte este implementat pe mainnet și testnet, dar **nicio rută de punte nu este activă**: toate cele 37 de configurații de lanț sunt în starea `pending`, fără niciun contract de punte setat, nu este înregistrat niciun validator de punte, nu a fost creată vreodată nicio operațiune de punte și nu există canale sau clienți IBC. Tot ce urmează descrie designul intenționat. Nu trimite active așteptând să fie transferate prin punte. Vezi [Arhitectura punții](/architecture/bridge-architecture) pentru tabelul stării curente.
:::

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (EVM chain ID **9800**, versiunea de lanț **v3.2.4**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) rulează versiunea de lanț **v3.2.3** până la înălțimea 3,742,566 și **v3.2.4** de la acel bloc. Înlocuiește chain ID-ul și endpoint-urile de mainnet din pagina **Conectarea la Mainnet** după ce o rută este activată. Stare verificată la 20 octombrie 2026: toate cele 37 de configurații de lanț sunt `pending` pe ambele rețele.
:::

---

## Prezentare generală a conexiunilor

QoreChain este proiectat să ofere două protocoale de punte:

| Protocol                                 | Conexiuni                          | Caz de utilizare                                                                 |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | până la 8 canale (niciunul deschis) | Interoperabilitate nativă cu lanțuri compatibile IBC                          |
| **QCB** (QoreChain Bridge)               | 37 de configurații (toate pending) | Transferuri cross-chain cu rețele non-IBC prin atestări securizate PQC |

O enumerare completă a fiecărei configurații de lanț se găsește pe pagina **Arhitectura punții**. Acest ghid se concentrează pe modul în care este proiectat să funcționeze un transfer prin punte.

---

## IBC

IBC face parte din design (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), dar **nu există încă niciun canal sau client IBC pe nicio rețea**, așa că nu există nimic prin care să se poată transfera. Această pagină va lista canalele după ce vor fi deschise.

---

## Endpoint-uri ale punții QCB

Puntea QoreChain este proiectată să se conecteze la lanțuri externe care acoperă mai multe tipuri de ecosisteme. O selecție reprezentativă a conexiunilor planificate (toate sunt `pending` astăzi):

| Lanț      | Tip de lanț |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

Nu este publicată nicio listă de active: configurațiile de lanț nu au încă un registru de active. Consultă pagina **Arhitectura punții** pentru lista completă a configurațiilor de lanț.

---

## Fluxul de depunere (de la un lanț extern către QoreChain)

Secvența proiectată pentru o depunere de la un lanț extern în QoreChain:

1. **Blocare** — Blochezi tokenurile pe lanțul extern trimițându-le către contractul sau adresa punții QCB.
2. **Atestare** — Validatorii punții observă tranzacția de blocare și produc atestări semnate PQC.
3. **Prag** — Odată ce sunt colectate **7 din 10** atestări ale validatorilor, puntea finalizează depunerea.
4. **Emitere** — Tokenurile înfășurate echivalente sunt emise pe QoreChain și creditate în adresa ta `qor1...`.

Nu există nicio comandă rulată de utilizator pentru „a începe o depunere”: blochezi pe lanțul extern, iar atestările validatorilor punții creditează contul tău. (Comanda `qorechaind tx bridge deposit` a lanțului creditează o depunere deja atestată și necesită semnăturile validatorilor punții; nu este modalitatea prin care un utilizator începe o depunere.)

---

## Fluxul de retragere (de la QoreChain către un lanț extern)

Secvența proiectată pentru o retragere de la QoreChain către un lanț extern:

1. **Ardere** — Arzi tokenurile înfășurate pe QoreChain.
2. **Atestare** — Validatorii punții observă arderea și produc atestări semnate PQC.
3. **Prag** — Odată ce sunt colectate **7 din 10** atestări, retragerea este finalizată.
4. **Deblocare** — Tokenurile originale sunt eliberate pe lanțul extern către adresa de destinație specificată.

**Comandă CLI** (blocată astăzi: niciun lanț nu este activ, deci tranzacția ar fi refuzată):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Fiecare tranzacție pe lane-ul nativ necesită co-semnătura post-cuantică hibridă și o taxă de cel puțin 0.1 uqor pe unitate de gaz; vezi [Prima tranzacție](/getting-started/first-transaction).

---

## Modelul de securitate

Puntea QoreChain este proiectată să fie protejată prin mai multe straturi de apărare:

| Mecanism                     | Descriere                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-din-10**    | Fiecare operațiune de punte necesită atestări de la cel puțin 7 din 10 validatori ai punții, fiecare folosind semnături criptografice post-cuantice.  |
| **Perioadă de contestare de 24 de ore** | Transferurile care depășesc pragul pentru transferuri mari (100,000 QOR) intră într-o fereastră de contestare de 24 de ore, în care validatorii sau observatorii pot semnala tranzacții frauduloase. |
| **Întrerupătoare automate**  | Limitatoare automate de rată opresc operațiunile punții dacă sunt detectate volume anormale sau tipare suspecte. Operațiunile punții sunt reluate după o verificare manuală. |

---

## Interogarea stării punții

Citește starea punții:

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

Aceleași date sunt disponibile prin REST sub `/qorechain/bridge/v1/` (vezi [Arhitectura punții](/architecture/bridge-architecture#rest-api-endpoints)).

---

## Sfaturi

* Verifică întotdeauna ca formatul adresei de destinație să corespundă lanțului țintă (de ex., `0x...` pentru lanțurile EVM, base58 pentru Solana).
* Transferurile mari (peste 100,000 QOR) sunt proiectate să declanșeze automat perioada de contestare de 24 de ore.
* Comisioanele punții sunt arse prin canalul de ardere `bridge_fee` (vezi [Operațiuni cu tokenul](/user-guide/token-operations)).
