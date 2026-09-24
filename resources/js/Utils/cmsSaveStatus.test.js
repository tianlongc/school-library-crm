import assert from 'node:assert/strict';
import test from 'node:test';

import { getCmsSaveStatus } from './cmsSaveStatus.js';

test('never reports saved while a different draft is queued', () => {
    assert.equal(getCmsSaveStatus({ current: 'A', saved: 'A', saving: 'B', error: false }), 'pending');
    assert.equal(getCmsSaveStatus({ current: 'C', saved: 'A', saving: 'B', error: false }), 'pending');
    assert.equal(getCmsSaveStatus({ current: 'B', saved: 'A', saving: 'B', error: false }), 'saving');
});

test('reports saved and failed current drafts accurately', () => {
    assert.equal(getCmsSaveStatus({ current: 'B', saved: 'B', saving: null, error: false }), 'saved');
    assert.equal(getCmsSaveStatus({ current: 'B', saved: 'A', saving: null, error: true }), 'error');
});
