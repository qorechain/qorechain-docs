---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Le Hybrid Inspector est une petite page web (construite avec React) qui montre à quoi ressemble une signature hybride QoreChain sur le testnet `qorechain-diana`. Vous connectez le portefeuille QoreX, vous envoyez une transaction que QoreX signe avec secp256k1 et ML-DSA-87, puis la page ouvre cette transaction : la signature classique, la signature post-quantique et le verdict de la chaîne elle-même. Vous pouvez aussi coller le hash de n'importe quelle transaction du testnet.

**Durée :** environ 20 minutes, installations comprises. Ensuite, la page s'exécute en quelques secondes.

## Ce que la page montre {#what-it-shows}

- **Signature hybride ML-DSA-87 + secp256k1 depuis une page web.** La page transmet un message encodé à QoreX avec `qorexSignAndBroadcast`. QoreX signe avec les deux clés et diffuse la transaction.
- **Une transaction signée en hybride, vérifiée sur la chaîne.** La page lit l'événement `pqc_hybrid_verify` de la chaîne pour cette transaction. Cet événement signifie que la chaîne a bien vérifié la signature post-quantique.
- **Les tailles sont visibles.** La signature classique fait 64 octets. La signature ML-DSA-87 (FIPS 204) fait 4 627 octets et voyage dans l'extension `PQCHybridSignature` de la transaction.

## Pas à pas {#steps}

Vous travaillez dans votre propre terminal et dans votre navigateur. Utilisez uniquement un compte de testnet jetable. Les QOR du testnet n'ont aucune valeur. N'utilisez jamais un vrai portefeuille ni de vrais fonds ici.

### 1. Avant de commencer : installer les outils {#install}

Il vous faut quatre choses : un navigateur basé sur Chromium (Chrome, Edge ou Brave), **Git** (télécharge le code), **Node.js** (exécute les outils de la page) et **pnpm** (installe les bibliothèques de la page). Utilisez Node.js 22 ou plus récent. La page fonctionne aussi à partir de Node.js 20, mais la version 22 est le choix sûr pour toutes les applications de l'atelier.

**macOS**

| Outil | Comment l'installer | Comment le vérifier |
| --- | --- | --- |
| Git | `xcode-select --install` (ou `brew install git`) | `git --version` |
| Node.js 22+ | Téléchargez l'installateur LTS sur https://nodejs.org, ou lancez `brew install node` | `node --version` (doit afficher v22 ou plus) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (utilisez PowerShell)

| Outil | Comment l'installer | Comment le vérifier |
| --- | --- | --- |
| Git | Téléchargez-le sur https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | Téléchargez l'installateur LTS sur https://nodejs.org (ou `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian ou Ubuntu)**

| Outil | Comment l'installer | Comment le vérifier |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | Suivez https://nodejs.org/en/download (choisissez Linux, puis la version LTS) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Piège :** Node.js installé avec Homebrew n'inclut pas pnpm. Si vous voyez `pnpm: command not found`, lancez `npm install -g pnpm`, puis ouvrez un nouveau terminal.

**Ce que vous devez voir :** chaque commande de vérification affiche un numéro de version. `node --version` commence par `v22` ou plus.

### 2. Avant de commencer : QoreX sur le testnet {#qorex}

QoreX est le portefeuille officiel de QoreChain. Cette page a besoin de l'**extension de navigateur QoreX** dans le navigateur où vous ouvrez la page. Installez-la depuis la boutique de votre navigateur. Voir [Intégrations QoreX](/developer-tools/qorex-integrations) et le [navigateur de dApps](/qorex/dapp-browser).

Utilisez un **nouveau compte jetable** créé uniquement pour cet exercice. QoreX affiche une phrase de récupération à la création du compte. Notez-la sur papier, gardez-la privée et ne la réutilisez jamais sur le mainnet.

Passez QoreX sur le testnet :

- **Extension de navigateur :** déverrouillez-la, touchez 7 fois le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.
- **Application QoreX :** ouvrez les réglages et activez **Use testnet (developers)**. (La page s'exécute dans un navigateur de bureau, vous utilisez donc l'extension pour ce tutoriel.)

