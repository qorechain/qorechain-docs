---
slug: /user-guide/staking-and-delegation
title: Staking et délégation
sidebar_label: Staking et délégation
sidebar_position: 2
---

# Staking et délégation

Ce guide explique comment déléguer des tokens QOR à des validateurs, redéléguer entre validateurs, désengager votre mise, réclamer vos récompenses, et comprendre quelles parties de la conception du staking de QoreChain sont actives aujourd'hui.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est actif depuis le 7 juin 2026 et exécute la version **v3.2.5** (appliquée le 29 octobre 2026 ; la v3.2.4 le 23 octobre) ; le testnet exécute la v3.2.6 (depuis le 27 octobre 2026). Substituez le chain ID et les endpoints du mainnet indiqués sur la page **Connexion au mainnet** lorsque vous staker sur le mainnet.
:::

:::caution Signer avec `tx pqc cosign`
Le mainnet et le testnet exigent une signature post-quantique hybride sur chaque transaction de la voie Cosmos ; les commandes de cette page ne sont donc pas diffusées telles quelles. Ajoutez `--generate-only > tx.json` à une commande, puis exécutez `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Voir [Signature hybride](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) et le [tableau de bord](/dashboard/staking-and-validators) effectuent cette signature pour vous.
:::

## Existe-t-il une période de blocage ? {#lock-in-period}

**Pour la délégation ordinaire**, non — il n'y a pas de durée à choisir, car le staking n'est pas proposé ici sous forme de durées fixes comme c'est souvent le cas sur une plateforme d'échange. La délégation reste active, avec des récompenses versées dès le bloc suivant, aussi longtemps que vous le souhaitez, jusqu'à ce que vous décidiez de la désengager ; rien n'expire et rien n'est à renouveler. La **période de désengagement de 21 jours** mentionnée tout au long de ce guide n'est pas un blocage que vous acceptez à l'avance — elle ne débute qu'une fois que vous *demandez* le désengagement, et ne s'applique qu'au QOR que vous retirez. Déplacer une délégation d'un validateur à un autre (redélégation) évite entièrement cette attente, puisque la mise ne quitte jamais le pool lié. Le terme de « fidélité » de la [courbe de liaison](#bonding-curve) plus bas fait partie de la conception de QoreChain mais **n'est pas appliqué par la chaîne en service aujourd'hui** : la durée pendant laquelle vous restez délégué ne modifie donc pas votre taux de récompense. Une forme optionnelle de staking à verrouillage temporel est disponible sur le mainnet depuis la v3.2.4 (23 octobre 2026) et sur le testnet depuis le 19 octobre 2026 ; vous n'avez un verrouillage que si vous en créez un. Voir [Staking à verrouillage temporel (v3.2.4)](#time-locked-staking).

Ceci décrit le comportement actuel du mainnet, et non une garantie permanente — une durée minimale de staking est un paramètre que la gouvernance pourrait introduire à l'avenir, de la même manière que tout autre paramètre de staking sur cette page peut être modifié par vote. Si cela devait arriver, le wallet affichera le délai résultant (toute durée minimale plus les 21 jours de désengagement) avant que vous ne confirmiez une délégation, et cette page sera mise à jour en conséquence.

---

## Déléguer des tokens

Déléguez des QOR à un validateur pour participer à la sécurité du réseau. Les délégants reçoivent une part des récompenses que le validateur perçoit, déduction faite de la commission du validateur :

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemple :** Déléguer 100 QOR à un validateur :

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Redéléguer

Déplacez votre délégation d'un validateur à un autre sans attendre la période de désengagement :

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemple :**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

La redélégation ne comporte **ni pénalité ni blocage qui lui soit propre** — la mise ne quitte jamais le pool lié, ne cesse jamais de générer des récompenses, et prend effet immédiatement. Elle n'est absolument pas soumise à la période de désengagement de 21 jours ; celle-ci ne s'applique qu'à `unbond`. Une règle de staking standard s'applique : la mise que vous venez de déplacer **vers** un validateur ne peut pas être redéléguée à nouveau **depuis** ce validateur tant que le premier déplacement n'est pas arrivé à maturité (21 jours) ; vous pouvez néanmoins la désengager (`unbond`) ou redéléguer entre-temps le reste de votre mise.

:::caution La véritable limite est un nombre, pas un délai de recharge
Un délégant peut avoir au maximum **7 entrées de redélégation simultanées en cours** pour un même trajet exact (délégant, validateur source, validateur de destination) — chaque entrée se libère d'elle-même à maturité, libérant ainsi un emplacement. Il s'agit d'un plafond qu'un usage normal n'atteint pratiquement jamais, et non d'une règle générale « attendez avant de pouvoir redéléguer à nouveau ».
:::

---

## Désengagement (unbonding)

Retirez vos tokens délégués d'un validateur. Le désengagement prend **21 jours** pour se terminer ; pendant cette période, les tokens ne génèrent pas de récompenses et ne peuvent pas être transférés.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemple :**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Après la période de désengagement de 21 jours (1,814,400 secondes), les tokens sont automatiquement restitués sur votre compte. Un délégant peut avoir au maximum 7 entrées de désengagement simultanées par validateur.

---

## Réclamer les récompenses

Retirez toutes les récompenses de staking accumulées auprès de tous les validateurs auxquels vous avez délégué :

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Pour retirer les récompenses d'un seul validateur spécifique :

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Les récompenses de staking sont financées par deux sources : le budget d'émission plafonné du protocole (voir [Tokenomics](/architecture/tokenomics#staking-reward-schedule) pour le montant actuel par epoch et le plafond, tous deux fixés par la gouvernance — le plus récemment par la proposition 10 du 19 octobre 2026) et la part des stakers sur chaque frais de transaction (versée comme une récompense de staking normale depuis la mise à niveau v3.2.0 ; voir [la part des stakers bloquée](/architecture/tokenomics#stranded-and-reserve)). Les récompenses dépendent de la commission du validateur et de l'activité du réseau, et ne sont pas garanties.

---

## Staking à verrouillage temporel (v3.2.4) {#time-locked-staking}

:::note Quand cela s'applique
La version v3.2.4 ajoute un module optionnel de staking à verrouillage temporel, `x/stakingtier`. Il est en service sur le **testnet `qorechain-diana`** depuis le 19 octobre 2026 et sur le **mainnet** depuis le 23 octobre 2026 (appliqué à la hauteur 3,742,566 par la proposition de gouvernance 13) ; le mainnet exécute la v3.2.5 depuis le 29 octobre 2026, qui le laisse inchangé. Le verrouillage est disponible en option et la délégation ordinaire reste sans verrouillage (voir [ci-dessus](#lock-in-period)). Le mécanisme ci-dessous a été vérifié par rapport aux paramètres en service du mainnet et du testnet le 23 octobre 2026.
:::

Un délégant peut engager une partie d'une délégation existante auprès d'un validateur pour une durée fixe de 3, 6 ou 12 mois. Les durées et les montants sont des paramètres de la chaîne ; lisez les valeurs actuelles depuis `GET /qorechain/stakingtier/v1/params` plutôt que depuis cette page.

* **Le verrouillage est optionnel.** La délégation, la redélégation et le désengagement ordinaires fonctionnent exactement comme décrit sur cette page. Seul le montant verrouillé est restreint : tant qu'un verrouillage est ouvert, il ne peut être ni désengagé ni redélégué, et cela vaut pour toutes les voies (transaction, authz, group, contrat, gouvernance).
* **Verrouillage minimal** de 10 QOR, et au plus 16 verrouillages ouverts par délégant.
* **Le déverrouillage anticipé** est autorisé : il met fin au verrouillage, fait perdre toute récompense de verrouillage non versée, et brûle une pénalité prélevée sur le montant verrouillé (5 % dans les paramètres actuels, enregistrée sous la source de burn `staking_tier_penalty`) ; le reste demeure délégué et déverrouillé.
* **Le slashing** s'applique à une délégation verrouillée comme à toute autre ; le verrouillage diminue avec la délégation.
* **Réclamation.** Un verrouillage rapporte une composante de récompense supplémentaire par epoch, fixée par les paramètres du module ; elle est versée lorsque vous la réclamez, pas automatiquement. Cette page ne cite aucun taux : lisez `params` pour les réglages en vigueur.
* **À l'échéance**, le verrouillage est levé et la délégation se poursuit comme une délégation ordinaire.

Les commandes sont disponibles en ligne de commande et via les routes REST `GET /qorechain/stakingtier/v1/params`, `/locks/{holder}` et `/pool` ; le montant est un nombre entier de `uqor` (1 QOR = 1 000 000 uqor).

```bash
qorechaind tx stakingtier lock <validator_address> <amount_in_uqor> <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

