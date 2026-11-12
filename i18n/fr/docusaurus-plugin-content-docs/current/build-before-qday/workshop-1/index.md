---
slug: /build-before-qday/workshop-1
title: "Atelier 1 : votre première transaction signée de façon hybride"
sidebar_label: "Atelier 1"
sidebar_position: 2
date: 2026-11-12
---

# Atelier 1 : votre première transaction signée de façon hybride

Ce guide vous mène d'un ordinateur sans rien d'installé à une transaction signée avec deux clés à la fois et vérifiée par le testnet QoreChain. Tout s'exécute dans votre propre environnement, avec un compte de testnet jetable.

## Ce que nous construisons {#what-we-built}

Un projet Solidity complet généré avec une seule commande, testé, déployé sur le testnet QoreChain, puis une transaction signée avec **deux clés à la fois** et contrôlée par la chaîne.

Ce que cela démontre :

- **La signature hybride.** La transaction porte une signature classique secp256k1 et une signature post-quantique ML-DSA-87 (NIST FIPS 204).
- **Une transaction signée de façon hybride, vérifiée sur la chaîne.** Les validateurs vérifient les deux signatures. Vous lisez la preuve depuis le point de terminaison REST public (l'extension `PQCHybridSignature` et l'événement `pqc_hybrid_verify`) et dans l'explorateur.
- **La fenêtre d'autorisation EVM.** Une transaction Ethereum ne peut pas porter de signature post-quantique : sur QoreChain, vous enregistrez donc votre clé ML-DSA-87 une fois, puis vous ouvrez une courte fenêtre, avec un message signé de façon hybride, pendant laquelle vos transactions EVM habituelles sont admises. Voir [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes) pour l'idée en détail.

C'est exactement ce que demande le niveau Quantum Pass.

## Prérequis {#prerequisites}

Il vous faut un ordinateur sous macOS, Linux ou Windows (avec WSL), un terminal et un navigateur web. Installez d'abord les outils suivants et vérifiez chaque version :

