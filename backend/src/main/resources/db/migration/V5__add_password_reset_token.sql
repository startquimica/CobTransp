ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS password_reset_token_expiry TIMESTAMP;
