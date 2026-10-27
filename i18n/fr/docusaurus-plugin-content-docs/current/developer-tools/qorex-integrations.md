---
slug: /developer-tools/qorex-integrations
title: Intégrations QoreX
sidebar_label: Intégrations QoreX
sidebar_position: 22
---

# Intégrations QoreX (`@qorechain/qorex-*`)

Les intégrations QoreX sont six petits paquets npm destinés aux développeurs de dApps qui veulent que le [wallet QoreX](/qorex/overview) fonctionne dans un front-end EVM, Cosmos ou Solana, et aux équipes qui testent ces front-ends. Trois sont des connecteurs de wallet pour des bibliothèques courantes (RainbowKit, Interchain Kit, cosmos-kit), un contient les types partagés et les assistants de détection, et deux sont des outils de test (un wallet factice et des fixtures Playwright). Les six sont en version **0.1.0**, publiés le 27 octobre 2026, sous licence Apache-2.0.

Ce qu'ils ne font pas : ils ne détiennent pas de clés, et ils ne font pas de QoreX davantage que ce qu'il est aujourd'hui. Lisez [Limites et problèmes connus](#limits) avant de construire dessus : les versions publiées de QoreX dans les stores prennent en charge une partie seulement de ce à quoi ces paquets peuvent être reliés, et les limites y sont énoncées.

## Innovations {#innovations}

* **Une découverte qui ne peut pas choisir le mauvais wallet.** QoreX s'annonce via EIP-6963 avec le nom en DNS inversé `network.qore.qorex` et n'écrit jamais `window.ethereum`. `@qorechain/qorex-types` sélectionne le fournisseur uniquement par ce nom, et le wallet RainbowKit épingle le connecteur sur le fournisseur annoncé et ne se rabat jamais sur `window.ethereum`.
* **Le wallet construit la signature hybride, la page ne détient jamais la clé post-quantique.** La voie native de QoreChain exige une signature secp256k1 plus une signature ML-DSA-87 (FIPS 204). Sur le fournisseur natif (`window.qorex.native`), l'appel `signAndBroadcast` confie les messages à QoreX, qui construit la transaction, la signe avec les deux clés et la diffuse. Le résultat est `txHash`, `code`, `height` et `shield`, où `shield` vaut `shielded` dès que la transaction validée porte la couche hybride.
* **Des contrôles de capacités plutôt que des contrôles de version.** Les paquets lisent la liste `capabilities` du wallet (`hasCapability`), de sorte qu'une fonctionnalité comme `signAndBroadcast` est détectée, et non devinée à partir d'un numéro de version.
* **Les refus sont explicites, avec des codes stables.** La signature Amino est refusée par conception, car l'Amino JSON ne peut pas porter la signature hybride ; les connecteurs lèvent `QorexIntegrationError` avec des codes tels que `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` et `QOREX_NOT_SUPPORTED_YET`, et `isQorexIntegrationError(err, code)` permet de les tester.
* **Un double de test qui signe pour de vrai.** `@qorechain/qorex-wallet-mock` injecte les mêmes objets que QoreX (`window.qorex = { evm, native, svm }`), enregistre un wallet Solana et signe avec les vrais algorithmes (ML-DSA-87 hybride via QoreSign sur la voie native, secp256k1 sur EVM, ed25519 sur Solana) à partir de la phrase mnémonique de test publique, par défaut sur le testnet. Il s'annonce sous le nom `network.qore.qorex.mock`, de sorte que le code qui sélectionne QoreX strictement ne peut pas le confondre avec le wallet.
* **Deux profils de comportement.** Le profil `current` du mock se comporte comme le QoreX en service aujourd'hui ; `planned` ajoute ce que l'équipe QoreX a annoncé, afin que vous puissiez construire en avance sans que le mock prétende quelque chose que le wallet ne fait pas encore.
* **Des fixtures Playwright dans le style de Synpress v4** (`qorexMockFixtures`) injectent le mock avant la navigation, de sorte qu'un test de bout en bout n'a besoin d'aucune extension de navigateur.
* **Des comptes pilotés par le wallet, sans événements.** Comme QoreX n'émet pas encore `accountsChanged` ni `chainChanged`, le wallet RainbowKit dispose d'une option `pollAccountsOnFocus` qui relit `eth_accounts` et `eth_chainId` lorsque la page reprend le focus.

