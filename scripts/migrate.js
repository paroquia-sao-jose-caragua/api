import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const DB_NAME = 'parish-db-dev';
const IS_LOCAL = process.argv.includes('--local');

// Get all migration files
const getMigrationFiles = () => {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
};

// Get applied migrations from the database
const getAppliedMigrations = () => {
  try {
    const query = 'SELECT name FROM migrations ORDER BY applied_at;';
    const flags = IS_LOCAL ? ['--local'] : [];
    const command = `npx wrangler d1 execute ${DB_NAME} ${flags.join(' ')} --command "${query}"`;

    const result = execSync(command, { encoding: 'utf-8' });

    // Parse the output to extract migration names
    const lines = result.split('\n');
    const migrations = [];

    for (const line of lines) {
      const match = line.match(/│\s*(\d{4}-[^│]+\.sql)/);
      if (match) {
        migrations.push(match[1]);
      }
    }

    return migrations;
  } catch (error) {
    console.log(
      'No migrations table found yet, will create it during migration.',
    );
    return [];
  }
};

// Execute a migration file
const executeMigration = (filePath) => {
  const fileName = path.basename(filePath);
  console.log(`\n📝 Running migration: ${fileName}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    const flags = IS_LOCAL ? ['--local'] : [];
    const command = `wrangler d1 execute ${DB_NAME} ${flags.join(' ')} --file "${filePath}"`;

    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Migration applied: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration ${fileName}:`, error.message);
    return false;
  }
};

// Main function
const runMigrations = () => {
  console.log('🔍 Checking for pending migrations...\n');

  const allMigrations = getMigrationFiles();
  const appliedMigrations = getAppliedMigrations();

  if (allMigrations.length === 0) {
    console.log('❌ No migration files found in migrations/ directory');
    process.exit(1);
  }

  const pendingMigrations = allMigrations.filter(
    (migration) => !appliedMigrations.includes(migration),
  );

  if (pendingMigrations.length === 0) {
    console.log('✅ All migrations are already applied!');
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migration(s):\n`);
  for (const migration of pendingMigrations) {
    console.log(`  - ${migration}`);
  }

  console.log('\n▶️  Applying pending migrations...');

  //   let failedCount = 0;
  //   for (const migration of pendingMigrations) {
  //     const filePath = path.join(MIGRATIONS_DIR, migration);
  //     if (!executeMigration(filePath)) {
  //       failedCount++;
  //     }
  //   }

  console.log('\n ='.repeat(50));

  if (failedCount === 0) {
    console.log(
      `✅ All ${pendingMigrations.length} migration(s) applied successfully!`,
    );
  } else {
    console.log(
      `❌ ${failedCount} migration(s) failed out of ${pendingMigrations.length}`,
    );
    process.exit(1);
  }
};

runMigrations();
