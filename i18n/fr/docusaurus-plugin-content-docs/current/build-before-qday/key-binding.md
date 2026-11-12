---
slug: /build-before-qday/key-binding
title: Comment votre clé post-quantique est liée à votre compte
sidebar_label: Liaison de la clé
sidebar_position: 3
---

# Comment votre clé post-quantique est liée à votre compte

Tous les tutoriels de cette section utilisent une **clé post-quantique** à côté de la clé normale de votre compte. Cette page explique, en mots simples, d'où vient cette clé, comment la chaîne apprend qu'elle appartient à votre compte, et comment vous pouvez le vérifier vous-même. Vous n'avez rien à lancer pour la lire. Les vérifications de [Vérifiez par vous-même](#check) prennent environ 5 minutes.

## L'idée en un schéma {#picture}

```text
phrase de récupération (ou code de récupération)
        |
        v
dérivation des deux clés
  - clé classique (secp256k1)
  - clé post-quantique (ML-DSA-87), liée à l'adresse de votre compte
        |
        v
enregistrement unique, avec une preuve de possession
        |
        v
chaque transaction est signée de façon hybride (les deux clés)
        |
        v
les validateurs vérifient les deux signatures
```

## Les mots utilisés sur cette page {#words}

| Mot | Ce qu'il veut dire |
| --- | --- |
| Clé classique | La clé normale de votre compte (secp256k1). Elle signe chaque transaction sur toutes les blockchains de ce type. |
| Clé ML-DSA-87 | La clé de signature post-quantique. On ne s'attend pas à ce qu'un futur ordinateur quantique la casse. |
| Phrase de récupération (mnémonique) | Les 12 ou 24 mots qui permettent de restaurer un compte. |
| Code de récupération | Une ligne qui commence par `QRC1`. Il remplace la phrase de récupération pour la clé post-quantique quand votre compte vient d'une clé privée brute. |
| Enregistrement | Une transaction qui indique à la chaîne quelle clé ML-DSA-87 appartient à votre compte. |
| Preuve de possession | Une signature qui montre que vous détenez vraiment la moitié secrète de la clé que vous enregistrez. |
| Signature hybride | Les deux signatures sur une même transaction. |

## 1. Dériver, ne pas générer {#derive}

La clé post-quantique n'est pas tirée au hasard puis gardée dans un fichier que vous pourriez perdre. Elle est **dérivée** : la même entrée donne toujours la même clé.

- **Avec une phrase de récupération.** La clé ML-DSA-87 vient de la **même phrase de récupération** que la clé classique, avec l'adresse de votre compte. La clé classique et la clé post-quantique sont toutes deux reconstruites à partir de la phrase, donc **une seule sauvegarde restaure les deux**. C'est ce que font QoreX et le compte unifié du SDK.
- **Avec une clé privée brute.** Une clé privée seule ne peut pas donner une seconde clé. La clé post-quantique est alors créée à partir d'un **code de récupération** séparé qui commence par `QRC1`. Dans le projet de l'atelier 1, vous le créez avec `pnpm window recovery-code`. Dans le SDK, c'est `generatePqcRecoveryCode()`.

Trois règles pour un code de récupération :

1. Gardez-le **à part** de la clé privée. Si les deux sont au même endroit, un seul vol prend les deux.
2. Réutilisez toujours le **même** code pour le même compte.
3. Un **code différent donne une clé différente**. La chaîne voit alors une clé qui ne correspond pas à celle que vous avez enregistrée.

:::caution Un code de récupération ne peut pas être reconstruit
Il n'existe aucun moyen de retrouver un code de récupération perdu. Notez-le sur papier au moment où vous le créez. Les comptes testnet jetables sont l'exception : vous pouvez créer un nouveau compte en une minute.
:::

## 2. Lier une fois, avec une preuve de possession {#bind}

Lier veut dire une seule transaction, envoyée une fois par compte, nommée `MsgRegisterPQCKeyV2`. Elle contient :

