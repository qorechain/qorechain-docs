---
slug: /developer-tools/pq-light-client
title: Client léger PQ
sidebar_label: Client léger PQ
sidebar_position: 31
---

# Client léger PQ (`qorechain-pq-light-client`)

`qorechain-pq-light-client` est une spécification en version brouillon et un vérificateur de référence pour des checkpoints signés avec ML-DSA-87 (FIPS 204). Dans la conception proposée, les validateurs signent un court checkpoint à la fin de chaque époque avec une clé de checkpoint ML-DSA-87 distincte, et un client léger suit la chaîne de checkpoints en vérifiant ces signatures et rien d'autre. Il s'adresse aux chercheurs en protocoles, aux développeurs de relayeurs et de ponts, et aux équipes d'autres chaînes qui veulent examiner la conception et la tester. Version **0.1.0**, Apache-2.0, maintenue par la QoreChain Association.

**La chaîne ne prend pas en charge ces checkpoints, et rien n'est programmé.** QoreChain ne produit pas les checkpoints que ce paquet vérifie, ni sur le mainnet (`qorechain-vladi`) ni sur le testnet (`qorechain-diana`). Aucune version de la chaîne ne les prend en charge, et aucune mise à niveau ni date n'est prévue. Les clés de consensus des validateurs sont aujourd'hui en ed25519, pas post-quantiques. Le paquet ne peut pas suivre un réseau en production : il s'exécute sur des ensembles de validateurs simulés et sur les vecteurs de test partagés. Il ne rend post-quantique aucune route, aucun pont ni aucun canal IBC de QoreChain.

## Innovations {#innovations}

