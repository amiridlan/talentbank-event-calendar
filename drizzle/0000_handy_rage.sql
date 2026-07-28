-- Enable btree_gist extension for date range exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE TYPE "public"."change_type" AS ENUM('created', 'updated', 'postponed', 'cancelled', 'restored', 'capacity_updated', 'date_changed');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'scheduled', 'postponed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('campus', 'sector', 'public', 'awards');--> statement-breakpoint
CREATE TYPE "public"."malaysian_state" AS ENUM('johor', 'kedah', 'kelantan', 'kuala_lumpur', 'labuan', 'melaka', 'negeri_sembilan', 'pahang', 'penang', 'perak', 'perlis', 'putrajaya', 'sabah', 'sarawak', 'selangor', 'terengganu', 'klang_valley');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'confirmed', 'waitlisted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."registration_type" AS ENUM('candidate', 'employer');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"event_type" "event_type" NOT NULL,
	"region" "malaysian_state" NOT NULL,
	"venue_name" varchar(255),
	"venue_address" text,
	"venue_id" varchar(100),
	"external_url" varchar(500),
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"candidate_capacity" integer,
	"candidate_registered" integer DEFAULT 0,
	"employer_capacity" integer,
	"employer_registered" integer DEFAULT 0,
	"cancellation_reason" text,
	"cancelled_at" timestamp with time zone,
	"postponed_from_date" date,
	"moved_from_event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(255),
	"updated_by" varchar(255),
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	CONSTRAINT "events_slug_unique" UNIQUE("slug"),
	CONSTRAINT "valid_date_range" CHECK ("events"."end_date" >= "events"."start_date")
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"category" varchar(50),
	"raw_aliases" text[],
	CONSTRAINT "fields_name_unique" UNIQUE("name"),
	CONSTRAINT "fields_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_fields" (
	"event_id" uuid NOT NULL,
	"field_id" integer NOT NULL,
	CONSTRAINT "event_fields_event_id_field_id_pk" PRIMARY KEY("event_id","field_id")
);
--> statement-breakpoint
CREATE TABLE "event_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"change_type" "change_type" NOT NULL,
	"field_changed" varchar(100),
	"old_value" text,
	"new_value" text,
	"reason" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"changed_by" varchar(255),
	"is_public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"registration_type" "registration_type" NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"organization" varchar(255),
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"consent_marketing" boolean DEFAULT false NOT NULL,
	"consent_data_processing" boolean NOT NULL,
	"consented_at" timestamp with time zone,
	"waitlisted_at" timestamp with time zone,
	"promoted_from_waitlist_at" timestamp with time zone,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	"booth_count" integer,
	CONSTRAINT "unique_registration" UNIQUE("event_id","email","registration_type")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_moved_from_event_id_events_id_fk" FOREIGN KEY ("moved_from_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_fields" ADD CONSTRAINT "event_fields_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_fields" ADD CONSTRAINT "event_fields_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_changes" ADD CONSTRAINT "event_changes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_events_dates" ON "events" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_events_region" ON "events" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_events_status" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_events_slug" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_event_fields_event" ON "event_fields" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_fields_field" ON "event_fields" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "idx_event_changes_event" ON "event_changes" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_changes_date" ON "event_changes" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_registrations_event" ON "registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_registrations_email" ON "registrations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_registrations_status" ON "registrations" USING btree ("status");--> statement-breakpoint
-- Exclusion constraint: prevent venue clashes (same venue + overlapping dates)
-- Only applies to non-cancelled, non-draft events with a venue_id
ALTER TABLE "events" ADD CONSTRAINT "no_venue_clash"
  EXCLUDE USING gist (
    "venue_id" WITH =,
    daterange("start_date", "end_date", '[]') WITH &&
  )
  WHERE ("venue_id" IS NOT NULL AND "status" NOT IN ('cancelled', 'draft'));