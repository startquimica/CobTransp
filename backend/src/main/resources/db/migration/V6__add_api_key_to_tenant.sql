ALTER TABLE tenants ADD COLUMN api_key VARCHAR(64);

UPDATE tenants SET api_key = gen_random_uuid()::text WHERE api_key IS NULL;

ALTER TABLE tenants ALTER COLUMN api_key SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT tenants_api_key_unique UNIQUE (api_key);
