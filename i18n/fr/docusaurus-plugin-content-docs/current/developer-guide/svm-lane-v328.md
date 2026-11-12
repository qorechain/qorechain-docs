---
slug: /developer-guide/svm-lane-v328
title: "Lane SVM : programmes, comptes et limites de garde (v3.2.8)"
sidebar_label: Lane SVM (v3.2.8)
sidebar_position: 10
---

# Lane SVM : programmes, comptes et limites de garde (v3.2.8)

La lane SVM est la partie de QoreChain compatible avec Solana : vous déployez des programmes compilés, créez des comptes de données et appelez des programmes avec des outils de style Solana, et le même solde de QOR natif est visible en lamports. La version **v3.2.8** a fermé la lane lors de la mise à niveau, jusqu'à ce qu'un vote de gouvernance la rouvre. Sur le testnet, ce vote (proposition 37) a été adopté et la lane est **ouverte** ; sa garde est bornée par trois limites gouvernées.

Cette page explique comment lire l'état de la lane, comment fonctionnent les programmes, les comptes et le loyer, comment un portefeuille SVM enregistre une clé post-quantique, ce que signifient les limites de garde, et quels exemples peuvent être exécutés aujourd'hui.

:::note Testnet d'abord, et la lane y est ouverte depuis la proposition 37
La v3.2.8 s'exécute sur le testnet **`qorechain-diana`** depuis le 12 novembre 2026. Le mainnet (`qorechain-vladi`) exécute la v3.2.7 (depuis le 12 novembre 2026), n'a pas appliqué la v3.2.8, et **la lane reste désactivée sur le mainnet**. La mise à niveau a fermé la lane sur le testnet (les écritures SVM échouaient, `MsgRegisterSVMPQCKey` était refusé). **La proposition de gouvernance 37 a été adoptée et l'a ouverte sur `qorechain-diana`** : elle a mis `enabled: true`, laissé les autres paramètres tels quels et levé la pause du coupe-circuit sur `MsgExecuteProgram` et sur les appels inter-VM. Lors de la vérification du 12 novembre 2026 après le vote, `GET /qorechain/svm/v1/params` montrait `enabled: true` et la liste du coupe-circuit ne contenait que `/cosmwasm.wasm.v1.MsgStoreCode`. Le JSON-RPC SVM public reste en lecture seule. Lisez toujours l'état en direct d'abord (section suivante) et ne le supposez pas.
:::

## Pourquoi c'est important {#why}

* Un client qui propose des actions SVM alors que la lane est fermée donne aux utilisateurs des transactions refusées. Lire un paramètre au préalable évite cela.
* La lane détient du vrai QOR : chaque lamport d'un programme, d'une adresse dérivée d'un programme ou d'un compte de données est adossé à des uqor détenus par le module SVM. Les trois limites de garde gardent ce réservoir borné ; un transfert ou un dépôt peut donc être refusé même si l'expéditeur dispose des fonds.
* Le loyer et les limites de taille déterminent le coût de conservation de l'état on-chain ; ils doivent donc figurer dans un budget de déploiement.

## Lire l'état de la lane {#lane-state}

