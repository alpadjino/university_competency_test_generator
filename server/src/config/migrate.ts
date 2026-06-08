import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const runMigrations = () => {
  console.log('🔄 Применение миграций Prisma...');
  execSync('npm run db:migrate', {
    cwd: serverRoot,
    stdio: 'inherit',
  });
  console.log('✅ Миграции Prisma применены');
};
