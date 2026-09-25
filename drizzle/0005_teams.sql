ALTER TABLE "group_members" ADD COLUMN "shares_progress" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "study_groups" ADD COLUMN "focus" text;