/**
 * On Railway (or when DATABASE_URL is Postgres), ensure prisma/schema.prisma
 * uses provider = "postgresql" so prisma generate and the app use the correct client.
 * Runs when DATABASE_URL starts with "postgres" OR when RAILWAY_ENVIRONMENT is set
 * (Railway sets this at build time even if DATABASE_URL is only available at runtime).
 */
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const usePostgres = (dbUrl && dbUrl.startsWith('postgres')) || isRailway;

if (!usePostgres) {
  process.exit(0);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

if (content.includes('provider = "sqlite"')) {
  content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content);
  console.log('ensure-postgres-schema: set provider to postgresql (Railway/Postgres build)');
}
