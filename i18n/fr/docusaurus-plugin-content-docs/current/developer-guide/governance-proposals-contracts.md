---
slug: /developer-guide/governance-proposals-contracts
title: "Propositions de gouvernance pour les contrats : envoyer du code Native et ouvrir l'accès inter-VM (testnet)"
sidebar_label: Propositions de contrats
sidebar_position: 12
---

# Propositions de gouvernance pour les contrats : envoyer du code Native et ouvrir l'accès inter-VM (testnet)

Sur le testnet QoreChain `qorechain-diana`, personne n'envoie un contrat QoreChain Native (CosmWasm) avec une transaction ordinaire, et aucun contrat EVM ne peut appeler un contrat Native par le pont tant que la gouvernance ne l'a pas décidé. Les deux passent par une **proposition de gouvernance** : la proposition stocke votre code compilé, crée éventuellement le contrat, et l'ajoute à la liste d'autorisation inter-VM, **épinglé au code exact** que vous avez envoyé. Cette page montre à un développeur comment préparer, soumettre, suivre et vérifier une telle proposition, puis comment appeler le contrat approuvé depuis Solidity.

Cette page a été vérifiée sur le testnet réel le **22 novembre 2026** (chaîne `qorechain-diana`, chaîne v3.2.9 depuis le 20 novembre). Les exemples on-chain sont de vraies propositions : 40 (le contrat `qday-receipts`, code 865), 23, 27 et 34 (code stocké), 19 et 20 (règles d'instanciation), 32 (la liste d'autorisation). Les lignes de commande `qorechaind` ont été écrites d'après la référence CLI existante et le JSON des propositions sur la chaîne ; le binaire lui-même n'a pas été exécuté pour cette page : exécutez une fois `qorechaind tx gov submit-proposal --help` sur votre machine si une option diffère.

:::note Testnet uniquement
Ces étapes décrivent le testnet. Le mainnet n'a pas le pont inter-VM ouvert, et l'envoi de code y est aussi réservé à la gouvernance. Le QOR de test n'a aucune valeur ; n'utilisez que des comptes de test.
:::

## Pourquoi cela passe par la gouvernance {#why}

* **L'envoi est fermé aux comptes.** `code_upload_access` vaut `Nobody` et `MsgStoreCode` figure dans la liste du coupe-circuit. Une proposition de gouvernance ouvre le coupe-circuit, stocke le code avec le compte de gouvernance, puis le referme dans la même proposition : la porte n'est donc jamais laissée ouverte entre les votes.
* **L'instanciation est ouverte.** `instantiate_default_permission` vaut `Everybody` depuis la proposition 19 : une fois votre code stocké par la gouvernance, n'importe qui (vous compris) peut créer des contrats à partir de lui, sauf si le code stocké porte une permission plus stricte.
* **Le pont n'atteint que les contrats approuvés.** Le pont `0x0901` ne peut appeler que les cibles de `bridge_allowed_targets`. Chaque cible est épinglée à un identifiant de code et à la longueur de son historique de code : le contrat ne peut donc pas être migré vers un autre code en conservant son approbation.
* **C'est atomique.** Les messages d'une proposition s'exécutent ensemble. Si l'un échoue (par exemple un code que la chaîne refuse), aucun ne s'applique, et le coupe-circuit n'est pas laissé ouvert.

## Ce qu'il vous faut {#needs}

