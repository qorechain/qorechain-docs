---
slug: /qorel/monitoring
title: Surveillance de QORel
sidebar_label: Surveillance
sidebar_position: 7
---

# Surveillance

Un relayeur qui s'arrête en silence laisse des paquets en attente : il doit donc être surveillé. Cette page liste ce que QORel expose (télémétrie Prometheus, point d'accès REST optionnel, journaux et commandes) et ce qui mérite une alerte. Elle s'adresse aux opérateurs qui font tourner un relayeur pour un canal qui leur importe.

## Innovations {#innovations}

- **Un contrôle de l'état de la clé post-quantique que l'on peut scripter.** `qorel keys pqc-status` affiche un objet JSON dont le champ `ready_to_relay` vaut `true` uniquement lorsque la clé est enregistrée sur la chaîne et correspond à la clé locale. Une alerte sur ce champ détecte une clé manquante ou modifiée avant que le relayeur soit refusé.
- **Des échecs qui n'arrêtent pas le relais en silence.** Les workers de paquets continuent de tourner et réessaient à chaque intervalle de purge après une tentative de relais ou de purge échouée, de sorte qu'une brève limitation de débit apparaît sous forme d'avertissements dans le journal et non d'un canal bloqué.
- **Une vérification avant envoi avec sa raison.** Lorsque la vérification avant envoi refuse une transaction (clé non enregistrée, clé différente, version des sign bytes inconnue), rien n'est envoyé et la raison est journalisée et affichée par `qorel health-check`.

## Utilisation {#how-to-use}

### Télémétrie {#telemetry}

Activez-la dans la configuration :

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

Les métriques sont servies au format Prometheus à l'adresse `http://127.0.0.1:3001/metrics`. Ce sont les métriques de Hermes ; Prometheus affiche les compteurs avec le suffixe `_total`. Celles qui valent la peine d'être tracées :

| Métrique | Intérêt |
|---|---|
| `workers` | Nombre de workers en cours par type ; une baisse signifie qu'un worker s'est arrêté. |
| `backlog_size`, `backlog_oldest_sequence` | Paquets en attente sur un canal et plus ancienne séquence encore en attente. |
| `wallet_balance` | Le solde du relayeur sur chaque chaîne. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Paquets relayés. Une courbe plate pendant que l'arriéré grandit indique un blocage. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Entretien des clients légers et signalements de comportements malveillants. |
| `broadcast_errors`, `simulate_errors` | Transactions refusées ou dont la simulation a échoué. |
| `ws_reconnect` | Reconnexions WebSocket ; de nombreuses reconnexions à la suite indiquent un point d'accès instable. |
| `tx_latency_submitted`, `tx_latency_confirmed` | Le temps que prennent les transactions. |

Hermes documente l'ensemble complet dans son [guide de télémétrie](https://hermes.informal.systems/documentation/telemetry/operators.html). Dans la configuration d'exemple, l'écoute se fait sur `127.0.0.1` ; placez votre collecteur Prometheus sur le même hôte ou modifiez `host` de façon délibérée.

### Ce qui mérite une alerte {#alerts}

| Quoi | Où |
|---|---|
| Processus actif | Le point d'accès de télémétrie répond |
| Paquets et accusés de réception en attente sur vos canaux | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Solde du relayeur sur chaque chaîne | `qorel keys balance --chain <id>`, ou `wallet_balance` |
| Clé post-quantique opérationnelle | `qorel keys pqc-status` indique `ready_to_relay: true` |
| Fraîcheur des clients | QORel rafraîchit un client au tiers de sa période de confiance ; déclenchez une alerte si un client n'a pas été mis à jour depuis environ la moitié de cette période |
| Erreurs | `broadcast_errors` et `simulate_errors` en hausse |

Une petite vérification de l'état de la clé, adaptée à cron ou à un agent de supervision :

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

Elle se termine avec un code non nul lorsque la clé n'est pas opérationnelle.

### Journaux {#logs}

`log_level = 'info'` dans `[global]` est la valeur par défaut. Avec le paquet systemd, les journaux vont dans le journal :

```bash
journalctl -u qorel -f
```

Une ligne de journal commençant par `post-quantum sign bytes` apparaît lorsque QORel lit la version des sign bytes depuis la chaîne et qu'elle change. Des avertissements sur des réponses `429` d'un point d'accès signifient que celui-ci limite le débit ; QORel réessaie.

### Point d'accès REST {#rest}

Le serveur REST optionnel (`[rest]` dans la configuration, port 3000 dans l'exemple, désactivé par défaut) expose l'état du relayeur pour inspection. Laissez-le lié à `127.0.0.1`.

### Vérifications manuelles {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## Accès {#how-to-access}

- La télémétrie et REST sont locaux à l'hôte du relayeur ; les deux sont hors du réseau public sauf si vous les exposez.
- Les commandes `qorel` lisent le même fichier de configuration que le relayeur.
- Le point d'accès REST public du testnet QoreChain (`https://api-testnet.qore.host`) montre l'état des canaux et des traces de jetons ; voir [Se connecter au testnet](/getting-started/connecting-to-testnet).

## Où c'est publié {#where-published}

La surveillance fait partie du binaire `qorel` ; il n'y a rien de séparé à installer. Sources et guide de télémétrie de Hermes : [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Limites et problèmes connus {#limits}

- **Pas de tableau de bord hébergé.** QORel ne fournit ni tableaux de bord ni règles d'alerte ; construisez-les à partir des métriques ci-dessus.
- **Les noms de métriques sont ceux de Hermes.** QORel n'ajoute aucune métrique post-quantique dans la 0.1.0 ; utilisez `keys pqc-status` pour cet état.
- **Les limitations de débit sont normales sur les points d'accès publics.** Déclenchez une alerte sur un arriéré durable, pas sur de simples avertissements `429`.
- **Testnet uniquement.** Rien de ce qui est décrit ici n'a été exécuté sur un canal du mainnet.
