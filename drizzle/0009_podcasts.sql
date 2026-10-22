ALTER TABLE "channel_videos" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "channel_videos" ADD COLUMN "media_type" text;--> statement-breakpoint
ALTER TABLE "channel_videos" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
ALTER TABLE "channel_videos" ADD COLUMN "transcript_url" text;--> statement-breakpoint
ALTER TABLE "channel_videos" ADD COLUMN "transcript_type" text;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "kind" text DEFAULT 'youtube' NOT NULL;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "feed_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "spoken" text;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "image_url" text;--> statement-breakpoint
-- Channels followed before feeds had a kind are YouTube channels, and their
-- feed is the one the sweep always read. Written here rather than derived at
-- read time, so a row never has an empty feed again.
UPDATE "channels" SET "feed_url" = 'https://www.youtube.com/feeds/videos.xml?channel_id=' || "id" WHERE "kind" = 'youtube' AND "feed_url" = '';
