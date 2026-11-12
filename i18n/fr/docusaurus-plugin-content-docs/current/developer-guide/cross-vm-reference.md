---
slug: /developer-guide/cross-vm-reference
title: Référence des appels inter-VM (v3.2.8)
sidebar_label: Référence inter-VM
sidebar_position: 9
---

# Référence des appels inter-VM (v3.2.8)

Un appel inter-VM permet à du code exécuté sur une machine virtuelle de lancer un contrat sur une autre : un compte ou un contrat QoreChain Native qui appelle un contrat EVM, un compte qui appelle un contrat QoreChain Native (CosmWasm), un contrat Solidity qui appelle un contrat QoreChain Native, et ainsi de suite. Il y a deux façons d'en faire un. Un appel **synchrone** s'exécute dans votre propre transaction et rend la réponse aussitôt. Un appel **asynchrone** est placé dans une file d'attente et s'exécute dans un bloc ultérieur.

Cette page est la référence des champs, des coûts et des limites pour la version v3.2.8, avec un exemple détaillé pour chaque direction. Les concepts, le cycle de vie et le comportement des versions antérieures se trouvent dans [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) ; le pas-à-pas côté SDK se trouve dans le [guide inter-VM](/sdk/guides/cross-vm).

:::note Où la v3.2.8 est en service
Le testnet **`qorechain-diana`** exécute la **v3.2.8** depuis le 12 novembre 2026. Le mainnet **`qorechain-vladi`** ne l'a pas encore appliquée, et sur le mainnet `MsgCrossVMCall` est désactivé. Tout ce qui est marqué « v3.2.8 » ci-dessous décrit, pour l'instant, le comportement du testnet.
:::

:::caution Le message d'appel est-il disponible en ce moment ?
Sur le testnet, `MsgCrossVMCall` a été mis en pause par la mise à niveau. La proposition de gouvernance 37 a été adoptée et a levé la pause : l'appel est donc ouvert sur le testnet (vérifié le 12 novembre 2026 : la liste du coupe-circuit ne contient que `/cosmwasm.wasm.v1.MsgStoreCode`). Sur le mainnet, il reste désactivé. Deux éléments indiquent si l'appel est disponible à un instant donné : les paramètres du module (`enabled`) et la liste du coupe-circuit. Vérifiez les deux avant de construire quoi que ce soit dessus :

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

La route de la liste s'écrit `disable_list` en REST (l'orthographe `disabled_list` répond `501`). L'équivalent en ligne de commande sur un nœud est `qorechaind query circuit disabled-list`. Lorsque l'appel est en pause, une transaction qui le contient est refusée, et les appels en file restent en attente jusqu'à expiration, sauf si la pause est levée avant. Avant l'adoption de la proposition 37, la liste contenait `/qorechain.crossvm.v1.MsgCrossVMCall` ; ce n'est plus le cas sur le testnet. Voir [Testé sur le testnet](#tested) pour ce qui a été envoyé.
:::

## Pourquoi c'est important {#why}

