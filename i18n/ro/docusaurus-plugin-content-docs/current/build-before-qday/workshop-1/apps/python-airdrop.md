---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Aplicație Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Aplicație Python: Q-Day Airdrop

**Q-Day Airdrop** este o mică unealtă Python care trimite QOR de testnet către o listă întreagă de adrese într-o **singură** tranzacție. Tranzacția este semnată cu o cheie clasică secp256k1 și cu o cheie post-cuantică ML-DSA-87 (FIPS 204). Apoi unealta dovedește, din înregistrarea lanțului însuși, că ambele semnături au fost verificate. Rulează pe testnet-ul QoreChain (`qorechain-diana`, ID de lanț EVM 9800).

**Cât durează:** aproximativ 20 de minute prima dată (10 minute de instalat unelte, 5 minute de configurare, 5 minute de trimis și verificat).

Nu trebuie să știi Python. Scrii doar comenzile de mai jos, una câte una, și compari rezultatul cu "Ce ar trebui să vezi".

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1** din Python.
- **O tranzacție semnată hibrid, verificată pe lanț**, care plătește mulți destinatari deodată cu un singur mesaj multi-send.
- **Un raport de verificare** construit din înregistrarea tranzacției de pe lanț, nu din cuvântul uneltei.

De ce contează: o singură semnătură protejează un airdrop întreg și rămâne protejată împotriva unui viitor calculator cuantic, deoarece jumătatea ML-DSA-87 este post-cuantică. Vezi [Tranzacții rezistente la calculatoare cuantice](/sdk/guides/quantum-safe).

:::warning Doar testnet
Folosește doar un cont de testnet de unică folosință. QOR de testnet nu are valoare. Nu folosi niciodată în acest tutorial portofelul tău real, fraza ta reală de recuperare sau fonduri reale.
:::

## Cuvinte pe care le vei întâlni {#words}

| Cuvânt | Ce înseamnă |
| --- | --- |
| Testnet | O copie de exercițiu a QoreChain. Monedele de pe ea sunt gratuite și nu valorează nimic. |
| QOR și uqor | Două nume pentru aceeași monedă. 1 QOR = 1.000.000 uqor. Unealta cere QOR. Taxele sunt afișate în uqor. |
| Memo | Un text scurt atașat unei tranzacții, ca o mențiune la un transfer bancar. |
| Adresă | Numărul tău public de cont. Pe QoreChain începe cu `qor1`. Poate fi partajată în siguranță. |
| Fișier de chei | Un fișier cu fraza ta secretă de recuperare. Nu-l partaja niciodată. |
| Faucet | Un site care oferă QOR de testnet gratuit. |
| Hash | ID-ul unic al unei tranzacții. Îl folosești ca să cauți tranzacția. |

## Înainte să începi {#before}

Ai nevoie de **Git** (descarcă codul) și de **Python 3.10 sau mai nou** cu `venv` (un folder privat pentru bibliotecile uneltei). După fiecare instalare, **închide terminalul și deschide unul nou**, apoi rulează comanda de verificare.

| Unealtă | macOS | Windows | Linux (Debian sau Ubuntu) | Verifică |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew de la https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (bifează "Add python.exe to PATH" în instalator) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (pe Windows: `python --version`) |

Pe Windows, folosește PowerShell sau Git Bash. Unde această pagină spune `python3`, Windows folosește de obicei `python`. Restul este la fel, cu excepția liniei care pornește mediul virtual (pasul 3).

## Ia un portofel de testnet și QOR gratuit {#wallet}

Unealta își face propria cheie de unică folosință (pasul 4 de mai jos), deci nu ai nevoie de o aplicație de portofel pentru acest tutorial. Dacă vrei să-ți vezi contul și în QoreX:

1. **Aplicația QoreX:** deschide Setări, apoi activează **Use testnet (developers)**.
2. **Extensia de browser QoreX:** deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.

