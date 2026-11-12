---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Le Q-Day Guestbook est un livre d'or on-chain sur le testnet EVM de QoreChain. N'importe qui peut le signer une fois par adresse, avec un message de 140 caractères au maximum. Il comprend deux parties : un contrat Solidity avec un projet Hardhat (`contracts-app/`), et une page web React (`web/`) qui connecte le portefeuille QoreX, affiche la fenêtre EVM du compte et liste en direct les dernières signatures.

## Ce que cela démontre {#shows}

- **Une dApp de navigateur qui signe de façon hybride sans le savoir.** La page est une application wagmi et RainbowKit ordinaire. QoreX ajoute la moitié ML-DSA-87 de la signature : la même transaction est donc protégée par secp256k1 et par une clé post-quantique.
- **La fenêtre EVM est visible dans l'interface.** La page lit la fenêtre du compte sur la chaîne et indique si elle est active, ainsi que le nombre de blocs et de transactions restants.
- **Des refus lisibles.** Quand la chaîne refuse une écriture, `classifyEvmWindowRejection` associe l'erreur à l'une de quatre causes (aucune clé enregistrée, aucune fenêtre, fenêtre épuisée, paramètres invalides) et la page affiche le remède.
- **Des signatures hybrides vérifiées sur la chaîne.** Chaque signature que vous écrivez est une transaction que la chaîne n'a acceptée qu'après avoir contrôlé les deux signatures (ML-DSA-87 et secp256k1).

## Avant de commencer {#prerequisites}

Il vous faut un terminal sous macOS, Linux, ou Windows avec WSL ou Git Bash, et ces outils :

| Outil | Version requise | Vérifier avec |
| --- | --- | --- |
| Git | toute version récente | `git --version` |
| Node.js | 20.12 ou plus récent (22 LTS recommandé) | `node --version` |
| pnpm | 9 ou plus récent | `pnpm --version` |

Installez Node.js depuis https://nodejs.org. Si `pnpm --version` échoue, installez pnpm avec `npm install -g pnpm` (ou `corepack enable`) et vérifiez de nouveau.