- **Des checkpoints au lieu de signatures par bloc.** Les validateurs signeraient un checkpoint par époque (chain id, époque, hauteur, temps, hachage d'en-tête, hachage d'application, hachage de l'ensemble signataire et hachage de l'ensemble suivant). Les signatures voyageraient dans des transactions ordinaires, de sorte que la production de blocs n'attend jamais, et le volume de données reste très inférieur à celui d'une signature de chaque bloc. La spécification (section 12) donne le raisonnement.
- **Une clé de checkpoint distincte avec une preuve de possession.** Chaque validateur enregistrerait une clé de checkpoint ML-DSA-87, distincte de sa clé de consensus et de toute clé de compte, avec une preuve de possession sur `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **Transmission de l'ensemble par l'ensemble sortant.** Un checkpoint est accepté lorsque des validateurs détenant strictement plus des deux tiers de la puissance de l'ensemble nommé par le dernier checkpoint de confiance l'ont signé, de sorte que les changements d'ensemble de validateurs sont toujours signés par l'ensemble sortant. Exactement deux tiers n'est pas un quorum, et la signature d'un non-membre invalide le checkpoint au lieu d'être ignorée.
- **Un seul encodage par objet.** Le checkpoint, l'ensemble de validateurs et le checkpoint signé ont des encodages canoniques, et les décodeurs acceptent exactement un encodage pour chacun. Un relayeur transmet les octets canoniques sans les modifier.
- **Ordre fixe des vérifications.** `verifyCheckpoint` exécute les vérifications dans un ordre spécifié, de sorte que TypeScript, Rust et Go renvoient le même code d'erreur pour la même entrée.
- **Preuve de mauvaise conduite.** Deux checkpoints différents pour une même époque, chacun avec un quorum, constituent une mauvaise conduite. `detectMisbehaviour` renvoie les deux checkpoints dans un ordre canonique, les doubles signataires et leur puissance.
- **Trois langages, un seul jeu de vecteurs.** Les vecteurs partagés (`vectors/pq-light-client-v1.json`) proviennent d'un simulateur déterministe et couvrent des chaînes de checkpoints à 4 et à 21 validateurs, des rotations d'ensemble, tous les rejets que le vérificateur peut produire, des checkpoints en conflit et des cas de décodeur. Go, Rust et TypeScript les réussissent tous, de sorte qu'une quatrième implémentation peut prouver qu'elle correspond octet pour octet.

## Cas d'usage {#use-cases}

1. **Les développeurs de relayeurs prototypent un chemin de mise à jour post-quantique.** Un relayeur Rust conserve un état de confiance par réseau, décode et vérifie chaque checkpoint signé, transmet les mêmes octets à la destination et s'arrête sur `CONFLICTING_CHECKPOINT`. Aujourd'hui il s'exécute sur les vecteurs ou sur une chaîne simulée personnalisée ; le guide du relayeur du dépôt montre la boucle.
2. **Les équipes IBC et de ponts évaluent la conception.** La section 14 de la spécification fait correspondre les checkpoints à un type de client léger IBC (état du client, état de consensus, mauvaise conduite, preuves d'appartenance aux hauteurs de checkpoint). Les équipes peuvent examiner cette correspondance et ses compromis avant que quoi que ce soit n'existe on-chain. C'est une note de conception ; aucun code n'existe pour cela.
3. **Les équipes sur des chaînes EVM ou sur Solana comparent des conceptions de vérificateurs.** La section 15 compare la vérification ML-DSA-87 on-chain, une preuve STARK de vérification et un ensemble d'attestateurs, y compris les choix qui conservent la propriété post-quantique et ceux qui y renoncent. Là encore, ce ne sont que des notes de conception. À titre de référence, l'EVM de QoreChain dispose d'une précompilation de vérification ML-DSA (`pqcVerify`, 0x0A01) qui est active uniquement sur le testnet ; voir [Précompilations EVM](/developer-guide/evm-precompiles).
4. **Les relecteurs de sécurité et les chercheurs vérifient les règles.** L'ordre des vérifications, la règle du quorum, la transmission de l'ensemble, la période de confiance et les preuves de mauvaise conduite sont spécifiés et testables dans trois langages.
5. **Les équipes qui parlent de routes formulent correctement leurs affirmations.** La page de position du dépôt définit quand une route peut être qualifiée de post-quantique (voir [Limites](#limits)).
6. **Les implémenteurs dans d'autres langages.** Les vecteurs permettent à une nouvelle implémentation de prouver qu'elle correspond à la référence.

## Comment ça fonctionne {#how-it-works}

Tout ce qui figure dans cette section relève de la conception proposée, et tout cela nécessite une prise en charge par la chaîne qui n'est pas programmée.

1. Chaque validateur enregistre une clé de checkpoint ML-DSA-87 avec une preuve de possession (ci-dessus).
2. À la fin de chaque époque, les validateurs signent un checkpoint : chain id, époque (strictement croissante), hauteur, temps, hachage d'en-tête, hachage d'application, hachage de l'ensemble qui signe ce checkpoint et hachage de l'ensemble qui signe le suivant.
3. Un client léger accepte un checkpoint signé par plus des deux tiers de la puissance de l'ensemble que nommait son dernier checkpoint de confiance.
4. Deux checkpoints différents pour une même époque, chacun avec un quorum, constituent une mauvaise conduite ; la preuve nomme les doubles signataires.

Le consensus par bloc resterait inchangé. Les hauteurs à l'intérieur d'une époque restent classiques jusqu'au checkpoint suivant ; un client qui a besoin de la garantie post-quantique utilise les hauteurs de checkpoint et accepte jusqu'à une époque de latence.

**Formats** (tous les entiers en big-endian, octet de version `0x01`) :

| Objet | Disposition | Taille |
|---|---|---|
| Checkpoint | version, longueur et octets du chain id, époque, hauteur, temps, hachage d'en-tête, hachage d'application, hachage de l'ensemble de validateurs, hachage de l'ensemble de validateurs suivant | `154 + len(chain_id)` octets (169 pour `qorechain-vladi`) |
| Ensemble de validateurs | version, nombre (1 à 256), puis par validateur : adresse de 20 octets, puissance de 8 octets, clé ML-DSA-87 de 2 592 octets, triés par adresse | `3 + 2,620 x validators` octets |
| Checkpoint signé | version, checkpoint, nombre de signatures, par signataire une adresse de 20 octets et une signature de 4 627 octets (triées par adresse), indicateur d'ensemble suivant, ensemble suivant lorsque l'ensemble change | `173 + 4,647 x signers` octets pour `qorechain-vladi`, plus l'ensemble suivant lorsqu'il est présent |

**Signature et hachage.** ML-DSA-87, mode pur de FIPS 204, contexte vide, sur `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. La signature déterministe et la signature hedged sont toutes deux valides. Le hachage est SHAKE-256 avec une sortie de 32 octets ; le hachage de l'ensemble de validateurs utilise le préfixe `qorechain-pqlc-valset-v1|`.

