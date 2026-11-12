---
slug: /sdk/install
title: Installation
sidebar_label: Installation
sidebar_position: 2
---

# Installation

Installez le SDK pour votre langage. Le cœur TypeScript (`@qorechain/sdk`), les
adaptateurs EVM et SVM (`@qorechain/evm`, `@qorechain/svm`), le kit React
(`@qorechain/react`) et les clients Python, Go, Rust et Java sont tous
**publiés** sur leurs registres avec une parité complète avec la chaîne native (messages
typés, requêtes, cycle de vie des tx, transactions PQC hybrides et
abonnements WebSocket). La version actuelle est la **0.14.0**, publiée le 12 novembre 2026
(vérifiée auprès des registres le 12 novembre 2026 ; Java fait exception, voir le
tableau) :

| Registre | Paquet | Version |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.14.0 (`create-qorechain-dapp` aussi ; il reprend aussi les correctifs de modèles de la 0.13.1) |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.14.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.14.0 |
| Proxy de modules Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.14.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.14.0 (JDK 17 ou ultérieur) |

Il n'existe pas de 0.11.0 pour Python, Rust, Go ni Java : les paquets npm ont eu une 0.11.0 le
29 octobre 2026 (le kit de développement de chaîne, voir plus bas) et chaque langage est passé
de la 0.10.0 à la 0.12.0 en même temps. La 0.13.0 a suivi le 11 novembre 2026 et la 0.14.0 le 12 novembre 2026 dans tous les langages.

Choisissez votre langage ci-dessous.

## Notes de mise à niveau {#upgrade}

