---
slug: /rollups/why
title: Perché QoreChain RDK
sidebar_label: Perché QoreChain RDK
sidebar_position: 2
---

# Perché QoreChain RDK

La maggior parte dei kit di sviluppo per rollup sono variazioni sullo stesso
tema: ti aiutano a lanciare una app-chain che regola i propri stati su un layer
di base. Il QoreChain RDK fa anche questo, e aggiunge tre funzionalità
specifiche di QoreChain, costruite attorno al Layer 1 di QoreChain piuttosto
che agli strumenti:

- un layer di regolamento **post-quantistico**,
- primitive consultive di **AI/RL on-chain** (QCAI), e
- un runtime **a tripla VM** con chiamate cross-VM.

:::caution Fase iniziale: leggi la colonna Stato
Nessun rollup è ancora stato creato su nessuna delle due reti (verificato il 21
ottobre 2026). La tabella qui sotto indica cosa funziona oggi; ciò che i client
0.6.0 pubblicati hanno cambiato e i limiti che restano sono raccolti in [RDK 0.6.0: modifiche e limiti](/rollups/deploying-a-rollup#rdk-050-limits). Se ti serve solo un generico rollup optimistic/zk,
qualunque kit va bene; le funzionalità descritte qui sono ciò
che l'RDK aggiunge in più, in TypeScript, Python, Go, Rust e Java.
:::

| Funzionalità | Stato | Su cosa si basa |
| --- | --- | --- |
| **Ricevute di regolamento quantum-safe** | 🟡 Fase iniziale | Gli ancoraggi sono firmati con ML-DSA-87, lo schema post-quantistico della Main Chain; non esiste ancora nessun ancoraggio, quindi il verificatore della 0.6.0 (che verifica rispetto alla chain) non è mai stato eseguito su un ancoraggio reale |
| **QCAI Rollup Copilot** | 🟡 Non ancora disponibile sugli endpoint pubblici | Servizi consultivi di AI/RL on-chain che gli endpoint pubblici oggi non espongono |
| **Chiamate cross-VM multi-VM** | 🟡 Non ancora utilizzabile sulle reti live | Un precompile cross-VM che non è attivato (l'encoder della 0.6.0 corrisponde al layout della chain), e il caricamento di QoreChain Native è chiuso |

---

## 1. Ricevute di regolamento quantum-safe

> 🟡 **Progetto costruito sul layer di base post-quantistico di QoreChain.** Gli
> ancoraggi di regolamento sono firmati con ML-DSA-87 (Dilithium-5, FIPS-204),
> lo stesso schema usato dalla Main Chain. Fase iniziale: non esiste ancora
> nessun ancoraggio su nessuna delle due reti.

Quando il creatore del tuo rollup ancora un batch di regolamento, l'ancoraggio
è firmato con una chiave post-quantistica registrata on-chain. L'RDK può
impacchettare quell'ancoraggio come una **ricevuta portabile**, e un verificatore
rilegge l'affermazione da un nodo QoreChain per confermare che il rollup, il
batch, l'ancoraggio e la chiave del creatore corrispondano tutti a ciò che la
chain detiene.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

`verifySettlementReceipt` verifica rispetto alla chain e si rifiuta di dire
`valid` senza un `client`. Nella 0.5.0 il suo controllo sulla chain non riusciva a
completarsi sulle reti live (falliva in modo chiuso invece di segnalare come
valida una ricevuta genuina); la 0.6.0 risolve il problema, ma non esiste ancora
alcun ancoraggio, quindi non è stato eseguito su uno reale. Vedi
[Ricevute di regolamento quantum-safe](/rollups/settlement-receipts) per ciò che
una ricevuta dimostra e ciò che non dimostra e per i limiti esatti.

---

## 2. QCAI Rollup Copilot

> 🟡 **Non ancora disponibile sugli endpoint pubblici.**

Il Copilot è pensato per aggregare i servizi consultivi della rete (un agente
per la politica delle fee, raccomandazioni, indagini antifrode) in un'unica
vista in sola lettura e in linguaggio semplice per un rollup. È best-effort: se
un servizio è irraggiungibile, degrada a un avviso invece di fallire. Quei
servizi oggi non sono esposti sugli endpoint pubblici, quindi ogni sezione
ritorna come avviso.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

Dalla CLI: `qorollup advise my-rollup`. Vedi [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Chiamate cross-VM multi-VM

> 🟡 **Non ancora utilizzabile sulle reti live** — il precompile non è attivato
> e il caricamento di QoreChain Native è chiuso. Vedi [Multi-VM](/rollups/multi-vm).

L'RDK include helper che codificano una chiamata da un contratto EVM (Solidity)
a un contratto **QoreChain Native** attraverso un precompile fisso all'indirizzo
`0x…0901`. Quel precompile **non è attivo** né su mainnet né su testnet (vedi
[Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status)):
`eth_getCode` per `0x…0901` restituisce `0x` su entrambe, e una chiamata di
contratto verso di esso ha successo senza alcun effetto.

L'helper `encodeCrossVmCalldata` della 0.6.0 costruisce il calldata per
`executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`, il
layout che il nodo decodifica (la 0.5.0 e le precedenti codificavano una forma a
due argomenti con un selettore diverso, che non avrebbe mai potuto raggiungere il
precompile). Puoi codificare tu stesso la stessa chiamata, mostrata qui con viem
(`targetVM` 1 è QoreChain Native, l'unico target supportato):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = QoreChain Native
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

Oppure direttamente da Solidity sul tuo rollup:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

`ok` da solo oggi non dimostra nulla: finché il precompile non ha codice, la
chiamata restituisce successo con dati vuoti e non esegue nulla, quindi
conferma l'effetto sul contratto di destinazione.

Crea uno scheletro di partenza con `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Solo EVM↔QoreChain Native; le chiamate cross-VM verso SVM sono separate.)

---

## Tutto il resto che ti aspetteresti

Oltre a queste funzionalità, l'RDK include anche le dotazioni di base: cinque
client di linguaggio pubblicati e verificati contro golden vector condivisi, i
cinque profili preset e la matrice di compatibilità completa, la gestione dei
batch di regolamento e del ciclo di vita, lo storage nativo per la
disponibilità dei dati (vedi la sua nota di stato), un auto-challenger
**watchtower** per i rollup optimistic, e la CLI operativa `qorollup`.

## Prossimi passi

- [Deploy di un Rollup](/rollups/deploying-a-rollup) — installazione per ogni
  linguaggio e percorso CLI verso un rollup su testnet.
- [Ricevute di regolamento quantum-safe](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — gli approfondimenti.
