---
slug: /light-node/overview
title: Vue d'ensemble du nœud léger
sidebar_label: Vue d'ensemble
sidebar_position: 1
---

# Vue d'ensemble du nœud léger

Le **nœud léger QoreChain** est un client léger qui suit le réseau QoreChain sans exécuter un validateur complet ni un nœud d'archive. Au lieu de rejouer chaque transaction, il corrobore les en-têtes de blocs sur plusieurs points de terminaison RPC, reflète depuis la chaîne les délégations et les récompenses du compte opérateur, et diffuse en direct la télémétrie du réseau — le tout à partir d'un petit binaire autonome.

Exécuter un nœud léger vous permet d'observer l'état du réseau sans le stockage, la bande passante et le coût opérationnel d'un nœud complet. La participation à la part de récompense des nœuds légers est une étape distincte, soumise à licence ; l'enregistrement est ouvert sur les deux réseaux — voir [Statut du programme de récompenses](#reward-program-status).

## Sa propre ligne de version

Le nœud léger est livré sur sa **propre ligne de version — actuellement 3.1.10** (la 3.1.9 reste acceptée) — qui est **distincte de la version de publication de la chaîne** (le mainnet exécute la chaîne `v3.2.4` depuis le 23 octobre 2026 ; le testnet exécute la `v3.2.6`). Les binaires de chaque réseau sont publiés avec un **manifeste de sommes de contrôle SHA-256** à l'adresse `https://download.qore.host/<net>/lightnode/latest.json` (`<net>` vaut `mainnet` ou `testnet`). Les deux canaux fournissent la même version 3.1.10, et les deux manifestes fixent `minCompatible` à `3.1.9` : les versions plus anciennes du nœud léger doivent donc être remplacées. La publication comprend 12 binaires — SX et UX pour Linux, macOS et Windows, chacun en amd64 et arm64 — plus un fichier `SHA256SUMS`. Voir [Édition SX](/light-node/sx-edition#install) pour les étapes de téléchargement et de vérification, et [Docker](/light-node/sx-edition#docker) pour construire une image à partir du tag source `v3.1.10`.

Une version Android est jointe à la publication GitHub uniquement en tant qu'**aperçu** : elle suit et vérifie la chaîne, mais elle ne s'enregistre pas et ne gagne rien.

Lorsque vous lisez la documentation ou les notes de version, considérez la version du nœud léger (3.1.10) et la version de la chaîne (v3.2.4 sur le mainnet, v3.2.6 sur le testnet) comme deux numéros distincts qui se trouvent partager une série majeure.

## Pourquoi exécuter un nœud léger {#why-run-a-light-node}

- **Participez à la part de récompense des nœuds légers.** Les nœuds légers enregistrés et actifs qui respectent les règles de stake et de disponibilité sont éligibles à l'**allocation de 3 % des nœuds légers** décrite ci-dessous. L'enregistrement nécessite une licence `lightnode_operator` — voir [Enregistrement et licence](/light-node/registration-and-licensing). Exécuter et synchroniser un nœud ne nécessite aucune licence.
- **Vérifiez par recoupement l'état de la chaîne qui vous est présenté.** Le nœud récupère la dernière hauteur depuis son point de terminaison RPC principal et depuis chaque point de terminaison témoin configuré en parallèle, et ne stocke un en-tête que lorsqu'ils s'accordent sur le hachage de bloc — ce qui élève l'exigence : il ne suffit plus de faire confiance à un seul point de terminaison, il faut désormais que tous les points de terminaison configurés soient compromis simultanément. Il s'agit d'une corroboration entre sources indépendantes, **pas d'une vérification cryptographique complète du consensus** (aucune vérification de l'ensemble des validateurs ni des signatures de commit). Votre nœud enregistre le mode dans lequel il fonctionne sous la valeur `assurance` de chaque ligne `synced header` de son journal de débogage (définissez `log_level = "debug"`) ; elle n'apparaît ni sur le tableau de bord du nœud ni dans `status`, et aucun service central de QoreChain ne peut la voir, puisque les choix RPC de votre nœud sont locaux à votre configuration. **`trusted-single-source`** est ce que vous obtenez sans témoin configuré — le nœud consigne un avertissement au démarrage pour le signaler, car un point de terminaison unique géré honnêtement rapporte la même valeur qu'un point de terminaison compromis. Ajoutez un témoin exploité de manière indépendante pour passer à `corroborated-across-sources`.
- **Gardez un œil sur votre stake.** Le nœud reflète depuis la chaîne les délégations du compte opérateur et vous avertit lorsqu'un validateur auquel vous déléguez passe sous un score de réputation configurable. Il ne déplace jamais de stake lui-même — les changements de délégation se font depuis votre propre portefeuille.
- **Surveillez le réseau en direct.** La télémétrie en temps réel couvre les validateurs, le consensus, le pont et la tokenomics.
- **Post-quantique dès le premier jour.** Les clés et les signatures utilisent Dilithium-5 (ML-DSA-87).

