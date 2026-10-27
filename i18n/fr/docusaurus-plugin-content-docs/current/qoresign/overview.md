---
slug: /qoresign/overview
title: Présentation de QoreSign
sidebar_label: Présentation
sidebar_position: 1
---

# QoreSign

QoreSign est une bibliothèque open source de signature hybride secp256k1 + ML-DSA-87 (FIPS 204) sur QoreChain, destinée aux portefeuilles, aux plateformes d'échange, aux dépositaires et aux backends.

QoreSign permet à un portefeuille autre que celui de QoreChain de dériver la clé ML-DSA-87 d'un compte, de signer des transactions de la voie native avec les deux clés, de vérifier localement des signatures hybrides, de signer des messages arbitraires, de simuler une transaction avant de la signer, de relire comment une transaction validée a été protégée et d'implémenter Sign In With QoreChain. C'est une couche mince au-dessus des bindings [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) et elle n'ajoute aucune primitive cryptographique qui lui soit propre. Elle est maintenue par la QoreChain Association sous licence Apache-2.0.

La version actuelle est la **0.1.1** (27 octobre 2026). Elle est publiée en TypeScript, Rust, Go, Kotlin (JVM et Android), Swift et, nouveauté de la 0.1.1, Python. Le code source, les exemples et les vecteurs de test se trouvent dans le dépôt [qorechain/qoresign](https://github.com/qorechain/qoresign). Elle fonctionne sur le mainnet (`qorechain-vladi`) et sur le testnet (`qorechain-diana`).

## Ce que QoreSign fait sur chaque voie {#lanes}

| Voie | Ce que QoreSign fait aujourd'hui |
|---|---|
| **Native** (Cosmos SDK) | Signature et vérification hybrides. Le réseau exige par défaut la signature ML-DSA-87. |
| **EVM** | Fenêtre d'autorisation uniquement : le compte enregistre une clé ML-DSA-87 et ouvre, depuis la voie native, une fenêtre d'autorisation bornée. Les transactions Ethereum elles-mêmes ne portent aucune signature ML-DSA-87. |
| **SVM** | Pas encore ouverte sur le réseau (`LANE_NOT_AVAILABLE`). |

La signature EVM hybride nécessite d'abord une prise en charge PQC par voie côté réseau. Voir [Portefeuilles EVM : fenêtre d'autorisation](/qoresign/guides/evm-quantum-ready).

## Ce qu'elle fait {#what-it-does}

Un cœur hors ligne, identique dans tous les langages :

