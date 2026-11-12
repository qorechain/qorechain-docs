---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter este cel mai mic proiect EVM util de pe QoreChain. Este un contract Solidity care stochează un singur număr, un proiect Hardhat care îl pune pe testnetul `qorechain-diana` și un script scurt care citește numărul și îi adaugă unu.

Acest ghid este scris pentru începători. Nu trebuie să știi Solidity sau unelte blockchain. Fiecare comandă este explicată, iar fiecare pas se încheie cu ce ar trebui să vezi.

**Cât durează:** circa 25 de minute prima dată, mare parte din timp fiind instalarea uneltelor și așteptarea faucetului.

## Ce demonstrează {#shows}

- **Semnarea hibridă face parte din drumul de implementare.** Înainte de orice tranzacție EVM, inclusiv implementarea unui contract, contul are nevoie de o cheie post-cuantică înregistrată (ML-DSA-87) și de o fereastră de autorizare EVM activă. Fereastra se deschide printr-o singură tranzacție semnată de două ori, cu cheia clasică (secp256k1) și cu cheia post-cuantică. Aceasta este o semnătură hibridă. Lanțul le verifică pe amândouă.
- **O tranzacție semnată hibrid pe care o poți verifica.** Pasul `pnpm window open` trimite acea tranzacție. O poți căuta în explorer și vedea verdictul lanțului însuși.
- **Uneltele tale EVM obișnuite continuă să funcționeze.** Hardhat și viem trimit tranzacții Ethereum obișnuite. Protecția post-cuantică stă în fereastră, așa că o cheie secp256k1 furată, singură, nu poate cheltui din cont.

Un calculator cuantic suficient de mare ca să spargă secp256k1 ar putea falsifica semnături clasice. QoreChain cere o a doua semnătură (ML-DSA-87, standardul FIPS 204) pe care un astfel de calculator nu o poate falsifica. Counter arată întregul ciclu al dezvoltatorului cu această regulă pornită: înregistrezi cheia, deschizi o fereastră, implementezi, apelezi, citești.

## Înainte să începi {#prerequisites}

Acest ghid folosește un cont testnet de unică folosință. Nu folosi niciodată un portofel real sau fonduri reale. QOR de testnet nu are valoare.

Ai nevoie de un terminal. Pe macOS deschide **Terminal**. Pe Windows deschide **PowerShell** (sau **Git Bash**, care vine cu Git). Pe Linux deschide orice terminal. Apoi instalează aceste trei unelte. Dacă comanda de verificare afișează deja o versiune bună, sari peste instalare.

### Node.js 22 sau mai nou

Node.js rulează JavaScript pe calculatorul tău. Hardhat 3 are nevoie de Node.js 22 sau mai nou.

