---
slug: /user-guide/staking-and-delegation
title: Staking et délégation
sidebar_label: Staking et délégation
sidebar_position: 2
---

# Staking et délégation

Ce guide explique comment déléguer des tokens QOR à des validateurs, redéléguer entre validateurs, désengager votre mise, réclamer vos récompenses, et comprendre l'architecture de staking à triple pool de QoreChain.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est actif depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.95** — substituez le chain ID et les endpoints du mainnet indiqués sur la page **Connexion au mainnet** lorsque vous staker sur le mainnet.
:::

## Existe-t-il une période de blocage ? {#lock-in-period}

**Aujourd'hui**, non — il n'y a pas de durée à choisir, car le staking n'est pas proposé ici sous forme de durées fixes comme c'est souvent le cas sur une plateforme d'échange. La délégation reste active, avec des récompenses versées dès le bloc suivant, aussi longtemps que vous le souhaitez, jusqu'à ce que vous décidiez de la désengager ; rien n'expire et rien n'est à renouveler. La **période de désengagement de 21 jours** mentionnée tout au long de ce guide n'est pas un blocage que vous acceptez à l'avance — elle ne débute qu'une fois que vous *demandez* le désengagement, et ne s'applique qu'au QOR que vous retirez. Déplacer une délégation d'un validateur à un autre (redélégation) évite entièrement cette attente, puisque la mise ne quitte jamais le pool lié. Le bonus de « fidélité » mentionné plus bas dans la [courbe de liaison](#bonding-curve) est un effet sur le taux de récompense lié à *la durée pendant laquelle vous êtes resté délégué jusqu'à présent* — il est automatique et n'a lui non plus aucune durée à choisir : il augmente simplement plus vous restez sans désengager.

Ceci décrit le comportement actuel de la chaîne, et non une garantie permanente — une durée minimale de staking est un paramètre que la gouvernance pourrait introduire à l'avenir, de la même manière que tout autre paramètre de staking sur cette page peut être modifié par vote. Si cela devait arriver, le wallet affichera le délai résultant (toute durée minimale plus les 21 jours de désengagement) avant que vous ne confirmiez une délégation, et cette page sera mise à jour en conséquence.

---

## Déléguer des tokens

Déléguez des QOR à un validateur pour gagner des récompenses de staking et participer à la sécurité du réseau :

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :** Déléguer 100 QOR à un validateur :

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Redéléguer

Déplacez votre délégation d'un validateur à un autre sans attendre la période de désengagement :

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

La redélégation ne comporte **ni pénalité ni blocage qui lui soit propre** — la mise ne quitte jamais le pool lié, ne cesse jamais de générer des récompenses, et peut être déplacée à nouveau à tout moment. Elle n'est absolument pas soumise à la période de désengagement de 21 jours ; celle-ci ne s'applique qu'à `unbond`.

:::caution La véritable limite est un nombre, pas un délai de recharge
Un délégant peut avoir au maximum **7 entrées de redélégation simultanées en cours** pour un même trajet exact (délégant, validateur source, validateur de destination) — chaque entrée se libère d'elle-même à maturité, libérant ainsi un emplacement. Il s'agit d'un plafond qu'un usage normal n'atteint pratiquement jamais, et non d'une règle « attendez avant de pouvoir redéléguer à nouveau » ; vous pouvez librement redéléguer vers ou depuis d'autres validateurs, ou à nouveau sur le même trajet dès qu'un emplacement se libère.
:::

---

## Désengagement (unbonding)

Retirez vos tokens délégués d'un validateur. Le désengagement prend **21 jours** pour se terminer ; pendant cette période, les tokens ne génèrent pas de récompenses et ne peuvent pas être transférés.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Après la période de désengagement de 21 jours, les tokens sont automatiquement restitués sur votre compte.

---

## Réclamer les récompenses

Retirez toutes les récompenses de staking accumulées auprès de tous les validateurs auxquels vous avez délégué :

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Pour retirer les récompenses d'un seul validateur spécifique :

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Les récompenses de staking sont financées par deux sources : le budget d'émission plafonné du protocole (voir [Tokenomics](/architecture/tokenomics#staking-reward-schedule) pour le plafond actuel, en vigueur depuis un changement de gouvernance du 26 août 2026) et la part des stakers sur chaque frais de transaction.

---

## Classification à triple pool

QoreChain utilise un modèle de staking à **triple pool** qui classe les validateurs dans trois pools selon leur réputation et leur niveau de délégation. Chaque pool reçoit une part pondérée des récompenses de bloc.

| Pool                                  | Critères d'entrée                                                  | Poids de récompense |
| -------------------------------------- | -------------------------------------------------------------------- | -------------- |
| **RPoS** (Reputation Proof of Stake)   | Score de réputation >= 70e percentile **ET** mise >= médiane         | 40%           |
| **DPoS** (Delegated Proof of Stake)    | Délégation totale >= 10,000 QOR                                      | 35%           |
| **PoS** (Proof of Stake)               | Tous les autres validateurs                                          | 25%           |

Les validateurs sont reclassés à chaque limite d'époque. Un validateur qui bâtit une solide réputation et accumule une mise suffisante est promu dans le pool RPoS, ce qui lui permet de bénéficier de la part de récompense la plus élevée.

---

## Récompenses par courbe de liaison (bonding curve) {#bonding-curve}

Les récompenses de staking individuelles sont calculées à l'aide de la formule de courbe de liaison de QoreChain :

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Montant de la récompense pour la période                             |
| `beta`   | Taux de récompense de base (paramètre du protocole)                  |
| `S`      | Montant misé                                                         |
| `alpha`  | Coefficient de fidélité (paramètre du protocole)                     |
| `L`      | Durée de blocage en époques                                          |
| `Q(r)`   | Multiplicateur de qualité dérivé du score de réputation `r` du validateur |
| `P(t)`   | Multiplicateur de pool au temps `t` (40%, 35% ou 25% selon le pool)   |

Des durées de blocage plus longues et des scores de réputation plus élevés se traduisent par des récompenses proportionnellement plus importantes, encourageant ainsi l'engagement à long terme et le bon comportement des validateurs.

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
qorechaind query staking validators --status bonded
```

Interroger vos délégations actuelles :

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Déléguer à des validateurs du **pool RPoS** rapporte les meilleures récompenses grâce au poids de pool de 40%.
* Bâtir la réputation d'un validateur prend du temps. Examinez son historique avant de déléguer.
* La redélégation est instantanée, sans pénalité et sans blocage — la seule limite est un plafond de 7 entrées pour les redélégations simultanées sur un même trajet exact, qu'un usage normal n'atteindra pas.
* La période de désengagement de 21 jours est une mesure de sécurité. Pendant cette période, des événements de slashing peuvent encore affecter vos tokens.

:::
