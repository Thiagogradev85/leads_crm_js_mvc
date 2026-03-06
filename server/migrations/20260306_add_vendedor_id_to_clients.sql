DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'vendedor_id'
    ) THEN
        ALTER TABLE clients ADD COLUMN vendedor_id INTEGER REFERENCES sellers(id);
    END IF;
END $$;
