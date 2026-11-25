---
slug: /qorex/dapp-integration
title: Intégrer une dApp à QoreX
sidebar_label: Intégration dApp
sidebar_position: 8
---

# Intégrer une dApp à QoreX

Voici le guide complet pour le développeur qui veut qu'une application web fonctionne avec le portefeuille QoreX : comment le détecter, se connecter, envoyer des transactions QoreChain, signer des messages, utiliser EVM et Solana, gérer les refus et générer des liens qui ouvrent QoreX. Il couvre l'extension de navigateur QoreX et le navigateur dApp intégré à l'application QoreX, et précise où les deux diffèrent. Les exemples de code ont été vérifiés par rapport au code du portefeuille lui-même.

## Innovations {#innovations}

- **La page ne détient jamais la clé post-quantique.** `signAndBroadcast` prend vos messages ; QoreX les affiche décodés, ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, et diffuse. cosmjs, cosmos-kit et Interchain Kit fonctionnent sans changement via `getOfflineSigner`, et QoreX ajoute la même couche quand la transaction n'en a aucune.
- **Détection par capacité, pas par version.** `window.qorex.native.capabilities` liste ce que fait une version ; un seul chemin de code fonctionne ainsi sur toutes les versions.
- **Rien n'est accaparé.** QoreX s'annonce avec EIP-6963 et le Solana Wallet Standard, ne définit jamais `window.keplr` et n'écrase jamais le `window.ethereum` d'un autre portefeuille.
- **Signature de message avec une moitié post-quantique.** `signArbitrary` signe avec la clé classique du compte (ADR-36) et avec ML-DSA-87. Un serveur vérifie les deux avec `@qorechain/qoresign` par rapport à la clé enregistrée on-chain.
- **L'EVM sur QoreChain, expliqué à l'utilisateur.** `personal_sign`, `eth_signTypedData_v4` et `eth_sendTransaction` sont décodés sur l'appareil, simulés là où le nœud le permet, et l'approbation ouvre la fenêtre d'autorisation par transaction dont la voie EVM de QoreChain a besoin.
- **Aucune signature à l'aveugle, et une courte liste de choses qu'un site ne peut jamais demander.** Un message que QoreX ne peut pas afficher est refusé, et les messages réservés au portefeuille (gestion des clés, règles de dépense, fenêtres, autorisations) sont refusés quel que soit le site.
- **Des liens qu'un service peut générer.** Ouvrir une page dans l'application, demander un paiement signé par la propre clé du destinataire ou transmettre une proposition d'agent.

## Ce que QoreX injecte {#injected}

Sur chaque page, QoreX ajoute un objet, `window.qorex`, avec trois fournisseurs :

