CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'in_progress', 'closed');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"first_name" varchar(80) NOT NULL,
	"last_name" varchar(80) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"message" text NOT NULL,
	"attachment_object_key" varchar(512),
	"attachment_original_name" varchar(255),
	"attachment_mime_type" varchar(100),
	"attachment_byte_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiries_status_created_at_idx" ON "inquiries" USING btree ("status","created_at");
