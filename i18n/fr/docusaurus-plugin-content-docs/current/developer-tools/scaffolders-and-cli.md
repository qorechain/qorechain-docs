---
slug: /developer-tools/scaffolders-and-cli
title: Générateurs de projet et CLI qorollup
sidebar_label: Générateurs et CLI
sidebar_position: 21
---

# Générateurs de projet et CLI `qorollup`

Trois outils en ligne de commande font passer un projet QoreChain de rien à un point de départ typé et compilable. Ils s'adressent aux développeurs d'applications (dApps) et aux opérateurs de rollups qui travaillent avec Node.js :

* **`create-qorechain-dapp`** (0.10.0) génère une dApp à partir de l'un des trois modèles, construite sur le [SDK QoreChain](/sdk/overview).
* **`create-qorechain-rollup`** (0.6.2) génère un projet de rollup à partir de l'un des six modèles, construit sur le [Rollup Development Kit](/rollups/overview) TypeScript.
* **`qorollup`**, la commande du paquet `@qorechain/rdk-cli` (0.6.2), est la ligne de commande de l'opérateur : vérifications préalables, création et suivi d'un rollup, lecture des paramètres en direct.

La page reflète les paquets publiés tels qu'installés depuis npm le 27 octobre 2026. Les guides conceptuels sont [Déployer un Rollup](/rollups/deploying-a-rollup) et la [référence de la CLI du SDK](/sdk/reference/cli).

## Innovations {#innovations}

* **Génération non interactive pour la CI.** Chaque question a un drapeau : `--template`, `--network`, `--package-manager`, `--yes` (accepter les valeurs par défaut) et `--no-install`. Un pipeline peut générer et compiler un projet avec une seule commande et sans terminal.
* **Les modèles sont épinglés sur les paquets actuels.** Les modèles de dApp dépendent de `@qorechain/sdk` `^0.10.0` (le modèle EVM de `@qorechain/evm`) et les modèles de rollup de `@qorechain/rdk` `^0.6.1`, qu'une installation neuve résout en 0.6.2. Un générateur antérieur (0.8.0) écrivait des plages qui se résolvaient vers un SDK incapable de signer pour les réseaux en service ; ce n'est plus le cas avec le générateur actuel.
* **Les modèles de rollup encodent une configuration valide par cas d'usage.** Chaque modèle de rollup fixe une combinaison de règlement, de séquenceur, de disponibilité des données, de gas et de VM que la matrice de compatibilité du RDK accepte, et le générateur affiche le stake et le burn de création en direct avant que vous ne créiez quoi que ce soit.
* **Une commande de vérification préalable qui nomme ce qui manque.** `qorollup doctor` (et `npm run doctor` dans un modèle de rollup) vérifie que le point de terminaison REST répond, que les paramètres du module peuvent être lus, que le point de terminaison est bien le réseau demandé et qu'un signataire est configuré, et affiche une ligne par vérification. Dans un modèle, il valide aussi la configuration du rollup par rapport à la matrice de compatibilité.
* **Signature hybride câblée dans les modèles.** Les modèles de rollup se connectent via un petit `signer.ts` qui dérive la clé ML-DSA-87 du compte à partir de votre mnémonique (ou prend une graine avec une clé privée brute) et signe de façon hybride, ce que les réseaux exigent sur la voie native. Le modèle de dApp `rollup-app` fait de même et s'exécute à blanc sauf si vous définissez `QORE_BROADCAST=1`.
* **Exécutions à blanc.** `qorollup create ... --dry-run` valide la configuration, affiche le stake et le burn, et indique qu'il soumettrait `MsgCreateRollup` sans diffuser.
* **Sortie lisible par machine.** `qorollup ... --json` affiche du JSON pour les scripts.

## Comment l'utiliser {#how-to-use}

### Générer une dApp {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Modèle | Ce qu'il génère | Scripts |
| --- | --- | --- |
| `evm-solidity` | Un contrat Solidity `Counter` avec un artefact précompilé, et un script viem qui le déploie et l'appelle avec `@qorechain/evm`. Fichiers : `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | Une page Vite, React et TypeScript qui lit les soldes d'une adresse (et un aperçu de la tokenomics) avec `@qorechain/sdk`. Fichiers : `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Un script Node qui utilise `createRollupClient` et `createMultilayerClient` du SDK pour construire des messages de rollup et de sidechain ou de paychain. Fichiers : `src/index.ts` et la configuration habituelle. Exécution à blanc par défaut. | `start`, `typecheck` |

| Drapeau | Signification |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web` ou `rollup-app` |
| `--network <name>` | `testnet` ou `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` ou `yarn` |
| `-y, --yes` | ignorer les questions et utiliser les valeurs par défaut |
| `--no-install` | ne pas installer les dépendances |
| `-h, --help`, `-v, --version` | aide, version |

