---
slug: /rollups/qcai-copilot
title: Copilote de rollup QCAI
sidebar_label: Copilote QCAI
sidebar_position: 7
---

# Copilote de rollup QCAI

Le copilote de rollup QCAI du RDK est un assistant en lecture seule qui **tente** de rassembler les données consultatives du réseau pour un rollup — une estimation des frais, des recommandations réseau, les enquêtes anti-fraude faisant référence au rollup, le statut de l'agent d'apprentissage par renforcement — et de les condenser en une lecture unique en langage clair, accompagnée d'une courte liste de suggestions.

:::caution Non disponible sur les points de terminaison publics
Les services consultatifs qu'il lit (routes REST `/qorechain/ai/v1/…` et espace de noms JSON-RPC `qor_*`) ne sont **pas servis** actuellement par les points de terminaison publics `qore.host` sur le mainnet ni sur le testnet ; chaque section revient donc sous forme d'avertissement. Le copilote fonctionne par conception en meilleur effort : il n'échoue jamais, mais un résultat vide ne signifie **pas** que le rollup a été vérifié et jugé sain. Ne l'utilisez pas comme signal de sécurité tant que ces services ne sont pas exposés. Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace).
:::

## Un seul appel : `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

Le résultat contient aussi `feeEstimate`, `networkRecommendations`, `fraudInvestigations` et `rlAgentStatus` lorsque le service correspondant répond.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

Les services injoignables sont listés comme des avertissements plutôt que comme des erreurs, et la sortie lisible peut tout de même afficher une ligne « no issues flagged » lorsque rien n'était joignable — lisez les avertissements. Consultez [Déployer un rollup](/rollups/deploying-a-rollup) pour la CLI opérateur `qorollup`.
