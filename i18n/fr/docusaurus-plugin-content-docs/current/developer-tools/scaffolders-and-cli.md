---
slug: /developer-tools/scaffolders-and-cli
title: Générateurs de projet et CLI qorollup
sidebar_label: Générateurs et CLI
sidebar_position: 21
---

# Générateurs de projet et CLI `qorollup`

Trois outils en ligne de commande font passer un projet QoreChain de rien à un point de départ typé et compilable. Ils s'adressent aux développeurs d'applications (dApps) et aux opérateurs de rollups qui travaillent avec Node.js :

* **`create-qorechain-dapp`** (0.14.0, qui reprend aussi les correctifs de modèles de la 0.13.1) génère une dApp à partir de l'un des sept modèles, construite sur le [SDK QoreChain](/sdk/overview). Quatre des sept (`foundry`, `hardhat`, `viem-wagmi`, `cosmwasm`) relèvent du [kit de développement de chaîne](/developer-tools/chain-dev-sdk).
* **`create-qorechain-rollup`** (0.8.0) génère un projet de rollup à partir de l'un des six modèles, construit sur le [Rollup Development Kit](/rollups/overview) TypeScript.
* **`qorollup`**, la commande du paquet `@qorechain/rdk-cli` (0.8.0), est la ligne de commande de l'opérateur : vérifications préalables, création et suivi d'un rollup, lecture des paramètres en direct.

La page reflète les paquets publiés tels qu'installés depuis npm le 27 octobre 2026, et `create-qorechain-dapp` 0.12.0 tel qu'installé le 4 novembre 2026 ; la version actuelle est la 0.14.0 (12 novembre 2026). Les changements de modèles de la 0.13.1 décrits plus bas proviennent des notes de version du paquet, et non d'une nouvelle exécution d'installation, et la 0.14.0 les reprend. Les guides conceptuels sont [Déployer un Rollup](/rollups/deploying-a-rollup) et la [référence de la CLI du SDK](/sdk/reference/cli).

## Innovations {#innovations}

* **Génération non interactive pour la CI.** Chaque question a un drapeau : `--template`, `--network`, `--package-manager`, `--yes` (accepter les valeurs par défaut) et `--no-install`. Un pipeline peut générer et compiler un projet avec une seule commande et sans terminal.
* **Les modèles sont épinglés sur les paquets actuels.** Les modèles de dApp dépendent de `@qorechain/sdk` `^0.14.0` (les modèles EVM aussi de `@qorechain/evm` `^0.14.0`) et les modèles de rollup de `@qorechain/rdk` `^0.8.0`. Un générateur antérieur (0.8.0) écrivait des plages qui se résolvaient vers un SDK incapable de signer pour les réseaux en service ; ce n'est plus le cas avec le générateur actuel.
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
| `evm-solidity` | Un contrat Solidity `Counter` avec un artefact précompilé, et un script viem qui le déploie et l'appelle avec `@qorechain/evm`. Fichiers : `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. Lancez-le avec `pnpm run deploy` (et non `pnpm deploy`, qui est une autre commande pnpm) ; il lit `.env`, et le README du modèle explique comment ouvrir la fenêtre EVM avant le déploiement. | `deploy` |
| `fullstack-web` | Une page Vite, React et TypeScript qui lit les soldes d'une adresse (et un aperçu de la tokenomics) avec `@qorechain/sdk`. Fichiers : `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. Depuis la 0.13.1, REST passe par un proxy Vite `/lcd`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Un script Node qui utilise `createRollupClient` et `createMultilayerClient` du SDK pour construire des messages de rollup et de sidechain ou de paychain. Fichiers : `src/index.ts` et la configuration habituelle. Exécution à blanc par défaut. | `start`, `typecheck` |
| `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | Les modèles du kit de développement de chaîne : un projet Foundry, un projet Hardhat 3 et viem (tous deux avec un assistant `pnpm window` pour la fenêtre d'autorisation EVM ; depuis la 0.13.0, `pnpm window recovery-code` affiche un nouveau code de récupération, et avec `PRIVATE_KEY` défini `pnpm window` lit `QORE_PQC_RECOVERY_CODE` et s'arrête avec un message s'il manque ; avec `QORE_MNEMONIC`, rien ne change), une dApp wagmi et RainbowKit avec le portefeuille QoreX, et un jeton CW20 QoreChain Native. Détails, scripts et limites : [Kit de développement de chaîne](/developer-tools/chain-dev-sdk#templates). | voir cette page |

| Drapeau | Signification |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app`, `foundry`, `hardhat`, `viem-wagmi` ou `cosmwasm` |
| `--network <name>` | `testnet` ou `mainnet` ; écrit les points de terminaison publics de ce réseau dans le `.env` généré (depuis la 0.13.1) |
| `--package-manager <pm>` | `pnpm`, `npm` ou `yarn` |
| `-y, --yes` | ignorer les questions et utiliser les valeurs par défaut |
| `--no-install` | ne pas installer les dépendances |
| `--local` | réécrit les dépendances `@qorechain/*` en liens locaux dans le monorepo du SDK (pour les contributeurs du SDK) |
| `-h, --help`, `-v, --version` | aide, version |

