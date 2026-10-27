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

- **Un singur format de semnătură hibridă în fiecare limbaj.** Lanțul cere o semnătură secp256k1 plus o semnătură ML-DSA-87 (FIPS 204) pentru tranzacțiile de pe traseul native. QoreSign reproduce vectorii săi de test publicați octet cu octet în TypeScript, Rust, Go, Swift și Kotlin, iar `qorechain-pqc` rulează un singur set comun de vectori în cele șase binding-uri ale sale, astfel încât o cheie sau o semnătură făcută într-un limbaj se verifică în celelalte.
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
| Lași dApp-ul tău să folosească portofelul QoreX | Integrările QoreX | [QoreX, pentru dezvoltatori](/qorex/overview#developers) |
| Creezi și operezi un rollup de aplicație | RDK | [Prezentarea rollup-urilor](/rollups/overview), [Implementarea unui rollup](/rollups/deploying-a-rollup) |
| Folosești separat primitivele post-cuantice (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Semnare post-cuantică](/developer-guide/post-quantum-signing) |

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

Dashboard-ul are o pagină publică la [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Verificată la 27 octombrie 2026, are șase file (prezentare completă: [Developers](/dashboard/developers)):

- **SDKs:** hub-ul SDK. Fiecare pachet din manifest, grupat pe produs, cu selector de limbaj, cea mai recentă versiune citită live din fiecare registru, linii de instalare și de import cu butoane de copiere, quickstart-ul cu rezultatul observat de echipa SDK, probleme cunoscute, precum și id-urile de lanț și endpoint-urile publice. Pachetele nepublicate nu afișează nicio comandă de instalare.
- **PQ key status:** citește din blockchain cheia ML-DSA-87 pe care o adresă a înregistrat-o și fereastra sa de autorizare EVM, pe testnet sau mainnet.
- **Simulator:** simulează o tranzacție semnată (`TxRaw` în base64 sau hex) și afișează consumul de gas și modificările de sold. Nimic nu este transmis în rețea.
- **Signing playground:** doar testnet. Generează în browser o cheie hibridă de unică folosință, ținută în memorie, pentru a semna și verifica mesaje și cereri Sign In With QoreChain.
- **QoreX test wallet:** doar testnet. Injectează în filă un portofel de test (`window.qorex`, anunțat prin EIP-6963 ca „QoreX (mock)") pentru a putea încerca fluxuri de dApp.
- **AI agents (MCP):** o pagină pentru serverul MCP, care nu este încă publicat (vezi [Planificate](#planned)).

**Inspectorul de tranzacții** (lipești un hash și vezi fiecare mesaj, semnatarul, taxa și dacă semnătura post-cuantică se verifică) **nu este încă live**. Tabelele de mai jos și hub-ul SDK afișează aceleași date; tabelele au fost verificate față de registre la 27 octombrie 2026.

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

Ghiduri: [Prezentarea QoreSign](/qoresign/overview), [Pornire rapidă](/qoresign/quickstart), [Vectori de test](/qoresign/vectors). Sursă: [qorechain/qoresign](https://github.com/qorechain/qoresign). QoreSign semnează local; nu păstrează chei în locul tău și nu face semnare threshold, MPC sau cu portofel hardware.

| Pachet | Limbaj | Versiune | Instalare | Stare |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.0 | `npm install @qorechain/qoresign` | Publicat |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (se importă ca `qoresign`) | 0.1.0 | `cargo add qorechain-qoresign` | Publicat |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.0 | `go get github.com/qorechain/qoresign/go` | Publicat |
| `QoreSign` (pachet Swift) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")`, produs `QoreSign` | Publicat ca release GitHub; framework-ul binar se descarcă de acolo |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+) | 0.1.0 | `implementation("io.github.qorechain:qoresign:0.1.0")` | Publicat |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+) | 0.1.0 | `implementation("io.github.qorechain:qoresign-android:0.1.0")` | Publicat. Același API ca artefactul JVM; exemplul său a fost rulat doar pe artefactul JVM, nu pe un dispozitiv Android |
| `qorechain-qoresign` (PyPI) | Python | încă nu există | niciuna | **Nepublicat.** Proiectul PyPI a returnat 404 la 27 octombrie 2026. Planificat pentru 0.1.1 |

Pachetul TypeScript are un subpath `@qorechain/qoresign/network`, iar modulul Go are aceleași helper-e: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (cu modificările de sold), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (un singur fallback, apoi se oprește), `verifySiwqWithChain` și `verifyMessageWithChain`. Crate-ul Rust nu are cod de rețea.

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

### Planificate (nepublicate) {#planned}

Aceste nume sunt rezervate pentru unelte care nu sunt încă într-un registru. Fiecare a returnat 404 în registrul său la 27 octombrie 2026, așa că nu există nimic de instalat, iar comportamentul listat nu poate fi folosit încă.

| Pachet | Utilizare intenționată | Stare |
|---|---|---|
| `@qorechain/mcp` | Un server Model Context Protocol cu acces de citire la QoreChain (blocuri, tranzacții, conturi, validatori, niveluri de staking, starea semnăturii hibride, simulare, transferuri nesemnate). Nu ar semna și nu ar transmite niciodată. Este planificat și un endpoint găzduit | Nepublicat. Repository-ul sursă nu este public. Endpoint-ul găzduit nu este live |
| `@qorechain/qore-cli` (comanda `qore`) | Citiri din linia de comandă cu ieșire JSON stabilă peste aceleași date | Nepublicat |
| `qorechain-qoresign` pe PyPI | QoreSign pentru Python | Nepublicat (planificat 0.1.1) |

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
- **Încă nu sunt live:** inspectorul de tranzacții din pagina pentru dezvoltatori a dashboard-ului, serverul MCP și CLI-ul `qore`, QoreSign pentru Python, tranzacțiile SVM și precompilările EVM pe mainnet (vezi [prezentarea SDK](/sdk/overview) pentru lista pe trasee).
- **Exemple nerulate:** din cele 34 de intrări de quickstart, 31 au rulat și au trecut la 27 octombrie 2026. Exemplul QoreSign pentru Python nu a fost rulat (pachetul nu este publicat), iar exemplul QoreSign pentru Android nu a fost rulat pe un dispozitiv. Wallet adapter-ul, chain bridge-ul și handle-urile nu au quickstart, așa că exemplele lor din acest manual provin din tipurile și sursa pachetelor și nu au fost rulate end to end.
- **`@qorechain/rdk-cli` înainte de 0.6.2** nu afișa nimic când era pornit prin link-ul bin npm, iar `--version` afișa 0.4.1. **`@qorechain/rdk` înainte de 0.7.0** construia dovezi de retragere care nu s-au verificat niciodată on-chain. Folosește 0.7.0.
- **Conflict de versiune cosmjs.** `@qorechain/wallet-adapter` și `@qorechain/chain-bridge` folosesc cosmjs 0.32; SDK-ul folosește cosmjs 0.39. Instalarea adapter-ului lângă SDK în același proiect face ca npm să raporteze `ERESOLVE`. Păstrează-le în proiecte separate sau pasează `--legacy-peer-deps`.
- **Copie SDK imbricată în versiunile mai vechi ale RDK.** `@qorechain/rdk` 0.6.2 și versiunile anterioare depind de `@qorechain/sdk` `^0.9.0`, așa că o aplicație pe SDK 0.10.0 primea o a doua copie SDK 0.9.x imbricată. De la 0.7.0 kitul depinde de `@qorechain/sdk` `^0.10.0` și împarte o singură copie.
- **Clienți RDK doar clasici.** Clienții RDK Python, Rust, Go și Java semnează doar clasic, ceea ce traseul native refuză pe ambele rețele; folosește-i pentru citiri sau folosește clientul TypeScript cu un `pqcKeypair` pentru tranzacții.
- **Pachete fără repository sursă public.** `@qorechain/chain-bridge` și `@qorechain/handles` nu listează niciun repository sursă în metadatele lor din registru. Poți citi conținutul publicat al pachetelor pe npm.
- **Python `qorechain-pqc`** nu are generare de chei din seed în 0.2.3 și necesită liboqs.
