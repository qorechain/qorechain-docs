---
slug: /developer-tools/qore-cli
title: CLI QoreChain (qore)
sidebar_label: CLI QoreChain
sidebar_position: 24
---

# CLI QoreChain (`@qorechain/qore-cli`, commande `qore`)

`qore` lit QoreChain depuis le terminal. Elle s'adresse aux développeurs, aux opérateurs et aux scripts qui veulent consulter une transaction, vérifier si sa signature post-quantique se vérifie, lire un compte ou l'ensemble des validateurs, simuler une transaction ou préparer un transfert non signé, sans écrire de code. Chaque commande exécute un outil du [serveur MCP QoreChain](/developer-tools/mcp), et `--json` affiche exactement le JSON que renvoie l'outil, de sorte qu'un script et un agent IA voient les mêmes données.

Rien n'est jamais signé ni diffusé, et la CLI ne détient aucune clé. Version **0.1.0**, publiée le 27 octobre 2026, Apache-2.0, Node.js 20 ou plus récent.

## Innovations {#innovations}

- **Un JSON identique à la sortie de l'outil MCP.** `qore <command> --json` affiche le même objet, avec les mêmes noms de champs, que celui que renvoie l'outil MCP correspondant. Sans `--json`, le même objet est affiché sous forme de texte lisible. Un script écrit pour l'un fonctionne avec l'autre.
- **L'état post-quantique depuis le terminal.** `qore pq status <txhash>` indique si la transaction porte exactement une couche hybride et si la signature ML-DSA-87 (FIPS 204) se vérifie par rapport à la clé que le signataire a enregistrée sur la chaîne, pour les sign-bytes v1 et v2. `qore pq status <address>` indique la clé enregistrée, son type, la preuve de possession et la fenêtre d'autorisation EVM.
- **Une chaîne d'étapes pour un transfert qui n'a besoin d'aucune clé.** `prepare-transfer --json` écrit un transfert non signé et `simulate` accepte ce fichier : vous pouvez ainsi construire, vérifier et chiffrer un transfert depuis un script shell. L'étape de signature reste dans votre wallet ou dans [QoreSign](/qoresign/overview).
- **Des codes de sortie stables.** 0 signifie succès, 1 une erreur d'outil portant un code stable tel que `NOT_FOUND` ou `INVALID_INPUT`, et 2 une erreur d'utilisation : un script peut donc se brancher sur le résultat.

## À quoi elle sert {#use-cases}

