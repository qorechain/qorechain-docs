---
slug: /developer-tools/qorescan
title: QoreScan 커뮤니티
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan 커뮤니티

QoreScan 커뮤니티는 QoreChain 배포의 암호 사용 현황을 목록화하고 그 결과를 CycloneDX 1.6 CBOM(암호 자산 명세서, cryptographic bill of materials)으로 기록하는 명령줄 도구입니다. 노드 홈 디렉터리, 네트워크의 라이브 상태, TLS 엔드포인트, Solidity 소스를 읽고, 발견한 모든 알고리즘, 프로토콜, 인증서, 키를 발견된 파일과 줄 또는 엔드포인트와 함께 기록합니다.

검증인과 노드 운영자, 컴플라이언스 및 리스크 팀, 증빙 자료를 준비하는 감사자, 컨트랙트가 어떤 서명 방식에 의존하는지 알고 싶은 Solidity 팀을 위한 도구입니다. CBOM에서 FINMA Guidance 05/2026, EU NIS 협력 그룹의 포스트 퀀텀 로드맵, ICT 리스크 관리에 관한 DORA RTS(제6조)에 매핑된 Markdown 보고서를 작성하며, 알고리즘마다 FIPS 203, 204, 205 및 NIST IR 8547 기준의 상태를 제공합니다.

버전 **0.1.0**, 2026년 10월 27일 게시, Apache-2.0. 공개 REST 엔드포인트를 통해 메인넷(`qorechain-vladi`)과 테스트넷(`qorechain-diana`)을 읽거나, 지정한 임의의 REST 엔드포인트를 읽습니다.

QoreScan은 목록화를 돕는 도구입니다. 인증, 감사, 법적 의견이 아니며, 어떤 규정이나 표준에 대한 적합성도 입증하지 않습니다. 스캔으로 확인할 수 없는 항목은 "To be completed"로 남습니다.

## 혁신 {#innovations}

- **표준 형식의 CBOM.** 각 발견 사항은 `cryptoProperties`(자산 유형, 프리미티브, 파라미터 세트, 곡선, 클래식 보안 수준, NIST 양자 보안 범주, OID)와 `evidence.occurrences`(파일과 줄, 또는 엔드포인트)를 가진 CycloneDX 1.6 `cryptographic-asset` 컴포넌트입니다. 인증서는 서명 알고리즘과 공개 키에, 프로토콜은 사용하는 알고리즘에, 라이브러리는 제공하는 알고리즘에 연결됩니다. 프로젝트 테스트에서 작성된 모든 CBOM은 공식 CycloneDX 1.6 JSON 스키마로 검증되고, 사용된 모든 `bom-ref`가 정의되어 있는지 확인되므로, 출력은 어떤 CycloneDX 1.6 소비 도구에서도 로드됩니다.
- **체인을 인식하는 소스.** 파일과 TLS 외에 QoreChain 자체도 읽습니다. PQC 파라미터, PQC 관련 프로토콜 스위치, 활성 검증인 집합의 합의 키 유형, 활성 EVM 프리컴파일을 읽고, 지정한 각 계정에 대해서는 등록된 PQC 키가 있는지, 그 알고리즘, 키 유형(하이브리드, PQC 단독, 클래식 단독), 공개 키 크기를 읽습니다.
- **하이브리드 키 교환이 보입니다.** 엔드포인트당 한 번의 TLS 핸드셰이크로 버전, 암호 스위트, 키 교환 그룹(`X25519MLKEM768` 같은 하이브리드 ML-KEM 그룹 포함), ALPN, SNI, 서버가 보낸 모든 인증서를 기록합니다.
- **개인 키 값은 절대 읽지 않습니다.** 키 파일은 개인 키 필드가 없는 구조로 디코딩되므로 해당 바이트는 디코딩, 저장, 로깅, 기록되지 않습니다. 이 구조에 개인 데이터를 담을 수 있는 필드가 추가되면 실패하는 테스트가 있고, 새로 생성한 키가 있는 노드 홈을 스캔해 그 키의 어떤 인코딩도 출력에 나타나지 않는지 확인하는 테스트도 있습니다.
- **모든 알고리즘에 분류와 전환 상태가 붙습니다.** `post-quantum`, `hybrid`, `quantum-vulnerable`, `symmetric` 중 하나이며, 정의된 경우 NIST 양자 보안 범주와 FIPS 203, 204, 205 및 NIST IR 8547 일정 기준의 상태가 함께 표시됩니다.
- **재현 가능한 출력.** CBOM 타임스탬프는 현재 시각이거나, 설정된 경우 `SOURCE_DATE_EPOCH`입니다. 일련번호는 내용에서 파생되므로 같은 시각에 같은 입력이면 같은 문서가 나옵니다.
- **실행하는 것을 검사하는 래퍼.** npm 및 PyPI 패키지는 필요할 때 플랫폼에 맞는 릴리스 바이너리를 내려받고, 그 SHA-256을 패키지에 포함된 다이제스트와 비교합니다. 다운로드 후와 캐시된 사본을 실행할 때마다 일치하지 않는 바이너리는 거부합니다. `npm install` 시 설치 스크립트는 실행되지 않습니다.
- **바이너리에 서드파티 코드 없음.** `qorescan` 바이너리는 스캔에 Go 표준 라이브러리를 사용합니다(JSON 스키마 검증기는 테스트에서 사용). PQCA CBOMkit 프로젝트의 코드를 재사용하지 않으며, 출력은 CBOMkit 뷰어에서 로드됩니다.