QOR-ul gratuit vine de la faucet, la https://dashboard.qorechain.io/faucet. Te autentifici, lipești adresa și ceri fonduri. Faucet-ul oferă **100 QOR la fiecare 24 de ore pentru fiecare cont**.

Prima tranzacție a unui cont nou înregistrează pe lanț cheia sa post-cuantică ML-DSA-87. Este un pas unic, cu o taxă de aproximativ 0,09 QOR. Unealta îl face pentru tine cu comanda `register`.

## Pas cu pas {#run}

### 1. Descarcă codul {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**Ce face**

- `git clone <adresă>`: copiază proiectul de pe GitHub într-un folder nou numit `build-before-qday`.
- `cd <folder>`: mută terminalul în folderul aplicației Python. Fiecare comandă următoare trebuie rulată din acest folder.

**Ce ar trebui să vezi:** linii precum `Cloning into 'build-before-qday'...`, apoi promptul tău în folderul nou.

### 2. Creează un mediu Python privat {#venv}

```bash
python3 -m venv .venv
```

**Ce face:** creează un folder numit `.venv` care ține bibliotecile acestei unelte, ca să nu se amestece cu nimic altceva de pe calculatorul tău.

| Parte | Ce înseamnă |
| --- | --- |
| `python3` | Programul Python. |
| `-m venv` | Rulează generatorul de "medii virtuale" încorporat în Python. |
| `.venv` | Numele folderului de creat. |

**Ce ar trebui să vezi:** nimic afișat și un folder nou `.venv`.

### 3. Pornește-l și instalează bibliotecile {#deps}

```bash
source .venv/bin/activate
```

Pe Windows PowerShell folosește în schimb `.venv\Scripts\activate` (dacă PowerShell îl blochează, rulează `Set-ExecutionPolicy -Scope Process RemoteSigned` și încearcă din nou). În Windows Command Prompt folosește `.venv\Scripts\activate.bat`.

**Ce face:** comută terminalul tău pe mediul privat.

**Ce ar trebui să vezi:** `(.venv)` la începutul promptului. Pornește-l din nou cu aceeași comandă în fiecare terminal nou.

```bash
pip install -r requirements.txt
```

| Parte | Ce înseamnă |
| --- | --- |
| `pip` | Instalatorul de biblioteci al lui Python. |
| `install` | Descarcă și instalează biblioteci. |
| `-r requirements.txt` | Citește lista de biblioteci din acest fișier. Numește o singură bibliotecă, `qorechain-sdk==0.13.0` (SDK-ul QoreChain, exact versiunea 0.13.0), plus ce are ea nevoie. |

**Ce ar trebui să vezi:** linii de descărcare care se încheie cu `Successfully installed ... qorechain-sdk-0.13.0`. Un mesaj că este disponibil un pip nou este inofensiv.

**Cât durează:** de la aproximativ 15 secunde la 1 minut.

Acum verifică dacă unealta pornește:

```bash
python airdrop.py --help
```

**Ce ar trebui să vezi:** comenzile `new`, `status`, `register`, `drop` și `verify`.

### 4. Creează-ți contul de testnet de unică folosință {#key}

```bash
python airdrop.py new
```

**Ce face:** creează un cont nou. Scrie o frază secretă de recuperare în fișierul de chei `~/.config/qday/python.env` (în folderul tău personal, care poate fi citit doar de tine) și afișează doar adresa publică.

| Parte | Ce înseamnă |
| --- | --- |
| `new` | Creează un fișier de chei nou și afișează adresa lui. |
| `new --force` | Înlocuiește un fișier de chei existent. Cheia veche se pierde. |

**Ce ar trebui să vezi:** `New testnet wallet`, o `address` care începe cu `qor1...`, calea fișierului de chei cu `(mode 600, mnemonic not shown)` și un indiciu pentru pasul următor.