- Dérive la clé classique sur `m/44'/118'/0'/0/0` (`deriveClassicalKey`) et la clé ML-DSA-87 canonique que les portefeuilles QoreChain enregistrent pour un compte (`deriveCanonicalPqKey`, liée à la phrase mnémonique et à l'adresse). Une dérivation HD durcie existe sous forme de brouillon (`deriveHdPqKey`) ; `pqKeyFromSeed` reconstruit une paire de clés à partir de sa graine de 32 octets.
- Construit et analyse les adresses `qor1` pour les comptes `secp256k1` et `eth_secp256k1`.
- Signe une transaction de la voie native avec les deux clés (`signHybrid`), ou ajoute uniquement la couche ML-DSA-87 à un corps construit par une dApp (`signPqLayer`). Les signatures ML-DSA-87 sont déterministes par défaut ; la signature « hedged » est une option, et le réseau accepte les deux. secp256k1 utilise RFC 6979 avec low-S.
- Calcule les sign-bytes hybrides v1 et v2 (`hybridSignBytes`) et vérifie une transaction hybride complète (`verifyHybridTx`) ou la seule couche ML-DSA-87 (`verifyPqLayer`).
- Construit `MsgRegisterPQCKeyV2` avec une preuve de possession (`buildRegisterPqKeyMessage`, `signProofOfPossession`) et refuse les clés publiques dégénérées.
- Signe et vérifie des messages arbitraires (`signMessage`, `verifyMessage`) et implémente Sign In With QoreChain v1 (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Applique les règles des voies dans le code (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Les erreurs portent un code stable commun à tous les langages (`QoreSignError`, par exemple `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Utilitaires réseau (TypeScript `@qorechain/qoresign/network` ; Go `github.com/qorechain/qoresign/go/network` les propose tous sauf les deux nouveaux) :

- `fetchPqKeyStatus` : une clé ML-DSA-87 est-elle enregistrée pour une adresse, et laquelle.
- `resolveSignBytesVersion` : quelle forme de sign-bytes le réseau vérifie.
- `simulateTx` (gas utilisé, limite de gas suggérée, variations de solde par adresse), `suggestGasLimit`, `broadcastTx` et `submitWithSignBytesFallback` (une nouvelle tentative avec l'autre forme de sign-bytes lorsque le réseau refuse la première).
- `assertPqLayerMatchesRegisteredKey` : vérifie une couche fournie par une dApp par rapport à la clé enregistrée sur la chaîne avant que le portefeuille n'ajoute sa signature classique.
- `verifySiwqWithChain` et `verifyMessageWithChain` : vérification par rapport à la clé enregistrée sur la chaîne.
- `fetchCommittedExtensionTypeUrls` : relit les extensions qu'une transaction validée portait.
- Nouveauté de la 0.1.1, TypeScript uniquement : `inspectTransaction` et `fetchEvmWindow`, décrites ci-dessous.

## Nouveautés de la 0.1.1 {#new-in-0-1-1}

- **Python.** Le paquet `qorechain-qoresign` (import `qoresign`) est sur PyPI, avec des wheels pour macOS et Linux. Il s'appuie sur l'implémentation Rust et reproduit les mêmes vecteurs de test. Il fonctionne hors ligne, comme les bindings Swift et Kotlin : pas d'utilitaires réseau.
- **Inspecteur de transactions (bibliothèque).** `inspectTransaction` lit une transaction validée et indique comment elle a été protégée. Voir [Inspecteur de transactions](#inspector).
- **Lecteur de fenêtre EVM.** `fetchEvmWindow` lit la fenêtre d'autorisation EVM d'un compte.
- **Correctifs de packaging.** L'archive du framework binaire Swift ne contient plus de dossier de resource fork parasite, et les bibliothèques natives macOS des paquets Kotlin et Python n'enregistrent plus le répertoire de compilation comme nom d'installation.

## Inspecteur de transactions {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` est une fonction en lecture seule de `@qorechain/qoresign/network`. Elle récupère une transaction validée et renvoie :

- les messages, le mémo, le code de résultat, la hauteur et les frais ;
- le signataire : adresse, type de clé, clé publique et séquence ;
- si la signature classique est valide ;
- l'état de la couche ML-DSA-87 : présente ou non, combien de couches, si la couche est valide par rapport à la clé que le signataire a enregistrée à présent, et quelle forme de sign-bytes elle a utilisée ;
- un niveau de sécurité, avec la même classification que l'explorateur public : `pqc` (porte la couche ML-DSA-87), `enrollment` (enregistre ou fait pivoter une clé ML-DSA-87, ce qui est signé par conception avec la clé classique), `shake` (une transaction de la voie native sans la couche) ou `classical` (une transaction de la voie EVM).

Elle renvoie `undefined` pour un hash que le réseau ne connaît pas. Passez un endpoint `rpc` pour lire les octets exacts validés auprès d'un nœud ; sans lui, la fonction utilise des octets que la passerelle REST ré-encode. Elle n'envoie rien et ne nécessite ni compte ni clé.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Enregistrez-le sous `inspect.mjs` et exécutez `node inspect.mjs <txhash>` avec un hash de transaction du testnet. Exécuté sur un transfert récent du faucet sur le testnet, il a affiché `ML-DSA-87 key registered: true`, le niveau `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, le message `/cosmos.bank.v1beta1.MsgSend`, et `EVM window: false false`.

`fetchEvmWindow({ rest, address })` renvoie `found`, `live`, les hauteurs d'ouverture et d'expiration, le maximum et l'utilisation de transactions et de valeur, les blocs, transactions et valeur restants, `nativeOnly` et `allowedTargets`.

Ceci est la fonction de la bibliothèque. La page [Développeurs](/dashboard/developers) du tableau de bord n'a pas encore d'onglet Inspecteur de transactions.

## À quoi elle sert {#use-cases}

1. **Un portefeuille compatible Keplr ajoute la signature hybride QoreChain.** Leap, Cosmostation ou un nouveau portefeuille produit la signature secp256k1 via `signDirect`. Avec QoreSign, il dérive la clé ML-DSA-87 du compte à partir de la même phrase mnémonique et ajoute la couche (`signPqLayer`) avant de signer. Voir [le guide pour portefeuilles](/qoresign/guides/keplr-compatible-wallets).
2. **Une plateforme d'échange ou un dépositaire signe les retraits sur ses propres serveurs.** Un service de portefeuille chaud ou tiède en Go ou en Rust signe des transferts de la voie native avec `signHybrid`, les simule d'abord (`simulateTx`, Go et TypeScript) pour voir les variations de solde et le gas, et les diffuse avec `submitWithSignBytesFallback`. Le [kit de custody](/developer-tools/custody-kit) s'appuie sur ceci.
3. **Un backend implémente Sign In With QoreChain.** Le serveur émet un nonce à usage unique, le portefeuille signe un message de connexion, et le serveur appelle `verifySiwqWithChain`. Voir [le guide de connexion](/qoresign/guides/sign-in).
4. **Un outil de conformité ou de support vérifie comment une transaction a été protégée.** `inspectTransaction` indique si une transaction validée portait une couche ML-DSA-87 vérifiée, quelle forme de sign-bytes elle a utilisée, et son niveau.
5. **Un portefeuille affiche la fenêtre d'autorisation d'un compte EVM.** Avant qu'un utilisateur n'envoie depuis un portefeuille EVM, `fetchEvmWindow` indique si une fenêtre est active et combien de transactions et quelle valeur il reste.
6. **Une équipe Python signe des rapports ou des approbations.** `qoresign.sign_message` produit une signature hybride sur des octets arbitraires que tout autre langage de QoreSign peut vérifier.
7. **Un portefeuille mobile sur iOS ou Android.** Le paquet Swift et l'AAR Android offrent la même dérivation, la même signature et la même connexion que le paquet TypeScript, octet pour octet.
8. **Des auditeurs et des intégrateurs vérifient les signatures hors ligne.** `verifyHybridTx`, `verifyPqLayer` et `verifyMessage` s'exécutent sans réseau, à partir des clés publiques.

## Comment ça fonctionne {#how-it-works}

- **Une transaction hybride** est un `TxRaw` Cosmos SDK ordinaire signé deux fois par le même compte : une signature ML-DSA-87 portée dans le corps de la transaction comme option d'extension `/qorechain.pqc.v1.PQCHybridSignature` (identifiant d'algorithme `1`), et une signature secp256k1 `SIGN_MODE_DIRECT` sur le corps final.
- **Les sign-bytes v2** (vérifiés aujourd'hui par les deux réseaux publics) sont `"qorechain-pqc-hybrid-v2"`, puis l'identifiant de chaîne, le corps sans l'extension PQC et l'auth info, chacun avec un préfixe de longueur. La signature ML-DSA-87 couvre donc les frais. La signature classique couvre le corps final, extension comprise. La v1 est conservée pour reproduire d'anciennes signatures. Voir [Signature de transactions hybride v1](/qoresign/spec/hybrid-signing-v1).
- **Ordre :** encoder le corps et l'auth info, calculer les sign-bytes et la signature ML-DSA-87, ajouter l'extension, puis signer le SignDoc avec secp256k1 et diffuser.
- **Enregistrement :** `MsgRegisterPQCKeyV2` porte la clé publique ML-DSA-87, la clé secp256k1 compressée du compte et une preuve de possession. La transaction d'enregistrement est signée avec la seule clé classique.
- **Séparation des domaines :** chaque signature ML-DSA-87 commence par un préfixe réservé, de sorte qu'une signature de message ou de connexion ne peut jamais être rejouée comme signature de transaction.
- **Ce qui est sur la chaîne :** la clé publique ML-DSA-87 enregistrée, les transactions hybrides et les fenêtres EVM. Les clés, la signature et la vérification se font sur l'appareil ou le serveur qui exécute QoreSign.
- **Vecteurs de test partagés :** les formats de transmission sont versionnés séparément des paquets et couverts par des [vecteurs de test](/qoresign/vectors) que chaque langage reproduit octet pour octet.

Tailles (FIPS 204 et le [guide des tailles](/qoresign/guides/sizes-and-transport)) : une clé publique ML-DSA-87 fait 2 592 octets, la clé secrète 4 896 octets, une signature 4 627 octets et la graine 32 octets. Une transaction hybride est environ 4,7 Ko plus grande qu'une transaction classique, il faut donc simuler avant de signer. Une signature ou une clé publique ne tient pas dans un seul code QR statique ; les signataires isolés du réseau (air-gapped) ont besoin d'un QR en plusieurs parties. Conservez la graine de 32 octets, pas la clé secrète.

## Paquets {#packages}

| Langage | Paquet | Installation | Plateforme minimale |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 ou ultérieur ; navigateurs |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (nom de bibliothèque `qoresign`) | `cargo add qorechain-qoresign` | Rust stable |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+ ; wheels pour macOS 11+ (arm64, x86_64) et Linux (x86_64, aarch64) ; pas encore de wheel Windows, les autres plateformes compilent à partir de la distribution source (nécessite Rust 1.95) |
| Swift | `QoreSign` depuis [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (framework binaire sur la release GitHub) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, produit `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 ou ultérieur ; bibliothèques natives pour macOS (arm64, x86-64), Linux (x86-64, arm64) et Windows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 ou ultérieur ; `arm64-v8a`, `armeabi-v7a`, `x86_64` ; règles de conservation R8 incluses |

:::note Version du compilateur Kotlin
Les artefacts Kotlin et Android nécessitent le compilateur **Kotlin 2.3 ou ultérieur** dans votre projet. Un projet sous Kotlin 2.1 échoue à la compilation avec eux. Montez la version de Kotlin du build avant d'ajouter la dépendance.
:::

Toutes les implémentations se vérifient elles-mêmes avec les mêmes [vecteurs de test](/qoresign/vectors).

## Exemple {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

Le [Démarrage rapide](/qoresign/quickstart) exécute le même flux de bout en bout, hors ligne, et propose les démarrages rapides de signature de message pour Python et Go.

## API principale {#main-api}

Les noms sont donnés sous leur forme TypeScript. Go utilise les mêmes noms avec la casse de Go (`SignHybrid`, `VerifySiwq`) ; Rust et Python utilisent le snake_case (`sign_hybrid`) ; Swift et Kotlin utilisent le camelCase au-dessus du cœur Rust.

| Nom | Ce qu'il fait | Où |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | clés à partir d'une phrase mnémonique, d'une graine ou d'octets bruts | tous |
| `deriveHdPqKey` | dérivation HD durcie de clés ML-DSA-87 (brouillon, peut changer) | tous |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | adresses `qor1` | tous |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | signature hybride et sign-bytes v1 ou v2 | tous |
| `verifyHybridTx`, `verifyPqLayer` | vérification locale | tous |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | enregistrement de clé avec preuve de possession | tous |
| `signMessage`, `verifyMessage` | signature de message arbitraire (ADR-36 plus ML-DSA-87) | tous |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | tous |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | règles des voies ; détection d'une couche supprimée | tous |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | utilitaires réseau | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | lire une transaction validée ; lire une fenêtre EVM (0.1.1) | TypeScript |

En Go, les utilitaires réseau sont des méthodes d'un client : `client := network.NewClient("https://api-testnet.qore.host")`, puis `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` ou `client.SimulateTx(...)`. En Python, les erreurs sont des `QoreSignError` avec `code` et `detail` ; les champs d'octets sont des `bytes`.

Référence de l'API : dans un clone du dépôt, exécutez `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) ou `go doc github.com/qorechain/qoresign/go` (Go). Les bindings Swift, Kotlin et Python reprennent l'API Rust ; voir les README [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) et [Python](https://github.com/qorechain/qoresign/tree/main/python).

## Réseaux et prérequis {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Identifiant de chaîne | `qorechain-vladi` (identifiant de chaîne EVM 9801) | `qorechain-diana` (identifiant de chaîne EVM 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Sign-bytes vérifiés | v2 | v2 |

- **Voie native :** le réseau exige par défaut la signature ML-DSA-87. Exemptés : l'enregistrement de la clé ML-DSA-87 d'un compte, et un unjail par un compte sans clé. Le compte doit avoir sa clé enregistrée (`MsgRegisterPQCKeyV2`) avant que les transactions hybrides ne soient vérifiées ; les portefeuilles QoreChain l'enregistrent à la création du compte.
- **Voie EVM :** un compte doté d'une clé ML-DSA-87 enregistrée ouvre une fenêtre d'autorisation bornée (hauteur d'expiration, nombre maximal de transactions, valeur maximale, contrats autorisés facultatifs) avec une transaction de la voie native signée en hybride. Hors d'une fenêtre active, le réseau refuse les transactions EVM du compte. Les lectures et l'estimation du gas ne nécessitent aucune fenêtre.
- **Frais :** dénomination `uqor` (6 décimales), prix minimal du gas de 0,1 uqor par gas.
- **Valeurs d'enregistrement Keplr :** préfixe bech32 `qor`, coin type `118`.
- **Comptes :** aucun pour les fonctions hors ligne. Les utilitaires réseau n'ont besoin que d'un endpoint REST ; la diffusion nécessite un compte approvisionné avec une clé ML-DSA-87 enregistrée.

## Documentation {#documentation}

- [Démarrage rapide](/qoresign/quickstart) : dérivez des clés, signez et vérifiez une transaction hybride en quelques minutes.
- Guides
  - [Ajouter la signature hybride à un portefeuille compatible Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain : vérification côté serveur](/qoresign/guides/sign-in)
  - [Portefeuilles EVM : fenêtre d'autorisation](/qoresign/guides/evm-quantum-ready)
  - [Dérivation de clés : clés canoniques et brouillon HD](/qoresign/guides/key-derivation)
  - [Tailles et transport](/qoresign/guides/sizes-and-transport)
- Spécifications
  - [Signature de transactions hybride v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Signature de messages v1](/qoresign/spec/message-signing-v1)
  - [Dérivation de clés ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vecteurs de test](/qoresign/vectors)
- [Exemples](https://github.com/qorechain/qoresign/tree/main/examples)

## Périmètre et limites {#scope}

- QoreSign signe localement. Il ne détient pas de clés pour vous, ne fait pas de signature à seuil ni de MPC, et ne signe pas sur des portefeuilles matériels.
- Il n'existe pas de signature EVM hybride : `assertHybridLane("evm")` lève `LANE_NOT_AVAILABLE`. Les comptes EVM utilisent à la place la fenêtre d'autorisation. Les transactions SVM ne sont pas ouvertes.
- Rust, Swift, Kotlin et Python n'ont pas de code réseau. La récupération des numéros de compte, la simulation et la diffusion restent dans votre application, ou utilisez les utilitaires TypeScript ou Go.
- `inspectTransaction` et `fetchEvmWindow` n'existent qu'en TypeScript. `inspectTransaction` vérifie la couche par rapport à la clé que le signataire a enregistrée à présent ; après une rotation de clé, une transaction plus ancienne renvoie donc `verified: false`.
- La dérivation canonique nécessite la phrase mnémonique. Les portefeuilles qui n'en disposent pas (clés détenues par du matériel) génèrent une clé aléatoire (`pqKeyFromSeed`) ou utilisent le brouillon HD, et enregistrent cette clé. La phrase mnémonique doit être sous forme canonique (minuscules, espaces simples) ; les autres graphies sont refusées, pas normalisées.
- La dérivation HD (`deriveHdPqKey`) est un brouillon et peut changer.
- Python n'a pas encore de wheel Windows. Kotlin et Android nécessitent le compilateur Kotlin 2.3 ou ultérieur.
- Les implémentations d'ML-DSA-87 et de secp256k1 proviennent de `qorechain-pqc` (construit sur `@noble/post-quantum`, `fips204` et Cloudflare CIRCL) ainsi que de `@noble/curves`, `k256` et `decred/secp256k1`.

## Notes de sécurité {#security}

- Les clés ne quittent jamais le processus qui exécute QoreSign. Rien n'est envoyé nulle part tant que vous n'appelez pas un utilitaire réseau, et ceux-ci n'envoient que des données publiques : adresses, octets de transaction signée et hashes.
- Montrez à l'utilisateur les messages et les frais tirés de `bodyBytes` et `authInfoBytes` avant de signer ; la signature ML-DSA-87 couvre les frais.
- Lorsqu'une dApp fournit un corps qui porte déjà une couche PQC, vérifiez-le avec `assertPqLayerMatchesRegisteredKey` avant d'ajouter la signature classique. Après la diffusion, `evaluateLayerState` avec `fetchCommittedExtensionTypeUrls`, ou `inspectTransaction`, confirme que la couche est arrivée sur la chaîne.
- Ne signez jamais d'octets bruts avec la clé ML-DSA-87 en dehors des domaines réservés.
- Les nonces de connexion sont à usage unique. `verifySiwq` refuse une connexion sans la partie ML-DSA-87 sauf si `requirePq: false` est passé ; n'acceptez des connexions uniquement classiques que si votre service n'a pas besoin de la garantie post-quantique.
- Conservez la graine ML-DSA-87 de 32 octets, chiffrée, plutôt que la clé secrète.
- Ne placez jamais une phrase mnémonique du mainnet dans un script ou dans l'historique du shell. Les exemples utilisent la phrase de test publique BIP-39 (`abandon` onze fois, puis `about`) ; ne l'approvisionnez jamais.
- Signalez les vulnérabilités en privé à security@qore.network, pas dans des issues publiques. Les correctifs de sécurité sont intégrés à la dernière version mineure.

## Où elle est publiée {#where-published}

Versions vérifiées sur les registres le 27 octobre 2026.

| Registre | Paquet | Version | Lien |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Proxy de modules Go | `github.com/qorechain/qoresign/go` | v0.1.1 (tag `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (wheels macOS arm64 et x86_64, Linux x86_64 et aarch64, distribution source) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` depuis `github.com/qorechain/qoresign` | 0.1.1 (binaire `QoreSignFFI.xcframework.zip` sur la release) | [Release GitHub](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

Dépôt : [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (releases v0.1.0 et v0.1.1).

## Pages associées {#related}

- [Primitives post-quantiques (`qorechain-pqc`)](/developer-tools/pqc-library) : les primitives ML-DSA-87 sous QoreSign.
- [SDK QoreChain](/sdk/overview) : composeurs de transactions, messages de fenêtre EVM et détection de fonctionnalités.
- [Wallet adapter](/developer-tools/wallet-adapter) : l'alternative côté dApp lorsqu'un portefeuille ne peut pas être modifié. La dApp détient la clé ML-DSA-87 et demande `signDirect` au portefeuille inchangé ; les octets sont les mêmes que ceux de QoreSign.
- [QoreSeal](/developer-tools/qoreseal) : chiffrement vers des comptes ; ses cartes de destinataire sont des signatures de message QoreSign.
- [Kit de custody](/developer-tools/custody-kit) : détection des dépôts et vérification des retraits construites sur QoreSign.
- [Serveur MCP QoreChain](/developer-tools/mcp) : son outil `get_pq_status` utilise QoreSign pour vérifier la couche hybride.
- [Signature post-quantique](/developer-guide/post-quantum-signing) et [Intégration pour plateformes d'échange](/developer-guide/exchange-integration).
- [Vue d'ensemble des paquets pour développeurs](/developer-tools/overview).

## Versionnage {#versioning}

QoreSign est en version pré-1.0 : les versions mineures peuvent modifier l'API, et chaque changement non rétrocompatible est listé dans le [journal des modifications](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). Les formats de transmission sont versionnés séparément (les spécifications `v1` et `vectors/qoresign-v1.json`) et ne changent pas au sein d'une version.

## Contribuer et sécurité {#contributing}

Voir [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Signalez les vulnérabilités en privé à security@qore.network, comme décrit dans [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licence {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright 2026 QoreChain Association.