## Deux éditions : SX et UX

Le nœud léger est proposé en deux éditions construites à partir de la même base de code. Choisissez celle qui correspond à la manière dont vous souhaitez exploiter le nœud.

| Édition | Binaire | Conçu pour | Interface |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Déploiements serveur sans interface | CLI complète (commandes daemon + gestion) |
| **UX — User eXperience** | `lightnode-ux` | Usage bureau et opérateur | Tableau de bord web intégré |

- L'**édition SX** est un daemon sans interface doté d'une CLI de gestion complète. C'est le bon choix pour les serveurs, l'automatisation et les opérateurs qui vivent en ligne de commande. Voir [Édition SX](/light-node/sx-edition).
- L'**édition UX** exécute le même daemon mais ajoute un tableau de bord web intégré pour que vous puissiez surveiller la télémétrie, les délégations et les récompenses dans un navigateur. Voir [Édition UX](/light-node/ux-edition).

Les deux éditions lisent le même `config.toml`, stockent les données dans le même répertoire personnel (`~/.qorechain-lightnode` par défaut) et utilisent le même trousseau de clés Dilithium-5.

## La part de récompense de 3 % des nœuds légers {#the-3-light-node-reward-share}

La distribution des frais de QoreChain alloue une **part fixe de 3 % aux nœuds légers** (le paramètre `reward_share`, `0.03`). Voir [Tokenomics](/architecture/tokenomics) pour la répartition complète 37 % / 30 % / 20 % / 10 % / 3 % (validateurs, brûlés, trésorerie, stakers, nœuds légers).

Ces 3 % sont ce qui est versé sur le compte de module des nœuds légers ; ce n'est pas un droit par nœud. Tous les 100 blocs, la chaîne crédite à chaque nœud éligible sa part, pondérée par le stake, de ce qui s'est accumulé depuis le règlement précédent, **plafonnée par nœud**. Depuis la chaîne v3.2.3, ce plafond est de **2 000 QOR par nœud et par 30 jours** (`max_reward_per_month_per_node`, `2000000000` uqor), au prorata du temps de bloc écoulé depuis le règlement précédent et mis à l'échelle selon la disponibilité du nœud ; c'est la règle `lightnode-monthly-cap`. Avant la v3.2.3, le plafond était exprimé par bloc (`max_reward_per_block_per_node`, `1713` uqor), valeur que la requête du pool de récompenses affiche toujours. Ce plafond est une limite supérieure, pas un montant promis. Tout ce qui n'est pas gagné est déplacé vers une réserve que seul un vote de gouvernance peut débloquer, de sorte qu'aucune cagnotte ne s'accumule pour celui qui s'enregistre en premier. Vous pouvez consulter la répartition en direct avec `GET /qorechain/lightnode/v1/reward_pool`.