| Sistem | Instalare | Verificare |
| --- | --- | --- |
| macOS | `brew install node` (necesită [Homebrew](https://brew.sh)) sau descarcă de la https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS` sau descarcă de la https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, deschide un terminal nou, apoi `nvm install 22` | `node --version` |

Ce ar trebui să vezi: un număr care începe cu `v22` sau mai mare, cum ar fi `v22.12.0`. Pe Windows, închide și redeschide PowerShell după instalare.

### pnpm

pnpm descarcă bibliotecile de care are nevoie un proiect. Nu vine odată cu Node.js, așa că îl adaugi tu, pe orice sistem.

```sh
npm install -g pnpm
```

| Parte | Sens |
| --- | --- |
| `npm` | Unealta care vine cu Node.js. Instalează alte unelte. |
| `install` | Descarcă și instalează. |
| `-g` | Global: instalează pentru tot calculatorul, nu doar pentru un folder. |
| `pnpm` | Unealta de instalat. |

Verifică-l cu `pnpm --version`. Ar trebui să vezi un număr precum `9.12.0` (9 sau mai mare). Dacă vezi vreodată `pnpm: command not found`, ai sărit peste acest pas: rulează comanda de instalare de mai sus, apoi deschide un terminal nou.

Dacă Linux sau macOS spune `EACCES: permission denied`, rulează în schimb `sudo npm install -g pnpm`.

### Git

Git descarcă proiectul de pe GitHub.

| Sistem | Instalare | Verificare |
| --- | --- | --- |
| macOS | `xcode-select --install` sau `brew install git` | `git --version` |
| Windows | `winget install Git.Git` sau descarcă de la https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) sau `sudo dnf install git` (Fedora) | `git --version` |

Ce ar trebui să vezi: `git version 2.` urmat de un număr.

## Un portofel testnet {#wallet}

Ai nevoie de un cont testnet cu puțin QOR în el. Acest ghid îți creează unul în pașii următori (un fișier cu chei). Nu ai nevoie de QoreX pentru Counter. Dacă vrei să vezi mai târziu același cont într-un portofel, folosește [QoreX](/qorex/overview) pe testnet:

- **Aplicația QoreX:** Settings, apoi **Use testnet (developers)**.
- **Extensia de browser QoreX:** deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.
- Pentru lane-ul EVM, alege **Add an Ethereum account (coin 60)**.

Faucetul dă QOR de testnet gratuit: https://dashboard.qorechain.io/faucet. Te autentifici, lipești o adresă și soliciți. Primești 100 QOR la 24 de ore pentru fiecare cont.

**Despre sume.** QOR este moneda. `uqor` este cea mai mică bucată a ei: 1 QOR = 1.000.000 uqor. Taxele pe lanț sunt afișate în `uqor`. Prima tranzacție a unui cont nou îi înregistrează cheia post-cuantică, ceea ce costă o taxă unică de circa 0,09 QOR.

## Pas cu pas {#steps}

### 1. Ia codul {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**Ce face**

- `git clone <address>` descarcă o copie a proiectului de pe GitHub într-un folder nou numit `build-before-qday`.
- `cd <folder>` mută terminalul în folderul proiectului Counter. Fiecare comandă următoare se rulează de aici.

**Ce ar trebui să vezi:** `Cloning into 'build-before-qday'...` și apoi promptul tău în noul folder. **Cât durează:** câteva secunde.

Opțional: dacă preferi să construiești proiectul de la zero, ca în workshopul live, vezi [Construiește același proiect de la zero](#scaffold) la finalul pașilor.

### 2. Instalează bibliotecile {#step-install}

```sh
pnpm install
```

**Ce face**

- `pnpm install` citește lista de biblioteci din `package.json` și le descarcă într-un folder `node_modules` (Hardhat, SDK-ul QoreChain și altele).

**Ce ar trebui să vezi:** o listă de pachete cu semne `+` și `Done in` câteva secunde. **Cât durează:** sub un minut.

### 3. Rulează testele și build-ul {#step-test}

```sh
pnpm test
```

**Ce face**

- `pnpm test` rulează verificările proiectului pe un lanț fals din interiorul calculatorului tău. Nu are nevoie de cheie, de rețea sau de QOR. Prima rulare descarcă și compilatorul Solidity, deci are nevoie de internet.

**Ce ar trebui să vezi:** `Counter`, două linii cu bifă (`starts at the constructor value`, `increments and emits CountChanged`) și `2 passing`.

```sh
pnpm build
```

**Ce face**

- `pnpm build` transformă contractul Solidity în cod-mașină (îl compilează). După `pnpm test` afișează `No contracts to compile`, ceea ce e în regulă: testul l-a compilat deja.

### 4. Creează fișierul de setări {#step-account}

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

- `cp` (sau `copy`) copiază fișierul-șablon `.env.example` într-un fișier nou, `.env`.

Fișierul `.env` este **fișierul tău cu chei**. Există doar în acest folder de proiect. Conține o cheie de unică folosință. **Nu-l partaja niciodată, nu-l comite niciodată în Git și nu reutiliza niciodată aceste chei pentru un portofel real.** Proiectul ignoră deja `.env` în Git. Deschide-l în orice editor de text (`open -e .env` pe macOS, `notepad .env` pe Windows, `nano .env` pe Linux). Vei completa două valori.

**a. O cheie privată de unică folosință.** Generează una aleatoare:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Ce face**

- `node -e "..."` rulează o singură linie de JavaScript.
- Linia face 32 de octeți aleatori și îi afișează în hexazecimal, cu `0x` în față. Aceea este o cheie privată.

**Ce ar trebui să vezi:** o linie, `0x` urmat de 64 de litere și cifre. Copiaz-o în `.env` ca `PRIVATE_KEY=0x...`, înlocuind valoarea de umplutură formată numai din zerouri.

**b. Un cod de recuperare post-cuantic.** Cheia ML-DSA-87 a contului se face dintr-un al doilea secret, codul de recuperare.

```sh
pnpm window recovery-code
```

**Ce face**

- `pnpm window` rulează scriptul-ajutor `scripts/window.ts`. Cuvântul de după el este comanda.
- `recovery-code` afișează un cod de recuperare nou, aleator.

**Ce ar trebui să vezi:** o linie care începe cu `QRC1-`, apoi un scurt memento. Copiază linia `QRC1-...` în `.env` ca `QORE_PQC_RECOVERY_CODE=QRC1-...`. Păstrează același cod pentru acest cont: un cod nou dă contului o altă cheie post-cuantică.

Lasă `QORE_MNEMONIC` gol. (O mnemonică este o frază de 12 sau 24 de cuvinte care poate înlocui cele două valori de mai sus. Folosește una sau alta, nu pe amândouă.) Păstrează `QORE_NETWORK=testnet`, care îi spune ajutorului să comunice cu rețeaua de test. Fișierul tău `.env` arată așa, cu valori de umplutură:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Salvează fișierul.

### 5. Arată adresa contului tău {#step-address}

```sh
pnpm window status
```

**Ce face**

- `status` arată contul tău, dacă cheia lui post-cuantică este înregistrată și dacă ai o fereastră EVM.

**Ce ar trebui să vezi:** trei linii. Prima este `account:  0x...  (qor1...)`. Contul tău are două adrese: `0x...` pentru EVM și `qor1...` pentru lane-ul nativ. Aparțin aceluiași cont. Celelalte două linii spun `PQC key:  not registered` și `window:   none`. Este normal: contul este nou. Copiază adresa `qor1...` din prima linie.

### 6. Ia QOR de testnet de la faucet {#step-faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Asigură-te că pagina este setată pe **Testnet**.
3. Lipește adresa ta `qor1...` și solicită QOR. Primești 100 QOR o dată la 24 de ore pentru fiecare cont.
4. Așteaptă circa 10 secunde, apoi rulează din nou `pnpm window status`.

**Ce ar trebui să vezi:** aceleași trei linii ca înainte: cheia este tot `not registered` și nu există fereastră. Contul conține acum QOR. Dacă vrei o dovadă, deschide https://explore.qore.network (Testnet) și caută adresa ta `qor1...`.

### 7. Înregistrează cheia și deschide fereastra {#step-window}

```sh
pnpm window register
```

**Ce face**

- `register` trimite lanțului cheia publică ML-DSA-87 a contului. Faci asta o singură dată pentru fiecare cont. Este singurul mesaj pe care lanțul îl acceptă fără semnătură post-cuantică, pentru că nu există încă pe lanț nicio cheie cu care să o verifice. Costă circa 0,09 QOR.

**Ce ar trebui să vezi:** `registered: ` urmat de un hash de tranzacție (64 de caractere).

```sh
pnpm window open
```

**Ce face**

- `open` trimite o tranzacție, semnată cu ambele chei (hibrid), care deschide o fereastră de autorizare EVM. Cât timp fereastra este activă, tranzacțiile tale EVM obișnuite sunt permise. Implicit durează 600 de blocuri și permite 5 tranzacții. Poți schimba asta cu `QORE_WINDOW_BLOCKS` și `QORE_WINDOW_TXS` în `.env`.

**Ce ar trebui să vezi:** `opened: ` urmat de un hash de tranzacție, apoi `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **Copiază acest hash.** Îl vei verifica la pasul 10.

Acum așteaptă circa 10 secunde. Deschiderea ferestrei schimbă contorul de tranzacții al contului, iar următoarea comandă trebuie să vadă noua valoare.

```sh
sleep 10
pnpm window status
```

**Ce face**

- `sleep 10` așteaptă 10 secunde (funcționează și în PowerShell și Git Bash).
- `status` arată rezultatul.

**Ce ar trebui să vezi:** `PQC key:  registered` și `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. Implementează contractul {#step-deploy}

```sh
pnpm deploy:testnet
```

**Ce face**

- Rulează Hardhat Ignition, unealta care implementează contracte, cu modulul `Counter` pe rețeaua `qorechainTestnet` (ID de lanț 9800, testnetul QoreChain).
- Îți cere confirmarea. Scrie `y` și apasă Enter.

**Ce ar trebui să vezi:** o întrebare de confirmare privind implementarea pe `qorechainTestnet` (9800), apoi, după `y`, o linie care se termină cu `CounterModule#Counter` și adresa contractului tău `0x...`. Aceea este adresa contractului tău. **Cât durează:** circa 30 de secunde.

### 9. Citește și incrementează {#step-interact}

```sh
pnpm interact
```

**Ce face**

- Citește numărul stocat, apelează `increment()` (adaugă unu), apoi îl citește din nou. Apelul folosește una dintre cele 5 tranzacții ale ferestrei tale.

**Ce ar trebui să vezi:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1` și un link de explorer.

```sh
pnpm interact --read
```

**Ce face**

- `--read` înseamnă doar citire: arată numărul și nu trimite nimic.

**Ce ar trebui să vezi:** adresa Counter și `count: 1`.

### 10. Verifică tranzacția hibridă {#step-explorer}

Tranzacția de la `pnpm window open` este dovada că lanțul a verificat o semnătură post-cuantică. Verific-o în două moduri.

**a. Cu o cerere web simplă.** Înlocuiește `<HASH>` cu hashul de la pasul 7. Șterge `<` și `>`.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Ce face**

- `curl <address>` cere unui server public QoreChain înregistrarea acelei tranzacții și o afișează. În Windows PowerShell, scrie `curl.exe` în loc de `curl`.
- `api-testnet.qore.host` este serverul public de testnet. `<HASH>` este tranzacția pe care o vrei.

**Ce ar trebui să vezi în răspunsul lung:**

- `"code": 0`, ceea ce înseamnă că tranzacția a reușit.
- O extensie de tip `PQCHybridSignature` care conține semnătura ML-DSA-87, lungă de 4.627 de octeți.
- Un eveniment `pqc_hybrid_verify` cu atributul `status` setat la `verified`.

**b. Cu explorerul.**

1. Deschide https://explore.qore.network și comută selectorul de rețea pe **Testnet**.
2. Caută hashul de la `pnpm window open`. Pagina arată o semnătură post-cuantică pe care lanțul a verificat-o.
3. Caută hashul `increment tx` de la pasul 9, sau adresa ta Counter, ca să vezi apelul contractului.

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) arată același fel de dovadă, octet cu octet.

## Construiește același proiect de la zero {#scaffold}

Workshopul live pornește dintr-un folder gol. Această comandă creează același proiect Hardhat (fără scriptul `interact`, care există doar în copia descărcată). Rulează-o într-un folder în care îți ții proiectele, în locul pasului 1.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| Parte | Sens |
| --- | --- |
| `npx` | Rulează o unealtă direct de pe internet, fără a o instala. |
| `create-qorechain-dapp@latest` | Generatorul de proiecte QoreChain, cea mai nouă versiune. |
| `qday-demo` | Numele noului folder. |
| `-t hardhat` | Ce șablon de proiect se folosește: un proiect Hardhat 3 cu un contract, teste și ajutorul pentru ferestre. |
| `--network testnet` | Cu ce rețea QoreChain comunică proiectul: rețeaua de test, nu cea reală. |
| `--package-manager pnpm` | Ce unealtă instalează bibliotecile. |

**Ce ar trebui să vezi:** o listă de pachete instalate, apoi `Done! Created qday-demo`. Bibliotecile sunt deja instalate și există deja un fișier `.env`, așa că poți sări peste pasul 2 și peste copierea din pasul 4. Continuă cu `pnpm test` (pasul 3), apoi 4a și 4b (completează `.env`) și pașii 5 până la 8. **Cât durează:** circa 30 de secunde.

## Ce ar trebui să vezi la final {#result}

- `pnpm test` afișează `2 passing`.
- `pnpm window status` afișează `PQC key:  registered` și `window:   live`, cu blocurile, tranzacțiile și valoarea rămase.
- `pnpm deploy:testnet` afișează adresa `Counter` implementată (`0x...`).
- `pnpm interact` afișează `count` trecând de la 0 la 1, `status: success` și un link de explorer.
- Verificarea cu `curl` arată `"code": 0`, extensia `PQCHybridSignature` și evenimentul `pqc_hybrid_verify` cu `status` `verified`. Explorerul (Testnet) marchează aceeași tranzacție ca verificată.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `pnpm: command not found` | pnpm nu este instalat. Node.js nu îl include. | Rulează `npm install -g pnpm`, apoi deschide un terminal nou. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js este prea vechi. | Instalează Node.js 22 sau mai nou și verifică `node --version`. |
| `node: .env: not found` | Nu există fișier `.env` în acest folder. | Fă pasul 4 și rulează comanda din folderul proiectului. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | Fișierul `.env` lipsește sau `PRIVATE_KEY` este încă valoarea de umplutură ori are o greșeală. | Fă din nou pasul 4. Salvează fișierul. Rulează comanda din folderul proiectului. |
| `Set QORE_PQC_RECOVERY_CODE in .env` sau `not a valid QRC1 recovery code` | Codul de recuperare este gol sau are o greșeală. | Rulează `pnpm window recovery-code` și lipește întreaga linie `QRC1-...`. |
| `... does not exist on chain yet: send it some QOR first` (la `register` sau `open`) | Contul nu are încă QOR. | Cere QOR de la faucet (pasul 6) și așteaptă 10 secunde. |
| Faucetul spune că ai atins limita | O singură cerere la 24 de ore pentru fiecare cont. | Așteaptă, apoi încearcă din nou. Sau folosește un al doilea cont de unică folosință. |
| `account has no PQC key and classical fallback is disabled` | Ai trimis o tranzacție înainte să înregistrezi cheia. | Rulează `pnpm window register`, apoi `pnpm window open`. |
| `EVM authorisation window exhausted` (sau indiciul `open an EVM window first`) | Fereastra a rămas fără blocuri sau tranzacții, ori nu a fost deschisă niciodată. | Rulează `pnpm window open`, așteaptă 10 secunde, încearcă din nou. |
| `HHE10402` după deschiderea ferestrei | Implementarea a rulat înainte ca și contorul de tranzacții al contului să se actualizeze. | Așteaptă 10 secunde și rulează din nou `pnpm deploy:testnet`. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` nu găsește contractul. | Termină pasul 8 în acest folder. |
| `PQC key: registered, but NOT this key` | Codul de recuperare din `.env` diferă de cel folosit la înregistrare. | Pune la loc codul de recuperare original. Un cod diferit face o cheie diferită. |
| Erori CORS într-o aplicație de browser | Serverul REST public nu trimite anteturi CORS, așa că un browser îl blochează. | Folosește proxy-ul `/lcd` al șablonului, așa cum face [pagina web Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook). |

## Codul {#code}

Contractul (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

Partea semnată hibrid din `scripts/window.ts` (mesajul ferestrei și semnatarul):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` este contul făcut din materialul tău de chei, iar `net` este înregistrarea rețelei pentru `QORE_NETWORK` (implicit `testnet`, ID de lanț `qorechain-diana`). Taxa folosită de script este 100000 `uqor` (0,1 QOR), cu o limită de gaz de 800000, pentru că tranzacțiile hibride sunt mari.

## Pachete folosite {#packages}

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Semnare hibridă, înregistrarea cheii PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Ajutoare pentru fereastra EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Transmiterea tranzacției pe lane-ul nativ |
| `hardhat` | ^3.21.1 | Compilare, teste, implementare cu Ignition |
| `viem` | ^2.47.6 | Citirea și scrierea contractului |
| `tsx` | ^4.19.0 | Rularea scripturilor TypeScript |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

Vezi [Generatoare și CLI](/developer-tools/scaffolders-and-cli) și [Instalarea SDK-ului](/sdk/install).

## Detaliile rețelei {#networks}

| Element | Valoare |
| --- | --- |
| Rețea | testnet `qorechain-diana` |
| ID de lanț EVM | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Sursa: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
