---
slug: /developer-tools/chain-dev-sdk
title: Kit pentru dezvoltatori de lanț
sidebar_label: Kit pentru dezvoltatori de lanț
sidebar_position: 34
---

# Kitul pentru dezvoltatori de lanț (șabloane EVM și QoreChain Native)

Kitul pentru dezvoltatori de lanț este partea din QoreChain SDK **0.11.0** care îi ajută pe dezvoltatorii de Solidity și de contracte inteligente să construiască pe QoreChain cu uneltele pe care le folosesc deja. Adaugă definiții de lanț viem și ajutoare pentru fereastra de autorizare EVM în `@qorechain/evm`, patru șabloane noi de proiect în `create-qorechain-dapp` (Foundry, Hardhat 3, viem cu wagmi și un token CosmWasm QoreChain Native), quickstart-uri EVM pentru cinci limbaje și o referință despre cum diferă EVM-ul QoreChain de Ethereum. Este destinat echipelor Solidity care portează contracte de pe Ethereum, dezvoltatorilor de front-end pentru dApp-uri pe wagmi și RainbowKit, dezvoltatorilor CosmWasm și mentenanților de unelte EVM care vor să adauge QoreChain.

:::caution În curând: SDK 0.11.0 este etichetat, dar nepublicat pe npm
SDK 0.11.0 este etichetat pe GitHub (`qorechain/qorechain-sdk`, eticheta `v0.11.0`, 27 octombrie 2026). **Lansarea lui pe npm este în așteptare**, iar pe 27 octombrie 2026 `npm view` pentru versiunea 0.11.0 a pachetelor `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm` și `create-qorechain-dapp` nu a găsit nimic. Această pagină **nu dă nicio comandă de instalare pentru 0.11.0**. Fiecare element marcat **de la 0.11.0** de mai jos nu funcționează astăzi din npm. Elementele marcate **disponibil astăzi** funcționează: provin din `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 și din SDK-urile de limbaj la 0.10.0. 0.11.0 schimbă doar pachetele npm; SDK-urile Python, Rust, Go și Java rămân la 0.10.0.
:::

Kitul vizează mainnet (`qorechain-vladi`, ID de lanț EVM 9801) și testnet (`qorechain-diana`, ID de lanț EVM 9800).

## Disponibil astăzi și în curând în 0.11.0 {#status}

| Element | Stare | Unde |
|---|---|---|
| Citire cu ethers v6, web3.py, go-ethereum, alloy sau web3j pe endpoint-urile publice | **Disponibil astăzi** (nu este nevoie de niciun pachet QoreChain) | [Quickstart 1](#quickstart-ethers) |
| `createEvmClient`, ajutoare ERC-20, ERC-721 și ERC-1155, binding-urile `precompiles`, `PRECOMPILE_ADDRESSES` | **Disponibil astăzi** în `@qorechain/evm` 0.8.0 | [Quickstart 2](#quickstart-evm-080) |
| Deschiderea și citirea unei ferestre de autorizare EVM din TypeScript, cu `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` | **Disponibil astăzi** în `@qorechain/sdk` 0.10.0 | [Quickstart 5](#quickstart-open-window) |
| Aceleași constructoare de fereastră în Python, Go, Rust și Java | **Disponibil astăzi** în SDK-urile 0.10.0 | [API principal](#main-api) |
| Ajutoarele de consimțământ EIP-7702 `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | **Disponibil astăzi** în `@qorechain/sdk` 0.10.0 | [API principal](#main-api) |
| Generatorul de proiecte cu șabloanele `evm-solidity`, `fullstack-web`, `rollup-app` | **Disponibil astăzi** în `create-qorechain-dapp` 0.10.0 | [Quickstart 6](#quickstart-scaffold-live) |
| Definițiile de lanț viem `qorechain` și `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **De la 0.11.0** (în curând) | [Quickstart 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, convertoare de adrese, constantele ferestrei, subcalea `@qorechain/evm/window` | **De la 0.11.0** (în curând) | [Quickstart 4](#quickstart-window-helpers) |
| Șabloanele `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` și ajutorul `pnpm window` | **De la 0.11.0** (în curând) | [Șabloane](#templates) |
| `PqcStatusBadge` în `@qorechain/react` | **De la 0.11.0** (în curând) | [API principal](#main-api) |

## Inovații {#innovations}

- **Trimiterea este autorizată intenționat, cu o fereastră limitată.** O tranzacție EVM este admisă doar dintr-un cont care are o cheie ML-DSA-87 înregistrată și o fereastră de autorizare EVM deschisă. Fereastra este deschisă de un mesaj al lane-ului nativ semnat hibrid (secp256k1 plus ML-DSA-87), astfel încât cheia secp256k1 pe care o deține o bibliotecă EVM nu poate autoriza niciodată singură cheltuirea. Tranzacția Ethereum în sine rămâne o tranzacție Ethereum obișnuită.
- **O fereastră dimensionată prin limite, nu prin încredere.** O fereastră limitează numărul de blocuri (1 până la 17.280), numărul de tranzacții EVM (1 până la 1.000) și un total în uqor care acoperă valoarea plus comisionul maxim al fiecărei tranzacții admise. `nativeOnly` o limitează la transferuri simple de QOR, iar `allowedTargets` (cel mult 16 adrese) limitează destinatarii și refuză crearea de contracte.
- **Un cont, două codificări.** Pentru un cont eth-native, adresele `0x` și `qor1...` sunt aceiași 20 de octeți și arată același sold, deci o singură cheie funcționează pe EVM și pe lane-ul nativ. QOR are 18 zecimale pe EVM și 6 pe lane-ul nativ (`uqor`); 1 uqor înseamnă 10^12 wei.
- **Ajutoare care numesc refuzul.** `classifyEvmWindowRejection` transformă o tranzacție refuzată într-unul din patru motive, `no-pqc-key`, `no-window`, `exhausted` sau `invalid`, pornind de la o eroare viem sau ethers, un rezultat de livrare al lane-ului nativ sau un șir de text.
- **Dimensionarea ferestrei în uqor.** `evmWindowCost` și `weiToUqorCeil` dimensionează o fereastră pornind de la valoare, gaz și plafonul comisionului, rotunjind wei în sus la uqor, astfel încât totalul să acopere cazul cel mai defavorabil.
- **Fără deschidere automată.** Kitul nu are în mod deliberat niciun ajutor care deschide o fereastră înaintea unei trimiteri. Fereastra există pentru ca cheltuirea să fie autorizată intenționat.
- **Simulare gratuită.** `eth_call` și `eth_estimateGas` funcționează pentru orice cont, fără fereastră sau cheie înregistrată.
- **Șabloane care conectează fereastra.** Șabloanele Foundry și Hardhat includ `pnpm window status|register|open`, care derivă cheia ML-DSA-87 din același secret ca și cheia EVM, o înregistrează o singură dată și difuzează mesajul de deschidere semnat hibrid.
- **O suprafață de compatibilitate documentată.** O pagină de referință (citită de pe endpoint-urile publice pe 27 octombrie 2026) listează ce diferă față de Ethereum: tipuri de tranzacții, fork-uri, finalitate, câmpuri de comision, spații de nume JSON-RPC și precompile-uri. Este rezumată [mai jos](#evm-differences).

## Ce conține kitul {#contents}

### `@qorechain/evm` {#evm-package}

**De la 0.11.0** (nou):

- `qorechain` (9801) și `qorechainTestnet` (9800): obiecte de lanț viem cu endpoint-urile publice, moneda nativă QOR cu 18 zecimale și exploratorul `https://explore.qore.network`. `QORECHAIN_CHAINS` le listează pe ambele (mainnet, apoi testnet) pentru wagmi și RainbowKit. `QORECHAIN_REST_ENDPOINTS` asociază fiecare ID de lanț EVM cu endpoint-ul REST al lane-ului nativ.
- `evmWindowStatus({ rest, address })` citește fereastra unui cont prin REST (`/qorechain/pqc/v1/evm_window/{address}`), acceptă o adresă `qor1...` sau `0x` și răspunde `{ found: false }` în loc să eșueze atunci când nu există una. `parseEvmWindow` interpretează răspunsul brut.
- `openEvmWindowMessage(params)` verifică limitele și compune `MsgOpenEVMWindow` al lane-ului nativ ca obiect simplu `{ typeUrl, value }`, gata de semnat cu `@qorechain/sdk`. `checkOpenEvmWindowParams` rulează doar verificările.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress` și constantele `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17.280), `MAX_EVM_WINDOW_TXS` (1.000) și `MAX_EVM_WINDOW_TARGETS` (16).
- Ajutoarele pentru fereastră sunt publicate și fără viem, la subcalea `@qorechain/evm/window`.

**Disponibil astăzi** (0.8.0 și mai nou): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, ajutoarele `erc20`, ajutoarele ERC-721 și ERC-1155, binding-urile `precompiles` și `PRECOMPILE_ADDRESSES`. Vezi [ghidul EVM](/sdk/guides/evm).

### Șabloane {#templates}

`create-qorechain-dapp` are astăzi trei șabloane disponibile (`evm-solidity`, `fullstack-web`, `rollup-app`; vezi [Generatoare de proiecte și CLI](/developer-tools/scaffolders-and-cli)). **De la 0.11.0** are șapte. Cele patru noi:

| Șablon | Ce primești |
|---|---|
| `foundry` | Un proiect Foundry: contractul `Counter`, teste, script de deploy, endpoint-uri RPC cu nume `qorechain` și `qorechain_testnet` și `pnpm window status\|register\|open`. |
| `hardhat` | Un proiect Hardhat 3 și viem: contractul `Counter`, teste pe rețeaua simulată, un modul de deploy Ignition, rețelele `qorechain` și `qorechainTestnet` și `pnpm window status\|register\|open`. |
| `viem-wagmi` | Un dApp Vite, React, wagmi și RainbowKit cu portofelul QoreX (`@qorechain/qorex-rainbowkit`) și definițiile de lanț din `@qorechain/evm`. Afișează ultimul bloc, soldul de QOR și fereastra EVM a contului. |
| `cosmwasm` | Un token CW20 QoreChain Native (CosmWasm) pe `cw20-base` din cw-plus, un build optimizat în Docker, un script pentru propunerea de încărcare prin guvernanță și scripturi de instanțiere și interogare pe testnet. |

Șabloanele fixează `@qorechain/evm` și `@qorechain/sdk` la `^0.11.0`, deci nu se instalează din npm până când 0.11.0 nu este publicat.

### Ghiduri în repository-ul SDK {#guides}

Repository-ul (`docs/docs/guides/`, eticheta `v0.11.0`) conține `evm-quickstarts.md` (citiri pentru viem, ethers v6, web3.py, go-ethereum, alloy și web3j, plus o secțiune „Before you send"), `evm-differences.md` („QoreChain EVM compared with Ethereum"), `evm.md` și `cosmwasm.md`. Același material pe acest site: [ghidul EVM](/sdk/guides/evm), [Dezvoltare EVM](/developer-guide/evm-development) și [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development).

Tot în etichetă: fișiere de contribuție pentru alte unelte (definiții de lanț viem, intrări de lanț Sourcify și o extensie Scaffold-ETH 2) în `contrib/` și `templates/scaffold-eth-extension/`. Sunt fișiere pregătite în repository, nu integrate în proiectele respective.

## Cazuri de utilizare {#use-cases}

1. **O echipă Solidity care portează de pe Ethereum.** Generați șablonul `foundry` (de la 0.11.0), copiați contractele, rulați `forge test` local, rulați o dată `pnpm window register` și `pnpm window open` înaintea fiecărui lot de deploy. [Diferențele](#evm-differences) listează ce trebuie schimbat: fără tranzacții blob, PREVRANDAO este o constantă, fără trasare `debug_*` pe endpoint-urile publice.
2. **Un proiect Hardhat 3 care merge pe testnet.** Generați șablonul `hardhat` (de la 0.11.0), păstrați modulele Ignition și faceți deploy cu `pnpm deploy:testnet` după deschiderea unei ferestre.
3. **Un front-end dApp pe wagmi.** Importați `QORECHAIN_CHAINS` în configurația wagmi și în RainbowKit (de la 0.11.0), afișați fereastra utilizatorului cu `evmWindowStatus` și explicați o trimitere refuzată cu `classifyEvmWindowRejection`.
4. **Un serviciu backend într-un alt limbaj.** Un serviciu Python, Go, Rust sau Java citește solduri și apelează contracte cu web3.py, go-ethereum, alloy sau web3j ca pe Ethereum, **astăzi**. Pentru a trimite, construiește `MsgOpenEVMWindow` cu SDK-ul QoreChain 0.10.0 al limbajului respectiv, care este disponibil.
5. **Un dezvoltator CosmWasm.** Generați șablonul `cosmwasm` (de la 0.11.0), testați CW20 cu `cargo test`, construiți Wasm-ul optimizat, depuneți o propunere de guvernanță pentru stocarea codului și instanțiați-l pe testnet după ce propunerea trece.
6. **O integrare de portofel sau de custodie.** O integrare care deține chei pentru utilizatori trebuie să știe că singură cheia secp256k1 nu poate cheltui pe lane-ul EVM. Deschide ferestre înguste (`nativeOnly` sau `allowedTargets`) semnate cu cheia ML-DSA-87 a contului, **astăzi** cu `openEvmWindowMsg` din `@qorechain/sdk` 0.10.0.
7. **Mentenanții de unelte EVM.** Mentenanții viem, Sourcify sau Scaffold-ETH 2 pot citi fișierele de contribuție pregătite pentru a adăuga ID-urile de lanț 9800 și 9801.

## Cum funcționează {#how-it-works}

- **Regula de autorizare.** Lanțul admite o tranzacție EVM dintr-un cont care are o cheie ML-DSA-87 înregistrată și o fereastră activă, altfel o refuză. Regula este funcția de protocol `evm-pqc-authorisation-window`, activată pe ambele rețele; o puteți citi la `/qorechain/pqc/v1/protocol_features`. Vezi [Fereastra de autorizare EVM](/sdk/guides/evm#evm-window) și [ghidul primei tranzacții](/getting-started/first-transaction#evm-window).
- **Deschidere și închidere.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) deschide o fereastră, semnat hibrid; deschiderea unei ferestre o înlocuiește pe cea anterioară. `MsgCloseEVMWindow` o închide.
- **Ce limitează o fereastră.** Blocuri (un număr de blocuri, nu o durată), tranzacții EVM și un total în uqor care acoperă valoarea plus comisionul maxim (limita de gaz înmulțită cu plafonul comisionului) al fiecărei tranzacții admise. `nativeOnly` și `allowedTargets` o restrâng și mai mult (vezi [Limitați o fereastră](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** Secvența nativă și nonce-ul EVM sunt același contor. Deschiderea unei ferestre îl avansează, deci deschideți fereastra, apoi citiți nonce-ul, apoi semnați tranzacția EVM.
- **Ajutorul din șabloane.** În `foundry` și `hardhat`, `pnpm window` derivă contul din `PRIVATE_KEY` (sau `QORE_MNEMONIC`), derivă cheia lui ML-DSA-87 din același secret, înregistrează cheia o singură dată (`register`) și difuzează `MsgOpenEVMWindow` semnat hibrid (`open`). Implicit dimensionează o fereastră de 600 de blocuri și 5 tranzacții, pentru tranzacții de până la 3.000.000 de gaz la un plafon de comision de 250 gwei.
- **CosmWasm pe QoreChain Native.** Încărcarea codului se face prin guvernanță pe ambele rețele (`code_upload_access` este `Nobody`): codul este stocat printr-o propunere de guvernanță care poartă `MsgStoreCode` cu modulul de guvernanță ca expeditor. Instanțierea este deschisă tuturor pe testnet și închisă pe mainnet (`instantiate_default_permission` este `Everybody` pe testnet și `Nobody` pe mainnet, citit pe 27 octombrie 2026). Citiți ambele la `/cosmwasm/wasm/v1/codes/params`; listați codurile stocate la `/cosmwasm/wasm/v1/code`. Mainnet nu avea coduri stocate pe 27 octombrie 2026.

## EVM-ul QoreChain comparat cu Ethereum {#evm-differences}

Citit de pe endpoint-urile publice pe 27 octombrie 2026 (ghidul SDK `evm-differences.md`). Starea rețelei (comisioane, timpi de bloc, precompile-uri active) este datată; citiți-o live înainte de a vă baza pe ea.

- **Trimitere.** Fiecare tranzacție EVM are nevoie de o cheie ML-DSA-87 înregistrată și de o fereastră deschisă pentru expeditorul ei, fără excepții per cont. Deploy-urile, transferurile și apelurile de contract sunt toate acoperite. Un cont cu cheie înregistrată nu are nici pe lane-ul nativ o cale cu semnătură clasică: fiecare tranzacție nativă pe care o semnează este hibridă.
- **Simulare.** `eth_call` și `eth_estimateGas` nu au nevoie de fereastră.
- **Tipuri de tranzacții.** Tipurile 0 (legacy), 1 (listă de acces), 2 (EIP-1559) și 4 (EIP-7702) sunt acceptate. **Tranzacțiile blob EIP-4844 (tipul 3) sunt refuzate.** Opcode-urile Cancun funcționează, dar `blobGasUsed` și `excessBlobGas` sunt întotdeauna 0, `eth_blobBaseFee` nu există, iar precompile-ul de evaluare în punct (`0x0a`) returnează o eroare.
- **Fork-uri.** Până la London de la genesis; Shanghai, Cancun și Prague sunt active; Osaka nu este activ.
- **PREVRANDAO (EIP-4399) este o constantă** (`0xff...ff`), iar `mixHash` din antet este zero. Nu-l folosiți niciodată ca sursă de aleatoriu.
- **EIP-7702** este acceptat cu o regulă QoreChain: fiecare autoritate a cărei delegare ar intra în vigoare are nevoie de o cheie PQC înregistrată și de un consimțământ unic, înregistrat cu `MsgAuthorizeEVMDelegation` (cel mult 8 autorizări per tranzacție, fără autoritate duplicată). Fereastra sponsorului nu se numără ca și consimțământ al autorităților. `MsgClearEVMDelegation` elimină o delegare. Vezi [Consimțământul EIP-7702](/sdk/guides/evm#evm-delegation-consent).
- **Finalitate.** Blocurile sunt finale odată comise: `latest`, `safe` și `finalized` returnează același bloc, fără reorganizări și fără unchi.
- **Comisioane (ambele rețele, 27 octombrie 2026).** `eth_gasPrice` 112,5 gwei; comision de bază 100 gwei (pragul lanțului de 0,1 uqor per gaz); `eth_maxPriorityFeePerGas` 12,5 gwei; `gasLimit` din antet 4.294.967.295. Uneltele care stabilesc plafonul comisionului aproape de dublul comisionului de bază (Foundry o face) angajează din fereastră până la aproximativ 200 gwei per gaz, deși plătesc aproximativ 112,5 gwei.
- **Spații de nume JSON-RPC.** `eth`, `net`, `web3` și `txpool`. Toate metodele `debug_*`, `personal_*`, `admin_*` și `miner_*` sunt indisponibile (`-32601`), la fel ca `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` și `eth_config`. Uneltele care au nevoie de trasări nu funcționează pe endpoint-urile publice.
- **Comportament diferit.** `eth_getProof` funcționează, dar returnează dovezile IAVL ale lanțului, nu dovezi Merkle-Patricia. `eth_getLogs` acoperă cel mult 10.000 de blocuri per interogare. `eth_subscribe` funcționează doar prin WebSocket. `eth_accounts`, `eth_sign` și `eth_sendTransaction` sunt refuzate deoarece nodul nu deține conturi: semnați local și folosiți `eth_sendRawTransaction`. `txpool_content` este refuzat pe endpoint-urile publice; `txpool_status` funcționează. `web3_clientVersion` nu este o metodă de încredere pentru a detecta nodul.
- **Solduri.** `eth_getBalance` returnează soldul bancar în uqor înmulțit cu 10^12 plus eventualul rest sub-uqor.
- **Precompile-uri.** Precompile-urile standard Ethereum răspund ca de obicei. `pqcVerify` (`0x0A01`) și `pqcKeyStatus` (`0x0A02`) sunt **active doar pe testnet**; niciunul nu este activ pe mainnet, iar activarea lor ar necesita o decizie de guvernanță, fără dată. Testnet-ul listează și `0x0C01` (`rlConsensusParams`). Un apel către un precompile inactiv returnează date goale în loc să anuleze tranzacția, deci citiți `active_static_precompiles` la `/cosmos/evm/vm/v1/params` înainte de a vă baza pe unul. Vezi [Precompile-uri EVM](/developer-guide/evm-precompiles#network-status).
- **Unelte.** QoreChain nu este încă în `viem/chains`: importați lanțurile din `@qorechain/evm` (de la 0.11.0). Sourcify nu listează încă ID-urile de lanț 9800 sau 9801. Lane-ul SVM nu este deschis.

## Cum se folosește {#how-to-use}

Toate fragmentele care citesc folosesc testnet-ul public (`qorechain-diana`, ID de lanț EVM 9800), nu au nevoie de nicio cheie și nu trimit nimic. ERC-20 de test de la `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` este un token de testnet (simbol `WQOR`, 18 zecimale); înlocuiți-l pe el și adresa cu ale voastre.

### Instalare per limbaj {#install}

| Limbaj sau unealtă | Instalare | Stare | Platformă minimă |
|---|---|---|---|
| TypeScript, citiri EVM și ajutoare ERC | `npm install @qorechain/evm viem` (se rezolvă la 0.8.0, care nu are definiții de lanț sau ajutoare pentru fereastră) | Disponibil astăzi | Node.js 20 sau mai nou; peer `viem ^2` |
| TypeScript, semnarea mesajului ferestrei | `npm install @qorechain/sdk` (0.10.0 are `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`) | Disponibil astăzi | Node.js 20 sau mai nou |
| TypeScript, definiții de lanț viem și ajutoare pentru fereastră | încă nimic | **În curând (0.11.0)** | Node.js 20 sau mai nou |
| Generator de proiecte, șabloanele `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | Disponibil astăzi (0.10.0) | Node.js 20 sau mai nou |
| Generator de proiecte, șabloanele `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | încă nimic | **În curând (0.11.0)** | Foundry și Node.js 20; Node.js 22 pentru Hardhat 3; Rust și Docker pentru `cosmwasm` |
| Python (citiri EVM) | `pip install "web3>=7,<8"`; mesajul ferestrei din `qorechain-sdk` 0.10.0 | Disponibil astăzi | Python 3.10 sau mai nou |
| Go (citiri EVM) | `go get github.com/ethereum/go-ethereum@latest`; mesajul ferestrei din SDK-ul QoreChain Go v0.10.0 | Disponibil astăzi | Toolchain Go |
| Rust (citiri EVM) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; mesajul ferestrei din crate-ul `qorechain-sdk` 0.10.0 | Disponibil astăzi | Rust stable |
| Java (citiri EVM) | `org.web3j:core:5.0.0`; mesajul ferestrei din `io.github.qorechain:qorechain-sdk:0.10.0` | Disponibil astăzi | JDK 21 (SDK-ul QoreChain Java este construit cu un toolchain JDK 21) |

### Quickstart 1: citire cu ethers v6 (disponibil astăzi) {#quickstart-ethers}

Nu este nevoie de niciun pachet QoreChain. Rulat pe 27 octombrie 2026 pe testnet, a afișat `chain id: 9800n`, un sold și `token: WQOR 18n`.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

Aceeași citire în web3.py, go-ethereum, alloy și web3j se găsește în ghidul SDK `evm-quickstarts.md` (raportată acolo ca testată cu web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 și web3j 5.0.0 pe JDK 21; această pagină nu le-a rulat din nou).

### Quickstart 2: citire cu `@qorechain/evm` 0.8.0 publicat (disponibil astăzi) {#quickstart-evm-080}

Quickstart testat din hub-ul pentru dezvoltatori. Se conectează, detectează automat ID-ul de lanț EVM și afișează soldul de QOR al contului public de faucet de pe testnet.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Quickstart 3: citire cu definiția de lanț viem (de la 0.11.0, în curând) {#quickstart-viem}

Acesta nu rulează astăzi din npm, deoarece 0.8.0 nu are `qorechainTestnet`. Rulat pe 27 octombrie 2026 cu definiția de lanț 0.11.0 încărcată din sursa repository-ului (nu din npm), a afișat `chain id: 9800` și tokenul `WQOR`.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Quickstart 4: verificați o fereastră și compuneți mesajul de deschidere (de la 0.11.0, în curând) {#quickstart-window-helpers}

Din README-ul `@qorechain/evm` la eticheta v0.11.0. Citește, apoi construiește un obiect mesaj; nu semnează și nu trimite. Pentru un cont fără fereastră, `evmWindowStatus` returnează `found: false, live: false` (verificat pe ambele rețele pe 27 octombrie 2026).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Quickstart 5: deschideți o fereastră din TypeScript (disponibil astăzi, SDK 0.10.0 și mai nou) {#quickstart-open-window}

Din ghidul SDK `evm-quickstarts.md`, „Before you send". Acesta **trimite o tranzacție pe lane-ul nativ**: rulați-l doar cu propriul cont de test alimentat, niciodată cu o frază partajată sau publică.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

Acest fragment nu a fost rulat din nou pentru această pagină. `maxValue: "3750000"` reprezintă 5 tranzacții de 3.000.000 de gaz la un plafon de comision de 250 gwei.

### Quickstart 6: generați un proiect cu generatorul disponibil {#quickstart-scaffold-live}

Testat pe 27 octombrie 2026 într-un director gol cu `npx` din registrul public npm (0.10.0, șablonul `fullstack-web`): a generat proiectul, iar build-ul a reușit.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### Șabloanele noi (de la 0.11.0, în curând) {#new-templates-usage}

După publicarea 0.11.0, generatorul acceptă cele patru nume noi de șabloane (vezi tabelul de flag-uri de mai jos). Un proiect `foundry` se construiește și se testează apoi local cu `forge build` și `forge test` (fără rețea), iar `pnpm window status` citește contul, cheia lui PQC și fereastra lui. `pnpm window register` și `pnpm window open` difuzează tranzacții ale lane-ului nativ din propriul cont alimentat, iar `forge script ... --broadcast` face deploy. Nu puneți niciodată o cheie reală în `.env.example`, nu comiteți niciodată `.env` și nu alimentați niciodată fraza publică de test BIP-39 (`abandon` repetat de 11 ori, apoi `about`).

## API principal {#main-api}

### `@qorechain/evm` (de la 0.11.0) {#api-evm}

| Nume | Ce face |
|---|---|
| `qorechain`, `qorechainTestnet` | Obiecte de lanț viem pentru 9801 și 9800, cu endpoint-uri publice și explorator. |
| `QORECHAIN_CHAINS` | Ambele lanțuri (mainnet, apoi testnet), pentru wagmi sau RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | ID de lanț EVM către URL-ul REST al lane-ului nativ. |
| `evmWindowStatus` | Citește o fereastră prin REST: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | Interpretează răspunsul REST. |
| `openEvmWindowMessage` | Verifică limitele și construiește `MsgOpenEVMWindow` ca `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | Doar verificările de limite. |
| `evmWindowCost`, `weiToUqorCeil` | Dimensionarea ferestrei în uqor. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Explică un refuz: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Convertesc între `0x` și `qor1...` pentru același cont. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Constante. |
| `@qorechain/evm/window` | Ajutoarele pentru fereastră fără dependența de viem. |

`@qorechain/evm` nu semnează și nu difuzează tranzacții ale lane-ului nativ; folosiți `@qorechain/sdk` sau SDK-urile de limbaj pentru asta.

### Construirea și citirea unei ferestre în fiecare SDK (disponibil astăzi, 0.10.0) {#api-window}

| Limbaj | Deschide o fereastră | Citește o fereastră |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`, de la 0.11.0) | `fetchEvmWindow`; `evmWindowStatus` (de la 0.11.0) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`NewOpenEVMWindowScoped` pentru `nativeOnly` sau `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

Consimțământ EIP-7702 (TypeScript, `@qorechain/sdk` 0.10.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0 adaugă `PqcStatusBadge` (etichete implicite „PQC key registered" și „No PQC key").

### Flag-urile `create-qorechain-dapp` {#api-scaffolder}

| Flag | Ce face |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app` (disponibile astăzi); `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` (de la 0.11.0). |
| `--network <name>` | Presetul `testnet` sau `mainnet`. |
| `--package-manager <pm>` | `pnpm`, `npm` sau `yarn`. |
| `-y, --yes` | Omite întrebările și folosește valorile implicite. |
| `--no-install` | Nu instalează dependențele. |
| `-h, --help` / `-v, --version` | Ajutor și versiune. |

### Scripturile șabloanelor (de la 0.11.0) {#api-template-scripts}

| Șablon | Script | Ce face |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Arată contul, dacă cheia lui ML-DSA-87 este înregistrată (și dacă este această cheie) și fereastra lui. |
| `foundry`, `hardhat` | `pnpm window register` | Înregistrează cheia ML-DSA-87 a contului, o dată per cont. |
| `foundry`, `hardhat` | `pnpm window open` | Deschide o fereastră (implicit 600 de blocuri, 5 tranzacții). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Build Hardhat, teste, deploy Ignition pe `qorechainTestnet`. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | Server de dezvoltare pe `http://localhost:5173`; build de producție. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Build optimizat, propunere de încărcare prin guvernanță, instanțiere (testnet), interogări REST. |

Variabilele de mediu ale șabloanelor (în `.env`, niciodată comise): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK` (`testnet` sau `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; `QORE_CODE_ID` și `QORE_I_KNOW_THIS_IS_MAINNET=yes` pentru scripturile CosmWasm (scriptul de propunere refuză mainnet fără ea); `VITE_WALLETCONNECT_PROJECT_ID` pentru un portofel WalletConnect în `viem-wagmi`.

## Cum se accesează {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| ID de lanț nativ | `qorechain-diana` | `qorechain-vladi` |
| ID de lanț EVM (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | nepublicat |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consens | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Explorator | `https://explore.qore.network` | `https://explore.qore.network` |

- **Citirile** nu au nevoie de nimic: nici cont, nici cheie, nici fereastră.
- **Trimiterea pe lane-ul EVM** are nevoie de un cont alimentat, de cheia lui ML-DSA-87 înregistrată pe lanț (o singură dată) și de o fereastră deschisă. Înregistrarea cheii și fereastra sunt tranzacții ale lane-ului nativ.
- **Cost.** Pragul comisionului este de 0,1 uqor per gaz pe ambele rețele. Citirea este gratuită. QOR de testnet vine de la [Faucet](/dashboard/faucet).
- **CosmWasm.** Fără încărcare de cod fără guvernanță pe niciuna dintre rețele; fără instanțiere pe mainnet fără guvernanță. Mainnet nu avea coduri stocate pe 27 octombrie 2026.
- **Versiuni de noduri și unelte.** Vezi tabelul de instalare de mai sus.

## Unde este publicat {#where-published}

Versiunile au fost citite live din fiecare registru pe 27 octombrie 2026. Eticheta GitHub `v0.11.0` există (27 octombrie 2026), iar pentru ea nu există încă un obiect de lansare GitHub (cea mai recentă lansare este v0.10.0).

| Registru | Pachet | Versiune disponibilă astăzi | Starea 0.11.0 | Link |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **în așteptare, nepublicat** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **în așteptare, nepublicat** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **în așteptare, nepublicat** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **în așteptare, nepublicat** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (șabloanele `evm-solidity`, `fullstack-web`, `rollup-app`) | **în așteptare, nepublicat** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (folosit de `viem-wagmi`) | 0.1.0 | nu face parte din 0.11.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | nu face parte din 0.11.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | nu face parte din 0.11.0 | https://crates.io/crates/qorechain-sdk |
| Go proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | nu face parte din 0.11.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | nu face parte din 0.11.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Sursă: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), eticheta `v0.11.0`; căile `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, întreținut de Asociația QoreChain.

## Limite și probleme cunoscute {#limits}

- **0.11.0 nu este încă pe npm.** Tot ce este marcat „de la 0.11.0" (definițiile de lanț viem, ajutoarele pentru fereastră, `@qorechain/evm/window`, cele patru șabloane noi, `PqcStatusBadge`) nu poate fi instalat astăzi dintr-un registru. Șabloanele noi depind de pachete `^0.11.0`, deci nici o generare din repository nu se va instala din npm până la publicare. Această pagină se va schimba când npm va servi 0.11.0.
- **0.11.0 schimbă doar pachetele npm.** Python, Rust, Go și Java rămân la 0.10.0, care conține deja constructoarele de fereastră listate mai sus.
- **`@qorechain/evm` citește fereastra și compune mesajul; nu semnează și nu difuzează** tranzacții ale lane-ului nativ.
- **Niciun ajutor nu deschide automat o fereastră înaintea unei trimiteri**, intenționat.
- **Portofelul QoreX din șablonul `viem-wagmi`** răspunde la `eth_chainId`, `eth_accounts`, `eth_requestAccounts` și `wallet_switchEthereumChain`; metodele lui de semnare EVM nu sunt încă disponibile. Folosiți-l pentru a vă conecta și a citi, iar semnați cu un portofel EIP-1193 injectat.
- **Ajutorul `pnpm window` din șabloane derivă cheia ML-DSA-87 din același secret ca și cheia EVM.** Dacă cheia contului a fost înregistrată de alt portofel, deschideți fereastra din acel portofel.
- **Indisponibile pe endpoint-urile publice:** tranzacțiile blob, trasarea și spațiile de nume `debug`, `personal`, `admin` și `miner`.
- **Încărcarea CosmWasm trece prin guvernanță pe ambele rețele**; șablonul `cosmwasm` nu poate stoca singur cod.
- **Contribuțiile către alte unelte** (viem, Sourcify, Scaffold-ETH 2) sunt fișiere pregătite în repository, nu integrate în proiectele respective.
- **Precompile-uri EVM pe mainnet:** niciunul nu este activ. `pqcVerify` (`0x0A01`) și `pqcKeyStatus` (`0x0A02`) sunt active doar pe testnet.
- **Starea rețelei este datată.** Cifrele pentru comisioane și timpii de bloc au fost citite pe 27 octombrie 2026.

## Note de securitate {#security}

- Designul ferestrei face ca cheia secp256k1 deținută de o bibliotecă EVM să nu poată autoriza niciodată singură cheltuirea: deschiderea unei ferestre cere o semnătură hibridă cu cheia ML-DSA-87 a contului. Păstrați ferestrele mici (`blocks`, `maxTxs`, `maxValue`) și folosiți `nativeOnly` sau `allowedTargets` acolo unde puteți.
- `maxValue` include comisionul maxim al fiecărei tranzacții; dimensionați-l cu `evmWindowCost`, nu doar după valoare.
- Șabloanele citesc cheile din `.env`, care este ignorat de git; `.env.example` conține valori de umplutură. Utilizatorii Hardhat pot stoca cheia criptat cu `npx hardhat keystore set PRIVATE_KEY`.
- Nu alimentați niciodată fraza publică de test BIP-39 (`abandon` repetat de 11 ori, apoi `about`).
- Pentru o propunere CosmWasm pe mainnet, publicați sursa și un build reproductibil (optimizatorul afișează suma de control), astfel încât votanții să poată verifica binarul.
- Raportați vulnerabilitățile în privat la security@qore.network.

## Pagini conexe {#related}

- [Prezentare generală a pachetelor pentru dezvoltatori](/developer-tools/overview) și [Generatoare de proiecte și CLI](/developer-tools/scaffolders-and-cli) (`create-qorechain-dapp` 0.10.0 disponibil)
- [Prezentare generală SDK](/sdk/overview), [Instalare SDK](/sdk/install) și [ghidul EVM](/sdk/guides/evm) (fereastră, ferestre limitate, consimțământ EIP-7702, precompile-uri)
- [Dezvoltare EVM](/developer-guide/evm-development) și [Precompile-uri EVM](/developer-guide/evm-precompiles#network-status)
- [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development) (CosmWasm și propuneri de guvernanță)
- [Integrări QoreX](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (semnare hibridă pe lane-ul nativ)
- [QoreScan](/developer-tools/qorescan) (inventar al utilizării `ecrecover` și a precompile-urilor PQC în sursele Solidity)