**Copiază adresa `qor1...`.** Dacă o pierzi, `python airdrop.py status` o afișează din nou. Nu partaja niciodată fișierul de chei, nu-l adăuga în Git și nu-l reutiliza pe mainnet.

Ca să ții cheia în alt loc, pune `--key-file` **înaintea** numelui comenzii:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <cale>` înseamnă "folosește acest fișier de chei în loc de cel implicit". Ordinea contează: `--key-file` vine înaintea lui `status`, `drop` și a celorlalte comenzi. Poți seta în schimb și variabila de mediu `QORE_KEY_FILE`.

### 5. Ia QOR de testnet de la faucet {#faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și apasă butonul de cerere.
3. Așteaptă câteva secunde, apoi rulează:

```bash
python airdrop.py status
```

**Ce face:** întreabă testnet-ul care este soldul tău și dacă cheia ta post-cuantică este înregistrată.

**Ce ar trebui să vezi:** soldul tău (aproximativ 100 QOR) și un avertisment că cheia ML-DSA-87 nu este încă înregistrată. Dacă spune că adresa "is not on chain yet", plata de la faucet nu a ajuns încă: așteaptă 10 secunde și încearcă din nou.

### 6. Înregistrează-ți cheia post-cuantică {#register}

```bash
python airdrop.py register
```

**Ce face:** înregistrează o singură dată cheia ta ML-DSA-87 pe lanț. Poate fi rulat din nou în siguranță. Această primă tranzacție este semnată clasic, deoarece o cheie nu poate cosemna propria înregistrare. Costă aproximativ 0,09 QOR. Fiecare tranzacție de după ea este semnată hibrid.

**Ce ar trebui să vezi:** un hash de tranzacție și o linie `registered` (sau `already registered` dacă l-ai rulat de două ori).

**Cât durează:** câteva secunde (un bloc).

### 7. Scrie lista de destinatari {#list}

Fă două conturi de destinatari de unică folosință. Fiecare primește propriul fișier de chei:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**Ce face:** același `new` ca înainte, dar `--key-file` trimite fiecare cheie în fișierul ei, ca să nu se suprascrie nimic. (Poți folosi și adresele unor prieteni care folosesc testnet-ul.)

**Ce ar trebui să vezi:** două adrese `qor1...` diferite. Copiază-le pe ambele.

Acum creează în acest folder un fișier text simplu numit `addresses.txt`, cu o adresă pe linie. Orice editor de text merge (Notepad pe Windows, TextEdit în modul text simplu pe macOS, `nano addresses.txt` pe Linux):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Înlocuiește cele două linii-exemplu cu adresele tale reale. Liniile goale, comentariile `#`, dublurile, expeditorul însuși și orice nu este o adresă `qor1...` validă sunt sărite, cu un avertisment. Cel mult 100 de destinatari într-o tranzacție. Folderul conține și `addresses.example.txt`, un exemplu cu linii-substituent.

### 8. Trimite airdrop-ul {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Parte | Ce înseamnă |
| --- | --- |
| `drop` | Trimite o tranzacție care plătește pe toată lumea din listă. |
| `addresses.txt` | Fișierul cu destinatarii. |
| `0.1` | Suma în QOR **pentru fiecare destinatar** (0,1 QOR = 100.000 uqor). Doi destinatari primesc în total 0,2 QOR. |
| `--memo "..."` | Un text scurt atașat tranzacției. Opțional. |
| `--yes` (sau `-y`) | Opțional: sare peste întrebarea "ești sigur". |

Ordinea opțiunilor: suma și fișierul vin primele, iar `--memo` și `--yes` vin după ele. `--key-file` este diferit: vine înaintea lui `drop`.

**Ce face:** afișează un rezumat (destinatari, suma pentru fiecare, totalul) și îți cere confirmarea. Scrie `y` și apasă Enter. Apoi întreabă lanțul de câtă gas este nevoie (o rulare de test), adaugă 30 la sută ca marjă de siguranță, semnează cu ambele chei, trimite o singură tranzacție și afișează raportul de verificare.