**Ordre de vérification** (`verifyCheckpoint`) : structure, chain id, expiration de la confiance, dérive d'horloge, traitement de la même époque (identique donne `NOT_NEWER` ; différent avec un quorum donne `CONFLICTING_CHECKPOINT`), progression de l'époque, de la hauteur et du temps, l'ensemble signataire est égal à l'ensemble suivant de confiance, l'ensemble suivant transporté correspond à son hachage, quorum. Un échec laisse l'état de confiance inchangé. Une époque ultérieure peut être acceptée directement tant que l'ensemble signataire ne change pas ; après une rotation, chaque checkpoint à partir de la rotation doit être vérifié.

**Confiance.** Un client part d'une racine de confiance choisie en dehors du protocole, comme pour tout client léger en proof-of-stake. La période de confiance doit être plus courte que la période pendant laquelle un validateur peut encore être sanctionné ; une fois celle-ci écoulée, le client doit être réinitialisé.

La spécification est `spec/pq-light-client-v1.md` dans le dépôt (statut : brouillon, ouvert à la relecture). La section 10 (clés de checkpoint, signature, époques, pénalités on-chain) est une conception soumise à relecture, pas un engagement.

## Comment l'utiliser {#how-to-use}

### Installer {#install}

| Langage | Installation | Plateforme minimale |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 ou plus récent, et navigateurs. Dépend de `@qorechain/pqc` 0.2.3 |
| Rust | `cargo add qorechain-pq-light-client` (bibliothèque `qorechain_pq_light_client`) | Rust stable ; dépend de `qorechain-pqc` 0.2.3 ; aucun `unsafe`, aucune E/S |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (paquet `pqlightclient`) | Go 1.25 ; dépend de `github.com/qorechain/qorechain-pqc/go` v0.2.3 |

Il n'existe pas de paquet PyPI, et aucun n'est prévu.

### Démarrage rapide (hors ligne, TypeScript) {#quickstart}

Rien ne touche un réseau QoreChain. Le script suit la chaîne simulée de checkpoints à 21 validateurs issue des vecteurs partagés (chain id `qorechain-sim-21`, avec une rotation d'ensemble à l'époque 2), puis montre que la source en direct n'est pas disponible. Les clés des vecteurs sont des clés de test publiques.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

Exécuté le 27 octobre 2026 avec le paquet npm publié 0.1.0 et les vecteurs du tag v0.1.0, `node follow.mjs` a affiché :

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

Le fichier de vecteurs pèse environ 2,4 Mo. L'original Rust est `rust/examples/relayer.rs` dans le dépôt (`cargo run --example relayer`) ; il n'a pas été exécuté pour cette page.