Voir [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes#step-testnet) pour plus de détails sur le passage au testnet. Copiez l'adresse de votre compte (elle commence par `qor1...`).

Vous n'avez pas besoin d'un compte Ethereum (coin 60) pour cette page, car elle envoie un paiement QoreChain Native.

### 3. Obtenir des QOR de testnet depuis le faucet {#faucet}

Le faucet est un site web qui envoie gratuitement des QOR de testnet à une adresse.

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et faites la demande. Le faucet verse **100 QOR par 24 heures et par compte**.

**Montants :** l'unité que vous lisez est le **QOR**. La chaîne compte en **uqor**, la plus petite unité. 1 QOR = 1 000 000 uqor. La page demande des QOR et fait la conversion pour vous.

**Bon à savoir :** la toute première transaction d'un nouveau compte enregistre sa clé post-quantique ML-DSA-87 sur la chaîne. C'est des frais uniques d'environ 0,09 QOR. QoreX s'en charge pour vous lors de votre premier envoi.

### 4. Récupérer le code {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Élément | Signification |
| --- | --- |
| `git clone <adresse>` | Télécharge une copie complète des applications d'exemple depuis GitHub dans un nouveau dossier nommé `build-before-qday`. |
| `cd <dossier>` | Place votre terminal dans le dossier du Hybrid Inspector. Toutes les commandes suivantes s'exécutent depuis ici. |

**Ce que vous devez voir :** `Cloning into 'build-before-qday'...`. Lancez `ls` pour vérifier : vous voyez `package.json`, `src`, `index.html` et `vite.config.ts`.

### 5. Installer les bibliothèques {#install-libs}

```sh
pnpm install
```

**Ce que ça fait :** `pnpm` télécharge les bibliothèques dont la page a besoin (listées dans `package.json`) dans un dossier nommé `node_modules`. Vous ne le lancez qu'une fois par projet.

| Élément | Signification |
| --- | --- |
| `pnpm` | L'outil qui installe les bibliothèques. |
| `install` | Lire `package.json` et installer tout ce qu'il liste, aux versions indiquées dans `pnpm-lock.yaml`. |

**Durée :** moins d'une minute.

**Ce que vous devez voir :** une barre de progression, puis `Done in` et une durée.

### 6. Vérifier que le projet se compile {#build}

```sh
pnpm build
```

**Ce que ça fait :** lance le script nommé `build` de `package.json`. Ce script est `tsc --noEmit && vite build`.

| Élément | Signification |
| --- | --- |
| `pnpm build` | Exécuter le script `build` du projet. |
| `tsc --noEmit` | Le vérificateur TypeScript. Il cherche des erreurs dans le code et n'écrit aucun fichier. |
| `vite build` | Vite assemble la page en un petit site web dans le dossier `dist`. |

**Ce que vous devez voir :** `transforming...`, puis des lignes comme `dist/index.html`, et enfin `built in` suivi d'une durée (bien en dessous d'une seconde).

### 7. Lancer la page {#run}

```sh
pnpm dev
```

**Ce que ça fait :** lance le script `dev`, qui démarre un petit serveur web sur votre propre ordinateur pour que vous puissiez utiliser la page dans le navigateur. Laissez ce terminal ouvert pendant que vous travaillez. Appuyez sur Ctrl+C pour l'arrêter.

**Ce que vous devez voir :**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

Ouvrez http://localhost:5173 dans le navigateur où QoreX est installé. Si le port 5173 est pris, Vite affiche un autre port. Utilisez l'adresse qu'il affiche.

Pour inspecter directement une transaction, ajoutez `?tx=<HASH>` à l'adresse : `http://localhost:5173?tx=<HASH>`.

**Pourquoi la page appelle `/lcd` :** le service REST public du testnet n'envoie aucun en-tête CORS, donc une page de navigateur ne peut pas l'appeler directement. Le serveur de développement redirige chaque appel de `/lcd` vers `https://api-testnet.qore.host`. La page ne fonctionne que sur le testnet, et aucun fichier `.env` n'est nécessaire.

### 8. Se connecter, envoyer et vérifier {#connect-send}

1. **Connexion.** Cliquez sur **Connect QoreX**. QoreX vous demande d'autoriser la page. Approuvez. La page affiche votre adresse (`qor1...`), votre solde de testnet et indique si une clé ML-DSA-87 est enregistrée. Elle affiche « not registered yet » jusqu'à votre premier envoi.
2. **Remplir le formulaire d'envoi.**

| Champ | Signification |
| --- | --- |
| To | L'adresse du destinataire (`qor1...`). Elle est remplie par défaut avec votre propre adresse, ce qui convient. |
| Amount (QOR) | Le montant à envoyer, en QOR. `1` signifie 1 QOR = 1 000 000 uqor. |
| Memo | Un court texte joint à la transaction et stocké sur la chaîne. Tout le monde peut le lire, n'écrivez donc rien de privé. |

3. **Envoyer.** Cliquez sur **Sign with QoreX and send**. QoreX affiche ce que vous signez et demande votre accord. Approuvez. Attendez le bloc (quelques secondes).
4. **Inspecter.** La page inspecte la transaction automatiquement. Vous pouvez aussi coller n'importe quel hash de transaction du testnet de 64 caractères à l'étape 3 de la page et cliquer sur **Inspect**.

**Ce que vous devez voir :** une ligne `QoreX: code 0, shield ..., tx <hash>`, puis la carte d'inspection décrite dans « Ce que vous devez voir » plus bas. Copiez le hash de la transaction.

### 9. La vérifier d'une seconde façon, sans la page {#verify-curl}

