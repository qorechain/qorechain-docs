---
slug: /qoresign/guides/key-derivation
title: Dérivation de clés
sidebar_label: Dérivation de clés
sidebar_position: 4
---

# Dérivation de clés

QoreSign offre deux façons d'obtenir une clé ML-DSA-87 à partir d'une phrase
mnémonique BIP-39. Définitions complètes :
[Dérivation de clés ML-DSA-87](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (brouillon) |
|---|---|---|
| Entrée | mnémonique + adresse du compte | mnémonique (ou seed) + chemin durci |
| Liée à l'adresse | oui | non |
| Même clé que les portefeuilles QoreChain | oui | non |
| Enregistrement sur la chaîne nécessaire | seulement si pas encore enregistrée | toujours |
| Stabilité | stable | peut changer avant d'être définitive |

Utilisez la [dérivation canonique](/qoresign/spec/hd-derivation-draft#canonical-derivation)
sauf si vous avez besoin de plusieurs clés post-quantiques par seed, indépendantes
des adresses (le [brouillon hiérarchique](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)).

## Forme du mnémonique {#mnemonic-form}

Le mnémonique doit être sous sa forme canonique (mots en minuscules, séparés par
une seule espace). QoreSign refuse les autres graphies au lieu de les normaliser,
car la phrase fait partie de l'entrée de la dérivation et une graphie différente
donnerait une clé différente.

## Portefeuilles sans le mnémonique {#without-mnemonic}

Les portefeuilles qui n'ont pas le mnémonique (par exemple, des clés conservées
dans du matériel) ne peuvent pas utiliser la dérivation canonique. Ils peuvent
générer une clé ML-DSA-87 aléatoire avec `pqKeyFromSeed(randomBytes(32))` ou
utiliser le brouillon HD, et enregistrer cette clé.
