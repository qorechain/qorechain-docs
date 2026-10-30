---
slug: /qorel/configuration
title: Configuration de QORel
sidebar_label: Configuration
sidebar_position: 5
---

# Configuration

QORel lit un seul fichier TOML (`~/.hermes/config.toml` par défaut, ou le chemin indiqué avec `--config`). Pour toute chaîne qui signe de la manière standard, le fichier est exactement la configuration de Hermes ; le [guide de Hermes](https://hermes.informal.systems) décrit chaque paramètre. Cette page couvre ce que QORel ajoute : l'entrée de chaîne QoreChain, les clés post-quantiques, les paramètres de gas et les vérifications effectuées avant l'envoi d'une transaction. Elle s'adresse aux opérateurs qui écrivent ou relisent une configuration QORel.

## Innovations {#innovations}

- **`signing` par chaîne.** `'qorechain-hybrid'` ajoute la signature ML-DSA-87 à chaque transaction que QORel envoie à cette chaîne ; `'standard'` (la valeur par défaut) est identique octet pour octet à Hermes. Les configurations mixtes fonctionnent : un seul processus, une chaîne de chaque type.
- **Version des sign bytes lue depuis la chaîne.** Avec `pqc.sign_bytes = 'auto'`, QORel lit les enregistrements de mise à niveau appliqués par la chaîne, signe la forme correspondante, la relit chaque minute et après tout refus, et n'invente jamais de version.
- **Prix du gas selon le marché des frais.** `dynamic_gas_price` avec `backend = 'cosmos-evm-feemarket'` suit les frais de base de QoreChain (plancher de 0,1 uqor par gas).
- **Une configuration qui refuse les combinaisons dangereuses.** Des `extension_options` statiques associées à la signature hybride sont refusées au chargement, car la signature post-quantique doit être la seule option d'extension critique.

## Utilisation {#how-to-use}

### L'entrée de chaîne QoreChain {#chain-entry}

Voici l'entrée du testnet tirée de la configuration d'exemple. Remplacez les adresses des nœuds par celles de votre propre nœud testnet :

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

Les paramètres propres à QoreChain :

| Paramètre | Valeur | Rôle |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Ajoute la signature ML-DSA-87 (FIPS 204) à chaque transaction envoyée à cette chaîne. À omettre, ou à régler sur `'standard'`, pour toutes les autres chaînes. |
| `account_prefix` | `'qor'` | Le préfixe d'adresse des comptes QoreChain. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | Le plancher des frais est de 0,1 uqor par gas. |
| `gas_multiplier` | `1.1` | Multiplie le gas simulé pour obtenir la limite de gas. Voir [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Lit les frais de base du marché des frais de la chaîne au lieu de se fier uniquement à `gas_price`. |
| `pqc.sign_bytes` | `'auto'` (par défaut), `'v1'` ou `'v2'` | `auto` lit la version des sign bytes depuis la chaîne ; `v1` et `v2` imposent une forme. Laissez `auto`. |
| `pqc.sign_mode` | `'hedged'` (par défaut) ou `'deterministic'` | Signature ML-DSA randomisée ou déterministe. La chaîne accepte les deux. |
| `pqc.include_public_key` | `false` (par défaut) | Indique s'il faut intégrer la clé publique dans l'extension de chaque signature. Cela n'enregistre pas la clé ; seul `keys register-pqc` le fait. |

Les points d'accès publics en lecture du testnet QoreChain sont listés sur [Se connecter au testnet](/getting-started/connecting-to-testnet). Un relayeur a aussi besoin de gRPC, qui n'est pas public : faites donc tourner votre propre nœud pour le côté QoreChain.

### Toute autre chaîne Cosmos SDK {#other-chains}

Écrivez l'entrée comme pour Hermes et omettez `signing`. Voici l'entrée du testnet public de Cosmos Hub tirée de la configuration d'exemple :

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

Ces points d'accès appartiennent à un tiers, sont publics et peuvent limiter le débit. Utilisez vos propres nœuds pour un relais continu.

### Paramètres globaux {#global}

La configuration d'exemple utilise les paramètres suivants, qui sont des paramètres de Hermes :

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` maintient les clients légers à jour et surveille les comportements malveillants ; `mode.packets` relaie les paquets et purge ceux qui sont en attente tous les `clear_interval` blocs et au démarrage. Les poignées de main de connexion et de canal sont laissées aux commandes `create`. Le port de télémétrie est décrit sur [Surveillance](/qorel/monitoring).

### Clés {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (ou `--key-file` avec un fichier de clé qui contient la phrase mnémonique) stocke la clé secp256k1 comme le fait Hermes et, sur une chaîne hybride, dérive la clé ML-DSA-87 à partir de la même phrase mnémonique et du même compte avec la dérivation de portefeuille de QoreChain. Seule sa graine de 32 octets est stockée, à côté de la clé, sous le nom `<key name>.pqc`. Rien de secret n'est affiché. Voir [Dérivation de clés](/qoresign/guides/key-derivation) pour la dérivation.
- `keys register-pqc` envoie `MsgRegisterPQCKeyV2` une seule fois. C'est la seule transaction que QoreChain accepte avec la seule signature classique, et elle porte une preuve de possession sur les réseaux en v3.2.3 ou plus récent. La commande est idempotente et refuse d'envoyer lorsque le compte a déjà une clé différente. Voir [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration) pour ce que la chaîne vérifie.
- `keys pqc-status` indique si la clé est enregistrée, si elle correspond à la clé locale, si elle a été validée par une preuve de possession, et quels sign bytes la chaîne vérifie. `ready_to_relay` doit valoir `true`.
- Utilisez un compte de relayeur dédié avec un petit solde, jamais la clé d'opérateur d'un validateur.
- Les fichiers de clés (`<key name>.json` et `<key name>.pqc`) sont écrits en lecture réservée au propriétaire (0600). Hermes en amont utilisait l'umask par défaut ; les clés ajoutées avec un ancien Hermes gardent leur ancien mode, vérifiez-les donc avec `ls -l`.

### Gas {#gas}

QoreChain prélève la totalité des frais (limite de gas multipliée par le prix) sans remboursement, gardez donc le multiplicateur serré.

- Sur la chaîne v3.2.5 et les suivantes (la mesure ci-dessous a été prise sur le testnet en v3.2.6 ; le mainnet a appliqué la v3.2.5 le 29 octobre 2026 mais QORel n'y a pas relayé), la simulation correspond à la livraison à quelques centaines de gas près. Le test de bout en bout local sur un build de cette ligne passe avec `1.05` (chaque transaction de relais a utilisé 95 % de sa limite).
- Les builds antérieurs sous-estiment d'environ 8 à 10 % (mesuré sur un devnet de préversion, où `1.15` laissait une marge de 4 à 7 %). Utilisez `1.15` tant que vous n'avez pas mesuré vos propres nœuds.
- `health-check` signale tout multiplicateur inférieur à `1.1` sur une entrée QoreChain comme une possible erreur de configuration. C'est un avertissement et le relais fonctionne quand même. `1.1`, la valeur de la configuration d'exemple, évite l'avertissement pour environ 5 % de frais en plus qu'avec `1.05`.
- La transaction ponctuelle `keys register-pqc` utilise au moins `1.1`, quelle que soit la configuration.
- Chaque signature hybride ajoute environ 4,7 Ko à la transaction et 2 000 gas pour la vérification ; la simulation inclut les deux.

### Vérifications de sécurité avant chaque envoi {#safety-checks}

Avant chaque transaction vers une chaîne hybride, QORel vérifie que la clé post-quantique est chargée, enregistrée sur la chaîne et identique à la clé locale, et que la version des sign bytes est connue. Si une vérification échoue, rien n'est envoyé (aucun frais n'est dépensé) et `health-check` indique la raison. Un refus de la chaîne avec le codespace `pqc` code 21 fait relire par QORel la version et l'enregistrement avant la transaction suivante.

### Notes pour les chaînes ibc-go v10 {#ibc-go-v10}

- Le middleware de frais ICS-29 n'existe plus dans ibc-go v10 ; les frais sont le prix du gas, un fee granter et les frais de base dynamiques.
- ibc-go v10 ne place plus l'en-tête dans les événements `update_client`. QORel le lit à la place dans la transaction `MsgUpdateClient`, de sorte que la détection des comportements malveillants continue de fonctionner (Hermes 1.13 standard la désactive sur ces chaînes).

### Points d'accès à débit limité {#rate-limits}

Les points d'accès publics répondent souvent aux rafales par `429 Too Many Requests`, par exemple juste après le démarrage du relayeur. Hermes les traite comme réessayables, mais ses workers de paquets s'arrêtent aussi après `clear_interval x 5` blocs sans nouvel événement IBC, même lorsque le dernier cycle de purge a échoué ; un paquet en attente à ce moment-là patientait jusqu'au paquet suivant sur le canal ou jusqu'à un redémarrage. QORel maintient en marche les workers de paquets d'un canal tant qu'une tentative de relais ou de purge a échoué, et réessaie à chaque intervalle de purge. Ils ne s'arrêtent pour inactivité qu'après un cycle de purge réussi. Privilégiez vos propres nœuds ou un point d'accès payant pour un relais en production, et configurez des alertes sur les paquets en attente ([Surveillance](/qorel/monitoring)).

## Accès {#how-to-access}

- **Emplacement du fichier.** `~/.hermes/config.toml` pour une installation par archive ou Homebrew, `/etc/qorel/config.toml` pour les `.deb` et `.rpm`, et le répertoire monté pour le conteneur. Remplaçable avec `--config <path>`.
- **Magasin de clés.** `key_store_folder` définit l'emplacement des clés ; la valeur par défaut est `~/.hermes/keys`, et les paquets utilisent `/var/lib/qorel/keys`.
- **Prérequis.** Des points d'accès RPC, gRPC et WebSocket pour chaque chaîne, et un compte de relayeur approvisionné sur chacune.
- **Vérifier une configuration.** `qorel health-check` charge le fichier et teste chaque chaîne.

## Où c'est publié {#where-published}

| Quoi | Où |
|---|---|
| Configuration d'exemple (testnet, QoreChain et testnet public de Cosmos Hub) | `packaging/config.example.toml` dans [qorechain/QORel](https://github.com/qorechain/QORel) ; installée en `/etc/qorel/config.example.toml` par les paquets |
| Référence de configuration de Hermes | [hermes.informal.systems](https://hermes.informal.systems) |

## Limites et problèmes connus {#limits}

- **Les `extension_options` statiques sont refusées** sur une chaîne avec `signing = 'qorechain-hybrid'`.
- **Laissez `pqc.sign_bytes` sur `auto`.** Un `v1` ou `v2` fixe qui ne correspond pas à ce que la chaîne vérifie fait que la chaîne refuse toutes les transactions.
- **Mode des anciennes clés.** Les fichiers écrits par un ancien Hermes gardent leurs anciennes permissions.
- **Points d'accès tiers.** Les points d'accès côté Hub de la configuration d'exemple ne sont pas exploités par QoreChain et peuvent changer ou limiter le débit.
- **Entrée testnet uniquement.** L'entrée QoreChain ci-dessus concerne `qorechain-diana`. Le mainnet n'est pas ouvert à l'IBC.