L'identifiant de chaîne ci-dessus est celui du testnet ; utilisez `qorechain-vladi` sur le mainnet. Comme sur le reste de cette page, signez chaque transaction générée avec `tx pqc cosign`.

### Utiliser le staking à verrouillage temporel {#using-time-locks}

**Étapes.** (1) Déléguez à un validateur comme d'habitude. (2) Exécutez `tx stakingtier lock` pour ce validateur avec un montant (au moins 10 QOR) et une durée de 3, 6 ou 12 mois, puis cosignez et diffusez. (3) Lisez le résultat avec `GET /qorechain/stakingtier/v1/locks/{holder}` ou `qorechaind query stakingtier locks <holder_address>` ; chaque verrou a un identifiant. (4) Réclamez avec `tx stakingtier claim` quand vous le souhaitez pour obtenir la récompense du verrou. (5) À la fin de la durée, le verrou se libère de lui-même ; pour sortir plus tôt, utilisez `tx stakingtier unlock-early <lock_id>` et acceptez la pénalité.

**Où cela fonctionne, vérifié le 27 octobre 2026.**

| | Mainnet `qorechain-vladi` (v3.2.5) | Testnet `qorechain-diana` (v3.2.6) |
|---|---|---|
| Module actif | Oui, depuis la hauteur 3,742,566 | Oui, depuis la v3.2.4 (hauteur 8,337,253) |
| Verrous ouverts | Aucun pour l'instant | 3 verrous de test |
| Undelegate de stake verrouillé | Refusé par la barrière de messages de staking lors de l'exécution de la transaction | Refusé par le mempool avant que des frais soient prélevés (testnet uniquement, jusqu'à ce que le mainnet applique la v3.2.6) |