Gestion des erreurs en TypeScript (d'après le README du paquet) :

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

La même chose en Go :

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### API principale {#api}

L'API est identique dans les trois langages (camelCase en TypeScript, PascalCase en Go, snake_case en Rust). Les champs 64 bits sont des `bigint` en TypeScript.

| Nom | Ce qu'il fait |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | types de données |
| `encodeCheckpoint`, `decodeCheckpoint` | encodage canonique du checkpoint ; décodeur strict |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | encodage de l'ensemble de validateurs et hachage SHAKE-256 |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | les octets qu'un relayeur transporte |
| `encodeCheckpointSignBytes` | les sign-bytes, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | de la racine de confiance à l'état de confiance (vérifie que les deux ensembles ont pour hachage les valeurs du checkpoint ; ne vérifie pas les signatures) |
| `verifyCheckpoint(trusted, signed, now)` | vérification complète ; renvoie le nouvel état de confiance ou une erreur typée |
| `detectMisbehaviour(set, a, b)` | preuve pour des checkpoints en conflit, ou rien |
| `signCheckpoint` | signe un checkpoint avec une clé secrète ML-DSA-87 (simulateurs et tests) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) ou `ChainCheckpointSource` (Rust, Go) | interfaces pour une future API de nœud ; aujourd'hui elles échouent toujours avec `REQUIRES_CHAIN_SUPPORT` et n'envoient aucune requête |
| `PqLightClientError` (TypeScript), `*Error` avec `ErrInsufficientPower` et similaires (Go, utiliser `errors.Is`), `Error` avec `code()` (Rust) | erreurs typées avec des codes stables |

