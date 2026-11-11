import { conventionalFrom, mailHealth, type MailHealth } from "@bitbaum/mail-kit";
import { ASSISTANT_NAME } from "../config/site.ts";

/**
 * Who Heidi's mail says it is from.
 *
 * It was a mailbox on `fleetcrown.orangecat.ch`. FleetCrown is a name the fleet
 * retired, and it is the first thing a new learner reads above "confirm your
 * email". But a sender is not a string to tidy up: mail from a domain the
 * sending account has not verified (DKIM, SPF) is refused outright, and a
 * sign-in link that never arrives is far worse than one with an old name on
 * it. So the sender is never switched on faith.
 *
 * Heidi asks the mail service which domains THIS deployment's key may send
 * from, and uses the first of its own that is verified:
 *
 *   heidi.orangecat.ch   Heidi's own host. Has no sending records in DNS yet.
 *   orangecat.ch         the apex. Has sending records; whether this
 *                        deployment's key owns them is what the probe answers.
 *
 * While neither is verified for this key, nothing changes and mail keeps
 * going out through the fleet's shared sender, the one path known to deliver.
 * The moment one of them is verified, the next mail uses it, with no deploy.
 * `RESEND_FROM` in the environment still wins over all of it.
 *
 * `/api/health` reports the same answer (`mail`), so which sender is in use
 * and why can be read from outside instead of guessed.
 */
export const HEIDI_SENDER_DOMAINS = ["heidi.orangecat.ch", "orangecat.ch"] as const;

const MAILBOX = "heidi";
const TTL_MS = 10 * 60_000;

type Env = Record<string, string | undefined>;
type Probe = (options: { env: Env; timeoutMs: number }) => Promise<MailHealth>;

export type SenderReport =
  /** No usable mail key: nothing is sent at all. */
  | { state: "unconfigured" }
  /** The mail service could not be asked; the shared sender is used meanwhile. */
  | { state: "unknown"; from: string }
  | {
      state: "own" | "shared" | "pinned";
      /** The From line in use. */
      from: string;
      /** Every domain the key knows, with the service's own status word. */
      domains: { name: string; status: string }[];
    };

/** The first of Heidi's own domains this key has verified, as a From line. */
export function ownSender(health: MailHealth): string | null {
  if (!health.ok) return null;
  const verified = new Set((health.domains ?? []).filter((d) => d.status === "verified").map((d) => d.name.toLowerCase()));
  const domain = HEIDI_SENDER_DOMAINS.find((d) => verified.has(d));
  return domain ? `${ASSISTANT_NAME} <${MAILBOX}@${domain}>` : null;
}

export function createSender(probe: Probe = (options) => mailHealth(options), now: () => number = Date.now) {
  let last: { at: number; health: MailHealth } | null = null;
  let pending: Promise<MailHealth> | null = null;

  function refresh(env: Env): Promise<MailHealth> {
    pending ??= probe({ env, timeoutMs: 5000 })
      .catch((): MailHealth => ({ ok: false, error: "probe failed" }))
      .then((health) => {
        // A failed probe never replaces a good answer: a blip at the mail
        // service must not flip the sender back and forth.
        if (health.ok || !last?.health.ok) last = { at: now(), health };
        else last = { at: now(), health: last.health };
        pending = null;
        return last.health;
      });
    return pending;
  }

  return {
    /**
     * The From line to use right now, or undefined to leave the package's
     * default. Synchronous, because the mailer reads its environment that
     * way: it answers from the last probe and starts a new one when that is
     * stale. Before the first probe has answered it is undefined, so anything
     * that is about to send awaits `resolve` first.
     */
    from(env: Env = process.env): string | undefined {
      if (env.RESEND_FROM || !env.RESEND_API_KEY) return undefined;
      if (!last || now() - last.at > TTL_MS) void refresh(env);
      return last ? (ownSender(last.health) ?? undefined) : undefined;
    },

    /**
     * The same answer, awaited: asks the mail service first when there is no
     * answer yet or the last one is stale. This is what a mail about to be
     * sent calls. `from` alone answered "leave the default" to the first mail
     * of every server process, because nothing had asked yet: `/api/health`
     * named the own domain while the sign-in link still went out from
     * the shared sender (seen on production, 11 November 2026).
     */
    async resolve(env: Env = process.env): Promise<string | undefined> {
      if (env.RESEND_FROM || !env.RESEND_API_KEY) return undefined;
      const health = !last || now() - last.at > TTL_MS ? await refresh(env) : last.health;
      return ownSender(health) ?? undefined;
    },

    /** The same answer, awaited and explained, for `/api/health`. */
    async report(env: Env = process.env): Promise<SenderReport> {
      if (!env.RESEND_API_KEY) return { state: "unconfigured" };
      const health = !last || now() - last.at > TTL_MS ? await refresh(env) : last.health;
      const shared = conventionalFrom(ASSISTANT_NAME);
      if (!health.ok) return { state: "unknown", from: env.RESEND_FROM || shared };
      const domains = health.domains ?? [];
      if (env.RESEND_FROM) return { state: "pinned", from: env.RESEND_FROM, domains };
      const own = ownSender(health);
      return own ? { state: "own", from: own, domains } : { state: "shared", from: shared, domains };
    },
  };
}

/**
 * One per server process, not one per bundle: the health route and the auth
 * route are built separately, and two copies of this module would each keep
 * their own answer.
 */
const SLOT = Symbol.for("heidi.mail.sender");
const shared = globalThis as { [SLOT]?: ReturnType<typeof createSender> };
export const sender = (shared[SLOT] ??= createSender());
