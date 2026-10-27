---
slug: /developer-tools/mcp
title: Serveur MCP QoreChain
sidebar_label: Serveur MCP
sidebar_position: 23
---

# Serveur MCP QoreChain (`@qorechain/mcp`)

Le serveur MCP QoreChain donne aux agents IA et aux outils de développement un accès en lecture à QoreChain via le [Model Context Protocol](https://modelcontextprotocol.io) : blocs, transactions, comptes, validateurs, niveaux de staking, état de la signature hybride secp256k1 plus ML-DSA-87 (FIPS 204), lectures de contrats EVM, simulation et estimations de frais, et transferts non signés que le propriétaire du compte signe dans son propre wallet. Il s'adresse aux développeurs qui connectent un client ou un agent compatible MCP à QoreChain, et aux équipes qui veulent une vue de la chaîne scriptable, en lecture seule, avec une sortie stable.

Le serveur ne signe jamais, ne détient jamais de clés et ne diffuse jamais de transaction. Il s'exécute sur votre machine via stdio, ou comme serveur Streamable HTTP que vous hébergez ou que QoreChain héberge. Version **0.1.0**, publiée le 27 octobre 2026, Apache-2.0. Un jumeau en ligne de commande, [`qore`](/developer-tools/qore-cli), exécute les mêmes outils depuis un terminal.

## Innovations {#innovations}

- **Une vérification de la signature hybride, pas seulement une étiquette.** `get_pq_status` prend un hash de transaction, confirme que le corps porte exactement une couche `/qorechain.pqc.v1.PQCHybridSignature`, et vérifie localement cette couche ML-DSA-87 avec [QoreSign](/qoresign/overview) par rapport à la clé que le signataire a enregistrée sur la chaîne, en essayant les sign-bytes v1 et v2. La réponse est `verified: true` ou `false` avec la raison, et non une supposition tirée du type de transaction.
- **Des transferts non signés qui portent les vrais frais.** `prepare_transfer` lit le numéro de compte, la séquence et la clé publique de l'expéditeur, simule le transfert avec une couche ML-DSA-87 factice de la bonne taille afin que le gas inclue la couche ajoutée par le wallet lors de la signature, puis renvoie le SignDoc, un résumé lisible et des vérifications. La seule chose qui manque est la signature du propriétaire.
- **Une simulation avec des refus décodés.** `simulate_tx` et `estimate_fee` renvoient le gas utilisé, une limite de gas suggérée, la variation de solde par adresse et, lorsque le réseau rejetterait la transaction, un refus décodé plutôt qu'une chaîne d'erreur brute.
- **Un seul schéma pour le serveur et la CLI.** Chaque commande `qore` exécute un outil MCP, et `qore --json` affiche exactement le JSON que renvoie l'outil. Le paquet Python sert les mêmes noms d'outils, les mêmes schémas d'entrée et de sortie et les mêmes codes d'erreur ; les deux sont testés avec les mêmes réponses de chaîne enregistrées.
- **Les secrets sont refusés avant que quoi que ce soit ne quitte la machine.** Une entrée qui ressemble à une phrase de récupération (12 mots BIP-39 consécutifs ou plus) ou à une clé privée brute de 32 octets est rejetée avec `INVALID_INPUT` avant toute requête, et l'erreur indique à l'utilisateur de considérer ce secret comme exposé.
- **Des réponses construites champ par champ.** Chaque sortie est assemblée à partir de champs nommés de la réponse de la chaîne. Les corps d'erreur et les traces d'appels en amont n'atteignent jamais le client ; les échecs correspondent à sept codes d'erreur stables.

## Comment l'utiliser {#how-to-use}

Il vous faut Node.js 20 ou plus récent pour le paquet npm, ou Python 3.10 ou plus récent pour le paquet Python.

### L'exécuter en local avec npx {#run-npx}

Vérifiez que le serveur démarre, puis ajoutez-le à votre client MCP. La plupart des clients qui lancent des serveurs locaux lisent un fichier JSON contenant un objet `mcpServers` (le nom du fichier et les noms de clés pour les serveurs HTTP diffèrent selon le client ; voir la documentation de votre client) :

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

Redémarrez le client. Il liste 14 outils. Le serveur parle stdio au client. Demandez ensuite, par exemple :

- « Quel est le dernier bloc du mainnet QoreChain ? » (`get_block`)
- « La transaction testnet F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 porte-t-elle une couche ML-DSA-87 valide ? » (`get_pq_status`)
- « Prépare un transfert testnet de 1,5 QOR de mon adresse vers qor1... et estime les frais. » (`prepare_transfer`, `estimate_fee`)

### L'exécuter en local avec pip ou uvx {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Le paquet Python ne sert que stdio. Pour Streamable HTTP, les clés d'API et les limites de débit, utilisez le paquet npm (ci-dessous). Le paquet propose aussi un point d'entrée de bibliothèque, `run_tool`.

### L'exécuter comme serveur HTTP {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

Le transport HTTP est sans état et répond en JSON : `POST /mcp` pour les requêtes MCP, `GET /healthz` pour `{"status":"ok"}`. Options :

| Option | Défaut | Signification |
|---|---|---|
| `--port` | 8787 | port TCP |
| `--host` | 127.0.0.1 | adresse d'écoute ; `0.0.0.0` écoute sur toutes les interfaces |
| `--api-keys-file` | aucun | fichier de hashes SHA-256 des clés acceptées ; lorsqu'il est défini, les requêtes doivent porter `Authorization: Bearer <key>` |
| `--rate-limit` | 60 | requêtes par minute par clé d'API et par IP client ; `0` le désactive |
| `--allowed-origin` | aucun | origine de navigateur autorisée à appeler le point d'accès (répétable) ; les autres origines reçoivent HTTP 403 |
| `--trust-proxy` | désactivé | prend l'IP du client dans `X-Forwarded-For` ; uniquement derrière un proxy que vous contrôlez |
| `--network` | testnet | réseau pour les appels qui n'en nomment aucun |

Pour protéger votre propre point d'accès, créez une clé, ne stockez que son hash, et donnez la clé au client :

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` contient un hash de 64 caractères hexadécimaux par ligne (un préfixe `sha256:` facultatif est accepté, `#` ouvre un commentaire). Une clé absente ou inconnue reçoit HTTP 401 avec un message d'erreur qui commence par `UNAUTHORIZED` ; au-delà de la limite de débit, le serveur répond HTTP 429 avec `Retry-After`. Placez TLS devant tout serveur accessible depuis l'extérieur de votre machine.

Le paquet exporte aussi `createServer`, `createHttpHandler` et `startNodeServer` pour l'intégrer dans votre propre runtime. Détails complets : [auto-hébergement](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) dans le dépôt source.

### Configuration {#configuration}

| Paramètre | Comment | Effet |
|---|---|---|
| Réseau par appel | l'argument `network` de n'importe quel outil : `testnet` ou `mainnet` | Choisit la chaîne pour cet appel |
| Réseau par défaut | `--network testnet` ou `--network mainnet` sur la commande du serveur | Le réseau utilisé lorsqu'un appel n'en nomme aucun. Par défaut `testnet` |
| Port, hôte, clés, limites HTTP | options de `serve` ci-dessus | Mode HTTP uniquement |
| Délai d'attente en amont | fixé à 10 secondes par requête, limite de réponse de 4 MiB, aucune nouvelle tentative | Les points d'accès lents donnent `UPSTREAM_UNAVAILABLE` |

Le mainnet est `qorechain-vladi` (ID de chaîne EVM 9801) et le testnet est `qorechain-diana` (ID de chaîne EVM 9800). Un transfert préparé pour le mainnet porte un avertissement supplémentaire. Il n'existe pas de variables d'environnement pour le réseau : c'est l'option de ligne de commande ou l'argument par appel. Pour faire du mainnet le réseau par défaut d'un client :

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Outils {#tools}

Les 14 outils sont en lecture seule et acceptent un `network` facultatif. Leurs entrées et sorties sont générées à partir des propres schémas du serveur ; la [référence des outils](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) liste chaque champ.

| Outil | Ce qu'il renvoie |
|---|---|
| `get_chain_info` | IDs de chaîne, dernier bloc, prix minimal du gas, version des sign-bytes, interrupteurs de fonctionnalités du protocole, une mise à niveau en attente si elle est planifiée, précompilés EVM actifs |
| `get_block` | un bloc (ou le dernier) : hash, heure, proposeur, nombre de transactions et jusqu'à 100 hashes de transactions |
| `get_transaction` | une transaction par hash natif ou hash EVM (préfixe `0x`) : statut, frais, mémo, gas, jusqu'à 50 messages, signataires et niveau de signature (`pqc`, `enrollment`, `shake` ou `classical`) |
| `get_address_info` | les deux formes d'adresse (`qor1...` et `0x...`), état du compte, jusqu'à 100 soldes, montant staké, présence ou non d'une clé ML-DSA-87 enregistrée, présence ou non de bytecode déployé |
| `get_pq_status` | pour une adresse : clé enregistrée, algorithme, preuve de possession, fenêtre d'autorisation EVM. Pour une transaction : si elle a exactement une couche hybride et si elle se vérifie |
| `get_validators` | validateurs par stake (bonded par défaut, 50 au plus, limite jusqu'à 200) : statut, indicateur jailed, stake, part du pouvoir de vote, commission |
| `get_staking_tiers` | le module des niveaux de staking : conditions de verrouillage et bonus, pénalité de déblocage anticipé, le pool de bonus, et éventuellement les verrous d'un détenteur. Chaîne v3.2.4 et suivantes |
| `search` | détecte une hauteur de bloc, un hash de transaction, une adresse ou un validateur à partir d'une seule chaîne, le lit et nomme l'outil qui renvoie les mêmes données |
| `read_contract` | uniquement un `eth_call` EVM, avec encodage ABI facultatif d'une signature de fonction et décodage du résultat |
| `estimate_fee` | gas simulé, limite de gas suggérée et frais (limite de gas multipliée par le prix minimal du gas), couche ML-DSA-87 comprise |
| `simulate_tx` | gas utilisé, limite de gas suggérée, variation de solde par adresse et refus décodé pour une transaction encodée |
| `prepare_transfer` | un `MsgSend` d'uqor non signé : SignDoc, résumé lisible, vérifications et avertissements |
| `get_token_holders` | toujours `NOT_AVAILABLE_ON_CHAIN` : lister les détenteurs demande un indexeur que les points d'accès publics ne fournissent pas |
| `request_faucet` | toujours `NOT_AVAILABLE_ON_CHAIN` : les QOR du testnet viennent du [Faucet](/dashboard/faucet) du tableau de bord |

Les erreurs sont des résultats d'outil avec `isError: true` et un corps JSON `{"error": {"code", "message", "details?"}}`. Les codes sont `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` et `INTERNAL_ERROR`.

### Ce qui a été exécuté {#what-was-run}

Le 27 octobre 2026, les paquets publiés ont été installés depuis les registres et exécutés contre les points d'accès publics du testnet et du mainnet :

- `qorechain-mcp --version` a affiché `0.1.0` ; via stdio, `initialize` a renvoyé le nom de serveur `qorechain-mcp` et `tools/list` a renvoyé les 14 noms d'outils ci-dessus ; `pip install qorechain-mcp==0.1.0` s'est installé et son `--version` a affiché `0.1.0`.
- `qorechain-mcp serve --port 18787` a répondu à `GET /healthz` par `{"status":"ok"}` et à un `tools/call` pour `get_chain_info` via `POST /mcp`.
- `get_chain_info` a renvoyé la chaîne `qorechain-diana`, l'ID de chaîne EVM 9800, le prix minimal du gas 0.1 uqor et les sign-bytes `v2` sur le testnet, et la chaîne `qorechain-vladi`, l'ID de chaîne EVM 9801 et les sign-bytes `v2` sur le mainnet.
- `get_pq_status` sur la transaction testnet ci-dessus a renvoyé le niveau `pqc`, exactement une couche hybride, et `verified: true` avec les sign-bytes `v2`.
- `prepare_transfer` pour 1,5 QOR sur le testnet a renvoyé un SignDoc avec une limite de gas de 171698 et des frais de 17170 uqor (0,01717 QOR), et `simulate_tx` sur sa transaction non signée a renvoyé `ok: true` avec les frais débités de l'expéditeur. Rien n'a été signé ni envoyé.

## Comment y accéder {#how-to-access}

- **En local (option principale).** stdio via `npx -y @qorechain/mcp` ou `uvx qorechain-mcp`. Aucun compte ni clé d'API n'est nécessaire. Il lit les points d'accès publics de QoreChain, il faut donc une sortie HTTPS.
- **Votre propre serveur HTTP.** `qorechain-mcp serve`, comme ci-dessus, avec les clés d'API et les limites de débit que vous configurez.
- **Point d'accès hébergé.** `https://mcp.qorechain.io/mcp` sert le transport Streamable HTTP. Il utilise le testnet sauf si un appel nomme `"network": "mainnet"`. Chaque requête exige une clé d'API envoyée sous la forme `Authorization: Bearer <key>` ; demandez-en une depuis votre tableau de bord (voir ci-dessous). Sans clé, le point d'accès répond HTTP 401 (`UNAUTHORIZED`), ce qui était la réponse le 27 octobre 2026. Chaque clé est limitée à 10 requêtes par seconde (rafale de 20) et à 100 000 requêtes par jour, avec une seule clé active par compte. Pour la plupart des usages, l'installation locale n'a besoin d'aucune clé et constitue le choix le plus simple.

  Pour obtenir une clé, connectez-vous sur [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), ouvrez l'onglet **AI agents (MCP)** et remplissez le formulaire **API key** (nom ou organisation, un contact, usage prévu, volume attendu), puis appuyez sur **Request API key**. L'équipe QoreChain approuve ou rejette la demande ; un rejet affiche sa note et vous pouvez refaire une demande. Après approbation, appuyez sur **Generate key** : la clé n'est affichée qu'une seule fois, avec un bouton de copie et un extrait de configuration prêt à l'emploi, et devient active en une à deux minutes. QoreChain ne conserve qu'une empreinte (un hash) : une clé perdue ne peut donc pas être réaffichée ; révoquez-la (effet en environ une minute) et demandez-en une nouvelle. Voir la [page Développeurs](/dashboard/developers#mcp).

Configuration client HTTP pour un serveur qui exige une clé (les noms exacts des clés varient selon le client) :

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

Ne placez jamais une phrase de récupération ou une clé privée dans la configuration d'un client : aucun outil QoreChain n'en a besoin.

Le serveur lit ces points d'accès publics :

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consensus | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Coût : le serveur est gratuit. Les lectures ne coûtent rien. Si vous diffusez une transaction construite par `prepare_transfer`, les frais du réseau s'appliquent (le plancher des frais est de 0.1 uqor par gas).

## Où il est publié {#where-published}

| Registre | Paquet | Version | Exécution | Notes |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Binaire `qorechain-mcp`. stdio et Streamable HTTP. Node.js 20 ou plus récent |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` ou `uvx qorechain-mcp` | stdio uniquement. Python 3.10 ou plus récent |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | La commande `qore`. Voir [CLI QoreChain](/developer-tools/qore-cli) |

Source : [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (public, Apache-2.0, vérifié le 27 octobre 2026). Le dépôt contient le serveur, la CLI, le paquet Python, la référence des outils, des notes d'auto-hébergement, des exemples de configuration de clients et trois fichiers de compétences pour agents. Il n'a pas d'image de conteneur publiée ; utilisez `npx` ou `pip`.

## Limites et problèmes connus {#limits}

- **Lecture seule.** Il n'y a aucun chemin de code de signature, aucun stockage de clés et aucune diffusion. `prepare_transfer` renvoie un document non signé. Pour finaliser un transfert, signez-le avec [QoreSign](/qoresign/overview) ou le wallet QoreX et diffusez-le vous-même ; lisez ensuite le résultat avec `get_transaction`. `read_contract` utilise uniquement `eth_call` et ne peut pas modifier l'état.
- **Un seul type de transaction est préparé.** `prepare_transfer` construit un `MsgSend` d'uqor sur la voie native. Il ne construit pas de transactions EVM, SVM, de staking, de gouvernance ou de contrat. `estimate_fee` et `simulate_tx` acceptent toute transaction encodée de la voie native.
- **Les chiffres de gas diffèrent selon le réseau.** La simulation du testnet (v3.2.6) inclut déjà le coût de vérification ML-DSA-87, le gas est donc exact. La simulation du mainnet (v3.2.4) ne l'inclut pas, la limite de gas suggérée comporte donc une marge (`exact_gas_simulation` vaut false sur le mainnet).
- **L'historique du testnet est élagué.** Un ancien bloc du testnet renvoie `NOT_FOUND`, et l'erreur nomme la plus basse hauteur disponible (8,790,799 sur le testnet au moment de la vérification ; le mainnet servait depuis la hauteur 1). `get_pq_status` vérifie une couche par rapport à la clé enregistrée à l'instant présent ; après une rotation de clé, les transactions plus anciennes ne correspondent donc plus.
- **Précompilés post-quantiques EVM.** `0x...0A01` (vérification ML-DSA-87) et `0x...0A02` (statut de clé) sont actifs sur le testnet uniquement ; sur le mainnet, un appel vers eux renvoie des données vides.
- **Limites.** Chaque requête en amont a un délai d'attente de 10 secondes et une limite de réponse de 4 MiB, sans nouvelle tentative. Les blocs listent au plus 100 hashes de transactions, les transactions au plus 50 messages, les comptes au plus 100 soldes. Les corps de requêtes HTTP sont limités à 512 KiB. Un mémo fait au plus 256 caractères, et il est public et permanent : n'y mettez donc jamais de secret. La limite de débit d'un serveur auto-hébergé est par instance et conservée en mémoire ; derrière un répartiteur de charge, chaque instance compte pour elle-même.
- **Non disponibles :** `get_token_holders` (pas d'indexeur sur les points d'accès publics) et `request_faucet` (utilisez le faucet du tableau de bord, qui exige une connexion). Le point d'accès hébergé exige une clé d'API, à demander depuis votre tableau de bord ; l'installation locale n'en a pas besoin.
- **Le mainnet est explicite.** Les appels vont vers le testnet sauf s'ils nomment `"network": "mainnet"` ou si le serveur a été démarré avec `--network mainnet`.
- **Aucune image de conteneur n'est publiée.** Exécutez le serveur avec `npx` ou `pip`.
- **Version.** 0.1.0 est la première version ; les noms d'outils et les schémas peuvent changer dans les versions suivantes, et le fichier généré `spec/tools.json` du dépôt fait référence pour la version que vous avez installée.

Pages liées : [Présentation des paquets développeur](/developer-tools/overview), [CLI QoreChain](/developer-tools/qore-cli), [QoreSign](/qoresign/overview), [Page Développeurs du tableau de bord](/dashboard/developers#mcp).
