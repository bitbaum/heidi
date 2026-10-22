CREATE TABLE "channel_follows" (
	"actor_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"followed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seen_at" timestamp with time zone,
	CONSTRAINT "channel_follows_actor_id_channel_id_pk" PRIMARY KEY("actor_id","channel_id")
);
--> statement-breakpoint
CREATE TABLE "channel_videos" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"title" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"thumbnail_url" text,
	"description" text,
	"transcript" jsonb,
	"transcript_state" text DEFAULT 'unknown' NOT NULL,
	"questions" jsonb,
	"notified_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"url" text NOT NULL,
	"checked_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"locale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channel_follows" ADD CONSTRAINT "channel_follows_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_videos" ADD CONSTRAINT "channel_videos_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_follows_channel_idx" ON "channel_follows" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "channel_videos_channel_published_idx" ON "channel_videos" USING btree ("channel_id","published_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_actor_idx" ON "push_subscriptions" USING btree ("actor_id");