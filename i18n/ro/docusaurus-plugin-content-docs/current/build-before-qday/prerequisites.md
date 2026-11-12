---
slug: /build-before-qday/prerequisites
title: "Înainte de a începe: instrumente și un portofel de testnet"
sidebar_label: "Înainte de a începe"
sidebar_position: 2
---

# Înainte de a începe: instrumente și un portofel de testnet

Fiecare tutorial din această secțiune pornește de la un calculator pe care nu este instalat nimic. Această pagină este singurul loc unde pregătești totul. Fă-o o singură dată, apoi deschide orice tutorial. Fiecare tutorial trimite înapoi aici și repetă doar comenzile scurte de verificare de care are nevoie.

**Cât durează:** cam 20 până la 40 de minute prima dată, mai ales din cauza descărcărilor. Instalezi doar instrumentele pentru tutorialul pe care vrei să îl urmezi.

:::caution Doar un cont de testnet de unică folosință
Tot ce se întâmplă aici rulează pe **testnet**-ul QoreChain, unde QOR nu are nicio valoare. Nu folosi niciodată portofelul tău real, o frază de recuperare reală sau fonduri reale în vreun tutorial. Vei crea un cont nou, doar pentru acest exercițiu.
:::

## Ce instrumente are nevoie fiecare tutorial? {#which-tools}

Instalează doar rândurile de care ai nevoie. Git, un terminal și un browser web sunt necesare pentru toate.