| Fournisseur | Ce que c'est |
|---|---|
| `window.qorex.native` | La voie QoreChain (Cosmos). Style Keplr : `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*`, plus une liste `capabilities`. Ce n'est pas un remplacement direct de Keplr. |
| `window.qorex.evm` | Un fournisseur EIP-1193 pour la voie EVM de QoreChain (et, dans l'extension, Ethereum). Aussi annoncé via EIP-6963. |
| `window.qorex.svm` | Un fournisseur Solana. Dans l'extension, les dApps Solana trouvent normalement QoreX via le Wallet Standard. |

Ce que QoreX ne fait pas :

- Il ne définit jamais `window.keplr`. Du code qui cherche Keplr ne trouvera pas QoreX ; détectez plutôt `window.qorex`.
- Il n'écrase jamais `window.ethereum`. L'extension ne le définit pas du tout. Le navigateur intégré à l'application ne définit `window.ethereum` que si aucun autre portefeuille ne l'a fait. Choisissez QoreX par son nom EIP-6963, pas par `window.ethereum`.
- `signAmino` et `sendTx` n'existent pas (voir [cosmjs](#cosmjs)).

## Détecter QoreX {#detection}

**EVM.** Écoutez les annonces EIP-6963 et choisissez celle dont le `rdns` est `network.qore.qorex` :

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**Voie native QoreChain.** Vérifiez la présence de `window.qorex?.native` et lisez ses capacités. Vérifiez-les plutôt qu'un numéro de version :

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Capacité | Extension | Application |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (méthode présente depuis la 1.2.0) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (comportement depuis la 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (méthode présente depuis la 1.2.0) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | absent de l'application |

L'application 1.2.0 a les méthodes mais ne déclare aucune capacité ; pour la couvrir, rabattez-vous sur `typeof window.qorex?.native?.signArbitrary === "function"`. `executeRequest` est le pont avec le Dashboard, qui ne fonctionne que pour `dashboard.qorechain.io` (voir [Pont avec le Dashboard](/qorex/browser-extension#dashboard-bridge)) ; les autres sites n'en ont pas besoin. Les versions 1.2.5 et 0.4.4 déclarent les mêmes capacités qu'auparavant.

**Extension ou application.** Une page ne peut pas demander à laquelle elle parle, et ne devrait pas en avoir besoin. Les différences qui comptent figurent dans le tableau ci-dessous.

| | Extension (ordinateur) | Application (navigateur dApp intégré) |
|---|---|---|
| Voie native QoreChain | oui | oui |
| Signature EVM sur QoreChain | oui | oui |
| EVM sur Ethereum (`wallet_switchEthereumChain` vers `0x1`, par site) | oui | non, uniquement le réseau actif de QoreChain |
| Événements EVM (`connect`, `accountsChanged`, `chainChanged`) | les trois | `connect` uniquement : le navigateur est fermé pour changer de compte ou de réseau |
| Solana (Wallet Standard) | oui | non, le navigateur intégré ne signe pas les transactions Solana |
| Pont avec le Dashboard (`connectProof`, `executeRequest`) | oui, `dashboard.qorechain.io` uniquement | non |
| Ouvrir une page depuis un lien | sans objet | liens `browse` (voir [Liens](#links)) |

Voir [Extension de navigateur](/qorex/browser-extension) et [Navigateur dApp](/qorex/dapp-browser) pour le côté utilisateur de chacun.

## Se connecter {#connect}

La connexion demande une approbation par site, qui ne révèle que l'adresse publique :

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM :

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` renvoie une liste vide tant que l'utilisateur n'a pas approuvé le site, et n'ouvre jamais de fenêtre de lui-même. `enable` et `eth_requestAccounts` ouvrent le portefeuille quand il est verrouillé (voir [Portefeuille verrouillé](#locked)).

L'extension déclenche un événement de fenêtre, `qorex_keystorechange`, quand le compte, le portefeuille ou le réseau change. Les approbations sont conservées par portefeuille et l'utilisateur peut révoquer un site à tout moment sous **Sites connectés**.

## Envoyer une transaction QoreChain : `signAndBroadcast` {#sign-and-broadcast}

Toute transaction QoreChain d'un compte doté d'une clé post-quantique enregistrée doit porter une signature hybride : secp256k1 **et** ML-DSA-87. Seul le portefeuille détient la clé ML-DSA ; une page ne peut donc pas construire elle-même cette signature. Envoyez les messages et QoreX fait le reste :

1. il montre à l'utilisateur les messages décodés et les frais,
2. il construit la transaction pour le compte que l'utilisateur a sélectionné,
3. il ajoute la signature hybride (en enregistrant d'abord la clé post-quantique du compte s'il s'agit de sa première transaction),
4. il diffuse, et résout avec le résultat.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` indique si la transaction validée porte la couche hybride : `shielded` quand c'est le cas, `downgraded` quand elle a été validée sans (signalez ce cas), et `pending` ou `classical` sinon.

**Règles**

- `chainId` doit être égal au réseau actif du portefeuille : `qorechain-vladi` (mainnet) ou `qorechain-diana` quand l'utilisateur a basculé sur le testnet. Une discordance est refusée avec un message qui nomme les deux. **Une dApp ne peut pas changer de réseau** (voir [Testnet](#testnet)).
- De 1 à 32 messages par appel. Les octets des messages sont signés exactement tels que vous les envoyez ; le portefeuille ne les réencode pas.
- Un mémo d'au plus 256 octets est affiché sur la feuille d'approbation ; les sauts de ligne et les caractères de contrôle qu'il contient sont affichés sous forme de codes.
- Les messages réservés au portefeuille sont refusés (voir [Messages qu'un site ne peut jamais demander](#wallet-only)).
- QoreX ne signe pas un message qu'il ne peut pas afficher. Une telle demande est refusée avec `QoreX cannot show what <type> does, so it will not sign it`, y compris à l'intérieur de `MsgExec`. Utilisez un type de message que QoreX peut décoder.

**Gaz et frais**

- Les frais sont égaux à `gasLimit` multiplié par le prix du gaz du réseau (QoreX suit le minimum en direct du réseau), et sont affichés avant l'approbation de l'utilisateur.
- Votre `gasLimit` est maintenu entre 100,000 et 5,000,000 ; sans valeur, il est de 400,000.
- Une transaction qui exécute du code CosmWasm ou inter-VM est d'abord simulée, avant l'approbation. QoreX demande au moins 1.3 fois le gaz simulé, jusqu'à 20,000,000, et une valeur plus élevée venant de votre page est conservée. Un appel que le contrat rejetterait est refusé avant l'approbation, avec le motif de la chaîne. Si l'appel a besoin de plus de 20,000,000, QoreX le dit et refuse.
- Une transaction ne peut pas dépasser la limite de gaz par transaction du réseau lui-même ; QoreX en refuse une qui la dépasse avant toute signature.

Un rejet par l'utilisateur lève `QoreX: signature rejected` avec le code `4001`.

## cosmjs, cosmos-kit et Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` et `getOfflineSignerAuto(chainId)` renvoient un `OfflineDirectSigner` cosmjs ; `SigningStargateClient` fonctionne donc sans changement :

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**La couche post-quantique ajoutée par le portefeuille.** Quand la transaction ne porte aucune couche ML-DSA (qu'une page ne peut pas produire), QoreX l'ajoute : il simule le coût de la couche, augmente le gaz et les frais dans la transaction, signe en ML-DSA-87 le corps et les informations de frais relevées, et montre à l'utilisateur les frais définitifs avant son approbation. Vos frais `"auto"` reviennent donc plus élevés du coût de la couche, soit des dizaines de milliers d'unités de gaz. Diffusez toujours le document `signed` renvoyé, pas celui que vous avez envoyé. Vérifiez `capabilities.includes("signDirectAddsPqcLayer")` avant de vous y fier.

- La clé post-quantique du compte doit déjà être enregistrée ; elle s'enregistre avec sa première transaction depuis QoreX. Sinon, l'appel échoue avec le code `4100` et le motif `pqc-key-missing`. Faites d'abord envoyer à l'utilisateur une transaction depuis QoreX, ou utilisez `signAndBroadcast`, qui enregistre lui-même la clé.
- **Amino est refusé.** `signAmino` et `getOfflineSignerOnlyAmino().signAmino` sont rejetés avec le code `4200` et le motif `amino-unsupported`, car Amino JSON ne peut pas porter la signature hybride. Configurez votre bibliothèque pour la signature directe.
- Les comptes importés de MetaMask (coin 60) signent via `signAndBroadcast` ; pour eux, l'extension refuse `signDirect`, et donc les signataires cosmjs.
- `getKey` et `getAccounts` renvoient le compte actif.

Dans une application web, l'[adaptateur de portefeuille](/developer-tools/wallet-adapter) et les paquets des [intégrations QoreX](/developer-tools/qorex-integrations) (RainbowKit, Interchain Kit, cosmos-kit) encapsulent pour vous cette détection et ces appels.

## `signDirect` {#sign-direct}

`signDirect` signe un `SignDoc` construit par votre page. Si le corps porte déjà une couche ML-DSA, QoreX la vérifie par rapport à la clé enregistrée du compte, comme le fait la chaîne, avant l'ouverture de toute fenêtre. S'il n'en porte aucune, QoreX l'ajoute comme décrit ci-dessus. Une couche qui ne correspond pas à la clé enregistrée, un message réservé au portefeuille, un message que QoreX ne peut pas afficher, ou plus de 1,000 messages sont refusés avant l'ouverture de toute approbation. Pour du nouveau code, `signAndBroadcast` est plus simple.

## Signer un message : `signArbitrary` et `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

La signature suit [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1) : ADR-36 avec la clé classique du compte (secp256k1, ou eth_secp256k1 pour un compte coin 60), plus ML-DSA-87 sur `"qorechain-msg-v1|" + chainId + "|" + data`. Elle porte aussi les champs `pub_key` et `signature` de Keplr, pour que du code écrit pour Keplr puisse la lire. L'utilisateur voit le message en entier. Un message doit faire de 1 à 4096 octets et ne doit pas commencer par un autre domaine de signature QoreChain.

**Vérifiez sur votre serveur, jamais dans la page.** La moitié ML-DSA doit être contrôlée par rapport à la clé enregistrée on-chain pour cette adresse, jamais par rapport à une clé envoyée par le client. Utilisez [`@qorechain/qoresign`](/qoresign/overview) :

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` récupère la clé ML-DSA-87 enregistrée du signataire et lève une `QoreSignError` quand quoi que ce soit ne se vérifie pas. Un compte qui n'a jamais envoyé de transaction sur ce réseau n'a pas encore de clé enregistrée et échoue avec `KEY_NOT_REGISTERED` : demandez à l'utilisateur d'envoyer d'abord une transaction depuis QoreX. Mettez dans le message un nonce à usage unique et votre domaine, et vérifiez les deux sur le serveur, pour qu'une signature ne puisse pas être rejouée sur un autre site. Les guides QoreSign traitent plus en détail les messages de connexion.

## dApps EVM {#evm}

QoreX répond sur EIP-6963 et, via son fournisseur EIP-1193, signe `personal_sign`, `eth_signTypedData_v4` et `eth_sendTransaction` sur la voie EVM de QoreChain (chain id **9801**, testnet **9800**). Dans l'extension, il signe aussi sur Ethereum après que le site a appelé `wallet_switchEthereumChain` vers `0x1` (par site). Les méthodes en lecture seule (`eth_call`, `eth_getBalance`, `eth_getLogs` et les autres lectures standard) sont envoyées au nœud du réseau sélectionné. Toute autre méthode répond `4200`, et `wallet_switchEthereumChain` ou `wallet_addEthereumChain` vers autre chose qu'une chaîne pour laquelle QoreX signe répond `4902`. Un site ne peut pas basculer vers l'autre réseau QoreChain : cela répond `4100` avec `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**Ce que l'approbation décode.** Chaque fenêtre indique ce qui est autorisé, après décodage sur l'appareil : transferts, autorisations de jetons (une autorisation illimitée indique UNLIMITED), `setApprovalForAll`, signatures Permit et Permit2, et transactions Safe (un DELEGATECALL est signalé à haut risque). Un appel que QoreX ne peut pas décoder est affiché comme inconnu et à haut risque et demande un second toucher. Les délégations EIP-7702 sont refusées.

**Simulation.** Avant la signature, la fenêtre montre ce que la transaction change dans le solde de l'utilisateur.

- Avec `eth_simulateV1` (traçage des transferts) sur le nœud, elle montre les variations en QOR et en jetons.
- Sur un nœud sans `eth_simulateV1`, ce qui est aujourd'hui le cas des nœuds EVM de QoreChain, seul `eth_call` est disponible, et il indique si l'appel serait annulé. Un appel avec données affiche alors « what it does to your tokens was not checked » (son effet sur vos jetons n'a pas été vérifié), et l'utilisateur doit toucher une seconde fois pour approuver.
- Une transaction qui échouerait, ou que le nœud ne peut pas simuler, demande aussi un second toucher.
- La simulation va au même nœud que celui qui recevrait la transaction ; rien d'autre n'est envoyé ailleurs.

Concevez la page pour que ce second toucher ne soit pas une surprise : expliquez aussi dans votre propre interface ce que fait l'appel.

**La fenêtre d'autorisation EVM, par transaction.** Sur QoreChain, une transaction EVM n'est admise que dans une fenêtre d'autorisation ouverte par la signature hybride ML-DSA-87 du compte sur la voie native. Quand aucune ne couvre la transaction, la même approbation en ouvre une pour exactement cette transaction :

- la valeur plus les frais maximaux comme limite,
- environ dix minutes,
- limitée aux contrats que la transaction appelle, là où le réseau le prend en charge.

L'approbation nomme chaque contrat que la fenêtre admettrait (y compris les contrats qui ont récemment vérifié une signature pour le même site) et indique qu'elle remplace toute fenêtre que l'utilisateur a ouverte. Si le réseau ne peut pas limiter une fenêtre à des contrats, QoreX demande une seconde fois, en nommant les contrats et en précisant que la fenêtre admettrait n'importe quel contrat, avant d'en ouvrir une sans limite ; un « non » n'envoie rien. La limite en QOR couvre tous les QOR qui quittent le compte, frais maximaux compris, et un contrat que la fenêtre permet à l'utilisateur d'appeler peut toujours agir pour le compte (jetons qu'il détient ou pour lesquels il a été approuvé, ou QOR détenus par d'autres contrats). Voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window).

**Une fenêtre que l'utilisateur a ouverte à la main.** Une fenêtre que l'utilisateur ouvre sur l'écran des fenêtres est par défaut en **Transferts de QOR uniquement** ; autoriser n'importe quel contrat est un choix distinct, avec un avertissement. Une fenêtre que l'utilisateur a ouverte plus tôt ne couvrira donc pas un appel de jeton ou de contrat. Une dApp qui attend qu'une fenêtre existe devrait soit laisser QoreX ouvrir la fenêtre par transaction (la voie la plus simple, et la plus étroite), soit dire à l'utilisateur de choisir **N'importe quel contrat** s'il en ouvre une lui-même.

**Autres règles sur cette voie**

- Seuls les comptes importés de MetaMask (coin type 60) peuvent envoyer sur la voie EVM de QoreChain. Un autre compte répond `4100` et le message indique à l'utilisateur les étapes suivantes.
- Les précompilés de staking, distribution, gouvernance, vesting, bank et IBC sont refusés (`4200`) : sur QoreChain, ces opérations passent par la voie native.
- Les signatures sur la voie EVM sont classiques (secp256k1). QoreX n'en revendique pas davantage.
- Des données typées destinées à une autre chaîne que celle sélectionnée sont refusées avec `-32602`.

## dApps Solana (extension) {#solana}

L'extension s'enregistre auprès du Solana Wallet Standard sur le mainnet Solana (`solana:mainnet`) ; les dApps Solana la trouvent donc sans code particulier. Fonctionnalités : connect, disconnect, events, `solana:signMessage`, `solana:signTransaction` et `solana:signAndSendTransaction`, pour les transactions legacy et v0. `connect({ silent: true })` est pris en charge.

L'approbation décode les transferts System, les transferts SPL Token et Token-2022, les approbations, les changements d'autorité et les fermetures de compte, et affiche le texte d'un mémo. Une instruction que QoreX ne peut pas décoder est marquée sur la feuille comme illisible et l'approbation demande un second toucher. Une transaction qui ne liste pas le portefeuille comme signataire est refusée, et `signMessage` ne signera pas des octets qui sont en réalité une transaction. Les signatures sont classiques et signalées comme telles.

Le navigateur intégré à l'application ne signe pas les transactions Solana. Solana sur QoreChain même est une fonctionnalité distincte du portefeuille, réservée au testnet : voir [Fonctionnalités réservées au testnet](/qorex/testnet-features).

## Quand le portefeuille est verrouillé {#locked}

À partir de l'extension 0.4.4 et de Safari 1.8.2, une demande de signature faite alors que QoreX est verrouillé (native, EVM ou Solana) ouvre le portefeuille sur l'écran du mot de passe, en nommant le site. Après le déverrouillage par l'utilisateur, la fenêtre se ferme et la demande affiche sa propre approbation. Si l'utilisateur ferme la fenêtre à la place, la demande est refusée avec le code `4001`. Auparavant, une telle demande échouait immédiatement avec « wallet is locked ».

- `enable`, `getKey`, `eth_requestAccounts` et les méthodes de signature réveillent le portefeuille de cette façon.
- Les lectures qu'une page effectue au chargement (`eth_accounts`, `eth_chainId`, lectures de la chaîne) n'ouvrent jamais de fenêtre : `eth_accounts` renvoie simplement une liste vide.
- Rien n'est signé sans le mot de passe, et une demande en attente reçoit la réponse « non » si l'utilisateur change de portefeuille ou verrouille à nouveau.

Traitez `4001` comme un résultat normal, pas comme une panne.

## Messages qu'un site ne peut jamais demander {#wallet-only}

QoreX les refuse à tout site sur tous les chemins (`signAndBroadcast`, `signDirect`, une proposition d'agent), parce qu'ils confèrent un pouvoir permanent sur le compte. L'utilisateur les effectue depuis les écrans de QoreX :

- la gestion de la clé post-quantique : enregistrement, migration et changement d'une clé, la clé de chiffrement et l'enregistrement d'un multisignature PQC ;
- les authentificateurs et les règles de dépense : enregistrement ou révocation d'une clé de signature, règles de dépense, création d'un compte abstrait ;
- l'ouverture, la fermeture et l'effacement d'une fenêtre EVM (et le consentement de délégation) ;
- l'ouverture et la fermeture de la fenêtre de Solana sur QoreChain, et le message de relais Solana ;
- une autorisation authz (`MsgGrant`) portant sur `MsgGrant` ou `MsgExec`, car une telle autorisation permettrait au bénéficiaire d'agir au nom du compte.

Le refus s'applique directement, à l'intérieur de `MsgExec` à n'importe quelle profondeur, et comme autorisation générique de l'un de ces messages. L'erreur indique `QoreX: <type> is managed by the wallet itself, not by a website`.

## Erreurs et événements {#errors}

Les erreurs portent un `code` EIP-1193 :

| Code | Signification |
|---|---|
| `4001` | L'utilisateur a refusé, ou a fermé la fenêtre (y compris la fenêtre de déverrouillage). |
| `4100` | Non autorisé : compte inconnu, aucune clé post-quantique enregistrée (`reason: pqc-key-missing`), un compte coin 118 qui tente la voie EVM, ou une demande de changement de réseau. |
| `4200` | Non pris en charge : Amino (`reason: amino-unsupported`), une méthode EVM que QoreX ne signe pas, une délégation EIP-7702, un précompilé réservé au natif. |
| `4901` | Mauvaise chaîne Solana. |
| `4902` | Chaîne inconnue. |
| `-32602` | Paramètres incorrects (par exemple des données typées pour une autre chaîne). |

Événements :

- Fournisseur EVM : `connect`, `accountsChanged` et `chainChanged` dans l'extension ; uniquement `connect` dans l'application.
- Voie native (extension) : l'événement de fenêtre `qorex_keystorechange` quand le compte, le portefeuille ou le réseau change. cosmos-kit l'écoute.
- Solana Wallet Standard : `change`.

## Liens qu'un service peut générer {#links}

Trois liens ouvrent QoreX depuis une autre page ou application.

### Ouvrir une page dans l'application : `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

Sur un téléphone, le lien ouvre votre page dans le navigateur dApp de QoreX après l'habituelle demande biométrique. La page doit être en `https://` sur un nom de domaine. QoreX refuse le lien si la page comporte :

- un port,
- un nom d'utilisateur ou un mot de passe,
- une adresse IP,
- `localhost`,
- une barre oblique inverse ou une espace,
- plus de 2048 caractères.

Le lien ne donne rien à la page. Elle doit toujours demander à se connecter, et chaque signature passe toujours par la feuille d'approbation. Sans portefeuille sur le téléphone, l'application reste sur l'écran de bienvenue. Si QoreX n'est pas installé, la forme https affiche une page avec un lien pour l'obtenir. L'extension n'a pas de lien `browse`.

### Demander un paiement : `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

Un lien de demande de paiement porte le destinataire, le montant en unités de base, la dénomination, un identifiant de demande et son étiquette de mémo, une note et un @handle facultatifs, le réseau, ainsi qu'une signature de l'ensemble par la clé du compte du destinataire lui-même. Le QoreX du payeur vérifie la signature, que la clé signataire possède l'adresse du destinataire, le réseau exact et tout @handle, puis affiche la vérification habituelle avant l'envoi. Un montant ou un destinataire modifié est détecté, et la demande est marquée comme payée par lecture de la chaîne.

**Générez-le avec l'écran de demande de QoreX** (application, **Demandes de paiement**, **Nouvelle demande**) plutôt qu'à la main : la signature est faite avec la clé du compte, qu'une page ne détient jamais. Considérez comme non pris en charge un lien que vous construisez ou modifiez vous-même. Une forme web du lien n'est pas encore disponible.

### Transmettre une proposition d'agent : `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

Application uniquement. Le lien porte une transaction proposée par un agent IA ; QoreX la valide, la simule et l'affiche dans la fenêtre d'approbation habituelle. Une proposition n'est jamais signée telle quelle, et un lien peut porter au plus 64 KB. Voir le [modèle d'agent IA](#agents) ci-dessous.

## Agents IA {#agents}

Si vous créez un agent IA qui travaille avec un portefeuille, le modèle est le suivant : un agent peut lire ce que l'utilisateur autorise et **proposer** une transaction ; il ne signe jamais. QoreX vérifie et simule chaque proposition, et l'utilisateur l'approuve ou la rejette dans la même fenêtre d'approbation que celle d'une demande de dApp. Une proposition portant sur un message réservé au portefeuille est refusée avant l'ouverture de toute fenêtre. Dans l'extension, un agent atteint QoreX via un programme compagnon sur l'ordinateur de l'utilisateur, qui n'est pas encore publié ; dans l'application, une proposition est collée ou arrive sous forme de lien `qorex://propose`. Pour savoir comment l'utilisateur active cela et ce qu'il voit, lisez [Mode développeur : agents IA](/qorex/developer-mode#ai-agents).

## Testnet {#testnet}

**Une dApp ne peut pas changer de réseau.** Le `chainId` d'une demande doit correspondre au réseau sur lequel se trouve le portefeuille ; une discordance est refusée. Cela protège l'utilisateur d'une page qui le déplacerait vers un réseau où les fonds semblent identiques mais ne le sont pas.

Pour utiliser le testnet (`qorechain-diana`, chain id EVM 9800), l'utilisateur y bascule dans QoreX :

- **Application :** Réglages, puis **Utiliser le testnet (développeurs)**.
- **Extension :** activer le Mode développeur (toucher sept fois le numéro de version en bas de la fenêtre), puis **Passer au testnet (diana)**. **Revenir au mainnet** rétablit le réseau par défaut.

Une bannière TESTNET s'affiche alors sur chaque écran, les soldes du testnet n'affichent aucune valeur en USD, et le réseau est reconnecté sans redémarrage. Dites à vos utilisateurs de basculer avant d'ouvrir votre page testnet. Les fonctionnalités du portefeuille réservées au testnet (IBC, l'écran QoreChain Bridge, Solana sur QoreChain) sont décrites dans [Fonctionnalités réservées au testnet](/qorex/testnet-features).

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi, et que faire |
|---|---|
| `window.keplr` est undefined | C'est voulu. Utilisez `window.qorex.native`, ou une bibliothèque dotée d'un connecteur QoreX. |
| `window.ethereum` n'est pas QoreX | C'est voulu. Sélectionnez le portefeuille via EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | L'utilisateur est sur l'autre réseau. Demandez-lui de changer dans QoreX ; vous ne le pouvez pas. |
| `4100`, `pqc-key-missing` | Le compte n'a pas encore de clé post-quantique sur le réseau. Demandez à l'utilisateur d'envoyer une transaction depuis QoreX, ou utilisez `signAndBroadcast`. |
| `4200`, `amino-unsupported` | Votre bibliothèque demande Amino. Configurez la signature directe. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | Un message réservé au portefeuille. Retirez-le ; l'utilisateur effectue cette opération depuis QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | Un message que QoreX ne peut pas décoder. Utilisez un type qu'il peut afficher. |
| `QoreX: send between 1 and 32 messages` | Divisez la demande. |
| `QoreX: the memo may be at most 256 bytes` | Raccourcissez le mémo. |
| `QoreX: a message must be 1 to 4096 bytes` | Raccourcissez le message que vous demandez de signer. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | L'appel de contrat est trop lourd pour une seule transaction. Divisez-le. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX ne signe que `personal_sign`, `eth_signTypedData_v4` et `eth_sendTransaction`. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | Seuls les comptes importés de MetaMask (coin 60) envoient sur la voie EVM. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Appelez la voie native pour ces opérations ; les précompilés EVM sont refusés. |
| Un appel EVM demande sans cesse un second toucher | Le nœud ne peut pas vérifier ce que l'appel fait aux jetons, ou l'appel n'est pas décodable. Expliquez-le dans votre page. |
| Un appel de jeton échoue alors que l'utilisateur a ouvert une fenêtre | Une fenêtre ouverte à la main par l'utilisateur ne couvre par défaut que les transferts de QOR. Laissez QoreX ouvrir la fenêtre par transaction, ou dites à l'utilisateur de choisir n'importe quel contrat. |
| `4001` juste après que la page a demandé une signature | L'utilisateur a refusé, ou a fermé la fenêtre de déverrouillage d'un portefeuille verrouillé. Proposez de réessayer. |
| `eth_accounts` renvoie `[]` | Le site n'est pas encore connecté. Appelez `eth_requestAccounts`. |
| Un lien `browse` ne fait rien | L'adresse de la page a enfreint une règle (port, IP, `localhost`, pas en https, plus de 2048 caractères), ou le téléphone n'a pas encore de portefeuille. |
| `KEY_NOT_REGISTERED` sur votre serveur | Le signataire n'a jamais envoyé de transaction sur ce réseau. Demandez-en une d'abord. |

Si un problème persiste, l'utilisateur peut envoyer un journal des requêtes expurgé depuis le [Mode développeur](/qorex/developer-mode), et vous pouvez utiliser le testnet pour le reproduire.

## Où c'est publié {#where-published}

| Quoi | Où |
|---|---|
| Extension de navigateur QoreX | Chrome Web Store, Firefox Add-ons et le Mac App Store (Safari). Voir [Extension de navigateur](/qorex/browser-extension#install). |
| Application QoreX et son navigateur dApp | App Store et Google Play. Voir [QoreX Wallet](/qorex/overview#how-to-access). |
| Vérification des messages et des transactions | `@qorechain/qoresign` (TypeScript et autres langages). Voir [QoreSign](/qoresign/overview). |
| Détection de portefeuille pour les applications web | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| Connecteurs RainbowKit, Interchain Kit et cosmos-kit, types et portefeuille de test | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| SDK principal pour construire et envoyer des transactions | [Outils de développement](/developer-tools/overview) |

Le code source de QoreX n'est pas public. La version actuelle sur chaque store figure sur la page d'[aperçu](/qorex/overview#versions).
