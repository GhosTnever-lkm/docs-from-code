import { readFile } from 'node:fs/promises';
import process from 'node:process';

const tag = process.argv[2];
if (!tag) {
  console.error('Usage: node scripts/validate-release-tag.mjs <tag>');
  process.exitCode = 2;
} else {
  const version = (await readFile(new URL('../VERSION', import.meta.url), 'utf8')).trim();
  const expectedTag = `v${version}`;

  if (tag !== expectedTag) {
    console.error(`Release tag ${tag} does not match VERSION ${version}; expected ${expectedTag}.`);
    process.exitCode = 1;
  } else {
    console.log(`Release tag ${tag} matches VERSION ${version}.`);
  }
}