:::danger Utilisez le SDK 0.8.1 ou une version ultérieure sur les réseaux en production
Les deux réseaux publics vérifient la forme **sign-bytes hybride v2** (balisée par domaine et
liée au chain id) et refusent l'ancienne forme avec le code `pqc` 21. Toutes les versions du SDK
antérieures à la **0.8.0** signent l'ancienne forme, et la **0.8.0** cherche le basculement
sous un seul des deux noms de mise à niveau utilisés par les réseaux (le mainnet l'a enregistré sous
`v3.2.0`, le testnet sous `v3.1.98` puis `v3.2.0`), de sorte qu'elle signe la mauvaise forme
sur le mainnet. Utilisez la **0.14.0** (ou au minimum la **0.8.1**) dans tous les langages ; la **0.8.2 ou une version ultérieure** est nécessaire
pour ouvrir une [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window). Les constructeurs
hybrides acceptent une option `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`) ; `"auto"`
interroge le réseau et nécessite donc le point d'accès REST (`rest`) sur
`qorechain-vladi` / `qorechain-diana` : il lève une erreur au lieu de deviner. Voir
[Quelle forme de sign-bytes ?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
La forme n'a pas changé dans la chaîne v3.2.3 ni v3.2.4 (la v3.2.4 s'exécute sur le testnet depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026 ; les v3.2.5 et v3.2.6 n'ont rien changé ici ; le mainnet exécute la v3.2.6 depuis le 4 novembre 2026) : `"auto"`
se résout en v2 sur les deux réseaux, car les deux ont appliqué la mise à niveau qui y a basculé.
:::

## Ce que change la 0.14.0 {#whats-new-0140}

Le SDK 0.14.0 (12 novembre 2026) est une version unique pour tous les langages : TypeScript, Python,
Go, Rust et Java, avec `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm` et
`create-qorechain-dapp` (qui reprend aussi les correctifs de modèles de la 0.13.1). Elle ajoute la prise en charge
côté client de la chaîne **v3.2.8**. Les nouvelles règles s'appliquent sur un réseau dès qu'il exécute la v3.2.8 :
le testnet `qorechain-diana` l'exécute depuis le 12 novembre 2026 ; le mainnet ne l'a pas
appliquée. Sur les réseaux antérieurs, les nouveaux champs restent facultatifs.

| Domaine | Dans la 0.14.0 |
| --- | --- |
| Liaison d'une clé | Exige une preuve de possession. Les constructeurs et signataires pour ed25519, secp256k1 et EIP-191 (`personal_sign`) signent un message de lien en texte brut qui nomme la chaîne, le compte, le schéma et la clé. Les composeurs d'enregistrement refusent une preuve vide |
| Clés qui déplacent de la valeur | Une clé avec `send`, `evm`, `deploy`, `svm` ou `all` exige que la première règle de dépense activée du compte borne chaque dénomination. Un assistant construit la mise à jour de la règle de dépense et le lien sous forme de paire, dans une seule transaction signée par le propriétaire, et vérifie la règle |
| Paramètres de gouvernance | Les composeurs `MsgUpdateParams` de crossvm, svm et rdk exigent tous les champs (la chaîne remplace les paramètres en bloc). De nouveaux assistants construisent la mise à jour à partir des paramètres actuels lus sur le réseau. Le composeur svm refuse `enabled` tant que le plafond strict de garde vaut 0 |
| Requête des appels cross-VM en attente | La requête paginée renvoie désormais toutes les pages |
| Résultats d'exécution | `MsgExecuteEVM` et `MsgExecuteCosmos` peuvent échouer avec `success=false` dans une transaction de code 0 (le nonce est consommé). De nouveaux assistants décodent les réponses et la raison de l'échec, et lèvent une erreur sur une exécution échouée |
| Appels asynchrones cross-VM | Prennent `async_gas_limit` et `async_max_factor` |
| Périmètre de la fenêtre EVM | Nouveaux champs `validators`, `staking_validators` et `ibc_receivers` |
| Gas | Les transactions EVM au-delà de 30,000,000 (lu depuis `evm_limits`) et les transactions Cosmos au-delà de 50,000,000 sont refusées avant la signature. Les transactions CosmWasm et cross-VM reçoivent au moins 1.3 fois le gas simulé et jamais de valeur de repli fixe |
| Prix minimal du gas | Des assistants facultatifs lisent le prix minimal du gas du réseau ; le prix du gas par défaut est inchangé |
| Protos | Le code généré dans les cinq langages suit la v3.2.8 |

Le côté portefeuille du même changement se trouve dans
[`@qorechain/wallet-adapter` 0.6.0](/developer-tools/wallet-adapter#whats-new-060).

## Ce que change la 0.13.0 {#whats-new-0130}

Le SDK 0.13.0 (11 novembre 2026) est une version unique pour tous les langages : TypeScript, Python,
Go, Rust et Java, avec `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm` et
`create-qorechain-dapp`. Elle comporte un changement incompatible, sur l'assistant de compte par
graine. Les comptes dérivés d'un mnémonique sont inchangés, tout comme le format de signature
hybride et le comportement de la chaîne : une transaction construite avec la 0.12.0 reste valide.

**Changement incompatible.** Les assistants par graine `unifiedAccountFromSeed` (TypeScript),
`unified_account_from_seed` (Python, Rust), `unified.UnifiedAccountFromSeed` (Go) et
`UnifiedAccounts.unifiedAccountFromSeed` (Java) exigent désormais exactement l'une de deux entrées : un
code de récupération `QRC1`, ou un secret PQC indépendant de 32 octets. La clé ML-DSA-87 est
dérivée de ce second secret. Appeler l'assistant sans option, ou avec plus d'une, lève une
erreur.

L'option `legacySeedDerivation` (Python `legacy_seed_derivation=True`, Go
`LegacySeedDerivation`, Rust `SeedPqcOptions::legacy_seed_derivation()`, Java
`SeedPqcOptions.legacy()`) est facultative. Utilisez-la uniquement pour retrouver la clé PQC d'un compte
créé avant la 0.13.0 afin de pouvoir la faire pivoter avec `MsgRotatePQCKey` ; elle n'est pas faite pour de
nouveaux comptes.

| Domaine | Dans la 0.13.0 |
| --- | --- |
| Assistants par graine | Exigent un code de récupération `QRC1` ou un secret PQC indépendant de 32 octets (exactement un) ; sans option, ou avec plus d'une, l'appel lève une erreur. Les comptes dérivés d'un mnémonique sont inchangés |
| `legacySeedDerivation` | Facultative, uniquement pour retrouver la clé PQC d'un compte créé avant la 0.13.0 afin de pouvoir la faire pivoter avec `MsgRotatePQCKey` |
| Codes de récupération `QRC1` | Ajoutés dans tous les langages : `generatePqcRecoveryCode`, `isValidRecoveryCode`, `normalizeRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcRecoveryCodeFromSecret` (en snake_case en Python et Rust ; en Go `GeneratePQCRecoveryCode`, `IsValidRecoveryCode`, `PQCKeyFromRecoveryCode`, `PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | Renvoie `keyVerified` |
| Modèles | `pnpm window recovery-code` affiche un nouveau code. Avec `PRIVATE_KEY`, `pnpm window` lit `QORE_PQC_RECOVERY_CODE` et s'arrête avec un message s'il manque ; avec `QORE_MNEMONIC`, rien ne change. Les modèles Foundry et Hardhat dépendent de `^0.13.0` |
| Version de sign-bytes `"auto"` | Lit d'abord la fonctionnalité de protocole `pqc-sign-bytes-v2` depuis `/qorechain/pqc/v1/protocol_features`, et ne se rabat sur les plans de mise à niveau appliqués que si cette lecture échoue |
| `getPqcStatus` / `get_pqc_status` | Lèvent une erreur lorsque la réponse du nœud n'a pas d'indicateur d'enregistrement, au lieu de signaler « non enregistré » |
| Python | Analyse strictement les codes de résultat des transactions et les champs `found` et `live` de la fenêtre EVM ; `wait_for_tx` traite une réponse sans `tx_response` ou `txhash` comme encore en attente |

**Options du chemin par graine dans chaque langage**. Passez exactement une des trois :

| Langage | Appel | Code de récupération | Secret indépendant de 32 octets | Ancienne clé, récupération uniquement |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }` (une chaîne `"QRC1-..."`) | `{ pqcSecret }` (un `Uint8Array` de 32 octets, indépendant de `seed32`) | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

Les options Python sont uniquement nommées (keyword-only). Un `pqcSecret` donne la même clé que le code de récupération créé à partir de lui avec `pqcRecoveryCodeFromSecret(secret32)`. TypeScript propose aussi `pqcKeyFromRecoveryCode(code, qor1)`.

**Migrer (TypeScript).** Créez un code de récupération une seule fois et conservez-le séparément de la
graine :

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

Un compte qui a enregistré sa clé PQC avec la 0.12 ou une version antérieure charge l'ancienne clé avec
`{ legacySeedDerivation: true }` et la fait pivoter avec `rotatePqcKeyMsg` :

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

Conservez le code de récupération : un autre code donne une autre clé.

## Ce qu'ajoute la 0.12.0 {#whats-new-0120}

Le SDK 0.12.0 est la version cliente pour la chaîne **v3.2.5**, que le mainnet a appliquée à la
hauteur 3,906,833 le 29 octobre 2026 (le testnet l'a appliquée le 26 octobre). Le mainnet
exécute la v3.2.6 depuis le 4 novembre ; le testnet a exécuté la v3.2.6 dès le 27 octobre, la v3.2.7 du 6 au 12 novembre et la v3.2.8 depuis le 12 novembre ; le
format de signature hybride, les adresses, les décimales et les memos n'ont pas changé, de sorte qu'une
transaction construite avec la 0.10.0 reste valide. TypeScript, Python, Go, Rust et Java
passent tous à la 0.12.0, avec `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
et `create-qorechain-dapp`. La version a été vérifiée dans chaque langage avec un
envoi bancaire hybride sur le testnet et avec une clé KEM enregistrée, relue puis
retirée sur celui-ci, ainsi que des lectures sur le mainnet.

| Domaine | Dans la 0.12.0 |
| --- | --- |
| Points de terminaison publics par défaut | Les préréglages `mainnet` et `testnet` pointent désormais vers les points de terminaison publics (REST, RPC de consensus et JSON-RPC EVM sur les deux, plus le WebSocket EVM sur le testnet) au lieu de localhost. Un simple `createClient()` parle donc au testnet public. Voir [Réseau et points de terminaison](/sdk/reference/network#public-endpoints) |
| Préréglage `localnet` | Les ports localhost que tous les préréglages utilisaient avant la 0.12.0, chain id `qorechain-devnet`. Sélectionnez-le avec `createClient({ network: "localnet" })` pour conserver l'ancien comportement |
| Gas exact pour les transactions hybrides | Sur un réseau qui a appliqué la v3.2.5, les frais `"auto"` d'une transaction native hybride valent `ceil(simulated x 1.02) + 2000`, car la simulation facture désormais elle-même la vérification post-quantique. Un envoi bancaire hybride demande environ 171,600 de gas au lieu d'environ 289,000, et les frais baissent avec lui. Les réseaux plus anciens, les transactions classiques et un échec de lecture du plan conservent la règle précédente ; un multiplicateur que vous passez remplace l'une ou l'autre règle. `exactHybridGas` (et ses équivalents dans chaque langage) et, en TypeScript, `estimateGasDetails` (indique la simulation, la limite de gas et la règle qui l'a fixée). Java a gagné le chemin de gas automatique |
| Registre de clés ML-KEM-1024 | Un compte publie une clé d'encapsulation ML-KEM-1024 (algorithme 2, 1,568 octets) afin que n'importe qui puisse chiffrer à son intention : `msg.pqc.registerKemKey` et `msg.pqc.removeKemKey` (la clé est d'abord vérifiée : taille, chaque coefficient inférieur à 3329, pas entièrement nulle), `validateKemPublicKey`, et la lecture `fetchKemKey` de `/qorechain/pqc/v1/kem/{address}` (bech32 ou `0x`). Les deux messages exigent la signature hybride. La route répond sur le mainnet et le testnet. Le SDK ne chiffre pas : pour les charges utiles scellées, voir [QoreSeal](/developer-tools/qoreseal) |
| Comptes abstraits | Lectures des règles de dépense stockées d'un compte et de ses clés liées (y compris les clés révoquées), `MsgUpdateConfig` (le message de gouvernance qui active ou désactive le module), et `authenticators_count` dans la vue du compte |
| Vérifications des règles de dépense | Les règles sont vérifiées comme la chaîne les vérifie : un denom `erc20/`, `erc721/` ou `erc1155/` doit désigner une adresse de contrat `0x`. Les codes 8 (règle de dépense invalide) et 9 (module désactivé) de `abstractaccount` sont nommés |
| Paramètres de gouvernance | Le `MsgUpdateParams` cross-VM (y compris les contrats CosmWasm que le precompile de pont EVM peut appeler) et le `MsgUpdateParams` de rollup, chacun vérifié par rapport aux bornes de la chaîne avant la signature. La lecture des paramètres cross-VM porte `bridge_allowed_targets` |
| Constante de mise à niveau et protos | `CHAIN_UPGRADE_V3_2_5` ; définitions protobuf synchronisées avec la chaîne v3.2.5 |
| Kit de développement de chaîne | À partir de la 0.11.0 (npm uniquement) et inclus dans la 0.12.0 : `@qorechain/evm` exporte les chaînes viem `qorechain` (9801) et `qorechainTestnet` (9800) et les assistants de la fenêtre d'autorisation EVM (`evmWindowStatus`, `openEvmWindowMessage`, aussi sous `@qorechain/evm/window` sans viem). `create-qorechain-dapp` a les modèles `foundry`, `hardhat`, `viem-wagmi` et `cosmwasm`. `@qorechain/react` a `PqcStatusBadge` (les anciens noms `QuantumSafeBadge` sont conservés comme alias obsolètes) |
| Correctifs | `@qorechain/svm`, lorsqu'on lui donnait des points de terminaison sans `svmRpc`, utilisait localhost ; il indique désormais que le point de terminaison n'est pas configuré. La génération de code Python fait pointer les imports entre protos QoreChain vers le paquet |

**Changement de comportement à vérifier lors de la mise à niveau.** Si votre code reposait sur la
valeur par défaut localhost, sélectionnez `localnet` ou passez `endpoints`. Les points de terminaison
publics du testnet sont limités en débit par IP ; le trafic de production doit donc exécuter ou utiliser son propre
nœud. Aucun préréglage ne définit de point de terminaison gRPC ou SVM sur les réseaux publics (les transactions
SVM ne sont pas ouvertes), et le mainnet n'a pas de WebSocket EVM public : le code qui en a besoin
échoue avec une erreur nommant le point de terminaison à passer, au lieu de se rabattre
sur localhost. En Rust, les points de terminaison facultatifs sont désormais `Option<String>` ; en Python, Go
et Java, un point de terminaison non défini vaut respectivement `None`, une chaîne vide et `null`.

Les nœuds ne signalent pas la version de leur binaire. Pour détecter une fonctionnalité, interrogez `isUpgradeApplied`
pour chaque nom de mise à niveau qui l'apporte, ou lisez `.version` dans
`https://download.qore.host/<net>/latest.json`.

## Ce qu'a ajouté la 0.10.0 {#whats-new-0100}

Le SDK 0.10.0 est la version cliente pour la chaîne **v3.2.4**, que le mainnet a appliquée à la
hauteur 3,742,566 le 23 octobre 2026 (le testnet l'a appliquée à la hauteur 8,337,253
le 19 octobre). Le format de signature, les adresses, les décimales, les memos et les frais n'ont pas
changé, et une transaction construite avec la 0.9.0 reste valide. La version a été vérifiée dans
chaque langage avec de vraies transactions sur le testnet. Elle n'avait pas de constructeurs pour
quoi que ce soit introduit après la v3.2.4 ; les ajouts de la v3.2.5 sont arrivés avec la
[0.12.0](#whats-new-0120). Le mainnet exécute la v3.2.6 depuis le 4 novembre 2026 (hauteur
4,020,000, proposition de gouvernance 15 ; la v3.2.5 avant elle, depuis le 29 octobre à la hauteur
3,906,833) et la 0.10.0 y continue de fonctionner, car le format de signature n'a pas
changé. Le testnet a appliqué la v3.2.5 et la v3.2.6 les 26 et 27 octobre 2026, la v3.2.7 le 6 novembre et la v3.2.8 le 12 novembre (aucune version du SDK n'a de constructeurs pour les messages de la v3.2.7). Ce qu'a apporté la 0.10.0
(tout cela est toujours dans la 0.14.0) :

| Domaine | Dans la 0.10.0 |
| --- | --- |
| Paliers de staking (`x/stakingtier`) | Constructeurs `lockDelegation` (avec les propres vérifications de la chaîne : une durée de 3, 6 ou 12 mois et un montant entier positif), `unlockEarly`, `claimBonus` et `updateParams` ; lectures des paramètres du module, des verrouillages d'un détenteur et du pool de bonus (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`) ; les codes d'erreur du module. Ce que fait le module est décrit dans [Staking et délégation](/user-guide/staking-and-delegation) |
| Nonce d'authenticator | `fetchAuthNonce({ rest, address, pubkey })` lit la séquence qu'une clé liée doit signer ensuite pour `MsgExecuteEVM` / `MsgExecuteCosmos` depuis `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, au lieu de la suivre à la main. Les deux réseaux servent la route ; le module `abstractaccount` lui-même est désactivé sur le mainnet (activé sur le testnet), de sorte qu'une dépense sur le mainnet est refusée avant qu'un nonce soit vérifié |
| Interrupteurs de fonctionnalités du protocole | `fetchProtocolFeatures` et `isProtocolFeatureEnabled` lisent, par nom, quelles règles de consensus un réseau applique, depuis `/qorechain/pqc/v1/protocol_features` (les deux réseaux la servent). Un réseau antérieur à la v3.2.4 ne sert pas la route ; utilisez `isUpgradeApplied` dans ce cas |
| `possessionProven` | Le statut PQC indique si la clé du compte a été enregistrée avec une preuve de possession |
| `ibcTimeoutTimestamp(seconds)` | Un délai d'expiration IBC absolu dans l'unité que prend `MsgTransfer` (nanosecondes Unix). Les délais d'expiration IBC sont des instants absolus ; les paquets IBC v2 prennent des secondes Unix absolues, et une valeur relative y est refusée après le prélèvement des frais. Aucun canal IBC n'est ouvert sur le mainnet (vérifié le 27 octobre 2026) |
| Constante de mise à niveau et protos | `CHAIN_UPGRADE_V3_2_4` ; définitions protobuf synchronisées avec la chaîne v3.2.4 (nouveaux champs sur l'enregistrement de validateur de pont, le nœud léger et les requêtes de rollup) |
| `ensurePqcRegistered` | Il comparait comme concordant un statut sans clé publique ; il lit désormais la clé via `rest` et la compare. Faute de pouvoir la lire, le résultat indique `keyVerified: false` au lieu d'affirmer que la clé est celle de l'appelant |
| Refus pendant la simulation des frais | Un refus de la chaîne qui n'arrive que sous forme de texte (par exemple « no bonus to claim ») est désormais nommé d'après les descriptions d'erreur enregistrées de la chaîne dans chaque langage : `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` et `create-qorechain-dapp` sont passés à la 0.10.0 avec elle ; les deux sont
à la 0.14.0 désormais.

## Ce qu'a ajouté la 0.9.0 {#whats-new-090}

Le SDK 0.9.0 était la version cliente pour les chaînes **v3.2.2** et **v3.2.3** (le mainnet
les a appliquées aux hauteurs 3,556,788 et 3,662,051 ; le mainnet a exécuté la v3.2.4 à partir du 23 octobre 2026 (hauteur 3,742,566) et a exécuté la v3.2.5 à partir du 29 octobre et exécute la v3.2.6 depuis le 4 novembre 2026, et le testnet exécute la v3.2.4 ou une version ultérieure depuis le 19 octobre 2026). Le
format de signature, les adresses, les décimales, les memos et les frais n'ont pas changé,
si bien que la forme sign-bytes hybride v2 que signent la 0.8.1 et les versions suivantes
reste la bonne.
Voici les nouveautés :

| Domaine | Dans la 0.9.0 (et ultérieures) |
| --- | --- |
| `TxClient` hybride (TypeScript) | Passez la paire de clés du compte : `client.connectTx(signer, { pqcKeypair })` ou `TxClient.connect({ …, pqcKeypair, rest })`. Chaque transaction est alors signée en mode hybride et `fee: "auto"` simule la transaction hybride elle-même ; un simple enregistrement de clé reste classique (le chemin d'amorçage de la chaîne). `bankSend` et les clients rollup, multilayer et cross-VM du SDK l'utilisent. Sans paire de clés, rien ne change |
| Clé PQC récupérable | `derivePqcCanonical(address, mnemonic)` et ses équivalents dans chaque langage (voir [Signature hybride](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Lit d'abord l'état de la clé via REST (`rest`), refuse d'enregistrer lorsqu'il ne peut pas le déterminer, lève `PqcKeyMismatchError` lorsque le compte détient déjà une autre clé, et traite le refus « déjà enregistrée » de la chaîne comme un succès. À partir de la chaîne v3.2.3, il signe et joint lui-même la **preuve de possession** ; avant la v3.2.3, il laisse le champ vide |
| Fenêtres EVM à portée restreinte | `openEvmWindowMsg` accepte `nativeOnly` et `allowedTargets` (16 au plus, sans doublons) ; `fetchEvmWindow` relit les deux (voir le [guide EVM](/sdk/guides/evm#evm-window)) |
| Consentement EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Intégrité des clés | Les constructeurs d'enregistrement refusent `classical_only`, une clé vide et une clé ML-DSA-87 dégénérée, que la chaîne refuse à partir de la v3.2.3. `signProofOfPossession` / `verifyProofOfPossession` sont exportées ; `migratePqcKeyHybrid` envoie le `MsgMigratePQCKey` signé en mode hybride dont les comptes dotés d'une clé ont besoin à partir de la v3.2.3 |
| Condensat de compte abstrait v2 | `evmAuthSignBytesV2` (lie la limite de gas de l'appel) et `resolveEvmAuthDigestVersion`. Le module `abstractaccount` est désactivé sur le mainnet (activé sur le testnet) ; sur le mainnet, ceci est donc donné à titre de référence |
| Détection des mises à niveau | `isUpgradeApplied`, `requireUpgradeApplied` : les nouveaux champs facultatifs ne sont renseignés qu'une fois que `applied_plan` signale la version, car un nœud qui n'a pas appliqué une version refuse la transaction entière lorsqu'un des nouveaux champs de cette version est renseigné |
| Décodage des erreurs | Un échec survenu dans un bloc conserve son codespace (par exemple `pqc` 231, et non `sdk_231`) ; `rate_limited` et les codes de délégation sont décodés ; `decodeTxError` lit le journal ou le message d'une erreur levée |
| Règles de dépense | `validateSpendingRules` s'exécute dans les constructeurs de `MsgUpdateSpendingRules` et refuse une règle qui ne borne rien |
| Correctifs | La route du compte PQC est la route au singulier `/qorechain/pqc/v1/account/{address}` dans tous les SDK (ainsi que dans `client.rest.getPqcAccount`, `isPqcRegistered` et `getPqcStatus` lorsqu'on leur donne le client composé) ; le `VERSION` exporté correspond au paquet ; les clients Go et Rust créés par le SDK expirent au lieu de rester bloqués ; les modèles de `create-qorechain-dapp` dépendent de la version avec laquelle ils sont livrés |

La dérivation PQC historique pour les nouvelles clés (`derivePqcLegacy`, `"bridge"`) est
dépréciée : elle n'est pas liée au compte, si bien qu'une même phrase mnémonique donnerait une même clé à
chaque compte. Les helpers de rotation la refusent comme **nouvelle** clé ; récupérer une clé historique existante
ou en changer par rotation fonctionne toujours.

## Versions antérieures à la 0.9.0 {#before-090}

Si vous êtes en 0.8.x, elle signe toujours la forme que vérifient les deux réseaux et fonctionne sur
le mainnet et le testnet. Voici les limites que la 0.9.0 a supprimées, et
certaines coûtent des frais si vous ne les connaissez pas :

| Version antérieure à la 0.9.0 | Contournement |
| --- | --- |
| Pas de constructeurs de preuve de possession, de fenêtre à portée restreinte ni de consentement EIP-7702 | Utilisez `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets`, et `authorize-evm-delegation` / `clear-evm-delegation` (voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window), [Délégations EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` sans `status` diffusait l'enregistrement sans vérification, et signalait un succès lorsqu'une autre clé était enregistrée | Un second enregistrement pour un compte qui détient déjà une clé est refusé **après le prélèvement des frais**. Lisez d'abord `GET /qorechain/pqc/v1/account/{address}` et passez `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Elles appelaient un chemin `/accounts/` au pluriel ou l'espace de noms `qor_`, que les points de terminaison publics ne servent pas (HTTP 501, `-32601`). Lisez la route REST au singulier ci-dessus |
| `TxClient` / `bankSend` et les clients rollup, multilayer et cross-VM signaient en classique uniquement | Les réseaux le refusent pour tout compte qui possède une clé. Envoyez via `signAndBroadcastHybrid` |
| Les transactions échouées dans un bloc perdaient leur codespace | Lisez la transaction depuis `GET /cosmos/tx/v1beta1/txs/{hash}` |
| La constante `VERSION` exportée de la 0.8.3 indiquait `0.8.0` | Lisez la version installée depuis `package.json` |
| `create-qorechain-dapp` 0.8.0 épinglait `@qorechain/sdk` / `@qorechain/evm` sur `^0.3.0` (un caret sur une version 0.x reste dans la 0.3) | Exécutez `npm i @qorechain/sdk@latest` après la génération |
| `@qorechain/react` 0.8.x laissait l'état de la clé enregistrée illisible sur les points de terminaison publics | Utilisez `@qorechain/react` 0.9.0 ou ultérieur |

:::caution Anciens correctifs
Le SDK **0.6.1** a corrigé un bogue critique pour le consensus : l'extension de corps de tx
`/qorechain.pqc.v1.PQCHybridSignature` était sérialisée en JSON
dans `Any.value` et **rejetée par la chaîne au CheckTx**. Les transactions hybrides (PQC +
classique) construites avec le SDK ≤ 0.6.0 sont rejetées sur la chaîne. La **0.8.0**
a supprimé les assistants de compte à signature de portefeuille (voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Le paquet principal :

```bash
npm i @qorechain/sdk
```

Il cible Node.js 20+ et fournit ESM, CommonJS et des définitions de types. Les
exemples de transactions hybrides de cette documentation importent aussi `StargateClient` depuis
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adaptateur EVM

`@qorechain/evm` est un adaptateur fin et typé au-dessus de [viem](https://viem.sh).
viem est une **dépendance de type pair** — installez-la avec :

```bash
npm i @qorechain/evm viem
```

Publié sur npm en `0.14.0`. Il exporte les chaînes viem `qorechain` (chain id 9801) et `qorechainTestnet` (9800) et les assistants de la [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window).

### Adaptateur SVM

`@qorechain/svm` est un adaptateur fin au-dessus de
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), qui est une
**dépendance de type pair** :

```bash
npm i @qorechain/svm @solana/web3.js
```

Publié sur npm en `0.14.0`.

### Kit React

`@qorechain/react` est la couche React officielle au-dessus de `@qorechain/sdk` — un
fournisseur, des hooks et les composants `ConnectButton` / `PqcStatusBadge`.
`react` (>=18) est une dépendance de type pair :

```bash
npm i @qorechain/react
```

Publié sur npm en `0.14.0` ; il dépend de `@qorechain/sdk` `^0.14.0`. Voir le [guide du kit React](/sdk/guides/react).

### Générateur de projet

`create-qorechain-dapp` (npm, `0.14.0`) génère une dApp prête à l'emploi :

```bash
npm create qorechain-dapp@latest my-dapp
```

Les fichiers `package.json` générés dépendent de la version du SDK avec laquelle le générateur
est livré (`@qorechain/sdk` `^0.14.0` ; les modèles EVM utilisent `@qorechain/evm` `^0.14.0`). La version 0.13.1 ne changeait que les modèles et la 0.14.0 reprend ces correctifs ; voir [Générateurs de projet et CLI](/developer-tools/scaffolders-and-cli#template-fixes-0131). Il a aussi des modèles `foundry`, `hardhat`, `viem-wagmi` et `cosmwasm` pour le travail sur les contrats.
La version 0.8.0 du générateur écrivait des plages `^0.3.0`, qui, sur une version 0.x, restent
dans la 0.3 et ne peuvent pas signer pour les réseaux en production ; si vous avez généré avec la 0.8.0, exécutez
`npm i @qorechain/sdk@latest`. Voir la [référence de la CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Nécessite Python 3.10+. Le paquet fournit des annotations de types et un marqueur `py.typed`.

> La distribution s'installe sous le nom `qorechain-sdk` (publiée sur PyPI en `0.14.0`)
> mais **s'importe sous le nom `qorsdk`** :
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Nécessite Go 1.23+. Importez les sous-paquets dont vous avez besoin, par exemple :

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publié comme module Go autonome (étiqueté `packages/go/v0.14.0`). Épinglez la version
explicitement : `go get github.com/qorechain/qorechain-sdk/packages/go@v0.14.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Ou, pour suivre la tête du dépôt :

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Nécessite Rust 1.74+. Les clients de lecture sont asynchrones (Tokio). La crate s'importe sous le nom
`qorechain` (`use qorechain;`).

> Publié sur crates.io sous le nom `qorechain-sdk` (0.14.0) ; `cargo add qorechain-sdk`
> installe la dernière version publiée.

## Java

Maven (`pom.xml`) :

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.14.0</version>
</dependency>
```

Ou Gradle :

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.14.0'
```

> Publié sur Maven Central sous `io.github.qorechain:qorechain-sdk` (la 0.14.0 est la version actuelle). Elle exige JDK 17 ou ultérieur. Central n'a aucune version 0.8.0 ni
> 0.8.1, donc sur les réseaux en production utilisez la 0.8.2 ou une version ultérieure. La 0.9.1 était une
> version Java uniquement qui a fait passer Bouncy Castle de la 1.80 à la 1.85, sans changement d'API.

## Paquets associés {#related-packages}

| Paquet | Rôle | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Assistants côté portefeuille : génération de portefeuille (`generateQoreWallet`), signature hybride `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), enregistrement du réseau MetaMask (`addQoreEvmToWallet`), constructeurs de messages d'authenticator et de fenêtre EVM (son `openEvmWindowMsg` ne construit que la forme sans restriction), le condensat de compte abstrait v2. Il ne joint pas de preuve de possession. Dépendances de type pair : `@cosmjs/proto-signing` et `@cosmjs/stargate` `^0.32` (le SDK utilise cosmjs 0.39 ; installer les deux dans un même projet fait donc signaler un conflit de dépendances de type pair par npm, `ERESOLVE` ; gardez-les dans des projets séparés ou passez `--legacy-peer-deps`) | 0.5.0 |
| `@qorechain/chain-bridge` | Worker côté serveur pour les backends : dérive la clé PQC, signe en hybride et diffuse (`sendTokens`, `registerPqc`, et plus). Passez `cosmosRest` : avec lui, un enregistrement porte la preuve de possession dès que le réseau a appliqué la v3.2.3, et un refus d'apparence PQC est vérifié auprès de la chaîne avant tout nouvel enregistrement (une clé enregistrée différente lève `pqc_key_mismatch` au lieu de payer un second enregistrement) | 0.2.3 |
| `@qorechain/pqc` | Primitives ML-DSA / ML-KEM / SHAKE-256 conformes aux standards uniquement et `hybridSignBytes` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)) ; également sur PyPI, crates.io, Maven Central et le proxy Go (Go `v0.2.3`) à la même version | 0.2.3 |
| `@qorechain/handles` | Résolution vérifiée des `@handle` (`HandleClient`) : vous fournissez la clé publique du registre et un magasin d'épinglage, et vous épinglez après que l'utilisateur a vu l'adresse ; le paquet n'épingle jamais de lui-même. Voir [Chain bridge et handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Déprécié sur npm et plus maintenu ; ne l'utilisez pas pour du nouveau travail. Utilisez plutôt [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) (les remplaçants pour la connexion à QoreX se trouvent dans la [vue d'ensemble des outils pour développeurs](/developer-tools/overview#group-connect)).** Un connecteur unique pour les portefeuilles EVM, Cosmos et SVM, construit sur l'adaptateur de portefeuille (sa plage de pairs est `@qorechain/wallet-adapter` `^0.2.1`, qui n'inclut pas la 0.5.0). Il n'ouvre pas de [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window) : un envoi EVM via ce paquet est donc refusé tant que le compte n'a pas de clé enregistrée ni de fenêtre ouverte | 0.2.1 |
| `@qorechain/rdk` | Client du Rollup Development Kit (voir [Rollups](/rollups/why)). À partir de la 0.7.0, il dépend de `@qorechain/sdk` `^0.10.0` et de `@qorechain/evm` `^0.8.0` (vérifié sur npm, 4 novembre 2026). Un caret sur une version 0.x reste dans cette mineure : une application sur le SDK 0.13.0 reçoit donc pour le kit une seconde copie imbriquée du SDK 0.10.x ; gardez les deux séparées (ne passez pas un client d'une copie à l'autre) jusqu'à ce qu'une version du kit passe à la 0.13. Ne signe en mode hybride que lorsque vous passez une `pqcKeypair` ; les lectures fonctionnent sans elle. Également publié sous le nom `qorechain-rdk` sur PyPI, crates.io et Maven Central, et comme module Go (épinglez `@v0.8.0`) ; à partir de la 0.8.0, ces quatre clients signent eux aussi en mode hybride (les versions antérieures signaient en classique uniquement ; Java exige Java 21). Voir [RDK 0.8.0 : changements et limites](/rollups/deploying-a-rollup#rdk-050-limits) | 0.8.0 |
| `@qorechain/rdk-cli` | La CLI opérateur `qorollup` pour le RDK. Depuis la 0.7.1, ses commandes de transaction (`create`, `pause`, `resume`, `stop`, `withdraw`) signent en mode hybride (la 0.7.0 et les versions antérieures signaient en classique uniquement et étaient refusées par les réseaux) ; installée depuis npm, elle s'exécute et `--version` affiche la version installée (la 0.6.1 et les versions antérieures n'affichaient rien) | 0.8.0 |
| `@qorechain/qoreseal` | QoreSeal : chiffre une charge utile vers les clés ML-KEM-1024 que les comptes publient dans le registre KEM (le SDK 0.12.0 et les suivants enregistrent et lisent les clés ; QoreSeal effectue le chiffrement). Également sur PyPI (`qorechain-qoreseal` ; wheels macOS et Linux, wheel Windows dans la prochaine version), crates.io, Maven Central (`io.github.qorechain:qoreseal` et `qoreseal-android` ; les consommateurs Kotlin ont besoin de Kotlin 2.3 ou ultérieur), le proxy de modules Go (`github.com/qorechain/qoreseal/go`, Go `v0.1.0`) et comme paquet Swift. Voir [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit : outillage pour les jetons d'actifs réels à permissions sur l'EVM Engine, avec des clients en TypeScript, Python, Java et Go et des contrats Solidity (`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0, sauf les scripts et tests ERC-3643 (GPL-3.0-or-later). Les modules natifs qu'il décrit sont une proposition, pas construits. Également `qorechain-asset-kit` sur PyPI et `io.github.qorechain:asset-kit` sur Maven Central. Voir [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign : signature pour portefeuille et backend, et `inspectTransaction` pour vérifier la couche post-quantique d'une transaction validée. Également sur PyPI, crates.io et Maven Central. Voir [QoreSign](/qoresign/overview) | 0.2.0 |
| `create-qorechain-rollup` | Générateur de projets rollup ; ses modèles dépendent de `@qorechain/rdk` `^0.8.0` et signent en mode hybride lorsqu'ils peuvent résoudre votre clé post-quantique à partir de `QORE_MNEMONIC` ou `QORE_PQC_SEED_HEX` | 0.8.0 |

## Étape suivante

Poursuivez avec le [Démarrage rapide](/sdk/quickstart) pour vous connecter et lire l'état de la chaîne.