**Ce ar trebui să vezi:** hash-ul tranzacției și înălțimea, apoi un raport cu: cod 0, statusul `pqc_hybrid_verify` al semnatarului `verified`, o semnătură ML-DSA-87 de 4.627 de octeți și un număr de destinatari care se potrivește cu lista ta. Copiază hash-ul.

**Cât durează:** aproximativ 10 secunde.

### 9. Verifică orice tranzacție {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**Ce face:** citește tranzacția de pe lanț și afișează singur raportul de verificare. Funcționează pentru orice hash de tranzacție, nu doar pentru al tău.

**Ce ar trebui să vezi:** același raport ca la sfârșitul pasului 8.

## Verifică tranzacția singur {#check}

Nu trebuie să ai încredere în unealtă. Întreabă direct lanțul.

**Modul 1, în browser.** Deschide `https://explore.qore.network/tx/<HASH>` (pune hash-ul tău în locul lui `<HASH>`), apoi comută explorerul pe **Testnet**. Ar trebui să vezi o tranzacție reușită, cu fiecare destinatar plătit.

**Modul 2, o singură comandă:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parte | Ce înseamnă |
| --- | --- |
| `curl` | O unealtă care descarcă o adresă web. Inclusă în macOS, Windows 10+ și majoritatea sistemelor Linux. |
| `-s` | Silențios: ascunde bara de progres. |
| adresa | API-ul REST public de testnet. Returnează înregistrarea completă a tranzacției, în format JSON. |

