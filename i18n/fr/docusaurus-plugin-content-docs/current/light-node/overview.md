---
slug: /light-node/overview
title: Vue d'ensemble du nœud léger
sidebar_label: Vue d'ensemble
sidebar_position: 1
---

# Vue d'ensemble du nœud léger

Le **nœud léger QoreChain** est un petit client qui suit un réseau QoreChain sans exécuter de nœud complet, et qui peut s'enregistrer on-chain en tant que nœud léger pour participer à la **part de récompense de 3 % des nœuds légers**. Il s'adresse aux opérateurs qui veulent un moyen peu coûteux de suivre la chaîne et de gagner une part de cette allocation, et à ceux qui veulent simplement un second avis sur le dernier hachage de bloc de la chaîne sans faire confiance à un seul serveur RPC. C'est un binaire unique et autonome, en deux éditions construites à partir du même code : **SX** (`lightnode-sx`, un daemon sans interface avec une ligne de commande, pour les serveurs) et **UX** (`lightnode-ux`, le même daemon plus un tableau de bord web local sur `127.0.0.1:8420`). Il est publié sous licence Apache 2.0, et le code source est public sur `github.com/qorechain/qorechain-lightnode`.

Exécuter et synchroniser un nœud ne nécessite aucune licence. Participer à la part de récompense est une étape distincte : elle nécessite une licence `lightnode_operator`, du stake délégué à des validateurs bondés, et un enregistrement on-chain (voir [Comment y accéder](#how-to-access)).

Le nœud léger a sa **propre ligne de version**, distincte de la version de publication de la chaîne. Au moment de la rédaction (27 octobre 2026), les canaux de publication des deux réseaux fournissent le nœud léger **3.1.12** (chaîne `v3.2.4` sur le mainnet, `v3.2.6` sur le testnet). Considérez ces deux numéros comme sans rapport.

## Innovations {#innovations}

Chaque élément ci-dessous est un mécanisme que vous pouvez vérifier dans le code source ou en exécutant le nœud.

- **Signature hybride native, sans autre logiciel.** Le nœud construit et signe lui-même ses transactions en Go pur (pas de CGO, pas de bibliothèques natives, pas de `qorechaind`). Chaque transaction porte une signature ML-DSA-87 (FIPS 204) sur le corps sans l'extension PQC, plus une signature secp256k1 sur le SignDoc dont le corps porte cette extension. La version du format de signature est lue dans les plans de mise à niveau appliqués de la chaîne. Des builds Linux, macOS et Windows existent pour amd64 et arm64 (depuis la 3.1.8).
- **Un seul jeu de mots de récupération donne les deux clés.** `keys add-operator --recover` dérive la clé de compte sur `m/44'/118'/0'/0/0`, le même chemin que celui utilisé par `qorechaind` et Keplr. Pour la clé post-quantique, il reconstruit soit la clé qu'un portefeuille a déjà enregistrée sur ce compte à partir des mêmes mots (les dérivations du wallet-adapter et du Dashboard, identiques à `qorechaind tx pqc recover-key`), soit en dérive une nouvelle ; les mots restaurent ainsi aussi la clé du nœud (depuis la 3.1.9).
- **L'enregistrement tient en une commande, vérifiée étape par étape.** `register` vérifie la licence, rattache la clé post-quantique (avec une preuve de possession lorsque la chaîne la prend en charge), ne délègue que le stake manquant si vous passez `--delegate-to`, puis enregistre. Chaque étape doit figurer dans un bloc avant l'envoi de la suivante. Le stake n'est compté que sur les validateurs bondés, comme la chaîne le compte (depuis la 3.1.10).
- **Les heartbeats sont cadencés à partir de l'enregistrement de la chaîne elle-même.** Le daemon envoie un heartbeat une fois que 1 000 blocs se sont écoulés depuis le `last_heartbeat` de la chaîne pour le nœud, vérifie toutes les 60 secondes, et ne signale un heartbeat qu'une fois qu'il figure dans un bloc. Un redémarrage n'envoie pas de doublon et n'attend pas un intervalle entier.
- **Recoupement des en-têtes entre points de terminaison.** Le nœud récupère la même hauteur depuis son point de terminaison principal et depuis chaque point de terminaison témoin configuré, et ne stocke l'en-tête que si tous renvoient le même hachage. Un témoin situé sur le même hôte que le principal, ou à une adresse distante `http://` en clair, est refusé. Le mode est consigné pour chaque en-tête au niveau debug sous `assurance` (`trusted-single-source` ou `corroborated-across-sources`). Ce n'est **pas** une vérification du consensus : voir [Limites](#limits).
- **Mise à jour automatique signée.** Depuis le nœud léger 3.1.11, le daemon lit le `latest.json` de son réseau toutes les 6 heures. Il n'installe une nouvelle version que si `v<version>/SHA256SUMS.sig` est vérifié comme une signature Ed25519 d'une clé de publication intégrée au binaire (la signature lie le réseau, la version et le contenu de `SHA256SUMS`), si le binaire téléchargé correspond à sa somme de contrôle signée, et si le nouveau binaire s'exécute et rapporte exactement `v<version>`. Le binaire précédent est conservé sous `<name>.old`, et le nœud redémarre sur place (le même processus sous Linux et macOS ; sous Windows, le nouveau binaire démarre et l'ancien se termine). `[update] mode` vaut `auto` (par défaut), `notify` ou `off` ; `lightnode-sx update --check` et `lightnode-sx update` font la même chose à la main. Dans un conteneur, ou lorsque le dossier du binaire n'est pas accessible en écriture, le nœud ne fait qu'annoncer une version (ligne de journal, `GET /api/update` sur l'API locale, et une bannière sur le tableau de bord UX).
- **Des avertissements qui correspondent à ce que fait la chaîne.** Avec `[delegation] rebalance_enabled` activé (la valeur par défaut), le nœud avertit lorsqu'un validateur auquel vous déléguez est jailed, lorsqu'il n'est pas dans l'ensemble actif, et lorsque votre stake bondé tombe sous `min_delegated_stake` (1 000 QOR). Dans ces trois cas, la chaîne cesse de créditer le nœud sans aucun message. Un avertissement est consigné lorsqu'il apparaît, toutes les heures tant qu'il dure, et une fois lorsqu'il disparaît. Un quatrième avertissement, le score de réputation d'un validateur délégué sous `min_reputation` (`0.5` par défaut), lit `GET /qorechain/reputation/v1/validator/<valoper>` : il est actif sur le **testnet** dès maintenant et n'atteint le mainnet qu'avec une version de chaîne postérieure à la v3.2.5 ; tant que la route n'est pas servie, le nœud le note une fois et réessaie toutes les 6 heures.

### Pourquoi exécuter un nœud léger, et comment lire le recoupement {#why-run-a-light-node}

- **Participez à la part de récompense.** Les nœuds légers enregistrés et actifs qui respectent les règles de stake et de disponibilité sont payés sur la part de 3 % décrite [plus bas](#the-3-light-node-reward-share).
- **Vérifiez par recoupement l'état de la chaîne qui vous est présenté.** Sans témoin configuré, le nœud consigne un avertissement au démarrage et rapporte `trusted-single-source` : un point de terminaison unique géré honnêtement rapporte la même valeur qu'un point de terminaison compromis. Ajoutez un témoin exploité de manière indépendante pour passer à `corroborated-across-sources`, qui exige que tous les points de terminaison configurés soient compromis simultanément pour être trompé. La valeur apparaît sur les lignes `synced header` du journal de débogage (définissez `log_level = "debug"`) ; elle n'apparaît ni dans `status` ni sur le tableau de bord, et aucun service central ne peut la voir, puisque vos choix RPC sont locaux à votre configuration.
- **Surveillez le réseau.** La télémétrie couvre les validateurs, le consensus, le pont et la tokenomics, rafraîchis selon des intervalles indépendants.

## Comment l'utiliser {#how-to-use}

Choisissez une édition. Les deux lisent le même `config.toml`, stockent les données dans le même répertoire personnel (`~/.qorechain-lightnode`) et utilisent le même trousseau de clés.

| Édition | Binaire | Conçu pour | Interface |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Serveurs sans interface, automatisation | Daemon plus ligne de commande complète. Voir [Édition SX](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Usage bureau et opérateur | Les mêmes commandes plus un tableau de bord web local. Voir [Édition UX](/light-node/ux-edition). |

**1. Téléchargez et vérifiez** (Linux amd64 montré ; `jq` sert à lire le manifeste). Prenez la version dans le manifeste du réseau que vous ciblez :

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Sous Windows, comparez `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` avec la valeur du manifeste. Le `SHA256SUMS` propre à une version doit correspondre au binaire propre à cette version ; prenez donc les deux dans le chemin `v$V`.

**2. Configurez et enregistrez.** La séquence ci-dessous est celle que montre le Dashboard ; elle a été exécutée sur un devnet, sur le testnet (répétition le 18 octobre 2026) et pour le premier nœud du mainnet (20 octobre 2026).

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

Le RPC de la chaîne pour `onboard` est `https://rpc.qore.host` (mainnet) ou `https://rpc-testnet.qore.host` (testnet). Pour l'édition UX, utilisez `lightnode-ux` avec les mêmes commandes et ouvrez `http://127.0.0.1:8420`. Détails de chaque étape : [Édition SX](/light-node/sx-edition) et [Enregistrement et licence](/light-node/registration-and-licensing).

**3. Gardez-le à jour.** Les nœuds légers 3.1.11 et ultérieurs se mettent à jour eux-mêmes hors des conteneurs (voir l'élément de mise à jour automatique ci-dessus). Un nœud en 3.1.10 ou antérieur doit installer la 3.1.12 à la main une fois : téléchargez le binaire versionné comme ci-dessus et remplacez le fichier. Avec Docker, exécutez `docker compose pull && docker compose up -d`. Voir [Édition SX : mise à jour](/light-node/sx-edition#updating).

## Comment y accéder {#how-to-access}

| | Mainnet | Testnet |
| --- | --- | --- |
| Chaîne | `qorechain-vladi` (chaîne `v3.2.4`) | `qorechain-diana` (chaîne `v3.2.6`) |
| RPC pour le nœud | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| REST pour les requêtes | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Version du nœud léger | 3.1.12 | 3.1.12 |
| Licence | 50 $, achetée sur le Dashboard ; l'attribution est signée à la main par lots | Gratuite, en libre-service : **Nodes & Validators > Light Node**, **Request licence** ; signée automatiquement, généralement en quelques minutes |

**Ce qu'il vous faut pour vous enregistrer**

- Un compte dont vous détenez les mots de récupération (vos propres mots, Keplr, ou une clé `qorechaind`), de préférence dédié au nœud. Un portefeuille custodial du Dashboard ne peut pas faire tourner un nœud, sauf si vous exportez sa graine.
- Une licence `lightnode_operator` active sur cette adresse (voir ci-dessous).
- Au moins **1 000 QOR** délégués depuis cette adresse à des validateurs **bondés**, comptés au total.
- Des QOR sur le compte pour les frais d'enregistrement de **1 QOR** et les frais de transaction. Un heartbeat coûte 0,25 uqor par gas à la limite par défaut de 300 000 gas, soit 0,075 QOR au maximum (gas mesuré utilisé : environ 165 000).
- Un ordinateur qui reste allumé : le nœud doit envoyer un heartbeat tous les 1 000 blocs et maintenir au moins 80 % de disponibilité pour être payé.

**Obtenir une licence.** Sur le Dashboard, ouvrez **Nodes & Validators** (l'entrée de la barre latérale qui s'appelait **Tools** ; la page se trouve toujours à `/tools`), choisissez l'onglet **Light Node**, et sélectionnez le réseau dans l'en-tête. Le Dashboard exige une connexion.

- *Mainnet :* saisissez d'abord l'adresse `qor1...`, choisissez le réseau USDT et payez 50 $. L'onglet affiche **Paid, awaiting on-chain grant** jusqu'à ce que la chaîne confirme l'attribution.
- *Testnet :* rien n'est vendu. Saisissez votre adresse `qor1...` sous **Free testnet licence** et sélectionnez **Request licence**. Il y a une demande par compte et une par adresse. L'onglet affiche « Granted to ... » lorsque la licence est arrivée, ou indique que l'attribution n'a pas pu être signée et vous laisse réessayer.

Vous pouvez aussi vérifier une licence directement : `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Statut du programme de récompenses {#reward-program-status}

:::note L'enregistrement est ouvert
L'enregistrement est ouvert sur le mainnet (`qorechain-vladi`, chaîne v3.2.4) et sur le testnet (`qorechain-diana`, chaîne v3.2.6). Le 27 octobre 2026, sept licences `lightnode_operator` avaient été accordées sur le mainnet et un nœud léger était enregistré sur chaque réseau (`total_registered` vaut `1` dans `GET /qorechain/lightnode/v1/stats` sur les deux). La comptabilité des récompenses est en service sur les deux réseaux depuis la mise à niveau v3.2.0. La disponibilité est comptée **à partir du bloc où votre nœud est enregistré** ; faire tourner un nœud auparavant ne rapporte donc aucun crédit. Depuis la chaîne v3.2.4, le plafond par nœud démarre aussi à l'enregistrement propre du nœud : le premier règlement après l'enregistrement ne crédite que ce qui s'est accumulé depuis.

Le manifeste de publication (`https://download.qore.host/<net>/lightnode/latest.json`) porte le signal officiel dans son champ `registration.open`. Pour l'état en direct, interrogez `GET /qorechain/license/v1/holders/lightnode_operator` et `GET /qorechain/lightnode/v1/stats` sur `https://api.qore.host` (mainnet) ou `https://api-testnet.qore.host` (testnet).
:::

## La part de récompense de 3 % des nœuds légers {#the-3-light-node-reward-share}

La distribution des frais de QoreChain alloue une **part fixe de 3 % aux nœuds légers** (le paramètre `reward_share`, `0.03`). Voir [Tokenomics](/architecture/tokenomics) pour la répartition complète 37 % / 30 % / 20 % / 10 % / 3 % (validateurs, brûlés, trésorerie, stakers, nœuds légers).

Ces 3 % sont ce qui est versé sur le compte de module des nœuds légers ; ce n'est pas un droit par nœud. Tous les 100 blocs, la chaîne crédite à chaque nœud éligible sa part, pondérée par le stake, de ce qui s'est accumulé depuis le règlement précédent, **plafonnée par nœud**. Depuis la chaîne v3.2.3, ce plafond est de **2 000 QOR par nœud et par 30 jours** (`max_reward_per_month_per_node`, `2000000000` uqor), au prorata du temps de bloc écoulé depuis le règlement précédent et mis à l'échelle selon la disponibilité du nœud ; c'est la règle `lightnode-monthly-cap`. Avant la v3.2.3, le plafond était exprimé par bloc (`max_reward_per_block_per_node`, `1713` uqor), valeur que la requête du pool de récompenses affiche toujours. Ce plafond est une limite supérieure, pas un montant promis. Tout ce qui n'est pas gagné est déplacé vers une réserve que seul un vote de gouvernance peut débloquer, de sorte qu'aucune cagnotte ne s'accumule pour celui qui s'enregistre en premier. Vous pouvez consulter la répartition en direct avec `GET /qorechain/lightnode/v1/reward_pool`.

Pour être éligible aux récompenses, un nœud léger doit être **enregistré on-chain, actif** (prouvant sa vivacité par des heartbeats), détenir au moins le stake minimal bondé et maintenir sa disponibilité à un niveau au moins égal au minimum. L'enregistrement est traité dans [Enregistrement et licence](/light-node/registration-and-licensing) ; la manière dont les récompenses sont créditées, réclamées et surveillées est traitée dans [Récompenses et surveillance](/light-node/rewards-and-monitoring).

## Où il est publié {#where-published}

| Quoi | Où | Version actuelle |
| --- | --- | --- |
| Manifeste de publication, mainnet | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, enregistrement ouvert) |
| Manifeste de publication, testnet | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, enregistrement ouvert) |
| Binaires | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 12 fichiers par publication (SX et UX, Linux, macOS et Windows, amd64 et arm64) plus `SHA256SUMS` |
| Code source et publications | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Publication `v3.1.12` (actuelle) et tags antérieurs ; chacune comprend les 12 binaires, `SHA256SUMS`, `lightnode-build.json` et un APK Android en aperçu |
| Android | Joint à la publication GitHub uniquement | Aperçu : suit la chaîne, ne s'enregistre pas, ne gagne rien |
| Docker | `ghcr.io/qorechain/qorechain-lightnode-sx` et `ghcr.io/qorechain/qorechain-lightnode-ux`, publiques, tags `latest` et `v<version>` (voir [Édition SX : Docker](/light-node/sx-edition#docker)) | `v3.1.12` |

Vérifiez la `version` dans le manifeste de votre réseau avant de télécharger, plutôt que de vous fier à ce tableau. La clé de signature des publications est intégrée au binaire ; il n'y a rien à installer de votre côté.

## Limites et problèmes connus {#limits}

- **Ce n'est pas un client léger de protocole.** Le nœud corrobore les hachages de blocs entre points de terminaison. Il ne vérifie ni les signatures de commit, ni les changements d'ensemble de validateurs, ni une période de confiance ; il ne vérifie donc pas le consensus de la chaîne. `trust_period` et `max_clock_drift` dans la configuration sont acceptés mais inutilisés.
- **Les récompenses sont un plafond.** Le plafond par nœud (2 000 QOR par 30 jours) est un maximum, et le nœud n'est payé que de ce qui s'accumule dans le pool et uniquement tant qu'il est éligible.
- **Un heartbeat est une signature de vivacité.** Il prouve que la clé de l'opérateur a signé à temps, et non que le logiciel complet a tourné en continu.
- **Les avertissements de réputation ne fonctionnent que sur le testnet pour l'instant.** Le mainnet ne sert pas encore les scores de réputation par validateur ; sur le mainnet, cette vérification ne s'exécute donc pas et le nœud l'indique dans son journal. Les avertissements « jailed », « hors de l'ensemble actif » et « stake faible » n'en dépendent pas. Les versions du nœud antérieures à la 3.1.11 consignaient un échec de la vérification de réputation toutes les cinq minutes et n'avertissaient jamais de rien.
- **La mise à jour automatique commence à la 3.1.11.** Un nœud en 3.1.10 ou antérieur ne se met pas à jour tout seul et nécessite une installation manuelle de la 3.1.12. Dans un conteneur ou un dossier non accessible en écriture, le nœud ne fait qu'annoncer les nouvelles versions.
- **Les nœuds Docker ne se mettent pas à jour eux-mêmes.** Ils sont informés d'une nouvelle version, et la mise à jour se fait avec `docker compose pull && docker compose up -d`.
- **Android est un aperçu** et ne s'enregistre pas et ne gagne rien.
- **Licences.** Les attributions du mainnet sont signées à la main par lots ; il y a donc une attente entre le paiement et l'enregistrement. La licence testnet est limitée à une par compte et une par adresse.
- **Un portefeuille créé sur le Dashboard ne peut pas faire tourner un nœud** sauf si vous exportez sa graine, car le nœud doit signer avec des clés que vous détenez.

## Où aller ensuite

- [Édition SX](/light-node/sx-edition) : installez, configurez et exécutez le daemon serveur.
- [Édition UX](/light-node/ux-edition) : exécutez l'édition à tableau de bord web.
- [Enregistrement et licence](/light-node/registration-and-licensing) : obtenez une licence et enregistrez-vous on-chain.
- [Récompenses et surveillance](/light-node/rewards-and-monitoring) : comment la part de 3 % est créditée et réclamée, et comment maintenir le nœud en bonne santé.
- [Tokenomics](/architecture/tokenomics) : comment la part de récompense des nœuds légers s'inscrit dans l'économie plus large.
