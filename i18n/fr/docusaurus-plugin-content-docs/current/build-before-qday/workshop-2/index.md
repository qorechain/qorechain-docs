---
slug: /build-before-qday/workshop-2
title: "Atelier 2 : protéger de l'argent avec une clé post-quantique"
sidebar_label: "Atelier 2"
sidebar_position: 3
date: 2026-11-18
---

# Atelier 2 : protéger de l'argent avec une clé post-quantique

L'atelier 1 a envoyé une transaction signée avec deux clés. L'atelier 2 utilise la clé post-quantique pour **protéger de l'argent** : d'abord un contrat intelligent qui ne paie que lorsqu'une clé post-quantique signe, puis un agent IA dont les limites de dépense sont imposées par la chaîne, puis un moyen de demander à la chaîne comment chaque transaction a été protégée.

Vous n'avez pas besoin d'être expert en sécurité. Chaque commande ci-dessous dit ce qu'elle fait et ce que vous devez voir. Les trois applications d'exemple sont publiques : [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), dossier `workshop-2`.

**Durée :** environ 40 minutes pour le coffre, 25 pour l'agent, 10 pour les questions à la chaîne. Faites les parties dans l'ordre que vous voulez, mais chaque partie a besoin de son propre compte de test.

## Ce que nous construisons {#what-we-built}

| Partie | Application | Ce qu'elle montre |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity et TypeScript) | Un coffre qui ne paie qu'avec une signature ML-DSA-87, vérifiée sur la chaîne par le precompile `pqcVerify`. Une clé de type Ethereum volée ne suffit pas pour prendre l'argent. |
| 2 | **Agent payeur de factures** (Node.js) | Un agent avec sa propre clé. La chaîne impose ses limites : envoi uniquement, 1 QOR par paiement, 3 QOR par jour, 24 heures. |
| 3 | **Interroger la chaîne** (MCP et `qore-cli`) | Des questions en lecture seule : cette transaction a-t-elle été signée de façon post-quantique, et quel est l'état de la clé de ce compte ? |

Les innovations derrière ces applications :

- **La vérification post-quantique dans un contrat.** La chaîne possède des contrats intégrés (precompiles) à des adresses fixes, qui vérifient les signatures ML-DSA-87 et indiquent la clé enregistrée d'un compte. Votre code Solidity les appelle comme n'importe quel autre contrat.
- **Des limites qui vivent sur la chaîne.** Les permissions et les règles de dépense d'un agent font partie du compte : un bug ou un serveur volé ne peut pas les lever.
- **Des étiquettes honnêtes.** La chaîne peut vous dire quelles transactions portaient une signature post-quantique et lesquelles n'en portaient pas.

## Les mots utilisés dans ce guide {#words}

| Mot | Sens simple |
| --- | --- |
| Precompile | Un contrat intégré à une adresse fixe, que la chaîne exécute nativement. `pqcVerify` est à `0x0000000000000000000000000000000000000a01` et `pqcKeyStatus` à `0x0000000000000000000000000000000000000a02`. Écrivez les adresses en minuscules : le compilateur Solidity refuse l'écriture avec majuscules et minuscules mélangées |
| ML-DSA-87 | Le schéma de signature post-quantique (NIST FIPS 204) utilisé par QoreChain |
| Fenêtre EVM | Une courte permission limitée d'envoyer des transactions de type Ethereum depuis un compte. L'ouvrir exige une transaction signée avec les deux clés : une clé Ethereum seule ne peut donc jamais en ouvrir une |
| Gardien | Le compte dont la clé post-quantique doit signer chaque retrait du coffre |
| Authentificateur | Une clé liée à votre compte avec des règles que la chaîne impose, comme celle de l'agent de la partie 2 |
| Compte jetable | Une clé créée pour cet exercice, qui ne contient que des QOR de test |

:::caution Des comptes de testnet jetables uniquement
Utilisez des clés créées pour cet atelier, qui contiennent des QOR de test sans valeur. Ne placez jamais dans un fichier `.env` ni dans une commande la clé ou le code de récupération d'un compte qui contient de l'argent réel.
:::

## Avant de commencer {#prerequisites}

Il vous faut les outils de [Avant de commencer](/build-before-qday/prerequisites) (un terminal, Node.js 22 ou plus récent et Git), ainsi qu'un navigateur web. Vérifiez Node.js :

```bash
node -v
```

Elle doit afficher `v22` ou plus. La partie 1 demande aussi **pnpm** et **Foundry** :

```bash
npm install -g pnpm
```

