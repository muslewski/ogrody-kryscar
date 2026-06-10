import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_visits_status" AS ENUM('planned', 'done', 'cancelled');
  ALTER TYPE "public"."enum_service_requests_status" ADD VALUE 'accepted' BEFORE 'cancelled';
  ALTER TYPE "public"."enum_service_requests_status" ADD VALUE 'declined' BEFORE 'cancelled';
  ALTER TYPE "public"."enum_service_requests_status" ADD VALUE 'done';
  CREATE TABLE "visits" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"request_id" uuid NOT NULL,
  	"lawn_id" uuid NOT NULL,
  	"customer_id" uuid NOT NULL,
  	"scheduled_at" timestamp(3) with time zone NOT NULL,
  	"assignee_id" uuid,
  	"status" "enum_visits_status" DEFAULT 'planned' NOT NULL,
  	"note" varchar,
  	"tenant_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"user_id" uuid NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"services_find" boolean DEFAULT false,
  	"services_create" boolean DEFAULT false,
  	"services_update" boolean DEFAULT false,
  	"services_delete" boolean DEFAULT false,
  	"service_requests_find" boolean DEFAULT false,
  	"service_requests_create" boolean DEFAULT false,
  	"service_requests_update" boolean DEFAULT false,
  	"service_requests_delete" boolean DEFAULT false,
  	"lawns_find" boolean DEFAULT false,
  	"lawns_create" boolean DEFAULT false,
  	"lawns_update" boolean DEFAULT false,
  	"lawns_delete" boolean DEFAULT false,
  	"visits_find" boolean DEFAULT false,
  	"visits_create" boolean DEFAULT false,
  	"visits_update" boolean DEFAULT false,
  	"visits_delete" boolean DEFAULT false,
  	"tenants_find" boolean DEFAULT false,
  	"tenants_create" boolean DEFAULT false,
  	"tenants_update" boolean DEFAULT false,
  	"tenants_delete" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  ALTER TABLE "service_requests" ADD COLUMN "decline_reason" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "visits_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" uuid;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" uuid;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_request_id_service_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_lawn_id_lawns_id_fk" FOREIGN KEY ("lawn_id") REFERENCES "public"."lawns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_admins_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "visits_request_idx" ON "visits" USING btree ("request_id");
  CREATE INDEX "visits_lawn_idx" ON "visits" USING btree ("lawn_id");
  CREATE INDEX "visits_customer_idx" ON "visits" USING btree ("customer_id");
  CREATE INDEX "visits_scheduled_at_idx" ON "visits" USING btree ("scheduled_at");
  CREATE INDEX "visits_assignee_idx" ON "visits" USING btree ("assignee_id");
  CREATE INDEX "visits_tenant_idx" ON "visits" USING btree ("tenant_id");
  CREATE INDEX "visits_updated_at_idx" ON "visits" USING btree ("updated_at");
  CREATE INDEX "visits_created_at_idx" ON "visits" USING btree ("created_at");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visits_fk" FOREIGN KEY ("visits_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_visits_id_idx" ON "payload_locked_documents_rels" USING btree ("visits_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "visits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_mcp_api_keys" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "visits" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_visits_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";
  
  ALTER TABLE "service_requests" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "service_requests" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_service_requests_status";
  CREATE TYPE "public"."enum_service_requests_status" AS ENUM('draft', 'new', 'cancelled');
  ALTER TABLE "service_requests" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_service_requests_status";
  ALTER TABLE "service_requests" ALTER COLUMN "status" SET DATA TYPE "public"."enum_service_requests_status" USING "status"::"public"."enum_service_requests_status";
  DROP INDEX "payload_locked_documents_rels_visits_id_idx";
  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "service_requests" DROP COLUMN "decline_reason";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "visits_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";
  DROP TYPE "public"."enum_visits_status";`)
}
