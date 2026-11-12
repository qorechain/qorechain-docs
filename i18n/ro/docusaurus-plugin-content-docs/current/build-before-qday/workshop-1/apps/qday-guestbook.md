---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook este o carte de oaspeți pe lanț, pe testnetul EVM QoreChain. Oricine o poate semna o singură dată pentru fiecare adresă, cu un mesaj de cel mult 140 de caractere. Are două părți:

- **`contracts-app/`**: un contract Solidity și un proiect Hardhat. Îl implementezi și poți semna din terminal.
- **`web/`**: o pagină web care se deschide în browser, conectează portofelul QoreX, arată fereastra EVM a contului și listează în direct cele mai recente semnături.

Acest ghid este scris pentru începători. Fiecare comandă este explicată, iar fiecare pas se încheie cu ce ar trebui să vezi.

**Cât durează:** circa 35 de minute prima dată: 20 pentru partea cu contractul, 15 pentru pagina web.

## Ce demonstrează {#shows}

- **O aplicație de browser care semnează hibrid fără să știe.** Pagina este o aplicație obișnuită wagmi și RainbowKit. QoreX adaugă jumătatea post-cuantică (ML-DSA-87) a semnăturii, așa că aceeași tranzacție este protejată de cheia clasică (secp256k1) și de o cheie post-cuantică.
- **Fereastra EVM este vizibilă în interfață.** Pagina citește fereastra contului de pe lanț și arată dacă este activă și câte blocuri și tranzacții au rămas.
- **Refuzuri ușor de înțeles.** Când lanțul refuză o scriere, pagina asociază eroarea cu una dintre patru cauze (nicio cheie înregistrată, nicio fereastră, fereastră epuizată, parametri invalizi) și arată remedierea.
- **Semnături hibride verificate pe lanț.** Fiecare semnătură pe care o scrii este o tranzacție pe care lanțul a acceptat-o doar după ce a verificat ambele semnături.

## Înainte să începi {#prerequisites}

Acest ghid folosește un cont testnet de unică folosință pentru partea din terminal. Nu folosi niciodată un portofel real sau fonduri reale. QOR de testnet nu are valoare.

Ai nevoie de un terminal. Pe macOS deschide **Terminal**. Pe Windows deschide **PowerShell** (sau **Git Bash**, care vine cu Git). Pe Linux deschide orice terminal. Instalează aceste trei unelte. Dacă comanda de verificare afișează deja o versiune bună, sari peste instalare.

### Node.js 22 sau mai nou

Node.js rulează JavaScript pe calculatorul tău. Hardhat 3 are nevoie de Node.js 22 sau mai nou.