Les deux réseaux répondent à `GET /qorechain/stakingtier/v1/params` avec les mêmes réglages : trois durées, un minimum de 10 QOR (`min_lock_amount` `"10000000"` uqor), une pénalité de sortie anticipée de 500 points de base (5 %) et `enabled: true`. La réponse contient aussi les réglages de bonus en points de base ; ce manuel ne les cite pas, car un bonus n'est pas un rendement promis et les réglages peuvent être modifiés par la gouvernance. `GET /qorechain/stakingtier/v1/pool` montre le pool qui paie les récompenses des verrous.

**Clients.** La ligne de commande (ci-dessus) et `@qorechain/sdk` 0.10.0, qui propose les composeurs `lockDelegation`, `unlockEarly` et `claimBonus` ainsi que les lectures `fetchStakingTierParams`, `fetchStakingLocks` et `fetchStakingTierPool` (voir [Installation du SDK](/sdk/install)). Aucune version publiée de QoreX ou du Dashboard n'a d'écran de verrouillage aujourd'hui : le verrouillage sur le mainnet se fait donc avec la CLI ou le SDK.

**Ne confondez pas** avec le [staking xQORE](/user-guide/xqore-staking), qui est un mécanisme conçu mais non actif, ni avec la classification à triple pool ci-dessous, qui ne change pas ce que vous recevez.

---

## Classification à triple pool (état de la conception)

La conception de QoreChain inclut un modèle à **triple pool** qui classerait les validateurs dans trois pools selon leur réputation et leur niveau de délégation, avec une part pondérée des récompenses de bloc pour chaque pool :

