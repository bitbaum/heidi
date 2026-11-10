CREATE TABLE "mail_preferences" (
	"actor_id" text PRIMARY KEY NOT NULL,
	"reminders" boolean DEFAULT false NOT NULL,
	"tz" text,
	"last_reminder_at" timestamp with time zone,
	"ignored" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
