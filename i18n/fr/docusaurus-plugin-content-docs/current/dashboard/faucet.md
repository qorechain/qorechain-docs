---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Le **Faucet** vous fournit gratuitement des jetons de test afin que vous puissiez essayer le Dashboard sans rien dépenser de valeur. C'est un outil **réservé au testnet** — utilisez-le sur le testnet (`qorechain-diana`) pour approvisionner votre adresse avant de tester les transferts, les swaps, le staking et le déploiement de contrats.

:::caution Testnet uniquement — aucune valeur réelle
Le QOR de testnet n'a **aucune valeur réelle**. Le Faucet ne touche jamais au mainnet : il n'existe pas de faucet pour le QOR de mainnet, et rien de ce que vous réclamez ici ne peut être transféré vers le mainnet.
:::

## Demander des jetons de test

1. Connectez-vous, basculez le Dashboard sur le **testnet** et ouvrez le **Faucet**.
2. Saisissez l'adresse à approvisionner (`qor1...`). Si votre portefeuille est connecté, sélectionnez **Utiliser mon adresse** pour la remplir automatiquement. Le formulaire vérifie que l'adresse est valide avant de vous laisser continuer.
3. Sélectionnez le bouton de demande. L'approvisionnement est traité en quelques secondes.

Lorsque la demande réussit, une carte de confirmation affiche le montant envoyé et le hash de la transaction, avec un bouton de copie et un lien pour ouvrir la transaction dans l'[Explorer](/dashboard/explorer). Depuis le 27 octobre 2026, une demande peut aussi verser les trois [tokens de test Fest](#fest-tokens) ; la carte comporte alors une ligne **Fest tokens** qui liste ce qui est arrivé, ou une courte note si seul le QOR est passé.

## Limites

Chaque adresse peut faire une demande au Faucet une fois par période de temporisation. La page indique le montant exact par demande et le délai d'attente avant de pouvoir réclamer à nouveau. Si vous refaites une demande trop tôt, le Faucet vous indique quand vous serez à nouveau éligible.

## Tokens de test Fest (fUSD, fETH, fBTC) {#fest-tokens}

Trois tokens de test supplémentaires existent sur le testnet pour le fest des builders : **fUSD** (FestUSD, 6 décimales), **fETH** (FestETH, 18 décimales) et **fBTC** (FestBTC, 8 décimales). Ce sont de simples tokens de test sans valeur et sans lien avec un quelconque actif réel. La gouvernance du testnet les a enregistrés auprès du module ERC-20 (proposition 26 du testnet) : chacun existe donc à la fois comme contrat ERC-20 sur l'EVM du testnet et comme coin bancaire que les portefeuilles et l'AMM peuvent détenir. Le Faucet est configuré pour en envoyer un peu de chacun avec une demande de QOR (au moment de la rédaction, le 27 octobre 2026 : 1 000 fUSD, 0,5 fETH et 0,02 fBTC, avec le même délai de 24 heures que pour le QOR) ; la page affiche les montants exacts à côté du montant de QOR chaque fois que le Faucet les verse.

| Token | Décimales | Contrat ERC-20 sur l'EVM du testnet | Dénomination bancaire (sensible à la casse) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

À savoir :

- **Testnet uniquement.** Ces tokens n'existent pas sur le mainnet.
- **Copiez la dénomination exactement.** La partie adresse est en casse mixte EIP-55 et la dénomination est comparée en respectant la casse.
- **Les voir on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` liste les trois dénominations avec leurs symboles et leurs noms d'affichage.
- **Conversion entre les deux formes.** Pour transformer un solde ERC-20 en coins bancaires (`MsgConvertERC20`), l'expéditeur doit être indiqué sous la forme d'une adresse bech32 `qor1...`.
- **Pools.** L'[AMM](/architecture/amm) du testnet peut les mettre en pool contre `uqor` ; l'existence d'un pool est indiquée par `GET /qorechain/amm/v1/pools`. Les pages [Wallet](/dashboard/wallet) et [Trade](/dashboard/trade) n'ont pas d'entrée dédiée pour eux ; vérifiez un solde avec `GET /cosmos/bank/v1beta1/balances/{address}`.

## Que faire avec les jetons de test

Les jetons de test vous permettent d'exercer le réseau de bout en bout sur le testnet :

- Envoyer et recevoir sur la page [Wallet](/dashboard/wallet).
- Essayer un [swap](/dashboard/trade) sur l'AMM.
- [Déléguer](/dashboard/staking-and-validators) à un validateur.
- Déployer et tester des contrats avant de passer au mainnet.

:::note Valeur de test uniquement
Les jetons du Faucet existent sur le testnet et n'ont aucune valeur réelle. Lorsque vous êtes prêt pour une utilisation en production, basculez vers le mainnet (`qorechain-vladi`).
:::
