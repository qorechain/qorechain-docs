---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community is a command-line tool that inventories the cryptography of a QoreChain deployment and writes the result as a CycloneDX 1.6 CBOM (cryptographic bill of materials). It reads a node home directory, the live state of the network, TLS endpoints and Solidity sources, and records each algorithm, protocol, certificate and key it finds, with the file and line or the endpoint where it was found.

It is for validator and node operators, compliance and risk teams, auditors preparing an evidence pack, and Solidity teams that want to know which signature schemes their contracts depend on. From the CBOM it writes Markdown reports mapped to FINMA Guidance 05/2026, the EU NIS Cooperation Group post-quantum roadmap and the DORA RTS on ICT risk management (Article 6), with a status per algorithm against FIPS 203, 204 and 205 and NIST IR 8547.

Version **0.1.0**, published on 27 October 2026, Apache-2.0. It reads mainnet (`qorechain-vladi`) and testnet (`qorechain-diana`) over their public REST endpoints, or any REST endpoint you point it at.

QoreScan is an inventory aid. It is not a certification, an audit or a legal opinion, and it does not establish conformity with any regulation or standard. Anything the scan cannot establish is left as "To be completed".

## Innovations {#innovations}

- **A CBOM in a standard format.** Each finding is a CycloneDX 1.6 `cryptographic-asset` component with `cryptoProperties` (asset type, primitive, parameter set, curve, classical security level, NIST quantum security category, OID) and `evidence.occurrences` (file and line, or endpoint). Certificates link to their signature algorithm and public key, protocols to the algorithms they use, libraries to the algorithms they provide. Every CBOM written in the project's tests is validated against the official CycloneDX 1.6 JSON schema, and every `bom-ref` used is checked to be defined, so the output loads in any CycloneDX 1.6 consumer.
- **Chain-aware sources.** Besides files and TLS, it reads QoreChain itself: the PQC parameters, PQC-related protocol switches, the consensus key types of the active validator set and the active EVM precompiles, and for each account you name, whether it has a registered PQC key, its algorithm, its key type (hybrid, PQC alone, classical alone) and its public key size.
- **Hybrid key exchange is visible.** One TLS handshake per endpoint records the version, cipher suite, key exchange group (including hybrid ML-KEM groups such as `X25519MLKEM768`), ALPN, SNI and every certificate the server sent.
- **Private key values are never read.** Key files are decoded into structures that have no field for the private key, so those bytes are never decoded, stored, logged or written. A test fails if those structures gain a field that could carry private data, and another test scans a node home with freshly generated keys and checks that no encoding of them appears in any output.
- **Every algorithm gets a classification and a transition status.** `post-quantum`, `hybrid`, `quantum-vulnerable` or `symmetric`, with its NIST quantum security category where one is defined, and its status against FIPS 203, 204, 205 and the NIST IR 8547 schedule.
- **Reproducible output.** The CBOM timestamp is the current time, or `SOURCE_DATE_EPOCH` when it is set. The serial number is derived from the content, so the same input at the same time gives the same document.
- **Wrappers that check what they run.** The npm and PyPI packages download the release binary for your platform on demand and compare its SHA-256 with digests shipped inside the package. They refuse a binary that does not match, both after the download and on every later run of the cached copy. No install script runs at `npm install`.
- **No third-party code in the binary.** The `qorescan` binary uses the Go standard library for scanning (the JSON schema validator is used by its tests). It reuses no code from the PQCA CBOMkit projects; its output loads in the CBOMkit viewer.

## Use cases {#use-cases}

