---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Application Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Application Python : Q-Day Airdrop

Le **Q-Day Airdrop** est un petit outil Python qui envoie des QOR de testnet à toute une liste d'adresses en **une seule** transaction. La transaction est signée avec une clé classique secp256k1 et une clé post-quantique ML-DSA-87 (FIPS 204). L'outil prouve ensuite, à partir du registre de la chaîne elle-même, que les deux signatures ont été vérifiées. Il fonctionne sur le testnet QoreChain (`qorechain-diana`, identifiant de chaîne EVM 9800).

**Durée :** environ 20 minutes la première fois (10 minutes d'installation des outils, 5 minutes de mise en place, 5 minutes d'envoi et de vérification).

Vous n'avez pas besoin de connaître Python. Vous tapez simplement les commandes ci-dessous, une par une, et vous comparez le résultat avec « Ce que vous devez voir ».

## Ce que l'outil montre {#what-it-shows}

- **La signature hybride ML-DSA-87 + secp256k1** depuis Python.
- **Une transaction signée en hybride et vérifiée sur la chaîne**, qui paie de nombreux destinataires d'un coup grâce à un seul message d'envoi multiple.
- **Un rapport de vérification** construit à partir du registre de transactions de la chaîne elle-même, et non sur la parole de l'outil.

Pourquoi c'est important : une seule signature protège tout un airdrop, et il reste protégé contre un futur ordinateur quantique, car la moitié ML-DSA-87 est post-quantique. Voir [Transactions résistantes au quantique](/sdk/guides/quantum-safe).

:::warning Testnet uniquement
Utilisez uniquement un compte de testnet jetable. Les QOR du testnet n'ont aucune valeur. N'utilisez jamais votre vrai portefeuille, votre vraie phrase de récupération ni de vrais fonds dans ce tutoriel.
:::

## Les mots que vous allez rencontrer {#words}

| Mot | Signification |
| --- | --- |
| Testnet | Une copie d'entraînement de QoreChain. Les pièces qui s'y trouvent sont gratuites et sans valeur. |
| QOR et uqor | Deux noms pour la même pièce. 1 QOR = 1 000 000 uqor. L'outil demande des QOR. Les frais sont affichés en uqor. |
| Mémo | Un court texte joint à une transaction, comme la note d'un virement bancaire. |
| Adresse | Votre numéro de compte public. Sur QoreChain, elle commence par `qor1`. Vous pouvez la partager sans risque. |
| Fichier de clé | Un fichier contenant votre phrase de récupération secrète. Ne le partagez jamais. |
| Faucet | Un site web qui donne des QOR de testnet gratuits. |
| Hash | L'identifiant unique d'une transaction. Il sert à la retrouver. |

## Avant de commencer {#before}

