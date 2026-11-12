---
slug: /build-before-qday/workshop-1
title: "Atelier 1 : votre première transaction signée de façon hybride"
sidebar_label: "Atelier 1"
sidebar_position: 2
date: 2026-11-12
---

# Atelier 1 : votre première transaction signée de façon hybride

Ce guide vous mène d'un ordinateur sans aucun outil installé jusqu'à une transaction signée avec deux clés à la fois et vérifiée par le testnet QoreChain. Vous n'avez pas besoin d'être développeur. Chaque commande est expliquée en termes simples, et chaque étape se termine par ce que vous devez voir à l'écran.

**Durée :** environ 30 minutes la première fois, installation des outils comprise. Environ 10 minutes si les outils sont déjà installés.

## Ce que nous construisons {#what-we-built}

Un projet Solidity complet (un petit contrat intelligent) créé avec une seule commande, testé, déployé sur le testnet QoreChain, puis une transaction signée avec **deux clés à la fois** et contrôlée par la chaîne.

Ce que cela démontre :

- **La signature hybride.** La transaction porte une signature classique secp256k1 et une signature post-quantique ML-DSA-87 (NIST FIPS 204). Les deux doivent être valides.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne.** Les validateurs vérifient les deux signatures. Vous lisez la preuve sur le point de terminaison REST public (l'extension `PQCHybridSignature` et l'événement `pqc_hybrid_verify`) et dans l'explorateur.
- **La fenêtre d'autorisation EVM.** Une transaction Ethereum ne peut pas porter de signature post-quantique. Sur QoreChain, vous enregistrez donc votre clé ML-DSA-87 une fois, puis vous ouvrez une courte fenêtre, avec un message signé de façon hybride, pendant laquelle vos transactions EVM habituelles sont admises. Voir [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes) pour l'idée en détail.

C'est exactement ce que demande le niveau Quantum Pass.

## Les mots utilisés dans ce guide {#words}

| Mot | Sens simple |
| --- | --- |
| Terminal | La fenêtre où vous tapez les commandes. Terminal sur macOS et Linux, PowerShell sur Windows |
| Testnet | Une copie d'entraînement de QoreChain. Ses pièces n'ont aucune valeur |
| QOR et uqor | QOR est la pièce. uqor est sa plus petite unité. 1 QOR = 1 000 000 uqor |
| Transaction | Une instruction signée envoyée à la chaîne |
| Mémo | Un court texte joint à une transaction |
| Clé privée | Un secret qui signe pour votre compte. Celui qui la détient contrôle le compte |
| Code de récupération | Un second secret (il commence par `QRC1`) à partir duquel votre clé post-quantique est créée |
| Hash | L'identifiant unique d'une transaction. Il sert à la retrouver |
| Gas et frais | Le petit prix payé en QOR pour que la chaîne traite une transaction |

:::caution Un compte de testnet jetable uniquement
Utilisez une clé créée pour cet exercice, qui ne contient que des QOR de test. N'utilisez jamais un vrai portefeuille ni de vrais fonds. Ne placez jamais dans le fichier `.env` la clé ni le code de récupération d'un compte qui contient de l'argent réel, et ne partagez jamais `.env` et ne le versionnez jamais (commit).
:::

## Avant de commencer {#prerequisites}

Il vous faut un ordinateur sous macOS, Windows ou Linux, un terminal et un navigateur web. Pour ce tutoriel, vous installez deux outils : **Node.js 22 ou plus récent** (Hardhat 3, l'outil de projet utilisé ici, exige la version 22) et **pnpm** (l'outil qui télécharge les bibliothèques du projet). Un outil facultatif, **jq**, sert seulement à rendre plus lisible le résultat d'une vérification.

Ouvrez d'abord un terminal. Sur macOS, ouvrez **Terminal**. Sur Windows, ouvrez **PowerShell**. Sous Linux, ouvrez votre application de terminal.

### Node.js 22 ou plus récent {#install-node}

1. Vérifiez si vous l'avez déjà :

```bash
node -v
```

Elle doit afficher `v22` ou un nombre supérieur. Si elle affiche `command not found` ou une version plus ancienne, installez Node.js comme ci-dessous.

2. Installez-le pour votre système :

