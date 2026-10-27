---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community est un outil en ligne de commande qui inventorie la cryptographie d'un déploiement QoreChain et écrit le résultat sous la forme d'un CBOM CycloneDX 1.6 (cryptographic bill of materials, nomenclature cryptographique). Il lit le répertoire home d'un nœud, l'état en direct du réseau, des endpoints TLS et des sources Solidity, et consigne chaque algorithme, protocole, certificat et clé qu'il trouve, avec le fichier et la ligne ou l'endpoint où il a été trouvé.

Il s'adresse aux opérateurs de validateurs et de nœuds, aux équipes de conformité et de risque, aux auditeurs qui préparent un dossier de preuves, et aux équipes Solidity qui veulent savoir de quels schémas de signature leurs contrats dépendent. À partir du CBOM, il écrit des rapports Markdown alignés sur la Guidance 05/2026 de la FINMA, la feuille de route post-quantique du groupe de coopération NIS de l'UE et les RTS DORA sur la gestion du risque lié aux TIC (article 6), avec un statut par algorithme au regard des FIPS 203, 204 et 205 et du NIST IR 8547.

Version **0.1.0**, publiée le 27 octobre 2026, Apache-2.0. Il lit le mainnet (`qorechain-vladi`) et le testnet (`qorechain-diana`) via leurs endpoints REST publics, ou tout endpoint REST que vous lui indiquez.

QoreScan est une aide à l'inventaire. Ce n'est ni une certification, ni un audit, ni un avis juridique, et il n'établit la conformité à aucune réglementation ni norme. Tout ce que le scan ne peut pas établir est laissé à « To be completed ».

## Innovations {#innovations}