Vous pouvez interroger directement la chaîne. Il vous faut seulement `curl`, fourni avec macOS et la plupart des systèmes Linux. Sous Windows PowerShell, utilisez `curl.exe`. L'outil `jq` est facultatif et rend la réponse plus lisible (`brew install jq` sur macOS, `sudo apt install -y jq` sur Linux, `winget install jqlang.jq` sur Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Élément | Signification |
| --- | --- |
| `curl -s <adresse>` | Télécharge la réponse du service REST du testnet. `-s` masque la barre de progression. |
| `<HASH>` | Le hash de votre transaction, obtenu à l'étape 8. |
| `\| jq '...'` | Extrait trois valeurs. Sans `jq`, retirez cette partie et lisez le texte complet. |

**Ce que vous devez voir :**

- `code` vaut `0` : la transaction a réussi.
- Une extension `PQCHybridSignature` (type `/qorechain.pqc.v1.PQCHybridSignature`) avec un `pqc_signature`. Son texte en base64 fait 6 172 caractères, soit 4 627 octets de signature ML-DSA-87.
- Dans `tx_response.events`, un événement de type `pqc_hybrid_verify` dont l'attribut `status` vaut `verified`.

**Dans l'explorateur :** ouvrez https://explore.qore.network, passez-le sur **Testnet**, et cherchez le hash de votre transaction.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `pnpm: command not found` | pnpm n'est pas installé. Node.js installé via Homebrew ne l'inclut pas. | Lancez `npm install -g pnpm`, puis ouvrez un nouveau terminal. |
| `node --version` affiche v18 ou moins | Node.js est trop ancien. | Installez Node.js 22 ou plus récent (étape 1). |
| La page affiche `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | L'extension est absente, verrouillée, ou le navigateur n'est pas basé sur Chromium. | Installez et déverrouillez QoreX dans Chrome, Edge ou Brave. Passez sur le testnet, puis rechargez la page. |
| Le faucet indique que vous avez atteint une limite | Une demande par 24 heures et par compte. | Attendez 24 heures, ou utilisez un second compte jetable. |
| `account has no PQC key and classical fallback is disabled` | La clé post-quantique n'est pas encore enregistrée. | Envoyez une fois depuis QoreX (il enregistre la clé lors de votre premier envoi, environ 0,09 QOR). Assurez-vous d'abord d'avoir des QOR du faucet. |
| `EVM authorisation window exhausted` | Concerne l'application Hardhat, pas cette page. | Dans cette application, ouvrez une nouvelle fenêtre avec `pnpm window open`. |
| `HHE10402` après l'ouverture de la fenêtre | Concerne l'application Hardhat. La fenêtre a besoin de quelques secondes. | Relancez le déploiement. |
| Erreur CORS dans la console du navigateur | La page a appelé directement le service REST. | Utilisez le proxy `/lcd` du serveur de développement (`pnpm dev`) et ouvrez la page à `http://localhost:5173`. N'ouvrez pas `dist/index.html` comme un fichier. |
| `Enter an amount in QOR, for example 1.` | Le montant est vide, nul ou n'est pas un nombre. | Saisissez un nombre comme `1`. |
| `A transaction hash is 64 hex characters.` | Le hash collé est faux ou tronqué. | Collez les 64 caractères complets. |
| `Transaction not found on qorechain-diana` | Le hash vient d'un autre réseau, ou le bloc n'est pas encore final. | Attendez 10 secondes et réessayez. Vérifiez que QoreX est sur le testnet. |
| Le port 5173 est déjà utilisé | Un autre programme l'utilise. | Vite choisit le port suivant et l'affiche. Ouvrez cette adresse. |

## Le code {#code}

Connexion et envoi :

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Lecture de la preuve depuis la chaîne :

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` est un petit encodeur protobuf dans `src/App.tsx` pour le message bancaire `MsgSend`, car QoreX reçoit le message déjà encodé. La page marque une transaction comme vérifiée en hybride lorsque son code vaut 0, qu'un événement `pqc_hybrid_verify` a le statut `verified`, et que la signature post-quantique fait 4 627 octets.

## Ce que vous devez voir {#result}

- L'en-tête affiche `qorechain-diana (testnet)` et une hauteur de bloc qui ne cesse d'augmenter.
- Après la connexion : votre adresse, votre solde et l'état de la clé.
- Après l'envoi : le hash de la transaction et le code de résultat, puis la carte d'inspection avec le mémo, le type de message, la signature classique de 64 octets, la signature ML-DSA-87 de 4 627 octets avec ses premiers octets en hexadécimal, le nom de l'algorithme `ML-DSA-87 (FIPS 204)`, et le verdict `pqc_hybrid_verify`.
- Dans l'explorateur : ouvrez https://explore.qore.network, passez-le sur **Testnet**, et cherchez le hash de votre transaction.

## Paquets utilisés {#packages}

| Paquet | Version | Rôle |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (épinglée) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Listé comme dépendance ; la page elle-même utilise de simples appels REST |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin React pour Vite |
| `vite` | ^5.4.0 | Serveur de développement et compilation |
| `typescript` | ^5.6.3 | Vérification des types |

## Code source {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
