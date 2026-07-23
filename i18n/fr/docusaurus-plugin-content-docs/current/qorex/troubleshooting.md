---
slug: /qorex/troubleshooting
title: Dépannage de QoreX
sidebar_label: Dépannage
sidebar_position: 9
---

# Dépannage

Questions fréquentes et solutions rapides pour l'application et l'extension QoreX.

| Symptôme | Cause / solution |
|---|---|
| **« Sécurisez d'abord votre appareil »** lors de l'intégration | Configurez Face ID / une empreinte digitale **ou un verrouillage d'écran (PIN / pattern)** dans les paramètres de votre système, puis revenez. Un portefeuille ne peut être créé que sur un appareil doté d'un facteur de déverrouillage fort. Sur Android, le déverrouillage facial 2D seul est une biométrie *faible* — c'est le PIN qui le sous-tend qui remplit les conditions. |
| **Feuille de connexion fermée** / « Cette tentative de connexion a expiré » | Une tentative précédente a été abandonnée — appuyez simplement à nouveau sur connexion. |
| **« Ajouter une passkey » absent** après une connexion Google / Dashboard | Comportement attendu : les passkeys ne s'attachent qu'aux comptes à code par e-mail (voir la note dans [Compte et Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **« Handles bientôt disponibles »** | Le registre des @handle est temporairement inaccessible. Votre portefeuille n'est pas affecté ; les handles s'activent automatiquement à son retour. |
| **« Code erroné ou QR endommagé »** lors de la liaison d'un appareil | Revérifiez le code à 10 caractères (l'alphabet exclut les caractères ambigus : pas de 0/O/1/I/L) et rescannez. Les deux éléments sont à usage unique. |
| **L'écran de la caméra indique qu'une autorisation est requise** | iOS : Réglages → QoreX → Caméra. Android : Infos sur l'appli → Autorisations → Caméra. |
| **Extension : « Aucun portefeuille pour l'instant »** | L'extension s'associe à un portefeuille créé dans l'application mobile QoreX — créez-en un là-bas d'abord. |
| **Envoi depuis une adresse en lecture seule refusé** | Cette adresse appartient à un autre portefeuille (l'étiquette indique lequel). QoreX ne peut signer que pour ses propres comptes dérivés — envoyez depuis le portefeuille qui la possède. |
| **Badge testnet affiché** | Réglages → **« Utiliser le testnet (développeurs) »** est activé. Désactivez-le pour revenir au mainnet. |
| **Le bouton Swap est désactivé** | Attendu pour l'instant — le Swap s'active automatiquement dès que la liquidité du pool est disponible ; aucune mise à jour de l'application n'est nécessaire. |

## Toujours bloqué ?

- Consultez la page [Sécurité et récupération](/qorex/security-and-recovery) pour les gardiens et la liaison d'appareils.
- Pour des questions sur QoreChain elle-même, consultez la [documentation principale](/introduction/what-is-qorechain) ou les canaux communautaires liés sur [qorechain.io](https://qorechain.io).
