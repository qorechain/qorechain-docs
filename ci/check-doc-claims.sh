#!/usr/bin/env bash
# check-doc-claims.sh - fail the build if a known-false claim comes back.
#
# Runs before `npm run build` (the prebuild script), so the Amplify build
# fails instead of publishing it.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
scan() { # scan <reason> <pattern>...
  local reason=$1; shift
  local args=()
  for p in "$@"; do args+=(-e "$p"); done
  if grep -rniI "${args[@]}" docs i18n; then
    echo "check-doc-claims: the lines above $reason" >&2
    fail=1
  fi
}

# the chain accepts any valid FIPS-204 ML-DSA-87 signature,
# hedged or deterministic. Deterministic is the libraries' default for
# reproducible signatures and tx hashes, not a chain requirement.
scan "claim the chain rejects hedged ML-DSA signatures" \
  'rejects hedged' \
  'hedged signatures are rejected' \
  'hedged signatures are \*\*not accepted' \
  'hedged signatures are not accepted' \
  'accepts \*\*only deterministic' \
  'accepts only deterministic' \
  'only variant the chain accepts'

# precompiles are not active, the
# qor_ namespace is not served, the PQC route is singular, and v0.53 ignores
# pagination.limit on tx search.
scan "repeat a stale API claim" \
  'Precompiles are available on both' \
  'The `qor_` namespace is available on the' \
  '/pqc/v1/accounts/' \
  'txs?[^ ]*pagination\.limit' \
  'txs?events='

# the Phantom-signature account derivation was removed in SDK
# 0.8.0 because it turned a replayable wallet signature into a spend key. The
# names may appear only in removal notes, which always mention 0.8.0.
if grep -rnI -e 'connectPhantomUnified' -e 'unifiedAccountFromPhantomSignature' \
  -e 'unified_account_from_phantom_signature' -e 'UnifiedAccountFromPhantomSignature' docs i18n | grep -v '0\.8\.0'; then
  echo "check-doc-claims: the lines above present the removed Phantom derivation as usable" >&2
  fail=1
fi

# Every translation must carry the code-21 troubleshooting section.
for f in docs/developer-guide/post-quantum-signing.md \
  i18n/*/docusaurus-plugin-content-docs/current/developer-guide/post-quantum-signing.md; do
  if ! grep -q '{#code-21}' "$f"; then
    echo "check-doc-claims: $f has no {#code-21} section" >&2
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi
echo "check-doc-claims: ok"
