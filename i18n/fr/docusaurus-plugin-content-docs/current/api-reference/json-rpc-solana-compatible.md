---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Compatible Solana
sidebar_label: JSON-RPC — Compatible Solana
sidebar_position: 4
---

# JSON-RPC — Compatible Solana

QoreChain fournit une interface JSON-RPC compatible Solana via son runtime SVM (Solana Virtual Machine), permettant aux outils et SDK Solana existants d'interagir nativement avec QoreChain.

## Connexion

| Transport | Adresse par défaut        |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

Le serveur JSON-RPC est **démarré par `qorechaind start`** et est **activé par défaut**, écoutant sur `127.0.0.1:8899`. Il est configuré via une section `[svm-rpc]` dans `app.toml` (`enable` + `address`). Un nœud fraîchement démarré sert déjà cette interface — aucun processus supplémentaire n'est requis.

:::note
L'interface JSON-RPC compatible Solana est servie sur le port **8899** à la fois par le mainnet **`qorechain-vladi`** (actif sur la version de chaîne **v3.1.80**) et le testnet **`qorechain-diana`**. L'adresse locale ci-dessus s'applique à un nœud que vous exécutez vous-même ; remplacez par le point de terminaison mainnet ou testnet de votre fournisseur pour un accès distant.
:::

---

## Méthodes

| Méthode                             | Paramètres               | Description                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (chaîne base58) | Renvoie les données du compte, le propriétaire, les lamports et l'indicateur exécutable |
| `getBalance`                        | `pubkey` (chaîne base58) | Renvoie le solde en lamports pour la clé publique donnée       |
| `getSlot`                           | aucun                    | Renvoie le numéro de slot actuel                               |
| `getMinimumBalanceForRentExemption` | `dataLength` (entier)    | Renvoie le solde minimum pour l'exemption de loyer selon la taille des données |
| `getVersion`                        | aucun                    | Renvoie la version logicielle du nœud                          |
| `getHealth`                         | aucun                    | Renvoie le statut de santé du nœud (`"ok"` si sain)            |

---

## Format de réponse

Toutes les réponses suivent la spécification JSON-RPC 2.0. Les réponses qui référencent l'état on-chain incluent un objet `context` avec le `slot` actuel :

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## Exemples

### getAccountInfo

**Requête :**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**Requête :**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**Requête :**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

La chaîne de version `1.18.0-qorechain` indique la compatibilité avec l'interface RPC Solana 1.18.0 s'exécutant sur le runtime SVM de QoreChain.

---

## Intégration @solana/web3.js

Les applications Solana existantes peuvent se connecter à QoreChain en pointant l'objet `Connection` vers le point de terminaison SVM local :

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## Notes

- **Format d'adresse** : les comptes SVM utilisent des clés publiques encodées en base58 (format Solana standard), et non le préfixe Bech32 `qor1` utilisé par les modules natifs Cosmos SDK.
- **Pontage inter-VM** : pour déplacer des actifs entre les runtimes EVM et SVM, utilisez le module Cross-VM (`x/crossvm`). Consultez les [Commandes de transaction](/cli-reference/transaction-commands) pour la syntaxe `crossvm call`.
- **Déploiement de programmes** : déployez des programmes BPF via la CLI (`qorechaind tx svm deploy-program`) ou par programmation à travers le runtime SVM.
- **Budget de calcul** : le runtime SVM applique par défaut un budget de calcul de 1 400 000 unités de calcul par transaction. Cela est configurable via les paramètres du module.
