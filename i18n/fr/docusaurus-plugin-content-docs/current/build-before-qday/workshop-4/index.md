---
slug: /build-before-qday/workshop-4
title: "Atelier 4 : rollups, IBC et QoreX pour les développeurs"
sidebar_label: "Atelier 4"
sidebar_position: 5
date: 2026-11-27
---

# Atelier 4 : rollups, IBC et QoreX pour les développeurs

L'atelier 4 descend sous la couche de l'application. D'abord, vous faites tourner un **rollup** qui se règle sur QoreChain : vous le créez, vous en retirez des fonds, vous prouvez ce qu'il a fait, puis vous trichez exprès et vous regardez la triche se faire prendre. Ensuite, vous envoyez des **QOR vers le testnet du Cosmos Hub et retour** via IBC. Enfin, vous voyez ce que le **portefeuille QoreX** vous apporte pendant que vous développez une dApp.

Chaque commande ci-dessous dit ce qu'elle fait et ce que vous devez voir. Le code est public : [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), dossier `workshop-4`. Tout ici fonctionne uniquement sur des testnets. Les jetons de test n'ont aucune valeur.

**Durée :** environ 45 minutes d'étapes. Le rollup a aussi une fenêtre de contestation d'une heure, pendant laquelle vous attendez. Les trois parties sont indépendantes : pendant que vous attendez dans la partie 1, vous pouvez faire la partie 2 ou la partie 3.

## Ce que nous construisons {#what-we-built}

| Partie | Application | Ce qu'elle montre |
| --- | --- | --- |
| 1 | **Un rollup** (Node.js, `@qorechain/rdk`) | Des batches dont l'ancre est signée avec ML-DSA-87, un retrait payé avec une preuve de Merkle, un reçu de règlement que n'importe qui peut vérifier, une fraude prouvée par un watchtower et une caution slashée. |
| 2 | **IBC aller et retour** (Node.js, `@qorechain/qoresign`, cosmjs) | Des QOR partent vers le testnet du Cosmos Hub et reviennent, transportés par QORel, le relayer de QoreChain. |
| 3 | **QoreX pour les développeurs** (un guide, sans nouveau code) | Les fournisseurs avec lesquels une dApp communique, les paquets d'intégration, le Mode développeur, le journal des requêtes et l'inspecteur de transactions. |

Les innovations derrière ces applications :

- **Un rollup dont le règlement est signé en post-quantique.** Le créateur signe la racine d'état de chaque batch honnête avec ML-DSA-87 (NIST FIPS 204), et la chaîne la conserve.
- **Des preuves de fraude que la chaîne vérifie elle-même.** Avec le registre `qledger-v1`, QoreChain réexécute un batch contesté. Il n'est nécessaire de faire confiance à personne pour dire qui avait raison.
- **Un ordre tiré de QoreChain.** Avec le séquencement basé, les transactions du rollup sont publiées dans une boîte de réception sur QoreChain, si bien que l'opérateur ne peut ni les réordonner ni omettre ce qui a été publié.
- **IBC avec une signature hybride côté QoreChain.** Le transfert qui quitte QoreChain est signé à la fois avec secp256k1 et ML-DSA-87.
- **Un portefeuille qui montre son travail.** QoreX consigne ce que chaque site a demandé et vous permet d'inspecter ce que la chaîne a enregistré.

## Les mots utilisés dans ce guide {#words}

