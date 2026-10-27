---
slug: /qorel/signing-from-any-language
title: Signer des transactions QoreChain depuis n'importe quel langage
sidebar_label: Signer depuis n'importe quel langage
sidebar_position: 8
---

# Signer des transactions QoreChain depuis n'importe quel langage

QORel signe en Rust avec le crate `qorel-signer`. D'autres relayeurs, bots et outils peuvent produire la même signature hybride post-quantique dans d'autres langages avec le SDK QoreChain et les bibliothèques post-quantiques. Cette page énonce le contrat que tous suivent et liste la bibliothèque à utiliser pour Rust, TypeScript, Go, Python et Java. Elle s'adresse aux développeurs qui construisent un relayeur, un bot ou un backend qui soumet des transactions à QoreChain.

## Innovations {#innovations}

- **Un contrat, un jeu de vecteurs de test.** Chaque langage construit les mêmes sign bytes et la même extension. Le dépôt QORel publie des vecteurs reconstruits octet pour octet à partir de transactions que la chaîne a acceptées, ce qui permet de vérifier une implémentation avant qu'elle touche un réseau.
- **L'extension est le seul ajout.** La signature post-quantique voyage dans une seule option d'extension du corps de la transaction ; les messages, les frais et la signature classique gardent leur forme habituelle.
- **Le point d'accroche est étroit.** La signature est ajoutée une fois les auth info finalisées et avant la construction du document de signature classique. Un relayeur n'a besoin que d'une modification à cet endroit, pas d'une réécriture.
- **La même clé partout.** La clé ML-DSA-87 est dérivée de la phrase mnémonique du compte avec la dérivation de portefeuille de QoreChain, de sorte que tout portefeuille ou relayeur qui importe la phrase mnémonique obtient la même clé post-quantique.

## Utilisation {#how-to-use}

### Le contrat {#contract}

QoreChain n'accepte une transaction de la voie native que si elle porte les deux signatures :

- **La signature classique secp256k1**, sous la forme habituelle `SIGN_MODE_DIRECT`. Elle couvre le corps final, extension comprise.
- **Une signature ML-DSA-87 (FIPS 204)** dans une option d'extension du corps, de type `/qorechain.pqc.v1.PQCHybridSignature`, avec `algorithm_id = 1`, `pqc_signature` (4 627 octets) et un `pqc_public_key` facultatif (2 592 octets). Ce doit être la seule option d'extension critique (dans `extension_options`) de la transaction.

