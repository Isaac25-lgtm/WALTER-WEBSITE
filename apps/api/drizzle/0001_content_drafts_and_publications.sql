CREATE TYPE "public"."content_publication_source" AS ENUM('canonical', 'draft');--> statement-breakpoint
CREATE TYPE "public"."content_publication_status" AS ENUM('prepared');--> statement-breakpoint
CREATE TABLE "content_drafts" (
	"key" varchar(128) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"updated_by_subject" varchar(128) NOT NULL,
	CONSTRAINT "content_drafts_version_positive" CHECK ("content_drafts"."version" > 0),
	CONSTRAINT "content_drafts_value_text" CHECK (jsonb_typeof("content_drafts"."value") = 'object' AND "content_drafts"."value" ? 'text' AND jsonb_typeof("content_drafts"."value" -> 'text') = 'string' AND char_length("content_drafts"."value" ->> 'text') > 0)
);
--> statement-breakpoint
CREATE TABLE "content_publication_entries" (
	"publication_id" uuid NOT NULL,
	"key" varchar(128) NOT NULL,
	"value" text NOT NULL,
	"source" "content_publication_source" NOT NULL,
	"source_draft_version" integer,
	CONSTRAINT "content_publication_entries_pk" PRIMARY KEY("publication_id","key"),
	CONSTRAINT "content_publication_entries_source_version" CHECK (("content_publication_entries"."source" = 'canonical' AND "content_publication_entries"."source_draft_version" IS NULL) OR ("content_publication_entries"."source" = 'draft' AND "content_publication_entries"."source_draft_version" > 0))
);
--> statement-breakpoint
CREATE TABLE "content_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "content_publication_status" DEFAULT 'prepared' NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"entry_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_subject" varchar(128) NOT NULL,
	CONSTRAINT "content_publications_status_prepared" CHECK ("content_publications"."status" = 'prepared'),
	CONSTRAINT "content_publications_entry_count_positive" CHECK ("content_publications"."entry_count" > 0),
	CONSTRAINT "content_publications_hash_sha256" CHECK ("content_publications"."content_hash" ~ '^[a-f0-9]{64}$')
);
--> statement-breakpoint
ALTER TABLE "content_publication_entries" ADD CONSTRAINT "content_publication_entries_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."content_publications"("id") ON DELETE no action ON UPDATE no action;