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

## À quoi il sert {#use-cases}

1. **Une dApp wagmi et RainbowKit ajoute QoreX.** Ajoutez `qorexWallet` à la liste de wallets de RainbowKit et `QOREX_CHAINS` à la configuration wagmi. Les utilisateurs qui ont QoreX se connectent et la dApp lit leur adresse `0x` et l'identifiant de chaîne (9801 ou 9800). Les utilisateurs sans QoreX voient les liens vers les stores.
2. **Une dApp Cosmos sur Interchain Kit ou cosmos-kit ajoute QoreX.** Ajoutez le wallet QoreX à `ChainProvider` et envoyez les transactions QoreChain avec `qorexSignAndBroadcast` : QoreX construit la transaction, ajoute la signature hybride et la diffuse, car une page ne peut pas détenir la clé ML-DSA-87.
3. **Une dApp qui prend déjà en charge Keplr.** `window.qorex.native` suit le modèle de Keplr (`enable`, `getKey`, `signDirect`), de sorte que l'intégration tient en quelques lignes. Le guide du dépôt liste chaque différence.
4. **Des tests CI des parcours de wallet sans extension.** Une équipe QA lance Playwright avec `qorexMockFixtures({ profile: "current" })`, clique sur Connect et vérifie que la page affiche `qorex.addresses.evm`. `qorex.rejectNext()` teste le chemin de refus.
5. **Construire en avance sur les nouvelles fonctionnalités de QoreX.** Lancez la même suite avec `profile: "planned"` pour exercer les fonctionnalités annoncées (signature EVM, événements de changement de compte, `signDirect` ajoutant la couche hybride) avant que QoreX ne les livre.
6. **Tester de vraies diffusions sur le testnet.** Avec sa propre phrase mnémonique de testnet approvisionnée, une équipe laisse le mock faire `signAndBroadcast` d'une transaction signée en hybride vers `qorechain-diana` et vérifie le résultat dans la page.
7. **Détection de fonctionnalités plutôt que contrôles de version.** Une dApp affiche un bouton Send sur QoreChain lorsque `hasCapability(native, "signAndBroadcast")` est vrai, de sorte que les nouvelles versions de QoreX activent les fonctionnalités sans changement dans la dApp.

## Comment il fonctionne {#how-it-works}

