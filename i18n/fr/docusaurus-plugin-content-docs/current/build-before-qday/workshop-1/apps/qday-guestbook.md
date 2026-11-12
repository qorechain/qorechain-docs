---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Le Q-Day Guestbook est un livre d'or sur la chaîne, sur le testnet EVM de QoreChain. Chacun peut le signer une fois par adresse avec un message de 140 caractères au plus. Il comporte deux parties :

- **`contracts-app/`** : un contrat Solidity et un projet Hardhat. Vous le déployez et vous pouvez signer depuis le terminal.
- **`web/`** : une page web qui s'ouvre dans votre navigateur, connecte le portefeuille QoreX, affiche la fenêtre EVM du compte et liste en direct les dernières signatures.

Ce guide s'adresse aux débutants. Chaque commande est expliquée et chaque étape se termine par ce que vous devez voir.

**Durée :** environ 35 minutes la première fois : 20 pour la partie contrat, 15 pour la page web.

## Ce que cela démontre {#shows}

- **Une dApp de navigateur qui signe de façon hybride sans le savoir.** La page est une application wagmi et RainbowKit ordinaire. QoreX ajoute la moitié post-quantique (ML-DSA-87) de la signature, de sorte que la même transaction est protégée par la clé classique (secp256k1) et par une clé post-quantique.
- **La fenêtre EVM est visible dans l'interface.** La page lit la fenêtre du compte sur la chaîne et indique si elle est active et combien de blocs et de transactions il lui reste.
- **Des refus lisibles.** Quand la chaîne refuse une écriture, la page rattache l'erreur à l'une des quatre causes (aucune clé enregistrée, aucune fenêtre, fenêtre épuisée, paramètres invalides) et affiche la solution.
- **Des signatures hybrides vérifiées sur la chaîne.** Chaque signature que vous écrivez est une transaction que la chaîne n'a acceptée qu'après avoir contrôlé les deux signatures.

## Avant de commencer {#prerequisites}

Ce guide utilise un compte de testnet jetable pour la partie terminal. N'utilisez jamais un vrai portefeuille ni de vrais fonds. Les QOR de testnet n'ont aucune valeur.

Il vous faut un terminal. Sur macOS, ouvrez **Terminal**. Sur Windows, ouvrez **PowerShell** (ou **Git Bash**, fourni avec Git). Sous Linux, ouvrez n'importe quel terminal. Installez ces trois outils. Si la commande de vérification affiche déjà une bonne version, passez l'installation.

### Node.js 22 ou plus récent

Node.js exécute du JavaScript sur votre ordinateur. Hardhat 3 exige Node.js 22 ou plus récent.

