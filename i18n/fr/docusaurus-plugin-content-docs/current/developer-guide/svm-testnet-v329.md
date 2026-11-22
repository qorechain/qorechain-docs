---
slug: /developer-guide/svm-testnet-v329
title: "SVM sur le testnet : déployer des programmes et envoyer des transactions Solana (v3.2.9)"
sidebar_label: SVM Testnet (v3.2.9)
sidebar_position: 11
---

# SVM sur le testnet : déployer des programmes et envoyer des transactions Solana (v3.2.9)

La version **v3.2.9** permet à la ligne de commande Solana standard de dialoguer avec QoreChain. Vous pouvez exécuter `solana transfer`, `solana program deploy`, `anchor deploy` et un script web3.js sur le testnet, et la chaîne vérifie elle-même chaque signature Solana. Une clé Solana ne peut pas toucher seule votre compte QoreChain : vous ouvrez d'abord une petite **fenêtre d'autorisation** bornée, au moyen d'une transaction signée par votre **clé post-quantique**, et la fenêtre n'est acceptée que si la clé Solana prouve, par sa propre signature, que vous la détenez. Quand la fenêtre se termine, la clé redevient un compte Solana ordinaire.

Cette page conduit un développeur d'une machine vide jusqu'à un programme déployé et appelé sur le testnet : les nouveautés, les outils, la construction à la main de la preuve de clé, l'ouverture et la fermeture de la fenêtre, le financement d'une clé de déploiement, le déploiement avec `solana` ou `anchor`, l'appel du programme, la lecture du résultat, et un tableau des textes d'erreur réels.

:::note Testnet uniquement, vérifié le 22 novembre 2026
Tout ce qui suit s'exécute sur le testnet **`qorechain-diana`**, qui fonctionne en v3.2.9 depuis le 20 novembre 2026 (proposition de gouvernance 39, hauteur 10,424,000). La lane compatible Solana (SVM) y est ouverte depuis la proposition de gouvernance 37. **Rien de tout cela ne fonctionne sur le mainnet :** la lane SVM est désactivée sur `qorechain-vladi`, les appels inter-VM restent en pause et l'envoi de code de contrat CosmWasm reste réservé à la gouvernance. Construisez uniquement sur le testnet. Le QOR de test n'a aucune valeur. Utilisez des clés jetables.

Les appels de lecture, le devis de frais, la route du nonce et l'exemple de preuve de clé de cette page ont été exécutés sur le testnet réel le 22 novembre 2026. Le flux complet (fenêtre, financement, déploiement, appel, mise à niveau, fermeture) a été exécuté avant la version sur un réseau de test local, avec `solana-cli` 4.0.2 et `anchor-cli` 1.2.2 non modifiés. Voir [Ce qui a été vérifié](#tested) pour la répartition exacte.
:::

