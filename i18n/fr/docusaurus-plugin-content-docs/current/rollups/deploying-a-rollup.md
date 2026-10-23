---
slug: /rollups/deploying-a-rollup
title: Déployer un Rollup
sidebar_label: Déployer un Rollup
sidebar_position: 3
---

# Déployer un Rollup

Vous pouvez mettre en place un rollup spécifique à une application de trois façons : via le **Dashboard** (un formulaire de demande, et non une transaction on-chain), via la **CLI** de la chaîne (`qorechaind`, contrôle total sur la transaction on-chain), ou avec le **RDK TypeScript** (`@qorechain/rdk` plus le générateur `create-qorechain-rollup`), qui couvre la configuration, les lectures et, lorsque vous lui fournissez une clé post-quantique, des transactions signées en mode hybride (voir [RDK 0.6.0 : changements et limites](#rdk-050-limits)). Cette page couvre les trois méthodes, ainsi que le cycle de vie de l'opérateur et les commandes de batch.

:::caution Capacité à un stade précoce
Aucun rollup n'a encore été créé sur l'un ou l'autre réseau (vérifié le 23 octobre 2026). Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**, version de chaîne **v3.2.4** depuis le 19 octobre 2026). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**, en production depuis le 7 juin 2026) exécute la version de chaîne **v3.2.4** depuis le 23 octobre 2026 (appliquée à la hauteur 3,742,566 par la proposition de gouvernance 13) ; les versions antérieures diffèrent sur quelques détails, que cette page signale par « à partir de la v3.2.4 ». Validez chaque déploiement sur testnet d'abord.
:::

:::note Frais et signature
Le réseau impose un prix du gas minimum de `0.1uqor`, donc un simple `--fees 500uqor` est refusé, et chaque transaction de la voie native nécessite la co-signature post-quantique hybride. Les exemples de CLI de cette page construisent donc la transaction avec `--generate-only` et la cosignent avec `qorechaind tx pqc cosign`, qui la signe et la diffuse (créez la clé une fois avec `qorechaind tx pqc gen-key`, puis enregistrez-la on-chain une fois avec `qorechaind tx pqc register-key`, ou via QoreX ou le SDK, qui le font pour vous). Les frais sont fixés lors de la génération du fichier non signé : définissez donc la limite de gas et les frais ensemble — les frais doivent être au moins égaux à la limite de gas × 0,1 uqor. Les limites de gas ci-dessous sont indicatives — simulez avant de vous y fier. Voir [Première transaction](/getting-started/first-transaction) et [Signature post-quantique](/developer-guide/post-quantum-signing).
:::

---

## Prérequis

| Prérequis | Détails |
| ----------- | ------- |
| **Stake minimum** | Au moins 10 000 QOR (`min_stake_for_rollup`) ; le stake est mis sous séquestre à la création du rollup |
| **Burn de création** | 1 % du stake que vous fournissez est brûlé définitivement à la création (une création qui ne peut pas appliquer le burn est refusée) ; le reste est conservé sous séquestre et restitué à l'arrêt du rollup |
| **Stake d'enregistrement de la couche** | La création enregistre aussi la couche du rollup dans le module multilayer, ce qui verrouille **1 000 QOR** supplémentaires (`min_sidechain_stake`) auprès du créateur, restitués lorsque la couche est désactivée à l'arrêt. Si la couche ne peut pas être enregistrée (solde trop faible, ou limite de 10 sidechains du multilayer atteinte), le rollup est tout de même créé mais n'a pas de couche, de sorte que ses batches ne peuvent pas être ancrés |
| **ID du rollup** | Utilisez 3 à 64 caractères : lettres minuscules, chiffres, `.`, `_` et `-`, en commençant par une lettre ou un chiffre. La chaîne impose cette règle sur les deux réseaux depuis la v3.2.2 (la CLI la vérifie avant de construire la transaction) ; un ID non conforme est donc refusé |
| **Compte** | Un compte QoreChain approvisionné avec une clé post-quantique enregistrée, avec un solde suffisant pour le stake, le stake de la couche et les frais de transaction |

Interrogez les paramètres du module en direct pour connaître le stake minimum et le taux de burn actuels avant de déployer :

```bash
qorechaind query rdk config
```

---

## Déployer via le Dashboard (Tools → Rollups)

Le Dashboard propose un formulaire **Deploy a Rollup** sous **Tools → Rollups**. C'est un **formulaire de demande** : le soumettre enregistre une demande de provisionnement pour votre compte, examinée par **The Qore Trust**, et une nouvelle demande affiche un statut **provisioning**. Il ne diffuse **pas** de transaction `create-rollup` on-chain — pour enregistrer un rollup on-chain, utilisez la CLI ci-dessous.

### Étapes

1. **Connectez-vous.** Le formulaire nécessite une session authentifiée pour soumettre une demande et pour lister vos demandes existantes.
2. **Nommez votre rollup.** Saisissez un nom de rollup (2 à 41 caractères : lettres, chiffres, espaces, tirets ou underscores).
3. **Choisissez une machine virtuelle.** L'enregistrement on-chain stocke un libellé de VM. Votre rollup s'exécute off-chain dans son propre runtime ; ce choix ne s'exécute pas sur les voies EVM, QoreChain Native ou SVM propres à QoreChain :
   * **EVM** — contrats Solidity / Vyper avec l'outillage Ethereum complet (Hardhat, Foundry, MetaMask)
   * **QoreChain Native** — contrats intelligents Rust sur le runtime Cosmos SDK (le runtime CosmWasm), avec IBC natif
   * **SVM** — la Solana Virtual Machine, pour les applications à exécution parallèle et haut débit
4. **Choisissez une couche de disponibilité des données.** L'endroit où votre rollup publie les données de transaction afin que quiconque puisse reconstruire l'état : **QoreChain DA**, **Celestia**, ou **EigenDA**. Notez qu'EigenDA est une option au niveau du Dashboard, tandis que les backends DA on-chain du module `x/rdk` sont native, Celestia, ou les deux — voir [Data Availability](/rollups/data-availability).
5. **Définissez un gas token.** Le token utilisé pour payer l'exécution sur votre rollup. Par défaut **QOR** ; saisissez un symbole personnalisé pour utiliser votre propre token natif.
6. **Choisissez un séquenceur.** Qui ordonne les transactions avant le règlement : **Shared sequencer** (l'ensemble partagé de QoreChain), **Dedicated (single)** (exécutez votre propre séquenceur unique), ou **Decentralized** (un ensemble de séquenceurs sans permission).
7. **Choisissez une cible de règlement.** Où le rollup ancre ses racines d'état et ses preuves de validité : **QoreChain mainnet** ou **Ethereum**.
8. **Soumettez la demande.** Le provisionnement est examiné par **The Qore Trust**, donc une demande fraîchement soumise apparaît avec un statut **provisioning** jusqu'à la fin de l'examen.

Vos demandes soumises apparaissent dans la liste **Your rollups** avec leur VM, leur couche DA, leur gas token, leur séquenceur, leur cible de règlement et leur statut actuel.

:::note
Les options du formulaire (machine virtuelle, couche de disponibilité des données, gas token, séquenceur, cible de règlement) décrivent ce que vous demandez ; elles sont plus larges que ce que le module `x/rdk` on-chain prend actuellement en charge. On-chain, la disponibilité des données est `native` (Celestia n'est pas actif), et le séquençage est assuré par le créateur du rollup ou par une adresse de séquenceur configurée. Voir [Data Availability](/rollups/data-availability).
:::

---

## Déployer via la CLI

La CLI crée le rollup directement on-chain. `create-rollup` prend trois arguments positionnels — l'ID du rollup, un profil, et le montant du stake (en `uqor`) — plus un flag optionnel `--vm`.

:::tip
Depuis la version de chaîne **v3.1.74**, `create-rollup` **applique automatiquement le preset du profil choisi** — le mode de règlement, le séquenceur, la DA, le modèle de gas et la VM proviennent tous du preset. Vous n'avez plus besoin de les définir manuellement (auparavant le message codait en dur une configuration souveraine). Le flag `--vm` **est désormais vide par défaut**, de sorte que la VM du profil s'applique sauf si vous la remplacez explicitement.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Exemple** — créez un rollup à partir du preset `defi` (le règlement, le séquenceur, la DA et la VM proviennent tous du preset ; `defi` se résout en règlement zk sur l'EVM). Construisez la transaction non signée, puis joignez la co-signature post-quantique et diffusez :

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Un profil ZK tel que `defi` est accepté à la création, mais un rollup créé de cette façon ne porte pas de clé de vérification, de sorte que ses batches ZK ne peuvent pas encore être finalisés (voir [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flags :**

| Flag | Défaut | Description |
| ---- | ------- | ----------- |
| `--vm` | *(vide — utilise la VM du profil)* | Remplace le type de VM du rollup : `evm`, `cosmwasm`, `svm`, ou `custom`. Laissez non défini pour appliquer la VM du preset. (Dans les clients RDK, le runtime Wasm est le type de VM **`native`** — QoreChain Native — avec `cosmwasm` conservé comme alias hérité ; `cosmwasm` est la valeur sur le fil, celle que prend ce flag au niveau de la chaîne.) |

:::note Le libellé de VM est une métadonnée
`--vm` enregistre le runtime utilisé par votre rollup. La chaîne hôte ne fait que régler le rollup ; elle n'exécute pas ses contrats. Le téléversement QoreChain Native de la chaîne hôte est actuellement fermé et sa voie de transactions SVM est désactivée sur l'ensemble du réseau, ce qui n'affecte pas le règlement d'un rollup off-chain mais signifie que vous ne pouvez pas déployer de contrats pour un rollup sur ces voies de la chaîne hôte.
:::

L'argument `[profile]` sélectionne une configuration prédéfinie appliquée automatiquement — voir **[Preset Profiles](/rollups/preset-profiles)**. Le `[stake-amount]` est le dépôt en `uqor` ; le burn de création en représente 1 %.

### Inspecter ce que vous avez déployé

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Déployer avec le RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Le Rollup Development Kit est publié sous forme de deux packages npm publics pour le même module on-chain `x/rdk` que la CLI. Aucun rollup n'existant encore sur l'un ou l'autre réseau, aucun chemin de transaction du kit n'a été exercé sur un rollup réel ; lisez [RDK 0.6.0 : changements et limites](#rdk-050-limits) avant de vous y fier pour envoyer des transactions :

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.6.0`) — le SDK TypeScript : un constructeur de configuration avec des profils prédéfinis, des helpers de transaction pour les cycles de vie du rollup et des batches de règlement, la DA native, des clients de lecture typés, des reçus de règlement à sécurité post-quantique, le QCAI Rollup Copilot, des helpers de calldata cross-VM, et le watchtower. Il dépend de `@qorechain/sdk` `^0.9.0` et de `@qorechain/evm` `^0.8.0`.
* **`create-qorechain-rollup`** (`v0.6.0`) — un générateur qui clone un template de démarrage exécutable par profil (y compris le template `multivm-rollup`).

Ces packages sont publiés sur npm. Le dépôt fournit également une CLI opérateur publiée, **`@qorechain/rdk-cli`** (`qorollup`, `v0.6.0`), avec les commandes `doctor`, `create`, `status`, `watch`, `params`, `suggest`, le cycle de vie (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, et `faucet`, plus les commandes `receipt`, `advise`, et `watchtower`. Ses commandes de transaction signent en mode classique uniquement (voir les limites ci-dessous).

Points marquants par version :

* **v0.4.2 — fonctionne avec le réseau en production dès l'installation.** Les presets `mainnet` et `testnet` intègrent désormais les endpoints publics `qore.host` (REST sur `api.qore.host` / `api-testnet.qore.host`), de sorte que `createRdkClient({ network })` atteint la chaîne sans `endpoints` manuel — ne la remplacez que pour cibler votre propre nœud. La même version a renommé l'identifiant de VM du rollup Wasm en **`native`** (QoreChain Native) ; `cosmwasm` reste un alias hérité accepté, et les deux se mappent sur `cosmwasm` sur le fil — la chaîne, l'explorateur et le Dashboard sont inchangés.
* **v0.4.3 — mise à jour de dépendance pour la correction de l'encodage de la signature hybride du SDK.** Le client de transaction du RDK lui-même signait encore en mode classique uniquement.
* **v0.4.4 — suit `@qorechain/sdk` `^0.7.0`**, la version du SDK pour les voies d'authentificateur de la chaîne **v3.1.85**. Aucun changement d'API du RDK.
* **v0.5.0 (18 octobre 2026)** — la vérification des reçus de règlement s'appuie sur l'état de la chaîne et ne déclare jamais un reçu valide à partir de ses propres champs ; le client de transaction TypeScript signe en mode hybride lorsqu'on lui fournit un `pqcKeypair`. Il dépend de `@qorechain/sdk` `^0.8.0`.
* **v0.6.0 (version GitHub du 20 octobre 2026 ; vérifiée sur chaque registre le 23 octobre 2026)** — la version de compatibilité pour les versions de chaîne v3.2.2 à v3.2.4 : batches ancrés, reçus de règlement capables de se vérifier, fenêtres de contestation mesurées comme la chaîne les mesure, un encodeur conforme à la disposition cross-VM de la chaîne, des templates qui signent en mode hybride, et `@qorechain/sdk` `^0.9.0`. Le détail et ce qui reste à faire se trouvent ci-dessous.

**Versions publiées (vérifiées le 23 octobre 2026).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` et `create-qorechain-rollup` : **0.6.0** (`latest`) ; PyPI `qorechain-rdk` : 0.6.0 ; crates.io `qorechain-rdk` : 0.6.0 ; Maven Central `io.github.qorechain:qorechain-rdk` : 0.6.0 (latest et release) ; module Go `github.com/qorechain/qorechain-rdk/packages/go` : `v0.6.0` est servi par le proxy de modules et c'est désormais ce que résout `@latest` ; épingler explicitement `@v0.6.0` reste le plus clair.

#### RDK 0.6.0 : changements et limites {#rdk-050-limits}

Cette section énonce ce que font les packages 0.6.0 publiés, vérifiés par rapport au contenu des packages et aux notes de version GitHub, et ce qu'ils ne peuvent toujours pas faire. Aucun de ces points n'est un comportement de la chaîne. Lorsqu'une phrase dit « non testé en conditions réelles », aucun rollup n'existe sur l'un ou l'autre réseau : le chemin n'a donc été vérifié que par rapport au code et hors ligne.

**Ce qui a changé dans la 0.6.0** (TypeScript, sauf indication contraire d'une ligne) :

* **Signature.** `RdkClient.connectTx(signer, { pqcKeypair, rest })` signe en mode hybride (secp256k1 + ML-DSA-87) lorsque vous passez une paire de clés ; sans elle, il signe en mode classique uniquement et les réseaux refusent la transaction. `signer` doit être un `OfflineDirectSigner`, et les frais doivent être explicites (un `fee`, ou un `gasPrice` à la connexion). De nouveaux helpers `resolvePqcKeypair` et `pqcKeypairFromEnv` dérivent à la fois la clé ML-DSA-87 canonique et la clé héritée à partir d'une mnémonique, et utilisent celle que le compte a enregistrée on-chain ; ils refusent, plutôt que de deviner, lorsque le compte détient une autre clé. `QORE_PQC_SEED_HEX` fournit une graine à un opérateur qui signe avec une clé privée brute. Le kit dépend désormais de `@qorechain/sdk` `^0.9.0`, de sorte qu'une installation neuve contient une seule copie du SDK (0.9.0) ; avec la 0.5.0, npm installait le SDK 0.8.3 imbriqué sous le kit.
* **Batches ancrés.** `MsgSubmitBatch` porte `anchor_signature` et `validator_set_hash`. `RdkTxClient.submitBatch` ne signe lui-même l'ancrage que lorsque le client signe en mode hybride, dispose d'un endpoint REST, et **est le créateur du rollup** (la chaîne vérifie l'ancrage par rapport à la clé enregistrée du créateur) ; dans tous les autres cas, il soumet sans ancrage, comme auparavant. Passez `anchor: "require"` pour refuser au lieu de soumettre sans ancrage, `anchor: "off"` pour ne jamais signer, ou `anchorSignature` pour envoyer une signature que vous avez obtenue vous-même. `anchorSignBytesForBatch` construit les octets v2 pour un créateur qui signe hors bande, ce dont a besoin un rollup avec un séquenceur distinct. Non testé en conditions réelles.
* **Reçus de règlement.** La recherche de compte PQC utilise la route au singulier `/qorechain/pqc/v1/account/{address}` (la 0.5.0 utilisait un chemin au pluriel que les réseaux ne servent pas). La vérification prend en charge les deux formes d'octets de signature d'ancrage et en choisit une d'après la hauteur de l'ancrage, sans jamais essayer les deux : v1 en dessous du basculement de la v3.2.2, v2 à partir de celui-ci. Le schéma de reçu v2 enregistre `chainId` ; la vérification refuse un reçu contrôlé auprès d'un nœud d'une autre chaîne, et rapporte `signBytesVersion` ainsi qu'un contrôle `chainBinding`. Les reçus de version 1 se vérifient toujours. Voir [Settlement receipts](/rollups/settlement-receipts).
* **Lectures.** `getLatestBatch` appelle `/qorechain/rdk/v1/latest_batch/{rollup_id}` (la 0.5.0 appelait une forme que la chaîne ne sert pas), et `listBatches` parcourt toutes les pages (`listBatchesPage` en lit une). `RollupView` porte `escrowBalance` et, lorsque le nœud les rapporte, `challengeWindowSec`, `challengeBond` et `proofSystem` ; `BatchView` porte `submittedTime`.
* **Fenêtres de contestation.** `batchChallengeWindow` calcule la fenêtre d'un batch comme le fait la chaîne et la juge par rapport à la tête de chaîne (`getChainTip`), et non à l'horloge locale : des secondes de temps de bloc pour un batch dont l'heure de soumission est enregistrée (la règle de la v3.2.4 : le testnet depuis la hauteur 8,337,253, le mainnet depuis la hauteur 3,742,566), `window / 6` blocs comptés depuis la hauteur de soumission dans le cas contraire (la règle des batches soumis avant la hauteur de mise à niveau). Le contrôle de santé derrière `qorollup status` et le watchtower l'utilisent (voir [Watchtower](/rollups/watchtower)).
* **Cross-VM.** `encodeCrossVmCalldata` encode désormais `executeCrossVMCall(uint8,string,bytes)`, la disposition que le nœud décode, et prend un `targetVm`. `isCrossVmPrecompileActive` lit la liste en direct des precompiles actifs (voir [Multi-VM](/rollups/multi-vm)).
* **Règles vérifiées avant le paiement des frais.** `rollupIdError` vérifie la grammaire de l'id lorsque vous validez une configuration et avant que `createRollup` ne diffuse ; `withdrawalErrors` vérifie un retrait avant que `executeWithdrawal` ne diffuse.
* **Templates.** Les templates générés se connectent via `pqcKeypairFromEnv`, de sorte que leurs scripts `create` et `submit-batch` signent en mode hybride, et ils dépendent de `@qorechain/rdk` `^0.6.0`. Le template `multivm-rollup` vérifie que le precompile est actif et exige une réponse non vide de la cible.
* **Python, Go, Rust et Java.** Les corrections côté lecture ci-dessus (route PQC au singulier, `latest_batch`, octets de signature d'ancrage v2, règles de fenêtre de contestation, vérifications d'id et de retrait) figurent aussi dans les packages publiés des quatre autres langages.
* **Changements incompatibles.** `encodeCrossVmCalldata` prend `targetVm`, et `CROSS_VM_DEFAULT_SIGNATURE` a changé. `RollupHealth` et `BatchDeadline` portent un `challengeWindow` à la place de l'ancienne échéance en secondes.

**Limites qui subsistent dans la 0.6.0 :**

* **Seul le client TypeScript signe en mode hybride.** La CLI `qorollup` (ses commandes `create`, `pause`, `resume`, `stop` et `withdraw` se connectent sans clé post-quantique) et les clients **Python, Go, Rust et Java** signent en mode classique uniquement, ce que les deux réseaux refusent sur la voie native ; leurs README le disent toujours. Leurs constructeurs de messages n'ont pas de champ `anchor_signature` ni `validator_set_hash`. Pour les transactions issues de ces outils, construisez et signez avec la CLI de la chaîne (`--generate-only`, puis `qorechaind tx pqc cosign`) ou utilisez le client TypeScript avec un `pqcKeypair`.
* **Aucune création hybride d'un rollup n'a été exercée en conditions réelles,** car aucun rollup n'existe sur l'un ou l'autre réseau. Il en va de même pour les batches ancrés, les retraits et l'ensemble du flux de reçus.
* **L'ancrage nécessite le créateur.** Un batch n'est ancré dans la même transaction que si la signature du créateur y figure. Si le séquenceur est une autre adresse, le créateur doit signer les octets v2 hors bande et le séquenceur envoie le résultat.
* **Le precompile cross-VM à l'adresse `0x…0901` n'a pas de code** et ne figure pas dans la liste des precompiles actifs sur l'un ni l'autre réseau ; un appel depuis un contrat ne fait donc toujours rien (voir [Multi-VM](/rollups/multi-vm)).
* **Durée de la fenêtre de contestation.** Le kit ne lit la fenêtre propre à un rollup que lorsque le nœud la rapporte (le package documente cela à partir de la v3.2.4, que les deux réseaux exécutent désormais). Sinon, il utilise la fenêtre par défaut du module ; passez `challengeWindowSecs` pour un rollup qui a configuré la sienne. Les anciens helpers `challengeWindowDeadline` et `isChallengeWindowClosed` sont toujours exportés et prennent toujours des secondes ; ne leur donnez donc pas une hauteur de bloc.
* **Disponibilité des données.** `buildDaBlob` calcule un hash SHA-256, alors que l'engagement de blob de la chaîne est en SHAKE-256 (voir [Data Availability](/rollups/data-availability)).

**Versions antérieures à la 0.6.0.** Il ne faut pas utiliser la 0.5.0 et les versions antérieures pour les reçus de règlement, le watchtower ou les calldata cross-VM : la 0.5.0 cherchait la clé du créateur sur une route que les réseaux ne servent pas (de sorte que la vérification des reçus échouait de façon fermée sur chaque reçu authentique), ne reconstruisait que le message d'ancrage v1, lisait une hauteur de bloc comme un horodatage (chaque âge de batch et chaque échéance de contestation étaient faux, et le watchtower déclenchait aussitôt son alerte d'échéance pour chaque batch), appelait une route de dernier batch que la chaîne ne sert pas, ne lisait que les 50 premiers batches, encodait une fonction que le precompile ne décode pas, et livrait des templates qui signaient en mode classique uniquement. La 0.4.x n'avait pas de signature hybride dans le client de transaction.

#### Clients Python, Go, Rust et Java

Aux côtés du package TypeScript, le RDK fournit des clients **Python**, **Go**, **Rust** et **Java** complets qui reflètent la surface TypeScript : le constructeur de configuration avec validation, les cinq profils prédéfinis, les utilitaires denom/economics/bech32, les helpers de Merkle binaire et de preuve de retrait, les manifestes de rollup, les clients de lecture REST et JSON-RPC `qor_`, les vérifications préalables/de santé, les comptes (mnémonique → adresse `qor`), et la signature de transaction classique + diffusion (`SIGN_MODE_DIRECT`, non acceptée sur les réseaux à signature hybride — voir [RDK 0.6.0 : changements et limites](#rdk-050-limits)). Tous sont vérifiés par rapport à des vecteurs de référence partagés inter-langages et sont **publiés** sur leurs registres respectifs :

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version: the proxy's @latest still answered v0.5.0 when checked)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.6.0
```

```python
import qorrdk
```

Versions actuellement publiées, toutes en **0.6.0** (vérifiées le 23 octobre 2026) : Python `qorechain-rdk` (PyPI, import `qorrdk`), module Go `github.com/qorechain/qorechain-rdk/packages/go` (`v0.6.0`), Rust `qorechain-rdk` (crates.io) et Java `io.github.qorechain:qorechain-rdk` (Maven Central). Ces clients lisent l'état de la chaîne ; ils ne produisent toujours pas la signature hybride exigée par les réseaux, et leurs constructeurs de messages ne portent pas de champs d'ancrage (voir [RDK 0.6.0 : changements et limites](#rdk-050-limits)).

:::note
Le RDK TypeScript et ses templates ciblent par défaut le testnet **`qorechain-diana`**, et les presets atteignent les endpoints publics en production dès l'installation. Épinglez les versions et validez sur testnet avant le mainnet.
:::

### Générer un projet avec `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Chaque profil possède un template de démarrage correspondant (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Générez-en un avec l'une des deux formes :

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pour une utilisation non interactive / CI, passez le template et le réseau explicitement :

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Le générateur affiche le coût documenté du stake et du burn de création, ainsi que les prochaines étapes pour créer votre rollup et consulter son statut.

:::caution Ce que peuvent faire les scripts générés
Les templates de `create-qorechain-rollup` 0.6.0 dépendent de `@qorechain/rdk` `^0.6.0`. Leurs scripts `create` et `submit-batch` se connectent via `connectOperator()` dans `src/signer.ts`, qui résout votre clé post-quantique à partir de `QORE_MNEMONIC` (ou de `QORE_PQC_SEED_HEX` lorsque vous signez avec `QORE_OPERATOR_PRIVATE_KEY_HEX`), la vérifie auprès de la chaîne et signe en mode hybride ; si aucune des deux n'est définie, le script émet un avertissement et signe en mode classique uniquement, ce que les deux réseaux refusent. Aucun rollup n'a été créé via un template sur un réseau en production ; ce chemin n'est donc pas testé en conditions réelles. Le script `submit-batch` du projet de démarrage n'est qu'un flux de référence : il envoie des racines illustratives et une preuve d'exemple, et il n'est pas censé finaliser un batch sur un réseau en production.
:::

### Construire une configuration de rollup depuis du code

Construisez une configuration à partir d'un preset, lisez le stake et le taux de burn en direct depuis la chaîne, puis produisez le message de création. Le constructeur de configuration applique la matrice de compatibilité règlement → preuve lors de `validate()` / `build()`. Soumettez les valeurs obtenues avec la CLI ci-dessus, ou avec le client TypeScript muni d'un `pqcKeypair` — voir [RDK 0.6.0 : changements et limites](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Vous ne savez pas quel profil convient ? `rdk.suggestProfile(...)` est censé renvoyer une recommandation assistée par le QCAI ; sur les endpoints publics actuels, il renvoie toujours le repli `defi` (`source: "fallback"`), choisissez donc à partir du [tableau des profils](/rollups/preset-profiles).

### Lire l'état depuis le code

Le client REST typé ne nécessite aucun signataire et lit les deux réseaux :

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Pour les batches, utilisez `rdk.rest.getBatch(rollupId, index)` ou `qorechaind query rdk batch [rollup-id]` (ci-dessous) ; `getLatestBatch` et `listBatches` lisent la route `latest_batch` de la chaîne et toutes les pages de la liste des batches depuis la 0.6.0 (voir [RDK 0.6.0 : changements et limites](#rdk-050-limits)).

---

## Gestion du cycle de vie

Un rollup passe par les états `pending`, `active`, `paused`, et `stopped` ; un nouveau rollup démarre immédiatement à l'état `active`. Seul le créateur peut le mettre en pause, le reprendre ou l'arrêter (appliqué depuis la version de chaîne v3.2.0). Chaque commande ci-dessous suit le même schéma en deux étapes que la création : générer la transaction non signée, puis la cosigner.

### Pause

Suspendre temporairement le rollup. L'état est préservé et le rollup peut être repris. Une chaîne de caractères indiquant la raison est requise.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Reprise

Reprendre un rollup précédemment mis en pause.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Arrêt

Décommissionner définitivement le rollup et libérer son stake. Le QOR staké — moins le burn de création unique, et moins tout ce qui a déjà été versé depuis le séquestre du rollup par des retraits ou des récompenses de preuve de fraude — est restitué au créateur : depuis la v3.2.3, un registre de séquestre par rollup enregistre ce que chaque rollup détient encore, `stop-rollup` rembourse exactement ce solde, et un rollup arrêté ne paie plus aucun retrait. Le stake d'enregistrement de la couche de 1 000 QOR est restitué séparément lorsque la couche du rollup est désactivée.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Arrêter un rollup est définitif. Le rollup ne peut pas être redémarré une fois arrêté.
:::

---

## Commandes opérateur : batches et challenges

Les opérateurs de rollup soumettent des batches de règlement, et les challengers peuvent contester des batches optimistes. Ces commandes sous-tendent la couche de règlement décrite dans **[Rollups Overview](/rollups/overview)** et **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)**.

### Qui peut soumettre, et dans quel ordre

* **Seule l'adresse de séquenceur configurée du rollup — ou, lorsqu'aucune n'est configurée (c'est le cas de tous les presets), son créateur — peut soumettre des batches.** Le séquençage basé (based) et partagé n'admet pas encore d'ensembles de proposeurs ni de listes : ce ne sont aujourd'hui que des libellés, et c'est le créateur qui soumet.
* Les batches forment une chaîne : le premier batch a l'index `0` ; chaque batch suivant doit utiliser l'index suivant et porter la racine d'état du batch précédent comme `prev_state_root`.
* Un batch qui porte un hash de données sur un rollup `native` ou `both` est refusé tant qu'un blob correspondant n'est pas déjà stocké (voir [Data Availability](/rollups/data-availability)). Un batch sans hash de données n'est pas vérifié.
* Un rollup `zk` doit joindre une preuve, et cette preuve doit être vérifiée (voir [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

### Soumettre un batch {#submit-a-batch}

Soumettre un batch de règlement pour un rollup. Prend l'ID du rollup, un index de batch, et une racine d'état encodée en hexadécimal. Pour chaque batch après le premier, passez la racine d'état du batch précédent avec `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Description |
| ---- | ----------- |
| `--prev-state-root` | Racine d'état hexadécimale dont part le batch (obligatoire pour chaque batch après l'index `0`) |
| `--tx-count` | Nombre de transactions du rollup dans le batch |
| `--data-hash` | Hash hexadécimal des données du batch publiées sous forme de blob DA (laissez vide aujourd'hui : il n'existe aucun moyen de publier un blob, voir [Data Availability](/rollups/data-availability)) |
| `--withdrawals-root` | Racine de Merkle hexadécimale des retraits L2 → L1 du batch (voir [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Signature ML-DSA-87 hexadécimale du **créateur** du rollup sur les octets de signature d'ancrage v2 (depuis la v3.2.2) ; le batch est alors ancré dans `x/multilayer` dans la même transaction, et un ancrage refusé refuse le batch |
| `--validator-set-hash` | Engagement hexadécimal de l'ensemble de validateurs, porté dans l'ancrage et couvert par la signature |

Sans `--anchor-signature`, le batch est réglé **sans ancrage**. Pour ancrer un batch, affichez les octets à signer, signez-les avec la clé post-quantique enregistrée du créateur, et passez la signature (les valeurs `--tx-count` et `--validator-set-hash` doivent correspondre à celles que vous soumettez) :

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` est l'ID de couche du rollup (l'ID du rollup pour les rollups créés par le RDK). Depuis TypeScript, `RdkTxClient.submitBatch` dans `@qorechain/rdk` 0.6.0 signe l'ancrage pour vous lorsque le client signe en mode hybride et est le créateur du rollup, et `anchorSignBytesForBatch` fournit à un créateur les octets à signer hors bande (voir [RDK 0.6.0 : changements et limites](#rdk-050-limits)). Le `--proof` ZK d'un rollup `zk` n'a aujourd'hui aucun flag CLI, et le message resolve-challenge n'est pas une commande CLI : utilisez un client. Voir [Settlement receipts](/rollups/settlement-receipts) pour ce qu'un ancrage prouve et ne prouve pas. Aucun rollup, couche ou ancrage n'existe encore sur l'un ou l'autre réseau.

### Contester un batch (rollups optimistes) {#challenge-a-batch-optimistic-rollups}

Tout compte peut contester un batch `submitted` pendant la fenêtre de contestation (100 800 blocs par défaut pour un batch soumis sur le mainnet avant la hauteur 3,742,566 ; à partir de la v3.2.4, une fenêtre en secondes de temps de bloc pour les nouveaux batches : sur le testnet depuis la hauteur 8,337,253, sur le mainnet depuis la hauteur 3,742,566) en déposant une caution (le `challenge_bond` du rollup ; 1 000 QOR pour les presets `nft` et `custom`) et une preuve de fraude. Prend l'ID du rollup et l'index du batch ; passez la preuve de fraude avec `--proof` :

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Description |
| ---- | ----------- |
| `--proof` | Preuve de fraude encodée en hexadécimal |

Une contestation **gèle** le batch (`challenged`) : il ne peut pas être finalisé. Le **créateur** du rollup le résout ensuite avec un message resolve-challenge (non exposé comme commande CLI ; utilisez un client). La chaîne décide elle-même du résultat en vérifiant la preuve stockée. Si la fraude est confirmée, le batch est `rejected`, la caution est restituée et le challenger reçoit un montant supplémentaire égal à la caution, prélevé sur le stake du rollup ; si la contestation est rejetée, la caution revient au créateur et le batch repasse à l'état `submitted`.

### Inspecter les batches

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Requêtes

| Commande | Objectif |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Détails d'un rollup spécifique |
| `qorechaind query rdk list-rollups` | Tous les rollups enregistrés |
| `qorechaind query rdk batch [rollup-id]` | Dernier batch de règlement (ou `--index`) |
| `qorechaind query rdk batches [rollup-id]` | Une page de batches dans l'ordre des index (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | Les octets de signature d'ancrage v2 d'un batch (hors ligne) |
| `qorechaind query rdk config` | Paramètres du module RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Affiche un renvoi vers le RPC `qor_suggestRollupProfile` ; les endpoints publics ne le servent pas, choisissez donc un profil dans le tableau des [Preset Profiles](/rollups/preset-profiles) |

---

## Prochaines étapes

* **[Data Availability](/rollups/data-availability)** — backends DA native, Celestia, et redondant.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — vérification de preuves et flux de retrait L2 → L1 via `execute-withdrawal`.