* **Voie EVM.** QoreX n'écrit jamais `window.ethereum`. Il annonce un fournisseur EIP-1193 via EIP-6963 avec le nom en DNS inversé `network.qore.qorex` ; `qorexWallet()` et `discoverQorexEip1193()` sélectionnent exactement ce fournisseur. Le même objet se trouve aussi à `window.qorex.evm`.
* **Voie native.** `window.qorex.native` est un fournisseur au modèle de Keplr (il n'est pas un alias de `window.keplr`). QoreChain exige une signature hybride secp256k1 plus ML-DSA-87 sur les transactions de la voie native et seul le wallet détient la clé ML-DSA-87 ; la dApp envoie donc les messages à `signAndBroadcast`. QoreX les affiche, fixe les frais, signe avec les deux clés, diffuse et rapporte `shield`.
* **Solana.** QoreX enregistre un wallet Solana Wallet Standard sur `solana:mainnet` (Solana lui-même). La voie SVM propre à QoreChain n'est pas ouverte aux transactions et n'a pas d'identifiant de chaîne Wallet Standard.
* **Des capacités, pas des versions.** Les kits lisent `window.qorex.native.capabilities` via `hasCapability`. Une version de QoreX peut déclarer `listAccounts`, `connectProofPicksAccount`, `executeRequest` et `signAndBroadcast`.
* **Amino est refusé par conception**, car l'Amino JSON ne peut pas porter la signature hybride ML-DSA-87. Les kits servent chaque demande de signataire avec un signataire direct.
* **`signDirect` et la couche post-quantique, précisément.** Aujourd'hui, `signDirect` de QoreX signe le SignDoc tel quel avec la clé secp256k1. Sur QoreChain, le corps doit déjà contenir une couche hybride ML-DSA-87 valide pour la clé enregistrée du signataire, qu'une page ne peut pas produire. Ainsi, sur `qorechain-vladi` et `qorechain-diana`, le `signDirect` du signataire hors ligne des kits lève `QOREX_USE_SIGN_AND_BROADCAST` avant d'atteindre QoreX ; `getAccounts` fonctionne sur toutes les chaînes. Sur les autres identifiants de chaîne, les kits transmettent `signDirect` à QoreX, qui ne sert aujourd'hui que les deux identifiants de chaîne QoreChain. Une prochaine version de QoreX doit ajouter elle-même la couche dans `signDirect` et déclarer la capacité `signDirectAddsPqcLayer` ; aucune version actuelle ne la déclare. Les kits la vérifient déjà, et lorsqu'elle est déclarée, le signataire hors ligne transmet les SignDoc de QoreChain à QoreX. QoreX peut alors réestimer le gas et relever la limite de gas et les frais ; diffusez donc toujours le document `signed` renvoyé.
* **États de `shield`** renvoyés par `signAndBroadcast` : `shielded` (la transaction validée porte la couche hybride), `pending` (diffusion faite, vérification non terminée), `downgraded` (validée sans la couche ; traitez-le comme une alerte) et `classical` (une voie où la couche ne s'applique pas).
* **Le mock** construit ses comptes à partir d'une phrase mnémonique BIP-39 (par défaut : la phrase de test publique) comme le fait QoreX : `m/44'/118'/0'/0/i` avec la clé ML-DSA-87 canonique de cette adresse `qor1`, `m/44'/60'/0'/0/i` pour EVM et `m/44'/501'/i'/0'` pour Solana. Son `signAndBroadcast` lit la clé ML-DSA-87 du compte via REST, l'enregistre une fois avec `MsgRegisterPQCKeyV2` si elle manque, signe en hybride avec [QoreSign](/qoresign/overview), diffuse (en réessayant une fois avec l'autre version des octets de signature si le réseau le demande), attend l'inclusion et renvoie `{ txHash, code, height, shield }`.

### Ce que QoreX prend en charge aujourd'hui {#qorex-today}

| Surface | Aujourd'hui | Prévu par l'équipe QoreX |
|---|---|---|
| EVM (EIP-1193 via EIP-6963, `network.qore.qorex`) | connexion (`eth_requestAccounts`), `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain` vers le réseau déjà sélectionné dans QoreX | événements `accountsChanged` et `chainChanged`, codes d'erreur EIP-1193 4200 et 4902 sur chaque refus, `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`, `wallet_addEthereumChain` |
| Voie native de QoreChain (`window.qorex.native`) | `enable`, `getKey`, `signAndBroadcast`, `listAccounts`, `experimentalSuggestChain` (identifiants QoreChain), `signDirect` (le SignDoc doit déjà porter la couche hybride) | `signDirect` ajoutant lui-même la couche ML-DSA-87, signature de messages (ADR-36 plus ML-DSA-87) |
| Solana (Wallet Standard, `solana:mainnet`) | connexion, `signMessage`, `signTransaction` | `solana:signIn` |

Côté EVM, la signature et l'envoi échouent actuellement avec « QoreX: EVM method ... not yet supported ». Pour les transactions sur QoreChain, utilisez la voie native. Sur la voie EVM de QoreChain, une transaction est acceptée lorsque l'expéditeur a une clé ML-DSA-87 enregistrée et une fenêtre d'autorisation EVM ouverte depuis la voie native. L'utilisateur change de réseau dans QoreX ; la dApp ne peut pas le faire.

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

### Envoyer une transaction sur QoreChain {#send-transaction}

Le même appel existe dans `@qorechain/qorex-interchain-kit`, `@qorechain/qorex-cosmos-kit` et `@qorechain/qorex-types` :

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode(msg).finish() }],
  memo: "",
  gasLimit: 200000,
});
```

* `value` est le message encodé en protobuf : un `Uint8Array`, un `number[]` ou du base64.
* De 1 à 32 messages ; un mémo d'au plus 256 octets ; `gasLimit` est borné entre 100 000 et 5 000 000 (400 000 si omis). QoreX fixe les frais et les affiche avant la signature.
* `chainId` doit correspondre au réseau sélectionné dans QoreX.
* Les messages qui gèrent la clé ML-DSA-87 du compte sont du ressort du wallet et sont refusés, y compris à l'intérieur de `MsgExec`. Les types de messages que QoreX ne peut pas afficher sont refusés.
* Sans kit, appelez `window.qorex.native.signAndBroadcast(request)` après avoir vérifié `hasCapability(native, "signAndBroadcast")`. `getKey` renvoie `pubKey` et `address` sous forme de `number[]` ; convertissez avec `Uint8Array.from(key.pubKey)` (les kits le font pour vous).

### Le mock dans Playwright sans les fixtures {#mock-playwright}

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

const mock = createQorexMock({ profile: "current" });
await page.addInitScript({ content: mock.initScript() });
await page.goto("http://localhost:5173");
await page.evaluate(() => window.__qorexMock!.rejectNext());
```

