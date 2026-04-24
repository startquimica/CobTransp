ALTER TABLE tenants ADD api_key VARCHAR2(64);

UPDATE tenants SET api_key = RAWTOHEX(SYS_GUID()) WHERE api_key IS NULL;

ALTER TABLE tenants MODIFY api_key NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT tenants_api_key_unique UNIQUE (api_key);