- votre **clé publique** ML-DSA-87 (2 592 octets), et
- une **preuve de possession** : la clé signe un court texte qui nomme la chaîne et votre compte. Personne ne peut lier une clé qu'il ne détient pas, et personne ne peut copier une liaison depuis une autre chaîne.

C'est le seul message que la chaîne accepte avec la **signature classique seule**. La raison est simple : avant lui, la chaîne n'a aucune clé post-quantique enregistrée pour votre compte, donc il n'y a rien contre quoi vérifier une seconde signature.

Comment le faire :

| Où | Comment |
| --- | --- |
| QoreX | Automatique à votre premier envoi. Cela coûte des frais uniques d'environ 0,09 QOR. |
| Atelier 1 et applications d'exemple | `pnpm window register` (étape 5 du [guide de l'atelier 1](/build-before-qday/workshop-1#step-5)). |
| Votre propre code | `ensurePqcRegistered` du SDK. |

`ensurePqcRegistered` peut être rappelé sans risque. Il lit d'abord votre compte. Si votre clé est déjà liée, il n'envoie rien. Si une **autre** clé est liée, il s'arrête avec `PqcKeyMismatchError` et n'envoie rien. Si vous envoyez un second enregistrement à la main, la chaîne le refuse et **prend quand même les frais** : laissez donc l'outil faire la vérification.

:::note Ce que la chaîne exige aujourd'hui
La chaîne contrôle une preuve de possession dès qu'il y en a une, et refuse l'enregistrement si elle ne se vérifie pas. Le SDK et QoreX en joignent une automatiquement. Sur le mainnet, un enregistrement sans preuve est encore accepté. Sur le testnet, à partir de la version v3.2.8, la première transaction d'un nouveau compte doit être cet enregistrement. Détails : [Signature post-quantique](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. Après la liaison, tout est hybride {#hybrid}

À partir de là, chaque transaction native porte deux signatures :

- la signature classique secp256k1 (64 octets), et
- la signature ML-DSA-87 (4 627 octets) dans une extension nommée `PQCHybridSignature`.

Les validateurs vérifient **les deux**. Quand c'est fait, la chaîne enregistre un événement `pqc_hybrid_verify` avec le statut `verified`.

Sans clé enregistrée, une transaction est refusée avec `account has no PQC key and classical fallback is disabled`.

Les transactions de la voie EVM (par exemple un déploiement de contrat) demandent une chose de plus : une fenêtre d'autorisation EVM, ouverte par un message signé de façon hybride. Voir la [référence de la fenêtre EVM](/developer-guide/evm-window-reference).

## Vérifiez par vous-même {#check}

Il vous faut `curl`. `jq` est facultatif. Les deux sont présentés dans [Avant de commencer](/build-before-qday/prerequisites#curl-jq).

### Ma clé est-elle enregistrée ? {#check-account}

1. Remplacez `qor1...` par votre propre adresse et lancez :

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

Ce que fait la commande : elle demande au serveur public du testnet la fiche de clé de votre compte.

Paramètres :

- `curl` : un programme qui récupère une adresse web.
- `-s` : silencieux, il masque la barre de progression et n'affiche que la réponse.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...` : l'adresse REST du testnet, suivie de votre compte.

**Ce que vous devez voir :** pour un compte enregistré, une réponse comme celle-ci (valeurs fictives, la vôtre contient de vraies valeurs) :

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found` vaut `true` quand une clé est liée et `false` sinon. `possession_proven` vaut `true` quand la clé a été enregistrée avec une preuve de possession vérifiée.

### Ma transaction a-t-elle été signée de façon hybride ? {#check-tx}

La vérification de l'atelier 1, étape 6.

1. Remplacez `<HASH>` par le hash d'une de vos transactions (sans les `<` et `>`) et lancez :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Ce que fait la commande : elle demande au serveur public du testnet la fiche complète de votre transaction.

**Ce que vous devez voir :** un long bloc de texte. Cherchez trois choses :

1. `"code": 0` dans `tx_response`. Le code 0 veut dire succès.
2. L'extension `PQCHybridSignature`, qui contient la signature ML-DSA-87 : **4 627 octets**, à côté de la signature secp256k1 de 64 octets.
3. Dans `events`, un événement de type `pqc_hybrid_verify` dont l'attribut `status` vaut `verified`.

2. Pour n'afficher que cet événement (demande `jq`) :

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ce que fait la commande : elle récupère la même fiche et la passe à `jq`, qui ne garde que l'événement de vérification.

**Ce que vous devez voir :** un événement dont l'attribut `status` vaut `verified`.

## Clés et changements associés {#related}

- **Clés de chiffrement.** Les clés ML-KEM-1024, utilisées par [QoreSeal](/developer-tools/qoreseal) pour chiffrer des données vers un compte, vivent dans un **registre séparé**. Vous en publiez une avec `MsgRegisterKEMKey`, dans une transaction signée de façon hybride : le compte doit donc déjà avoir sa clé ML-DSA-87.
- **Changer la clé de signature.** `MsgRotatePQCKey` remplace la clé ML-DSA-87 par une nouvelle du même type, par exemple pour retirer une clé compromise. `MsgMigratePQCKey` passe d'un algorithme à un autre. Les deux demandent des signatures de l'ancienne et de la nouvelle clé, et la chaîne refuse une clé que le compte a déjà utilisée. Les deux sont actifs sur le mainnet et le testnet. Règles complètes : [Signature post-quantique](/developer-guide/post-quantum-signing).

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | Le compte n'a pas encore enregistré sa clé ML-DSA-87. | Enregistrez d'abord (`pnpm window register`, premier envoi dans QoreX ou `ensurePqcRegistered`), puis renvoyez. Vérifiez avec la requête de compte ci-dessus. |
| `PqcKeyMismatchError`, ou `registered, but NOT this key` dans `pnpm window status` | Une autre clé est déjà liée. Vous avez utilisé un autre code ou une autre phrase de récupération que la première fois. | Remettez le code ou la phrase de récupération d'origine. Pour un compte jetable, repartez avec un nouveau compte. |
| Enregistrement refusé car déjà enregistré | Le compte détient déjà une clé. Un second enregistrement brut prend quand même les frais. | Ne faites rien. Lisez le compte avec la requête ci-dessus, ou utilisez `ensurePqcRegistered`, qui vérifie d'abord. |
| Vous avez perdu votre code de récupération | Il ne peut pas être reconstruit à partir de la clé privée. | Si le compte vient d'une phrase de récupération, utilisez la même phrase : elle donne la même clé. Sinon, utilisez un nouveau compte. Sur le testnet, cela ne coûte rien. |
| L'enregistrement échoue avec un message de frais ou de solde | Le compte détient trop peu de QOR pour les frais (environ 0,09 QOR), ou les frais sont sous le plancher du réseau de 0,1 uqor par unité de gaz. | Obtenez des QOR au [faucet](https://dashboard.qorechain.io/faucet), réglez le gaz à environ 600 000 pour un enregistrement manuel, puis réessayez. |
| `found` vaut `false` alors que vous avez enregistré | Vous interrogez le mauvais réseau, ou la mauvaise adresse. | Vérifiez que vous utilisez `api-testnet.qore.host` pour le testnet et votre propre adresse `qor1...`. Un portefeuille peut afficher un autre réseau que votre projet. |
| Le compte répond `found: true` mais vos transactions échouent | La clé sur la chaîne n'est pas celle que votre projet dérive. | Lancez `pnpm window status` et comparez avec le code de récupération dans `.env`. |

## Étape suivante {#next}

Retournez au [guide de l'atelier 1](/build-before-qday/workshop-1#step-5) pour enregistrer votre clé, ou lisez la [vue d'ensemble](/build-before-qday/overview).
