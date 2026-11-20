---
slug: /build-before-qday/workshop-3
title: "Atelier 3 : applications chiffrées et cross-VM"
sidebar_label: "Atelier 3"
sidebar_position: 4
date: 2026-11-20
---

# Atelier 3 : applications chiffrées et cross-VM

L'atelier 2 a protégé de l'argent avec une clé post-quantique. L'atelier 3 fait deux choses nouvelles avec la même chaîne. D'abord, vous **chiffrez un message pour une adresse QoreChain**, de sorte que seul le propriétaire de cette adresse puisse le lire, avec un chiffrement post-quantique. Ensuite, une transaction sur l'**EVM** écrit dans un contrat sur **QoreChain Native**, et les deux côtés changent ensemble ou pas du tout.

Vous n'avez pas besoin d'être cryptographe. Chaque commande ci-dessous dit ce qu'elle fait et ce que vous devez voir. Les deux applications d'exemple sont publiques : [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), dossier `workshop-3`. Les deux fonctionnent uniquement sur le testnet QoreChain `qorechain-diana`. Les QOR de test n'ont aucune valeur.

**Durée :** environ 30 minutes pour QoreSeal, 40 pour le paiement cross-VM. Les deux parties sont indépendantes, et chacune a besoin de ses propres comptes de test.

## Ce que nous construisons {#what-we-built}

| Partie | Application | Ce qu'elle montre |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Chiffrer un message pour une adresse `qor1...` avec ML-KEM-1024, l'ouvrir, voir qu'un tiers ne peut pas le lire, voir qu'une altération est détectée, et renouveler une clé sans perdre les anciens messages. |
| 2 | **CrossVmCheckout** (Solidity et Rust) | Un appel depuis un contrat EVM écrit un reçu dans un contrat Native dans la même transaction. Si l'un des deux côtés échoue, les deux sont annulés. |

Les innovations derrière ces applications :

- **Le chiffrement vers une adresse.** Chaque compte peut publier sur la chaîne une clé de chiffrement post-quantique, comme un annuaire public. Pour écrire à quelqu'un, il suffit de connaître son adresse.
- **Une carte qui lie la clé au compte.** Le compte signe une petite carte du destinataire avec ses deux clés de signature, si bien que personne ne peut glisser une fausse clé de chiffrement entre les deux.
- **Le chiffrement hybride.** ML-KEM-1024 (NIST FIPS 203) est combiné avec la clé classique X25519. Le message reste privé tant que l'une des deux tient.
- **L'atomicité cross-VM.** L'EVM et QoreChain Native partagent un seul état et un seul bloc. Un appel de l'un à l'autre fait partie de la même transaction : il n'y a donc aucun état à moitié terminé à nettoyer.
- **Une portée approuvée par la gouvernance.** Le pont n'appelle que les contrats Native que la gouvernance a approuvés, et chaque approbation est liée au code du contrat.

## Les mots utilisés dans ce guide {#words}

| Mot | Sens simple |
| --- | --- |
| ML-KEM-1024 | Un échange de clés post-quantique (NIST FIPS 203). Utilisé ici pour convenir d'une clé secrète pour chaque message |
| X25519 | Un échange de clés classique, combiné avec ML-KEM pour que l'enveloppe tienne si l'un des deux est cassé |
| ML-DSA-87 | La signature post-quantique (NIST FIPS 204). Chaque transaction native est signée avec elle et avec la clé classique secp256k1 |
| Carte du destinataire | Une petite note signée qui lie les clés de chiffrement d'un compte au compte |
| Enveloppe | Le message scellé, enregistré dans un fichier texte que vous pouvez envoyer comme vous voulez |
| Native | QoreChain Native, la voie CosmWasm où les contrats s'écrivent en Rust |
| Precompile du pont | Un contrat intégré à `0x0000000000000000000000000000000000000901` qui permet à un contrat EVM d'appeler un contrat Native |
| Liste autorisée | Les contrats Native que la gouvernance a approuvés pour que le pont les atteigne |
| Fenêtre EVM | Une courte permission limitée d'envoyer des transactions de type Ethereum depuis un compte. L'ouvrir exige une transaction signée avec les deux clés |