## 사용 사례 {#use-cases}

1. **감독 기관에 제출할 CBOM을 만드는 컴플라이언스 팀.** QoreChain 노드를 운영하는 스위스 금융 기관은 분산원장 기술을 포함한 ICT 시스템 전반의 암호 방식 목록을 제시해야 합니다(FINMA Guidance 05/2026, 3.2절). `qorescan scan --node-home ... --network mainnet`을 실행하고, CBOM과 `qorescan report --framework finma` 결과를 리스크 분석에 첨부하며, 조직 관련 섹션은 직접 작성합니다.
2. **자기 노드를 점검하는 검증인.** 운영자는 검증인이 어떤 합의 키 유형을 쓰는지, 키 파일을 다른 사용자가 읽을 수 있는지, RPC 또는 EVM JSON-RPC 리스너가 TLS 없이 노출되어 있는지, 원격 서명자가 설정되어 있는지 확인하려 합니다. `qorescan scan --node-home ~/.qorechain`은 개인 키 값을 열지 않고 이 모두를 기록합니다.
3. **계정을 신뢰하기 전에 확인.** 수탁 데스크나 거래소 통합 팀은 트레저리 또는 핫 월렛 주소에 등록된 ML-DSA-87 키가 있는지, 그리고 하이브리드인지 알고 싶습니다. `qorescan scan --network mainnet --address qor1... --address qor1...`은 각 계정의 PQC 키 상태를 CBOM에 기록합니다. [커스터디 키트](/developer-tools/custody-kit)를 참고하세요.
4. **컨트랙트를 이식하는 Solidity 팀.** Ethereum에서 컨트랙트를 옮기는 팀은 `ecrecover`, OpenZeppelin `ECDSA`, P-256 또는 RSA에 의존하는 모든 위치와 이미 QoreChain PQC 프리컴파일을 호출하는 모든 위치의 목록이 필요합니다. `qorescan solidity ./contracts`는 각 사용 위치를 파일과 줄 번호와 함께 나열합니다.
5. **엔드포인트 점검.** 플랫폼 팀은 공개 RPC, REST 또는 지갑 API 엔드포인트가 최신 클라이언트와 하이브리드 포스트 퀀텀 키 교환을 협상하는지 알고 싶습니다. `qorescan tls api.example.org:443`은 협상된 그룹, 암호 스위트, 인증서 체인을 기록합니다.
6. **모든 풀 리퀘스트의 CI 게이트.** dApp 저장소가 QoreScan GitHub Action을 추가하면 변경마다 새 CBOM과 DORA 또는 FINMA 보고서가 빌드 산출물로 생성되고, 리뷰어는 새 서명 방식이나 해시가 코드베이스에 들어올 때 이를 확인할 수 있습니다.
7. **벤더 실사.** 규제 대상 기업은 해당 서비스 제공업체의 엔드포인트 스캔에서 이미 드러난 내용으로 미리 채운 `qorescan template questionnaire` 출력을 보내므로, 제공업체는 남은 항목에만 답하면 됩니다.
8. **NIS 로드맵과 DORA를 준비하는 EU 기관.** 기관은 `qorescan report --framework nis`와 `--framework dora`를 사용해 목록이 암호 자산 관리 단계와 DORA RTS 제6조에 어디서 입력이 되는지 보여줍니다.

