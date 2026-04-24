ALTER TABLE usuarios
    ADD password_reset_token VARCHAR2(255);
ALTER TABLE usuarios
    ADD password_reset_token_expiry TIMESTAMP;
