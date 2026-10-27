---
slug: /qoresign/guides/key-derivation
title: Derivarea cheilor
sidebar_label: Derivarea cheilor
sidebar_position: 4
---

# Derivarea cheilor

QoreSign oferă două moduri de a obține o cheie ML-DSA-87 dintr-o mnemonică
BIP-39. Definițiile complete: [Derivarea cheilor ML-DSA-87](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (draft) |
|---|---|---|
| Intrare | mnemonică + adresa contului | mnemonică (sau seed) + cale hardened |
| Legată de adresă | da | nu |
| Aceeași cheie ca portofelele QoreChain | da | nu |
| Necesită înregistrare pe lanț | doar dacă nu este încă înregistrată | întotdeauna |
| Stabilitate | stabilă | poate fi modificată înainte de forma finală |

Folosiți [derivarea canonică](/qoresign/spec/hd-derivation-draft#canonical-derivation),
cu excepția cazului în care aveți nevoie de mai multe chei post-cuantice per
seed, independente de adrese ([draftul ierarhic](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)).

## Forma mnemonicii {#mnemonic-form}

Mnemonica trebuie să fie în formă canonică (cuvinte cu litere mici, separate
prin spații simple). QoreSign refuză alte scrieri în loc să le normalizeze,
deoarece fraza face parte din datele de intrare ale derivării, iar o scriere
diferită ar da o cheie diferită.

## Portofele fără mnemonică {#without-mnemonic}

Portofelele care nu dețin mnemonica (de exemplu, cu chei păstrate în hardware)
nu pot folosi derivarea canonică. Ele pot genera o cheie ML-DSA-87 aleatoare cu
`pqKeyFromSeed(randomBytes(32))` sau pot folosi draftul HD și pot înregistra
acea cheie.
