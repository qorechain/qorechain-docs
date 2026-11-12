---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Application Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Application Java : Q-Day Tip Jar

Le **Q-Day Tip Jar** est un petit backend Java pour le testnet QoreChain (`qorechain-diana`, ID de chaîne EVM 9800). Il envoie des pourboires avec une **signature hybride** (secp256k1 classique plus ML-DSA-87 post-quantique, FIPS 204). Comme exemple de backend de boutique, il peut aussi surveiller l'adresse d'une tirelire et n'accepter que les pourboires dont la chaîne a vérifié la signature de l'expéditeur comme hybride.

## Ce que cela démontre {#what-it-shows}

- **La signature hybride ML-DSA-87 + secp256k1** depuis Java, avec un seul chemin d'appel dans le SDK.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne** : la chaîne émet un événement `pqc_hybrid_verify` avec `status=verified` pour le signataire, et la transaction porte une signature ML-DSA-87 de 4627 octets.
- **Un backend qui distingue les pourboires résistants au quantique des pourboires classiques** : `watch` étiquette chaque transfert entrant `QUANTUM-SAFE` ou `classical only`.

Pourquoi c'est important : une signature classique seule devrait pouvoir être cassée par un futur ordinateur quantique. Un service qui consulte le registre de vérification de la chaîne peut décider du degré de confiance à accorder à chaque paiement. Voir [Transactions résistantes au quantique](/sdk/guides/quantum-safe).

## Pas à pas {#run}

Tout ce qui suit s'exécute dans votre propre terminal (macOS, Linux, ou Windows avec WSL). Vous n'utilisez qu'un compte de testnet jetable. Les QOR de testnet n'ont aucune valeur, et vous n'utilisez jamais de vrai portefeuille ici.

### 1. Installer les outils {#install}

Il vous faut Git, un JDK 21 ou plus récent, et Maven. Vérifiez ce que vous avez :

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

Si `java` ou `mvn` est absent ou trop ancien, installez-les d'abord, par exemple avec [Temurin JDK 21](https://adoptium.net) et [Apache Maven](https://maven.apache.org/install.html), ou avec votre gestionnaire de paquets (`brew install openjdk@21 maven` sur macOS, `sudo apt install openjdk-21-jdk maven` sur Debian ou Ubuntu). Ouvrez un nouveau terminal et relancez les trois vérifications.

### 2. Récupérer le code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Compiler l'application {#build}

```bash
mvn -q package
```

Maven télécharge le SDK depuis Maven Central et construit un seul fichier exécutable, `target/tipjar.jar`. La première compilation prend moins d'une minute. Rendez ensuite le lanceur exécutable et vérifiez qu'il fonctionne :

```bash
chmod +x tipjar
./tipjar
```

Vous devriez voir la liste des commandes (`new`, `status`, `register`, `tip`, `watch`).

### 4. Créer votre compte de testnet jetable {#key}

```bash
./tipjar new
```

Cela génère une nouvelle phrase de récupération, l'écrit dans le fichier de clés `~/.config/qday/java.env` (lisible par vous seul, droits 0600) et n'affiche que l'adresse du compte, qui commence par `qor1...`. La phrase n'est jamais affichée. Ne partagez pas ce fichier, ne le commitez pas et ne le réutilisez pas sur le mainnet. Pour garder la clé ailleurs, définissez `TIPJAR_KEY=/path/to/file` avant chaque commande.

Copiez l'adresse `qor1...` de la sortie. Si vous la perdez, `./tipjar status` l'affiche de nouveau.

### 5. Obtenir des QOR de testnet depuis le faucet {#faucet}

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et demandez des jetons. Le faucet donne 100 QOR par 24 heures.
3. Vérifiez qu'ils sont arrivés :

```bash
./tipjar status
```

Le solde devrait afficher vos QOR de testnet, et la clé post-quantique devrait apparaître comme non encore enregistrée.

### 6. Enregistrer votre clé post-quantique {#register}

```bash
./tipjar register
```

Cela enregistre votre clé ML-DSA-87 sur la chaîne, une seule fois. Vous pouvez relancer la commande sans risque. Le message d'enregistrement lui-même est signé de façon classique par conception, car il n'existe pas encore de clé post-quantique pour signer ; il porte une preuve que vous détenez la nouvelle clé. Toutes les transactions suivantes sont signées de façon hybride.

### 7. Créer une seconde adresse pour recevoir des pourboires {#jar}

Un pourboire a besoin d'un destinataire. Créez un second compte jetable pour la tirelire, avec son propre fichier de clés :

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Copiez son adresse `qor1...`. C'est l'adresse de votre tirelire.

### 8. Envoyer un pourboire signé de façon hybride {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Remplacez `qor1...JAR_ADDRESS` par l'adresse de la tirelire de l'étape 7. `1` est le montant en QOR. Le mémo est facultatif. L'application simule la transaction pour fixer le gas, la signe avec les deux clés, la diffuse, attend le bloc et consulte le registre de vérification de la chaîne.

### 9. Surveiller la tirelire, comme le ferait un backend de boutique {#watch}

Ouvrez un second terminal dans le même dossier. Lancez la surveillance sur l'adresse de la tirelire, puis envoyez un autre pourboire depuis le premier terminal :

```bash
./tipjar watch qor1...JAR_ADDRESS
```

La surveillance interroge la chaîne toutes les 3 secondes et étiquette chaque pourboire entrant. Arrêtez-la avec Ctrl+C. Définissez `NO_COLOR=1` pour désactiver les couleurs. Les points de terminaison publics du testnet ont une limite de débit par IP : si un appel échoue, attendez une minute et réessayez.

## Ce que vous devriez voir {#output}

- Après `tip`, le terminal affiche le hash de la transaction et la hauteur du bloc, puis le résultat de la vérification : `QUANTUM-SAFE` quand la chaîne a vérifié la signature hybride, `CHECK FAILED` sinon.
- Dans `watch`, chaque pourboire est listé avec une étiquette `QUANTUM-SAFE` quand la chaîne a vérifié une signature hybride, ou `classical only` dans le cas contraire.
- Dans l'explorateur : ouvrez `https://explore.qore.network/tx/<HASH>` (avec le hash du terminal) et passez l'explorateur sur **Testnet**. La transaction apparaît comme réussie.

## Comment fonctionne la preuve {#proof}

L'application lit la transaction depuis le point de terminaison REST du testnet (`GET /cosmos/tx/v1beta1/txs/{hash}`) et cherche :

- un événement `pqc_hybrid_verify` avec `address=<signer>` et `status=verified` ;
- l'extension `/qorechain.pqc.v1.PQCHybridSignature` avec un `pqc_signature` de 4627 octets.

La surveillance lit exactement cela pour chaque transfert entrant.

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

Le compte est un compte QoreChain classique de type coin-118 (`m/44'/118'/0'/0/0`). La clé ML-DSA-87 est dérivée de la même phrase de récupération et liée à l'adresse avec `Authenticator.derivePqcCanonical`. Si vous construisez votre propre application sur les assistants fondés sur une graine, le SDK 0.13.0 exige un code de récupération ou un secret PQC indépendant de 32 octets ; voir [Installer le SDK](/sdk/install#whats-new-0130). N'affichez jamais un code de récupération.

## Paquets utilisés {#packages}

| Élément | Version |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Application `demo:tipjar` | 1.0.0 |

Voir [Installer le SDK](/sdk/install) pour le tableau des versions dans tous les langages.

## Où trouver les informations {#access}

| Quoi | Où |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passez sur Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
