// PLACEHOLDER smoke test. Real tests are OpenCode's job (see
// docs/plans/2026-10-14-tdd-and-e2e-strategy.md). It keeps scripts/test.sh from passing
// with zero tests and proves node:sqlite works on the runner (Node 22.13+).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

test('node:sqlite is available and opens an in-memory database', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT)');
  db.prepare('INSERT INTO t (v) VALUES (?)').run('ok');
  const row = db.prepare('SELECT v FROM t WHERE id = 1').get();
  assert.equal(row.v, 'ok');
  db.close();
});

test('Node is 22.13 or newer', () => {
  const [major, minor] = process.versions.node.split('.').map(Number);
  assert.ok(major > 22 || (major === 22 && minor >= 13), `Node ${process.versions.node} < 22.13`);
});
