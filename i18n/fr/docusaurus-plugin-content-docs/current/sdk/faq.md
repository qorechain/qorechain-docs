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
lectures REST utilisent `rest` ; les appels EVM utilisent `evmRpc` (ainsi que
les appels `qor_`, sur un nœud qui sert cet espace de noms). Les URL du mainnet
figurent dans la
[référence réseau](/sdk/reference/network#public-endpoints).

## « Cannot find module 'viem' » / « '@solana/web3.js' »

Ce sont des **dépendances pairs** (*peer dependencies*) de `@qorechain/evm`
et `@qorechain/svm` respectivement. Installez-les dans votre projet :

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un appel à un précompilé lève « returned no data » / « feature not present »

Les précompilés EVM de QoreChain sont compilés dans le nœud mais ne sont **pas
encore actifs** sur le mainnet ni sur le testnet : ils ne répondent que là où
leurs adresses figurent dans le paramètre `active_static_precompiles` du module
EVM, et cette liste est vide sur les deux réseaux. Aujourd'hui, l'appel renvoie
des données vides ; viem signale donc `returned no data ("0x")` et le helper
lève une erreur aussi sur les réseaux publics (voir
[Précompilés EVM : statut réseau](/developer-guide/evm-precompiles#network-status)).
Sur un nœud EVM standard, les appels échouent de la même façon. Consultez
`GET /cosmos/evm/vm/v1/params` et encapsulez chaque appel de précompilé afin que
l'erreur soit gérée appel par appel.

## Mon appel `client.qor` échoue avec -32601

`client.qor` appelle l'espace de noms JSON-RPC `qor_`, qu'aucune version publiée
du nœud ne sert ; `rpc_modules` sur les points de terminaison EVM publics ne
liste que `eth`, `net`, `rpc`, `txpool` et `web3`. Utilisez plutôt une route
REST, par exemple `GET /qorechain/pqc/v1/account/{address}` (statut de la clé
PQC) ou `GET /qorechain/burn/v1/stats`, via `client.rest.get(...)`. Voir
[l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace).

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

Tous. Le cœur TypeScript (`@qorechain/sdk`, 0.8.3), les adaptateurs EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, 0.8.0), le kit React (`@qorechain/react`,
0.8.3) et le générateur `create-qorechain-dapp` (0.8.0) sont sur npm ; le
client Python est sur PyPI (`pip install qorechain-sdk` en version 0.8.3,
import `qorsdk`) ; le client Go est sur le proxy de modules
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.8.4`) ; le client Rust est sur crates.io
(`cargo add qorechain-sdk`, 0.8.3) ; et le client Java est sur Maven Central
(`io.github.qorechain:qorechain-sdk:0.8.3`). Voir
[Installation](/sdk/install) pour la liste complète des commandes par
langage.

## Ma phrase mnémotechnique est rejetée

Le SDK valide à la fois la liste de mots BIP-39 **et** la somme de contrôle
avant de dériver la moindre clé, de sorte qu'une phrase mal saisie lève une
erreur au lieu de produire silencieusement le mauvais compte. Revérifiez les
mots ; utilisez `validateMnemonic` pour tester une phrase.

## Transactions hybrides (PQC)

La soumission hybride (classique + ML-DSA-87) est **en ligne et obligatoire**
sur le chemin Native : les transactions Native purement classiques sont
rejetées on-chain (chaîne v3.2.0).
Avant qu'une transaction hybride ne soit vérifiée par PQC, la clé publique PQC
du signataire doit être **enregistrée explicitement** avec
`MsgRegisterPQCKeyV2` (une transaction signée de manière classique et exemptée
de la signature hybride) ; intégrer la clé publique dans l'extension
(`includePqcPublicKey: true`) ne l'enregistre **pas**, et la chaîne
n'enregistre pas de clé à la première utilisation.
La chaîne accepte toute signature ML-DSA-87 valide selon FIPS-204, hedged ou
déterministe. Le SDK signe de manière déterministe par défaut (depuis la 0.5.1)
pour qu'une transaction ait toujours la même signature et le même hash de tx. Si
une tx hybride échoue avec le code `pqc` 21 (`hybrid_verify_failed`), la cause
est la version des sign-bytes, le chain-id, une bibliothèque PQC obsolète ou une
clé non enregistrée, jamais la signature hedged.
Les deux réseaux vérifient la forme v2 des sign-bytes ; utilisez donc le SDK
**0.8.1 ou ultérieur** et passez `rest` (ou `signBytesVersion`) : les builders
lèvent une erreur sur `qorechain-vladi` / `qorechain-diana` sans l'un des deux.
Voir
[Dépannage du code 21](/developer-guide/post-quantum-signing#code-21) et
[Comptes et signature PQC](/sdk/concepts/accounts-pqc).

## Ma transaction EVM est refusée avec « no open EVM authorisation window »

Depuis la chaîne v3.2.0, la voie EVM n'admet une transaction que d'un compte
disposant d'une clé PQC enregistrée et d'une fenêtre d'autorisation ouverte.
Enregistrez une clé, ouvrez une fenêtre, puis envoyez. Voir
[Fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window). Avec le SDK,
`classifyEvmWindowRejection(err)` renvoie `"no-pqc-key"`, `"no-window"`,
`"exhausted"` ou `"invalid"`.

## Mes transactions hybrides échouent à CheckTx avec une erreur d'analyse de transaction

Mettez à jour le SDK. Les versions **0.6.0 et antérieures** sérialisaient en
JSON l'extension de corps de transaction
`/qorechain.pqc.v1.PQCHybridSignature`, que le décodeur de transactions de la
chaîne rejette à CheckTx. Depuis la **0.6.1**, l'extension est encodée en
protobuf (la valeur commence par `0x08`) dans les cinq langages — les
transactions hybrides construites avec des versions plus anciennes sont
rejetées on-chain, sur toutes les voies (y compris eth-native).

## Ma dépense via authenticator est rejetée avec `authenticator_replay`

(Le module `abstractaccount` est désactivé sur les deux réseaux aujourd'hui ;
une dépense est refusée avec `abstract account module is disabled` avant que
le moindre nonce ne soit vérifié. Voir
[Authenticators et dépense déléguée](/sdk/guides/authenticators). Les
indications ci-dessous s'appliquent une fois le module activé.)

Le nonce est incorrect. `MsgExecuteEVM.nonce` doit être le nonce EVM
**actuel** du compte (le relayeur est un compte différent, donc n'ajoutez
**pas** 1) ; `MsgExecuteCosmos.nonce` est le **compteur de séquence par
authenticator** pour `(account, pubkey)`, un compteur de stockage distinct.
Récupérez à nouveau la valeur et re-signez. Les autres échecs d'authenticator
se décodent via `decodeTxError` : codes `abstractaccount` 5
(`spending_limit_exceeded`), 6 (`session_key_expired`), et 10
(`permission_denied`). Voir
[Authenticators et dépense déléguée](/sdk/guides/authenticators).