1. **Vérifier qu'une transaction portait la signature hybride.** Juste après une diffusion, `qore pq status <hash>` indique le niveau de signature et si la couche ML-DSA-87 se vérifie par rapport à la clé enregistrée du signataire.
2. **Consulter l'état de la chaîne depuis un terminal.** `qore block`, `qore account <address>`, `qore validators` et `qore search <query>` répondent à une question rapide sans ouvrir d'explorateur ni écrire de code.
3. **Chiffrer et vérifier un transfert avant de le signer.** `prepare-transfer` écrit un transfert non signé, `simulate` montre le gas, les variations de solde et tout refus décodé, et `estimate-fee` donne les frais suggérés. Vous signez dans votre propre wallet ou avec [QoreSign](/qoresign/overview).
4. **Lire des contrats depuis un script ou une tâche CI.** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq` vérifie un solde de jeton ou une vue de contrat et analyse le résultat.
5. **Scripts shell et supervision.** La sortie `--json` et les codes de sortie stables (0, 1, 2) permettent à un script de se brancher sur le résultat. Le même JSON est celui que renvoie le [serveur MCP](/developer-tools/mcp) : un client IA et un script voient donc les mêmes données.

## Comment elle fonctionne {#how-it-works}

Chaque commande `qore` exécute un outil du cœur partagé du serveur MCP, dans votre processus, contre les points d'accès publics REST, RPC et JSON-RPC EVM du réseau que vous choisissez. Les réponses sont construites champ par champ à partir de la réponse de la chaîne, le texte d'erreur en amont n'est jamais affiché, et un échec correspond à l'un des sept codes d'erreur stables (`NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`). Chaque requête en amont a un délai d'attente de 10 secondes (`--timeout` le modifie), une limite de réponse de 4 MiB et aucune nouvelle tentative. Les vérifications de la signature hybride s'exécutent localement avec [QoreSign](/qoresign/overview). Rien n'est signé ni envoyé. Le détail de chaque outil se trouve sur la [page du serveur MCP](/developer-tools/mcp#how-it-works).

## Comment l'utiliser {#how-to-use}

Exécutez-la sans l'installer, ou installez-la une fois :

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

Les commandes sont en lecture seule et utilisent le testnet par défaut :

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Les montants s'écrivent `1.5` ou `1.5 QOR` (QOR, jusqu'à 6 décimales) ou `1500000uqor`. Les adresses peuvent être `qor1...` ou `0x...`.

### Un script qui vérifie un compte et une transaction {#script}

Le dépôt contient un script complet (`examples/cli/pq-check.sh`) qui fait cela. L'essentiel :

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

Un exemple de `qore block --network mainnet --json` (27 octobre 2026) :

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### Commandes {#commands}

| Commande | Outil MCP | Ce qu'elle fait |
|---|---|---|
| `chain`, `features` | `get_chain_info` | IDs de chaîne, dernier bloc, prix minimal du gas, version des sign-bytes, interrupteurs de fonctionnalités du protocole, précompilés EVM actifs |
| `block [height]` | `get_block` | un bloc, le dernier par défaut |
| `tx get <hash>` | `get_transaction` | une transaction par hash natif ou EVM : statut, frais, messages, signataires, niveau de signature |
| `account <address>` | `get_address_info` | soldes, état du compte, montant staké, les deux formes d'adresse |
| `pq status <address\|txhash>` | `get_pq_status` | état de la clé ML-DSA-87 pour une adresse, ou vérification de la couche hybride pour une transaction |
| `validators [--status S] [--limit N]` | `get_validators` | validateurs par stake ; le statut est `bonded` (par défaut), `unbonding`, `unbonded` ou `all` ; limite jusqu'à 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | paramètres et pool des niveaux de staking, et verrous d'un détenteur (chaîne v3.2.4 et suivantes) |
| `search <query>` | `search` | détecte une hauteur, un hash, une adresse ou un validateur et le lit |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | uniquement un `eth_call` EVM, avec encodage et décodage facultatifs |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | gas, variations de solde et refus décodé pour une transaction encodée |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | limite de gas suggérée et frais, couche ML-DSA-87 comprise |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | un transfert non signé que votre wallet doit signer |

Options globales : `--network testnet|mainnet` (par défaut `testnet`), `--json`, `--timeout <ms>` (délai d'attente en amont, 10000 par défaut), `--help` et `--version`. Les schémas des outils se trouvent dans la [référence des outils MCP](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### Ce qui a été exécuté {#what-was-run}

Le 27 octobre 2026, `@qorechain/qore-cli` 0.1.0 et `@qorechain/mcp` 0.1.0 ont été installés depuis npm dans un projet vide et ces commandes en lecture seule ont été exécutées contre les points d'accès publics :

- `qore --version` a affiché `0.1.0`, et `qore --help` a listé les commandes ci-dessus.
- `qore chain` (testnet) a affiché la chaîne `qorechain-diana`, l'ID de chaîne EVM 9800, le prix minimal du gas 0.1 et les sign-bytes `v2` ; `qore chain --network mainnet` a affiché la chaîne `qorechain-vladi`, l'ID de chaîne EVM 9801 et les sign-bytes `v2`.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` et `qore read-contract --to 0x...0a02 --function "x()"` ont renvoyé leurs données.
- `qore pq status F642F59F...2152` a affiché le niveau `pqc`, `has_exactly_one_pqc_layer: true` et `verified: true` avec les sign-bytes `v2`.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` a écrit un transfert non signé (limite de gas 171698, frais 17170 uqor), `qore simulate` sur ce fichier a renvoyé `ok: true`, et `qore estimate-fee` a renvoyé des frais concordants. L'expéditeur et le destinataire étaient la même adresse, l'outil a donc ajouté un avertissement, et rien n'a été signé ni envoyé.
- `qore tx get zzz` a affiché `error [INVALID_INPUT]` et s'est terminé avec le code 1 ; `qore bogus` s'est terminé avec le code 2.

## Comment y accéder {#how-to-access}

- **Réseaux.** Le testnet `qorechain-diana` (par défaut) et le mainnet `qorechain-vladi` avec `--network mainnet`.
- **Points d'accès.** La CLI lit les points d'accès publics REST, RPC et JSON-RPC EVM : `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` et `https://evm-testnet.qore.host` sur le testnet, et `https://api.qore.host`, `https://rpc.qore.host` et `https://evm.qore.host` sur le mainnet.
- **Compte et clés.** Aucun. Il n'y a ni connexion, ni clé d'API, ni fichier de configuration ; la clé du point d'accès MCP hébergé ne s'applique pas à la CLI.
- **Prérequis.** Node.js 20 ou plus récent et une sortie HTTPS.
- **Coût.** Gratuit. Pour envoyer le transfert que vous avez préparé, vous payez les frais du réseau (plancher de 0.1 uqor par gas) depuis votre propre wallet ; la CLI ne réalise pas cette étape.