1. **Compliance team producing a CBOM for a supervisor.** A Swiss financial institution that runs a QoreChain node must show an inventory of the cryptographic methods across its ICT systems, distributed ledger technology included (FINMA Guidance 05/2026, section 3.2). It runs `qorescan scan --node-home ... --network mainnet`, attaches the CBOM and `qorescan report --framework finma` to its risk analysis, and completes the organisational sections by hand.
2. **Validator auditing its own node.** An operator wants to confirm which consensus key type the validator uses, whether the key files are readable by other users, whether RPC or EVM JSON-RPC listeners are exposed without TLS, and whether a remote signer is configured. `qorescan scan --node-home ~/.qorechain` records all of this without opening the private key values.
3. **Checking accounts before relying on them.** A custody desk or an exchange integration team wants to know whether treasury or hot-wallet addresses have a registered ML-DSA-87 key and whether it is hybrid. `qorescan scan --network mainnet --address qor1... --address qor1...` writes the PQC key status of each account into the CBOM. See the [custody kit](/developer-tools/custody-kit).
4. **Solidity team porting contracts.** A team moving contracts from Ethereum wants a list of every place that depends on `ecrecover`, OpenZeppelin `ECDSA`, P-256 or RSA, and every place that already calls the QoreChain PQC precompiles. `qorescan solidity ./contracts` lists each use with file and line.
5. **Endpoint review.** A platform team wants to know whether its public RPC, REST or wallet API endpoints negotiate a hybrid post-quantum key exchange with modern clients. `qorescan tls api.example.org:443` records the negotiated group, cipher suite and certificate chain.
6. **CI gate on every pull request.** A dApp repository adds the QoreScan GitHub Action so each change produces a fresh CBOM and a DORA or FINMA report as build artefacts, and reviewers can see when a new signature scheme or hash enters the codebase.
7. **Vendor due diligence.** A regulated firm sends `qorescan template questionnaire` output to a service provider, pre-filled with what the scan of that provider's endpoints already shows, so the provider answers only the open items.
8. **EU entities preparing for the NIS roadmap and DORA.** An entity uses `qorescan report --framework nis` and `--framework dora` to show where its inventory feeds the cryptographic asset management step and Article 6 of the DORA RTS.

## How it works {#how-it-works}

### Sources {#sources}

- **Node home** (`--node-home DIR`). Reads `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` and any certificate files they name. It records the P2P transport and its algorithms, the RPC and EVM JSON-RPC TLS certificates, listeners on non-loopback addresses without TLS, a remote signer, the validator and node key types and public keys, key file permissions, the genesis `pqc` module parameters, the on-chain algorithm registry at genesis, and the validator consensus key types.
- **Network** (`--network mainnet|testnet` or `--rest URL`). Reads PQC-related protocol switches, `pqc` parameters, the consensus key types of the active validator set and the active EVM precompiles over REST.
- **Accounts** (`--address ADDR`, repeatable). Reads the registered PQC key of each account over REST.
- **TLS** (`--tls HOST:PORT`, repeatable). One handshake per endpoint.
- **Solidity** (`--solidity PATH`, repeatable). Text-based detection of `ecrecover`, calls to the ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) and P-256 (`0x100`) precompiles, `keccak256`, `sha256`, `ripemd160`, and imports of OpenZeppelin, Solady and `IQorePQC.sol` signature libraries. The pqcVerify and pqcKeyStatus precompiles are active on testnet only; none is active on mainnet. See [EVM precompiles](/developer-guide/evm-precompiles).

### Network reads {#network-reads}

Every request to the network is an HTTP GET. The routes read are the node info route, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, the latest validator set route, `/cosmos/evm/vm/v1/params` and `/qorechain/pqc/v1/account/{address}`. A route that a node does not serve becomes a note in the CBOM, not an error.

### Classification {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) and LMS/XMSS are `post-quantum`. A classical key exchange combined with ML-KEM is `hybrid`. RSA, ECDSA, EdDSA, finite-field and elliptic-curve Diffie-Hellman and pairing-based signatures are `quantum-vulnerable`, with the NIST IR 8547 schedule "deprecated after 2030, disallowed after 2035". Block ciphers, AEADs, hashes, XOFs and KDFs are `symmetric`. QoreScan applies the IR 8547 schedule to every curve of the ECDSA, EdDSA and ECDH families, including secp256k1 and X25519, because the quantum exposure is the same. These are inventory classifications, not statements about NIST approval.

### Output {#output}