| Tutorial | Limbaj | Instrumente de instalat | Portofel QoreX |
| --- | --- | --- | --- |
| [Ghidul Workshop 1](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (opțional) | Nu este necesar |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | Nu este necesar |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Necesar, cu un cont Ethereum (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Necesar |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | Nu este necesar |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | Nu este necesar |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 sau mai nou | Nu este necesar |

## Deschide un terminal {#terminal}

Un terminal este o fereastră în care tastezi comenzi. Vei lipi în ea comenzile de pe aceste pagini, una câte una.

| Sistem | Cum îl deschizi |
| --- | --- |
| macOS | Apasă Command și Space, scrie `Terminal`, apasă Return. |
| Windows | Deschide meniul Start, scrie `PowerShell`, deschide **Windows PowerShell**. Pentru tutorialul Java ai nevoie și de **Git Bash** (vine cu Git, vezi mai jos) sau de WSL. |
| Linux | Apasă Ctrl, Alt și T, sau caută `Terminal` în aplicații. |

După ce instalezi un instrument, **închide terminalul și deschide unul nou**. Un terminal care era deschis în timpul instalării nu vede încă noul instrument.

## Instalează instrumentele {#install}

Pentru fiecare instrument primești comanda de instalare sau linkul de descărcare, apoi **comanda de verificare**. O comandă de verificare întreabă instrumentul ce versiune are. Dacă afișează un număr de versiune egal sau mai mare decât cel cerut, instrumentul funcționează.

### Manageri de pachete (ajutoare opționale) {#package-managers}

Un manager de pachete instalează alte programe cu o singură comandă. Poți să descarci și fiecare instrument manual, de pe site-ul lui. Comenzile de mai jos folosesc ajutorul potrivit sistemului tău.

| Sistem | Ajutor | Cum îl obții |
| --- | --- | --- |
| macOS | Homebrew | Lipește această singură linie în terminal, apoi urmează ce afișează: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Este deja inclus în Windows 10 și 11. Verifică cu `winget --version`. |
| Linux | apt | Este deja inclus pe Ubuntu și Debian. Alte sisteme: folosește propriul manager de pachete (`dnf`, `pacman`). |

### Git {#git}

Git descarcă codul de exemplu de pe GitHub.

| Sistem | Instalare |
| --- | --- |
| macOS | `xcode-select --install` (se deschide o fereastră, alege **Install**), sau `brew install git` |
| Windows | `winget install --id Git.Git -e`, sau descarcă de pe [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

Verifică:

```bash
git --version
```

Ar trebui să vezi o linie de forma `git version 2.40.0`. Orice versiune merge.

### Node.js 22.13 sau mai nou {#node}

Node.js rulează proiectele TypeScript. Hardhat 3, instrumentul pentru contracte folosit aici, refuză să pornească pe orice versiune de Node.js mai veche de 22.13.

| Sistem | Instalare |
| --- | --- |
| macOS | `brew install node`, sau descarcă instalatorul LTS de pe [nodejs.org](https://nodejs.org) |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`, sau descarcă instalatorul LTS de pe [nodejs.org](https://nodejs.org) |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` apoi `sudo apt install -y nodejs` |

:::note Linux: nu folosi pachetul apt implicit
Pe Ubuntu și Debian, `sudo apt install nodejs` instalează o versiune veche, prea mică. Folosește linia NodeSource de mai sus.
:::

Verifică:

```bash
node -v
```

Ar trebui să vezi `v22.13.0` sau mai mare, de exemplu `v22.20.0` sau `v24.1.0`. Dacă vezi un număr mai mic, instalează din nou și deschide un terminal nou.

### pnpm 9 sau mai nou {#pnpm}

pnpm instalează bibliotecile de care are nevoie un proiect TypeScript. Face aceeași treabă ca `npm`, doar mai repede.

Instalează-l cu instrumentul de instalare al Node.js, `npm`, pe orice sistem:

```bash
npm install -g pnpm
```

| Parte | Ce face |
| --- | --- |
| `npm install` | Descarcă și instalează un program. |
| `-g` | Prescurtare de la "global": îl instalează pentru tot calculatorul, nu pentru un singur folder. |
| `pnpm` | Programul de instalat. |

Pe macOS și Linux, dacă se termină cu `EACCES` sau "permission denied", rulează din nou comanda ca `sudo npm install -g pnpm`.

:::caution Node.js instalat cu Homebrew nu include pnpm
Dacă un tutorial afișează `pnpm: command not found` (sau `zsh: command not found: pnpm`), înseamnă că nu ai instalat încă pnpm. Rulează `npm install -g pnpm`, deschide un terminal nou și încearcă din nou.
:::

Verifică:

```bash
pnpm -v
```

Ar trebui să vezi `9.0.0` sau mai mare, de exemplu `10.4.1`.

### curl și jq (doar pentru ghidul Workshop 1) {#curl-jq}

`curl` descarcă o adresă web din terminal. Îl folosești ca să citești tranzacția ta de la punctul final REST public. `jq` filtrează răspunsul lung, ca să vezi doar partea care te interesează. `jq` este opțional.

| Sistem | curl | jq |
| --- | --- | --- |
| macOS | Inclus. | `brew install jq` |
| Windows | Inclus în Windows 10 și 11 sub numele `curl.exe`. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl` dacă lipsește | `sudo apt install -y jq` |

Verifică-le:

```bash
curl --version
jq --version
```

Ar trebui să vezi câte o linie de versiune pentru fiecare, de exemplu `jq-1.7`.

:::note Windows PowerShell: scrie curl.exe
În PowerShell, cuvântul scurt `curl` este o altă comandă încorporată. Scrie `curl.exe` în locul lui `curl` în fiecare comandă de pe aceste pagini. Dacă folosești Git Bash, `curl` simplu funcționează.
:::

### Rust 1.88 sau mai nou (doar pentru tutorialul Rust) {#rust}

Rust compilează aplicația în linie de comandă `qday-pay`. Îl instalezi cu `rustup`, instalatorul oficial Rust. Acesta instalează și `cargo`, instrumentul de compilare Rust.

| Sistem | Instalare |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (apasă Return ca să accepți valoarea implicită). Instrumentele de compilare vin cu `xcode-select --install`. |
| Windows | Descarcă și rulează `rustup-init.exe` de pe [rustup.rs](https://rustup.rs), sau `winget install --id Rustlang.Rustup -e`. Când cere Visual Studio C++ Build Tools, acceptă: Rust are nevoie de ele ca să compileze programe pe Windows. |
| Linux | `sudo apt install -y build-essential curl` apoi `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (apasă Return ca să accepți valoarea implicită) |

Verifică:

```bash
rustc --version
cargo --version
```

Ar trebui să vezi `rustc 1.88.0` sau mai mare și o linie de versiune `cargo`. Dacă ai deja Rust, `rustup update` îl aduce la zi.

### Java 21 și Maven (doar pentru tutorialul Java) {#java}

Aplicația Tip Jar are nevoie de un JDK Java 21 sau mai nou (instrumentele pentru compilarea și rularea programelor Java) și de Maven, instrumentul de compilare care descarcă bibliotecile Java.

| Sistem | Instalare |
| --- | --- |
| macOS | `brew install --cask temurin@21` apoi `brew install maven` (sau folosește instalatorul de pe [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, apoi descarcă Maven de pe [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi), dezarhiveaz-o și adaugă folderul ei `bin` în `PATH`. Varianta mai simplă: instalează WSL (vezi mai jos) și urmează linia pentru Linux. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Verifică-le:

```bash
java -version
mvn -version
```

Ar trebui să vezi `openjdk version "21` (sau un număr mai mare, cum ar fi 25) și `Apache Maven 3.` urmat de o versiune. Dacă `java -version` arată 17 sau mai puțin, instalează Java 21 și deschide un terminal nou.

### Python 3.10 sau mai nou, cu venv (doar pentru tutorialul Python) {#python}

Python rulează aplicația Airdrop. `venv` creează un folder privat pentru bibliotecile ei, astfel încât nimic altceva de pe calculator nu este atins.

| Sistem | Instalare |
| --- | --- |
| macOS | `brew install python`, sau descarcă de pe [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`, sau descarcă de pe [python.org](https://www.python.org/downloads/) și bifează **Add python.exe to PATH** în instalator |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Verifică:

```bash
python3 --version
```

Ar trebui să vezi `Python 3.10.0` sau mai mare. Pe Windows, scrie în schimb `python --version` (comanda este `python`, nu `python3`).

### Windows și comenzile Linux: WSL {#wsl}

Majoritatea comenzilor din tutoriale sunt aceleași pe orice sistem. Câteva folosesc funcții ale shell-ului Linux: `source`, `chmod`, `./tipjar` și `sleep`. Pe Windows ai două variante:

1. **Windows nativ.** Folosește PowerShell pentru tutorialele TypeScript, Rust și Python. Tutorialele dau varianta pentru Windows acolo unde diferă, de exemplu `.venv\Scripts\activate`. Pentru tutorialul Java, folosește **Git Bash** (instalat odată cu Git).
2. **WSL.** Windows Subsystem for Linux îți oferă un Linux real în interiorul Windows. Deschide PowerShell ca administrator, rulează comanda de mai jos, repornește calculatorul, apoi urmează liniile pentru **Linux** de pe această pagină în fereastra Ubuntu.

```powershell
wsl --install
```

| Parte | Ce face |
| --- | --- |
| `wsl` | Instrumentul Windows Subsystem for Linux. |
| `--install` | Instalează WSL și sistemul Linux Ubuntu dintr-o singură mișcare. |

## Verifică totul dintr-o dată {#check-all}

Rulează comenzile pentru instrumentele pe care le-ai instalat. Fiecare trebuie să afișeze o versiune.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Verificare | Răspuns bun |
| --- | --- |
| `node -v` | `v22.13.0` sau mai mare |
| `pnpm -v` | `9.0.0` sau mai mare |
| `rustc --version` | `rustc 1.88.0` sau mai mare |
| `java -version` | `21` sau mai mare |
| `mvn -version` | `Apache Maven 3.` și o versiune |
| `python3 --version` | `Python 3.10.0` sau mai mare |

## Obține un portofel de testnet {#wallet}

Ai nevoie de un loc în care să ții QOR de test. Unele tutoriale creează pentru tine un cont de unică folosință, într-un fișier. Altele folosesc portofelul **QoreX**, portofelul oficial QoreChain, trecut pe testnet. Tabelul din [Ce instrumente are nevoie fiecare tutorial?](#which-tools) spune care este cazul.

### QoreX pe testnet {#qorex}

1. Instalează QoreX din lista oficială: [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) pentru iPhone, [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) pentru Android, [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) pentru Chrome, Brave, Edge, Arc și Opera, sau [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). Lista completă este în [Prezentarea QoreX](/qorex/overview).
2. Creează un portofel **nou** și salvează fraza de recuperare pe hârtie. Nu importa o frază care conține fonduri reale.
3. Treci portofelul pe testnet:
   - **Aplicația de telefon:** deschide **Settings**, apoi activează **Use testnet (developers)**.
   - **Extensia de browser:** deblochează-o, apoi atinge de 7 ori **numărul versiunii din partea de jos**. Apare o opțiune pentru dezvoltatori. Alege **Switch to testnet (diana)**.
4. Verifică dacă apare insigna de testnet. Testnet-ul se numește `qorechain-diana`.

**Ce ar trebui să vezi:** o insignă de testnet în portofel și o adresă `qor1...` pe ecranul principal. Soldurile de pe testnet nu arată nicio valoare în dolari, și este corect așa.

### Adaugă un cont Ethereum (coin 60) {#coin-60}

Tutorialul Guestbook folosește lane-ul EVM, deci portofelul are nevoie de un cont de tip Ethereum.

1. În QoreX, deschide lista de conturi și alege **Add an Ethereum account (coin 60)**.
2. Creează unul nou. Nu restaura o frază care conține fonduri reale.
3. Selectează acel cont. Afișează o adresă `0x...`.

**Ce ar trebui să vezi:** un cont etichetat *Ethereum, coin 60*, cu o adresă care începe cu `0x`. Același cont are și o adresă `qor1...`.

Mai multe despre conturi: [Contul QoreX și Dashboard](/qorex/account-and-dashboard) și [Primii pași cu QoreX](/qorex/getting-started).

## Obține QOR de test de la faucet {#faucet}

Faucet-ul oferă QOR de test gratuit unei adrese de testnet. Un cont nou trebuie să primească ceva înainte de a putea face orice, pentru că fiecare tranzacție plătește o mică taxă de rețea.

1. Deschide [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) în browser.
2. Autentifică-te în Dashboard-ul QoreChain.
3. Lipește adresa ta `qor1...` în câmpul pentru adresă.
4. Selectează **Request Tokens**.
5. Așteaptă mesajul **Tokens Sent!**.

**Ce ar trebui să vezi:** cardul **Tokens Sent!** cu 100 QOR și un link **View on Explorer**.

Faucet-ul oferă **100 QOR o singură dată la 24 de ore, per cont** și per adresă. Dacă ceri din nou prea devreme, afișează **Rate Limit Reached**. Așteaptă să treacă cele 24 de ore. O singură cerere este suficientă pentru toate tutorialele de pe această pagină.

### Prima ta tranzacție înregistrează cheia ta post-cuantică {#first-tx}

Fiecare cont QoreChain are două chei: o cheie clasică și o cheie post-cuantică ML-DSA-87. Chiar prima tranzacție a unui cont nou **înregistrează pe lanț cheia ML-DSA-87**. Se face o singură dată, pentru fiecare cont, și costă cam **0.09 QOR**. După aceea, fiecare tranzacție este semnată cu ambele chei.

Tutorialele rulează acest pas pentru tine, cu o comandă numită `register`. Acum nu trebuie să faci nimic. Cei 100 QOR de la faucet o acoperă de multe ori.

## QOR și uqor {#units}

Vei vedea două nume pentru aceeași monedă. **QOR** este moneda întreagă. **uqor** este cea mai mică bucată.

**1 QOR = 1,000,000 uqor.**

| Ce vezi | Ce înseamnă |
| --- | --- |
| `1` QOR | 1,000,000 uqor |
| `0.1` QOR | 100,000 uqor |
| `0.09` QOR | 90,000 uqor |
| `0.15uqor` | Un preț de 0.15 uqor pentru fiecare unitate de gaz, folosit când plătești o taxă |

Portofelele și majoritatea comenzilor folosesc QOR. Lanțul în sine numără în uqor. Un **memo** este o scurtă bucată de text pe care o atașezi unei tranzacții, de exemplu `Hello from the workshop`. Oricine îl poate citi pe lanț, așa că nu pune niciodată un secret într-un memo.

**Gazul** măsoară cât de multă muncă cere o tranzacție rețelei. Taxa este gazul folosit înmulțit cu prețul gazului. Instrumentele din această secțiune estimează gazul pentru tine, deci nu calculezi nimic.

## Păstrează în siguranță cheile tale de unică folosință {#key-hygiene}

Un tutorial creează un secret pentru contul tău de testnet și îl stochează pe calculatorul tău. Tratează-l cu grijă, chiar dacă QOR de test nu are valoare, ca să prinzi obiceiul înainte de mainnet.

1. **Unde se află.** În tutorialele TypeScript, secretele ajung într-un fișier numit `.env`, în folderul proiectului. Aplicațiile Rust, Java și Python scriu un fișier de chei cu comanda `new`, într-un folder ascuns numit `.config/qday`, în folderul tău personal. Tutorialul indică fișierul exact.
2. **Nu îl da nimănui.** Nu îl lipi într-un chat, într-un email, într-o captură de ecran sau într-un video. Ascunde fișierul când îți partajezi ecranul.
3. **Nu îl trimite în Git.** Nu adăuga `.env` sau un fișier de chei în Git și nu le trimite niciodată pe GitHub. Adaugă `.env` în `.gitignore` dacă un proiect nu îl ignoră deja.
4. **Doar pe testnet.** Nu refolosi niciodată o cheie de testnet, o frază de recuperare sau un cod de recuperare pe mainnet.
5. **Șterge-l când termini.** După ce ai terminat un tutorial, șterge fișierul de chei sau `.env`. Poți oricând să faci un cont nou într-un minut.

:::danger Fonduri reale
Nu pune niciodată cheia, mnemonicul (fraza de recuperare) sau codul de recuperare al unui cont care deține fonduri reale într-un fișier `.env`, într-un fișier de chei sau în vreo comandă din această secțiune.
:::

## Rețeaua și punctele finale publice {#network}

| Serviciu | Valoare |
| --- | --- |
| Numele testnet-ului | `qorechain-diana` |
| EVM chain ID | 9800 |
| REST (citești date prin web) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | [explore.qore.network](https://explore.qore.network), apoi treci pe **Testnet** |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `pnpm: command not found` | pnpm nu este instalat. Node.js nu îl include, nici când este instalat cu Homebrew. | Rulează `npm install -g pnpm`, deschide un terminal nou și rulează `pnpm -v`. |
| `node: command not found`, sau o versiune veche după instalare | Terminalul era deschis în timpul instalării, sau versiunea veche are prioritate. | Închide terminalul, deschide unul nou, rulează `node -v`. Pe Linux folosește linia NodeSource, nu pachetul apt implicit. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js este mai vechi de 22.13. | Instalează Node.js 22.13 sau mai nou, apoi rulează din nou `pnpm install` în proiect. |
| `EACCES` sau permission denied în timpul `npm install -g pnpm` | Utilizatorul tău nu poate scrie în folderul global. | Rulează `sudo npm install -g pnpm` pe macOS și Linux. |
| `rustc: command not found` după instalarea Rust | Terminalul nu cunoaște încă noul `PATH`. | Deschide un terminal nou. Dacă tot nu merge, rulează `source "$HOME/.cargo/env"`. |
| `linker 'cc' not found` sau `link.exe not found` la compilarea Rust | Lipsesc instrumentele compilatorului C. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: instalează Visual Studio C++ Build Tools. |
| `java -version` arată 17 sau mai puțin | O versiune mai veche de Java are prioritate. | Instalează Java 21, deschide un terminal nou, verifică din nou. |
| PowerShell spune că rularea scripturilor este dezactivată când activezi venv-ul Python | Windows blochează scripturile implicit. | Rulează `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, răspunde `Y`, apoi activează din nou. |
| `Rate Limit Reached` la faucet | Faucet-ul plătește o dată la 24 de ore, per cont și per adresă. | Așteaptă să treacă cele 24 de ore. O singură cerere este suficientă pentru toate tutorialele. |
| Portofelul nu arată insigna de testnet | Portofelul este încă pe mainnet. | Aplicația de telefon: Settings, apoi **Use testnet (developers)**. Extensia: atinge de 7 ori numărul versiunii, apoi **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | Contul nou nu și-a înregistrat încă cheia ML-DSA-87. | Rulează mai întâi pasul `register` al tutorialului (este prima tranzacție a contului). |
| Erori CORS în consola browserului | Punctul final REST public nu trimite antete CORS, deci o pagină web nu îl poate apela direct. | Apelează punctul final prin proxy-ul `/lcd` al proiectului, așa cum face șablonul. |

## Pasul următor {#next}

Alege un tutorial din [prezentare](/build-before-qday/overview#choose) și urmează-l de la prima comandă.
