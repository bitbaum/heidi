#!/usr/bin/env bash
# Provision LanguageTool on the box, loopback-only, for spoken-grammar findings.
#
#   bash scripts/box/provision-languagetool.sh          # dry run: prints the plan
#   bash scripts/box/provision-languagetool.sh --go     # applies it over ssh
#
# WHY SELF-HOSTED. `lib/speech/grammar.ts` explains it: a learner's transcript
# is what they said out loud, and sending it to a third-party checker would
# quietly abandon the privacy position the rest of the speaking surface takes.
# LanguageTool is LGPL, runs as one Java server, costs nothing per call, and is
# deterministic — a finding with a rule id somebody can argue with.
#
# 127.0.0.1 IS LOAD-BEARING, exactly as for SearxNG on the same box: the server
# has no authentication, so binding it publicly would make it everyone's free
# grammar API on our CPU. Heidi reaches it as LANGUAGETOOL_URL.
#
# Memory is capped twice — the JVM heap and the container — because the box
# runs every studio app and a checker that grows without bound takes them all
# down. No n-gram data: it adds GBs for a class of confusion rules that matter
# for written prose, not for a sentence somebody just said.
#
# Idempotent: re-running with --go pulls the pinned image and recreates only if
# the definition changed.
set -euo pipefail

BOX="${BOX:-ubuntu@167.233.22.31}"
DIR=/opt/languagetool
IMAGE=erikvl87/languagetool:6.8 # pinned; bump deliberately, not via :latest
PORT=8010

COMPOSE=$(
  cat <<YAML
services:
  languagetool:
    image: ${IMAGE}
    container_name: languagetool
    restart: unless-stopped
    ports:
      - "127.0.0.1:${PORT}:8010"
    environment:
      - Java_Xms=256m
      - Java_Xmx=1g
    mem_limit: 1536m
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
YAML
)

if [[ "${1:-}" != "--go" ]]; then
  echo "Would write ${DIR}/docker-compose.yml on ${BOX}:"
  echo "${COMPOSE}"
  echo
  echo "Then: docker compose up -d, and wait for :${PORT} to answer. Re-run with --go."
  exit 0
fi

ssh "${BOX}" "sudo mkdir -p ${DIR} && sudo tee ${DIR}/docker-compose.yml >/dev/null" <<<"${COMPOSE}"
ssh "${BOX}" "cd ${DIR} && sudo docker compose pull -q && sudo docker compose up -d"

# The JVM takes ~20-40s to load its language modules. Wait for a real answer,
# bounded, rather than declaring success on a container that merely started.
for _ in $(seq 1 30); do
  if ssh "${BOX}" "curl -fsS 'http://127.0.0.1:${PORT}/v2/check' --data 'language=de-CH&text=Ich+habe+ein+Termin.' | grep -q '\"matches\"'"; then
    echo "LanguageTool answering on 127.0.0.1:${PORT}"
    exit 0
  fi
  sleep 4
done
echo "LanguageTool did not answer within 120s — check: ssh ${BOX} 'sudo docker logs languagetool'" >&2
exit 1
