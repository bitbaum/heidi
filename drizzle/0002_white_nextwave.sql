CREATE TABLE "round_attendance" (
	"round_id" uuid NOT NULL,
	"actor_id" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "round_attendance_round_id_actor_id_pk" PRIMARY KEY("round_id","actor_id")
);
--> statement-breakpoint
CREATE TABLE "speaking_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid,
	"title" text NOT NULL,
	"format" text NOT NULL,
	"host_id" text NOT NULL,
	"host_name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"cadence" text NOT NULL,
	"time_zone" text NOT NULL,
	"meeting_url" text,
	"capacity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "speaking_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"pitch" text NOT NULL,
	"proposed_by" text NOT NULL,
	"proposer_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_interest" (
	"topic_id" uuid NOT NULL,
	"actor_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topic_interest_topic_id_actor_id_pk" PRIMARY KEY("topic_id","actor_id")
);
--> statement-breakpoint
ALTER TABLE "round_attendance" ADD CONSTRAINT "round_attendance_round_id_speaking_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."speaking_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_rounds" ADD CONSTRAINT "speaking_rounds_topic_id_speaking_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."speaking_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_interest" ADD CONSTRAINT "topic_interest_topic_id_speaking_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."speaking_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "round_attendance_actor_idx" ON "round_attendance" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "speaking_rounds_starts_idx" ON "speaking_rounds" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "speaking_topics_created_idx" ON "speaking_topics" USING btree ("created_at");