## 동작 방식 {#how-it-works}

### 소스 {#sources}

- **노드 홈**(`--node-home DIR`). `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json`과 이들이 지정하는 인증서 파일을 읽습니다. P2P 전송과 그 알고리즘, RPC 및 EVM JSON-RPC TLS 인증서, TLS 없이 루프백이 아닌 주소에서 수신하는 리스너, 원격 서명자, 검증인 및 노드 키 유형과 공개 키, 키 파일 권한, 제네시스 `pqc` 모듈 파라미터, 제네시스 시점의 온체인 알고리즘 레지스트리, 검증인 합의 키 유형을 기록합니다.
- **네트워크**(`--network mainnet|testnet` 또는 `--rest URL`). REST를 통해 PQC 관련 프로토콜 스위치, `pqc` 파라미터, 활성 검증인 집합의 합의 키 유형, 활성 EVM 프리컴파일을 읽습니다.
- **계정**(`--address ADDR`, 반복 가능). REST를 통해 각 계정의 등록된 PQC 키를 읽습니다.
- **TLS**(`--tls HOST:PORT`, 반복 가능). 엔드포인트당 한 번의 핸드셰이크.
- **Solidity**(`--solidity PATH`, 반복 가능). `ecrecover`, ecrecover(`0x01`), pqcVerify(`0x0A01`), pqcKeyStatus(`0x0A02`), P-256(`0x100`) 프리컴파일 호출, `keccak256`, `sha256`, `ripemd160`, OpenZeppelin, Solady, `IQorePQC.sol` 서명 라이브러리 import를 텍스트 기반으로 감지합니다. pqcVerify와 pqcKeyStatus 프리컴파일은 테스트넷에서만 활성화되어 있으며, 메인넷에서는 어느 것도 활성화되어 있지 않습니다. [EVM 프리컴파일](/developer-guide/evm-precompiles)을 참고하세요.

### 네트워크 읽기 {#network-reads}

네트워크로 보내는 모든 요청은 HTTP GET입니다. 읽는 경로는 노드 정보 경로, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, 최신 검증인 집합 경로, `/cosmos/evm/vm/v1/params`, `/qorechain/pqc/v1/account/{address}`입니다. 노드가 제공하지 않는 경로는 오류가 아니라 CBOM의 노트가 됩니다.

### 분류 {#classification}

ML-KEM(FIPS 203), ML-DSA(FIPS 204), SLH-DSA(FIPS 205), LMS/XMSS는 `post-quantum`입니다. 클래식 키 교환과 ML-KEM을 결합한 것은 `hybrid`입니다. RSA, ECDSA, EdDSA, 유한체 및 타원 곡선 Diffie-Hellman, 페어링 기반 서명은 `quantum-vulnerable`이며 NIST IR 8547 일정 "deprecated after 2030, disallowed after 2035"가 적용됩니다. 블록 암호, AEAD, 해시, XOF, KDF는 `symmetric`입니다. 양자 노출이 동일하므로, QoreScan은 secp256k1과 X25519를 포함한 ECDSA, EdDSA, ECDH 계열의 모든 곡선에 IR 8547 일정을 적용합니다. 이는 목록 분류이며 NIST 승인에 관한 진술이 아닙니다.

### 출력 {#output}

QoreScan은 몇 가지 `qorescan:*` 속성(분류, NIST IR 8547 전환, 표준, 소스)을 추가하고, 스캔된 사실, 노트, 면책 속성을 CBOM 메타데이터에 기록합니다. 증거 경로는 스캔한 디렉터리 기준의 상대 경로입니다.

보고서에는 프레임워크 매핑 표, 분류별 요약, 알고리즘별 NIST 범주와 FIPS 203, 204, 205 및 NIST IR 8547 기준 상태와 증거, 그리고 프로토콜, 인증서, 키, 라이브러리, 스캔된 사실, 스캔 노트, 인용된 출처가 담깁니다. 조직 관련 항목은 "To be completed"로 표시됩니다.

