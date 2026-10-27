---
slug: /developer-tools/scaffolders-and-cli
title: Generatoare de proiecte și CLI-ul qorollup
sidebar_label: Generatoare și CLI
sidebar_position: 21
---

# Generatoare de proiecte și CLI-ul `qorollup`

Trei instrumente de linie de comandă duc un proiect QoreChain de la zero la un punct de pornire tipizat și compilabil. Sunt pentru dezvoltatorii de aplicații (dApp-uri) și pentru operatorii de rollup-uri care lucrează în Node.js:

* **`create-qorechain-dapp`** (0.10.0) generează un dApp pornind de la unul din trei șabloane, construit pe [SDK-ul QoreChain](/sdk/overview).
* **`create-qorechain-rollup`** (0.6.2) generează un proiect de rollup pornind de la unul din șase șabloane, construit pe [Rollup Development Kit](/rollups/overview) în TypeScript.
* **`qorollup`**, comanda pachetului `@qorechain/rdk-cli` (0.6.2), este linia de comandă a operatorului: verificări preliminare, crearea și monitorizarea unui rollup, citirea parametrilor live.

Pagina reflectă pachetele publicate, așa cum sunt instalate din npm la 27 octombrie 2026. Ghidurile conceptuale sunt [Implementarea unui Rollup](/rollups/deploying-a-rollup) și [Referința CLI a SDK-ului](/sdk/reference/cli).

## Inovații {#innovations}

* **Generare non-interactivă pentru CI.** Fiecare întrebare are un flag: `--template`, `--network`, `--package-manager`, `--yes` (acceptă valorile implicite) și `--no-install`. Un pipeline poate genera și compila un proiect cu o singură comandă și fără terminal.
* **Șabloanele sunt fixate pe pachetele curente.** Șabloanele de dApp depind de `@qorechain/sdk` `^0.10.0` (șablonul EVM de `@qorechain/evm`), iar șabloanele de rollup de `@qorechain/rdk` `^0.6.1`, pe care o instalare nouă îl rezolvă la 0.6.2. Un generator anterior (0.8.0) scria intervale care se rezolvau la un SDK ce nu putea semna pentru rețelele live; acest lucru nu se mai întâmplă cu cel curent.
* **Șabloanele de rollup codifică o configurație validă pentru fiecare caz de utilizare.** Fiecare șablon de rollup stabilește o combinație de settlement, sequencer, disponibilitate a datelor, gaz și VM pe care matricea de compatibilitate a RDK o acceptă, iar generatorul afișează stake-ul live și arderea la creare înainte de a crea ceva.
* **O comandă de verificare preliminară care numește ce lipsește.** `qorollup doctor` (și `npm run doctor` într-un șablon de rollup) verifică dacă punctul final REST răspunde, dacă parametrii modulului pot fi citiți, dacă punctul final este rețeaua pe care ai cerut-o și dacă un semnatar este configurat, și afișează o linie pentru fiecare verificare. Într-un șablon validează și configurația rollup-ului față de matricea de compatibilitate.
* **Semnare hibridă integrată în șabloane.** Șabloanele de rollup se conectează printr-un mic `signer.ts` care derivă cheia ML-DSA-87 a contului din mnemonic (sau primește un seed împreună cu o cheie privată brută) și semnează hibrid, ceea ce rețelele cer pe lane-ul nativ. Șablonul de dApp `rollup-app` face același lucru și rulează ca rulare de probă, dacă nu setezi `QORE_BROADCAST=1`.
* **Rulări de probă.** `qorollup create ... --dry-run` validează configurația, afișează stake-ul și arderea și precizează că ar trimite `MsgCreateRollup` fără a-l transmite.
* **Ieșire citibilă de mașini.** `qorollup ... --json` afișează JSON pentru scripturi.

## Cum se folosește {#how-to-use}

### Generează un dApp {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Șablon | Ce generează | Scripturi |
| --- | --- | --- |
| `evm-solidity` | Un contract Solidity `Counter` cu un artefact precompilat și un script viem care îl implementează și îl apelează folosind `@qorechain/evm`. Fișiere: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | O pagină Vite, React și TypeScript care citește soldurile unei adrese (și o prezentare generală a tokenomicii) cu `@qorechain/sdk`. Fișiere: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Un script Node care folosește `createRollupClient` și `createMultilayerClient` din SDK pentru a construi mesaje de rollup și de sidechain sau paychain. Fișiere: `src/index.ts` și configurația obișnuită. Rulare de probă implicit. | `start`, `typecheck` |

