ALTER TABLE "events" ADD COLUMN "registration_open_date" date;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "registration_close_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;