:::caution Des comptes de testnet jetables uniquement
Utilisez des clés créées pour cet atelier, qui contiennent des QOR de test sans valeur. Ne placez jamais dans un fichier ni dans une commande les mots secrets ou la clé d'un compte qui contient de l'argent réel.
:::

## Avant de commencer {#prerequisites}

Il vous faut les outils de [Avant de commencer](/build-before-qday/prerequisites) (un terminal, Node.js et Git), ainsi qu'un navigateur pour le faucet. La partie 1 demande Node.js 20 ou plus récent. La partie 2 demande aussi **pnpm** et **Foundry**, et en option Rust. Vérifiez Node.js :

```bash
node -v
```

Elle doit afficher `v20` ou plus. Pour la partie 2, installez le reste :

```bash
npm install -g pnpm
```

Installe pnpm, l'outil de paquets que la partie 2 utilise. Vérifiez-le avec `pnpm -v`. Foundry compile, teste et déploie du Solidity : installez-le depuis [getfoundry.sh](https://getfoundry.sh), puis lancez `foundryup`. Vérifiez avec `forge --version` et `cast --version`.

Récupérez le code d'exemple :

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

La première ligne télécharge les exemples dans un dossier nommé `build-before-qday`. La seconde entre dans le dossier `workshop-3`, qui contient les deux applications.

Les QOR de test viennent du [faucet](/dashboard/faucet) du tableau de bord.

## Partie 1 : QoreSeal, chiffrer vers une adresse {#part-1}

