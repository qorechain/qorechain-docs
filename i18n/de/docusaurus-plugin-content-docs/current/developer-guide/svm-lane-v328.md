---
slug: /developer-guide/svm-lane-v328
title: "SVM-Lane: Programme, Accounts und Verwahrungslimits (v3.2.8)"
sidebar_label: SVM-Lane (v3.2.8)
sidebar_position: 10
---

# SVM-Lane: Programme, Accounts und Verwahrungslimits (v3.2.8)

Die SVM-Lane ist der Solana-kompatible Teil von QoreChain: Sie deployen kompilierte Programme, legen Datenaccounts an und rufen Programme mit Solana-typischen Werkzeugen auf, und dasselbe native QOR-Guthaben ist in Lamports sichtbar. Release **v3.2.8** hat die Lane beim Upgrade geschlossen, bis eine Governance-Abstimmung sie wieder öffnete. Im Testnet ist diese Abstimmung (Vorschlag 37) angenommen und die Lane ist **offen**; ihre Verwahrung wird durch drei per Governance festgelegte Limits begrenzt.

Diese Seite erklärt, wie man den Zustand der Lane liest, wie Programme, Accounts und Rent funktionieren, wie ein SVM-Wallet einen Post-Quanten-Schlüssel registriert, was die Verwahrungslimits bedeuten und welche Beispiele heute laufen können.

:::note Zuerst das Testnet, und die Lane ist dort seit Vorschlag 37 offen
v3.2.8 läuft seit dem 12. November 2026 im Testnet **`qorechain-diana`**. Das Mainnet (`qorechain-vladi`) läuft mit v3.2.7 (seit dem 12. November 2026), hat v3.2.8 nicht angewendet, und **die Lane bleibt im Mainnet aus**. Das Upgrade hat die Lane im Testnet geschlossen (SVM-Schreibzugriffe schlugen fehl, `MsgRegisterSVMPQCKey` wurde abgelehnt). **Der Governance-Vorschlag 37 wurde angenommen und hat sie auf `qorechain-diana` geöffnet**: Er setzte `enabled: true`, ließ die übrigen Parameter unverändert und hob die Circuit-Breaker-Pause für `MsgExecuteProgram` und für Cross-VM-Aufrufe auf. Bei der Prüfung am 12. November 2026 nach der Abstimmung zeigte `GET /qorechain/svm/v1/params` `enabled: true`, und die Circuit-Breaker-Liste enthielt nur `/cosmwasm.wasm.v1.MsgStoreCode`. Das öffentliche SVM-JSON-RPC bleibt schreibgeschützt. Lesen Sie immer zuerst den aktuellen Zustand (nächster Abschnitt) und nehmen Sie ihn nicht als gegeben an.
:::

## Warum das wichtig ist {#why}

* Ein Client, der SVM-Aktionen anbietet, während die Lane geschlossen ist, beschert seinen Nutzern abgelehnte Transaktionen. Vorher einen Parameter zu lesen, vermeidet das.
* Die Lane hält echtes QOR: Jedes Lamport in einem Programm, einer programmabgeleiteten Adresse oder einem Datenaccount ist durch uqor gedeckt, das das SVM-Modul hält. Die drei Verwahrungslimits halten diesen Pool begrenzt, daher kann eine Überweisung oder eine Einzahlung abgelehnt werden, auch wenn der Absender die Mittel hat.
* Rent und Größenlimits bestimmen, was es kostet, Zustand on-chain zu halten, und gehören daher in ein Deployment-Budget.

## Den Zustand der Lane lesen {#lane-state}