| Outil | Version | Vérification | Installation |
| --- | --- | --- | --- |
| Node.js | 22 ou plus récent (Hardhat 3 l'exige) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 ou plus récent | `pnpm -v` | `npm install -g pnpm` (ou `corepack enable`) |
| curl | n'importe laquelle | `curl --version` | inclus sur macOS et Linux |
| jq (facultatif) | n'importe laquelle | `jq --version` | [jqlang.org](https://jqlang.org), utilisé uniquement pour filtrer la sortie à l'étape 6 |

Il vous faut aussi un compte sur le tableau de bord QoreChain pour utiliser le faucet (étape 4).

Le réseau et les points de terminaison publics utilisés dans ce guide :

| Service | URL |
| --- | --- |
| Testnet | `qorechain-diana`, ID de chaîne EVM 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passez sur Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (connexion requise) |

:::caution Uniquement des clés de testnet jetables
Utilisez des clés créées pour cet exercice, qui ne contiennent que des QOR de test. Ne mettez jamais dans `.env` une clé ou un code de récupération d'un compte qui détient de vrais fonds, et ne commitez jamais `.env` dans git.
:::

## Étapes {#steps}

### Étape 1 : vérifier vos outils {#step-1}

1. Ouvrez un terminal.
2. Lancez les vérifications du tableau ci-dessus :

```bash
node -v
pnpm -v
```

`node -v` doit afficher `v22` ou plus. Sinon, installez une version plus récente de Node.js avant de continuer.

### Étape 2 : générer le projet et lancer les tests {#step-2}

1. Créez le projet dans un nouveau dossier. La commande `npx` télécharge le générateur, elle a donc besoin d'un accès à internet :

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Entrez dans le dossier et lancez les tests. Ils s'exécutent sur une chaîne locale simulée et n'envoient rien :

```bash
cd qday-demo
pnpm test
```

Vous devriez voir `Done! Created qday-demo`, puis `2 passing` pour les tests.

3. Regardez ce que vous avez obtenu : `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (l'assistant pour la fenêtre d'autorisation) et `hardhat.config.ts` avec le réseau `qorechainTestnet` (ID de chaîne 9800). Plus de détails sur les modèles : [Générateurs et CLI](/developer-tools/scaffolders-and-cli) et [Kit de développement de chaîne](/developer-tools/chain-dev-sdk).

### Étape 3 : créer un compte de testnet jetable {#step-3}

Le compte a besoin de deux secrets : une clé privée de style Ethereum et un **code de récupération** (qui commence par `QRC1`) dont est dérivée la clé post-quantique ML-DSA-87. La commande ci-dessous génère les deux avec des bibliothèques que le projet a déjà installées et les écrit directement dans un nouveau fichier `.env`, de sorte que rien ne s'affiche à l'écran et que rien n'est à coller ailleurs. Lancez-la depuis le dossier `qday-demo` :

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

Elle affiche `.env written`. Remarques :

- La commande remplace le fichier `.env` provisoire créé par le générateur. Lancez-la une seule fois. Une nouvelle exécution crée un autre compte et une autre clé post-quantique.
- Gardez `.env` tel quel : la même clé privée et le même code de récupération redonnent le même compte à chaque fois. Si vous perdez le fichier, repartez avec un nouveau compte.
- Vous préférez une phrase mnémonique ? Mettez `QORE_MNEMONIC="your twelve words"` dans `.env` à la place des deux lignes ci-dessus. Avec une mnémonique, les deux clés proviennent de la même phrase et aucun code de récupération n'est nécessaire. Utilisez une phrase créée uniquement pour cet exercice.

Demandez maintenant au projet l'adresse de votre nouveau compte :

```bash
pnpm window status
```

Vous devriez voir trois lignes :

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copiez l'adresse `qor1...`. C'est celle que vous donnez au faucet.

### Étape 4 : obtenir des QOR de testnet depuis le faucet {#step-4}

1. Ouvrez le [faucet](https://dashboard.qorechain.io/faucet) dans votre navigateur et connectez-vous.
2. Collez votre adresse `qor1...` (ou choisissez **Use my address** si le tableau de bord la connaît).
3. Sélectionnez **Request Tokens**. La carte affiche **Tokens Sent!** avec 100 QOR, plus les jetons de test du festival, et un lien **View on Explorer**.

Le faucet paie une fois toutes les 24 heures par compte et par adresse. Les montants exacts figurent sur [Faucet](/dashboard/faucet). De retour dans le terminal, vérifiez que le compte existe désormais sur la chaîne :

```bash
pnpm window status
```

La sortie répond maintenant au lieu d'échouer avec « does not exist on chain yet ».

### Étape 5 : enregistrer votre clé, ouvrir la fenêtre, déployer {#step-5}

1. Enregistrez votre clé ML-DSA-87. C'est une étape unique par compte, signée avec la clé classique, comme la chaîne l'exige pour l'enregistrement :

```bash
pnpm window register
```

Elle affiche `registered: <HASH>`.

2. Ouvrez la fenêtre d'autorisation. C'est elle-même une transaction **signée de façon hybride** :

```bash
pnpm window open
```

Elle affiche `opened: <HASH>`, puis une ligne du type `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Notez le hash `opened:` : vous le vérifierez à l'étape 6.

3. Attendez environ 10 secondes. L'ouverture de la fenêtre a fait avancer le nonce du compte et Hardhat attend des confirmations.
4. Compilez et déployez le contrat :

```bash
pnpm build
pnpm deploy:testnet
```

Répondez `y` à « Confirm deploy to network qorechainTestnet (9800)? ». Vous devriez voir `CounterModule#Counter - 0x...`.

### Étape 6 : vérifier la signature hybride sur la chaîne {#step-6}

La transaction `opened:` de l'étape 5 a été signée avec les deux clés. Remplacez `<HASH>` par ce hash et lisez-la depuis le point de terminaison REST public :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Cherchez :

1. `tx_response.code` égal à `0`.
2. Dans le corps de la transaction, l'extension `PQCHybridSignature` qui contient la signature ML-DSA-87 : **4 627 octets**, à côté de la signature secp256k1 de 64 octets.
3. Dans `tx_response.events`, l'événement `pqc_hybrid_verify` avec l'attribut `status` à `verified`. Pour n'afficher que cet événement (nécessite `jq`) :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Regardez-la ensuite dans l'explorateur :

1. Ouvrez [explore.qore.network](https://explore.qore.network).
2. Passez le sélecteur de réseau sur **Testnet**.
3. Recherchez le hash. La page de la transaction affiche la sécurité de la signature comme résistante au quantique, vérifiée sur la chaîne, avec l'algorithme ML-DSA-87 (FIPS 204).

Voilà la preuve : les validateurs ont contrôlé les deux signatures.

## Ce que vous devriez voir {#what-you-should-see}

| Où | Quoi |
| --- | --- |
| Après l'étape 2 | `Done! Created qday-demo` et `2 passing` |
| Après l'étape 3 | `.env written`, puis une ligne `account:` avec vos adresses `0x...` et `qor1...` |
| Après l'étape 4 | **Tokens Sent!** sur le faucet et un compte existant dans `pnpm window status` |
| Après l'étape 5 | `registered: <HASH>`, `opened: <HASH>`, puis `CounterModule#Counter - 0x...` |
| Après l'étape 6 | `code` 0, une signature ML-DSA-87 de 4 627 octets et `pqc_hybrid_verify` avec `status` à `verified`, dans la sortie REST et dans l'explorateur sur Testnet |

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

Le générateur installe aussi la boîte à outils Hardhat, Ignition et les plugins de keystore listés dans le `package.json` généré.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `HHE10402` ou « wait for confirmations » juste après l'ouverture de la fenêtre | L'ouverture de la fenêtre a fait avancer le nonce du compte | Relancez `pnpm deploy:testnet` |
| « EVM authorisation window exhausted » ou « no window » | La fenêtre a épuisé ses transactions ou ses blocs, ou elle est limitée à un autre contrat (une fenêtre limitée à un autre contrat bloque un déploiement) | Lancez `pnpm window open` pour ouvrir une nouvelle fenêtre, attendez environ 10 secondes, puis redéployez |
| « account has no PQC key and classical fallback is disabled » | Le compte n'a pas enregistré de clé ML-DSA-87 | Lancez d'abord `pnpm window register`, puis ouvrez la fenêtre |
| « does not exist on chain yet » | Le compte n'a pas encore de QOR | Obtenez des QOR depuis le faucet (étape 4) |
| « Rate Limit Reached » sur le faucet, ou aucun jeton après 30 secondes | Une demande par 24 heures par compte et par adresse, et les demandes sont traitées une à une | Attendez quelques secondes et réessayez, ou attendez la fin du délai |
| `pnpm window` s'arrête avec un message sur un code de récupération manquant | `.env` contient `PRIVATE_KEY` sans `QORE_PQC_RECOVERY_CODE` | Refaites l'étape 3, ou utilisez `QORE_MNEMONIC` |
| Hardhat refuse de démarrer | Node.js est antérieur à la version 22 | Installez Node.js 22 ou plus récent et relancez `pnpm install` |

## Les applications d'exemple {#example-apps}

Le même parcours, depuis plusieurs langages et interfaces. Chacune signe de façon hybride. Toutes se trouvent dans le dépôt public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), dossier `workshop-1`. Récupérez-le avec :

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Chaque page d'application est un guide complet de bout en bout.

| Application | Langage | Page |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Les kits qui sous-tendent ces applications sont listés sur [Kits](/build-before-qday/workshop-1/kits). Pour utiliser le portefeuille QoreX avec une dApp de navigateur, voir [QoreX](/qorex/overview).