Code : [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Paquets : `@qorechain/qoreseal` et `@qorechain/qoresign`.

Vous voulez envoyer un message privé à quelqu'un, et vous ne connaissez que son adresse. Cette application montre comment faire :

1. Alice enregistre ses clés sur la chaîne.
2. N'importe qui retrouve la clé de chiffrement d'Alice à partir de son adresse.
3. Un message est scellé pour Alice. Alice l'ouvre. **Eve ne le peut pas.**
4. Changez un seul bit de l'enveloppe et elle **ne s'ouvre plus**.
5. Un message scellé pour Alice **et** Bob : chacun l'ouvre avec sa propre clé.
6. Alice **renouvelle** sa clé : l'ancienne carte est refusée, les nouveaux messages utilisent la nouvelle clé, et les anciens messages s'ouvrent toujours.

Le chiffrement se fait sur votre ordinateur. La chaîne ne voit jamais le message, seulement la clé publique.

```bash
cd 01-qoreseal
```

Entre dans le dossier QoreSeal.

### Étape 1 : installer {#seal-install}

```bash
npm install
```

Télécharge les versions exactes des paquets indiquées dans `package-lock.json` : QoreSeal, QoreSign (le signataire hybride) et quelques outils cosmjs qui construisent la transaction.

```bash
node seal.mjs help
```

Liste toutes les commandes.

### Étape 2 : créer trois comptes de testnet {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Chaque commande crée un nouveau compte et enregistre ses mots secrets dans `~/.config/qday-w3/<name>.json`, lisible par vous seul. Rien de secret n'est affiché. Définissez `QDAY_DIR` pour garder les fichiers ailleurs. Chaque commande affiche l'adresse `qor1...` du compte.

### Étape 3 : alimenter Alice {#seal-fund-alice}

Collez l'adresse `qor1...` d'Alice dans le [faucet](/dashboard/faucet), puis vérifiez :

```bash
node seal.mjs whoami
```

Affiche chaque compte : adresse, solde, et si ses clés sont déjà sur la chaîne. Pour l'instant, la réponse est `no`.

### Étape 4 : Alice enregistre ses clés {#seal-register}

```bash
node seal.mjs register alice
```

Deux transactions :

1. **La clé de signature ML-DSA-87**, avec une preuve qu'Alice la possède. C'est la seule transaction que la chaîne accepte signée avec la seule clé classique, car elle ne connaît pas encore sa clé post-quantique.
2. **La clé de chiffrement ML-KEM-1024** (1 568 octets), signée avec les deux clés. Dès lors, n'importe qui peut la lire sur la chaîne.

Ensuite, la commande signe la **carte du destinataire** d'Alice et l'enregistre dans `cards/alice.json`. Dans une vraie application, vous publieriez la carte à côté de l'adresse, par exemple sur une page de profil, dans un contrat ou derrière une API.

### Étape 5 : partager des QOR avec Bob et Eve, et enregistrer Bob {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Envoie 3 QOR de test d'Alice à Bob et à Eve. Comme toute transaction après l'enregistrement, elle est signée avec **les deux** clés, et la chaîne vérifie les deux. C'est pourquoi Alice s'enregistre d'abord : un compte sans clé ML-DSA-87 sur la chaîne ne peut qu'en enregistrer une, et toute autre transaction venant de lui est refusée.

```bash
node seal.mjs register bob
```

Bob est nécessaire à l'étape 9, où un message va à deux personnes. Eve reste non enregistrée : c'est le tiers qui va essayer de lire le courrier d'Alice.

### Étape 6 : chercher Alice, comme le ferait un expéditeur {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Lit `GET /qorechain/pqc/v1/kem/<address>` sur l'API REST publique : l'algorithme (`ML-KEM-1024`), la clé publique de 1 568 octets et le bloc où elle a été enregistrée. Puis elle vérifie la carte par rapport à cette clé et à la clé ML-DSA-87 d'Alice sur la chaîne. Vous devez voir `card valid`. Vous pouvez le faire pour n'importe quelle adresse : `node seal.mjs lookup qor1...`.

### Étape 7 : sceller un message pour Alice, et l'ouvrir {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Lit la clé d'Alice sur la chaîne, vérifie sa carte et scelle le message. Un message de 41 caractères devient environ 1 760 octets, surtout du matériel de clé post-quantique. L'enveloppe est enregistrée dans `inbox/`.

```bash
node seal.mjs open alice
```

Affiche `OPENED by alice with encryption key #0` et le message.

```bash
node seal.mjs open eve
```

Affiche `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. Eve a le fichier, mais pas la clé d'Alice.

### Étape 8 : l'altérer {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Inverse un bit de l'enveloppe et essaie de l'ouvrir. Vous devez voir `REFUSED` avec `DECRYPTION_FAILED`. L'enveloppe est authentifiée : toute modification est détectée et personne ne peut modifier un message scellé.

### Étape 9 : un message, deux destinataires {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

Une enveloppe, scellée pour les deux adresses. Chacun l'ouvre avec sa propre clé. Eve ne le peut toujours pas.

### Étape 10 : renouveler la clé d'Alice {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Dérive la clé de chiffrement **suivante** d'Alice (numéro 1) à partir des mêmes mots secrets et l'enregistre sur la chaîne, où elle **remplace** l'ancienne. Ensuite, elle vérifie l'**ancienne** carte par rapport à la chaîne et vous devez voir `refused: the card names a different ML-KEM-1024 key than the registered one`. Les expéditeurs qui vérifient la carte ne peuvent plus sceller pour l'ancienne clé. Une nouvelle carte est signée.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Ouvre la **première** enveloppe, scellée avant le renouvellement : `OPENED by alice with encryption key #0 (an older key)`. L'ancienne clé n'a jamais été stockée. Elle est dérivée de nouveau à partir des mots secrets : renouveler ne vous bloque donc jamais hors de l'ancien courrier.

```bash
node seal.mjs inspect
```

Montre ce qu'il y a dans une enveloppe sans le secret : version, objet, destinataires et tailles.

### Comment fonctionne le code {#seal-code}

Tout est dans `seal.mjs`. Les appels QoreSeal qui comptent :

| Appel | Ce qu'il fait |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | Les clés de chiffrement de la clé numéro `index`, dérivées des mots secrets |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | Le message `MsgRegisterKEMKey` qui met la clé sur la chaîne |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | La carte, signée avec les deux clés de signature du compte |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Lève une erreur sauf si la carte correspond aux clés sur la chaîne |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Lit chaque clé sur la chaîne, vérifie chaque carte, scelle |
| `open({ chainId, purpose, envelope, keys })` | Ouvre l'enveloppe, ou lève une erreur |
| `envelopeToText` et `envelopeFromText` | L'enveloppe en fichier texte, et inversement |

`purpose` (ici `qday-note`) fait partie de ce qui est scellé : une enveloppe faite pour une application ne peut pas être ouverte comme si elle venait d'une autre.

### En cas de problème (QoreSeal) {#seal-trouble}

| Vous voyez | Que faire |
| --- | --- |
| `does not exist on chain yet: fund ... first` | Le compte n'a pas de QOR : utilisez le faucet ou `fund` |
| `no ML-KEM key registered for this address` | Lancez d'abord `register` pour ce compte |
| `hybrid mode needs the recipient card` | Le fichier `cards/<name>.json` est absent : lancez `register <name>`, il réécrit la carte |
| `no envelope yet` | Lancez d'abord `send` |
| `account has no PQC key and classical fallback is disabled` | Ce compte ne s'est pas encore enregistré : lancez `register <name>` avant `fund` depuis lui |
| `refused: ...` sur une transaction | Lisez le message : en général pas assez de QOR, ou l'API publique du testnet limite votre débit. Attendez quelques secondes |

Les fichiers de `~/.config/qday-w3/` contiennent des mots secrets. Ne les commitez ni ne les partagez jamais, et ne les réutilisez jamais sur le mainnet. Les dossiers `cards/` et `inbox/` sont locaux et listés dans `.gitignore`.

## Partie 2 : CrossVmCheckout, une transaction sur deux VM {#part-2}

Code : [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Langages : Solidity et TypeScript pour le côté EVM, Rust pour le côté Native.

QoreChain exécute plus d'une machine virtuelle sur la même chaîne : l'**EVM** (Solidity, style MetaMask) et **QoreChain Native** (contrats CosmWasm en Rust). Elles partagent un seul état et un seul bloc. Cette application est une toute petite boutique :

- **`CrossVmCheckout`** (Solidity, EVM) compte les commandes.
- **`qday-receipts`** (Rust, Native) tient un registre de reçus.
- Un appel à `checkout("coffee for the team")` fait les deux **dans la même transaction** : le nombre de commandes augmente côté EVM et un reçu est écrit côté Native.

Le point essentiel est l'**atomicité** : les deux côtés changent ensemble, ou aucun ne change.

| Commande | Ce qui se passe | Résultat |
| --- | --- | --- |
| `checkout` | Commande +1 sur l'EVM, reçu +1 sur Native | Les deux changent |
| `undo` | Le reçu Native est écrit, **puis** le côté EVM est annulé | Aucun ne change : le reçu est annulé aussi |
| `native-fails` | La commande est comptée, **puis** le contrat Native refuse | Aucun ne change : la commande est annulée aussi |
| `outside` | Demander au pont d'appeler un contrat Native que la gouvernance n'a pas approuvé | Refusé par la chaîne |

Sur le mainnet, les appels cross-VM sont suspendus pour le moment : cette partie fonctionne donc uniquement sur le testnet.

### Le pont et la liste autorisée {#bridge}

L'EVM atteint Native par le precompile du pont à `0x0000000000000000000000000000000000000901`. Vous appelez :

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argument | Signification |
| --- | --- |
| `targetVM` | `1` pour Native |
| `targetContract` | L'adresse `qor1...` du contrat Native |
| `payload` | Le message JSON du contrat Native |

Le pont n'atteint que les contrats Native que la **gouvernance** a approuvés. La liste est publique, dans les paramètres crossvm (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`), et chaque entrée est liée au code du contrat : un contrat approuvé ne peut donc pas être remplacé plus tard par un autre code.

Le contrat Native que vous allez appeler, `qday-receipts`, figure sur la liste autorisée du testnet (proposition de gouvernance 40, code id 865) :

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

Il n'a pas d'administrateur, donc personne ne peut le modifier. **Tout développeur peut l'appeler depuis ses propres contrats pour la piste Cross-VM.** Côté Native, l'expéditeur de l'appel est le propre compte `qor1...` de votre contrat EVM, pas votre portefeuille : chaque reçu montre donc quel contrat l'a écrit.

### Comment fonctionne le contrat EVM {#xvm-how}

Ouvrez `evm/src/CrossVmCheckout.sol` :

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Vérifier la note.** Elle va dans une chaîne JSON : elle doit donc faire de 1 à 140 caractères imprimables, sans `"` ni `\`. Sinon, une note forgée pourrait changer le message que reçoit le contrat Native.
2. **Compter la commande.** Un changement d'état EVM normal.
3. **Appeler le pont.** Le contrat Native s'exécute sur place, dans cette transaction.
4. **Si l'appel au pont a échoué, annuler.** Un échec Native devient une annulation EVM, et toute la transaction est défaite.
5. **Pas de réponse veut dire pas de pont.** Sur une chaîne où le precompile n'est pas actif, un appel à cette adresse « réussit » avec des données vides. Traitez cela comme une erreur, jamais comme un succès.
6. **Décoder la réponse.** Le pont renvoie la réponse Native sous forme de `bytes` encodés en ABI. Le code accepte aussi les octets bruts.
7. **`failAfter`** annule après la réussite de l'appel Native. Il montre que le reçu écrit côté Native est lui aussi annulé.

Utilisez un `call` normal, pas un `staticcall` ni une fonction de lecture : le pont refuse les appels statiques, car le côté Native peut écrire de l'état.

Toutes les commandes ci-dessous s'exécutent dans le dossier `evm`, sauf indication contraire :

```bash
cd ../02-cross-vm/evm
```

Si vous êtes encore dans `01-qoreseal`, cela vous place dans le dossier EVM de l'application cross-VM.

### Étape 1 : lancer les tests (aucun compte nécessaire) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` télécharge les paquets JavaScript. `pnpm forge-std` télécharge une fois la bibliothèque standard de Foundry dans `lib/`. `forge test` lance les 5 tests de `test/CrossVmCheckout.t.sol`. Vous devez voir `5 passed; 0 failed`.

L'EVM local de Foundry n'a pas de pont QoreChain : les tests placent donc un petit faux pont à `0x...0901` avec `vm.etch`. Ils vérifient le message JSON exact envoyé, que `failAfter` annule tout, qu'un échec Native annule le côté EVM, qu'une note ne peut pas injecter du JSON, et qu'un pont inactif est une erreur. Le vrai pont s'exécute dans les étapes suivantes.

### Étape 2 : un compte avec une clé post-quantique {#xvm-account}

Si vous avez fait l'atelier 2, copiez votre `.env` depuis celui-ci (même compte, clé déjà enregistrée) et ajoutez la ligne `RECEIPTS_CONTRACT` de `.env.example`. Sinon :

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` crée un compte jetable. Mettez sa clé privée dans `.env` comme `PRIVATE_KEY`. **Testnet uniquement.**

```bash
pnpm window recovery-code
```

Affiche un code `QRC1-...`. Mettez-le dans `.env` comme `QORE_PQC_RECOVERY_CODE` et gardez-en une copie séparée de la clé privée. Votre clé ML-DSA-87 en est dérivée.

```bash
pnpm window status
```

Affiche votre adresse `qor1...`. Collez-la dans le [faucet](/dashboard/faucet), puis :

```bash
pnpm window register
```

Met votre clé ML-DSA-87 sur la chaîne, une fois par compte. `pnpm window status` affiche maintenant `PQC key: registered`.

### Étape 3 : ouvrir une fenêtre EVM limitée {#xvm-window}

```bash
pnpm window:scoped
```

Ouvre une fenêtre de **1 200 blocs (environ 28 minutes), 6 transactions et 3 QOR** de valeur plus les frais. C'est suffisant pour le déploiement et les trois transactions de démonstration, pas plus. Votre portefeuille appelle **votre propre contrat**, puis le contrat appelle le pont avec sa propre identité : la fenêtre n'a donc besoin d'admettre que l'appel vers votre contrat.

**Attendez environ 10 secondes** avant l'étape suivante, pour que la transaction de la fenêtre soit dans un bloc.

### Étape 4 : déployer la boutique {#xvm-deploy}

```bash
pnpm deploy:testnet
```

Déploie `CrossVmCheckout` en pointant vers `RECEIPTS_CONTRACT`. Cherchez `CrossVmCheckout 0x...`. Dans la sortie de Foundry, « ETH » veut dire QOR.

```bash
pnpm xvm status
```

Affiche les deux côtés : `orders` sur votre contrat EVM et le nombre de reçus sur `qday-receipts`, avec les trois derniers reçus. D'autres développeurs écrivent dans le même registre de reçus : son compteur n'est donc probablement pas à zéro. Ce qui compte, c'est la façon dont il **change**.

### Étape 5 : un contrat que la chaîne n'a pas approuvé {#xvm-outside}

```bash
pnpm xvm outside
```

Simule un appel direct au pont vers un vrai contrat Native qui **n'est pas** sur la liste autorisée. Vous devez voir `REFUSED by the bridge: ... is not allowlisted`. C'est gratuit et n'utilise aucune transaction de la fenêtre.

### Étape 6 : une transaction, deux VM {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

Vous voyez `before`, la transaction (`SUCCESS`), et `after` : commandes +1 **et** reçus +1, plus le nouveau reçu avec votre note, envoyé `from` l'adresse `qor1...` de votre contrat. Puis `both sides changed, in the same transaction`.

### Étape 7 : le côté EVM échoue après l'appel Native {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Le reçu Native est écrit, puis le côté EVM est annulé. La transaction est minée comme `REVERTED`, et `before` et `after` sont identiques : `nothing changed on either side`. Le reçu qui avait été écrit côté Native a disparu lui aussi.

### Étape 8 : le côté Native refuse {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

La commande est comptée côté EVM, puis `qday-receipts` refuse avec `{"fail":{}}`. La transaction est `REVERTED` et les nombres sont identiques : la commande EVM est annulée aussi.

Chaque transaction a un lien d'explorateur. Ouvrez-le dans l'[explorateur du tableau de bord](/dashboard/explorer) avec le sélecteur de réseau sur **Testnet**.

### En cas de problème (cross-VM) {#xvm-trouble}

| Vous voyez | Ce que cela veut dire | Que faire |
| --- | --- | --- |
| `Missing or invalid parameters` au déploiement ou lors d'une transaction | Aucune fenêtre EVM active | `pnpm window status`, puis `pnpm window:scoped`, attendez 10 secondes, réessayez |
| `No shop yet` | Rien n'a été déployé depuis ce dossier | Étape 4, ou définissez `SHOP_ADDRESS` dans `.env` |
| `BridgeCallFailed` avec `not allowlisted` | La cible n'est pas approuvée par la gouvernance | Utilisez `qday-receipts`, l'adresse ci-dessus |
| `BridgeNotActive` | Le precompile du pont n'est pas actif sur ce réseau | Utilisez le testnet |
| `BadNote` | La note est vide, trop longue, ou contient `"` ou `\` | Utilisez du texte simple de 140 caractères maximum |

### Le côté Native {#native-side}

Le dossier `native/` contient le code source complet de `qday-receipts` (CosmWasm 2, Rust) :

| Message | Ce qu'il fait |
| --- | --- |
| `{"record":{"note":"..."}}` | Ajoute un reçu : id, expéditeur, note, hauteur de bloc |
| `{"fail":{}}` | Refuse toujours, pour montrer l'atomicité |
| `{"count":{}}` (requête) | Combien de reçus |
| `{"receipt":{"id":1}}` (requête) | Un reçu |
| `{"latest":{"limit":3}}` (requête) | Les reçus les plus récents, du plus récent au plus ancien, 20 au maximum |

Lancez ses tests (Rust requis) :

```bash
cd ../native
cargo test
```

Vous devez voir 3 tests réussir. Le téléversement de contrats Native sur le testnet passe par la gouvernance : vous n'avez donc pas besoin de déployer celui-ci, il est déjà en ligne.

Pour vérifier que le code sur la chaîne est bien ce code source, compilez-le avec l'optimiseur CosmWasm et comparez les sommes de contrôle. Le code sur la chaîne a été compilé sur un Mac Apple Silicon avec l'image arm64 : utilisez donc la même, car l'image x86 produit une somme de contrôle différente.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

La somme de contrôle doit être `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`, le même `data_hash` que la chaîne affiche pour le code 865 :

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Lisez le registre de reçus de n'importe où, sans compte :

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### Fichiers {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## En savoir plus {#learn-more}

- Le festival, les pistes Applications chiffrées et Cross-VM et les primes : [build.qorechain.io](https://build.qorechain.io).
- QoreSeal sur npm : [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [Precompiles EVM](/developer-guide/evm-precompiles) et la [référence cross-VM](/developer-guide/cross-vm-reference).
- [Atelier 2](/build-before-qday/workshop-2) pour la fenêtre EVM et le coffre.
