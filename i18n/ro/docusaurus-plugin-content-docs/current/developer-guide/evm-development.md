---
slug: /developer-guide/evm-development
title: Dezvoltare EVM
sidebar_label: Dezvoltare EVM
sidebar_position: 2
---

# Dezvoltare EVM

QoreChain rulează un mediu de execuție complet compatibil cu EVM pe QoreChain EVM Engine, permițându-vă să implementați și să interacționați cu contracte inteligente Solidity folosind uneltele obișnuite. Modulul EVM expune o interfață JSON-RPC pe **portul 8545** (WebSocket pe **8546**) care suportă fluxurile de lucru standard de dezvoltare Ethereum.

:::note
Exemplele de mai jos vizează rețeaua mainnet **`qorechain-vladi`** (chain ID EVM **9801**), activă din 7 iunie 2026, care rulează versiunea de nod **v3.2.3** (aplicată la înălțimea 3.662.051, pe 20 octombrie 2026). Pentru testnet-ul **`qorechain-diana`** (v3.2.4, aplicată la înălțimea 8.337.253, pe 19 octombrie 2026; încă neaplicată pe mainnet; propunerea de guvernanță 13 ar aplica-o la înălțimea 3.742.566), folosiți chain ID EVM **9800**. Exemplele de cod folosesc `http://localhost:8545` pentru un nod pe care îl rulați singuri; endpointul public de mainnet este `https://evm.qore.host`, iar cel de testnet este `https://evm-testnet.qore.host`.
:::

:::caution O tranzacție EVM necesită o cheie PQC înregistrată și o fereastră de autorizare deschisă
Începând cu upgrade-ul v3.2.0 (înălțimea mainnet 2.981.742, înălțimea testnet 5.920.000), lane-ul EVM admite o tranzacție doar de la un cont care are **(1) o cheie post-cuantică ML-DSA-87 înregistrată** și **(2) o fereastră de autorizare EVM deschisă** care mai are loc pentru ea. Semnați cu unelte obișnuite (MetaMask, ethers.js, Hardhat, Foundry), dar fără o cheie înregistrată și o fereastră deschisă, `eth_sendRawTransaction` este respins (codespace `pqc`, codurile 26, 27 sau 28). Citirile, `eth_call` și estimarea de gas nu au nevoie de niciuna. Vedeți [Fereastra de autorizare EVM](#evm-window) mai jos și ghidul pas cu pas din [Prima ta tranzacție](/getting-started/first-transaction#evm-window).

Încă două reguli se aplică pe mainnet începând cu v3.2.2: **tranzacțiile neprotejate (pre-EIP-155) sunt respinse**, atât de mempool-ul nodului, cât și la execuția blocului, așa că semnați cu un chain id (orice portofel și bibliotecă actuală o face); iar **conturile de modul nu pot fi revendicate prin EVM**.
:::

---

## Endpoint JSON-RPC

| Proprietate                | Valoare                                    |
| --------------------------- | ------------------------------------------ |
| URL implicit                | `http://localhost:8545`                    |
| URL WebSocket                | `ws://localhost:8546`                      |
| Spații de nume suportate    | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)          | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)          | `9800` (`qorechain-diana`)                 |
| Simbol monedă               | `QOR`                                      |

