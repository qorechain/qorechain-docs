---
slug: /architecture/chain-licensing
title: Licences de chaîne
sidebar_label: Licences de chaîne
sidebar_position: 9
---

# Licences de chaîne

Le module `x/license` fournit des **licences de capacité** on-chain. Certaines capacités restreintes sur QoreChain — notamment les fonctionnalités de bridge et de validateur par chaîne — exigent que le compte agissant détienne une licence valide pour cette capacité. Une licence est simplement un enregistrement on-chain qui autorise un détenteur spécifique (le **bénéficiaire**) à utiliser une **fonctionnalité** restreinte spécifique.

Les licences gardent ces capacités vérifiables et auto-descriptives : tout intégrateur, explorateur ou portefeuille peut demander à la chaîne si un compte donné est autorisé pour une fonctionnalité donnée, sans aucune recherche off-chain requise.

## Ce que représente une licence

Chaque licence est un enregistrement indexé par une paire `(grantee, feature_id)` :

- **`grantee`** — le compte `qor` que la licence autorise.
- **`feature_id`** — la capacité restreinte qu'elle déverrouille. Les ID de fonctionnalités sont des identifiants de chaîne de caractères stables ; les capacités de bridge et de validateur sont nommées par chaîne cible (par exemple `bridge_ethereum`, `validator_solana`), aux côtés de fonctionnalités parapluie telles que les fonctionnalités de protocole de bridge et d'opérateur de nœud/validateur.
- **`granted_at`** / **`expires_at`** — la hauteur de bloc à laquelle la licence a été accordée, et la hauteur de bloc à laquelle elle expire (une valeur de `0` signifie qu'elle n'expire pas).
- **`granted_by`** — l'autorité qui a émis la licence.

Une capacité restreinte derrière une fonctionnalité vérifie simplement, au moment de l'exécution, si le compte agissant détient une licence **active** pour cette fonctionnalité.

## Cycle de vie d'une licence

Une licence traverse un petit ensemble d'états :

| État | Signification |
| --- | --- |
| **Accordée / Active** | La licence existe et autorise le bénéficiaire. Elle compte comme active tant qu'elle n'est ni suspendue ni expirée. |
| **Suspendue** | Temporairement désactivée. L'enregistrement existe toujours, mais la capacité restreinte est refusée jusqu'à ce que la licence soit reprise. |
| **Révoquée** | Supprimée définitivement. Le bénéficiaire ne détient plus du tout la licence. |

Une licence cesse également d'être active une fois sa hauteur `expires_at` dépassée, même si elle n'a jamais été suspendue ni révoquée.

## Qui peut modifier les licences

L'octroi, la révocation, la suspension et la reprise de licences sont des **opérations d'autorité** — elles sont effectuées par l'autorité de gouvernance de la chaîne, et non par des utilisateurs arbitraires. Ces transactions existent dans la surface de commandes du module, mais un utilisateur normal ne les appelle pas directement ; le cycle de vie est administré on-chain par l'autorité.

Pour **obtenir** une licence, les intégrateurs passent par le **Dashboard (Outils → Acheter une licence)**, qui gère le flux de demande ; l'autorité enregistre ensuite l'octroi on-chain.

Les transactions restreintes à l'autorité sont :

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Vérifier et valider une licence

Les commandes de requête sont ouvertes à tous. Elles constituent la partie du module que les intégrateurs utilisent au quotidien — pour confirmer qu'un compte est autorisé avant de s'appuyer sur une capacité restreinte, ou pour afficher le statut d'une licence dans un portefeuille ou un explorateur.

### Vérifier une licence unique

`check` indique si un bénéficiaire spécifique détient une fonctionnalité spécifique, et si cette licence est actuellement **active**. C'est l'appel canonique « ce compte est-il autorisé à faire X ».

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

La réponse comprend les détails de la licence et un champ booléen `active` qui tient déjà compte de la suspension et de l'expiration — ainsi, un `true` signifie que le bénéficiaire peut utiliser la fonctionnalité restreinte dès maintenant.

### Lister les licences d'un bénéficiaire

`list` renvoie toutes les licences détenues par un compte, pour l'ensemble des fonctionnalités.

```bash
qorechaind query license list qor1grantee...
```

### Lister les détenteurs d'une fonctionnalité

`holders` renvoie tous les comptes qui détiennent une licence pour une fonctionnalité donnée — utile pour énumérer, par exemple, qui est autorisé pour une capacité de bridge ou de validateur particulière.

```bash
qorechaind query license holders bridge_ethereum
```

## Récapitulatif des commandes

**Transactions** (`qorechaind tx license …`) — restreintes à l'autorité / la gouvernance :

| Commande | Objectif |
| --- | --- |
| `grant` | Autoriser un bénéficiaire pour une fonctionnalité |
| `revoke` | Supprimer définitivement une licence |
| `suspend` | Désactiver temporairement une licence |
| `resume` | Réactiver une licence suspendue |

**Requêtes** (`qorechaind query license …`) — ouvertes à tous :

| Commande | Objectif |
| --- | --- |
| `check` | Vérifier une licence `(grantee, feature)` et son état actif |
| `list` | Lister toutes les licences détenues par un bénéficiaire |
| `holders` | Lister tous les bénéficiaires détenant une fonctionnalité donnée |

## Voir aussi

- Les licences pour les fonctionnalités de bridge et de validateur sous-tendent les capacités décrites dans [Architecture du bridge](/architecture/bridge-architecture).
- Les licences s'obtiennent via le **Dashboard (Outils → Acheter une licence)**.
- Les nœuds légers obtiennent une licence lors de l'[Enregistrement et licences](/light-node/registration-and-licensing).
- Achetez et gérez vos licences depuis le [Hub d'outils](/dashboard/tools-hub).
