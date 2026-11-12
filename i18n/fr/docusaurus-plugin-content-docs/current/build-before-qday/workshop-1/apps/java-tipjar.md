---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Application Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Application Java : Q-Day Tip Jar

Le **Q-Day Tip Jar** est un petit programme Java pour le testnet QoreChain (`qorechain-diana`, identifiant de chaîne EVM 9800). Il envoie des pourboires avec une **signature hybride** : une signature classique secp256k1 plus une signature post-quantique ML-DSA-87 (FIPS 204). Il peut aussi surveiller l'adresse d'une « tirelire » (jar), comme le ferait le serveur d'une boutique, et distinguer les pourboires résistants au quantique des pourboires classiques.

**Durée :** environ 20 minutes la première fois (10 minutes d'installation des outils, 5 minutes de mise en place, 5 minutes d'envoi et de vérification).

Vous n'avez pas besoin de connaître Java. Vous tapez simplement les commandes ci-dessous, une par une, et vous comparez le résultat avec « Ce que vous devez voir ».

## Ce que le programme montre {#what-it-shows}

- **La signature hybride ML-DSA-87 + secp256k1** depuis Java, avec un seul appel dans le SDK.
- **Une transaction signée en hybride et vérifiée sur la chaîne** : la chaîne enregistre un événement `pqc_hybrid_verify` avec `status=verified`, et la transaction porte une signature ML-DSA-87 de 4 627 octets.
- **Un serveur qui distingue les pourboires résistants au quantique des pourboires classiques** : `watch` étiquette chaque transfert entrant `QUANTUM-SAFE` ou `classical only`.

Pourquoi c'est important : une signature classique seule devrait pouvoir être cassée par un futur ordinateur quantique. Un service qui consulte le registre de vérification de la chaîne peut décider du degré de confiance à accorder à chaque paiement. Voir [Transactions résistantes au quantique](/sdk/guides/quantum-safe).

:::warning Testnet uniquement
Utilisez uniquement un compte de testnet jetable. Les QOR du testnet n'ont aucune valeur. N'utilisez jamais votre vrai portefeuille, votre vraie phrase de récupération ni de vrais fonds dans ce tutoriel.
:::

## Les mots que vous allez rencontrer {#words}

| Mot | Signification |
| --- | --- |
| Testnet | Une copie d'entraînement de QoreChain. Les pièces qui s'y trouvent sont gratuites et sans valeur. |
| QOR et uqor | Deux noms pour la même pièce. 1 QOR = 1 000 000 uqor. L'application demande des QOR. Les frais sont affichés en uqor. |
| Mémo | Un court texte joint à une transaction, comme la note d'un virement bancaire. |
| Adresse | Votre numéro de compte public. Sur QoreChain, elle commence par `qor1`. Vous pouvez la partager sans risque. |
| Fichier de clé | Un fichier contenant votre phrase de récupération secrète. Ne le partagez jamais. |
| Faucet | Un site web qui donne des QOR de testnet gratuits. |
| Hash | L'identifiant unique d'une transaction. Il sert à la retrouver. |

## Avant de commencer {#before}

Il vous faut trois outils : **Git** (télécharge le code), **Java 21 ou plus récent** (exécute l'application) et **Maven** (compile l'application). Après chaque installation, **fermez le terminal et ouvrez-en un nouveau**, puis lancez la commande de vérification.

| Outil | macOS | Windows | Linux (Debian ou Ubuntu) | Vérification |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew depuis https://brew.sh) | https://git-scm.com/download/win (cela installe aussi « Git Bash ») | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (choisissez Temurin 21, l'installateur .msi) | `sudo apt install openjdk-21-jdk` | `java -version` doit afficher 21 ou plus |
| Maven | `brew install maven` | Téléchargez le zip sur https://maven.apache.org/download.cgi et suivez https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

Sous Windows, utilisez **Git Bash** (installé avec Git) comme terminal pour ce tutoriel, car le lanceur `tipjar` est un script shell. Sous macOS, utilisez Terminal. Sous Linux, n'importe quel terminal convient. Si vous préférez PowerShell, voyez la note de l'étape 3.

**Sous macOS avec Homebrew :** `brew install openjdk@21` peut vous demander de le lier. Si `java -version` affiche encore une ancienne version, lancez ce que Homebrew affiche sous « For the system Java wrappers to find this JDK », puis ouvrez un nouveau terminal.

## Obtenir un portefeuille de testnet et des QOR gratuits {#wallet}