| Élément | Comment l'obtenir |
| --- | --- |
| Le binaire `qorechaind` (Linux) | La version publiée sur [download.qore.host](https://download.qore.host). Un binaire issu de l'arbre source public ne peut pas produire la signature hybride exigée par la chaîne. |
| Un compte testnet avec une clé post-quantique enregistrée | Voir [Signature hybride](/cli-reference/transaction-commands#hybrid-signing). |
| Du QOR de test pour le dépôt et les frais | Le faucet du testnet. Une proposition ordinaire exige 10 QOR, une proposition accélérée 50 QOR (tableau ci-dessous). |
| Docker, pour construire le contrat de la même façon que tout le monde | [Docker](https://docs.docker.com/get-docker/). |

## Étape 1 : construire le contrat et noter son empreinte {#build}

Construisez avec l'optimiseur CosmWasm afin que chacun puisse reconstruire votre source et obtenir les mêmes octets. Le contrat de l'Atelier 3 a été construit avec l'image arm64 sur Apple Silicon (une machine x86 utilise l'image `optimizer` simple ; les deux donnent des empreintes différentes : dites donc laquelle vous avez utilisée dans le résumé de la proposition) :

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Vous devriez voir une ligne par contrat, avec une empreinte hexadécimale de 64 caractères et le nom du fichier, par exemple `6ebfc32f...5c43c  qday_receipts.wasm`. Cette empreinte est le **SHA-256 du fichier wasm non compressé**, et c'est le `data_hash` que la chaîne affichera pour votre code. Copiez-la ; elle va dans le résumé de la proposition pour que les votants puissent la vérifier.

Avant de dépenser un dépôt, vérifiez le code par rapport aux limites de [Gas et limites d'envoi](/developer-guide/cosmwasm-development#gas-and-limits) : au plus 4,096 fonctions, au plus 32 MiB compilés, aucune instruction à virgule flottante.

## Étape 2 : encoder le code pour la proposition {#encode}

La proposition transporte le wasm dans le JSON en base64. Compressez-le d'abord (la chaîne accepte gzip, ce qu'a utilisé la proposition 40 : son code commence par `H4sI`) :

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

Vous devriez voir une taille en octets. Le code `qday-receipts` fait environ 99,000 caractères en base64 de gzip. Gardez-le dans un fichier, car il est trop long pour être collé dans une commande.

## Étape 3 : écrire la proposition {#write}

Une proposition est un fichier JSON avec `messages`, `metadata`, `deposit`, `title`, `summary` et `expedited`. L'`authority` et le `sender` de chaque message ci-dessous sont le **compte du module de gouvernance**. Lisez-le au lieu de le copier depuis cette page :

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

Vous devriez voir le compte avec `"name":"gov"` ; son `address` commence par `qor1`. Appelez-le `<GOV_ADDRESS>` ci-dessous. Le 22 novembre 2026, il valait `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### Proposition A : stocker le code et créer le contrat {#proposal-a}

C'est la forme de la proposition 40 sans son message de liste d'autorisation. L'ordre compte : ouvrir le coupe-circuit, stocker, refermer le coupe-circuit, puis instancier.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

Comment remplir les espaces réservés :

| Espace réservé | Comment l'obtenir |
| --- | --- |
| `<NEXT_CODE_ID>` | Le dernier identifiant de code plus un. Lisez le dernier avec `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. Le 22 novembre 2026, le dernier était 865, donc le suivant était 866. Si la proposition de quelqu'un d'autre stocke du code avant la vôtre, la vôtre reçoit un identifiant plus tardif et le message d'instanciation échoue, ce qui annule toute la proposition (vous ne perdez que l'attente). |
| `<BASE64_SALT>` | Un court texte quelconque, encodé en base64 : `printf 'my-contract-v1' \| base64`. Il rend l'adresse du contrat prévisible. La proposition 40 a utilisé le sel `qday-receipts-w3`. |
| `msg` | Le JSON qu'attend l'`instantiate` de votre contrat. `{}` pour un contrat sans champs. |
| `admin` | Une chaîne vide signifie pas d'admin : personne ne peut migrer le contrat. Préférez cela pour un contrat que le pont appellera (voir [Épingles](#pins)). |
| `instantiate_permission` | `Everybody`, ou `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` pour restreindre qui peut instancier (la proposition 34 l'a fait pour un contrat de test). |

Vous n'avez pas à instancier dans la proposition. Supprimez le dernier message pour ne stocker que le code, et instanciez plus tard avec une transaction ordinaire (`tx wasm instantiate`, voir [Cycle de vie d'un contrat](/developer-guide/cosmwasm-development)). Les propositions 23 et 27 ont stocké du code de cette façon.

