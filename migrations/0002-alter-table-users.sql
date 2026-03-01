ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL;

INSERT INTO migrations (id, name, description, author) 
VALUES (2, '0002-alter-table-users', 'Alter users table, add name column', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;