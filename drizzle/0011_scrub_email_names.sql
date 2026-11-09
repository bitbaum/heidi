-- Names other people see were rebuilt from the email when an account had no
-- name (lib/domain/actor.ts, `publicName`), and the speaking-topics board is
-- readable signed out. Write the same handle `publicName` now gives — "#" and
-- the last four characters of the actor id, upper-cased — over every stored
-- name that is an email address. Forward-only and idempotent: a handle does
-- not match the pattern, so a second run changes nothing.
UPDATE "speaking_topics" SET "proposer_name" = '#' || upper(right("proposed_by", 4))
  WHERE "proposer_name" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
--> statement-breakpoint
UPDATE "speaking_rounds" SET "host_name" = '#' || upper(right("host_id", 4))
  WHERE "host_name" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
--> statement-breakpoint
UPDATE "round_attendance" SET "display_name" = '#' || upper(right("actor_id", 4))
  WHERE "display_name" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
--> statement-breakpoint
UPDATE "group_members" SET "display_name" = '#' || upper(right("actor_id", 4))
  WHERE "display_name" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