Il vous faut aussi un compte gratuit sur le [tableau de bord QoreChain](https://dashboard.qorechain.io) pour le faucet et, pour la partie navigateur, le portefeuille QoreX (l'extension pour un navigateur de bureau, ou l'application). Voir [Intégrations QoreX](/developer-tools/qorex-integrations) et la [présentation de QoreX](/qorex/overview). Dans les étapes sur les contrats, vous n'utilisez jamais de vrai portefeuille : vous utilisez un compte de testnet jetable. Les QOR de testnet n'ont aucune valeur.

## Pas à pas {#steps}

### 1. Récupérer le code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

Le projet contient deux dossiers que vous installez séparément.

### 2. Contrats : installer et tester {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

Vous devriez voir `3 passing` pour les tests de `QDayGuestbook`. Ils s'exécutent sur une chaîne locale simulée et n'ont besoin d'aucune clé.

### 3. Contrats : créer le fichier de clés du testnet {#step-account}

```sh
cp .env.example .env
```

Le fichier `.env` contient une clé jetable : ne le commitez jamais et ne réutilisez jamais cette clé pour quoi que ce soit de réel. Ouvrez `.env` dans n'importe quel éditeur et renseignez deux valeurs.

**a. Une clé privée jetable.** Générez une clé aléatoire de 32 octets :

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copiez la valeur `0x...` affichée dans `.env` sous la forme `PRIVATE_KEY=0x...`, en remplaçant la valeur provisoire composée de zéros.

**b. Un code de récupération post-quantique.** La clé ML-DSA-87 du compte est dérivée d'un code de récupération distinct. Créez-en un :

```sh
pnpm window recovery-code
```

Copiez la ligne `QRC1-...` affichée dans `.env` sous la forme `QORE_PQC_RECOVERY_CODE=QRC1-...`. Réutilisez toujours le même code : un nouveau code donne au compte une autre clé ML-DSA-87.

Laissez `QORE_MNEMONIC` vide et gardez `QORE_NETWORK=testnet`. Votre `.env` ressemble maintenant à ceci (valeurs provisoires affichées) :

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Contrats : alimenter le compte {#step-faucet}

```sh
pnpm window status
```

La première ligne affiche votre compte sous la forme `0x...` et sa forme `qor1...`. Copiez l'adresse `qor1...`, puis :

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez l'adresse `qor1...` et demandez les QOR (100 QOR une fois toutes les 24 heures).
3. Attendez quelques secondes et relancez `pnpm window status`.

### 5. Contrats : enregistrer la clé, ouvrir la fenêtre, déployer {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet` affiche l'adresse du `QDayGuestbook` déployé (`0x...`). Copiez-la. L'enregistrement est le seul message que la chaîne accepte signé de façon classique, car il n'y a pas encore de clé sur la chaîne à laquelle comparer. L'ouverture de la fenêtre est signée de façon hybride ; gardez le hash de transaction qu'elle affiche.

### 6. Contrats : signer depuis la ligne de commande {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

Chaque adresse ne peut signer qu'une fois : un second `pnpm sign` depuis le même compte est donc refusé par le contrat.

### 7. Page web : installer et configurer {#step-web}

Ouvrez un second terminal dans le même dossier de projet (ou revenez-y avec `cd ..`), puis :

```sh
cd web
pnpm install
cp .env.example .env
```

Ouvrez `web/.env` et renseignez l'adresse que vous avez copiée à l'étape 5 :

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Laissez `VITE_WALLETCONNECT_PROJECT_ID` vide : il n'est nécessaire que si vous ajoutez un portefeuille basé sur WalletConnect à `src/wagmi.ts`.

### 8. Page web : l'exécuter {#step-run}

```sh
pnpm dev
```

Ouvrez http://localhost:5174 dans le navigateur où QoreX est installé. La page lit la chaîne via le RPC EVM. Elle lit la fenêtre EVM via REST à travers le proxy Vite `/lcd`, car le point de terminaison REST public n'envoie pas d'en-têtes CORS. La liste des signatures en bas affiche déjà l'entrée que vous avez écrite à l'étape 6.

### 9. Signer depuis QoreX {#step-sign}

1. Installez QoreX et passez-le sur le testnet. Voir [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes#step-testnet) pour le changement de réseau.
2. Dans QoreX, utilisez un compte coin-60 (Ethereum) avec une clé ML-DSA-87 enregistrée, et alimentez-le depuis le [faucet](/dashboard/faucet) (collez son adresse après vous être connecté).
3. Sur la page, choisissez **Connect QoreX**, saisissez un message et choisissez **Sign**. QoreX propose d'ouvrir la fenêtre EVM dans son approbation si aucune n'est ouverte.
4. Approuvez dans QoreX.

### 10. Le retrouver dans l'explorateur {#step-explorer}

Ouvrez https://explore.qore.network et passez le sélecteur de réseau sur **Testnet**. Recherchez le hash de transaction de l'étape 6 ou 9, le hash de `pnpm window open`, ou l'adresse du `QDayGuestbook`. La transaction de fenêtre montre une signature post-quantique que la chaîne a vérifiée.

## Ce que vous devriez voir {#result}

- `pnpm test` dans `contracts-app` affiche `3 passing`.
- `pnpm window status` affiche `PQC key: registered` et `window: live` avec les blocs et les transactions restants.
- `pnpm deploy:testnet` affiche l'adresse du `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` affiche le hash de la transaction et `status: success in block ...`.
- Sur la page, l'étape 1 affiche votre compte `0x...`, la chaîne `qorechain-diana EVM (9800)`, votre solde et la fenêtre EVM à `live` avec les blocs et les transactions restants.
- Après avoir choisi **Sign** et approuvé dans QoreX, un lien de transaction vers l'explorateur apparaît, puis `success in block ...`.
- La liste du bas affiche le nombre de signatures sur la chaîne et les dernières entrées (20 au maximum), de la plus récente à la plus ancienne, actualisées toutes les quelques secondes.
- Une seconde tentative depuis la même adresse indique que cette adresse a déjà signé.

## Le code {#code}

Le contrat conserve les entrées dans un tableau et autorise une signature par adresse :

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

| Paquet | Version | Rôle |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Script d'assistance de fenêtre, signature hybride |
| `@qorechain/evm` | ^0.13.0 | Définitions de chaîne, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Diffusion du message de fenêtre |
| `hardhat` | ^3.21.1 | Compilation, tests, déploiement Ignition |
| `viem` | ^2.47.6 | Client Ethereum |
| `tsx` | ^4.19.0 | Exécution des scripts TypeScript |
| `typescript` | ^5.6.3 | Vérification des types |

Page web (`web/`) :

| Paquet | Version | Rôle |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Définitions de chaîne, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX comme portefeuille RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Bouton de connexion |
| `wagmi` | ^2.19.5 | Hooks React pour les lectures et les écritures |
| `viem` | ^2.53.1 | Client Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Récupération des données pour la fenêtre et les lectures de chaîne |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `vite` | ^5.4.0 | Serveur de développement |
| `@vitejs/plugin-react` | ^4.3.0 | Prise en charge de React pour Vite |
| `typescript` | ^5.6.3 | Vérification des types |

Source : https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