Codes d'erreur, communs aux trois langages, et ce qu'un relayeur doit faire (d'après le guide du relayeur) :

| Erreur | Action |
|---|---|
| `MALFORMED` | abandonner les octets ; la source est défectueuse |
| `CHAIN_ID_MISMATCH` | erreur de configuration |
| `TRUST_EXPIRED` | s'arrêter ; réinitialiser à partir d'une nouvelle racine de confiance |
| `FUTURE_CHECKPOINT` | vérifier l'horloge locale ; réessayer plus tard |
| `NOT_NEWER` | rien de nouveau ; attendre |
| `SET_MISMATCH` | il manque un checkpoint avec une rotation d'ensemble ; récupérer les époques intermédiaires |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | abandonner le checkpoint |
| `INSUFFICIENT_POWER` | attendre davantage de signatures |
| `CONFLICTING_CHECKPOINT` | cesser de relayer et signaler la preuve |
| `REQUIRES_CHAIN_SUPPORT` | attendu aujourd'hui |

## Comment y accéder {#how-to-access}

- **Mainnet `qorechain-vladi` et testnet `qorechain-diana` :** aucun checkpoint n'est produit, de sorte que les vérificateurs ne peuvent suivre aucun des deux réseaux. Aucune version de la chaîne ne les prend en charge et aucune n'est programmée.
- Ce que font les réseaux aujourd'hui : les clés de consensus des validateurs sont en ed25519, les vote extensions sont désactivées, et IBC utilise le type de client léger standard 07.
- **Pour exécuter le paquet**, il ne vous faut rien de plus que l'environnement d'exécution du langage. Aucun compte, aucune clé, aucun endpoint, aucun coût. Les vecteurs utilisent des clés de test publiques et les chain ids `qorechain-sim` et `qorechain-sim-21`.
- À titre de référence uniquement (ce paquet ne les utilise pas) : REST `https://api.qore.host` et `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` et `https://rpc-testnet.qore.host`.

## Où il est publié {#where-published}

Vérifié le 27 octobre 2026 auprès de chaque registre.

| Registre | Paquet | Version | Lien |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Proxy de modules Go | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Source : [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (release v0.1.0, code source, aucun binaire). Licence Apache-2.0.

## Limites et problèmes connus {#limits}

- **Il ne rend post-quantique ni QoreChain, ni aucun canal IBC, pont ou relayeur.** Les clés de consensus des validateurs ne sont pas post-quantiques aujourd'hui, et aucune mise à niveau pour changer cela n'est programmée.
- **Il ne peut pas suivre un réseau en production.** `fetchCheckpoint` échoue toujours avec `REQUIRES_CHAIN_SUPPORT`. Il fonctionne sur des ensembles de validateurs simulés et sur les vecteurs partagés.
- **La spécification est un brouillon, ouvert à la relecture.** Rien dans celle-ci n'est un engagement.
- **Notes de conception sans code :** le type de client IBC (section 14) et les vérificateurs EVM et Solana (section 15).
- **Les hauteurs à l'intérieur d'une époque restent classiques.** Même avec des checkpoints, la vérification post-quantique s'appliquerait aux hauteurs de checkpoint.
- **Ce qui peut être qualifié de route post-quantique.** Une route peut être qualifiée de post-quantique lorsque les deux extrémités vérifient l'état signé de façon post-quantique de l'autre extrémité, dans les deux sens, sans étape classique : aucun client léger classique à aucune extrémité, aucun wrapper SNARK à base d'appariements, aucun comité d'attestateurs classique. Des signatures de compte post-quantiques ne suffisent pas à rendre une route post-quantique. Les comptes QoreChain signent avec ML-DSA-87 et secp256k1 ; décrivez cela comme des « signatures de compte post-quantiques », pas comme une route post-quantique.
- **Les racines de confiance sont subjectives.** Le protocole ne peut pas protéger un client qui part d'une mauvaise racine.
- **Pré-1.0.** Les versions mineures peuvent modifier l'API.

Formulation suggérée par la page de position du dépôt :

| Situation | Formulation |
|---|---|
| Les comptes signent avec ML-DSA-87 | « signatures de compte post-quantiques » |
| Une extrémité vérifie des checkpoints post-quantiques, l'autre non | « vérification post-quantique de l'état de QoreChain sur la chaîne X ; le chemin de retour est classique » |
| Les deux extrémités vérifient un état signé de façon post-quantique, sans étape classique | « route post-quantique » |

Tant que les deux extrémités ne respectent pas la règle, décrivez une route par ce qu'elle vérifie réellement, par exemple « sécurisée par le client léger classique de la contrepartie ».

## Notes de sécurité {#security}

- Le paquet ne détient aucune clé et n'effectue aucune E/S. Rust n'a aucun code `unsafe` ; en TypeScript et en Go, `fetchCheckpoint` n'envoie aucune requête.
- Les décodeurs sont stricts : un seul encodage par objet, et toute autre longueur de signature ou de clé est rejetée. Les relayeurs doivent transmettre les octets canoniques sans les modifier, jamais un ré-encodage.
- Les signatures de validateurs extérieurs à l'ensemble invalident un checkpoint au lieu d'être ignorées, ce qui maintient toutes les implémentations sur le même résultat.
- Gardez l'horloge du vérificateur synchronisée : une horloge en avance fait expirer la confiance trop tôt, et une horloge en retard rejette les nouveaux checkpoints en `FUTURE_CHECKPOINT`.
- La conception suppose que les validateurs détenant plus des deux tiers de la puissance de chaque ensemble de checkpoint ne signent que des checkpoints que leur propre nœud a validés.
- Les domaines de signature proposés (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) sont des propositions ; ils ne sont pas réservés on-chain aujourd'hui.
- Les clés des vecteurs sont des clés de test publiques ; ne les utilisez jamais pour autre chose.
- Signalez les vulnérabilités en privé à security@qore.network.

## Pages associées {#related}

- [Bibliothèque PQC](/developer-tools/pqc-library) : les liaisons ML-DSA-87 et SHAKE-256 sous les vérificateurs.
- [QoreSign](/qoresign/overview) : signatures ML-DSA-87 au niveau du compte, qui sont autre chose que les checkpoints de validateurs.
- [Sécurité post-quantique](/architecture/post-quantum-security) : le modèle post-quantique de la chaîne aujourd'hui.
- [Architecture du pont](/architecture/bridge-architecture) et [Transférer des actifs par pont](/user-guide/bridging-assets) : les routes inter-chaînes d'aujourd'hui utilisent le client léger classique standard.
- [QoreSeal](/developer-tools/qoreseal) : l'autre kit post-quantique 0.1.0 publié le 27 octobre 2026.
- [Aperçu des paquets développeur](/developer-tools/overview).
