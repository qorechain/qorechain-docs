---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

Le QoreChain Asset Kit est un outillage open source pour émettre et gérer, sur QoreChain, des jetons permissionnés qui représentent des actifs réels. Il comporte deux parties, de statut différent. La première est un ensemble de contrats EVM qui fonctionnent dès aujourd'hui sur le QoreChain EVM Engine : des adaptateurs pour deux standards de jetons ouverts destinés aux actifs réglementés (ERC-3643 et CMTAT), des vaults à parts restreintes, et un contrôle propre à QoreChain qui exige que chaque détenteur ait une clé ML-DSA-87 enregistrée. L'autre partie est une **proposition** de modules natifs de la chaîne, publiée sous forme d'interfaces protobuf avec des clients dans quatre langages et un mock en mémoire, afin que des applications puissent être conçues et testées selon les règles proposées.

Il s'adresse aux émetteurs, aux agents de transfert, aux administrateurs de fonds, aux équipes conformité et juridiques, ainsi qu'aux intégrateurs qui veulent prototyper un jeton réglementé sur le testnet de QoreChain. Version **0.1.0**, Apache-2.0 (avec les exceptions de licence listées sous [Où c'est publié](#where-published)), maintenu par la QoreChain Association. Il est pré-1.0 et **non audité**.

:::caution Ce qui est en ligne et ce qui ne l'est pas
- **Fonctionne aujourd'hui, sur le testnet uniquement :** les contrats EVM, les scripts de déploiement Foundry et la console d'émetteur, sur `qorechain-diana` (ID de chaîne EVM 9800). Le contrôle de détenteur lit le précompilé `pqcKeyStatus` à l'adresse `0x0A02`, qui est actif sur le testnet et **non actif sur le mainnet**.
- **Mainnet (`qorechain-vladi`, ID de chaîne EVM 9801) :** le contrôle de détenteur **échoue en mode fermé**. Toute adresse qui n'est pas explicitement exemptée est considérée comme inéligible : un jeton protégé par le guard ne peut donc pas circuler entre des détenteurs ordinaires. Les scripts de déploiement refusent de s'exécuter sur la chaîne 9801.
- **Une proposition, en ligne nulle part :** les modules natifs `x/asset`, `x/identity`, `x/compliance`, `x/settlement` et `x/attest` n'existent sur aucun réseau QoreChain, et aucune mise à niveau qui les ajouterait n'est planifiée. Les clients correspondants ne peuvent dialoguer qu'avec un mock en mémoire.
- **Les modèles juridiques** du dépôt sont des brouillons non relus, destinés à une discussion avec un conseil. Ils ne constituent pas un conseil juridique.
:::

## Innovations {#innovations}

- **Un contrôle de détenteur post-quantique en plus des contrôles propres au standard.** Le guard lit `pqcKeyStatus(address)` à l'adresse `0x0A02` et n'accepte une adresse que si la réponse indique `registered`, l'identifiant d'algorithme 1 (ML-DSA-87) et `possessionProven`. Une clé enregistrée sans preuve de possession pourrait appartenir à quelqu'un d'autre ; elle ne compte donc pas. Tous les contrôles du standard amont (registre d'identités, claim topics, gel, pause, transfert forcé) continuent de s'appliquer ; le contrôle s'y ajoute.
- **Échec en mode fermé, avec un décodage strict.** Le guard appelle le précompilé avec une allocation de gas fixe et décode la réponse de façon stricte. Une réponse dans l'ancien format à trois champs, une réponse mal formée ou l'absence de réponse sont traitées comme « aucune clé ». Là où le précompilé n'est pas actif, toute adresse non exemptée est inéligible.
- **Le même guard derrière trois adaptateurs.** `QoreChainHybridHolderRule` se branche sur un jeton CMTAT v3 comme `ruleEngine` (ou comme règle dans un CMTA RuleEngine) avec les codes de restriction 60, 61 et 62 ; `QoreChainHybridHolderModule` se branche sur la conformité modulaire d'ERC-3643 comme module plug-and-play ; les vaults acceptent n'importe quelle politique `IHolderEligibility`, le guard compris.
- **Des parts de vault qui ne permettent pas de blanchir un jeton restreint.** `QoreChainRwaVault` (ERC-4626) et `QoreChainRwaAsyncVault` (ERC-7540, demandes réglées par lots par un opérateur disposant de `FULFILLER_ROLE`) contrôlent le côté réceptionnaire de chaque mouvement de parts : `maxDeposit` et `maxMint` renvoient zéro pour un réceptionnaire inéligible. Les rachats ne sont jamais refusés.
- **Contrats amont utilisés sans modification.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 et OpenZeppelin sont des sous-modules git, pas des copies.
- **Une proposition testable avant d'exister.** Tout appel sur le `ChainClient` échoue avec `ChainUpgradeRequired` (code `CHAIN_UPGRADE_REQUIRED`, plus le nom du module) sans envoyer aucune requête réseau. Un `MockChain` implémente les règles proposées en mémoire et refuse avec `MockChainError`, qui porte le nom du code d'erreur proposé, par exemple `ERROR_CODE_ADDRESS_FROZEN`. Une application peut être écrite contre le mock tout en gardant le vrai client branché : une mise à niveau manquante est alors signalée clairement au lieu d'échouer en silence.
- **Une console sans backend.** La console d'émetteur est une page React qui n'effectue aucune requête réseau de son propre chef ; le build de production définit une Content-Security-Policy avec `connect-src 'none'`, et tout passe par le portefeuille connecté.
- **Des tests qui s'exécutent hors ligne.** 33 tests Foundry s'exécutent sans réseau, avec un double de test du précompilé.

## Ce que ça fait {#what-it-does}

**Fonctionne aujourd'hui sur l'EVM de QoreChain (testnet) :**

- **`QoreChainHybridHolderGuard`.** Indique si une adresse possède une clé ML-DSA-87 enregistrée avec preuve de possession (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Exemptions gérées par le propriétaire pour des contrats tels que les vaults et les séquestres (`setExempt`, événement `ExemptionSet` avec un motif). La propriété se transfère en deux étapes (`Ownable2Step` d'OpenZeppelin).
- **`QoreChainHybridHolderRule`.** Une règle de transfert CMTAT v3 reliée au guard. Codes de restriction 60 (expéditeur), 61 (destinataire) et 62 (spender) via `detectTransferRestriction`, `detectTransferRestrictionFrom` et `messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** Un module de conformité modulaire ERC-3643 (T-REX v4) relié au guard. `moduleCheck` contrôle l'expéditeur et le destinataire. Aucune configuration par conformité.
- **`QoreChainRwaVault` et `QoreChainRwaAsyncVault`.** Décrits plus haut.
- **`IERC7518`.** Une esquisse d'interface pour les partitions ERC-7518, sans implémentation ; son identifiant ERC-165 `0x5a264a5d` est vérifié par un test.
- **Scripts de déploiement (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` et `script/DeployVaults.s.sol`, avec un contrôle préalable commun (`script/QoreChainTestnet.sol`) qui indique si le précompilé répond ainsi que le statut de clé du déployeur, et qui refuse la chaîne 9801.
- **Console d'émetteur** (`packages/issuer-console`). Se connecte à tout portefeuille EIP-6963, ajoute QoreChain Testnet ou bascule dessus, crée un jeton CMTAT protégé par le guard (guard, règle et jeton, comme dans `DeployCmtat.s.sol`), ouvre des jetons CMTAT ou ERC-3643 existants, exécute des actions d'agent (mint, burn, gel, dégel, transfert forcé, pause, reprise) et affiche les détenteurs ainsi qu'un journal d'audit construit à partir des événements de la chaîne.

**Proposition (pas sur la chaîne) :**

- Des interfaces protobuf dans `proto/` pour `x/asset`, `x/identity`, `x/compliance`, `x/settlement` et `x/attest`, et leur sémantique dans `docs/proposal.md`.
- Des clients en TypeScript, Python, Go et Java : types générés, le `ChainClient` et le `MockChain`.

**Documents de référence dans le dépôt :**

- `docs/evm-adapters.md` : les contrats, les licences amont, le déploiement sur testnet.
- `docs/technology-standards.md` : un brouillon qui décrit les réseaux tels qu'un émetteur ou un auditeur a besoin de les voir (fiabilité, gouvernance, autorité de mise à niveau, ordonnancement des transactions, observabilité, gestion des incidents, gestion des clés), chaque fait étant étiqueté Verified, Documented, Not measured ou Not published.
- `legal/` : trois modèles pour discussion (voir [Limites](#limits)).

## Cas d'usage {#use-cases}

1. **Un émetteur prototype un jeton permissionné sur testnet.** L'émetteur déploie un jeton CMTAT avec `DeployCmtat.s.sol` (ou depuis la console d'émetteur), ou une suite ERC-3643 complète avec `DeployErc3643.s.sol`, et essaie le gel, la pause, le transfert forcé et le contrôle de détenteur sur `qorechain-diana` avant toute décision sur une émission réelle.
2. **Un administrateur de fonds exécute souscriptions et rachats via des vaults à parts restreintes.** Les investisseurs demandent des dépôts sur `QoreChainRwaAsyncVault` ; l'administrateur les traite par lots avec `fulfillDeposit` et `fulfillRedeem` ; les parts ne peuvent être reçues que par des adresses éligibles, tandis que les rachats restent ouverts à tous ceux qui détiennent des parts.
3. **Une équipe conformité exige l'enregistrement d'une clé post-quantique pour chaque détenteur.** Ajouter `QoreChainHybridHolderRule` (CMTAT) ou `QoreChainHybridHolderModule` (ERC-3643) fait qu'un jeton ne peut être émis ou transféré qu'à des adresses disposant d'une clé ML-DSA-87 enregistrée et dont la possession est prouvée, en plus des contrôles d'identité et de liste d'autorisation propres au standard.
4. **Un intégrateur construit contre les modules natifs proposés.** Un portefeuille, un registre ou un back-office code contre `MockChain` en TypeScript, Python, Go ou Java, vérifie ses événements et ses codes d'erreur, et garde `ChainClient` branché.
5. **Une équipe produit conçoit des flux de livraison contre paiement et d'attestation.** Le `x/settlement` proposé (instructions avec affirmation bilatérale, toutes les jambes ou aucune) et le `x/attest` proposé (déclarations avec une durée de validité et une notion de péremption) peuvent être exercés dans `MockChain` pour concevoir des parcours utilisateur, en sachant qu'aucun des deux n'existe sur la chaîne.
6. **Une équipe juridique démarre les formalités avec un conseil.** Les modèles pour un titre de registre suisse, des conditions de jeton du TVTG du Liechtenstein et un engagement au titre du régime pilote DLT de l'UE offrent une structure et une section de correspondance technique à compléter. Un conseil qualifié de la juridiction relit le tout avant tout usage.
7. **Un relecteur de due diligence lit les faits du réseau.** `docs/technology-standards.md` liste ce qui peut être vérifié sur les réseaux en ligne et ce qui n'est pas mesuré ou pas publié, avec les sources.

## Comment ça fonctionne {#how-it-works}

### Le contrôle de détenteur sur l'EVM {#holder-check}

Le précompilé à l'adresse `0x0A02` répond à `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. Le guard exige `registered && algorithmId == 1 && possessionProven`. Cela fait échouer le guard en mode fermé : là où le précompilé n'est pas actif, toute adresse qui n'est pas explicitement exemptée est inéligible. Voir [Précompilés EVM](/developer-guide/evm-precompiles) pour le précompilé lui-même et son statut par réseau.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

Le contrôle est additif. Tous les contrôles du standard amont continuent de s'appliquer : registre d'identités ERC-3643 (ONCHAINID), claim topics, émetteurs de confiance, gel, gel partiel, pause, transfert forcé et récupération ; gel, gel partiel, pause, transfert forcé, documents et snapshots de CMTAT.

### Ce que le contrôle couvre {#coverage}

Ce qui compte, c'est la réception : un mint ou un transfert vers une adresse sans clé est refusé. La règle CMTAT contrôle aussi l'expéditeur et, pour `transferFrom`, le spender. Le module ERC-3643 contrôle l'expéditeur et le destinataire ; ERC-3643 ne transmet pas le spender aux modules de conformité, donc le spender d'un `transferFrom` n'y est pas contrôlé. Les burns ne sont jamais refusés (dans ERC-3643, `burn` ne consulte pas du tout les modules de conformité), de sorte qu'un détenteur qui a perdu son éligibilité peut quand même être remboursé.

### Vaults {#vaults}

Les deux vaults contrôlent le côté réceptionnaire de chaque mouvement de parts ; les rachats ne sont jamais refusés. Dans le vault ERC-7540, les demandes sont agrégées par contrôleur (identifiant de demande 0). L'exécutant convertit les dépôts en attente en parts au ratio actifs par part propre au vault au moment de l'exécution, sans aucune valorisation externe ; les contrôleurs réclament ensuite avec `deposit` ou `mint`, ou `redeem` ou `withdraw`. Le contrat du vault lui-même doit être autorisé à détenir le jeton sous-jacent : enregistré dans le registre d'identités ERC-3643 ou dans la liste d'autorisation CMTAT, et exempté dans le guard (`DeployVaults.s.sol` définit les exemptions du guard).

### Envoyer une transaction EVM sur QoreChain {#native-prerequisites}

Toute transaction EVM sur QoreChain n'est admise que si l'expéditeur dispose de :

1. une clé ML-DSA-87 enregistrée, enregistrée avec `MsgRegisterPQCKeyV2` et une preuve de possession, et
2. une fenêtre d'autorisation EVM ouverte, ouverte par `/qorechain.pqc.v1.MsgOpenEVMWindow` dans une transaction de la voie native signée en hybride (secp256k1 plus ML-DSA-87).

Pour des déploiements, la fenêtre exige `allowed_targets` **vide** (une fenêtre restreinte à des cibles refuse la création de contrat), `max_txs` au moins égal au nombre de transactions, `max_value` couvrant la valeur plus les frais maximaux de chaque transaction, `blocks` assez long (17,280 au plus) et `native_only` à false. Ouvrir la fenêtre fait avancer la séquence du compte, qui est aussi le nonce EVM : ouvrez d'abord la fenêtre, puis exécutez le script. Les appels et l'estimation de gas n'ont pas besoin de fenêtre. Contexte : [Signature post-quantique](/developer-guide/post-quantum-signing) et [Développement EVM](/developer-guide/evm-development#evm-window).

### La proposition {#proposal}

Six drapeaux fixés ou assouplissables seulement à la création (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`) ; des rôles (émetteur, agents, auditeurs, agents d'identité, émetteurs de claims, attesteurs) ; des contrôles de transfert ordonnés ; gel, gel partiel, clawback et transfert forcé avec un motif enregistré ; des identités avec des claims mais sans donnée personnelle sur la chaîne ; un registre de modules de conformité versionnés (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`) ; des instructions de règlement avec affirmations ; des attestations avec le statut `FRESH`, `STALE` ou `MISSING`. La spécification est `docs/proposal.md` dans le dépôt. Là où le texte et le mock divergent, le texte fait foi pour le comportement voulu. Tout ceci est une conception : rien de cela n'existe sur un réseau QoreChain.

## Comment l'utiliser {#how-to-use}

### Installation {#install}

| Partie | Installation | Plateforme minimale |
|---|---|---|
| Contrats Solidity (depuis GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (tag `v0.1.0`), ou comme dépendance Foundry : `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry ; solc 0.8.28 (les fichiers T-REX et ONCHAINID utilisent 0.8.17) ; `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (package `assetkit`) | Go 1.23 |
| Python | **À venir** sur PyPI sous le nom `qorechain-asset-kit` ; pas encore publié. Aujourd'hui, depuis un clone : `cd clients/python && python -m pip install .` (import `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **À venir** sur npm sous le nom `@qorechain/asset-kit` ; pas encore publié. Aujourd'hui, depuis un clone : `pnpm install && pnpm -r build` | Node.js 22.12 |
| Console d'émetteur | Depuis un clone : `pnpm install`, puis `pnpm --filter @qorechain/issuer-console dev` (non publiée comme package) | Un navigateur avec un portefeuille EIP-6963 |

Le README du dépôt et celui du client TypeScript importent depuis `@qorechain/asset-kit` comme si le package était installé. Cela ne fonctionne que depuis un clone, jusqu'à la release npm.

Avec `forge install`, les contrats se trouvent sous `lib/qorechain-asset-kit/contracts/` et leurs propres dépendances sous `lib/qorechain-asset-kit/contracts/lib/`. Les remappings qui compilent le guard, la règle CMTAT et les vaults :

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Quickstart 1 : compiler et tester les contrats (hors ligne) {#quickstart-build}

Tiré du README du dépôt. Pas de réseau, pas de compte.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

La sortie observée se termine par `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### Quickstart 2 : simuler un déploiement contre le testnet {#quickstart-dry-run}

Sans `--broadcast`, Foundry simule contre l'état du testnet et n'envoie rien. N'importe quelle adresse convient comme `--sender` pour une simulation.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` est défini dans `foundry.toml` comme `https://evm-testnet.qore.host`. Le contrôle préalable affiche l'ID de chaîne (9800), `pqcKeyStatus precompile: active` et le statut de clé du déployeur. Pour une adresse sans clé, il ajoute `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` Il affiche ensuite les adresses qu'auraient le guard, la règle et le jeton. La même commande contre le mainnet s'arrête avec `QoreChain mainnet: the hybrid-holder guard is testnet only`. `script/erc3643/DeployErc3643.s.sol` et `script/DeployVaults.s.sol` s'exécutent de la même façon. Variables d'environnement facultatives : `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Avant de diffuser sur le testnet {#before-broadcast}

1. Utilisez un compte testnet que vous contrôlez, avec un peu de QOR testnet (voir le [Faucet](/dashboard/faucet)). N'utilisez jamais un mnémonique du mainnet, et n'alimentez jamais la phrase de test publique utilisée dans les exemples.
2. Enregistrez sa clé ML-DSA-87 avec une preuve de possession (l'exemple `examples/register-and-send` de [QoreSign](/qoresign/overview) en enregistre une).
3. Ouvrez une fenêtre d'autorisation EVM avec les réglages de [Envoyer une transaction EVM](#native-prerequisites), avec `allowed_targets` vide. Le [SDK QoreChain](/sdk/overview) construit le message (`openEvmWindow` dans le groupe de messages `pqc` en TypeScript, `qorsdk.msg.pqc.open_evm_window` en Python) et relit la fenêtre (`fetchEvmWindow`, `get_evm_window`).
4. Exécutez le script avec `--broadcast` et la configuration de votre portefeuille.
5. Exemptez chaque contrat qui doit détenir le jeton (vaults, séquestres) avec `guard.setExempt`, enregistrez les détenteurs dans la conformité propre au jeton, et contrôlez chaque détenteur avec `guard.isHybridHolder(address)` avant de faire un mint.

### Quickstart 3 : console d'émetteur (testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Connectez un portefeuille EIP-6963, passez sur QoreChain Testnet, puis créez un jeton CMTAT ou ouvrez-en un existant par son adresse. Sur la chaîne 9801, la console affiche un avertissement et désactive la création de jetons. La console n'enregistre pas de clés et n'ouvre pas de fenêtres ; faites d'abord les étapes 2 et 3 ci-dessus.

### Quickstart 4 : construire contre les modules proposés avec MockChain (Python, hors ligne) {#quickstart-python}

Tiré du README du client Python. Jusqu'à la release PyPI, installez depuis un clone (voir [Installation](#install)).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

Sortie observée : `ERROR_CODE_ADDRESS_FROZEN`. Le même appel sur `ChainClient()` lève `ChainUpgradeRequired` avec `module == "x/asset"` et `code == "CHAIN_UPGRADE_REQUIRED"`.

### Quickstart 5 : la même chose en Go (proxy de modules v0.1.0) {#quickstart-go}

Tiré du README du client Go, enveloppé dans un package `main`.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

Sortie observée : `mock mint error: <nil>` puis `true x/asset`. Le README du client Java contient l'exemple équivalent avec `MockChain`, `MsgCreateAsset.newBuilder()` et `MockChainError.code()`.

:::note
Les README Go et TypeScript du dépôt contiennent de petites erreurs dans leurs extraits, à corriger dans la 0.1.1. L'exemple Go ci-dessus est la version corrigée.
:::

## API principale {#main-api}

### Contrats {#api-contracts}

| Nom | Ce que ça fait |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | Guard sur `0x0A02` : `isHybridHolder`, `isEligible`, `requireHybridHolder` (revert `HybridKeyRequired`), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | Règle CMTAT : `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode` ; codes `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | Module ERC-3643 : `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | Vault ERC-4626 à parts restreintes |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | Vault ERC-7540 : `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, et `deposit`, `mint`, `redeem`, `withdraw` avec un contrôleur ; `FULFILLER_ROLE` ; les prévisualisations font un revert par conception |
| `IHolderEligibility` | `isEligible(address)` : branchez une autre politique d'éligibilité pour les vaults |
| `IERC7518` | Esquisse d'interface de partitions |
| `forge script script/DeployCmtat.s.sol` | Guard, règle et jeton CMTAT |
| `forge script script/erc3643/DeployErc3643.s.sol` | Infrastructure T-REX, guard, module et une suite de jeton |
| `forge script script/DeployVaults.s.sol` | Les deux vaults au-dessus d'un jeton restreint, avec les exemptions du guard |

### Clients (proposition) {#api-clients}

Les noms TypeScript et Java sont montrés ; Python utilise le snake_case (`create_asset`), et Go utilise la casse Go derrière des accesseurs (`chain.Asset().CreateAsset(ctx, msg)`).

| Nom | Ce que ça fait |
|---|---|
| `ChainClient` (Go `NewChainClient()`) | Tout appel échoue avec `ChainUpgradeRequired` ; aucune requête réseau |
| `MockChain` (Go `NewMockChain()`) | Les règles proposées en mémoire ; les refus lèvent `MockChainError` |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire` ; requêtes `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer` ; requêtes `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding` ; requêtes `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction` ; requêtes `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke` ; requêtes `latest`, `history`, `attesters` |
| Assistants du mock | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python aussi `has_hybrid_key`, `height`, `time`) |

## Comment y accéder {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| ID de chaîne EVM | 9800 | 9801 |
| RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| Précompilé `pqcKeyStatus` `0x0A02` | Actif | Non actif (`eth_call` renvoie des données vides) ; son activation demanderait une décision de gouvernance, aucune n'a été prise |
| Guard, règle et module de détenteur hybride | Fonctionnent | Échec en mode fermé : toute adresse non exemptée est inéligible, donc les jetons ne peuvent pas circuler entre des détenteurs ordinaires |
| Scripts de déploiement | Simulation et diffusion | Refusent de s'exécuter |
| Console d'émetteur | Complète | Avertissement ; création de jetons désactivée |
| Modules natifs (`x/asset` et autres) | N'existent pas | N'existent pas |

Prérequis pour tout ce qui envoie une transaction EVM : un compte avec une clé ML-DSA-87 enregistrée (avec preuve de possession) et une fenêtre d'autorisation EVM ouverte, toutes deux configurées sur la voie native avec une transaction signée en hybride. Les lectures (`eth_call`, logs, estimation de gas, simulations) n'ont besoin ni de l'une ni de l'autre. Le `MockChain` et les tests Foundry n'ont besoin d'aucun réseau. Autres points de terminaison et faucet : [Se connecter au testnet](/getting-started/connecting-to-testnet) et [Se connecter au mainnet](/getting-started/connecting-to-mainnet).

Comportement du réseau à garder en tête : `PREVRANDAO` est une constante (aucun contrat du kit ne l'utilise) ; les transactions blob (type 3) sont refusées, et les types 0, 1, 2 et 4 sont acceptés ; les délégations EIP-7702 nécessitent le consentement post-quantique propre à l'autorité (`MsgAuthorizeEVMDelegation`).

## Où c'est publié {#where-published}

Vérifié en direct le 28 octobre 2026 (la release GitHub, Maven Central et le proxy Go servent la 0.1.0 ; PyPI et npm renvoient 404).

| Registre | Package | Version | Lien |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Proxy de modules Go | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (tag `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **À venir** (pas encore sur PyPI) | |
| npm | `@qorechain/asset-kit` | **À venir** (non publié) | |
| GitHub (contrats Solidity, console d'émetteur, protos, docs, modèles juridiques) | `qorechain/qorechain-asset-kit` | release v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Dépôt : https://github.com/qorechain/qorechain-asset-kit. Mainteneur : QoreChain Association.

**Licences.** Le code est sous Apache-2.0, à l'exception de `contracts/script/erc3643/` et `contracts/test/erc3643/`, qui se compilent avec l'implémentation de référence ERC-3643 et sont sous GPL-3.0-or-later. La documentation dans `docs/` et `legal/` est sous Apache-2.0. Les dépendances conservent leurs propres licences et sont utilisées sans modification comme sous-modules git : T-REX et ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). Un jeton ERC-3643 déployé est du code T-REX sous sa licence ; un jeton CMTAT déployé est sous MPL-2.0. Le fichier `NOTICE` liste chaque dépendance.

## Limites et problèmes connus {#limits}

- **Les modules natifs n'existent pas.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` et `x/attest` sont une proposition. Aucune mise à niveau qui les ajouterait n'est planifiée. `ChainClient` ne peut jamais réussir en 0.1.0 ; `MockChain` est un outil de développement, pas une chaîne.
- **Le contrôle de détenteur n'existe que sur le testnet.** Sur le mainnet, le guard échoue en mode fermé ; un déploiement sur le mainnet ne peut pas s'y fier.
- **Les pouvoirs des agents contournent le contrôle de détenteur.** Dans les deux standards, le transfert forcé et la récupération de portefeuille par un agent ne consultent ni la règle ni le module : `forcedTransfer` de CMTAT ainsi que `forcedTransfer` et `recoveryAddress` d'ERC-3643 peuvent placer des jetons sur une adresse sans clé. Restreignez qui détient les rôles d'agent.
- **Les spenders de `transferFrom` d'ERC-3643 ne sont pas contrôlés** par le module, car ERC-3643 ne transmet pas le spender à la conformité. La règle CMTAT contrôle bien le spender.
- **Les burns et les rachats restent ouverts** aux détenteurs qui ont perdu leur éligibilité, par conception, dans les deux standards de jetons et dans les deux vaults.
- **Les demandes ERC-7540 en attente ne peuvent pas être annulées** en 0.1.0. Si un agent retire des actifs du vault asynchrone, `totalAssets` renvoie zéro et les réclamations qui ont besoin des actifs manquants échouent jusqu'à ce que l'émetteur rétablisse le solde.
- **Aucune valorisation externe** dans le vault ERC-7540 ; la conversion utilise le solde par part propre au vault.
- **Pas de livraison contre paiement ni d'attestations sur l'EVM.** Elles n'existent que sous la forme des `x/settlement` et `x/attest` proposés.
- **ERC-7518 est une esquisse d'interface**, pas une implémentation. Les partitions peuvent être modélisées aujourd'hui avec un jeton par classe ou tranche partageant un même registre d'identités ou une même règle.
- **CMTA RuleEngine v3** n'est encore publié que sous forme de release candidates ; la règle fonctionne directement comme `ruleEngine` d'un jeton et annonce les deux identifiants d'interface de règle (`0x2497d6cb`, `0xb1a69752`).
- **La console d'émetteur** n'enregistre pas de clés, n'ouvre pas de fenêtres, ne déploie pas de suites ERC-3643 ni de vaults, et ne gère pas les rôles CMTAT, les gels partiels, les documents ni les snapshots.
- **Python et TypeScript ne sont pas sur leurs registres.** Utilisez un clone jusqu'aux releases PyPI et npm ; cette page ne donne pas de commande d'installation par registre pour eux.
- **Erreurs des README.** Les extraits Go et TypeScript des README du dépôt contiennent de petites erreurs, à corriger dans la 0.1.1. Utilisez les quickstarts de cette page.
- **Modèles juridiques.** `legal/` contient trois brouillons pour discussion : un titre de registre suisse (art. 973d à 973i du Code des obligations), des conditions de jeton du Liechtenstein au titre du TVTG (approche du « token container »), et un plan d'engagement pour un opérateur au titre du régime pilote DLT de l'UE (règlement (UE) 2022/858). Ils n'ont pas été relus par un conseil, ne constituent pas un conseil juridique, et doivent être relus par un conseil qualifié de la juridiction concernée avant tout usage. Les utiliser, ou utiliser le kit, ne dit rien sur la conformité d'une émission donnée à une exigence légale. La QoreChain Association n'agit comme émetteur, teneur de registre, dépositaire, plateforme ou conseiller juridique pour aucun actif.
- **Pré-1.0.** Les protos proposés peuvent changer dans toute version mineure.

## Notes de sécurité {#security}

- **Non audité.** Les contrats n'ont fait l'objet d'aucune revue indépendante. Ne les utilisez pas pour détenir de la valeur réelle sans une telle revue.
- Les clés restent chez leurs propriétaires : le guard lit le statut des clés publiques sur la chaîne et ne manipule jamais de clé privée. Les clés du déployeur, du propriétaire et des agents sont des comptes EVM ordinaires avec des clés ML-DSA-87 enregistrées ; gardez les rôles d'émetteur, de propriétaire du guard et d'agent sur des comptes séparés et bien protégés.
- Le propriétaire du guard contrôle les exemptions. Une exemption rend une adresse éligible sans clé ; accordez-la aux contrats qui détiennent l'actif par conception, et surveillez les événements `ExemptionSet`.
- Les rôles d'agent peuvent contourner le contrôle de détenteur (transfert forcé, récupération). Traitez-les comme les rôles les plus sensibles du jeton.
- Le guard échoue en mode fermé et décode strictement la réponse du précompilé ; il ne considère jamais comme valide une clé sans preuve de possession.
- Le build de production de la console d'émetteur définit une Content-Security-Policy avec `connect-src 'none'` : la page n'effectue aucune requête réseau de son propre chef, et tout passe par le portefeuille.
- `MockChain` fait confiance aux champs de signataire des messages (il n'y a pas de signatures) ; ce n'est pas une frontière de sécurité.
- Les problèmes dans CMTAT, l'implémentation de référence ERC-3643, ONCHAINID ou OpenZeppelin doivent aussi être signalés à leurs mainteneurs.
- Signalez les vulnérabilités du kit en privé à security@qore.network.

## Pages liées {#related}

- [SDK QoreChain](/sdk/overview) : enregistrer une clé ML-DSA-87 et ouvrir une fenêtre d'autorisation EVM (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview) : signature hybride pour les transactions de la voie native qui enregistrent des clés et ouvrent des fenêtres.
- [Signature post-quantique](/developer-guide/post-quantum-signing) et [comptes et signature PQC](/sdk/concepts/accounts-pqc) : enregistrement de clé et signature hybride.
- [Développement EVM](/developer-guide/evm-development#evm-window) : la fenêtre d'autorisation EVM.
- [Précompilés EVM](/developer-guide/evm-precompiles) : `0x0A01` et `0x0A02`, actifs uniquement sur le testnet.
- [Chain developer kit](/developer-tools/chain-dev-sdk) : templates Foundry, Hardhat et viem et assistants de fenêtre (SDK 0.11.0, à venir).
- [Custody kit](/developer-tools/custody-kit) et [QoreScan](/developer-tools/qorescan) : kits voisins pour les dépositaires et pour les inventaires de cryptographie.
- [Packages développeur](/developer-tools/overview) : chaque package et son statut de registre.
- Standards amont : ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
