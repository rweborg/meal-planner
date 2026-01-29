/**
 * When DATABASE_URL is a Postgres URL (e.g. on Railway), ensure prisma/schema.prisma
 * uses provider = "postgresql" so prisma generate and the app use the correct client.
 * Fixes deployments where the repo or cache still has provider = "sqlite".
 */
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.startsWith('postgres')) {
  process.exit(0);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

if (content.includes('provider = "sqlite"')) {
  content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content);
  console.log('ensure-postgres-schema: set provider to postgresql for DATABASE_URL');
}
