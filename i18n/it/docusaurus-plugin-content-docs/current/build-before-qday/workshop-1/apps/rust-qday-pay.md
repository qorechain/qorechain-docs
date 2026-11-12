---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: App Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# App Rust: qday-pay

**qday-pay** è un piccolo strumento Rust da riga di comando che paga in QOR sulla testnet di QoreChain (`qorechain-diana`, EVM chain ID 9800) con una **firma ibrida**: una firma classica secp256k1 e una firma post-quantistica ML-DSA-87 (FIPS 204) sulla stessa transazione. Dopo l'invio rilegge la transazione dalla catena e mostra se la catena ha verificato entrambe le metà.

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1** da Rust, con il crate pubblicato e nessuno strumento aggiuntivo.
- **Una transazione firmata in modo ibrido e verificata on chain**: la catena emette un evento `pqc_hybrid_verify` con `status=verified`, e il corpo della transazione porta una firma ML-DSA-87 da 4627 byte accanto alla firma secp256k1 da 64 byte.
- **Una frase di recupero, due chiavi**: la chiave ML-DSA-87 è derivata dalla stessa mnemonica della chiave classica e legata al tuo indirizzo.

Perché è importante: ci si aspetta che un futuro computer quantistico rompa le firme secp256k1. Una transazione che porta anche una firma ML-DSA-87 resta protetta. Vedi [Transazioni quantum-safe](/sdk/guides/quantum-safe).

## Passo dopo passo {#run}

### 1. Installa gli strumenti

Ti servono Git e una recente toolchain Rust stabile con `cargo`.

- Git: https://git-scm.com/downloads
- Rust: installalo con rustup da https://rustup.rs

Controlla le versioni:

```bash
git --version
rustc --version
cargo --version
```

### 2. Ottieni il codice

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Compila

```bash
cargo build --release
```

La prima compilazione scarica e compila le dipendenze e richiede qualche minuto. Termina con `Finished` `release` profile. Eseguire lo strumento senza argomenti stampa l'elenco dei comandi:

```bash
cargo run --release
```

### 4. Crea un account testnet usa e getta

```bash
cargo run --release -- new
```

`new` crea una frase di recupero e la salva in un file di chiavi con modalità 0600. La frase non viene mai stampata. Per impostazione predefinita il file di chiavi è `~/.config/qday/rust.env`; imposta `QDAY_KEY_FILE` per usare un altro percorso. Il comando si rifiuta di sovrascrivere un file esistente. È un account solo per la testnet: non usare mai qui un wallet reale, non condividere né fare il commit del file di chiavi e non riutilizzarlo mai sulla mainnet. Il comando stampa il tuo indirizzo `qor1...`.

### 5. Ricevi QOR di testnet dal faucet

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e richiedi. Una richiesta eroga 100 QOR, una volta ogni 24 ore per account e per indirizzo.

L'account deve esistere on chain prima del passo successivo, perché la registrazione paga una commissione.

### 6. Controlla l'account

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. Registra la chiave ML-DSA-87

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

La transazione di registrazione è firmata in modo classico, perché una chiave non può cofirmare la propria registrazione. Eseguirla di nuovo non fa nulla.

### 8. Invia un pagamento firmato in modo ibrido

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

Sostituisci `qor1...` con un qualsiasi indirizzo testnet (per esempio un secondo account usa e getta). L'importo è in QOR. `send` paga l'importo e poi esegue la verifica.

### 9. Verifica una transazione qualsiasi

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

Lo strumento funziona solo sulla testnet: usa il preset `testnet` dell'SDK e si rifiuta di funzionare con qualsiasi altro chain id.

## L'account {#account}

L'account è un account QoreChain Native secp256k1, coin type 118 (`m/44'/118'/0'/0/0`), con un indirizzo `qor1...`. La chiave ML-DSA-87 deriva dalla stessa mnemonica con la regola canonica legata all'indirizzo dell'SDK. Una sola mnemonica ripristina entrambe le chiavi.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## Il codice dell'SDK che conta {#code}

Questo è il nucleo del comando `send`, ridotto:

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

La registrazione è una sola chiamata idempotente, `ensure_pqc_registered()` su `PqcDx`: invia `MsgRegisterPQCKeyV2` con una prova di possesso solo quando non è ancora registrata alcuna chiave, e fallisce se l'account detiene una chiave diversa.

Il gas non è mai fisso: la bozza viene simulata e il limite è il gas simulato per 1,3, con un prezzo di 0,15 uqor per unità di gas (il minimo della catena è 0,1 uqor).

## Come si decide che è "verified" {#verified}

`verify` legge `GET /cosmos/tx/v1beta1/txs/{hash}` dall'endpoint REST pubblico della testnet e controlla tre cose:

- la transazione è andata a buon fine (`code 0`);
- la catena ha emesso `pqc_hybrid_verify` con `status=verified` per il firmatario;
- il corpo porta un'estensione `/qorechain.pqc.v1.PQCHybridSignature` con una firma ML-DSA-87 da 4627 byte.

## Cosa dovresti vedere {#output}

Un `send` riuscito stampa l'importo e la commissione, il blocco in cui è stato incluso, e poi un report che mostra che la transazione è andata a buon fine, che `pqc_hybrid_verify` è `verified` e che la firma ML-DSA-87 è di 4627 byte. Se un controllo fallisce, lo strumento termina con stato 2. Per cercare la transazione, apri https://explore.qore.network, impostalo su **Testnet** e cerca l'hash, oppure apri `https://explore.qore.network/tx/<HASH>`.

## Endpoint di rete {#access}

| Cosa | Dove |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Pacchetti usati {#packages}

| Voce | Versione |
| --- | --- |
| `qorechain-sdk` (importato come `qorechain`) | 0.13 (risolta in 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (questa app, non pubblicata) | 0.1.0 |

Vedi [Installare l'SDK](/sdk/install) per la tabella delle versioni dell'SDK in tutti i linguaggi.

## Codice sorgente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