- **Un CBOM dans un format standard.** Chaque constat est un composant `cryptographic-asset` CycloneDX 1.6 avec `cryptoProperties` (type d'actif, primitive, jeu de paramètres, courbe, niveau de sécurité classique, catégorie de sécurité quantique NIST, OID) et `evidence.occurrences` (fichier et ligne, ou endpoint). Les certificats renvoient à leur algorithme de signature et à leur clé publique, les protocoles aux algorithmes qu'ils utilisent, les bibliothèques aux algorithmes qu'elles fournissent. Chaque CBOM écrit dans les tests du projet est validé par rapport au schéma JSON officiel de CycloneDX 1.6, et chaque `bom-ref` utilisé est vérifié comme étant défini, de sorte que la sortie se charge dans tout consommateur CycloneDX 1.6.
- **Des sources qui connaissent la chaîne.** Outre les fichiers et le TLS, il lit QoreChain lui-même : les paramètres PQC, les interrupteurs de protocole liés au PQC, les types de clés de consensus de l'ensemble de validateurs actif et les précompilés EVM actifs, et, pour chaque compte que vous nommez, s'il possède une clé PQC enregistrée, son algorithme, son type de clé (hybride, PQC seule, classique seule) et la taille de sa clé publique.
- **L'échange de clés hybride est visible.** Une poignée de main TLS par endpoint consigne la version, la suite de chiffrement, le groupe d'échange de clés (y compris les groupes ML-KEM hybrides tels que `X25519MLKEM768`), ALPN, SNI et chaque certificat envoyé par le serveur.
- **Les valeurs des clés privées ne sont jamais lues.** Les fichiers de clés sont décodés dans des structures qui n'ont aucun champ pour la clé privée, de sorte que ces octets ne sont jamais décodés, stockés, journalisés ni écrits. Un test échoue si ces structures gagnent un champ capable de porter des données privées, et un autre test scanne un home de nœud avec des clés fraîchement générées et vérifie qu'aucun encodage de celles-ci n'apparaît dans une sortie.
- **Chaque algorithme reçoit une classification et un statut de transition.** `post-quantum`, `hybrid`, `quantum-vulnerable` ou `symmetric`, avec sa catégorie de sécurité quantique NIST lorsqu'elle est définie, et son statut au regard des FIPS 203, 204, 205 et du calendrier NIST IR 8547.
- **Une sortie reproductible.** L'horodatage du CBOM est l'heure courante, ou `SOURCE_DATE_EPOCH` lorsqu'il est défini. Le numéro de série est dérivé du contenu, de sorte que la même entrée au même moment donne le même document.
- **Des wrappers qui vérifient ce qu'ils exécutent.** Les paquets npm et PyPI téléchargent à la demande le binaire de release pour votre plateforme et comparent son SHA-256 avec des empreintes livrées dans le paquet. Ils refusent un binaire qui ne correspond pas, aussi bien après le téléchargement qu'à chaque exécution ultérieure de la copie en cache. Aucun script d'installation ne s'exécute lors de `npm install`.
- **Aucun code tiers dans le binaire.** Le binaire `qorescan` utilise la bibliothèque standard de Go pour le scan (le validateur de schéma JSON est utilisé par ses tests). Il ne réutilise aucun code des projets PQCA CBOMkit ; sa sortie se charge dans le visualiseur CBOMkit.

## Cas d'usage {#use-cases}

1. **Une équipe de conformité produit un CBOM pour un superviseur.** Une institution financière suisse qui exploite un nœud QoreChain doit présenter un inventaire des méthodes cryptographiques de ses systèmes TIC, technologie des registres distribués comprise (Guidance 05/2026 de la FINMA, section 3.2). Elle exécute `qorescan scan --node-home ... --network mainnet`, joint le CBOM et `qorescan report --framework finma` à son analyse de risque, et complète à la main les sections organisationnelles.
2. **Un validateur audite son propre nœud.** Un opérateur veut confirmer quel type de clé de consensus le validateur utilise, si les fichiers de clés sont lisibles par d'autres utilisateurs, si des listeners RPC ou JSON-RPC EVM sont exposés sans TLS, et si un signataire distant est configuré. `qorescan scan --node-home ~/.qorechain` consigne tout cela sans ouvrir les valeurs des clés privées.
3. **Vérifier des comptes avant de s'y fier.** Un desk de custody ou une équipe d'intégration d'une plateforme d'échange veut savoir si les adresses de trésorerie ou de portefeuille chaud ont une clé ML-DSA-87 enregistrée et si elle est hybride. `qorescan scan --network mainnet --address qor1... --address qor1...` écrit dans le CBOM l'état de la clé PQC de chaque compte. Voir le [kit de custody](/developer-tools/custody-kit).
4. **Une équipe Solidity qui porte des contrats.** Une équipe qui migre des contrats depuis Ethereum veut une liste de tous les endroits qui dépendent de `ecrecover`, de `ECDSA` d'OpenZeppelin, de P-256 ou de RSA, et de tous ceux qui appellent déjà les précompilés PQC de QoreChain. `qorescan solidity ./contracts` liste chaque usage avec fichier et ligne.
5. **Revue d'endpoints.** Une équipe de plateforme veut savoir si ses endpoints publics RPC, REST ou d'API de portefeuille négocient un échange de clés post-quantique hybride avec les clients modernes. `qorescan tls api.example.org:443` consigne le groupe négocié, la suite de chiffrement et la chaîne de certificats.
6. **Une barrière CI sur chaque pull request.** Un dépôt de dApp ajoute la GitHub Action QoreScan afin que chaque changement produise un CBOM frais et un rapport DORA ou FINMA comme artefacts de build, et que les relecteurs voient quand un nouveau schéma de signature ou une nouvelle fonction de hachage entre dans la base de code.
7. **Due diligence d'un fournisseur.** Une entreprise réglementée envoie à un prestataire la sortie de `qorescan template questionnaire`, pré-remplie avec ce que le scan des endpoints de ce prestataire montre déjà, afin que celui-ci ne réponde qu'aux points restés ouverts.
8. **Des entités de l'UE qui se préparent à la feuille de route NIS et à DORA.** Une entité utilise `qorescan report --framework nis` et `--framework dora` pour montrer où son inventaire alimente l'étape de gestion des actifs cryptographiques et l'article 6 des RTS DORA.

## Comment ça fonctionne {#how-it-works}

### Sources {#sources}

- **Home du nœud** (`--node-home DIR`). Lit `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` et tous les fichiers de certificats qu'ils nomment. Il consigne le transport P2P et ses algorithmes, les certificats TLS du RPC et du JSON-RPC EVM, les listeners sur des adresses non loopback sans TLS, un signataire distant, les types et les clés publiques du validateur et du nœud, les permissions des fichiers de clés, les paramètres du module `pqc` du genesis, le registre d'algorithmes on-chain au genesis, et les types de clés de consensus des validateurs.
- **Réseau** (`--network mainnet|testnet` ou `--rest URL`). Lit via REST les interrupteurs de protocole liés au PQC, les paramètres `pqc`, les types de clés de consensus de l'ensemble de validateurs actif et les précompilés EVM actifs.
- **Comptes** (`--address ADDR`, répétable). Lit via REST la clé PQC enregistrée de chaque compte.
- **TLS** (`--tls HOST:PORT`, répétable). Une poignée de main par endpoint.
- **Solidity** (`--solidity PATH`, répétable). Détection textuelle de `ecrecover`, des appels aux précompilés ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) et P-256 (`0x100`), de `keccak256`, `sha256`, `ripemd160`, et des imports des bibliothèques de signature OpenZeppelin, Solady et `IQorePQC.sol`. Les précompilés pqcVerify et pqcKeyStatus ne sont actifs que sur le testnet ; aucun n'est actif sur le mainnet. Voir [Précompilés EVM](/developer-guide/evm-precompiles).

