import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const workerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const projectRoot = path.resolve(workerRoot, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(workerRoot, '.env') });