| Mot | Sens simple |
| --- | --- |
| Rollup | Un système qui exécute ses propres transactions hors de la chaîne principale et envoie de temps en temps un court résumé à la chaîne principale |
| Batch | Un de ces résumés : le nouvel état du rollup et les retraits qu'il demande |
| Racine d'état | Une courte empreinte de tous les soldes du rollup |
| Rollup optimiste | Les batches sont acceptés immédiatement et ne deviennent définitifs que si personne ne prouve qu'ils sont faux pendant la fenêtre de contestation |
| Fenêtre de contestation | Le temps dont chacun dispose pour prouver qu'un batch est faux. Elle est d'une heure sur le testnet |
| Caution | De l'argent que l'opérateur verrouille et perd s'il ment |
| Watchtower | Un compte qui rejoue les transactions du rollup et signale un batch faux |
| `qledger-v1` | Un registre simple que la chaîne elle-même sait réexécuter. Les comptes qu'il contient signent avec ML-DSA-44 |
| Séquencement basé | L'ordre des transactions du rollup vient de la boîte de réception sur QoreChain, pas de l'opérateur |
| Ancre | La racine d'état du batch, signée par le créateur du rollup avec ML-DSA-87 et enregistrée sur la chaîne |
| Preuve de Merkle | Quelques hashs qui prouvent qu'un élément fait partie d'un ensemble plus grand, sans envoyer l'ensemble entier |
| IBC | La manière dont les chaînes Cosmos se transfèrent des jetons sans dépositaire : chaque chaîne fait tourner un client léger de l'autre et vérifie des preuves |
| Canal | Une voie entre deux chaînes |
| Voucher | Le jeton que l'autre chaîne crée pendant que vos QOR restent verrouillés sur QoreChain |
| Séquestre | Le compte sur QoreChain où les QOR envoyés attendent que le voucher revienne |
| Relayer | Un programme qui transporte des paquets et des preuves entre deux chaînes |

:::caution Des comptes de testnet jetables uniquement
Les scripts créent de nouveaux comptes pour vous. Gardez-les ainsi. Ne placez jamais dans un fichier ni dans une commande les mots secrets ou la clé d'un compte qui contient de l'argent réel.
:::

## Avant de commencer {#prerequisites}

Il vous faut un terminal, **Node.js 20 ou plus récent** et **Git** : voir [Avant de commencer](/build-before-qday/prerequisites). La partie 3 demande aussi **pnpm** et le portefeuille QoreX. Vérifiez Node.js :

```bash
node -v
```

Elle doit afficher `v20` ou plus. Récupérez le code d'exemple :

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

La première ligne télécharge les exemples dans un dossier nommé `build-before-qday`. La seconde entre dans le dossier `workshop-4`.

Chaque partie demande une quantité différente de QOR de test :