La signature ML-DSA couvre les sign bytes (version 2, en vigueur sur les deux réseaux) :

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` est le `TxBody` sans l'extension PQC, réencodé de façon canonique.
- `A` correspond aux octets `AuthInfo`, inchangés.

Ordre des opérations :

1. Construire le corps et les auth info.
2. Signer les sign bytes avec ML-DSA-87.
3. Ajouter l'extension au corps.
4. Signer le corps final avec secp256k1.
5. Diffuser.

Règles faciles à mal appliquer :

- `B0` doit être canonique, car la chaîne le redérive en décodant le corps, en retirant l'option hybride et en réencodant. N'envoyez pas de corps avec leurs propres options d'extension, l'indicateur `unordered`, des champs inconnus ou un encodage non canonique.
- Un refus avec le codespace `pqc` code 21 signifie que la signature hybride n'a pas été vérifiée. Relisez la version des sign bytes et l'enregistrement du compte avant de réessayer ; voir [Signature post-quantique](/developer-guide/post-quantum-signing#code-21).
- Gas : la vérification coûte 2 000 gas par signataire à clé, plus le coût de taille d'environ 4,7 Ko d'extension. Simulez par le même chemin afin que les deux soient comptés.

### Enregistrer et dériver la clé {#keys}

Le compte enregistre une seule fois sa clé publique ML-DSA avec `MsgRegisterPQCKeyV2`, avec une preuve de possession. C'est la seule transaction que QoreChain accepte avec la seule signature classique. Voir [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration).

La clé ML-DSA est dérivée de la même phrase mnémonique que le compte :

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

puis `ML-DSA-87.KeyGen_internal(seed)`. Les secrets sont mis à zéro en mémoire et jamais affichés. La même dérivation est décrite sur [Dérivation de clés](/qoresign/guides/key-derivation).

### La couche de signature dans QORel {#signer-layer}

Le crate `qorel-signer` répartit le travail en trois interfaces :

- `PqSigner` : une primitive post-quantique (`algorithm_id`, `public_key`, `sign`). `MlDsa87Signer` est fourni, avec une signature hedged par défaut et une signature déterministe pour les vecteurs de test ; chaque signature est vérifiée avant utilisation.
- `SignBytesFramer` : les règles d'une chaîne (`check_body`, `frame`, `pack`).
- `TxExtensionSigner` : ce que le relayeur appelle. `PqExtensionSigner` combine une primitive et un framer.

Le relayeur construit une transaction dans cet ordre : encoder le corps sans aucune extension de cosignataire (`B0`) ; encoder les auth info finales (`A`) ; demander au cosignataire les options d'extension à ajouter ; réencoder le corps avec elles ; produire la signature classique sur le document de signature du corps final. Pour utiliser le crate depuis Rust, dépendez-en à partir du dépôt (il n'est pas sur crates.io) :

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

Un appel complet, qui construit le signataire hybride pour une chaîne et lui demande les options d'extension, figure dans `crates/qorel-signer/README.md` dans le dépôt. Le crate travaille sur des octets protobuf bruts, refuse les corps que la chaîne rejetterait (une option d'extension critique existante, `unordered`, des champs inconnus), ne retombe jamais sur les sign bytes v1 sur les réseaux QoreChain tant que la version n'est pas connue, vérifie chaque signature qu'il produit, met les secrets à zéro et les masque dans la sortie `Debug`. Ses tests reconstruisent, octet pour octet, des transactions que l'ante handler de la chaîne a acceptées. Voir aussi [qorel-signer dans la présentation](/qorel/overview#qorel-signer).

Une chaîne qui a besoin d'une autre signature supplémentaire implémente un framer, et une nouvelle primitive si l'algorithme diffère ; rien d'autre ne change dans le relayeur.

### Bibliothèques {#libraries}

| Langage | Paquet | Signature hybride |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io), ou `qorel-signer` depuis le [dépôt QORel](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` avec `PqExtensionSigner` ; `qorechain::tx::build_hybrid_tx` |
| TypeScript et JavaScript | `npm install @qorechain/sdk` | `TxClient` signe en hybride avec un `pqcKeypair` ; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (construction et signature hybrides), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java et Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (enregistrement, chemin d'envoi hybride) et le constructeur de transactions hybrides |
| C et autres | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | Bindings de génération de clés, signature et vérification ML-DSA-87 ; formez les sign bytes comme ci-dessus |

Voir [Paquets pour développeurs](/developer-tools/overview) pour la version actuelle de chaque paquet et [QoreSign](/qoresign/overview) pour la signature dans un portefeuille ou un backend. Les clients uniquement classiques de certains paquets ne peuvent pas envoyer de transactions de la voie native ; consultez la page du paquet avant d'en utiliser un pour des écritures.

### Vecteurs de test {#test-vectors}

`crates/qorel-signer/tests/vectors/` dans le dépôt QORel contient :

- un fichier de réponses connues pour les sign bytes ;
- des vecteurs de transactions de relais : le corps sans l'extension, les sign bytes, les octets de l'extension et la transaction signée complète, reconstruits octet pour octet à partir de transactions que la chaîne a acceptées ;
- le vecteur de dérivation de clés commun à tous les SDK.

Exécutez-les dans votre langage avant d'envoyer quoi que ce soit à un réseau actif. Les vecteurs de QoreSign figurent sur [Vecteurs de test](/qoresign/vectors).

### Ajouter la signature post-quantique à un autre relayeur {#other-relayers}

Le point d'accroche est « après que les auth info sont finalisées et avant que le document de signature classique soit construit ». Branchez-y l'extension :

- Dans les relayeurs basés sur Hermes, c'est `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. La modification de QORel y est générique : tout `TxExtensionSigner` peut ajouter des options d'extension.
- Dans les relayeurs Go construits sur le paquet `client/tx` du Cosmos SDK, encapsulez le `TxBuilder` avant `SetSignatures`.

## Accès {#how-to-access}

- **Réseau.** Le contrat est le même sur les deux réseaux QoreChain ; QORel lui-même n'est testé que sur le testnet.
- **Clé et compte.** Un compte approvisionné avec une clé ML-DSA-87 enregistrée ; des QOR de testnet depuis le [faucet du tableau de bord](/dashboard/faucet).
- **Coût.** Les bibliothèques sont gratuites (Apache-2.0). Les transactions paient le gas avec un plancher de 0,1 uqor par gas.

## Où c'est publié {#where-published}

| Paquet | Registre | Sources |
|---|---|---|
| `qorel-signer` | Dans le dépôt (`crates/qorel-signer`) ; pas sur crates.io, utilisez la dépendance git ci-dessus | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, module Go, artefact Maven | crates.io, npm, proxy Go, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Limites et problèmes connus {#limits}

- **Uniquement ML-DSA-87 (identifiant d'algorithme 1).** C'est le seul algorithme avec lequel QORel et les bibliothèques ci-dessus signent.
- **Version des sign bytes.** Cette page documente la version 2, que les deux réseaux vérifient. Un outil doit quand même lire la version depuis la chaîne (les enregistrements de mise à niveau appliqués) plutôt que de la supposer ; QORel le fait.
- **La signature est locale.** Aucune de ces bibliothèques ne détient une clé pour vous ni ne signe via un portefeuille matériel.
- **Les exemples par langage ne sont pas répétés ici.** Utilisez le démarrage rapide de chaque paquet ; ce manuel ne prétend pas que chaque langage a été exécuté contre les vecteurs de test de QORel.