## Comment l'utiliser {#how-to-use}

Les blocs de code ci-dessous sont les démarrages rapides du hub développeur. Chacun a été vérifié par typage avec `tsc` et exécuté le 27 octobre 2026 après installation depuis le registre npm public (Node 26 ; jsdom 30 et `react-dom/client` pour le code navigateur ; Playwright 1.64 avec Chromium pour la fixture), et a réussi. Aucun n'envoie de transaction ni n'a besoin d'une clé approvisionnée. Le résultat observé est indiqué avec chacun. Le comportement côté wallet (un vrai QoreX dans un vrai navigateur) n'a pas été testé pour cette page.

### `@qorechain/qorex-types` : détecter QoreX {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

Observé avec le mock : `QoreX EVM provider not announced`, puis `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. La première ligne est attendue avec le mock, voir [la réserve sur EIP-6963](#limits). Le paquet n'a aucune dépendance d'exécution et exporte aussi l'icône QoreX sous forme d'URI de données depuis `@qorechain/qorex-types/icon`. Autres exports : les types de fournisseur, `isQorexInstalled`, `qorexSignAndBroadcast`, et des assistants pour classer les refus EVM de QoreX.

### `@qorechain/qorex-rainbowkit` : QoreX dans RainbowKit et wagmi {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

Observé : `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS` contient les définitions de chaîne viem pour la voie EVM (RPC `https://evm.qore.host` et `https://evm-testnet.qore.host`, monnaie native QOR avec 18 décimales, explorateur `https://explore.qore.network`). Le `projectId` est un identifiant de projet WalletConnect que vous créez vous-même auprès de WalletConnect. Dépendances homologues : `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. Pour prendre en compte les changements de compte et de réseau faits dans le wallet, utilisez `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit` : dApps Cosmos (recommandé pour les nouveaux projets) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

Observé : le composant s'est monté dans jsdom avec l'entrée chain-registry du testnet QoreChain (`@interchain-kit/react` 0.11.1). Dépendance homologue : `@interchain-kit/core` ^0.11. Envoyez une transaction QoreChain avec `qorexSignAndBroadcast` :

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

L'appel accepte de 1 à 32 messages et un mémo d'au plus 256 octets, et QoreX demande à l'utilisateur de l'approuver. L'extrait provient du README du paquet et n'a pas été exécuté pour cette page.

### `@qorechain/qorex-cosmos-kit` : dApps Cosmos sur cosmos-kit {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

Observé : monté dans jsdom avec l'entrée du testnet QoreChain (`@cosmos-kit/react` 2.24.1). **`throwErrors={false}` est requis pour que le code passe la vérification de types :** `@cosmos-kit/react` 2.24 type `throwErrors` comme propriété obligatoire, et l'exemple du README du paquet l'omet. Dépendance homologue : `@cosmos-kit/core` ^2.18.1. Le README du paquet recommande Interchain Kit pour les nouvelles dApps. Il exporte aussi `qorexSignAndBroadcast`.

### `@qorechain/qorex-wallet-mock` : double de test pour QoreX {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