| Flag | Semnificație |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web` sau `rollup-app` |
| `--network <name>` | `testnet` sau `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` sau `yarn` |
| `-y, --yes` | omite întrebările și folosește valorile implicite |
| `--no-install` | nu instala dependențele |
| `-h, --help`, `-v, --version` | ajutor, versiune |

Exemplu testat (din hub-ul pentru dezvoltatori; rulat la 27 octombrie 2026 într-un director gol, cu `npx` din registrul npm public): generează șablonul web și îl compilează. Observat: `Done! Created my-dapp` și un `vite build` reușit. Compilarea afișează un avertisment despre dimensiunea bundle-ului, care este inofensiv.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Înainte să rulezi aplicația web, deschide fișierul `.env` generat: indică `http://localhost:1317` și `http://localhost:8545`, așa că setează `VITE_QORE_REST_URL` la `https://api-testnet.qore.host` (sau `https://api.qore.host` pentru mainnet) și `VITE_QORE_EVM_RPC_URL` la `https://evm-testnet.qore.host` (sau `https://evm.qore.host`).

### Generează un proiect de rollup {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Șablon | Profil | Settlement / sequencer / DA / gaz / VM | Fișiere suplimentare |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | un prover de referință (`src/prover.ts`) și un circuit demonstrativ în `circuits/` |
| `gaming-rollup` | gaming | based, based, native, gaz fix, VM personalizat | niciunul |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, cu flux de contestare | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, gaz subvenționat, EVM | niciunul |
| `custom-rollup` | custom | complet parametrizat, fiecare câmp documentat | niciunul |
| `multivm-rollup` | multivm | un rollup EVM care apelează contracte QoreChain Native prin precompile-ul cross-VM | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Fiecare șablon conține `rollup.config.ts` (configurația), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` și `.env.example`, un README și un `.github/workflows/deploy.yml`. Scripturi: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. Profilurile predefinite sunt explicate în [Profiluri predefinite](/rollups/preset-profiles).

Opțiunile sunt aceleași ca la generatorul de dApp-uri, cu cele șase nume de șabloane de mai sus. Șablonul `multivm-rollup` este listat de `--help`, dar nu și în README-ul pachetului, care enumeră cinci.

Exemplu testat (hub-ul pentru dezvoltatori, 27 octombrie 2026, `npx` din npm într-un director gol). Observat: `Created my-rollup (defi-rollup template)` și `tsc --noEmit` trecut cu succes. Aceeași generare și `npm run typecheck` au fost repetate cu 0.6.2 în aceeași zi, cu același rezultat.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

Pașii următori, așa cum îi afișează generatorul: `npm install`, completează cheia operatorului în `.env`, `npm run doctor`, `npm run create`, `npm run query-status`. Fișierul `.env` generat conține deja punctele finale publice de testnet (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) și câmpuri de cheie goale: `QORE_MNEMONIC` sau `QORE_OPERATOR_PRIVATE_KEY_HEX` (cu `QORE_PQC_SEED_HEX` pentru seed-ul post-cuantic). Nu comite niciodată acel fișier.

### CLI-ul `qorollup` {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.6.2
qorollup doctor --network testnet
```

Îl poți rula și fără instalare: `npx @qorechain/rdk-cli doctor`.

