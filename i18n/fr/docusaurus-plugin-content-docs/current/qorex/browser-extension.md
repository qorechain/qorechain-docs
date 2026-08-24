---
slug: /qorex/browser-extension
title: Extension navigateur QoreX
sidebar_label: Extension navigateur
sidebar_position: 2
---

# Extension navigateur QoreX

L'**extension navigateur** QoreX est le portefeuille QoreChain de bureau. C'est un **portefeuille autonome** — créez ou importez un portefeuille, détenez et envoyez des QOR, et connectez-vous à des dApps — et c'est elle qui permet à n'importe quel site web de découvrir QoreX et de transformer chaque requête en une approbation explicite et décodée.

Elle est **en ligne et publique** sur trois boutiques.

## Installation {#install}

| Navigateur | Installation |
|---|---|
| **Chrome et navigateurs Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 ou ultérieur)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Quelle version est en ligne où {#versions}

Les revues des boutiques n'arrivent pas au même moment, donc la version publiée diffère actuellement selon le navigateur :

| Navigateur | Version publiée |
|---|---|
| **Firefox** | **0.1.8** (0.1.9 soumise, en revue) |
| **Chrome / Chromium** | **0.1.5** (0.1.9 soumise, en revue) |
| **Safari (macOS)** | livrée à l'intérieur de l'app macOS **QoreX Wallet**, qui utilise sa propre numérotation `1.x` — le Mac App Store sert actuellement la **1.1** (qui embarque l'extension 0.1.5) ; la **1.2** (embarquant la 0.1.9) est soumise et en revue |

Il se peut que des fonctionnalités plus récentes ne soient pas encore en ligne dans votre navigateur — vérifiez le tableau ci-dessus avant de supposer que quelque chose de décrit ici est disponible.

**La 0.1.5** a ajouté la [découverte via Solana Wallet Standard](#standards), le [déverrouillage par clé d'accès (passkey)](#security), une [voie dApp SVM](#standards) pleinement implémentée, et le [pont de connexion au Dashboard](#dashboard-bridge). (La version 0.1.4 n'a jamais été publiée — ses changements atteignent les utilisateurs via la 0.1.5.)

**Les versions 0.1.6 à 0.1.9** ont ajouté, dans l'ordre : des envois tenant compte du vesting avec des messages de refus bancaire honnêtes ; l'adresse du compte et le solde en direct affichés directement sur l'accueil du popup ; et, dans la **0.1.9**, le [paiement d'un @handle](#handle-send) directement depuis Envoyer, un [écran Recevoir avec un code QR d'adresse](#receive), un [sélecteur de langue](#language) (dix langues, correspondant à l'ensemble de l'app mobile), et la suppression d'une « prochaine date de déblocage » source de confusion sur le [solde de vesting](#vesting).

**La surface de permissions n'a pas changé depuis la 0.1.3** — voir [Quelles permissions QoreX demande](#permissions).

:::note
Sur Safari, les approbations s'ouvrent dans un onglet de navigateur plutôt que dans une fenêtre popup — l'extension est empaquetée avec le wrapper d'extension web Safari d'Apple, à partir de la même base de code.
:::

## Créer ou restaurer un portefeuille {#wallet}

Ouvrez le popup et choisissez :

- **Créer un portefeuille** — génère une nouvelle phrase de récupération de 24 mots sur votre appareil (entropie 256 bits), dérive votre identité QoreChain, et la scelle dans le coffre-fort sous un mot de passe (et, en option, une clé d'accès — voir [Sécurité](#security)).
- **Importer un portefeuille** — restaure à partir d'une phrase de 24 mots existante.

L'extension détient ses propres clés ; elle ne nécessite pas l'app mobile. Vous pouvez aussi exporter votre mnémonique depuis le popup. Les clés ne quittent jamais l'appareil.

:::note Un compte par profil de navigateur
Contrairement à l'app mobile, qui peut détenir plusieurs comptes QoreChain à partir d'une seule phrase de récupération, l'extension gère exactement **un** compte. Le staking, le Portfolio, le Q-Day Scanner, la récupération sociale, le Legacy Protocol, les demandes de paiement et la liaison d'appareils sont réservés au mobile — voir [QoreX Wallet](/qorex/overview#platform-availability) pour la comparaison complète.
:::

## Votre compte, solde et @handle {#account}

L'écran d'accueil du popup affiche votre adresse `qor1…` (appuyez pour copier) et votre solde QOR en direct, afin que vous n'ayez pas besoin d'ouvrir un explorateur de blocs pour vérifier l'un ou l'autre.

### Soldes en vesting (verrouillés) {#vesting}

Si votre compte détient des QOR en vesting (par exemple une allocation TGE non encore libérée), le solde se divise en **disponible maintenant** et **encore verrouillé**, et un envoi qui dépasse le montant disponible est refusé avant d'atteindre le réseau plutôt que d'échouer sur la chaîne après avoir prélevé des frais. QoreX ne montre délibérément **pas** de « prochaine date de déblocage » ici : un calendrier de vesting peut être modifié par la gouvernance, donc une date sur la carte de solde se lirait comme une promesse que QoreX ne peut pas garantir. La répartition disponible-contre-verrouillé est ce qui reste exact.

### Réclamer un @handle

Depuis le popup, vous pouvez réclamer un **@handle** unique (par exemple `@liviu`) pour l'adresse de ce compte, comme dans l'app mobile. La réclamation est signée avec la clé propre au compte et se lie à cette adresse, afin que l'app mobile et le Dashboard puissent la résoudre lorsque quelqu'un vous envoie des fonds. Voir [@handle](/qorex/account-and-dashboard#handle) pour savoir comment les handles sont liés aux adresses (et non à un portefeuille dans son ensemble).

## Envoyer vers un @handle {#handle-send}

Depuis la 0.1.9, vous pouvez payer un @handle enregistré directement au lieu de rechercher une adresse :

1. Ouvrez le popup et appuyez sur **Envoyer**.
2. Dans le champ destinataire, tapez `@` suivi du handle (par exemple `@liviu`) au lieu d'une adresse `qor1…`.
3. QoreX résout le handle et vous montre l'**adresse résolue** avant que vous signiez quoi que ce soit — vérifiez toujours cela par rapport à ce que vous attendez.
4. Saisissez le montant et confirmez.

La résolution est vérifiée de deux façons avant que QoreX ne l'utilise : une attestation de registre vérifiée par rapport à une clé de confiance intégrée à l'extension, et la signature propre du détenteur du handle sur la réclamation. Une réponse qui échoue à l'une ou l'autre vérification est rejetée d'emblée — QoreX ne se rabat pas sur l'affichage d'une adresse non vérifiée. La première fois que vous payez un handle donné, QoreX mémorise (épingle) l'adresse vers laquelle il a résolu ; si ce handle résout plus tard vers une adresse **différente**, QoreX s'arrête et vous montre l'ancienne et la nouvelle adresse en entier afin que vous puissiez décider de continuer ou non.

## Recevoir {#receive}

Appuyez sur **Recevoir** dans le popup pour afficher votre adresse `qor1…` sous forme de code QR (avec l'icône QoreChain intégrée) accompagné d'un bouton de copie — scannez-le depuis un téléphone ou collez directement l'adresse.

### Envoyer sur des réseaux externes {#send-external}

Outre les QOR sur la voie Native, le popup peut envoyer des actifs sur des réseaux externes, tous dérivés de la même phrase de récupération :

| Type | Réseaux | Jetons intégrés |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Entrées ERC-20 (USDC et USDT sur les chaînes EVM, DAI sur Ethereum) |
| SVM | Solana | Entrées SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC via IBC ; champ mémo optionnel |

Avant qu'un transfert externe ne soit envoyé, vous devez cocher une reconnaissance explicite : **« Les réseaux externes n'acceptent que des signatures classiques — contrairement à vos QOR, ce transfert n'est PAS résistant au quantique. »** Les chaînes externes ne peuvent pas porter de signature post-quantique, et QoreX ne le cache jamais.

## Standards de portefeuille pris en charge {#standards}

QoreX expose trois interfaces, toutes injectées sur la page en tant que `window.qorex` (`{ evm, native, svm }`) et découvertes via les contrats de détection [`@qorechain/connect`](/sdk/overview).

| Standard | Ce que c'est | Ce que cela signifie pour vous en tant que développeur |
|---|---|---|
| **EIP-1193** | L'API JavaScript du fournisseur Ethereum (`request(...)`, événements). | Votre code ethers.js / viem / web3.js existant communique avec la voie EVM de QoreX sans modification ; les codes d'erreur numériques (par exemple `4902`) sont transmis tels quels. |
| **EIP-6963** | Découverte de fournisseur multi-portefeuille (événements announce / request). | QoreX s'annonce aux côtés de tous les autres portefeuilles — il **n'écrase jamais `window.ethereum`** — de sorte que l'utilisateur choisit QoreX par site sans conflit. |
| **`signDirect` façon Keplr** | Un fournisseur au format `OfflineDirectSigner` de Cosmos, sur `window.qorex.native`. | Les dApps de style Cosmos signent les transactions de la **voie Native** de QoreChain de la même manière qu'avec Keplr ; la couche post-quantique est pré-appliquée (voir [Signature post-quantique](#pqc)). |
| **Solana Wallet Standard** *(depuis la 0.1.5)* | Découverte native de portefeuille pour les dApps Solana (`wallet-standard:register-wallet` / `app-ready`). | Les dApps Solana **détectent automatiquement QoreX** — aucune intégration personnalisée nécessaire. Fonctionnalités : `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction` ; chaîne `solana:mainnet` ; transactions `legacy` et `v0`. |

:::note Atteindre directement la voie SVM
La même interface est aussi disponible sur `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). La découverte automatique via Wallet-Standard et la voie SVM pleinement implémentée sont sorties en **0.1.5** et sont en ligne à la fois sur Chrome et Firefox (voir [quelle version est en ligne où](#versions)).

Les approbations Solana affichent la charge utile décodée (destinataire et lamports pour les transferts System, et la liste des programmes), rejettent les transactions qui ne listent pas votre portefeuille comme signataire, et marquent la signature comme **classique** — voir [Signature post-quantique](#pqc).
:::

## Langue {#language}

L'extension parle les mêmes dix langues que l'app mobile, le dashboard et le site : anglais, roumain, allemand, espagnol, français, italien, turc, arabe, japonais et coréen. Elle suit par défaut la langue de votre **navigateur** (avec repli sur l'anglais pour tout le reste) — notez qu'il s'agit d'une source différente de l'app mobile, qui suit la langue du **téléphone**, donc les deux peuvent afficher des langues différentes si votre téléphone et votre navigateur sont configurés différemment. Un sélecteur sur l'écran d'accueil du popup vous permet de remplacer la langue détectée à tout moment ; passer à l'arabe bascule immédiatement le popup en écriture de droite à gauche, pas seulement le texte.

## Sécurité et permissions {#security}

QoreX est conçu pour être vérifiable, pas seulement digne de confiance :

- **Coffre-fort** — vos clés sont scellées avec **AES-256-GCM**. Le chemin par mot de passe dérive sa clé avec **Argon2id** (RFC 9106, gourmand en mémoire : 64 Mio, t=3, p=1), de sorte qu'un blob de coffre-fort exfiltré résiste au cassage par GPU/ASIC. (Les blobs PBKDF2 hérités restent ouvrables et se rescellent en Argon2id au déverrouillage suivant.)
- **Déverrouillage par clé d'accès (optionnel, depuis la 0.1.5)** — lorsque votre authentificateur prend en charge l'extension **WebAuthn PRF**, QoreX peut déverrouiller le coffre-fort à partir de la sortie PRF de 32 octets de la clé d'accès au lieu d'un mot de passe saisi. Votre mot de passe reste toujours une solution de repli.

  :::note Où apparaît le déverrouillage par clé d'accès
  QoreX détecte la présence de WebAuthn et n'affiche **Activer le déverrouillage par clé d'accès** que là où le navigateur l'expose aux pages d'extension — c'est-à-dire **Chrome et Edge**. Sur **Firefox**, l'option est masquée, car Firefox n'expose pas WebAuthn aux pages d'extension. C'est le comportement attendu, pas un bug.
  :::
- **Manifest V3 + CSP stricte** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Il n'y a **aucun chargement de code distant** après l'installation et pas de `wasm-unsafe-eval`.
- **Aucun compte, aucune télémétrie** — pas d'analytique, pas de suivi, pas de journalisation distante, pas d'inscription, et pas d'email. La fiche Firefox déclare une collecte de données à `none`.

### Quelles permissions QoreX demande, et pourquoi {#permissions}

Cette section existe parce que la fiche Firefox affiche la permission **« Accéder à vos données pour tous les sites web »**, ce qui peut sembler en contradiction avec un portefeuille qui ne déclare aucune permission d'hôte. Voici la vérité exacte, sans fard, tirée du manifeste.

Le `manifest.json` de l'extension déclare :

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — la seule permission d'API. Elle stocke le coffre-fort chiffré et vos approbations de connexion par origine **localement**, dans le stockage de l'extension.
- **`host_permissions: []`** — QoreX ne déclare **aucune** permission d'hôte. Elle ne demande pas la capacité de faire des requêtes réseau inter-origines vers des sites arbitraires en votre nom.
- **`content_scripts` correspond à `<all_urls>`** — c'est la raison honnête pour laquelle Firefox indique *« Accéder à vos données pour tous les sites web »*. QoreX injecte un petit script fournisseur (`content.js` → `inpage.js`) dans **chaque page**. Un content script qui s'exécute sur tous les sites *peut* techniquement lire la page, et les navigateurs décrivent cette capacité avec exactement ce libellé — qu'elle provienne de `host_permissions` ou d'une correspondance de content script.

**Pourquoi le content script s'exécute partout.** Afin que **n'importe quelle** dApp puisse découvrir le portefeuille via EIP-6963 sans que vous ayez d'abord à accorder un accès site par site. C'est ainsi que fonctionnent MetaMask, Keplr, Phantom et tout autre portefeuille injecté : le fournisseur injecté doit être présent avant que les scripts de la page ne s'exécutent (`document_start`), quel que soit le site que vous visitez.

**Ce que ce script fait — et ne fait pas.** Il ne fait que relayer les messages du portefeuille (annoncer le fournisseur, transmettre les requêtes de connexion/signature au service worker, renvoyer le résultat). Il ne lit **pas** le contenu de la page au-delà de ces requêtes de portefeuille, n'envoie rien à un serveur, et ne charge pas de code distant — et il ne peut pas récupérer de données inter-origines arbitraires puisqu'il n'y a aucune permission d'hôte. Tout ceci est vérifiable : l'extension est verrouillée par CSP, n'embarque aucune analytique, et le paquet Firefox inclut une archive source reproductible.

## Connecter une dApp à QoreX {#connect}

Une dApp découvre la voie EVM de QoreX via **EIP-6963**. Annoncer-puis-demander, puis utiliser le fournisseur EIP-1193 retourné :

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

Pour la voie **Native** de QoreChain, utilisez le fournisseur façon Keplr sur `window.qorex.native` (`enable`, `getKey`, `signDirect`). Le package de plus haut niveau [`@qorechain/connect`](/sdk/overview) enveloppe cette détection pour vous.

Les approbations sont **par origine** : la première connexion à un site ouvre un popup d'approbation montrant l'origine, l'approbation ne révèle que votre adresse publique, et l'approbation d'un site n'accorde rien à un autre.

### Pont Dashboard (v0.1.5) {#dashboard-bridge}

La version 0.1.5 ajoute un pont limité à **`dashboard.qorechain.io` uniquement** : `window.qorex.native.connectProof(sessionId)` signe la preuve d'appairage *Connect with QoreX* (le backend revérifie la signature), et `executeTransfer({ to, amountUqor, memo })` approuve et diffuse un transfert QOR proposé par le Dashboard, en retournant le `txHash`. Ces méthodes sont refusées sur toute autre origine.

Comme une adresse `qor1…` est également valide sur le mainnet et le testnet, une requête proposée par le Dashboard indique le réseau qu'elle cible, et QoreX refuse d'agir dessus si cela ne correspond pas au réseau auquel l'extension est actuellement connectée — elle ne changera jamais de réseau au nom d'une requête.

## Signature post-quantique {#pqc}

Chaque transfert de QOR initié par QoreX lui-même est signé avec une **signature post-quantique hybride** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) aux côtés de la signature classique secp256k1 — en utilisant le pipeline hybride complet dans `@qorechain/sdk`. **Il n'y a pas de bascule** : QoreChain l'exige et QoreX n'envoie jamais un transfert QOR sur la voie Native sans elle.

- **Signature Native initiée par une dApp** — les dApps construites sur le flux qorechain-connect pré-superposent l'extension PQC (`/qorechain.pqc.v1.PQCHybridSignature`) dans le corps de la transaction avant d'appeler `signDirect` ; QoreX apporte la moitié classique et **refuse de signer à l'aveugle**, décodant la charge utile et indiquant si la couche PQC est présente.
- **Les requêtes classiques sont toujours étiquetées** — si une requête ne porte aucune couche PQC, ou cible une chaîne externe (ETH/BNB/etc., qui ne peut pas porter de PQC), QoreX affiche un avertissement explicite plutôt que de rétrograder silencieusement.

**Ce que cela signifie pour la taille des transactions.** ML-DSA-87 est une signature volumineuse : la signature fait **4 627 octets** et la clé publique **2 592 octets** (fixé par FIPS-204). Une transaction QoreChain hybride est donc plusieurs kilo-octets plus grande qu'une transaction purement classique. Si vous construisez et diffusez des transactions vous-même, dimensionnez vos tampons et estimations de frais en conséquence ; la comptabilité de gaz de QoreChain les anticipe déjà. Voir [Signature post-quantique](/developer-guide/post-quantum-signing) pour les primitives et l'exigence de signature déterministe.
