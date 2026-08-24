---
slug: /sdk/faq
title: FAQ et dépannage
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ et dépannage

## Le mainnet est-il en ligne ?

Oui. Le mainnet est **en ligne** (identifiant de chaîne `qorechain-vladi`). Le
préréglage testnet (`qorechain-diana`) reste également disponible. Les deux
préréglages utilisent par défaut des points de terminaison localhost ;
sélectionnez le réseau avec `createClient({ network: "mainnet" })` et
remplacez `endpoints` par les URL de vos nœuds. Voir
[Réseau et points de terminaison](/sdk/reference/network).

## Pourquoi mes appels atteignent-ils localhost ?

`createClient()` utilise par défaut des points de terminaison **localhost**.
Pour communiquer avec un nœud réel, passez un objet `endpoints` :

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Le chemin de signature (`connectTx`) a besoin du point de terminaison
consensus **`rpc`** ; les lectures CosmWasm l'utilisent également. Les
lectures REST utilisent `rest` ; les appels EVM et `qor_` utilisent
`evmRpc`.

## « Cannot find module 'viem' » / « '@solana/web3.js' »

Ce sont des **dépendances pairs** (*peer dependencies*) de `@qorechain/evm`
et `@qorechain/svm` respectivement. Installez-les dans votre projet :

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un appel à un précompilé lève « feature not present »

Les précompilés EVM n'existent que sur les nœuds exécutant le QoreChain EVM
Engine. Sur un nœud EVM standard, ces appels échouent. Si vous ciblez des
nœuds hétérogènes, encapsulez chaque appel de précompilé et gérez l'erreur au
cas par cas.

## Mes montants sont décalés d'un facteur d'un million

Le QOR a **10^6** unités de base `uqor`. Utilisez `toBase` / `fromBase` et
effectuez tous les calculs en unités de base :

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Notez que l'environnement d'exécution EVM représente le QOR avec **18**
décimales (convention EVM), ce qui est distinct de la base native `uqor` de
10^6.

## Quels paquets sont publiés, et où ?

Tous. Le cœur TypeScript (`@qorechain/sdk`), les adaptateurs EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`), le kit React (`@qorechain/react`) et le
générateur `create-qorechain-dapp` sont sur npm en version `0.7.0` ; le
client Python est sur PyPI (`pip install qorechain-sdk` en version `0.7.0`,
import `qorsdk`) ; le client Go est sur le proxy de modules
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.7.0`) ; et le client Java est sur Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). Le client Rust est sur
crates.io (`cargo add qorechain-sdk`) dans la **dernière version de crate
publiée**, qui accuse actuellement un retard sur la 0.7.0 — installez-le
depuis crates.io ou depuis le dépôt. Voir
[Installation](/sdk/install) pour la liste complète des commandes par
langage.

## Ma phrase mnémotechnique est rejetée

Le SDK valide à la fois la liste de mots BIP-39 **et** la somme de contrôle
avant de dériver la moindre clé, de sorte qu'une phrase mal saisie lève une
erreur au lieu de produire silencieusement le mauvais compte. Revérifiez les
mots ; utilisez `validateMnemonic` pour tester une phrase.

## Transactions hybrides (PQC)

La soumission hybride (classique + ML-DSA-87) est **en ligne et obligatoire**
sur le chemin Native — les transactions Native purement classiques sont
rejetées on-chain (chaîne v3.1.92). Avant qu'une transaction hybride ne soit
vérifiée par PQC, la clé publique PQC du signataire doit être enregistrée
(`MsgRegisterPQCKeyV2`), ou vous pouvez définir
`includePqcPublicKey: true` pour l'intégrer en vue d'un
auto-enregistrement lors de la première utilisation. La chaîne n'accepte
**que** les signatures ML-DSA-87 **déterministes** (le SDK signe de manière
déterministe par défaut depuis la 0.5.1) ; les signatures « hedged »
échouent avec le code `pqc` 21 (`hybrid_verify_failed`). Voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc).

## Mes transactions hybrides échouent à CheckTx avec une erreur d'analyse de transaction

Mettez à jour le SDK. Les versions **0.6.0 et antérieures** sérialisaient en
JSON l'extension de corps de transaction
`/qorechain.pqc.v1.PQCHybridSignature`, que le décodeur de transactions de la
chaîne rejette à CheckTx. Depuis la **0.6.1**, l'extension est encodée en
protobuf (la valeur commence par `0x08`) dans les cinq langages — les
transactions hybrides construites avec des versions plus anciennes sont
rejetées on-chain, sur toutes les voies (y compris eth-native).

## Ma dépense via authenticator est rejetée avec `authenticator_replay`

Le nonce est incorrect. `MsgExecuteEVM.nonce` doit être le nonce EVM
**actuel** du compte (le relayeur est un compte différent, donc n'ajoutez
**pas** 1) ; `MsgExecuteCosmos.nonce` est le **compteur de séquence par
authenticator** pour `(account, pubkey)`, un compteur de stockage distinct.
Récupérez à nouveau la valeur et re-signez. Les autres échecs d'authenticator
se décodent via `decodeTxError` : codes `abstractaccount` 5
(`spending_limit_exceeded`), 6 (`session_key_expired`), et 10
(`permission_denied`). Voir
[Authenticators et dépense déléguée](/sdk/guides/authenticators).