| Système | Installation | Vérification |
| --- | --- | --- |
| macOS | `brew install node` (nécessite [Homebrew](https://brew.sh)), ou téléchargement sur https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, ou téléchargement sur https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, ouvrez un nouveau terminal, puis `nvm install 22` | `node --version` |

Ce que vous devez voir : un nombre qui commence par `v22` ou plus. Sur Windows, fermez et rouvrez PowerShell après l'installation.

### pnpm

pnpm télécharge les bibliothèques dont un projet a besoin. Node.js ne l'inclut pas, installez-le donc vous-même, sur tous les systèmes.

```sh
npm install -g pnpm
```

| Élément | Signification |
| --- | --- |
| `npm` | L'outil fourni avec Node.js. Il installe d'autres outils. |
| `install` | Télécharger et installer. |
| `-g` | Global : installer pour tout l'ordinateur, et non pour un seul dossier. |
| `pnpm` | L'outil à installer. |

Vérifiez avec `pnpm --version`. Vous devez voir un numéro comme `9.12.0` (9 ou plus). Si vous voyez un jour `pnpm: command not found`, lancez la commande d'installation ci-dessus et ouvrez un nouveau terminal. Si macOS ou Linux affiche `EACCES: permission denied`, utilisez `sudo npm install -g pnpm`.

### Git

| Système | Installation | Vérification |
| --- | --- | --- |
| macOS | `xcode-select --install` ou `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, ou téléchargement sur https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) ou `sudo dnf install git` (Fedora) | `git --version` |

Ce que vous devez voir : `git version 2.` suivi d'un nombre.

## Portefeuilles de testnet {#wallet}

Ce guide utilise deux comptes, volontairement différents :

1. **Un compte à fichier de clés** pour la partie terminal (étapes 3 à 6). Le guide le crée pour vous. Il déploie le contrat.
2. **Un compte QoreX** pour la page web (étapes 8 et 9). La page web signe avec lui.

**QoreX sur le testnet.** [QoreX](/qorex/overview) est le portefeuille de QoreChain. Vous utilisez l'extension de navigateur pour la page web (voir [Intégrations QoreX](/developer-tools/qorex-integrations)). Installez-la dans le navigateur que vous allez utiliser, puis :

- **Extension de navigateur QoreX :** déverrouillez-la, touchez 7 fois le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.
- **Application QoreX sur votre téléphone :** Réglages, puis **Use testnet (developers)**.
- Pour la voie EVM, choisissez **Add an Ethereum account (coin 60)**. La page web a besoin d'un compte coin 60.

**Le faucet** donne gratuitement des QOR de testnet : https://dashboard.qorechain.io/faucet. Connectez-vous, collez une adresse, faites la demande. Vous recevez 100 QOR par 24 heures et par compte.

**À propos des montants.** QOR est la pièce. `uqor` est sa plus petite fraction : 1 QOR = 1 000 000 uqor. La première transaction d'un nouveau compte enregistre sa clé post-quantique, pour des frais uniques d'environ 0,09 QOR.

## Partie 1 : le contrat {#contract}

### 1. Récupérer le code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**Ce que font les commandes**

- `git clone <adresse>` télécharge le projet depuis GitHub dans un nouveau dossier `build-before-qday`.
- `cd <dossier>` déplace votre terminal dans le projet Guestbook. Il contient deux dossiers, `contracts-app` et `web`, que vous configurez séparément.

**Ce que vous devez voir :** `Cloning into 'build-before-qday'...`. **Durée :** quelques secondes.

### 2. Installer les bibliothèques et tester {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**Ce que font les commandes**

- `cd contracts-app` entre dans le dossier du contrat.
- `pnpm install` télécharge les bibliothèques listées dans `package.json` (Hardhat et le SDK QoreChain).
- `pnpm test` lance les vérifications du contrat sur une fausse chaîne à l'intérieur de votre ordinateur. Il ne faut ni clé ni compte réseau. La première exécution télécharge le compilateur Solidity.

**Ce que vous devez voir :** une liste de paquets, `Done in` quelques secondes, puis `QDayGuestbook` avec trois coches et `3 passing`. **Durée :** environ une minute.

### 3. Créer le fichier de clés {#step-account}

Le projet lit ses secrets dans un fichier nommé `.env`. Créez-le à partir du modèle.

macOS, Linux, Git Bash :

```sh
cp .env.example .env
```

Windows PowerShell :

```sh
copy .env.example .env
```

**Ce que fait la commande**

- `cp` (ou `copy`) copie le modèle `.env.example` vers un nouveau fichier `.env`.

Le fichier `.env` est votre **fichier de clés**. Il reste uniquement dans le dossier `contracts-app`. **Ne le partagez jamais, ne le versionnez jamais dans Git, et ne réutilisez jamais ces clés pour un vrai portefeuille.** Le projet ignore déjà `.env` dans Git. Ouvrez-le dans n'importe quel éditeur de texte (`open -e .env` sur macOS, `notepad .env` sur Windows, `nano .env` sous Linux) et renseignez deux valeurs.

**a. Une clé privée jetable.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Ce que fait la commande**

- `node -e "..."` exécute une seule ligne de JavaScript. Cette ligne produit 32 octets aléatoires et les affiche en hexadécimal avec `0x` devant. C'est une clé privée.

**Ce que vous devez voir :** une seule ligne, `0x` puis 64 lettres et chiffres. Copiez-la dans `.env` sous la forme `PRIVATE_KEY=0x...`, en remplaçant la valeur fictive composée de zéros.

**b. Un code de récupération post-quantique.**

```sh
pnpm window recovery-code
```

**Ce que fait la commande**

- `pnpm window` lance le script d'assistance `scripts/window.ts`. Le mot qui suit est l'action à effectuer.
- `recovery-code` affiche un nouveau code aléatoire à partir duquel la clé ML-DSA-87 du compte est créée.

**Ce que vous devez voir :** une ligne qui commence par `QRC1-`. Copiez-la dans `.env` sous la forme `QORE_PQC_RECOVERY_CODE=QRC1-...`. Gardez le même code pour ce compte : un nouveau code donne une autre clé post-quantique.

Laissez `QORE_MNEMONIC` vide (un mnémonique est une phrase de 12 ou 24 mots qui peut remplacer les deux valeurs ci-dessus ; utilisez l'un ou l'autre, pas les deux) et gardez `QORE_NETWORK=testnet`, qui indique à l'assistant d'utiliser le réseau de test. Votre `.env` ressemble à ceci (valeurs fictives affichées) :

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Enregistrez le fichier.

### 4. Alimenter le compte {#step-faucet}

```sh
pnpm window status
```

**Ce que fait la commande**

- Elle affiche votre compte, indique si sa clé post-quantique est enregistrée, et s'il a une fenêtre EVM.

**Ce que vous devez voir :** `account:  0x...  (qor1...)`, puis `PQC key:  not registered` et `window:   none`. Copiez l'adresse `qor1...`. Ensuite :

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Vérifiez que la page est réglée sur **Testnet**.
3. Collez l'adresse `qor1...` et demandez les QOR (100 QOR une fois toutes les 24 heures par compte).
4. Attendez environ 10 secondes. Si vous recherchez votre adresse sur https://explore.qore.network (Testnet), vous voyez le solde.

### 5. Enregistrer la clé, ouvrir la fenêtre, déployer {#step-window}

```sh
pnpm window register
```

**Ce que fait la commande**

- Elle envoie votre clé publique ML-DSA-87 à la chaîne, une fois par compte. C'est le seul message que la chaîne accepte sans signature post-quantique, car aucune clé n'est encore enregistrée sur la chaîne pour la vérifier. Cela coûte environ 0,09 QOR.

**Ce que vous devez voir :** `registered: ` et un hash de transaction.

```sh
pnpm window open
```

**Ce que fait la commande**

- Elle envoie une transaction, signée avec les deux clés (hybride), qui ouvre une fenêtre d'autorisation EVM. Tant qu'elle est active, vos transactions EVM ordinaires sont autorisées. Par défaut, elle dure 600 blocs et autorise 5 transactions.

**Ce que vous devez voir :** `opened: ` et un hash de transaction, puis `window: 600 blocks, 5 txs, ...`. **Copiez ce hash** pour la dernière étape.

```sh
sleep 10
```

**Ce que fait la commande**

- Elle attend 10 secondes (cela fonctionne aussi dans PowerShell et Git Bash). L'ouverture de la fenêtre modifie le compteur de transactions du compte, et la commande suivante doit voir la nouvelle valeur.

```sh
pnpm deploy:testnet
```

**Ce que fait la commande**

- Elle lance Hardhat Ignition, l'outil qui déploie les contrats, avec le module `QDayGuestbook` sur le réseau `qorechainTestnet` (ID de chaîne 9800, le testnet QoreChain).
- Elle vous demande de confirmer. Tapez `y` et appuyez sur Entrée.

**Ce que vous devez voir :** une ligne qui se termine par `QDayGuestbookModule#QDayGuestbook` et l'adresse `0x...` de votre contrat. **Copiez cette adresse** : la page web en a besoin. **Durée :** environ 30 secondes.

### 6. Signer depuis le terminal {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**Ce que font les commandes**

- `pnpm sign "<message>"` écrit une entrée dans le livre d'or. Le texte entre guillemets est votre message, de 140 caractères au plus.
- `pnpm sign --read` lit seulement : elle liste les dernières entrées et n'envoie rien.

**Ce que vous devez voir :** après la première commande, `tx: 0x...` et `status: success in block ...`. Après la seconde, `guestbook 0x...: 1 signatures` et votre message avec l'heure et votre adresse.

Chaque adresse ne peut signer qu'une fois. Un second `pnpm sign` depuis le même compte est refusé par le contrat avec `AlreadySigned`.

## Partie 2 : la page web {#web}

### 7. Installer et configurer la page {#step-web}

Ouvrez une seconde fenêtre de terminal dans le même dossier de projet, ou remontez avec `cd ..`. Puis :

```sh
cd web
pnpm install
```

**Ce que font les commandes**

- Elles entrent dans le dossier web et téléchargent ses bibliothèques (React, wagmi, RainbowKit, Vite).

**Ce que vous devez voir :** une liste de paquets et `Done in` quelques secondes.

Créez le fichier de réglages de la page. macOS, Linux, Git Bash : `cp .env.example .env`. Windows PowerShell : `copy .env.example .env`. Ouvrez `web/.env` dans un éditeur et renseignez l'adresse du contrat que vous avez copiée à l'étape 5 :

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Laissez `VITE_WALLETCONNECT_PROJECT_ID` vide. Il n'est nécessaire que si vous ajoutez un portefeuille WalletConnect dans `src/wagmi.ts`.

### 8. Démarrer la page et connecter QoreX {#step-run}

```sh
pnpm dev
```

**Ce que fait la commande**

- Elle démarre un petit serveur web sur votre propre ordinateur (Vite). La page se trouve à l'adresse `http://localhost:5174`. Le serveur transmet aussi les requêtes qui commencent par `/lcd` au serveur REST public du testnet. Le navigateur ne peut pas appeler directement ce serveur (il n'envoie aucun en-tête CORS), c'est donc ce proxy qui le fait pour la page.
- La commande continue de tourner. Laissez ce terminal ouvert. Appuyez sur `Ctrl+C` pour l'arrêter plus tard. Si vous modifiez `web/.env`, arrêtez-la et relancez-la.

**Ce que vous devez voir :** `VITE ... ready` et `Local: http://localhost:5174/`.

Maintenant, dans le navigateur où QoreX est installé :

1. Ouvrez http://localhost:5174 .
2. Vérifiez que QoreX est déverrouillé et passé sur le testnet (voir « Portefeuilles de testnet » plus haut), avec un compte coin 60 qui a reçu des QOR du faucet. Utilisez la forme `qor1...` de son adresse sur la page du faucet si QoreX affiche les deux formes.
3. Sur la page, dans la carte 1, choisissez **Connect QoreX** (le bouton de connexion). Si QoreX n'apparaît pas en premier, choisissez-le dans la liste des portefeuilles.
4. QoreX ouvre une fenêtre qui demande à se connecter. Approuvez.

**Ce que vous devez voir :** la carte 1 affiche votre compte `0x...`, la chaîne `qorechain-diana EVM (9800)`, votre solde et la fenêtre EVM : `no window open` pour un compte neuf. La carte 3 affiche `On chain now: 1 signatures` et l'entrée que vous avez écrite à l'étape 6. Si la ligne de la chaîne indique `wrong chain`, passez QoreX sur le testnet.

### 9. Signer depuis QoreX {#step-sign}

1. Dans la carte 2, tapez un message (140 caractères au plus). La page indique combien vous en avez utilisé.
2. Choisissez **Sign**.
3. QoreX ouvre sa demande d'approbation. Si votre compte n'a pas encore de clé post-quantique ni de fenêtre, QoreX propose d'enregistrer la clé (des frais uniques d'environ 0,09 QOR) et d'ouvrir la fenêtre EVM dans la même approbation. Acceptez.
4. Approuvez dans QoreX. Le bouton indique `Approve in QoreX...` pendant l'attente.