Exemple testé (issu du hub développeur ; exécuté le 27 octobre 2026 dans un répertoire vide, avec `npx` depuis le registre npm public) : il génère le modèle web et le compile. Observé : `Done! Created my-dapp` et un `vite build` réussi. La compilation affiche un avertissement de taille de bundle, sans conséquence.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Avant de lancer l'application web, ouvrez le `.env` généré : il pointe vers `http://localhost:1317` et `http://localhost:8545` ; définissez donc `VITE_QORE_REST_URL` sur `https://api-testnet.qore.host` (ou `https://api.qore.host` pour le mainnet) et `VITE_QORE_EVM_RPC_URL` sur `https://evm-testnet.qore.host` (ou `https://evm.qore.host`).

### Générer un projet de rollup {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Modèle | Profil | Règlement / séquenceur / DA / gas / VM | Fichiers supplémentaires |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | un prouveur de référence (`src/prover.ts`) et un circuit de démonstration sous `circuits/` |
| `gaming-rollup` | gaming | based, based, native, flat gas, custom VM | aucun |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, avec un flux de contestation | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, subsidized gas, EVM | aucun |
| `custom-rollup` | custom | entièrement paramétrable, chaque champ documenté | aucun |
| `multivm-rollup` | multivm | un rollup EVM qui appelle des contrats QoreChain Native via le precompile cross-VM | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Chaque modèle contient `rollup.config.ts` (la configuration), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` et `.env.example`, un README, et un `.github/workflows/deploy.yml`. Scripts : `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. Les profils prédéfinis sont expliqués dans [Profils prédéfinis](/rollups/preset-profiles).

Les options sont les mêmes que pour le générateur de dApp, avec les six noms de modèles ci-dessus. Le modèle `multivm-rollup` est listé par `--help` mais pas dans le README du paquet, qui en liste cinq.

Exemple testé (hub développeur, 27 octobre 2026, `npx` depuis npm dans un répertoire vide). Observé : `Created my-rollup (defi-rollup template)` et `tsc --noEmit` réussi. La même génération et `npm run typecheck` ont été répétés avec la 0.6.2 le même jour, avec le même résultat.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

Étapes suivantes, telles que le générateur les affiche : `npm install`, renseigner la clé de l'opérateur dans `.env`, `npm run doctor`, `npm run create`, `npm run query-status`. Le `.env` généré contient déjà les points de terminaison publics du testnet (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) et des champs de clé vides : `QORE_MNEMONIC` ou `QORE_OPERATOR_PRIVATE_KEY_HEX` (avec `QORE_PQC_SEED_HEX` pour la graine post-quantique). Ne commitez jamais ce fichier.

### La CLI `qorollup` {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.6.2
qorollup doctor --network testnet
```

Vous pouvez aussi l'exécuter sans l'installer : `npx @qorechain/rdk-cli doctor`.

| Commande | Ce qu'elle fait |
| --- | --- |
| `doctor` | vérification préalable : points de terminaison, paramètres du module, correspondance du réseau, signataire, solde, configuration |
| `params` | affiche les paramètres du module en direct |
| `create --rollup-id <id>` | crée un rollup (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | état et santé, ou vue en direct (`--interval <ms>`) |
| `advise <id>` | conseils du Copilote QCAI (voir [Copilote de rollup QCAI](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | suggère un profil pour un cas d'usage |
| `receipt <id> <batch>` | construit un reçu de règlement (`--verify`, `--out <file>`), voir [Reçus de règlement](/rollups/settlement-receipts) |
| `watchtower <id>` | cadre de contestation pour les rollups optimistic, voir [Tour de guet](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | transitions de cycle de vie (créateur uniquement) |
| `keygen` | génère une clé d'opérateur (mnémonique et adresse) |
| `manifest export`, `manifest import` | exporte ou importe un manifeste de rollup |
| `withdraw --file <json>` | assemble et soumet un retrait (`--dry-run`) |
| `faucet <address>` | demande des fonds de testnet (nécessite `QORE_FAUCET_URL`) |

Drapeaux globaux : `--network testnet|mainnet` (testnet par défaut), `--rest`, `--rpc`, `--evm-rpc` (remplacements de points de terminaison, ou `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` ou `--key` (ou `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Lancez-le avant tout ce qui envoie une transaction. Sortie observée le 27 octobre 2026 avec la 0.6.2 et sans signataire défini, sur le testnet (le mainnet a affiché la même chose, avec `qorechain-vladi` et `https://api.qore.host` ; l'outil affiche des tirets longs, montrés ici comme des traits d'union) :

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

