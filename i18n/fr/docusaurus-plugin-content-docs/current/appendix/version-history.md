---
slug: /appendix/version-history
title: Historique des versions
sidebar_label: Historique des versions
sidebar_position: 3
---

# Historique des versions

Historique public des versions de QoreChain. Le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en production depuis le 7 juin 2026) exécute **v3.2.4** (appliquée par la proposition de gouvernance 13 à la hauteur 3 742 566 le 23 octobre 2026 ; la version précédente, v3.2.3, a été appliquée à la hauteur 3 662 051 le 20 octobre 2026). La proposition de gouvernance 14 appliquerait v3.2.5 sur le mainnet à la hauteur 3 906 833 (en période de vote au moment de la rédaction, le 27 octobre 2026). Le testnet **`qorechain-diana`** (EVM chain ID **9800**) exécute **v3.2.6** (appliquée à la hauteur 8 970 638 le 27 octobre 2026) ; v3.2.4 l'a atteint à la hauteur 8 337 253 (19 octobre 2026) et v3.2.5 à la hauteur 8 890 800 (26 octobre 2026).

:::note
Les entrées ci-dessous sont des résumés de capacités de haut niveau. Les entrées `v1.x` antérieures sont conservées comme trace historique de la lignée de versions testnet qui a précédé le mainnet. Le manifeste de version ([Se connecter au mainnet](/getting-started/connecting-to-mainnet)) est promu séparément du tag et peut avoir un certain décalage par rapport à celui-ci — vérifiez-le directement pour savoir ce qu'une nouvelle installation télécharge réellement.
:::

## Chronologie de gouvernance du mainnet {#governance-timeline}

Propositions qui ont modifié le mainnet en production depuis le 14 octobre 2026. Les huit sont des propositions accélérées (période de vote d'un jour) ; les propositions 7 à 13 ont été adoptées avec tout le stake bonded votant en faveur, et la proposition 14 est encore en cours de vote au moment de la rédaction. La liste complète se trouve à `GET /cosmos/gov/v1/proposals` sur `https://api.qore.host`.

| Proposition | Ce qu'elle fait | Vote | Résultat |
| --- | --- | --- | --- |
| 7 | Applique v3.2.2 à la hauteur 3 556 788 | 14–15 octobre 2026 (se termine à 21:24 UTC) | Adoptée ; appliquée le 16 octobre 2026 |
| 8 | Libère la réserve des light nodes (3 156 983,796395 QOR) vers la fondation | 18–19 octobre 2026 (se termine à 19:15 UTC) | Adoptée |
| 9 | Libère la part des stakers bloquée (6 693 045,921330 QOR) vers la fondation | 18–19 octobre 2026 (se termine à 19:15 UTC) | Adoptée |
| 10 | Émission : fixe l'émission fixe à 86 000 QOR par époque et le plafond cumulatif à 590 000 000 QOR (durée d'époque inchangée ; la première époque à 86 000 QOR commence au bloc 3 672 000) | 18–19 octobre 2026 (se termine à 19:15 UTC) | Adoptée |
| 11 | Applique v3.2.3 à la hauteur 3 662 051 | 18–19 octobre 2026 (se termine à 19:15 UTC) | Adoptée ; appliquée le 20 octobre 2026 |
| 12 | Libère la part des stakers bloquée corrigée (3 807 496,785528 QOR, recalculée à la hauteur de v3.2.3) vers la fondation | 20 octobre 2026 à 20:01 UTC jusqu'au 21 octobre 2026 à 20:01 UTC | Adoptée |
| 13 | Mise à niveau coordonnée vers v3.2.4 à la hauteur 3 742 566 : staking à verrouillage temporel facultatif, borne de récompense des light nodes comptée depuis l'enregistrement, indicateur de possession pour les clés post-quantiques, preuve de possession pour les validateurs de pont, fenêtre de contestation du RDK exprimée en temps de bloc, et durcissement local au nœud | 20 octobre 2026 à 21:18 UTC jusqu'au 21 octobre 2026 à 21:18 UTC | Adoptée ; appliquée le 23 octobre 2026 à la hauteur 3 742 566 |
| 14 | Mise à niveau coordonnée vers v3.2.5 (build 2) à la hauteur 3 906 833 (les nœuds restent sur v3.2.4 jusqu'à cette hauteur, s'y arrêtent et redémarrent sur v3.2.5 ; la signature des transactions est inchangée) | 27 octobre 2026 à 00:29 UTC jusqu'au 28 octobre 2026 à 00:29 UTC | En cours de vote au moment de la rédaction. Le contenu de v3.2.5 est documenté le jour où le mainnet l'applique |