QoreScan adds a few `qorescan:*` properties (classification, NIST IR 8547 transition, standard, source) and records scanned facts, notes and a disclaimer property in the CBOM metadata. Evidence paths are relative to the scanned directory.

A report contains the framework mapping table, a summary by classification, every algorithm with its NIST category, its status against FIPS 203, 204, 205 and NIST IR 8547 and its evidence, then protocols, certificates, keys, libraries, scanned facts, scan notes and the cited sources. Organisational items read "To be completed".

### Framework mapping {#frameworks}

| Framework | Source | Where the inventory serves as input |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing", 9 July 2026, section 3 | 3.2 inventory (the CBOM); 3.3 critical data (key exchange of the scanned transports, native-lane hybrid signature mode); 3.4 crypto-agility (algorithm registry, migration period, protocol switches); 3.5 providers (certificate issuers, the questionnaire). 3.1 strategy is organisational. |
| `nis` | NIS Cooperation Group, "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Part 1, v1.1, 11 June 2025 | Cryptographic asset management (the CBOM); the 2030 and 2035 milestones (the list of quantum-vulnerable algorithms); agility. |
| `dora` | Commission Delegated Regulation (EU) 2024/1774, Article 6 | 6(2)(a) and (c) transport records and listeners without TLS; 6(2)(d) key records (types and public keys); 6(3) each algorithm against FIPS and NIST IR 8547; 6(4) registry, migration period, switches. 6(1) and 6(5) are organisational. |

## How to use {#how-to-use}

### Install {#install}

| Channel | Install command | Minimum platform |
|---|---|---|
| Release binary | Download `qorescan_0.1.0_<os>_<arch>` (or the `.tar.gz` or `.zip`; Windows binaries end in `.exe`) from the [GitHub release](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) and check it against `qorescan_0.1.0_checksums.txt` | macOS, Linux or Windows on amd64 or arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 or later |
| PyPI | `pipx run qorescan scan ...` (or `pip install qorescan`) | Python 3.9 or later |
| Docker | `docker build -t qorescan .` from the repository (no prebuilt image is published) | Docker; the image is distroless and runs as user 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | GitHub-hosted or self-hosted runner; the action builds QoreScan from its own source with `actions/setup-go` |

Environment variables for both wrappers:

| Variable | Effect |
|---|---|
| `QORESCAN_CACHE_DIR` | Where the binary is cached (default: the user cache directory). |
| `QORESCAN_DOWNLOAD_BASE` | Download from a mirror instead of GitHub. The digest check still applies. |

### Quickstart {#quickstart}

QoreScan sends GET requests and one TLS handshake per endpoint, signs nothing and needs no key. The commands below were run on 27 October 2026 against the public testnet, with a binary built from the v0.1.0 source.

**1. Scan the testnet state, one account, the TLS of the public testnet REST endpoint and a folder of Solidity sources:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

It exited with code 0. The CBOM recorded, among others, the chain id `qorechain-diana`, the native-lane hybrid signature mode `required`, the hybrid PQC key of the account (the testnet faucet account), the Ed25519 consensus keys of the validator set, TLS 1.3 with the hybrid group `X25519MLKEM768`, and the algorithms found in the Solidity sources.

A second run of the network and TLS parts only, made while this page was written, produced a CBOM of 21 components, including ML-DSA-87, `X25519MLKEM768`, a TLS 1.3 protocol entry for `api-testnet.qore.host:443`, its certificate chain and the validator set's Ed25519 keys.

**2. Write a FINMA report from the CBOM:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

The report opens with the disclaimer, then the mapping table (sections 3.1 to 3.5), a summary by classification, and one row per algorithm with its FIPS and NIST IR 8547 status and its evidence. A scan of a single Solidity file that uses `ecrecover` produced a CycloneDX 1.6 CBOM with one component (`ECDSA secp256k1`) and the same report header. An unknown framework name exits with code 2 and a message that lists `finma`, `nis` and `dora`.

**3. Pre-fill the vendor questionnaire and the agility statement:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Scan your own node.** Read access to the node home is enough:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