Il vous faut **Git** (télécharge le code) et **Python 3.10 ou plus récent** avec `venv` (un dossier privé pour les bibliothèques de l'outil). Après chaque installation, **fermez le terminal et ouvrez-en un nouveau**, puis lancez la commande de vérification.

| Outil | macOS | Windows | Linux (Debian ou Ubuntu) | Vérification |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew depuis https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (cochez « Add python.exe to PATH » dans l'installateur) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (sous Windows : `python --version`) |

Sous Windows, utilisez PowerShell ou Git Bash. Là où cette page écrit `python3`, Windows utilise généralement `python`. Tout le reste est identique, sauf la ligne qui active l'environnement virtuel (étape 3).

## Obtenir un portefeuille de testnet et des QOR gratuits {#wallet}

L'outil crée sa propre clé jetable (étape 4 ci-dessous), vous n'avez donc pas besoin d'une application de portefeuille pour ce tutoriel. Si vous voulez aussi voir votre compte dans QoreX :

1. **Application QoreX :** ouvrez les réglages, puis activez **Use testnet (developers)**.
2. **Extension de navigateur QoreX :** déverrouillez-la, touchez 7 fois le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.

Les QOR gratuits viennent du faucet sur https://dashboard.qorechain.io/faucet. Vous vous connectez, collez l'adresse et faites la demande. Il verse **100 QOR par 24 heures et par compte**.

La toute première transaction d'un nouveau compte enregistre sa clé post-quantique ML-DSA-87 sur la chaîne. C'est une étape unique, avec des frais d'environ 0,09 QOR. L'outil s'en charge pour vous avec la commande `register`.

## Pas à pas {#run}

### 1. Télécharger le code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**Ce que ça fait**

- `git clone <adresse>` : copie le projet depuis GitHub dans un nouveau dossier nommé `build-before-qday`.
- `cd <dossier>` : place votre terminal dans le dossier de l'application Python. Toutes les commandes suivantes doivent être lancées depuis ce dossier.

**Ce que vous devez voir :** des lignes comme `Cloning into 'build-before-qday'...`, puis votre invite dans le nouveau dossier.

### 2. Créer un environnement Python privé {#venv}

```bash
python3 -m venv .venv
```

**Ce que ça fait :** crée un dossier nommé `.venv` qui contient les bibliothèques de cet outil, afin qu'elles ne se mélangent à rien d'autre sur votre ordinateur.

| Élément | Signification |
| --- | --- |
| `python3` | Le programme Python. |
| `-m venv` | Lancer le créateur d'« environnement virtuel » intégré à Python. |
| `.venv` | Le nom du dossier à créer. |

**Ce que vous devez voir :** rien d'affiché, et un nouveau dossier `.venv`.

### 3. L'activer et installer les bibliothèques {#deps}

```bash
source .venv/bin/activate
```

Sous Windows PowerShell, utilisez plutôt `.venv\Scripts\activate` (si PowerShell le bloque, lancez `Set-ExecutionPolicy -Scope Process RemoteSigned` et réessayez). Dans l'invite de commandes Windows, utilisez `.venv\Scripts\activate.bat`.

**Ce que ça fait :** fait passer votre terminal sur l'environnement privé.

**Ce que vous devez voir :** `(.venv)` au début de votre invite. Réactivez-le avec cette même commande dans chaque nouveau terminal.

```bash
pip install -r requirements.txt
```

| Élément | Signification |
| --- | --- |
| `pip` | L'installateur de bibliothèques de Python. |
| `install` | Télécharger et installer des bibliothèques. |
| `-r requirements.txt` | Lire la liste des bibliothèques dans ce fichier. Il nomme une seule bibliothèque, `qorechain-sdk==0.13.0` (le SDK QoreChain, version exacte 0.13.0), plus ce dont elle a besoin. |

**Ce que vous devez voir :** des lignes de téléchargement qui se terminent par `Successfully installed ... qorechain-sdk-0.13.0`. Un avertissement indiquant qu'un nouveau pip est disponible est sans conséquence.

**Durée :** environ 15 secondes à 1 minute.

Vérifiez maintenant que l'outil démarre :

```bash
python airdrop.py --help
```

**Ce que vous devez voir :** les commandes `new`, `status`, `register`, `drop` et `verify`.

### 4. Créer votre compte de testnet jetable {#key}

```bash
python airdrop.py new
```

**Ce que ça fait :** crée un compte tout neuf. Il écrit une phrase de récupération secrète dans le fichier de clé `~/.config/qday/python.env` (dans votre dossier personnel, lisible uniquement par vous) et n'affiche que l'adresse publique.

| Élément | Signification |
| --- | --- |
| `new` | Créer un nouveau fichier de clé et afficher son adresse. |
| `new --force` | Remplacer un fichier de clé existant. L'ancienne clé est perdue. |

**Ce que vous devez voir :** `New testnet wallet`, une `address` qui commence par `qor1...`, le chemin du fichier de clé avec `(mode 600, mnemonic not shown)`, et une indication pour l'étape suivante.

**Copiez l'adresse `qor1...`.** Si vous la perdez, `python airdrop.py status` l'affiche de nouveau. Ne partagez jamais le fichier de clé, ne le versionnez jamais dans Git et ne le réutilisez jamais sur le mainnet.

Pour garder la clé ailleurs, placez `--key-file` **avant** le nom de la commande :

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <chemin>` signifie « utiliser ce fichier de clé au lieu de celui par défaut ». L'ordre compte : `--key-file` va avant `status`, `drop` et les autres commandes. Vous pouvez aussi définir la variable d'environnement `QORE_KEY_FILE` à la place.

### 5. Obtenir des QOR de testnet depuis le faucet {#faucet}

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et appuyez sur le bouton de demande.
3. Attendez quelques secondes, puis lancez :

```bash
python airdrop.py status
```

**Ce que ça fait :** demande au testnet votre solde et si votre clé post-quantique est enregistrée.

**Ce que vous devez voir :** votre solde (environ 100 QOR) et un avertissement indiquant que la clé ML-DSA-87 n'est pas encore enregistrée. S'il indique que l'adresse « is not on chain yet », le paiement du faucet n'est pas arrivé : attendez 10 secondes et réessayez.

### 6. Enregistrer votre clé post-quantique {#register}

```bash
python airdrop.py register
```

**Ce que ça fait :** enregistre votre clé ML-DSA-87 sur la chaîne, une seule fois. Vous pouvez la relancer sans risque. Cette première transaction est signée de façon classique, car une clé ne peut pas cosigner son propre enregistrement. Elle coûte environ 0,09 QOR. Toutes les transactions suivantes sont signées en hybride.

**Ce que vous devez voir :** un hash de transaction et une ligne `registered` (ou `already registered` si vous l'avez lancée deux fois).

**Durée :** quelques secondes (un bloc).

### 7. Écrire la liste des destinataires {#list}

Créez deux comptes destinataires jetables. Chacun a son propre fichier de clé :

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**Ce que ça fait :** le même `new` qu'avant, mais `--key-file` envoie chaque clé dans son propre fichier pour que rien ne soit écrasé. (Vous pouvez aussi utiliser les adresses d'amis qui utilisent le testnet.)

**Ce que vous devez voir :** deux adresses `qor1...` différentes. Copiez-les toutes les deux.

Créez maintenant un fichier texte brut nommé `addresses.txt` dans ce dossier, avec une adresse par ligne. N'importe quel éditeur de texte convient (Bloc-notes sous Windows, TextEdit en mode texte brut sous macOS, `nano addresses.txt` sous Linux) :

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Remplacez les deux lignes d'exemple par vos vraies adresses. Les lignes vides, les commentaires `#`, les doublons, l'expéditeur lui-même et tout ce qui n'est pas une adresse `qor1...` valide sont ignorés avec un avertissement. Au maximum 100 destinataires par transaction. Le dossier contient aussi `addresses.example.txt`, un exemple avec des lignes de remplacement.

### 8. Envoyer l'airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Élément | Signification |
| --- | --- |
| `drop` | Envoyer une transaction qui paie tout le monde dans la liste. |
| `addresses.txt` | Le fichier contenant les destinataires. |
| `0.1` | Le montant en QOR **pour chaque destinataire** (0,1 QOR = 100 000 uqor). Deux destinataires reçoivent 0,2 QOR au total. |
| `--memo "..."` | Un court texte joint à la transaction. Facultatif. |
| `--yes` (ou `-y`) | Facultatif : ignorer la question « êtes-vous sûr ». |

Ordre des options : le montant et le fichier viennent en premier, et `--memo` et `--yes` viennent après. `--key-file` est différent : il va avant `drop`.

**Ce que ça fait :** affiche un résumé (destinataires, montant par destinataire, total) et vous demande de confirmer. Tapez `y` puis appuyez sur Entrée. Ensuite, il demande à la chaîne combien de gas est nécessaire (un essai à blanc), ajoute 30 pour cent de marge de sécurité, signe avec les deux clés, envoie une seule transaction et affiche le rapport de vérification.

**Ce que vous devez voir :** le hash et la hauteur de la transaction, puis un rapport avec : code 0, le statut `pqc_hybrid_verify` du signataire à `verified`, une signature ML-DSA-87 de 4 627 octets, et un nombre de destinataires qui correspond à votre liste. Copiez le hash.

**Durée :** environ 10 secondes.

### 9. Vérifier n'importe quelle transaction {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**Ce que ça fait :** lit la transaction depuis la chaîne et affiche seul le rapport de vérification. Cela fonctionne pour n'importe quel hash de transaction, pas seulement les vôtres.

**Ce que vous devez voir :** le même rapport qu'à la fin de l'étape 8.

## Vérifier la transaction vous-même {#check}

Vous n'avez pas à faire confiance à l'outil. Interrogez directement la chaîne.

**Méthode 1, dans le navigateur.** Ouvrez `https://explore.qore.network/tx/<HASH>` (mettez votre hash à la place de `<HASH>`), puis passez l'explorateur sur **Testnet**. Vous devez voir une transaction réussie, avec chaque destinataire payé.

**Méthode 2, une commande :**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Élément | Signification |
| --- | --- |
| `curl` | Un outil qui télécharge une adresse web. Intégré à macOS, Windows 10+ et à la plupart des systèmes Linux. |
| `-s` | Silencieux : masque la barre de progression. |
| l'adresse | L'API REST publique du testnet. Elle renvoie le registre complet de la transaction en JSON. |

**Ce que vous devez voir** dans la longue sortie (ajoutez `| jq .` si vous avez installé jq, voir https://jqlang.github.io/jq/download/) :

- `"code": 0` signifie que la transaction a réussi.
- Une extension `PQCHybridSignature` contenant un `pqc_signature` de **4 627 octets** (la signature ML-DSA-87), à côté de la signature classique de 64 octets.
- Un événement `pqc_hybrid_verify` dont `status` vaut `verified` pour votre adresse.

## Comment fonctionne la preuve {#proof}

`verify` lit `GET /cosmos/tx/v1beta1/txs/{hash}` depuis le point d'accès REST public du testnet et contrôle :

- un événement de type `pqc_hybrid_verify` pour le signataire avec `status=verified` ;
- que l'extension `/qorechain.pqc.v1.PQCHybridSignature` porte une signature ML-DSA-87 de 4 627 octets ;
- que la transaction a réussi (code 0), et combien de destinataires elle a payés.

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `python3: command not found` ou version inférieure à 3.10 | Python est absent ou trop ancien. | Installez Python 3.10 ou plus récent, ouvrez un nouveau terminal. Sous Windows, utilisez `python`. |
| `No module named venv` ou `ensurepip is not available` | La partie venv de Python n'est pas installée (Debian, Ubuntu). | `sudo apt install python3-venv`, puis refaites l'étape 2. |
| `ModuleNotFoundError: No module named 'qorsdk'` | L'environnement n'est pas activé, ou l'installation a été sautée. | Lancez `source .venv/bin/activate`, puis `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` a été placé après la commande. | Placez-le avant : `python airdrop.py --key-file <chemin> status`. |
| `no key file at ... Run: python airdrop.py new` | Vous avez sauté l'étape 4, ou un autre `--key-file` est utilisé. | Lancez `python airdrop.py new`. |
| `... already exists (use --force to replace it)` | Un fichier de clé est déjà présent. | Gardez-le, ou lancez `python airdrop.py new --force` (l'ancienne clé est perdue). |
| `... is readable by others (mode ...)` | Les permissions du fichier de clé sont trop ouvertes. | Lancez `chmod 600 <chemin>`. |
| `... is not on chain yet (fund it first)` | Aucun QOR du faucet n'est arrivé. | Attendez 10 secondes, ou faites une demande au faucet. |
| `account has no PQC key and classical fallback is disabled` | La clé post-quantique n'est pas encore enregistrée. | Lancez d'abord `python airdrop.py register`. |
| `the ML-DSA-87 key is not registered yet` | Même raison, détectée par l'outil avant l'envoi. | Lancez `python airdrop.py register`. |
| `balance too low` | Le montant total plus les frais dépasse ce que vous détenez. | Envoyez un montant plus petit, ou attendez la prochaine demande au faucet. |
| Le faucet indique une limite de débit | Une demande par 24 heures et par compte. | Attendez, ou utilisez un autre compte jetable. |
| `skip line N: not a valid qor1 address` | Une ligne de `addresses.txt` n'est pas une adresse valide. | Corrigez ou supprimez cette ligne. Les autres lignes fonctionnent toujours. |
| `no valid recipients` | Toutes les lignes ont été ignorées. | Vérifiez que `addresses.txt` contient de vraies adresses `qor1...`. |
| `bad amount` | Le montant n'est pas un simple nombre. | Utilisez des QOR sous forme de nombre, par exemple `0.1`. |
| `refused by the node: code ...` | La chaîne a refusé la transaction. | Lisez le message. Attendez une minute et réessayez si le testnet est occupé ou en cours de mise à niveau. |
| `transaction not found on the testnet` | Mauvais hash, ou le bloc n'est pas encore final. | Vérifiez le hash et réessayez dans quelques secondes. |
| `the testnet may be pausing for an upgrade` | Les points d'accès publics limitent les requêtes par adresse IP, ou le testnet est en cours de mise à niveau. | Attendez une minute et relancez. |
| `EVM authorisation window exhausted` | Concerne les applications EVM, pas celle-ci. | Dans une application EVM, ouvrez une nouvelle fenêtre avec `pnpm window open`. |
| `HHE10402` après l'ouverture de la fenêtre | Applications Hardhat uniquement : la fenêtre n'était pas encore active. | Relancez le déploiement. |
| Erreurs `CORS` dans un navigateur | Seulement quand une page web appelle directement la chaîne. Cet outil ne le fait pas. | Dans une application de navigateur, utilisez le proxy `/lcd` du modèle. |
| `pnpm: command not found` | pnpm n'est pas installé. Il n'est pas nécessaire ici. | Uniquement pour le tutoriel Hardhat : lancez `npm install -g pnpm`. |

## Le code du SDK qui compte {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

La clé est enregistrée une seule fois avec `ensure_pqc_registered(...)`, qui ne fait rien si la même clé est déjà sur la chaîne. Le gas n'est jamais fixe : la vraie transaction signée en hybride est d'abord simulée et la limite est le gas simulé multiplié par 1,3, au prix de 0,15 uqor par unité de gas.

Le compte est de type coin 118 (`m/44'/118'/0'/0/0`). La clé ML-DSA-87 est dérivée de la même phrase de récupération et liée à l'adresse avec `derive_pqc_canonical`. Si vous construisez votre propre application avec les aides basées sur la graine à la place, le SDK 0.13.0 exige un code de récupération ou un secret PQC indépendant de 32 octets (en Python `unified_account_from_seed(seed32, recovery_code=...)`) ; voir [Installation du SDK](/sdk/install#whats-new-0130). N'affichez jamais un code de récupération.

## Paquets utilisés {#packages}

| Élément | Version |
| --- | --- |
| `qorechain-sdk` (PyPI, importé sous le nom `qorsdk`) | 0.13.0 (épinglée dans `requirements.txt` sous la forme `qorechain-sdk==0.13.0`) |
| Python | 3.10 ou plus récent |

L'outil importe aussi les types protobuf `Input`, `Output` (depuis `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) et `Coin` (depuis `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`) ; ils sont fournis avec le SDK. Voir [Installation du SDK](/sdk/install) pour le tableau des versions dans tous les langages.

## Où trouver les informations {#access}

| Quoi | Où |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passer sur Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