Installe pnpm, l'outil de paquets que le coffre utilise. Vérifiez-le avec `pnpm -v`.

Foundry compile, teste et déploie du Solidity. Installez-le depuis [getfoundry.sh](https://getfoundry.sh) : la page donne une commande pour votre système, puis vous lancez :

```bash
foundryup
```

Télécharge les outils Foundry. Vérifiez avec `forge --version` et `cast --version`.

Récupérez le code d'exemple :

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

La première ligne télécharge les exemples dans un dossier nommé `build-before-qday`. La seconde entre dans le dossier `workshop-2`, qui contient les trois applications.

Pour les QOR de test, vous utilisez le [faucet](/dashboard/faucet) du tableau de bord. Les trois applications fonctionnent uniquement sur le testnet QoreChain `qorechain-diana`.

## Partie 1 : QDayVault, un coffre qui résiste à une clé divulguée {#part-1}

Code : [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). Une clé de portefeuille ordinaire (la clé secp256k1 que MetaMask utilise) pourrait un jour être cassée par un ordinateur quantique. Ce coffre est conçu pour qu'une clé volée de ce type ne suffise pas : l'argent ne sort que si le **gardien** signe le retrait avec une clé post-quantique, et le contrat vérifie lui-même cette signature, sur la chaîne. N'importe qui peut soumettre le retrait signé. Ce qui compte, c'est la signature, pas la personne qui l'envoie.

```bash
cd 01-qday-vault
```

Entre dans le dossier du coffre.

### Comment fonctionne le contrat {#vault-how}

Ouvrez `src/QDayVault.sol`. La fonction importante est `withdraw` :

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Lire la clé du gardien sur la chaîne.** La clé fait 2 592 octets : le contrat ne la stocke donc pas. Si le gardien change de clé sur la chaîne, le coffre suit.
2. **Refuser une clé qui n'a jamais été prouvée.** « Prouvée » signifie que le compte a signé une preuve de possession lors de l'enregistrement de la clé. Sans cette vérification, quelqu'un pourrait enregistrer une clé qui ne lui appartient pas.
3. **Vérifier la signature sur un message exact.** Le message lie une étiquette fixe, l'ID de chaîne, l'adresse du coffre, le destinataire, le montant et le nonce : une signature vaut donc pour un seul retrait, sur un seul coffre, sur une seule chaîne, une seule fois.
4. **Augmenter le nonce avant d'envoyer l'argent.** La même signature ne peut pas servir deux fois, et l'état change avant l'appel externe, ce qui protège contre la réentrance.
5. **Vérifier que le transfert a réussi.** S'il a échoué, toute la transaction est annulée.

### Étape 1 : lancer les tests (aucun compte nécessaire) {#vault-tests}

```bash
pnpm install
```

Télécharge les paquets JavaScript de `package.json` (le SDK QoreChain, viem, tsx).

```bash
pnpm forge-std
```

Télécharge `forge-std`, la bibliothèque standard de Foundry, dans `lib/`. Les tests et le script de déploiement l'importent. Vous ne le faites qu'une fois.

```bash
forge test
```

Compile le contrat et lance les 8 tests de `test/QDayVault.t.sol`. Vous devez voir `8 passed; 0 failed`. La chaîne de test locale n'a pas les precompiles de QoreChain : les tests placent donc de petits contrats de remplacement aux deux adresses de precompiles avec `vm.etch`. Ils vérifient la logique : une bonne signature paie, une mauvaise est refusée, une signature ne sert qu'une fois, une clé non prouvée est refusée. Les vrais precompiles s'exécutent dans les étapes suivantes.

### Étape 2 : créer un compte réservé au testnet {#vault-account}

```bash
cast wallet new
```

Affiche une nouvelle adresse et une nouvelle clé privée. Utilisez-les uniquement sur le testnet.

Sur macOS et Linux :

```bash
cp .env.example .env
```

Sous Windows PowerShell, utilisez `Copy-Item .env.example .env`. Cela crée votre propre fichier de réglages. `.env` est ignoré par Git : il n'est donc jamais versionné. Ouvrez `.env` et mettez dans `PRIVATE_KEY` la clé privée donnée par `cast wallet new`.

```bash
pnpm window recovery-code
```

Affiche un code de récupération qui commence par `QRC1-`. Votre clé post-quantique en est créée. Mettez-le dans `.env` sous `QORE_PQC_RECOVERY_CODE` et gardez-en une copie en lieu sûr, séparée de la clé privée. Utilisez toujours le même code : un autre code donne une autre clé post-quantique.

### Étape 3 : alimenter le compte {#vault-fund}

```bash
pnpm window status
```

Affiche votre compte sous deux formes, `0x...` et `qor1...`. C'est le même compte. Collez l'adresse `qor1...` dans le [faucet](/dashboard/faucet).

### Étape 4 : enregistrer votre clé post-quantique, une seule fois {#vault-register}

```bash
pnpm window register
```

Place votre clé publique ML-DSA-87 sur la chaîne, avec une preuve que vous la possédez. Vous le faites une fois par compte. Ensuite, `pnpm window status` affiche `PQC key: registered`. C'est la seule transaction que la chaîne accepte avec la seule clé classique, car elle ne connaît pas encore votre clé post-quantique. Pour ce que l'enregistrement lie réellement, voir [Comment votre clé post-quantique est liée à votre compte](/build-before-qday/key-binding).

### Étape 5 : ouvrir une fenêtre EVM limitée {#vault-window}

```bash
pnpm window:scoped
```

Envoie une transaction signée avec les deux clés qui ouvre une fenêtre EVM de **600 blocs (environ 15 minutes), 3 transactions et 2 QOR** de valeur plus frais. C'est assez pour le déploiement et un retrait, et rien de plus. Si votre clé classique fuit pendant que la fenêtre est ouverte, les dégâts sont plafonnés à ce budget ; quand elle se termine, la voie de type Ethereum se referme.

**Attendez environ 10 secondes** avant l'étape suivante. L'ouverture de la fenêtre a utilisé un nonce de votre compte, et le bloc suivant doit d'abord l'inclure.

### Étape 6 : déployer le coffre {#vault-deploy}

```bash
pnpm deploy:testnet
```

Lance le script Foundry `script/QDayVault.s.sol` : il déploie le coffre avec un dépôt de 1 QOR et fait de **vous** le gardien. Cherchez `QDayVault 0x...` dans la sortie. Dans la sortie de Foundry, « ETH » signifie QOR.

```bash
pnpm vault status
```

Affiche l'adresse du coffre, son solde (1 QOR), le gardien (vous) et le nonce (0).

### Étape 7 : l'attaque, en simulation {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Joue un attaquant qui a votre clé classique mais pas votre clé post-quantique. Il signe le retrait avec une clé ML-DSA-87 aléatoire et demande à la chaîne ce qui se passerait. Vous devez voir `BLOCKED by the vault: BadPqcSignature`. Ce n'est qu'une simulation : elle ne coûte rien et n'utilise pas votre fenêtre. N'importe quelle adresse convient comme destinataire.

### Étape 8 : le vrai retrait {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Signe le retrait avec **votre** clé ML-DSA-87 (un message de 157 octets, une signature de 4 627 octets) et l'envoie. Le coffre la vérifie avec `pqcVerify` et paie. Vous devez voir `WITHDRAWN tx 0x...` et un lien vers l'explorateur.

```bash
pnpm window status
```

Affiche ce qui reste de la fenêtre : 1 transaction, exactement le budget que vous lui avez donné.

### En cas de problème {#vault-troubleshooting}

| Ce que vous voyez | Ce que cela signifie | Que faire |
| --- | --- | --- |
| `REFUSED: Missing or invalid parameters` au déploiement ou au retrait | Il n'y a pas de fenêtre EVM active : elle a expiré ou a été épuisée | Lancez `pnpm window status`, puis `pnpm window:scoped`, attendez 10 secondes, réessayez |
| `does not exist on chain yet` | Le compte n'a pas encore de QOR | Utilisez le faucet (étape 3) |
| `PQC key: not registered` | L'étape 4 a été sautée | Lancez `pnpm window register` |
| `GuardianKeyNotRegistered` | Le gardien n'a pas de clé ML-DSA-87 sur la chaîne | Enregistrez-la (étape 4) |
| `No vault yet` | Rien n'a été déployé depuis ce dossier | Faites l'étape 6, ou définissez `VAULT_ADDRESS` dans `.env` |

### Auditer le contrat avant de le déployer {#vault-audit}

Le dossier `audit/` contient le premier brouillon du contrat, avec de vrais bogues, et la version corrigée. Il montre un flux en deux temps avec l'[Auditeur de contrats](/dashboard/contract-auditor) du tableau de bord : auditez le brouillon, corrigez chaque constat avec un test, auditez le contrat final et conservez les deux rapports. Un audit automatique ne remplace pas un audit humain avant le mainnet. Pour Solidity, la note de préparation au quantique affiche « Not scored », ce qui est normal : sur l'EVM, la vérification post-quantique est faite par la chaîne via le precompile. Voir `audit/README.md` dans le dossier, et la page [Precompiles EVM](/developer-guide/evm-precompiles) pour les adresses des precompiles et le gas.

## Partie 2 : un agent payeur de factures avec des limites imposées par la chaîne {#part-2}

Code : [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). Si vous donnez votre clé privée à un bot, ses limites de dépense vivent dans son propre code. Un bug, une injection de prompt ou un serveur volé, et les limites disparaissent. Sur QoreChain, les limites vivent **sur la chaîne** : l'agent reçoit sa propre clé, liée à votre compte sous des règles que la chaîne contrôle à chaque paiement.

Remontez d'un dossier et entrez dans l'agent :

```bash
cd ../02-pq-agent
```

### Trois clés, trois rôles {#agent-keys}

| Clé | Qui la détient | Ce qu'elle peut faire |
| --- | --- | --- |
| **Propriétaire** | Vous | Votre compte, signé avec les deux clés. Il détient l'argent, lie l'agent et écrit les règles |
| **Clé de l'agent** | L'agent | Une clé ed25519. Elle peut demander à dépenser depuis le compte du propriétaire, uniquement dans le cadre des règles. Elle ne détient aucun argent |
| **Portefeuille de gas** | L'agent | Un petit compte séparé qui soumet les demandes de l'agent et paie les frais. Il ne détient jamais l'argent du propriétaire |

Les règles de cet exemple : l'agent peut seulement **envoyer des QOR**, au plus **1 QOR par paiement** et **3 QOR par jour**, et le lien **expire après 24 heures**. Ouvrez `agent.mjs` et regardez la commande `pay` : elle ne contient aucune vérification de limite. L'agent essaie simplement de payer. Chaque limite que vous verrez vient de la chaîne.

### Étape 1 : installer et créer les clés {#agent-keys-create}

```bash
npm install
```

Télécharge les paquets de `package.json` : le SDK QoreChain, CosmJS et `@noble/curves` pour la clé ed25519.

```bash
node agent.mjs init
```

Crée la clé ed25519 de l'agent et son portefeuille de gas, et les enregistre dans `~/.config/qday/agent.env`, lisible uniquement par vous. Affiche l'adresse `qor1...` du portefeuille de gas.

```bash
node agent.mjs owner-init
```

Crée un compte propriétaire jetable pour le testnet et l'enregistre dans `~/.config/qday/owner.env`. Pour utiliser un compte que vous avez déjà, mettez plutôt `QORE_MNEMONIC="..."` dans ce fichier. Les clés ne quittent jamais votre ordinateur, ne sont jamais affichées et n'ont jamais leur place dans un dépôt.

```bash
node agent.mjs whoami
```

Affiche les trois adresses : propriétaire, clé de l'agent et portefeuille de gas.

### Étape 2 : alimenter le propriétaire et le portefeuille de gas {#agent-fund}

Collez chaque adresse `qor1...` dans le [faucet](/dashboard/faucet). Le propriétaire a besoin de quelques QOR pour les factures, le portefeuille de gas d'environ 3 QOR pour les frais.

```bash
node agent.mjs balance
```

Vérifie que les deux ont des QOR.

### Étape 3 : enregistrer les clés post-quantiques, une seule fois {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Chaque compte place sa clé publique ML-DSA-87 sur la chaîne avec une preuve de possession. À partir de là, les deux signent chaque transaction avec deux clés.

### Étape 4 : lier l'agent, avec des limites {#agent-link}

```bash
node agent.mjs link 1 3
```

Le propriétaire envoie **une** transaction, signée avec les deux clés, qui lie la clé ed25519 de l'agent au compte du propriétaire (la clé de l'agent signe une preuve de son accord, pour que personne ne puisse lier une clé qu'il ne possède pas), lui donne une permission (`send`), écrit une règle de dépense (1 QOR par paiement, 3 QOR par jour, `uqor` uniquement) et fixe une expiration de 24 heures. Ajoutez un troisième nombre pour une autre durée en heures, au plus 30 jours. Vous devez voir `agent linked` et `hybrid ML-DSA-87: verified`.

```bash
node agent.mjs rules
```

Relit sur la chaîne ce qu'elle impose : la règle, la permission, l'expiration et le nombre de paiements que l'agent a faits. Pour le fonctionnement de la liaison, voir [Authentificateurs](/sdk/guides/authenticators).

### Étape 5 : laisser l'agent payer les factures {#agent-run}

```bash
node agent.mjs run bills.json
```

L'agent essaie de payer les cinq factures de `bills.json`, 8,2 QOR au total. Pour chacune, il signe une demande avec sa clé ed25519 et le portefeuille de gas la soumet. Vous devez voir :

| Facture | Montant | Résultat | Pourquoi |
| --- | --- | --- | --- |
| Hébergement du serveur | 0.8 | PAID | |
| Renouvellement du domaine | 0.5 | PAID | |
| Facture d'un expéditeur inconnu | 5 | REFUSED BY THE CHAIN | Au-dessus de la limite de 1 QOR par paiement |
| Crédits d'API | 1 | PAID | |
| Supervision | 0.9 | REFUSED BY THE CHAIN | Au-dessus de la limite de 3 QOR par jour : 2,3 dépensés, 0,7 restant |

Les refus viennent de la chaîne, pas du code de l'agent. Un détail dans l'explorateur : un paiement refusé apparaît quand même comme une transaction avec le code 0. La transaction elle-même a été acceptée dans un bloc, mais le paiement qu'elle contient a été refusé. `agent.mjs` lit le résultat du paiement à l'intérieur, et c'est ce qu'il affiche.

### Étape 6 : révoquer l'agent {#agent-revoke}

```bash
node agent.mjs revoke
```

Une transaction du propriétaire désactive la clé de l'agent.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Essaie un paiement de plus. Vous devez voir `REFUSED BY THE CHAIN: linked key is unbound or revoked`. Ainsi, si un agent est un jour compromis, le plus que vous puissiez perdre est sa limite quotidienne, et une transaction l'arrête.

Pour relancer la démonstration, déplacez `~/.config/qday/agent.env` ailleurs (après avoir sorti les QOR du portefeuille de gas) et relancez `node agent.mjs init`.

Toutes les commandes : `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. Vous pouvez changer `QORE_REST`, `QORE_RPC` (votre propre nœud) et `QDAY_DIR` (où se trouvent les fichiers de clés) avec des variables d'environnement.

## Partie 3 : interroger la chaîne, avec MCP et qore-cli {#part-3}

Code : [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol) est un moyen standard pour les assistants de code et d'autres outils d'IA d'utiliser des outils externes. Le serveur MCP de QoreChain, `@qorechain/mcp`, leur donne un **accès en lecture** à la chaîne : blocs, transactions, comptes, état de la clé post-quantique d'un compte, estimations de frais et simulations. Il compte 14 outils. Il **ne signe jamais, ne détient jamais de clés et ne diffuse jamais** : si vous demandez un transfert, il vous donne un document non signé et vous le signez dans votre propre portefeuille.

### L'ajouter à votre client MCP {#mcp-config}

N'importe quel client MCP convient. La plupart utilisent une configuration comme celle-ci :

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` télécharge le serveur la première fois et le démarre. Le client liste ensuite ses outils, par exemple `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` et `prepare_transfer`.

### Les mêmes questions depuis le terminal {#mcp-cli}

`qore-cli` donne les mêmes réponses sans client d'IA. Posez trois questions sur ce que vous avez construit :

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

Le paiement de l'agent a-t-il été signé de façon post-quantique ? Attendu : `tier: pqc`, `verified: true`. C'est une transaction native, signée avec les deux clés et vérifiée par la chaîne.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

Et le retrait du coffre ? Attendu : `tier: classical`, `reason: evm_lane`. C'est une réponse honnête : les transactions de type Ethereum ne portent pas de signature post-quantique. Elles sont protégées par la fenêtre EVM et, ici, par le contrat du coffre, qui vérifie lui-même une signature ML-DSA-87.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

Et le compte ? Attendu : `registered: true`, `possession_proven: true`, et la fenêtre EVM avec ce qu'il en reste.

### Un client visuel (facultatif) {#mcp-inspector}

Pour parcourir les outils à la souris sans assistant d'IA :

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Choisissez ensuite **Connect**, **Tools**, **List Tools**, sélectionnez `get_pq_status`, mettez une adresse ou un hash dans `target`, et choisissez **Run Tool**.

## Ce que vous avez maintenant {#done}

Un contrat qui ne paie que contre une signature post-quantique, un agent dont la chaîne impose les limites, et les outils pour vérifier comment n'importe quelle transaction a été protégée. Utilisez l'un d'eux comme base de votre soumission : voir [Build Before Q-Day](/build-before-qday/overview) pour les niveaux et les règles.