| Partie | Ce qu'il vous faut | D'où cela vient |
| --- | --- | --- |
| 1, compte opérateur | Environ 12 010 QOR de test : 10 000 de stake du rollup, 1 000 pour l'emplacement de sidechain, 1 000 de caution du soumetteur, et quelques-uns pour les dépôts et les frais | Le faucet donne 100 QOR par jour, ce qui ne suffit pas. Demandez à l'équipe du fest, sur les canaux de [build.qorechain.io](https://build.qorechain.io), une dotation de testnet plus importante |
| 1, compte watchtower | Quelques QOR de test pour les frais | Le [faucet](/dashboard/faucet) |
| 2 | Environ 2 QOR de test, plus un peu d'ATOM de test | Le [faucet](/dashboard/faucet). Le script demande des ATOM au faucet du testnet du Cosmos Hub |
| 3 | Un peu de QOR de test sur votre compte de testnet QoreX | Le [faucet](/dashboard/faucet) |

:::tip Pas de grosse dotation ? Vous pouvez tout de même suivre la partie 1
`node rollup.mjs rollups` ne demande aucun compte, et les étapes ci-dessous montrent ce que fait chaque commande.
:::

## Partie 1 : un rollup qui se règle sur QoreChain {#part-1}

Code : [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Paquet : `@qorechain/rdk`, le Rollup Development Kit.

Vous allez parcourir toute la vie d'un petit rollup optimiste : le créer, verrouiller un stake, déposer la caution de l'opérateur, faire un dépôt, soumettre un batch, attendre, retirer, construire un reçu, tricher et attraper la triche. Voir [Rollups](/rollups/overview) pour comprendre leur fonctionnement.

### Étape 1 : installer {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Partie | Ce qu'elle fait |
| --- | --- |
| `cd 01-rollup` | Entre dans le dossier de l'application rollup. |
| `npm install` | Télécharge les paquets que l'application utilise. Les versions sont fixées par `package.json` et `package-lock.json`. |
| `node rollup.mjs help` | Exécute le script et liste toutes les commandes. |

**Ce que vous devez voir :** la liste des commandes : `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### Étape 2 : regarder les rollups du testnet {#r2}

```bash
node rollup.mjs rollups
```

Lit la chaîne. Aucun compte n'est nécessaire.

**Ce que vous devez voir :** une première ligne avec le nombre de rollups ainsi que le stake et la caution que la chaîne demande aujourd'hui (10 000 QOR et 1 000 QOR au moment de la rédaction de ce guide), puis une ligne par rollup : son identifiant, s'il est actif, son mode de règlement (`optimistic` ou `zk`), son type de VM et le bloc où il a été créé.

**Pourquoi :** cela montre que les montants que vous allez payer viennent de la chaîne, pas du script.

### Étape 3 : créer deux comptes {#r3}

```bash
node rollup.mjs init
```

Crée deux comptes, l'**opérateur** et le **watchtower**. Leurs mots secrets sont enregistrés dans `~/.config/qday-w4/operator.json` et `watcher.json`, lisibles par vous seul, et ne sont jamais affichés. Le fichier de l'opérateur contient aussi deux graines aléatoires pour les clés de rollup de deux utilisateurs, Ana et Ben. Pour garder les fichiers ailleurs, définissez la variable d'environnement `QDAY_DIR`.

**Ce que vous devez voir :** deux adresses `qor1...`. Alimentez les deux, comme indiqué dans [Avant de commencer](#prerequisites).

**Pourquoi deux comptes :** celui qui signale un batch faux ne doit pas être celui qui l'a publié.

### Étape 4 : créer le rollup et soumettre le batch 0 {#r4}

```bash
node rollup.mjs prepare
```

Cette seule commande exécute toute la mise en place. Elle mémorise ce qu'elle a déjà fait dans `~/.config/qday-w4/rollup-state.json`, vous pouvez donc la relancer si quelque chose s'arrête à mi-chemin.

| Ce qu'elle envoie | Ce que cela fait |
| --- | --- |
| `createRollup` | Crée votre rollup avec l'exécution `qledger-v1` et le séquencement basé, et verrouille le stake. |
| `bondRollupSubmitter` | Verrouille la caution de 1 000 QOR. |
| Deux dépôts | 3 QOR pour Ana et 1 QOR pour Ben entrent dans le rollup. |
| Trois transactions de rollup | Ana paie 0,5 QOR à Ben, Ana retire 0,3 QOR, Ben retire 0,2 QOR. Chacune est signée avec la clé ML-DSA-44 de l'expéditeur et publiée dans la boîte de réception sur QoreChain. |
| `submitBatch` | Le script relit la boîte de réception, la réexécute pour obtenir la nouvelle racine d'état et la racine des retraits, et envoie le batch 0. Le RDK signe son ancre avec ML-DSA-87. |

**Ce que vous devez voir :** une ligne `ok` par transaction, avec le bloc et un lien vers l'explorateur. Puis l'état de votre rollup, avec le batch 0 affiché comme `submitted`.

### Étape 5 : attendre une heure, puis vérifier {#r5}

```bash
node rollup.mjs status
```

**Ce que vous devez voir :** le rollup, le stake de l'opérateur, le pool des retraits, la caution et chaque batch. Après la fenêtre de contestation d'une heure, le batch 0 affiche `finalized`.

**Pourquoi attendre :** un rollup optimiste est sûr parce qu'il reste du temps pour prouver qu'un batch est faux avant que l'argent ne sorte.

### Étape 6 : retirer vers QoreChain {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

Le retrait `0` correspond aux 0,3 QOR d'Ana et le retrait `1` aux 0,2 QOR de Ben. Dans cette démo, les deux sont payés au compte opérateur. Le script construit une preuve de Merkle montrant que le retrait se trouve dans la racine des retraits du batch 0, et la chaîne la vérifie contre la racine qu'elle a enregistrée avant de payer. Ensuite, le script envoie le même retrait une seconde fois.

**Ce que vous devez voir :** le nombre de hashs dans la preuve, une ligne `ok`, le solde du destinataire avant et après (le même compte a payé les frais), puis la seconde tentative marquée `REFUSED`. Un retrait n'est payé qu'une fois.

Si le batch 0 n'est pas encore définitif, la commande s'arrête et indique que les retraits ne sont payés qu'après la fenêtre de contestation.

### Étape 7 : un reçu de règlement {#r7}

```bash
node rollup.mjs receipt 0
```

Construit un petit fichier JSON qui décrit le batch 0 et l'enregistre à côté de vos clés. N'importe qui peut le vérifier : la vérification relit tout depuis QoreChain et ne fait pas confiance au fichier.

| Vérification | Ce qu'elle prouve |
| --- | --- |
| `rollupLayerBinding` | Le rollup appartient à la couche que nomme le reçu |
| `batchStateRoot` | Le batch de la chaîne porte exactement cette racine d'état |
| `anchorOnChain` | Une ancre comportant tous les champs du reçu existe sur la chaîne |
| `creatorAuthority` | La clé de signature a été lue sur la chaîne, pas dans le reçu |
| `pqcSignature` | La signature ML-DSA-87 sur l'ancre est valide |
| `chainBinding` | Le reçu appartient à cette chaîne et n'est pas une copie venue d'ailleurs |

**Ce que vous devez voir :** `VALID` avec une coche à côté de chacune des six vérifications. Ensuite, le script change un chiffre hexadécimal de la racine d'état et vérifie à nouveau : `NOT VALID`.

**Pourquoi c'est utile :** une plateforme d'échange, un auditeur ou un autre système peut vérifier l'état d'un rollup sans faire confiance à celui qui a envoyé le fichier.

### Étape 8 : un opérateur malhonnête {#r8}

```bash
node rollup.mjs cheat
```

Ben paie 0,1 QOR à Ana à l'intérieur du rollup, puis l'opérateur soumet le batch 1 avec un bit de la racine d'état inversé, exprès.

**Ce que vous devez voir :** deux lignes `ok`. La seconde indique que le batch a été publié avec une **racine d'état fausse**. La chaîne l'accepte pour l'instant : il reste une heure pour prouver qu'il est faux, et la caution de l'opérateur est en jeu.

### Étape 9 : le watchtower l'attrape {#r9}

```bash
node rollup.mjs watchtower
```

Cette commande utilise le compte watchtower, pas celui de l'opérateur.

| Étape | Ce qui se passe |
| --- | --- |
| 1 | Elle lit le batch 1 sur la chaîne. |
| 2 | Elle lit exactement la partie de la boîte de réception que le batch 1 a utilisée et la rejoue à partir de l'état qui suit le batch 0. On obtient la racine honnête. |
| 3 | Elle construit la preuve de fraude et la vérifie sur votre ordinateur. |
| 4 | Elle envoie `challengeBatch`. La chaîne réexécute elle-même le batch, le rejette et slashe la caution : une moitié est brûlée et l'autre va au watchtower. |

**Ce que vous devez voir :** la racine fausse et la racine honnête, le résultat de la vérification locale, une ligne `ok` pour la contestation, le batch marqué comme rejeté, et le solde du watchtower avant et après.

:::note Quelqu'un sera peut-être plus rapide que vous
Le testnet a déjà des watchtowers indépendants. Si l'un d'eux prouve la fraude en premier, ce qui peut prendre un seul bloc, votre script indique que le batch est déjà rejeté et n'exécute que la vérification locale. Dans les deux cas, l'opérateur perd la caution.
:::

Pour tricher à nouveau, reconstituez d'abord la caution :

```bash
node rollup.mjs bond
```

### Comment le code est organisé {#r-code}

Tout est dans un seul fichier, `rollup.mjs`. Chaque commande est une fonction de l'objet `cmds`, dans l'ordre des étapes ci-dessus. La fonction `connect()` transforme un fichier de compte en un client de transactions RDK qui signe chaque transaction QoreChain avec les deux clés, secp256k1 et ML-DSA-87.

## Partie 2 : des QOR vers le Cosmos Hub et retour {#part-2}

Code : [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Paquets : `@qorechain/qoresign` et cosmjs. Réseaux : le testnet QoreChain `qorechain-diana` et le testnet du Cosmos Hub `provider`.

Cette application envoie 0,5 QOR du testnet QoreChain vers le testnet du Cosmos Hub et les ramène. [QORel](https://github.com/qorechain/QORel), le relayer de QoreChain, transporte les paquets entre les deux chaînes. Au moment de la rédaction de ce guide, le testnet QoreChain avait dix canaux IBC : Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora et ixo. IBC fonctionne uniquement sur le testnet : il n'est pas en service sur le mainnet.

Comment cela fonctionne :

1. Une seule clé vous donne deux adresses : `qor1...` sur QoreChain et `cosmos1...` sur le Hub.
2. **Aller :** le transfert est signé sur QoreChain avec les deux clés, et la chaîne vérifie les deux. QORel transporte le paquet et une preuve jusqu'au Hub. Le client léger de QoreChain sur le Hub vérifie la preuve et crée un voucher pour les QOR.
3. **Retour :** sur le Hub, le transfert est signé de la manière habituelle du Hub. Le client léger du Hub sur QoreChain vérifie la preuve. Le voucher est brûlé et les QOR d'origine sont libérés.

:::info Deux limites à connaître
Le `channel-0` de QoreChain est le `channel-600` du Hub. Le nom du voucher sur le Hub est `ibc/` suivi du SHA-256 de `transfer/channel-600/uqor`. Sur chaque canal QOR du testnet, au plus 1 % de l'offre de QOR peut traverser en 24 heures, comme frein de sécurité.
:::

### Étape 1 : installer {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

La première ligne passe de `01-rollup` à `02-ibc`. Si vous êtes dans le dossier `workshop-4`, utilisez `cd 02-ibc`.

**Ce que vous devez voir :** la liste des commandes : `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### Étape 2 : une clé, deux chaînes {#i2}

```bash
node ibc.mjs init
```

Crée un compte et enregistre ses mots secrets dans `~/.config/qday-w4/traveler.json`, lisible par vous seul. Ils ne sont jamais affichés. `QDAY_DIR` change le dossier.

**Ce que vous devez voir :** l'adresse QoreChain du compte et son adresse Cosmos Hub. Collez l'adresse `qor1...` dans le [faucet](/dashboard/faucet).

### Étape 3 : lister les canaux {#i3}

```bash
node ibc.mjs channels
```

Lit chaque canal IBC du testnet QoreChain et la chaîne à l'autre bout. Aucun compte n'est nécessaire.

**Ce que vous devez voir :** une ligne par canal avec son état (`OPEN`), l'identifiant de l'autre chaîne et le nom du canal de ce côté-là. La dernière ligne montre que le mainnet n'a pas encore de canaux.

### Étape 4 : enregistrer votre clé post-quantique et obtenir des ATOM {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Commande | Ce qu'elle fait |
| --- | --- |
| `register` | Place votre clé publique ML-DSA-87 sur la chaîne, une seule fois. Les transactions QoreChain suivantes sont vérifiées avec elle. |
| `hub-faucet` | Demande au faucet public du testnet du Cosmos Hub des ATOM, qui paient les frais au retour. |
| `status` | Affiche vos QOR sur QoreChain, le voucher et les ATOM sur le Hub, et si votre clé est sur la chaîne. |

**Ce que vous devez voir :** après `status`, votre solde en QOR, `ML-DSA-87 key on chain: yes` et quelques ATOM. Si un solde est encore à zéro, attendez une minute et relancez `status`.

### Étape 5 : l'aller {#i5}

```bash
node ibc.mjs send 0.5
```

Construit un message de transfert de jetons (`MsgTransfer`, le standard ICS-20) sur `channel-0`, le signe avec les deux clés via QoreSign, puis attend que le voucher apparaisse sur le Hub.

**Ce que vous devez voir :** trois lignes numérotées : la transaction signée avec son numéro de paquet, le bloc et le lien vers l'explorateur ; QORel qui transporte le paquet ; et l'arrivée du voucher sur le Hub, avec le nombre de secondes que cela a pris. Chaque sens prend en général quelques secondes. Votre durée peut être différente.

### Étape 6 : et le retour {#i6}

```bash
node ibc.mjs back
```

Renvoie chaque voucher chez lui par `channel-600`. La transaction du Hub est signée avec un client cosmjs normal, au prix du gaz actuel du Hub. Ensuite, le script attend le retour des QOR.

**Ce que vous devez voir :** la transaction du Hub, puis le voucher brûlé sur le Hub et de simples QOR libérés sur QoreChain.

### Comment le code est organisé {#i-code}

Tout est dans un seul fichier, `ibc.mjs`. `sendTx()` construit et signe une transaction QoreChain hybride avec QoreSign. `hubWallet()` transforme les mêmes mots secrets en un portefeuille du Hub avec le préfixe `cosmos`. Chaque commande est une fonction de l'objet `cmds`.

## Partie 3 : QoreX pour les développeurs {#part-3}

Guide : [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). Il n'y a pas de nouveau code : vous utilisez le [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) de l'atelier 1.

Les étapes ci-dessous utilisent l'**extension de navigateur QoreX 0.4.5** sur Chrome ou Firefox. L'extension Safari est une version antérieure. L'application QoreX (1.2.5, iPhone et Android) a aussi le Mode développeur : vous l'activez dans les **Réglages**, comme expliqué dans [Mode développeur](/qorex/developer-mode).

### Avec quoi une dApp communique {#providers}

QoreX ajoute trois fournisseurs aux pages web :

| Fournisseur | Pour | Standard |
| --- | --- | --- |
| `window.ethereum` | Les dApps EVM. QoreX s'annonce aussi via EIP-6963 | EIP-1193 |
| `window.qorex.native` | Les transactions QoreChain natives, signées avec secp256k1 et ML-DSA-87 | API QoreX |
| `window.qorex.svm` | La voie SVM | API QoreX |

Ces paquets sur npm relient QoreX aux outils courants :

| Paquet | Usage |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | QoreX dans RainbowKit (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | QoreX dans Cosmos Kit et Interchain Kit |
| `@qorechain/qorex-types` | Types TypeScript pour `window.qorex` |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | Tester votre dApp avec QoreX dans des tests automatisés |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Construire et envoyer des transactions avec une signature hybride |

Voir [Intégration de dApp](/qorex/dapp-integration) pour les détails.

### Étape 1 : activer le Mode développeur {#x1}

Dans la fenêtre de l'extension, cliquez **sept fois** sur le numéro de version en bas de l'écran d'accueil. Une section **Mode développeur** apparaît avec **Outils développeur**, **Passer au testnet (diana)** et **Désactiver le mode développeur**. Cliquez sur **Passer au testnet (diana)**.

**Pourquoi en premier :** le journal des requêtes n'enregistre les requêtes que lorsque le Mode développeur est activé.

### Étape 2 : démarrer le Hybrid Inspector {#x2}

Depuis le dossier `workshop-4` :

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

La première ligne va dans l'application de l'atelier 1, `pnpm install` télécharge ses paquets et `pnpm dev` démarre une page web locale. Ouvrez l'adresse affichée (en général `http://localhost:5173`) et connectez QoreX.

### Étape 3 : envoyer une demande pendant que le portefeuille est verrouillé {#x3}

Cliquez sur **Verrouiller** dans QoreX. Dans l'Inspector, envoyez 0,001 QOR à votre propre adresse avec le mémo `Workshop 4`.

**Ce que vous devez voir :** QoreX demande votre mot de passe et **nomme le site** qui fait la demande. Après le déverrouillage, l'approbation affiche le montant, le destinataire et le mémo. Approuvez : la transaction est signée avec les deux clés. Si vous fermez la fenêtre à la place, la demande est refusée.

**Pourquoi c'est important :** rien n'est signé sans votre mot de passe, et vous savez quel site fait la demande.

### Étape 4 : ouvrir les Outils développeur {#x4}

Ouvrez **Outils développeur** et regardez sous **Transactions** :

- **Journal des requêtes :** ce que chaque site a demandé à QoreX, avec la méthode, les paramètres et ce que vous avez répondu.
- **Inspecteur de transactions :** collez un hash de transaction ou une demande dans **Hash ou demande** et cliquez sur **Inspecter**. Avec un hash, vous voyez ce que la chaîne a enregistré, sans quitter le portefeuille.

Il y a 17 outils développeur en tout. [Mode développeur](/qorex/developer-mode) explique chacun d'eux.

### Également nouveau dans QoreX 1.2.5 {#also-new}

- **Une fenêtre EVM manuelle n'autorise par défaut que les transferts de QOR.** Vous pouvez choisir une portée plus large, et vous voyez ce que vous accordez.
- **Multisignature PQC :** un compte partagé dont chaque membre signe en post-quantique.
- **Rotation et réparation de clé :** remplacez ou réparez votre clé ML-DSA-87 sur la chaîne sans changer d'adresse.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Que faire |
| --- | --- |
| `no operator account yet` | Lancez d'abord `node rollup.mjs init`. |
| `no rollup yet` | Lancez d'abord `node rollup.mjs prepare`. |
| `createRollup` est refusé faute de fonds | Le compte opérateur a besoin d'environ 12 010 QOR de test. Voir [Avant de commencer](#prerequisites). |
| `prepare` s'arrête à mi-chemin | Relancez la commande. Elle reprend à partir de ce qu'elle a déjà fait. |
| `withdrawals are paid only after the challenge window` | Le batch 0 n'est pas encore définitif. Vérifiez avec `node rollup.mjs status` et réessayez plus tard. |
| `nothing to challenge` | Lancez d'abord `node rollup.mjs cheat`. |
| Le batch est déjà rejeté quand vous lancez `watchtower` | Un autre watchtower du testnet a été plus rapide. C'est normal. |
| `no account "traveler"` | Lancez d'abord `node ibc.mjs init`. |
| `does not exist on chain yet` | Obtenez des QOR de test au faucet pour cette adresse, puis réessayez. |
| `nothing after 120 s` | Le relayer est peut-être occupé. Attendez une minute et lancez `node ibc.mjs status`. |
| Le journal des requêtes est vide | Activez le Mode développeur avant d'utiliser la dApp. |

## En savoir plus {#learn-more}

- Le fest, ses niveaux et ses tracks : [build.qorechain.io](https://build.qorechain.io).
- [Rollups](/rollups/overview) et le RDK. Le RDK est disponible pour TypeScript, Python, Rust, Go et Java, avec un outil en ligne de commande, `qorollup`, et un modèle de projet.
- Pour suivre les nouveaux batches à mesure qu'ils arrivent, regardez `watchBatches` dans le RDK : un point de départ pour un watchtower qui tourne toute la journée.
- [QORel](https://github.com/qorechain/QORel) est open source. Installez-le avec `brew install qorechain/tap/qorel` ou utilisez le conteneur `ghcr.io/qorechain/qorel`. Ne le faites tourner qu'avec vos propres clés.
- Pour essayer un autre canal dans la partie 2, modifiez `CHANNEL`, `HUB_CHANNEL` et les points de terminaison de l'autre chaîne dans `ibc.mjs`. `node ibc.mjs channels` les liste.
- [Mode développeur](/qorex/developer-mode) et [intégration de dApp](/qorex/dapp-integration) dans QoreX.
- [Atelier 3, QoreSeal](/build-before-qday/workshop-3#part-1), si votre rollup doit garder privées les données qu'il publie.