With Docker, mount the node home read-only so that the container cannot change it:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. Through the wrappers the commands are the same:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. In GitHub Actions.** Pin the action and every other action by commit:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Action inputs: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (lists separated by spaces or new lines), `out` (default `qorescan.cbom.json`) and `framework`. Outputs: `cbom` and `report`. The action builds QoreScan from its own source at the pinned commit, so no binary is downloaded.

What was run for this page: the testnet scan, the Solidity scan, the FINMA report and the unknown-framework error, with a binary built from the v0.1.0 source. The released binaries, the npm and PyPI wrappers (beyond reading their package contents and registry entries), the Docker image and the GitHub Action were not executed.

### Commands and flags {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

Flags may come before or after positional arguments. `--out -` (the default) writes to standard output. `qorescan <command> -h` prints the flags of a command.

| Command | Flag | What it does |
|---|---|---|
| `scan` | `--node-home DIR` | Node home directory (the one that contains `config/`). |
| `scan` | `--network mainnet\|testnet` | Read live state from `https://api.qore.host` or `https://api-testnet.qore.host`. |
| `scan` | `--rest URL` | Use any REST endpoint instead, for example your own node (`http://127.0.0.1:1317`) or a relay that forwards GET requests. Overrides `--network`. |
| `scan` | `--address ADDR` | Account whose PQC key status is read. Repeatable. Needs `--network` or `--rest`. |
| `scan` | `--tls HOST:PORT` | TLS endpoint to handshake with. Repeatable. Port 443 when omitted. |
| `scan` | `--solidity PATH` | Directory or `.sol` file. Repeatable. |
| `scan`, `solidity` | `--include-deps` | Also scan `node_modules`, `lib`, `out`, `cache`, `artifacts` and `typechain-types`, which are skipped by default. |
| `scan` | `--name NAME` | Name of the scanned deployment in the CBOM metadata. |
| `scan` | `--timeout D` | Network timeout per request (default `20s`). |
| `tls` | `--servername NAME` | SNI server name (default: the host). |
| `tls` | `--timeout D` | Handshake timeout (default `15s`). |
| all scans | `--verbose` | Log each file read and each request to standard error. |
| all | `--out FILE` | Output file, `-` for standard output. |
| `report` | `--framework finma\|nis\|dora` | The framework to map to. Required. |
| `report`, `template` | `--cbom FILE` | The CBOM to read, `-` for standard input. Required. |
| `template` | `agility` or `questionnaire` | Which template to write. |

Other commands: `qorescan tls` is a TLS scan on its own, `qorescan solidity` is a Solidity scan on its own, `qorescan template agility` writes a crypto-agility statement pre-filled from scanned facts, `qorescan template questionnaire` writes a five-question vendor questionnaire that follows the five measures of FINMA Guidance 05/2026 section 3, and `qorescan report` also accepts a CycloneDX 1.6 CBOM written by another tool (classification then goes by algorithm name).

Exit codes: `0` success, `1` a scan or I/O error, `2` a usage error.

## How to access {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` | `qorechain-diana` |
| REST used by `--network` | `https://api.qore.host` | `https://api-testnet.qore.host` |

- No key, account or funds are needed. QoreScan never signs or sends a transaction, and writes nothing except the output file you name.
- Some routes are not served by every node. On 27 October 2026 the public mainnet REST endpoint did not serve `/qorechain/pqc/v1/params`; the scan then records a note and continues. Point `--rest` at your own node for a fuller picture.
- The on-chain algorithm registry is not exposed over REST. QoreScan reads it from `genesis.json` when a node home is scanned.
- The scan reflects the chain version of the node it reads. Protocol switches and active precompiles differ between mainnet and testnet; the CBOM records what the queried node reports.
- If your machine cannot reach the public endpoints, use `--rest` with a node you run, or with a relay that forwards GET requests.
- Dependencies: the npm and PyPI wrappers use only their language's built-in modules.

## Security notes {#security}