Voir [Tokenomics](/architecture/tokenomics#stranded-and-reserve) pour la signification de ces libérations et [Gouvernance](/user-guide/governance) pour savoir comment voter.

---

## Versions v3.2.5 et v3.2.6 du testnet (testnet uniquement pour l'instant) {#testnet-v326}

Le testnet `qorechain-diana` reçoit chaque version quelques jours avant le mainnet. Le mainnet n'est modifié par rien de ce qui figure dans cette section : il exécute v3.2.4 jusqu'à ce qu'une mise à niveau de gouvernance en décide autrement.

### v3.2.6 — Routes de requête, valeurs PRISM en direct et jetons de test (testnet)

**Axe de la version :** Appliquée sur le testnet par la proposition de gouvernance 28 du testnet à la hauteur **8 970 638** (27 octobre 2026, 16:58 UTC). Le manifeste du testnet fixe `version` et `minCompatible` à 3.2.6 avec `upgradeHeight` 8970638 : un nœud qui rejoint le testnet a donc besoin de v3.2.6. Le format de signature, les adresses, les décimales, les mémos et les frais sont inchangés.

* **Nouvelles routes de lecture du testnet.** `GET /qorechain/pqc/v1/params`, la route client IBC v2 `/ibc/core/client/v2/counterparty_info/{client_id}`, et l'ensemble complet des requêtes PRISM (`x/rlconsensus`) sous `/qorechain/rlconsensus/v1/` (`agent`, `params`, `observation`, `reward`, `policy`, `applied_params`, `last_action`). Le mainnet répond 501 (non implémenté) sur les routes PRISM, sur les paramètres PQC et sur le client IBC v2. Les routes AMM sous `/qorechain/amm/v1/` (`pools`, `quote/exact_in`, `pools/{id}/lp/{address}`) répondent sur les deux réseaux. Voir la [référence REST / gRPC](/api-reference/rest-grpc-endpoints).
* **Agent PRISM.** L'agent du testnet est en mode shadow (défini par la proposition de gouvernance 29 du testnet) : il observe tous les 10 blocs, calcule une récompense et une action proposée, et les enregistre sans modifier aucune valeur. Le disjoncteur de l'agent a été corrigé et son historique est borné. Voir [PRISM](/architecture/prism-consensus-engine).
* **Valeurs PRISM en direct dans l'EVM.** Le précompilé `rlConsensusParams` renvoie désormais les valeurs appliquées du module au lieu de nombres fixes.
* **Retrait de délégation de stake verrouillé refusé plus tôt.** Le mempool refuse un retrait de délégation ou une redélégation de stake verrouillé avant qu'il ne coûte des frais ; une simulation de transaction renvoie aussi le code d'erreur typé.
* **RDK.** Les requêtes de lots gagnent un champ `withdrawals_bound`.
* **Limite de débit IBC (testnet uniquement).** Un limiteur de débit par canal pour les transferts IBC : les quotas correspondent à un pourcentage entier de l'offre par fenêtre de quelques heures. **La gouvernance fixe les limites ; rien n'est automatique, et aucune limite n'est définie aujourd'hui** (un ensemble vide signifie illimité). Un paquet relayé est comptabilisé sur les deux canaux, et un remboursement restitue le quota.
* **Transfert de paquets IBC (testnet uniquement).** Un transfert IBC v1 entrant peut porter un mémo `forward` (destinataire, port, canal) qui l'envoie vers un autre canal, avec remboursement à l'expéditeur si un saut échoue. Il n'y a aucune nouvelle tentative et le délai d'expiration par défaut d'un saut est de 10 minutes ; un jeton qui se convertit en ERC-20 à l'arrivée ne peut pas être transféré.
* **Clients légers 08-wasm (testnet uniquement).** Les messages de client léger 08-wasm (enregistrer, migrer et supprimer un binaire de client) sont ajoutés, réservés à l'autorité. Les types de client autorisés ne contiennent toujours que le client standard : aucun client léger wasm ne peut donc être créé tant que la gouvernance n'ajoute pas `08-wasm`.
* **Jetons de test Fest.** Trois contrats ERC-20 déployés pour le fest des builders ont été enregistrés par la gouvernance du testnet (proposition 26) comme dénominations bank : fUSD (6 décimales), fETH (18) et fBTC (8). Ce sont des jetons de test réservés au testnet, sans aucune valeur. Voir [Faucet](/dashboard/faucet#fest-tokens).

### v3.2.5 (testnet)

**Axe de la version :** Appliquée sur le testnet par la proposition de gouvernance 15 du testnet à la hauteur **8 890 800** (26 octobre 2026). Sur le mainnet, la proposition de gouvernance 14 appliquerait v3.2.5 (build 2) à la hauteur 3 906 833 et était en période de vote au moment de la rédaction. Les fonctionnalités de v3.2.5 sont documentées dans cet historique le jour où le mainnet l'applique.

---

## v3.2.4 — Fenêtre d'enregistrement des light nodes et staking à verrouillage temporel facultatif (mainnet)

**Axe de la version :** La version actuelle du mainnet. Elle s'est exécutée d'abord sur le testnet `qorechain-diana` : la proposition de gouvernance 13 du testnet l'a appliquée à la hauteur **8 337 253** (19 octobre 2026). Sur le mainnet, la proposition de gouvernance 13 l'a appliquée à la hauteur **3 742 566** le 23 octobre 2026 : les nœuds sont restés sur v3.2.3 jusqu'à ce bloc, s'y sont arrêtés et ont redémarré sur v3.2.4, et la signature des transactions est inchangée. Le manifeste du mainnet fixe `minCompatible` à 3.2.4 : un nœud qui rejoint le mainnet a donc besoin de v3.2.4 (le testnet est depuis passé à v3.2.6). Chaque fonctionnalité ci-dessous est en production sur le mainnet et sur le testnet.

* **Fenêtre d'enregistrement des light nodes.** La borne de récompense d'un light node commence au plus tardif du règlement précédent et de l'enregistrement du nœud lui-même, de sorte qu'un nouvel enregistrement ne perçoit pas un montant accumulé avant son arrivée.
* **Staking à verrouillage temporel facultatif (`x/stakingtier`, un nouveau module).** Un délégateur peut verrouiller une partie d'une délégation pour 3, 6 ou 12 mois ; la partie verrouillée ne peut être ni retirée de la délégation ni redéléguée, et un déverrouillage anticipé est autorisé moyennant une pénalité qui est brûlée. Le verrouillage minimal est de 10 QOR. Voir [Staking et délégation](/user-guide/staking-and-delegation#time-locked-staking).
* **Nouveau mode d'émission.** `x/inflation` gagne un troisième mode d'émission, `target_apy`, avec un paramètre `target_apy_bps` (`0` sur les deux réseaux ; le mode en vigueur sur le mainnet est toujours `fixed`). Modifier le mode d'émission d'un réseau est une décision de gouvernance distincte ; le mode en vigueur est affiché à `/qorechain/inflation/v1/params`.
* **Indicateur `possession_proven`** sur les enregistrements de compte post-quantiques ; la preuve de possession des clés de compte reste facultative.
* **Preuve de possession des validateurs de pont.** L'enregistrement d'un validateur de pont exige une preuve de possession et une clé qu'aucun autre validateur de pont n'utilise.
* **Fenêtre de contestation RDK en temps de bloc.** La fenêtre de contestation optimiste est comptée en temps de bloc plutôt qu'en un nombre de blocs qui en est dérivé.
* **Durcissement local au nœud** (bornes des requêtes JSON-RPC, budget des chunks de state-sync, pré-vérifications d'enregistrement de clé) et nouvelles requêtes (`protocol_features`, `auth_nonce`, et les champs supplémentaires du pool de récompenses des light nodes tels que `monthly_cap_active`).

## v3.2.3 — Deuxième lot de sécurité d'octobre

**Axe de la version :** Le deuxième lot de durcissement d'octobre, appliqué sur le mainnet par la proposition de gouvernance 11 à la hauteur **3 662 051** (20 octobre 2026, 16:01 UTC) ; appliqué plus tôt sur le testnet à la hauteur 8 003 746 (15 octobre). La mise à niveau active 52 fonctionnalités de protocole à cette hauteur ; le format de signature, les adresses, les décimales, les mémos et les frais sont inchangés.

* **Intégrité des clés post-quantiques.** Les clés faibles, dégénérées et déjà utilisées sont refusées à l'enregistrement ; la maintenance des clés hybrides est renforcée ; les messages de gestion de clés post-quantiques ne peuvent plus passer par authz ; un compte ne peut pas retirer son dernier algorithme de signature. L'enregistrement (`MsgRegisterPQCKeyV2`, `tx pqc register-key-v2 ... --pqc-key <name>`) accepte une **preuve de possession facultative**, vérifiée lorsqu'elle est présente.
* **Fenêtres EVM à portée restreinte.** `MsgOpenEVMWindow` accepte les champs facultatifs `native_only` (transferts de QOR natif simples uniquement) et `allowed_targets` (jusqu'à 16 destinataires) qui restreignent une fenêtre. Voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).
* **Registre d'escrow de rollup** pour le RDK, une **file d'attente cross-VM atomique** avec durcissement des precompiles, et **autorisation de stake canonique**.
* **Création de vesting limitée à soi-même.** La création d'un compte de vesting ne peut alimenter que le propre compte du créateur (les trois messages de vesting restent en outre désactivés sur le disjoncteur).
* **Correctifs d'économie.** L'année d'émission est dérivée de la durée d'époque ; le travail de fin de bloc de l'AMM est borné ; les enregistrements de combustion sont élagués ; la part des stakers bloquée enregistrée a été recalculée à la hauteur de la mise à niveau, de 0 à 3 807 496,79 QOR (voir [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Borne mensuelle des light nodes.** La borne de récompense par nœud est désormais exprimée par mois : 2 000 QOR par nœud par 30 jours, au prorata du temps de bloc et de la disponibilité.
* **Autorité de licence gouvernable.** Un nouveau `MsgUpdateAuthority` permet à la gouvernance de remplacer l'autorité qui accorde les licences.
* **Les builds publics refusent les réseaux publics.** Un binaire construit à partir de l'arborescence source publique s'arrête s'il est pointé vers un réseau en production.
* **Nouvelles routes de lecture.** Les paramètres et l'enregistrement d'époque de `x/inflation` sont servis via REST sur le mainnet (`/qorechain/inflation/v1/params`, `/epoch_info`).

## v3.2.2 — Mise à jour des dépendances et premier lot de sécurité d'octobre (mainnet)

**Axe de la version :** Une mise à niveau coordonnée appliquée sur le mainnet par la proposition de gouvernance 7 à la hauteur **3 556 788** (16 octobre 2026, 17:59 UTC) ; appliquée sur le testnet à la hauteur 6 905 034 (2 octobre). Le format de signature est inchangé.

* **Dépendances.** Cosmos SDK v0.53.8, moteur de consensus v0.38.26 et ibc-go v10.7.
* **26 fonctionnalités de protocole** s'activent à la hauteur de mise à niveau, notamment : la délégation EIP-7702 exige un consentement post-quantique (`MsgAuthorizeEVMDelegation`, annulé par `MsgClearEVMDelegation` ou `MsgCloseEVMWindow`) ; les bornes multisig sont appliquées pendant l'exécution des blocs ; l'admission des validateurs est vérifiée sur chaque chemin ; contrôles d'intégrité de l'AMM ; les comptes de module ne peuvent pas être réclamés via l'EVM ; les transactions pré-EIP-155 sont refusées ; l'enregistrement de clé post-quantique valide la clé classique ; le message d'ancrage RDK et multilayer passe à une seconde forme (v2) ; et le canal de combustion des transactions échouées est appliqué.

## v3.2.1 — Durcissement des nœuds

**Axe de la version :** Une version de sécurité locale au nœud pour le mainnet (14 octobre 2026) : **aucune hauteur de mise à niveau, aucun changement de consensus et aucun vote de gouvernance**. Les nœuds sous v3.2.0 continuent de suivre la chaîne.

* Renforce les limites de ressources de l'API publique, borne le JSON-RPC EVM et le mempool, et propage par gossip les transactions EVM promues.
* Fixe le chain ID EVM dans la configuration du nœud et le recoupe avec le chain ID Cosmos ; les opérateurs doivent définir `evm-chain-id = 9801` dans `app.toml` (une valeur différente est journalisée comme une erreur).
* Met à jour la dépendance du moteur de consensus ; maintenez l'horloge système synchronisée par NTP (un décalage de plus de 60 secondes arrête le nœud).
* Recommandée pour tous les opérateurs ; `minCompatible` dans le manifeste mainnet valait alors 3.2.0.

v3.2.1 a été appliquée nœud par nœud et n'a pas de hauteur de mise à niveau ; elle a été remplacée sur le mainnet par v3.2.2 (16 octobre), v3.2.3 (20 octobre) et v3.2.4 (23 octobre).

## v3.2.0 — Fenêtre d'autorisation EVM et correctifs de comptabilité

**Axe de la version :** Rendre l'exigence post-quantique effective sur toutes les voies, et combler deux lacunes de comptabilité. Appliquée sur le mainnet par la proposition de gouvernance n° 6 à la hauteur **2 981 742** (25 septembre 2026, 12:07 UTC) ; appliquée sur le testnet à la hauteur 5 920 000.

* **Fenêtre d'autorisation EVM (rupture pour les portefeuilles EVM).** Une transaction EVM n'est désormais admise que depuis un compte disposant d'une clé ML-DSA-87 enregistrée **et** d'une fenêtre ouverte. La fenêtre est ouverte par un message de la voie Cosmos (`MsgOpenEVMWindow`, signé post-quantique) et bornée en blocs (≤ 17 280), en transactions (≤ 1 000) et en valeur totale (valeur transférée plus les frais maximaux de chaque transaction) ; `MsgCloseEVMWindow` la révoque. La signature Ethereum standard reste inchangée à l'intérieur d'une fenêtre. La voie EVM, qui avait été coupée sur le mainnet via le disjoncteur depuis le 16 septembre, a été rouverte dans le même bloc que celui où la règle est entrée en vigueur. Voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).
* **Signature hybride v2.** Les signatures post-quantiques portent désormais sur des octets à signer étiquetés par domaine et liés à la chaîne ; la première forme est refusée à partir de la hauteur de mise à niveau. Les clients consultent les plans de mise à niveau appliqués du nœud pour choisir la forme ; la CLI (`--sign-bytes auto`), le SDK 0.8.x et wallet-adapter 0.2.x le font. Les charges utiles de migration de clé et d'attestation de pont sont passées au même schéma. Voir [Sécurité post-quantique](/architecture/post-quantum-security#sign-bytes-v2).
* **Part des stakers versée.** La part de 10 % des stakers dans la répartition des frais était déposée à un endroit où elle ne correspondait à aucune créance ; à partir de cette mise à niveau, elle est versée comme une récompense de staking normale. Le montant déjà accumulé (6 693 045,92 QOR sur le mainnet) est enregistré on-chain (`GET /qorechain/burn/v1/stranded_rewards`) et ne pouvait être déplacé que par un vote de gouvernance (`MsgReleaseStrandedRewards`) ; la gouvernance l'a libéré en octobre 2026 (voir la [chronologie de gouvernance](#governance-timeline) et [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Réserve de récompenses des light nodes.** La part de 3 % des light nodes accumulée pendant qu'aucun nœud n'était éligible (3 156 009,33 QOR sur le mainnet) est enregistrée comme réserve (`GET /qorechain/lightnode/v1/reward_pool`), exclue de la distribution et déplaçable uniquement par la gouvernance (libérée en octobre 2026) ; la distribution ne verse ensuite que ce qui s'est accumulé depuis l'exécution précédente, borné par nœud. L'enregistrement des light nodes était encore fermé à cette version et s'est depuis ouvert (voir [Nœud léger](/light-node/overview#reward-program-status)).
* **La limite de transactions par expéditeur** est désormais appliquée (600 transactions par 30 blocs et par expéditeur, afin que les relayers puissent fonctionner).
* **La table des versions de modules de l'upgrade** liste désormais tous les modules (48), corrigeant une lacune qui aurait affecté les migrations ultérieures.
* Également : module de compte du pont et charges utiles d'attestation durcis, blocs proposés validés, règlement des rollups restreint au séquenceur du rollup avec escrow par rollup et une combustion de création effective, stake du créateur multilayer verrouillé à l'enregistrement et restitué au démantèlement, indicateur `enabled` du compte intelligent appliqué sur tous les chemins, et chemins d'admission de validateurs et de création de vesting fermés à l'imbrication authz.

## v3.1.96 + v3.1.97 — Verrouillage de l'accès QoreChain Native

**Axe de la version :** Fermer le téléversement et l'instanciation permissionless de code de contrat, suite à un avis de sécurité de l'industrie portant sur CosmWasm, le runtime sur lequel QoreChain Native est construit.

* **Le téléversement et l'instanciation de contrats nécessitent désormais une permission explicite.** `code_upload_access` et `instantiate_default_permission` sont réglés sur `Nobody` sur le mainnet comme sur le testnet — vérifié en production, indépendamment de celui de ces deux tags qu'exécute un nœud donné, puisqu'il s'agit d'un paramètre on-chain plutôt que d'une règle appliquée seulement par les binaires les plus récents. Voir [Développement QoreChain Native](/developer-guide/cosmwasm-development) pour ce que cela signifie si vous développez un contrat. Les contrats déjà instanciés ne sont pas affectés — `execute` et `query` fonctionnent comme avant. Les deux réseaux ont également les trois messages QoreChain Native de téléversement et d'instanciation désactivés sur le disjoncteur.
* **Builds de version à adresse indépendante de la position (PIE)**, conformément aux recommandations de durcissement du même avis, de sorte que l'adresse mémoire qu'un exploit devrait deviner est randomisée par processus. Les binaires à liaison dynamique n'ont nécessité qu'un seul indicateur de build ; vérifié comme n'affectant pas l'état.

## v3.1.95 — Durcissement de l'EVM Cosmos

**Axe de la version :** Mise à jour de sécurité progressive de la bibliothèque de comptabilité des soldes EVM.

* **Durcissement contre les dépassements** — Un chemin de mise à jour de solde EVM échoue désormais de manière sûre au lieu de boucler silencieusement (wrap) en cas de condition de dépassement extrême. Livré sous forme de mise à jour progressive, sans rupture de consensus — aucun vote de gouvernance ni hauteur d'arrêt coordonné n'a été nécessaire.

## v3.1.94 — Plafonnement de l'émission et durcissement des messages administratifs

**Axe de la version :** Aligner l'émission des récompenses de staking sur les conditions réelles du réseau, et renforcer les contrôles d'autorisation sur les messages administratifs privilégiés.

* **Plafonnement de l'émission** — Une proposition de gouvernance, adoptée avec le plein soutien du stake bonded et appliquée à la hauteur 2 122 074 (26 août 2026), a remplacé le calendrier d'émission décroissant d'origine par un montant fixe par époque sous un plafond cumulatif strict. Le calendrier d'origine avait été calibré pour un réseau bien plus mature et entièrement bonded ; rapporté au stake bonded réel, il versait des récompenses bien plus vite que prévu. Le montant par époque et le plafond ont été relevés par la proposition de gouvernance 10 le 19 octobre 2026. Voir [Tokenomics](/architecture/tokenomics#staking-reward-schedule) pour les chiffres actuels.
* **Durcissement des messages administratifs** — Un ensemble de messages administratifs privilégiés, protégés par autorité, font désormais vérifier leur signataire par rapport à l'adresse propre du module de gouvernance plutôt que de faire confiance à une valeur portée par le message lui-même.
* Intègre également la correction de fiabilité de l'intégration des nœuds de la v3.1.92, pour tout nœud passant directement à cette version.

## v3.1.92 — Fiabilité de la synchronisation des nœuds

**Axe de la version :** Intégration plus fiable des nœuds à partir des snapshots et de l'archive de chaîne publiée.

* **Correction de la synchronisation par snapshot et archive** — Résolution d'un problème où un nœud se restaurant à partir d'un snapshot state-sync ou de l'archive de chaîne publiée pouvait échouer à terminer la synchronisation au-delà de certains blocs historiques. L'intégration via l'une ou l'autre méthode se termine désormais de manière fiable.

## v3.1.90 — Comptabilisation de la disponibilité des light nodes

**Axe de la version :** La disponibilité mesurée pour l'éligibilité aux récompenses des light nodes s'accumule désormais de manière cohérente dans le temps.

* **Accumulation prospective de la disponibilité** — La disponibilité d'un light node déterminant son éligibilité aux récompenses est désormais calculée en accumulant son nombre de heartbeats attendu de manière prospective depuis son propre enregistrement, à l'intervalle de heartbeat en vigueur à chaque instant, plutôt qu'en recalculant tout son historique sous l'intervalle actuellement en vigueur. Un changement de gouvernance sur l'intervalle de heartbeat n'affecte donc que l'avenir et ne réévalue jamais rétroactivement les performances passées d'un nœud.

## v3.1.86 — Sauvegarde de récupération pour les validateurs

**Axe de la version :** Un validateur ne peut plus être définitivement bloqué dans sa récupération après une mise en prison pour indisponibilité.

* **Correction du blocage de mise en prison** — Un compte opérateur de validateur sans clé post-quantique enregistrée peut désormais toujours soumettre `MsgUnjail` pour se remettre d'une mise en prison pour indisponibilité, même lorsque l'application des signatures hybrides est réglée sur obligatoire avec le repli classique désactivé. Auparavant, un tel compte n'avait aucun moyen de récupération, puisque la sortie de prison nécessitait d'envoyer une transaction qu'il lui était justement interdit d'envoyer.
* **Snapshots state-sync** — La génération de snapshots est activée sur l'ensemble du réseau, permettant aux nouveaux validateurs et full nodes de rejoindre rapidement via state sync plutôt que par une relecture historique complète.

## v3.1.85 — Dépenses déléguées via des portefeuilles liés

**Axe de la version :** Une clé de portefeuille externe liée (Phantom, MetaMask) peut désormais **dépenser** depuis l'unique compte post-quantique canonique — sous permissions à moindre privilège, limites de dépense et révocation instantanée.

* **Voies d'exécution par authenticator** — Deux nouveaux messages permettent à un authenticator enregistré d'autoriser des transferts depuis le compte canonique sans que le propriétaire du compte soit présent : **`MsgExecuteEVM`** (un appel/transfert EVM depuis l'adresse `0x…` du compte) et **`MsgExecuteCosmos`** (un envoi bancaire sur la voie native). Un **relayer** soumet l'enveloppe et en paie les frais — sa propre signature PQC hybride satisfait les exigences de la transaction — tandis que la signature de l'authenticator sur des sign bytes séparés par domaine et liés anti-rejeu constitue l'autorisation. La clé externe n'a jamais besoin d'une co-signature ML-DSA.
* **MetaMask comme authenticator** — Les authenticators secp256k1 peuvent désormais être enregistrés par leur **adresse Ethereum de 20 octets** et vérifiés via **EIP-191 `personal_sign`** (en plus de la forme à clé compressée de 33 octets), de sorte qu'un compte MetaMask standard peut être lié et dépenser sous limites.
* **Application sur les trois voies** — Les portées de permission et les limites de valeur **SpendingRule** (plafonds par transaction et quotidiens) sont appliquées sur les voies Native, EVM et SVM ; les messages de gestion de clés ne sont jamais délégables. Des codes d'erreur distincts permettent aux portefeuilles d'afficher le bon message : `5` limite de dépense dépassée, `6` authenticator expiré, `10` permission refusée, `11` rejeu rejeté.
* **Requête du schéma de permissions** — `GET /qorechain/abstractaccount/v1/permission_schema` (également disponible en gRPC/CLI) renvoie la taxonomie canonique des permissions (11 permissions), la correspondance message→permission, et la liste des messages non délégables, afin que les portefeuilles valident les portées sans les coder en dur.
* **Rotation de clé PQC de même algorithme** — La nouvelle commande **`MsgRotatePQCKey`** fait tourner la clé ML-DSA-87 d'un compte au sein du même algorithme (double signature par l'ancienne et la nouvelle clé), permettant la migration de clés dérivées de manière historique vers la dérivation canonique liée à l'adresse, ainsi que le retrait d'une clé compromise. Nouvelles commandes CLI : `tx pqc rotate-key` et `tx pqc recover-key` (récupération déterministe de clé à partir d'un mnémonique).
* **Transactions par clé racine inchangées** — Ces changements sont additifs ; les flux normaux de portefeuille et d'échange restent inchangés. Les opérateurs de nœuds doivent être sur **v3.1.85** à la hauteur de bloc de mise à niveau du réseau.
* **État actuel** — Les fonctionnalités de compte intelligent et de portefeuille lié sont implémentées mais **désactivées sur le mainnet** (`abstractaccount.enabled = false`) et activées sur le testnet (vérifié le 27 octobre 2026) ; sur le mainnet, à partir de v3.2.0, tout chemin d'authenticator est refusé tant que l'indicateur est désactivé. Vérifiez `GET /qorechain/abstractaccount/v1/config` avant de proposer un parcours de liaison.

## v3.1.84 — Permissions des authenticators et limites de dépense

**Axe de la version :** Le modèle de permissions derrière les dépenses déléguées.

* **Taxonomie canonique des permissions** — Onze permissions (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) avec une correspondance message→permission fermée par défaut : un type de message non mappé est refusé, et les messages de gestion de clés ne peuvent jamais être délégués.
* **Application de SpendingRule** — Les plafonds de dépense par transaction et par jour (UTC), avec listes de dénominations autorisées, sont appliqués et enregistrés par paire (compte, authenticator).
* **Autorisation sur la voie SVM** — Les actions autorisées par une clé de schéma étranger (par exemple Phantom ed25519) sur la voie SVM passent par la même porte d'autorisation centrale.

## v3.1.83 — Signature de compte unifiée sur les trois interfaces

**Axe de la version :** Une seule clé, un seul compte — une identité unifiée unique qui peut désormais **signer**, et pas seulement détenir un solde, sur les interfaces Cosmos, EVM et SVM.

* **Une seule clé signe sur chaque voie** — Un compte créé nativement en format eth (adresse = keccak de sa clé publique secp256k1) signe désormais les transactions sur la voie Cosmos avec le schéma `eth_secp256k1`, en plus des transactions EVM. Ses formes `qor1…` (Cosmos), `0x…` (EVM) et Solana-VM (base58) sont une seule identité de 20 octets qui **détient un seul solde** et **dépense sur les trois voies** — y compris les transactions Cosmos hybrides post-quantiques (ML-DSA-87).
* **Signature post-quantique inchangée** — Le compte unifié enregistre toujours sa clé ML-DSA-87 et porte la signature hybride FIPS-204 exigée par la chaîne ; la partie classique est `eth_secp256k1` (keccak) au lieu du schéma coinType-118. Les comptes coinType-118 existants ne sont pas affectés.
* **Mise à niveau progressive neutre pour le consensus** — Livrée sous forme de mise à niveau binaire progressive sur les deux réseaux, **sans nouvelle genèse ni arrêt de chaîne**. Les soldes de comptes, l'historique et la genèse restent inchangés.
* **Outillage client** — `@qorechain/wallet-adapter` 0.1.5 ajoute la signature Cosmos native eth (`signClassicalEth` / `signHybridEth`), la génération unifiée à 3 adresses, et `walletFromSeed` (dérive le compte canonique à partir de n'importe quelle seed de 32 octets — par exemple une signature Phantom) ; `@qorechain/chain-bridge` gagne un chemin de signature `eth_secp256k1`.

:::caution Opérateurs de nœuds — mise à niveau requise
Les full nodes doivent exécuter **v3.1.83+**. Un nœud antérieur à 3.1.83 ne peut pas décoder une transaction native eth (`eth_secp256k1`) et cessera de se synchroniser dès qu'une telle transaction apparaîtra dans un bloc. Téléchargez le pack actuel sur [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR natif sur SVM en production + activation pour les intégrateurs

**Axe de la version :** L'unification du QOR natif sur SVM en fonctionnement sur les deux réseaux, ainsi que tout ce dont un échange ou un intégrateur a besoin pour se connecter.

* **Solde QOR natif unifié en production sur les trois interfaces** — L'unification SVM (v3.1.81) est confirmée en production sur le mainnet et le testnet : le même compte détient un seul solde visible sous forme d'`uqor` (6 décimales) sur Cosmos, en 18 décimales de style wei sur l'EVM, et en lamports (9 décimales ; 1 uqor = 1 000 lamports) sur l'interface compatible Solana.
* **Points de terminaison publics vérifiés** — Points de terminaison HTTPS publics pour le RPC de consensus, REST, EVM JSON-RPC et SVM JSON-RPC sur les deux réseaux, ainsi que l'[explorateur de blocs](https://explore.qore.network) public. Voir [Réseaux](/appendix/networks).
* **Téléchargements** — Packs binaires de nœuds versionnés, la genèse mainnet, et des snapshots de données de chaîne récents (avec sommes de contrôle SHA-256) publiés sur [download.qore.host](https://download.qore.host).
* **Signature post-quantique déterministe sur toute la pile client** — `@qorechain/pqc` 0.1.1 signe en ML-DSA-87 de manière déterministe (FIPS-204 §3.4) dans les six liaisons de langage, correspondant exactement à ce que la chaîne accepte ; `@qorechain/wallet-adapter` 0.1.2 s'appuie dessus pour la signature de transactions hybrides.
* **Guide de l'intégrateur** — Nouveau [Guide Échange et intégrateur](/developer-guide/exchange-integration) couvrant les dépôts, les retraits et les opérations de nœuds sur les trois interfaces.

## v3.1.81 — Unification du QOR natif sur SVM

**Axe de la version :** Le QOR natif comme actif de premier ordre sur l'interface compatible Solana.

* **QOR natif sur SVM** — Le runtime SVM expose désormais directement le solde QOR natif du compte (en lamports), plutôt que de suivre un solde séparé propre à SVM. `getBalance` et `getSignaturesForAddress` fonctionnent avec les fonds natifs, et les transferts du System Program déplacent du QOR natif.
* **Correspondance d'adresse SVM** — L'adresse SVM d'un compte est dérivée de ses 20 octets de compte (complétés à droite jusqu'à 32 octets, encodés en base58), de sorte que les adresses Cosmos, EVM et SVM d'une même clé renvoient aux mêmes fonds.

## v3.1.80 — Requêtes d'ancrage d'état multicouche

**Axe de la version :** Ancres de règlement lisibles et vérifiables hors ligne pour les rollups.

* **Requêtes de lecture d'ancrage** — Le service de requête `x/multilayer` expose désormais `Anchor` (la dernière ancre d'état d'une couche) et `Anchors` (l'historique des ancres d'une couche), afin que les clients puissent récupérer l'ancre de règlement d'une couche et la vérifier de manière indépendante.
* **Passerelle REST pour multilayer** — Chaque requête multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) est désormais disponible via REST en plus de gRPC.
* **Reçus de règlement résistants au quantique débloqués** — Chaque ancre porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, fournissant la base on-chain pour la vérification hors ligne des reçus de règlement du Rollup Development Kit.

## v3.1.79 — Approvisionnement automatique des validateurs pour les réseaux du pont

**Axe de la version :** Participation clé en main sur les réseaux connectés pour les validateurs sous licence.

* **Framework de pilotes réseau** — Un framework de pilotes déclaratif permet à un validateur QoreChain détenant la licence `validator_<chain>` (ou `qcb_bridge`) pertinente de faire provisionner, configurer et exécuter le client réseau externe correspondant sur le même nœud sous l'orchestration de QoreChain — uniquement une fois la licence activée.
* **Pilotes pour les 37 réseaux du pont** — La couverture s'étend à chaque réseau connecté, classé selon son modèle de participation (validateur sans permission, plafonné/élu/sur admission, full node L2, et rôles sans staking/liste de confiance). Les clés de staking et de signature du réseau externe restent fournies par l'opérateur pour chaque réseau ; QoreChain fournit le framework et la porte de licence appliquée.

## v3.1.78 — Préparation avant déploiement

**Axe de la version :** Portefeuilles, ponts, IBC et licences fonctionnent tous dès le lancement — sans gouvernance post-déploiement.

* **Activation de pont post-déploiement sans confiance requise** — Une clé `bridge_admin` (ou un détenteur de licence `qcb_bridge`) peut activer le pont de n'importe quelle chaîne connectée avec une seule transaction signée (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — définissant l'adresse du contrat, les confirmations, l'architecture, le statut, le vérificateur actif et la racine de confiance du vérificateur — sans proposition de gouvernance ni mise à niveau de chaîne.
* **Porte de licence réseau-validateur** — L'orchestrateur applique désormais la licence `validator_<chain>` / `qcb_bridge` (fermée par défaut) avant de démarrer tout client réseau externe.
* **Paquets d'intégration de portefeuille** — `@qorechain/wallet-adapter` et `@qorechain/connect` publiés sur npm (v0.1.0), ajoutant l'enregistrement réseau MetaMask en un appel (EIP-3085, QOR natif en **18 décimales** sur le rail EVM) et la configuration du prix du gaz Keplr.
* **Relayer IBC clé en main** — Configuration de relayer prête à l'emploi et outillage de bootstrap de canaux pour les huit contreparties IBC, afin que les canaux se lèvent après le déploiement sans configuration sur mesure.

## v3.1.77 — Points de terminaison REST pour le pont et la combustion

**Axe de la version :** Accès REST en lecture seule pour les modules cross-chain et d'offre.

* **Points de terminaison REST du pont** — Points de terminaison de requête HTTP en lecture seule pour le module de pont, exposant l'état du pont via REST standard en plus de gRPC.
* **Points de terminaison REST de combustion** — Points de terminaison de requête HTTP en lecture seule pour le module de combustion, rendant les données de distribution des frais et d'offre interrogeables via REST standard.

## v3.1.76 — Modernisation de la chaîne d'outils SVM

**Axe de la version :** Actualisation de la compatibilité avec la Solana Virtual Machine.

* **Prise en charge des programmes de la chaîne d'outils actuelle** — L'exécution SVM a été modernisée afin que les programmes construits avec la chaîne d'outils Solana actuelle s'exécutent sur le runtime SVM de QoreChain.

## v3.1.75 — SVM JSON-RPC activé par défaut

**Axe de la version :** RPC compatible Solana prêt à l'emploi.

* **JSON-RPC compatible Solana** — Le serveur SVM JSON-RPC est désormais activé par défaut (port **8899**) et démarré automatiquement avec le nœud, fournissant une interface RPC compatible Solana pour l'outillage SVM.

## v3.1.74 — Préréglages de profils de rollup

**Axe de la version :** Ergonomie du Rollup Development Kit et règlement.

* **Application des préréglages de profil** — La création de rollup applique désormais le préréglage du profil sélectionné (DeFi, gaming, NFT, entreprise, ou entièrement personnalisé), afin que les nouveaux rollups héritent de valeurs par défaut adaptées à leur cas d'usage.
* **Règlement optimiste** — Le chemin de règlement optimiste (soumission par lot et contestation) est opérationnel de bout en bout.

## v3.1.73 — Référence de hachage post-quantique

**Axe de la version :** Achèvement de la référence cryptographique post-quantique par défaut.

* **Hachage par défaut SHAKE-256** — SHAKE-256 (famille SHA-3) est adopté comme hachage d'application par défaut, complétant la référence post-quantique par défaut composée des signatures **ML-DSA-87 (Dilithium-5)**, de l'encapsulation de clé **ML-KEM-1024**, et du hachage **SHAKE-256**.

## v3.1.72 — Stabilité et maintenance

**Axe de la version :** Maintenance courante de stabilité et du pipeline de build.

* **Améliorations de stabilité** — Maintenance interne de stabilité, des dépendances et du pipeline de build, sans changement de comportement visible de l'extérieur.

## v3.1.71 — Signatures hybrides PQC appliquées par défaut

**Axe de la version :** Sécurité post-quantique activée par défaut sur le chemin de transaction Cosmos.

* **Signatures hybrides requises par défaut** — Les signatures hybrides post-quantiques sont désormais appliquées par défaut sur le chemin de transaction Cosmos : chaque transaction porte une signature post-quantique **ML-DSA-87 (Dilithium-5)** en plus de la signature classique **secp256k1**.
* **Application contrôlée par gouvernance** — Le mode d'application reste contrôlé par la gouvernance, avec la valeur par défaut réglée sur **obligatoire**.

## v3.1.70 — Durcissement pour la production

**Axe de la version :** Durcissement pour la production et optimisation du consensus pour le mainnet en production.

* **Optimisation du consensus PRISM** — Améliorations continues de la couche d'optimisation par apprentissage par renforcement PRISM pour l'ajustement adaptatif des paramètres dans des conditions réseau réelles, avec des contrôles de sécurité de type disjoncteur.
* **Performance et stabilité** — Améliorations du débit, de la latence et de l'utilisation des ressources sur les validateurs et les full nodes.
* **Outillage opérationnel** — Amélioration de la supervision, des requêtes et de l'ergonomie d'exploitation des nœuds pour les opérateurs mainnet.
* **Alignement Tokenomics v2.1** — Distribution des frais et mécanique d'émission alignées sur le modèle économique à offre fixe et émission finie (affiné ultérieurement par le plafonnement de l'émission de la v3.1.94).

## v3.0.0 — Genèse du mainnet

**Axe de la version :** Lancement du mainnet et événement de génération de token.

* **Genèse du mainnet** — Le mainnet QoreChain (`qorechain-vladi`, EVM chain ID 9801) est en production depuis le **7 juin 2026**, avec l'événement de génération de token (TGE) à la genèse.
* **Répartition des frais en cinq voies** — Distribution des frais de protocole entre validateurs, combustion, trésorerie, stakers et light nodes (**37 / 30 / 20 / 10 / 3**), ajoutant une part dédiée aux light nodes.
* **AMM on-chain** — Module natif de teneur de marché automatisé (`x/amm`) pour les pools de liquidité et les échanges on-chain.
* **Licences de chaîne** — Module de licence on-chain (`x/license`) pour enregistrer et gérer les droits de protocole.
* **Paradigmes de règlement durcis** — Modes de règlement RDK finalisés en optimiste, zk, based et sovereign.

## v1.4.0 — Expansion pré-mainnet

**Axe de la version :** Couverture cross-chain et stabilisation des versions candidates avant le mainnet.

* **Couverture cross-chain élargie** — Connectivité IBC et pont supplémentaire vers un ensemble plus large de réseaux externes.
* **Participation des light nodes** — Introduction des light nodes et des bases de leurs récompenses de part de frais.
* **Durcissement des versions candidates** — Tests, audits et stabilisation étendus sur tous les modules du cœur en préparation de la genèse du mainnet.

## v1.3.0 — Rollup Development Kit

**Axe de la version :** Infrastructure de rollup native pour les déploiements de rollups sovereign et à sécurité partagée.

* **Module x/rdk** — Rollup Development Kit complet avec quatre paradigmes de règlement : optimiste, zk, based et sovereign
* **5 profils préréglés** — Modèles de rollup préconfigurés pour les cas d'usage DeFi, gaming, NFT, entreprise et entièrement personnalisé
* **Disponibilité des données native** — Couche DA on-chain avec stockage de blobs, gestion de la rétention et cycle de purge
* **Finalisation automatique par EndBlocker** — Finalisation automatique des lots lorsque la fenêtre de contestation expire, sans intervention de l'opérateur
* **Sélection de profil assistée par IA** — Requête `suggest-profile` qui recommande une configuration de rollup optimale selon le cas d'usage visé
* **Intégration multilayer** — Les rollups s'enregistrent comme couches dans l'architecture multilayer, héritant du routage, de l'ancrage et des mécanismes de contestation
* **Cycle de vie de l'escrow bancaire** — Le stake de l'opérateur est détenu en escrow pendant le fonctionnement du rollup et libéré à l'arrêt propre, ou confisqué en cas de slashing

## v1.2.0 — IBC et ponts

**Axe de la version :** Connectivité cross-chain et abstractions de compte avancées.

* *(Conçu ; la couche cross-chain est encore en attente — voir [Architecture du pont](/architecture/bridge-architecture).)* **25 connexions cross-chain** — 8 canaux IBC et 17 connexions QoreChain Bridge (QCB) vers des réseaux externes
* **Module x/babylon** — Intégration de restaking BTC permettant aux détenteurs de Bitcoin de participer à la sécurité de staking de QoreChain
* **Module x/abstractaccount** — Framework de compte intelligent avec règles de dépense programmables, clés de session et logique d'authentification personnalisée
* **Module x/fairblock** — Chiffrement à seuil basé sur l'identité (tIBE) pour un chiffrement de transaction résistant au MEV
* **Module x/gasabstraction** — Conception du paiement de gaz multi-token prenant en charge le QOR natif, l'USDC pontée par IBC et l'ATOM ponté par IBC (aucun canal IBC n'est encore ouvert)
* **Priorisation des transactions à 5 voies** — Définitions de voies pour la priorisation de l'espace de bloc (configuration uniquement ; non appliquée par le mempool en production)
* **Configurations de relayer IBC** — Configurations de relayer préconfigurées pour tous les canaux IBC pris en charge
* **Intégration pont-combustion** — Les frais de pont sont acheminés à travers la distribution des frais du module de combustion

## v1.1.0 — Signatures hybrides PQC

**Axe de la version :** Sécurité cryptographique post-quantique et agilité algorithmique.

* **Double signature secp256k1 (ECDSA) + ML-DSA-87** — Chaque transaction porte à la fois une signature classique et une signature post-quantique, vérifiées dans la chaîne AnteHandler
* **3 modes d'application** — Application configurable des signatures hybrides : désactivée (mode 0), permissive (mode 1, PQC facultative), obligatoire (mode 2, PQC requise)
* **Enregistrement de clé** — Les premières versions enregistraient automatiquement une clé publique PQC lors de la première transaction hybride ; ce comportement a été supprimé, et une clé est désormais enregistrée explicitement avec `MsgRegisterPQCKey` (voir [Première transaction](/getting-started/first-transaction#register-pqc-key))
* **Fondation de hachage SHAKE-256** — Toutes les opérations de hachage liées à la PQC utilisent SHAKE-256 (famille SHA-3) pour la dérivation d'adresse résistante au quantique
* **Interfaces d'attestation TEE** — Prise en charge de l'attestation par environnement d'exécution de confiance (Trusted Execution Environment) pour prouver l'intégrité de la génération de clé PQC
* **Framework d'agilité algorithmique** — Registre d'algorithmes enfichables permettant d'ajouter de futurs algorithmes PQC via la gouvernance sans mise à niveau de chaîne

## v1.0.0 — Genèse (moteur de tokenomics)

**Axe de la version :** Lancement initial du protocole avec tokenomics complète, exécution multi-VM et opérations assistées par IA.

* **Module x/burn** — Mécanisme de combustion des frais multicanal avec une répartition à quatre voies entre validateurs, combustion, trésorerie et stakers
* **Module x/xqore** — Dérivé de staking de gouvernance avec pénalités de déverrouillage anticipé par palier et redistribution rebase PvP
* **Module x/inflation** — Émission basée sur des époques avec décroissance annuelle (remplacée dans la v3.1.94 par un montant fixe par époque sous un plafond cumulatif strict)
* **Couche de consensus PRISM** — Optimisation par apprentissage par renforcement (PPO) pour l'ajustement dynamique des paramètres de chaîne avec des contrôles de sécurité de type disjoncteur
* **CPoS à triple pool** — Composite Proof-of-Stake avec des pools de validateurs RPoS, DPoS et PoS pondérés par des scores de réputation (implémenté dans `x/qca` ; pas encore branché à la production de blocs)
* **Gouvernance QDRW** — Formule de pouvoir de vote Quadratic Delegation with Reputation Weighting (implémentée ; désactivée sur les réseaux en production)
* **Runtimes EVM + QoreChain Native + SVM** — Trois environnements d'exécution concurrents : le moteur EVM de QoreChain, les contrats intelligents QoreChain Native, et la Solana Virtual Machine
* **Pont cross-VM** — Passage de messages et transferts d'actifs entre les runtimes EVM, QoreChain Native et SVM au sein d'un même bloc
* **Cryptographie post-quantique** — Signature résistante au quantique soutenue par une bibliothèque PQC haute performance
* **QCAI** — Analyse heuristique on-chain avec un sidecar hors chaîne facultatif pour la détection de fraude, l'estimation des frais et l'optimisation du réseau
* **Déploiement conteneurisé** — Déploiement complet de testnet multi-validateur avec service sidecar et indexeur de blocs
* **Indexeur de blocs** — Écouteur de blocs avec stockage persistant pour les requêtes historiques et l'analytique
