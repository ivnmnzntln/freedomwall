const fs = require('fs/promises');
const path = require('path');

const STORE_PATH = path.join('/tmp', 'speakup-store.json');

let cachedStore = null;

async function loadFromDisk() {
    try {
        const raw = await fs.readFile(STORE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        return { posts: [] };
    }
}

async function saveToDisk(store) {
    try {
        await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
    } catch (error) {
        // Ignore disk errors in serverless environments.
    }
}

async function getStore() {
    if (cachedStore) {
        return cachedStore;
    }
    cachedStore = await loadFromDisk();
    return cachedStore;
}

async function updateStore(updater) {
    const store = await getStore();
    await updater(store);
    await saveToDisk(store);
    return store;
}

module.exports = {
    getStore,
    updateStore
};
