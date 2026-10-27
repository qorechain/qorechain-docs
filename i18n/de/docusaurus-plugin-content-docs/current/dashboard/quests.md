---
slug: /dashboard/quests
title: Quests
sidebar_label: Quests
sidebar_position: 10
---

# Quests

**Quests** sind angeleitete Aufgaben, die dich durch die Nutzung von QoreChain führen, während du sie abschließt. Eine Quest fasst einen oder mehrere Schritte zusammen, etwa eine Wallet aufzuladen, eine Überweisung durchzuführen oder ein Konto zu verknüpfen, und belohnt dich für den Abschluss. Diese Seite behandelt auch die übrigen Seiten der Seitenleisten-Gruppe **Earn** sowie die Arcade: **Leaderboard**, **Badges** und **Games**. Sie alle sind für Community-Mitglieder gedacht, die das Netzwerk praxisnah kennenlernen und Fortschritte sammeln möchten.

## Innovationen {#innovations}

- **Verifizierter Abschluss statt Selbstauskunft.** Eine Quest zählt, wenn ihre Prüfung bestanden ist. Eigenstate 2 nennt bei jeder Quest die Art der Prüfung: **linked account**, **connected wallet**, **proof link**, **team review** oder **quiz**.
- **Social-Quests zählen nur für verifizierte Konten.** Eine Quest, die X, Telegram oder Discord betrifft (und bei den Linked-Account-Prüfungen von Eigenstate 2 zusätzlich YouTube und GitHub), zählt erst, wenn du das Konto in deinem **Profil** verbunden hast und die Verbindung verifiziert ist. Bis dahin zeigt die Seite *Connect Social Accounts* mit einem Link **Go to Profile**.
- **Voraussetzungen werden durchgesetzt.** Eine gesperrte Quest nennt, was du zuerst abschließen musst („Complete "..." first“).
- **Klare Status.** Started, Pending Verification, Pending Review, Failed und Completed, sodass eine Quest, die auf eine menschliche Prüfung wartet, nicht als fehlgeschlagen angezeigt wird.
- **Zwei Seasons auf einer Seite.** Die Tabs **Eigenstate 1** und **Eigenstate 2** haben jeweils eigene Quest-Sets und Kategorien.

## So verwendest du es {#how-to-use}

### Quests durchsuchen

Öffne **Quests** (Seitenleiste **Earn**). Eine Übersicht zeigt, wie viele Quests verfügbar, in Bearbeitung und abgeschlossen sind. **Kategorie-Tabs** filtern die Liste:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily und Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain und Other.

Eine leere Kategorie lautet „No quests in this category yet.“ Jede Quest-Karte zeigt ein Symbol, einen Titel und eine kurze Beschreibung, ein **Schwierigkeits**-Abzeichen, eine geschätzte Zeit, die **Belohnung** (in QOR oder in Eigenvalue-Punkten, λ) und einen Status (abgeschlossen, in Bearbeitung, gestartet oder gesperrt).

### Eine Eigenstate-1-Quest abschließen

1. Öffne eine Quest und wähle **Start Quest** (später **Continue Quest**).
2. Arbeite die Aufgaben durch. Eine Aufgabe bietet **Go to Action** (zur passenden Dashboard-Seite) und **Complete** (um einen Schritt zu bestätigen, damit er überprüft werden kann).
3. Ein Fortschrittsbalken verfolgt, wie viele Aufgaben abgeschlossen sind.
4. Wenn alle Aufgaben erledigt sind, wähle **Check Completion**, um die Quest zu überprüfen und ihre Belohnung zu erhalten.

Tägliche und wöchentliche Quests werden nach einem Zeitplan zurückgesetzt; die Detailseite zeigt den Reset-Rhythmus und deine Serie. Ein Claim vom [Faucet](/dashboard/faucet) zählt für die Faucet-Quests.

### Eine Eigenstate-2-Quest abschließen

1. Öffne die Quest und lies ihre Prüfungsart.
2. Verwende die Schaltfläche, die die Quest anbietet. Welche erscheint, hängt von der Prüfungsart und dem aktuellen Status ab: **Verify**, **Submit**, **Resubmit**, **Retry verification** oder **Re-check status**.
3. Beobachte, wie der Status über Started, Pending Verification oder Pending Review zu Completed (oder Failed) wechselt.

### Leaderboard {#leaderboard}

`/leaderboard` reiht Personen nach Eigenvalue-Punkten (λ) mit einer Top Three, Community-Statistiken und einem Suchfeld. Es ist ein Off-Chain-Ranking.

### Badges {#badges}

`/badges` ist ein Katalog mit 12 Badge-Serien. **Check Badges** wertet deinen Fortschritt neu aus. Ein **Badge Widget** gibt dir ein iframe-, BBCode- oder Markdown-Snippet mit **Copy Code**, um ein Badge anderswo anzuzeigen. Eine Bridge-Serie erscheint in der Liste, obwohl die Bridge nicht live ist.

### Games {#games}

`/games` ist die **QoreChain Arcade** mit 12 Spielen: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze und Wave Coder. Wähle **Play Now** auf einer Karte; dein Score (Photons, γ) wird am Ende des Spiels übermittelt. Scores werden off-chain gespeichert.

## So greifst du darauf zu {#how-to-access}

- **URLs:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Anmeldung:** für alle erforderlich. `/quests` leitet bei Abmeldung zur Anmeldung weiter; Leaderboard, Badges und Games zeigen einen Bildschirm „Authentication Required“.
- **Netzwerk:** keine davon folgt dem Netzwerk-Umschalter.
- **Wallet:** keine erforderlich, aber Quests mit Transaktionen brauchen eine aufgeladene Testnet-Wallet (siehe [Wallet](/dashboard/wallet#testnet) und [Faucet](/dashboard/faucet)); Social-Quests brauchen verknüpfte Konten.
- **Kosten:** kostenlos.

## Wo es veröffentlicht ist {#where-published}

| Seite | Adresse | Konto |
| --- | --- | --- |
| Quests (Eigenstate 1 und 2) | `dashboard.qorechain.io/quests` | Anmeldung |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Anmeldung |
| Badges | `dashboard.qorechain.io/badges` | Anmeldung |
| Games | `dashboard.qorechain.io/games` | Anmeldung |

## Limits und bekannte Probleme {#limits}

- **Quest-Sets ändern sich.** Der Tab einer Season kann leer sein oder weniger Quests zeigen, wenn seine Quests nicht aktiv sind; prüfe den Tab, statt dich für die aktuelle Liste auf diese Seite zu verlassen.
- **Alles hier ist off-chain:** Punkte, Ränge, Badges und Spiel-Scores werden vom Dashboard erfasst, nicht auf QoreChain. Das Wort „on-chain“ im Untertitel der Arcade beschreibt die Scores nicht.
- **Belohnungsbeträge** werden bei jeder Quest angezeigt und können sich ändern.
- **Anmeldung** und, für Social-Quests, verifizierte verknüpfte Konten sind erforderlich.
- **Public Sale** (`/public-sale`) ist eine separate Seite für bestehende Teilnehmer (Zuteilung, Vesting-Zeitplan, Claim); alle früheren Runden sind geschlossen, und sie wird hier nicht weiter beschrieben.
- **FAQ** (`/faq`) ist eine In-App-Hilfeseite, deren Inhalt hinter diesem Handbuch zurückliegt.

## Verwandt

- [Overview & Getting Started](/dashboard/overview) - melde dich an und verbinde deine Wallet, bevor du Quests startest.
- [Faucet](/dashboard/faucet) - lade eine Testnet-Wallet für Quests auf, die Transaktionen beinhalten.
