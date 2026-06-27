---
slug: /architecture/chain-licensing
title: Chain-Lizenzierung
sidebar_label: Chain-Lizenzierung
sidebar_position: 9
---

# Chain-Lizenzierung

Das `x/license`-Modul bietet On-Chain-**Funktionslizenzierung**. Bestimmte abgeschirmte Funktionen auf QoreChain — insbesondere chainspezifische Bridge- und Validator-Funktionen — erfordern, dass das handelnde Konto eine gültige Lizenz für diese Funktion besitzt. Eine Lizenz ist schlicht ein On-Chain-Datensatz, der einen bestimmten Inhaber (den **Grantee**) zur Nutzung einer bestimmten abgeschirmten **Funktion** autorisiert.

Die Lizenzierung hält diese Funktionen verifizierbar und selbstbeschreibend: Jeder Integrator, Explorer oder Wallet kann die Chain fragen, ob ein bestimmtes Konto für eine bestimmte Funktion autorisiert ist, ohne dass eine Off-Chain-Abfrage erforderlich ist.

## Was eine Lizenz repräsentiert

Jede Lizenz ist ein Datensatz, der durch ein `(grantee, feature_id)`-Paar verschlüsselt wird:

- **`grantee`** — das `qor`-Konto, das die Lizenz autorisiert.
- **`feature_id`** — die abgeschirmte Funktion, die sie freischaltet. Feature-IDs sind stabile String-Bezeichner; Bridge- und Validator-Funktionen werden je Ziel-Chain benannt (zum Beispiel `bridge_ethereum`, `validator_solana`), neben übergreifenden Funktionen wie den Bridge-Protokoll- und den Node-/Validator-Betreiberfunktionen.
- **`granted_at`** / **`expires_at`** — die Blockhöhe, bei der die Lizenz erteilt wurde, und die Blockhöhe, bei der sie abläuft (ein Wert von `0` bedeutet, dass sie nicht abläuft).
- **`granted_by`** — die Autorität, die die Lizenz ausgestellt hat.

Eine Funktion, die hinter einer Funktion abgeschirmt ist, prüft zur Ausführungszeit schlicht, ob das handelnde Konto eine **aktive** Lizenz für diese Funktion besitzt.

## Lizenzlebenszyklus

Eine Lizenz durchläuft eine kleine Reihe von Zuständen:

| Zustand | Bedeutung |
| --- | --- |
| **Erteilt / Aktiv** | Die Lizenz existiert und autorisiert den Grantee. Sie gilt als aktiv, solange sie nicht suspendiert und nicht abgelaufen ist. |
| **Suspendiert** | Vorübergehend deaktiviert. Der Datensatz existiert weiterhin, aber die abgeschirmte Funktion wird verweigert, bis die Lizenz fortgesetzt wird. |
| **Widerrufen** | Dauerhaft entfernt. Der Grantee besitzt die Lizenz überhaupt nicht mehr. |

Eine Lizenz ist außerdem nicht mehr aktiv, sobald ihre `expires_at`-Höhe überschritten wird, selbst wenn sie nie suspendiert oder widerrufen wurde.

## Wer Lizenzen ändern kann

Das Erteilen, Widerrufen, Suspendieren und Fortsetzen von Lizenzen sind **Autoritätsoperationen** — sie werden von der Governance-Autorität der Chain durchgeführt, nicht von beliebigen Nutzern. Diese Transaktionen existieren als Teil der Befehlsoberfläche des Moduls, aber ein normaler Nutzer ruft sie nicht direkt auf; der Lebenszyklus wird On-Chain von der Autorität verwaltet.

Um eine Lizenz zu **erhalten**, durchlaufen Integratoren das **Dashboard (Tools → Buy License)**, das den Anfrageablauf abwickelt; die Autorität erfasst die Erteilung dann On-Chain.

Die autoritätsgesicherten Transaktionen sind:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Eine Lizenz prüfen und verifizieren

Die Abfragebefehle stehen jedem offen. Sie sind der Teil des Moduls, den Integratoren täglich nutzen — um zu bestätigen, dass ein Konto autorisiert ist, bevor man sich auf eine abgeschirmte Funktion verlässt, oder um den Lizenzstatus in einem Wallet oder Explorer anzuzeigen.

### Eine einzelne Lizenz prüfen

`check` meldet, ob ein bestimmter Grantee eine bestimmte Funktion besitzt und ob diese Lizenz derzeit **aktiv** ist. Dies ist der kanonische „Darf dieses Konto X tun"-Aufruf.

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

Die Antwort enthält die Lizenzdetails und ein boolesches `active`-Feld, das Suspendierung und Ablauf bereits berücksichtigt — ein `true` bedeutet also, dass der Grantee die abgeschirmte Funktion gerade jetzt nutzen darf.

### Die Lizenzen eines Grantees auflisten

`list` gibt jede Lizenz zurück, die ein Konto besitzt, über alle Funktionen hinweg.

```bash
qorechaind query license list qor1grantee...
```

### Inhaber einer Funktion auflisten

`holders` gibt jedes Konto zurück, das eine Lizenz für eine bestimmte Funktion besitzt — nützlich, um etwa aufzuzählen, wer für eine bestimmte Bridge- oder Validator-Funktion autorisiert ist.

```bash
qorechaind query license holders bridge_ethereum
```

## Befehlsübersicht

**Transaktionen** (`qorechaind tx license …`) — autoritäts-/governance-gesichert:

| Befehl | Zweck |
| --- | --- |
| `grant` | Einen Grantee für eine Funktion autorisieren |
| `revoke` | Eine Lizenz dauerhaft entfernen |
| `suspend` | Eine Lizenz vorübergehend deaktivieren |
| `resume` | Eine suspendierte Lizenz wieder aktivieren |

**Abfragen** (`qorechaind query license …`) — für jeden offen:

| Befehl | Zweck |
| --- | --- |
| `check` | Eine `(grantee, feature)`-Lizenz und ihren aktiven Zustand prüfen |
| `list` | Alle von einem Grantee gehaltenen Lizenzen auflisten |
| `holders` | Alle Grantees auflisten, die eine bestimmte Funktion besitzen |

## Verwandte Themen

- Lizenzen für Bridge- und Validator-Funktionen stützen die in der [Bridge-Architektur](/architecture/bridge-architecture) beschriebenen Funktionen.
- Lizenzen werden über das **Dashboard (Tools → Buy License)** bezogen.
- Light Nodes beziehen eine Lizenz während der [Registrierung und Lizenzierung](/light-node/registration-and-licensing).
- Kaufen und verwalten Sie Lizenzen im [Tools Hub](/dashboard/tools-hub).