## API principale {#main-api}

| Paquet | Nom | Ce qu'il fait |
|---|---|---|
| types | `discoverQorexEip1193({ timeoutMs })`, `findQorexEip1193()` | découverte EIP-6963 asynchrone du fournisseur EVM de QoreX, et sonde synchrone de celui-ci |
| types | `getQorexNative()`, `isQorexInstalled()`, `hasCapability(native, capability)` | lire `window.qorex.native`, vérifier que QoreX est présent, tester une capacité |
| types | `qorexSignAndBroadcast(request, { native? })` | confie des messages à QoreX ; lève `QOREX_NOT_INSTALLED` sans QoreX et `QOREX_NOT_SUPPORTED_YET` sur un QoreX antérieur à cette fonction |
| types | `QorexIntegrationError`, `isQorexIntegrationError(err, code)` | erreurs de ces paquets, avec des codes stables |
| types | `isQorexUnsupportedMethodError`, `isQorexUnrecognizedChainError`, `QOREX_EVM_ERROR_CODES` | classer les refus EVM de QoreX : vérifie `code` (4200, 4902), puis se rabat sur le texte du message actuel |
| types | `QorexEip1193Provider`, `QorexNativeProvider`, `QorexSolanaStandardWallet`, `QorexSvmProvider` ; `@qorechain/qorex-types/icon` | types de ce que QoreX injecte ; l'icône QoreX sous forme d'URI de données |
| rainbowkit | `qorexWallet(options?)`, `createQorexConnector`, `getQorexEip1193Provider` | le wallet RainbowKit (option `pollAccountsOnFocus`), le connecteur wagmi et le fournisseur qu'il utilise |
| rainbowkit | `qorechain`, `qorechainTestnet`, `QOREX_CHAINS` | chaînes viem 9801 et 9800 |
| interchain-kit | `qorexWallet`, `createQorexWallet()`, `QorexCosmosWallet` | wallet Interchain Kit |
| cosmos-kit | `wallets`, `qorexExtension`, `QorexExtensionWallet`, `QorexClient` | wallet cosmos-kit |
| les deux kits | `qorexSignAndBroadcast`, `QOREX_CAPABILITY_SIGN_DIRECT_ADDS_PQC_LAYER`, constantes d'identifiants de chaîne, assistants d'erreur | réexportés depuis `qorex-types` |
| wallet-mock | `createQorexMock(options)` | renvoie `{ install(window), initScript(), addresses(), ... }` |
| wallet-mock | `window.__qorexMock` | `approveNext()`, `rejectNext()`, `pendingApprovals`, `requests`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `addresses()` |
| wallet-mock | `PUBLIC_TEST_MNEMONIC` | la phrase de test BIP-39 publique (ne l'approvisionnez jamais) |
| synpress | `qorexMockFixtures(options)` | un `test` Playwright avec une fixture `qorex` automatique |
| synpress | `qorex.addresses`, `approveNext()`, `rejectNext()`, `waitForApproval()`, `pendingApprovals()`, `requests()`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `mock` | les commandes de la fixture |
| synpress | `qorexExtensionFixtures({ extensionPath })` | interface prévue pour la vraie extension ; lève `QorexExtensionModeUnavailableError` aujourd'hui |

Avec Synpress v4, fusionnez les fixtures avec `testWithSynpress(qorexMockFixtures({ profile: "planned" }))`. Avec `autoApprove: false`, appelez `await qorex.waitForApproval()` pour inspecter l'état en attente, puis `qorex.approveNext()`. Lancez la suite dans les deux profils pour couvrir le QoreX d'aujourd'hui et la prochaine version.

### Comportement du signataire des kits {#kit-signer}

| Appel | Interchain Kit | cosmos-kit |
|---|---|---|
| `connect` ou `enable`, `getAccount`, `getKey` | `enable` et `getKey` de QoreX, octets convertis en `Uint8Array` | identique |
| `getOfflineSigner(chainId)` | signataire direct pour toute préférence | signataire direct pour toute préférence, y compris la valeur par défaut `"amino"` de cosmos-kit |
| `signDirect` du signataire sur QoreChain | lève `QOREX_USE_SIGN_AND_BROADCAST` (jusqu'à ce que QoreX déclare `signDirectAddsPqcLayer`) | identique |
| `signDirect` du signataire sur un autre identifiant de chaîne | transmis à `signDirect` de QoreX | identique |
| `signAmino`, `getOfflineSignerAmino` | lève `QOREX_AMINO_REFUSED` | identique |
| `signArbitrary` (ADR-36) | lève `QOREX_NOT_SUPPORTED_YET` (`verifyArbitrary` aussi) | lève `QOREX_NOT_SUPPORTED_YET` |
| `sendTx` | lève `QOREX_NOT_SUPPORTED_YET` ; diffusez via votre point d'accès RPC | non fourni |

### Options du wallet mock {#mock-options}

| Option | Par défaut | Signification |
|---|---|---|
| `profile` | `"current"` | `"current"` est QoreX aujourd'hui ; `"planned"` ajoute les fonctionnalités annoncées |
| `mnemonic` | la phrase de test BIP-39 publique | utilisez la vôtre pour tout ce que vous approvisionnez |
| `accountIndex` | `0` | le même indice sur chaque voie |
| `chainId` | `"qorechain-diana"` | le réseau sélectionné dans le mock |
| `rest` | `https://api-testnet.qore.host` | point d'accès REST pour `signAndBroadcast` et la recherche de clés |
| `evmRpc` | `https://evm-testnet.qore.host` | utilisé par `eth_sendTransaction` (profil planned) |
| `allowMainnet` | `false` | sans cette option, la signature pour `qorechain-vladi` est refusée |
| `autoApprove` | `true` | si `false`, les approbations attendent `approveNext()` ou `rejectNext()` |
| `inclusionTimeoutMs`, `pollIntervalMs` | `30000`, `1500` | la manière dont `signAndBroadcast` attend l'inclusion |

### Codes d'erreur {#error-codes}

Pour ces paquets (`QorexIntegrationError.code`) : `QOREX_NOT_INSTALLED`, `QOREX_USE_SIGN_AND_BROADCAST`, `QOREX_AMINO_REFUSED` et `QOREX_NOT_SUPPORTED_YET` ; pour `qorex-synpress` : `QOREX_EXTENSION_MODE_UNAVAILABLE`. Les erreurs propres à QoreX sont de simples objets `Error` dont le message commence par `QoreX`, par exemple `QoreX: connection rejected`, `QoreX: signature rejected`, `QoreX: wallet is locked` et `QoreX: unsupported chain <id>`. Aujourd'hui, une chaîne inconnue (4902) est le seul cas qui porte un code numérique, et un refus de l'utilisateur n'a pas de code EIP-1193 4001 ; comparez donc le message. Les messages qui commencent par `QoreX (mock):` viennent du mock, jamais de QoreX.

## Comment y accéder {#how-to-access}

* **Un wallet QoreX pour un usage réel.** Les connecteurs dialoguent avec l'extension de navigateur ou l'application QoreX qu'un utilisateur a installée ; voir la page [Extension de navigateur QoreX](/qorex/browser-extension) pour les installations et les versions des stores. Les paquets de test n'ont besoin d'aucun wallet.
* **Réseaux.** Mainnet `qorechain-vladi` (EVM chain id 9801) et testnet `qorechain-diana` (EVM chain id 9800). QoreX ne sert que ces deux identifiants de chaîne QoreChain et rejette les autres avec « QoreX: unsupported chain ». Le mock utilise le testnet par défaut et refuse de signer pour le mainnet sauf si vous passez `allowMainnet: true`.
* **Clés et fonds.** Les paquets ne détiennent aucune clé. Le mock utilise la phrase de test BIP-39 publique (`abandon` répété 11 fois, puis `about`) qui dérive `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h` ; ne l'approvisionnez jamais. Pour un test qui diffuse, donnez au mock votre propre phrase mnémonique de testnet.
* **Autres comptes.** RainbowKit avec WalletConnect nécessite un identifiant de projet WalletConnect obtenu auprès de WalletConnect.
* **Prérequis.** Node.js (le script d'un seul fichier du mock nécessite la 20.16 ou ultérieure), une application React pour les trois connecteurs, et les paquets homologues listés sous chaque démarrage rapide. Les utilisateurs de TypeScript obtiennent les types depuis `@qorechain/qorex-types`.
* **Coûts.** Les paquets sont gratuits. Une transaction envoyée via QoreX paie les frais habituels (plancher de 0,1 uqor par gas ; QoreX tarifie ses propres transactions à 0,15 uqor par gas).

### Réseaux {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Identifiant de chaîne natif | `qorechain-vladi` | `qorechain-diana` |
| Identifiant de chaîne EVM | 9801 (`0x2649`) | 9800 (`0x2648`) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` | identique, avec le testnet sélectionné |

Préfixe Bech32 `qor` (validateurs `qorvaloper`), coin type 118, dénomination `uqor` avec 6 décimales sur la voie native et QOR avec 18 décimales sur EVM. Les utilisateurs ont besoin de l'extension QoreX (0.3.x) pour un usage réel ; les tests n'ont besoin que du mock. Pour de vraies diffusions depuis le mock, le compte a besoin de QOR de testnet depuis le [Faucet](/dashboard/faucet) (connexion requise) ; utilisez votre propre phrase mnémonique, jamais la phrase de test publique.

## Notes de sécurité {#security}

* La dApp ne détient jamais la clé ML-DSA-87 : QoreX signe les transactions QoreChain à l'intérieur du wallet via `signAndBroadcast`.
* QoreX refuse les demandes de la page portant sur des messages qui gèrent la clé ML-DSA-87 du compte.
* `qorexWallet()` ne se rabat jamais sur `window.ethereum`, de sorte qu'un autre wallet injecté n'est pas pris pour QoreX. Le mock utilise un nom en DNS inversé distinct pour qu'un double de test ne soit jamais pris pour le wallet.
* Les méthodes `connectProof`, `executeTransfer` et `executeRequest` existent pour le tableau de bord QoreChain et sont refusées sur toute autre origine.
* Surveillez le résultat `shield`. `downgraded` signifie que la transaction a été validée sans la couche hybride ; traitez-le comme une alerte.
* La phrase mnémonique par défaut du mock est publique et le mock refuse de signer pour le mainnet sauf avec `allowMainnet: true`. N'approvisionnez jamais la phrase de test publique ; utilisez une phrase mnémonique de testnet distincte pour les tests en conditions réelles.
* Signalez les vulnérabilités en privé à security@qore.network.

## Où ils sont publiés {#where-published}

| Registre | Paquet | Version | Lien |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Code source : https://github.com/qorechain/qorex-integrations (public, version `v0.1.0` publiée le 27 octobre 2026, dossiers sous `packages/`). Il contient aussi des guides (ajouter QoreX à côté de MetaMask, Keplr ou Phantom ; tests de bout en bout ; erreurs et identifiants de chaîne), une dApp de démonstration qui exerce chaque surface de QoreX sur le testnet, des exemples (`examples/wagmi-rainbowkit`, `examples/playwright-e2e`) et des fichiers d'entrées chain-registry. Licence Apache-2.0 ; mainteneur : QoreChain Association. Versions lues sur le registre npm le 27 octobre 2026. Ils remplacent `@qorechain/connect`, qui est déprécié sur npm : utilisez `qorex-types` pour détecter QoreX, `qorex-rainbowkit` pour les dApps EVM, `qorex-interchain-kit` (ou `qorex-cosmos-kit`) pour les dApps Cosmos, et [QoreSign](/qoresign/overview) pour la signature hybride dans votre propre wallet ou backend.

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

## Pages associées {#related}

* [Wallet QoreX](/qorex/overview) et [Extension de navigateur QoreX](/qorex/browser-extension) : le wallet avec lequel ces paquets dialoguent.
* [QoreSign](/qoresign/overview) : le signataire hybride qu'utilise le mock.
* [SDK QoreChain](/sdk/overview) : encoder des messages tels que `MsgSend` pour `signAndBroadcast`.
* [Développement EVM](/developer-guide/evm-development#evm-window) : enregistrement de la clé ML-DSA-87 et fenêtres d'autorisation EVM.
* [Faucet](/dashboard/faucet) : QOR de testnet.
* [Serveur MCP QoreChain](/developer-tools/mcp) : lire le résultat d'une diffusion avec `get_pq_status`.
* [Vue d'ensemble des paquets développeur](/developer-tools/overview).
