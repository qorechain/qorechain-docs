---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal est une bibliothèque open source qui chiffre des données à destination de comptes QoreChain avec ML-KEM-1024 (FIPS 203). Un compte publie sa clé publique ML-KEM-1024 sur la chaîne ; n'importe qui peut alors chiffrer une charge utile que ce compte, et tout autre destinataire ajouté par l'expéditeur, peut lire. Elle s'adresse aux développeurs de dApps qui ont besoin de charges utiles confidentielles (mémos, factures, documents, offres), aux auditeurs qui ont besoin d'un accès en lecture, et aux opérateurs de groupes privés et de sidechains. Elle compose des primitives standard et n'en implémente aucune elle-même. Version **0.1.0**, Apache-2.0, maintenue par la QoreChain Association.

Où elle en est au 30 octobre 2026 : le chiffrement lui-même fonctionne hors ligne partout, sans réseau ni compte. Chiffrer vers une adresse lue sur la chaîne nécessite le registre de clés KEM, qui est **en service sur le testnet** (`qorechain-diana`) et, depuis que le mainnet (`qorechain-vladi`) a appliqué la v3.2.5 le 29 octobre 2026, **dont la route de lecture répond aussi sur le mainnet** (aucun compte n'y avait publié de clé que cette page ait pu trouver). Le paquet est publié pour Rust, Go, Python, Swift, Kotlin/JVM et Android. Le paquet TypeScript `@qorechain/qoreseal` est **à venir** et n'est pas encore sur npm. La construction est un brouillon en attente d'une revue externe avant la 1.0.

QoreSeal protège le contenu d'une charge utile, rien d'autre. Les adresses, l'horodatage des transactions, les montants des transferts, la taille des enveloppes et le nombre de destinataires restent publics sur la chaîne. Ce n'est pas un moyen de rendre les transactions privées.

## Innovations {#innovations}

- **Une enveloppe, de 1 à 1 024 destinataires.** La charge utile est chiffrée une seule fois avec une clé de données AES-256-GCM aléatoire ; la clé de données est enveloppée séparément pour chaque destinataire, de sorte qu'ajouter un lecteur coûte environ 1,6 Ko, et non une nouvelle copie de la charge utile.
- **Hybride par défaut, jamais rétrogradé en silence.** En mode `hybrid`, chaque entrée de destinataire combine une encapsulation ML-KEM-1024 avec un accord X25519 au moyen d'un combinateur SHA3-256, de sorte que les données restent protégées tant que l'un des deux tient. Le mode `mlkem` (ML-KEM-1024 seul) doit être choisi explicitement ; la bibliothèque n'y revient jamais d'elle-même.
- **Liaison au contexte.** Chaque enveloppe est liée à un identifiant de chaîne et à un objectif par la dérivation de clé (HKDF-SHA-256 avec info `"qorechain-kem-v1|" + chainId + "|" + purpose`) et à des données associées facultatives. Une enveloppe scellée pour un objectif ne s'ouvre pas sous un autre.
- **Des clés publiées sur la chaîne, contrôlées par la chaîne.** Un compte enregistre sa clé ML-KEM-1024 avec `MsgRegisterKEMKey`, authentifié par la signature hybride de la transaction. `validateMlkemPublicKey` applique les mêmes contrôles que la chaîne à l'enregistrement.
- **Cartes de destinataire.** Le registre contient la clé ML-KEM et rien d'autre. La clé X25519 du mode hybride voyage dans une carte que le compte signe avec la signature de message de [QoreSign](/qoresign/overview) et lie à sa clé ML-KEM sur la chaîne. Les expéditeurs vérifient la carte par rapport aux deux clés sur la chaîne, de sorte qu'elle peut provenir de n'importe quel canal. Une carte falsifiée ou périmée peut tout au plus ramener une enveloppe à la force de ML-KEM-1024, car la partie ML-KEM utilise toujours la clé sur la chaîne.
- **Clés d'époque pour les groupes privés.** `EpochKeyManager` crée une nouvelle clé d'époque à chaque changement de composition et la scelle pour les membres actuels. Un membre retiré garde les clés des époques auxquelles il appartenait et ne peut pas lire les suivantes.
- **Lots chiffrés avec engagements.** Le codec de lots produit un blob chiffré avec un engagement sur le texte chiffré et un engagement salé sur le texte en clair, prêt à être ancré sur QoreChain avec le [RDK](/rollups/overview).
- **Les mêmes octets dans tous les langages.** TypeScript et Go sont des implémentations natives ; Rust est le noyau sous Swift, Kotlin et Python. Des vecteurs de test partagés sont vérifiés octet par octet dans chaque langage, et les erreurs portent des codes stables (par exemple `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Cas d'usage {#use-cases}

1. **Une dApp chiffre des mémos ou des messages entre utilisateurs.** Une dApp de messagerie ou de paiements scelle chaque note à l'adresse du destinataire avec `sealToAddresses` et stocke le texte `qoreseal:` dans un mémo, un contrat ou sa propre base de données. Seule la clé du destinataire l'ouvre.
2. **Factures et documents avec une clé d'auditeur (lecture).** Une entreprise scelle une facture pour l'acheteur, le vendeur et une clé d'auditeur dans une seule enveloppe, avec le numéro de facture comme donnée associée. La clé d'auditeur est une paire de clés QoreSeal ordinaire conservée dans la configuration ; une clé par trimestre (`deriveSealKeys` avec un nouvel indice) permet à l'entreprise de ne remettre à l'auditeur que les périodes examinées.
3. **Offres scellées et commit-reveal.** Une enchère scelle les offres à la clé de l'enchère avec `purpose: "bid:<auction id>"` et l'adresse de l'enchérisseur comme donnée associée, stocke les enveloppes, et les ouvre après l'échéance.
4. **Sidechains de consortium ou privées.** L'opérateur d'un rollup privé utilise `EpochKeyManager` pour partager une clé d'époque avec les membres, chiffre chaque lot avec `PrivateBatchCodec`, et ancre le blob chiffré et ses engagements sur QoreChain avec le RDK.
5. **Wallets proposant « recevoir des données chiffrées ».** Un wallet dérive les clés QoreSeal de la phrase mnémonique du compte (indice 0), publie la clé ML-KEM avec un `MsgRegisterKEMKey` signé en hybride, et affiche la carte de destinataire à signer sous forme de texte brut.
6. **Destinataires de récupération ou de séquestre.** Une équipe de conservation ou de conformité ajoute une clé de récupération hors ligne à chaque enveloppe, de sorte que les données survivent à la perte de la clé d'un utilisateur.
7. **Backends en Python ou en Go.** Un service scelle des rapports ou des exports pour une liste de comptes, de manière compatible octet pour octet avec tous les autres langages.

## Comment elle fonctionne {#how-it-works}

Primitives (QoreSeal n'en implémente aucune) : ML-KEM-1024 (FIPS 203 ; clé d'encapsulation 1 568 octets, clé de décapsulation 3 168 octets, texte chiffré 1 568 octets), X25519 (RFC 7748), un combinateur SHA3-256, HKDF-SHA-256 et AES-256-GCM (nonce de 96 bits, balise de 128 bits).

**Scellement**, en bref :

1. Un sel aléatoire de 16 octets et une clé de données aléatoire de 32 octets sont tirés.
2. Pour chaque destinataire, une encapsulation ML-KEM-1024 vers la clé du destinataire ; en mode hybride aussi un accord X25519 éphémère avec la clé X25519 du destinataire, et les deux secrets sont combinés avec SHA3-256. Une clé de chiffrement de clé est dérivée avec HKDF-SHA-256 (sel, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) et enveloppe la clé de données avec AES-256-GCM.
3. La charge utile est chiffrée une seule fois avec la clé de données, en authentifiant tout l'en-tête et les données associées facultatives.

**Structure de l'enveloppe :** magic `QSEL`, version 1, mode, octets d'algorithme, drapeaux, sel, nombre de destinataires, une entrée par destinataire (indice, texte chiffré ML-KEM, clé éphémère X25519 en mode hybride, clé de données enveloppée), nonce, texte chiffré. Taille : `56 + 1,664 x recipients + plaintext` octets en mode hybride et `56 + 1,632 x recipients + plaintext` en mode `mlkem`. D'après la spécification : 1 destinataire et 1 Ko de texte en clair donnent 2 744 octets (hybride) ; 10 destinataires et 1 Ko donnent 17 720 octets.

L'identifiant de chaîne et l'objectif ne sont pas écrits dans l'enveloppe : le destinataire doit passer les mêmes valeurs. Un identifiant de chaîne, un objectif ou des données associées erronés, ou toute modification des octets, donne `DECRYPTION_FAILED`.

**Indices.** Des indices salés permettent à un destinataire de retrouver rapidement sa propre entrée. Avec `anonymous: true`, les indices sont mis à zéro et les destinataires essaient chaque entrée.

**Forme texte.** `envelopeToText` et `envelopeFromText` convertissent vers et depuis `"qoreseal:" + base64url`.

**Ce qui est sur la chaîne**

- Le registre de clés KEM dans le module `qorechain.pqc.v1` : `MsgRegisterKEMKey` avec `sender`, `algorithm_id = 2` (ML-KEM-1024) et `public_key`, et `MsgRemoveKEMKey` avec `sender`. URL de types : `/qorechain.pqc.v1.MsgRegisterKEMKey` et `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Requête : `GET /qorechain/pqc/v1/kem/{address}` (accepte la forme `qor1` ou `0x`), qui renvoie `found` et, si trouvée, `key` avec `address`, `algorithm_id`, `algorithm_name`, `public_key` et `registered_height`.
- L'enregistrement est authentifié par la signature hybride de la transaction. L'expéditeur doit déjà avoir une clé ML-DSA-87 enregistrée, et la transaction est signée avec `signHybrid` de QoreSign. Une clé par compte ; enregistrer de nouveau la remplace.
- Refus (codespace `pqc`) : 250 registre pas encore activé sur cette chaîne, 251 clé publique KEM invalide, 252 aucune clé KEM publiée pour ce compte, 253 cette clé est déjà publiée pour ce compte, 254 publier une clé KEM nécessite une clé de signature post-quantique enregistrée. `describeKemRegistryError` les explique.
- Les enveloppes elles-mêmes vont là où l'application les met (mémos, contrats, fichiers, API). La chaîne ne voit jamais de clé secrète.

**Carte de destinataire.** Environ 6,7 Ko de JSON, principalement la signature ML-DSA-87. Le compte signe un texte fixe (`QoreSeal recipient card v1`, identifiant de chaîne, adresse, SHA3-256 de la clé ML-KEM, clé X25519, date d'émission) avec la signature de message de QoreSign. Enregistrer une nouvelle clé ML-KEM retire toutes les cartes faites pour l'ancienne.

**Groupes privés.** Une charge utile de clé d'époque (`QSEK`, numéro d'époque, clé de 32 octets) est scellée dans une enveloppe ordinaire pour les membres actuels. Un blob de lot (`QSBT`, époque, indice de lot, contexte tel que l'identifiant du rollup, nonce, texte chiffré AES-256-GCM) fait `83 + context length + data length` octets. Engagements : `ciphertextCommitment = SHA3-256(blob)` et `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`, salé pour que des tiers ne puissent pas deviner des contenus à faible entropie.

La spécification est `spec/qoreseal-v1.md` dans le dépôt (statut : brouillon, revue en cours) ; les vecteurs partagés sont `vectors/qoreseal-v1.json`.

## Comment l'utiliser {#how-to-use}

### Installation {#install}

| Langage | Installation | Plateforme minimale |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (nom de bibliothèque `qoreseal`) | Rust stable |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (import `qoreseal`) | Python 3.9 ou ultérieur ; wheels pour macOS 11+ (arm64, x86_64) et Linux manylinux2014 (x86_64, aarch64) ; pas encore de wheel Windows |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, produit `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17 ; compilateur Kotlin 2.3 ou ultérieur (la compilation échoue avec Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24 ; règles keep R8 incluses ; compilateur Kotlin 2.3 ou ultérieur |
| TypeScript | **à venir** : `@qorechain/qoreseal` n'est pas encore sur npm, il n'y a donc pas de commande d'installation | |

La source TypeScript, ses exemples et les assistants réseau se trouvent dans le dépôt et s'exécutent depuis celui-ci après `pnpm install && pnpm build`. Tant que le paquet npm n'est pas publié, considérez le dépôt comme la façon d'utiliser TypeScript, et attendez-vous au nom de paquet ci-dessus.

### Démarrage rapide 1 : sceller et ouvrir hors ligne (Python) {#quickstart-python}

Exécuté le 27 octobre 2026 avec la wheel 0.1.0 publiée. Pas de réseau, pas de compte. Deux destinataires, des données associées, et une vérification qu'un autre objectif n'ouvre pas l'enveloppe.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

Il a affiché `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` puis `other purpose: DECRYPTION_FAILED`. La longueur est 56 + 2 x 1 664 + 19 = 3 403 octets.

### Démarrage rapide 2 : sceller et ouvrir hors ligne (Go) {#quickstart-go}

Exécuté avec v0.1.0 depuis le proxy de modules Go.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

Il a affiché `3409 120 QOR due on 2026-11-30 <nil>`.

Rust, Swift et Kotlin utilisent les mêmes appels (`seal`, `open`, `generate_seal_keys`, etc., avec la casse du langage). Leurs exemples n'ont pas été exécutés pour cette page.

### Démarrage rapide 3 : un groupe privé avec des époques (Python, hors ligne) {#quickstart-group}

Suit l'exemple du dépôt `examples/private-rollup`. Alice et bob commencent à l'époque 1, carol arrive (époque 2), bob est retiré (époque 3). Bob peut lire l'époque 1 mais pas l'époque 3.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

Il a affiché le lot de l'époque 1 de bob, puis `bob, epoch 3: UNKNOWN_EPOCH`, puis les deux engagements (aléatoires à chaque exécution).

Pour ancrer un lot scellé avec le [RDK](/rollups/overview), le blob chiffré est le blob natif de disponibilité des données et son SHA-256 est le `data_hash` du lot (TypeScript, d'après le guide du dépôt ; non exécuté pour cette page) :

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

Voir [Disponibilité des données](/rollups/data-availability) pour la manière dont les lots de rollup sont publiés.

### Chiffrer vers une adresse sur le testnet {#encrypt-to-address}

Il vous faut un compte `qorechain-diana` que vous contrôlez, avec un peu de QOR de testnet et une clé ML-DSA-87 enregistrée (l'exemple QoreSign `register-and-send` en enregistre une). Utilisez une phrase mnémonique de testnet, jamais une phrase de mainnet, et jamais la phrase de test publique avec des fonds. Ce parcours est décrit d'après le guide du dépôt et n'a pas été exécuté pour cette page.

1. Dérivez les clés à partir de la phrase mnémonique du compte : `deriveSealKeys({ mnemonic })` (indice 0). La phrase mnémonique en est aussi la sauvegarde.
2. Publiez la clé ML-KEM-1024 : `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, placez-le dans un corps de transaction, signez-le avec `signHybrid` de QoreSign, simulez avec `simulateTx` et envoyez avec `submitWithSignBytesFallback`. En cas de refus, `describeKemRegistryError(res.codespace, res.code)` l'explique.
3. Vérifiez-la : `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. Il répond `{"found":false,"key":null}` pour un compte qui n'a pas publié de clé.
4. Signez une carte de destinataire : `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`, et publiez-la là où les expéditeurs peuvent la récupérer.
5. Côté expéditeur : `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Sans carte, passez `mode: "mlkem"`.
6. Côté destinataire : `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

Le parcours complet exécutable est l'exemple du dépôt `examples/register-and-encrypt`. Le mainnet a appliqué la v3.2.5 le 29 octobre 2026 ; consultez le README de l'exemple pour connaître la version qui lève sa protection contre le mainnet. Go offre le même côté expéditeur avec `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. Rust, Swift, Kotlin et Python fonctionnent hors ligne : lisez vous-même `/qorechain/pqc/v1/kem/{address}` et `/qorechain/pqc/v1/account/{address}`, vérifiez la carte (`verify_recipient_card`), puis scellez.

### API principale {#api}

Les noms sont donnés sous leur forme TypeScript. Go utilise la casse de Go (`Seal`, `Open`, `NewEpochKeyManager`), Rust et Python utilisent snake_case. En Python, Swift et Kotlin, `seal` et `open` s'appellent `seal_envelope` / `sealEnvelope` et `open_envelope` / `openEnvelope`.

| Nom | Ce qu'il fait | Où |
|---|---|---|
| `generateSealKeys` | paire de clés aléatoire (ML-KEM-1024 + X25519) | tous |
| `deriveSealKeys` | paire de clés issue d'une phrase mnémonique BIP-39, avec phrase secrète et indice facultatifs | tous |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | restaurer depuis la graine de 32 octets ; graine issue d'une phrase mnémonique | tous |
| `recipientOf` | destinataire public à partir d'une paire de clés | tous |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | contrôles d'entrée (la chaîne applique le même contrôle ML-KEM) | tous |
| `seal` | chiffrer pour 1 à 1 024 destinataires (`mode`, `aad`, `anonymous`) | tous |
| `open` | déchiffrer avec une paire de clés | tous |
| `parseEnvelope`, `envelopeSize` | inspecter une enveloppe ; calculer sa taille | tous |
| `envelopeToText`, `envelopeFromText` | forme texte `qoreseal:` | tous |
| `signRecipientCard`, `verifyRecipientCard` | créer et vérifier la carte de destinataire | tous |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | construire une carte lorsque la signature se fait ailleurs, par exemple dans l'interface d'un wallet | tous |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | messages du registre, à signer en hybride avec QoreSign | tous |
| `describeKemRegistryError` | explique les codes 250 à 254 du codespace `pqc` | tous |
| `EpochKeyManager` | clés d'époque pour un groupe : `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | tous |
| `sealEpochKey`, `openEpochKey` | envoyer ou recevoir une clé d'époque (par exemple l'historique pour un nouvel arrivant) | tous |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | lots chiffrés avec engagements | tous |
| `fetchKemKey`, `fetchMlkemPublicKey` | lire la clé ML-KEM d'un compte via REST | TypeScript, paquet réseau Go |
| `resolveRecipient` | clés sur la chaîne plus carte, vérifiées, sous forme de destinataire | TypeScript, paquet réseau Go |
| `sealToAddresses` | sceller pour des comptes à partir de leur adresse | TypeScript, paquet réseau Go |

Les assistants réseau sont `@qorechain/qoreseal/network` en TypeScript et `github.com/qorechain/qoreseal/go/network` en Go. Des briques de plus bas niveau sont aussi exportées (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Les fonctions nommées pour les tests (`sealWithEntropy`, `testing_*`) existent pour reproduire les vecteurs de test et ne doivent jamais être utilisées avec de vraies données.

Les erreurs Python lèvent `QoreSealError.Failure` avec un `code` stable ; les erreurs Go se comparent avec `qoreseal.IsCode`.

## Comment y accéder {#how-to-access}

| | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
|---|---|---|
| Registre de clés KEM | en service depuis la v3.2.5 (appliquée le 29 octobre 2026, hauteur 3 906 833) ; route de lecture vérifiée, voir ci-dessous | en service |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |

Le 30 octobre 2026, la requête du registre a répondu `{"found":false,"key":null}` pour un compte sans clé sur les deux réseaux (le 27 octobre, le mainnet répondait encore « Not Implemented »). Une recherche dans les transactions du mainnet le 30 octobre n'a trouvé aucun `MsgRegisterKEMKey` pour l'instant ; la publication d'une clé sur le mainnet n'a donc pas été éprouvée de bout en bout par cette page.

- Le scellement et l'ouverture hors ligne, y compris les clés d'auditeur passées directement, les groupes privés et les lots, n'ont besoin ni de réseau ni de compte.
- Chiffrer vers une adresse nécessite que le destinataire ait publié une clé ML-KEM-1024 dans le registre et, pour le mode hybride, une carte de destinataire.
- Publier une clé nécessite un compte avec du QOR de testnet (sur le mainnet, du QOR), une clé ML-DSA-87 enregistrée, et QoreSign pour signer la transaction en hybride. Le plancher de frais est de 0,1 uqor par gas. Obtenez du QOR de testnet depuis le [Faucet](/dashboard/faucet).
- L'enregistrement sur le mainnet n'est accepté que par une chaîne qui possède le registre ; si un refus avec le code 250 apparaît, le registre n'est pas activé sur cette chaîne.

## Où elle est publiée {#where-published}

Vérifié le 27 octobre 2026 auprès de chaque registre.

| Registre | Paquet | Version | Lien |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Proxy de modules Go | `github.com/qorechain/qoreseal/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (wheels pour macOS arm64 et x86_64, Linux x86_64 et aarch64, plus les sources) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` depuis `github.com/qorechain/qoreseal` | 0.1.0 (binaire `QoreSealFFI.xcframework.zip` dans la release GitHub) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | pas encore publié (à venir) | |

Les projets qui utilisent l'un ou l'autre artefact Maven ont besoin du compilateur Kotlin 2.3 ou ultérieur. L'artefact Kotlin/JVM embarque des bibliothèques natives pour macOS (arm64, x86_64), Linux (x86_64, arm64) et Windows (x86_64) ; l'artefact Android couvre arm64-v8a, armeabi-v7a et x86_64.

Source : [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (release v0.1.0). Licence Apache-2.0.

## Limites et problèmes connus {#limits}

- **C'est le contenu de la charge utile qui est protégé.** Les adresses de l'expéditeur et du destinataire, les montants des transferts bancaires, l'horodatage des transactions, la taille des enveloppes et le nombre de destinataires restent publics sur la chaîne.
- **Pas de transactions privées.** QoreSeal ne cache ni qui transige avec qui, ni combien.
- **Pas de preuves à divulgation nulle de connaissance.** Rien ne prouve quoi que ce soit sur les données chiffrées ; dans une sidechain privée, les vérificateurs extérieurs au groupe ne peuvent pas contrôler ce qui se passe dans un lot.
- **Les enveloppes ne sont pas signées.** N'importe qui peut chiffrer vers une adresse, et tout destinataire d'une enveloppe à plusieurs destinataires pourrait construire une enveloppe différente pour les autres. Signez le contenu ou l'enveloppe (`signMessage` de QoreSign) lorsque l'expéditeur doit être authentifié.
- **Chaque destinataire lit toute la charge utile.** Il n'y a pas de masquage par destinataire ; scellez des enveloppes distinctes pour des lecteurs différents.
- **Les indices ne sont pas de l'anonymat.** Quiconque connaît la clé publique d'un candidat (elle est sur la chaîne) peut tester si cette clé est un destinataire. `anonymous: true` met les indices à zéro ; les destinataires essaient alors chaque entrée.
- **Perdre une clé, c'est perdre les données.** Il n'y a pas de récupération sur la chaîne. Perdre la graine ou la phrase mnémonique fait perdre tout ce qui a été scellé pour cette clé.
- **Retirer ou faire pivoter une clé n'efface ni ne rechiffre rien.** Les données scellées pour une ancienne clé restent lisibles par quiconque la détient ; conservez les anciennes graines ou indices.
- **Les membres retirés d'un groupe** gardent les clés des époques auxquelles ils appartenaient. Les nouveaux membres lisent à partir de leur époque d'arrivée, sauf si les clés plus anciennes leur sont scellées.
- **L'identifiant de chaîne et l'objectif ne sont pas dans l'enveloppe ;** le destinataire doit les connaître.
- **Registre sur le mainnet :** la route de lecture est en service depuis la v3.2.5 ; aucune clé n'avait été publiée sur le mainnet au moment de la vérification, et l'espace de noms JSON-RPC EVM `qor_` n'est pas exposé sur `evm.qore.host` (utilisez la route REST).
- **Avant la 1.0, construction en attente de revue externe.** Les versions mineures peuvent changer l'API. Lisez la spécification avant de vous y fier.
- **Pas encore de paquet npm** ni de wheel Python pour Windows.

## Notes de sécurité {#security}

- Les clés secrètes ne quittent jamais l'appareil ou le serveur qui exécute QoreSeal. La chaîne stocke uniquement la clé publique ML-KEM-1024, et la carte porte la clé publique X25519.
- Sauvegardez la phrase mnémonique du compte, une phrase mnémonique dédiée, ou la graine de 32 octets (`keys.seed`), chiffrée au repos. N'exportez jamais la clé secrète ML-KEM seule ; exportez la graine ou la phrase mnémonique.
- Rotation : passez à l'indice suivant, enregistrez la nouvelle clé ML-KEM, signez une nouvelle carte. Les anciennes cartes cessent de se vérifier automatiquement.
- Ajoutez un destinataire de récupération (une clé hors ligne) aux données qui doivent survivre à la perte de la clé d'un utilisateur. Traitez-le comme une clé d'auditeur, puisqu'il lit tout ce à quoi il est ajouté.
- Pour les groupes, `exportKeys()` contient chaque clé d'époque. Scellez cet export à la propre clé de l'opérateur et à une clé de récupération hors ligne, et gardez-le hors de la machine du séquenceur. Faites pivoter les clés d'époque selon un calendrier.
- Le mode `mlkem` doit être choisi explicitement ; l'hybride ne se dégrade jamais en silence.
- Les primitives viennent des liaisons [`qorechain-pqc`](/developer-tools/pqc-library) et de bibliothèques éprouvées (noble pour TypeScript, crates RustCrypto, bibliothèque standard de Go) ; les signatures de compte viennent de [QoreSign](/qoresign/overview).
- Signalez les vulnérabilités en privé à security@qore.network. Le fait que les métadonnées sur la chaîne soient publiques est voulu et relève de la documentation, pas d'une vulnérabilité.

## Pages associées {#related}

- [QoreSign](/qoresign/overview) : signature hybride pour la transaction d'enregistrement, et signature de message derrière les cartes de destinataire et les enveloppes signées.
- [Vue d'ensemble du RDK](/rollups/overview) et [Disponibilité des données](/rollups/data-availability) : ancrage des lots chiffrés d'une sidechain privée.
- [Bibliothèque PQC](/developer-tools/pqc-library) : les liaisons ML-KEM-1024 sous QoreSeal.
- [Sécurité post-quantique](/architecture/post-quantum-security) et [Signature post-quantique](/developer-guide/post-quantum-signing) : comment fonctionnent les comptes et les clés sur la chaîne.
- [Vue d'ensemble des paquets développeur](/developer-tools/overview).