### Lectures réseau {#network-reads}

Chaque requête vers le réseau est un HTTP GET. Les routes lues sont la route d'informations du nœud, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, la route du dernier ensemble de validateurs, `/cosmos/evm/vm/v1/params` et `/qorechain/pqc/v1/account/{address}`. Une route qu'un nœud ne sert pas devient une note dans le CBOM, pas une erreur.

### Classification {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) et LMS/XMSS sont `post-quantum`. Un échange de clés classique combiné à ML-KEM est `hybrid`. RSA, ECDSA, EdDSA, Diffie-Hellman sur corps finis et sur courbes elliptiques, et les signatures à base d'appariements sont `quantum-vulnerable`, avec le calendrier NIST IR 8547 « deprecated after 2030, disallowed after 2035 ». Les chiffrements par blocs, les AEAD, les fonctions de hachage, les XOF et les KDF sont `symmetric`. QoreScan applique le calendrier IR 8547 à chaque courbe des familles ECDSA, EdDSA et ECDH, y compris secp256k1 et X25519, parce que l'exposition quantique est la même. Ce sont des classifications d'inventaire, pas des déclarations sur l'approbation par le NIST.

### Sortie {#output}

QoreScan ajoute quelques propriétés `qorescan:*` (classification, transition NIST IR 8547, norme, source) et consigne les faits scannés, des notes et une propriété d'avertissement dans les métadonnées du CBOM. Les chemins de preuves sont relatifs au répertoire scanné.

Un rapport contient le tableau de correspondance avec le cadre, un résumé par classification, chaque algorithme avec sa catégorie NIST, son statut au regard des FIPS 203, 204, 205 et du NIST IR 8547 et ses preuves, puis les protocoles, les certificats, les clés, les bibliothèques, les faits scannés, les notes de scan et les sources citées. Les points organisationnels indiquent « To be completed ».

### Correspondance avec les cadres {#frameworks}

