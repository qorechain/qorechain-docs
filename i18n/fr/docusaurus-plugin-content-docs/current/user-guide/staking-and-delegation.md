---
slug: /user-guide/staking-and-delegation
title: Staking et délégation
sidebar_label: Staking et délégation
sidebar_position: 2
---

# Staking et délégation

Ce guide explique comment déléguer des jetons QOR à des validateurs, redéléguer entre validateurs, débonder votre stake, réclamer des récompenses et comprendre l'architecture de staking Triple-Pool de QoreChain.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.82** — remplacez le chain ID et les endpoints du mainnet indiqués sur la page **Connecting to Mainnet** lorsque vous faites du staking sur le mainnet.
:::

---

## Délégation de jetons

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

## Redélégation

Déplacez votre délégation d'un validateur à un autre sans attendre la période de débonding :

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

:::caution
Vous ne pouvez pas redéléguer des jetons qui sont déjà en transit de redélégation. Attendez que la redélégation en cours soit terminée avant d'en lancer une autre.
:::

---

## Débonding

Retirez vos jetons délégués d'un validateur. Le débonding prend **21 jours** à se terminer ; pendant cette période, les jetons ne génèrent pas de récompenses et ne peuvent pas être transférés.

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

Après la période de débonding de 21 jours, les jetons sont automatiquement restitués à votre compte.

---

## Réclamation des récompenses

Retirez toutes les récompenses de staking accumulées auprès de chaque validateur auquel vous avez délégué :

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Pour retirer les récompenses d'un validateur spécifique uniquement :

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Les récompenses de staking sont financées par le pool de staking de 590M QOR du protocole, conformément au calendrier Tokenomics v2.1, ainsi que par la part des stakers (10 %) de chaque frais de transaction.

---

## Classification Triple-Pool

QoreChain utilise un modèle de staking **Triple-Pool** qui classe les validateurs en trois pools selon leur réputation et leurs niveaux de délégation. Chaque pool reçoit une part pondérée des récompenses de bloc.

| Pool                                 | Critères d'entrée                                              | Pondération de récompense |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Score de réputation >= 70e percentile **ET** stake >= médiane | 40 %           |
| **DPoS** (Delegated Proof of Stake)  | Délégation totale >= 10 000 QOR                              | 35 %           |
| **PoS** (Proof of Stake)             | Tous les autres validateurs                                    | 25 %           |

Les validateurs sont reclassés à chaque limite d'epoch. Un validateur qui construit une solide réputation et accumule un stake suffisant est promu dans le pool RPoS, gagnant ainsi la plus grande part de récompenses.

---

## Récompenses par courbe de bonding

Les récompenses de staking individuelles sont calculées à l'aide de la formule de courbe de bonding de QoreChain :

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Montant de récompense pour la période                                 |
| `beta`   | Taux de récompense de base (paramètre de protocole)                                |
| `S`      | Montant staké                                                        |
| `alpha`  | Coefficient de fidélité (paramètre de protocole)                             |
| `L`      | Durée de verrouillage en epochs                                              |
| `Q(r)`   | Multiplicateur de qualité dérivé du score de réputation `r` du validateur |
| `P(t)`   | Multiplicateur de pool au temps `t` (40 %, 35 % ou 25 % selon le pool)     |

Des durées de verrouillage plus longues et des scores de réputation plus élevés donnent lieu à des récompenses proportionnellement plus importantes, incitant à l'engagement à long terme et au bon comportement des validateurs.

---

## Consultation des informations sur un validateur

Recherchez les détails de n'importe quel validateur :

```bash
qorechaind query staking validator <validator_operator_address>
```

**Exemple :**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Listez tous les validateurs actifs :

```bash
qorechaind query staking validators --status bonded
```

Interrogez vos délégations actuelles :

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Déléguer à des validateurs du **pool RPoS** procure les récompenses les plus élevées en raison de la pondération de pool de 40 %.
* Construire la réputation d'un validateur prend du temps. Tenez compte du parcours du validateur avant de déléguer.
* La redélégation est instantanée mais comporte des restrictions de cooldown. Planifiez soigneusement vos mouvements.
* La période de débonding de 21 jours est une mesure de sécurité. Pendant cette période, des événements de slashing peuvent toujours affecter vos jetons.

:::
