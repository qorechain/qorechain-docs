---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Le Q-Day Counter est le plus petit projet EVM QoreChain réellement utile : un contrat Solidity qui stocke un nombre, un projet Hardhat qui le déploie sur le testnet `qorechain-diana`, et un court script qui le lit et l'incrémente. C'est le modèle `hardhat` de `create-qorechain-dapp`, auquel on a ajouté un petit script `interact`.

## Ce que cela démontre {#shows}

- **La signature hybride fait partie du chemin de déploiement.** Avant toute transaction EVM, y compris un déploiement de contrat, le compte doit avoir une clé ML-DSA-87 enregistrée et une fenêtre d'autorisation EVM active. La fenêtre est ouverte par un message de la voie native signé avec secp256k1 et ML-DSA-87 (hybride), et la chaîne vérifie les deux signatures.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne.** L'étape `pnpm window open` envoie cette transaction. Vous pouvez la retrouver dans l'explorateur et voir le verdict de la chaîne elle-même.
- **Vos outils EVM habituels continuent de fonctionner.** Hardhat, Ignition et viem envoient des transactions Ethereum ordinaires. La protection post-quantique se trouve dans la fenêtre : une clé secp256k1 volée ne suffit donc pas, à elle seule, pour dépenser depuis le compte.

Un ordinateur quantique assez puissant pour casser secp256k1 permettrait à un attaquant de falsifier des signatures classiques. QoreChain exige une seconde signature, post-quantique (ML-DSA-87, FIPS 204), sur le compte. Le Counter montre toute la boucle du développeur avec cette règle activée : enregistrer la clé, ouvrir une fenêtre, déployer, appeler, lire.

## Avant de commencer {#prerequisites}

Il vous faut un terminal sous macOS, Linux, ou Windows avec WSL ou Git Bash, et ces outils :

| Outil | Version requise | Vérifier avec |
| --- | --- | --- |
| Git | toute version récente | `git --version` |
| Node.js | 20.12 ou plus récent (22 LTS recommandé) | `node --version` |
| pnpm | 9 ou plus récent | `pnpm --version` |

Installez Node.js depuis https://nodejs.org. Si `pnpm --version` échoue, installez pnpm avec `npm install -g pnpm` (ou `corepack enable`) et vérifiez de nouveau.