L'application crée sa propre clé jetable (étape 4 ci-dessous), vous n'avez donc pas strictement besoin d'une application de portefeuille pour ce tutoriel. Il vous faut en revanche un endroit où obtenir des QOR de testnet. Si vous voulez aussi voir votre compte dans QoreX :

1. **Application QoreX :** ouvrez les réglages, puis activez **Use testnet (developers)**.
2. **Extension de navigateur QoreX :** déverrouillez-la, touchez 7 fois le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.

Les QOR gratuits viennent du faucet sur https://dashboard.qorechain.io/faucet. Vous vous connectez, collez l'adresse et faites la demande. Il verse **100 QOR par 24 heures et par compte**.

La toute première transaction d'un nouveau compte enregistre sa clé post-quantique ML-DSA-87 sur la chaîne. C'est une étape unique, avec des frais d'environ 0,09 QOR. L'application s'en charge pour vous avec la commande `register`.

## Pas à pas {#run}

### 1. Télécharger le code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**Ce que ça fait**

- `git clone <adresse>` : copie le projet depuis GitHub dans un nouveau dossier nommé `build-before-qday` sur votre ordinateur.
- `cd <dossier>` : place votre terminal dans le dossier de l'application Java. Toutes les commandes suivantes doivent être lancées depuis ce dossier.

**Ce que vous devez voir :** des lignes comme `Cloning into 'build-before-qday'...`, puis votre invite dans le nouveau dossier.

### 2. Compiler l'application {#build}

```bash
mvn -q package
```

**Ce que ça fait :** Maven télécharge le SDK QoreChain depuis Maven Central et assemble l'application en un seul fichier exécutable, `target/tipjar.jar`.

| Élément | Signification |
| --- | --- |
| `mvn` | L'outil de compilation Maven. |
| `package` | Compiler le code et l'assembler dans un fichier `.jar`. |
| `-q` | Mode silencieux : n'afficher que les problèmes. |

**Ce que vous devez voir :** rien pendant quelques secondes (environ 10 secondes la première fois, un peu plus avec une connexion lente), puis votre invite revient. Vérifiez que le fichier existe :

```bash
ls target/tipjar.jar
```

**Ce que vous devez voir :** `target/tipjar.jar`.

### 3. Rendre le lanceur exécutable et le tester {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**Ce que ça fait**

| Élément | Signification |
| --- | --- |
| `chmod +x tipjar` | Autorise le fichier `tipjar` à être lancé comme un programme. Un fichier fraîchement téléchargé n'a pas cette permission. |
| `./tipjar` | Lance le lanceur présent dans ce dossier. Il démarre `java -jar target/tipjar.jar`. Sans commande, il affiche l'aide. |

**Ce que vous devez voir :** une liste de commandes : `new`, `status`, `register`, `tip`, `watch`.

:::note PowerShell sous Windows
Ignorez `chmod`. Remplacez `./tipjar` par `java -jar target/tipjar.jar` dans toutes les commandes ci-dessous.
:::

### 4. Créer votre compte de testnet jetable {#key}

```bash
./tipjar new
```

**Ce que ça fait :** crée un compte tout neuf. Il écrit une phrase de récupération secrète dans le fichier de clé `~/.config/qday/java.env` (dans votre dossier personnel, lisible uniquement par vous) et n'affiche que l'adresse publique.

| Élément | Signification |
| --- | --- |
| `new` | Créer un nouveau fichier de clé et afficher son adresse. |
| `new --force` | Remplacer un fichier de clé existant. L'ancienne clé est perdue. |

**Ce que vous devez voir :** `new jar key`, le chemin du fichier de clé, et une `address` qui commence par `qor1...`. La phrase de récupération n'est jamais affichée.

**Copiez l'adresse `qor1...`.** Si vous la perdez, `./tipjar status` l'affiche de nouveau. Ne partagez jamais le fichier de clé, ne le versionnez jamais dans Git et ne le réutilisez jamais sur le mainnet. Pour garder la clé ailleurs, définissez d'abord `TIPJAR_KEY` : `TIPJAR_KEY=/path/to/file ./tipjar status` (dans PowerShell : `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Obtenir des QOR de testnet depuis le faucet {#faucet}

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et appuyez sur le bouton de demande.
3. Attendez quelques secondes, puis lancez :

```bash
./tipjar status
```

**Ce que ça fait :** demande au testnet votre solde et si votre clé post-quantique est enregistrée.