## Notes de sécurité {#security}

* **Aucun chemin de code de signature.** La CLI ne détient aucune clé, ne signe rien et ne diffuse rien ; `prepare-transfer` renvoie un document non signé.
* **Les secrets sont refusés.** Une entrée qui ressemble à une phrase de récupération (12 mots BIP-39 consécutifs ou plus) ou à une clé privée brute de 32 octets est rejetée avec `INVALID_INPUT` avant toute requête. N'en placez pas dans une ligne de commande pour autant : l'historique de votre shell la conserve, et l'erreur vous indique de considérer ce secret comme exposé.
* **Seules des données publiques quittent votre machine :** les adresses, les hashes et les transactions encodées que vous fournissez, envoyés aux points d'accès publics de QoreChain.
* **Le mainnet est explicite.** Les appels vont vers le testnet sauf si vous passez `--network mainnet`, et un transfert préparé pour le mainnet porte un avertissement.
* **Les mémos sont publics et permanents.** Ne placez jamais de secret dans un `--memo`.
* Signalez les vulnérabilités en privé à security@qore.network, jamais dans un ticket public.

## Où elle est publiée {#where-published}

| Registre | Paquet | Version | Installation | Notes |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Binaire `qore`. Node.js 20 ou plus récent |

Source : [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), dossier `packages/cli` (public, Apache-2.0, vérifié le 27 octobre 2026). Il n'existe pas de version Python ou Rust de la CLI ; le serveur lui-même est aussi sur PyPI sous le nom [`qorechain-mcp`](/developer-tools/mcp#where-published).

## Limites et problèmes connus {#limits}

- **Lecture seule.** Aucune commande ne signe ni ne diffuse. `prepare-transfer` construit uniquement un `MsgSend` d'uqor sur la voie native ; elle ne prépare pas de transactions EVM, SVM, de staking, de gouvernance ou de contrat. `simulate` et `estimate-fee` acceptent toute transaction encodée de la voie native.
- **Pas de faucet ni de liste des détenteurs de jetons.** Ces deux outils MCP n'ont pas de commande CLI. Les QOR du testnet viennent du [Faucet](/dashboard/faucet).
- **L'historique du testnet est élagué.** Un ancien bloc ou une ancienne transaction du testnet renvoie `NOT_FOUND` avec la plus basse hauteur disponible ; le mainnet servait depuis la hauteur 1 au moment de la vérification.
- **Les chiffres de gas suivent la version de la chaîne.** Les deux réseaux ont appliqué la v3.2.5 : la simulation inclut donc le coût de vérification ML-DSA-87 ; face à un nœud plus ancien, la limite de gas suggérée comporte une marge.
- **Limites de sortie.** Au plus 100 hashes de transactions par bloc, 50 messages par transaction, 100 soldes par compte, 200 validateurs par appel. Chaque requête a un délai d'attente par défaut de 10 secondes, une limite de réponse de 4 MiB et aucune nouvelle tentative.
- **Les secrets sont refusés.** Une entrée qui ressemble à une phrase de récupération ou à une clé privée brute est rejetée avec `INVALID_INPUT`. N'en placez pas dans une ligne de commande : l'historique du shell la conserve.
- **Les précompilés post-quantiques EVM** `0x...0A01` et `0x...0A02` sont actifs sur le testnet uniquement.
- **Première version.** 0.1.0 : les noms de commandes et les options peuvent changer dans les versions suivantes. Utilisez `--json` et les codes de sortie pour les scripts, et épinglez la version.

## Pages liées {#related}

* [Serveur MCP QoreChain](/developer-tools/mcp) : les mêmes outils pour les clients IA, avec un point d'accès hébergé.
* [QoreSign](/qoresign/overview) : signez le transfert que `prepare-transfer` écrit.
* [Référence de la CLI du SDK](/sdk/reference/cli) : la ligne de commande propre au SDK.
* [Faucet](/dashboard/faucet) : QOR du testnet.
* [Présentation des paquets développeur](/developer-tools/overview).
