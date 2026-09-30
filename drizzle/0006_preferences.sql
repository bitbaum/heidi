CREATE TABLE "preferences" (
	"actor_id" text PRIMARY KEY NOT NULL,
	"locale" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
