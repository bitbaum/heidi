import { test } from "node:test";
import assert from "node:assert/strict";
import { canRead, visibleMessages } from "threadkit";
import {
  activeMembers,
  checkBody,
  checkName,
  groupThread,
  isActiveMember,
  mayInvite,
  mayJoin,
  mayPost,
} from "./rules.ts";
import { looksLikeToken, newInviteToken, tokensMatch } from "./invite.ts";
import { HEIDI_ID, MAX_MEMBERS } from "./types.ts";

const GROUP = { id: "g1", createdBy: "alice", createdAt: "2026-01-01T00:00:00.000Z" };

const member = (actorId: string, joinedAt = "2026-01-01T00:00:00.000Z", leftAt?: string) => ({
  actorId,
  displayName: actorId,
  joinedAt,
  ...(leftAt ? { leftAt } : {}),
});

test("someone who left is not a member any more", () => {
  const members = [member("alice"), member("bob", "2026-01-02T00:00:00.000Z", "2026-02-01T00:00:00.000Z")];
  assert.equal(isActiveMember(members, "alice"), true);
  assert.equal(isActiveMember(members, "bob"), false);
  assert.equal(mayPost(members, "bob"), false, "a departed member cannot post");
  assert.equal(activeMembers(members).length, 1);
});

test("a stranger cannot post", () => {
  assert.equal(mayPost([member("alice")], "mallory"), false);
});

test("only the organiser may hand out the link", () => {
  assert.equal(mayInvite(GROUP.createdBy, "alice"), true);
  assert.equal(mayInvite(GROUP.createdBy, "bob"), false, "a member is not an inviter");
});

test("a full group refuses the next joiner", () => {
  const members = Array.from({ length: MAX_MEMBERS }, (_, i) => member(`m${i}`));
  const verdict = mayJoin(members, "latecomer");
  assert.deepEqual(verdict, { ok: false, reason: "group-full" });
});

test("a departure frees a seat", () => {
  const members = [
    ...Array.from({ length: MAX_MEMBERS - 1 }, (_, i) => member(`m${i}`)),
    member("gone", "2026-01-01T00:00:00.000Z", "2026-02-01T00:00:00.000Z"),
  ];
  assert.deepEqual(mayJoin(members, "newcomer"), { ok: true });
});

test("opening the invite link twice is reported, not treated as success", () => {
  // The route needs to know to skip the insert; the PERSON should still land
  // in the group rather than read an error.
  assert.deepEqual(mayJoin([member("alice")], "alice"), { ok: false, reason: "already-member" });
});

test("names are trimmed and collapsed, and cannot be blank", () => {
  assert.deepEqual(checkName("  Züri   Mittwoch  "), { ok: true, name: "Züri Mittwoch" });
  assert.deepEqual(checkName("   "), { ok: false, problem: "empty" });
  assert.equal(checkName("x".repeat(200)).ok, false);
});

test("a message must say something and cannot be a file", () => {
  assert.deepEqual(checkBody("  hoi  "), { ok: true, body: "hoi" });
  assert.deepEqual(checkBody("\n\n"), { ok: false, problem: "empty" });
  assert.equal(checkBody("x".repeat(5000)).ok, false);
});

test("Heidi is a participant in every group without being a member row", () => {
  const thread = groupThread(GROUP, [member("alice")]);
  const heidi = thread.participants.find((p) => p.actorId === HEIDI_ID);
  assert.ok(heidi, "Heidi must be in the thread");
  assert.equal(heidi?.kind, "ai");
});

test("a member who joined late cannot read what was said before they arrived", () => {
  // The property being bought from threadkit. Inviting someone into an
  // ongoing conversation must not hand them its back catalogue.
  const thread = groupThread(GROUP, [member("alice"), member("bob", "2026-06-01T00:00:00.000Z")]);
  const messages = [
    { id: "m1", threadId: "g1", authorId: "alice", body: "before bob", createdAt: new Date("2026-03-01T00:00:00.000Z") },
    { id: "m2", threadId: "g1", authorId: "alice", body: "after bob", createdAt: new Date("2026-07-01T00:00:00.000Z") },
  ];
  const forBob = visibleMessages(thread, "bob", messages).map((m) => m.body);
  assert.deepEqual(forBob, ["after bob"]);

  // The organiser sees everything, because there was nothing before her.
  const forAlice = visibleMessages(thread, "alice", messages).map((m) => m.body);
  assert.deepEqual(forAlice, ["before bob", "after bob"]);
});

test("Heidi can read the thread, so a follow-up about an old line works", () => {
  const thread = groupThread(GROUP, [member("alice")]);
  assert.equal(canRead(thread, HEIDI_ID), true);
});

test("a non-participant can read nothing", () => {
  const thread = groupThread(GROUP, [member("alice")]);
  assert.equal(canRead(thread, "mallory"), false);
  // And a departed member loses their voice but the thread still knows them.
  const left = groupThread(GROUP, [member("alice"), member("bob", "2026-01-02T00:00:00.000Z", "2026-02-01T00:00:00.000Z")]);
  assert.equal(canRead(left, "bob"), false);
});

test("invite tokens are unguessable, url-safe and distinct", () => {
  const a = newInviteToken();
  const b = newInviteToken();
  assert.notEqual(a, b);
  assert.ok(looksLikeToken(a), `${a} should look like a token`);
  assert.equal(a, encodeURIComponent(a), "must survive a URL without escaping");
  // 24 bytes of base64url.
  assert.ok(a.length >= 32, `token too short: ${a.length}`);
});

test("rubbish is refused before it reaches the database", () => {
  assert.equal(looksLikeToken("'; drop table study_groups; --"), false);
  assert.equal(looksLikeToken("../../etc/passwd"), false);
  assert.equal(looksLikeToken(""), false);
  assert.equal(looksLikeToken(null), false);
  assert.equal(looksLikeToken("x".repeat(5000)), false);
});

test("token comparison handles unequal lengths without throwing", () => {
  // `timingSafeEqual` throws on a length mismatch; that must not reach a route.
  assert.equal(tokensMatch("short", "a-much-longer-token"), false);
  const t = newInviteToken();
  assert.equal(tokensMatch(t, t), true);
});
