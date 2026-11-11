CREATE TABLE "entitlements" (
	"actor_id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pay_checkouts" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"provider" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"invoice" text,
	"pay_url" text,
	"handle" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "pay_checkouts_actor_idx" ON "pay_checkouts" USING btree ("actor_id","created_at");