---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Aplicație Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Aplicație Rust: qday-pay

**qday-pay** este un mic instrument Rust în linia de comandă, care plătește în QOR pe testnetul QoreChain (`qorechain-diana`, EVM chain ID 9800) cu o **semnătură hibridă**: o semnătură clasică secp256k1 și o semnătură post-cuantică ML-DSA-87 (FIPS 204) pe aceeași tranzacție. După trimitere, citește tranzacția înapoi de pe lanț și arată dacă lanțul a verificat ambele jumătăți.

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1** din Rust, cu crate-ul publicat și fără alte instrumente.
- **O tranzacție semnată hibrid, verificată pe lanț**: lanțul emite un eveniment `pqc_hybrid_verify` cu `status=verified`, iar corpul tranzacției poartă o semnătură ML-DSA-87 de 4627 de octeți, alături de semnătura secp256k1 de 64 de octeți.
- **O singură frază de recuperare, două chei**: cheia ML-DSA-87 este derivată din aceeași mnemonică ca cheia clasică și este legată de adresa ta.

De ce contează: se așteaptă ca un viitor calculator cuantic să spargă semnăturile secp256k1. O tranzacție care poartă și o semnătură ML-DSA-87 rămâne protejată. Vezi [Tranzacții rezistente cuantic](/sdk/guides/quantum-safe).

## Pas cu pas {#run}

### 1. Instalează instrumentele

Ai nevoie de Git și de un toolchain Rust stabil recent, cu `cargo`.

- Git: https://git-scm.com/downloads
- Rust: instalează cu rustup de la https://rustup.rs

Verifică versiunile:

```bash
git --version
rustc --version
cargo --version
```

### 2. Obține codul

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Compilează

```bash
cargo build --release
```

Prima compilare descarcă și compilează dependențele și durează câteva minute. Se încheie cu `Finished` pentru profilul `release`. Rularea instrumentului fără argumente afișează lista de comenzi:

```bash
cargo run --release
```

### 4. Creează un cont de testnet de unică folosință

```bash
cargo run --release -- new
```

`new` creează o frază de recuperare și o salvează într-un fișier de chei cu modul 0600. Fraza nu este afișată niciodată. Fișierul de chei este implicit `~/.config/qday/rust.env`; setează `QDAY_KEY_FILE` ca să folosești altă cale. Comanda refuză să suprascrie un fișier existent. Acesta este un cont doar pentru testnet: nu folosi niciodată aici un portofel real, nu partaja și nu comite fișierul de chei și nu-l reutiliza pe mainnet. Comanda afișează adresa ta `qor1...`.

### 5. Primește QOR de testnet de la faucet

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și revendică. O revendicare plătește 100 QOR, o dată la 24 de ore pentru fiecare cont și pentru fiecare adresă.

Contul trebuie să existe pe lanț înainte de pasul următor, deoarece înregistrarea costă o taxă.

### 6. Verifică contul

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. Înregistrează cheia ML-DSA-87

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

Tranzacția de înregistrare este semnată clasic, deoarece o cheie nu poate co-semna propria înregistrare. Dacă o rulezi din nou, nu se întâmplă nimic.

### 8. Trimite o plată semnată hibrid

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

Înlocuiește `qor1...` cu orice adresă de testnet (de exemplu un al doilea cont de unică folosință). Suma este în QOR. `send` plătește suma, apoi rulează verificarea.

### 9. Verifică orice tranzacție

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

Instrumentul este doar pentru testnet: folosește presetul `testnet` al SDK-ului și refuză să ruleze pe orice alt chain id.

## Contul {#account}

Contul este un cont QoreChain Native secp256k1, coin type 118 (`m/44'/118'/0'/0/0`), cu o adresă `qor1...`. Cheia ML-DSA-87 provine din aceeași mnemonică, după regula canonică a SDK-ului, legată de adresă. O singură mnemonică restaurează ambele chei.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## Codul SDK care contează {#code}

Acesta este nucleul comenzii `send`, simplificat:

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Înregistrarea este un singur apel idempotent, `ensure_pqc_registered()` pe `PqcDx`: trimite `MsgRegisterPQCKeyV2` cu o dovadă de posesie doar când nu este încă înregistrată nicio cheie și eșuează dacă contul deține o altă cheie.

Gazul nu este niciodată fix: ciclul simulează schița, iar limita este gazul simulat înmulțit cu 1.3, la prețul de 0.15 uqor pe unitate de gaz (pragul lanțului este 0.1 uqor).

## Cum se decide "verified" {#verified}

`verify` citește `GET /cosmos/tx/v1beta1/txs/{hash}` de la punctul final REST public de testnet și verifică trei lucruri:

- tranzacția a reușit (`code 0`);
- lanțul a emis `pqc_hybrid_verify` cu `status=verified` pentru semnatar;
- corpul poartă o extensie `/qorechain.pqc.v1.PQCHybridSignature` cu o semnătură ML-DSA-87 de 4627 de octeți.

## Ce ar trebui să vezi {#output}

Un `send` reușit afișează suma și taxa, blocul în care a fost inclusă tranzacția, apoi un raport care arată că tranzacția a reușit, că `pqc_hybrid_verify` este `verified` și că semnătura ML-DSA-87 are 4627 de octeți. Dacă o verificare eșuează, instrumentul iese cu statusul 2. Ca să cauți tranzacția, deschide https://explore.qore.network, comută-l pe **Testnet** și caută hashul, sau deschide `https://explore.qore.network/tx/<HASH>`.

## Puncte finale de rețea {#access}

| Ce | Unde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Pachete folosite {#packages}

| Element | Versiune |
| --- | --- |
| `qorechain-sdk` (importat ca `qorechain`) | 0.13 (rezolvat la 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (această aplicație, nepublicată) | 0.1.0 |

Vezi [instalarea SDK-ului](/sdk/install) pentru tabelul de lansări al SDK-ului în toate limbajele.

## Codul sursă {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
