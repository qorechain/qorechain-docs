---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Aplicație Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Aplicație Rust: qday-pay

**qday-pay** este un mic program Rust pe care îl rulezi într-un terminal. Plătește QOR de testnet pe testnet-ul QoreChain `qorechain-diana` cu o **semnătură hibridă**: o semnătură clasică secp256k1 plus o semnătură post-cuantică ML-DSA-87 (NIST FIPS 204). După plată, citește tranzacția înapoi de pe lanț și îți arată dovada lanțului însuși că ambele semnături au fost verificate.

**Cât durează:** aproximativ 15 minute în total. Prima compilare descarcă și compilează bibliotecile și durează 2 până la 5 minute. După aceea, fiecare comandă rulează în câteva secunde.

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă din Rust** cu crate-ul publicat `qorechain-sdk` (versiunea 0.13, folosit în cod sub numele `qorechain`).
- **Înregistrarea unică** a cheii tale post-cuantice pe lanț.
- **Un raport de verificare** pentru orice tranzacție: semnătura clasică de 64 de octeți, semnătura ML-DSA-87 de 4.627 de octeți și verdictul `pqc_hybrid_verify` de la lanț.

De ce contează: o semnătură clasică singură se așteaptă să poată fi spartă de un viitor calculator cuantic. O semnătură hibridă rămâne sigură atât timp cât una dintre cele două jumătăți rezistă. Vezi [Tranzacții rezistente la calculatoare cuantice](/sdk/guides/quantum-safe).

## Pas cu pas {#run}

Lucrezi în propriul terminal. Folosești doar un cont de testnet de unică folosință. QOR de testnet nu are valoare. Nu folosi niciodată aici un portofel real sau fonduri reale.

:::note Windows
qday-pay folosește permisiunile de fișiere din Linux și macOS pentru fișierul său de chei, așa că pe Windows îl rulezi în **WSL** (Windows Subsystem for Linux). WSL îți oferă un terminal Linux în interiorul Windows. Tot ce urmează respectă apoi instrucțiunile pentru Linux.
:::

### 1. Înainte să începi: instalează uneltele {#install}

Ai nevoie de trei unelte: **Git** (descarcă codul), **Rust** (construiește programul) și un **compilator C** (Rust are nevoie de unul ca să lege programul). Java, Node.js și Python nu sunt necesare pentru această aplicație.

**macOS**

| Unealtă | Cum se instalează | Verifică |
| --- | --- | --- |
| Compilator C și Git | `xcode-select --install` (se deschide o fereastră, apasă Install) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (apasă Enter pentru a accepta varianta implicită), apoi închide și redeschide terminalul | `rustc --version` și `cargo --version` |

**Linux (Debian sau Ubuntu; alte distribuții folosesc propriul manager de pachete)**

| Unealtă | Cum se instalează | Verifică |
| --- | --- | --- |
| Git și compilator C | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (apasă Enter pentru a accepta varianta implicită), apoi închide și redeschide terminalul | `rustc --version` și `cargo --version` |

**Windows (prin WSL)**