**Ce que vous devez voir :** `balance   100 QOR` (ou le montant du faucet) et une ligne indiquant que la clé ML-DSA-87 n'est pas encore enregistrée. Si le solde est 0, attendez 10 secondes et relancez la commande.

### 6. Enregistrer votre clé post-quantique {#register}

```bash
./tipjar register
```

**Ce que ça fait :** enregistre votre clé ML-DSA-87 sur la chaîne, une seule fois. Vous pouvez la relancer sans risque. Cette première transaction est signée avec la clé classique uniquement, car aucune clé post-quantique n'est encore enregistrée sur la chaîne pour signer. Elle coûte environ 0,09 QOR. Toutes les transactions suivantes sont signées en hybride.

**Ce que vous devez voir :** un hash de transaction et un message indiquant que la clé est enregistrée. Relancez `./tipjar status` : il doit maintenant montrer la clé comme enregistrée.

**Durée :** quelques secondes (un bloc).

### 7. Créer une seconde adresse pour recevoir les pourboires {#jar}

Un pourboire a besoin de quelqu'un pour le recevoir. Créez un second compte jetable, la « tirelire » (jar), avec son propre fichier de clé :

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**Ce que ça fait :** la partie avant `./tipjar` définit le fichier de clé pour cette seule commande (`TIPJAR_KEY`), de sorte que le nouveau compte n'écrase pas le premier. Sous Windows PowerShell, lancez d'abord `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"`, puis `java -jar target/tipjar.jar new`, et réinitialisez ensuite avec `Remove-Item Env:TIPJAR_KEY`.

**Ce que vous devez voir :** une nouvelle adresse `qor1...`. Copiez-la. C'est votre **adresse de tirelire**. La tirelire n'a besoin d'aucun QOR pour recevoir des pourboires.

### 8. Envoyer un pourboire signé en hybride {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Remplacez `qor1...JAR_ADDRESS` par l'adresse de tirelire de l'étape 7.

| Élément | Signification |
| --- | --- |
| `tip` | Envoyer un pourboire. |
| `qor1...JAR_ADDRESS` | Qui reçoit le pourboire. |
| `1` | Le montant en QOR (donc 1 QOR = 1 000 000 uqor). |
| `"my first quantum-safe tip"` | Le mémo, un court texte joint à la transaction. Facultatif. Gardez les guillemets s'il contient des espaces. |

**Ce que ça fait :** l'application demande à la chaîne combien de gas la transaction nécessite (un essai à blanc), ajoute 30 pour cent de marge de sécurité, signe avec les deux clés, envoie la transaction, attend le bloc, puis consulte le registre de la chaîne elle-même.

**Ce que vous devez voir :** le hash de la transaction, la hauteur du bloc, et le résultat `QUANTUM-SAFE`. Si vous voyez `CHECK FAILED`, consultez le dépannage. Copiez le hash.

**Durée :** environ 10 secondes.

### 9. Surveiller la tirelire, comme le ferait le serveur d'une boutique {#watch}

Ouvrez un **second terminal**, placez-vous dans le même dossier et lancez la surveillance :

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Retournez maintenant dans le premier terminal et envoyez un pourboire de plus (étape 8, avec un nouveau mémo).

**Ce que ça fait :** `watch` interroge la chaîne toutes les 3 secondes pour trouver les nouveaux transferts vers la tirelire et étiquette chacun d'eux. `NO_COLOR=1 ./tipjar watch ...` désactive les couleurs. Arrêtez-le avec Ctrl+C.

**Ce que vous devez voir :** chaque pourboire listé avec l'étiquette `QUANTUM-SAFE`. Un pourboire envoyé sans signature hybride vérifiée afficherait `classical only`.

## Vérifier la transaction vous-même {#verify}

Vous n'avez pas à faire confiance à l'application. Interrogez directement la chaîne.

**Méthode 1, dans le navigateur.** Ouvrez `https://explore.qore.network/tx/<HASH>` (mettez votre hash à la place de `<HASH>`), puis passez l'explorateur sur **Testnet**. Vous devez voir une transaction réussie.

**Méthode 2, une commande.** Mettez votre hash à la place de `<HASH>` :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Élément | Signification |
| --- | --- |
| `curl` | Un outil qui télécharge une adresse web. Intégré à macOS, Windows 10+ et à la plupart des systèmes Linux. |
| `-s` | Silencieux : masque la barre de progression. |
| l'adresse | L'API REST publique du testnet. Elle renvoie le registre complet de la transaction en JSON. |

**Ce que vous devez voir** dans la longue sortie (utilisez un lecteur JSON ou ajoutez `| jq .` si vous avez installé jq) :

