---
slug: /developer-tools/custody-kit
title: Custody Kit QoreChain
sidebar_label: Custody Kit
sidebar_position: 32
---

# Custody kit QoreChain

Le custody kit QoreChain est un guide d'intégration rédigé, un ensemble de vecteurs de test et un petit code de référence destinés aux dépositaires et aux plateformes d'échange qui conservent des fonds de clients sur QoreChain. Il explique ce que le réseau exige sur chaque voie d'exécution, et il montre, dans du code lisible, les parties d'une intégration où l'on se trompe facilement : vérifier une adresse, décoder et vérifier une transaction signée avant sa diffusion, et décider quels transferts entrants créditer.

Il s'adresse aux dépositaires, aux plateformes d'échange, aux processeurs de paiement et aux backends de portefeuilles, ainsi qu'aux ingénieurs et auditeurs qui examinent ces intégrations. Version **0.1.0**, publiée le 27 octobre 2026, Apache-2.0. Il fonctionne avec le mainnet (`qorechain-vladi`) et le testnet (`qorechain-diana`) ; les vérifications en direct livrées avec lui s'exécutent sur le testnet et sont en lecture seule.

**À lire d'abord : le kit est du code d'exemple, pas une bibliothèque.** Vous clonez le dépôt et vous lisez, copiez ou intégrez le dossier de votre langage. Il n'existe pas de package du kit sur npm, PyPI, crates.io ni Maven Central, par conception. L'unique exception de forme est Go : le dossier Go est un module Go avec une version taguée, donc `go get` peut le récupérer, mais cela reste du code d'exemple sans promesse d'API stable (voir [Ce qui est une bibliothèque et ce qui est du code d'exemple](#library-vs-example)). La signature et la vérification cryptographique proviennent de [QoreSign](/qoresign/overview), qui est une bibliothèque publiée.

## Innovations {#innovations}

- **Un seul comportement dans cinq langages, prouvé par un seul fichier.** TypeScript, Python, Go, Rust et Java implémentent les mêmes quatre fonctions avec les mêmes résultats et les mêmes codes d'erreur. Chaque langage s'exécute sur le fichier de vecteurs de test partagé `vectors/custody-v1.json`, de sorte qu'une équipe qui porte le kit vers un autre langage peut prouver qu'il correspond.
- **Codes d'erreur stables pour les adresses.** `validateAddress` ne lève jamais d'exception. Il renvoie les deux écritures de l'adresse en cas de succès, ou l'un de onze codes stables (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`) afin qu'un formulaire de retrait puisse afficher la raison exacte.
- **Vérification des deux signatures avant diffusion.** `verifyTx` vérifie la signature secp256k1 sur le `SignDoc`, la couche ML-DSA-87 par rapport à une clé que vous fournissez, et si la clé publique contenue dans la transaction est celle que vous attendez. Il renvoie `{ valid, classical, signerKey, pq }` et ne lève une exception que sur une entrée mal formée, jamais sur une mauvaise signature. Un second processus peut l'exécuter sur chaque retrait signé avant que quoi que ce soit ne soit envoyé.
- **Des décisions de dépôt accompagnées d'une raison.** `extractDeposits` renvoie chaque transfert entrant d'une transaction avec un indicateur `creditable` et une `reason` (`evm_failed`, `fee_refund`, `unsupported_message` ou `null`). Il couvre le cas qui surprend les intégrateurs EVM : une exécution EVM échouée renvoie quand même le code de résultat 0 au niveau natif.
- **Un constructeur de requêtes qui correspond au nœud.** `buildDepositQuery` produit le chemin REST exact, encodé en pourcentage, des transferts entrants vers une adresse (limite de 1 à 100, bornes de hauteur, ordre croissant), et convertit une entrée `0x` en forme `qor1`.
- **Un guide rédigé voie par voie.** Le guide couvre la voie native, la voie EVM avec ses fenêtres d'autorisation, et indique que la voie SVM n'est pas ouverte aux transactions : aucun flux de dépôt ni de retrait ne doit donc être construit dessus.

## Cas d'usage {#use-cases}

1. **Scanner de dépôts pour une plateforme d'échange.** Conservez un curseur de hauteur, appelez `buildDepositQuery({ address, minHeight, maxHeight })` sur votre propre nœud, puis `extractDeposits(txResponse, address)` pour créditer les `MsgSend`, `MsgMultiSend` et transferts EVM réussis en `uqor`. Les exécutions EVM échouées, les remboursements de gas et les autres messages sont exclus ou signalés pour revue.
2. **Pipeline de retrait avec un second approbateur.** Une fois que le signataire a produit un retrait signé en hybride, un processus indépendant exécute `decodeTx` (destinataire, montant, frais, mémo) et `verifyTx` (les deux signatures, les clés attendues) avant la diffusion de la transaction.
3. **Saisie des adresses.** Validez chaque adresse de retrait fournie par un utilisateur avec `validateAddress`, refusez les adresses `qorvaloper` comme destinations de paiement, et exigez éventuellement des sommes de contrôle EIP-55 pour les entrées hexadécimales.
4. **Planification HSM.** Une équipe de sécurité utilise le guide de gestion des clés pour choisir entre des clés ML-DSA-87 générées par HSM et la dérivation canonique à partir d'un mnémonique, pour vérifier la prise en charge de PKCS #11 v3.2 pour une signature ML-DSA-87 pure avec un contexte vide, et pour concevoir la rotation et les sauvegardes.
5. **Voie de paiement EVM.** Une plateforme d'échange qui paie sur la voie EVM enregistre une seule fois la clé ML-DSA-87, ouvre une fenêtre d'autorisation restreinte par lot avec une transaction hybride de la voie native, puis signe des transactions EIP-1559 ordinaires avec sa pile secp256k1 existante.
6. **Staking pour les clients.** Un dépositaire qui propose le staking suit le guide de staking (délégation, retrait de délégation, redélégation, récompenses, verrous de niveau de staking) et décode chaque message de staking avec `decodeTx` avant de signer.
7. **Portage vers un autre langage, ou audit.** Une équipe qui écrit sa propre implémentation l'exécute sur `vectors/custody-v1.json` pour montrer qu'elle correspond aux résultats et aux codes d'erreur de référence.
8. **Répétition avant le mainnet.** Une équipe d'intégration suit la répétition sur testnet (enregistrer la clé, envoi hybride, scan de dépôts, staking, fenêtre EVM, rotation de clé) et la liste de contrôle d'intégration.

## Comment ça fonctionne {#how-it-works}

### Ce que contient le kit {#contents}

| Partie | Ce que c'est |
|---|---|
| `docs/` | Dix pages de guide : signature par voie, adresses et dérivation, dépôts, retraits, staking, erreurs, gestion des clés, environnement de test, liste de contrôle d'intégration, FAQ. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Code de référence avec les mêmes quatre fonctions et une petite ligne de commande d'exemple par langage. |
| `vectors/custody-v1.json` | Vecteurs de test : une bonne et une mauvaise adresse par code d'erreur, un `MsgDelegate` signé en hybride, un `MsgOpenEVMWindow` signé en hybride depuis un compte eth-native, des messages de staking et de fenêtre, des transactions mal formées, des requêtes de dépôt et des cas d'extraction de dépôts. Les vecteurs QoreSign sont réutilisés par référence et vérifiés par SHA-256. |
| Vérifications en direct | Vérifications en lecture seule sur le testnet, activées avec `QORE_LIVE_TEST=1` : paramètres de staking, requête de dépôt pour un transfert récent et vérification d'une transaction hybride validée. |

### Ce qui est une bibliothèque et ce qui est du code d'exemple {#library-vs-example}

| Élément | Nature | Où l'obtenir |
|---|---|---|
| QoreSign (signature, vérification ML-DSA-87 et secp256k1, message d'enregistrement de clé) | Bibliothèque publiée | npm, PyPI, crates.io, Go, Maven Central. Voir [QoreSign](/qoresign/overview). |
| Le code du kit en TypeScript, Python, Rust et Java | Code d'exemple, absent de tous les registres | Clonez `qorechain/qorechain-custody-kit` et copiez ou intégrez le dossier. |
| Le code du kit en Go (package `custodykit`) | Code d'exemple. Récupérable comme module Go à une version taguée, sans promesse d'API stable | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, ou clonez et intégrez. |
| Les pages de guide, les vecteurs et la liste de contrôle | Documentation et données | Le dépôt. |

Le kit n'implémente aucun schéma de signature. La vérification ML-DSA-87 et secp256k1 provient de QoreSign. Le code Python contient un petit Keccak-256 utilisé pour la somme de contrôle EIP-55, et rien d'autre.

### Voies {#lanes}

| Voie | Ce qu'un dépositaire signe | Statut |
|---|---|---|
| Native (Cosmos SDK) | `SIGN_MODE_DIRECT` secp256k1 plus une couche ML-DSA-87 (FIPS 204). Un compte avec une clé enregistrée n'a pas de chemin classique ; un compte sans clé ne peut envoyer en classique que pour enregistrer sa clé (ou pour sortir de prison). | ouverte |
| EVM | Transactions Ethereum secp256k1 ordinaires (EIP-155 et EIP-1559), admises pour un expéditeur ayant une clé ML-DSA-87 enregistrée et une fenêtre d'autorisation active, ouverte par une transaction hybride de la voie native : une signature ML-DSA-87 par fenêtre. | ouverte |
| SVM | Sans objet | non ouverte aux transactions |

### Transactions hybrides de la voie native {#hybrid}

- Une transaction hybride est un `TxRaw` ordinaire signé deux fois par le même compte. La signature ML-DSA-87 voyage dans le corps sous forme d'option d'extension `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`, une signature de 4,627 octets, éventuellement la clé publique de 2,592 octets). La signature secp256k1 est la signature `SIGN_MODE_DIRECT` habituelle sur le corps final, extension comprise.
- La signature ML-DSA-87 couvre des sign-bytes qui excluent l'extension. Les deux réseaux publics vérifient les sign-bytes v2 (une chaîne de domaine, l'ID de chaîne, puis les octets du corps et de l'auth info). Les signatures FIPS 204 hedged et déterministes sont toutes deux acceptées. Le format normatif est la [spécification de signature hybride QoreSign](/qoresign/spec/hybrid-signing-v1).
- Ordre des opérations : encoder le corps et l'auth info (frais et gas fixés), calculer les sign-bytes v2, signer avec ML-DSA-87, ajouter l'extension, signer le `SignDoc` avec secp256k1, diffuser.
- Enregistrement de clé : `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, avec une preuve de possession facultative et recommandée), signé en classique depuis le compte sans clé, une fois par adresse chaude. QoreSign construit le message complet.
- Une transaction hybride pèse environ 4.7 Ko de plus qu'une transaction classique et consomme plus de gas ; simulez donc toujours.

### Adresses {#addresses}

- `qor1...` et `0x...` sont deux écritures des mêmes 20 octets. Les fonds envoyés à l'une ou l'autre arrivent dans le même solde. `qorvaloper1...` est une adresse d'opérateur de validateur et jamais une adresse de paiement.
- Il existe deux types de comptes : `secp256k1` (coin type 118, chemin `m/44'/118'/0'/0/i`) et eth-native `eth_secp256k1` (coin type 60, chemin `m/44'/60'/0'/0/i`). Le même mnémonique donne deux comptes différents. Les comptes eth-native permettent à une seule clé d'opérer à la fois la voie native et la voie EVM.
- La clé ML-DSA-87 peut provenir de la dérivation canonique (ce que les portefeuilles QoreChain et le SDK enregistrent, liée à l'adresse `qor1` et au mnémonique), d'une dérivation hiérarchique en brouillon, ou d'une clé aléatoire générée dans un HSM. Toute clé valide fonctionne une fois enregistrée. Voir [dérivation de clés](/qoresign/guides/key-derivation).

### Dépôts {#deposits}

- QoreChain finalise un bloc lorsqu'il est validé. Il n'y a pas de réorganisation : une transaction dans un bloc validé est donc définitive après un bloc. Des confirmations supplémentaires relèvent d'un choix opérationnel.
- Les dépôts de la voie native se trouvent avec `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. `buildDepositQuery` construit exactement ce chemin.
- Règles de crédit dans `extractDeposits` : une transaction avec `code != 0` n'a rien déplacé ; un `transfer` sans `msg_index` est le paiement des frais ; les montants sont filtrés par dénomination (`uqor` par défaut) ; les sorties de `MsgSend` et `MsgMultiSend` sont créditables ; `MsgEthereumTx` est créditable sauf si l'exécution EVM a échoué ou si le transfert est un remboursement de gas depuis le collecteur de frais ; tout le reste revient avec `reason: "unsupported_message"` pour revue.

### Retraits et gas {#withdrawals}

- Frais = ceil(limite de gas x prix du gas) en `uqor`. Le prix minimal du gas est de 0.1 uqor, facturé sur la limite de gas.
- Prenez la limite de gas à partir d'une simulation de la transaction entièrement signée. Sur les nœuds qui ont appliqué la mise à niveau v3.2.5 (le testnet maintenant, le mainnet une fois appliquée), utilisez `ceil(gas_used x 1.02) + 2000`, car la simulation inclut la vérification ML-DSA-87. Avant cela, utilisez `ceil((gas_used + 40000) x 1.4)`. Détectez laquelle s'applique avec `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`, pas d'après la date.
- Après avoir choisi la limite de gas, reconstruisez `AuthInfo` et signez à nouveau : les deux signatures couvrent les frais.
- Séquences : exécutez une file de signature par adresse chaude, ou plusieurs adresses chaudes pour des paiements en parallèle.

### Fenêtres d'autorisation EVM {#evm-windows}

- Une fenêtre est ouverte avec `/qorechain.pqc.v1.MsgOpenEVMWindow` (`blocks` de 1 à 17,280, `max_txs` de 1 à 1,000, `max_value` en `uqor` comptant la valeur plus les frais maximaux, `native_only` facultatif, `allowed_targets` facultatif jusqu'à 16 adresses) et fermée avec `MsgCloseEVMWindow`. L'état se lit à `GET /qorechain/pqc/v1/evm_window/{address}`.
- Ouvrir une fenêtre remplace toute fenêtre existante et fait avancer la séquence du compte, qui est son nonce EVM : ouvrez la fenêtre, puis lisez le nonce.
- `eth_call` et `eth_estimateGas` ne nécessitent aucune fenêtre.

## Comment l'utiliser {#how-to-use}

### Obtenir le code {#install}

Le kit est du code de référence : clonez le dépôt, ou intégrez le dossier de votre langage, plutôt que d'installer un package.

| Langage | Pour l'obtenir | Dépend de | Plateforme minimale |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, puis `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | clonez, puis `cd code/python && pip install -r requirements-dev.txt`. Pour `verify_tx`, faites aussi `pip install qorechain-qoresign==0.1.1` | rien à l'exécution ; `qorechain-qoresign` 0.1.1 (PyPI) pour `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (package `custodykit`), ou clonez | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | clonez, puis `cd code/rust && cargo build` (pas sur crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | édition Rust 2021 |
| Java | clonez, puis `cd code/java && mvn test` (pas sur Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign est publié pour chaque langage utilisé par le kit, Python compris. `verify_tx` dans le code Python nécessite `qorechain-qoresign` 0.1.1 depuis PyPI (macOS et Linux). Le code TypeScript, Go, Rust et Java épingle QoreSign 0.1.0, qui reste publié à côté de la 0.1.1.

### Quickstart {#quickstart}

Réseau cible : le testnet (`qorechain-diana`) pour tout ce qui lit la chaîne. La variable d'environnement `QORE_REST` pointe les exemples et les vérifications en direct vers un autre point de terminaison REST, qui en production est votre propre nœud. Les adresses ci-dessous proviennent de la phrase de test BIP-39 publique et ne doivent jamais contenir de fonds.

**1. Valider une adresse (Go, hors ligne).** Exécuté le 27 octobre 2026 depuis un clone du tag `v0.1.0` :

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

Il a affiché (code de sortie 0) :

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

Une adresse de validateur est refusée à moins de l'autoriser avec `--allow-validator` :

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

Il a affiché `"valid": false` avec `"error": "KIND_NOT_ALLOWED"` et le détail `a validator address is not accepted here`, et s'est terminé avec le code 1. La suite de tests Go (`go test ./...`) a aussi réussi sur le même checkout.

**2. Décoder et vérifier une transaction signée avant diffusion.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Ajoutez `--eth` pour un compte eth-native. Lisez le numéro de compte à `GET /cosmos/auth/v1beta1/account_info/{address}` et la clé ML-DSA-87 enregistrée à `GET /qorechain/pqc/v1/account/{address}`.

La même chose en TypeScript, depuis la ligne de commande d'exemple du kit (`code/ts/src/cli.ts`) :

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Scanner les dépôts (lectures sur le testnet).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

Exécuté le 27 octobre 2026 pour l'adresse de test publique sur les hauteurs de testnet 8976000 à 8983000, il a renvoyé une liste vide, ce qui est attendu pour une adresse qui n'a jamais rien reçu.

TypeScript (depuis `code/ts/src/cli.ts`) :

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (depuis `code/go/cmd/custody-kit/main.go`) :

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. Les autres langages.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Exécuter les vecteurs et les vérifications en direct.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Chaque langage a l'équivalent (`pnpm test`, `pytest`, `cargo test`, `mvn test`). Les vérifications en direct ne nécessitent aucun fonds. Seuls les commandes Go `validate` et `deposits` et la suite de tests Go ont été exécutées lors de la rédaction de cette page ; les autres langages sont décrits d'après le dépôt.

### Fonctions et commandes principales {#api}

| TypeScript | Go | Python et Rust | Java | Ce que ça fait |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | Renvoie `{ valid, kind, format, checksum, bech32, hex }` ou `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Messages, mémo, frais, signataires, couches ML-DSA-87 et hash de la transaction. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | Renvoie `{ valid, classical, signerKey, pq }`. Version des sign-bytes v1, v2 ou l'une ou l'autre. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | Chemin REST des transferts entrants. `event` vaut `transfer` (par défaut) ou `coin_received` ; `limit` de 1 à 100, 50 par défaut ; ordre croissant par défaut. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | Entrées de dépôt avec `creditable` et `reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Assistants. |

Sont aussi exportées : les constantes `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` et `DEFAULT_TESTNET_REST`.

Ligne de commande d'exemple dans chaque langage :

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Codes d'erreur, identiques dans chaque langage :

- Kit : `MALFORMED_TX` (les octets ne forment pas une transaction bien formée), `UNKNOWN_FIELD` (un champ que le décodeur ne connaît pas, que le réseau refuserait aussi), `INVALID_ARGUMENT`.
- `validateAddress` : les onze codes listés sous [Innovations](#innovations).

Les refus de la chaîne que rencontre le plus souvent un dépositaire, sous forme de codespace et de code (le tableau complet se trouve dans `docs/errors.md` du kit) :

| Codespace | Codes |
|---|---|
| `sdk` | 3 séquence incorrecte, 4 non autorisé, 5 fonds insuffisants, 11 à court de gas, 12 mémo trop grand, 13 frais insuffisants, 19 déjà dans le mempool |
| `pqc` | 20 signature hybride requise, 21 échec de la vérification hybride, 7 clé déjà enregistrée, 26 pas de fenêtre EVM (ou pas de clé enregistrée), 27 fenêtre épuisée ou hors périmètre, 28 paramètres de fenêtre invalides |
| `stakingtier` | 13 le stake est verrouillé |

Raisonnez sur le codespace et le code ensemble, et conservez le log brut.

## Comment y accéder {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| ID de chaîne | `qorechain-vladi` | `qorechain-diana` |
| ID de chaîne EVM | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Version du nœud | v3.2.4 (v3.2.5 pas encore appliquée) | v3.2.6 (v3.2.5 appliquée) |

- La dénomination est `uqor` (1 QOR = 10^6 uqor ; sur la voie EVM, 1 uqor = 10^12 wei). Le prix minimal du gas est de 0.1 uqor, la période de unbonding est de 21 jours et la limite du mémo est de 256 caractères. Ces valeurs ont été lues sur les deux réseaux le 27 octobre 2026 et peuvent changer par gouvernance ; lisez-les donc depuis la chaîne en production.
- Les dépôts ne nécessitent ni clés ni enregistrement. L'envoi nécessite une clé ML-DSA-87 enregistrée par adresse chaude.
- Exécutez vos propres nœuds complets en production. Les points de terminaison publics sont limités en débit et destinés au développement. Si un script obtient `403 Forbidden`, définissez un en-tête `User-Agent` explicite. Voir [exécuter un nœud](/developer-guide/running-a-node) et [se connecter au mainnet](/getting-started/connecting-to-mainnet).
- Le testnet reçoit chaque version de nœud avant le mainnet. Changez de règles de gas en vérifiant la mise à niveau appliquée, pas la date.
- Les jetons de test sur le testnet (dénominations bank de la forme `erc20:0x...`, un jeton IBC) n'existent pas sur le mainnet. Créditez `uqor` sur les deux réseaux.
- Les QOR de testnet proviennent du faucet du dashboard QoreChain et n'ont aucune valeur. Voir [se connecter au testnet](/getting-started/connecting-to-testnet).

## Notes de sécurité {#security}

- Les deux clés d'une adresse chaude (secp256k1 et ML-DSA-87) signent chaque transaction de la voie native. Gardez-les dans le même périmètre de conservation, sous le même quorum et la même piste d'audit.
- Sauvegardez la graine ML-DSA-87 de 32 octets (clés logicielles) ou utilisez la sauvegarde de clé du HSM. Un compte avec une clé enregistrée n'a pas de chemin classique : perdre la clé ML-DSA-87 signifie que le compte ne peut plus signer. Testez la restauration sur le testnet avec `verifyTx`.
- Les HSM doivent prendre en charge la signature ML-DSA-87 pure (`CKM_ML_DSA` dans PKCS #11 v3.2) sur les sign-bytes avec un contexte vide. `HashML-DSA` n'est pas accepté.
- Exécutez `decodeTx` et `verifyTx` sur chaque transaction signée avant diffusion, dans un processus qui ne l'a pas construite.
- La rotation utilise `MsgRotatePQCKey` : les deux clés signent, la couche propre à la transaction utilise la clé actuelle, et la réutilisation d'une clé antérieure est refusée. Si la clé secp256k1 est exposée, déplacez les fonds vers une nouvelle adresse avec deux clés neuves et fermez toute fenêtre EVM ouverte.
- Fenêtres EVM : utilisez `native_only` ou `allowed_targets`, le plus petit `max_value` et le plus petit `blocks` qui couvrent le lot, et fermez la fenêtre après le lot. Traitez `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` et `MsgAuthorizeEVMDelegation` comme des opérations privilégiées.
- Ne créditez jamais une transaction EVM dont l'événement `ethereum_tx` signale un échec, même si son résultat natif est `code == 0`.
- Ceci est du code de référence en version 0.1.0. Relisez-le avant de l'utiliser en production. Signalez les vulnérabilités en privé à security@qore.network, y compris les erreurs de documentation pouvant conduire à un crédit erroné ou à une signature non voulue.

## Où c'est publié {#where-published}

Vérifié auprès des registres le 27 octobre 2026.

| Registre | Package | Version | Lien |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (les cinq langages, pages de guide, vecteurs) | release `v0.1.0`, publiée le 27 octobre 2026 | https://github.com/qorechain/qorechain-custody-kit |
| Proxy de modules Go | `github.com/qorechain/qorechain-custody-kit/code/go` (code d'exemple, récupérable) | v0.1.0 (tag `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | non publié : le kit est du code d'exemple à copier ou à intégrer | sans objet | sans objet |

La release GitHub n'a aucun fichier joint ; la release est le tag du dépôt. Dépendances sur lesquelles repose le kit, toutes publiées : `@qorechain/qoresign` sur npm (dernière 0.1.1, le kit épingle la 0.1.0), `qorechain-qoresign` sur PyPI (0.1.1), `qorechain-qoresign` sur crates.io (dernière 0.1.1, le kit épingle la 0.1.0), `github.com/qorechain/qoresign/go` (v0.1.0 et v0.1.1) et `io.github.qorechain:qoresign` sur Maven Central (0.1.0 et 0.1.1).

Licence Apache-2.0. Mainteneur : QoreChain Association.

## Limites et problèmes connus {#limits}

- Le kit ne détient pas de clés, ne signe pas de transactions, ne diffuse pas, et ne fournit pas de signature à seuil ni MPC. La signature est faite par QoreSign ou votre HSM. Il n'existe aujourd'hui aucun schéma à seuil standardisé pour ML-DSA ; le guide documente comment combiner une clé secp256k1 à seuil avec une clé ML-DSA-87 détenue séparément.
- Il ne fait aucune déclaration sur les processus internes d'un dépositaire. La liste de contrôle décrit uniquement les exigences du réseau.
- `validateAddress` accepte les adresses de 20 octets. Les adresses de module et de compte de contrat plus longues sont refusées, comme elles doivent l'être pour des adresses de dépôt et de paiement.
- `extractDeposits` crédite automatiquement `MsgSend`, `MsgMultiSend` et les `MsgEthereumTx` réussis. Les autres messages (retraits de récompenses, appels de contrats, transferts IBC) sont renvoyés pour revue, pas crédités.
- `verifyTx` vérifie les transactions à signataire unique.
- La voie SVM n'est pas ouverte aux transactions. Ne construisez pas de flux de dépôt ou de retrait dessus.
- Le code propre au kit est du code d'exemple en 0.1.0. Les noms de fonctions et les signatures peuvent changer entre les versions, et le tag du module Go ne promet pas d'API stable.
- Seuls les exemples Go et la suite de tests ont été exécutés lors de la rédaction de cette page. Les vérifications en direct et les vérifications de vecteurs dans les quatre autres langages n'ont pas été relancées.
- Le README Python du dépôt peut encore indiquer que `verify_tx` lève une erreur d'import tant que `qorechain-qoresign` 0.1.1 n'est pas sur PyPI. Cette version est publiée ; la note est donc obsolète.
- Le guide du kit cite des paramètres (chiffres de gas, valeurs des niveaux de staking) lus le 27 octobre 2026. Lisez-les depuis la chaîne en production.

## Pages liées {#related}

- [QoreSign](/qoresign/overview) : signature hybride, vérification, le message d'enregistrement de clé et les assistants de gas `suggestGasLimit` et `simulateTx`.
- [SDK QoreChain](/sdk/overview) : décodage des erreurs avec `decodeTxError`, les compositeurs de fenêtre EVM et le classificateur de refus.
- [Signature post-quantique](/developer-guide/post-quantum-signing) : signatures hybrides, sign-bytes v2 et enregistrement de clé.
- [Guide pour les plateformes d'échange et les intégrateurs](/developer-guide/exchange-integration) : choisir entre les chemins natif, EVM et SVM.
- [Précompilés EVM](/developer-guide/evm-precompiles) et la voie EVM.
- [Staking et délégation](/user-guide/staking-and-delegation).
- [Exécuter un nœud](/developer-guide/running-a-node) et [se connecter au mainnet](/getting-started/connecting-to-mainnet).
- [Serveur MCP QoreChain](/developer-tools/mcp) : `get_pq_status` et `simulate_tx` pour des vérifications rapides.
- [QoreScan](/developer-tools/qorescan) : inventoriez la cryptographie de votre nœud, de vos points de terminaison et de vos comptes.