### 프레임워크 매핑 {#frameworks}

| 프레임워크 | 출처 | 목록이 입력으로 쓰이는 곳 |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing", 2026년 7월 9일, 3절 | 3.2 목록(CBOM), 3.3 중요 데이터(스캔된 전송의 키 교환, Native 레인 하이브리드 서명 모드), 3.4 암호 민첩성(알고리즘 레지스트리, 마이그레이션 기간, 프로토콜 스위치), 3.5 제공업체(인증서 발급자, 설문지). 3.1 전략은 조직 사항입니다. |
| `nis` | NIS Cooperation Group, "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Part 1, v1.1, 2025년 6월 11일 | 암호 자산 관리(CBOM), 2030년 및 2035년 이정표(quantum-vulnerable 알고리즘 목록), 민첩성. |
| `dora` | Commission Delegated Regulation (EU) 2024/1774, 제6조 | 6(2)(a) 및 (c) 전송 기록과 TLS 없는 리스너, 6(2)(d) 키 기록(유형과 공개 키), 6(3) FIPS 및 NIST IR 8547 대비 각 알고리즘, 6(4) 레지스트리, 마이그레이션 기간, 스위치. 6(1)과 6(5)는 조직 사항입니다. |

## 사용 방법 {#how-to-use}

### 설치 {#install}

