---
slug: /sdk/faq
title: FAQ et dépannage
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ et dépannage

## Le mainnet est-il en ligne ?

Oui. Le mainnet est **en ligne** (identifiant de chaîne `qorechain-vladi`, en
production depuis le 7 juin 2026) et exécute la version de chaîne v3.2.3 au
20 octobre 2026. Le préréglage testnet (`qorechain-diana`) reste également
disponible. Les deux préréglages utilisent par défaut des points de terminaison
localhost ; sélectionnez le réseau avec `createClient({ network: "mainnet" })` et
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

Tous (vérifié le 21 octobre 2026). Le cœur TypeScript (`@qorechain/sdk`, 0.9.0),
le kit React (`@qorechain/react`, 0.9.0), le générateur `create-qorechain-dapp`
(0.9.0) et les adaptateurs EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, 0.8.0)
sont sur npm ; le client Python est sur PyPI (`pip install qorechain-sdk` en
version 0.9.0, import `qorsdk`) ; le client Go est sur le proxy de modules
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`) ; le client Rust
est sur crates.io (`cargo add qorechain-sdk`, 0.9.0) ; et le client Java est sur
Maven Central (`io.github.qorechain:qorechain-sdk:0.9.0`). Voir
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
n'enregistre pas de clé à la première utilisation. En TypeScript, donnez la paire
de clés au client (`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) et
chaque transaction qu'il envoie est signée en mode hybride.
La chaîne accepte toute signature ML-DSA-87 valide selon FIPS-204, hedged ou
déterministe. Le SDK signe de manière déterministe par défaut (depuis la 0.5.1)
pour qu'une transaction ait toujours la même signature et le même hash de tx. Si
une tx hybride échoue avec le code `pqc` 21 (`hybrid_verify_failed`), la cause
est la version des sign-bytes, le chain-id, une bibliothèque PQC obsolète ou une
clé non enregistrée ou différente, jamais la signature hedged.
Les deux réseaux vérifient la forme v2 des sign-bytes ; utilisez donc le SDK
**0.8.1 ou ultérieur** (la 0.9.0 est la version actuelle) et passez `rest` (ou
`signBytesVersion`) : les builders lèvent une erreur sur `qorechain-vladi` /
`qorechain-diana` sans l'un des deux.
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

## Avec quelles versions de chaîne le SDK fonctionne-t-il ?

Le SDK **0.9.0** est la version cliente pour la chaîne v3.2.2 et v3.2.3 : il
transige sur le mainnet **v3.2.3** et le testnet **v3.2.4**, et dispose de
constructeurs pour la preuve de possession facultative à l'enregistrement
(jointe automatiquement par `ensurePqcRegistered` une fois que le réseau a
appliqué la v3.2.3), les fenêtres EVM à portée limitée et les messages de
consentement EIP-7702. Le SDK **0.8.1 ou ultérieur** transige aussi sur les deux
réseaux (la forme v2 des sign-bytes hybrides, l'enregistrement, les envois
hybrides et la fenêtre EVM fonctionnent sans changement), mais n'a aucun de ces
constructeurs : utilisez la CLI pour ceux-ci (voir
[Versions antérieures à la 0.9.0](/sdk/install#before-090)). La v3.2.4 n'est en
production que sur le testnet pour l'instant (la proposition de gouvernance 13
du mainnet l'appliquerait à la hauteur 3,742,566), et le SDK ne définit aucun
champ de la v3.2.4.

## Mon enregistrement de clé PQC a été refusé mais les frais ont été prélevés

Un enregistrement pour un compte qui détient déjà une clé est refusé par la
chaîne après la déduction des frais. `ensurePqcRegistered` en 0.9.0 lit d'abord
`GET /qorechain/pqc/v1/account/{address}` (passez `rest`), ignore
l'enregistrement lorsque la clé de cette paire de clés est enregistrée, et lève
`PqcKeyMismatchError` lorsqu'une autre l'est. Les versions antérieures ne
regardaient pas d'abord, sauf si vous passiez vous-même
`status: { registered: found }`, où `found` provient de cette route. Depuis la
v3.2.3, la chaîne refuse aussi les clés faibles, dégénérées et réutilisées ; les
clés issues de `derivePqcCanonical` ou de `tx pqc gen-key` conviennent.

## `create-qorechain-dapp` installe un SDK qui ne peut pas signer

Seule la version 0.8.0 du générateur le faisait : elle écrivait des plages
`^0.3.0` pour `@qorechain/sdk` et `@qorechain/evm`, et une plage caret sur une
version 0.x reste dans la 0.3. La version 0.9.0 génère sur le SDK actuel ; si
vous avez utilisé la 0.8.0, exécutez `npm i @qorechain/sdk@latest` (et
`@qorechain/evm@latest`) après la génération.

## `VERSION` indique 0.8.0 mais j'ai installé la 0.8.3

La constante exportée `VERSION` de la 0.8.3 n'a pas été mise à jour et indique
`0.8.0` ; à partir de la 0.9.0, elle correspond au paquet. Sur les versions
antérieures, lisez la version installée dans `package.json`.

## Ma dépense via authenticator est rejetée avec `authenticator_replay`

(Le module `abstractaccount` est désactivé sur les deux réseaux aujourd'hui ;
une dépense est refusée avec `abstract account module is disabled` avant que
le moindre nonce ne soit vérifié. Voir
[Authenticators et dépense déléguée](/sdk/guides/authenticators). Les
indications ci-dessous s'appliquent une fois le module activé.)

Le nonce est incorrect. `MsgExecuteEVM.nonce` et `MsgExecuteCosmos.nonce` sont
tous deux la **séquence d'authenticator** de la clé liée pour
`(account, pubkey)` : un compteur que la chaîne tient par clé liée, qui démarre
à 0 et est incrémenté à chaque exécution réussie. Ce n'est **pas** le nonce EVM
du compte, et il n'existe pas encore de requête pour le lire ; suivez-le donc par
clé liée. Depuis la v3.2.3, la voie EVM signe aussi `evmAuthSignBytesV2`, qui lie
la limite de gas de l'appel (`resolveEvmAuthDigestVersion` choisit la forme).
Utilisez le compteur que vous suivez pour cette clé et re-signez.

Les autres échecs d'authenticator se décodent via `decodeTxError` : codes
`abstractaccount` 5 (`spending_limit_exceeded`), 6 (`session_key_expired`), et 10
(`permission_denied`). Voir
[Authenticators et dépense déléguée](/sdk/guides/authenticators).
