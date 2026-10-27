---
slug: /developer-tools/overview
title: Pachete pentru dezvoltatori
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Pachete pentru dezvoltatori

QoreChain își publică uneltele pentru dezvoltatori sub formă de pachete mici în registrele publice (npm, PyPI, crates.io, proxy-ul de module Go, Maven Central și Swift Package Manager). Această pagină este indexul: la ce folosește fiecare pachet, numele său exact din registru, limbajul, versiunea curentă, comanda de instalare și starea, plus unde poți citi cum se folosește. Este pentru dezvoltatorii care construiesc dApp-uri, portofele, backend-uri și rollup-uri pe QoreChain și vor să aleagă pachetul potrivit înainte de a citi un ghid.

Versiunile din tabele au fost citite din registre la 27 octombrie 2026. Mainnet-ul `qorechain-vladi` rulează v3.2.4, iar testnet-ul `qorechain-diana` rulează v3.2.6. Fiecare pachet listat ca publicat are licența Apache-2.0.

## Inovații {#innovations}

- **Un singur format de semnătură hibridă în fiecare limbaj.** Lanțul cere o semnătură secp256k1 plus o semnătură ML-DSA-87 (FIPS 204) pentru tranzacțiile de pe traseul native. QoreSign reproduce vectorii săi de test publicați octet cu octet în TypeScript, Rust, Go, Swift, Kotlin și Python, iar `qorechain-pqc` rulează un singur set comun de vectori în cele șase binding-uri ale sale, astfel încât o cheie sau o semnătură făcută într-un limbaj se verifică în celelalte.
- **Forma sign-bytes este aleasă pe baza stării lanțului, nu ghicită.** SDK-ul, wallet adapter-ul, `chain-bridge` și helper-ele de rețea QoreSign cer nodului `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pentru ambele nume de upgrade (`v3.2.0` și `v3.1.98`) și semnează în forma v2 când oricare dintre înălțimi este mai mare decât zero. Fără un endpoint REST pe aceste două lanțuri, ele aruncă o eroare în loc să ghicească. Ambele rețele verifică v2 astăzi (verificat la 27 octombrie 2026: `v3.2.0` aplicat pe mainnet la înălțimea 2,981,742 și `v3.1.98` pe testnet la înălțimea 5,746,000).
- **Quickstart-uri care au fost rulate, nu doar scrise.** Pentru pachetele care au unul, exemplul a fost rulat la 27 octombrie 2026 după instalarea din registrul public. 31 din 34 de intrări de quickstart au rulat și au trecut; manifestul consemnează care trei nu au rulat (vezi [Limite](#limits)).
- **Un singur manifest în spatele tabelelor.** Numele pachetelor, versiunile și comenzile de instalare de pe această pagină provin dintr-un singur manifest care poate fi citit automat, cu un endpoint de versiune live pentru fiecare pachet, aceleași date din care este construit hub-ul SDK de pe [pagina Developers din dashboard](/dashboard/developers#sdks).

## Cum se utilizează {#how-to-use}

Alege în funcție de ce construiești.

| Vrei să | Folosește | Citește |
|---|---|---|
| Citești starea lanțului, derivi conturi, trimiți tranzacții semnate hibrid dintr-un script sau dApp | QoreChain SDK | [Prezentarea SDK](/sdk/overview), [Instalare](/sdk/install), [Pornire rapidă](/sdk/quickstart) |
| Semnezi în propriul portofel sau backend, verifici semnături, Sign In With QoreChain | QoreSign | [Prezentarea QoreSign](/qoresign/overview), [Pornire rapidă](/qoresign/quickstart) |
| Adaugi QoreChain în Keplr, Leap sau Cosmostation, generezi portofele unificate, construiești mesaje pentru fereastra EVM și chei legate | Wallet adapter | [Wallet adapter](/developer-tools/wallet-adapter) |
| Rulezi un job de server care trimite QOR, înregistrează chei sau implementează contracte | Chain bridge (sau SDK) | [Chain bridge și handle-uri](/developer-tools/chain-bridge) |
| Rezolvi un `@handle` către o adresă verificată | Handles | [Chain bridge și handle-uri](/developer-tools/chain-bridge#handles) |
| Lași dApp-ul tău să folosească portofelul QoreX sau îl testezi fără o extensie | Integrările QoreX | [Integrările QoreX](/developer-tools/qorex-integrations), [QoreX, pentru dezvoltatori](/qorex/overview#developers) |
| Creezi și operezi un rollup de aplicație | RDK | [Prezentarea rollup-urilor](/rollups/overview), [Implementarea unui rollup](/rollups/deploying-a-rollup) |
| Folosești separat primitivele post-cuantice (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Semnare post-cuantică](/developer-guide/post-quantum-signing) |
| Lași un agent AI sau o unealtă pentru dezvoltatori să citească lanțul (blocuri, tranzacții, conturi, starea semnăturii hibride, simulare, transferuri nesemnate) | Serverul MCP QoreChain | [Serverul MCP QoreChain](/developer-tools/mcp) |
| Citești lanțul dintr-un terminal sau dintr-un script shell, cu ieșire JSON | CLI-ul `qore` | [CLI-ul QoreChain](/developer-tools/qore-cli) |
| Citești înapoi cum a fost protejată o tranzacție confirmată (mesaje, semnatar, taxă, stratul ML-DSA-87, nivel) | Inspectorul de tranzacții QoreSign (`inspectTransaction`) | [Prezentarea QoreSign](/qoresign/overview#inspector) |
| Criptezi date către conturi QoreChain, grupuri private sau sidechain-uri cu ML-KEM-1024 | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| Revizuiești sau testezi un design de light client post-cuantic (verificarea checkpoint-urilor) | PQ light client | [PQ light client](/developer-tools/pq-light-client) |
| Integrezi QoreChain ca custode sau bursă (verificări de adrese, verificarea retragerilor, creditarea depunerilor) | Custody kit | [Custody kit](/developer-tools/custody-kit) |
| Inventariezi criptografia unui nod, a unei rețele sau a surselor Solidity ca un CBOM CycloneDX | QoreScan | [QoreScan](/developer-tools/qorescan) |
| Construiești și testezi proiecte Solidity sau CosmWasm pe QoreChain cu Foundry, Hardhat sau viem | Chain developer kit (SDK 0.11.0, în curând) | [Chain developer kit](/developer-tools/chain-dev-sdk) |

Instalează un singur pachet și rulează-i quickstart-ul mai întâi pe testnet-ul public. Citirile nu necesită cont, cheie sau comision.

## Cum se accesează {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `qorechain-diana` | `qorechain-vladi` |
| EVM chain ID | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consens | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Cont și chei:** niciunul pentru citiri. Pentru a trimite ai nevoie de un cont cu QOR (QOR de testnet vine din [Faucet](/dashboard/faucet)) și, pe traseul native, de o cheie ML-DSA-87 înregistrată pentru el.
- **Cost:** pachetele sunt gratuite. Tranzacțiile plătesc taxa de rețea; taxa minimă este 0.1 uqor per gas.
- **Reguli de semnare:** o tranzacție de pe traseul native trebuie să poarte o semnătură hibridă (secp256k1 plus ML-DSA-87). O tranzacție EVM este acceptată doar de la un cont cu o cheie ML-DSA-87 înregistrată și o fereastră de autorizare EVM deschisă. Citirile SVM funcționează, iar tranzacțiile SVM nu sunt încă deschise. Vezi [Conturi și semnarea PQC](/sdk/concepts/accounts-pqc).
- **Convenții ale quickstart-urilor:** exemplele citesc contul public de faucet al testnet-ului și semnează cu fraza publică de test (`abandon` de unsprezece ori, apoi `about`). Nu alimenta niciodată un cont derivat din acea frază. Niciun quickstart nu trimite o tranzacție.

### Pagina pentru dezvoltatori din dashboard {#dashboard-developers}

Dashboard-ul are o pagină publică la [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Verificată la 27 octombrie 2026, are șapte file (prezentare completă: [Developers](/dashboard/developers)):

- **SDKs:** hub-ul SDK. Fiecare pachet din manifest, grupat pe produs, cu selector de limbaj, cea mai recentă versiune citită live din fiecare registru, linii de instalare și de import cu butoane de copiere, quickstart-ul cu rezultatul observat de echipa SDK, probleme cunoscute, precum și id-urile de lanț și endpoint-urile publice. Pachetele nepublicate nu afișează nicio comandă de instalare.
- **Transaction inspector:** lipești un hash de tranzacție de 64 de caractere hex, pe testnet sau mainnet, și vezi starea, semnatarul, taxa, dacă stratul post-cuantic se verifică și nivelul de securitate (PQC, Enrollment, SHAKE sau Classical). Folosește funcția `inspectTransaction` din QoreSign 0.1.1: vezi [Inspectorul de tranzacții](/qoresign/overview#inspector).
- **PQ key status:** citește din blockchain cheia ML-DSA-87 pe care o adresă a înregistrat-o și fereastra sa de autorizare EVM, pe testnet sau mainnet.
- **Simulator:** simulează o tranzacție semnată (`TxRaw` în base64 sau hex) și afișează consumul de gas și modificările de sold. Nimic nu este transmis în rețea.
- **Signing playground:** doar testnet. Generează în browser o cheie hibridă de unică folosință, ținută în memorie, pentru a semna și verifica mesaje și cereri Sign In With QoreChain.
- **QoreX test wallet:** doar testnet. Injectează în filă un portofel de test (`window.qorex`, anunțat prin EIP-6963 ca „QoreX (mock)") pentru a putea încerca fluxuri de dApp.
- **AI agents (MCP):** starea serverului MCP QoreChain (publicat) și configurarea pentru un client MCP: mai întâi `npx` local, plus un endpoint găzduit de testnet care are nevoie de o cheie API. Vezi [Serverul MCP QoreChain](/developer-tools/mcp).

Aceeași verificare a inspectorului este disponibilă în cod ca funcția de bibliotecă `inspectTransaction` din QoreSign 0.1.1 (TypeScript). Tabelele de mai jos și hub-ul SDK afișează aceleași date despre pachete; tabelele au fost verificate față de registre la 27 octombrie 2026.

## Unde este publicat {#where-published}

Fiecare nume este numele exact din registru. Linkul de pe pachet deschide pagina sa din registru. „Published” înseamnă că versiunea afișată poate fi instalată astăzi.

### QoreChain SDK {#group-sdk}

Ghiduri: [Prezentarea SDK](/sdk/overview), [Instalare](/sdk/install), [Ghid React](/sdk/guides/react), [Referință CLI](/sdk/reference/cli). Sursă: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Publicat |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Publicat. Provider, hook-uri, `ConnectButton` și insigna de stare PQC (exportată ca `QuantumSafeBadge` în 0.10.0) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Publicat |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Publicat. Doar citiri pe rețelele live |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Publicat |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Publicat |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Publicat |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Publicat |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Publicat |

### QoreSign {#group-qoresign}

Ghiduri: [Prezentarea QoreSign](/qoresign/overview), [Pornire rapidă](/qoresign/quickstart), [Vectori de test](/qoresign/vectors). Sursă: [qorechain/qoresign](https://github.com/qorechain/qoresign). Versiunea 0.1.1 a fost publicată la 27 octombrie 2026. QoreSign semnează local; nu păstrează chei în locul tău și nu face semnare threshold, MPC sau cu portofel hardware.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | Publicat. Include `inspectTransaction` și `fetchEvmWindow` (noi în 0.1.1) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (se importă ca `qoresign`) | 0.1.1 | `cargo add qorechain-qoresign` | Publicat |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | Publicat |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (se importă ca `qoresign`) | 0.1.1 | `pip install qorechain-qoresign` | Publicat, nou în 0.1.1. Wheel-uri pentru macOS (arm64, x86_64) și Linux (x86_64, aarch64); încă nu există wheel pentru Windows. Doar funcții offline |
| `QoreSign` (pachet Swift) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, produs `QoreSign` | Publicat ca release GitHub; framework-ul binar se descarcă de acolo |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | Publicat |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | Publicat. Același API ca artefactul JVM; exemplul său a fost rulat doar pe artefactul JVM, nu pe un dispozitiv Android |

Artefactele Kotlin și Android au nevoie în proiectul tău de compilatorul Kotlin 2.3 sau mai nou; un proiect pe Kotlin 2.1 nu se compilează împotriva lor.

Pachetul TypeScript are un subpath `@qorechain/qoresign/network`, iar modulul Go are aceleași helper-e, cu excepția `inspectTransaction` și `fetchEvmWindow`: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (cu modificările de sold), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (un singur fallback, apoi se oprește), `verifySiwqWithChain` și `verifyMessageWithChain`. Pachetele Rust, Swift, Kotlin și Python nu au cod de rețea.

### QoreSeal {#group-qoreseal}

Pagină: [QoreSeal](/developer-tools/qoreseal). Sursă: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0 criptează date către conturi QoreChain, grupuri private și sidechain-uri cu ML-KEM-1024 (FIPS 203). Criptarea funcționează offline; citirea cheii unui destinatar din lanț necesită registrul de chei KEM, care este live pe testnet și ajunge pe mainnet după upgrade-ul v3.2.5. Construcția așteaptă o revizuire externă înainte de 1.0.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (se importă ca `qoreseal`) | 0.1.0 | `cargo add qorechain-qoreseal` | Publicat |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Publicat |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (se importă ca `qoreseal`) | 0.1.0 | `pip install qorechain-qoreseal` | Publicat. Wheel-uri pentru macOS (arm64, x86_64) și Linux (x86_64, aarch64); încă nu există wheel pentru Windows |
| `QoreSeal` (pachet Swift) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, produs `QoreSeal` | Publicat ca release GitHub; framework-ul binar se descarcă de acolo |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Publicat pe Maven Central |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Publicat pe Maven Central |
| `@qorechain/qoreseal` | TypeScript | încă nu există | niciuna | **Nepublicat** pe npm (404 la 27 octombrie 2026). Sursa se află în repository |

### PQ light client {#group-pq-light-client}

Pagină: [PQ light client](/developer-tools/pq-light-client). Sursă: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). O specificație în ciornă și verificatori de referință pentru checkpoint-uri semnate cu ML-DSA-87. Nu se conectează la mainnet sau testnet: QoreChain nu produce checkpoint-urile pe care le verifică și nu este programat niciun suport în lanț. Rulează pe seturi simulate de validatori și pe vectori de test comuni.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Publicat. Depinde de `@qorechain/pqc` 0.2.3 |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (biblioteca `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Publicat |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (pachetul `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Publicat |

### Custody kit {#group-custody-kit}

Pagină: [Custody kit](/developer-tools/custody-kit). Sursă: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). Un ghid de integrare, cod de referință și vectori de test pentru custozi și burse, în TypeScript, Python, Go, Rust și Java. Este cod de referință pe care îl citești, îl copiezi sau îl incluzi în proiect (vendor), nu un set de pachete: singura intrare într-un registru este modulul Go.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| Release GitHub `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`, apoi construiește folderul pentru limbajul tău | Publicat, 27 octombrie 2026. Fără pachet npm, PyPI, crates.io sau Maven, în mod intenționat |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (pachetul `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Publicat |

### QoreScan {#group-qorescan}

Pagină: [QoreScan](/developer-tools/qorescan). Sursă: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0 inventariază criptografia unei implementări QoreChain (un director home de nod, starea live a rețelei, endpoint-uri TLS și surse Solidity) și scrie un CBOM CycloneDX 1.6 și rapoarte Markdown. Este un ajutor de inventariere, nu o certificare sau un audit.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [Release GitHub `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | Binare pentru macOS, Linux și Windows (amd64, arm64) | 0.1.0 | descarcă și verifică față de `qorescan_0.1.0_checksums.txt` | Publicat, 27 octombrie 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | wrapper npm (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Publicat. Descarcă și verifică binarul din release la prima rulare |
| [`qorescan`](https://pypi.org/project/qorescan/) | wrapper PyPI (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` sau `pip install qorescan` | Publicat. Același comportament ca wrapper-ul npm |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Publicat. Go 1.26 |

### Chain developer kit (SDK 0.11.0) {#group-chain-dev-sdk}

Pagină: [Chain developer kit](/developer-tools/chain-dev-sdk). Sursă: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). Partea din QoreChain SDK 0.11.0 pentru echipele de Solidity și contracte inteligente: definiții de lanț viem și helper-e pentru fereastra de autorizare EVM în `@qorechain/evm`, patru șabloane noi `create-qorechain-dapp` (Foundry, Hardhat 3, viem cu wagmi și un token QoreChain Native), quickstart-uri EVM și o pagină despre cum diferă EVM-ul QoreChain de Ethereum.

**În curând.** SDK 0.11.0 este etichetat pe GitHub (`v0.11.0`), iar release-ul său npm este în așteptare: la 27 octombrie 2026 npm servea `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0 și `create-qorechain-dapp` 0.10.0, iar `@qorechain/sdk@0.11.0` returna 404. Până când npm afișează 0.11.0, noile definiții de lanț, helper-ele pentru fereastră și șabloanele nu pot fi instalate; ceea ce primești astăzi sunt pachetele 0.10.0 din [tabelul SDK](#group-sdk). 0.11.0 modifică doar pachetele npm: SDK-urile Python, Rust, Go și Java rămân la 0.10.0.

### Rollup Development Kit (RDK) {#group-rdk}

Ghiduri: [Prezentarea rollup-urilor](/rollups/overview), [Implementarea unui rollup](/rollups/deploying-a-rollup), [Arhitectura Rollup Development Kit](/architecture/rollup-development-kit). Sursă: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Publicat. Singurul client RDK care semnează hibrid, și doar când pasezi un `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Publicat. De la 0.6.2 pornește prin link-ul bin npm (0.6.1 și versiunile anterioare nu afișau nimic). Comenzile sale de tranzacție semnează doar clasic, ceea ce rețelele refuză |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Publicat |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, se importă `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | Publicat. Citirile funcționează; tranzacțiile semnează doar clasic |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Publicat. Citirile funcționează; tranzacțiile semnează doar clasic |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Publicat. Citirile funcționează; tranzacțiile semnează doar clasic |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Publicat. Citirile funcționează; tranzacțiile semnează doar clasic |

### Primitive post-cuantice (`qorechain-pqc`) {#group-pqc}

Ghid: [Semnare post-cuantică](/developer-guide/post-quantum-signing). Sursă: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). Semnarea ML-DSA este deterministă implicit în toate binding-urile; semnarea hedged este o opțiune explicită.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Publicat |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Publicat. Necesită liboqs; la primul import îl construiește dacă lipsește (git, CMake și un compilator C) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Publicat |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Publicat |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Publicat |
| Bibliotecă C | C | 0.2.3 | construiește `c/` din repository (necesită liboqs și OpenSSL) | Doar sursă, fără registru de pachete |

### Wallet adapter {#group-wallet-adapter}

Pagină: [Wallet adapter](/developer-tools/wallet-adapter). Sursă: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (modul ES, JavaScript simplu cu tipuri) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Publicat. Fără quickstart testat |

### Chain bridge {#group-chain-bridge}

Pagină: [Chain bridge și handle-uri](/developer-tools/chain-bridge).

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (server Node.js) | 0.2.3 | `npm install @qorechain/chain-bridge` | Publicat. Fără quickstart testat. Registrul nu listează niciun repository sursă |

### Handles {#group-handles}

Pagină: [Chain bridge și handle-uri](/developer-tools/chain-bridge#handles).

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Publicat. Verifică o rezolvare de handle față de o cheie de registru fixată. Nu fixează el însuși adrese: apelantul furnizează depozitul de fixări și decide când fixează. Fără quickstart testat. Registrul nu listează niciun repository sursă |

### Integrările QoreX {#group-qorex}

Ghid: [QoreX, pentru dezvoltatori](/qorex/overview#developers). Sursă: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). Toate cele șase au fost publicate la 27 octombrie 2026.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Publicat. Găsește QoreX (EIP-6963 și providerul nativ) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Publicat |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Publicat |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Publicat. Cu `@cosmos-kit/react` 2.24 pasează `throwErrors={false}`; fragmentul din README îl omite |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Publicat. Un portofel de test care semnează pe bune pe testnet |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Publicat. Fixture-uri Playwright; modul extensie aruncă o eroare astăzi |

### Connect (depreciat) {#group-connect}

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | niciuna | **Depreciat și nemaiîntreținut.** Nu-l folosi pentru lucrări noi. Înlocuiește-l ca în tabelul de mai jos |

:::caution @qorechain/connect este depreciat
`@qorechain/connect` este marcat ca depreciat pe npm. Intervalul său de peer este `@qorechain/wallet-adapter` `^0.2.1`, care nu include 0.4.0, și nu deschide o [fereastră de autorizare EVM](/sdk/guides/evm#evm-window), așa că o trimitere EVM prin el este refuzată până când contul are o cheie înregistrată și o fereastră deschisă. Repository-ul listat în metadatele sale din registru nu este accesibil public.
:::

| Nevoie | Folosește în schimb |
|---|---|
| Detectarea QoreX (EVM, native, Solana) | `@qorechain/qorex-types` |
| dApp-uri EVM cu RainbowKit și wagmi | `@qorechain/qorex-rainbowkit` |
| dApp-uri Cosmos | `@qorechain/qorex-interchain-kit` (sau `@qorechain/qorex-cosmos-kit`) |
| Semnare hibridă în propriul portofel sau backend | `@qorechain/qoresign` |

### QORel, releul IBC {#group-qorel}

| Pachet | Unde | Versiune | Instalare | Stare |
|---|---|---|---|---|
| QORel (`qorel`) | Release GitHub `qorel-v0.1.0`, Homebrew, container `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | Publicat ca pre-lansare. Doar IBC v1; doar testnet. Vezi [QORel](/qorel/overview) |

### Server MCP și CLI {#group-mcp}

Pagini: [Serverul MCP QoreChain](/developer-tools/mcp), [CLI-ul QoreChain](/developer-tools/qore-cli). Sursa: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (public). Ambele citesc lanțul și niciunul nu semnează, nu ține chei și nu transmite. Publicate la 27 octombrie 2026.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (server Node.js, bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Publicat. stdio și Streamable HTTP. Un endpoint găzduit, `https://mcp.qorechain.io/mcp`, are nevoie de o cheie API, solicitată din dashboard-ul tău |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (sau `uvx qorechain-mcp`) | Publicat. Aceleași unelte ca pachetul npm; doar stdio |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Publicat. Ieșire `--json` identică cu ieșirea uneltei MCP |

### Planificate (nepublicate) {#planned}

Acestea nu sunt încă într-un registru, așa că nu există nimic de instalat, iar comportamentul descris pentru ele nu poate fi folosit încă. Fiecare a returnat 404 (sau nu era listat) la 27 octombrie 2026.

| Pachet | Utilizare intenționată | Stare |
|---|---|---|
| `@qorechain/qoreseal` pe npm | QoreSeal pentru TypeScript | Nepublicat; sursa se află în repository |
| `@qorechain/sdk`, `@qorechain/evm`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp` 0.11.0 pe npm | [Chain developer kit](/developer-tools/chain-dev-sdk) | Etichetat pe GitHub, release-ul npm în așteptare |

## Cum obții versiunile live {#live-versions}

Tabelele sunt o instantanee. Pentru a citi singur versiunea curentă a unui pachet:

| Registru | Cerere | Câmp |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (trimite un header `User-Agent`, altfel cererea este refuzată) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (elimină `v`-ul din față) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (elimină `v`-ul din față); apelurile GitHub neautentificate sunt limitate la 60 pe oră per adresă |

Pentru un nume npm cu scope păstrează `@`, de exemplu `https://registry.npmjs.org/@qorechain/sdk/latest`. Un 404 înseamnă că pachetul nu este publicat. Proxy-ul Go poate răspunde la `@latest` din cache pentru scurt timp după un release, așa că fixează versiunea în comandă când ai nevoie de una anume (instalarea Go pentru RDK de mai sus o face). Fiecare pagină de pachet din registrul său afișează și versiunea, și istoricul release-urilor.

## Limite și probleme cunoscute {#limits}

- **Două rețele live, versiuni diferite.** Mainnet-ul rulează v3.2.4, iar testnet-ul rulează v3.2.6. O funcție care există doar pe testnet este marcată pe pagina ei. Nu presupune comportamentul v3.2.5 pe mainnet.
- **Încă nu sunt live:** `@qorechain/qoreseal` pe npm, SDK 0.11.0 (chain developer kit) pe npm, tranzacțiile SVM și precompilările EVM pe mainnet (sunt active doar pe testnet; vezi [prezentarea SDK](/sdk/overview) pentru lista pe trasee).
- **Registrul QoreSeal și PQ light client.** Criptarea către o adresă citită din lanț necesită registrul de chei KEM, live pe testnet și care ajunge pe mainnet după v3.2.5. PQ light client nu se conectează la niciuna dintre rețele; nu este programat niciun suport în lanț pentru checkpoint-urile sale.
- **Kotlin 2.3 sau mai nou.** Artefactele Kotlin și Android QoreSign și QoreSeal au nevoie de compilatorul Kotlin 2.3 sau mai nou; Kotlin 2.1 nu se compilează împotriva lor.
- **Fără wheel-uri pentru Windows.** Pachetele Python QoreSign și QoreSeal au wheel-uri doar pentru macOS și Linux; pe alte platforme se construiesc din distribuția sursă, care necesită Rust.
- **Exemple nerulate:** din cele 34 de intrări de quickstart, 31 au rulat și au trecut la 27 octombrie 2026. Exemplul QoreSign pentru Python a fost rulat după publicarea pachetului (macOS arm64 și Linux aarch64), iar exemplul QoreSign pentru Android nu a fost rulat pe un dispozitiv. Wallet adapter-ul, chain bridge-ul și handle-urile nu au quickstart, așa că exemplele lor din acest manual provin din tipurile și sursa pachetelor și nu au fost rulate end to end.
- **`@qorechain/rdk-cli` înainte de 0.6.2** nu afișa nimic când era pornit prin link-ul bin npm, iar `--version` afișa 0.4.1. **`@qorechain/rdk` înainte de 0.7.0** construia dovezi de retragere care nu s-au verificat niciodată on-chain. Folosește 0.7.0.
- **Conflict de versiune cosmjs.** `@qorechain/wallet-adapter` și `@qorechain/chain-bridge` folosesc cosmjs 0.32; SDK-ul folosește cosmjs 0.39. Instalarea adapter-ului lângă SDK în același proiect face ca npm să raporteze `ERESOLVE`. Păstrează-le în proiecte separate sau pasează `--legacy-peer-deps`.
- **Copie SDK imbricată în versiunile mai vechi ale RDK.** `@qorechain/rdk` 0.6.2 și versiunile anterioare depind de `@qorechain/sdk` `^0.9.0`, așa că o aplicație pe SDK 0.10.0 primea o a doua copie SDK 0.9.x imbricată. De la 0.7.0 kitul depinde de `@qorechain/sdk` `^0.10.0` și împarte o singură copie.
- **Clienți RDK doar clasici.** Clienții RDK Python, Rust, Go și Java semnează doar clasic, ceea ce traseul native refuză pe ambele rețele; folosește-i pentru citiri sau folosește clientul TypeScript cu un `pqcKeypair` pentru tranzacții.
- **Pachete fără repository sursă public.** `@qorechain/chain-bridge` și `@qorechain/handles` nu listează niciun repository sursă în metadatele lor din registru. Poți citi conținutul publicat al pachetelor pe npm.
- **Python `qorechain-pqc`** nu are generare de chei din seed în 0.2.3 și necesită liboqs.
