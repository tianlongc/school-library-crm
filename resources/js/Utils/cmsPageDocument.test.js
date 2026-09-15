import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createCmsBlock,
    createCmsBlockId,
    duplicateCmsBlock,
    insertCmsBlockAt,
    insertCmsBlockAfter,
    moveCmsBlock,
    normalizeCmsDocument,
    toggleCmsBlockVisibility,
} from './cmsPageDocument.js';

test('creates a fallback id when randomUUID is unavailable', () => {
    assert.equal(
        createCmsBlockId({}, () => 123, () => 0.5),
        'block-123-8',
    );
});

test('normalizes malformed documents to the current schema', () => {
    assert.deepEqual(normalizeCmsDocument(null), {
        schema_version: 1,
        blocks: [],
    });

    assert.deepEqual(
        normalizeCmsDocument({
            blocks: [
                { id: 'welcome', type: 'hero', data: { heading: 'Welcome' } },
                { id: 'ignored', type: 'unknown', data: {} },
            ],
        }),
        {
            schema_version: 1,
            blocks: [
                {
                    id: 'welcome',
                    type: 'hero',
                    is_visible: true,
                    data: { heading: 'Welcome' },
                },
            ],
        },
    );
});

test('creates a new school-library block with a unique id', () => {
    const block = createCmsBlock('call_to_action', () => 'cta-1');

    assert.equal(block.id, 'cta-1');
    assert.equal(block.type, 'call_to_action');
    assert.equal(block.data.target, 'catalogue');
});

test('duplicates, inserts and moves blocks without mutating the input', () => {
    const source = {
        schema_version: 1,
        blocks: [
            createCmsBlock('hero', () => 'hero-1'),
            createCmsBlock('announcement', () => 'notice-1'),
        ],
    };
    const duplicated = duplicateCmsBlock(source, 'hero-1', () => 'hero-2');
    const inserted = insertCmsBlockAfter(
        duplicated,
        'hero-2',
        createCmsBlock('rich_text', () => 'text-1'),
    );
    const moved = moveCmsBlock(inserted, 'text-1', 0);

    assert.deepEqual(source.blocks.map(({ id }) => id), ['hero-1', 'notice-1']);
    assert.deepEqual(duplicated.blocks.map(({ id }) => id), [
        'hero-1',
        'hero-2',
        'notice-1',
    ]);
    assert.deepEqual(moved.blocks.map(({ id }) => id), [
        'text-1',
        'hero-1',
        'hero-2',
        'notice-1',
    ]);
});

test('moves a block into the requested visual insertion slot', () => {
    const source = {
        schema_version: 1,
        blocks: [
            createCmsBlock('hero', () => 'hero-1'),
            createCmsBlock('announcement', () => 'notice-1'),
            createCmsBlock('rich_text', () => 'text-1'),
        ],
    };

    const moved = moveCmsBlock(source, 'hero-1', 2);

    assert.deepEqual(moved.blocks.map(({ id }) => id), [
        'notice-1',
        'hero-1',
        'text-1',
    ]);
});

test('inserts a library block at a canvas position', () => {
    const source = {
        schema_version: 1,
        blocks: [
            createCmsBlock('hero', () => 'hero-1'),
            createCmsBlock('announcement', () => 'notice-1'),
        ],
    };

    const inserted = insertCmsBlockAt(
        source,
        createCmsBlock('rich_text', () => 'text-1'),
        1,
    );

    assert.deepEqual(source.blocks.map(({ id }) => id), ['hero-1', 'notice-1']);
    assert.deepEqual(inserted.blocks.map(({ id }) => id), [
        'hero-1',
        'text-1',
        'notice-1',
    ]);
});

test('toggles one block visibility without mutating the input', () => {
    const source = {
        schema_version: 1,
        blocks: [createCmsBlock('hero', () => 'hero-1')],
    };

    const hidden = toggleCmsBlockVisibility(source, 'hero-1');
    const visible = toggleCmsBlockVisibility(hidden, 'hero-1');

    assert.equal(source.blocks[0].is_visible, true);
    assert.equal(hidden.blocks[0].is_visible, false);
    assert.equal(visible.blocks[0].is_visible, true);
});
