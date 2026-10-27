---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Le **Faucet** verse gratuitement des jetons de test à une adresse du testnet afin que vous puissiez essayer le Dashboard, les portefeuilles et les contrats sans rien dépenser de valeur. Il s'adresse à toute personne qui a besoin de QOR de testnet (et, pendant le fest des builders, de trois jetons de test) pour tester les transferts, les swaps, les outils de staking et le déploiement de contrats sur le testnet `qorechain-diana`.

:::caution Testnet uniquement, aucune valeur réelle
Le QOR de testnet n'a **aucune valeur réelle**. Le Faucet ne touche jamais au mainnet : il n'existe pas de faucet pour le QOR de mainnet, et rien de ce que vous réclamez ici ne peut être transféré vers le mainnet.
:::

## Innovations {#innovations}

- **Une demande, deux sortes de jetons.** Une demande verse 100 QOR et, dans une transaction distincte, 1000 fUSD, 0,5 fETH et 0,02 fBTC. Si l'envoi des jetons du fest échoue, le QOR arrive quand même et la carte de résultat l'indique.
- **Un double délai d'attente.** Une demande par 24 heures par compte **et** par adresse. Le créneau est réservé avant tout envoi et libéré si l'envoi échoue : une demande échouée ne consomme donc pas votre journée.
- **Les jetons du fest sont des coins bancaires natifs.** Ce sont des dénominations bancaires `erc20:0x...` que l'AMM on-chain, les envois bancaires, IBC et les contrats QoreChain Native utilisent telles quelles. MetaMask ou un DEX EVM ne les voient qu'après une conversion `MsgConvertCoin` (voir [Jetons de test du fest](#fest-tokens)).
- **Les montants sont fixes pour chaque demande.** 100 QOR par demande, une fois toutes les 24 heures par compte **et** par adresse, plus 1000 fUSD, 0,5 fETH et 0,02 fBTC par demande (testnet uniquement, connexion requise).
- **Un destinataire `0x` est payé sur son jumeau `qor1`.** Une adresse `0x` correspond aux mêmes 20 octets que sa forme `qor1` : le service paie donc le même compte. Le formulaire du Dashboard lui-même n'accepte que `qor1...`.

## Comment l'utiliser {#how-to-use}

1. **Connectez-vous.** Déconnecté, la page affiche "Sign in to access the faucet."
2. Ouvrez **Faucet**. Dans **Request Tokens**, sous **Wallet Address**, utilisez "Select a wallet" ou **Use my address ->** pour renseigner l'un de vos portefeuilles du Dashboard, ou saisissez une adresse `qor1...`.
3. La ligne d'information indique "You can request 100 QOR once every 24 hours" ainsi que les montants du fest.
4. Sélectionnez **Request Tokens**.
5. En cas de succès, la carte affiche **Tokens Sent!** avec le montant, une ligne **Fest tokens** (ce qui est arrivé, ou une courte note si seul le QOR est passé), le hash de la transaction avec un bouton de copie, et **View on Explorer**.
6. Une nouvelle demande trop tôt affiche "Rate Limit Reached" et "Rate limited for another HH:MM".

La vérification d'adresse du formulaire est légère : elle cherche le préfixe `qor` et une longueur d'au moins 10 caractères, et elle rejette la saisie `0x...`. Vérifiez vous-même l'adresse avant d'envoyer.

Une demande au Faucet compte aussi pour les [quêtes](/dashboard/quests) du Faucet.

**Exemple minimal :** connectez-vous, ouvrez Faucet, sélectionnez **Use my address ->**, sélectionnez **Request Tokens**, puis **View on Explorer** avec l'en-tête sur Testnet.

### Jetons de test du fest (fUSD, fETH, fBTC) {#fest-tokens}

Trois jetons de test supplémentaires existent sur le testnet pour le fest des builders : **fUSD** (FestUSD, 6 décimales), **fETH** (FestETH, 18 décimales) et **fBTC** (FestBTC, 8 décimales). Ils n'ont aucune valeur et aucun lien avec un quelconque actif réel. La gouvernance du testnet les a enregistrés auprès du module ERC-20 (proposition 26 du testnet) : chacun existe donc à la fois comme contrat ERC-20 sur l'EVM du testnet et comme coin bancaire que les portefeuilles et l'AMM peuvent détenir. Le Faucet est configuré pour en envoyer un peu de chacun avec une demande de QOR (au moment de la rédaction, le 27 octobre 2026 : 1 000 fUSD, 0,5 fETH et 0,02 fBTC, avec le même délai de 24 heures) ; la page affiche les montants exacts à côté du montant de QOR chaque fois qu'elle les verse. Les jetons du fest arrivent dans une transaction distincte ; son hash n'est pas affiché sur la carte.

| Jeton | Décimales | Contrat ERC-20 sur l'EVM du testnet | Dénomination bancaire (sensible à la casse) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Testnet uniquement.** Ces jetons n'existent pas sur le mainnet.
- **Copiez la dénomination exactement.** La partie adresse est en casse mixte EIP-55 et la dénomination est comparée en respectant la casse.
- **Les voir on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` liste les trois dénominations avec leurs symboles et leurs noms d'affichage.
- **Les utiliser depuis MetaMask ou un DEX EVM.** Le Faucet verse des coins bancaires. Pour en détenir un sous forme d'ERC-20 pour MetaMask ou un DEX EVM, convertissez-le avec `MsgConvertCoin` (expéditeur : votre adresse `qor1...`, destinataire : une adresse `0x...`, et la dénomination exacte en casse mixte). Le convertir dans l'autre sens se fait avec `MsgConvertERC20`. Les étapes et les chiffres de gas figurent dans [Développement EVM](/developer-guide/evm-development#fest-tokens). Un guide de conversion pas à pas dédié est prévu et n'est pas encore publié.
- **Pools.** L'[AMM](/architecture/amm) du testnet peut les mettre en pool contre `uqor` ; l'existence d'un pool est indiquée par `GET /qorechain/amm/v1/pools`. L'onglet Tokens de [Wallet](/dashboard/wallet) et [Trade](/dashboard/trade) n'ont pas d'entrée pour eux ; vérifiez un solde avec `GET /cosmos/bank/v1beta1/balances/{address}`.

### Que faire avec les jetons de test

- Envoyer et recevoir sur la page [Wallet](/dashboard/wallet).
- Essayer un [swap](/dashboard/trade) avec les jetons de test QoreSwap.
- Déployer et tester des contrats depuis le [Smart Contract Creator](/dashboard/smart-contract-creator) avant de passer au mainnet.
- Tester une configuration de nœud ou de validateur sur le testnet avec les outils de [Nodes & Validators](/dashboard/tools-hub).

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Compte :** la connexion est requise. Aucune connexion de portefeuille n'est nécessaire ; vous pouvez coller n'importe quelle adresse `qor1...`.
- **Réseau :** le Faucet **verse toujours sur le testnet** `qorechain-diana`, quoi qu'indique l'en-tête. Vous n'avez pas besoin de basculer l'en-tête sur testnet pour réclamer. Ne le basculez sur testnet que pour que **View on Explorer** ouvre le bon réseau ; avec l'en-tête sur mainnet, ce lien affiche "Transaction Not Found".
- **Coût :** gratuit.

## Où il est publié {#where-published}

| Surface | Adresse | Réseau | Compte |
| --- | --- | --- | --- |
| Page Faucet | `dashboard.qorechain.io/faucet` | Testnet `qorechain-diana` uniquement | Connexion requise |
| Métadonnées des jetons du fest | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | Aucun |

## Limites et problèmes connus {#limits}

- **100 QOR une fois toutes les 24 heures**, par compte et par adresse. Les jetons du fest suivent le même délai d'attente.
- **Pas de faucet mainnet.** Le QOR de testnet n'est jamais échangeable contre du QOR de mainnet.
- **Le formulaire rejette les adresses `0x`** et ne fait qu'une vérification `qor` légère.
- **L'envoi des jetons du fest peut échouer seul ;** le QOR est quand même versé et la carte l'indique. Attendez la fin du délai ou vérifiez votre solde avant de réessayer.
- **Les jetons du fest n'apparaissent pas** dans l'onglet Tokens de Wallet.
