---
slug: /sdk/install
title: Installazione
sidebar_label: Installazione
sidebar_position: 2
---

# Installazione

Installa l'SDK per il tuo linguaggio. Il core TypeScript (`@qorechain/sdk`), gli
adattatori EVM e SVM (`@qorechain/evm`, `@qorechain/svm`), il kit React
(`@qorechain/react`) e i client Python, Go, Rust e Java sono tutti
**pubblicati** sui rispettivi registry con piena parità con la catena nativa
(messaggi tipizzati, query, il ciclo di vita delle tx, transazioni PQC ibride e
sottoscrizioni WebSocket). La linea di release corrente è la **0.10**, pubblicata
il 25 e 26 ottobre 2026 (verificata su ciascun registry il 27 ottobre 2026):

| Registry | Pacchetto | Versione |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.10.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.10.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.10.0 |
| Proxy dei moduli Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 (il client Java è di nuovo allineato agli altri linguaggi; la 0.9.1 era un aggiornamento solo Java) |

Scegli il tuo linguaggio qui sotto.

## Note di aggiornamento {#upgrade}

:::danger Usa l'SDK 0.8.1 o successivo sulle reti live
Entrambe le reti pubbliche verificano la forma **sign-bytes ibrida v2** (con tag di dominio e
vincolata al chain id) e rifiutano la vecchia forma con il codice `pqc` 21. Ogni release dell'SDK
precedente alla **0.8.0** firma la vecchia forma, e la **0.8.0** cerca il passaggio
sotto uno solo dei due nomi di aggiornamento usati dalle reti (la mainnet lo ha registrato come
`v3.2.0`, la testnet come `v3.1.98` e poi `v3.2.0`), quindi firma la forma sbagliata
su mainnet. Usa la **0.10.0** (o almeno la **0.8.1**) in ogni linguaggio; serve la **0.8.2 o
successiva** per aprire una [finestra di autorizzazione EVM](/sdk/guides/evm#evm-window).
I builder ibridi accettano un'opzione `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
interroga la rete e quindi richiede l'endpoint REST (`rest`) su
`qorechain-vladi` / `qorechain-diana`: solleva un errore invece di tirare a indovinare. Vedi
[Quale forma di sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
La forma non è cambiata nella chain v3.2.3 né nella v3.2.4 (la v3.2.4 gira sulla testnet dal 19 ottobre 2026 e sulla mainnet dal 23 ottobre 2026): `"auto"`
si risolve in v2 su entrambe le reti, perché entrambe hanno applicato l'aggiornamento che è passato a essa.
:::

## Cosa aggiunge la 0.10.0 {#whats-new-0100}

L'SDK 0.10.0 è la release client per la chain **v3.2.4**, che la mainnet ha applicato
all'altezza 3.742.566 il 23 ottobre 2026 (la testnet l'ha applicata all'altezza 8.337.253
il 19 ottobre). Il formato di firma, gli indirizzi, i decimali, i memo e le commissioni non sono
cambiati, e una transazione costruita con la 0.9.0 resta valida. La release è stata verificata in
ogni linguaggio con transazioni reali sulla testnet. Non ha builder per
nulla di introdotto dopo la v3.2.4. La testnet è passata alla v3.2.6 (la v3.2.5 e la
v3.2.6 vi sono state applicate il 26 e 27 ottobre 2026); la proposta di governance 14 della mainnet
applicherebbe la v3.2.5 all'altezza 3.906.833 al momento della stesura, e ciò che quella
release aggiunge sarà documentato quando la mainnet la applica. Le novità della 0.10.0:

| Area | Nella 0.10.0 |
| --- | --- |
| Tier di staking (`x/stakingtier`) | Composer `lockDelegation` (i controlli propri della chain: una durata di 3, 6 o 12 mesi e un importo intero positivo), `unlockEarly`, `claimBonus` e `updateParams`; letture per i parametri del modulo, i lock di un detentore e il pool dei bonus (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); i codici di errore del modulo. Ciò che fa il modulo è descritto in [Staking e Delega](/user-guide/staking-and-delegation) |
| Nonce dell'authenticator | `fetchAuthNonce({ rest, address, pubkey })` legge la sequenza che una chiave collegata deve firmare successivamente per `MsgExecuteEVM` / `MsgExecuteCosmos` da `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, invece di tracciarla a mano. Entrambe le reti servono la route; il modulo `abstractaccount` stesso è disattivato sulla mainnet (attivo sulla testnet), quindi una spesa sulla mainnet viene rifiutata prima che venga controllato qualsiasi nonce |
| Interruttori delle funzionalità di protocollo | `fetchProtocolFeatures` e `isProtocolFeatureEnabled` leggono quali regole di consenso una rete applica, per nome, da `/qorechain/pqc/v1/protocol_features` (entrambe le reti la servono). Una rete precedente alla v3.2.4 non serve la route; lì usa `isUpgradeApplied` |
| `possessionProven` | Lo stato PQC indica se la chiave dell'account è stata registrata con una prova di possesso |
| `ibcTimeoutTimestamp(seconds)` | Un timeout IBC assoluto nell'unità che `MsgTransfer` accetta (nanosecondi Unix). I timeout IBC sono orari assoluti; i pacchetti IBC v2 accettano secondi Unix assoluti, e un valore relativo lì viene rifiutato dopo l'addebito della commissione. Nessun canale IBC è aperto sulla mainnet (verificato il 27 ottobre 2026) |
| Costante di upgrade e proto | `CHAIN_UPGRADE_V3_2_4`; definizioni protobuf sincronizzate con la chain v3.2.4 (nuovi campi nella registrazione dei validatori del bridge, nelle query dei light node e dei rollup) |
| `ensurePqcRegistered` | Confrontava uno stato privo di chiave pubblica come una corrispondenza; ora legge la chiave tramite `rest` e la confronta. Se non c'è nulla da cui leggerla, il risultato riporta `keyVerified: false` invece di affermare che la chiave è quella del chiamante |
| Rifiuti durante la simulazione della commissione | Un rifiuto della chain che arriva solo come testo (ad esempio "no bonus to claim") ora viene nominato a partire dalle descrizioni di errore registrate dalla chain in ogni linguaggio: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` e `create-qorechain-dapp` sono passati alla 0.10.0 insieme a essa (il kit
dipende da `@qorechain/sdk` `^0.10.0`, e così fanno anche i template dello scaffolder).

## Cosa ha aggiunto la 0.9.0 {#whats-new-090}

L'SDK 0.9.0 era la release client per la chain **v3.2.2** e **v3.2.3** (la mainnet le
ha applicate alle altezze 3.556.788 e 3.662.051; la mainnet esegue la v3.2.4 dal 23 ottobre 2026 all'altezza 3.742.566, e la testnet esegue la v3.2.4 o successive dal 19 ottobre 2026). Il
formato di firma, gli indirizzi, i decimali, i memo e le commissioni non sono
cambiati, quindi la forma sign-bytes ibrida v2 che firmano la 0.8.1 e le successive
è ancora quella giusta. Le novità:

| Area | Nella 0.9.0 (e successive) |
| --- | --- |
| `TxClient` ibrido (TypeScript) | Passa la coppia di chiavi dell'account: `client.connectTx(signer, { pqcKeypair })` oppure `TxClient.connect({ …, pqcKeypair, rest })`. Ogni transazione viene allora firmata in modo ibrido e `fee: "auto"` simula la transazione ibrida stessa; una semplice registrazione di chiave resta classica (il percorso di bootstrap della chain). `bankSend` e i client rollup, multilayer e cross-VM dell'SDK lo usano. Senza una coppia di chiavi non cambia nulla |
| Chiave PQC recuperabile | `derivePqcCanonical(address, mnemonic)` e i suoi equivalenti in ogni linguaggio (vedi [Firma ibrida](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Legge prima lo stato della chiave via REST (`rest`), rifiuta di registrare quando non riesce a stabilirlo, lancia `PqcKeyMismatchError` quando l'account detiene già una chiave diversa e tratta come successo il rifiuto «già registrata» della chain. Dalla chain v3.2.3 firma e allega da sé la **prova di possesso**; prima della v3.2.3 lascia il campo vuoto |
| Finestre EVM con ambito limitato | `openEvmWindowMsg` accetta `nativeOnly` e `allowedTargets` (al massimo 16, senza duplicati); `fetchEvmWindow` rilegge entrambi (vedi la [guida EVM](/sdk/guides/evm#evm-window)) |
| Consenso EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Integrità delle chiavi | I builder di registrazione rifiutano `classical_only`, una chiave vuota e una chiave ML-DSA-87 degenere, che la chain rifiuta dalla v3.2.3. `signProofOfPossession` / `verifyProofOfPossession` sono esportate; `migratePqcKeyHybrid` invia il `MsgMigratePQCKey` firmato in modo ibrido che gli account con chiave richiedono dalla v3.2.3 |
| Digest v2 dell'abstract account | `evmAuthSignBytesV2` (vincola il gas limit della chiamata) e `resolveEvmAuthDigestVersion`. Il modulo `abstractaccount` è disattivato sulla mainnet (attivo sulla testnet), quindi sulla mainnet questo è solo di riferimento |
| Rilevamento degli upgrade | `isUpgradeApplied`, `requireUpgradeApplied`: i nuovi campi opzionali vengono impostati solo dopo che `applied_plan` riporta la release, perché un nodo che non ha applicato una release rifiuta l'intera transazione quando viene impostato uno dei nuovi campi di quella release |
| Decodifica degli errori | Un fallimento all'interno di un blocco mantiene il suo codespace (per esempio `pqc` 231, non `sdk_231`); `rate_limited` e i codici di delega vengono decodificati; `decodeTxError` legge il log o il messaggio di un errore sollevato |
| Regole di spesa | `validateSpendingRules` viene eseguita nei builder di `MsgUpdateSpendingRules` e rifiuta una regola che non limita nulla |
| Correzioni | La route dell'account PQC è la `/qorechain/pqc/v1/account/{address}` al singolare in ogni SDK (e in `client.rest.getPqcAccount`, `isPqcRegistered` e `getPqcStatus` quando ricevono il client composto); la `VERSION` esportata corrisponde al pacchetto; i client Go e Rust creati dall'SDK vanno in timeout invece di restare bloccati; i template di `create-qorechain-dapp` dipendono dalla release con cui vengono distribuiti |

La derivazione PQC legacy per le nuove chiavi (`derivePqcLegacy`, `"bridge"`) è
deprecata: non è vincolata all'account, quindi una stessa mnemonic darebbe la stessa chiave a
ogni account. Gli helper di rotazione la rifiutano come **nuova** chiave; recuperare o
ruotare allontanandosi da una chiave legacy esistente funziona ancora.

## Versioni precedenti alla 0.9.0 {#before-090}

Se sei sulla 0.8.x, firma ancora la forma che entrambe le reti verificano e funziona
sulla mainnet e sulla testnet. Questi sono i limiti che la 0.9.0 ha rimosso, e
alcuni di essi costano una commissione se non li conosci:

| Release precedente alla 0.9.0 | Soluzione alternativa |
| --- | --- |
| Nessun builder per prova di possesso, finestre con ambito limitato o consenso EIP-7702 | Usa `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` e `authorize-evm-delegation` / `clear-evm-delegation` (vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window), [Deleghe EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` senza `status` trasmetteva la registrazione senza controlli e segnalava successo quando era registrata una chiave diversa | Una seconda registrazione per un account che detiene già una chiave viene rifiutata **dopo che la commissione è stata prelevata**. Leggi prima `GET /qorechain/pqc/v1/account/{address}` e passa `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Chiamavano un percorso `/accounts/` al plurale o il namespace `qor_`, che gli endpoint pubblici non servono (HTTP 501, `-32601`). Leggi la route REST al singolare indicata sopra |
| `TxClient` / `bankSend` e i client rollup, multilayer e cross-VM firmavano solo in modo classico | Le reti lo rifiutano per qualsiasi account che abbia una chiave. Invia tramite `signAndBroadcastHybrid` |
| Le transazioni fallite all'interno di un blocco perdevano il loro codespace | Leggi la transazione da `GET /cosmos/tx/v1beta1/txs/{hash}` |
| La costante `VERSION` esportata della 0.8.3 riportava `0.8.0` | Leggi la versione installata da `package.json` |
| `create-qorechain-dapp` 0.8.0 fissava `@qorechain/sdk` / `@qorechain/evm` a `^0.3.0` (un caret su una versione 0.x resta dentro la 0.3) | Esegui `npm i @qorechain/sdk@latest` dopo la generazione |
| `@qorechain/react` 0.8.x lasciava illeggibile lo stato della chiave registrata sugli endpoint pubblici | Usa `@qorechain/react` 0.9.0 o successiva |

:::caution Correzioni precedenti
L'SDK **0.6.1** ha corretto un bug critico per il consenso: l'estensione del
tx-body `/qorechain.pqc.v1.PQCHybridSignature` veniva serializzata in JSON
dentro `Any.value` e **rifiutata dalla catena a CheckTx**. Le transazioni ibride (PQC +
classica) costruite con SDK ≤ 0.6.0 vengono rifiutate on-chain. La **0.8.0**
ha rimosso gli helper di account con firma da wallet (vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Il pacchetto core:

```bash
npm i @qorechain/sdk
```

Ha come target Node.js 20+ e include ESM, CommonJS e definizioni di tipo. Gli
esempi di transazioni ibride in questa documentazione importano anche `StargateClient` da
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adattatore EVM

`@qorechain/evm` è un adattatore sottile e type-safe sopra [viem](https://viem.sh).
viem è una **peer dependency** — installalo insieme:

```bash
npm i @qorechain/evm viem
```

Pubblicato su npm alla `0.8.0`.

### Adattatore SVM

`@qorechain/svm` è un adattatore sottile sopra
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), che è una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Pubblicato su npm alla `0.8.0`.

### Kit React

`@qorechain/react` è il livello React ufficiale sopra `@qorechain/sdk` — un
provider, hook e i componenti `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) è una peer dependency:

```bash
npm i @qorechain/react
```

Pubblicato su npm alla `0.10.0`; dipende da `@qorechain/sdk` `^0.10.0`. Vedi la [guida al kit React](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.10.0`) genera una dApp pronta all'uso:

```bash
npm create qorechain-dapp@latest my-dapp
```

I file `package.json` generati dipendono dalla release dell'SDK con cui viene distribuito lo scaffolder
(`@qorechain/sdk` `^0.10.0`; il template EVM usa `@qorechain/evm` `^0.8.0`).
La versione 0.8.0 dello scaffolder scriveva intervalli `^0.3.0`, che su una versione 0.x
restano dentro la 0.3 e non possono firmare per le reti live; se hai generato il progetto con la 0.8.0, esegui
`npm i @qorechain/sdk@latest`. Vedi il [riferimento della CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Richiede Python 3.10+. Il pacchetto include type hint e un marcatore `py.typed`.

> La distribuzione si installa come `qorechain-sdk` (pubblicato su PyPI alla `0.10.0`)
> ma **si importa come `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Richiede Go 1.23+. Importa i sotto-pacchetti che ti servono, per esempio:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Pubblicato come modulo Go autonomo (tag `packages/go/v0.10.0`). Fissa la versione
in modo esplicito: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Oppure, per seguire la head del repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Richiede Rust 1.74+. I client di lettura sono asincroni (Tokio). Il crate si importa come
`qorechain` (`use qorechain;`).

> Pubblicato su crates.io come `qorechain-sdk` (0.10.0); `cargo add qorechain-sdk`
> installa l'ultima release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.10.0</version>
</dependency>
```

Oppure Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.10.0'
```

> Pubblicato su Maven Central come `io.github.qorechain:qorechain-sdk` (la 0.10.0 è
> l'ultima e la versione di release, verificato il 27 ottobre 2026). Central non ha alcuna
> build 0.8.0 o 0.8.1, quindi sulle reti live usa la 0.8.2 o successiva. La 0.9.1 era una
> release solo Java che ha portato Bouncy Castle dalla 1.80 alla 1.85 senza modifiche all'API.

## Pacchetti correlati {#related-packages}

| Pacchetto | Scopo | Versione |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Helper lato wallet: generazione del wallet (`generateQoreWallet`), firma ibrida `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), registrazione della rete in MetaMask (`addQoreEvmToWallet`), builder di messaggi per authenticator e finestre EVM (il suo `openEvmWindowMsg` costruisce solo la forma senza ambito limitato), il digest v2 dell'abstract account. Non allega una prova di possesso. Peer dependency: `@cosmjs/proto-signing` e `@cosmjs/stargate` `^0.32` (l'SDK usa cosmjs 0.39, quindi installarli entrambi nello stesso progetto fa segnalare a npm un conflitto di peer, `ERESOLVE`; tienili in progetti separati oppure passa `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | Worker lato server per i backend: deriva la chiave PQC, firma in modo ibrido e trasmette (`sendTokens`, `registerPqc` e altro). Passa `cosmosRest`: con esso, una registrazione include la prova di possesso una volta che la rete ha applicato la v3.2.3, e un rifiuto dall'aspetto PQC viene verificato sulla chain prima di qualsiasi nuova registrazione (una chiave registrata diversa solleva `pqc_key_mismatch` invece di pagare una seconda registrazione) | 0.2.3 |
| `@qorechain/pqc` | Primitive ML-DSA / ML-KEM / SHAKE-256 solo conformi agli standard e `hybridSignBytes` (vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)); anche su PyPI, crates.io, Maven Central e sul proxy Go (Go `v0.2.3`) alla stessa versione | 0.2.3 |
| `@qorechain/handles` | Risoluzione verificata degli `@handle` (`HandleClient`): fornisci tu la chiave pubblica del registro e un archivio dei pin, e fai il pin dopo che l'utente ha visto l'indirizzo; il pacchetto non fa mai il pin da solo. Vedi [Chain bridge e handle](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Deprecato su npm e non più mantenuto; non usarlo per nuovi lavori. Usa invece [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) (le alternative per la connessione a QoreX sono nella [panoramica degli strumenti per sviluppatori](/developer-tools/overview#group-connect)).** Un unico connettore per wallet EVM, Cosmos e SVM, costruito sul wallet adapter (il suo intervallo di peer è `@qorechain/wallet-adapter` `^0.2.1`, che non include la 0.4.0). Non apre una [finestra di autorizzazione EVM](/sdk/guides/evm#evm-window), quindi un invio EVM tramite esso viene rifiutato finché l'account non ha una chiave registrata e una finestra aperta | 0.2.1 |
| `@qorechain/rdk` | Client del Rollup Development Kit (vedi [Rollup](/rollups/why)). Dipende da `@qorechain/sdk` `^0.9.0` e `@qorechain/evm` `^0.8.0`; un caret su una versione 0.x resta dentro la 0.9, quindi un'app con l'SDK 0.10.0 ottiene con il kit una seconda copia annidata dell'SDK 0.9.x (un'app che resta sull'SDK 0.9.x condivide una sola copia). Firma in modo ibrido solo quando passi una `pqcKeypair`; le letture funzionano senza. Pubblicato anche come `qorechain-rdk` su PyPI, crates.io e Maven Central e come modulo Go (fissa `@v0.6.2`; Maven Central serve la 0.6.1 finché la 0.6.2 non è live lì); questi quattro client firmano solo in modo classico. Vedi [RDK 0.6.2: modifiche e limiti](/rollups/deploying-a-rollup#rdk-050-limits) | 0.6.2 |
| `@qorechain/rdk-cli` | La CLI operatore `qorollup` per l'RDK. I suoi comandi di transazione (`create`, `pause`, `resume`, `stop`, `withdraw`) firmano solo in modo classico e vengono rifiutati dalle reti; installata da npm funziona e `--version` stampa 0.6.2 (la 0.6.1 e le precedenti non stampavano nulla) | 0.6.2 |
| `create-qorechain-rollup` | Scaffolder di starter per rollup; i suoi template dipendono da `@qorechain/rdk` `^0.6.1` e firmano in modo ibrido quando riescono a risolvere la tua chiave post-quantistica da `QORE_MNEMONIC` o `QORE_PQC_SEED_HEX` | 0.6.2 |

## Avanti

Continua con il [Quickstart](/sdk/quickstart) per connetterti e leggere lo stato on-chain.