L'état de la lane est le champ `enabled` des paramètres SVM. Lisez-le depuis la route REST ou la CLI de nœud. La même réponse contient toutes les autres limites de cette page : un seul appel suffit donc pour dimensionner un déploiement.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Réponse sur `qorechain-diana`, 12 novembre 2026, après l'adoption de la proposition 37 (HTTP 200) :

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Sur un nœud Linux (il n'existe pas de binaire macOS empaqueté), la même lecture est :

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

En TypeScript, avec Node 18 ou ultérieur (aucun appel au SDK n'est nécessaire pour cette lecture) :

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

Un assistant typé pour ces paramètres (et un constructeur sûr pour une proposition de paramètres) fait partie de la version brouillon du SDK pour la v3.2.8, qui n'est pas encore publiée. Une prochaine version du SDK l'ajoutera ; utilisez d'ici là la ligne de commande ou la route REST.

### Identité du cluster {#cluster-info}

`cluster_info` identifie le cluster pour les portefeuilles et indique si l'exécution est activée. Il ne change avec l'état de la lane que par `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

Réponse du 12 novembre 2026, lue après l'adoption de la proposition 37, avec `execution_enabled` à `true` (HTTP 200) :

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

La CLI de nœud a la même requête : `qorechaind query svm cluster-info`. La méthode JSON-RPC `getGenesisHash` sur `https://svm-testnet.qore.host` renvoie le même hash. Le hash est dérivé de l'identifiant de chaîne ; ce n'est pas le hash de genèse d'un vrai cluster Solana. La route est aussi servie sur le mainnet (v3.2.7) : le 12 novembre 2026, `https://api.qore.host/qorechain/svm/v1/cluster_info` a répondu `200` avec `execution_enabled` à `false`.

## Le RPC SVM public est en lecture seule {#public-rpc}

Les points de terminaison publics `https://svm.qore.host` et `https://svm-testnet.qore.host` répondent aux lectures et refusent les méthodes d'écriture (`sendTransaction` et similaires) sur les identifiants de chaîne publics, que la lane soit ouverte ou non. Pour soumettre des transactions SVM, vous exécutez votre propre nœud, qui sert par défaut le JSON-RPC compatible Solana sur le port 8899 (voir [Développement SVM](/developer-guide/svm-development#json-rpc-server)), et la lane elle-même doit être ouverte sur le réseau que ce nœud suit. Les lectures fonctionnent dès maintenant :

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` a indiqué `solana-core` `1.18.0-qorechain` avec l'identifiant de chaîne, l'identifiant du cluster et le hash de genèse. Le devis de loyer pour 1 024 octets était de `8017920` lamports le 12 novembre 2026. Les routes REST `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` et `.../slot` ont répondu **HTTP 501** (non implémenté) sur le point de terminaison public ; lisez les comptes et les programmes avec les méthodes JSON-RPC `getAccountInfo` et `getMultipleAccounts`, ou avec la CLI de nœud.

## Déployer et appeler des programmes {#programs}

Une fois la lane ouverte, le déroulement est le suivant : construire un programme SBF avec la chaîne d'outils Solana actuelle, le déployer, créer les comptes dont il a besoin, puis l'appeler. Chaque commande `tx svm` est une transaction de la lane Cosmos : elle exige donc une limite de gas explicite, des frais d'au moins le gas multiplié par 0,1 uqor, et la cosignature post-quantique hybride (voir [Signature post-quantique](/developer-guide/post-quantum-signing)).

Voici les commandes de la CLI de nœud Linux tirées de la référence du nœud. **UNTESTED : la lane ne s'est ouverte sur le testnet qu'après la proposition 37, et aucun déploiement de programme, aucune exécution ni aucune création de compte n'a été exécuté pour cette page.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Lectures sur un nœud, disponibles quel que soit l'état de la lane :

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript avec @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` est une fine couche au-dessus de `@solana/web3.js`. Il n'a pas d'enveloppe pour le chargeur : utilisez la CLI de nœud ci-dessus pour déployer, et le paquet pour construire et envoyer des instructions à un programme qui existe déjà. Ses préréglages publics ne définissent volontairement aucun point de terminaison SVM : donnez-lui l'URL de votre propre nœud.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED :** cet exemple nécessite un nœud que vous exécutez (la lane est ouverte sur le testnet). Face au point de terminaison public, l'envoi est refusé. Les appels en lecture seule (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`) fonctionnent contre `https://svm-testnet.qore.host`, car `createSvmClient({ rpcUrl })` accepte n'importe quelle URL.

Python, Go, Rust et Java : les adaptateurs SVM de ces langages construisent les mêmes messages ; une prochaine version du SDK ajoutera les assistants de la v3.2.8. D'ici là, utilisez la CLI de nœud ci-dessus ou le message brut. N'importe quelle bibliothèque cliente Solana peut aussi dialoguer avec le port 8899 de votre propre nœud, car l'ensemble de méthodes est compatible Solana.

## Comptes et loyer {#rent}

Les comptes de données SVM paient l'espace qu'ils utilisent. Les chiffres proviennent des paramètres en direct ci-dessus.

| Élément | Règle | Valeur en direct (testnet) |
| ------- | ----- | -------------------------- |
| Loyer par an | taille des données en octets multipliée par `lamports_per_byte` | 3 480 lamports par octet |
| Minimum exempté de loyer | loyer par an multiplié par `rent_exemption_multi` | multiplicateur 2,0 |
| Approvisionné au minimum ou au-delà | jamais soumis au loyer | |
| Approvisionné en dessous du minimum | le loyer est déduit à chaque époque | |
| Le solde atteint zéro | le compte est supprimé | |

Les lamports et les uqor sont liés par 1 uqor = 1 000 lamports. Demandez le minimum exact au nœud plutôt que de le calculer : `getMinimumBalanceForRentExemption` a renvoyé 8 017 920 lamports pour 1 024 octets (le devis inclut l'en-tête du compte). `create-account` exige au moins ce nombre de lamports, sinon le compte n'est pas exempté de loyer.

Adresses : l'adresse SVM d'un compte est ses 20 octets de compte complétés jusqu'à 32 octets et écrits en base58. Les formes `qor1...`, `0x...` et base58 désignent le même compte.

## Clé post-quantique pour les portefeuilles SVM {#pqc-key}

Un portefeuille SVM qui veut une clé post-quantique on-chain l'enregistre avec **`MsgRegisterSVMPQCKey`**. Ce message porte l'expéditeur, l'adresse SVM de 32 octets et la clé publique ML-DSA-87. C'est un message de la lane Cosmos : l'expéditeur le signe donc en hybride comme toute autre transaction native. Il est refusé tant que la lane est fermée, et **le compte SVM doit déjà exister avant l'enregistrement de sa clé** (voir le refus sous [Testé sur le testnet](#tested)).

Il n'y a pas de commande `tx svm` pour cela ; utilisez le compositeur du SDK. En TypeScript, le compositeur est `msg.svm.registerSvmPqcKey` dans `@qorechain/sdk`. **UNTESTED pour un compte existant : le seul envoi concernait une adresse sans compte, et il a été refusé.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Le compositeur Python est `msg.svm.register_svm_pqc_key(sender=, ...)` et celui de Go est `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## Limites de garde {#custody}

Chaque lamport détenu par un programme, une adresse dérivée d'un programme ou un compte de données est adossé à des uqor que le module SVM conserve dans un réservoir unique, appelé la garde. Trois paramètres gouvernés la bornent. Tous sont en uqor ; 1 QOR vaut 1 000 000 uqor. La gouvernance les modifie par une proposition de paramètres, et une proposition doit envoyer les douze champs, car elle remplace l'ensemble en bloc.

| Paramètre | Valeur en direct | En termes simples |
| --------- | ---------------- | ----------------- |
| `max_custody_uqor` | 10 000 000 000 (10 000 QOR) | Le plafond du solde du réservoir SVM. Un transfert qui ferait dépasser ce plafond au réservoir est refusé avec `svm custody cap exceeded` (code 23). `0` signifie aucun plafond. |
| `max_custody_hard_uqor` | 1 000 000 000 000 (1 000 000 QOR) | Le plafond absolu du solde brut du réservoir, réserves de loyer, préfinancements et dons simples compris. Une opération qui laisserait le solde au-dessus est refusée. Il ne doit pas être inférieur à `max_custody_uqor`, et il doit être supérieur à zéro pour que la lane puisse être ouverte. |
| `max_account_excess_uqor` | 10 000 000 000 (10 000 QOR) | Le maximum qu'un compte de données peut détenir au-dessus de son minimum exempté de loyer. `0` signifie aucun plafond par compte. |

Ce que cela signifie pour une application : gardez la valeur que vous placez dans des comptes SVM modeste, et au-dessus du minimum de loyer seulement de ce dont vous avez besoin. Un dépôt acceptable pour votre solde peut quand même être refusé si le réservoir dans son ensemble est proche de son plafond ; traitez donc le code 23 comme « réessayez plus tard ou avec moins », et non comme une transaction invalide. Les limites ne peuvent augmenter que par un vote de gouvernance, jamais par une transaction d'utilisateur.

## Budget de calcul et limites de taille {#limits}

| Limite | Paramètre | Valeur en direct (testnet) |
| ------ | --------- | -------------------------- |
| Unités de calcul par instruction | `compute_budget_max` | 1 400 000 |
| Taille du programme (ELF) | `max_program_size` | 10 485 760 octets (10 Mio) |
| Taille d'un compte de données | `max_account_data_size` | 10 485 760 octets (10 Mio) |
| Appels de programmes imbriqués | `max_cpi` | 4 |
| Schéma de signature par défaut | `default_sig_scheme` | 0 (Ed25519) |
| Décalage de slot | `svm_slot_offset` | 0 (le slot est la hauteur de bloc plus le décalage) |

Chaque cadre a une pile de 32 Kio et un tas de 256 Kio. Les valeurs ci-dessus peuvent changer par gouvernance : lisez-les donc en direct. Dans `@qorechain/svm` 0.13.0, `withComputeBudget(tx, { units })` demande une limite d'unités de calcul ; gardez-la inférieure ou égale à `compute_budget_max`.

## Limites actuelles du point de terminaison SVM du testnet {#endpoint-limits}

La lane est ouverte, mais le JSON-RPC SVM public ne se comporte pas encore comme un nœud Solana complet. Planifiez en tenant compte de ces limites :

- **`getLatestBlockhash` renvoie le blockhash sous forme de 64 caractères hexadécimaux,** et non en base58 comme le font les nœuds Solana (lu le 12 novembre 2026 : `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). Un client qui attend du base58 doit le convertir. L'équipe de la chaîne a programmé une modification.
- **Le `sendTransaction` au format de fil Solana, depuis les outils Solana standard, n'est pas encore pris en charge** sur le point de terminaison public. Les programmes sont déployés et appelés avec les messages Cosmos `MsgDeployProgram` et `MsgExecuteProgram`, signés avec la signature hybride comme toute transaction de la lane Cosmos (voir les assistants TypeScript ci-dessus). Une parité complète avec les outils Solana est prévue pour une version ultérieure.
- **Une clé étrangère peut autoriser une action SVM par l'intermédiaire d'un relayeur.** L'autorisation signe un condensat lié à la chaîne (domaine `qorechain-svm-auth-v3`) dès que le réseau active la fonctionnalité de protocole `svm-relayed-chain-bound` ; `@qorechain/wallet-adapter` 0.6.0 le construit avec `authSignBytesV3`, et `resolveSvmAuthVersion` lit la forme que le réseau attend.

## Erreurs et refus {#errors}

| Ce que vous voyez | Signification | Que faire |
| ----------------- | ------------- | --------- |
| `SVM module is disabled` (code 11) | La lane est fermée (mainnet, ou testnet avant la proposition 37) | Lisez `enabled` ; ne réessayez pas |
| `MsgRegisterSVMPQCKey` refusé avec `SVM account ... not found` (codespace `svm`, code 3) | Le compte SVM n'existe pas encore | Créez d'abord le compte, puis enregistrez sa clé |
| `MsgRegisterSVMPQCKey` refusé alors que la lane est fermée | Lane fermée | Enregistrez après l'ouverture de la lane |
| Méthode d'écriture refusée sur `svm.qore.host` ou `svm-testnet.qore.host` | Les points de terminaison publics sont en lecture seule | Utilisez votre propre nœud |
| `svm custody cap exceeded` (code 23) | Le réservoir est à son plafond | Réessayez plus tard ou avec un montant plus petit |
| `airdrop rate limit exceeded` (code 19) | `requestAirdrop` appelé trop souvent (testnet uniquement) | Patientez |
| `blockhash expired` (code 20) | Le blockhash récent est trop ancien | Récupérez-en un nouveau et signez de nouveau |
| `svm simulation slots busy, retry later` (code 24) | Les simulations sont bornées ; cela ne se produit jamais dans un bloc | Relancez la simulation |
| HTTP 501 sur `/qorechain/svm/v1/account/...` | Route non implémentée sur le point de terminaison public | Utilisez `getAccountInfo` |

## Testé sur le testnet {#tested}

Exécuté sur `qorechain-diana` le 12 novembre 2026 (version v3.2.8) après l'adoption de la proposition 37.

| Étape | Résultat |
| ----- | -------- |
| `GET /cosmos/circuit/v1/disable_list` | Uniquement `/cosmwasm.wasm.v1.MsgStoreCode` |
| `GET /qorechain/svm/v1/params` | `enabled` true ; `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| `MsgRegisterSVMPQCKey` pour une adresse SVM qui n'existe pas encore | Refusé : codespace `svm` code 3, `SVM account ... not found: SVM account not found`. Le compte doit exister avant l'enregistrement de sa clé post-quantique |

Non exécutés (UNTESTED) : déploiement de programme, exécution de programme et création de compte SVM.

## Mainnet {#mainnet}

Le mainnet reste pour l'instant en v3.2.7, avec la lane SVM désactivée, et son activation sur le mainnet demande une version ultérieure et un vote de gouvernance. Planifiez uniquement par rapport au testnet.

## Voir aussi {#see-also}

* [Développement SVM](/developer-guide/svm-development) : l'aperçu de la lane, le serveur JSON-RPC et le QOR natif en lamports.
* [JSON-RPC compatible Solana](/api-reference/json-rpc-solana-compatible) : la liste des méthodes.
* [Signature post-quantique](/developer-guide/post-quantum-signing) : la signature hybride dont toute transaction de la lane native a besoin.
* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) : appels entre SVM, EVM et QoreChain Native.
* [Opérateurs de nœuds : liste de contrôle v3.2.8](/developer-guide/node-operators-v328) : mise à niveau d'un nœud.
