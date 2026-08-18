---
slug: /qorex/browser-extension
title: Extension de navigateur QoreX
sidebar_label: Extension de navigateur
sidebar_position: 2
---

# Extension de navigateur QoreX

L'**extension de navigateur** QoreX est le portefeuille QoreChain pour ordinateur. C'est un **portefeuille autonome** — créez ou importez un portefeuille, conservez et envoyez des QOR, et connectez-vous à des dApps — et c'est la brique qui permet à n'importe quel site web de détecter QoreX et de transformer chaque requête en une approbation explicite et décodée.

Elle est **en ligne et publique** sur trois boutiques.

## Installation {#install}

| Navigateur | Installation |
|---|---|
| **Chrome et navigateurs Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 ou version ultérieure)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Quelle version est en ligne et où {#versions}

Les validations des boutiques n'arrivent pas au même moment, la version publiée diffère donc actuellement selon le navigateur :

| Navigateur | Version publiée |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 soumise, en cours de validation) |
| **Safari (macOS)** | livrée à l'intérieur de l'application macOS **QoreX Wallet**, qui utilise sa propre numérotation `1.x` — le Mac App Store propose actuellement la **1.0** ; la version qui embarque l'extension 0.1.5 est en cours de validation |

La **0.1.5** ajoute la [découverte via Solana Wallet Standard](#standards), le [déverrouillage par clé d'accès](#security), une [voie dApp SVM](#standards) entièrement implémentée et le [pont de connexion au Dashboard](#dashboard-bridge). (La version 0.1.4 n'a jamais été publiée — ses changements parviennent aux utilisateurs avec la 0.1.5.)

**La surface de permissions est identique en 0.1.3 et en 0.1.5** — voir [Quelles permissions QoreX demande](#permissions).

:::note
Sur Safari, les approbations s'ouvrent dans un onglet du navigateur plutôt que dans une fenêtre contextuelle — l'extension est empaquetée avec l'enveloppe d'extension web Safari d'Apple à partir du même code source.
:::

## Créer ou restaurer un portefeuille {#wallet}

Ouvrez la fenêtre contextuelle et choisissez :

- **Créer un portefeuille** — génère une nouvelle phrase de récupération de 24 mots sur votre appareil (entropie de 256 bits), dérive votre identité QoreChain et la scelle dans le coffre sous un mot de passe (et, en option, une clé d'accès — voir [Sécurité](#security)).
- **Importer un portefeuille** — restaurez à partir d'une phrase de 24 mots existante.

L'extension détient ses propres clés ; elle ne nécessite pas l'application mobile. Vous pouvez également exporter votre phrase mnémonique depuis la fenêtre contextuelle. Les clés ne quittent jamais l'appareil.

### Envoyer sur des réseaux externes {#send-external}

Outre les QOR sur la voie Native, la fenêtre contextuelle permet d'envoyer des actifs sur des réseaux externes, tous dérivés de la même phrase de récupération :

| Type | Réseaux | Jetons intégrés |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | entrées ERC-20 (USDT, USDC, DAI le cas échéant) |
| SVM | Solana | entrées SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | entrée IBC (USDC sur Osmosis) ; champ mémo optionnel |

Avant qu'un transfert externe ne parte, vous devez cocher une confirmation explicite : **« Les réseaux externes n'acceptent que des signatures classiques — contrairement à vos QOR, ce transfert n'est PAS résistant au quantique. »** Les chaînes externes ne peuvent pas transporter de signature post-quantique, et QoreX ne le cache jamais.

## Standards de portefeuille pris en charge {#standards}

QoreX expose trois interfaces, toutes injectées dans la page en tant que `window.qorex` (`{ evm, native, svm }`) et détectées grâce aux contrats de détection de [`@qorechain/connect`](/sdk/overview).

| Standard | De quoi il s'agit | Ce que cela signifie pour vous, développeur |
|---|---|---|
| **EIP-1193** | L'API JavaScript du fournisseur Ethereum (`request(...)`, événements). | Votre code ethers.js / viem / web3.js existant dialogue avec la voie EVM de QoreX sans modification ; les codes d'erreur numériques (par ex. `4902`) sont transmis tels quels. |
| **EIP-6963** | Découverte multi-portefeuilles des fournisseurs (événements d'annonce / de requête). | QoreX s'annonce aux côtés de tous les autres portefeuilles — il **n'écrase jamais `window.ethereum`** — de sorte que l'utilisateur choisit QoreX site par site, sans conflit. |
| **`signDirect` façon Keplr** | Un fournisseur de forme `OfflineDirectSigner` de Cosmos sur `window.qorex.native`. | Les dApps de type Cosmos signent les transactions de la **voie Native** de QoreChain exactement comme elles le feraient avec Keplr ; la couche post-quantique est pré-appliquée (voir [Signature post-quantique](#pqc)). |
| **Solana Wallet Standard** *(à partir de 0.1.5)* | Découverte native des portefeuilles pour les dApps Solana (`wallet-standard:register-wallet` / `app-ready`). | Les dApps Solana **détectent QoreX automatiquement** — aucune intégration sur mesure. Fonctionnalités : `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction` ; chaîne `solana:mainnet` ; transactions `legacy` et `v0`. |

:::note Accéder directement à la voie SVM
La même interface est également disponible sur `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). La découverte automatique Wallet-Standard et la voie SVM entièrement implémentée arrivent avec la **0.1.5** — elles sont donc disponibles aujourd'hui sur **Firefox**, et sur Chrome dès que la 0.1.5 aura passé la validation (voir [quelle version est en ligne et où](#versions)).

Les approbations Solana affichent la charge utile décodée (destinataire et lamports pour les transferts System, ainsi que la liste des programmes), rejettent les transactions qui n'indiquent pas votre portefeuille comme signataire, et marquent la signature comme **classique** — voir [Signature post-quantique](#pqc).
:::

## Sécurité et permissions {#security}

QoreX est conçu pour être vérifiable, et pas seulement digne de confiance :

- **Coffre** — vos clés sont scellées avec **AES-256-GCM**. Le chemin par mot de passe dérive sa clé avec **Argon2id** (RFC 9106, gourmand en mémoire : 64 MiB, t=3, p=1), de sorte qu'un blob de coffre exfiltré résiste au cassage par GPU/ASIC. (Les anciens blobs PBKDF2 restent ouvrables et sont rescellés en Argon2id au déverrouillage suivant.)
- **Déverrouillage par clé d'accès (optionnel, à partir de 0.1.5)** — lorsque votre authentificateur prend en charge l'extension **WebAuthn PRF**, QoreX peut déverrouiller le coffre à partir de la sortie PRF de 32 octets de la clé d'accès au lieu d'un mot de passe saisi. Votre mot de passe reste toujours une solution de repli.

  :::note Où apparaît le déverrouillage par clé d'accès
  QoreX détecte la présence de WebAuthn et n'affiche **Activer le déverrouillage par clé d'accès** que là où le navigateur l'expose aux pages d'extension — c'est-à-dire sur **Chrome et Edge**. Sur **Firefox**, l'option est masquée, car Firefox n'expose pas WebAuthn aux pages d'extension. Combiné au [décalage de versions](#versions), cela signifie qu'aujourd'hui un utilisateur Firefox dispose de Wallet Standard mais pas du déverrouillage par clé d'accès, et qu'un utilisateur Chrome n'a ni l'un ni l'autre tant que la 0.1.5 n'a pas passé la validation. C'est attendu, ce n'est pas un bug.
  :::
- **Manifest V3 + CSP stricte** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Il n'y a **aucun chargement de code distant** après l'installation ni de `wasm-unsafe-eval`.
- **Pas de compte, pas de télémétrie** — pas d'analytique, pas de pistage, pas de journalisation distante, pas d'inscription et pas d'e-mail. La fiche Firefox déclare une collecte de données `none`.

### Quelles permissions QoreX demande, et pourquoi {#permissions}

Cette section existe parce que la fiche Firefox met en avant la permission **« Accéder à vos données pour tous les sites web »**, ce qui peut sembler contradictoire avec un portefeuille qui ne déclare aucune permission d'hôte. Voici la vérité exacte et non retouchée, telle qu'elle figure dans le manifeste.

Le fichier `manifest.json` de l'extension déclare :

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — la seule permission d'API. Elle stocke le coffre chiffré et vos approbations de connexion par origine **localement**, dans le stockage de l'extension.
- **`host_permissions: []`** — QoreX ne déclare **aucune** permission d'hôte. Il ne demande pas la capacité d'effectuer des requêtes réseau multi-origines vers des sites arbitraires en votre nom.
- **`content_scripts` correspond à `<all_urls>`** — c'est la raison honnête pour laquelle Firefox indique *« Accéder à vos données pour tous les sites web. »* QoreX injecte un petit script fournisseur (`content.js` → `inpage.js`) dans **chaque page**. Un script de contenu qui s'exécute sur tous les sites *peut* techniquement lire la page, et les navigateurs décrivent cette capacité avec cette formulation exacte — qu'elle provienne de `host_permissions` ou d'une correspondance de script de contenu.

**Pourquoi le script de contenu s'exécute partout.** Pour que **n'importe quelle** dApp puisse détecter le portefeuille via EIP-6963 sans que vous ayez d'abord à accorder un accès site par site. C'est ainsi que fonctionnent MetaMask, Keplr, Phantom et tous les autres portefeuilles injectés : le fournisseur injecté doit être présent avant l'exécution des scripts de la page (`document_start`), quel que soit le site que vous visitez.

**Ce que fait ce script — et ce qu'il ne fait pas.** Il se contente de relayer les messages du portefeuille (annoncer le fournisseur, transmettre les requêtes de connexion/signature au service worker, renvoyer le résultat). Il ne lit **pas** le contenu de la page au-delà de ces requêtes de portefeuille, n'envoie rien à un serveur et ne charge pas de code distant — et il ne peut pas récupérer de données multi-origines arbitraires puisqu'il n'y a aucune permission d'hôte. Tout cela est vérifiable : l'extension est verrouillée par CSP, ne contient aucune analytique, et le paquet Firefox inclut une archive source reproductible.

## Connecter une dApp à QoreX {#connect}

Une dApp découvre la voie EVM de QoreX via **EIP-6963**. Annonce-et-requête, puis utilisation du fournisseur EIP-1193 renvoyé :

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

Pour la voie **Native** de QoreChain, utilisez le fournisseur façon Keplr situé sur `window.qorex.native` (`enable`, `getKey`, `signDirect`). Le paquet de plus haut niveau [`@qorechain/connect`](/sdk/overview) encapsule cette détection pour vous.

Les approbations sont **par origine** : la première connexion à un site ouvre une fenêtre d'approbation affichant l'origine, l'approbation ne révèle que votre adresse publique, et l'approbation d'un site n'accorde rien à un autre.

### Pont Dashboard (v0.1.5) {#dashboard-bridge}

La version 0.1.5 ajoute un pont limité à **`dashboard.qorechain.io` uniquement** : `window.qorex.native.connectProof(sessionId)` signe la preuve d'appairage *Connect with QoreX* (le backend revérifie la signature), et `executeTransfer({ to, amountUqor, memo })` approuve et diffuse un transfert de QOR proposé par le Dashboard, en renvoyant le `txHash`. Ces méthodes sont refusées sur toute autre origine.

## Signature post-quantique {#pqc}

Chaque transfert de QOR initié par QoreX lui-même est signé avec une **signature post-quantique hybride** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) aux côtés de la signature classique secp256k1 — au moyen du pipeline hybride complet de `@qorechain/sdk`. **Il n'y a aucune option pour la désactiver** : QoreChain l'exige et QoreX n'envoie jamais un transfert de QOR sur la voie Native sans elle.

- **Signature Native initiée par une dApp** — les dApps construites sur le flux qorechain-connect insèrent au préalable l'extension PQC (`/qorechain.pqc.v1.PQCHybridSignature`) dans le corps de la transaction avant d'appeler `signDirect` ; QoreX apporte la moitié classique et **refuse de signer à l'aveugle**, en décodant la charge utile et en indiquant si la couche PQC est présente.
- **Les requêtes classiques sont toujours signalées** — si une requête ne comporte aucune couche PQC, ou vise une chaîne externe (ETH/BNB/etc., qui ne peuvent pas transporter de PQC), QoreX affiche un avertissement explicite plutôt que de déclasser silencieusement.

**Ce que cela implique pour la taille des transactions.** ML-DSA-87 produit une grande signature : la signature fait **4 627 octets** et la clé publique **2 592 octets** (fixés par FIPS-204). Une transaction QoreChain hybride est donc plus lourde de plusieurs kilo-octets qu'une transaction purement classique. Si vous construisez et diffusez vous-même les transactions, dimensionnez vos tampons et vos estimations de frais pour ces octets supplémentaires ; la comptabilisation du gas de QoreChain les prévoit déjà. Voir [Signature post-quantique](/developer-guide/post-quantum-signing) pour les primitives et l'exigence de signature déterministe.