Der Zustand der Lane ist das Feld `enabled` der SVM-Parameter. Lesen Sie es über die REST-Route oder die Knoten-CLI. Dieselbe Antwort enthält jedes andere Limit auf dieser Seite, ein Aufruf reicht also, um ein Deployment zu dimensionieren.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Antwort auf `qorechain-diana`, 12. November 2026, nach Annahme von Vorschlag 37 (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Auf einem Linux-Knoten (es gibt keine paketierte macOS-Binärdatei) lautet dasselbe Lesen:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

In TypeScript, mit Node 18 oder neuer (für dieses Lesen ist kein SDK-Aufruf nötig):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

Ein typisierter Helfer für diese Parameter (und ein sicherer Builder für einen Parametervorschlag) ist Teil des SDK-Entwurfs für v3.2.8, der noch nicht veröffentlicht ist. Ein späteres SDK-Release ergänzt dies; verwenden Sie bis dahin die Kommandozeile oder die REST-Route.

### Cluster-Identität {#cluster-info}

`cluster_info` identifiziert den Cluster für Wallets und gibt an, ob die Ausführung aktiv ist. Sie ändert sich mit dem Zustand der Lane nur in `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

Antwort am 12. November 2026, gelesen nach Annahme von Vorschlag 37, mit `execution_enabled` `true` (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

Die Knoten-CLI hat dieselbe Abfrage: `qorechaind query svm cluster-info`. Die JSON-RPC-Methode `getGenesisHash` auf `https://svm-testnet.qore.host` liefert denselben Hash. Der Hash wird aus der Chain-ID abgeleitet; er ist nicht der Genesis-Hash eines echten Solana-Clusters. Die Route wird auch im Mainnet bedient (v3.2.7): Am 12. November 2026 antwortete `https://api.qore.host/qorechain/svm/v1/cluster_info` mit `200` und `execution_enabled` `false`.

## Das öffentliche SVM-RPC ist schreibgeschützt {#public-rpc}

Die öffentlichen Endpunkte `https://svm.qore.host` und `https://svm-testnet.qore.host` beantworten Lesezugriffe und lehnen Schreibmethoden (`sendTransaction` und ähnliche) auf den öffentlichen Chain-IDs ab, unabhängig davon, ob die Lane offen ist. Um SVM-Transaktionen einzureichen, betreiben Sie einen eigenen Knoten, der das Solana-kompatible JSON-RPC standardmäßig auf Port 8899 bereitstellt (siehe [SVM-Entwicklung](/developer-guide/svm-development#json-rpc-server)), und die Lane selbst muss in dem Netzwerk offen sein, dem dieser Knoten folgt. Lesezugriffe funktionieren jetzt:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` meldete `solana-core` `1.18.0-qorechain` zusammen mit der Chain-ID, der Cluster-ID und dem Genesis-Hash. Die Rent-Angabe für 1,024 Bytes lautete am 12. November 2026 `8017920` Lamports. Die REST-Routen `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` und `.../slot` antworteten am öffentlichen Endpunkt mit **HTTP 501** (nicht implementiert); lesen Sie Accounts und Programme über die JSON-RPC-Methoden `getAccountInfo` und `getMultipleAccounts` oder über die Knoten-CLI.

## Programme deployen und aufrufen {#programs}

Sobald die Lane offen ist, sieht der Ablauf so aus: ein SBF-Programm mit der aktuellen Solana-Toolchain bauen, deployen, die benötigten Accounts anlegen, dann aufrufen. Jeder `tx svm`-Befehl ist eine Transaktion der Cosmos-Lane und braucht daher ein ausdrückliches Gaslimit, eine Gebühr von mindestens Gas mal 0.1 uqor und die hybride Post-Quanten-Cosignatur (siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)).

Dies sind die Linux-Knoten-CLI-Befehle aus der Knotenreferenz. **UNTESTED: Die Lane wurde im Testnet erst nach Vorschlag 37 geöffnet, und für diese Seite wurde weder ein Programm-Deploy noch ein Execute noch eine Account-Anlage ausgeführt.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Lesezugriffe auf einem Knoten, verfügbar unabhängig vom Zustand der Lane:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript mit @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` ist eine dünne Schicht über `@solana/web3.js`. Es hat keinen Loader-Wrapper: Nutzen Sie zum Deployen die Knoten-CLI oben und das Paket, um Instruktionen für ein bereits vorhandenes Programm zu bauen und zu senden. Seine öffentlichen Presets setzen absichtlich keinen SVM-Endpunkt, geben Sie ihm also die URL Ihres eigenen Knotens.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** Dieses Beispiel braucht einen Knoten, den Sie selbst betreiben (die Lane ist im Testnet offen). Am öffentlichen Endpunkt wird das Senden abgelehnt. Die schreibgeschützten Aufrufe (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`) funktionieren gegen `https://svm-testnet.qore.host`, da `createSvmClient({ rpcUrl })` jede URL akzeptiert.

Python, Go, Rust und Java: Die SVM-Adapter für diese Sprachen bauen dieselben Nachrichten; ein späteres SDK-Release ergänzt die v3.2.8-Helfer. Verwenden Sie bis dahin die Knoten-CLI oder die rohe Nachricht. Jede Solana-Client-Bibliothek kann außerdem mit Port 8899 Ihres eigenen Knotens sprechen, da der Methodensatz Solana-kompatibel ist.

## Accounts und Rent {#rent}

SVM-Datenaccounts bezahlen für den Speicherplatz, den sie nutzen. Die Zahlen stammen aus den oben gelesenen Live-Parametern.

| Posten | Regel | Live-Wert (Testnet) |
| ---- | ---- | -------------------- |
| Rent pro Jahr | Datengröße in Bytes mal `lamports_per_byte` | 3,480 Lamports pro Byte |
| Rent-freies Minimum | Rent pro Jahr mal `rent_exemption_multi` | Multiplikator 2.0 |
| Mit mindestens dem Minimum ausgestattet | wird nie mit Rent belastet | |
| Mit weniger als dem Minimum ausgestattet | Rent wird in jeder Epoche abgezogen | |
| Guthaben erreicht null | der Account wird entfernt | |

Lamports und uqor stehen im Verhältnis 1 uqor = 1,000 Lamports. Fragen Sie den Knoten nach dem exakten Minimum, statt es zu berechnen: `getMinimumBalanceForRentExemption` lieferte 8,017,920 Lamports für 1,024 Bytes (die Angabe enthält den Account-Header). `create-account` braucht mindestens so viele Lamports, sonst ist der Account nicht von der Rent befreit.

Adressen: Die SVM-Adresse eines Accounts sind seine 20 Account-Bytes, auf 32 Bytes aufgefüllt und in base58 geschrieben. Die Formen `qor1...`, `0x...` und base58 bezeichnen denselben Account.

## Post-Quanten-Schlüssel für SVM-Wallets {#pqc-key}

Ein SVM-Wallet, das einen Post-Quanten-Schlüssel on-chain haben möchte, registriert ihn mit **`MsgRegisterSVMPQCKey`**. Die Nachricht enthält den Absender, die 32-Byte-SVM-Adresse und den öffentlichen ML-DSA-87-Schlüssel. Sie ist eine Nachricht der Cosmos-Lane, der Absender signiert sie also hybrid wie jede andere native Transaktion. Sie wird abgelehnt, solange die Lane geschlossen ist, und **der SVM-Account muss bereits existieren, bevor sein Schlüssel registriert wird** (siehe die Ablehnung unter [Im Testnet getestet](#tested)).

Dafür gibt es keinen `tx svm`-Befehl; verwenden Sie den SDK-Composer. In TypeScript ist der Composer `msg.svm.registerSvmPqcKey` in `@qorechain/sdk`. **UNTESTED für einen bestehenden Account: Das einzige Senden galt einer Adresse ohne Account und wurde abgelehnt.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Der Python-Composer ist `msg.svm.register_svm_pqc_key(sender=, ...)`, und der Go-Composer ist `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## Verwahrungslimits {#custody}

Jedes Lamport, das ein Programm, eine programmabgeleitete Adresse oder ein Datenaccount hält, ist durch uqor gedeckt, das das SVM-Modul in einem Pool hält, der Verwahrung genannt wird. Drei per Governance festgelegte Parameter begrenzen ihn. Alle drei sind in uqor angegeben; 1 QOR sind 1,000,000 uqor. Die Governance ändert sie mit einem Parametervorschlag, und ein Vorschlag muss alle zwölf Felder senden, weil er den Satz als Ganzes ersetzt.

| Parameter | Live-Wert | In einfachen Worten |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10,000,000,000 (10,000 QOR) | Die Obergrenze für das Guthaben des SVM-Pools. Eine Überweisung, die den Pool darüber heben würde, wird mit `svm custody cap exceeded` (Code 23) abgelehnt. `0` bedeutet keine Obergrenze. |
| `max_custody_hard_uqor` | 1,000,000,000,000 (1,000,000 QOR) | Die absolute Obergrenze für das Rohguthaben des Pools, einschließlich Rent-Reserven, Vorfinanzierung und einfacher Spenden. Eine Operation, die das Guthaben darüber hinaus brächte, wird abgelehnt. Sie darf nicht unter `max_custody_uqor` liegen und muss größer als null sein, damit die Lane geöffnet werden kann. |
| `max_account_excess_uqor` | 10,000,000,000 (10,000 QOR) | Das Meiste, was ein einzelner Datenaccount über seinem rent-freien Minimum halten darf. `0` bedeutet keine Obergrenze pro Account. |

Was das für eine Anwendung bedeutet: Halten Sie den Wert, den Sie in SVM-Accounts parken, bescheiden und nur um das Nötige über dem Rent-Minimum. Eine Einzahlung, die für Ihr Guthaben in Ordnung ist, kann trotzdem abgelehnt werden, wenn der Pool insgesamt nahe an seiner Obergrenze liegt. Behandeln Sie Code 23 daher als "später oder mit weniger versuchen", nicht als ungültige Transaktion. Die Limits können nur durch eine Governance-Abstimmung steigen, nie durch eine Nutzertransaktion.

## Compute-Budget und Größenlimits {#limits}

| Limit | Parameter | Live-Wert (Testnet) |
| ----- | --------- | -------------------- |
| Compute-Einheiten pro Instruktion | `compute_budget_max` | 1,400,000 |
| Programmgröße (ELF) | `max_program_size` | 10,485,760 Bytes (10 MiB) |
| Größe eines Datenaccounts | `max_account_data_size` | 10,485,760 Bytes (10 MiB) |
| Verschachtelte Programmaufrufe | `max_cpi` | 4 |
| Standard-Signaturschema | `default_sig_scheme` | 0 (Ed25519) |
| Slot-Versatz | `svm_slot_offset` | 0 (der Slot ist die Blockhöhe plus der Versatz) |

Jeder Frame hat einen 32-KiB-Stack und einen 256-KiB-Heap. Die obigen Werte können sich per Governance ändern, lesen Sie sie daher live. In `@qorechain/svm` 0.13.0 fordert `withComputeBudget(tx, { units })` ein Limit an Compute-Einheiten an; halten Sie es bei oder unter `compute_budget_max`.

## Aktuelle Grenzen des SVM-Endpunkts im Testnet {#endpoint-limits}

Die Lane ist offen, aber das öffentliche SVM-JSON-RPC verhält sich noch nicht wie ein vollständiger Solana-Knoten. Planen Sie um diese Grenzen herum:

- **`getLatestBlockhash` liefert den Blockhash als 64 hexadezimale Zeichen,** nicht als base58 wie Solana-Knoten (gelesen am 12. November 2026: `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). Ein Client, der base58 erwartet, muss ihn umwandeln. Das Chain-Team hat eine Änderung eingeplant.
- **`sendTransaction` im Solana-Wire-Format aus Standard-Solana-Werkzeugen wird am öffentlichen Endpunkt noch nicht unterstützt.** Programme werden mit den Cosmos-Nachrichten `MsgDeployProgram` und `MsgExecuteProgram` deployt und aufgerufen, signiert mit der hybriden Signatur wie jede Transaktion der Cosmos-Lane (siehe die TypeScript-Helfer oben). Volle Parität mit den Solana-Werkzeugen ist für ein späteres Release geplant.
- **Ein fremder Schlüssel kann eine SVM-Aktion über einen Relayer autorisieren.** Die Autorisierung signiert einen an die Chain gebundenen Digest (Domain `qorechain-svm-auth-v3`), sobald das Netzwerk das Protokoll-Feature `svm-relayed-chain-bound` aktiviert; `@qorechain/wallet-adapter` 0.6.0 baut ihn mit `authSignBytesV3`, und `resolveSvmAuthVersion` liest, welche Form das Netzwerk will.

## Fehler und Ablehnungen {#errors}

| Was Sie sehen | Bedeutung | Was zu tun ist |
| ------------ | ------- | ---------- |
| `SVM module is disabled` (Code 11) | Die Lane ist geschlossen (Mainnet, oder Testnet vor Vorschlag 37) | `enabled` lesen; nicht erneut versuchen |
| `MsgRegisterSVMPQCKey` abgelehnt mit `SVM account ... not found` (Codespace `svm`, Code 3) | Der SVM-Account existiert noch nicht | Zuerst den Account anlegen, dann seinen Schlüssel registrieren |
| `MsgRegisterSVMPQCKey` abgelehnt, während die Lane geschlossen ist | Lane geschlossen | Nach dem Öffnen der Lane registrieren |
| Schreibmethode auf `svm.qore.host` oder `svm-testnet.qore.host` abgelehnt | Öffentliche Endpunkte sind schreibgeschützt | Einen eigenen Knoten verwenden |
| `svm custody cap exceeded` (Code 23) | Der Pool ist an seiner Obergrenze | Später oder mit einem kleineren Betrag erneut versuchen |
| `airdrop rate limit exceeded` (Code 19) | `requestAirdrop` zu oft aufgerufen (nur Testnet) | Warten |
| `blockhash expired` (Code 20) | Der aktuelle Blockhash ist zu alt | Einen frischen holen und erneut signieren |
| `svm simulation slots busy, retry later` (Code 24) | Simulationen sind begrenzt; in einem Block tritt das nie auf | Die Simulation erneut versuchen |
| HTTP 501 auf `/qorechain/svm/v1/account/...` | Route am öffentlichen Endpunkt nicht implementiert | `getAccountInfo` verwenden |

## Im Testnet getestet {#tested}

Ausgeführt auf `qorechain-diana` am 12. November 2026 (Release v3.2.8), nachdem Vorschlag 37 angenommen wurde.

| Schritt | Ergebnis |
| ---- | ------ |
| `GET /cosmos/circuit/v1/disable_list` | Nur `/cosmwasm.wasm.v1.MsgStoreCode` |
| `GET /qorechain/svm/v1/params` | `enabled` true; `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| `MsgRegisterSVMPQCKey` für eine SVM-Adresse, die noch nicht existiert | Abgelehnt: Codespace `svm` Code 3, `SVM account ... not found: SVM account not found`. Der Account muss existieren, bevor sein Post-Quanten-Schlüssel registriert wird |

Nicht ausgeführt (UNTESTED): Programm-Deploy, Programm-Execute und Anlage eines SVM-Accounts.

## Mainnet {#mainnet}

Das Mainnet bleibt vorerst auf v3.2.7, mit ausgeschalteter SVM-Lane, und sie im Mainnet zu aktivieren erfordert ein späteres Release und eine Governance-Abstimmung. Planen Sie nur gegen das Testnet.

## Siehe auch {#see-also}

* [SVM-Entwicklung](/developer-guide/svm-development): der Überblick über die Lane, der JSON-RPC-Server und natives QOR als Lamports.
* [Solana-kompatibles JSON-RPC](/api-reference/json-rpc-solana-compatible): die Methodenliste.
* [Post-Quanten-Signierung](/developer-guide/post-quantum-signing): die hybride Signatur, die jede Transaktion der nativen Lane braucht.
* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability): Aufrufe zwischen SVM, EVM und QoreChain Native.
* [Knotenbetreiber: Checkliste für v3.2.8](/developer-guide/node-operators-v328): ein Knoten-Upgrade durchführen.
