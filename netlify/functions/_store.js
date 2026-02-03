const { getStore: getBlobStore } = require('@netlify/blobs');

const STORE_NAME = 'speakup-store';
const POSTS_KEY = 'posts';

let cachedStore = null;

async function getBlobClient() {
    if (!cachedStore) {
        cachedStore = getBlobStore(STORE_NAME);
    }
    return cachedStore;
}

async function getStore() {
    const store = await getBlobClient();
    const posts = await store.get(POSTS_KEY, { type: 'json' });
    return { posts: posts || [] };
}

async function updateStore(updater) {
    const store = await getStore();
    await updater(store);
    const blobStore = await getBlobClient();
    await blobStore.set(POSTS_KEY, store.posts || []);
    return store;
}

module.exports = {
    getStore,
    updateStore
};