Citirile specifice QoreChain sunt servite prin REST (`api.qore.host`); spațiul de nume JSON-RPC `qor_` descris [mai jos](#custom-qor_-namespace) **nu este activat** pe endpointurile publice și nici în configurația implicită a nodului. Lista implicită `api` a unui nod inițializat de curând (v3.2.3 și ulterior) este `eth,net,web3`; `txpool` este opțional (opt-in), deoarece publică tranzacțiile în așteptare ale nodului.

---

## Configurare portofel (MetaMask)

Adăugați QoreChain ca rețea personalizată în MetaMask:

| Câmp                | Valoare Mainnet             | Valoare Testnet           |
| -------------------- | ---------------------------- | -------------------------- |
| Nume rețea           | QoreChain (qorechain-vladi)  | QoreChain Diana            |
| URL RPC              | `https://evm.qore.host`      | `https://evm-testnet.qore.host` |
| Chain ID             | `9801`                       | `9800`                     |
| Simbol monedă        | `QOR`                        | `QOR`                      |
| URL explorator blocuri | `https://explore.qore.network` | *(opțional)* |

Trimiterea din MetaMask necesită, în plus, o cheie PQC înregistrată și o [fereastră de autorizare EVM](#evm-window) deschisă pe cont.

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

Implementați un contract (contul care face implementarea are nevoie de o cheie PQC înregistrată și de o [fereastră de autorizare](#evm-window) deschisă; o implementare contează ca o tranzacție EVM în fereastră):

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Rulați teste pe EVM-ul QoreChain:

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

## Modelul de gas

QoreChain folosește un model de **taxă de bază dinamică EIP-1559** pentru tranzacțiile EVM:

* Taxa de bază se ajustează per bloc, în funcție de gradul de utilizare
* Utilizatorii pot seta `maxFeePerGas` și `maxPriorityFeePerGas`
* Taxele de prioritate merg către propunătorul blocului

### Puntea de denominare

Tokenul nativ QOR are **6 zecimale** (`uqor`), în timp ce EVM-ul așteaptă **18 zecimale**. Modulul `x/precisebank` gestionează conversia fără probleme:

| Context       | Denominare | Zecimale | Exemplu                |
| -------------- | ---------- | -------- | ----------------------- |
| Chain nativ    | `uqor`     | 6        | `1000000 uqor = 1 QOR` |
| EVM            | wei        | 18       | `1e18 wei = 1 QOR`      |

Această conversie este transparentă — când verificați un sold prin `eth_getBalance`, răspunsul este denominat în wei cu 18 zecimale. Când același cont este interogat prin modulul nativ de bank, soldul apare în `uqor` cu 6 zecimale.

---

## Perechi de tokenuri ERC-20

Modulul `x/erc20` oferă **perechi de tokenuri** între denominările native Cosmos SDK și contractele ERC-20:

* Tokenurile native pot fi folosite în cadrul contractelor EVM ca ERC-20
* Tokenurile ERC-20 implementate pe EVM pot fi convertite în denominări native
* Conversia este bidirecțională și gestionată la nivel de protocol

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Acestea sunt tranzacții din lane-ul Cosmos: pe rețelele live necesită și co-semnătura post-cuantică hibridă (construiți cu `--generate-only`, apoi `qorechaind tx pqc cosign`; vedeți [Semnarea post-cuantică](/developer-guide/post-quantum-signing)). Perechile de tokenuri se înregistrează sub o politică cu permisiuni, iar pe mainnet nu există încă nicio pereche.

---

## Compatibilitate PQC și EVM

Tranzacțiile EVM sunt semnate cu **ECDSA clasic (secp256k1)**, așa că MetaMask, Hardhat, Foundry, ethers.js și alte unelte standard le construiesc și le semnează fără modificări. Ce s-a schimbat în **v3.2.0** este *admiterea*: o tranzacție este acceptată doar dacă expeditorul ei deține o cheie post-cuantică înregistrată și o fereastră de autorizare activă (secțiunea următoare). Înregistrarea unei chei și deschiderea unei ferestre sunt tranzacții din lane-ul Cosmos și necesită semnătura hibridă (ML-DSA-87 + secp256k1).

Pentru securitate post-cuantică în cadrul contractelor:

* **Precompilatul PQC Verify** (`0x0000...0A01`) va verifica pe chain semnături ML-DSA-87 din Solidity odată ce este activat; **nu este încă activ** pe mainnet sau testnet. Vedeți [Precompilate EVM: starea rețelelor](/developer-guide/evm-precompiles#network-status).
* **Mesajele cross-VM** de la EVM către CosmWasm sau SVM sunt tranzacții din lane-ul Cosmos și poartă semnătura hibridă ca oricare altele; vedeți [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) pentru disponibilitatea lor curentă.

---

## Fereastra de autorizare EVM {#evm-window}

O semnătură post-cuantică nu poate călători *împreună* cu o tranzacție Ethereum (portofele precum MetaMask nu pot atașa o a doua semnătură), așa că ea călătorește *înaintea* ei. Contul deschide o fereastră delimitată cu mesajul din lane-ul Cosmos `MsgOpenEVMWindow`; lane-ul EVM admite apoi doar tranzacțiile acoperite de o fereastră activă. O cheie clasică furată nu poate deschide singură o fereastră, deci poate muta doar ceea ce permite o fereastră deja deschisă.

| Limită      | Interval           | Semnificație |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17.280         | Cât timp rămâne deschisă fereastra, numărat în blocuri începând cu blocul care o deschide |
| `max-txs`   | 1 – 1.000          | Câte tranzacții EVM admite |
| `max-value` | peste 0, în `uqor` | Ieșirea totală pe care o admite: valoarea transferată **plus** taxa maximă pe care ar putea-o plăti fiecare tranzacție (limita de gas × taxa maximă per gas), convertită în `uqor` și rotunjită în sus |

Limita care se epuizează prima închide fereastra. Toate cele trei limite sunt obligatorii; deschiderea unei ferestre o înlocuiește pe cea existentă; o tranzacție care este admisă și apoi eșuează își consumă totuși slotul și bugetul de valoare; implementările de contracte contează ca orice altă tranzacție. `blocks` este un număr de blocuri, nu o durată: 17.280 de blocuri înseamnă aproximativ 15 ore pe mainnet (circa 3,2 s per bloc) și aproximativ 5 ore pe testnet (circa 1,0 s per bloc).

**Limita de valoare numără doar QOR nativ.** Un transfer de token, o aprobare sau orice alt apel de contract poartă valoarea zero, deci nu se socotește la `max-value` (se socotește doar taxa sa maximă). Pentru a le limita și pe acestea, restrângeți **domeniul de aplicare** (scope) al ferestrei (mainnet v3.2.3 și ulterior):

| Opțiune de domeniu (flag CLI) | Câmp de mesaj | Ce admite fereastra |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Doar transferuri simple de QOR nativ: fără calldata, fără creare de contract, fără destinatar care poartă cod, fără autorizare EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Doar tranzacțiile al căror destinatar este una dintre adresele de 20 de octeți listate; crearea de contract este respinsă |

O fereastră deschisă fără domeniu de aplicare se comportă exact ca înainte. O tranzacție în afara domeniului este respinsă cu codul 27 (mesajul spune că fereastra „does not admit this transaction"). `GET /qorechain/pqc/v1/evm_window/{address}` și `qorechaind query pqc evm-window` raportează `native_only` și `allowed_targets`, iar evenimentul `pqc_evm_window_opened` le poartă atunci când sunt setate.

**Pași** (ghidul complet este în [Prima ta tranzacție](/getting-started/first-transaction#evm-window)):

1. Înregistrați o singură dată cheia ML-DSA-87 (`tx pqc register-key-v2` sau `register-key`, cu `--gas 600000 --fees 60000uqor`; această tranzacție este scutită de cerința hibridă, astfel încât un cont nou să poată face bootstrap). Vedeți [Semnarea post-cuantică](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Deschideți o fereastră. Este o tranzacție din lane-ul Cosmos, deci produceți-o nesemnată și co-semnați-o cu cheia ML-DSA (`max-value` acceptă `uqor` sau `qor`; `1000qor` înseamnă 1.000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Verificați ce a rămas: `qorechaind query pqc evm-window <address>` sau `GET /qorechain/pqc/v1/evm_window/{address}` (răspunde `found: false` când nu există nicio fereastră).
4. Trimiteți tranzacțiile EVM ca de obicei. Deschiderea unei ferestre este o tranzacție din lane-ul Cosmos și avansează secvența contului, care este totodată nonce-ul său EVM, așa că citiți nonce-ul **după** ce fereastra este deschisă și semnați abia atunci.

Închideți o fereastră mai devreme cu `qorechaind tx pqc close-evm-window` (același tipar `--generate-only` și `cosign`), de exemplu dacă bănuiți că cheia clasică este expusă: tot ce mai admitea fereastra este respins începând cu blocul următor.

### Delegări EIP-7702 {#eip-7702}

O delegare EIP-7702 a contului vostru (o tranzacție de tip 4) intră în vigoare doar cu consimțământul post-cuantic propriu al contului, începând cu v3.2.2. Înregistrați mai întâi consimțământul cu mesajul din lane-ul Cosmos semnat hibrid `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); este de unică folosință, expiră după numărul de blocuri dat și este revocat de `close-evm-window`. Valoarea care părăsește un cont delegat este imputată ferestrei **acelui** cont, o tranzacție de tip 4 eșuată își păstrează autorizările pe care le-a aplicat, iar `qorechaind tx pqc clear-evm-delegation` elimină o delegare. O delegare respinsă răspunde cu codurile 60 până la 63. Citiți consimțământul cu `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Respingere (codespace `pqc`) | Semnificație |
| ------------------------- | ------- |
| code 26 | Nu există nicio fereastră deschisă pentru expeditor sau expeditorul nu are o cheie PQC înregistrată |
| code 27 | Fereastra a expirat sau este epuizată (mesajul arată care limită) sau tranzacția este în afara domeniului ferestrei |
| code 28 | Limite invalide la deschiderea unei ferestre sau nicio cheie înregistrată în acel moment |

Cu SDK-ul TypeScript (0.8.2 și ulterior): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` și `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). SDK 0.9.0 adaugă opțiunile de domeniu (`nativeOnly`, `allowedTargets`) la `openEvmWindowMsg` și constructorii de consimțământ EIP-7702 (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); versiunile anterioare lui 0.9.0 construiesc doar fereastra fără domeniu, așa că folosiți `qorechaind` pentru restul (vedeți [ghidul SDK pentru EVM](/sdk/guides/evm#evm-window-scope)).

---

## Spațiul de nume personalizat `qor_` {#custom-qor_-namespace}

QoreChain extinde JSON-RPC cu un spațiu de nume `qor_` pentru interogări specifice chain-ului:

:::warning Încă nu este servit
Niciun build de nod publicat nu servește încă spațiul de nume `qor_`: `rpc_modules` de pe endpointurile publice listează doar `eth`, `net`, `rpc`, `txpool` și `web3`, iar fiecare metodă de mai jos returnează `-32601` (metodă negăsită) pe mainnet, testnet și pe nodurile rulate de voi cu configurația implicită (`eth`, `net`, `web3`). Vedeți [spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace) pentru stare și pentru alternativele REST (de exemplu `GET /qorechain/pqc/v1/account/{address}` pentru starea cheii PQC).
:::

| Metodă                        | Descriere                                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | Verifică dacă un cont are o cheie publică PQC înregistrată            |
| `qor_getAIStats`              | Recuperează statistici ale motorului AI (număr de anomalii, distribuția riscului) |
| `qor_getCrossVMMessage`       | Interoghează starea unui mesaj cross-VM după ID                       |
| `qor_getPoolClassification`   | Obține clasificarea pool-ului de validatori (RPoS/DPoS/PoS)          |
| `qor_getReputationScore`      | Interoghează scorul de reputație al unui validator                    |
| `qor_getAbstractAccount`      | Recuperează configurația contului abstract                            |

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

* [Precompilate EVM](/developer-guide/evm-precompiles) — Referință pentru interfețele de precompilate rezervate (încă neactive pe rețelele publice)
* [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) — Apeluri cross-VM și disponibilitatea lor curentă
* [Abstractizarea contului](/developer-guide/account-abstraction) — Autentificatoare pentru portofele conectate și reguli de cheltuire (modulul este dezactivat în prezent)
