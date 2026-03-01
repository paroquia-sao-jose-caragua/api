ALTER TABLE users
ADD COLUMN name VARCHAR(255);

INSERT INTO migrations (id, name, description, author) 
VALUES (2, '0002-alter-table-users', 'Alter users table, add name column', 'Giselle Hoekveld Silva')
ON CONFLICT(id) DO NOTHING;