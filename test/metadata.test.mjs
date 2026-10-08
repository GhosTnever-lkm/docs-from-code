import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const readRepoFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('portable and Codex compatibility manifests stay aligned', async () => {
  const portable = await readJson('../plugin.json');
  const codex = await readJson('../.codex-plugin/plugin.json');

  assert.equal(portable.name, 'docs-from-code');
  assert.equal(portable.version, codex.version);
  assert.equal(portable.license, 'MIT');
  assert.equal(codex.license, portable.license);
  assert.deepEqual(codex.skills, ['./skills/docs-from-code']);
  assert.ok(portable.extensions['com.openai']);
  assert.ok(portable.extensions['com.openai'].interface.shortDescription.length <= 30);
});

test('version, package metadata, changelog, and README agree', async () => {
  const [version, packageJson, changelog, readme] = await Promise.all([
    readRepoFile('VERSION'), readJson('../package.json'), readRepoFile('CHANGELOG.md'), readRepoFile('README.md'),
  ]);
  const expectedVersion = '1.0.0';

  assert.equal(version.trim(), expectedVersion);
  assert.equal(packageJson.version, expectedVersion);
  assert.match(changelog, new RegExp(`^## ${expectedVersion.replaceAll('.', '\\.')} —`, 'm'));
  assert.match(readme, new RegExp(`Current version: ${expectedVersion.replaceAll('.', '\\.')}`));
  assert.match(readme, /codex plugin marketplace add GhosTnever-lkm\/docs-from-code/);
  assert.match(readme, /codex plugin add docs-from-code --marketplace docs-from-code/);
  assert.match(readme, /Support \/ Pro Version/);
});

test('skill front matter matches the plugin identity and includes a usage description', async () => {
  const skill = await readRepoFile('skills/docs-from-code/SKILL.md');
  const frontMatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  assert.ok(frontMatter, 'skill must start with YAML front matter');
  assert.match(frontMatter[1], /^name: docs-from-code$/m);
  assert.match(frontMatter[1], /^description: .+Use for .+$/m);
});

test('MIT license contains the standard liability clause', async () => {
  const license = await readRepoFile('LICENSE');
  assert.match(license, /IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM/);
  assert.match(license.trimEnd(), /DEALINGS IN THE SOFTWARE\.$/);
});