### Proposition B : placer le contrat dans la liste d'autorisation inter-VM {#proposal-b}

Une fois la proposition A adoptée, trouvez l'adresse du contrat et lisez les paramètres inter-VM en vigueur :

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Vous devriez voir l'adresse `qor1...` de votre contrat, un historique avec **une** entrée (`INIT`, votre identifiant de code) et le jeu de paramètres. `MsgUpdateParams` du module inter-VM **remplace tout le jeu de paramètres** : copiez donc chaque champ de la réponse en vigueur et ne changez que deux choses : ajoutez votre cible à `bridge_allowed_targets` et ajoutez son épingle à `bridge_target_pins`.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

Les nombres ci-dessus sont les valeurs lues le 22 novembre 2026 ; utilisez ceux que vous lisez en direct, pas ceux-ci. La proposition 40 a omis `wasm_congestion_factor_micro`, un champ que la réponse en vigueur montre aussi ; suivez la réponse en vigueur et le modèle de la proposition 40, et comparez le résultat avec le tableau de la [Référence inter-VM](/developer-guide/cross-vm-reference#params) après le vote.

### Épingles : ce que signifient `code_id` et `history_len` {#pins}

| Champ | Signification |
| --- | --- |
| `target` | `cosmwasm:` suivi de l'adresse du contrat, écrit exactement comme dans `bridge_allowed_targets`. |
| `code_id` | Le code que le contrat doit exécuter pour que le pont l'appelle. |
| `history_len` | Le nombre d'entrées de l'historique de code du contrat au moment où vous l'épinglez. Une instance neuve en a 1. Un contrat migré une fois en a 2 (la liste d'autorisation du testnet compte un tel contrat). Toute migration ultérieure change la longueur : l'épingle ne correspond alors plus et le pont refuse l'appel. |

Un contrat autorisé dont l'admin n'est pas la gouvernance doit être épinglé, car cet admin pourrait le migrer. La conception sûre la plus simple est celle de la proposition 40 : pas d'admin, et une épingle.

### Tout faire dans une seule proposition {#one-proposal}

La proposition 40 a tout fait en une seule : elle a stocké le code, l'a instancié avec un sel, et a épinglé l'adresse que ce sel produit. Cela exige de connaître à l'avance l'identifiant de code suivant et la future adresse du contrat : c'est donc facile à rater. Deux propositions coûtent un vote de plus et quelques heures ; préférez-les sauf si vous avez déjà dérivé l'adresse.

## Étape 4 : dépôt, période de vote et seuils {#params}

Lisez les règles en vigueur avant de soumettre :

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Règle | Proposition ordinaire | Proposition accélérée (`"expedited": true`) |
| --- | --- | --- |
| Dépôt minimal | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Période de dépôt (pour atteindre le minimum) | 172,800 s (2 jours) | 172,800 s (2 jours) |
| Période de vote | 14,400 s (4 heures) | 3,600 s (1 heure) |
| Quorum | 33.4 % du stake lié | 33.4 % du stake lié |
| Seuil de oui | 50 % des votes exprimés | 66.7 % des votes exprimés |
| Seuil de veto | 33.4 % | 33.4 % |
| Dépôt initial minimal | aucun | aucun |

Lu le 22 novembre 2026. Aussi dans la même réponse : un vote « no with veto » au-dessus du seuil brûle le dépôt (`burn_vote_veto` vaut `true`), une proposition qui n'atteint pas le quorum ne le brûle pas, et une proposition accélérée qui échoue à son décompte continue comme proposition ordinaire avec les votes déjà exprimés. Toutes les propositions de contrats soumises à ce jour par l'équipe du testnet étaient accélérées ; la proposition d'un développeur devrait normalement rester ordinaire (le dépôt de 10 QOR et le vote de quatre heures se planifient plus facilement).

## Étape 5 : soumettre {#submit}

