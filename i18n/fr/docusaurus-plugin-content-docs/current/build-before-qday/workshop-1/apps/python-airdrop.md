---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Application Python, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Application Python : Q-Day Airdrop

Le **Q-Day Airdrop** est un petit outil Python qui envoie des QOR de testnet à toute une liste d'adresses dans **une seule** transaction, signée avec une clé classique secp256k1 et une clé post-quantique ML-DSA-87 (FIPS 204). Il prouve ensuite, à partir du registre de la chaîne elle-même, que les deux signatures ont été vérifiées. Il fonctionne sur le testnet QoreChain (`qorechain-diana`, ID de chaîne EVM 9800).

## Ce que cela démontre {#what-it-shows}

- **La signature hybride ML-DSA-87 + secp256k1** depuis Python.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne**, qui paie plusieurs destinataires à la fois avec un seul message multi-envoi.
- **Un rapport de vérification** construit à partir du registre de transactions de la chaîne elle-même, et non sur la parole de l'outil.

Pourquoi c'est important : une seule signature protège tout un airdrop, et il reste protégé contre un futur ordinateur quantique grâce à la moitié ML-DSA-87, qui est post-quantique. Voir [Transactions résistantes au quantique](/sdk/guides/quantum-safe).

## Pas à pas {#run}

Tout ce qui suit s'exécute dans votre propre terminal (macOS, Linux, ou Windows avec WSL). Vous n'utilisez qu'un compte de testnet jetable. Les QOR de testnet n'ont aucune valeur, et vous n'utilisez jamais de vrai portefeuille ici.

### 1. Installer les outils {#install}

Il vous faut Git et Python 3.10 ou plus récent (avec `venv`). Vérifiez ce que vous avez :

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

Si quelque chose manque, installez-le d'abord, par exemple depuis [python.org](https://www.python.org/downloads/) ou avec votre gestionnaire de paquets (`brew install python` sur macOS, `sudo apt install python3 python3-venv git` sur Debian ou Ubuntu). Ouvrez un nouveau terminal et relancez les vérifications.

### 2. Récupérer le code {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Installer les dépendances {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Cela installe un seul paquet, `qorechain-sdk==0.13.0`, plus ce dont il a besoin. Gardez l'environnement virtuel actif pour toutes les étapes suivantes (relancez `source .venv/bin/activate` dans chaque nouveau terminal). Vérifiez que l'outil démarre :

```bash
python airdrop.py --help
```

Vous devriez voir les commandes `new`, `status`, `register`, `drop` et `verify`.

### 4. Créer votre compte de testnet jetable {#key}

```bash
python airdrop.py new
```

Cela génère une nouvelle phrase de récupération, l'écrit dans le fichier de clés `~/.config/qday/python.env` (lisible par vous seul, droits 600) et n'affiche que l'adresse du compte, qui commence par `qor1...`. La phrase n'est jamais affichée. Ne partagez pas ce fichier, ne le commitez pas et ne le réutilisez pas sur le mainnet. Pour garder la clé ailleurs, placez `--key-file /path/to/file` avant le nom de la commande (par exemple `python airdrop.py --key-file ~/my.env status`) ou définissez `QORE_KEY_FILE`.

Copiez l'adresse `qor1...` de la sortie. Si vous la perdez, `python airdrop.py status` l'affiche de nouveau.

### 5. Obtenir des QOR de testnet depuis le faucet {#faucet}

1. Ouvrez https://dashboard.qorechain.io/faucet et connectez-vous.
2. Collez votre adresse `qor1...` et demandez des jetons. Le faucet donne 100 QOR par 24 heures.
3. Vérifiez qu'ils sont arrivés :

```bash
python airdrop.py status
```

Le solde devrait afficher vos QOR de testnet, et la clé post-quantique devrait apparaître comme non encore enregistrée.

### 6. Enregistrer votre clé post-quantique {#register}

```bash
python airdrop.py register
```

Cela enregistre votre clé ML-DSA-87 sur la chaîne, une seule fois. Vous pouvez relancer la commande sans risque. L'enregistrement est signé de façon classique, car une clé ne peut pas co-signer son propre enregistrement. Toutes les transactions suivantes sont signées de façon hybride.

