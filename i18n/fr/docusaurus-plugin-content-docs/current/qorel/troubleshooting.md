---
slug: /qorel/troubleshooting
title: Dépannage et FAQ de QORel
sidebar_label: Dépannage
sidebar_position: 9
---

# Dépannage et FAQ

Questions et solutions pour faire tourner QORel, dans l'ordre où l'on y est habituellement confronté. Cette page s'adresse aux opérateurs dont le relayeur ne démarre pas, refuse d'envoyer ou laisse des paquets en attente. QORel est aujourd'hui réservé au testnet, donc chaque réponse suppose `qorechain-diana`.

## Innovations {#innovations}

La plupart des problèmes sur une chaîne hybride sont détectés avant qu'un frais soit dépensé :

- **La vérification avant envoi nomme le problème.** Si la clé post-quantique n'est pas chargée, pas enregistrée ou n'est pas la clé locale, ou si la version des sign bytes est inconnue, QORel n'envoie rien et indique lequel de ces cas s'applique.
- **`keys pqc-status` est la première commande à lancer.** Elle montre l'enregistrement, la correspondance des clés, la preuve de possession, la version des sign bytes que la chaîne vérifie, et `ready_to_relay`.
- **`health-check` explique les erreurs de configuration**, y compris un multiplicateur de gas inférieur à 1.1 sur une entrée QoreChain.

## Utilisation {#how-to-use}