Toute transaction de la lane Cosmos doit porter la signature hybride : vous construisez donc d'abord la transaction, puis vous la signez avec votre clé post-quantique. La proposition est volumineuse (le code est dedans) : prévoyez donc de la marge de gas : le plancher de frais est de 0.1 uqor par unité de gas, et un octet de transaction coûte 10 gas.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Fixez `--gas` et `--fees` à partir d'un essai à blanc : lancez d'abord `tx pqc cosign` avec `--dry-run` (il affiche une estimation de gas et n'envoie rien), puis utilisez l'estimation plus 30 % comme `<GAS>` et des frais d'au moins `<GAS>` fois 0,1 uqor comme `<FEES>`. Un simple transfert demande environ 300 000 à 400 000 de gas ; un déploiement ou une proposition qui porte du code en demande beaucoup plus.

`--generate-only` écrit la transaction non signée. `tx pqc cosign` ajoute les deux signatures et la diffuse ; contexte dans [Signature hybride](/cli-reference/transaction-commands#hybrid-signing) et les [commandes gov](/cli-reference/transaction-commands#submit-proposal). Vous devriez voir un hash de transaction et le code 0. Si vous voyez une erreur de manque de gas, augmentez `--gas` et les `--fees` correspondants (les frais doivent valoir au moins le gas fois 0.1 uqor).

Trouvez l'identifiant de votre proposition, qui est aussi le nombre dans les événements de la transaction :

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

Vous devriez voir votre titre et le statut `PROPOSAL_STATUS_VOTING_PERIOD` (le dépôt que vous avez joint a atteint le minimum). Avec un dépôt plus petit, le statut est `PROPOSAL_STATUS_DEPOSIT_PERIOD` ; n'importe qui peut le compléter :

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Étape 6 : voter {#vote}

Tout staker peut voter avec le stake qu'il détient. Un seul portefeuille de développeur n'atteindra pas le quorum de 33.4 % : parlez donc de votre proposition aux validateurs et aux délégateurs du testnet (le résumé de la proposition est ce qu'ils lisent) et demandez-leur de voter. Un vote est une transaction à signature hybride comme les autres :

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Les options sont `yes`, `no`, `abstain` et `no_with_veto` (voir [Gouvernance](/user-guide/governance)). Surveillez le décompte et l'horloge :

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

Quand le vote se termine, le statut devient `PROPOSAL_STATUS_PASSED` (les messages se sont exécutés), `PROPOSAL_STATUS_REJECTED` ou `PROPOSAL_STATUS_FAILED`. **Failed** signifie que le vote a été adopté mais qu'un message n'a pas pu s'exécuter, et alors aucun des messages ne s'est appliqué ; `failed_reason` en donne la raison. La proposition 40, par exemple, a montré `PASSED`, une heure après sa soumission.

## Étape 7 : vérifier le code sur la chaîne {#verify}

Comparez le code que la chaîne détient avec l'empreinte que vous avez construite. La chaîne rapporte `data_hash` en majuscules ; `sha256sum` affiche des minuscules.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

Vous devriez voir les mêmes 64 caractères sur les deux lignes. Pour une vérification plus forte, hachez les octets que la chaîne détient réellement :

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

Cela a affiché `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` pour le code 865, la même empreinte que la construction par l'optimiseur de la source de l'Atelier 3. Vérifiez ensuite le contrat et, après la proposition B, la liste d'autorisation :

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

Vous devriez voir `code_id` égal au vôtre et `admin` vide dans la première réponse, et votre cible `cosmwasm:qor1...` avec son épingle (`code_id`, `history_len` valant `"1"`) dans la seconde. Le 22 novembre 2026, la liste contenait quatre cibles ; la quatrième était `qday-receipts` à `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`, épinglée au code 865.

## Étape 8 : l'appeler depuis un contrat EVM {#call}

L'EVM appelle le pont à `0x0000000000000000000000000000000000000901` avec `executeCrossVMCall(uint8,string,bytes)` : VM cible `1` (Native), l'adresse de votre contrat sous forme de chaîne, et le message JSON en octets. Le côté Native voit comme expéditeur le propre compte `qor1...` du contrat EVM appelant, et une annulation d'un côté ou de l'autre annule les deux.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

Deux conditions s'appliquent, toutes deux expliquées dans la [Référence inter-VM](/developer-guide/cross-vm-reference#evm-to-wasm) : la cible doit figurer dans la liste d'autorisation (et exécuter toujours son code épinglé), et le compte qui envoie la transaction a besoin d'une [fenêtre d'autorisation EVM](/developer-guide/evm-window-reference) ouverte dont `allowed_targets` liste `0x...0901`. Pour un exemple complet et testé avec une boutique Solidity et le contrat `qday-receipts`, suivez l'[Atelier 3](/build-before-qday/workshop-3#part-2).

## Dépannage {#troubleshooting}

| Ce que vous voyez | Cause probable et correction |
| --- | --- |
| `tx wasm store` échoue ou n'est jamais inclus | Attendu. Les comptes ne peuvent pas envoyer de code sur le testnet ; le coupe-circuit et `code_upload_access` le bloquent tous deux. Utilisez une proposition. |
| Le statut de la proposition est `PROPOSAL_STATUS_FAILED` | Le vote a été adopté mais un message a échoué : rien ne s'est appliqué. Lisez `failed_reason` dans `GET /cosmos/gov/v1/proposals/<id>`. Un mauvais `code_id` dans le message d'instanciation en est la cause courante. |
| `PROPOSAL_STATUS_REJECTED` | Pas assez de votes oui ou pas de quorum. Soumettez de nouveau avec un résumé plus clair, ou demandez aux validateurs de voter. |
| Le statut reste `PROPOSAL_STATUS_DEPOSIT_PERIOD` | Le dépôt total est inférieur au minimum (10 QOR ordinaire, 50 QOR accélérée). Ajoutez-en avec `tx gov deposit` dans les 2 jours. |
| La soumission échoue avec le code 20 dans l'espace `pqc` | La transaction ne portait pas de signature hybride. Utilisez `--generate-only` et `tx pqc cosign`. |
| La soumission échoue par manque de gas | La proposition est volumineuse. Augmentez `--gas` et gardez des frais d'au moins le gas fois 0.1 uqor. |
| L'empreinte diffère de `data_hash` | Vous avez construit sur un autre type de machine ou une autre version de l'optimiseur. Reconstruisez avec l'image nommée dans le résumé de la proposition (les images arm64 et x86 donnent des octets différents). |
| L'appel EVM est annulé avec `cross-VM bridge call refused: target ... is not allowlisted` | Le contrat n'est pas dans `bridge_allowed_targets`, ou son code a changé depuis qu'il a été épinglé. Comparez les paramètres en vigueur avec votre épingle. |
| L'appel EVM est refusé avant d'atteindre le pont | Aucune fenêtre EVM ouverte ne liste `0x0901`. Ouvrez-en une d'abord. |
| `MsgCrossVMCall` est refusé | L'appel est peut-être en pause dans la liste du coupe-circuit. Lisez `GET /cosmos/circuit/v1/disable_list`. |
| La proposition B échoue | Le jeu de paramètres était incomplet ou une épingle est fausse. Vérifiez que chaque champ de la réponse en vigueur est présent et que `history_len` égale le nombre d'entrées de l'historique. |

## Pages connexes {#related}

* [Gouvernance](/user-guide/governance) pour le vote, les dépôts et les types de propositions.
* [Développement QoreChain Native](/developer-guide/cosmwasm-development) pour le cycle de vie des contrats et les requêtes.
* [Commandes de transaction](/cli-reference/transaction-commands#submit-proposal) pour les options exactes de `gov` et `pqc cosign`.
* [Référence inter-VM](/developer-guide/cross-vm-reference) pour les paramètres, la file et les exemples d'appel.
* [Atelier 3](/build-before-qday/workshop-3) pour un exemple inter-VM détaillé.