**Ce que vous devez voir :** une ligne `tx 0x...` avec un lien vers l'explorateur, d'abord `waiting for the block...`, puis `success in block ...`. La carte 1 affiche maintenant la fenêtre EVM comme `live`, avec les blocs et les transactions restants. La carte 3 ajoute votre message en haut, le plus récent en premier. Elle liste jusqu'à 20 entrées et se rafraîchit toutes les quelques secondes. Si vous réessayez depuis la même adresse, la carte 2 indique `This address has already signed.`

### 10. Vérifier sur la chaîne {#step-explorer}

Utilisez le hash de `pnpm window open` (étape 5). Pour la page, QoreX ouvre aussi la fenêtre dans sa propre transaction : demandez son historique à QoreX ou recherchez votre adresse dans l'explorateur.

**a. Avec la requête web simple.** Remplacez `<HASH>` par le hash (retirez les `<` et `>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Ce que fait la commande**

- `curl <adresse>` demande à un serveur public QoreChain le dossier de cette transaction et l'affiche. Sur Windows PowerShell, tapez `curl.exe` au lieu de `curl`.

**Ce que vous devez voir dans la longue réponse :**

- `"code": 0`, ce qui signifie que la transaction a réussi.
- Une extension de type `PQCHybridSignature` avec la signature ML-DSA-87, longue de 4 627 octets.
- Un événement `pqc_hybrid_verify` dont `status` vaut `verified`.

**b. Avec l'explorateur.** Ouvrez https://explore.qore.network, passez le sélecteur de réseau sur **Testnet**, et recherchez le hash de la transaction (de l'étape 5, 6 ou 9), l'adresse de votre compte, ou l'adresse du `QDayGuestbook`. La transaction de fenêtre montre une signature post-quantique que la chaîne a vérifiée.

## Ce que vous devez voir à la fin {#result}

- `pnpm test` dans `contracts-app` affiche `3 passing`.
- `pnpm window status` affiche `PQC key:  registered` et `window:   live` avec les blocs, les transactions et la valeur restants.
- `pnpm deploy:testnet` affiche l'adresse du `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` affiche le hash de la transaction et `status: success in block ...`.
- La page affiche votre compte, `qorechain-diana EVM (9800)`, votre solde et la fenêtre comme `live`. Après **Sign** et votre approbation, vous voyez un lien de transaction et `success in block ...`.
- La liste en bas affiche le nombre de signatures et les dernières entrées, la plus récente en premier.
- La vérification avec `curl` montre `"code": 0`, l'extension `PQCHybridSignature` et `pqc_hybrid_verify` avec `status` `verified`.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `pnpm: command not found` | pnpm n'est pas installé. Node.js ne l'inclut pas. | Lancez `npm install -g pnpm`, puis ouvrez un nouveau terminal. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js est trop ancien. | Installez Node.js 22 ou plus récent. |
| `node: .env: not found` | Il n'y a pas de fichier `.env` dans ce dossier. | Faites l'étape 3 dans `contracts-app`, et lancez les commandes depuis ce dossier. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` ou `Set QORE_PQC_RECOVERY_CODE ...` | Une valeur de `.env` est vide, fictive, ou contient une faute de frappe. | Renseignez les deux valeurs comme à l'étape 3 et enregistrez. |
| `... does not exist on chain yet: send it some QOR first` | Le compte n'a pas encore de QOR. | Utilisez le faucet (étape 4), attendez 10 secondes. |
| Le faucet indique que vous avez atteint la limite | Une demande par 24 heures par compte. | Attendez, puis réessayez. |
| `account has no PQC key and classical fallback is disabled` | Une transaction a été envoyée avant l'enregistrement de la clé. | Lancez `pnpm window register`, puis `pnpm window open`. Dans QoreX, approuvez l'enregistrement proposé lors de votre premier envoi. |
| `EVM authorisation window exhausted` ou `open an EVM window first` | La fenêtre a épuisé ses blocs ou ses transactions, ou elle n'a jamais été ouverte. | Lancez `pnpm window open` (terminal) et attendez 10 secondes. Dans la page, approuvez la nouvelle fenêtre quand QoreX la propose. |
| `HHE10402` après l'ouverture de la fenêtre | Le déploiement s'est lancé avant la mise à jour du compteur de transactions du compte. | Attendez 10 secondes et relancez `pnpm deploy:testnet`. |
| `refused: ... (AlreadySigned)` | Cette adresse a déjà signé. | Chaque adresse ne signe qu'une fois. Utilisez un autre compte. |
| `refused: ... (BadLength)` | Le message est vide ou dépasse 140 caractères. | Utilisez de 1 à 140 caractères. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` ne trouve pas le contrat. | Terminez l'étape 5 dans `contracts-app`. |
| La page n'affiche aucune entrée et le bouton **Sign** est grisé | `VITE_GUESTBOOK_ADDRESS` est vide dans `web/.env`. | Collez l'adresse de l'étape 5, puis arrêtez (`Ctrl+C`) et relancez `pnpm dev`. |
| La page indique `wrong chain` | QoreX n'est pas sur le testnet. | Passez QoreX sur le testnet (diana), voir « Portefeuilles de testnet ». |
| QoreX n'est pas proposé quand vous choisissez de vous connecter | La page a été ouverte dans un navigateur sans l'extension QoreX, ou l'extension est verrouillée. | Ouvrez http://localhost:5174 dans le navigateur où se trouve QoreX et déverrouillez-le. |
| Le port 5174 est déjà utilisé | Un autre programme l'utilise. | Fermez-le, ou utilisez l'autre adresse affichée par Vite. |
| `could not read` à côté de la fenêtre EVM, ou erreurs CORS dans la console du navigateur | La page a appelé directement le serveur REST, qui n'envoie aucun en-tête CORS. | Appelez REST uniquement par le proxy `/lcd` du serveur de développement, comme le fait ce projet. Démarrez la page avec `pnpm dev`. |

## Le code {#code}

Le contrat garde les entrées dans un tableau et autorise une signature par adresse :

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX est le premier portefeuille de la liste des connecteurs (`web/src/wagmi.ts`) :

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

La page affiche la fenêtre et explique les refus (`web/src/App.tsx`) :

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Paquets utilisés {#packages}

Contrats (`contracts-app/`) :

| Paquet | Version | Utilisé pour |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Script d'assistance de fenêtre, signature hybride |
| `@qorechain/evm` | ^0.13.0 | Définitions de chaîne, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Diffusion du message de fenêtre |
| `hardhat` | ^3.21.1 | Compiler, tester, déployer avec Ignition |
| `viem` | ^2.47.6 | Client Ethereum |
| `tsx` | ^4.19.0 | Exécuter les scripts TypeScript |
| `typescript` | ^5.6.3 | Vérification des types |

Page web (`web/`) :

| Paquet | Version | Utilisé pour |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Définitions de chaîne, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX comme portefeuille RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Bouton de connexion |
| `wagmi` | ^2.19.5 | Hooks React pour les lectures et les écritures |
| `viem` | ^2.53.1 | Client Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Récupération des données pour la fenêtre et les lectures de la chaîne |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `vite` | ^5.4.0 | Serveur de développement |
| `@vitejs/plugin-react` | ^4.3.0 | Prise en charge de React pour Vite |
| `typescript` | ^5.6.3 | Vérification des types |

Source : https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