**Ce ar trebui să vezi** în rezultatul lung (adaugă `| jq .` dacă ai instalat jq, vezi https://jqlang.github.io/jq/download/):

- `"code": 0` înseamnă că tranzacția a reușit.
- O extensie `PQCHybridSignature` care conține un `pqc_signature` de **4.627 de octeți** (semnătura ML-DSA-87), lângă cea clasică de 64 de octeți.
- Un eveniment `pqc_hybrid_verify` cu `status` setat la `verified` pentru adresa ta.

## Cum funcționează dovada {#proof}

`verify` citește `GET /cosmos/tx/v1beta1/txs/{hash}` de la punctul REST public de testnet și verifică:

- un eveniment de tip `pqc_hybrid_verify` pentru semnatar, cu `status=verified`;
- extensia `/qorechain.pqc.v1.PQCHybridSignature` poartă o semnătură ML-DSA-87 de 4.627 de octeți;
- tranzacția a reușit (cod 0) și câți destinatari a plătit.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `python3: command not found` sau o versiune sub 3.10 | Python lipsește sau este vechi. | Instalează Python 3.10 sau mai nou, deschide un terminal nou. Pe Windows folosește `python`. |
| `No module named venv` sau `ensurepip is not available` | Partea venv a lui Python nu este instalată (Debian, Ubuntu). | `sudo apt install python3-venv`, apoi repetă pasul 2. |
| `ModuleNotFoundError: No module named 'qorsdk'` | Mediul nu este pornit sau instalarea a fost sărită. | Rulează `source .venv/bin/activate`, apoi `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` a fost pus după comandă. | Pune-l înainte: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | Ai sărit peste pasul 4 sau se folosește un alt `--key-file`. | Rulează `python airdrop.py new`. |
| `... already exists (use --force to replace it)` | Există deja un fișier de chei. | Păstreaz-o sau rulează `python airdrop.py new --force` (cheia veche se pierde). |
| `... is readable by others (mode ...)` | Permisiunile fișierului de chei sunt prea deschise. | Rulează `chmod 600 <path>`. |
| `... is not on chain yet (fund it first)` | Nu a ajuns niciun QOR de la faucet. | Așteaptă 10 secunde sau cere de la faucet. |
| `account has no PQC key and classical fallback is disabled` | Cheia post-cuantică nu este încă înregistrată. | Rulează mai întâi `python airdrop.py register`. |
| `the ML-DSA-87 key is not registered yet` | Același motiv, descoperit de unealtă înainte de trimitere. | Rulează `python airdrop.py register`. |
| `balance too low` | Suma totală plus taxa depășește ce ai. | Trimite o sumă mai mică sau așteaptă următoarea cerere la faucet. |
| Faucet-ul spune că ai atins o limită de cereri | O cerere la 24 de ore pentru fiecare cont. | Așteaptă sau folosește alt cont de unică folosință. |
| `skip line N: not a valid qor1 address` | O linie din `addresses.txt` nu este o adresă corectă. | Corectează sau șterge acea linie. Celelalte linii funcționează în continuare. |
| `no valid recipients` | Toate liniile au fost sărite. | Verifică dacă `addresses.txt` conține adrese `qor1...` reale. |
| `bad amount` | Suma nu este un număr simplu. | Folosește QOR ca număr, de exemplu `0.1`. |
| `refused by the node: code ...` | Lanțul a refuzat tranzacția. | Citește mesajul. Așteaptă un minut și reîncearcă dacă testnet-ul este ocupat sau se actualizează. |
| `transaction not found on the testnet` | Hash greșit sau blocul nu este încă final. | Verifică hash-ul și încearcă din nou peste câteva secunde. |
| `the testnet may be pausing for an upgrade` | Punctele publice limitează cererile per adresă IP sau testnet-ul se actualizează. | Așteaptă un minut și rulează din nou. |
| `EVM authorisation window exhausted` | Aparține aplicațiilor EVM, nu acesteia. | Într-o aplicație EVM, deschide o fereastră nouă cu `pnpm window open`. |
| `HHE10402` după deschiderea ferestrei | Doar pentru aplicațiile Hardhat: fereastra nu era încă activă. | Rulează din nou deploy-ul. |
| Erori `CORS` într-un browser | Doar când o pagină web apelează direct lanțul. Această unealtă nu o face. | Într-o aplicație din browser, folosește proxy-ul `/lcd` al șablonului. |
| `pnpm: command not found` | pnpm nu este instalat. Nu este necesar aici. | Doar pentru tutorialul Hardhat: rulează `npm install -g pnpm`. |

## Codul SDK care contează {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

Cheia este înregistrată o singură dată cu `ensure_pqc_registered(...)`, care nu face nimic dacă aceeași cheie este deja pe lanț. Gas-ul nu este niciodată fix: tranzacția reală, semnată hibrid, este simulată mai întâi, iar limita este gas-ul simulat înmulțit cu 1,3, evaluat la 0,15 uqor pentru fiecare unitate de gas.

Contul este de tip coin 118 (`m/44'/118'/0'/0/0`). Cheia ML-DSA-87 este derivată din aceeași frază de recuperare și legată de adresă cu `derive_pqc_canonical`. Dacă îți construiești propria aplicație pe ajutoarele bazate pe seed, SDK 0.13.0 are nevoie de un cod de recuperare sau de un secret PQC independent de 32 de octeți (în Python `unified_account_from_seed(seed32, recovery_code=...)`); vezi [Instalarea SDK](/sdk/install#whats-new-0130). Nu afișa niciodată un cod de recuperare.

## Pachete folosite {#packages}

| Element | Versiune |
| --- | --- |
| `qorechain-sdk` (PyPI, importat ca `qorsdk`) | 0.13.0 (fixată în `requirements.txt` ca `qorechain-sdk==0.13.0`) |
| Python | 3.10 sau mai nou |

Unealta importă și tipurile protobuf `Input`, `Output` (din `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) și `Coin` (din `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); acestea vin odată cu SDK-ul. Vezi [Instalarea SDK](/sdk/install) pentru tabelul de versiuni al tuturor limbajelor.

## Unde cauți informații {#access}

| Ce | Unde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Cod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