- `"code": 0` signifie que la transaction a réussi.
- Une extension `PQCHybridSignature` contenant un `pqc_signature` de **4 627 octets** (c'est la signature ML-DSA-87).
- Un événement `pqc_hybrid_verify` dont `status` vaut `verified` pour votre adresse.

## Comment fonctionne la preuve {#proof}

L'application lit le même enregistrement depuis `GET /cosmos/tx/v1beta1/txs/{hash}` et cherche l'événement `pqc_hybrid_verify` (`address=<signer>`, `status=verified`) et l'extension `/qorechain.pqc.v1.PQCHybridSignature` avec une signature de 4 627 octets. La surveillance fait la même chose pour chaque transfert entrant.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `./tipjar: Permission denied` | Un fichier fraîchement téléchargé n'est pas marqué comme exécutable. | Lancez `chmod +x tipjar`. |
| `build first: (cd ... && mvn -q package)` | Le fichier jar est absent. | Lancez `mvn -q package` dans ce dossier (étape 2). |
| `mvn: command not found` ou `java: command not found` | Outil non installé, ou terminal non rouvert. | Installez-le (voir Avant de commencer), ouvrez un nouveau terminal, vérifiez la version. |
| Java indique la version 17 ou moins | Un Java plus ancien passe en premier dans votre chemin. | Installez Java 21, ouvrez un nouveau terminal, relancez `java -version`. |
| `no key file at ..., run new first` | Vous avez sauté l'étape 4, ou `TIPJAR_KEY` pointe ailleurs. | Lancez `./tipjar new`. |
| `key file already exists` | Vous avez déjà créé une clé. | Gardez-la, ou remplacez-la avec `./tipjar new --force` (l'ancienne clé est perdue). |
| `account has no PQC key and classical fallback is disabled` | La clé post-quantique n'est pas encore enregistrée. | Lancez d'abord `./tipjar register`. |
| `EVM authorisation window exhausted` | Ce message concerne les applications EVM (counter, guestbook). Le Tip Jar ne l'utilise pas. | Dans les applications EVM, ouvrez une nouvelle fenêtre avec `pnpm window open`. |
| `HHE10402` après l'ouverture de la fenêtre | Applications Hardhat uniquement : la fenêtre n'était pas encore active. | Dans les applications Hardhat, relancez le déploiement. |
| Le solde est 0 ou `not on chain yet` | Les jetons du faucet ne sont pas encore arrivés. | Attendez 10 secondes, lancez `./tipjar status`. Vérifiez que vous avez collé la bonne adresse. |
| Le faucet indique une limite de débit | Une demande par 24 heures et par compte. | Attendez, ou utilisez un second compte jetable. |
| `chain refused the tx` ou `poll failed` | Le testnet est occupé ou en cours de mise à niveau, ou le point d'accès public limite les requêtes par adresse IP. | Attendez une minute et relancez la commande. |
| `recipient must be a qor1... address` | L'adresse est fausse ou contient des espaces. | Copiez de nouveau l'adresse complète `qor1...`. |
| Erreurs `CORS` dans un navigateur | Seulement quand une page web appelle directement la chaîne. Cette application ne le fait pas. | Dans une application de navigateur, utilisez le proxy `/lcd` du modèle. |
| `pnpm: command not found` | pnpm n'est pas installé. Il n'est pas nécessaire ici. | Uniquement pour le tutoriel Hardhat : lancez `npm install -g pnpm`. |

## Le code du SDK qui compte {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

Le gas n'est jamais fixe : chaque transaction est d'abord simulée et reçoit le gas simulé multiplié par 1,3, au prix de 0,15 uqor par unité de gas.

Le compte est un compte QoreChain classique coin-118 (`m/44'/118'/0'/0/0`). La clé ML-DSA-87 est dérivée de la même phrase de récupération et liée à l'adresse avec `Authenticator.derivePqcCanonical`. Si vous construisez votre propre application avec les aides basées sur la graine à la place, le SDK 0.13.0 exige un code de récupération ou un secret PQC indépendant de 32 octets ; voir [Installation du SDK](/sdk/install#whats-new-0130). N'affichez jamais un code de récupération.

## Paquets utilisés {#packages}

| Élément | Version |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Application `demo:tipjar` | 1.0.0 |

Voir [Installation du SDK](/sdk/install) pour le tableau des versions dans tous les langages.

## Où trouver les informations {#access}

| Quoi | Où |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passer sur Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