- **Le coût est prévisible.** Un appel en file vers QoreChain Native affiche son prix d'avance : vous choisissez la quantité de travail de contrat qu'il peut utiliser et le facteur de congestion maximal que vous acceptez, l'argent est placé sous séquestre, et ce que l'appel n'utilise pas vous revient.
- **Un compte ne peut pas évincer les autres.** Un expéditeur peut avoir au plus 100 appels en file à la fois, de sorte que la file partagée reste utilisable.
- **Un appel qui échoue n'est jamais gratuit.** Un appel qui échoue paie quand même le travail qu'il a effectué, dans toutes les directions : intercepter l'échec et réessayer avec le même gas ne fonctionne donc pas.
- **Le côté EVM reste dans votre fenêtre.** Un appel vers l'EVM que vous n'avez pas signé vous-même, ainsi que le pont EVM à `0x0901`, ne sont admis que par une [fenêtre d'autorisation EVM](/developer-guide/evm-window-reference) ouverte.

## Appels synchrones et asynchrones {#sync-async}

| | Synchrone (par défaut) | Asynchrone (`async = true`) |
| --- | --- | --- |
| Quand il s'exécute | Dans votre transaction | À la fin d'un bloc ultérieur, depuis la file |
| Gas | Le gas propre de votre transaction | Un budget prépayé fixe (voir [Coût](#cost)) |
| Réponse | Renvoyée dans la réponse de la transaction, champ `data` | Non renvoyée ; lisez le message terminé par son id |
| Si la cible échoue | La transaction entière est annulée | Seul cet appel est enregistré comme `failed` ; votre transaction reste |
| Fonds | `funds` peut être joint pour une cible QoreChain Native | Idem ; un appel async avec des fonds vers une lane qui ne peut pas les porter est refusé à la soumission |
| Idéal pour | Tout ce qui a besoin du résultat tout de suite | Le travail « envoyer et oublier », et les appels dont vous voulez plafonner le gas |

Un message en file passe par `pending`, puis `executed`, `failed` ou `timed_out`. Il expire après `queue_timeout_blocks` (100 sur le testnet). La file s'exécute du plus ancien au plus récent, et le passage de fin de bloc exécute au plus 50 appels par bloc.

### Qui appelle qui, en sync ou en async {#who-calls-whom}

Le mode (l'un ou l'autre) qu'un appel peut utiliser dépend de qui l'envoie.

| Appelant | Cible | Synchrone | Asynchrone |
| --- | --- | --- | --- |
| Compte (signe la transaction) | EVM, QoreChain Native | Oui (par défaut) | Oui |
| Contrat QoreChain Native, envoyant `MsgCrossVMCall` en son propre nom | EVM | Oui (`async` à false, la valeur par défaut) | Oui |
| Contrat QoreChain Native, envoyant `MsgCrossVMCall` en son propre nom | QoreChain Native | Refusé (votre propre lane) | Refusé (votre propre lane) |
| Contrat appelé par le pont EVM à `0x0901` (en dessous du pont) | SVM | Oui | Non utilisé |
| Contrat appelé par le pont EVM à `0x0901` (en dessous du pont) | EVM | Non utilisé | Oui |

Un contrat QoreChain Native qui envoie `MsgCrossVMCall` en son propre nom peut appeler l'EVM de l'une ou l'autre façon. Le mode synchrone (`async` à false, la valeur par défaut) s'exécute avec le gas propre de la transaction, la réponse revient dans `MsgCrossVMCallResponse.data`, et un échec annule la transaction entière. Le mode asynchrone met l'appel en file. Les deux ont déjà été exécutés sur le testnet : l'appel synchrone à la hauteur 9 795 779 et l'appel asynchrone à la hauteur 9 795 783.

L'expression « sync vers le SVM, async vers l'EVM » ne s'applique qu'en dessous du pont `0x0901` : pour un contrat que le pont EVM a appelé, ce que ce contrat envoie peut aller de façon synchrone vers le SVM et de façon asynchrone vers l'EVM. Ce n'est pas une règle pour un contrat agissant en son propre nom, qui peut utiliser l'un ou l'autre mode vers l'EVM.

## Champs de MsgCrossVMCall {#fields}

URL de type `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Champ | Numéro | Signification |
| ----- | ------ | ------------- |
| `sender` | 1 | Votre adresse `qor1...`. Elle signe le message. |
| `source_vm` | 2 | Ignoré par la chaîne. La chaîne détermine elle-même l'origine de l'appel. Il est toujours envoyé pour que les anciens nœuds acceptent le message. |
| `target_vm` | 3 | `evm`, `cosmwasm` ou `svm`. Un appel vers votre propre lane est refusé. La lane SVM est ouverte sur le testnet depuis la proposition 37 et désactivée sur le mainnet ; voir [Lane SVM](/developer-guide/svm-lane-v328). Aucun appel vers le SVM n'a été exécuté pour cette page. |
| `target_contract` | 4 | Une adresse EVM (`0x` suivi de 40 chiffres hexadécimaux, pas une adresse de précompilé) ou une adresse de contrat `qor1...`. |
| `payload` | 5 | Les données d'appel : encodées en ABI pour l'EVM, le message d'exécution JSON en UTF-8 pour QoreChain Native. Au plus `max_message_size` octets (65 536). |
| `funds` | 6 | Les pièces à joindre (cibles QoreChain Native uniquement). |
| `async` | 7 | `true` met l'appel en file ; `false` (par défaut) l'exécute immédiatement. |
| `async_gas_limit` | 8 | v3.2.8, async vers QoreChain Native uniquement : les unités de gas de contrat avec lesquelles l'appel en file s'exécute. `0` ou non renseigné signifie 500 000. Autorisé de 250 000 jusqu'à ce que la file puisse exécuter en un bloc (1 875 000 avec le budget par défaut). |
| `async_max_factor` | 9 | v3.2.8, async vers QoreChain Native uniquement : le facteur de congestion maximal que vous paierez, en **millionièmes** : `1000000` vaut 1x et `4000000` vaut 4x. La plage valide va de 1 000 000 à 100 000 000 (de 1x à 100x) ; un simple multiple comme `4` est refusé avec le codespace `crossvm` code 2 avant toute exécution. `0` ou non renseigné signifie quatre fois le facteur à la soumission (4 000 000 millionièmes quand le facteur est de 1x), plafonné au maximum de la chaîne. Une valeur inférieure au facteur en vigueur est refusée à la soumission. |

En ligne de commande, les deux nouveaux champs sont `--async-gas-limit` (un nombre entier) et `--async-max-factor` (un décimal comme `2.5`, que la commande convertit pour vous en millionièmes). Dans un message brut, dans le SDK et dans les formes REST ou JSON, la valeur est toujours en millionièmes : 2,5x s'écrit `2500000`. Le SDK exporte `CROSSVM_ASYNC_FACTOR_ONE` (1 000 000) pour convertir un multiple en millionièmes, et `validateCrossVmAsyncGas` pour vérifier les deux valeurs avant l'envoi.

## Coût, séquestre et remboursements {#cost}

Pour un **appel async vers QoreChain Native** (v3.2.8) :

1. **Séquestre.** Le prépaiement est égal aux unités multipliées par le facteur multiplié par le prix du gas, et il est retenu, non dépensé. Avec les valeurs par défaut, cela donne 500 000 unités x 4 (4 000 000 en millionièmes) x 0,1 uqor = 200 000 uqor, soit **0,2 QOR**. Il passe de votre solde au compte `crossvm_async_escrow`. Vous avez besoin d'autant d'uqor disponibles : les pièces de vesting verrouillées, les fee grants et les frais payés dans d'autres jetons ne peuvent pas le financer, et un tel appel est refusé.
2. **Frais d'emplacement dans la file.** Chaque appel async paie aussi des frais d'emplacement, en gas, à la soumission : 500 000 gas dans une file vide, jusqu'à 2 000 000 gas dans une file pleine, en fonction de son remplissage. Au prix de 0,1 uqor par gas, cela représente de 0,05 QOR à 0,2 QOR.
3. **Règlement.** Lorsque l'appel se termine, le gas qu'il a utilisé, au facteur alors en vigueur, est prélevé sur le séquestre comme frais, et le reste vous revient. Un appel qui échoue paie ce qu'il a utilisé. Un appel qui expire, ou qui n'est jamais exécuté, récupère tout son séquestre, et ses frais d'emplacement tiennent lieu de frais de traitement. L'événement `crossvm_escrow_settled` porte les frais et le remboursement.
4. **Attente du facteur.** L'appel s'exécute tant que le facteur de congestion est inférieur ou égal à votre `async_max_factor`. Si le facteur est plus élevé, il attend, et expire s'il reste élevé. Avec la valeur par défaut (quatre fois le facteur à la soumission, 4 000 000 en millionièmes quand le facteur est de 1x), le facteur doit plus que quadrupler avant que l'appel n'attende.
5. **Limites de taille.** Le prépaiement ne peut pas dépasser 50 000 000 de gas. Au-delà, l'appel est refusé à la soumission : réessayez plus tard ou réduisez `async_gas_limit`.

Pour un **appel async vers l'EVM**, le budget prépayé est de 1 000 000 de gas, débité à la soumission. Pour un appel **synchrone**, le coût est le gas propre de la transaction. Les contrats QoreChain Native lourds qui chargent un code volumineux ont besoin d'un `async_gas_limit` et d'un `async_max_factor` plus élevés que les valeurs par défaut lors de leur premier appel dans un bloc.

### Les appels échoués sont facturés {#failed-charged}

Un appel inter-VM qui échoue paie quand même le travail qu'il a effectué. Un appel EVM qui est annulé (revert) ou qui manque de gas utilise le gas EVM qu'il a consommé, prélevé sur l'appelant, et un appel QoreChain Native passé par le pont `0x0901` qui échoue utilise le gas que le contrat a dépensé, prélevé sur le cadre EVM appelant. Un contrat qui veut survivre à un appelé coûteux qui échoue doit fixer une limite de gas sur le sous-appel plutôt que de réessayer avec le même gas restant.

## La file d'attente {#pending}

- **Au plus 100 appels en attente par expéditeur** (`max_pending_per_sender`). Un appel async supplémentaire est refusé avec `ErrQueueFull` (codespace `crossvm`, code 4) tant que l'un des vôtres n'a pas été exécuté ou n'a pas expiré. Les appels synchrones ne sont pas concernés.
- **La file entière contient au plus `max_queue_size`** appels (1 000).
- **La liste des appels en attente est paginée.** Chaque page contient au plus 100 messages, et chaque payload de la liste est tronqué à ses **1 024** premiers octets (`payload_hex`). Pour lire un payload complet, récupérez le message par son id.
- **La limite de page est bornée.** Une valeur `pagination.limit` de 0 ou supérieure à 100 est silencieusement ramenée à 100. Une requête avec `limit=101` répond `200` avec au plus 100 éléments, et non une erreur. Pour lire la suite, passez le `next_key` de la réponse et continuez jusqu'à ce qu'il soit vide.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

Vérifié sur le testnet le 12 novembre 2026 : la route des appels en attente a répondu `200` avec `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (file vide), et la route des messages a répondu `200` avec `{"message":null,"found":false}` pour un id inexistant. Les mêmes lectures avec la CLI de nœud Linux :

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note CLI de nœud
`qorechaind` est la CLI de nœud Linux. Il n'existe pas de binaire macOS empaqueté. Les appels REST fonctionnent depuis n'importe quelle machine.
:::

## Paramètres du module {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Réponse `200` le 12 novembre 2026 avec ces champs :

| Champ | Valeur lue | Signification |
| ----- | ---------- | ------------- |
| `enabled` | `true` | Interrupteur du module. Le message d'appel a sa propre entrée dans la liste du coupe-circuit. |
| `max_message_size` | `65536` | Plus grand payload, en octets. |
| `max_queue_size` | `1000` | Nombre maximal d'appels en file à la fois. |
| `queue_timeout_blocks` | `100` | Nombre de blocs avant qu'un appel non exécuté n'expire. |
| `bridge_allowed_targets` | trois entrées `cosmwasm:qor1...` | Les contrats QoreChain Native que le pont `0x0901` peut appeler. Vide, il garde le pont fermé. |
| `bridge_target_pins` | une entrée par cible : `target`, `code_id`, `history_len` | Le code que chaque cible autorisée doit toujours exécuter pour que le pont l'appelle. |
| `max_pending_per_sender` | `100` | Appels en file qu'un expéditeur peut détenir. |
| `max_cosmos_tx_gas` | `"50000000"` | Gas maximal qu'une transaction Native peut déclarer. |
| `record_retention_blocks` | `"100000"` | Durée de conservation de la trace d'un appel en file terminé. |
| `max_block_wasm_gas` | `"3000000"` | Exécution QoreChain Native qu'un bloc peut utiliser. |
| `max_tx_wasm_share_bps` | `5000` | Part de ce budget qu'une transaction peut utiliser. |
| `max_block_level_wasm_gas` | `"10000000"` | Budget du travail de contrat effectué en dehors des transactions. |
| `queue_wasm_reserve_bps` | `2500` | Part du budget du bloc réservée à la file. |
| `wasm_congestion_max_factor` | `20` | Valeur maximale que le facteur de congestion peut atteindre. |
| `wasm_congestion_target_bps` | `5000` | Part d'utilisation au-dessus de laquelle le facteur monte. |
| `wasm_congestion_factor_micro` | `"1000000"` | Le facteur en vigueur actuellement, en millionièmes (`1000000` vaut 1x). |
| `max_block_upload_bps` | `5000` | Part du budget que les téléversements de code peuvent utiliser. |
| `max_queue_timeouts_per_block` | `100` | Appels expirés par bloc. |

Utilisez `wasm_congestion_factor_micro` pour voir ce qu'un appel en file prépaiera en ce moment : unités x facteur x 0,1 uqor.

## Exemples par direction {#examples}

Tous les exemples signent avec la clé post-quantique du compte, comme toute transaction Native ; voir [Signature post-quantique](/developer-guide/post-quantum-signing). Seuls les exemples de compte natif vers QoreChain Native ont été envoyés pour cette page (voir [Testé sur le testnet](#tested)) ; les exemples EVM n'ont pas été exécutés et sont marqués UNTESTED là où ils apparaissent.

### Compte natif vers contrat EVM {#native-to-evm}

**UNTESTED :** cette direction n'a pas été exécutée pour cette page.

La cible est un contrat EVM ; le payload est une donnée d'appel encodée en ABI. L'appel s'exécute sous votre propre adresse `0x`, de sorte que le côté EVM vous voit comme `msg.sender`. En ligne de commande (CLI de nœud Linux), construisez la transaction puis ajoutez la signature post-quantique :

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript avec le SDK publié (0.13.0). L'assistant encode l'appel en ABI avec viem :

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust et Java prennent le payload sous forme d'octets bruts pour l'EVM (l'encodage ABI de haut niveau n'existe qu'en TypeScript). Python :

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go :

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust :

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java :

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

Si l'expéditeur n'est pas le compte qui a signé la transaction, par exemple un bénéficiaire authz, le côté EVM s'exécute sous la fenêtre du mandant ; voir [Authz et fenêtres](#authz).

### Compte natif vers contrat QoreChain Native {#native-to-wasm}

Le payload est le message d'exécution JSON du contrat. Un appel synchrone renvoie la réponse du contrat dans `data` :

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

En file, avec une allocation de gas explicite et un plafond de facteur (v3.2.8). Le séquestre est de 800 000 x 2,5 x 0,1 uqor = 200 000 uqor (0,2 QOR) si le facteur est de 1 (la commande prend `2.5` et envoie 2 500 000 millionièmes) :

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript avec le SDK 0.13.0 (synchrone, et en file avec l'allocation par défaut) :

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) et Java (`o.async = true`) mettent en file de la même façon :

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note Prise en charge des deux nouveaux champs dans le SDK
Le SDK 0.13.0 n'a pas d'option pour `async_gas_limit` ni `async_max_factor` : ses appels en file utilisent donc les valeurs par défaut. Le SDK 0.14.0 ajoute `asyncGasLimit` et `asyncMaxFactor` à l'appel inter-VM, exporte `CROSSVM_ASYNC_FACTOR_ONE` (1 000 000) et `validateCrossVmAsyncGas`, et son assistant `buildCall` met par défaut `sourceVm` à `evm` pour un compte natif. La chaîne ignore `source_vm` et a enregistré le message avec `source_vm` à native.
:::

### Contrat EVM vers contrat QoreChain Native via 0x0901 {#evm-to-wasm}

**UNTESTED :** cette direction n'a pas été exécutée pour cette page.

Un contrat Solidity appelle le précompilé de pont à `0x0000000000000000000000000000000000000901`. L'appel s'exécute dans la transaction EVM, avec le compte ou le contrat appelant (sous son adresse `qor1`) comme expéditeur QoreChain Native, et un revert à n'importe quel endroit annule les deux côtés.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

Règles du pont :

- `CALL` simple uniquement, sans valeur, sélecteur `0x3c11078c`. `STATICCALL`, `DELEGATECALL` et une VM cible `0` ou `2` provoquent un revert.
- La cible doit figurer dans `bridge_allowed_targets` (et, depuis la v3.2.8, exécuter toujours le code auquel elle est épinglée). Lisez les deux avec la route des paramètres ci-dessus.
- **L'appelant a besoin d'une fenêtre qui liste `0x0901`.** Tout compte qui envoie une transaction vers le pont doit avoir une [fenêtre d'autorisation EVM](/developer-guide/evm-window-reference) ouverte dont les `allowed_targets` incluent `0x0000000000000000000000000000000000000901` (et le contrat qui l'appelle, si vous passez par un contrat). Ouvrez-en une comme ceci, avec une borne adaptée à votre session :

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- Un appel qui échoue est annulé avec une raison `Error(string)` et est facturé pour le gas que le contrat a utilisé.

L'assistant `@qorechain/rdk` `encodeCrossVmCalldata({ contract, msg })` construit les mêmes données d'appel en TypeScript (voir [Multi-VM](/rollups/multi-vm)). Avec le SDK publié, l'adresse du précompilé est `PRECOMPILE_ADDRESSES.crossVmBridge` de `@qorechain/evm`.

### Contrat QoreChain Native vers contrat EVM {#wasm-to-evm}

**UNTESTED** par l'auteur de la documentation. L'équipe de la chaîne indique que les deux modes ont été exécutés sur le testnet avant la v3.2.8.

Un contrat QoreChain Native effectue l'appel en envoyant un `MsgCrossVMCall` comme message de chaîne, avec lui-même comme expéditeur. Le message a les mêmes champs que plus haut ; la chaîne traite le contrat comme un appelant CosmWasm quelle que soit la valeur de `source_vm`. Avec `async` à false (la valeur par défaut), l'appel est synchrone : il s'exécute avec le gas de la transaction, la réponse se trouve dans `MsgCrossVMCallResponse.data`, et un échec annule la transaction entière. Avec `async` à true, il est mis en file. Voir [Qui appelle qui](#who-calls-whom). L'exemple ci-dessous met l'appel en file :

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

À savoir avant de vous y fier :

- L'EVM voit le contrat comme les **20 derniers octets** de son adresse de 32 octets. Assurez-vous que le contrat EVM ne dépend pas du fait que `msg.sender` soit un compte ordinaire.
- Depuis la v3.2.8, un appel qui laisserait cet appelant avec plus de QOR natif qu'au départ échoue (et est facturé). Les contrats EVM destinés à cette direction doivent payer un jeton ERC-20, ou un compte de 20 octets nommé dans l'appel, et non du QOR natif à `msg.sender`.
- Un contrat agissant en son propre nom n'est pas borné par une fenêtre EVM. Un appel envoyé sous un octroi authz d'un compte l'est ; voir ci-dessous.
- En dessous du pont `0x0901`, un `MsgCrossVMCall` n'est accepté que d'un contrat agissant en son propre nom, et un `MsgExec` authz ne peut pas en porter un pour un autre compte.

Les deux modes ont déjà été exécutés sur le testnet (synchrone à la hauteur 9 795 779, asynchrone à la hauteur 9 795 783). Le code Rust côté contrat qui envoie ce message n'a pas été exécuté pour cette page.

## Authz et fenêtres {#authz}

Un appel inter-VM vers l'EVM que l'expéditeur n'a pas envoyé lui-même s'exécute sous la fenêtre EVM **de l'expéditeur**, exactement comme si le propre code de l'expéditeur agissait dans la transaction de quelqu'un d'autre. Concrètement, il s'agit d'un octroi authz qui est utilisé. Lorsque quelqu'un utilise votre octroi de `MsgCrossVMCall` pour appeler l'EVM :

- L'appel n'est admis que si **votre** fenêtre est ouverte et que sa portée admet la cible (`allowed_targets`, `native_only`, les précompilés qui déplacent de la valeur).
- Chaque appel réussi consomme une des transactions de la fenêtre, et la valeur native que vous y perdez est comptée dans la valeur de la fenêtre.
- Sans clé post-quantique utilisable et sans fenêtre active, l'appel est refusé, à la soumission pour un appel async et de nouveau lorsque la file l'exécute.
- Un contrat ou une politique de groupe ne détient aucune fenêtre : un octroi authz émis par l'un d'eux ne peut donc pas porter un appel vers l'EVM.
- Les appels vers QoreChain Native ne sont pas bornés par la fenêtre. Un octroi authz générique de `MsgCrossVMCall` donne au bénéficiaire votre identité sur la lane QoreChain Native : ne l'accordez qu'à des parties à qui vous confiez le compte.

La conversion d'un jeton ERC-20 sous un octroi authz (`MsgConvertERC20`) est admise de la même façon par la fenêtre de l'expéditeur.

## Limites et erreurs {#limits}

| Situation | Résultat |
| --------- | -------- |
| Payload plus grand que `max_message_size` | Refusé, code 8 (`message payload exceeds max size`) |
| Adresse cible de forme inadaptée à sa lane | Refusé à la soumission, code 5 (`invalid target contract address`) |
| La cible est une adresse de précompilé (`0x...0000` à `0x...ffff`) | Refusé à la soumission, code 5 |
| VM cible identique à votre propre lane | Refusé |
| VM inconnue ou non prise en charge | Code 7 (`unsupported VM type`) |
| Plus de 100 appels en file pour un même expéditeur | `ErrQueueFull`, code 4, jusqu'à ce que l'un se termine ou expire |
| La file contient `max_queue_size` appels | `ErrQueueFull`, code 4 |
| `async_max_factor` hors de 1 000 000 à 100 000 000 (millionièmes), par exemple `6` au lieu de `6000000` | Refusé avant toute exécution, codespace `crossvm` code 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` inférieur au facteur en vigueur | Refusé à la soumission |
| `async_gas_limit` inférieur à 250 000 ou supérieur à la place disponible par bloc dans la file | Refusé à la soumission |
| Prépaiement supérieur à 50 000 000 de gas | Refusé à la soumission ; réessayez plus tard ou réduisez la limite |
| Uqor disponibles inférieurs au séquestre | Refusé (les pièces verrouillées par vesting, les fee grants et les frais dans d'autres jetons ne peuvent pas le financer) |
| Facteur de congestion supérieur à `async_max_factor` quand l'appel arrive | L'appel attend ; il expire après `queue_timeout_blocks` |
| L'appel expire ou n'est jamais exécuté | Séquestre intégralement remboursé, frais d'emplacement conservés comme frais de traitement |
| La cible échoue | Enregistrement `failed` (async) ou transaction annulée (sync) ; le gas utilisé est facturé |
| QOR natif rendu depuis l'EVM à un contrat appelant (expéditeur de 32 octets) | L'appel échoue et est facturé |
| Appel à `0x0901` sans fenêtre qui le liste | Refusé |
| Cible `0x0901` absente de `bridge_allowed_targets`, ou code modifié depuis son épinglage | Revert : `cross-VM bridge call refused: target ... is not allowlisted` pour une cible non listée |
| `MsgCrossVMCall` dans la liste du coupe-circuit | Transaction refusée ; les appels en file restent en attente |
| Un appel vers le SVM | La lane est ouverte sur le testnet depuis la proposition 37 et désactivée sur le mainnet ; aucun appel vers le SVM n'a été exécuté pour cette page (UNTESTED) |

Une erreur enregistrée sur un appel en file échoué contient du texte brut, sans annotation de fichier source.

## Événements {#events}

| Événement | Attributs | Signification |
| --------- | --------- | ------------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Un appel a été soumis |
| `crossvm_response` | `message_id`, `status`, et `error` pour un appel échoué | Un appel en file s'est terminé |
| `crossvm_timeout` | `message_id` | Un appel en file a expiré |
| `crossvm_escrow_settled` | frais et remboursement | Le séquestre d'un appel async vers QoreChain Native a été réglé |

## Testé sur le testnet {#tested}

Exécuté sur `qorechain-diana` le 12 novembre 2026 (version v3.2.8) après l'adoption de la proposition 37, avec le SDK 0.14.0 (`createCrossVMClient(...).buildCall`, signature hybride, compte eth-native), contre le contrat cw20 stocké par la gouvernance et instancié à partir du code 859. Le payload était `{"transfer":{"recipient":<self>,"amount":"1"}}`.

| Étape | Résultat |
| ----- | -------- |
| Lecture de la liste du coupe-circuit | Uniquement `/cosmwasm.wasm.v1.MsgStoreCode` ; le message d'appel n'est pas en pause |
| Appel synchrone natif vers QoreChain Native | Simulé à 601 178 gas, envoyé avec le simulé x 1,3, code 0, 595 049 gas utilisés |
| Appel asynchrone natif vers QoreChain Native, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | Simulé à 751 287 gas ; code 0 ; 751 277 gas utilisés |
| Débits de l'appel async (événements de la transaction) | Les frais (146 502 uqor, la limite multipliée par 0,15) et 680 417 uqor envoyés à un compte de module (le séquestre et le paiement de l'emplacement dans la file tels qu'observés ; non détaillés ici) |
| Événement de l'appel async | `crossvm_request` avec `source_vm` native, `target_vm` cosmwasm |
| `GET /qorechain/crossvm/v1/message/{id}` | Statut `executed`, `created_height` égal à `executed_height` (l'appel en file s'est exécuté dans le même bloc), erreur vide |
| `GET /qorechain/crossvm/v1/pending` ensuite | Liste vide |
| `async_max_factor` à `6` | Refusé avant toute exécution : codespace `crossvm` code 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

Non exécutés pour cette page (UNTESTED) : EVM vers QoreChain Native via `0x0901`, et QoreChain Native vers EVM. L'équipe de la chaîne indique que les chemins synchrone et asynchrone de QoreChain Native vers l'EVM ont été exécutés sur le testnet aux hauteurs 9 795 779 et 9 795 783, avant la v3.2.8.

## Pages liées {#related}

- [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour les concepts, le cycle de vie et les notes sur la liste d'autorisation du testnet.
- [Référence de la fenêtre d'autorisation EVM](/developer-guide/evm-window-reference) pour ouvrir et délimiter la fenêtre dont le pont a besoin.
- [Précompilés EVM](/developer-guide/evm-precompiles) pour le tableau des précompilés et l'état par réseau.
- [Développement QoreChain Native](/developer-guide/cosmwasm-development) et [Gas et limites de QoreChain Native](/developer-guide/cosmwasm-gas-and-limits) pour le gas des contrats et le budget du bloc.
- [Signature post-quantique](/developer-guide/post-quantum-signing) pour signer les transactions ci-dessus.
- [Guide inter-VM (SDK)](/sdk/guides/cross-vm) et [rollups Multi-VM](/rollups/multi-vm) pour les assistants du SDK et du RDK.