### 7. Écrire la liste des destinataires {#list}

Créez un fichier texte avec une adresse de testnet par ligne. Pour un premier essai, créez quelques adresses jetables en pointant `--key-file` vers de nouveaux fichiers, ou utilisez les adresses d'amis qui utilisent aussi le testnet :

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Placez ensuite les adresses affichées dans `addresses.txt` :

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Les lignes vides, les commentaires `#`, les doublons, l'expéditeur lui-même et tout ce qui n'est pas une adresse de compte `qor1...` valide sont ignorés avec un avertissement. Il y a 100 destinataires au maximum par transaction. Le dépôt contient aussi `addresses.example.txt`, un exemple avec des lignes provisoires.

### 8. Envoyer l'airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` est le montant en QOR envoyé à chaque destinataire. L'outil affiche un récapitulatif (destinataires, montant unitaire, total) et vous demande de confirmer ; ajoutez `--yes` pour ignorer la question. Il simule ensuite la transaction pour fixer le gas, la signe avec les deux clés, la diffuse en une seule transaction et affiche le rapport de vérification. Si une diffusion échoue, attendez une minute et réessayez.

### 9. Vérifier n'importe quelle transaction {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

Utilisez le hash affiché par `drop`. Cela affiche le rapport de vérification seul, pour n'importe quel hash de transaction.

## Ce que vous devriez voir {#output}

- `drop` affiche le hash de la transaction et la hauteur, puis le rapport de vérification : le statut `pqc_hybrid_verify` du signataire est `verified`, la signature ML-DSA-87 fait 4627 octets, le code est 0 et le nombre de destinataires correspond à votre liste.
- Dans l'explorateur : ouvrez `https://explore.qore.network/tx/<HASH>` et passez l'explorateur sur **Testnet**. La transaction apparaît comme réussie, avec chaque destinataire payé.

## Comment fonctionne la preuve {#proof}

`verify` lit `GET /cosmos/tx/v1beta1/txs/{hash}` depuis le point de terminaison REST public du testnet et contrôle :

- un événement de type `pqc_hybrid_verify` pour le signataire avec `status=verified` ;
- l'extension `/qorechain.pqc.v1.PQCHybridSignature` porte une signature ML-DSA-87 de 4627 octets (à côté de celle de 64 octets en secp256k1) ;
- la transaction a réussi (code 0), et combien de destinataires elle a payés.

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

La clé est enregistrée une seule fois avec `ensure_pqc_registered(...)`, qui ne fait rien si la même clé est déjà sur la chaîne. Le gas n'est jamais fixe : la vraie transaction signée de façon hybride est d'abord simulée et la limite vaut le gas simulé multiplié par 1,3, au prix de 0,15 uqor par unité de gas.

Le compte est de type coin 118 (`m/44'/118'/0'/0/0`). La clé ML-DSA-87 est dérivée de la même phrase de récupération et liée à l'adresse avec `derive_pqc_canonical`. Si vous construisez votre propre application sur les assistants fondés sur une graine, le SDK 0.13.0 exige un code de récupération ou un secret PQC indépendant de 32 octets (en Python `unified_account_from_seed(seed32, recovery_code=...)`) ; voir [Installer le SDK](/sdk/install#whats-new-0130). N'affichez jamais un code de récupération.

## Paquets utilisés {#packages}

| Élément | Version |
| --- | --- |
| `qorechain-sdk` (PyPI, importé sous le nom `qorsdk`) | 0.13.0 (épinglé dans `requirements.txt` sous la forme `qorechain-sdk==0.13.0`) |
| Python | 3.10 ou plus récent |

L'outil importe aussi les types protobuf `Input`, `Output` (depuis `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) et `Coin` (depuis `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`) ; ils sont fournis avec le SDK. Voir [Installer le SDK](/sdk/install) pour le tableau des versions dans tous les langages.

## Où trouver les informations {#access}

| Quoi | Où |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorateur | `https://explore.qore.network` (passez sur Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