Il vous faut aussi un compte gratuit sur le [tableau de bord QoreChain](https://dashboard.qorechain.io) pour utiliser le faucet. Vous n'utilisez jamais de vrai portefeuille dans ce guide : tout ce qui suit emploie un compte de testnet jetable, et les QOR de testnet n'ont aucune valeur.

## Pas à pas {#steps}

### 1. Récupérer le code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Installer les dépendances {#step-install}

```sh
pnpm install
```

### 3. Lancer les tests et la compilation {#step-test}

Les tests s'exécutent sur une chaîne locale simulée. Ils n'ont besoin d'aucune clé ni d'aucun compte réseau.

```sh
pnpm test
pnpm build
```

Vous devriez voir `2 passing` pour les tests de `Counter`.

### 4. Créer le fichier de clés du testnet {#step-account}

Créez le fichier de configuration à partir du modèle :

```sh
cp .env.example .env
```

Le fichier `.env` contient une clé jetable : ne le commitez jamais et ne réutilisez jamais cette clé pour quoi que ce soit de réel. Ouvrez `.env` dans n'importe quel éditeur. Vous allez renseigner deux valeurs.

**a. Une clé privée jetable.** Générez une clé aléatoire de 32 octets :

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copiez la valeur `0x...` affichée dans `.env` sous la forme `PRIVATE_KEY=0x...`, en remplaçant la valeur provisoire composée de zéros.

**b. Un code de récupération post-quantique.** La clé ML-DSA-87 du compte est dérivée d'un code de récupération distinct. Créez-en un :

```sh
pnpm window recovery-code
```

Copiez la ligne `QRC1-...` affichée dans `.env` sous la forme `QORE_PQC_RECOVERY_CODE=QRC1-...`. Conservez ce code avec la clé privée et réutilisez toujours le même : un nouveau code donne au compte une autre clé ML-DSA-87.

Laissez `QORE_MNEMONIC` vide et gardez `QORE_NETWORK=testnet`. Votre `.env` ressemble maintenant à ceci (valeurs provisoires affichées) :

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Afficher l'adresse de votre compte {#step-address}

```sh
pnpm window status
```

La première ligne affiche votre compte sous la forme `0x...` et sa forme `qor1...`. À ce stade, elle indique aussi que la clé n'est pas enregistrée et qu'aucune fenêtre n'existe. Copiez l'adresse `qor1...`.

### 6. Obtenir des QOR de testnet depuis le faucet {#step-faucet}

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et demandez les QOR (100 QOR une fois toutes les 24 heures).
3. Attendez quelques secondes, puis relancez `pnpm window status`. Le compte existe maintenant sur la chaîne.

### 7. Enregistrer la clé et ouvrir la fenêtre {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

L'enregistrement est le seul message que la chaîne accepte signé de façon classique, car il n'y a pas encore de clé sur la chaîne à laquelle comparer. L'ouverture de la fenêtre est signée de façon hybride. Gardez le hash de transaction affiché par `window open` : vous le chercherez dans la dernière étape.

### 8. Déployer le contrat {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

La commande affiche l'adresse du `Counter` déployé (`0x...`).

### 9. Lire et incrémenter {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. Le retrouver dans l'explorateur {#step-explorer}

1. Ouvrez https://explore.qore.network et passez le sélecteur de réseau sur **Testnet**.
2. Recherchez le hash affiché par `pnpm window open`. La transaction montre une signature post-quantique que la chaîne a vérifiée.
3. Recherchez le hash de la transaction `increment` affiché par `pnpm interact`, ou l'adresse du `Counter` de l'étape 8, pour voir l'appel au contrat.

Le [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) montre le même type de preuve octet par octet.

## Ce que vous devriez voir {#result}

- `pnpm test` affiche `2 passing`.
- `pnpm window status` affiche le compte (`0x...` avec sa forme `qor1...`), `PQC key: registered`, et `window: live` avec les blocs, les transactions et la valeur restants.
- `pnpm deploy:testnet` affiche l'adresse du `Counter` déployé (`0x...`).
- `pnpm interact` affiche l'adresse du Counter, `count`, le hash de la transaction `increment`, `status: success` avec le numéro de bloc, le nouveau `count`, et un lien vers la transaction dans l'explorateur.
- Dans l'explorateur (Testnet), la transaction `window open` est marquée comme vérifiée avec les deux signatures.

Si une étape échoue, lancez d'abord `pnpm window status` : il indique si c'est la clé ou la fenêtre qui manque. Une transaction refusée après épuisement de la fenêtre signifie qu'il faut en ouvrir une nouvelle avec `pnpm window open`.

## Le code {#code}

Le contrat (`contracts/Counter.sol`) :

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

La partie signée de façon hybride de `scripts/window.ts` (le message de fenêtre et le signataire) :

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` est le compte unifié dérivé de votre matériel de clés, et `net` est l'enregistrement du réseau pour `QORE_NETWORK` (par défaut `testnet`, ID de chaîne `qorechain-diana`). Les frais utilisés par le script sont de 100000 `uqor` avec une limite de gas de 800000, car les transactions hybrides sont volumineuses. La taille de la fenêtre peut être modifiée dans `.env` avec `QORE_WINDOW_BLOCKS` (600 par défaut), `QORE_WINDOW_TXS` (5 par défaut) et `QORE_WINDOW_MAX_UQOR`.

## Paquets utilisés {#packages}

| Paquet | Version | Rôle |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Signature hybride, enregistrement de clé PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Assistants de fenêtre EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Diffusion de la transaction de la voie native |
| `hardhat` | ^3.21.1 | Compilation, tests, déploiement Ignition |
| `viem` | ^2.47.6 | Lecture et écriture du contrat |
| `tsx` | ^4.19.0 | Exécution des scripts TypeScript |
| `typescript` | ^5.6.3 | Vérification des types |

Vous pouvez générer vous-même le même projet avec `npx create-qorechain-dapp my-app -t hardhat --network testnet`. Voir [Générateurs et CLI](/developer-tools/scaffolders-and-cli) et [Installer le SDK](/sdk/install).

## Détails du réseau {#networks}

| Élément | Valeur |
| --- | --- |
| Réseau | testnet `qorechain-diana` |
| ID de chaîne EVM | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| RPC EVM | `https://evm-testnet.qore.host` |

Source : https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
