import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const validate = (tag) => spawnSync(process.execPath, ['scripts/validate-release-tag.mjs', tag], { encoding: 'utf8' });

test('release tag matching VERSION is accepted', () => {
  const result = validate('v1.0.1');

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release tag v1\.0\.1 matches VERSION 1\.0\.1\./);
});

test('release tag that does not match VERSION is rejected', () => {
  const result = validate('v1.0.2');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not match VERSION 1\.0\.1; expected v1\.0\.1\./);
});

test('missing release tag is rejected with usage', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-release-tag.mjs'], { encoding: 'utf8' });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage: node scripts\/validate-release-tag\.mjs <tag>/);
});
