---
slug: /sdk/faq
title: FAQ et dépannage
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ et dépannage

## Le mainnet est-il en service ?

Oui. Le mainnet est **en service** (ID de chaîne `qorechain-vladi`). Le préréglage testnet
(`qorechain-diana`) reste également disponible. Les deux préréglages livrent des points de terminaison
par défaut localhost ; sélectionnez le réseau avec `createClient({ network: "mainnet" })` et
remplacez `endpoints` par les URL de vos nœuds. Voir
[Réseau et points de terminaison](/sdk/reference/network).

## Pourquoi mes appels atteignent-ils localhost ?

`createClient()` utilise par défaut des points de terminaison **localhost**. Pour communiquer avec un véritable nœud,
passez un objet `endpoints` :

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

Le chemin de signature (`connectTx`) nécessite le point de terminaison **`rpc`** de consensus ; les lectures CosmWasm
l'utilisent également. Les lectures REST utilisent `rest` ; les appels EVM et `qor_` utilisent `evmRpc`.

## « Cannot find module 'viem' » / « '@solana/web3.js' »

Ce sont des **dépendances de pairs** de `@qorechain/evm` et `@qorechain/svm`
respectivement. Installez-les dans votre projet :

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un appel de précompilé lève « feature not present »

Les précompilés EVM n'existent que sur les nœuds exécutant le QoreChain EVM Engine. Sur un
nœud EVM ordinaire, ces appels échouent. Si vous ciblez des nœuds hétérogènes, encapsulez chaque
appel de précompilé et gérez l'erreur par appel.

## Mes montants sont décalés d'un facteur d'un million

QOR possède **10^6** unités de base `uqor`. Utilisez `toBase` / `fromBase` et effectuez tous les
calculs en unités de base :

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Notez que le runtime EVM représente QOR avec **18** décimales (convention EVM), ce qui
est distinct de la base `uqor` de Cosmos de 10^6.

## Quels paquets sont publiés, et où ?

Tous. Le cœur TypeScript (`@qorechain/sdk`) et les adaptateurs EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`) sont sur npm en `0.3.0` ; le client Python est
sur PyPI (`pip install qorechain-sdk` en `0.3.1`, import `qorsdk`) ; le client Rust
est sur crates.io (`cargo add qorechain-sdk` en `0.3.0`) ; et le client Go
est sur le proxy de modules (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
Voir [Installation](/sdk/install) pour les commandes complètes par langage.

## Ma phrase mnémonique est rejetée

Le SDK valide à la fois la liste de mots BIP-39 **et** la somme de contrôle avant de dériver
toute clé, de sorte qu'une phrase avec une faute de frappe lève une erreur au lieu de produire silencieusement le mauvais
compte. Revérifiez les mots ; utilisez `validateMnemonic` pour tester une phrase.

## Transactions hybrides (PQC)

La signature/vérification ML-DSA-87 locale et les assistants de construction de transactions hybrides sont disponibles
aujourd'hui. Avant qu'une transaction hybride ne soit vérifiée par PQC sur la chaîne, la clé publique PQC du
signataire doit être enregistrée (`MsgRegisterPQCKey`), ou vous devez définir
`includePqcPublicKey: true` pour l'intégrer en vue d'un enregistrement automatique. La soumission hybride
complète est en cours de finalisation pour le réseau en service. Voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc).