| Système | Comment l'installer |
| --- | --- |
| macOS | Téléchargez l'installateur sur [nodejs.org/en/download](https://nodejs.org/en/download), ou lancez `brew install node@22` si vous utilisez Homebrew |
| Windows | Lancez `winget install OpenJS.NodeJS.LTS` dans PowerShell, ou téléchargez l'installateur sur [nodejs.org/en/download](https://nodejs.org/en/download) |
| Linux | Lancez `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, fermez et rouvrez le terminal, puis lancez `nvm install 22` |

3. Fermez le terminal, ouvrez-en un nouveau et relancez `node -v`.

**Ce que vous devez voir :** un nombre qui commence par `v22` ou plus, par exemple `v22.12.0`.

### pnpm {#install-pnpm}

1. Vérifiez si vous l'avez déjà :

```bash
pnpm -v
```

2. Si elle affiche `command not found` (ou `pnpm: command not found`), installez-le :

```bash
npm install -g pnpm
```

| Élément | Signification |
| --- | --- |
| `npm` | L'outil de paquets fourni avec Node.js |
| `install` | Télécharger et installer un programme |
| `-g` | Global : l'installer pour tout l'ordinateur, et non pour un seul dossier |
| `pnpm` | Le programme à installer |

Node.js installé avec Homebrew n'inclut pas pnpm. C'est pourquoi `pnpm: command not found` est fréquent sur macOS : la commande ci-dessus règle le problème. Sous Linux ou macOS, si vous voyez une erreur de permissions, lancez plutôt `corepack enable`, puis relancez `pnpm -v`.

3. Vérifiez à nouveau avec `pnpm -v`.

**Ce que vous devez voir :** un numéro de version, par exemple `9.12.0` ou plus.

### jq (facultatif) {#install-jq}

`jq` affiche une longue réponse sous une forme courte et lisible. Il n'est utilisé qu'une fois, à l'étape 8.

| Système | Installation | Vérification |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian et Ubuntu) | `jq --version` |

`curl`, utilisé à l'étape 8, est déjà présent sur macOS, Linux et Windows 10 ou plus récent. Dans Windows PowerShell, tapez `curl.exe` au lieu de `curl`.

## Votre portefeuille de testnet et le faucet {#wallet}

Le projet crée lui-même un compte jetable à l'étape 3, vous n'avez donc pas besoin d'un portefeuille pour terminer ce guide. Il vous faut en revanche des QOR de testnet sur ce compte, et vous pouvez aussi configurer le portefeuille QoreX sur le testnet pour l'utiliser avec les applications d'exemple.

**QoreX sur le testnet (facultatif ici, nécessaire pour les applications d'exemple dans le navigateur) :**

1. Dans l'**application QoreX** : ouvrez **Réglages** (Settings) et activez **Use testnet (developers)**.
2. Dans l'**extension de navigateur QoreX** : déverrouillez-la, touchez 7 fois le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.
3. Pour tout ce qui concerne le côté Ethereum (EVM), choisissez aussi **Add an Ethereum account (coin 60)**. Cela vous donne un compte avec une adresse `0x...` qui fonctionne avec les outils Ethereum.

**Le faucet** est une machine gratuite qui distribue des QOR de testnet. Vous l'utilisez à l'étape 4 :

- Adresse : [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). Vous vous connectez d'abord.
- Montant : 100 QOR, une fois toutes les 24 heures par compte.
- La toute première transaction d'un nouveau compte enregistre sa clé post-quantique ML-DSA-87. Cela coûte des frais uniques d'environ 0,09 QOR, donc 100 QOR suffisent largement.

Les informations réseau utilisées dans ce guide :

| Service | URL |
| --- | --- |
| Testnet | `qorechain-diana`, ID de chaîne EVM 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passez sur Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (connexion requise) |

## Étapes {#steps}

### Étape 1 : vérifier vos outils {#step-1}

**Durée :** 1 minute.

```bash
node -v
```

| Élément | Signification |
| --- | --- |
| `node` | Le programme Node.js |
| `-v` | Afficher sa version, puis s'arrêter |

```bash
pnpm -v
```

| Élément | Signification |
| --- | --- |
| `pnpm` | L'outil de paquets |
| `-v` | Afficher sa version, puis s'arrêter |

**Ce que vous devez voir :** `v22` ou plus pour Node.js, et un numéro de version pour pnpm. Sinon, retournez à « Avant de commencer ».

### Étape 2 : créer le projet et lancer les tests {#step-2}

**Durée :** environ 1 minute. Il faut un accès à Internet.

1. Créez le projet dans un nouveau dossier. Dans votre terminal, placez-vous dans un dossier où vous rangez vos projets (par exemple Documents), puis lancez :

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

Ce que fait la commande : elle télécharge le créateur de projets QoreChain et construit un projet prêt à l'emploi nommé `qday-demo` dans un nouveau dossier.

Paramètres :

- `npx` : exécute un programme depuis Internet sans l'installer définitivement.
- `create-qorechain-dapp@latest` : le créateur de projets QoreChain. `@latest` signifie « utiliser la version la plus récente » (ce guide a été vérifié avec la 0.14.0).
- `qday-demo` : le nom du nouveau dossier et du projet. Vous pouvez en choisir un autre.
- `-t hardhat` : `-t` signifie modèle (template). Cela choisit le modèle Hardhat : un projet de contrat Solidity avec des tests.
- `--network testnet` : le réseau QoreChain avec lequel le projet communique. `testnet` est le réseau d'entraînement.
- `--package-manager pnpm` : l'outil qui installe les bibliothèques dont le projet a besoin.

**Ce que vous devez voir :** une liste de paquets installés, puis `Done! Created qday-demo`. S'il propose d'installer `create-qorechain-dapp`, répondez `y`.

2. Entrez dans le dossier du projet :

```bash
cd qday-demo
```

Ce que fait la commande : elle déplace votre terminal dans le nouveau dossier. Toutes les commandes suivantes se lancent d'ici.

Paramètres :

- `cd` : changer de dossier (change directory).
- `qday-demo` : le dossier dans lequel entrer.

3. Lancez les tests :

```bash
pnpm test
```

Ce que fait la commande : elle compile le contrat et vérifie qu'il fonctionne, sur une petite chaîne simulée à l'intérieur de votre ordinateur. Elle n'envoie rien au vrai testnet.

Paramètres :

- `pnpm` : l'outil de paquets.
- `test` : le nom du script à lancer (il figure dans `package.json` ; il exécute `hardhat test`).

**Ce que vous devez voir :**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Regardez ce que vous avez obtenu (facultatif) :

| Fichier | Ce que c'est |
| --- | --- |
| `contracts/Counter.sol` | Le contrat intelligent : il stocke un nombre et peut lui ajouter 1 |
| `ignition/modules/Counter.ts` | La recette qui déploie le contrat |
| `scripts/window.ts` | L'assistant derrière `pnpm window` : enregistrer votre clé et ouvrir la fenêtre d'autorisation |
| `hardhat.config.ts` | Les réglages, dont le réseau `qorechainTestnet` (ID de chaîne 9800) |
| `.env` | Votre fichier de réglages secrets. Vous le remplissez à l'étape 3. Ne le partagez jamais |

Plus de détails sur les modèles : [Générateurs et CLI](/developer-tools/scaffolders-and-cli) et [Kit de développement de chaîne](/developer-tools/chain-dev-sdk).

### Étape 3 : créer un compte de testnet jetable {#step-3}

**Durée :** 3 minutes.

Le compte a besoin de deux secrets : une **clé privée** de type Ethereum, et un **code de récupération** (il commence par `QRC1`) à partir duquel la clé post-quantique ML-DSA-87 est créée. Les deux vont dans le fichier `.env` du dossier de votre projet. Ce fichier reste privé, sur votre ordinateur.

1. Créez une nouvelle clé privée. Commencez par créer un petit fichier nommé `make-key.mjs` dans le dossier `qday-demo`, avec ce contenu (utilisez n'importe quel éditeur de texte, comme Bloc-notes, TextEdit en mode texte brut ou nano) :

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

Ce que fait ce fichier : il crée une clé privée aléatoire et l'écrit dans votre fichier `.env`, de sorte qu'elle n'est jamais affichée à l'écran ni recopiée à la main.

2. Lancez-le :

```bash
node make-key.mjs
```

Ce que fait la commande : elle exécute le petit fichier avec Node.js.

Paramètres :

- `node` : le programme Node.js.
- `make-key.mjs` : le fichier à exécuter.

**Ce que vous devez voir :** `New private key saved in .env`. Ne le lancez qu'une seule fois : une seconde exécution crée un autre compte.

3. Créez un code de récupération :

```bash
pnpm window recovery-code
```

Ce que fait la commande : elle crée un nouveau code de récupération et l'affiche.

Paramètres :

- `pnpm window` : lance l'assistant de fenêtre du projet (`scripts/window.ts`).
- `recovery-code` : l'action : afficher un nouveau code de récupération.

**Ce que vous devez voir :** une longue ligne qui commence par `QRC1`, puis une note sur la façon de la conserver. Copiez toute la ligne `QRC1...`.

4. Placez le code dans `.env`. Ouvrez le fichier dans un éditeur :

| Système | Commande |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

Trouvez la ligne `QORE_PQC_RECOVERY_CODE=` et collez le code juste après le signe égal, sans espace et sans guillemets. Enregistrez le fichier. Le résultat ressemble à ceci (des valeurs fictives sont affichées, les vôtres sont réelles) :

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

Ce que signifie chaque ligne :

- `PRIVATE_KEY` : le secret qui signe pour la moitié classique (secp256k1) de votre compte.
- `QORE_PQC_RECOVERY_CODE` : le secret qui crée la moitié post-quantique (ML-DSA-87).
- `QORE_NETWORK` : le réseau avec lequel l'assistant communique. `testnet` est le réseau d'entraînement.

Laissez `.env` exactement tel quel. La même clé et le même code redonnent le même compte à chaque fois. Si vous perdez le fichier, recommencez avec un nouveau compte. Ne le partagez jamais et ne le versionnez jamais dans git.

Vous préférez un mnémonique (douze mots) ? À la place de la clé et du code, mettez `QORE_MNEMONIC="your twelve words"` dans `.env`. Les deux clés viennent de la même phrase et aucun code de récupération n'est nécessaire. Utilisez une phrase créée uniquement pour cet exercice.

5. Demandez au projet l'adresse de votre nouveau compte :

```bash
pnpm window status
```

Ce que fait la commande : elle lit la chaîne publique et affiche votre compte, votre clé post-quantique et votre fenêtre. Elle ne modifie rien.

Paramètres :

- `pnpm window` : lance l'assistant de fenêtre.
- `status` : l'action : afficher l'état actuel.

**Ce que vous devez voir :** trois lignes (les vôtres montrent de vraies adresses) :

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copiez l'adresse `qor1...`. C'est celle que vous donnez au faucet. Les deux adresses appartiennent au même compte : `0x...` est la forme Ethereum et `qor1...` est la forme QoreChain.

### Étape 4 : obtenir des QOR de testnet depuis le faucet {#step-4}

**Durée :** 2 minutes.

1. Ouvrez le [faucet](https://dashboard.qorechain.io/faucet) dans votre navigateur et connectez-vous.
2. Vérifiez que le tableau de bord est sur **Testnet**.
3. Collez votre adresse `qor1...`.
4. Sélectionnez **Request Tokens**.

**Ce que vous devez voir :** une carte qui indique **Tokens Sent!** avec 100 QOR (plus quelques jetons de test du festival) et un lien **View on Explorer**.

Le faucet paie une fois toutes les 24 heures par compte. Les montants exacts figurent sur [Faucet](/dashboard/faucet). Vérifiez maintenant depuis votre terminal :

```bash
pnpm window status
```

**Ce que vous devez voir :** les trois mêmes lignes qu'avant. Votre compte existe maintenant sur la chaîne et peut payer des frais. Il indique encore que la clé n'est pas enregistrée. Cela vient ensuite.

### Étape 5 : enregistrer votre clé et ouvrir la fenêtre {#step-5}

**Durée :** environ 2 minutes.

1. Enregistrez votre clé ML-DSA-87. C'est une étape unique par compte :

```bash
pnpm window register
```

Ce que fait la commande : elle envoie une transaction qui indique à la chaîne quelle clé post-quantique appartient à votre compte. Elle coûte des frais uniques d'environ 0,09 QOR. La chaîne accepte ce message signé uniquement avec la clé classique, car aucune clé post-quantique n'est encore enregistrée.

Paramètres :

- `pnpm window` : lance l'assistant de fenêtre.
- `register` : l'action : enregistrer la clé.

**Ce que vous devez voir :** `registered: <HASH>`. S'il affiche `The account already has a PQC key; nothing to do.`, ce n'est pas un problème : continuez.

2. Ouvrez la fenêtre d'autorisation :

```bash
pnpm window open
```

Ce que fait la commande : elle envoie une transaction **signée de façon hybride** (les deux clés) qui ouvre une courte fenêtre pendant laquelle vos transactions habituelles de type Ethereum, comme un déploiement de contrat, sont admises.

Paramètres :

- `pnpm window` : lance l'assistant de fenêtre.
- `open` : l'action : ouvrir une fenêtre. Par défaut, elle dure 600 blocs et autorise 5 transactions. Vous pouvez le modifier avec `QORE_WINDOW_BLOCKS` et `QORE_WINDOW_TXS` dans `.env`.

**Ce que vous devez voir :** `opened: <HASH>`, puis une ligne du type `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Ce dernier nombre est la limite de dépense de la fenêtre en uqor (3,75 QOR). Notez le hash `opened:` : vous le vérifiez à l'étape 8.