Observé : `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Les comptes sont dérivés comme QoreX les dérive (`m/44'/118'/0'/0/i` avec la clé ML-DSA-87 canonique de cette adresse `qor1`, `m/44'/60'/0'/0/i` pour EVM, `m/44'/501'/i'/0'` pour Solana). Les options comprennent `profile`, `mnemonic`, `accountIndex`, `chainId` (par défaut `qorechain-diana`), `autoApprove` et `allowMainnet` ; la page reçoit aussi `window.__qorexMock` avec `approveNext()`, `rejectNext()`, `requests` et `switchAccount(i)`. Dans Playwright, injectez `mock.initScript()` avec `page.addInitScript` (Node 20.16 ou ultérieur).

### `@qorechain/qorex-synpress` : fixtures Playwright {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

Observé : `1 passed`, face à une page locale dont le bouton Connect appelle `eth_requestAccounts` (Playwright 1.64, Chromium). Pour combiner les fixtures avec Synpress, installez `@synthetixio/synpress@4.1.2` et enveloppez-les dans `testWithSynpress`. La fixture `qorex` expose `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` et `disconnect()`. Dépendance homologue : `@playwright/test` 1.48 ou ultérieur. L'état vit dans la page, de sorte que chaque navigation démarre un mock neuf.

## Comment y accéder {#how-to-access}

* **Un wallet QoreX pour un usage réel.** Les connecteurs dialoguent avec l'extension de navigateur ou l'application QoreX qu'un utilisateur a installée ; voir la page [Extension de navigateur QoreX](/qorex/browser-extension) pour les installations et les versions des stores. Les paquets de test n'ont besoin d'aucun wallet.
* **Réseaux.** Mainnet `qorechain-vladi` (EVM chain id 9801) et testnet `qorechain-diana` (EVM chain id 9800). QoreX ne sert que ces deux identifiants de chaîne QoreChain et rejette les autres avec « QoreX: unsupported chain ». Le mock utilise le testnet par défaut et refuse de signer pour le mainnet sauf si vous passez `allowMainnet: true`.
* **Clés et fonds.** Les paquets ne détiennent aucune clé. Le mock utilise la phrase de test BIP-39 publique (`abandon` répété 11 fois, puis `about`) qui dérive `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h` ; ne l'approvisionnez jamais. Pour un test qui diffuse, donnez au mock votre propre phrase mnémonique de testnet.
* **Autres comptes.** RainbowKit avec WalletConnect nécessite un identifiant de projet WalletConnect obtenu auprès de WalletConnect.
* **Prérequis.** Node.js (le script d'un seul fichier du mock nécessite la 20.16 ou ultérieure), une application React pour les trois connecteurs, et les paquets homologues listés sous chaque démarrage rapide. Les utilisateurs de TypeScript obtiennent les types depuis `@qorechain/qorex-types`.
* **Coûts.** Les paquets sont gratuits. Une transaction envoyée via QoreX paie les frais habituels (plancher de 0,1 uqor par gas).

## Où ils sont publiés {#where-published}

| Registre | Paquet | Version | Lien |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Code source : https://github.com/qorechain/qorex-integrations (tag `v0.1.0`, dossiers sous `packages/` ; il contient aussi une dApp de démonstration, des exemples et des fichiers d'entrées chain-registry). Versions lues sur le registre npm le 27 octobre 2026. Ils remplacent `@qorechain/connect`, qui est déprécié sur npm : utilisez `qorex-types` pour détecter QoreX, `qorex-rainbowkit` pour les dApps EVM, `qorex-interchain-kit` (ou `qorex-cosmos-kit`) pour les dApps Cosmos, et [QoreSign](/qoresign/overview) pour la signature hybride dans votre propre wallet ou backend.

## Limites et problèmes connus {#limits}

**Ce que prennent en charge les versions actuelles de QoreX.** Les versions disponibles dans les stores (l'application mobile QoreX 1.1.8 ; l'extension de navigateur 0.3.8, et 0.3.9 sur Firefox) ne prennent pas encore en charge `getOfflineSigner` avec une couche ML-DSA ajoutée par le wallet, et ne prennent pas en charge `signArbitrary`. Avec cosmos-kit et Interchain Kit, la signature avec `getOfflineSigner` ne fonctionne que si la page elle-même attache la couche post-quantique, ce qu'une page ne peut normalement pas faire car elle ne détient pas la clé. La méthode prise en charge pour envoyer aujourd'hui une transaction de la voie native est `window.qorex.native.signAndBroadcast`, que `qorexSignAndBroadcast` enveloppe. Ne considérez pas les connecteurs comme un wallet cosmos-kit ou Interchain Kit complet avec les versions actuelles des stores, au-delà de ce que précise le README de chaque paquet. Les connecteurs sont écrits de manière à ce qu'une version ultérieure de QoreX puisse ajouter la couche dans `signDirect` (déclarée via une capacité `signDirectAddsPqcLayer`) sans changement dans votre code.

**Ce que QoreX répond aujourd'hui** (d'après les README des paquets) :

* **EVM :** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` et `wallet_switchEthereumChain` pour le réseau sélectionné dans QoreX (une chaîne inconnue est rejetée avec le code 4902). Les méthodes de signature (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) et `wallet_addEthereumChain` ne sont pas encore prises en charge et sont rejetées avec « QoreX: EVM method ... not yet supported ». Pas encore d'événements `accountsChanged` ni `chainChanged`. Indiqués par l'équipe QoreX comme prévus, pas en service : les événements, des codes d'erreur sur chaque refus, puis les méthodes de signature et de transaction.
* **Transactions EVM en général.** Sur QoreChain, une transaction EVM n'est acceptée que d'un compte disposant d'une clé ML-DSA-87 enregistrée et d'une fenêtre d'autorisation EVM ouverte, toutes deux configurées depuis la voie native (voir [Développement EVM](/developer-guide/evm-development#evm-window)). L'`eth_sendTransaction` prévu du mock n'ouvre pas cette fenêtre.
* **Natif :** `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` et `experimentalSuggestChain`, pour `qorechain-vladi` et `qorechain-diana` uniquement. Sur QoreChain, `signDirect` exige que la couche hybride soit déjà présente, ce qu'une page ne peut pas construire ; utilisez donc `signAndBroadcast`. `signArbitrary`, la signature Amino et `sendTx` ne sont pas disponibles ; dans les connecteurs, `signArbitrary` lève `QOREX_NOT_SUPPORTED_YET` et Amino lève `QOREX_AMINO_REFUSED`.
* **Solana :** Wallet Standard sur `solana:mainnet` avec connexion, déconnexion, événements, `signAndSendTransaction`, `signTransaction` et `signMessage` ; pas de `solana:signIn`. La voie SVM de la chaîne n'accepte pas encore de transactions, de sorte que la prise en charge de Solana ici ne concerne que le côté wallet.