| Sistem | Instalare | Verificare |
| --- | --- | --- |
| macOS | `brew install node` (necesită [Homebrew](https://brew.sh)) sau descarcă de la https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS` sau descarcă de la https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, deschide un terminal nou, apoi `nvm install 22` | `node --version` |

Ce ar trebui să vezi: un număr care începe cu `v22` sau mai mare. Pe Windows, închide și redeschide PowerShell după instalare.

### pnpm

pnpm descarcă bibliotecile de care are nevoie un proiect. Node.js nu îl include, așa că îl instalezi tu, pe orice sistem.

```sh
npm install -g pnpm
```

| Parte | Sens |
| --- | --- |
| `npm` | Unealta care vine cu Node.js. Instalează alte unelte. |
| `install` | Descarcă și instalează. |
| `-g` | Global: instalează pentru tot calculatorul, nu doar pentru un folder. |
| `pnpm` | Unealta de instalat. |

Verifică-l cu `pnpm --version`. Ar trebui să vezi un număr precum `9.12.0` (9 sau mai mare). Dacă vezi vreodată `pnpm: command not found`, rulează comanda de instalare de mai sus și deschide un terminal nou. Dacă macOS sau Linux spune `EACCES: permission denied`, folosește `sudo npm install -g pnpm`.

### Git

| Sistem | Instalare | Verificare |
| --- | --- | --- |
| macOS | `xcode-select --install` sau `brew install git` | `git --version` |
| Windows | `winget install Git.Git` sau descarcă de la https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) sau `sudo dnf install git` (Fedora) | `git --version` |

Ce ar trebui să vezi: `git version 2.` urmat de un număr.

## Portofele testnet {#wallet}

Acest ghid folosește două conturi, iar ele sunt diferite intenționat:

1. **Un cont cu fișier de chei** pentru partea din terminal (pașii 3 până la 6). Ghidul ți-l creează. El implementează contractul.
2. **Un cont QoreX** pentru pagina web (pașii 8 și 9). Pagina web semnează cu el.

**QoreX pe testnet.** [QoreX](/qorex/overview) este portofelul QoreChain. Pentru pagina web folosești extensia de browser (vezi [Integrări QoreX](/developer-tools/qorex-integrations)). Instaleaz-o în browserul pe care îl vei folosi, apoi:

- **Extensia de browser QoreX:** deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.
- **Aplicația QoreX de pe telefon:** Settings, apoi **Use testnet (developers)**.
- Pentru lane-ul EVM alege **Add an Ethereum account (coin 60)**. Pagina web are nevoie de un cont coin 60.

**Faucetul** dă QOR de testnet gratuit: https://dashboard.qorechain.io/faucet. Te autentifici, lipești o adresă, soliciți. Primești 100 QOR la 24 de ore pentru fiecare cont.

**Despre sume.** QOR este moneda. `uqor` este cea mai mică bucată a ei: 1 QOR = 1.000.000 uqor. Prima tranzacție a unui cont nou îi înregistrează cheia post-cuantică, o taxă unică de circa 0,09 QOR.

## Partea 1: contractul {#contract}

### 1. Ia codul {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**Ce face**

- `git clone <address>` descarcă proiectul de pe GitHub într-un folder nou `build-before-qday`.
- `cd <folder>` mută terminalul în proiectul Guestbook. Are două foldere, `contracts-app` și `web`, pe care le configurezi separat.

**Ce ar trebui să vezi:** `Cloning into 'build-before-qday'...`. **Cât durează:** câteva secunde.

### 2. Instalează bibliotecile și testează {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**Ce face**

- `cd contracts-app` intră în folderul contractului.
- `pnpm install` descarcă bibliotecile listate în `package.json` (Hardhat și SDK-ul QoreChain).
- `pnpm test` rulează verificările contractului pe un lanț fals din interiorul calculatorului tău. Nu are nevoie de cheie și nici de cont în rețea. Prima rulare descarcă compilatorul Solidity.

**Ce ar trebui să vezi:** o listă de pachete, `Done in` câteva secunde, apoi `QDayGuestbook` cu trei bife și `3 passing`. **Cât durează:** circa un minut.

### 3. Creează fișierul cu chei {#step-account}

Proiectul își citește secretele dintr-un fișier numit `.env`. Creează-l din șablon.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Ce face**

- `cp` (sau `copy`) copiază șablonul `.env.example` într-un fișier nou, `.env`.

Fișierul `.env` este **fișierul tău cu chei**. Există doar în folderul `contracts-app`. **Nu-l partaja niciodată, nu-l comite niciodată în Git și nu reutiliza niciodată aceste chei pentru un portofel real.** Proiectul ignoră deja `.env` în Git. Deschide-l în orice editor de text (`open -e .env` pe macOS, `notepad .env` pe Windows, `nano .env` pe Linux) și completează două valori.

**a. O cheie privată de unică folosință.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Ce face**

- `node -e "..."` rulează o singură linie de JavaScript. Linia face 32 de octeți aleatori și îi afișează în hexazecimal, cu `0x` în față. Aceea este o cheie privată.

**Ce ar trebui să vezi:** o linie, `0x` și apoi 64 de litere și cifre. Copiaz-o în `.env` ca `PRIVATE_KEY=0x...`, înlocuind valoarea de umplutură formată numai din zerouri.

**b. Un cod de recuperare post-cuantic.**

```sh
pnpm window recovery-code
```

**Ce face**

- `pnpm window` rulează scriptul-ajutor `scripts/window.ts`. Cuvântul de după el este comanda.
- `recovery-code` afișează un cod nou, aleator, din care se face cheia ML-DSA-87 a contului.

**Ce ar trebui să vezi:** o linie care începe cu `QRC1-`. Copiaz-o în `.env` ca `QORE_PQC_RECOVERY_CODE=QRC1-...`. Păstrează același cod pentru acest cont: un cod nou dă o altă cheie post-cuantică.

Lasă `QORE_MNEMONIC` gol (o mnemonică este o frază de 12 sau 24 de cuvinte care poate înlocui cele două valori de mai sus; folosește una sau alta, nu pe amândouă) și păstrează `QORE_NETWORK=testnet`, care îi spune ajutorului să folosească rețeaua de test. Fișierul tău `.env` arată așa (sunt afișate valori de umplutură):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Salvează fișierul.

### 4. Alimentează contul {#step-faucet}

```sh
pnpm window status
```

**Ce face**

- Arată contul tău, dacă cheia lui post-cuantică este înregistrată și dacă are o fereastră EVM.

**Ce ar trebui să vezi:** `account:  0x...  (qor1...)`, apoi `PQC key:  not registered` și `window:   none`. Copiază adresa `qor1...`. Apoi:

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Asigură-te că pagina este setată pe **Testnet**.
3. Lipește adresa `qor1...` și solicită QOR (100 QOR o dată la 24 de ore pentru fiecare cont).
4. Așteaptă circa 10 secunde. Dacă cauți adresa ta pe https://explore.qore.network (Testnet), vezi soldul.

### 5. Înregistrează cheia, deschide fereastra, implementează {#step-window}

```sh
pnpm window register
```

**Ce face**

- Trimite lanțului cheia ta publică ML-DSA-87, o singură dată pentru fiecare cont. Este singurul mesaj pe care lanțul îl acceptă fără semnătură post-cuantică, pentru că nu există încă pe lanț nicio cheie cu care să o verifice. Costă circa 0,09 QOR.

**Ce ar trebui să vezi:** `registered: ` și un hash de tranzacție.

```sh
pnpm window open
```

**Ce face**

- Trimite o tranzacție, semnată cu ambele chei (hibrid), care deschide o fereastră de autorizare EVM. Cât timp este activă, tranzacțiile tale EVM obișnuite sunt permise. Implicit durează 600 de blocuri și permite 5 tranzacții.

**Ce ar trebui să vezi:** `opened: ` și un hash de tranzacție, apoi `window: 600 blocks, 5 txs, ...`. **Copiază acest hash** pentru ultimul pas.

```sh
sleep 10
```

**Ce face**

- Așteaptă 10 secunde (funcționează și în PowerShell și Git Bash). Deschiderea ferestrei schimbă contorul de tranzacții al contului, iar următoarea comandă trebuie să vadă noua valoare.

```sh
pnpm deploy:testnet
```

**Ce face**

- Rulează Hardhat Ignition, unealta care implementează contracte, cu modulul `QDayGuestbook` pe rețeaua `qorechainTestnet` (ID de lanț 9800, testnetul QoreChain).
- Îți cere confirmarea. Scrie `y` și apasă Enter.

**Ce ar trebui să vezi:** o linie care se termină cu `QDayGuestbookModule#QDayGuestbook` și adresa contractului tău `0x...`. **Copiază această adresă**: pagina web are nevoie de ea. **Cât durează:** circa 30 de secunde.

### 6. Semnează din terminal {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**Ce face**

- `pnpm sign "<message>"` scrie o intrare în cartea de oaspeți. Textul dintre ghilimele este mesajul tău, de cel mult 140 de caractere.
- `pnpm sign --read` doar citește: listează cele mai recente intrări și nu trimite nimic.

**Ce ar trebui să vezi:** după prima comandă `tx: 0x...` și `status: success in block ...`. După a doua, `guestbook 0x...: 1 signatures` și mesajul tău cu ora și adresa ta.

Fiecare adresă poate semna o singură dată. Un al doilea `pnpm sign` din același cont este refuzat de contract cu `AlreadySigned`.

## Partea 2: pagina web {#web}

### 7. Instalează și configurează pagina {#step-web}

Deschide o a doua fereastră de terminal în același folder de proiect sau întoarce-te cu `cd ..`. Apoi:

```sh
cd web
pnpm install
```

**Ce face**

- Intră în folderul web și descarcă bibliotecile lui (React, wagmi, RainbowKit, Vite).

**Ce ar trebui să vezi:** o listă de pachete și `Done in` câteva secunde.

Creează fișierul de setări al paginii. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. Deschide `web/.env` într-un editor și setează adresa contractului pe care ai copiat-o la pasul 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Lasă `VITE_WALLETCONNECT_PROJECT_ID` gol. Este necesar doar dacă adaugi un portofel WalletConnect în `src/wagmi.ts`.

### 8. Pornește pagina și conectează QoreX {#step-run}

```sh
pnpm dev
```

**Ce face**

- Pornește un mic server web pe propriul tău calculator (Vite). Pagina se află la `http://localhost:5174`. Serverul redirecționează și cererile care încep cu `/lcd` către serverul REST public de testnet. Browserul nu poate apela direct acel server (nu trimite anteturi CORS), așa că acest proxy o face în locul paginii.
- Comanda rămâne pornită. Lasă acest terminal deschis. Apasă `Ctrl+C` ca să o oprești mai târziu. Dacă schimbi `web/.env`, oprește-o și pornește-o din nou.

**Ce ar trebui să vezi:** `VITE ... ready` și `Local: http://localhost:5174/`.

Acum, în browserul în care este instalat QoreX:

1. Deschide http://localhost:5174 .
2. Asigură-te că QoreX este deblocat și comutat pe testnet (vezi „Portofele testnet" de mai sus), cu un cont coin 60 care are QOR de la faucet. Folosește forma `qor1...` a adresei lui pe pagina faucetului, dacă QoreX arată ambele forme.
3. Pe pagină, în cardul 1, alege **Connect QoreX** (butonul de conectare). Dacă QoreX nu apare primul, alege-l din lista de portofele.
4. QoreX deschide o fereastră care cere conectarea. Aprob-o.

**Ce ar trebui să vezi:** cardul 1 arată contul tău `0x...`, lanțul `qorechain-diana EVM (9800)`, soldul tău și fereastra EVM: `no window open` pentru un cont nou. Cardul 3 arată `On chain now: 1 signatures` și intrarea pe care ai scris-o la pasul 6. Dacă linia lanțului spune `wrong chain`, comută QoreX pe testnet.

### 9. Semnează din QoreX {#step-sign}

1. În cardul 2, scrie un mesaj (cel mult 140 de caractere). Pagina arată câte ai folosit.
2. Alege **Sign**.
3. QoreX deschide aprobarea lui. Dacă contul tău nu are încă o cheie post-cuantică sau o fereastră, QoreX se oferă să înregistreze cheia (o taxă unică de circa 0,09 QOR) și să deschidă fereastra EVM în aceeași aprobare. Alege să o faci.
4. Aprobă în QoreX. Butonul afișează `Approve in QoreX...` cât timp așteaptă.

**Ce ar trebui să vezi:** o linie `tx 0x...` cu un link către explorer, mai întâi `waiting for the block...`, apoi `success in block ...`. Cardul 1 arată acum fereastra EVM ca `live`, cu blocurile și tranzacțiile rămase. Cardul 3 adaugă mesajul tău în partea de sus, cel mai nou primul. Listează până la 20 de intrări și se reîmprospătează la câteva secunde. Dacă încerci din nou din aceeași adresă, cardul 2 spune `This address has already signed.`

### 10. Verifică pe lanț {#step-explorer}

Folosește hashul de la `pnpm window open` (pasul 5). Pentru pagină, QoreX deschide fereastra și într-o tranzacție proprie: cere-i lui QoreX istoricul sau caută adresa ta în explorer.

**a. Cu o cerere web simplă.** Înlocuiește `<HASH>` cu hashul (șterge `<` și `>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Ce face**

- `curl <address>` cere unui server public QoreChain înregistrarea acelei tranzacții și o afișează. În Windows PowerShell scrie `curl.exe` în loc de `curl`.

**Ce ar trebui să vezi în răspunsul lung:**

- `"code": 0`, ceea ce înseamnă că tranzacția a reușit.
- O extensie de tip `PQCHybridSignature` cu semnătura ML-DSA-87, lungă de 4.627 de octeți.
- Un eveniment `pqc_hybrid_verify` cu `status` setat la `verified`.

**b. Cu explorerul.** Deschide https://explore.qore.network, comută selectorul de rețea pe **Testnet** și caută hashul tranzacției (de la pasul 5, 6 sau 9), adresa contului tău sau adresa `QDayGuestbook`. Tranzacția ferestrei arată o semnătură post-cuantică pe care lanțul a verificat-o.

## Ce ar trebui să vezi la final {#result}

- `pnpm test` în `contracts-app` afișează `3 passing`.
- `pnpm window status` afișează `PQC key:  registered` și `window:   live`, cu blocurile, tranzacțiile și valoarea rămase.
- `pnpm deploy:testnet` afișează adresa `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` afișează hashul tranzacției și `status: success in block ...`.
- Pagina arată contul tău, `qorechain-diana EVM (9800)`, soldul tău și fereastra ca `live`. După **Sign** și aprobarea ta vezi un link de tranzacție și `success in block ...`.
- Lista de jos arată numărul de semnături și cele mai recente intrări, cea mai nouă prima.
- Verificarea cu `curl` arată `"code": 0`, extensia `PQCHybridSignature` și `pqc_hybrid_verify` cu `status` `verified`.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `pnpm: command not found` | pnpm nu este instalat. Node.js nu îl include. | Rulează `npm install -g pnpm`, apoi deschide un terminal nou. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js este prea vechi. | Instalează Node.js 22 sau mai nou. |
| `node: .env: not found` | Nu există fișier `.env` în acest folder. | Fă pasul 3 în `contracts-app` și rulează comenzile din acel folder. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` sau `Set QORE_PQC_RECOVERY_CODE ...` | O valoare din `.env` este goală, este o valoare de umplutură sau are o greșeală. | Completează ambele valori ca la pasul 3 și salvează. |
| `... does not exist on chain yet: send it some QOR first` | Contul nu are încă QOR. | Folosește faucetul (pasul 4), așteaptă 10 secunde. |
| Faucetul spune că ai atins limita | O singură cerere la 24 de ore pentru fiecare cont. | Așteaptă, apoi încearcă din nou. |
| `account has no PQC key and classical fallback is disabled` | S-a trimis o tranzacție înainte ca cheia să fie înregistrată. | Rulează `pnpm window register`, apoi `pnpm window open`. În QoreX, aprobă înregistrarea oferită la primul tău trimis. |
| `EVM authorisation window exhausted` sau `open an EVM window first` | Fereastra a rămas fără blocuri sau tranzacții, ori nu s-a deschis niciodată. | Rulează `pnpm window open` (terminal) și așteaptă 10 secunde. În pagină, aprobă noua fereastră când ți-o oferă QoreX. |
| `HHE10402` după deschiderea ferestrei | Implementarea a rulat înainte ca și contorul de tranzacții al contului să se actualizeze. | Așteaptă 10 secunde și rulează din nou `pnpm deploy:testnet`. |
| `refused: ... (AlreadySigned)` | Această adresă a semnat deja. | Fiecare adresă semnează o singură dată. Folosește alt cont. |
| `refused: ... (BadLength)` | Mesajul este gol sau are mai mult de 140 de caractere. | Folosește între 1 și 140 de caractere. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` nu găsește contractul. | Termină pasul 5 în `contracts-app`. |
| Pagina nu arată nicio intrare, iar butonul **Sign** este gri | `VITE_GUESTBOOK_ADDRESS` este gol în `web/.env`. | Lipește adresa de la pasul 5, apoi oprește (`Ctrl+C`) și repornește `pnpm dev`. |
| Pagina spune `wrong chain` | QoreX nu este pe testnet. | Comută QoreX pe testnet (diana), vezi „Portofele testnet". |
| QoreX nu este oferit când alegi conectarea | Pagina a fost deschisă într-un browser fără extensia QoreX sau extensia este blocată. | Deschide http://localhost:5174 în browserul cu QoreX și deblocheaz-o. |
| Portul 5174 este deja folosit | Îl folosește un alt program. | Închide-l sau folosește cealaltă adresă pe care o afișează Vite. |
| `could not read` lângă fereastra EVM sau erori CORS în consola browserului | Pagina a apelat direct serverul REST, iar acesta nu trimite anteturi CORS. | Apelează REST doar prin proxy-ul `/lcd` al serverului de dezvoltare, așa cum face acest proiect. Pornește pagina cu `pnpm dev`. |

## Codul {#code}

Contractul păstrează intrările într-un tablou și permite o singură semnătură pentru fiecare adresă:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX este primul portofel din lista de conectori (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

Pagina arată fereastra și explică refuzurile (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Pachete folosite {#packages}

Contracte (`contracts-app/`):

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Scriptul-ajutor pentru ferestre, semnare hibridă |
| `@qorechain/evm` | ^0.13.0 | Definiții de lanț, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Transmiterea mesajului ferestrei |
| `hardhat` | ^3.21.1 | Compilare, teste, implementare cu Ignition |
| `viem` | ^2.47.6 | Client Ethereum |
| `tsx` | ^4.19.0 | Rularea scripturilor TypeScript |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

Pagina web (`web/`):

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Definiții de lanț, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX ca portofel RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Butonul de conectare |
| `wagmi` | ^2.19.5 | Hookuri React pentru citiri și scrieri |
| `viem` | ^2.53.1 | Client Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Aducerea datelor pentru fereastră și citirile de lanț |
| `react`, `react-dom` | ^18.3.1 | Interfață |
| `vite` | ^5.4.0 | Server de dezvoltare |
| `@vitejs/plugin-react` | ^4.3.0 | Suport React pentru Vite |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

Sursa: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