- **Private key values are never read.** From `priv_validator_key.json` QoreScan takes the address, the public key and the key type names. From `node_key.json` it takes the key type alone; the node ID is not derived, because that would need the private key. The raw file buffer is overwritten after decoding, and decoding errors, which could quote input, are never returned.
- Keyring directories (`keyring-*`) and the key files named by `tls_key_file` and `tls.key-path` are not opened. QoreScan records only that they exist or are configured. Other PEM blocks in a certificate file are skipped without being decoded.
- Every network request is an HTTP GET. Nothing is written except the output file.
- The npm and PyPI wrappers verify the binary's SHA-256 before every run and refuse a mismatch, including when a mirror is used. For release 0.1.0 the digests inside the npm package match the release's checksum file.
- The Docker image is distroless and runs as a non-root user. Mount the node home with `:ro`.
- Report vulnerabilities privately to security@qore.network.

## Where it is published {#where-published}

Versions were read from each registry on 27 October 2026.

| Registry | Package | Version | Link |
|---|---|---|---|
| GitHub release | `qorechain/qorescan` | v0.1.0 (published 27 October 2026), binaries for darwin, linux and windows on amd64 and arm64, plus `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (command `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 or later) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go module proxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Source: https://github.com/qorechain/qorescan (Apache-2.0, copyright 2026 QoreChain Association). There is no crates.io or Maven package and no prebuilt Docker image; build the image from the repository. The repository documents every flag in `docs/usage.md`, what is read and what is never read in `docs/scanned-data.md`, the framework mapping and its sources in `docs/frameworks.md`, and the limits in `docs/limitations.md`.

## Limits and known issues {#limits}

- **An inventory aid.** It does not certify, audit or give legal advice, and its reports do not establish conformity with any regulation or standard. Organisational measures (strategy, roadmap, data classification, responsibilities) are left as "To be completed".
- **Scope.** QoreScan scans only the sources you point it at. Stored data, backups, HSMs, key management systems, operating system and library configuration, wallets, bridges and off-chain services are outside the scan unless you add their TLS endpoints with `--tls`. It does not scan bridges.
- **Live state.** The algorithm registry comes from `genesis.json` and reflects the network at genesis, not later governance changes. Validator consensus keys are read for the latest validator set.
- **TLS.** One handshake with Go's default client preferences shows what the server negotiates with a modern client, not every version, suite or group it accepts. An endpoint behind a load balancer may answer differently on another connection.
- **Remote signers.** With `priv_validator_laddr` set, the validator key lives elsewhere and its type is not visible from the node home.
- **Solidity.** Detection is textual. It does not resolve imports, follow inheritance or compute addresses at run time. A precompile address assembled at run time is missed, and a variable named like a pattern can be reported. Dependencies are skipped unless you pass `--include-deps`.
- **Other tools' CBOMs.** Reports classify CBOMs from other tools by algorithm name alone.
- **Dates.** NIST categories and IR 8547 transitions are taken from the cited documents as of October 2026. Application-specific guidance can set earlier dates.
- **Version string.** A binary built from source without a version flag prints `qorescan dev`. Use the release binary or the Go install of the tagged version when you need the version recorded.

## Related pages {#related}

- [Post-quantum signing](/developer-guide/post-quantum-signing): hybrid secp256k1 plus ML-DSA-87 on the native lane, and the EVM authorisation window.
- [Custody kit](/developer-tools/custody-kit): integration guide and reference code for custodians and exchanges.
- [QoreSign](/qoresign/overview): hybrid signing and verification libraries.
- [Running a node](/developer-guide/running-a-node) and [running a validator](/developer-guide/running-a-validator): node home layout, remote signers and key files.
- [EVM precompiles](/developer-guide/evm-precompiles): the PQC precompiles `0x0A01` and `0x0A02`.
- [Post-quantum library (qorechain-pqc)](/developer-tools/pqc-library): ML-DSA-87 in six languages.
- [Connecting to mainnet](/getting-started/connecting-to-mainnet) and [connecting to testnet](/getting-started/connecting-to-testnet): public endpoints.
