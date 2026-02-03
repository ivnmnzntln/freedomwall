const fs = require('fs/promises');
const path = require('path');
const { getStore: getBlobStore } = require('@netlify/blobs');

const STORE_NAME = 'speakup-store';
const POSTS_KEY = 'posts';
const STORE_PATH = path.join('/tmp', 'speakup-store.json');

let blobStoreCache = null;
let blobAvailable = null;
let memoryStore = { posts: [] };

async function getBlobClientSafe() {
    if (blobAvailable === false) {
        return null;
    }

    try {
        if (!blobStoreCache) {
            blobStoreCache = getBlobStore(STORE_NAME);
        }
        blobAvailable = true;
        return blobStoreCache;
    } catch (error) {
        blobAvailable = false;
        return null;
    }
}

async function loadFileStore() {
    try {
        const raw = await fs.readFile(STORE_PATH, 'utf-8');
        memoryStore = JSON.parse(raw);
    } catch (error) {
        // Keep memory store as fallback.
    }
    return memoryStore;
}

async function saveFileStore(store) {
    memoryStore = store;
    try {
        await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
    } catch (error) {
        // Ignore write errors in serverless environments.
    }
}

async function getStore() {
    const blobStore = await getBlobClientSafe();
    if (blobStore) {
        try {
            const posts = await blobStore.get(POSTS_KEY, { type: 'json' });
            return { posts: posts || [] };
        } catch (error) {
            // Fall back to file store.
        }
    }

    return loadFileStore();
}

async function updateStore(updater) {
    const store = await getStore();
    await updater(store);

    const blobStore = await getBlobClientSafe();
    if (blobStore) {
        try {
            await blobStore.set(POSTS_KEY, store.posts || []);
            return store;
        } catch (error) {
            // Fall back to file store.
        }
    }

    await saveFileStore(store);
    return store;
}

module.exports = {
    getStore,
    updateStore
};
