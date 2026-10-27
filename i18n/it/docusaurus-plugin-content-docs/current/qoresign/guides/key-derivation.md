---
slug: /qoresign/guides/key-derivation
title: Derivazione delle chiavi
sidebar_label: Derivazione delle chiavi
sidebar_position: 4
---

# Derivazione delle chiavi

QoreSign offre due modi per ottenere una chiave ML-DSA-87 da una mnemonica
BIP-39. Definizioni complete:
[Derivazione delle chiavi ML-DSA-87](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (bozza) |
|---|---|---|
| Input | mnemonica + indirizzo dell'account | mnemonica (o seed) + percorso hardened |
| Legata all'indirizzo | sì | no |
| Stessa chiave dei wallet QoreChain | sì | no |
| Richiede la registrazione on-chain | solo se non ancora registrata | sempre |
| Stabilità | stabile | può cambiare prima della versione definitiva |

Usa la [derivazione canonica](/qoresign/spec/hd-derivation-draft#canonical-derivation)
a meno che ti servano più chiavi post-quantistiche per seed, indipendenti dagli
indirizzi (la [bozza gerarchica](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)).

## Forma della mnemonica {#mnemonic-form}

La mnemonica deve essere in forma canonica (parole minuscole, spazi singoli).
QoreSign rifiuta le altre grafie invece di normalizzarle, perché la frase fa
parte dell'input della derivazione e una grafia diversa produrrebbe una chiave
diversa.

## Wallet senza la mnemonica {#without-mnemonic}

I wallet che non dispongono della mnemonica (per esempio, chiavi custodite in un
dispositivo hardware) non possono usare la derivazione canonica. Possono
generare una chiave ML-DSA-87 casuale con `pqKeyFromSeed(randomBytes(32))` oppure
usare la bozza HD, e registrare quella chiave.
