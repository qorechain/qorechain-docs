---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Application Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Application Rust : qday-pay

**qday-pay** est un petit programme Rust que vous lancez dans un terminal. Il paie des QOR de testnet sur le testnet QoreChain `qorechain-diana` avec une **signature hybride** : une signature classique secp256k1 plus une signature post-quantique ML-DSA-87 (NIST FIPS 204). Après le paiement, il relit la transaction depuis la chaîne et vous montre la preuve de la chaîne elle-même que les deux signatures ont été vérifiées.

**Durée :** environ 15 minutes au total. La première compilation télécharge et compile les bibliothèques, ce qui prend 2 à 5 minutes. Ensuite, chaque commande s'exécute en quelques secondes.

## Ce que le programme montre {#what-it-shows}

- **La signature hybride depuis Rust**, avec le crate publié `qorechain-sdk` (version 0.13, utilisé dans le code sous le nom `qorechain`).
- **L'enregistrement unique** de votre clé post-quantique sur la chaîne.
- **Un rapport de vérification** pour n'importe quelle transaction : la signature classique de 64 octets, la signature ML-DSA-87 de 4 627 octets et le verdict `pqc_hybrid_verify` de la chaîne.

Pourquoi c'est important : une signature classique seule devrait pouvoir être cassée par un futur ordinateur quantique. Une signature hybride reste sûre tant que l'une des deux moitiés tient. Voir [Transactions résistantes au quantique](/sdk/guides/quantum-safe).

## Pas à pas {#run}

Vous travaillez dans votre propre terminal. Utilisez uniquement un compte de testnet jetable. Les QOR du testnet n'ont aucune valeur. N'utilisez jamais un vrai portefeuille ni de vrais fonds ici.

:::note Windows
qday-pay utilise les permissions de fichiers de Linux et macOS pour son fichier de clé, donc sous Windows vous le lancez dans **WSL** (Windows Subsystem for Linux). WSL vous donne un terminal Linux dans Windows. Tout ce qui suit applique alors les instructions Linux.
:::

### 1. Avant de commencer : installer les outils {#install}

Il vous faut trois outils : **Git** (télécharge le code), **Rust** (compile le programme) et un **compilateur C** (Rust en a besoin pour assembler le programme). Java, Node.js et Python ne sont pas nécessaires pour cette application.

**macOS**