| Comandă | Ce face |
| --- | --- |
| `doctor` | verificare preliminară: puncte finale, parametrii modulului, potrivirea rețelei, semnatar, sold, configurație |
| `params` | afișează parametrii live ai modulului |
| `create --rollup-id <id>` | creează un rollup (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | stare și sănătate, sau o vedere live (`--interval <ms>`) |
| `advise <id>` | recomandări de la QCAI Copilot (vezi [QCAI Copilot](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | sugerează un profil pentru un caz de utilizare |
| `receipt <id> <batch>` | construiește o chitanță de settlement (`--verify`, `--out <file>`), vezi [Chitanțe de settlement](/rollups/settlement-receipts) |
| `watchtower <id>` | cadru de contestare pentru rollup-uri optimistic, vezi [Watchtower](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | tranziții de ciclu de viață (doar creatorul) |
| `keygen` | generează o cheie de operator (mnemonic și adresă) |
| `manifest export`, `manifest import` | exportă sau importă un manifest de rollup |
| `withdraw --file <json>` | asamblează și trimite o retragere (`--dry-run`) |
| `faucet <address>` | cere fonduri de testnet (necesită `QORE_FAUCET_URL`) |

Flaguri globale: `--network testnet|mainnet` (implicit testnet), `--rest`, `--rpc`, `--evm-rpc` (suprascrieri ale punctelor finale, sau `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` sau `--key` (sau `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Rulează-l înainte de orice trimite o tranzacție. Ieșire observată la 27 octombrie 2026 cu 0.6.2 și fără semnatar setat, pe testnet (mainnet a afișat același lucru, cu `qorechain-vladi` și `https://api.qore.host`; instrumentul afișează linii lungi, arătate aici ca cratime):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

O linie care începe cu `!` este un avertisment și nu face rularea să eșueze; un semnatar lipsă este o problemă doar când vrei să creezi sau să operezi un rollup. Comanda iese cu 0 când nicio verificare nu eșuează.

**Exemplu testat.** Din hub-ul pentru dezvoltatori: citirea parametrilor live ai modulului, fără cheie. A eșuat pe 0.6.1 (comanda nu a afișat nimic și a ieșit cu 0) și a fost rulată din nou pe 0.6.2:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

Observat cu 0.6.2 prin `npx`, printr-o instalare globală și prin legătura locală `node_modules/.bin/qorollup`: parametrii modulului se afișează (max rollup-uri 200, stake minim 10000 QOR, ardere la creare 1%, fereastră de contestare 3600 s, blob maxim de disponibilitate a datelor 2.097.152 de octeți, păstrarea blob-urilor 432.000 de blocuri, max batch-uri per bloc 10). O rulare de probă a unei creări, observată și ea:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## Cum accesezi {#how-to-access}

* **Cerințe preliminare.** Node.js 20 sau mai nou și un manager de pachete. Generatoarele scriu fișiere și, dacă nu transmiți `--no-install`, instalează dependențe, deci au nevoie de acces la rețea către registrul npm. Clienții RDK pentru Python, Rust, Go și Java sunt biblioteci și nu au generator; vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup).
* **Rețele și puncte finale.** Mainnet `qorechain-vladi` (chain id EVM 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Testnet `qorechain-diana` (chain id 9800): aceleași gazde, cu `-testnet` după prima etichetă, de exemplu `https://api-testnet.qore.host`. Citirea datelor, `doctor`, `params`, `suggest` și `--dry-run` nu necesită cont.
* **Conturi și chei.** Orice trimite o tranzacție are nevoie de un cont de operator alimentat și de mnemonicul sau cheia lui privată, furnizate prin variabile de mediu sau flaguri și niciodată comise. Crearea unui rollup necesită stake-ul minim (10.000 QOR pe ambele rețele, citit live la 27 octombrie 2026), din care 1% este ars la creare. `qorollup keygen` face o cheie nouă; pe testnet, fondurile de test vin din [Faucet-ul Dashboard](/dashboard/faucet) sau din `qorollup faucet` cu `QORE_FAUCET_URL` setat.
* **Semnătura hibridă.** Tranzacțiile din lane-ul nativ au nevoie de o semnătură secp256k1 plus o semnătură ML-DSA-87. Șabloanele derivă cheia post-cuantică din mnemonicul tău; comenzile de tranzacție `qorollup` nu o fac (vezi limitele de mai jos).
* **Costuri.** Instrumentele sunt gratuite (Apache-2.0). Pe lanț, pragul minim al comisionului este 0.1 uqor per gaz; stake-ul și arderea rollup-ului de mai sus se aplică la creare.

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Link |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (comanda `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (comanda `create-qorechain-rollup`) | 0.6.2 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (comanda `qorollup`) | 0.6.2 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (biblioteca folosită de șabloane) | 0.6.2 | https://www.npmjs.com/package/@qorechain/rdk |

Sursa: https://github.com/qorechain/qorechain-sdk/tree/main/cli (generatorul de dApp-uri), https://github.com/qorechain/qorechain-rdk/tree/main/cli (generatorul de rollup-uri) și https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). Versiunea 0.6.2 a RDK este publicată și pe PyPI, crates.io și proxy-ul de module Go; artefactul Java de pe Maven Central este încă 0.6.1 (verificat la 27 octombrie 2026). Toate sunt Apache-2.0.

## Limite și probleme cunoscute {#limits}

* **`--network mainnet` nu a schimbat fișierele generate într-o rulare de test.** La 27 octombrie 2026, `fullstack-web` și `custom-rollup` au fost generate cu `--network mainnet`; fișierul `.env` generat conținea în continuare puncte finale localhost (dApp) sau `QORE_NETWORK=testnet` cu punctele finale de testnet (rollup), iar `App.tsx` al dApp-ului crea un client `testnet`. Setează singur rețeaua și punctele finale în `.env` și, pentru șablonul web, în `src/App.tsx`.
* **Niciun rollup nu există încă pe vreuna dintre rețele** (verificat la 27 octombrie 2026). Nicio cale de tranzacție a instrumentelor de rollup nu a fost exersată pe un rollup live. Validează totul mai întâi pe testnet și citește [RDK 0.6.2: modificări și limite](/rollups/deploying-a-rollup#rdk-050-limits).
* **Șablonul `defi-rollup` nu poate finaliza un batch.** Settlement-ul ZK nu este încă utilizabil pe vreuna dintre rețele, iar circuitul său demonstrativ nu ar putea oricum trece verificarea dovezii de către lanț. Folosește un șablon cu settlement `optimistic` până când se schimbă acest lucru (vezi [ZK, STARK și retrageri](/rollups/zk-stark-withdrawals)).
* **Șablonul `multivm-rollup` depinde de ceva care nu este live.** Precompile-ul cross-VM de la `0x0000000000000000000000000000000000000901` nu este activ pe vreuna dintre rețele, deci un apel dintr-un contract nu face nimic; șablonul verifică acest lucru, iar contractul său este scris să dea revert în loc să eșueze în tăcere (vezi [Multi-VM](/rollups/multi-vm)).
* **Comenzile de tranzacție `qorollup` semnează doar clasic.** `create`, `pause`, `resume`, `stop` și `withdraw` se conectează fără cheie post-cuantică, pe care ambele rețele o refuză pe lane-ul nativ. Citirile, `doctor`, `params`, `receipt` și `--dry-run` nu sunt afectate. Pentru a trimite tranzacții, folosește un proiect generat (scripturile lui semnează hibrid), RDK-ul TypeScript cu un `pqcKeypair` sau CLI-ul lanțului.
* **Unele ajutoare `qorollup` nu au încă cu cine să vorbească.** `advise` pe testnet, la 27 octombrie, a afișat „advisory unavailable" pentru suprafețele de taxe, rețea, fraudă și agentul RL (nodul a răspuns 501 sau „method does not exist") și pentru un rollup care nu există. `suggest` a returnat un profil cu `source: fallback`, ceea ce indică faptul că a fost folosită lista implicită încorporată în loc de serviciul de asistent. Citește avertismentele.
* **`rollup-app` transmite doar când ceri.** Rulează implicit o rulare de probă; cu `QORE_BROADCAST=1` înregistrează o dată cheia ML-DSA-87 a contului și semnează hibrid. Valorile sale de rollup din exemplu sunt ilustrative: ia numele reale ale profilurilor și stake-ul din [Profiluri predefinite](/rollups/preset-profiles).
* **`fullstack-web` afișează o eroare la butonul de tokenomică.** Acel panou apelează o metodă JSON-RPC `qor_` pe care punctele finale publice nu o servesc; căutarea soldului funcționează. Înlocuiește-l cu o citire REST precum `client.rest.getBurnStats()`.
* **`evm-solidity` are nevoie de mai mult decât un cont alimentat.** Trimiterea unei tranzacții EVM pe QoreChain are nevoie și de o cheie ML-DSA-87 înregistrată și de o fereastră de autorizare EVM deschisă, configurate de pe lane-ul nativ (vezi [ghidul EVM](/developer-guide/evm-development#evm-window)). Scriptul `deploy` al șablonului nu a fost rulat pe o rețea live pentru această pagină.
* **`create-qorechain-dapp --version` afișează `0.5.1`**, deși pachetul instalat este 0.10.0 (verificat la 27 octombrie 2026). Citește versiunea din `package.json` sau din registru.
* **README-urile pachetelor sunt depășite.** README-ul `create-qorechain-dapp` enumeră două șabloane, iar cel al `create-qorechain-rollup` cinci; `--help` arată trei și șase. Ai încredere în `--help`.
* **Versiunile dinaintea 0.6.2 nu funcționează din npm.** `qorollup` 0.6.1 și anterioare, instalat prin npm în orice fel, nu a afișat nimic și a ieșit cu codul 0, iar `--version` a afișat `0.4.1`. Dacă trebuie să rămâi pe 0.6.1, rulează `node node_modules/@qorechain/rdk-cli/dist/index.js <command>`; altfel fă upgrade.
* **Copii ale dependențelor.** `@qorechain/rdk` 0.6.2 depinde de `@qorechain/sdk` `^0.9.0`, deci un proiect care instalează și SDK 0.10.0 conține un al doilea SDK 0.9.x, imbricat. Acest lucru este inofensiv pentru scripturile pe care le generează șabloanele.
* **Maven Central rămâne în urmă.** Artefactul Java al RDK este acolo la 0.6.1; 0.6.2 este în așteptare și nu conține nicio modificare Java.
