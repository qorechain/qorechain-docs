---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: App Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# App Python: Q-Day Airdrop

Il **Q-Day Airdrop** è un piccolo strumento Python che invia QOR di testnet a un'intera lista di indirizzi in **una** sola transazione, firmata con una chiave classica secp256k1 e una chiave post-quantistica ML-DSA-87 (FIPS 204). Poi dimostra, dal registro della catena stessa, che entrambe le firme sono state verificate. Gira sulla testnet di QoreChain (`qorechain-diana`, EVM chain ID 9800).

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1** da Python.
- **Una transazione firmata in modo ibrido e verificata on chain**, che paga molti destinatari in una volta con un unico messaggio multi-send.
- **Un report di verifica** costruito dal registro della transazione della catena stessa, non dalla parola dello strumento.

Perché è importante: una sola firma protegge un intero airdrop, e resta protetta da un futuro computer quantistico perché la metà ML-DSA-87 è post-quantistica. Vedi [Transazioni quantum-safe](/sdk/guides/quantum-safe).

## Passo dopo passo {#run}

Tutto ciò che segue gira nel tuo terminale (macOS, Linux oppure Windows con WSL). Usi solo un account testnet usa e getta. I QOR di testnet non hanno alcun valore e qui non usi mai un wallet reale.

### 1. Installa gli strumenti {#install}

Ti servono Git e Python 3.10 o successivo (con `venv`). Controlla cosa hai:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

Se manca qualcosa, installalo prima, per esempio da [python.org](https://www.python.org/downloads/) o con il tuo gestore di pacchetti (`brew install python` su macOS, `sudo apt install python3 python3-venv git` su Debian o Ubuntu). Apri un nuovo terminale ed esegui di nuovo i controlli.

### 2. Ottieni il codice {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Installa le dipendenze {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Installa un solo pacchetto, `qorechain-sdk==0.13.0`, più ciò che gli serve. Tieni attivo l'ambiente virtuale per il resto dei passi (esegui di nuovo `source .venv/bin/activate` in ogni nuovo terminale). Controlla che lo strumento parta:

```bash
python airdrop.py --help
```

Dovresti vedere i comandi `new`, `status`, `register`, `drop` e `verify`.

### 4. Crea il tuo account testnet usa e getta {#key}

```bash
python airdrop.py new
```

Genera una nuova frase di recupero, la scrive nel file di chiavi `~/.config/qday/python.env` (leggibile solo da te, modalità 600) e stampa solo l'indirizzo dell'account, che inizia con `qor1...`. La frase non viene mai mostrata. Non condividere questo file, non farne il commit e non riutilizzarlo sulla mainnet. Per tenere la chiave altrove, metti `--key-file /path/to/file` prima del nome del comando (per esempio `python airdrop.py --key-file ~/my.env status`) oppure imposta `QORE_KEY_FILE`.

Copia dall'output l'indirizzo `qor1...`. Se lo perdi, `python airdrop.py status` lo stampa di nuovo.

### 5. Ricevi QOR di testnet dal faucet {#faucet}

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e richiedi i token. Il faucet eroga 100 QOR ogni 24 ore.
3. Controlla che siano arrivati:

```bash
python airdrop.py status
```

Il saldo dovrebbe mostrare i tuoi QOR di testnet, e la chiave post-quantistica dovrebbe risultare non ancora registrata.

### 6. Registra la tua chiave post-quantistica {#register}

```bash
python airdrop.py register
```

Registra una sola volta la tua chiave ML-DSA-87 on chain. Si può rieseguire senza problemi. La registrazione è firmata in modo classico, perché una chiave non può cofirmare la propria registrazione. Ogni transazione successiva è firmata in modo ibrido.

### 7. Scrivi la lista dei destinatari {#list}

Crea un file di testo con un indirizzo testnet per riga. Per una prima prova, crea qualche indirizzo usa e getta puntando `--key-file` a nuovi file, oppure usa gli indirizzi di amici che usano anch'essi la testnet:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Poi metti gli indirizzi stampati in `addresses.txt`:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Le righe vuote, i commenti `#`, i duplicati, il mittente stesso e tutto ciò che non è un indirizzo di account `qor1...` valido vengono saltati con un avviso. Al massimo 100 destinatari per transazione. Il repository contiene anche `addresses.example.txt`, un esempio con righe segnaposto.

### 8. Invia l'airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` è l'importo in QOR inviato a ciascun destinatario. Lo strumento mostra un riepilogo (destinatari, importo a testa, totale) e ti chiede di confermare; aggiungi `--yes` per saltare la domanda. Poi simula la transazione per stabilire il gas, la firma con entrambe le chiavi, la trasmette come un'unica transazione e stampa il report di verifica. Se una trasmissione fallisce, attendi un minuto e riprova.

### 9. Verifica una transazione qualsiasi {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

Usa l'hash stampato da `drop`. Stampa da solo il report di verifica, per qualsiasi hash di transazione.

## Cosa dovresti vedere {#output}

- `drop` stampa l'hash della transazione e l'altezza, poi il report di verifica: lo stato `pqc_hybrid_verify` del firmatario è `verified`, la firma ML-DSA-87 è di 4627 byte, il codice è 0 e il numero di destinatari corrisponde alla tua lista.
- Nell'explorer: apri `https://explore.qore.network/tx/<HASH>` e imposta l'explorer su **Testnet**. La transazione risulta riuscita, con ogni destinatario pagato.

## Come funziona la prova {#proof}

`verify` legge `GET /cosmos/tx/v1beta1/txs/{hash}` dall'endpoint REST pubblico della testnet e controlla:

- un evento di tipo `pqc_hybrid_verify` per il firmatario con `status=verified`;
- che l'estensione `/qorechain.pqc.v1.PQCHybridSignature` porti una firma ML-DSA-87 da 4627 byte (accanto a quella secp256k1 da 64 byte);
- che la transazione sia riuscita (code 0) e quanti destinatari abbia pagato.

## Il codice dell'SDK che conta {#code}

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

La chiave viene registrata una sola volta con `ensure_pqc_registered(...)`, che non fa nulla se la stessa chiave è già on chain. Il gas non è mai fisso: la vera transazione firmata in modo ibrido viene prima simulata e il limite è il gas simulato per 1,3, con un prezzo di 0,15 uqor per unità di gas.

L'account è di coin type 118 (`m/44'/118'/0'/0/0`). La chiave ML-DSA-87 è derivata dalla stessa frase di recupero e legata all'indirizzo con `derive_pqc_canonical`. Se invece costruisci la tua app sugli helper basati su seed, l'SDK 0.13.0 richiede un codice di recupero o un segreto PQC indipendente da 32 byte (in Python `unified_account_from_seed(seed32, recovery_code=...)`); vedi [Installare l'SDK](/sdk/install#whats-new-0130). Non stampare mai un codice di recupero.

## Pacchetti usati {#packages}

| Voce | Versione |
| --- | --- |
| `qorechain-sdk` (PyPI, importato come `qorsdk`) | 0.13.0 (fissata in `requirements.txt` come `qorechain-sdk==0.13.0`) |
| Python | 3.10 o successivo |

Lo strumento importa anche i tipi protobuf `Input`, `Output` (da `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) e `Coin` (da `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); arrivano con l'SDK. Vedi [Installare l'SDK](/sdk/install) per la tabella delle versioni in tutti i linguaggi.

## Dove cercare le cose {#access}

| Cosa | Dove |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Codice | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