| 채널 | 설치 명령 | 최소 플랫폼 |
|---|---|---|
| 릴리스 바이너리 | [GitHub 릴리스](https://github.com/qorechain/qorescan/releases/tag/v0.1.0)에서 `qorescan_0.1.0_<os>_<arch>`(또는 `.tar.gz`나 `.zip`, Windows 바이너리는 `.exe`로 끝남)를 내려받아 `qorescan_0.1.0_checksums.txt`와 대조 | amd64 또는 arm64의 macOS, Linux, Windows |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 이상 |
| PyPI | `pipx run qorescan scan ...`(또는 `pip install qorescan`) | Python 3.9 이상 |
| Docker | 저장소에서 `docker build -t qorescan .`(미리 빌드된 이미지는 게시되지 않음) | Docker, 이미지는 distroless이며 사용자 65532로 실행 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | GitHub 호스팅 또는 자체 호스팅 러너, Action은 `actions/setup-go`로 자체 소스에서 QoreScan을 빌드 |

두 래퍼 모두에 적용되는 환경 변수:

| 변수 | 효과 |
|---|---|
| `QORESCAN_CACHE_DIR` | 바이너리를 캐시하는 위치(기본값: 사용자 캐시 디렉터리). |
| `QORESCAN_DOWNLOAD_BASE` | GitHub 대신 미러에서 내려받음. 다이제스트 검사는 계속 적용됩니다. |

### 빠른 시작 {#quickstart}

QoreScan은 GET 요청과 엔드포인트당 한 번의 TLS 핸드셰이크를 보내고, 아무것도 서명하지 않으며 키가 필요하지 않습니다. 아래 명령은 2026년 10월 27일에 v0.1.0 소스로 빌드한 바이너리로 공개 테스트넷을 대상으로 실행했습니다.

**1. 테스트넷 상태, 계정 하나, 공개 테스트넷 REST 엔드포인트의 TLS, Solidity 소스 폴더를 스캔합니다.**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

종료 코드 0으로 끝났습니다. CBOM에는 체인 id `qorechain-diana`, Native 레인 하이브리드 서명 모드 `required`, 계정(테스트넷 faucet 계정)의 하이브리드 PQC 키, 검증인 집합의 Ed25519 합의 키, 하이브리드 그룹 `X25519MLKEM768`을 사용한 TLS 1.3, Solidity 소스에서 발견된 알고리즘 등이 기록되었습니다.

이 페이지를 작성하는 동안 네트워크와 TLS 부분만 다시 실행한 결과, ML-DSA-87, `X25519MLKEM768`, `api-testnet.qore.host:443`의 TLS 1.3 프로토콜 항목, 그 인증서 체인, 검증인 집합의 Ed25519 키를 포함해 21개 컴포넌트의 CBOM이 만들어졌습니다.

**2. CBOM으로 FINMA 보고서를 작성합니다.**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

보고서는 면책 문구로 시작하고, 이어서 매핑 표(3.1~3.5절), 분류별 요약, 알고리즘마다 FIPS 및 NIST IR 8547 상태와 증거를 담은 행이 나옵니다. `ecrecover`를 사용하는 Solidity 파일 하나를 스캔하자 컴포넌트 하나(`ECDSA secp256k1`)를 가진 CycloneDX 1.6 CBOM과 같은 보고서 머리글이 만들어졌습니다. 알 수 없는 프레임워크 이름은 종료 코드 2와 함께 `finma`, `nis`, `dora`를 나열하는 메시지를 냅니다.

**3. 벤더 설문지와 민첩성 진술서를 미리 채웁니다.**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. 자신의 노드를 스캔합니다.** 노드 홈에 대한 읽기 권한이면 충분합니다.

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Docker를 쓸 때는 컨테이너가 변경하지 못하도록 노드 홈을 읽기 전용으로 마운트하세요.

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. 래퍼를 통해서도 명령은 같습니다.**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. GitHub Actions에서.** Action과 다른 모든 Action을 커밋으로 고정하세요.

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

Action 입력: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity`(공백 또는 줄바꿈으로 구분한 목록), `out`(기본값 `qorescan.cbom.json`), `framework`. 출력: `cbom`과 `report`. Action은 고정된 커밋의 자체 소스에서 QoreScan을 빌드하므로 바이너리를 내려받지 않습니다.

이 페이지를 위해 실행한 것: v0.1.0 소스로 빌드한 바이너리로 한 테스트넷 스캔, Solidity 스캔, FINMA 보고서, 알 수 없는 프레임워크 오류. 릴리스된 바이너리, npm 및 PyPI 래퍼(패키지 내용과 레지스트리 항목을 읽은 것 외), Docker 이미지, GitHub Action은 실행하지 않았습니다.

### 명령과 플래그 {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

플래그는 위치 인수의 앞이나 뒤에 올 수 있습니다. `--out -`(기본값)은 표준 출력에 씁니다. `qorescan <command> -h`는 명령의 플래그를 출력합니다.

| 명령 | 플래그 | 기능 |
|---|---|---|
| `scan` | `--node-home DIR` | 노드 홈 디렉터리(`config/`가 들어 있는 디렉터리). |
| `scan` | `--network mainnet\|testnet` | `https://api.qore.host` 또는 `https://api-testnet.qore.host`에서 라이브 상태를 읽습니다. |
| `scan` | `--rest URL` | 대신 임의의 REST 엔드포인트를 사용합니다. 예: 자신의 노드(`http://127.0.0.1:1317`) 또는 GET 요청을 전달하는 릴레이. `--network`보다 우선합니다. |
| `scan` | `--address ADDR` | PQC 키 상태를 읽을 계정. 반복 가능. `--network` 또는 `--rest`가 필요합니다. |
| `scan` | `--tls HOST:PORT` | 핸드셰이크할 TLS 엔드포인트. 반복 가능. 생략하면 포트 443. |
| `scan` | `--solidity PATH` | 디렉터리 또는 `.sol` 파일. 반복 가능. |
| `scan`, `solidity` | `--include-deps` | 기본적으로 건너뛰는 `node_modules`, `lib`, `out`, `cache`, `artifacts`, `typechain-types`도 스캔합니다. |
| `scan` | `--name NAME` | CBOM 메타데이터에 넣을 스캔 대상 배포의 이름. |
| `scan` | `--timeout D` | 요청당 네트워크 타임아웃(기본값 `20s`). |
| `tls` | `--servername NAME` | SNI 서버 이름(기본값: 호스트). |
| `tls` | `--timeout D` | 핸드셰이크 타임아웃(기본값 `15s`). |
| 모든 스캔 | `--verbose` | 읽은 각 파일과 각 요청을 표준 오류에 기록합니다. |
| 전체 | `--out FILE` | 출력 파일, 표준 출력은 `-`. |
| `report` | `--framework finma\|nis\|dora` | 매핑할 프레임워크. 필수. |
| `report`, `template` | `--cbom FILE` | 읽을 CBOM, 표준 입력은 `-`. 필수. |
| `template` | `agility` 또는 `questionnaire` | 작성할 템플릿. |

기타 명령: `qorescan tls`는 독립 실행형 TLS 스캔, `qorescan solidity`는 독립 실행형 Solidity 스캔, `qorescan template agility`는 스캔된 사실로 미리 채운 암호 민첩성 진술서를 작성하고, `qorescan template questionnaire`는 FINMA Guidance 05/2026 3절의 다섯 가지 조치를 따르는 다섯 문항의 벤더 설문지를 작성하며, `qorescan report`는 다른 도구가 작성한 CycloneDX 1.6 CBOM도 받아들입니다(이 경우 분류는 알고리즘 이름을 기준으로 합니다).

종료 코드: `0` 성공, `1` 스캔 또는 I/O 오류, `2` 사용법 오류.

## 접근 방법 {#how-to-access}

| | 메인넷 | 테스트넷 |
|---|---|---|
| 체인 id | `qorechain-vladi` | `qorechain-diana` |
| `--network`가 사용하는 REST | `https://api.qore.host` | `https://api-testnet.qore.host` |

- 키, 계정, 자금이 필요하지 않습니다. QoreScan은 트랜잭션에 서명하거나 전송하지 않으며, 지정한 출력 파일 외에는 아무것도 쓰지 않습니다.
- 모든 노드가 모든 경로를 제공하는 것은 아닙니다. 2026년 10월 27일 기준 공개 메인넷 REST 엔드포인트는 `/qorechain/pqc/v1/params`를 제공하지 않았으며, 이 경우 스캔은 노트를 기록하고 계속 진행합니다. 더 완전한 결과를 원하면 `--rest`를 자신의 노드로 지정하세요.
- 온체인 알고리즘 레지스트리는 REST로 노출되지 않습니다. 노드 홈을 스캔할 때 QoreScan은 `genesis.json`에서 읽습니다.
- 스캔은 읽는 노드의 체인 버전을 반영합니다. 프로토콜 스위치와 활성 프리컴파일은 메인넷과 테스트넷에서 다르며, CBOM에는 조회한 노드가 보고하는 내용이 기록됩니다.
- 사용 중인 머신에서 공개 엔드포인트에 닿을 수 없으면, 직접 운영하는 노드나 GET 요청을 전달하는 릴레이와 함께 `--rest`를 사용하세요.
- 의존성: npm 및 PyPI 래퍼는 해당 언어의 내장 모듈만 사용합니다.

## 보안 참고 사항 {#security}

- **개인 키 값은 절대 읽지 않습니다.** `priv_validator_key.json`에서는 주소, 공개 키, 키 유형 이름만 가져옵니다. `node_key.json`에서는 키 유형만 가져오며, 개인 키가 필요하므로 노드 ID는 파생하지 않습니다. 원시 파일 버퍼는 디코딩 후 덮어쓰이고, 입력을 인용할 수 있는 디코딩 오류는 반환되지 않습니다.
- 키링 디렉터리(`keyring-*`)와 `tls_key_file` 및 `tls.key-path`가 지정한 키 파일은 열지 않습니다. QoreScan은 그것들이 존재하거나 설정되어 있다는 사실만 기록합니다. 인증서 파일의 다른 PEM 블록은 디코딩하지 않고 건너뜁니다.
- 모든 네트워크 요청은 HTTP GET입니다. 출력 파일 외에는 아무것도 기록하지 않습니다.
- npm 및 PyPI 래퍼는 매 실행 전에 바이너리의 SHA-256을 검증하고, 미러를 사용할 때도 불일치를 거부합니다. 릴리스 0.1.0에서는 npm 패키지 안의 다이제스트가 릴리스의 체크섬 파일과 일치합니다.
- Docker 이미지는 distroless이며 루트가 아닌 사용자로 실행됩니다. 노드 홈은 `:ro`로 마운트하세요.
- 취약점은 security@qore.network로 비공개 신고해 주세요.

## 게시 위치 {#where-published}

2026년 10월 27일에 각 레지스트리에서 읽은 버전입니다.

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| GitHub 릴리스 | `qorechain/qorescan` | v0.1.0(2026년 10월 27일 게시), amd64 및 arm64용 darwin, linux, windows 바이너리와 `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan`(명령 `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan`(Python 3.9 이상) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go module proxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

소스: https://github.com/qorechain/qorescan (Apache-2.0, copyright 2026 QoreChain Association). crates.io나 Maven 패키지는 없고 미리 빌드된 Docker 이미지도 없으므로, 저장소에서 이미지를 빌드하세요. 저장소는 모든 플래그를 `docs/usage.md`에, 읽는 것과 절대 읽지 않는 것을 `docs/scanned-data.md`에, 프레임워크 매핑과 그 출처를 `docs/frameworks.md`에, 한계를 `docs/limitations.md`에 문서화합니다.

## 한계와 알려진 문제 {#limits}

- **목록화를 돕는 도구.** 인증, 감사, 법률 자문을 하지 않으며, 보고서는 어떤 규정이나 표준에 대한 적합성도 입증하지 않습니다. 조직 차원의 조치(전략, 로드맵, 데이터 분류, 책임)는 "To be completed"로 남습니다.
- **범위.** QoreScan은 지정한 소스만 스캔합니다. 저장된 데이터, 백업, HSM, 키 관리 시스템, 운영 체제 및 라이브러리 설정, 지갑, 브리지, 오프체인 서비스는 `--tls`로 TLS 엔드포인트를 추가하지 않는 한 스캔 범위 밖입니다. 브리지는 스캔하지 않습니다.
- **라이브 상태.** 알고리즘 레지스트리는 `genesis.json`에서 가져오므로 이후의 거버넌스 변경이 아니라 제네시스 시점의 네트워크를 반영합니다. 검증인 합의 키는 최신 검증인 집합에 대해 읽습니다.
- **TLS.** Go 기본 클라이언트 설정으로 한 번 핸드셰이크하면 서버가 최신 클라이언트와 협상하는 내용을 알 수 있으며, 서버가 허용하는 모든 버전, 스위트, 그룹을 보여주지는 않습니다. 로드 밸런서 뒤의 엔드포인트는 다른 연결에서 다르게 응답할 수 있습니다.
- **원격 서명자.** `priv_validator_laddr`가 설정되어 있으면 검증인 키가 다른 곳에 있으며, 그 유형은 노드 홈에서 보이지 않습니다.
- **Solidity.** 감지는 텍스트 기반입니다. import를 해석하거나 상속을 따라가거나 런타임에 주소를 계산하지 않습니다. 런타임에 조립되는 프리컴파일 주소는 놓치며, 패턴과 비슷한 이름의 변수가 보고될 수 있습니다. `--include-deps`를 전달하지 않으면 의존성은 건너뜁니다.
- **다른 도구의 CBOM.** 보고서는 다른 도구의 CBOM을 알고리즘 이름만으로 분류합니다.
- **날짜.** NIST 범주와 IR 8547 전환은 2026년 10월 기준으로 인용된 문서에서 가져왔습니다. 애플리케이션별 지침은 더 이른 날짜를 정할 수 있습니다.
- **버전 문자열.** 버전 플래그 없이 소스에서 빌드한 바이너리는 `qorescan dev`를 출력합니다. 버전이 기록되어야 한다면 릴리스 바이너리나 태그된 버전의 Go 설치를 사용하세요.

## 관련 페이지 {#related}

- [포스트 퀀텀 서명](/developer-guide/post-quantum-signing): Native 레인의 하이브리드 secp256k1 + ML-DSA-87, 그리고 EVM 승인 윈도우.
- [커스터디 키트](/developer-tools/custody-kit): 수탁 기관과 거래소를 위한 통합 가이드와 참조 코드.
- [QoreSign](/qoresign/overview): 하이브리드 서명 및 검증 라이브러리.
- [노드 실행](/developer-guide/running-a-node) 및 [검증인 실행](/developer-guide/running-a-validator): 노드 홈 구조, 원격 서명자, 키 파일.
- [EVM 프리컴파일](/developer-guide/evm-precompiles): PQC 프리컴파일 `0x0A01` 및 `0x0A02`.
- [포스트 퀀텀 라이브러리(qorechain-pqc)](/developer-tools/pqc-library): 여섯 개 언어의 ML-DSA-87.
- [메인넷 연결](/getting-started/connecting-to-mainnet) 및 [테스트넷 연결](/getting-started/connecting-to-testnet): 공개 엔드포인트.