### Changements de modèles dans la 0.13.1 {#template-fixes-0131}

La version 0.13.1 (12 novembre 2026) était un correctif limité aux modèles ; les paquets du SDK restaient en 0.13.0. Le SDK 0.14.0 reprend ces correctifs de modèles. D'après les notes de version du paquet :

* `--network` écrit les points de terminaison publics du réseau choisi dans le `.env` généré.
* `fullstack-web` et `viem-wagmi` atteignent REST par un proxy Vite `/lcd`, car le REST public n'envoie aucun en-tête CORS. En développement, le code du navigateur appelle `/lcd/...`.
* `evm-solidity` : lancez le script de déploiement avec `pnpm run deploy` (un simple `pnpm deploy` est une autre commande pnpm). Il lit `.env`, et le README explique comment ouvrir la fenêtre EVM avant le déploiement.
* `viem-wagmi` épingle viem `~2.53.1`.
* Le README de `hardhat` indique une attente d'environ 10 secondes après l'ouverture d'une fenêtre avant la première transaction.

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
qorollup --version          # affiche la version installée (la 0.8.0 est l'actuelle)
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

Observé avec la 0.6.2 via `npx`, via une installation globale et via le lien local `node_modules/.bin/qorollup` (et avec la 0.7.0 via le lien local, où `qorollup --version` a affiché 0.7.0) : les paramètres du module s'affichent (rollups max 200, stake min 10000 QOR, burn de création 1 %, fenêtre de contestation 3600 s, blob de disponibilité des données max 2,097,152 octets, rétention des blobs 432,000 blocs, lots max par bloc 10). Une exécution à blanc d'une création, également observée :

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
| npm | `create-qorechain-dapp` (commande `create-qorechain-dapp`) | 0.14.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (commande `create-qorechain-rollup`) | 0.8.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (commande `qorollup`) | 0.8.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (bibliothèque utilisée par les modèles) | 0.8.0 | https://www.npmjs.com/package/@qorechain/rdk |

Code source : https://github.com/qorechain/qorechain-sdk/tree/main/cli (générateur de dApp), https://github.com/qorechain/qorechain-rdk/tree/main/cli (générateur de rollup) et https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). La version 0.8.0 du RDK est aussi sur PyPI, crates.io, Maven Central et le proxy de modules Go (vérifié le 31 octobre 2026). Tous sont sous Apache-2.0.

## Limites et problèmes connus {#limits}