Une ligne commençant par `!` est un avertissement et ne fait pas échouer l'exécution ; l'absence de signataire ne pose problème que si vous voulez créer ou exploiter un rollup. La commande se termine avec le code 0 lorsqu'aucune vérification n'échoue.

**Exemple testé.** Issu du hub développeur : lire les paramètres du module en direct sans clé. Cela a échoué sur la 0.6.1 (la commande n'affichait rien et se terminait avec le code 0) et a été relancé sur la 0.6.2 :

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

Observé avec la 0.6.2 via `npx`, via une installation globale et via le lien local `node_modules/.bin/qorollup` : les paramètres du module s'affichent (rollups max 200, stake min 10000 QOR, burn de création 1 %, fenêtre de contestation 3600 s, blob de disponibilité des données max 2,097,152 octets, rétention des blobs 432,000 blocs, lots max par bloc 10). Une exécution à blanc d'une création, également observée :

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## Comment y accéder {#how-to-access}

* **Prérequis.** Node.js 20 ou ultérieur et un gestionnaire de paquets. Les générateurs écrivent des fichiers et, sauf si vous passez `--no-install`, installent les dépendances ; ils ont donc besoin d'un accès réseau au registre npm. Les clients RDK Python, Rust, Go et Java sont des bibliothèques et n'ont pas de générateur ; voir [Déployer un Rollup](/rollups/deploying-a-rollup).
* **Réseaux et points de terminaison.** Mainnet `qorechain-vladi` (EVM chain id 9801) : REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Testnet `qorechain-diana` (chain id 9800) : les mêmes hôtes avec `-testnet` après le premier label, par exemple `https://api-testnet.qore.host`. La lecture de données, `doctor`, `params`, `suggest` et `--dry-run` ne nécessitent aucun compte.
* **Comptes et clés.** Tout ce qui envoie une transaction nécessite un compte d'opérateur approvisionné et son mnémonique ou sa clé privée, fournis par des variables d'environnement ou des drapeaux, jamais commités. Créer un rollup nécessite le stake minimal (10 000 QOR sur les deux réseaux, lu en direct le 27 octobre 2026), dont 1 % est brûlé à la création. `qorollup keygen` crée une nouvelle clé ; sur le testnet, les fonds de test viennent du [Faucet du Dashboard](/dashboard/faucet), ou de `qorollup faucet` avec `QORE_FAUCET_URL` défini.
* **Signature hybride.** Les transactions de la voie native nécessitent une signature secp256k1 plus une signature ML-DSA-87. Les modèles dérivent la clé post-quantique à partir de votre mnémonique ; les commandes de transaction de `qorollup` ne le font pas (voir les limites ci-dessous).
* **Coûts.** Les outils sont gratuits (Apache-2.0). On-chain, le plancher de frais est de 0,1 uqor par gas ; le stake et le burn du rollup ci-dessus s'appliquent à la création.

## Où c'est publié {#where-published}

| Registre | Paquet | Version | Lien |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (commande `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (commande `create-qorechain-rollup`) | 0.6.2 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (commande `qorollup`) | 0.6.2 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (bibliothèque utilisée par les modèles) | 0.6.2 | https://www.npmjs.com/package/@qorechain/rdk |

Code source : https://github.com/qorechain/qorechain-sdk/tree/main/cli (générateur de dApp), https://github.com/qorechain/qorechain-rdk/tree/main/cli (générateur de rollup) et https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). La version 0.6.2 du RDK est aussi sur PyPI, crates.io et le proxy de modules Go ; l'artefact Java sur Maven Central est toujours en 0.6.1 (vérifié le 27 octobre 2026). Tous sont sous Apache-2.0.

## Limites et problèmes connus {#limits}

* **`--network mainnet` n'a pas modifié les fichiers générés lors d'un essai.** Le 27 octobre 2026, `fullstack-web` et `custom-rollup` ont été générés avec `--network mainnet` ; le `.env` généré contenait toujours des points de terminaison localhost (dApp) ou `QORE_NETWORK=testnet` avec les points de terminaison du testnet (rollup), et le `App.tsx` de la dApp créait un client `testnet`. Définissez vous-même le réseau et les points de terminaison dans `.env` et, pour le modèle web, dans `src/App.tsx`.
* **Aucun rollup n'existe encore sur l'un ou l'autre réseau** (vérifié le 27 octobre 2026). Aucun chemin de transaction des outils de rollup n'a été exercé sur un rollup en service. Validez tout d'abord sur le testnet, et lisez [RDK 0.6.2 : changements et limites](/rollups/deploying-a-rollup#rdk-050-limits).
* **Le modèle `defi-rollup` ne peut pas finaliser un lot.** Le règlement ZK n'est encore utilisable sur aucun des deux réseaux, et son circuit de démonstration ne pourrait de toute façon pas passer la vérification de preuve de la chaîne. Utilisez un modèle avec règlement `optimistic` jusqu'à ce que cela change (voir [ZK / STARK et retraits](/rollups/zk-stark-withdrawals)).
* **Le modèle `multivm-rollup` dépend de quelque chose qui n'est pas en service.** Le precompile cross-VM à `0x0000000000000000000000000000000000000901` n'est actif sur aucun des deux réseaux ; un appel depuis un contrat ne fait donc rien ; le modèle le vérifie et son contrat est écrit pour revert au lieu d'échouer silencieusement (voir [Multi-VM](/rollups/multi-vm)).
* **Les commandes de transaction de `qorollup` signent uniquement en classique.** `create`, `pause`, `resume`, `stop` et `withdraw` se connectent sans clé post-quantique, ce que les deux réseaux refusent sur la voie native. Les lectures, `doctor`, `params`, `receipt` et `--dry-run` ne sont pas concernés. Pour envoyer des transactions, utilisez un projet généré (ses scripts signent de façon hybride), le RDK TypeScript avec un `pqcKeypair`, ou la CLI de la chaîne.
* **Certains utilitaires de `qorollup` n'ont encore rien à interroger.** `advise` contre le testnet le 27 octobre a affiché « advisory unavailable » pour les surfaces de frais, de réseau, de fraude et d'agent RL (le nœud répondait 501 ou « method does not exist ») et pour un rollup qui n'existe pas. `suggest` a renvoyé un profil avec `source: fallback`, ce qui indique que la liste par défaut intégrée a été utilisée à la place du service d'assistant. Lisez les avertissements.
* **`rollup-app` ne diffuse que si vous le demandez.** Il s'exécute à blanc par défaut ; avec `QORE_BROADCAST=1`, il enregistre une fois la clé ML-DSA-87 du compte et signe de façon hybride. Ses valeurs d'exemple de rollup sont illustratives : prenez les vrais noms de profils et le stake dans [Profils prédéfinis](/rollups/preset-profiles).
* **`fullstack-web` affiche une erreur sur son bouton de tokenomics.** Ce panneau appelle une méthode JSON-RPC `qor_` que les points de terminaison publics ne servent pas ; la consultation du solde fonctionne. Remplacez-le par une lecture REST telle que `client.rest.getBurnStats()`.
* **`evm-solidity` nécessite plus qu'un compte approvisionné.** Envoyer une transaction EVM sur QoreChain nécessite aussi une clé ML-DSA-87 enregistrée et une fenêtre d'autorisation EVM ouverte, mises en place depuis la voie native (voir le [guide EVM](/developer-guide/evm-development#evm-window)). Le script `deploy` du modèle n'a pas été exécuté sur un réseau en service pour cette page.
* **`create-qorechain-dapp --version` affiche `0.5.1`** alors que le paquet installé est la 0.10.0 (vérifié le 27 octobre 2026). Lisez la version dans `package.json` ou dans le registre.
* **Les README des paquets sont obsolètes.** Le README de `create-qorechain-dapp` liste deux modèles et celui de `create-qorechain-rollup` cinq ; `--help` en montre trois et six. Fiez-vous à `--help`.
* **Les versions antérieures à la 0.6.2 ne fonctionnent pas depuis npm.** `qorollup` 0.6.1 et antérieur, installé par npm de n'importe quelle façon, n'affichait rien et se terminait avec le code 0, et `--version` affichait `0.4.1`. Si vous devez rester sur la 0.6.1, exécutez `node node_modules/@qorechain/rdk-cli/dist/index.js <command>` ; sinon, mettez à jour.
* **Copies de dépendances.** `@qorechain/rdk` 0.6.2 dépend de `@qorechain/sdk` `^0.9.0` ; un projet qui installe aussi le SDK 0.10.0 contient donc un second SDK 0.9.x imbriqué. C'est sans conséquence pour les scripts que génèrent les modèles.
* **Maven Central a du retard.** L'artefact Java du RDK y est en 0.6.1 ; la 0.6.2 est en attente et ne contient aucun changement Java.
