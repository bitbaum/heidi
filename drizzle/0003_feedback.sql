CREATE TABLE "feedback_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" text NOT NULL,
	"voter" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_stances" (
	"target_id" text NOT NULL,
	"voter" text NOT NULL,
	"stance" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_stances_target_id_voter_pk" PRIMARY KEY("target_id","voter")
);
--> statement-breakpoint
CREATE TABLE "feedback_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_support" (
	"suggestion_id" uuid NOT NULL,
	"voter" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_support_suggestion_id_voter_pk" PRIMARY KEY("suggestion_id","voter")
);
--> statement-breakpoint
ALTER TABLE "feedback_support" ADD CONSTRAINT "feedback_support_suggestion_id_feedback_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."feedback_suggestions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_comments_target_idx" ON "feedback_comments" USING btree ("target_id","created_at");