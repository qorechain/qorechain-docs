---
slug: /sdk/faq
title: FAQ & Dépannage
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ & dépannage

## Le mainnet est-il en service ?

Oui. Le mainnet est **en service** (chain id `qorechain-vladi`). Le préréglage
testnet (`qorechain-diana`) reste également disponible. Les deux préréglages
sont livrés avec des points de terminaison localhost par défaut ; sélectionnez
le réseau avec `createClient({ network: "mainnet" })` et remplacez `endpoints`
par les URL de vos nœuds. Voir
[Réseau & points de terminaison](/sdk/reference/network).

## Pourquoi mes appels atteignent-ils localhost ?

`createClient()` utilise par défaut les points de terminaison **localhost**.
Pour communiquer avec un vrai nœud, passez un objet `endpoints` :

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Le chemin de signature (`connectTx`) nécessite le point de terminaison
**`rpc`** du consensus ; les lectures CosmWasm l'utilisent également. Les
lectures REST utilisent `rest` ; les appels EVM et `qor_` utilisent `evmRpc`.

## « Cannot find module 'viem' » / « '@solana/web3.js' »

Ce sont des **dépendances de pairs (peer dependencies)** de `@qorechain/evm`
et `@qorechain/svm` respectivement. Installez-les dans votre projet :

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un appel de précompilé lève « feature not present »

Les précompilés EVM n'existent que sur les nœuds exécutant le QoreChain EVM
Engine. Sur un nœud EVM ordinaire, ces appels échouent. Si vous ciblez des
nœuds hétérogènes, encapsulez chaque appel de précompilé et gérez l'erreur
appel par appel.

## Mes montants sont décalés d'un facteur d'un million

QOR possède **10^6** unités de base `uqor`. Utilisez `toBase` / `fromBase` et
effectuez tous les calculs en unités de base :

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Notez que le runtime EVM représente QOR avec **18** décimales (convention
EVM), ce qui est distinct de la base Native `uqor` de 10^6.

## Quels paquets sont publiés, et où ?

Tous. Le cœur TypeScript (`@qorechain/sdk`), les adaptateurs EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`), le kit React (`@qorechain/react`) et le
générateur de projets `create-qorechain-dapp` sont sur npm en `0.7.0` ; le
client Python est sur PyPI (`pip install qorechain-sdk` en `0.7.0`, import
`qorsdk`) ; le client Go est sur le proxy de modules
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.7.0`) ; et le client Java est sur Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). Le client Rust est sur crates.io
(`cargo add qorechain-sdk`) à la **dernière version de crate publiée**, qui
est actuellement en retard sur 0.7.0 — installez-le depuis crates.io ou depuis
le dépôt. Voir [Installation](/sdk/install) pour les commandes complètes par
langage.

## Ma phrase mnémonique est rejetée

Le SDK valide à la fois la liste de mots BIP-39 **et** la somme de contrôle
avant de dériver la moindre clé, de sorte qu'une phrase comportant une faute
de frappe lève une erreur au lieu de produire silencieusement le mauvais
compte. Revérifiez les mots ; utilisez `validateMnemonic` pour tester une
phrase.

## Transactions hybrides (PQC)

La soumission hybride (classique + ML-DSA-87) est **en service et
obligatoire** sur le chemin Native — les transactions Native uniquement
classiques sont rejetées on-chain (chaîne v3.1.85). Avant qu'une tx hybride
ne passe la vérification PQC, la clé publique PQC du signataire doit être
enregistrée (`MsgRegisterPQCKeyV2`), ou vous pouvez définir
`includePqcPublicKey: true` pour l'intégrer en vue d'un enregistrement
automatique à la première utilisation. La chaîne n'accepte **que** les
signatures ML-DSA-87 **déterministes** (le SDK signe de manière déterministe
par défaut depuis 0.5.1) ; les signatures « hedged » échouent avec le code
`pqc` 21 (`hybrid_verify_failed`). Voir
[Comptes & signature PQC](/sdk/concepts/accounts-pqc).

## Mes transactions hybrides échouent à CheckTx avec une erreur d'analyse de tx

Mettez à jour le SDK. Les versions **0.6.0 et antérieures** sérialisaient en
JSON l'extension de corps de tx `/qorechain.pqc.v1.PQCHybridSignature`, que le
décodeur de tx de la chaîne rejette à CheckTx. Depuis **0.6.1**, l'extension
est encodée en protobuf (la valeur commence par `0x08`) dans les cinq
langages — les transactions hybrides construites avec des versions plus
anciennes sont rejetées on-chain, dans toutes les voies (y compris
eth-native).

## Ma dépense via authenticator est rejetée avec `authenticator_replay`

Le nonce est incorrect. `MsgExecuteEVM.nonce` doit être le nonce EVM
**courant** du compte (le relayeur est un compte différent, donc n'ajoutez
**pas** 1) ; `MsgExecuteCosmos.nonce` est la **séquence par authenticator**
pour `(account, pubkey)`, un compteur de stockage distinct. Récupérez à
nouveau la valeur et re-signez. Les autres échecs d'authenticator se décodent
via `decodeTxError` : codes `abstractaccount` 5 (`spending_limit_exceeded`),
6 (`session_key_expired`) et 10 (`permission_denied`). Voir
[Authenticators & dépenses déléguées](/sdk/guides/authenticators).
