---
slug: /getting-started/first-transaction
title: Prima tranzacție
sidebar_label: Prima tranzacție
sidebar_position: 5
---

# Prima tranzacție

Acest ghid parcurge trimiterea de token-uri QOR, interogarea tranzacțiilor și interacțiunea cu QoreChain prin interfețele sale native, EVM și SVM.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (ID-ul EVM al chain-ului **9800**). Rețeaua principală (**`qorechain-vladi`**, ID-ul EVM al chain-ului **9801**) este activă din 7 iunie 2026 și rulează versiunea v3.2.4 din 23 octombrie 2026 (testnet-ul rulează v3.2.6 din 27 octombrie 2026) — înlocuiți ID-ul chain-ului și punctele finale ale rețelei principale de pe pagina **Conectarea la rețeaua principală** atunci când efectuați tranzacții pe rețeaua principală.
:::

## Verificarea soldului

Înainte de a trimite token-uri, verificați soldul contului:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

Răspunsul include toate denominațiile de token-uri deținute de cont. Soldurile QOR sunt afișate în `uqor` (micro-QOR), unde **1 QOR = 1,000,000 uqor**.

## Trimiterea de QOR {#send-qor}

Un cont QoreChain trimite pe lane-ul Cosmos cu o **semnătură hibridă**: semnătura clasică secp256k1 plus o semnătură ML-DSA-87 (Dilithium-5). Un simplu `qorechaind tx bank send ... -y` este respins, așa că transferul se construiește mai întâi nesemnat și apoi se cosemnează. Aveți nevoie de o cheie post-cuantică înregistrată o singură dată pe cont (vezi [Înregistrarea cheii post-cuantice](#register-pqc-key) mai jos) și de binarul oficial de release `qorechaind` de la [download.qore.host](https://download.qore.host) (un binar construit din arborele public de sursă nu poate crea și nici aplica o semnătură Dilithium).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Aceasta trimite **1 QOR** (1,000,000 uqor) către adresa destinatarului și plătește un comision de 40,000 uqor (0.04 QOR). Pragul minim al rețelei este de **0.1 uqor pe unitate de gaz**, deci comisionul trebuie să fie cel puțin limita de gaz înmulțită cu 0.1: `--gas 400000` necesită `--fees 40000uqor` sau mai mult. Un transfer semnat hibrid folosește de obicei între 160,000 și 240,000 de gaz, deoarece semnătura adaugă tranzacției aproximativ 4.7 KB. `cosign` întreabă nodul ce formă a bytes-ilor semnați verifică rețeaua, așa că aceeași comandă funcționează pe ambele rețele.

### Înregistrarea cheii post-cuantice {#register-pqc-key}

O cheie post-cuantică se **înregistrează explicit**, o singură dată pe cont. Chain-ul nu o înregistrează pentru dumneavoastră la prima tranzacție. Tranzacția de înregistrare în sine (și migrarea cheii) poate fi semnată doar cu cheia clasică, astfel încât un cont nou-nouț să poată porni:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Din v3.2.3, chain-ul acceptă și o **dovadă a deținerii** opțională odată cu înregistrarea și refuză cheile slabe, degenerate sau deja folosite. Pentru a atașa una, înregistrați cu `register-key-v2` și numiți cheia locală:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Păstrați o copie de rezervă a fișierului cheii PQC cu aceeași grijă ca fraza de recuperare; poate fi rederivat din frază cu `qorechaind tx pqc recover-key`. [QoreX](/qorex/overview) și SDK-ul QoreChain efectuează înregistrarea cheii în locul dumneavoastră. Vezi [Configurarea portofelului](/getting-started/wallet-setup) pentru fluxul hibrid complet.

:::caution Transferurile Cosmos necesită o semnătură hibridă PQC
Pe lane-ul Cosmos, setarea rețelei este `hybrid_signature_mode = required` (rețelele live rulează linia v3.2). O tranzacție doar cu semnătură clasică este **respinsă**. Pentru a produce semnătura hibridă în afara CLI, biblioteca open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) și SDK-ul QoreChain realizează echivalentul în cod.
:::

După ce tranzacția cosemnată este acceptată, CLI returnează un hash de tranzacție.

## Interogarea unei tranzacții

Căutați o tranzacție finalizată după hash-ul ei:

```bash
qorechaind query tx <txhash>
```

Rezultatul include starea tranzacției, gazul utilizat, înălțimea blocului și toate evenimentele emise în timpul execuției.

Pentru rezultat în format JSON:

```bash
qorechaind query tx <txhash> --output json
```

## Utilizarea JSON-RPC (EVM)

Mediul de execuție EVM al QoreChain expune o interfață standard Ethereum JSON-RPC pe portul `8545`.

:::caution Tranzacțiile EVM necesită o fereastră de autorizare
Semnarea standard Ethereum (MetaMask, ethers.js, ...) funcționează în continuare nemodificată, dar începând cu v3.2.0 lane-ul EVM admite o tranzacție doar de la un cont care are o **cheie post-cuantică înregistrată** și o **fereastră de autorizare EVM deschisă**. Deschideți mai întâi una (este o tranzacție pe lane-ul Cosmos, semnată cu cheia dumneavoastră ML-DSA) — vezi [Fereastra de autorizare EVM](#evm-window) mai jos. Fără ea, nodul răspunde `no open EVM authorisation window`. Citirea stării (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) nu necesită fereastră.
:::

### Obținerea numărului celui mai recent bloc

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Obținerea soldului unui cont

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

Soldul este returnat ca o valoare codată hex în cea mai mică denominație.

### Fereastra de autorizare EVM {#evm-window}

Începând cu versiunea de chain **v3.2.0** (înălțimea mainnet 2,981,742, 25 septembrie 2026; înălțimea testnet 5,920,000), lane-ul EVM admite o tranzacție doar de la un cont care

1. are o **cheie post-cuantică înregistrată** (ML-DSA-87) și
2. are o **fereastră de autorizare EVM deschisă** care mai are loc pentru tranzacție.

Tot restul lane-ului EVM rămâne neschimbat: continuați să semnați cu MetaMask, ethers.js, Hardhat sau Foundry, iar `eth_estimateGas` și celelalte simulări funcționează fără fereastră. Implementările de contracte contează ca orice altă tranzacție EVM, deci este nevoie de o fereastră înainte de a implementa.

**De ce o fereastră?** Un portofel standard face o singură semnătură secp256k1 peste o tranzacție Ethereum și nu oferă aplicațiilor nicio cale de a atașa o a doua semnătură, post-cuantică. Așadar, autorizarea post-cuantică călătorește *înaintea* tranzacției: deschideți o fereastră limitată cu o tranzacție obișnuită pe lane-ul Cosmos, care poartă semnătura dumneavoastră ML-DSA, iar lane-ul EVM admite apoi tranzacțiile acoperite de ea. O cheie clasică singură nu poate deschide niciodată o fereastră, deci o cheie clasică furată poate cheltui doar ce permite o fereastră deja deschisă. Funcționează ca o aprobare ERC-20: autorizați o sumă limitată pentru o perioadă limitată, apoi tranzacționați normal.

**Ce limitează o fereastră.** Se aplică simultan trei limite; cea care se epuizează prima închide fereastra.

| Limită | Semnificație | Interval permis |
| --- | --- | --- |
| `blocks` | Cât timp rămâne deschisă fereastra, numărat de la blocul care o deschide | 1 – 17,280 |
| `max-txs` | Câte tranzacții EVM admite | 1 – 1,000 |
| `max-value` | Ieșirea totală pe care o admite, în uqor: valoarea transferată **plus** comisionul maxim pe care l-ar putea plăti fiecare tranzacție (limita de gaz × plafonul comisionului), rotunjit în sus | mai mare decât 0 |

* 17,280 de blocuri înseamnă aproximativ 15 ore pe mainnet (aproximativ 3.1 s pe bloc) și aproximativ 6 ore pe testnet (aproximativ 1.3 s pe bloc).
* O tranzacție care este admisă și apoi eșuează își consumă totuși slotul și bugetul de valoare.
* Deschiderea unei ferestre noi **înlocuiește** fereastra anterioară; consumul reîncepe de la zero.
* CLI acceptă `max-value` în `uqor` sau `qor` (`1000qor` = 1,000,000,000 uqor).
* Limita de valoare numără doar QOR nativ: un transfer de token, o aprobare sau orice alt apel de contract poartă valoarea zero. Pentru a limita și acestea, restrângeți domeniul ferestrei (mai jos).

**Pasul 1 — înregistrați cheia post-cuantică** (o singură dată): vezi [Înregistrarea cheii post-cuantice](#register-pqc-key) mai sus.

**Pasul 2 — deschideți o fereastră.** Deschiderea unei ferestre este o tranzacție pe lane-ul Cosmos, deci se produce nesemnată și apoi se cosemnează:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Restrângerea domeniului (v3.2.3 și ulterioare).** Două opțiuni facultative restrâng ce admite o fereastră deschisă: `--native-only` admite doar transferuri simple de QOR nativ (fără calldata, fără creare de contracte, fără destinatar care poartă cod), iar `--allowed-targets 0xAAA...,0xBBB...` admite doar tranzacții către acei destinatari (cel mult 16; crearea de contracte este atunci refuzată). De exemplu:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

Pe mainnet, deschiderea unei ferestre a consumat aproximativ 180,000 de gaz. În [QoreX](/qorex/security-and-recovery#evm-window), același pas este **Settings → Security → EVM access window** (aplicația) sau butonul **EVM access window** (extensia). Deschiderea ferestrei avansează nonce-ul contului dumneavoastră, deci deschideți-o **înainte** de a pregăti tranzacția EVM în portofel.

**Pasul 3 — verificați ce a mai rămas:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

Răspunsul REST nu eșuează niciodată pentru o adresă fără fereastră; returnează `found: false`. Câmpurile sunt `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` și `remaining_value` (numere întregi uqor, returnate ca șiruri de caractere). Pe mainnet folosiți `https://api.qore.host`.

**Pasul 4 — folosiți normal lane-ul EVM.** Trimiteți din MetaMask sau din uneltele dumneavoastră ca de obicei. Fiecare tranzacție consumă un slot de tranzacție și (valoare + comision maxim) din fereastră.

**Închideți o fereastră mai devreme.** Dacă bănuiți că cheia dumneavoastră clasică este compromisă, închideți fereastra; tot ce mai admitea ea este refuzat începând cu blocul următor. Închiderea revocă și orice consimțământ de delegare EIP-7702 aflat în așteptare (din v3.2.2; o tranzacție de tip 4 care schimbă codul unui cont este admisă doar după un consimțământ post-cuantic `authorize-evm-delegation`):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Erori**

| Ce vedeți | Semnificație | Ce să faceți |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (modulul `pqc`, code 26) | Nicio fereastră pentru acest cont | Pasul 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (code 26 pe lane-ul EVM; code 28 dacă încercați să deschideți o fereastră) | Nicio cheie ML-DSA înregistrată | Pasul 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (code 27) | Expirată sau epuizată; mesajul arată care limită | Deschideți o fereastră nouă |
| `invalid EVM authorisation window` (code 28) | Limite în afara intervalului (`blocks` 1–17,280, `max-txs` 1–1,000, `max-value` > 0) | Corectați argumentele |

Din cod, SDK-ul QoreChain și `@qorechain/wallet-adapter` pot compune mesajele de deschidere și închidere și pot citi starea ferestrei; vezi [documentația SDK](/sdk/overview).

Fereastra se aplică doar lane-ului EVM. Tranzacțiile de pe lane-ul Cosmos poartă deja semnătura hibridă la fiecare tranzacție, iar dacă nu deschideți niciodată o fereastră, tranzacțiile dumneavoastră EVM sunt refuzate, în timp ce nimic altceva nu se schimbă.

## Utilizarea SVM RPC

Mediul de execuție SVM al QoreChain expune o interfață RPC compatibilă cu Solana pe portul `8899`. Lane-ul de tranzacții SVM este momentan dezactivat la nivelul întregii rețele, deci aceste metode de citire sunt partea pe care o puteți folosi astăzi.

### Obținerea slotului curent

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Obținerea soldului unui cont

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Tipare CLI frecvente

Când lucrați cu CLI-ul `qorechaind`, aceste opțiuni sunt folosite frecvent:

| Opțiune            | Descriere                     | Exemplu                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Specifică chain-ul țintă       | `--chain-id qorechain-diana`   |
| `--fees`           | Comisionul tranzacției în uqor (limita de gaz × cel puțin 0.1) | `--fees 40000uqor` |
| `--from`           | Numele sau adresa cheii de semnare | `--from mykey`             |
| `--output`         | Formatul răspunsului          | `--output json`                |
| `--node`           | Punctul final RPC la care se conectează | `--node tcp://localhost:26657` |
| `--gas`            | Limita de gaz pentru tranzacție | `--gas 400000` (sau `--gas auto`) |
| `--gas-adjustment` | Multiplicator pentru gazul estimat | `--gas-adjustment 1.5`    |
| `--gas-prices`     | Prețul gazului în locul `--fees` | `--gas-prices 0.1uqor`    |
| `--generate-only`  | Afișează tranzacția nesemnată (necesară înainte de `tx pqc cosign`) | `--generate-only` |
| `-y`               | Sare peste solicitarea de confirmare | `-y`                    |

### Exemplu: Comandă completă cu toate opțiunile frecvente

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Pașii următori

Acum că ați trimis prima tranzacție, explorați mai mult din ceea ce oferă QoreChain:

* **Staking și delegare** — Mizați QOR și câștigați recompense
* **Punte pentru active** — Mutați active între chain-uri
* **Dezvoltare EVM** — Implementați contracte inteligente Solidity pe QoreChain
