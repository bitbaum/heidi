#!/usr/bin/env bash
# Post-deploy smoke check: does the site actually answer, for both kinds of
# visitor?
#
# WHY THIS EXISTS. A middleware rewrite took the locale root down for every
# signed-in visitor, in production, with a full green test suite behind it —
# 339 tests, lint, typecheck, and a production build exercised in a browser.
# None of them could have caught it: the failure needs a reverse proxy in
# front of the app (CI has none, `pnpm start` has none), and the broken branch
# only ran when a session cookie was present.
#
# So the one thing that WOULD have caught it is the cheapest thing here:
# request the same URLs twice, once with a session cookie and once without.
#
# WHAT THE COOKIE DOES AND DOES NOT PROVE. It is not a real session — `auth()`
# rejects it and the page renders as signed-out. What it exercises is every
# code path gated on "is a session cookie present", which is where routing,
# rewrites and redirects live, and where this class of bug lives with them.
# A genuinely authenticated end-to-end test needs a test account and a real
# login; this is not that, and does not pretend to be.
#
#   scripts/smoke.sh                          # against production
#   scripts/smoke.sh http://localhost:3111    # against a local build
set -uo pipefail

BASE="${1:-https://heidi.orangecat.ch}"
# Any non-empty value. Deliberately not a real token: this must be safe to
# commit, safe to log, and safe to run against production.
SESSION="__Secure-authjs.session-token=smoke; authjs.session-token=smoke"

fail=0

check() {
  local path="$1" expect="$2" who="$3" cookie="$4"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 \
    ${cookie:+-H "Cookie: $cookie"} "$BASE$path")

  if [ "$code" = "$expect" ]; then
    printf '  ok    %-28s %-11s %s\n' "$path" "$who" "$code"
  else
    printf '  FAIL  %-28s %-11s %s (expected %s)\n' "$path" "$who" "$code" "$expect"
    fail=1
  fi
}

both() {
  check "$1" "$2" "signed out" ""
  check "$1" "$2" "signed in" "$SESSION"
}

echo "smoke: $BASE"

# The bare root negotiates a locale. 307 and NOT 308: the right locale for the
# next visitor may differ, so a browser or proxy caching it as permanent would
# pin everyone to whoever asked first.
both / 307

# Every page a visitor can reach by name. Both ways round, because the outage
# this file exists for was invisible from one of them.
for path in /de /de/chat /de/speaking /de/grammar /de/method /de/contribute /de/about /en /fr; do
  both "$path" 200
done

# `/portal` REDIRECTS, and asserting that is the point rather than a weakening.
#
# The dashboard moved back to the locale root — `/` and `/portal` were
# rendering the identical page, which is the duplication that made "start and
# chat show the same thing" a fair complaint one pair along. The route stays
# for the bookmarks and for the sign-in return, and it sends a Location header.
#
# This file asserted 200 here and so it failed the deploy that made the change,
# which is the check doing its job: the behaviour was intended, the assertion
# was not updated with it. 307 rather than 308 because the page could come
# back, and a permanent redirect is the one browsers refuse to forget.
both /de/portal 307

# The crawler files, which live outside the locale and have been broken by a
# middleware matcher before.
check /robots.txt 200 "anonymous" ""
check /sitemap.xml 200 "anonymous" ""

# Health carries the schema verdict; a deploy that cannot use its own tables
# reports 200 with `state != ok`, so read the body rather than the status.
health=$(curl -s --max-time 20 "$BASE/api/health")
if printf '%s' "$health" | grep -q '"state":"ok"'; then
  echo "  ok    /api/health                  schema      $(printf '%s' "$health" | tr -d '\n')"
else
  echo "  FAIL  /api/health                  schema      $health"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "smoke: all good" || echo "smoke: FAILURES above"
exit "$fail"
