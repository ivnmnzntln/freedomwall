const crypto = require('crypto');
const { getStore, updateStore } = require('./_store');

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store',
            'CDN-Cache-Control': 'no-store'
        },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return buildResponse(200, { ok: true });
    }

    if (event.httpMethod === 'GET') {
        const store = await getStore();
        return buildResponse(200, { posts: store.posts || [] });
    }

    if (event.httpMethod === 'POST') {
        let payload = {};
        try {
            payload = JSON.parse(event.body || '{}');
        } catch (error) {
            return buildResponse(400, { error: 'Invalid JSON.' });
        }

        const { category, triggerWarning, message, author } = payload;
        if (!category || !message) {
            return buildResponse(400, { error: 'Category and message are required.' });
        }

        const post = {
            id: crypto.randomUUID(),
            category,
            triggerWarning: triggerWarning || '',
            message,
            author: author || 'Anonymous',
            timestamp: new Date().toISOString(),
            supports: 0
        };

        try {
            await updateStore((store) => {
                store.posts = store.posts || [];
                store.posts.push(post);
            });
        } catch (error) {
            return buildResponse(500, { error: 'Storage update failed.' });
        }

        return buildResponse(201, { post });
    }

    return buildResponse(405, { error: 'Method not allowed.' });
};