Lancez d'abord ces commandes et comparez :

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Clés et enregistrement {#keys}

**`ready_to_relay` vaut `false`. Que faire ?**
Lisez les autres champs de `keys pqc-status` :
- `registered: false` : le compte n'a aucune clé post-quantique enregistrée. Approvisionnez le compte, puis lancez `qorel keys register-pqc --chain qorechain-diana`.
- `registered: true` mais `matches_local_key: false` : le compte a enregistré une clé différente de celle que détient QORel. Vérifiez que vous avez utilisé la phrase mnémonique propre au compte et le bon `--key-name`. Si vous avez rajouté la clé, `keys add --overwrite` reconstruit la clé locale et sa graine `<key name>.pqc` à partir de la phrase mnémonique.
- La commande n'arrive pas à charger la clé : le fichier `<key name>.pqc` à côté de la clé est manquant ou illisible. Relancez `keys add` pour cette chaîne.

**`keys register-pqc` indique que le compte a déjà une clé différente.**
Il n'a rien envoyé, volontairement. La clé sur la chaîne a été enregistrée à partir d'une autre phrase mnémonique ou par un autre outil. Utilisez la phrase mnémonique d'origine, ou faites pivoter la clé sur la chaîne à partir de l'ancienne ([Signature post-quantique](/developer-guide/post-quantum-signing#key-rotation)) ; une clé que le compte a utilisée auparavant ne peut pas être enregistrée à nouveau.

**`keys register-pqc` échoue avec une erreur de frais ou de solde.**
Le compte a besoin de QOR sur le testnet avant de pouvoir envoyer sa première transaction. Utilisez le [faucet du tableau de bord](/dashboard/faucet). L'enregistrement nécessite quelques centaines de milliers de gas ; au plancher de 0,1 uqor, cela représente quelques dizaines de milliers d'uqor.

**Ai-je besoin de `--no-proof` ?**
Uniquement pour un réseau antérieur à la v3.2.3. Les deux réseaux QoreChain acceptent une preuve de possession, et QORel en ajoute une par défaut.

**Où ma clé post-quantique est-elle stockée ?**
À côté de la clé secp256k1, sous le nom `<key name>.pqc` (une graine de 32 octets), lisible uniquement par le propriétaire. Elle peut être redérivée à partir de la phrase mnémonique. Sauvegardez la phrase mnémonique, pas les fichiers.

**Mes fichiers de clés sont lisibles par d'autres.**
QORel écrit les nouveaux fichiers de clés en 0600. Les clés ajoutées avec un ancien Hermes gardent leur ancien mode ; lancez `chmod 600` dessus.

### Configuration {#config}

**La configuration est refusée avec un message à propos de `extension_options`.**
Des `extension_options` statiques ne peuvent pas être combinées avec `signing = 'qorechain-hybrid'` : la signature post-quantique doit être la seule option d'extension critique. Retirez-les de l'entrée de cette chaîne.

**Il indique que la chaîne n'utilise pas `signing = "qorechain-hybrid"`.**
Les commandes de clés post-quantiques ne fonctionnent que sur les chaînes avec ce paramètre. Ajoutez-le à l'entrée QoreChain.

**Dois-je définir la version des sign bytes ?**
Non. `pqc.sign_bytes = 'auto'` la lit depuis la chaîne, la relit chaque minute et après tout refus. Un `v1` ou `v2` fixe qui ne correspond pas à la chaîne fait que celle-ci refuse toutes les transactions.

**`pqc-status` affiche `sign_bytes` comme inconnu.**
QORel n'a pas pu lire les enregistrements de mise à niveau de la chaîne. Vérifiez que `rpc_addr` de l'entrée QoreChain répond et pointe vers le bon réseau (`qorechain-diana` sur le testnet). QORel ne signera pas sans version connue.

**Quel multiplicateur de gas utiliser ?**
`1.1` est la valeur par défaut de l'exemple et garde `health-check` silencieux. Sur le testnet (v3.2.6), une valeur plus basse comme `1.05` fonctionne. Les builds antérieurs sous-estiment le gas simulé : utilisez donc `1.15` sur un nœud qui en exécute un. Voir [Gas](/qorel/configuration#gas).

**`health-check` avertit à propos du multiplicateur de gas.**
Il est inférieur à 1.1 sur une entrée QoreChain. Ce n'est qu'un avertissement ; le relais fonctionne. Augmentez-le si vous constatez des échecs par manque de gas.

### Envoi et relais {#relaying}

**La chaîne refuse une transaction avec le codespace `pqc`, code 21.**
La signature hybride n'a pas été vérifiée. QORel relit la version des sign bytes et l'enregistrement avant la transaction suivante et réessaie. Si cela se répète : confirmez que `id` dans l'entrée de chaîne est exactement l'identifiant de la chaîne (`qorechain-diana`), que la clé est celle qui est enregistrée (`keys pqc-status`), et que le nœud que vous utilisez exécute la version attendue. [Signature post-quantique](/developer-guide/post-quantum-signing#code-21) liste les causes.

**Rien n'est envoyé et aucun frais n'est dépensé, mais le relayeur journalise une erreur.**
C'est la vérification avant envoi qui fait son travail. La ligne de journal nomme l'élément manquant : clé non chargée, clé non enregistrée, clé différente ou version des sign bytes inconnue. Corrigez-le comme indiqué plus haut.

**Erreurs `account sequence mismatch`.**
Deux processus signent avec la même clé de relayeur. Exécutez un relayeur par clé ; cela inclut un service systemd plus un conteneur, et un second pod Kubernetes.

**Je vois `429 Too Many Requests` dans les journaux.**
Le point d'accès limite le débit, généralement un point d'accès public après un redémarrage. QORel le traite comme réessayable et maintient ses workers de paquets en marche, en réessayant à chaque intervalle de purge. Pour un relais continu, utilisez vos propres nœuds ou un point d'accès payant. Le testnet QoreChain n'a pas de point d'accès gRPC public, donc le côté QoreChain nécessite de toute façon votre propre nœud.

**Frais ou erreurs de manque de gas sur QoreChain.**
Les frais sont la limite de gas multipliée par le prix, sans remboursement, et le plancher est de 0,1 uqor par gas. Vérifiez `gas_price`, que `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` est défini, et le solde du compte (`qorel keys balance --chain qorechain-diana`).

### Paquets et canaux {#packets}

**Mon transfert est en attente et rien n'arrive.**
Vérifiez, dans l'ordre : qu'un relayeur tourne pour le canal (le processus est actif ; la télémétrie répond) ; que le canal figure dans votre `packet_filter` sur les deux chaînes ; que le relayeur a un solde sur la chaîne de destination ; que la clé post-quantique est opérationnelle ; que les points d'accès sont joignables. Lancez ensuite `qorel query packet pending` pour le canal. Si aucun relayeur ne tourne, le paquet attend qu'un relayeur démarre ou que le transfert expire.

**Que se passe-t-il si un transfert expire ?**
Lorsque le relayeur est en marche, il relaie l'expiration et les jetons sont remboursés à l'expéditeur sur la chaîne source. Cela a été testé sur le canal du testnet.

**Puis-je utiliser le canal de test existant, ou ai-je besoin du mien ?**
Le `channel-0` du testnet vers le `channel-600` du testnet du Hub est ouvert ([Le canal de test](/user-guide/bridging-assets#ibc-test-channel)) ; lancez QORel avec ce `packet_filter` pour le relayer. Créez le vôtre avec `qorel create channel ... --new-client-connection` seulement si vous en avez besoin.

**`create channel` échoue en cours de route.**
La poignée de main représente plusieurs transactions sur les deux chaînes. Lancez `qorel health-check`, corrigez la cause, puis relancez la commande avec `--a-connection` défini sur la connexion déjà créée, ou recommencez avec `--new-client-connection`.

**Hermes standard fonctionne-t-il avec QoreChain ?**
Non. QoreChain refuse une transaction sans la signature ML-DSA-87, et Hermes standard ne l'ajoute pas. QORel, c'est Hermes plus cette signature.

### Général {#general}

**QORel peut-il relayer d'autres chaînes que QoreChain ?**
Oui. Une chaîne sans `signing` utilise le format de transaction standard de Hermes, octet pour octet.

**Prend-il en charge le mainnet ?**
Pas encore. Aucun canal IBC du mainnet n'est ouvert. Lorsque l'IBC du mainnet ouvrira, ce manuel l'indiquera.

**Prend-il en charge IBC v2 ?**
Pas encore. Le relais IBC v2 n'est pas implémenté dans QORel ; c'est la prochaine phase. Le relais Ethereum (Eureka) n'a pas été commencé.

**Windows ?**
Non. Utilisez le conteneur sous WSL2.

**Où signaler un problème ?**
Ouvrez un ticket sur [github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues). Indiquez la version de QORel, l'entrée de chaîne expurgée et la sortie de `qorel keys pqc-status` ; ne publiez jamais une phrase mnémonique, un fichier de clé ou une graine `.pqc`.

## Accès {#how-to-access}

- Chaque commande ci-dessus s'exécute sur l'hôte du relayeur avec la même configuration que le relayeur.
- État public de référence pour comparer : le REST du testnet QoreChain à `https://api-testnet.qore.host` ([Se connecter au testnet](/getting-started/connecting-to-testnet)) et l'[explorateur de blocs](https://explore.qore.network) (basculez sur Testnet).

## Où c'est publié {#where-published}

QORel se trouve dans le dépôt [qorechain/QORel](https://github.com/qorechain/QORel) ; les tickets vont là-bas. Le guide de Hermes en amont, [hermes.informal.systems](https://hermes.informal.systems), couvre les paramètres et commandes que QORel partage avec lui.

## Limites et problèmes connus {#limits}

- **Testnet uniquement**, et une version 0.x.
- **Pas encore de relais IBC v2** (prochaine phase), et pas de relais Ethereum (Eureka).
- **Les points d'accès tiers limitent le débit.** Les points d'accès côté Hub de la configuration d'exemple sont publics et non exploités par QoreChain.
- **Cette page ne peut pas couvrir toutes les erreurs de Hermes.** Pour les erreurs qui ne mentionnent ni la clé post-quantique, ni les sign bytes, ni QoreChain, le guide de Hermes et son suivi de tickets s'appliquent.

Voir aussi : [Configuration](/qorel/configuration), [Surveillance](/qorel/monitoring), [Signer depuis n'importe quel langage](/qorel/signing-from-any-language).