| Pool                                  | Critères d'entrée                                                  | Poids de récompense (conception) |
| -------------------------------------- | -------------------------------------------------------------------- | -------------- |
| **RPoS** (Reputation Proof of Stake)   | Score de réputation >= 70e percentile **ET** mise >= médiane         | 40%           |
| **DPoS** (Delegated Proof of Stake)    | Délégation totale >= 10,000 QOR                                      | 35%           |
| **PoS** (Proof of Stake)               | Tous les autres validateurs                                          | 25%           |

:::note Non actif sur les réseaux en service
La classification en pools, la sélection du proposeur pondérée par pool et les poids de récompense par pool sont implémentés dans le module `x/qca` et leurs paramètres sont on-chain (`qorechaind query qca config`), mais ils ne sont **pas encore intégrés à la production de blocs ni à la distribution des récompenses**. Aujourd'hui, la proposition de blocs tourne selon la mise de la manière standard, et les récompenses sont partagées proportionnellement à la mise liée, déduction faite de la commission de chaque validateur. Le pool auquel un validateur « appartient » ne change rien à ce que vous recevez.
:::

---

## Récompenses par courbe de liaison (bonding curve) {#bonding-curve}

La conception de QoreChain définit également une formule de récompense par courbe de liaison :

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Montant de la récompense pour la période                             |
| `beta`   | Taux de récompense de base (paramètre du protocole)                  |
| `S`      | Montant misé                                                         |
| `alpha`  | Coefficient de fidélité (paramètre du protocole)                     |
| `L`      | Durée de staking en époques                                          |
| `Q(r)`   | Multiplicateur de qualité dérivé du score de réputation `r` du validateur |
| `P(t)`   | Multiplicateur de pool au temps `t` (40%, 35% ou 25% selon le pool)   |

:::note Non actif sur les réseaux en service
Le calcul par courbe de liaison, comme la classification en pools ci-dessus, **n'est pas appelé par la chaîne en service** : les récompenses ne sont pas calculées avec cette formule, et ni la durée de staking ni la réputation du validateur ne les modifient aujourd'hui. Les paramètres (`bonding_alpha`, `bonding_beta`) existent on-chain mais n'ont aucun effet.
:::

---

## Slashing et jailing

Le slashing sur QoreChain suit le module de slashing standard du Cosmos SDK avec ces paramètres en vigueur (`qorechaind query slashing params`) :

| Événement            | Règle                                                                | Conséquence                                  |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Indisponibilité      | Signer moins de 5% des 10,000 derniers blocs (environ 8,7 heures avec les blocs d'environ 3,1 secondes du mainnet) | Mise en prison (jailed) pendant 600 secondes ; 1% de la mise slashé |
| Double signature     | Signer deux blocs différents à la même hauteur                       | 5% de la mise slashé                         |

Le slashing s'applique à la mise liée totale d'un validateur ; les délégants en supportent donc leur part proportionnelle. Il peut aussi toucher la mise déjà en cours de désengagement depuis un validateur slashé, c'est pourquoi la période de désengagement est une mesure de sécurité et pas seulement un temps d'attente.

---

## Interroger les informations d'un validateur

Consultez les détails d'un validateur :

```bash
qorechaind query staking validator <validator_operator_address>
```

**Exemple :**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Lister tous les validateurs actifs :

```bash
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Interroger vos délégations actuelles :

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Examinez la commission, la disponibilité et l'historique d'un validateur avant de déléguer ; le pool ou la réputation d'un validateur ne modifie actuellement pas les récompenses que vous recevez.
* La redélégation prend effet immédiatement, sans pénalité et sans blocage. Les limites sont le plafond de 7 entrées pour les redélégations simultanées sur un même trajet exact, et la règle selon laquelle une mise tout juste redéléguée ne peut pas être déplacée à nouveau depuis le validateur de destination tant qu'elle n'est pas arrivée à maturité.
* La période de désengagement de 21 jours est une mesure de sécurité. Pendant cette période, des événements de slashing peuvent encore affecter vos tokens.

:::
