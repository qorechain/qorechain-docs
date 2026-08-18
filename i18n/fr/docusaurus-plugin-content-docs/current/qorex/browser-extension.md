---
slug: /qorex/browser-extension
title: Extension de navigateur QoreX
sidebar_label: Extension de navigateur
sidebar_position: 2
---

# Extension de navigateur QoreX

L'**extension de navigateur** QoreX est le portefeuille QoreChain pour ordinateur. C'est un **portefeuille autonome** — créez ou importez un portefeuille, détenez et envoyez des QOR, et connectez-vous à des dApps — et c'est l'élément qui permet à n'importe quel site web de découvrir QoreX et de transformer chaque requête en une approbation explicite et décodée.

Elle est **en ligne et publique** sur trois boutiques.

## Installation {#install}

| Navigateur | Installation |
|---|---|
| **Chrome et navigateurs Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 ou ultérieur)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

La version publique actuelle est la **0.1.3**. La version **0.1.5** est en cours de déploiement ; elle ajoute le [pont de connexion au Dashboard](#dashboard-bridge). La surface des permissions est inchangée entre ces versions.

:::note
Sur Safari, les approbations s'ouvrent dans un onglet du navigateur plutôt que dans une fenêtre contextuelle — l'extension est empaquetée avec le wrapper d'extension web Safari d'Apple à partir de la même base de code.
:::

## Créer ou restaurer un portefeuille {#wallet}

Ouvrez la fenêtre contextuelle et choisissez :

- **Créer un portefeuille** — génère une nouvelle phrase de récupération de 24 mots sur votre appareil (entropie de 256 bits), dérive votre identité QoreChain et la scelle dans le coffre sous un mot de passe (et, en option, une clé d'accès — voir [Sécurité](#security)).
- **Importer un portefeuille** — restaurez à partir d'une phrase de 24 mots existante.

L'extension détient ses propres clés ; elle ne nécessite pas l'application mobile. Vous pouvez aussi exporter votre mnémonique depuis la fenêtre contextuelle. Les clés ne quittent jamais l'appareil.

## Standards de portefeuille pris en charge {#standards}

QoreX expose trois interfaces, toutes injectées sur la page en tant que `window.qorex` (`{ evm, native, svm }`) et découvertes via les contrats de détection [`@qorechain/connect`](/sdk/overview).

| Standard | Ce que c'est | Ce que cela signifie pour vous en tant que développeur |
|---|---|---|
| **EIP-1193** | L'API JavaScript du provider Ethereum (`request(...)`, événements). | Votre code ethers.js / viem / web3.js existant communique avec la voie EVM de QoreX sans modification ; les codes d'erreur numériques (par ex. `4902`) sont transmis tels quels. |
| **EIP-6963** | Découverte de provider multi-portefeuilles (événements announce / request). | QoreX s'annonce aux côtés de tout autre portefeuille — il **n'écrase jamais `window.ethereum`** — de sorte que l'utilisateur choisit QoreX par site sans conflit. |
| **`signDirect` de type Keplr** | Un provider de forme `OfflineDirectSigner` Cosmos sur `window.qorex.native`. | Les dApps de style Cosmos signent les transactions de la **voie Native** QoreChain de la même façon qu'avec Keplr ; la couche post-quantique est pré-appliquée (voir [Signature post-quantique](#pqc)). |

:::note SVM (compatible Solana)
Un provider SVM est exposé sur `window.qorex.svm` avec `connect` / `signAndSendTransaction` / `signMessage`. QoreX ne s'enregistre **pas** encore via le protocole de découverte **Wallet Standard** de Solana, de sorte que les dApps Solana qui reposent sur l'auto-découverte Wallet-Standard ne détecteront pas QoreX automatiquement — accédez-y directement via `window.qorex.svm` pour l'instant.
:::

## Sécurité et permissions {#security}

QoreX est conçu pour être vérifiable, pas seulement digne de confiance :

- **Coffre** — vos clés sont scellées avec **AES-256-GCM**. Le chemin par mot de passe dérive sa clé avec **Argon2id** (RFC 9106, à mémoire intensive : 64 MiB, t=3, p=1), de sorte qu'un blob de coffre exfiltré résiste au cassage par GPU/ASIC. (Les anciens blobs PBKDF2 restent ouvrables et se re-scellent en Argon2id au prochain déverrouillage.)
- **Déverrouillage par clé d'accès (optionnel)** — lorsque votre authentificateur prend en charge l'extension **WebAuthn PRF**, QoreX peut déverrouiller le coffre à partir de la sortie PRF de 32 octets de la clé d'accès au lieu d'un mot de passe saisi.
- **Manifest V3 + CSP strict** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Il n'y a **aucun chargement de code distant** après l'installation ni de `wasm-unsafe-eval`.
- **Aucun compte, aucune télémétrie** — pas d'analytique, pas de suivi, pas de journalisation à distance, pas d'inscription et pas d'e-mail. La fiche Firefox déclare la collecte de données comme `none`.

### Quelles permissions QoreX demande, et pourquoi {#permissions}

Cette section existe parce que la fiche Firefox fait apparaître la permission **« Accéder à vos données pour tous les sites web »**, ce qui peut sembler en contradiction avec un portefeuille qui ne déclare aucune permission d'hôte. Voici la vérité exacte et non modifiée du manifeste.

Le fichier `manifest.json` de l'extension déclare :

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — la seule permission d'API. Elle stocke le coffre chiffré et vos approbations de connexion par origine **localement**, dans le stockage de l'extension.
- **`host_permissions: []`** — QoreX ne déclare **aucune** permission d'hôte. Il ne demande pas la capacité d'effectuer des requêtes réseau cross-origin vers des sites arbitraires en votre nom.
- **`content_scripts` correspond à `<all_urls>`** — c'est la raison honnête pour laquelle Firefox indique *« Accéder à vos données pour tous les sites web ».* QoreX injecte un petit script de provider (`content.js` → `inpage.js`) dans **chaque page**. Un content script qui s'exécute sur tous les sites *peut* techniquement lire la page, et les navigateurs décrivent cette capacité avec exactement cette formulation — qu'elle provienne de `host_permissions` ou d'une correspondance de content-script.

**Pourquoi le content script s'exécute partout.** Pour que **n'importe quelle** dApp puisse découvrir le portefeuille via EIP-6963 sans que vous ayez d'abord à accorder un accès par site. C'est ainsi que fonctionnent MetaMask, Keplr, Phantom et tous les autres portefeuilles injectés : le provider injecté doit être présent avant l'exécution des scripts de la page (`document_start`), sur quelque site que vous visitiez.

**Ce que fait ce script — et ce qu'il ne fait pas.** Il ne fait que relayer les messages du portefeuille (annoncer le provider, transmettre les requêtes de connexion/signature au service worker, renvoyer le résultat). Il ne lit **pas** le contenu de la page au-delà de ces requêtes de portefeuille, n'envoie rien à un serveur et ne charge aucun code distant — et il ne peut pas récupérer de données cross-origin arbitraires puisqu'il n'y a aucune permission d'hôte. Tout cela est vérifiable : l'extension est verrouillée par CSP, ne livre aucune analytique, et le paquet Firefox inclut une archive source reproductible.

## Connecter une dApp à QoreX {#connect}

Une dApp découvre la voie EVM de QoreX via **EIP-6963**. Announce-and-request, puis utilisez le provider EIP-1193 renvoyé :

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

Pour la voie **Native** de QoreChain, utilisez le provider de type Keplr sur `window.qorex.native` (`enable`, `getKey`, `signDirect`). Le paquet de plus haut niveau [`@qorechain/connect`](/sdk/overview) encapsule cette détection pour vous.

Les approbations sont **par origine** : la première connexion à un site ouvre une fenêtre d'approbation affichant l'origine, l'approbation ne révèle que votre adresse publique, et l'approbation d'un site n'accorde rien à un autre.

### Pont Dashboard (v0.1.5) {#dashboard-bridge}

La version 0.1.5 ajoute un pont limité à **`dashboard.qorechain.io` uniquement** : `window.qorex.native.connectProof(sessionId)` signe la preuve d'appairage *Connect with QoreX* (le backend re-vérifie la signature), et `executeTransfer({ to, amountUqor, memo })` approuve et diffuse un transfert de QOR proposé par le Dashboard, renvoyant le `txHash`. Ces méthodes sont refusées sur toute autre origine.

## Signature post-quantique {#pqc}

Chaque transfert de QOR que QoreX initie lui-même est signé avec une **signature hybride post-quantique** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) aux côtés de la signature secp256k1 classique — en utilisant le pipeline hybride complet de `@qorechain/sdk`. **Il n'y a pas de bascule** : QoreChain l'exige et QoreX n'envoie jamais un transfert de QOR sur la voie Native sans elle.

- **Signature Native initiée par une dApp** — les dApps construites sur le flux qorechain-connect pré-superposent l'extension PQC (`/qorechain.pqc.v1.PQCHybridSignature`) dans le corps de la transaction avant d'appeler `signDirect` ; QoreX contribue la moitié classique et **refuse de signer à l'aveugle**, en décodant la charge utile et en indiquant si la couche PQC est présente.
- **Les requêtes classiques sont toujours étiquetées** — si une requête ne comporte aucune couche PQC, ou vise une chaîne externe (ETH/BNB/etc., qui ne peut pas porter de PQC), QoreX affiche un avertissement explicite plutôt que de rétrograder silencieusement.

**Ce que cela signifie pour la taille des transactions.** ML-DSA-87 est une grande signature : la signature fait **4,627 bytes** et la clé publique **2,592 bytes** (fixé par FIPS-204). Une transaction QoreChain hybride est donc plusieurs kilo-octets plus grande qu'une transaction purement classique. Si vous construisez et diffusez vous-même des transactions, dimensionnez vos tampons et vos estimations de frais pour les octets supplémentaires ; la comptabilité de gas de QoreChain les anticipe déjà. Voir [Signature post-quantique](/developer-guide/post-quantum-signing) pour les primitives et l'exigence de signature déterministe.
