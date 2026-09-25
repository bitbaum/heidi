CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"scene_id" text NOT NULL,
	"askable" integer NOT NULL,
	"held" integer NOT NULL,
	"stuck" integer NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_devices" (
	"actor_id" text NOT NULL,
	"device_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "progress_devices_actor_id_device_id_key_pk" PRIMARY KEY("actor_id","device_id","key")
);
--> statement-breakpoint
CREATE INDEX "certificates_actor_scene_idx" ON "certificates" USING btree ("actor_id","scene_id");