---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Le Hybrid Inspector est une petite page React qui montre à quoi ressemble une signature hybride QoreChain sur le testnet `qorechain-diana`. Vous connectez le portefeuille QoreX, vous envoyez une transaction que QoreX signe avec secp256k1 et ML-DSA-87, et la page la décortique : la signature classique, la signature post-quantique et le verdict de la chaîne elle-même. Vous pouvez aussi coller le hash de n'importe quelle transaction du testnet.

## Ce que cela démontre {#what-it-shows}

- **La signature hybride ML-DSA-87 + secp256k1 depuis une page web.** La page transmet un message encodé à QoreX avec `qorexSignAndBroadcast`. QoreX signe avec les deux clés et diffuse.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne.** La page lit l'événement `pqc_hybrid_verify` de la chaîne pour la transaction. Cet événement est la chaîne qui atteste avoir contrôlé la signature post-quantique.
- **Les tailles sont visibles.** La signature classique fait 64 octets. La signature ML-DSA-87 (FIPS 204) fait 4 627 octets et voyage dans l'extension `PQCHybridSignature` de la transaction.

## Pas à pas {#steps}

### 1. Installer les outils

Il vous faut un navigateur basé sur Chromium (Chrome, Edge, Brave), Git, Node.js 20 ou plus récent et pnpm.

- Git : https://git-scm.com/downloads
- Node.js 20+ : https://nodejs.org (la version LTS convient)
- pnpm : `npm install -g pnpm`

Vérifiez les versions :

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. Installer l'extension de navigateur QoreX

Installez QoreX depuis la boutique de votre navigateur. Voir [Intégrations QoreX](/developer-tools/qorex-integrations) et le [navigateur de dApps](/qorex/dapp-browser) pour les détails.

### 3. Créer un compte de testnet jetable dans QoreX

Cet atelier n'a jamais besoin de votre vrai portefeuille. Dans QoreX, créez un **nouveau** compte (un nouveau profil ou un nouveau portefeuille) utilisé uniquement pour cet exercice, et passez-le sur le testnet `qorechain-diana`. Voir [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes#step-testnet) pour le changement de réseau. QoreX affiche une phrase de récupération lors de la création du compte : notez-la sur papier, gardez-la privée et ne la réutilisez jamais sur le mainnet. Le compte n'a aucune valeur en dehors de cet exercice.

Copiez l'adresse du compte (elle commence par `qor1...`).

### 4. Obtenir des QOR de testnet depuis le faucet

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et faites la demande. Une demande verse 100 QOR, une fois toutes les 24 heures par compte.

### 5. Récupérer le code

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Installer les dépendances

```sh
pnpm install
```

### 7. Vérifier que la compilation passe

```sh
pnpm build
```

La commande vérifie les types du projet et le compile. Elle se termine par `built in` et une durée.

### 8. Lancer la page

```sh
pnpm dev
```

Ouvrez http://localhost:5173 dans le navigateur où QoreX est installé. Ajoutez `?tx=<HASH>` à l'adresse (`http://localhost:5173?tx=<HASH>`) pour inspecter directement une transaction. Si le port 5173 est occupé, Vite affiche le port qu'il utilise à la place.

Les appels REST passent par le proxy Vite `/lcd` vers `https://api-testnet.qore.host`, car le point de terminaison REST public n'envoie pas d'en-têtes CORS. La page ne fonctionne que sur le testnet, et aucun fichier `.env` n'est nécessaire.

### 9. Se connecter, envoyer et vérifier

1. Cliquez sur **Connect QoreX**. La page affiche votre adresse (`qor1...`), votre solde de testnet et si une clé ML-DSA-87 est enregistrée. QoreX enregistre la clé lors de votre premier envoi.
2. **Send** : envoyez un petit montant de QOR avec un mémo. QoreX montre ce que vous signez et demande une approbation.
3. La page inspecte automatiquement la transaction. Vous pouvez aussi coller le hash de 64 caractères de n'importe quelle transaction du testnet.

## Le code {#code}

Connexion et envoi :

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Lecture de la preuve sur la chaîne :

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` est un petit encodeur protobuf dans `src/App.tsx` pour le message bancaire `MsgSend`, car QoreX prend le message encodé. La page marque une transaction comme vérifiée de façon hybride quand son code est 0, qu'un événement `pqc_hybrid_verify` a le statut `verified` et que la signature post-quantique fait 4 627 octets.

## Ce que vous devriez voir {#result}

- L'en-tête affiche `qorechain-diana (testnet)` et une hauteur de bloc qui ne cesse d'augmenter.
- Après la connexion : votre adresse, votre solde et l'état de la clé.
- Après l'envoi : le hash de la transaction et le code de résultat, puis la carte d'inspection avec le mémo, le type de message, la signature classique de 64 octets, la signature ML-DSA-87 de 4 627 octets avec ses premiers octets en hexadécimal, le nom de l'algorithme `ML-DSA-87 (FIPS 204)`, et le verdict `pqc_hybrid_verify`.
- Dans l'explorateur : ouvrez https://explore.qore.network, passez-le sur **Testnet**, et recherchez le hash de votre transaction.

## Paquets utilisés {#packages}

| Paquet | Version | Rôle |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (épinglée) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Listé comme dépendance ; la page elle-même utilise de simples appels REST |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin React pour Vite |
| `vite` | ^5.4.0 | Serveur de développement et compilation |
| `typescript` | ^5.6.3 | Vérification des types |

## Code source {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
