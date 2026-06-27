---
slug: /developer-guide/evm-development
title: Dezvoltare EVM
sidebar_label: Dezvoltare EVM
sidebar_position: 2
---

# Dezvoltare EVM

QoreChain rulează un mediu de execuție pe deplin compatibil EVM pe QoreChain EVM Engine, permițându-vă să implementați și să interacționați cu contracte inteligente Solidity folosind instrumentele cunoscute. Modulul EVM expune o interfață JSON-RPC pe **portul 8545** (WebSocket pe **8546**) care acceptă fluxurile standard de dezvoltare Ethereum.

:::note
Exemplele de mai jos vizează rețeaua principală (mainnet) **`qorechain-vladi`** (EVM chain ID **9801**), activă din 7 iunie 2026 rulând versiunea de lanț **v3.1.77**. Pentru rețeaua de test (testnet) **`qorechain-diana`**, folosiți EVM chain ID **9800**.
:::

---

## Endpoint JSON-RPC

| Proprietate          | Valoare                                    |
| -------------------- | ------------------------------------------ |
| URL implicit         | `http://localhost:8545`                    |
| URL WebSocket        | `ws://localhost:8546`                      |
| Namespace-uri acceptate | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Simbol monedă        | `QOR`                                      |

Namespace-ul `qor_` oferă metode specifice QoreChain. Vedeți [Namespace personalizat](#custom-qor_-namespace) mai jos.

---

## Configurarea portofelului (MetaMask)

Adăugați QoreChain ca rețea personalizată în MetaMask:

| Câmp               | Valoare mainnet           | Valoare testnet         |
| ------------------ | ------------------------- | ----------------------- |
| Nume rețea         | QoreChain (qorechain-vladi) | QoreChain Diana       |
| URL RPC            | `http://localhost:8545`   | `http://localhost:8545` |
| Chain ID           | `9801`                    | `9800`                  |
| Simbol monedă      | `QOR`                     | `QOR`                   |
| URL explorator de blocuri | *(folosiți exploratorul oficial mainnet)* | *(lăsați necompletat pentru testnet local)* |

---

## Hardhat

Instalați Hardhat și configurați fișierul `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Implementați un contract:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Rulați teste împotriva QoreChain EVM:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Creați și implementați un contract cu Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modelul de gaz

QoreChain folosește un model de **taxă de bază dinamică EIP-1559** pentru tranzacțiile EVM:

* Taxa de bază se ajustează per bloc în funcție de utilizare
* Utilizatorii pot seta `maxFeePerGas` și `maxPriorityFeePerGas`
* Taxele de prioritate ajung la proponentul blocului

### Puntea de denominare

Tokenul nativ QOR are **6 zecimale** (`uqor`), în timp ce EVM se așteaptă la **18 zecimale**. Modulul `x/precisebank` gestionează conversia transparentă:

| Context      | Denominare   | Zecimale | Exemplu                |
| ------------ | ------------ | -------- | ---------------------- |
| Lanț nativ   | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

Această conversie este transparentă — când verificați un sold prin `eth_getBalance`, răspunsul este denominat în wei cu 18 zecimale. Când același cont este interogat prin modulul bancar nativ, soldul apare în `uqor` cu 6 zecimale.

---

## Perechi de tokenuri ERC-20

Modulul `x/erc20` oferă înregistrarea automată a **perechilor de tokenuri** între denominările native Cosmos SDK și contractele ERC-20:

* Tokenurile native pot fi folosite în contractele EVM ca ERC-20
* Tokenurile ERC-20 implementate pe EVM pot fi convertite în denominări native
* Conversia este bidirecțională și gestionată la nivel de protocol

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## Compatibilitate PQC și EVM

Tranzacțiile EVM folosesc semnături **ECDSA clasice (secp256k1)** pentru compatibilitate deplină cu instrumentele, portofelele și bibliotecile Ethereum existente. Acest lucru asigură că MetaMask, Hardhat, Foundry, ethers.js și toate instrumentele EVM standard funcționează fără modificări.

Pentru securitate post-cuantică în cadrul EVM:

* Folosiți **precompilatul PQC Verify** (`0x0000...0A01`) pentru a verifica semnături ML-DSA-87 on-chain din Solidity. Vedeți [Precompilate EVM](/developer-guide/evm-precompiles).
* **Mesajele cross-VM** de la EVM la CosmWasm sau SVM pot fi semnate PQC la nivelul tranzacției Cosmos SDK.
* Conturile pot înregistra opțional chei publice PQC prin `x/pqc` pentru securitate hibridă.

---

## Namespace personalizat `qor_` {#custom-qor_-namespace}

QoreChain extinde JSON-RPC cu un namespace `qor_` pentru interogări specifice lanțului:

| Metodă                      | Descriere                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Verifică dacă un cont are o cheie publică PQC înregistrată         |
| `qor_getAIStats`            | Obține statistici ale motorului AI (numărări de anomalii, distribuția riscului) |
| `qor_getCrossVMMessage`     | Interoghează starea unui mesaj cross-VM după ID                   |
| `qor_getPoolClassification` | Obține clasificarea grupului de validatori (RPoS/DPoS/PoS)        |
| `qor_getReputationScore`    | Interoghează scorul de reputație al unui validator               |
| `qor_getAbstractAccount`    | Obține configurația contului abstract                            |

Exemplu cu `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Pașii următori

* [Precompilate EVM](/developer-guide/evm-precompiles) — Accesați funcții PQC, AI și cross-VM din Solidity
* [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability) — Apelați contracte CosmWasm și SVM din EVM
* [Abstractizarea conturilor](/developer-guide/account-abstraction) — Conturi programabile cu chei de sesiune
