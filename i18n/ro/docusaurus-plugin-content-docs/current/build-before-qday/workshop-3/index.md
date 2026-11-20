---
slug: /build-before-qday/workshop-3
title: "Workshop 3: Aplicații criptate și cross-VM"
sidebar_label: "Workshop 3"
sidebar_position: 4
date: 2026-11-20
---

# Workshop 3: Aplicații criptate și cross-VM

Workshop 2 a protejat bani cu o cheie post-cuantică. Workshop 3 face două lucruri noi cu același lanț. Mai întâi, **criptezi un mesaj către o adresă QoreChain**, astfel încât doar proprietarul acelei adrese să îl poată citi, cu criptare post-cuantică. Apoi, o tranzacție pe **EVM** scrie într-un contract de pe **QoreChain Native**, iar ambele părți se schimbă împreună sau deloc.

Nu trebuie să fii criptograf. Fiecare comandă de mai jos spune ce face și ce ar trebui să vezi. Cele două aplicații de exemplu sunt publice: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folderul `workshop-3`. Ambele rulează doar pe testnet-ul QoreChain `qorechain-diana`. QOR de test nu are valoare.

**Cât durează:** circa 30 de minute pentru QoreSeal, 40 pentru checkout-ul cross-VM. Cele două părți sunt independente și fiecare are nevoie de propriile conturi de test.

## Ce construim {#what-we-built}

| Parte | Aplicație | Ce demonstrează |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Criptezi un mesaj către o adresă `qor1...` cu ML-KEM-1024, îl deschizi, vezi că un străin nu poate, vezi că modificarea lui este detectată și rotești o cheie fără să pierzi mesajele vechi. |
| 2 | **CrossVmCheckout** (Solidity și Rust) | Un apel dintr-un contract EVM scrie o chitanță într-un contract Native în aceeași tranzacție. Dacă una dintre părți eșuează, ambele sunt anulate. |

Inovațiile din spatele lor:

- **Criptare către o adresă.** Fiecare cont poate publica pe lanț o cheie de criptare post-cuantică, ca o carte de telefon publică. Ca să scrii cuiva, ai nevoie doar de adresa lui.
- **Un card care leagă cheia de cont.** Contul semnează un mic card de destinatar cu ambele chei de semnare, deci nimeni nu poate strecura o cheie de criptare falsă pe parcurs.
- **Criptare hibridă.** ML-KEM-1024 (NIST FIPS 203) este combinat cu cheia clasică X25519. Mesajul rămâne privat atât timp cât rezistă măcar una dintre ele.
- **Atomicitate cross-VM.** EVM și QoreChain Native au o singură stare și un singur bloc. Un apel între ele face parte din aceeași tranzacție, deci nu rămâne nicio stare pe jumătate terminată de curățat.
- **Acces aprobat prin guvernanță.** Podul apelează doar contracte Native aprobate de guvernanță, iar fiecare aprobare este legată de codul contractului.

## Cuvinte folosite în acest ghid {#words}

| Cuvânt | Sens simplu |
| --- | --- |
| ML-KEM-1024 | Un schimb de chei post-cuantic (NIST FIPS 203). Aici este folosit ca să cădem de acord asupra unei chei secrete pentru fiecare mesaj |
| X25519 | Un schimb de chei clasic, combinat cu ML-KEM, astfel încât plicul rezistă dacă oricare dintre ele este spart |
| ML-DSA-87 | Semnătura post-cuantică (NIST FIPS 204). Fiecare tranzacție nativă este semnată cu ea și cu cheia clasică secp256k1 |
| Card de destinatar | O mică notă semnată care leagă cheile de criptare ale unui cont de acel cont |
| Plic | Mesajul sigilat, salvat ca fișier text pe care îl poți trimite oricum vrei |
| Native | QoreChain Native, lane-ul CosmWasm în care contractele sunt scrise în Rust |
| Precompile de pod | Un contract încorporat la `0x0000000000000000000000000000000000000901` care permite unui contract EVM să apeleze un contract Native |
| Listă de aprobări | Contractele Native pe care guvernanța le-a aprobat pentru a fi apelate de pod |
| Fereastră EVM | O permisiune scurtă și limitată de a trimite tranzacții în stil Ethereum dintr-un cont. Deschiderea ei cere o tranzacție semnată cu ambele chei |