3. Attendez environ 10 secondes. L'ouverture de la fenêtre a fait avancer le compteur du compte (le nonce), et Hardhat attend que la chaîne se stabilise.

### Étape 6 : compiler le contrat {#step-6}

**Durée :** quelques secondes.

```bash
pnpm build
```

Ce que fait la commande : elle transforme le contrat Solidity sous la forme que la chaîne exécute.

Paramètres :

- `pnpm` : l'outil de paquets.
- `build` : le script à lancer (il exécute `hardhat build`).

**Ce que vous devez voir :** `Compiled 1 Solidity file` ou `No contracts to compile`. Les deux conviennent : le test de l'étape 2 l'a déjà compilé.

### Étape 7 : déployer le contrat sur le testnet {#step-7}

**Durée :** environ 30 secondes.

```bash
pnpm deploy:testnet
```

Ce que fait la commande : elle envoie le contrat au testnet QoreChain avec Hardhat Ignition, en utilisant la fenêtre que vous avez ouverte. C'est une transaction EVM ordinaire.

Paramètres :

- `pnpm` : l'outil de paquets.
- `deploy:testnet` : le script à lancer. Il exécute `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet` : déployer la recette `Counter.ts` sur le réseau nommé `qorechainTestnet` (ID de chaîne 9800).