**Réserves relevées en testant les démarrages rapides :**

* **cosmos-kit a besoin de `throwErrors`.** L'exemple du README omet `throwErrors`, que `@cosmos-kit/react` 2.24 exige dans ses types, de sorte qu'il ne passe pas la vérification de types tel qu'écrit. Passez `throwErrors={false}` (ou votre propre valeur).
* **TypeScript strict et le mock.** `window.qorex.evm.request(...)` renvoie `unknown`, de sorte que la ligne du README qui déstructure son résultat échoue sous TypeScript strict. Convertissez le résultat, par exemple `as string[]` pour `eth_requestAccounts`.
* **Le mock a son propre identifiant EIP-6963.** Il annonce `network.qore.qorex.mock`, et non `network.qore.qorex`. Le code de découverte qui sélectionne QoreX strictement par `network.qore.qorex` (y compris `discoverQorexEip1193` dans `qorex-types`) ne trouve donc aucun fournisseur EVM avec le mock, par conception, alors que `window.qorex.evm` et le fournisseur natif sont présents. Si votre code sélectionne le fournisseur par la découverte, faites-lui accepter le rdns du mock (exporté sous le nom `QOREX_MOCK_RDNS`) dans les tests.
* **RainbowKit maintient Node en vie.** Dans Node, la construction de la configuration RainbowKit démarre des minuteries WalletConnect, et le processus ne se termine pas de lui-même ensuite. C'est attendu dans une page. Dans un script ou un test, terminez explicitement (par exemple `process.exit(0)`) une fois que vous avez lu ce dont vous avez besoin.
* **Le mode extension de Synpress ne fonctionne pas encore.** `qorexExtensionFixtures` est la méthode prévue pour piloter la vraie extension et lève aujourd'hui `QorexExtensionModeUnavailableError`, car elle nécessite des sélecteurs de test stables dans les fenêtres d'approbation de QoreX, qui n'ont pas été livrés. Utilisez le mode mock.

**Différences entre le mock et le wallet :** pas d'écran de verrouillage ni de fenêtre d'approbation (les approbations passent par `approveNext`, `rejectNext` ou `autoApprove`) ; `signDirect` signale un type de clé secp256k1 simple ; `signAndSendTransaction` de Solana est refusé ; les messages qui commencent par « QoreX (mock): » sont ceux du mock lui-même. Les résultats de test obtenus avec le mock montrent comment votre page se comporte face à l'interface décrite, pas qu'une vraie version de QoreX se comporte de la même façon.

**Autre :** les six paquets sont une version initiale (0.1.0) ; attendez-vous donc à ce que leurs interfaces s'étoffent à mesure que QoreX évolue. Aucun démarrage rapide testé ne couvre `qorexSignAndBroadcast` face à un réseau en service ou à un vrai wallet.
