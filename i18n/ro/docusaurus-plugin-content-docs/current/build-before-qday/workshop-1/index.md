---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Prima ta tranzacție semnată hibrid"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Prima ta tranzacție semnată hibrid

Acest ghid te duce de la un calculator pe care nu este instalat nimic până la o tranzacție semnată simultan cu două chei și verificată de testnetul QoreChain. Nu trebuie să fii dezvoltator. Fiecare comandă este explicată pe înțelesul tuturor, iar fiecare pas se încheie cu ce ar trebui să vezi pe ecran.

**Cât durează:** circa 30 de minute prima dată, inclusiv instalarea uneltelor. Circa 10 minute dacă uneltele sunt deja instalate.

## Ce construim {#what-we-built}

Un proiect Solidity complet (un mic contract inteligent) creat cu o singură comandă, testat, implementat pe testnetul QoreChain, apoi o tranzacție semnată **cu două chei deodată** și verificată de lanț.

Ce demonstrează:

- **Semnarea hibridă.** Tranzacția poartă o semnătură clasică secp256k1 și o semnătură post-cuantică ML-DSA-87 (NIST FIPS 204). Ambele trebuie să fie valide.
- **O tranzacție semnată hibrid, verificată pe lanț.** Validatorii verifică ambele semnături. Dovada o citești din punctul final REST public (extensia `PQCHybridSignature` și evenimentul `pqc_hybrid_verify`) și în explorer.
- **Fereastra de autorizare EVM.** O tranzacție Ethereum nu poate purta o semnătură post-cuantică. Așa că, pe QoreChain, îți înregistrezi o singură dată cheia ML-DSA-87 și deschizi o fereastră scurtă, printr-un mesaj semnat hibrid, în care tranzacțiile tale EVM obișnuite sunt admise. Vezi [Implementare în 5 minute](/getting-started/deploy-in-5-minutes) pentru ideea în detaliu.

Exact asta cere nivelul Quantum Pass.

## Cuvinte folosite în acest ghid {#words}

| Cuvânt | Sens simplu |
| --- | --- |
| Terminal | Fereastra în care scrii comenzi. Terminal pe macOS și Linux, PowerShell pe Windows |
| Testnet | O copie de exersare a QoreChain. Monedele ei nu au valoare |
| QOR și uqor | QOR este moneda. uqor este cea mai mică unitate a ei. 1 QOR = 1.000.000 uqor |
| Tranzacție | O instrucțiune semnată, trimisă lanțului |
| Memo | Un scurt text atașat unei tranzacții |
| Cheie privată | Un secret care semnează pentru contul tău. Cine o are controlează contul |
| Cod de recuperare | Un al doilea secret (începe cu `QRC1`) din care se face cheia ta post-cuantică |
| Hash | Identificatorul unic al unei tranzacții. Îl folosești ca s-o găsești |
| Gaz și taxă | Prețul mic, plătit în QOR, ca lanțul să proceseze o tranzacție |

:::caution Doar un cont testnet de unică folosință
Folosește o cheie făcută pentru acest exercițiu, care conține doar QOR de test. Nu folosi niciodată un portofel real sau fonduri reale. Nu pune niciodată în fișierul `.env` cheia sau codul de recuperare ale unui cont care conține bani reali și nu partaja și nu comite niciodată `.env`.
:::

## Înainte să începi {#prerequisites}

Ai nevoie de un calculator cu macOS, Windows sau Linux, un terminal și un browser web. Pentru acest tutorial instalezi două unelte: **Node.js 22 sau mai nou** (Hardhat 3, unealta de proiect folosită aici, cere versiunea 22) și **pnpm** (unealta care descarcă bibliotecile proiectului). O unealtă opțională, **jq**, doar face mai ușor de citit un rezultat de verificare.

Mai întâi deschide un terminal. Pe macOS deschide **Terminal**. Pe Windows deschide **PowerShell**. Pe Linux deschide aplicația ta de terminal.

### Node.js 22 sau mai nou {#install-node}

1. Verifică dacă îl ai deja:

```bash
node -v
```

Trebuie să afișeze `v22` sau un număr mai mare. Dacă afișează `command not found` sau o versiune mai veche, instalează Node.js cum este arătat mai jos.

2. Instalează-l pentru sistemul tău:

| Sistem | Cum se instalează |
| --- | --- |
| macOS | Descarcă programul de instalare de la [nodejs.org/en/download](https://nodejs.org/en/download) sau rulează `brew install node@22` dacă folosești Homebrew |
| Windows | Rulează `winget install OpenJS.NodeJS.LTS` în PowerShell sau descarcă programul de instalare de la [nodejs.org/en/download](https://nodejs.org/en/download) |
| Linux | Rulează `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, închide și redeschide terminalul, apoi rulează `nvm install 22` |

3. Închide terminalul, deschide unul nou și rulează din nou `node -v`.

**Ce ar trebui să vezi:** un număr care începe cu `v22` sau mai mare, de exemplu `v22.12.0`.

### pnpm {#install-pnpm}

1. Verifică dacă îl ai deja:

```bash
pnpm -v
```

2. Dacă afișează `command not found` (sau `pnpm: command not found`), instalează-l:

```bash
npm install -g pnpm
```

| Parte | Sens |
| --- | --- |
| `npm` | Unealta de pachete care vine cu Node.js |
| `install` | Descarcă și instalează un program |
| `-g` | Global: îl instalează pentru tot calculatorul, nu pentru un singur folder |
| `pnpm` | Programul de instalat |

Node.js instalat cu Homebrew nu include pnpm. De aceea `pnpm: command not found` apare des pe macOS: comanda de mai sus rezolvă problema. Pe Linux sau macOS, dacă vezi o eroare de permisiuni, rulează în schimb `corepack enable`, apoi din nou `pnpm -v`.

3. Verifică din nou cu `pnpm -v`.

**Ce ar trebui să vezi:** un număr de versiune, de exemplu `9.12.0` sau mai mare.

### jq (opțional) {#install-jq}

`jq` afișează un răspuns lung într-o formă scurtă și ușor de citit. Se folosește o singură dată, la pasul 8.

| Sistem | Instalare | Verificare |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian și Ubuntu) | `jq --version` |

`curl`, folosit la pasul 8, există deja pe macOS, Linux și Windows 10 sau mai nou. În Windows PowerShell scrie `curl.exe` în loc de `curl`.

## Portofelul tău testnet și faucetul {#wallet}

Proiectul își face singur un cont de unică folosință la pasul 3, deci nu ai nevoie de un portofel ca să termini acest ghid. Ai însă nevoie de QOR de testnet în acel cont și poți configura, de asemenea, portofelul QoreX pe testnet, ca să-l folosești cu aplicațiile de exemplu.

**QoreX pe testnet (opțional aici, necesar pentru aplicațiile de exemplu din browser):**

1. În **aplicația QoreX**: deschide **Settings** și activează **Use testnet (developers)**.
2. În **extensia de browser QoreX**: deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.
3. Pentru orice ține de partea Ethereum (EVM), alege și **Add an Ethereum account (coin 60)**. Asta îți dă un cont cu adresă `0x...`, care funcționează cu uneltele Ethereum.

**Faucetul** este un automat gratuit care dă QOR de testnet. Îl folosești la pasul 4:

- Adresa: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). Te autentifici mai întâi.
- Suma: 100 QOR, o dată la 24 de ore pentru fiecare cont.
- Prima tranzacție a unui cont nou îi înregistrează cheia post-cuantică ML-DSA-87. Asta costă o taxă unică de circa 0,09 QOR, deci 100 QOR sunt mai mult decât suficienți.

Detaliile rețelei folosite în acest ghid:

| Serviciu | URL |
| --- | --- |
| Testnet | `qorechain-diana`, ID de lanț EVM 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (necesită autentificare) |

## Pașii {#steps}

### Pasul 1: Verifică-ți uneltele {#step-1}

**Cât durează:** 1 minut.

```bash
node -v
```

| Parte | Sens |
| --- | --- |
| `node` | Programul Node.js |
| `-v` | Afișează versiunea lui și se oprește |

```bash
pnpm -v
```

| Parte | Sens |
| --- | --- |
| `pnpm` | Unealta de pachete |
| `-v` | Afișează versiunea ei și se oprește |

**Ce ar trebui să vezi:** `v22` sau mai mare pentru Node.js și un număr de versiune pentru pnpm. Dacă nu, întoarce-te la „Înainte să începi".

### Pasul 2: Creează proiectul și rulează testele {#step-2}

**Cât durează:** circa 1 minut. Are nevoie de acces la internet.

1. Creează proiectul într-un folder nou. În terminal, intră într-un folder în care îți ții proiectele (de exemplu folderul Documente), apoi rulează:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

Ce face: descarcă generatorul de proiecte QoreChain și construiește un proiect gata făcut, numit `qday-demo`, într-un folder nou.

Parametri:

- `npx`: rulează un program de pe internet fără a-l instala definitiv.
- `create-qorechain-dapp@latest`: generatorul de proiecte QoreChain. `@latest` înseamnă folosește cea mai nouă versiune (acest ghid a fost verificat cu 0.14.0).
- `qday-demo`: numele noului folder și proiect. Poți alege alt nume.
- `-t hardhat`: `-t` înseamnă șablon (template). Alege șablonul Hardhat: un proiect de contract Solidity cu teste.
- `--network testnet`: cu ce rețea QoreChain comunică proiectul. `testnet` este rețeaua de exersare.
- `--package-manager pnpm`: ce unealtă instalează bibliotecile de care are nevoie proiectul.

**Ce ar trebui să vezi:** o listă de pachete instalate, apoi `Done! Created qday-demo`. Dacă te întreabă dacă să instaleze `create-qorechain-dapp`, răspunde `y`.

2. Intră în folderul proiectului:

```bash
cd qday-demo
```

Ce face: mută terminalul în noul folder. Toate comenzile următoare se rulează de aici.

Parametri:

- `cd`: schimbă folderul (change directory).
- `qday-demo`: folderul în care se intră.

3. Rulează testele:

```bash
pnpm test
```

Ce face: compilează contractul și verifică dacă funcționează, pe un mic lanț simulat din interiorul calculatorului tău. Nu trimite nimic pe testnetul real.

Parametri:

- `pnpm`: unealta de pachete.
- `test`: numele scriptului de rulat (este listat în `package.json`; rulează `hardhat test`).

**Ce ar trebui să vezi:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Uită-te la ce ai primit (opțional):

| Fișier | Ce este |
| --- | --- |
| `contracts/Counter.sol` | Contractul inteligent: stochează un număr și poate adăuga 1 |
| `ignition/modules/Counter.ts` | Rețeta care implementează contractul |
| `scripts/window.ts` | Ajutorul din spatele `pnpm window`: îți înregistrează cheia și deschide fereastra de autorizare |
| `hardhat.config.ts` | Setări, inclusiv rețeaua `qorechainTestnet` (ID de lanț 9800) |
| `.env` | Fișierul tău de setări secrete. Îl completezi la pasul 3. Nu-l partaja niciodată |

Mai multe despre șabloane: [Generatoare și CLI](/developer-tools/scaffolders-and-cli) și [Kitul pentru dezvoltatori de lanț](/developer-tools/chain-dev-sdk).

### Pasul 3: Creează un cont testnet de unică folosință {#step-3}

**Cât durează:** 3 minute.

Contul are nevoie de două secrete: o **cheie privată** în stil Ethereum și un **cod de recuperare** (începe cu `QRC1`) din care se face cheia post-cuantică ML-DSA-87. Ambele merg în fișierul `.env` din folderul proiectului. Fișierul rămâne privat, pe calculatorul tău.

1. Fă o cheie privată nouă. Mai întâi creează un fișier mic numit `make-key.mjs` în folderul `qday-demo`, cu acest conținut (folosește orice editor de text, cum ar fi Notepad, TextEdit în mod text simplu sau nano):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

Ce face acest fișier: generează o cheie privată aleatoare și o scrie în fișierul tău `.env`, astfel încât nu este afișată niciodată pe ecran și nu trebuie copiată de mână.

2. Rulează-l:

```bash
node make-key.mjs
```

Ce face: rulează fișierul mic cu Node.js.

Parametri:

- `node`: programul Node.js.
- `make-key.mjs`: fișierul de rulat.

**Ce ar trebui să vezi:** `New private key saved in .env`. Rulează-l o singură dată: a doua rulare face un alt cont.

3. Fă un cod de recuperare:

```bash
pnpm window recovery-code
```

Ce face: creează un cod de recuperare nou și îl afișează.

Parametri:

- `pnpm window`: rulează ajutorul de ferestre al proiectului (`scripts/window.ts`).
- `recovery-code`: acțiunea: afișează un cod de recuperare nou.

**Ce ar trebui să vezi:** o linie lungă care începe cu `QRC1`, apoi o notă despre păstrarea ei. Copiază întreaga linie `QRC1...`.

4. Pune codul în `.env`. Deschide fișierul într-un editor:

| Sistem | Comandă |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

Găsește linia `QORE_PQC_RECOVERY_CODE=` și lipește codul chiar după semnul egal, fără spații și fără ghilimele. Salvează fișierul. Rezultatul arată așa (sunt afișate valori de umplutură, ale tale sunt reale):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

Ce înseamnă fiecare linie:

- `PRIVATE_KEY`: secretul care semnează pentru jumătatea clasică (secp256k1) a contului tău.
- `QORE_PQC_RECOVERY_CODE`: secretul din care se face jumătatea post-cuantică (ML-DSA-87).
- `QORE_NETWORK`: cu ce rețea comunică ajutorul. `testnet` este rețeaua de exersare.

Păstrează `.env` exact așa cum este. Aceeași cheie și același cod îți dau de fiecare dată același cont. Dacă pierzi fișierul, o iei de la capăt cu un cont nou. Nu-l partaja niciodată și nu-l comite niciodată în git.

Preferi o mnemonică (douăsprezece cuvinte)? În loc de cheie și cod, pune în `.env` `QORE_MNEMONIC="your twelve words"`. Ambele chei provin din aceeași frază și nu mai este nevoie de cod de recuperare. Folosește o frază făcută doar pentru acest exercițiu.

5. Cere proiectului adresa noului tău cont:

```bash
pnpm window status
```

Ce face: citește lanțul public și îți arată contul, cheia post-cuantică și fereastra. Nu schimbă nimic.

Parametri:

- `pnpm window`: rulează ajutorul de ferestre.
- `status`: acțiunea: arată starea curentă.

**Ce ar trebui să vezi:** trei linii (ale tale arată adrese reale):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copiază adresa `qor1...`. Aceea o dai faucetului. Ambele adrese aparțin aceluiași cont: `0x...` este forma Ethereum, iar `qor1...` este forma QoreChain.

### Pasul 4: Ia QOR de testnet de la faucet {#step-4}

**Cât durează:** 2 minute.

1. Deschide [faucetul](https://dashboard.qorechain.io/faucet) în browser și autentifică-te.
2. Asigură-te că dashboardul este pe **Testnet**.
3. Lipește adresa ta `qor1...`.
4. Alege **Request Tokens**.

**Ce ar trebui să vezi:** un card cu **Tokens Sent!**, cu 100 QOR (plus niște tokenuri de test pentru fest) și un link **View on Explorer**.

Faucetul plătește o dată la 24 de ore pentru fiecare cont. Sumele exacte sunt pe pagina [Faucet](/dashboard/faucet). Acum verifică din terminal:

```bash
pnpm window status
```

**Ce ar trebui să vezi:** aceleași trei linii ca înainte. Contul tău există acum pe lanț și poate plăti taxe. Încă scrie că cheia nu este înregistrată. Asta urmează.

### Pasul 5: Înregistrează-ți cheia și deschide fereastra {#step-5}

**Cât durează:** circa 2 minute.

1. Înregistrează-ți cheia ML-DSA-87. Este un pas unic pentru fiecare cont:

```bash
pnpm window register
```

Ce face: trimite o tranzacție care spune lanțului care cheie post-cuantică aparține contului tău. Costă o taxă unică de circa 0,09 QOR. Lanțul acceptă acest mesaj semnat doar cu cheia clasică, pentru că încă nu există nicio cheie post-cuantică înregistrată.

Parametri:

- `pnpm window`: rulează ajutorul de ferestre.
- `register`: acțiunea: înregistrează cheia.

**Ce ar trebui să vezi:** `registered: <HASH>`. Dacă scrie `The account already has a PQC key; nothing to do.`, e în regulă: mergi mai departe.

2. Deschide fereastra de autorizare:

```bash
pnpm window open
```

Ce face: trimite o tranzacție **semnată hibrid** (cu ambele chei) care deschide o fereastră scurtă, în care tranzacțiile tale obișnuite în stil Ethereum, cum ar fi implementarea unui contract, sunt admise.

Parametri:

- `pnpm window`: rulează ajutorul de ferestre.
- `open`: acțiunea: deschide o fereastră. Implicit durează 600 de blocuri și permite 5 tranzacții. Poți schimba asta cu `QORE_WINDOW_BLOCKS` și `QORE_WINDOW_TXS` în `.env`.

**Ce ar trebui să vezi:** `opened: <HASH>`, apoi o linie de forma `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Ultimul număr este limita de cheltuială a ferestrei, în uqor (3,75 QOR). Notează hashul de la `opened:`: îl verifici la pasul 8.

3. Așteaptă circa 10 secunde. Deschiderea ferestrei a avansat contorul contului (nonce-ul), iar Hardhat așteaptă ca lanțul să se liniștească.

### Pasul 6: Construiește contractul {#step-6}

**Cât durează:** câteva secunde.

```bash
pnpm build
```

Ce face: transformă contractul Solidity în forma pe care o rulează lanțul.

Parametri:

- `pnpm`: unealta de pachete.
- `build`: scriptul de rulat (rulează `hardhat build`).

**Ce ar trebui să vezi:** `Compiled 1 Solidity file` sau `No contracts to compile`. Ambele sunt în regulă: testul de la pasul 2 l-a compilat deja.

### Pasul 7: Implementează contractul pe testnet {#step-7}

**Cât durează:** circa 30 de secunde.

```bash
pnpm deploy:testnet
```

Ce face: trimite contractul pe testnetul QoreChain cu Hardhat Ignition, folosind fereastra pe care ai deschis-o. Aceasta este o tranzacție EVM obișnuită.

Parametri:

- `pnpm`: unealta de pachete.
- `deploy:testnet`: scriptul de rulat. Rulează `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet`: implementează rețeta `Counter.ts` în rețeaua numită `qorechainTestnet` (ID de lanț 9800).

Când Hardhat întreabă `Confirm deploy to network qorechainTestnet (9800)?`, scrie `y` și apasă Enter.

**Ce ar trebui să vezi:** `[ CounterModule ] successfully deployed` și o linie `CounterModule#Counter - 0x...`. Acel `0x...` este adresa contractului tău. Dacă vezi `HHE10402`, rulează din nou aceeași comandă (vezi Depanare).

### Pasul 8: Verifică semnătura hibridă pe lanț {#step-6-verify}

**Cât durează:** 3 minute.

Tranzacția `opened:` de la pasul 5 a fost semnată cu ambele chei. Oricine o poate verifica din punctul final REST public.

1. Înlocuiește `<HASH>` cu acel hash (fără `<` și `>`) și rulează:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Ce face: cere serverului public de testnet înregistrarea completă a tranzacției tale.

Parametri:

- `curl`: un program care aduce o adresă web.
- `-s`: silențios (silent), deci ascunde bara de progres și arată doar răspunsul.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: adresa REST a testnetului, urmată de hashul tranzacției tale.

**Ce ar trebui să vezi:** un bloc lung de text. Caută trei lucruri:

1. `"code": 0` în `tx_response`. Codul 0 înseamnă succes.
2. Extensia `PQCHybridSignature`, care conține semnătura ML-DSA-87: **4.627 de octeți**, lângă semnătura secp256k1 de 64 de octeți.
3. În `events`, un eveniment de tip `pqc_hybrid_verify` cu atributul `status` setat la `verified`.

2. Ca să afișezi doar acel eveniment (necesită `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ce face: aduce aceeași înregistrare și o trece prin `jq`, care păstrează doar evenimentul de verificare.

Parametri:

- `|`: trimite rezultatul primei comenzi în a doua.
- `jq`: programul-filtru.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: parcurge lista de evenimente și păstrează pe cele al căror tip este `pqc_hybrid_verify`.

**Ce ar trebui să vezi:** un mic bloc de text cu `"status"` setat la `"verified"`.

3. Uită-te la ea în explorer:
   1. Deschide [explore.qore.network](https://explore.qore.network).
   2. Comută selectorul de rețea pe **Testnet**.
   3. Caută hashul.

**Ce ar trebui să vezi:** pagina tranzacției arată securitatea semnăturii ca rezistentă la atacuri cuantice, verificată pe lanț, cu algoritmul ML-DSA-87 (FIPS 204).

Aceasta este dovada: validatorii au verificat ambele semnături. Aceasta este tranzacția ta pentru Quantum Pass.

## Ce ar trebui să vezi, pe scurt {#what-you-should-see}

| Unde | Ce |
| --- | --- |
| După pasul 2 | `Done! Created qday-demo` și `2 passing` |
| După pasul 3 | O adresă `qor1...` și o adresă `0x...` din `pnpm window status`, cu cheia neînregistrată |
| După pasul 4 | **Tokens Sent!** la faucet |
| După pasul 5 | `registered: <HASH>`, apoi `opened: <HASH>` și linia ferestrei |
| După pasul 7 | `CounterModule#Counter - 0x...` |
| După pasul 8 | `code` 0, o semnătură ML-DSA-87 de 4.627 de octeți și `pqc_hybrid_verify` cu `status` `verified`, în rezultatul REST și în explorer pe Testnet |

## Pachete folosite {#published}

Declarate în `package.json`-ul generat:

| Pachet | Registru | Versiune |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Generatorul instalează și pluginurile Hardhat toolbox, Ignition și keystore listate în `package.json`-ul generat.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `HHE10402` sau „wait for confirmations" imediat după deschiderea ferestrei | Deschiderea ferestrei a avansat nonce-ul contului | Rulează din nou `pnpm deploy:testnet` |
| „EVM authorisation window exhausted" sau „no window" | Fereastra a rămas fără tranzacții sau blocuri, ori este limitată la alt contract (o fereastră limitată la alt contract blochează implementarea) | Rulează `pnpm window open` ca să deschizi o fereastră nouă, așteaptă circa 10 secunde, apoi implementează din nou |
| „account has no PQC key and classical fallback is disabled" | Contul nu a înregistrat o cheie ML-DSA-87 | Rulează mai întâi `pnpm window register`, apoi `pnpm window open` |
| „does not exist on chain yet" | Contul nu are încă QOR | Ia QOR de la faucet (pasul 4) |
| „Rate Limit Reached" la faucet sau niciun token după 30 de secunde | O singură cerere la 24 de ore pentru fiecare cont și pentru fiecare adresă, iar cererile sunt servite pe rând | Așteaptă câteva secunde și încearcă din nou, sau așteaptă să treacă cele 24 de ore. Doar o cerere la 24 de ore |
| `pnpm: command not found` | pnpm nu este instalat. Node.js instalat cu Homebrew nu îl include | Rulează `npm install -g pnpm`, apoi deschide un terminal nou |
| `pnpm window` se oprește cu un mesaj despre un cod de recuperare lipsă | `.env` are `PRIVATE_KEY` fără `QORE_PQC_RECOVERY_CODE` | Rulează `pnpm window recovery-code` și lipește codul în `.env` (pasul 3), sau folosește `QORE_MNEMONIC` |
| „QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | O greșeală de scriere, un spațiu sau o ghilimea la lipire | Lipește codul din nou, fără spații sau ghilimele |
| „registered, but NOT this key" în `pnpm window status` | Pentru acest cont s-a folosit mai devreme un alt cod de recuperare | Pune la loc în `.env` codul de recuperare original sau începe din nou cu un cont nou |
| Erori CORS într-o aplicație de browser | Un browser blochează apelurile către o adresă de lanț care nu permite pagina ta | Folosește calea proxy `/lcd` a șablonului pentru apelurile REST din browser, în loc să apelezi direct adresa lanțului |
| Hardhat refuză să pornească | Node.js este mai vechi de 22 | Instalează Node.js 22 sau mai nou (vezi „Înainte să începi") și rulează din nou `pnpm install` |
| `curl` arată `tx not found` imediat după pas | Blocul nu este încă finalizat | Așteaptă 10 secunde și rulează din nou comanda |
| `curl` nu funcționează în Windows PowerShell | Acolo `curl` este o altă comandă | Scrie `curl.exe` în loc de `curl` |

## Aplicațiile de exemplu {#example-apps}

Același flux, din mai multe limbaje și interfețe. Fiecare semnează hibrid. Toate sunt în depozitul public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folderul `workshop-1`. Ca să le obții ai nevoie de Git (verifică cu `git --version`; instalează de la [git-scm.com](https://git-scm.com/downloads)), apoi rulează:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Ce face: descarcă o copie a tuturor aplicațiilor de exemplu și intră în folderul `workshop-1`.

Parametri:

- `git clone <address>`: copiază un proiect de pe internet pe calculatorul tău.
- `cd build-before-qday/workshop-1`: intră în folderul care conține cele șase aplicații.

Fiecare pagină de aplicație este un ghid complet, de la început la sfârșit, cu ce trebuie instalat și la ce să te aștepți.

| Aplicație | Limbaj | Pagină |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Kiturile din spatele acestor aplicații sunt listate pe pagina [Kituri](/build-before-qday/workshop-1/kits). Ca să folosești portofelul QoreX cu un dApp din browser, vezi [QoreX](/qorex/overview).
