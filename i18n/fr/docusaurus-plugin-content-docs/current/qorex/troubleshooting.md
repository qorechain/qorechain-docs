---
slug: /qorex/troubleshooting
title: Dépannage de QoreX
sidebar_label: Dépannage
sidebar_position: 9
---

# Dépannage

Questions courantes et solutions rapides pour l'application et l'extension QoreX.

| Symptôme | Cause / solution |
|---|---|
| **« Sécurisez d'abord votre appareil »** lors de l'intégration | Configurez Face ID / une empreinte digitale **ou un verrouillage d'écran (code PIN / schéma)** dans les paramètres de votre système, puis revenez. Un portefeuille ne peut être créé que sur un appareil doté d'un facteur de déverrouillage robuste. Sur Android, le déverrouillage facial 2D seul est une biométrie *faible* — c'est le code PIN qui le sous-tend qui est qualifiant. |
| **Feuille de connexion fermée** / « Cette tentative de connexion a expiré » | Une tentative précédente a été abandonnée — appuyez simplement de nouveau sur connexion. |
| **« Ajouter une clé d'accès » absent** après une connexion Google / Dashboard | Comportement attendu : les clés d'accès ne se rattachent qu'aux comptes par code e-mail (voir la note dans [Compte et Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **« Les identifiants arrivent bientôt »** | Le registre des @handles est temporairement injoignable. Votre portefeuille n'est pas affecté ; les identifiants s'activent automatiquement à son retour. |
| **QoreX vous avertit que l'adresse d'un identifiant a changé** | Comportement de sécurité attendu, pas un bug — QoreX mémorise l'adresse à laquelle un identifiant a résolu la première fois que vous l'avez payé, et signale tout changement ultérieur plutôt que de lui faire confiance silencieusement. Confirmez la nouvelle adresse hors bande avec le destinataire avant de continuer. |
| **Envoi refusé pour « plus que votre solde disponible »** sur un compte avec acquisition progressive (vesting) | Une partie de votre solde est encore verrouillée par un calendrier d'acquisition progressive (vesting). Seule la portion **disponible** (affichée sur Accueil, Envoyer et le détail de l'actif) peut être envoyée ; le reste se libère progressivement. |
| **Une demande de portefeuille indique qu'elle est « pour le testnet/mainnet, mais votre portefeuille est sur… »** | La demande (par exemple depuis le Dashboard) cible un réseau différent de celui auquel vous êtes actuellement connecté. Changez vous-même de réseau au préalable si c'est bien votre intention — QoreX ne changera pas de réseau à votre place. |
| **« Code erroné ou QR endommagé »** lors de l'association d'appareils | Revérifiez le code à 10 caractères (l'alphabet exclut les caractères ressemblants : pas de 0/O/1/I/L) et rescannez. Les deux éléments sont à usage unique. |
| **L'écran de la caméra indique qu'une autorisation est nécessaire** | iOS : Réglages → QoreX → Caméra. Android : Infos sur l'appli → Autorisations → Caméra. |
| **Extension : aucun portefeuille à la première ouverture** | L'extension est un portefeuille **autonome** — ouvrez la fenêtre contextuelle et choisissez **Créer un portefeuille** ou **Importer un portefeuille**. Elle ne nécessite pas l'application mobile. |
| **Envoi refusé depuis une adresse en lecture seule** | Cette adresse appartient à un autre portefeuille (l'étiquette indique lequel). QoreX ne peut signer que pour ses propres comptes dérivés — envoyez depuis le portefeuille qui la possède. |
| **Badge testnet affiché** | Paramètres → **« Utiliser le testnet (développeurs) »** est activé. Désactivez-le pour revenir au mainnet. |
| **Le bouton d'échange est désactivé** | Comportement attendu pour l'instant — l'échange s'active automatiquement dès que la liquidité du pool est disponible ; aucune mise à jour de l'application n'est nécessaire. |
| **J'ai désinstallé l'application / retiré l'extension et je ne vois plus aucun portefeuille** | Le coffre ne vivait que sur cet appareil ou dans ce navigateur. Si vous aviez sauvegardé votre phrase de 24 mots, restaurez-la avec elle. Si vous aviez configuré la [récupération sociale](/qorex/security-and-recovery#social-recovery), lancez une récupération avec vos gardiens. Sans l'un ou l'autre, le portefeuille ne peut pas être récupéré — consultez [Sauvegardez maintenant](/qorex/security-and-recovery#back-up-now) pour protéger immédiatement tout nouveau portefeuille. |

## Toujours bloqué ?

- Consultez la page [Sécurité et récupération](/qorex/security-and-recovery) pour les gardiens et l'association d'appareils.
- Pour des questions sur QoreChain lui-même, voir la [documentation principale](/introduction/what-is-qorechain) ou les canaux communautaires liés sur [qorechain.io](https://qorechain.io).
