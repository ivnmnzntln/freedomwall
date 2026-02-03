const fs = require('fs/promises');
const path = require('path');
let getBlobStoreModule = null;

const STORE_NAME = 'speakup-store';
const POSTS_KEY = 'posts';
const STORE_PATH = path.join('/tmp', 'speakup-store.json');
const allowFallback = process.env.NETLIFY_LOCAL === 'true' || !process.env.NETLIFY;

let blobStoreCache = null;
let memoryStore = { posts: [] };

async function getBlobClient() {
    if (!getBlobStoreModule) {
        const mod = await import('@netlify/blobs');
        getBlobStoreModule = mod.getStore;
    }
    if (!blobStoreCache) {
        blobStoreCache = getBlobStoreModule(STORE_NAME);
    }
    return blobStoreCache;
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
    try {
        const blobStore = await getBlobClient();
        const posts = await blobStore.get(POSTS_KEY, { type: 'json' });
        return { posts: posts || [] };
    } catch (error) {
        if (allowFallback) {
            return loadFileStore();
        }
        throw error;
    }
}

async function updateStore(updater) {
    const store = await getStore();
    await updater(store);

    try {
        const blobStore = await getBlobClient();
        await blobStore.set(POSTS_KEY, store.posts || []);
        return store;
    } catch (error) {
        if (allowFallback) {
            await saveFileStore(store);
            return store;
        }
        throw error;
    }
}

module.exports = {
    getStore,
    updateStore
};