| Cadre | Source | Où l'inventaire sert d'entrée |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 « Quantum computing », 9 juillet 2026, section 3 | 3.2 inventaire (le CBOM) ; 3.3 données critiques (échange de clés des transports scannés, mode de signature hybride de la voie native) ; 3.4 crypto-agilité (registre d'algorithmes, période de migration, interrupteurs de protocole) ; 3.5 prestataires (émetteurs de certificats, le questionnaire). 3.1 stratégie est organisationnelle. |
| `nis` | NIS Cooperation Group, « A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography », Part 1, v1.1, 11 juin 2025 | Gestion des actifs cryptographiques (le CBOM) ; les jalons 2030 et 2035 (la liste des algorithmes quantum-vulnerable) ; agilité. |
| `dora` | Règlement délégué (UE) 2024/1774 de la Commission, article 6 | 6(2)(a) et (c) registres de transport et listeners sans TLS ; 6(2)(d) registres de clés (types et clés publiques) ; 6(3) chaque algorithme au regard des FIPS et du NIST IR 8547 ; 6(4) registre, période de migration, interrupteurs. 6(1) et 6(5) sont organisationnels. |

## Comment l'utiliser {#how-to-use}

### Installation {#install}

| Canal | Commande d'installation | Plateforme minimale |
|---|---|---|
| Binaire de release | Téléchargez `qorescan_0.1.0_<os>_<arch>` (ou le `.tar.gz` ou le `.zip` ; les binaires Windows se terminent par `.exe`) depuis la [release GitHub](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) et vérifiez-le avec `qorescan_0.1.0_checksums.txt` | macOS, Linux ou Windows sur amd64 ou arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 ou ultérieur |
| PyPI | `pipx run qorescan scan ...` (ou `pip install qorescan`) | Python 3.9 ou ultérieur |
| Docker | `docker build -t qorescan .` depuis le dépôt (aucune image préconstruite n'est publiée) | Docker ; l'image est distroless et s'exécute sous l'utilisateur 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | Runner hébergé par GitHub ou auto-hébergé ; l'action compile QoreScan à partir de ses propres sources avec `actions/setup-go` |

Variables d'environnement pour les deux wrappers :

| Variable | Effet |
|---|---|
| `QORESCAN_CACHE_DIR` | Où le binaire est mis en cache (par défaut : le répertoire de cache de l'utilisateur). |
| `QORESCAN_DOWNLOAD_BASE` | Télécharger depuis un miroir au lieu de GitHub. La vérification de l'empreinte s'applique toujours. |

### Démarrage rapide {#quickstart}

QoreScan envoie des requêtes GET et une poignée de main TLS par endpoint, ne signe rien et n'a besoin d'aucune clé. Les commandes ci-dessous ont été exécutées le 27 octobre 2026 sur le testnet public, avec un binaire compilé à partir des sources v0.1.0.

**1. Scanner l'état du testnet, un compte, le TLS de l'endpoint REST public du testnet et un dossier de sources Solidity :**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

Il s'est terminé avec le code 0. Le CBOM a consigné, entre autres, l'identifiant de chaîne `qorechain-diana`, le mode de signature hybride de la voie native `required`, la clé PQC hybride du compte (le compte du faucet du testnet), les clés de consensus Ed25519 de l'ensemble de validateurs, TLS 1.3 avec le groupe hybride `X25519MLKEM768`, et les algorithmes trouvés dans les sources Solidity.

Une seconde exécution des seules parties réseau et TLS, faite pendant la rédaction de cette page, a produit un CBOM de 21 composants, dont ML-DSA-87, `X25519MLKEM768`, une entrée de protocole TLS 1.3 pour `api-testnet.qore.host:443`, sa chaîne de certificats et les clés Ed25519 de l'ensemble de validateurs.

**2. Écrire un rapport FINMA à partir du CBOM :**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

Le rapport s'ouvre sur l'avertissement, puis le tableau de correspondance (sections 3.1 à 3.5), un résumé par classification, et une ligne par algorithme avec son statut FIPS et NIST IR 8547 et ses preuves. Le scan d'un seul fichier Solidity qui utilise `ecrecover` a produit un CBOM CycloneDX 1.6 avec un composant (`ECDSA secp256k1`) et le même en-tête de rapport. Un nom de cadre inconnu se termine avec le code 2 et un message qui liste `finma`, `nis` et `dora`.

**3. Pré-remplir le questionnaire fournisseur et la déclaration d'agilité :**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Scanner votre propre nœud.** L'accès en lecture au home du nœud suffit :

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Avec Docker, montez le home du nœud en lecture seule afin que le conteneur ne puisse pas le modifier :

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. Via les wrappers, les commandes sont les mêmes :**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. Dans GitHub Actions.** Épinglez l'action et toutes les autres actions par commit :

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Entrées de l'action : `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (listes séparées par des espaces ou des retours à la ligne), `out` (par défaut `qorescan.cbom.json`) et `framework`. Sorties : `cbom` et `report`. L'action compile QoreScan à partir de ses propres sources au commit épinglé, aucun binaire n'est donc téléchargé.

Ce qui a été exécuté pour cette page : le scan du testnet, le scan Solidity, le rapport FINMA et l'erreur de cadre inconnu, avec un binaire compilé à partir des sources v0.1.0. Les binaires de release, les wrappers npm et PyPI (au-delà de la lecture du contenu de leurs paquets et de leurs entrées de registre), l'image Docker et la GitHub Action n'ont pas été exécutés.

### Commandes et options {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

Les options peuvent venir avant ou après les arguments positionnels. `--out -` (la valeur par défaut) écrit sur la sortie standard. `qorescan <command> -h` affiche les options d'une commande.

| Commande | Option | Ce qu'elle fait |
|---|---|---|
| `scan` | `--node-home DIR` | Répertoire home du nœud (celui qui contient `config/`). |
| `scan` | `--network mainnet\|testnet` | Lire l'état en direct depuis `https://api.qore.host` ou `https://api-testnet.qore.host`. |
| `scan` | `--rest URL` | Utiliser à la place n'importe quel endpoint REST, par exemple votre propre nœud (`http://127.0.0.1:1317`) ou un relais qui transmet les requêtes GET. Remplace `--network`. |
| `scan` | `--address ADDR` | Compte dont l'état de la clé PQC est lu. Répétable. Nécessite `--network` ou `--rest`. |
| `scan` | `--tls HOST:PORT` | Endpoint TLS avec lequel faire la poignée de main. Répétable. Port 443 si omis. |
| `scan` | `--solidity PATH` | Répertoire ou fichier `.sol`. Répétable. |
| `scan`, `solidity` | `--include-deps` | Scanner aussi `node_modules`, `lib`, `out`, `cache`, `artifacts` et `typechain-types`, qui sont ignorés par défaut. |
| `scan` | `--name NAME` | Nom du déploiement scanné dans les métadonnées du CBOM. |
| `scan` | `--timeout D` | Délai d'expiration réseau par requête (par défaut `20s`). |
| `tls` | `--servername NAME` | Nom de serveur SNI (par défaut : l'hôte). |
| `tls` | `--timeout D` | Délai d'expiration de la poignée de main (par défaut `15s`). |
| tous les scans | `--verbose` | Journaliser chaque fichier lu et chaque requête sur l'erreur standard. |
| toutes | `--out FILE` | Fichier de sortie, `-` pour la sortie standard. |
| `report` | `--framework finma\|nis\|dora` | Le cadre vers lequel faire la correspondance. Obligatoire. |
| `report`, `template` | `--cbom FILE` | Le CBOM à lire, `-` pour l'entrée standard. Obligatoire. |
| `template` | `agility` ou `questionnaire` | Quel modèle écrire. |

Autres commandes : `qorescan tls` est un scan TLS autonome, `qorescan solidity` est un scan Solidity autonome, `qorescan template agility` écrit une déclaration de crypto-agilité pré-remplie à partir des faits scannés, `qorescan template questionnaire` écrit un questionnaire fournisseur de cinq questions qui suit les cinq mesures de la section 3 de la Guidance 05/2026 de la FINMA, et `qorescan report` accepte aussi un CBOM CycloneDX 1.6 écrit par un autre outil (la classification se fait alors d'après le nom de l'algorithme).

Codes de sortie : `0` succès, `1` erreur de scan ou d'E/S, `2` erreur d'utilisation.

## Comment y accéder {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Identifiant de chaîne | `qorechain-vladi` | `qorechain-diana` |
| REST utilisé par `--network` | `https://api.qore.host` | `https://api-testnet.qore.host` |

- Aucune clé, aucun compte ni aucun fonds ne sont nécessaires. QoreScan ne signe ni n'envoie jamais de transaction, et n'écrit rien d'autre que le fichier de sortie que vous nommez.
- Certaines routes ne sont pas servies par tous les nœuds. Le 27 octobre 2026, l'endpoint REST public du mainnet ne servait pas `/qorechain/pqc/v1/params` ; le scan consigne alors une note et continue. Pointez `--rest` vers votre propre nœud pour un tableau plus complet.
- Le registre d'algorithmes on-chain n'est pas exposé via REST. QoreScan le lit dans `genesis.json` lorsqu'un home de nœud est scanné.
- Le scan reflète la version de la chaîne du nœud qu'il lit. Les interrupteurs de protocole et les précompilés actifs diffèrent entre le mainnet et le testnet ; le CBOM consigne ce que rapporte le nœud interrogé.
- Si votre machine ne peut pas joindre les endpoints publics, utilisez `--rest` avec un nœud que vous exploitez, ou avec un relais qui transmet les requêtes GET.
- Dépendances : les wrappers npm et PyPI n'utilisent que les modules intégrés de leur langage.

## Notes de sécurité {#security}

- **Les valeurs des clés privées ne sont jamais lues.** Dans `priv_validator_key.json`, QoreScan prend l'adresse, la clé publique et les noms de types de clés. Dans `node_key.json`, il ne prend que le type de clé ; l'identifiant du nœud n'est pas dérivé, car cela nécessiterait la clé privée. Le tampon brut du fichier est écrasé après le décodage, et les erreurs de décodage, qui pourraient citer l'entrée, ne sont jamais renvoyées.
- Les répertoires de keyring (`keyring-*`) et les fichiers de clés nommés par `tls_key_file` et `tls.key-path` ne sont pas ouverts. QoreScan consigne seulement qu'ils existent ou sont configurés. Les autres blocs PEM d'un fichier de certificats sont ignorés sans être décodés.
- Chaque requête réseau est un HTTP GET. Rien n'est écrit sauf le fichier de sortie.
- Les wrappers npm et PyPI vérifient le SHA-256 du binaire avant chaque exécution et refusent une divergence, y compris lorsqu'un miroir est utilisé. Pour la release 0.1.0, les empreintes à l'intérieur du paquet npm correspondent au fichier de sommes de contrôle de la release.
- L'image Docker est distroless et s'exécute sous un utilisateur non root. Montez le home du nœud avec `:ro`.
- Signalez les vulnérabilités en privé à security@qore.network.

## Où il est publié {#where-published}

Les versions ont été lues sur chaque registre le 27 octobre 2026.

| Registre | Paquet | Version | Lien |
|---|---|---|---|
| Release GitHub | `qorechain/qorescan` | v0.1.0 (publiée le 27 octobre 2026), binaires pour darwin, linux et windows sur amd64 et arm64, plus `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (commande `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 ou ultérieur) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Proxy de modules Go | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Source : https://github.com/qorechain/qorescan (Apache-2.0, copyright 2026 QoreChain Association). Il n'existe ni paquet crates.io ou Maven, ni image Docker préconstruite ; construisez l'image à partir du dépôt. Le dépôt documente chaque option dans `docs/usage.md`, ce qui est lu et ce qui n'est jamais lu dans `docs/scanned-data.md`, la correspondance avec les cadres et ses sources dans `docs/frameworks.md`, et les limites dans `docs/limitations.md`.

## Limites et problèmes connus {#limits}

- **Une aide à l'inventaire.** Il ne certifie pas, n'audite pas et ne donne pas de conseil juridique, et ses rapports n'établissent la conformité à aucune réglementation ni norme. Les mesures organisationnelles (stratégie, feuille de route, classification des données, responsabilités) sont laissées à « To be completed ».
- **Périmètre.** QoreScan ne scanne que les sources que vous lui indiquez. Les données stockées, les sauvegardes, les HSM, les systèmes de gestion de clés, la configuration du système d'exploitation et des bibliothèques, les portefeuilles, les ponts et les services hors chaîne sont hors du scan, sauf si vous ajoutez leurs endpoints TLS avec `--tls`. Il ne scanne pas les ponts.
- **État en direct.** Le registre d'algorithmes provient de `genesis.json` et reflète le réseau au genesis, pas les changements de gouvernance ultérieurs. Les clés de consensus des validateurs sont lues pour le dernier ensemble de validateurs.
- **TLS.** Une poignée de main avec les préférences par défaut du client Go montre ce que le serveur négocie avec un client moderne, pas toutes les versions, suites ou groupes qu'il accepte. Un endpoint derrière un répartiteur de charge peut répondre différemment sur une autre connexion.
- **Signataires distants.** Avec `priv_validator_laddr` défini, la clé du validateur se trouve ailleurs et son type n'est pas visible depuis le home du nœud.
- **Solidity.** La détection est textuelle. Elle ne résout pas les imports, ne suit pas l'héritage et ne calcule pas d'adresses à l'exécution. Une adresse de précompilé assemblée à l'exécution est manquée, et une variable nommée comme un motif peut être signalée. Les dépendances sont ignorées sauf si vous passez `--include-deps`.
- **CBOM d'autres outils.** Les rapports classent les CBOM d'autres outils d'après le seul nom de l'algorithme.
- **Dates.** Les catégories NIST et les transitions de l'IR 8547 sont reprises des documents cités tels qu'ils étaient en octobre 2026. Des directives propres à une application peuvent fixer des dates plus précoces.
- **Chaîne de version.** Un binaire compilé à partir des sources sans option de version affiche `qorescan dev`. Utilisez le binaire de release ou l'installation Go de la version taguée lorsque vous avez besoin que la version soit consignée.

## Pages associées {#related}

- [Signature post-quantique](/developer-guide/post-quantum-signing) : secp256k1 hybride plus ML-DSA-87 sur la voie native, et la fenêtre d'autorisation EVM.
- [Kit de custody](/developer-tools/custody-kit) : guide d'intégration et code de référence pour les dépositaires et les plateformes d'échange.
- [QoreSign](/qoresign/overview) : bibliothèques de signature et de vérification hybrides.
- [Exploiter un nœud](/developer-guide/running-a-node) et [exploiter un validateur](/developer-guide/running-a-validator) : organisation du home du nœud, signataires distants et fichiers de clés.
- [Précompilés EVM](/developer-guide/evm-precompiles) : les précompilés PQC `0x0A01` et `0x0A02`.
- [Bibliothèque post-quantique (qorechain-pqc)](/developer-tools/pqc-library) : ML-DSA-87 dans six langages.
- [Se connecter au mainnet](/getting-started/connecting-to-mainnet) et [se connecter au testnet](/getting-started/connecting-to-testnet) : endpoints publics.
