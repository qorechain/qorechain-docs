---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Application Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Application Rust : qday-pay

**qday-pay** est un petit outil en ligne de commande Rust qui paie en QOR sur le testnet QoreChain (`qorechain-diana`, ID de chaîne EVM 9800) avec une **signature hybride** : une signature classique secp256k1 et une signature post-quantique ML-DSA-87 (FIPS 204) sur la même transaction. Après l'envoi, il relit la transaction depuis la chaîne et indique si la chaîne a vérifié les deux moitiés.

## Ce que cela démontre {#what-it-shows}

- **La signature hybride ML-DSA-87 + secp256k1** depuis Rust, avec la crate publiée et sans outillage supplémentaire.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne** : la chaîne émet un événement `pqc_hybrid_verify` avec `status=verified`, et le corps de la transaction porte une signature ML-DSA-87 de 4627 octets à côté de la signature secp256k1 de 64 octets.
- **Une phrase de récupération, deux clés** : la clé ML-DSA-87 est dérivée de la même mnémonique que la clé classique et liée à votre adresse.

Pourquoi c'est important : un futur ordinateur quantique devrait casser les signatures secp256k1. Une transaction qui porte aussi une signature ML-DSA-87 reste protégée. Voir [Transactions résistantes au quantique](/sdk/guides/quantum-safe).

## Pas à pas {#run}

### 1. Installer les outils

Il vous faut Git et une chaîne d'outils Rust stable récente avec `cargo`.

- Git : https://git-scm.com/downloads
- Rust : installez-le avec rustup depuis https://rustup.rs

Vérifiez les versions :

```bash
git --version
rustc --version
cargo --version
```

### 2. Récupérer le code

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Compiler

```bash
cargo build --release
```

La première compilation télécharge et compile les dépendances, et prend quelques minutes. Elle se termine par `Finished` suivi du profil `release`. Lancé sans argument, l'outil affiche la liste des commandes :

```bash
cargo run --release
```

### 4. Créer un compte de testnet jetable

```bash
cargo run --release -- new
```

`new` crée une phrase de récupération et l'enregistre dans un fichier de clés avec les droits 0600. La phrase n'est jamais affichée. Le fichier de clés se trouve par défaut dans `~/.config/qday/rust.env` ; définissez `QDAY_KEY_FILE` pour utiliser un autre chemin. L'outil refuse d'écraser un fichier existant. C'est un compte réservé au testnet : n'utilisez jamais de vrai portefeuille ici, ne partagez ni ne commitez jamais le fichier de clés, et ne le réutilisez jamais sur le mainnet. La commande affiche votre adresse `qor1...`.

### 5. Obtenir des QOR de testnet depuis le faucet

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et faites la demande. Une demande verse 100 QOR, une fois toutes les 24 heures par compte et par adresse.

Le compte doit exister sur la chaîne avant l'étape suivante, car l'enregistrement coûte des frais.

### 6. Vérifier le compte

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. Enregistrer la clé ML-DSA-87

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

La transaction d'enregistrement est signée de façon classique, car une clé ne peut pas co-signer son propre enregistrement. La relancer ne change rien.

### 8. Envoyer un paiement signé de façon hybride

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

Remplacez `qor1...` par n'importe quelle adresse du testnet (par exemple un second compte jetable). Le montant est en QOR. `send` verse le montant puis lance la vérification.

### 9. Vérifier n'importe quelle transaction

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

L'outil ne fonctionne que sur le testnet : il utilise le préréglage `testnet` du SDK et refuse de s'exécuter sur tout autre ID de chaîne.

## Le compte {#account}

Le compte est un compte QoreChain Native secp256k1, de type de coin 118 (`m/44'/118'/0'/0/0`), avec une adresse `qor1...`. La clé ML-DSA-87 provient de la même mnémonique selon la règle canonique du SDK, liée à l'adresse. Une seule mnémonique restaure les deux clés.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## Le code du SDK qui compte {#code}

Voici le cœur de la commande `send`, simplifié :

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

L'enregistrement est un seul appel idempotent, `ensure_pqc_registered()` sur `PqcDx` : il envoie `MsgRegisterPQCKeyV2` avec une preuve de possession uniquement quand aucune clé n'est encore enregistrée, et échoue si le compte détient une clé différente.

Le gas n'est jamais fixe : le brouillon est simulé et la limite vaut le gas simulé multiplié par 1,3, au prix de 0,15 uqor par unité de gas (le plancher de la chaîne est de 0,1 uqor).

## Comment « vérifié » est décidé {#verified}

`verify` lit `GET /cosmos/tx/v1beta1/txs/{hash}` depuis le point de terminaison REST public du testnet et contrôle trois choses :

- la transaction a réussi (`code 0`) ;
- la chaîne a émis `pqc_hybrid_verify` avec `status=verified` pour le signataire ;
- le corps porte une extension `/qorechain.pqc.v1.PQCHybridSignature` avec une signature ML-DSA-87 de 4627 octets.

## Ce que vous devriez voir {#output}

Un `send` réussi affiche le montant et les frais, le bloc dans lequel la transaction a été incluse, puis un rapport qui montre que la transaction a réussi, que `pqc_hybrid_verify` est `verified` et que la signature ML-DSA-87 fait 4627 octets. Si une vérification échoue, l'outil se termine avec le statut 2. Pour retrouver la transaction, ouvrez https://explore.qore.network, passez-le sur **Testnet** et recherchez le hash, ou ouvrez `https://explore.qore.network/tx/<HASH>`.

## Points de terminaison du réseau {#access}

| Quoi | Où |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passez sur Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Paquets utilisés {#packages}

| Élément | Version |
| --- | --- |
| `qorechain-sdk` (importé sous le nom `qorechain`) | 0.13 (résolu en 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (cette application, non publiée) | 0.1.0 |

Voir [Installer le SDK](/sdk/install) pour le tableau des versions du SDK dans tous les langages.

## Code source {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