Quand Hardhat demande `Confirm deploy to network qorechainTestnet (9800)?`, tapez `y` et appuyez sur Entrée.

**Ce que vous devez voir :** `[ CounterModule ] successfully deployed` et une ligne `CounterModule#Counter - 0x...`. Le `0x...` est l'adresse de votre contrat. Si vous voyez `HHE10402`, relancez la même commande (voir Dépannage).

### Étape 8 : vérifier la signature hybride sur la chaîne {#step-6-verify}

**Durée :** 3 minutes.

La transaction `opened:` de l'étape 5 a été signée avec les deux clés. N'importe qui peut la vérifier depuis le point de terminaison REST public.

1. Remplacez `<HASH>` par ce hash (sans les `<` et `>`) et lancez :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Ce que fait la commande : elle demande au serveur public du testnet le dossier complet de votre transaction.

Paramètres :

- `curl` : un programme qui récupère une adresse web.
- `-s` : silencieux, il masque la barre de progression et n'affiche que la réponse.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>` : l'adresse REST du testnet, suivie du hash de votre transaction.

**Ce que vous devez voir :** un long bloc de texte. Cherchez trois choses :

1. `"code": 0` dans `tx_response`. Le code 0 signifie une réussite.
2. L'extension `PQCHybridSignature`, qui contient la signature ML-DSA-87 : **4 627 octets**, à côté de la signature secp256k1 de 64 octets.
3. Dans `events`, un événement de type `pqc_hybrid_verify` dont l'attribut `status` vaut `verified`.

