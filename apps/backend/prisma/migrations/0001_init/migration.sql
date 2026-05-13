-- 0001_init — initial schema for the auth UoW
-- See aidlc-docs/construction/auth/functional-design/domain-entities.md

CREATE TABLE "users" (
  "id"                       UUID PRIMARY KEY,
  "email"                    TEXT NOT NULL UNIQUE,
  "display_name"             TEXT NOT NULL,
  "password_hash"            TEXT NOT NULL,
  "timezone"                 TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "verified"                 BOOLEAN NOT NULL DEFAULT true,
  "account_setup_completed"  BOOLEAN NOT NULL DEFAULT false,
  "created_at"               TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "refresh_tokens" (
  "id"            UUID PRIMARY KEY,
  "user_id"       UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "family_id"     UUID NOT NULL,
  "token_hash"    TEXT NOT NULL UNIQUE,
  "parent_id"     UUID REFERENCES "refresh_tokens"("id"),
  "rotated_at"    TIMESTAMPTZ,
  "revoked"       BOOLEAN NOT NULL DEFAULT false,
  "expires_at"    TIMESTAMPTZ NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "refresh_tokens_user_family_idx" ON "refresh_tokens" ("user_id", "family_id");
