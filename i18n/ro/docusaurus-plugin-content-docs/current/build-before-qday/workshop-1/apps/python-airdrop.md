---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Aplicație Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Aplicație Python: Q-Day Airdrop

**Q-Day Airdrop** este un mic instrument Python care trimite QOR de testnet către o listă întreagă de adrese într-o **singură** tranzacție, semnată cu o cheie clasică secp256k1 și cu o cheie post-cuantică ML-DSA-87 (FIPS 204). Apoi demonstrează, din înregistrarea lanțului însuși, că ambele semnături au fost verificate. Rulează pe testnetul QoreChain (`qorechain-diana`, EVM chain ID 9800).

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1** din Python.
- **O tranzacție semnată hibrid, verificată pe lanț**, care plătește mulți destinatari deodată cu un singur mesaj multi-send.
- **Un raport de verificare** construit din înregistrarea tranzacției de pe lanț, nu din cuvântul instrumentului.

De ce contează: o singură semnătură protejează un airdrop întreg și rămâne protejată împotriva unui viitor calculator cuantic, deoarece jumătatea ML-DSA-87 este post-cuantică. Vezi [Tranzacții rezistente cuantic](/sdk/guides/quantum-safe).

## Pas cu pas {#run}

Tot ce urmează rulează în propriul tău terminal (macOS, Linux sau Windows cu WSL). Folosești doar un cont de testnet de unică folosință. QOR de testnet nu are valoare, iar aici nu folosești niciodată un portofel real.

### 1. Instalează instrumentele {#install}

Ai nevoie de Git și de Python 3.10 sau mai nou (cu `venv`). Verifică ce ai:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