Pour être éligible aux récompenses, un nœud léger doit être **enregistré on-chain, actif** (prouvant sa vivacité par des battements de cœur), détenir au moins le stake minimal lié et maintenir sa disponibilité à un niveau au moins égal au minimum. L'enregistrement et la licence sont traités dans [Enregistrement et licence](/light-node/registration-and-licensing) ; la manière dont les récompenses sont créditées, réclamées et surveillées est traitée dans [Récompenses et surveillance](/light-node/rewards-and-monitoring).

## Statut du programme de récompenses {#reward-program-status}

:::note L'enregistrement est ouvert
L'enregistrement est ouvert sur le mainnet (`qorechain-vladi`, chaîne v3.2.4) et sur le testnet (`qorechain-diana`, chaîne v3.2.6). Au moment de la rédaction (23 octobre 2026), sept licences `lightnode_operator` ont été accordées sur le mainnet et un nœud léger s'est enregistré (au bloc 3 668 080). La comptabilité des récompenses est en service sur les deux réseaux depuis la mise à niveau v3.2.0. Exécuter et synchroniser un nœud ne nécessite aucune licence, mais la disponibilité est comptée **à partir du bloc où votre nœud est enregistré** ; faire tourner un nœud auparavant ne rapporte donc aucun crédit. À partir de la version de chaîne v3.2.4, le plafond de récompense par nœud démarre aussi à l'enregistrement propre du nœud : le premier règlement après l'enregistrement ne peut créditer que ce qui s'est accumulé depuis, et non depuis le règlement précédent. La v3.2.4 est sur le testnet depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026 (proposition de gouvernance 13, hauteur 3 742 566).

Le manifeste de publication (`https://download.qore.host/<net>/lightnode/latest.json`) porte le signal officiel dans son champ `registration.open`. Pour l'état en direct, interrogez `GET /qorechain/license/v1/holders/lightnode_operator` et `GET /qorechain/lightnode/v1/stats` sur `https://api.qore.host` (mainnet) ou `https://api-testnet.qore.host` (testnet).
:::

## Fonctionnalités principales en un coup d'œil

- **Corroboration d'en-têtes multi-sources** — vérifie par recoupement le dernier hachage de bloc auprès de chaque point de terminaison témoin configuré avant de lui faire confiance, sans télécharger les blocs complets, se synchronisant rapidement même depuis un démarrage à froid.
- **Suivi des délégations** — reflète depuis la chaîne les délégations du compte opérateur (lecture seule).
- **Réclamation automatique sur option** — réclame les récompenses accumulées des nœuds légers vers le compte opérateur selon un intervalle configurable. Désactivée par défaut ; elle ne re-délègue jamais.
- **Alertes de réputation** — vous avertit lorsqu'un validateur auquel vous déléguez passe sous un score de réputation configurable ; elle ne déplace pas de stake.
- **Télémétrie en temps réel** — validateurs, consensus, pont et tokenomics, rafraîchis selon des intervalles indépendants.
- **Enregistrement on-chain** — avec des preuves de vivacité par battement de cœur qui maintiennent le nœud éligible aux récompenses. L'enregistrement est soumis à licence. Le nœud signe lui-même ses transactions sous Linux, macOS et Windows ; aucun autre logiciel n'est nécessaire.
- **Cryptographie post-quantique** — clés et signatures Dilithium-5 (ML-DSA-87) partout.
- **Mode local uniquement** — exercez la pile PQC complète et exécutez le nœud de manière autonome avant de le pointer vers une chaîne en service.

Le nœud léger est publié sous la licence **Apache 2.0**.

## Où aller ensuite

- [Édition SX](/light-node/sx-edition) — installez, configurez et exécutez le daemon serveur.
- [Édition UX](/light-node/ux-edition) — exécutez l'édition à tableau de bord web.
- [Enregistrement et licence](/light-node/registration-and-licensing) — obtenez une licence et enregistrez-vous on-chain.
- [Récompenses et surveillance](/light-node/rewards-and-monitoring) — comment la part de 3 % est créditée et réclamée, et comment maintenir le nœud en bonne santé.
- [Tokenomics](/architecture/tokenomics) — comment la part de récompense des nœuds légers s'inscrit dans l'économie plus large.