2. Pour n'afficher que cet événement (nécessite `jq`) :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ce que fait la commande : elle récupère le même dossier et le fait passer par `jq`, qui ne garde que l'événement de vérification.

Paramètres :

- `|` : envoyer le résultat de la première commande dans la seconde.
- `jq` : le programme de filtrage.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'` : parcourir la liste des événements et garder ceux dont le type est `pqc_hybrid_verify`.

**Ce que vous devez voir :** un petit bloc de texte avec `"status"` égal à `"verified"`.

3. Regardez-la dans l'explorateur :
   1. Ouvrez [explore.qore.network](https://explore.qore.network).
   2. Passez le sélecteur de réseau sur **Testnet**.
   3. Recherchez le hash.

**Ce que vous devez voir :** la page de la transaction indique la sécurité de la signature comme résistante au quantique, vérifiée sur la chaîne, avec l'algorithme ML-DSA-87 (FIPS 204).

C'est la preuve : les validateurs ont contrôlé les deux signatures. C'est votre transaction Quantum Pass.

## Ce que vous devez voir, en un coup d'œil {#what-you-should-see}

| Où | Quoi |
| --- | --- |
| Après l'étape 2 | `Done! Created qday-demo` et `2 passing` |
| Après l'étape 3 | Une adresse `qor1...` et une adresse `0x...` affichées par `pnpm window status`, avec la clé non enregistrée |
| Après l'étape 4 | **Tokens Sent!** sur le faucet |
| Après l'étape 5 | `registered: <HASH>`, puis `opened: <HASH>` et la ligne de la fenêtre |
| Après l'étape 7 | `CounterModule#Counter - 0x...` |
| Après l'étape 8 | `code` 0, une signature ML-DSA-87 de 4 627 octets et `pqc_hybrid_verify` avec `status` `verified`, dans la sortie REST et dans l'explorateur sur Testnet |

## Paquets utilisés {#published}

Déclarés dans le `package.json` généré :

| Paquet | Registre | Version |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Le générateur installe aussi les extensions Hardhat toolbox, Ignition et keystore listées dans le `package.json` généré.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `HHE10402` ou « wait for confirmations » juste après l'ouverture de la fenêtre | L'ouverture de la fenêtre a fait avancer le nonce du compte | Relancez `pnpm deploy:testnet` |
| « EVM authorisation window exhausted » ou « no window » | La fenêtre a épuisé ses transactions ou ses blocs, ou elle est limitée à un autre contrat (une fenêtre limitée à un autre contrat bloque un déploiement) | Lancez `pnpm window open` pour ouvrir une nouvelle fenêtre, attendez environ 10 secondes, puis redéployez |
| « account has no PQC key and classical fallback is disabled » | Le compte n'a pas enregistré de clé ML-DSA-87 | Lancez d'abord `pnpm window register`, puis `pnpm window open` |
| « does not exist on chain yet » | Le compte n'a pas encore de QOR | Obtenez des QOR au faucet (étape 4) |
| « Rate Limit Reached » sur le faucet, ou aucun jeton après 30 secondes | Une demande par 24 heures par compte et par adresse, et les demandes sont traitées une à la fois | Attendez quelques secondes et réessayez, ou attendez la fin des 24 heures. Une seule demande par 24 heures |
| `pnpm: command not found` | pnpm n'est pas installé. Node.js installé avec Homebrew ne l'inclut pas | Lancez `npm install -g pnpm`, puis ouvrez un nouveau terminal |
| `pnpm window` s'arrête avec un message sur un code de récupération manquant | `.env` contient `PRIVATE_KEY` sans `QORE_PQC_RECOVERY_CODE` | Lancez `pnpm window recovery-code` et collez le code dans `.env` (étape 3), ou utilisez `QORE_MNEMONIC` |
| « QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code » | Une faute de frappe, un espace ou un guillemet lors du collage | Collez à nouveau le code sans espaces ni guillemets |
| « registered, but NOT this key » dans `pnpm window status` | Un autre code de récupération a été utilisé plus tôt pour ce compte | Remettez le code de récupération d'origine dans `.env`, ou recommencez avec un nouveau compte |
| Erreurs CORS dans une application de navigateur | Un navigateur bloque les appels vers une adresse de chaîne qui n'autorise pas votre page | Utilisez le chemin de proxy `/lcd` du modèle pour les appels REST depuis le navigateur, au lieu d'appeler directement l'adresse de la chaîne |
| Hardhat refuse de démarrer | Node.js est plus ancien que la version 22 | Installez Node.js 22 ou plus récent (voir « Avant de commencer ») et relancez `pnpm install` |
| `curl` affiche `tx not found` juste après l'étape | Le bloc n'est pas encore final | Attendez 10 secondes et relancez la commande |
| `curl` ne fonctionne pas dans Windows PowerShell | `curl` y est une commande différente | Tapez `curl.exe` au lieu de `curl` |

## Les applications d'exemple {#example-apps}

Le même flux, depuis plusieurs langages et interfaces. Chacune signe de façon hybride. Toutes se trouvent dans le dépôt public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), dossier `workshop-1`. Pour les obtenir, il vous faut Git (vérifiez avec `git --version` ; installez-le depuis [git-scm.com](https://git-scm.com/downloads)), puis lancez :

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Ce que fait la commande : elle télécharge une copie de toutes les applications d'exemple et vous place dans le dossier `workshop-1`.

Paramètres :

- `git clone <adresse>` : copier un projet depuis Internet sur votre ordinateur.
- `cd build-before-qday/workshop-1` : entrer dans le dossier qui contient les six applications.

Chaque page d'application est un guide complet, de A à Z, avec ce qu'il faut installer et ce à quoi s'attendre.

| Application | Langage | Page |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Les kits derrière ces applications sont listés sur [Kits](/build-before-qday/workshop-1/kits). Pour utiliser le portefeuille QoreX avec une dApp de navigateur, voir [QoreX](/qorex/overview).
