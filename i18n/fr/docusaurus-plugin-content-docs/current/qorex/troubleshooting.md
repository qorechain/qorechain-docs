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
| **« Secure your device first »** lors de la configuration | Enregistrez Face ID / une empreinte digitale dans les réglages de votre système, puis revenez à l'application. Un portefeuille ne peut être créé que sur un appareil protégé par biométrie. |
| **Feuille de connexion fermée** / « That sign-in attempt expired » | Une tentative précédente a été abandonnée — appuyez simplement à nouveau sur la connexion. |
| **« Add a passkey » absent** après une connexion Google / Dashboard | Comportement attendu : les passkeys ne s'attachent qu'aux comptes par code e-mail (voir la note dans [Compte & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **« Handles coming soon »** | Le registre des @handle est temporairement inaccessible. Votre portefeuille n'est pas affecté ; les handles s'activent automatiquement dès son retour. |
| **« Wrong code or damaged QR »** lors de la liaison d'un appareil | Revérifiez le code à 10 caractères (l'alphabet exclut les caractères ambigus : pas de 0/O/1/I/L) et rescannez. Les deux artefacts sont à usage unique. |
| **L'écran de la caméra indique qu'une autorisation est nécessaire** | iOS : Réglages → QoreX → Caméra. Android : Infos sur l'appli → Autorisations → Caméra. |
| **Extension : « No wallet yet »** | L'extension s'associe à un portefeuille créé dans l'application mobile QoreX — créez-en un là-bas d'abord. |
| **Envoi depuis une adresse en lecture seule refusé** | Cette adresse appartient à un autre portefeuille (l'étiquette indique lequel). QoreX ne peut signer que pour ses propres comptes dérivés — envoyez depuis le portefeuille qui la possède. |
| **Badge Testnet affiché** | Réglages → **« Use testnet (developers) »** est activé. Désactivez-le pour revenir au mainnet. |
| **Le bouton Swap est désactivé** | Attendu pour l'instant — Swap s'active automatiquement dès que la liquidité du pool est disponible ; aucune mise à jour de l'application n'est nécessaire. |

## Toujours bloqué ?

- Consultez la page [Sécurité & Récupération](/qorex/security-and-recovery) pour les gardiens et la liaison d'appareils.
- Pour les questions concernant QoreChain lui-même, consultez la [documentation principale](/introduction/what-is-qorechain) ou les canaux communautaires liés sur [qorechain.io](https://qorechain.io).