| Outil | Comment l'installer | Comment le vérifier |
| --- | --- | --- |
| Compilateur C et Git | `xcode-select --install` (une fenêtre s'ouvre, cliquez sur Installer) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (appuyez sur Entrée pour accepter le choix par défaut), puis fermez et rouvrez le terminal | `rustc --version` et `cargo --version` |

**Linux (Debian ou Ubuntu ; les autres distributions utilisent leur propre gestionnaire de paquets)**

| Outil | Comment l'installer | Comment le vérifier |
| --- | --- | --- |
| Git et compilateur C | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (appuyez sur Entrée pour accepter le choix par défaut), puis fermez et rouvrez le terminal | `rustc --version` et `cargo --version` |

**Windows (via WSL)**

1. Ouvrez PowerShell en tant qu'administrateur et lancez `wsl --install`. Redémarrez l'ordinateur quand il le demande. Windows installe Ubuntu. Ouvrez l'application **Ubuntu** depuis le menu Démarrer.
2. Dans le terminal Ubuntu, suivez le tableau **Linux** ci-dessus.
3. Git pour Windows (https://git-scm.com/download/win) n'est pas nécessaire, car Git est installé par la commande Linux ci-dessus.

Rust 1.74 ou plus récent est requis. La commande `rustup` installe la dernière version, ce qui convient. La vérification de version doit afficher quelque chose comme `rustc 1.80.0`, ou un numéro plus élevé.

**Ce que vous devez voir :** `git --version`, `rustc --version` et `cargo --version` affichent chacun un numéro de version. Si une commande dit `command not found`, fermez le terminal, ouvrez-en un nouveau et réessayez.

### 2. Avant de commencer : obtenir un portefeuille de testnet et le faucet {#wallet}

Cette application crée son propre compte de testnet (étape 5), vous n'avez donc pas besoin d'installer un portefeuille pour la lancer. Il vous faut seulement un moyen de recevoir des QOR de testnet gratuits. Le faucet est un site web qui envoie gratuitement des QOR de testnet à une adresse.

Si vous voulez aussi voir votre compte dans le portefeuille QoreX, utilisez **QoreX sur le testnet** avec un compte jetable :

- **Application QoreX :** ouvrez les réglages et activez **Use testnet (developers)**.
- **Extension de navigateur QoreX :** déverrouillez-la, touchez 7 fois le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.

Vous n'avez besoin d'aucun compte Ethereum pour cette application. Elle utilise le type de compte QoreChain Native (une adresse `qor1...`).

**Faucet :** https://dashboard.qorechain.io/faucet. Connectez-vous, collez votre adresse et faites la demande. Le faucet verse **100 QOR par 24 heures et par compte**.

**Bon à savoir :** la toute première transaction d'un nouveau compte enregistre sa clé post-quantique ML-DSA-87 sur la chaîne. C'est des frais uniques d'environ 0,09 QOR. qday-pay le fait à l'étape 7.

**Montants :** l'unité que vous lisez est le **QOR**. La chaîne compte en **uqor**, la plus petite unité. 1 QOR = 1 000 000 uqor. Vous saisissez les montants en QOR (par exemple `1`) et le programme les convertit pour vous.

### 3. Récupérer le code {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**Ce que ça fait**

| Élément | Signification |
| --- | --- |
| `git clone <adresse>` | Télécharge une copie complète des applications d'exemple depuis GitHub dans un nouveau dossier nommé `build-before-qday`. |
| `cd <dossier>` | Place votre terminal dans le dossier de l'application Rust. Toutes les commandes suivantes s'exécutent depuis ici. |

**Ce que vous devez voir :** `Cloning into 'build-before-qday'...` puis votre invite dans le dossier `04-rust-qday-pay`. Lancez `ls` pour vérifier : vous voyez `Cargo.toml`, `Cargo.lock`, `README.md` et `src`.

### 4. Compiler le programme {#build}

```bash
cargo build --release
```

**Ce que ça fait :** `cargo` est l'outil de compilation de Rust. Cette commande télécharge les bibliothèques listées dans `Cargo.toml` et compile le programme en un seul fichier.

| Élément | Signification |
| --- | --- |
| `build` | Compiler le programme (sans le lancer pour l'instant). |
| `--release` | Produire la version rapide et optimisée. Sans cette option, vous obtenez une version de débogage plus lente, dans un autre dossier. |

**Durée :** 2 à 5 minutes la première fois, quelques secondes ensuite.

**Ce que vous devez voir :** de nombreuses lignes `Compiling ...`, puis `Finished release profile [optimized] target(s)`. Le programme est maintenant le fichier `./target/release/qday-pay`.

Vérifiez qu'il se lance :

```bash
./target/release/qday-pay
```

**Ce que ça fait :** lance le programme sans commande. Il affiche son aide et ne modifie rien.

**Ce que vous devez voir :**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

Ces cinq lignes sont les cinq commandes que vous utilisez ci-dessous. Dans la suite de cette page, `<commande>` signifie `./target/release/qday-pay <commande>`.

### 5. Créer un compte de testnet jetable {#new-account}

```bash
./target/release/qday-pay new
```

**Ce que ça fait :** crée un tout nouveau compte de testnet. Il génère une phrase de récupération secrète (le mnémonique) et l'enregistre dans un **fichier de clé**. À partir de cette seule phrase, il dérive vos deux clés : la clé classique secp256k1 et la clé post-quantique ML-DSA-87. La phrase n'est jamais affichée à l'écran.

| Élément | Signification |
| --- | --- |
| `new` | La commande : créer un compte et un fichier de clé. Elle refuse d'écraser un fichier de clé existant, elle ne peut donc pas détruire par erreur un compte approvisionné. |

**Où se trouve le fichier de clé :** `~/.config/qday/rust.env`. Le `~` désigne votre dossier personnel. Le fichier n'est lisible que par vous (mode 0600). Vous pouvez choisir un autre emplacement en définissant `QDAY_KEY_FILE`, par exemple `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. Dans ce cas, définissez la même variable devant chaque commande suivante.

:::warning Gardez le fichier de clé privé
Le fichier de clé est la clé du compte. Ne le partagez jamais, ne le collez jamais dans un chat ni dans une capture d'écran, et ne le versionnez jamais dans Git. Utilisez ce compte uniquement pour l'atelier et jamais sur le mainnet. Quand vous avez terminé, supprimez le fichier.
:::

**Ce que vous devez voir :**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

Copiez l'adresse `qor1...`.

### 6. Approvisionner le compte depuis le faucet {#faucet}

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et faites la demande. Vous recevez 100 QOR.
3. Attendez environ 10 secondes que le bloc contenant le paiement soit produit.

Le compte doit exister sur la chaîne avant que vous puissiez enregistrer une clé, et c'est le paiement du faucet qui le crée.

### 7. Vérifier le compte {#status}

```bash
./target/release/qday-pay status
```

**Ce que ça fait :** lit votre compte sur le testnet et affiche un résumé. Rien n'est envoyé.

**Ce que vous devez voir :**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Ligne | Signification |
| --- | --- |
| `network` | La chaîne avec laquelle le programme dialogue. Il ne fonctionne que sur le testnet `qorechain-diana` et refuse tout autre réseau. |
| `balance` | Vos QOR disponibles. |
| `ML-DSA-87` | Indique si votre clé post-quantique est enregistrée sur la chaîne. |
| `block` | La hauteur du dernier bloc. Elle ne cesse d'augmenter. |

### 8. Enregistrer la clé post-quantique {#register}

```bash
./target/release/qday-pay register
```

**Ce que ça fait :** envoie une transaction qui communique à la chaîne votre clé publique ML-DSA-87, accompagnée d'une **preuve de possession** (une preuve que vous détenez bien la clé secrète correspondante). La chaîne stocke la clé, et peut désormais vérifier vos signatures post-quantiques. Cela coûte des frais uniques d'environ 0,09 QOR. Vous pouvez la relancer sans risque : si la clé est déjà enregistrée, elle ne fait rien.

| Élément | Signification |
| --- | --- |
| `register` | La commande : enregistrer une fois votre clé ML-DSA-87. |

**Ce que vous devez voir :**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Envoyer un paiement signé en hybride {#send}

Remplacez `qor1...` par une adresse de testnet. Vous pouvez payer votre propre adresse, ou l'adresse de testnet d'un ami.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**Ce que ça fait :** construit un paiement, le signe deux fois (secp256k1 et ML-DSA-87), vérifie le coût en gas, l'envoie, attend qu'il soit dans un bloc, puis lance pour vous la vérification de l'étape 10.

| Élément | Signification |
| --- | --- |
| `send` | La commande : payer des QOR à une autre adresse. |
| `qor1...` (première valeur) | Le destinataire. Ce doit être une adresse `qor1`, sinon le programme s'arrête avec `not a qor1 address`. |
| `1` (deuxième valeur) | Le montant en QOR. `1` signifie 1 QOR, soit 1 000 000 uqor. Vous pouvez utiliser des décimales comme `0.5`. |
| `--memo "texte"` | Facultatif. Un mémo est un court texte joint à la transaction et stocké sur la chaîne. Mettez-le entre guillemets s'il contient des espaces. Tout le monde peut le lire, n'écrivez donc rien de privé. |

L'option `--memo` vient après le destinataire et le montant, comme dans l'exemple.

**Ce que vous devez voir :**

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

Les `fee` sont affichés en uqor et restent très inférieurs à 1 QOR. Le programme affiche aussi un lien `explorer` et une ligne `chain says` (étape 10). Copiez le hash de la transaction.

### 10. Vérifier n'importe quelle transaction {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**Ce que ça fait :** lit la transaction depuis la chaîne et contrôle trois choses, sans rien envoyer.

| Élément | Signification |
| --- | --- |
| `verify` | La commande : afficher le rapport de vérification. |
| `<TX_HASH>` | Le hash de 64 caractères de la transaction. Collez le hash de l'étape 9. Cela fonctionne pour n'importe quelle transaction du testnet. |

Les contrôles :

1. La transaction a réussi (code de résultat 0).
2. La chaîne a émis l'événement `pqc_hybrid_verify` avec `status=verified`. C'est la chaîne qui indique avoir vérifié la signature post-quantique.
3. La transaction porte une extension `PQCHybridSignature` avec une signature ML-DSA-87 de 4 627 octets, à côté de la signature secp256k1 de 64 octets.

**Ce que vous devez voir :** le même rapport qu'à l'étape 9, qui se termine par `VERIFIED: secp256k1 + ML-DSA-87`. Si un contrôle échoue, le rapport indique `NOT VERIFIED as hybrid` et le programme se termine avec le code 2.

### 11. La vérifier d'une seconde façon, sans notre programme {#verify-curl}

Vous pouvez interroger directement la chaîne. Il vous faut seulement `curl`, fourni avec macOS et la plupart des systèmes Linux. L'outil `jq` (facultatif) rend la réponse plus lisible. Installez-le avec `brew install jq` sur macOS ou `sudo apt install -y jq` sur Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Élément | Signification |
| --- | --- |
| `curl -s <adresse>` | Télécharge la réponse du service REST du testnet. `-s` masque la barre de progression. |
| `<HASH>` | Le hash de votre transaction. |
| `\| jq '...'` | Extrait trois valeurs. Sans `jq`, retirez cette partie et lisez le texte complet. |

**Ce que vous devez voir :**

- `"code": 0` dans la réponse (la transaction a réussi). Dans la sortie de `jq`, la première ligne est `0`.
- Une extension `PQCHybridSignature` (type `/qorechain.pqc.v1.PQCHybridSignature`) contenant la signature ML-DSA-87. Le texte en base64 fait 6 172 caractères, soit 4 627 octets.
- Dans `tx_response.events`, un événement de type `pqc_hybrid_verify` dont l'attribut `status` vaut `verified`.

**Dans l'explorateur :** ouvrez https://explore.qore.network, passez-le sur **Testnet**, et cherchez le hash de votre transaction. Le programme affiche aussi un lien direct.

### 12. Nettoyer {#cleanup}

Quand vous avez terminé, supprimez le fichier de clé jetable :

```bash
rm ~/.config/qday/rust.env
```

`rm` supprime un fichier. Ne le lancez que pour une clé de testnet dont vous n'avez plus besoin.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `command not found: cargo` ou `rustc` | Rust n'est pas installé, ou le terminal a été ouvert avant l'installation. | Installez Rust (étape 1), puis fermez et rouvrez le terminal. |
| `linker 'cc' not found` ou `linking with cc failed` | Il n'y a pas de compilateur C. | macOS : `xcode-select --install`. Ubuntu : `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | Aucun fichier de clé à cet endroit. | Lancez `./target/release/qday-pay new`, ou définissez le même `QDAY_KEY_FILE` qu'avant. |
| `cannot create ... it may already exist` | Un fichier de clé existe. Le programme n'en écrase jamais un. | Continuez à l'utiliser, ou supprimez-le avec `rm` s'il ne contient rien dont vous avez besoin, puis relancez `new`. |
| `account qor1... not found on chain yet; fund it first` | Le compte n'a pas encore de QOR, il n'existe donc pas sur la chaîne. | Demandez des QOR au faucet (étape 6), attendez environ 10 secondes, réessayez. |
| Le faucet indique que vous avez atteint une limite | Le faucet accepte une demande par 24 heures et par compte. | Attendez 24 heures, ou utilisez un second compte jetable. |
| `account has no PQC key and classical fallback is disabled` | Vous avez envoyé un paiement avant d'enregistrer la clé post-quantique. | Lancez `./target/release/qday-pay register`, puis renvoyez. |
| `not a qor1 address` | Le destinataire est incorrect, par exemple une adresse `0x...`. | Utilisez une adresse `qor1...`. |
| `transport error` ou `error sending request` | Pas d'internet, ou le testnet est brièvement injoignable. | Vérifiez votre connexion et réessayez dans une minute. |
| `NOT VERIFIED as hybrid` | La transaction a échoué ou n'était pas signée en hybride. | Lisez le `code` dans le rapport. Envoyez un nouveau paiement avec ce programme. |
| `pnpm: command not found` | Vous avez essayé une application JavaScript. Cette application Rust n'a pas besoin de pnpm. | Ignorez-le ici. Pour les applications JavaScript, lancez `npm install -g pnpm`. |
| `EVM authorisation window exhausted` | Concerne l'application Hardhat, pas celle-ci. | Dans cette application, ouvrez une nouvelle fenêtre avec `pnpm window open`. |
| Erreurs CORS | Concerne les applications de navigateur. Cette application en ligne de commande n'en a pas. | Dans une application de navigateur, utilisez le proxy `/lcd` du modèle. |

## Le compte {#account}

Le compte est un compte QoreChain Native secp256k1 (coin type 118, chemin `m/44'/118'/0'/0/0`, une adresse `qor1...`). La clé ML-DSA-87 vient de la même phrase de récupération grâce à la règle canonique liée à l'adresse du SDK (`authenticator::try_derive_pqc_canonical`). Une seule phrase de récupération restaure les deux clés.

## Le code du SDK qui compte {#code}

Voici le cœur de la commande `send` dans `src/main.rs` :

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

L'enregistrement tient en un appel : `PqcDx::ensure_pqc_registered()`. Il envoie `MsgRegisterPQCKeyV2` avec une preuve de possession uniquement quand aucune clé n'est encore enregistrée.

## Comment « verified » est décidé {#verified}

`verify` lit `GET /cosmos/tx/v1beta1/txs/{hash}` et contrôle :

- que la transaction a réussi (`code 0`) ;
- que la chaîne a émis `pqc_hybrid_verify` avec `status=verified` pour le signataire ;
- que le corps porte une extension `/qorechain.pqc.v1.PQCHybridSignature` avec une signature ML-DSA-87 de 4 627 octets (à côté de la signature secp256k1 de 64 octets).

## Ce que vous devez voir {#output}

- `new` affiche une adresse `qor1...` et l'emplacement du fichier de clé, jamais la phrase de récupération.
- `status` affiche le solde et indique si la clé ML-DSA-87 est enregistrée.
- `send` se termine par `VERIFIED: secp256k1 + ML-DSA-87` et un lien vers l'explorateur.
- Sur https://explore.qore.network (passé sur Testnet), la transaction apparaît sous son hash.

## Points d'accès au réseau {#access}

| | |
| --- | --- |
| Identifiant de chaîne Cosmos | `qorechain-diana` (testnet uniquement) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorateur | https://explore.qore.network (passer sur Testnet) |

## Paquets utilisés {#packages}

| Crate | Version | Rôle |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Comptes, signature hybride, client REST, aides de vérification |
| `tokio` | 1 | Exécution asynchrone |
| `serde_json` | 1 | Lecture des réponses JSON de la chaîne |
| `base64` | 0.22 | Mesure de la taille des signatures |
| `cosmrs` | 0.22 | Le type de message `Coin` |

## Code source {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