:::caution La passerelle publique ne relaie pas encore les transactions
Le 22 novembre 2026, `https://svm-testnet.qore.host` a répondu à chaque `sendTransaction` bien formé par `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. Les lectures fonctionnent, les devis de frais fonctionnent, les écritures sont refusées tant que les opérateurs de cette passerelle n'ont pas défini de compte relayeur. Les étapes jusqu'à la fenêtre incluse n'ont pas besoin de passerelle. Pour les étapes qui envoient, voir [Envoyer sans la passerelle publique](#relay) et revérifiez le point d'accès avant de commencer : exécutez la commande de l'[Étape 1](#step-config), puis un `solana transfer` comme à l'[Étape 6](#step-fund).
:::

## Nouveautés de la v3.2.9 pour la SVM {#whats-new}

* **Transactions filaires Solana sur la chaîne.** Une transaction signée par un portefeuille ou un outil Solana est transportée, octet pour octet, dans le message Native `MsgSolanaTransaction`. La chaîne vérifie chaque signature ed25519, le blockhash récent et le payeur de frais, exécute les instructions dans l'ordre comme une seule étape atomique, et refuse une signature déjà vue. Le message ne s'exécute que comme message de premier niveau de sa propre transaction porteuse : il est refusé sous authz et lorsqu'un contrat l'envoie.
* **Une passerelle qui relaie au lieu d'exécuter.** La méthode JSON-RPC Solana `sendTransaction` du nœud n'exécute plus rien sur le nœud. Elle décode la transaction, la simule sur une copie jetable de l'état, et la remet à un compte relayeur qui signe la transaction porteuse avec les deux clés et l'envoie au mempool. Seul ce qui passe dans un bloc modifie l'état. Le relayeur n'acquiert aucune autorité sur votre transaction, car vos signatures ed25519 sont vérifiées sur la chaîne.
* **Une fenêtre d'autorisation post-quantique pour les clés Solana.** `MsgOpenSVMWindow` désigne une clé ed25519 et la borne par blocs, nombre de transactions et valeur en QOR, avec en option une limitation à des programmes listés. Tant que la fenêtre est ouverte, les transactions signées par cette clé agissent pour votre compte. L'ouvrir exige votre **signature ML-DSA-87** : une clé Solana divulguée ne peut donc jamais en ouvrir une seule.
* **Une preuve de clé.** L'ouverture d'une fenêtre exige `svm_key_proof` (champ 7) : une signature Ed25519 de 64 octets, faite par la clé Solana elle-même, sur un court texte qui nomme la chaîne, votre compte et la clé. Une clé publique est publique : la preuve montre donc que la personne qui ouvre la fenêtre détient la clé.
* **Une preuve ouvre une fenêtre.** Le texte contient un compteur (le nonce) qui augmente à chaque fenêtre ouverte pour cette clé : une ancienne preuve ne peut donc pas être rejouée.
* **Un chargeur de programmes.** Le chargeur évolutif est disponible : `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` et `anchor deploy` fonctionnent, et les programmes peuvent être mis à niveau par leur autorité et fermés pour récupérer le loyer.
* **Des frais que les outils Solana comprennent.** `getFeeForMessage` et `simulateTransaction` rapportent les frais réels : les vérifications de frais par défaut de `solana` et de web3.js sont donc correctes sans option supplémentaire. Quand une transaction est trop bon marché, l'erreur indique le prix exact à fixer.
* **Budgets pour les délégations authz.** `MsgExecuteProgram`, `MsgCreateAccount` et `MsgDeployProgram` envoyés en votre nom par un tiers sous une délégation authz ne s'exécutent que dans une fenêtre et son budget distinct « pour le compte de ».

### Le chemin de la transaction {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

Les frais Solana vont au relayeur : il n'est donc jamais perdant. Chaque réponse de la passerelle est définitive : un bloc est validé une seule fois, donc `processed`, `confirmed` et `finalized` renvoient les mêmes données.

### La fenêtre : ce qu'elle borne {#window}

| Borne | Signification | Limite |
| ----- | ------------- | ------ |
| Blocs | La fenêtre expire après ce nombre de blocs. Un bloc dure environ 1,4 seconde sur le testnet (vérifié le 22 novembre 2026) : 3,600 blocs font donc environ 85 minutes | 1 à 17,280 |
| Transactions | Chaque transaction Solana admise compte pour une, même si elle échoue ensuite | 1 à 1,000 |
| Valeur | Chaque diminution du QOR natif du compte causée par des transactions admises, frais compris, est comptée. Une transaction qui dépasserait la valeur est refusée et annulée. La valeur s'exprime en uqor ou en QOR, par exemple `25qor` | supérieure à 0 |
| Programmes (facultatif) | Chaque instruction d'une transaction admise doit appeler l'un des programmes listés | jusqu'à 16 |

Règles qui découlent de la conception :

* La fenêtre n'est ouverte et fermée que par **votre propre signature post-quantique**, comme message de premier niveau. Elle est refusée sous authz, groupe ou contrat.
* Il vous faut une **clé post-quantique enregistrée** avant de pouvoir ouvrir une fenêtre.
* **Une clé Solana n'autorise qu'un compte à la fois.** Rouvrir une fenêtre remplace l'ancienne et libère sa clé.
* **Changer ou migrer votre clé post-quantique met fin à la fenêtre.**
* Outre le solde natif, la limite de valeur compte aussi le QOR que votre signature contrôle ailleurs : comptes dérivés du vôtre avec une graine, comptes de jetons que vous pouvez fermer, tables de consultation et comptes de chargeur dont vous êtes l'autorité. Dépensé ou remis à quelqu'un d'autre, il est compté. Une clé de fenêtre ne peut jamais sortir l'adresse propre de votre compte de l'état du portefeuille.
* Lire `getBalance` ou `getAccountInfo` pour la clé de fenêtre affiche votre solde natif tant que la fenêtre est ouverte.

### Limites connues de la fenêtre {#window-limits}

Lisez ceci avant d'ouvrir une fenêtre pour un portefeuille qui détient des jetons.

* **Les montants de jetons ne sont pas comptés dans la limite de valeur.** La limite ne compte que le QOR natif. Avec la portée par défaut (sans liste de programmes), la clé Solana peut transférer et brûler les jetons SPL du compte, et en créer avec une autorité de frappe que le compte détient, pour le seul prix des frais de transaction.
* **La portée par défaut refuse les autorisations durables.** Une clé qui agit par une fenêtre de portée par défaut ne peut pas approuver un délégué, changer le propriétaire ou l'autorité de fermeture d'un compte de jetons, ni changer l'autorité de frappe ou de gel d'un mint. Cela inclut un compte de jetons ou un mint créé dans la même transaction. Il faut pour cela votre propre signature post-quantique, ou une fenêtre dont la liste de programmes nomme le programme de jetons.
* **Le paiement d'un cosignataire compte dans la fenêtre.** Si une autre clé signe la même transaction Solana et y paie quelque chose, ce paiement compte aussi dans votre limite de valeur. Laissez un sponsor payer dans une transaction séparée, ou ouvrez une fenêtre dont la limite de valeur couvre tout ce que la transaction déplace.
* **Les autorisations faites sous une portée explicite de jetons survivent à la fenêtre.** Si la liste de programmes nomme le programme de jetons, les délégués et changements d'autorité faits par la fenêtre restent en place après la fermeture ou l'expiration de la fenêtre, ou la rotation de votre clé post-quantique. Révoquez-les avec votre propre signature.
* **Pour exclure entièrement les actions sur jetons,** ouvrez la fenêtre avec une liste de programmes qui ne nomme pas le programme de jetons.

### Frais {#fees}

| Élément | Valeur (testnet, 22 novembre 2026) |
| ------- | ---------------------------------- |
| Frais de base par signature | 0.045 QOR (45,000 uqor, 45,000,000 lamports). C'est le prix de 450,000 gas au prix de gas minimal de la chaîne, 0.1 uqor par gas, et `getFeeForMessage` le rapporte |
| Unités à l'écran | `solana` libelle les montants en **SOL**. Sur QoreChain, 1 « SOL » vaut 1 QOR, car 1 uqor vaut 1,000 lamports et 1 QOR vaut 1,000,000 uqor. Lisez « 0.045 SOL » comme 0.045 QOR |
| Frais de priorité | Seulement quand la transaction a besoin de plus de gas que ce que paient les frais de base. C'est le prix ComputeBudget multiplié par la limite d'unités |
| Un déploiement | Un frais de base par transaction d'écriture, plus un loyer qui revient quand vous fermez le programme |

Ce que vous payez est plafonné par ce que vous avez signé : vous payez le coût de la transaction porteuse, au moins les frais de base et au plus les frais que votre propre signature a promis. Un relayeur ne peut pas vous faire payer davantage.

Quand une transaction paie moins que ce que coûte son porteur, la passerelle la refuse avec le code `-32002` et indique la correction exacte. Les mêmes nombres figurent dans le `data` de l'erreur :

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

Les zéros représentent les nombres de votre transaction. Fixez `SetComputeUnitPrice` à `data.computeUnitPrice` et une limite d'unités d'au moins `data.computeUnitLimit` ; un micro-lamport de moins est de nouveau refusé. Avec `solana program deploy`, utilisez `--with-compute-unit-price <data.computeUnitPrice>`. Dans les exécutions d'avant-version, chaque étape d'un déploiement, d'une mise à niveau, d'une extension, d'une fermeture et d'un changement d'autorité normaux tenait dans les frais de base : vous rencontrerez donc surtout cette erreur avec un `--max-len` inhabituellement grand.

### Budgets « pour le compte de » {#on-behalf}

Un bénéficiaire authz qui envoie `MsgExecuteProgram`, `MsgCreateAccount` ou `MsgDeployProgram` en votre nom n'agit que dans votre fenêtre et son **budget distinct « pour le compte de »** : `on_behalf_max_txs` et `on_behalf_max_value`. Les limites propres de la clé et le budget pour le compte de ne peuvent pas s'épuiser l'un l'autre. Sans budget pour le compte de (le défaut), de telles délégations sont refusées et rien ne bouge. Un `MsgExecuteProgram` enveloppé dans une exécution authz dont le bénéficiaire est le compte lui-même compte aussi comme envoyé en votre nom : envoyez donc vos propres messages SVM comme messages de premier niveau.

Chaque exécution ou déploiement imbriqué fait aussi payer à votre compte les frais fixes SVM, `max(1, compute_budget_max / 1000)` uqor, soit 1,400 uqor à la valeur de paramètre en vigueur de 1,400,000. Ces frais comptent dans la limite de valeur pour le compte de. Fixez `--on-behalf-max-value` à au moins `on_behalf_max_txs` fois les frais fixes, plus la valeur que le bénéficiaire doit déplacer. Une valeur de 0 refuse toute exécution pour le compte de.

### Le chargeur {#loader}

| Vous exécutez | Ce que cela fait sur la chaîne |
| ------------- | ------------------------------ |
| `solana program deploy x.so` | Écrit le programme dans un tampon en de nombreuses petites transactions, puis le déploie. L'identifiant du programme est celui de `--program-id`, ou un identifiant neuf |
| `solana program deploy --program-id <id> x.so` pour un programme existant | Le met à niveau. Seule l'autorité de mise à niveau peut le faire |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Écrit, liste et ferme un tampon sans déployer |
| `solana program extend <id> <bytes>` | Agrandit la zone de données du programme |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Confie les mises à niveau à une autre clé. `--final` rend le programme permanent |
| `solana program close <id>` | Ferme le programme et rend le loyer |
| `anchor deploy` | Fait de même avec le programme construit par Anchor |

Un programme peut peser jusqu'à 10 MiB (le `max_program_size` en vigueur). Les programmes s'appellent entre eux sur 4 niveaux au plus (`max_cpi`). Le budget de calcul par défaut va jusqu'à 1,400,000 unités par instruction.

## Mots utilisés dans ce guide {#words}

| Mot | Sens simple |
| --- | ----------- |
| SVM | La machine virtuelle compatible Solana de QoreChain. Elle exécute les mêmes programmes compilés (SBF) que Solana |
| Lamport | La plus petite unité des outils Solana. 1 uqor vaut 1,000 lamports, et 1 QOR vaut 1,000,000,000 lamports |
| Fenêtre | Une permission courte et bornée donnée à une clé Solana pour agir au nom de votre compte. L'ouvrir exige une transaction signée avec votre clé post-quantique |
| Preuve de clé | La signature propre de la clé Solana sur un court texte. Elle prouve que vous détenez la clé que vous nommez |
| Nonce | Un compteur par clé Solana, augmenté à chaque fenêtre ouverte avec une preuve. La preuve suivante doit signer la valeur courante |
| Porteur | La transaction Native qui transporte une transaction Solana dans un bloc |
| Relayeur | Le compte qui signe et envoie le porteur. Les frais Solana le remboursent |
| Blockhash | Le hash de bloc récent sur lequel repose une transaction Solana. Il est valide 150 slots, soit environ 3,5 minutes ici |

## Avant de commencer {#prerequisites}

Il vous faut un terminal sous macOS ou Linux, environ 10 QOR de test, et ces outils (les versions de la colonne de droite sont celles utilisées pour cette page) :

| Outil | À quoi il sert | Version utilisée |
| ----- | -------------- | ---------------- |
| Ligne de commande Solana (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust et `cargo build-sbf` | Construire un programme | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor (facultatif) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 ou ultérieur | Le script de preuve de clé et le script d'appel | tout LTS actuel |
| `@solana/web3.js` 1.x | Appeler le programme | 1.99 |
| `qorechaind` v3.2.9 | Enregistrer votre clé post-quantique, ouvrir et fermer la fenêtre | le binaire de la version, voir ci-dessous |

Vérifiez ce que vous avez :

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**À propos de `qorechaind`.** Ouvrir une fenêtre est un message Native qui exige votre signature ML-DSA-87, et la commande `tx pqc open-svm-window` fait partie de la v3.2.9. Le 22 novembre 2026, le manifeste de version du testnet (`https://download.qore.host/testnet/latest.json`) listait encore la version 3.2.8 : le bundle v3.2.9 est donc celui nommé dans le texte de la proposition de gouvernance 39 (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). Le binaire de la version est construit pour Linux ; il n'existe pas de binaire macOS empaqueté. Un assistant du SDK pour la fenêtre n'est pas encore publié. Tout le reste de ce guide n'a besoin d'aucun nœud.