Dacă lipsește ceva, instalează mai întâi, de exemplu de la [python.org](https://www.python.org/downloads/) sau cu managerul tău de pachete (`brew install python` pe macOS, `sudo apt install python3 python3-venv git` pe Debian sau Ubuntu). Deschide un terminal nou și rulează din nou verificările.

### 2. Obține codul {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Instalează dependențele {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Comanda instalează un singur pachet, `qorechain-sdk==0.13.0`, plus ce are nevoie acesta. Ține mediul virtual activ pentru restul pașilor (rulează din nou `source .venv/bin/activate` în orice terminal nou). Verifică dacă instrumentul pornește:

```bash
python airdrop.py --help
```

Ar trebui să vezi comenzile `new`, `status`, `register`, `drop` și `verify`.

### 4. Creează-ți contul de testnet de unică folosință {#key}

```bash
python airdrop.py new
```

Comanda generează o frază de recuperare nouă, o scrie în fișierul de chei `~/.config/qday/python.env` (care poate fi citit doar de tine, modul 600) și afișează doar adresa contului, care începe cu `qor1...`. Fraza nu este afișată niciodată. Nu partaja acest fișier, nu-l comite și nu-l reutiliza pe mainnet. Ca să păstrezi cheia în altă parte, pune `--key-file /path/to/file` înaintea numelui comenzii (de exemplu `python airdrop.py --key-file ~/my.env status`) sau setează `QORE_KEY_FILE`.

Copiază adresa `qor1...` din ieșire. Dacă o pierzi, `python airdrop.py status` o afișează din nou.

### 5. Primește QOR de testnet de la faucet {#faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și cere tokenuri. Faucetul dă 100 QOR la 24 de ore.
3. Verifică dacă au ajuns:

```bash
python airdrop.py status
```

Soldul ar trebui să arate QOR-ul tău de testnet, iar cheia post-cuantică ar trebui să apară ca încă neînregistrată.

### 6. Înregistrează-ți cheia post-cuantică {#register}

```bash
python airdrop.py register
```

Comanda înregistrează cheia ta ML-DSA-87 pe lanț, o singură dată. Poate fi rulată din nou fără risc. Înregistrarea este semnată clasic, deoarece o cheie nu poate co-semna propria înregistrare. Fiecare tranzacție de după ea este semnată hibrid.

### 7. Scrie lista de destinatari {#list}

Creează un fișier text cu o adresă de testnet pe linie. Pentru o primă încercare, fă câteva adrese de unică folosință indicând `--key-file` spre fișiere noi, sau folosește adresele unor prieteni care folosesc și ei testnetul:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Apoi pune adresele afișate în `addresses.txt`:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Liniile goale, comentariile `#`, duplicatele, expeditorul însuși și orice nu este o adresă de cont `qor1...` validă sunt omise, cu un avertisment. Cel mult 100 de destinatari pe tranzacție. Repository-ul conține și `addresses.example.txt`, un exemplu cu linii provizorii.

### 8. Trimite airdropul {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` este suma în QOR trimisă fiecărui destinatar. Instrumentul afișează un rezumat (destinatari, suma pentru fiecare, total) și cere confirmarea; adaugă `--yes` ca să omiți întrebarea. Apoi simulează tranzacția ca să stabilească gazul, o semnează cu ambele chei, o transmite ca o singură tranzacție și afișează raportul de verificare. Dacă o transmitere eșuează, așteaptă un minut și încearcă din nou.

### 9. Verifică orice tranzacție {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

Folosește hashul afișat de `drop`. Comanda afișează raportul de verificare de sine stătător, pentru orice hash de tranzacție.

## Ce ar trebui să vezi {#output}

- `drop` afișează hashul tranzacției și înălțimea, apoi raportul de verificare: statusul `pqc_hybrid_verify` al semnatarului este `verified`, semnătura ML-DSA-87 are 4627 de octeți, codul este 0, iar numărul de destinatari corespunde cu lista ta.
- În explorer: deschide `https://explore.qore.network/tx/<HASH>` și comută explorerul pe **Testnet**. Tranzacția apare ca reușită, cu fiecare destinatar plătit.

## Cum funcționează dovada {#proof}

`verify` citește `GET /cosmos/tx/v1beta1/txs/{hash}` de la punctul final REST public de testnet și verifică:

- un eveniment de tip `pqc_hybrid_verify` pentru semnatar, cu `status=verified`;
- extensia `/qorechain.pqc.v1.PQCHybridSignature` poartă o semnătură ML-DSA-87 de 4627 de octeți (alături de cea secp256k1 de 64 de octeți);
- tranzacția a reușit (code 0) și câți destinatari a plătit.

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

Cheia este înregistrată o singură dată cu `ensure_pqc_registered(...)`, care nu face nimic dacă aceeași cheie este deja pe lanț. Gazul nu este niciodată fix: tranzacția hibridă reală este simulată mai întâi, iar limita este gazul simulat înmulțit cu 1.3, la prețul de 0.15 uqor pe unitate de gaz.

Contul are coin type 118 (`m/44'/118'/0'/0/0`). Cheia ML-DSA-87 este derivată din aceeași frază de recuperare și legată de adresă cu `derive_pqc_canonical`. Dacă îți construiești propria aplicație pe ajutoarele bazate pe seed, SDK 0.13.0 cere un cod de recuperare sau un secret PQC independent de 32 de octeți (în Python `unified_account_from_seed(seed32, recovery_code=...)`); vezi [instalarea SDK-ului](/sdk/install#whats-new-0130). Nu afișa niciodată un cod de recuperare.

## Pachete folosite {#packages}

| Element | Versiune |
| --- | --- |
| `qorechain-sdk` (PyPI, importat ca `qorsdk`) | 0.13.0 (fixat în `requirements.txt` ca `qorechain-sdk==0.13.0`) |
| Python | 3.10 sau mai nou |

Instrumentul importă și tipurile protobuf `Input`, `Output` (din `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) și `Coin` (din `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); acestea vin cu SDK-ul. Vezi [instalarea SDK-ului](/sdk/install) pentru tabelul de lansări în toate limbajele.

## Unde cauți informații {#access}

| Ce | Unde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Cod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
