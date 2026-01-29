// Copy canonical Postgres schema over schema.prisma so build always uses Postgres client.
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'prisma', 'schema.postgres.prisma');
const dest = path.join(__dirname, '..', 'prisma', 'schema.prisma');
fs.copyFileSync(src, dest);
console.log('copy-postgres-schema: copied schema.postgres.prisma -> schema.prisma');
