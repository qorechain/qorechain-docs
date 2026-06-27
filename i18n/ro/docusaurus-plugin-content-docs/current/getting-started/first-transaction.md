---
slug: /getting-started/first-transaction
title: Prima tranzacție
sidebar_label: Prima tranzacție
sidebar_position: 5
---

# Prima tranzacție

Acest ghid parcurge trimiterea de token-uri QOR, interogarea tranzacțiilor și interacțiunea cu QoreChain prin interfețele sale native, EVM și SVM.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (ID-ul EVM al chain-ului **9800**). Rețeaua principală (**`qorechain-vladi`**, ID-ul EVM al chain-ului **9801**) este activă din 7 iunie 2026 — înlocuiți ID-ul chain-ului și punctele finale ale rețelei principale de pe pagina **Conectarea la rețeaua principală** atunci când efectuați tranzacții pe rețeaua principală.
:::

## Verificarea soldului

Înainte de a trimite token-uri, verificați soldul contului:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

Răspunsul include toate denominațiile de token-uri deținute de cont. Soldurile QOR sunt afișate în `uqor` (micro-QOR), unde **1 QOR = 1,000,000 uqor**.

## Trimiterea de QOR

Transferați token-uri din cheia dumneavoastră către o altă adresă:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Aceasta trimite **1 QOR** (1,000,000 uqor) către adresa destinatarului, plătind un comision de 500 uqor.

:::caution Transferurile Cosmos necesită o semnătură hibridă PQC
Pe calea cosmos, valoarea implicită a rețelei este `hybrid_signature_mode = required` (versiunea curentă de chain **v3.1.77**). Un `tx bank send` clasic simplu este **respins** — fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura secp256k1. Generați o cheie Dilithium-5 cu `qorechaind tx pqc gen-key`, apoi atașați cosemnătura hibridă cu `qorechaind tx pqc cosign` (sau construiți tranzacția cu funcția `buildHybridTx` a SDK-ului QoreChain, folosind `includePqcPublicKey` astfel încât cheia să se înregistreze automat la prima utilizare). Pentru a produce semnătura hibridă în afara CLI, biblioteca open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) și SDK-ul QoreChain realizează echivalentul în cod. Vezi [Configurarea portofelului](/getting-started/wallet-setup) pentru fluxul hibrid complet.
:::

Vi se va solicita să confirmați tranzacția înainte de a fi difuzată. După confirmare, CLI returnează un hash de tranzacție.

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

:::note
Tranzacțiile EVM **nu sunt afectate** de cerința hibridă PQC de pe calea cosmos. Ele folosesc o cale ante `eth_secp256k1` separată, astfel încât semnarea standard Ethereum (MetaMask, ethers.js etc.) funcționează fără o extensie PQC.
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

## Utilizarea SVM RPC

Mediul de execuție SVM al QoreChain expune o interfață RPC compatibilă cu Solana pe portul `8899`.

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
| `--fees`           | Comisionul tranzacției în uqor | `--fees 500uqor`               |
| `--from`           | Numele sau adresa cheii de semnare | `--from mykey`             |
| `--output`         | Formatul răspunsului          | `--output json`                |
| `--node`           | Punctul final RPC la care se conectează | `--node tcp://localhost:26657` |
| `--gas`            | Limita de gaz pentru tranzacție | `--gas auto`                 |
| `--gas-adjustment` | Multiplicator pentru gazul estimat | `--gas-adjustment 1.3`    |
| `-y`               | Sare peste solicitarea de confirmare | `-y`                    |

### Exemplu: Comandă completă cu toate opțiunile frecvente

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Pașii următori

Acum că ați trimis prima tranzacție, explorați mai mult din ceea ce oferă QoreChain:

* **Staking și delegare** — Mizați QOR și câștigați recompense
* **Punte pentru active** — Mutați active între chain-uri
* **Dezvoltare EVM** — Implementați contracte inteligente Solidity pe QoreChain