1. Deschide PowerShell ca administrator și rulează `wsl --install`. Repornește calculatorul când ți se cere. Windows instalează Ubuntu. Deschide aplicația **Ubuntu** din meniul Start.
2. În terminalul Ubuntu, urmează tabelul **Linux** de mai sus.
3. Git pentru Windows (https://git-scm.com/download/win) nu este necesar, deoarece Git vine odată cu comanda Linux de mai sus.

Este necesar Rust 1.74 sau mai nou. Comanda `rustup` instalează cea mai recentă versiune, ceea ce este în regulă. Verificarea versiunii ar trebui să afișeze ceva de genul `rustc 1.80.0` sau un număr mai mare.

**Ce ar trebui să vezi:** `git --version`, `rustc --version` și `cargo --version` afișează fiecare un număr de versiune. Dacă o comandă spune `command not found`, închide terminalul, deschide unul nou și încearcă din nou.

### 2. Înainte să începi: ia un portofel de testnet și faucet-ul {#wallet}

Această aplicație își creează propriul cont de testnet (pasul 5), deci nu trebuie să instalezi un portofel ca să o rulezi. Ai nevoie doar de o modalitate de a primi QOR de testnet gratuit. Faucet-ul este un site care trimite QOR de testnet gratuit către o adresă.

Dacă vrei să-ți vezi contul și în portofelul QoreX, folosește **QoreX pe testnet** cu un cont de unică folosință:

- **Aplicația QoreX:** deschide Setări și activează **Use testnet (developers)**.
- **Extensia de browser QoreX:** deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.

Nu ai nevoie de niciun cont Ethereum pentru această aplicație. Ea folosește tipul de cont QoreChain Native (o adresă `qor1...`).

**Faucet:** https://dashboard.qorechain.io/faucet. Autentifică-te, lipește adresa și cere fonduri. Faucet-ul oferă **100 QOR la fiecare 24 de ore pentru fiecare cont**.

**Bine de știut:** prima tranzacție a unui cont nou înregistrează pe lanț cheia sa post-cuantică ML-DSA-87. Este o taxă unică de aproximativ 0,09 QOR. qday-pay face acest lucru la pasul 7.

**Sume:** unitatea pe care o citești este **QOR**. Lanțul numără în **uqor**, cea mai mică unitate. 1 QOR = 1.000.000 uqor. Scrii sumele în QOR (de exemplu `1`), iar programul le convertește pentru tine.

### 3. Ia codul {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**Ce face**

| Parte | Ce înseamnă |
| --- | --- |
| `git clone <adresă>` | Descarcă de pe GitHub o copie completă a aplicațiilor-exemplu într-un folder nou numit `build-before-qday`. |
| `cd <folder>` | Mută terminalul în folderul aplicației Rust. Toate comenzile următoare se rulează de aici. |

**Ce ar trebui să vezi:** `Cloning into 'build-before-qday'...`, apoi promptul tău în folderul `04-rust-qday-pay`. Rulează `ls` ca să verifici: vezi `Cargo.toml`, `Cargo.lock`, `README.md` și `src`.

### 4. Construiește programul {#build}

```bash
cargo build --release
```

**Ce face:** `cargo` este unealta de construire a lui Rust. Această comandă descarcă bibliotecile listate în `Cargo.toml` și compilează programul într-un singur fișier.

| Parte | Ce înseamnă |
| --- | --- |
| `build` | Compilează programul (nu îl rula încă). |
| `--release` | Construiește versiunea rapidă, optimizată. Fără acest flag primești o versiune de depanare, mai lentă, într-un alt folder. |

**Cât durează:** 2 până la 5 minute prima dată, câteva secunde după aceea.

**Ce ar trebui să vezi:** multe linii `Compiling ...`, apoi `Finished release profile [optimized] target(s)`. Programul este acum fișierul `./target/release/qday-pay`.

Verifică dacă rulează:

```bash
./target/release/qday-pay
```

**Ce face:** rulează programul fără nicio comandă. Afișează ajutorul și nu schimbă nimic.

**Ce ar trebui să vezi:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

Cele cinci linii sunt cele cinci comenzi pe care le folosești mai jos. În restul acestei pagini, `<command>` înseamnă `./target/release/qday-pay <command>`.

### 5. Creează un cont de testnet de unică folosință {#new-account}

```bash
./target/release/qday-pay new
```

**Ce face:** creează un cont de testnet complet nou. Generează o frază de recuperare secretă (mnemonicul) și o salvează într-un **fișier de chei**. Din acea singură frază derivă ambele chei ale tale, cheia clasică secp256k1 și cheia post-cuantică ML-DSA-87. Fraza nu este niciodată afișată pe ecran.

| Parte | Ce înseamnă |
| --- | --- |
| `new` | Comanda: creează un cont și un fișier de chei. Refuză să suprascrie un fișier de chei care există deja, deci nu poate distruge din greșeală un cont cu fonduri. |

**Unde este fișierul de chei:** `~/.config/qday/rust.env`. Simbolul `~` este folderul tău personal (home). Fișierul poate fi citit doar de tine (mod 0600). Poți folosi alt loc setând `QDAY_KEY_FILE`, de exemplu `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. Dacă faci asta, setează aceeași variabilă în fața fiecărei comenzi următoare.

:::warning Ține fișierul de chei privat
Fișierul de chei este cheia contului. Nu-l partaja niciodată, nu-l lipi într-un chat sau într-o captură de ecran și nu-l adăuga niciodată în Git. Folosește acest cont doar pentru atelier și niciodată pe mainnet. Când termini, șterge fișierul.
:::

**Ce ar trebui să vezi:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

Copiază adresa `qor1...`.

### 6. Alimentează contul de la faucet {#faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și cere fonduri. Primești 100 QOR.
3. Așteaptă aproximativ 10 secunde, până apare blocul care conține plata.

Contul trebuie să existe pe lanț înainte să poți înregistra o cheie, iar plata de la faucet este cea care îl creează.

### 7. Verifică contul {#status}

```bash
./target/release/qday-pay status
```

**Ce face:** citește contul tău de pe testnet și afișează un rezumat. Nu trimite nimic.

**Ce ar trebui să vezi:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Linie | Ce înseamnă |
| --- | --- |
| `network` | Lanțul cu care vorbește programul. Funcționează doar pe testnet-ul `qorechain-diana` și refuză orice altă rețea. |
| `balance` | QOR-ul tău disponibil pentru cheltuit. |
| `ML-DSA-87` | Dacă cheia ta post-cuantică este înregistrată pe lanț. |
| `block` | Cea mai recentă înălțime de bloc. Tot crește. |

### 8. Înregistrează cheia post-cuantică {#register}

```bash
./target/release/qday-pay register
```

**Ce face:** trimite o tranzacție care îi spune lanțului cheia ta publică ML-DSA-87, împreună cu o **dovadă de posesie** (o dovadă că deții într-adevăr cheia secretă corespunzătoare). Lanțul stochează cheia și, de acum înainte, poate verifica semnăturile tale post-cuantice. Costă o taxă unică de aproximativ 0,09 QOR. Îl poți rula din nou în siguranță: dacă cheia este deja înregistrată, nu face nimic.

| Parte | Ce înseamnă |
| --- | --- |
| `register` | Comanda: înregistrează o singură dată cheia ta ML-DSA-87. |

**Ce ar trebui să vezi:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Trimite o plată semnată hibrid {#send}

Înlocuiește `qor1...` cu o adresă de testnet. Poți plăti propria ta adresă sau adresa de testnet a unui prieten.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**Ce face:** construiește o plată, o semnează de două ori (secp256k1 și ML-DSA-87), verifică costul de gas, o trimite, așteaptă până ajunge într-un bloc și apoi rulează pentru tine verificarea de la pasul 10.

| Parte | Ce înseamnă |
| --- | --- |
| `send` | Comanda: plătește QOR către o altă adresă. |
| `qor1...` (prima valoare) | Destinatarul. Trebuie să fie o adresă `qor1`, altfel programul se oprește cu `not a qor1 address`. |
| `1` (a doua valoare) | Suma în QOR. `1` înseamnă 1 QOR, adică 1.000.000 uqor. Poți folosi zecimale, de exemplu `0.5`. |
| `--memo "text"` | Opțional. Un memo este un text scurt atașat tranzacției și stocat pe lanț. Pune-l între ghilimele când are spații. Oricine îl poate citi, așa că nu scrie nimic privat. |

Opțiunea `--memo` vine după destinatar și sumă, ca în exemplu.

**Ce ar trebui să vezi:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

`fee` este afișat în uqor și este cu mult sub 1 QOR. Programul afișează și un link `explorer` și o linie `chain says` (pasul 10). Copiază hash-ul tranzacției.

### 10. Verifică orice tranzacție {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**Ce face:** citește tranzacția de pe lanț și verifică trei lucruri, fără să trimită nimic.

| Parte | Ce înseamnă |
| --- | --- |
| `verify` | Comanda: afișează raportul de verificare. |
| `<TX_HASH>` | Hash-ul de 64 de caractere al tranzacției. Lipește hash-ul de la pasul 9. Funcționează pentru orice tranzacție de testnet. |

Verificările:

1. Tranzacția a reușit (cod de rezultat 0).
2. Lanțul a emis evenimentul `pqc_hybrid_verify` cu `status=verified`. Acesta este lanțul care spune că a verificat semnătura post-cuantică.
3. Tranzacția poartă o extensie `PQCHybridSignature` cu o semnătură ML-DSA-87 de 4.627 de octeți, lângă semnătura secp256k1 de 64 de octeți.

**Ce ar trebui să vezi:** același raport ca la pasul 9, încheiat cu `VERIFIED: secp256k1 + ML-DSA-87`. Dacă o verificare eșuează, raportul spune `NOT VERIFIED as hybrid`, iar programul se închide cu codul 2.

### 11. Verific-o și într-un al doilea mod, fără programul nostru {#verify-curl}

Poți întreba direct lanțul. Ai nevoie doar de `curl`, inclus în macOS și în majoritatea sistemelor Linux. Unealta `jq` (opțională) face răspunsul mai ușor de citit. Instaleaz-o cu `brew install jq` pe macOS sau `sudo apt install -y jq` pe Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parte | Ce înseamnă |
| --- | --- |
| `curl -s <adresă>` | Descarcă răspunsul de la serviciul REST de testnet. `-s` ascunde bara de progres. |
| `<HASH>` | Hash-ul tranzacției tale. |
| `\| jq '...'` | Extrage trei valori. Fără `jq`, renunță la această parte și citește textul complet. |

**Ce ar trebui să vezi:**

- `"code": 0` în răspuns (tranzacția a reușit). În rezultatul `jq`, prima linie este `0`.
- O extensie `PQCHybridSignature` (tip `/qorechain.pqc.v1.PQCHybridSignature`) care conține semnătura ML-DSA-87. Lungimea textului base64 este de 6.172 de caractere, adică 4.627 de octeți.
- În `tx_response.events`, un eveniment de tip `pqc_hybrid_verify` cu atributul `status` setat la `verified`.

**În explorer:** deschide https://explore.qore.network, comută-l pe **Testnet** și caută hash-ul tranzacției tale. Programul afișează și un link direct.

### 12. Curăță {#cleanup}

Când ai terminat, șterge fișierul de chei de unică folosință:

```bash
rm ~/.config/qday/rust.env
```

`rm` șterge un fișier. Rulează-l doar pentru o cheie de testnet de care nu mai ai nevoie.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `command not found: cargo` sau `rustc` | Rust nu este instalat sau terminalul a fost deschis înainte de instalare. | Instalează Rust (pasul 1), apoi închide și redeschide terminalul. |
| `linker 'cc' not found` sau `linking with cc failed` | Nu există compilator C. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | Nu există fișier de chei în acel loc. | Rulează `./target/release/qday-pay new` sau setează același `QDAY_KEY_FILE` ca mai înainte. |
| `cannot create ... it may already exist` | Există deja un fișier de chei. Programul nu suprascrie niciodată unul. | Continuă să-l folosești sau șterge-l cu `rm` dacă nu conține nimic de care ai nevoie, apoi rulează din nou `new`. |
| `account qor1... not found on chain yet; fund it first` | Contul nu are încă QOR, deci nu există pe lanț. | Cere QOR de la faucet (pasul 6), așteaptă aproximativ 10 secunde și încearcă din nou. |
| Faucet-ul spune că ai atins o limită de cereri | Faucet-ul acceptă o cerere la 24 de ore pentru fiecare cont. | Așteaptă 24 de ore sau folosește un al doilea cont de unică folosință. |
| `account has no PQC key and classical fallback is disabled` | Ai trimis o plată înainte să înregistrezi cheia post-cuantică. | Rulează `./target/release/qday-pay register`, apoi trimite din nou. |
| `not a qor1 address` | Destinatarul este greșit, de exemplu o adresă `0x...`. | Folosește o adresă `qor1...`. |
| `transport error` sau `error sending request` | Nu ai internet sau testnet-ul este scurt timp inaccesibil. | Verifică conexiunea și încearcă din nou peste un minut. |
| `NOT VERIFIED as hybrid` | Tranzacția a eșuat sau nu a fost semnată hibrid. | Citește `code` din raport. Trimite o plată nouă cu acest program. |
| `pnpm: command not found` | Ai încercat o aplicație JavaScript. Această aplicație Rust nu are nevoie de pnpm. | Ignoră mesajul aici. Pentru aplicațiile JavaScript, rulează `npm install -g pnpm`. |
| `EVM authorisation window exhausted` | Aparține aplicației Hardhat, nu acesteia. | În acea aplicație, deschide o fereastră nouă cu `pnpm window open`. |
| Erori CORS | Aparțin aplicațiilor din browser. Această aplicație în linie de comandă nu le are. | Într-o aplicație din browser, folosește proxy-ul `/lcd` al șablonului. |

## Contul {#account}

Contul este un cont QoreChain Native secp256k1 (coin type 118, calea `m/44'/118'/0'/0/0`, o adresă `qor1...`). Cheia ML-DSA-87 provine din aceeași frază de recuperare, prin regula canonică a SDK-ului, legată de adresă (`authenticator::try_derive_pqc_canonical`). O singură frază de recuperare le restaurează pe amândouă.

## Codul SDK care contează {#code}

Acesta este nucleul comenzii `send` din `src/main.rs`:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Înregistrarea este un singur apel: `PqcDx::ensure_pqc_registered()`. Trimite `MsgRegisterPQCKeyV2` cu o dovadă de posesie doar atunci când nu este încă înregistrată nicio cheie.

## Cum se decide "verificat" {#verified}

`verify` citește `GET /cosmos/tx/v1beta1/txs/{hash}` și verifică:

- tranzacția a reușit (`code 0`);
- lanțul a emis `pqc_hybrid_verify` cu `status=verified` pentru semnatar;
- corpul tranzacției poartă o extensie `/qorechain.pqc.v1.PQCHybridSignature` cu o semnătură ML-DSA-87 de 4.627 de octeți (lângă semnătura secp256k1 de 64 de octeți).

## Ce ar trebui să vezi {#output}

- `new` afișează o adresă `qor1...` și locul fișierului de chei, niciodată fraza de recuperare.
- `status` arată soldul și dacă cheia ML-DSA-87 este înregistrată.
- `send` se încheie cu `VERIFIED: secp256k1 + ML-DSA-87` și un link către explorer.
- Pe https://explore.qore.network (comutat pe Testnet) tranzacția apare sub hash-ul ei.

## Puncte de acces la rețea {#access}

| | |
| --- | --- |
| ID de lanț Cosmos | `qorechain-diana` (doar testnet) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorer | https://explore.qore.network (comută pe Testnet) |

## Pachete folosite {#packages}

| Crate | Versiune | Folosit pentru |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Conturi, semnare hibridă, client REST, ajutoare de verificare |
| `tokio` | 1 | Runtime asincron |
| `serde_json` | 1 | Citirea răspunsurilor JSON ale lanțului |
| `base64` | 0.22 | Măsurarea dimensiunilor semnăturilor |
| `cosmrs` | 0.22 | Tipul de mesaj `Coin` |

## Cod sursă {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
