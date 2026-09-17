export const CMS_SCHEMA_VERSION = 1;

export const CMS_BLOCK_TYPES = [
    'hero',
    'announcement',
    'book_collection',
    'rich_text',
    'call_to_action',
    'image',
];

export const CMS_BLOCK_DEFINITIONS = {
    hero: {
        label: 'Hero',
        description: 'A calm welcome for the student portal.',
        data: {
            eyebrow: 'School library',
            heading: 'Your library, all in one place',
            body: 'Discover books, keep track of loans and make time for your next great read.',
            media_uuid: null,
        },
    },
    announcement: {
        label: 'Announcement',
        description: 'Share an important library update.',
        data: {
            heading: 'Library announcement',
            body: 'Welcome to your school library portal.',
        },
    },
    book_collection: {
        label: 'Book collection',
        description: 'Hand-pick books for students to discover.',
        data: {
            heading: 'Featured books',
            body: 'Selected by your school library team.',
            book_ids: [],
        },
    },
    rich_text: {
        label: 'Rich text',
        description: 'Add a heading and supporting message.',
        data: {
            heading: 'Reading corner',
            body: 'Make a little room in your day for a good book.',
        },
    },
    call_to_action: {
        label: 'Call to action',
        description: 'Guide students to a safe portal destination.',
        data: {
            heading: 'Find your next book',
            body: 'Search the school catalogue and borrow when a copy is available.',
            label: 'Browse catalogue',
            target: 'catalogue',
        },
    },
    image: {
        label: 'Image',
        description: 'Add a library image with accessible alternative text.',
        data: {
            media_uuid: null,
            alt: '',
        },
    },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export function createCmsBlockId(
    cryptoProvider = globalThis.crypto,
    now = Date.now,
    random = Math.random,
) {
    if (cryptoProvider?.randomUUID) {
        return cryptoProvider.randomUUID();
    }

    return `block-${now()}-${random().toString(16).slice(2)}`;
}

const defaultIdFactory = createCmsBlockId;

export function normalizeCmsDocument(content) {
    const blocks = Array.isArray(content?.blocks)
        ? content.blocks
              .filter((block) => CMS_BLOCK_TYPES.includes(block?.type))
              .map((block) => ({
                  id: String(block.id),
                  type: block.type,
                  is_visible: block.is_visible !== false,
                  data:
                      block.data && typeof block.data === 'object'
                          ? clone(block.data)
                          : {},
              }))
        : [];

    return { schema_version: CMS_SCHEMA_VERSION, blocks };
}

export function createCmsBlock(type, idFactory = defaultIdFactory) {
    const definition = CMS_BLOCK_DEFINITIONS[type];

    if (!definition) {
        throw new Error(`Unsupported CMS block type: ${type}`);
    }

    return {
        id: idFactory(),
        type,
        is_visible: true,
        data: clone(definition.data),
    };
}

export function duplicateCmsBlock(content, blockId, idFactory = defaultIdFactory) {
    const document = normalizeCmsDocument(content);
    const sourceIndex = document.blocks.findIndex(({ id }) => id === blockId);

    if (sourceIndex === -1) {
        return document;
    }

    const duplicatedBlock = clone(document.blocks[sourceIndex]);
    duplicatedBlock.id = idFactory();
    document.blocks.splice(sourceIndex + 1, 0, duplicatedBlock);

    return document;
}

export function insertCmsBlockAfter(content, blockId, block) {
    const document = normalizeCmsDocument(content);
    const sourceIndex = document.blocks.findIndex(({ id }) => id === blockId);
    const targetIndex = sourceIndex === -1 ? document.blocks.length : sourceIndex + 1;

    return insertCmsBlockAt(document, block, targetIndex);
}

export function insertCmsBlockAt(content, block, targetIndex) {
    const document = normalizeCmsDocument(content);
    const boundedTargetIndex = Math.max(
        0,
        Math.min(targetIndex, document.blocks.length),
    );

    document.blocks.splice(boundedTargetIndex, 0, clone(block));

    return document;
}

export function toggleCmsBlockVisibility(content, blockId) {
    const document = normalizeCmsDocument(content);

    document.blocks = document.blocks.map((block) =>
        block.id === blockId
            ? { ...block, is_visible: block.is_visible === false }
            : block,
    );

    return document;
}

export function moveCmsBlock(content, blockId, targetIndex) {
    const document = normalizeCmsDocument(content);
    const sourceIndex = document.blocks.findIndex(({ id }) => id === blockId);

    if (sourceIndex === -1) {
        return document;
    }

    const insertionIndex = targetIndex > sourceIndex
        ? targetIndex - 1
        : targetIndex;
    const [block] = document.blocks.splice(sourceIndex, 1);
    const boundedTargetIndex = Math.max(
        0,
        Math.min(insertionIndex, document.blocks.length),
    );
    document.blocks.splice(boundedTargetIndex, 0, block);

    return document;
}

export function resolveCanvasDropIndex(target, blockCount) {
    return target?.data?.kind === 'canvas-slot'
        ? target.data.index
        : blockCount;
}

export function isCanvasBackgroundDropActive(source, target) {
    return Boolean(
        source && target?.data?.kind === 'canvas-background',
    );
}
