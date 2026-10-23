CREATE TABLE "chat_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" text NOT NULL,
	"message_id" text NOT NULL,
	"verdict" text NOT NULL,
	"reason" text,
	"text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chat_feedback_conversation_idx" ON "chat_feedback" USING btree ("conversation_id","created_at");