-- Dialect podcast episodes were refused a machine transcript and stored as
-- 'none', which the page treats as final: no button, ever again. They can now
-- have a labelled Standard German RENDERING (lib/channels/transcript.ts,
-- "rendering"), so every episode with audio and no transcript is offered once
-- more. 'unknown' is the column's own default. UPDATE only, idempotent.
UPDATE "channel_videos" SET "transcript_state" = 'unknown'
  WHERE "transcript_state" = 'none' AND "transcript" IS NULL AND "media_url" IS NOT NULL;