Il vous faut aussi un compte QoreChain avec du QOR de test (obtenez-en auprès du [faucet](/dashboard/faucet)) et une clé post-quantique enregistrée. Si ce n'est pas fait, suivez d'abord [Enregistrer votre clé](/developer-guide/post-quantum-signing#pqc-key-registration). Les commandes ci-dessous appellent la clé du compte `mykey` et sa clé post-quantique `mykey-mldsa`.

:::caution Clés de testnet jetables uniquement
Les deux paires de clés Solana que vous créez ci-dessous sont des fichiers contenant des clés secrètes. N'utilisez jamais une paire de clés qui détient de vrais fonds sur un autre réseau, et ne collez jamais une clé secrète dans une commande, une conversation ou un dépôt.
:::

## Pas à pas {#steps}

Créez un dossier de travail et une configuration Solana séparée, afin de ne pas toucher à vos réglages `solana` habituels :

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

L'alias exécute `solana` avec son propre fichier de configuration. Gardez le même terminal, ou répétez l'alias dans un nouveau.

### Étape 1 : pointer les outils Solana vers le testnet {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

La première ligne enregistre l'adresse RPC dans `solana-config.yml`. La deuxième demande sa version au nœud. Vous devriez voir `solana-core` `1.18.0-qorechain`, l'identifiant de chaîne `qorechain-diana` et le hash de genèse `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` (HTTP 200). La troisième affiche le slot courant, égal à la hauteur de bloc (environ 10,57 millions le 22 novembre 2026).

Les paramètres de la lane déterminent ce qui tient. Lisez-les une fois :

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Vous devriez voir `"enabled":true` et les limites du testnet en vigueur : `max_program_size` 10,485,760, `compute_budget_max` 1,400,000, `lamports_per_byte` 3,480, `max_cpi` 4. Si `enabled` vaut `false`, la lane est fermée et rien de ce qui suit ne peut fonctionner.

Le point d'accès public ne sert pas de websocket (une mise à niveau websocket a reçu HTTP 405 le 22 novembre 2026) : donnez donc `--use-rpc` aux commandes qui confirment une transaction (`solana program deploy`, `write-buffer`) et laissez l'outil interroger en HTTP simple. Anchor l'accepte après un double tiret.

### Étape 2 : créer deux paires de clés Solana {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

Les deux premières commandes écrivent chacune un fichier de paire de clés (un tableau JSON de 64 nombres : la graine secrète de 32 octets, puis la clé publique). Les deux dernières affichent les clés publiques en texte base58. Vous devriez voir deux adresses différentes de 32 à 44 caractères. Appelez-les `WINDOW_PUBKEY` et `DEPLOYER_PUBKEY`.

Pourquoi deux clés. La **clé de fenêtre** agira pour votre compte Native pendant un court moment. Elle ne détient rien elle-même ; elle dépense votre QOR dans la fenêtre. La **clé de déploiement** est une clé Solana ordinaire. Vous la financez depuis la fenêtre, puis elle déploie, met à niveau et possède le programme sans aucune fenêtre. N'utilisez pas la clé de fenêtre comme autorité de mise à niveau : le programme enregistre votre compte Native comme autorité, et `solana` refuse une mise à niveau signée par une clé qui n'est pas l'autorité enregistrée.

Définissez la clé de déploiement comme signataire par défaut de votre configuration Solana :

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Étape 3 : enregistrer votre clé post-quantique {#step-pqc}

Sautez cette étape si `qorechaind query pqc account <your qor address>` montre déjà une clé. Sinon, sur une machine disposant du `qorechaind` de la version :

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` crée la clé ML-DSA-87 et affiche sa clé publique en hexadécimal. `register-key-v2` la place sur votre compte, avec une preuve de possession. La requête devrait montrer la clé enregistrée. C'est la seule transaction qu'un nouveau compte peut signer avec la seule clé classique. L'explication complète, y compris la sauvegarde de la clé, se trouve dans [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration).

### Étape 4 : construire la preuve de clé {#step-proof}

La preuve est une signature Ed25519 par la clé de fenêtre sur ce texte exact, encodé en UTF-8 sans espaces et sans retour à la ligne final :

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

Pour une clé qui a déjà ouvert une ou plusieurs fenêtres, le nonce `N` suit après un `|` de plus :

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` est le nombre de fenêtres déjà ouvertes avec une preuve pour cette clé, écrit en décimal sans signe ni zéros initiaux. Pour une clé neuve, `N` vaut 0 et il n'y a pas de suffixe. La signature est de l'Ed25519 simple (RFC 8032) : pas de pré-hachage, pas de contexte, et pas d'en-tête de message hors chaîne Solana ; un portefeuille doit donc signer les octets UTF-8 bruts.

Ne construisez pas le texte à la main. Demandez-le à la chaîne :

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

La réponse contient le nonce et le texte exact :

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

C'est la réponse réelle du 22 novembre 2026 pour une adresse d'exemple. Signez `sign_bytes` avec la clé de fenêtre. Le script ci-dessous fait les deux opérations, avec Node.js seul (enregistrez-le sous `keyproof.mjs`) :

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

Vous devriez voir `nonce: 0`, le texte et une chaîne hexadécimale de 128 caractères. Conservez la chaîne hexadécimale. Elle est valide pour **une fenêtre** et seulement pour cet expéditeur, cette clé et cette chaîne.

**Vérifiez votre code avec un exemple publié.** Identifiant de chaîne `qorechain-diana`, expéditeur `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 octets de `0x11`), nonce 0 :

| Champ | Valeur |
| ----- | ------ |
| Clé publique (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Clé publique (hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Message (131 octets) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Signature (hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

Avec le nonce 1, le message fait 133 octets et se termine par `|1`. Le script ci-dessus a reproduit cette signature le 22 novembre 2026 à partir de la clé correspondante. Si votre code produit d'autres octets pour les mêmes entrées, les causes habituelles sont un retour à la ligne final, un pré-hachage, l'en-tête hors chaîne Solana ou un nonce de mauvaise valeur.

Vous n'êtes pas obligé d'exécuter le script : la commande de l'étape suivante peut signer elle-même avec le fichier de paire de clés (`--svm-keypair`). Utilisez le script quand la clé se trouve ailleurs, par exemple dans un portefeuille capable de signer un message simple, et passez son résultat avec `--svm-key-proof`.

### Étape 5 : ouvrir la fenêtre {#step-open}

Construisez la transaction, puis ajoutez la signature post-quantique. Cet exemple ouvre une fenêtre de 3,600 blocs (environ 85 minutes), jusqu'à 10 transactions et 10 QOR au total (valeur plus frais), limitée au programme System (transferts) et au chargeur (déploiements) :

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

La première commande construit `window-open.json`. Les arguments positionnels sont la clé publique Solana, le nombre de blocs, le nombre de transactions et la valeur. Elle lit le nonce sur la chaîne et signe la preuve de clé avec `window.json`. La seconde commande ajoute votre signature ML-DSA-87 et envoie la transaction. Vous devriez voir un hash de transaction et le code 0.

Pour utiliser plutôt la preuve du script, remplacez `--svm-keypair ...` par `--svm-key-proof <hex from Step 4>`. Si vous ne donnez aucune des deux options, la commande refuse et affiche le texte exact à signer. Si la clé a déjà ouvert des fenêtres, la commande lit elle-même le nonce ; avec `--svm-key-proof`, vous pouvez le fixer avec `--svm-key-nonce <N>`.

Relisez la fenêtre :

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

Vous devriez voir `"found":true` et `"live":true`, avec `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs`, et `key_proven` à `true`. Vous pouvez aussi la lire par la clé Solana : `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. Les champs `key_proof_required`, `key_usable` et `key_proof_nonce` (la prochaine valeur à signer) y figurent aussi.

La liste de programmes nomme le programme System et le chargeur parce que c'est la combinaison testée. Dans ce guide, la clé de fenêtre ne fait que des transferts, et le déployeur déploie. Si vous laissez un jour la clé de fenêtre payer directement un déploiement, la liste doit nommer les deux programmes.

### Étape 6 : financer le déployeur {#step-fund}

Tant que la fenêtre est ouverte, la clé de fenêtre dépense votre QOR. Envoyez 5 QOR au déployeur :

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

La première ligne montre votre solde Native tel que la clé de fenêtre le voit (en « SOL » : lisez QOR). La deuxième envoie 5 QOR ; l'option `--keypair` fait de la clé de fenêtre le signataire pour cette seule commande, et `--allow-unfunded-recipient` est nécessaire parce que le déployeur ne détient encore rien. La troisième devrait montrer `5 SOL`, soit 5 QOR. Le transfert coûte 5.045 QOR à votre compte en tout : les 5 QOR plus les 0.045 QOR de frais de base, et les compteurs de la fenêtre (`used_txs` 1, `used_value` 5,045,000) le montrent.

Si l'opération est refusée avec `this node relays no Solana transactions`, voir [Envoyer sans la passerelle publique](#relay).

### Étape 7 : construire un petit programme {#step-build}

```bash
cargo init --lib hello
cd hello
```

Remplacez `Cargo.toml` par :

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

Remplacez `src/lib.rs` par :

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

Cela compile le programme pour SBF. Vous devriez voir `hello.so` (environ 19 KB) et `hello-keypair.json`, la clé dont l'adresse devient l'identifiant du programme. Les avertissements du compilateur sur `unexpected cfg` sont sans gravité. Le programme écrit une ligne de journal et ne fait rien d'autre.

### Étape 8 : déployer {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

Cela écrit le programme en une vingtaine de petites transactions, puis le déploie. `solana` estime d'abord le coût et vérifie votre solde : pour la version de 18,896 octets, il a affiché une dépense de 0.133 QOR (loyer) et des frais de 1.035 QOR le 22 novembre 2026, soit 23 transactions à 0.045 QOR. Vous devriez finir sur `Program Id: <address>`. Vérifiez-le :

```bash
qsol program show <program id>
```

Vous devriez voir l'identifiant du programme, le chargeur (`BPFLoaderUpgradeab1e11111111111111111111111`), une adresse ProgramData, l'**autorité** (votre clé de déploiement), le slot de déploiement et la longueur des données. Si vous avez lancé le déploiement et qu'il s'arrête en route, `solana` affiche une phrase de récupération de 12 mots pour la clé du tampon temporaire. Gardez-la jusqu'à la fin du déploiement : avec elle, vous reprenez le même tampon en passant la paire de clés récupérée au `program deploy` ou `write-buffer` suivant, et vous pouvez fermer le tampon pour récupérer son loyer.

Pour un programme construit avec Anchor, ajoutez `--skip-feature-verify` à `solana program deploy`, comme l'ont fait les exécutions d'avant-version.

#### Avec Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` compile le programme modèle et `anchor deploy` le déploie à l'identifiant de programme de `declare_id!`. Un programme modèle pèse environ 130 KB, soit environ 130 transactions d'écriture à 0.045 QOR : financez donc d'abord le déployeur avec au moins 10 QOR. Dans l'exécution d'avant-version, un programme de 128 KB a coûté environ 6.8 QOR, surtout en frais d'écriture, le loyer revenant à la fermeture. Un second `anchor deploy` après une modification du code met le programme à niveau. Anchor saute l'envoi de l'IDL pour une adresse locale ; l'envoi de l'IDL vers le testnet n'a pas été testé.

### Étape 9 : appeler le programme {#step-call}

`solana` ne peut pas appeler un programme arbitraire : utilisez donc un court script web3.js. Dans un dossier vide :

```bash
npm init -y
npm install @solana/web3.js@1
```

Enregistrez sous `call.cjs` :

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

Le script construit une instruction pour votre programme, la signe avec la clé de déploiement, l'envoie, interroge jusqu'à ce que la signature ait un statut, et affiche le journal du programme. Le payeur de frais est le déployeur : aucune fenêtre n'est donc nécessaire. Vous devriez voir une signature, `status: finalized err: null`, `fee (lamports): 45000000`, et des journaux comme ceux-ci (forme tirée de l'exécution d'avant-version ; le message est celui de votre programme) :

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Étape 10 : lire le résultat {#step-read}

| Vous voulez | Commande ou appel |
| ----------- | ----------------- |
| Le statut d'une transaction | `qsol confirm -v <signature>`, ou `getSignatureStatuses` |
| Ses journaux, ses frais et les variations de solde | `getTransaction` avec `maxSupportedTransactionVersion: 0` (le script ci-dessus) |
| Le programme et son autorité | `qsol program show <program id>` |
| Tous les programmes du déployeur | `qsol program show --programs` |
| Un compte de données | `qsol account <address>`, ou `getAccountInfo` |
| Votre fenêtre, par compte ou par clé | `GET /qorechain/pqc/v1/svm_window/<address>` et `.../svm_window_by_key/<pubkey>` |

Une transaction qui échoue à l'intérieur d'un bloc (par exemple parce que vous avez sauté la vérification préalable de la passerelle avec `--skip-preflight`) conserve sa signature et paie ses frais, et ses effets sont annulés. Dans l'exécution d'avant-version, un transfert supérieur à la limite de valeur de la fenêtre, envoyé avec `--skip-preflight`, a été inclus puis a échoué avec `Error processing Instruction 0: generic instruction error`, et le transfert a été annulé. Sans `--skip-preflight`, il est refusé plus tôt, à la passerelle, avec `-32002 ... SVM authorisation window exhausted`.

### Étape 11 : mettre à niveau, transmettre, étendre et fermer {#step-admin}

Toutes ces opérations utilisent la clé de déploiement comme signataire et n'ont besoin d'aucune fenêtre.

| Tâche | Commande |
| ----- | -------- |
| Mettre à niveau après une modification du code | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Agrandir la zone de données de N octets | `qsol program extend <program id> N` |
| Confier les mises à niveau à une autre clé | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Rendre le programme permanent | `qsol program set-upgrade-authority <program id> --final` |
| Écrire un tampon sans déployer, lister les tampons | `qsol program write-buffer x.so --use-rpc`, puis `qsol program show --buffers` |
| Fermer un tampon, ou fermer le programme et récupérer le loyer | `qsol program close <buffer or program id>` (un programme exige aussi `--bypass-warning`) |

Une mise à niveau par une clé qui n'est pas l'autorité est refusée. Après `set-upgrade-authority`, l'ancienne autorité est refusée et la nouvelle peut mettre à niveau. Après `--final`, une mise à niveau est refusée avec un message indiquant que le programme n'est plus évolutif. Un programme fermé ne peut plus être appelé et `program show` indique qu'il a été fermé.

### Étape 12 : fermer la fenêtre {#step-close}

Vous pouvez fermer une fenêtre quand vous avez fini, et vous devez la fermer immédiatement si vous pensez que la clé Solana a été exposée. Tout ce que la fenêtre admettait encore est refusé dès le bloc suivant :

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Relisez la fenêtre : elle ne devrait plus être active, et `qsol balance <WINDOW_PUBKEY>` devrait de nouveau montrer 0. La clé de fenêtre ne peut plus déplacer votre QOR. La clé de déploiement, le programme et les fonds que vous avez créés par la fenêtre restent à vous.

Pour ouvrir une nouvelle fenêtre pour la même clé, refaites l'Étape 4 : le nonce est maintenant plus élevé, et une preuve faite pour l'ancienne fenêtre est refusée avec `expected_nonce`.

## Envoyer sans la passerelle publique {#relay}

La passerelle publique `svm-testnet.qore.host` a refusé de relayer le 22 novembre 2026 (voir l'encadré en haut). Il y a deux façons d'envoyer en attendant qu'elle relaie.

**Une transaction isolée par la ligne de commande.** Tout compte natif qui détient du QOR et possède une clé post-quantique enregistrée peut porter une transaction Solana que vous avez signée. Construisez et signez d'abord la transaction Solana, par exemple avec web3.js, et affichez-la en base64 (`tx.serialize().toString("base64")`). Une transaction est valide environ 3,5 minutes après le blockhash qu'elle utilise. Puis :

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Fixez `--gas` et `--fees` à partir d'un essai à blanc : lancez d'abord `tx pqc cosign` avec `--dry-run` (il affiche une estimation de gas et n'envoie rien), puis utilisez l'estimation plus 30 % comme `<GAS>` et des frais d'au moins `<GAS>` fois 0,1 uqor comme `<FEES>`. Un simple transfert demande environ 300 000 à 400 000 de gas ; un déploiement ou une proposition qui porte du code en demande beaucoup plus.

Le compte de `--from` est le relayeur. Il signe le porteur et paie son gas, et le payeur de frais Solana le rembourse. Le relayeur n'acquiert aucune autorité sur la transaction Solana. Les frais du porteur doivent être couverts par ce que paie la transaction Solana : 45,000 uqor pour une signature. C'est praticable pour un transfert ou un appel, pas pour le déploiement de nombreuses transactions d'écriture. Cette voie n'a pas été exécutée sur le testnet réel pour cette page.

**Votre propre passerelle.** Un nœud qui suit le testnet et exécute le binaire v3.2.9 sert le JSON-RPC Solana sur le port 8899 et relaie quand la section `[svm-rpc]` de son `app.toml` nomme un relayeur : `relayer-key` (un compte financé du trousseau du nœud, ou plusieurs séparés par des virgules), `relayer-pqc-key` (leurs clés ML-DSA-87 dans le dossier `pqc` du nœud) et `relayer-keyring-backend`. Avec `relayer-key` vide, `sendTransaction` est refusé, comme sur le point d'accès public aujourd'hui. Laissez `relayer-fee` vide : le relayeur fixe alors le prix de chaque porteur d'après ce que paie la transaction Solana, et n'est donc jamais perdant. Copiez tout le dossier `lib/` du bundle de la version. Cette configuration n'a pas été exécutée pour cette page ; voir [Exécuter un nœud](/developer-guide/running-a-node) pour le nœud lui-même.

## Limites à prévoir {#limits}

* **Quota de relais.** Une transaction Solana envoyée par une passerelle compte contre son payeur de frais : 600 par 30 blocs par défaut, soit bien moins d'une minute. Un gros déploiement depuis une seule clé peut le dépasser (un programme de 1 MB fait environ 1,100 écritures). Les écritures refusées ne coûtent rien. Écrivez d'abord le tampon avec `qsol program write-buffer`, attendez une minute et relancez avec le même tampon s'il s'arrête, puis déployez depuis le tampon avec `--buffer`, ou faites payer les écritures du tampon et le déploiement par des payeurs de frais différents.
* **Part équitable de la passerelle.** Une passerelle garde une partie de sa capacité pour les clients qui ont envoyé peu de transactions et partage le reste équitablement entre les réseaux de clients actifs. Si vous êtes refusé avec un message de part équitable (code `-32005`), attendez une minute ou utilisez une autre passerelle.
* **La transaction doit être incluse avant l'expiration de son blockhash** (150 slots). `solana` renvoie pour vous ; un script devrait faire de même.
* **Une transaction pèse au plus 1,232 octets, avec au plus 64 comptes,** comme sur Solana. Les messages legacy et de version 0 sont acceptés.
* **Programmes et comptes :** 10 MiB chacun ; pile de 32 KiB et tas de 256 KiB par cadre.
* **Les limites de garde** de [Lane SVM (v3.2.8)](/developer-guide/svm-lane-v328#custody) s'appliquent toujours : un dépôt peut être refusé avec `svm custody cap exceeded` (code 23) quand le réservoir SVM est à son plafond.
* **Noms dans la liste de la fenêtre.** `--allowed-programs` prend des identifiants de programme en base58, 16 au plus, chacun une seule fois. Une portée s'applique aux instructions de premier niveau de la transaction : un programme listé qui en appelle d'autres transmet votre signature, listez donc seulement des programmes auxquels vous faites confiance dans leur ensemble.
* **Adresses.** Un nouveau message v3.2.9 refuse une adresse bech32 qui n'est pas dans sa forme canonique en minuscules. Envoyez la forme que produit `toBech32`.

## Dépannage {#troubleshooting}

Les textes marqués « live » ont été vus sur le testnet réel le 22 novembre 2026. Les autres sont les messages propres à la chaîne et à la passerelle, tels que vus dans les exécutions d'avant-version.

| Ce que vous voyez | Ce que cela signifie | Que faire |
| ----------------- | -------------------- | --------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (code JSON-RPC `-32603`, live) | La passerelle n'a pas de compte relayeur | Utilisez [votre propre passerelle ou le relais en ligne de commande](#relay), ou attendez les opérateurs |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live, venant de `solana`) | La clé ne détient rien. Lisez SOL comme QOR | Ouvrez la fenêtre et financez la clé, ou ouvrez la fenêtre et utilisez la clé de fenêtre comme signataire |
| Simulation `InsufficientFundsForFee`, journal `fee payer ... has no account: insufficient fee` (live) | Même cause, vue depuis une simulation | Même correction |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (code `-32602`, live) | Les octets ne sont pas une transaction Solana signée | Envoyez la transaction filaire signée complète, en base64 ou base58 |
| HTTP 405 sur une mise à niveau websocket (live) | Le point d'accès public ne sert pas de websocket | Ajoutez `--use-rpc` à `solana program deploy` et `write-buffer` ; interrogez avec `getSignatureStatuses` dans les scripts |
| `-32002 ... insufficient priority fee ...` | La transaction paie moins que ce que coûte son porteur | Fixez le prix et la limite d'unités ComputeBudget d'après le `data` de l'erreur ; voir [Frais](#fees) |
| `-32002 ... SVM authorisation window exhausted` | La fenêtre a épuisé ses blocs, transactions ou sa valeur, ou la transaction dépasserait la valeur | Lisez la fenêtre, ouvrez-en une nouvelle avec plus de valeur ou plus de transactions |
| `no open SVM authorisation window` (codespace `pqc`, code 341) | La clé n'a pas de fenêtre active | Ouvrez-en une (Étape 5) |
| Ouverture refusée avec le code 343 et `expected_nonce=<N>` | La preuve a été signée sur un autre nonce, par exemple une ancienne preuve | Relisez la route du nonce (Étape 4), signez de nouveau |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | La signature ne correspond pas au texte | Signez exactement `sign_bytes` de la route du nonce, avec la bonne clé et le bon expéditeur |
| `--svm-keypair holds the key X, not Y` (CLI) | Le fichier de paire de clés n'est pas la clé que vous avez nommée | Utilisez la paire de clés qui correspond à la clé base58 |
| `the window needs the proof that you hold the Solana key` (CLI) | Vous n'avez donné ni `--svm-keypair` ni `--svm-key-proof` | Donnez l'une des deux ; le message affiche le texte à signer |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | Une borne de la fenêtre est hors limites | Utilisez des valeurs dans le tableau de [La fenêtre](#window) |
| `svm_pubkey ... is not a valid ed25519 public key`, ou `... is a native account address, not an ed25519 key` | La clé est une adresse de programme ou une de vos adresses QoreChain | Utilisez une paire de clés créée avec `solana-keygen` |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | Le quota de relais d'un payeur de frais | Attendez une minute, reprenez avec le même tampon ; voir [Limites](#limits) |
| `-32005` avec `fair share of the relayer quota` | La passerelle partage sa capacité | Réessayez après une minute |
| `-32020 node is starting, no committed state` | Le nœud n'a pas encore d'état | Réessayez dans quelques secondes |
| `node busy: the carrier could not be measured now, retry` | La passerelle n'a pas pu fixer le prix du porteur à cet instant | Réessayez |
| `Transaction simulation failed: Blockhash not found` | Le blockhash a plus de 150 slots ou est inconnu | Récupérez un blockhash récent, signez et envoyez de nouveau |
| `Transaction simulation failed: This transaction has already been processed` | La même transaction signée a déjà été vue | Vérifiez `getSignatureStatuses` ; ne la renvoyez pas |
| Une transaction Solana est refusée avec `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` ou `cannot change the mint or freeze authority`, avec `the grant would outlive the window` | Une fenêtre de portée par défaut refuse les autorisations durables sur les jetons | Signez cette action avec votre propre clé post-quantique sur la lane Native, ou ouvrez une fenêtre dont la liste de programmes nomme le programme de jetons (voir [Limites connues](#window-limits)) |
| `SVM module is disabled` (code 11) | La lane est fermée. C'est l'état du mainnet | Utilisez le testnet |
| `svm custody cap exceeded` (code 23) | Le réservoir SVM est à son plafond | Réessayez plus tard ou avec un montant plus petit |
| `solana program deploy` d'un programme construit avec Anchor est refusé côté client sur les fonctionnalités du programme | L'outil vérifie les fonctionnalités ELF | Ajoutez `--skip-feature-verify` |
| Une mise à niveau par la clé de fenêtre est refusée par `solana` | L'autorité enregistrée est votre compte Native, pas la clé | Déployez avec une clé de déploiement séparée comme dans ce guide |
| Ouverture ou fermeture de fenêtre refusée sous authz, groupe ou contrat | Les fenêtres ne s'ouvrent et ne se ferment que par votre propre signature | Envoyez le message comme message de premier niveau depuis votre compte |

## Ce qui a été vérifié {#tested}

| Vérification | Où et quand | Résultat |
| ------------ | ----------- | -------- |
| `GET /qorechain/svm/v1/params` et `/cluster_info` | testnet réel, 22 novembre 2026 | `enabled` et `execution_enabled` tous deux à `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (base58), `getMinimumBalanceForRentExemption(1024)` | testnet réel, 22 novembre 2026 | `ok` ; `1.18.0-qorechain` ; hash de genèse comme ci-dessus ; blockhash base58 de 44 caractères ; 8,017,920 lamports |
| `getFeeForMessage` et `simulateTransaction` pour un transfert à une signature | testnet réel, 22 novembre 2026 | frais de 45,000,000 lamports (0.045 QOR) ; un payeur non financé donne `InsufficientFundsForFee` |
| Route du nonce de preuve de clé et routes de fenêtre | testnet réel, 22 novembre 2026 | nonce 0, `sign_bytes` comme à l'Étape 4 ; `found` à `false` pour une adresse sans fenêtre |
| Script de preuve de clé de l'Étape 4 contre l'exemple publié | route du testnet réel, 22 novembre 2026 | signature identique à celle du tableau |
| Construction du programme avec `cargo build-sbf` (4.0.0, platform tools v1.53) | machine locale, 22 novembre 2026 | `hello.so` de 18,896 octets |
| Estimation du coût de `solana program deploy` depuis une clé non financée | testnet réel, 22 novembre 2026 | refusé côté client avec dépense de 0.133 QOR et frais de 1.035 QOR |
| `sendTransaction` d'un transfert bien formé | testnet réel, 22 novembre 2026 | refusé : `this node relays no Solana transactions` |
| Mise à niveau websocket sur le point d'accès public | testnet réel, 22 novembre 2026 | HTTP 405 |
| Ouverture de fenêtre, `solana transfer` depuis la clé de fenêtre, déploiement, appel, mise à niveau, changement d'autorité, extension, fermeture, `anchor deploy` et mise à niveau | réseau de test local avant la version, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | réussi |
| Les mêmes étapes sur le testnet réel | non exécutées : la passerelle publique n'a rien relayé le 22 novembre 2026, et aucun QOR de test n'a été dépensé pour cette page | non exécuté |

## Mainnet {#mainnet}

Le mainnet fonctionne avec une version qui ne contient rien de tout cela : la lane SVM y est désactivée, ses points d'accès SVM publics sont en lecture seule, les appels inter-VM restent en pause et l'envoi de contrats reste réservé à la gouvernance. N'ouvrez pas de fenêtres, ne déployez pas et n'envoyez pas de transactions Solana sur le mainnet ; planifiez uniquement sur le testnet.

## Voir aussi {#see-also}

* [Lane SVM (v3.2.8)](/developer-guide/svm-lane-v328) : l'état de la lane, le loyer, les limites de garde et la clé post-quantique d'un portefeuille SVM.
* [Développement SVM](/developer-guide/svm-development) : la vue d'ensemble de la lane et le serveur JSON-RPC.
* [JSON-RPC compatible Solana](/api-reference/json-rpc-solana-compatible) : la liste des méthodes.
* [Signature post-quantique](/developer-guide/post-quantum-signing) : enregistrer et utiliser votre clé ML-DSA-87.
* [Référence de la fenêtre d'autorisation EVM](/developer-guide/evm-window-reference) : la même idée pour les clés de style Ethereum.
* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) : appels entre SVM, EVM et QoreChain Native.
* [Historique des versions](/appendix/version-history#v329) : ce que la v3.2.9 a changé.
