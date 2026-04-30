CREATE TABLE "oidc_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"client_secret" varchar(256) NOT NULL,
	"name" varchar(100) NOT NULL,
	"redirect_uris" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "oidc_clients_client_id_unique" UNIQUE("client_id")
);