* **`--network mainnet` n'a pas modifié les fichiers générés lors d'un essai (0.10.0 et 0.12.0).** Les notes de version de la 0.13.1 indiquent que `--network` écrit désormais les points de terminaison publics du réseau choisi dans `.env` ; cela n'a pas été retesté ici, vérifiez donc le fichier après la génération. Le 27 octobre 2026, `fullstack-web` et `custom-rollup` ont été générés avec `--network mainnet` ; le `.env` généré contenait toujours des points de terminaison localhost (dApp) ou `QORE_NETWORK=testnet` avec les points de terminaison du testnet (rollup), et le `App.tsx` de la dApp créait un client `testnet`. Le 4 novembre 2026, `create-qorechain-dapp` 0.12.0 s'est comporté de la même façon pour `evm-solidity`, `fullstack-web` et `rollup-app`. Définissez vous-même le réseau et les points de terminaison dans `.env` et, pour le modèle web, dans `src/App.tsx`.
* **Aucun rollup n'existe encore sur l'un ou l'autre réseau** (vérifié le 27 octobre 2026). Aucun chemin de transaction des outils de rollup n'a été exercé sur un rollup en service. Validez tout d'abord sur le testnet, et lisez [RDK 0.8.0 : changements et limites](/rollups/deploying-a-rollup#rdk-050-limits).
* **Le modèle `defi-rollup` ne peut pas régler un lot.** Le règlement ZK n'est pas utilisable sur le mainnet (l'enregistrement des clés n'existe que sur le testnet, depuis la chaîne v3.2.7, et aucun rollup ZK n'y a été essayé), et son circuit de démonstration ne pourrait de toute façon pas passer la vérification de preuve de la chaîne. À partir de la 0.7.0, le modèle s'arrête avant l'envoi, de sorte qu'il ne dépense plus de frais pour un lot que la chaîne refuse toujours. Utilisez un modèle avec règlement `optimistic` jusqu'à ce que cela change (voir [ZK / STARK et retraits](/rollups/zk-stark-withdrawals)).
* **Le modèle `multivm-rollup` dépend de quelque chose qui n'est pas en service.** Le precompile cross-VM à `0x0000000000000000000000000000000000000901` n'est pas actif sur le mainnet ; un appel depuis un contrat n'y fait donc rien ; sur le testnet il est actif avec une liste d'autorisation (un `eth_call` en lecture seule a été testé le 7 novembre 2026) ; le modèle le vérifie et son contrat est écrit pour revert au lieu d'échouer silencieusement (voir [Multi-VM](/rollups/multi-vm)).
* **Les commandes de transaction de `qorollup` exigent une clé post-quantique (0.7.1 et ultérieur).** `create`, `pause`, `resume`, `stop` et `withdraw` signent en hybride (ML-DSA-87 + secp256k1) comme l'exigent les deux réseaux, avec une clé dérivée de `--mnemonic` / `QORE_MNEMONIC` et confrontée à la chaîne, ou `--pqc-seed` / `QORE_PQC_SEED_HEX` accompagné de `--key` ; sans l'une d'elles, la commande refuse d'envoyer. Dans la 0.7.0 et les versions antérieures, ces commandes signaient en classique uniquement et les réseaux refusaient chacune d'elles ; mettez à jour, ou utilisez un projet généré (ses scripts signent de façon hybride), le RDK TypeScript avec un `pqcKeypair`, ou la CLI de la chaîne. Les lectures, `doctor`, `params`, `receipt` et `--dry-run` n'ont jamais eu besoin de clé. Non testé en conditions réelles : aucun rollup n'existe.
* **Certains utilitaires de `qorollup` n'ont encore rien à interroger.** `advise` contre le testnet le 27 octobre a affiché « advisory unavailable » pour les surfaces de frais, de réseau, de fraude et d'agent RL (le nœud répondait 501 ou « method does not exist ») et pour un rollup qui n'existe pas. `suggest` a renvoyé un profil avec `source: fallback`, ce qui indique que la liste par défaut intégrée a été utilisée à la place du service d'assistant. Lisez les avertissements.
* **`rollup-app` ne diffuse que si vous le demandez.** Il s'exécute à blanc par défaut ; avec `QORE_BROADCAST=1`, il enregistre une fois la clé ML-DSA-87 du compte et signe de façon hybride. Ses valeurs d'exemple de rollup sont illustratives : prenez les vrais noms de profils et le stake dans [Profils prédéfinis](/rollups/preset-profiles).
* **`fullstack-web` affiche une erreur sur son bouton de tokenomics.** Ce panneau appelle une méthode JSON-RPC `qor_` que les points de terminaison publics ne servent pas ; la consultation du solde fonctionne. Remplacez-le par une lecture REST telle que `client.rest.getBurnStats()`.
* **`evm-solidity` nécessite plus qu'un compte approvisionné.** Envoyer une transaction EVM sur QoreChain nécessite aussi une clé ML-DSA-87 enregistrée et une fenêtre d'autorisation EVM ouverte, mises en place depuis la voie native (voir le [guide EVM](/developer-guide/evm-development#evm-window)). Le script `deploy` du modèle n'a pas été exécuté sur un réseau en service pour cette page.
* **`create-qorechain-dapp --version` affiche `0.5.1`** alors que le paquet installé était la 0.12.0 (vérifié le 27 octobre 2026 avec la 0.10.0 et de nouveau le 4 novembre 2026 avec la 0.12.0). Lisez la version dans `package.json` ou dans le registre.
* **Les README des paquets sont obsolètes.** Le README de `create-qorechain-dapp` liste deux modèles et celui de `create-qorechain-rollup` cinq (vérifié le 27 octobre 2026) ; `--help` en montre sept et six. Fiez-vous à `--help`.
* **Les versions antérieures à la 0.6.2 ne fonctionnent pas depuis npm.** `qorollup` 0.6.1 et antérieur, installé par npm de n'importe quelle façon, n'affichait rien et se terminait avec le code 0, et `--version` affichait `0.4.1`. Si vous devez rester sur la 0.6.1, exécutez `node node_modules/@qorechain/rdk-cli/dist/index.js <command>` ; sinon, mettez à jour.
* **Copies de dépendances (RDK 0.6.x, et RDK 0.8.0 à côté du SDK 0.12.0).** `@qorechain/rdk` 0.6.2 et antérieur dépendent de `@qorechain/sdk` `^0.9.0` ; un projet qui installait aussi le SDK 0.10.0 contenait donc un second SDK 0.9.x imbriqué. À partir de la 0.7.0, le kit dépend de `@qorechain/sdk` `^0.10.0` et partage une seule copie avec une application SDK 0.10.x. **Une application sur le SDK 0.12.0 qui installe aussi `@qorechain/rdk` 0.8.0 reçoit encore une copie imbriquée du SDK 0.10.0** (et de `@qorechain/evm` 0.8.0), car une plage caret sur une version 0.x ne prend pas les mineures plus récentes (vérifié avec `npm ls` le 4 novembre 2026). Gardez les appels SDK et les appels RDK dans des modules séparés, ou échangez des objets entre eux sous forme de simples données, jusqu'à ce que la plage du RDK évolue.