:::caution Doar conturi testnet de unică folosință
Folosește chei făcute pentru acest workshop, care conțin QOR de test fără valoare. Nu pune niciodată cuvintele secrete sau cheia unui cont care conține bani reali într-un fișier sau într-o comandă.
:::

## Înainte să începi {#prerequisites}

Ai nevoie de uneltele de la [Înainte de a începe](/build-before-qday/prerequisites) (un terminal, Node.js și Git) și de un browser pentru faucet. Partea 1 are nevoie de Node.js 20 sau mai nou. Partea 2 are nevoie și de **pnpm** și **Foundry**, iar opțional de Rust. Verifică Node.js:

```bash
node -v
```

Trebuie să afișeze `v20` sau mai mare. Pentru Partea 2 instalează restul:

```bash
npm install -g pnpm
```

Instalează pnpm, unealta de pachete folosită în Partea 2. Verifică cu `pnpm -v`. Foundry compilează, testează și implementează Solidity: instalează-l de la [getfoundry.sh](https://getfoundry.sh), apoi rulează `foundryup`. Verifică cu `forge --version` și `cast --version`.

Obține codul de exemplu:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

Prima linie descarcă exemplele într-un folder numit `build-before-qday`. A doua intră în folderul `workshop-3`, care conține cele două aplicații.

QOR de test vine de la [faucet](/dashboard/faucet) din dashboard.

## Partea 1: QoreSeal, criptare către o adresă {#part-1}

Cod: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Pachete: `@qorechain/qoreseal` și `@qorechain/qoresign`.

Vrei să trimiți un mesaj privat cuiva și știi doar adresa lui. Aplicația arată cum:

1. Alice își înregistrează cheile pe lanț.
2. Oricine caută cheia de criptare a Alicei după adresa ei.
3. Un mesaj este sigilat pentru Alice. Alice îl deschide. **Eve nu poate.**
4. Schimbă un singur bit din plic și **nu se mai deschide**.
5. Un mesaj sigilat pentru Alice **și** Bob: fiecare îl deschide cu propria cheie.
6. Alice își **rotește** cheia: cardul vechi este refuzat, mesajele noi folosesc cheia nouă, iar mesajele vechi se deschid în continuare.

Criptarea se întâmplă pe calculatorul tău. Lanțul nu vede niciodată mesajul, doar cheia publică.

```bash
cd 01-qoreseal
```

Intră în folderul QoreSeal.

### Pasul 1: instalare {#seal-install}

```bash
npm install
```

Descarcă exact versiunile de pachete din `package-lock.json`: QoreSeal, QoreSign (semnatarul hibrid) și câteva utilitare cosmjs care construiesc tranzacția.

```bash
node seal.mjs help
```

Listează toate comenzile.

### Pasul 2: creează trei conturi de testnet {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Fiecare comandă creează un cont nou și îi salvează cuvintele secrete în `~/.config/qday-w3/<name>.json`, lizibil doar de tine. Nu se afișează nimic secret. Setează `QDAY_DIR` ca să păstrezi fișierele în altă parte. Fiecare comandă afișează adresa `qor1...` a contului.

### Pasul 3: alimentează-o pe Alice {#seal-fund-alice}

Lipește adresa `qor1...` a Alicei în [faucet](/dashboard/faucet), apoi verifică:

```bash
node seal.mjs whoami
```

Arată fiecare cont: adresa, soldul și dacă cheile lui sunt deja pe lanț. Deocamdată răspunsul este `no`.

### Pasul 4: Alice își înregistrează cheile {#seal-register}

```bash
node seal.mjs register alice
```

Două tranzacții:

1. **Cheia de semnare ML-DSA-87**, cu o dovadă că Alice o deține. Este singura tranzacție pe care lanțul o acceptă semnată doar cu cheia clasică, pentru că încă nu îi cunoaște cheia post-cuantică.
2. **Cheia de criptare ML-KEM-1024** (1,568 de octeți), semnată cu ambele chei. De acum oricine o poate citi de pe lanț.

Apoi semnează **cardul de destinatar** al Alicei și îl salvează ca `cards/alice.json`. Într-o aplicație reală ai publica cardul lângă adresă, de exemplu pe o pagină de profil, într-un contract sau în spatele unui API.

### Pasul 5: dă QOR Bobului și Evei și înregistrează-l pe Bob {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Trimite 3 QOR de test de la Alice către Bob și către Eve. Ca orice tranzacție de după înregistrare, este semnată cu **ambele** chei, iar lanțul le verifică pe amândouă. De aceea Alice se înregistrează prima: un cont fără cheie ML-DSA-87 pe lanț poate înregistra doar una, iar orice altă tranzacție de la el este refuzată.

```bash
node seal.mjs register bob
```

Bob este necesar pentru Pasul 9, unde un mesaj ajunge la două persoane. Eve rămâne neînregistrată: este străina care va încerca să citească mesajele Alicei.

### Pasul 6: caută-o pe Alice, ca un expeditor {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Citește `GET /qorechain/pqc/v1/kem/<address>` din API-ul REST public: algoritmul (`ML-KEM-1024`), cheia publică de 1,568 de octeți și blocul la care a fost înregistrată. Apoi verifică cardul în raport cu acea cheie și cu cheia ML-DSA-87 a Alicei de pe lanț. Ar trebui să vezi `card valid`. Poți face asta pentru orice adresă: `node seal.mjs lookup qor1...`.

### Pasul 7: sigilează un mesaj pentru Alice și deschide-l {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Citește cheia Alicei de pe lanț, verifică cardul ei și sigilează mesajul. Un mesaj de 41 de caractere devine circa 1,760 de octeți, în mare parte material de cheie post-cuantică. Plicul este salvat în `inbox/`.

```bash
node seal.mjs open alice
```

Afișează `OPENED by alice with encryption key #0` și mesajul.

```bash
node seal.mjs open eve
```

Afișează `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. Eve are fișierul, dar nu are cheia Alicei.

### Pasul 8: modifică-l {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Schimbă un bit din plic și încearcă să-l deschidă. Ar trebui să vezi `REFUSED` cu `DECRYPTION_FAILED`. Plicul este autentificat, deci orice schimbare este detectată și nimeni nu poate edita un mesaj sigilat.

### Pasul 9: un mesaj, doi destinatari {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

Un singur plic, sigilat pentru ambele adrese. Fiecare îl deschide cu propria cheie. Eve tot nu poate.

### Pasul 10: rotește cheia Alicei {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Derivă **următoarea** cheie de criptare a Alicei (numărul 1) din aceleași cuvinte secrete și o înregistrează pe lanț, unde o **înlocuiește** pe cea veche. Apoi verifică cardul **vechi** în raport cu lanțul și ar trebui să vezi `refused: the card names a different ML-KEM-1024 key than the registered one`. Expeditorii care verifică cardul nu mai pot sigila pentru cheia veche. Se semnează un card nou.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Deschide **primul** plic, sigilat înainte de rotație: `OPENED by alice with encryption key #0 (an older key)`. Cheia veche nu a fost niciodată stocată. Este derivată din nou din cuvintele secrete, deci rotația nu te blochează niciodată în afara mesajelor vechi.

```bash
node seal.mjs inspect
```

Arată ce se află într-un plic, fără secret: versiune, scop, destinatari și dimensiuni.

### Cum funcționează codul {#seal-code}

Totul este în `seal.mjs`. Apelurile QoreSeal care contează:

| Apel | Ce face |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | Cheile de criptare ale cheii cu numărul `index`, derivate din cuvintele secrete |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | Mesajul `MsgRegisterKEMKey` care pune cheia pe lanț |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | Cardul, semnat cu ambele chei de semnare ale contului |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Aruncă o eroare dacă cardul nu se potrivește cu cheile de pe lanț |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Citește fiecare cheie de pe lanț, verifică fiecare card, sigilează |
| `open({ chainId, purpose, envelope, keys })` | Deschide plicul sau aruncă o eroare |
| `envelopeToText` și `envelopeFromText` | Plicul ca fișier text și înapoi |

`purpose` (aici `qday-note`) face parte din ceea ce este sigilat: un plic făcut pentru o aplicație nu poate fi deschis ca și cum ar veni de la alta.

### Dacă ceva nu merge (QoreSeal) {#seal-trouble}

| Ce vezi | Ce faci |
| --- | --- |
| `does not exist on chain yet: fund ... first` | Contul nu are QOR: folosește faucet-ul sau `fund` |
| `no ML-KEM key registered for this address` | Rulează mai întâi `register` pentru acel cont |
| `hybrid mode needs the recipient card` | Lipsește fișierul `cards/<name>.json`: rulează `register <name>`, care scrie cardul din nou |
| `no envelope yet` | Rulează mai întâi `send` |
| `account has no PQC key and classical fallback is disabled` | Contul nu s-a înregistrat încă: rulează `register <name>` înainte de `fund` din el |
| `refused: ...` la o tranzacție | Citește mesajul: de obicei nu ai destul QOR sau API-ul public de testnet te limitează. Așteaptă câteva secunde |

Fișierele din `~/.config/qday-w3/` conțin cuvinte secrete. Nu le comite și nu le partaja niciodată și nu le refolosi pe mainnet. Folderele `cards/` și `inbox/` sunt locale și trecute în `.gitignore`.

## Partea 2: CrossVmCheckout, o tranzacție peste două VM-uri {#part-2}

Cod: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Limbaje: Solidity și TypeScript pentru partea EVM, Rust pentru partea Native.

QoreChain rulează mai multe mașini virtuale pe același lanț: **EVM** (Solidity, în stil MetaMask) și **QoreChain Native** (contracte CosmWasm în Rust). Ele au o singură stare și un singur bloc. Această aplicație este un magazin minuscul:

- **`CrossVmCheckout`** (Solidity, EVM) numără comenzile.
- **`qday-receipts`** (Rust, Native) ține un registru de chitanțe.
- Un singur apel `checkout("coffee for the team")` face ambele **în aceeași tranzacție**: numărul de comenzi crește pe partea EVM și o chitanță este scrisă pe partea Native.

Ideea este **atomicitatea**: ambele părți se schimbă împreună sau niciuna.

| Comandă | Ce se întâmplă | Rezultat |
| --- | --- | --- |
| `checkout` | Comandă +1 pe EVM, chitanță +1 pe Native | Se schimbă ambele |
| `undo` | Chitanța Native este scrisă, **apoi** partea EVM dă revert | Nu se schimbă niciuna: și chitanța este anulată |
| `native-fails` | Comanda este numărată, **apoi** contractul Native refuză | Nu se schimbă niciuna: și comanda este anulată |
| `outside` | Ceri podului să apeleze un contract Native neaprobat de guvernanță | Refuzat de lanț |

Pe mainnet, apelurile cross-VM sunt deocamdată oprite, deci această parte rulează doar pe testnet.

### Podul și lista de aprobări {#bridge}

EVM ajunge la Native prin precompile-ul de pod de la `0x0000000000000000000000000000000000000901`. Apelezi:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argument | Sens |
| --- | --- |
| `targetVM` | `1` pentru Native |
| `targetContract` | Adresa `qor1...` a contractului Native |
| `payload` | Mesajul JSON al contractului Native |

Podul ajunge doar la contractele Native pe care **guvernanța** le-a aprobat. Lista este publică, în parametrii crossvm (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`), iar fiecare intrare este legată de codul contractului, deci un contract aprobat nu poate fi înlocuit ulterior cu alt cod.

Contractul Native pe care îl vei apela, `qday-receipts`, este pe lista de aprobări a testnet-ului (propunerea de guvernanță 40, code id 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

Nu are administrator, deci nimeni nu îl poate schimba. **Orice constructor îl poate apela din propriile contracte pentru traseul Cross-VM.** Pe partea Native, expeditorul apelului este propriul cont `qor1...` al contractului tău EVM, nu portofelul tău, deci fiecare chitanță arată ce contract a scris-o.

### Cum funcționează contractul EVM {#xvm-how}

Deschide `evm/src/CrossVmCheckout.sol`:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Verifică nota.** Intră într-un șir JSON, deci trebuie să aibă între 1 și 140 de caractere imprimabile, fără `"` și fără `\`. Altfel, o notă construită special ar putea schimba mesajul primit de contractul Native.
2. **Numără comanda.** O schimbare obișnuită de stare EVM.
3. **Apelează podul.** Contractul Native rulează chiar acolo, în această tranzacție.
4. **Dacă apelul către pod a eșuat, dă revert.** Un eșec Native devine un revert EVM, iar întreaga tranzacție este anulată.
5. **Lipsa răspunsului înseamnă lipsa podului.** Pe un lanț unde precompile-ul nu este activ, un apel către acea adresă "reușește" cu date goale. Tratează asta ca pe o eroare, niciodată ca pe un succes.
6. **Decodează răspunsul.** Podul returnează răspunsul Native ca `bytes` codați ABI. Codul acceptă și octeți expuși direct.
7. **`failAfter`** dă revert după ce apelul Native a reușit. Arată că și chitanța scrisă pe partea Native este anulată.

Folosește un `call` normal, nu un `staticcall` sau o funcție view: podul refuză apelurile statice, pentru că partea Native poate scrie stare.

Toate comenzile de mai jos rulează în folderul `evm`, dacă nu se spune altfel:

```bash
cd ../02-cross-vm/evm
```

Dacă ești încă în `01-qoreseal`, aceasta te mută în folderul EVM al aplicației cross-VM.

### Pasul 1: rulează testele (fără cont) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` descarcă pachetele JavaScript. `pnpm forge-std` descarcă biblioteca standard a Foundry în `lib/`, o singură dată. `forge test` rulează cele 5 teste din `test/CrossVmCheckout.t.sol`. Ar trebui să vezi `5 passed; 0 failed`.

EVM-ul local al Foundry nu are podul QoreChain, deci testele pun un pod fals la `0x...0901` cu `vm.etch`. Ele verifică mesajul JSON exact trimis, că `failAfter` anulează totul, că un eșec Native anulează partea EVM, că o notă nu poate injecta JSON și că un pod inactiv este o eroare. Podul real rulează în pașii următori.

### Pasul 2: un cont cu cheie post-cuantică {#xvm-account}

Dacă ai făcut Workshop 2, copiază de acolo fișierul `.env` (același cont, cheia deja înregistrată) și adaugă linia `RECEIPTS_CONTRACT` din `.env.example`. Altfel:

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` creează un cont de unică folosință. Pune cheia lui privată în `.env` ca `PRIVATE_KEY`. **Doar pe testnet.**

```bash
pnpm window recovery-code
```

Afișează un cod `QRC1-...`. Pune-l în `.env` ca `QORE_PQC_RECOVERY_CODE` și păstrează o copie separat de cheia privată. Cheia ta ML-DSA-87 este derivată din el.

```bash
pnpm window status
```

Arată adresa ta `qor1...`. Lipește-o în [faucet](/dashboard/faucet), apoi:

```bash
pnpm window register
```

Pune cheia ta ML-DSA-87 pe lanț, o dată per cont. `pnpm window status` arată acum `PQC key: registered`.

### Pasul 3: deschide o fereastră EVM limitată {#xvm-window}

```bash
pnpm window:scoped
```

Deschide o fereastră de **1,200 de blocuri (circa 28 de minute), 6 tranzacții și 3 QOR** valoare plus taxe. Este suficient pentru implementare și cele trei tranzacții demo, nimic mai mult. Portofelul tău apelează **propriul tău contract**, iar contractul apelează apoi podul cu propria identitate, deci fereastra trebuie doar să admită apelul către contractul tău.

**Așteaptă circa 10 secunde** înainte de pasul următor, ca tranzacția ferestrei să fie într-un bloc.

### Pasul 4: implementează magazinul {#xvm-deploy}

```bash
pnpm deploy:testnet
```

Implementează `CrossVmCheckout` cu trimitere către `RECEIPTS_CONTRACT`. Caută `CrossVmCheckout 0x...`. În ieșirea Foundry, "ETH" înseamnă QOR.

```bash
pnpm xvm status
```

Arată ambele părți: `orders` pe contractul tău EVM și numărul de chitanțe de pe `qday-receipts`, cu ultimele trei chitanțe. Alți constructori scriu în același registru de chitanțe, deci numărul lui probabil nu este zero. Contează cum se **schimbă**.

### Pasul 5: un contract pe care lanțul nu l-a aprobat {#xvm-outside}

```bash
pnpm xvm outside
```

Simulează un apel direct al podului către un contract Native real care **nu** este pe lista de aprobări. Ar trebui să vezi `REFUSED by the bridge: ... is not allowlisted`. Este gratuit și nu folosește nicio tranzacție de fereastră.

### Pasul 6: o tranzacție, două VM-uri {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

Vezi `before`, tranzacția (`SUCCESS`) și `after`: comenzi +1 **și** chitanțe +1, plus chitanța nouă cu nota ta, trimisă `from` adresa `qor1...` a contractului tău. Apoi `both sides changed, in the same transaction`.

### Pasul 7: partea EVM eșuează după apelul Native {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Chitanța Native este scrisă, apoi partea EVM dă revert. Tranzacția este minată ca `REVERTED`, iar `before` și `after` sunt identice: `nothing changed on either side`. Și chitanța scrisă pe partea Native a dispărut.

### Pasul 8: partea Native refuză {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

Comanda este numărată pe partea EVM, apoi `qday-receipts` refuză cu `{"fail":{}}`. Tranzacția este `REVERTED`, iar numerele sunt identice: și comanda EVM este anulată.

Fiecare tranzacție are un link în explorer. Deschide-l în [explorer-ul din dashboard](/dashboard/explorer) cu selectorul de rețea pe **Testnet**.

### Dacă ceva nu merge (cross-VM) {#xvm-trouble}

| Ce vezi | Ce înseamnă | Ce faci |
| --- | --- | --- |
| `Missing or invalid parameters` la implementare sau la o tranzacție | Nu există o fereastră EVM activă | `pnpm window status`, apoi `pnpm window:scoped`, așteaptă 10 secunde, încearcă din nou |
| `No shop yet` | Nimic implementat din acest folder | Pasul 4, sau setează `SHOP_ADDRESS` în `.env` |
| `BridgeCallFailed` cu `not allowlisted` | Ținta nu este aprobată de guvernanță | Folosește `qday-receipts`, adresa de mai sus |
| `BridgeNotActive` | Precompile-ul de pod nu este activ în acea rețea | Folosește testnet-ul |
| `BadNote` | Nota este goală, prea lungă sau conține `"` ori `\` | Folosește text simplu de până la 140 de caractere |

### Partea Native {#native-side}

Folderul `native/` conține sursa completă a `qday-receipts` (CosmWasm 2, Rust):

| Mesaj | Ce face |
| --- | --- |
| `{"record":{"note":"..."}}` | Adaugă o chitanță: id, expeditor, notă, înălțimea blocului |
| `{"fail":{}}` | Refuză mereu, ca să arate atomicitatea |
| `{"count":{}}` (interogare) | Câte chitanțe sunt |
| `{"receipt":{"id":1}}` (interogare) | O chitanță |
| `{"latest":{"limit":3}}` (interogare) | Cele mai noi chitanțe, cele mai noi primele, cel mult 20 |

Rulează testele lui (ai nevoie de Rust):

```bash
cd ../native
cargo test
```

Ar trebui să vezi 3 teste trecute. Încărcarea contractelor Native pe testnet trece prin guvernanță, deci nu trebuie să îl implementezi pe acesta: este deja activ.

Ca să verifici că codul de pe lanț este această sursă, compilează-l cu optimizatorul CosmWasm și compară sumele de control. Codul de pe lanț a fost compilat pe un Mac Apple Silicon cu imaginea arm64, deci folosește-o pe aceeași: imaginea x86 produce o sumă de control diferită.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Suma de control ar trebui să fie `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`, același `data_hash` pe care îl arată lanțul pentru codul 865:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Citește registrul de chitanțe de oriunde, fără cont:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### Fișiere {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## Mai multe informații {#learn-more}

- Fest-ul, traseele Encrypted Apps și Cross-VM și recompensele: [build.qorechain.io](https://build.qorechain.io).
- QoreSeal pe npm: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [Precompile-uri EVM](/developer-guide/evm-precompiles) și [referința cross-VM](/developer-guide/cross-vm-reference).
- [Workshop 2](/build-before-qday/workshop-2) pentru fereastra EVM și seif.
